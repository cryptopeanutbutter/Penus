/**
 * PokerTable.jsx - Main poker game UI
 */

import React, { useState } from 'react';
import { formatChips, getPhaseDisplay, SUIT_SYMBOLS } from '../utils/helpers';

// Card Component
function Card({ card, faceDown = false, className = '' }) {
  if (faceDown || !card) {
    return (
      <div className={`playing-card face-down ${className}`}>
        <div className="w-full h-full rounded-lg bg-gradient-to-br from-gold-700 via-gold-600 to-gold-800 border-2 border-gold-500/50" />
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  return (
    <div className={`playing-card bg-white ${className}`}>
      <div className={`flex flex-col items-center ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
        <span className="text-sm font-bold leading-none">{card.rank}</span>
        <span className="text-lg leading-none">{SUIT_SYMBOLS[card.suit]}</span>
      </div>
    </div>
  );
}

// Player Seat Component
function PlayerSeat({ player, position, isDealer, isSB, isBB, isCurrentTurn, isHero }) {
  if (!player) {
    return (
      <div className={`absolute ${position}`}>
        <div className="w-24 h-20 md:w-28 md:h-24 rounded-xl border-2 border-dashed border-gold/20
                        flex items-center justify-center text-papyrus/30 bg-obsidian/50">
          Empty
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute ${position}`}>
      <div className={`relative transition-all duration-300 ${isCurrentTurn ? 'scale-105' : ''}`}>
        {/* Turn Indicator */}
        {isCurrentTurn && (
          <div className="absolute -inset-2 rounded-xl bg-gold/20 animate-pulse" />
        )}

        {/* Player Card */}
        <div className={`relative bg-obsidian-100 rounded-xl p-3 border-2 transition-all ${
          isCurrentTurn ? 'border-gold shadow-gold' :
          player.status === 'folded' ? 'border-red-900/50 opacity-50' :
          isHero ? 'border-gold/50' : 'border-gold/20'
        }`}>
          {/* Position Badge */}
          {(isDealer || isSB || isBB) && (
            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isDealer ? 'bg-white text-obsidian' :
              isSB ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-obsidian'
            }`}>
              {isDealer ? 'D' : isSB ? 'SB' : 'BB'}
            </div>
          )}

          {/* Name */}
          <div className="text-center mb-1">
            <p className={`font-medium truncate max-w-20 text-sm ${isHero ? 'text-gold' : 'text-papyrus'}`}>
              {player.nickname}
            </p>
          </div>

          {/* Chips */}
          <div className="text-center">
            <span className={`text-sm font-medium ${
              player.status === 'all_in' ? 'text-red-400' : 'text-green-400'
            }`}>
              {formatChips(player.chips)}
            </span>
          </div>

          {/* Status */}
          {player.status !== 'active' && (
            <div className={`mt-1 text-center text-xs ${
              player.status === 'folded' ? 'text-red-400' :
              player.status === 'all_in' ? 'text-yellow-400' : 'text-papyrus/50'
            }`}>
              {player.status === 'folded' ? 'Folded' :
               player.status === 'all_in' ? 'ALL IN' : player.status}
            </div>
          )}

          {/* Hole Cards */}
          {player.holeCards && player.holeCards.length > 0 && (
            <div className="flex justify-center space-x-1 mt-2">
              {player.holeCards.map((card, i) => (
                <Card key={i} card={card} className="w-8 h-11 text-xs" />
              ))}
            </div>
          )}

          {/* Face Down Cards */}
          {player.hasCards && !player.holeCards && (
            <div className="flex justify-center space-x-1 mt-2">
              <Card faceDown className="w-8 h-11" />
              <Card faceDown className="w-8 h-11" />
            </div>
          )}

          {/* Current Bet */}
          {player.currentBet > 0 && (
            <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2">
              <div className="bg-gold/90 text-obsidian px-2 py-0.5 rounded text-xs font-bold">
                {formatChips(player.currentBet)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Action Buttons Component
function ActionButtons({ validActions, onAction, disabled }) {
  const [betAmount, setBetAmount] = useState('');
  const [showBetInput, setShowBetInput] = useState(false);

  const betAction = validActions.find(a => a.action === 'bet');
  const raiseAction = validActions.find(a => a.action === 'raise');
  const callAction = validActions.find(a => a.action === 'call');

  const handleBetRaise = () => {
    const amount = parseInt(betAmount);
    if (isNaN(amount)) return;

    if (betAction) {
      onAction('bet', amount);
    } else if (raiseAction) {
      onAction('raise', amount);
    }
    setShowBetInput(false);
    setBetAmount('');
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-obsidian-100/80 rounded-xl border border-gold/20">
      {/* Fold */}
      {validActions.some(a => a.action === 'fold') && (
        <button
          onClick={() => onAction('fold')}
          disabled={disabled}
          className="btn-danger px-6"
        >
          Fold
        </button>
      )}

      {/* Check */}
      {validActions.some(a => a.action === 'check') && (
        <button
          onClick={() => onAction('check')}
          disabled={disabled}
          className="btn-secondary px-6"
        >
          Check
        </button>
      )}

      {/* Call */}
      {callAction && (
        <button
          onClick={() => onAction('call')}
          disabled={disabled}
          className="btn-gold px-6"
        >
          Call {formatChips(callAction.amount)}
        </button>
      )}

      {/* Bet/Raise */}
      {(betAction || raiseAction) && (
        <div className="flex items-center space-x-2">
          {showBetInput ? (
            <>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min={betAction?.min || raiseAction?.min}
                max={betAction?.max || raiseAction?.max}
                className="w-24 px-3 py-2 bg-obsidian-200 border border-gold/30 rounded text-papyrus text-sm"
                placeholder={betAction ? 'Bet' : 'Raise to'}
                autoFocus
              />
              <button
                onClick={handleBetRaise}
                disabled={disabled || !betAmount}
                className="btn-gold px-4"
              >
                OK
              </button>
              <button
                onClick={() => setShowBetInput(false)}
                className="text-papyrus/50 hover:text-papyrus px-2"
              >
                ✕
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setShowBetInput(true);
                setBetAmount((betAction?.min || raiseAction?.min || '').toString());
              }}
              disabled={disabled}
              className="btn-secondary px-6"
            >
              {betAction ? 'Bet' : 'Raise'}
            </button>
          )}
        </div>
      )}

      {/* All-In */}
      {validActions.some(a => a.action === 'all_in') && (
        <button
          onClick={() => onAction('all_in')}
          disabled={disabled}
          className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-lg font-semibold
                     hover:from-red-500 hover:to-red-400 transition-all"
        >
          All In
        </button>
      )}
    </div>
  );
}

// Main PokerTable Component
export function PokerTable({ session, socket }) {
  const { gameState, leaveTable, fold, check, call, bet, raise, allIn } = socket;
  const { sessionId } = session;

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-papyrus/50">Loading table...</p>
        </div>
      </div>
    );
  }

  const {
    tableId,
    phase,
    pot,
    communityCards,
    dealerSeat,
    sbSeat,
    bbSeat,
    currentSeat,
    seats,
    validActions,
    config
  } = gameState;

  // Find hero seat
  const heroSeatIndex = seats.findIndex(s => s?.sessionId === sessionId);
  const isHeroTurn = heroSeatIndex !== -1 && currentSeat === heroSeatIndex;

  // Seat positions for 6-max table
  const seatPositions = [
    'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-1/4 left-4',
    'top-1/4 left-4',
    'top-4 left-1/2 -translate-x-1/2',
    'top-1/4 right-4',
    'bottom-1/4 right-4'
  ];

  // Reorder so hero is at bottom
  const getDisplayPosition = (seatIndex) => {
    if (heroSeatIndex === -1) return seatIndex;
    return (seatIndex - heroSeatIndex + 6) % 6;
  };

  const handleAction = (action, amount) => {
    if (action === 'fold') fold();
    else if (action === 'check') check();
    else if (action === 'call') call();
    else if (action === 'bet') bet(amount);
    else if (action === 'raise') raise(amount);
    else if (action === 'all_in') allIn();
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-egyptian text-xl text-gold">{tableId}</h2>
          <p className="text-papyrus/50 text-sm">
            Blinds: {formatChips(config.smallBlind)}/{formatChips(config.bigBlind)}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-papyrus/50 text-sm">Phase</p>
            <p className="text-gold font-medium">{getPhaseDisplay(phase)}</p>
          </div>
          <button onClick={leaveTable} className="btn-danger px-4 py-2 text-sm">
            Leave Table
          </button>
        </div>
      </div>

      {/* Poker Table */}
      <div className="relative w-full aspect-[16/10] mb-6">
        <div className="absolute inset-0 table-felt rounded-[100px] shadow-2xl">
          <div className="absolute inset-4 border-2 border-gold-700/40 rounded-[80px]" />

          {/* Center - Pot & Community Cards */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="mb-4">
              <p className="text-papyrus/60 text-sm">Pot</p>
              <p className="text-gold text-2xl font-bold">{formatChips(pot)}</p>
            </div>

            <div className="flex justify-center space-x-2">
              {communityCards && communityCards.length > 0 ? (
                communityCards.map((card, i) => (
                  <Card key={i} card={card} className="animate-deal" />
                ))
              ) : (
                <div className="flex space-x-2 opacity-20">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className="w-12 h-16 md:w-14 md:h-20 rounded-lg border-2 border-dashed border-gold/30" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Player Seats */}
          {seats.map((player, idx) => {
            const displayPos = getDisplayPosition(idx);
            return (
              <PlayerSeat
                key={idx}
                player={player}
                position={seatPositions[displayPos]}
                isDealer={idx === dealerSeat}
                isSB={idx === sbSeat}
                isBB={idx === bbSeat}
                isCurrentTurn={idx === currentSeat}
                isHero={idx === heroSeatIndex}
              />
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      {isHeroTurn && validActions && validActions.length > 0 && (
        <ActionButtons
          validActions={validActions}
          onAction={handleAction}
          disabled={false}
        />
      )}

      {/* Status Messages */}
      {phase === 'waiting' && (
        <div className="text-center p-4 card-egyptian">
          <p className="text-papyrus/70">Waiting for more players...</p>
          <p className="text-papyrus/50 text-sm mt-1">
            {seats.filter(s => s !== null).length}/2 players minimum
          </p>
        </div>
      )}

      {!isHeroTurn && phase !== 'waiting' && phase !== 'ended' && phase !== 'showdown' && (
        <div className="text-center p-4 card-egyptian">
          <p className="text-papyrus/70">
            Waiting for {seats[currentSeat]?.nickname || 'opponent'}...
          </p>
        </div>
      )}

      {(phase === 'ended' || phase === 'showdown') && (
        <div className="text-center p-4 card-egyptian">
          <p className="text-gold font-medium">Hand Complete</p>
          <p className="text-papyrus/50 text-sm mt-1">Next hand starting soon...</p>
        </div>
      )}
    </div>
  );
}
