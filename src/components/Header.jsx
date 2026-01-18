/**
 * Header.jsx - Navigation header with session info
 */

import React from 'react';
import { formatChips, shortenId, chipsToEth, formatEth } from '../utils/helpers';

export function Header({ session, socket, currentView, onViewChange }) {
  const { sessionId, nickname, chips, updateNickname } = session;
  const { isConnected, isReady, currentTable } = socket;

  return (
    <header className="bg-obsidian-100/90 backdrop-blur-sm border-b border-gold/20 sticky top-0 z-50">
      {/* Testnet Badge */}
      <div className="bg-yellow-900/80 text-yellow-200 text-center py-1 text-xs font-medium">
        ⚠️ TESTNET MODE — Sepolia ETH Only — Not Real Money
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="text-gold text-3xl">🐺</div>
            <div>
              <h1 className="font-egyptian text-2xl text-gold font-bold tracking-wider">
                ANUBIS POKER
              </h1>
              <p className="text-xs text-papyrus/50">Sepolia Testnet</p>
            </div>
          </div>

          {/* Navigation */}
          {isReady && !currentTable && (
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => onViewChange('lobby')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'lobby'
                    ? 'bg-gold/20 text-gold'
                    : 'text-papyrus/70 hover:text-gold hover:bg-gold/10'
                }`}
              >
                Lobby
              </button>
              <button
                onClick={() => onViewChange('cashier')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'cashier'
                    ? 'bg-gold/20 text-gold'
                    : 'text-papyrus/70 hover:text-gold hover:bg-gold/10'
                }`}
              >
                Cashier
              </button>
            </nav>
          )}

          {/* Session Info */}
          <div className="flex items-center space-x-4">
            {isReady && (
              <>
                {/* Chips Display */}
                <div className="hidden sm:flex flex-col items-end text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-papyrus/50">Chips:</span>
                    <span className="text-gold font-bold">{formatChips(chips)}</span>
                  </div>
                  <span className="text-papyrus/40 text-xs">
                    ≈ {formatEth(chipsToEth(chips))} ETH
                  </span>
                </div>

                {/* Nickname Input */}
                <div className="hidden lg:block">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      updateNickname(e.target.value);
                      socket.setNickname(e.target.value);
                    }}
                    placeholder="Nickname"
                    maxLength={15}
                    className="w-28 px-3 py-1.5 bg-obsidian-200 border border-gold/30 rounded
                             text-papyrus text-sm placeholder-papyrus/40
                             focus:outline-none focus:border-gold/60"
                  />
                </div>

                {/* Session ID */}
                <div className="px-3 py-1.5 bg-obsidian-200 border border-gold/30 rounded-lg">
                  <span className="text-gold text-xs font-mono">
                    {shortenId(sessionId)}
                  </span>
                </div>
              </>
            )}

            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span className="text-xs text-papyrus/50">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
