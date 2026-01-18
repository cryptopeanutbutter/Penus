/**
 * App.jsx - Main Application Component
 *
 * Anubis Poker - Deposit-based Texas Hold'em
 * No wallet connection required - session-based identity
 *
 * TESTNET ONLY - Sepolia Network
 */

import React, { useState, useEffect } from 'react';
import { useSession } from './hooks/useSession';
import { useSocket } from './hooks/useSocket';
import { Header } from './components/Header';
import { Lobby } from './components/Lobby';
import { Cashier } from './components/Cashier';
import { PokerTable } from './components/PokerTable';

function App() {
  const [currentView, setCurrentView] = useState('lobby');

  // Session management (no wallet required)
  const session = useSession();

  // Socket connection
  const socket = useSocket(session);

  // Determine if we're at a table
  const isAtTable = socket.currentTable !== null;

  // Switch to table view when joining
  useEffect(() => {
    if (isAtTable) {
      socket.getTableState(socket.currentTable);
    }
  }, [isAtTable, socket.currentTable]);

  // Render content based on state
  const renderContent = () => {
    // Loading state
    if (!session.isInitialized || !socket.isReady) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-gold text-6xl mb-6">🐺</div>
            <h1 className="font-egyptian text-3xl text-gold mb-4">ANUBIS POKER</h1>
            <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-papyrus/50">Connecting to server...</p>
          </div>
        </div>
      );
    }

    // At poker table
    if (isAtTable && socket.gameState) {
      return <PokerTable session={session} socket={socket} />;
    }

    // Main views
    switch (currentView) {
      case 'cashier':
        return <Cashier session={session} socket={socket} />;
      case 'lobby':
      default:
        return <Lobby session={session} socket={socket} />;
    }
  };

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5L35 15H25L30 5zM30 55L25 45H35L30 55zM5 30L15 25V35L5 30zM55 30L45 35V25L55 30z' fill='%23d4af37' fill-opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Header */}
      <Header
        session={session}
        socket={socket}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main Content */}
      <main className="relative py-8 px-4">
        {renderContent()}
      </main>

      {/* Error Toast */}
      {socket.error && (
        <div className="fixed bottom-4 right-4 max-w-sm p-4 bg-red-900/90 border border-red-500/50 rounded-lg shadow-lg z-50">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-red-400 font-medium">Error</p>
              <p className="text-red-300 text-sm">{socket.error}</p>
            </div>
            <button
              onClick={socket.clearError}
              className="text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Connection Lost Overlay */}
      {session.isInitialized && !socket.isConnected && (
        <div className="fixed inset-0 bg-obsidian/90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gold font-medium">Connection Lost</p>
            <p className="text-papyrus/50 text-sm mt-1">Reconnecting...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
