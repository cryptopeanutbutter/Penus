/**
 * Cashier.jsx - Deposit and withdrawal management
 *
 * Deposit Flow:
 * 1. User sees escrow wallet address
 * 2. User sends ETH from their wallet (MetaMask, etc.)
 * 3. User submits transaction hash
 * 4. Backend verifies and credits chips
 *
 * Withdrawal Flow:
 * 1. User enters ETH address and chip amount
 * 2. Backend sends ETH minus 3% fee
 */

import React, { useState, useEffect } from 'react';
import { formatChips, formatEth, chipsToEth, ethToChips, isValidEthAddress, copyToClipboard } from '../utils/helpers';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export function Cashier({ session, socket }) {
  const [activeTab, setActiveTab] = useState('deposit');
  const [escrowAddress, setEscrowAddress] = useState('');
  const [chipsPerEth, setChipsPerEth] = useState(100000);

  // Deposit state
  const [txHash, setTxHash] = useState('');
  const [depositStatus, setDepositStatus] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Withdrawal state
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawChips, setWithdrawChips] = useState('');
  const [withdrawPreview, setWithdrawPreview] = useState(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState(null);

  const [copied, setCopied] = useState(false);

  const { sessionId, chips } = session;

  // Fetch escrow address on mount
  useEffect(() => {
    fetch(`${API_URL}/api/escrow`)
      .then(res => res.json())
      .then(data => {
        setEscrowAddress(data.address);
        setChipsPerEth(data.chipsPerEth);
      })
      .catch(err => console.error('Failed to fetch escrow info:', err));
  }, []);

  // Fetch withdrawal preview when amount changes
  useEffect(() => {
    if (activeTab === 'withdraw' && withdrawChips && parseInt(withdrawChips) > 0) {
      fetch(`${API_URL}/api/cashout/preview?chips=${withdrawChips}`)
        .then(res => res.json())
        .then(data => setWithdrawPreview(data))
        .catch(() => setWithdrawPreview(null));
    } else {
      setWithdrawPreview(null);
    }
  }, [withdrawChips, activeTab]);

  // Handle copy address
  const handleCopy = async () => {
    const success = await copyToClipboard(escrowAddress);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Verify deposit
  const handleVerifyDeposit = async () => {
    if (!txHash || !sessionId) return;

    setIsVerifying(true);
    setDepositStatus(null);

    try {
      const response = await fetch(`${API_URL}/api/deposit/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, txHash })
      });

      const result = await response.json();

      if (result.success) {
        setDepositStatus({
          type: 'success',
          message: `Deposit confirmed! +${formatChips(result.chips)} chips`
        });
        setTxHash('');
        socket.refreshBalance();
      } else {
        setDepositStatus({
          type: 'error',
          message: result.error || 'Deposit verification failed'
        });
      }
    } catch (error) {
      setDepositStatus({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Process withdrawal
  const handleWithdraw = async () => {
    if (!withdrawAddress || !withdrawChips || !sessionId) return;

    if (!isValidEthAddress(withdrawAddress)) {
      setWithdrawStatus({ type: 'error', message: 'Invalid ETH address' });
      return;
    }

    const chipAmount = parseInt(withdrawChips);
    if (chipAmount > chips) {
      setWithdrawStatus({ type: 'error', message: 'Insufficient chips' });
      return;
    }

    setIsWithdrawing(true);
    setWithdrawStatus(null);

    try {
      const response = await fetch(`${API_URL}/api/cashout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          chips: chipAmount,
          toAddress: withdrawAddress
        })
      });

      const result = await response.json();

      if (result.success) {
        setWithdrawStatus({
          type: 'success',
          message: `Sent ${formatEth(result.netEth)} ETH to ${withdrawAddress.slice(0, 10)}...`,
          txHash: result.payoutTxHash
        });
        setWithdrawChips('');
        socket.refreshBalance();
      } else {
        setWithdrawStatus({
          type: 'error',
          message: result.error || 'Withdrawal failed'
        });
      }
    } catch (error) {
      setWithdrawStatus({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8 text-center">
        <h2 className="font-egyptian text-3xl text-gold mb-2">Cashier</h2>
        <p className="text-papyrus/60">Deposit ETH to get chips, or cash out</p>
      </div>

      {/* Balance */}
      <div className="card-egyptian p-4 mb-6 text-center">
        <p className="text-papyrus/50 text-sm mb-1">Your Balance</p>
        <p className="text-gold text-3xl font-bold">{formatChips(chips)} chips</p>
        <p className="text-papyrus/40 text-sm">≈ {formatEth(chipsToEth(chips))} ETH</p>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 bg-obsidian-200 rounded-lg p-1">
        <button
          onClick={() => {
            setActiveTab('deposit');
            setWithdrawStatus(null);
          }}
          className={`flex-1 py-3 rounded-md transition-all ${
            activeTab === 'deposit'
              ? 'bg-gold text-obsidian font-semibold'
              : 'text-papyrus/70 hover:text-gold'
          }`}
        >
          Deposit
        </button>
        <button
          onClick={() => {
            setActiveTab('withdraw');
            setDepositStatus(null);
          }}
          className={`flex-1 py-3 rounded-md transition-all ${
            activeTab === 'withdraw'
              ? 'bg-gold text-obsidian font-semibold'
              : 'text-papyrus/70 hover:text-gold'
          }`}
        >
          Withdraw
        </button>
      </div>

      {/* Deposit Tab */}
      {activeTab === 'deposit' && (
        <div className="card-egyptian p-6">
          <h3 className="text-gold font-medium mb-4">Step 1: Send ETH</h3>

          <div className="mb-4 p-4 bg-obsidian-200 rounded-lg">
            <p className="text-papyrus/50 text-sm mb-2">Send Sepolia ETH to this address:</p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 text-gold text-sm break-all font-mono">
                {escrowAddress || 'Loading...'}
              </code>
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-gold/20 text-gold rounded text-sm hover:bg-gold/30"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="mb-6 p-3 bg-obsidian-300 rounded-lg text-sm">
            <p className="text-papyrus/70">
              <span className="text-gold">Rate:</span> 1 ETH = {formatChips(chipsPerEth)} chips
            </p>
            <p className="text-papyrus/50 mt-1">
              Example: 0.01 ETH = {formatChips(chipsPerEth / 100)} chips
            </p>
          </div>

          <h3 className="text-gold font-medium mb-4">Step 2: Verify Transaction</h3>

          <div className="mb-4">
            <label className="block text-papyrus/70 text-sm mb-2">Transaction Hash</label>
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x..."
              className="input-gold font-mono text-sm"
            />
          </div>

          {depositStatus && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              depositStatus.type === 'success'
                ? 'bg-green-900/30 border border-green-500/30 text-green-400'
                : 'bg-red-900/30 border border-red-500/30 text-red-400'
            }`}>
              {depositStatus.message}
            </div>
          )}

          <button
            onClick={handleVerifyDeposit}
            disabled={isVerifying || !txHash}
            className="btn-gold w-full"
          >
            {isVerifying ? 'Verifying...' : 'Verify Deposit'}
          </button>

          <p className="mt-4 text-center text-papyrus/40 text-xs">
            Need testnet ETH?{' '}
            <a
              href="https://sepoliafaucet.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              Get from faucet
            </a>
          </p>
        </div>
      )}

      {/* Withdraw Tab */}
      {activeTab === 'withdraw' && (
        <div className="card-egyptian p-6">
          <div className="mb-4">
            <label className="block text-papyrus/70 text-sm mb-2">Your ETH Address</label>
            <input
              type="text"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              placeholder="0x..."
              className="input-gold font-mono text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-papyrus/70 text-sm mb-2">Chips to Withdraw</label>
            <input
              type="number"
              value={withdrawChips}
              onChange={(e) => setWithdrawChips(e.target.value)}
              min="1"
              max={chips}
              placeholder="0"
              className="input-gold"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() => setWithdrawChips(chips.toString())}
                className="text-xs text-papyrus/50 hover:text-gold"
              >
                Max: {formatChips(chips)}
              </button>
            </div>
          </div>

          {/* Fee Preview */}
          {withdrawPreview && (
            <div className="mb-4 p-4 bg-obsidian-200 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-papyrus/50">Chips:</span>
                <span className="text-papyrus">{formatChips(withdrawPreview.chips)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-papyrus/50">Gross ETH:</span>
                <span className="text-papyrus">{formatEth(withdrawPreview.grossEth)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-400/70">House Fee (3%):</span>
                <span className="text-red-400">-{formatEth(withdrawPreview.feeEth)}</span>
              </div>
              <div className="border-t border-gold/20 pt-2 flex justify-between">
                <span className="text-papyrus/70 font-medium">You Receive:</span>
                <span className="text-green-400 font-medium">{formatEth(withdrawPreview.netEth)} ETH</span>
              </div>
            </div>
          )}

          {withdrawStatus && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              withdrawStatus.type === 'success'
                ? 'bg-green-900/30 border border-green-500/30 text-green-400'
                : 'bg-red-900/30 border border-red-500/30 text-red-400'
            }`}>
              {withdrawStatus.message}
              {withdrawStatus.txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${withdrawStatus.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 text-gold hover:underline"
                >
                  View on Etherscan
                </a>
              )}
            </div>
          )}

          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing || !withdrawAddress || !withdrawChips || chips === 0}
            className="btn-secondary w-full"
          >
            {isWithdrawing ? 'Processing...' : 'Withdraw ETH'}
          </button>

          <div className="mt-4 p-3 bg-obsidian-300 rounded-lg">
            <p className="text-papyrus/50 text-xs text-center">
              3% house fee is deducted from all withdrawals
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
