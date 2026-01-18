/**
 * Lobby.jsx - Table selection
 */

import React, { useEffect, useState } from 'react';
import { formatChips } from '../utils/helpers';

export function Lobby({ session, socket }) {
  const [selectedTable, setSelectedTable] = useState(null);
  const [buyInAmount, setBuyInAmount] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);

  const { tables, fetchTables, joinTable } = socket;
  const { chips } = session;

  // Fetch tables on mount and periodically
  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 5000);
    return () => clearInterval(interval);
  }, [fetchTables]);

  const handleJoin = () => {
    if (!selectedTable || !buyInAmount) return;

    const amount = parseInt(buyInAmount);
    if (isNaN(amount) || amount < selectedTable.minBuyIn || amount > selectedTable.maxBuyIn) {
      setError(`Buy-in must be between ${selectedTable.minBuyIn} and ${selectedTable.maxBuyIn} chips`);
      return;
    }

    if (amount > chips) {
      setError('Insufficient chips. Deposit more ETH in the Cashier.');
      return;
    }

    setIsJoining(true);
    setError(null);
    joinTable(selectedTable.id, amount);

    // Reset after short delay
    setTimeout(() => setIsJoining(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="font-egyptian text-3xl text-gold mb-2">Choose Your Table</h2>
        <p className="text-papyrus/60">Select a table and buy in to start playing</p>
      </div>

      {/* Your Chips */}
      <div className="mb-6 p-4 card-egyptian text-center">
        <span className="text-papyrus/60">Your Chips: </span>
        <span className="text-gold text-xl font-bold">{formatChips(chips)}</span>
        {chips === 0 && (
          <p className="text-papyrus/50 text-sm mt-1">
            Visit the Cashier to deposit ETH and get chips
          </p>
        )}
      </div>

      {/* Tables Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {tables.map((table) => (
          <div
            key={table.id}
            onClick={() => {
              setSelectedTable(table);
              setBuyInAmount(table.minBuyIn.toString());
              setError(null);
            }}
            className={`card-egyptian p-6 cursor-pointer transition-all duration-300 ${
              selectedTable?.id === table.id
                ? 'border-gold shadow-gold ring-1 ring-gold/30'
                : 'hover:border-gold/40'
            }`}
          >
            <h3 className="font-egyptian text-xl text-gold mb-4">{table.name}</h3>

            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gold/10">
              <span className="text-papyrus/50">Blinds</span>
              <span className="text-papyrus font-medium">
                {formatChips(table.smallBlind)}/{formatChips(table.bigBlind)}
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-papyrus/50">Buy-in</span>
              <span className="text-papyrus">
                {formatChips(table.minBuyIn)} - {formatChips(table.maxBuyIn)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-papyrus/50">Players</span>
              <div className="flex items-center space-x-2">
                <span className={`font-medium ${
                  table.players >= table.maxPlayers ? 'text-red-400' :
                  table.players > 0 ? 'text-green-400' : 'text-papyrus/50'
                }`}>
                  {table.players}/{table.maxPlayers}
                </span>
                <div className="flex space-x-1">
                  {Array.from({ length: table.maxPlayers }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < table.players ? 'bg-green-400' : 'bg-papyrus/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {table.players >= table.maxPlayers && (
              <div className="mt-4 text-center text-red-400 text-sm">Table Full</div>
            )}
          </div>
        ))}
      </div>

      {/* Join Panel */}
      {selectedTable && selectedTable.players < selectedTable.maxPlayers && chips > 0 && (
        <div className="card-egyptian p-6 max-w-md mx-auto">
          <h3 className="font-egyptian text-xl text-gold mb-4 text-center">
            Join {selectedTable.name}
          </h3>

          <div className="mb-4">
            <label className="block text-papyrus/70 text-sm mb-2">Buy-in (Chips)</label>
            <input
              type="number"
              value={buyInAmount}
              onChange={(e) => setBuyInAmount(e.target.value)}
              min={selectedTable.minBuyIn}
              max={Math.min(selectedTable.maxBuyIn, chips)}
              className="input-gold"
              placeholder={`${selectedTable.minBuyIn} - ${selectedTable.maxBuyIn}`}
            />
            <div className="flex justify-between mt-2 text-xs text-papyrus/50">
              <button
                onClick={() => setBuyInAmount(selectedTable.minBuyIn.toString())}
                className="hover:text-gold"
              >
                Min: {formatChips(selectedTable.minBuyIn)}
              </button>
              <button
                onClick={() => setBuyInAmount(Math.min(selectedTable.maxBuyIn, chips).toString())}
                className="hover:text-gold"
              >
                Max: {formatChips(Math.min(selectedTable.maxBuyIn, chips))}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={isJoining || !buyInAmount}
            className="btn-gold w-full"
          >
            {isJoining ? 'Joining...' : 'Take a Seat'}
          </button>
        </div>
      )}

      {/* Empty State */}
      {tables.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gold/30 text-6xl mb-4">🎰</div>
          <p className="text-papyrus/50">Loading tables...</p>
        </div>
      )}
    </div>
  );
}
