/**
 * useSocket.js - Socket.io connection hook
 *
 * Manages real-time connection to game server.
 * No wallet connection required - uses session ID only.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

export function useSocket(session) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [tables, setTables] = useState([]);
  const [currentTable, setCurrentTable] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

  const socketRef = useRef(null);
  const { sessionId, nickname, saveSessionId, updateNickname, updateChips } = session;

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('[Socket] Connected');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
      setIsReady(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err);
      setError('Connection failed. Is the server running?');
    });

    // Session events
    newSocket.on('session:ready', (data) => {
      console.log('[Socket] Session ready:', data.sessionId);
      saveSessionId(data.sessionId);
      if (data.nickname) {
        updateNickname(data.nickname);
      }
      updateChips(data.chips);
      setCurrentTable(data.tableId);
      setIsReady(true);
    });

    newSocket.on('session:nicknameUpdated', ({ nickname }) => {
      updateNickname(nickname);
    });

    newSocket.on('session:balance', ({ chips }) => {
      updateChips(chips);
    });

    // Table events
    newSocket.on('tables:list', (tablesList) => {
      setTables(tablesList);
    });

    newSocket.on('table:joined', ({ tableId, seatIndex, player }) => {
      console.log('[Socket] Joined table:', tableId);
      setCurrentTable(tableId);
    });

    newSocket.on('table:left', ({ tableId, chipsReturned, newBalance }) => {
      console.log('[Socket] Left table, chips returned:', chipsReturned);
      setCurrentTable(null);
      setGameState(null);
      updateChips(newBalance);
    });

    newSocket.on('table:error', ({ error }) => {
      console.error('[Socket] Table error:', error);
      setError(error);
    });

    // Game events
    newSocket.on('game:state', (state) => {
      setGameState(state);
    });

    newSocket.on('game:publicState', (state) => {
      // For spectators - update if not personalized
      if (!gameState?.validActions) {
        setGameState(state);
      }
    });

    newSocket.on('game:handStarted', ({ handNumber }) => {
      console.log('[Socket] Hand started:', handNumber);
    });

    newSocket.on('game:handEnded', ({ phase }) => {
      console.log('[Socket] Hand ended:', phase);
    });

    newSocket.on('game:error', ({ error }) => {
      console.error('[Socket] Game error:', error);
      setError(error);
    });

    // Deposit events
    newSocket.on('deposit:confirmed', (data) => {
      console.log('[Socket] Deposit confirmed:', data);
      updateChips(data.newBalance);
    });

    // Cashout events
    newSocket.on('cashout:completed', (data) => {
      console.log('[Socket] Cashout completed:', data);
      updateChips(data.remainingChips);
    });

    return () => {
      newSocket.close();
    };
  }, [saveSessionId, updateNickname, updateChips]);

  // Initialize session when connected
  useEffect(() => {
    if (isConnected && socketRef.current && session.isInitialized) {
      socketRef.current.emit('session:init', {
        sessionId: sessionId,
        nickname: nickname
      });
    }
  }, [isConnected, sessionId, nickname, session.isInitialized]);

  // Fetch tables
  const fetchTables = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('tables:list');
    }
  }, [isConnected]);

  // Set nickname
  const setNickname = useCallback((newNickname) => {
    if (socketRef.current && isReady) {
      socketRef.current.emit('session:setNickname', { nickname: newNickname });
    }
  }, [isReady]);

  // Join table
  const joinTable = useCallback((tableId, buyIn) => {
    if (socketRef.current && isReady) {
      socketRef.current.emit('table:join', { tableId, buyIn });
    }
  }, [isReady]);

  // Leave table
  const leaveTable = useCallback(() => {
    if (socketRef.current && currentTable) {
      socketRef.current.emit('table:leave');
    }
  }, [currentTable]);

  // Get table state
  const getTableState = useCallback((tableId) => {
    if (socketRef.current) {
      socketRef.current.emit('table:getState', { tableId });
    }
  }, []);

  // Game actions
  const sendAction = useCallback((action, amount = 0) => {
    if (socketRef.current && isReady) {
      socketRef.current.emit('game:action', { action, amount });
    }
  }, [isReady]);

  const fold = useCallback(() => sendAction('fold'), [sendAction]);
  const check = useCallback(() => sendAction('check'), [sendAction]);
  const call = useCallback(() => sendAction('call'), [sendAction]);
  const bet = useCallback((amount) => sendAction('bet', amount), [sendAction]);
  const raise = useCallback((amount) => sendAction('raise', amount), [sendAction]);
  const allIn = useCallback(() => sendAction('all_in'), [sendAction]);

  // Get balance
  const refreshBalance = useCallback(() => {
    if (socketRef.current && isReady) {
      socketRef.current.emit('session:getBalance');
    }
  }, [isReady]);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  return {
    socket,
    isConnected,
    isReady,
    tables,
    currentTable,
    gameState,
    error,
    fetchTables,
    setNickname,
    joinTable,
    leaveTable,
    getTableState,
    fold,
    check,
    call,
    bet,
    raise,
    allIn,
    refreshBalance,
    clearError
  };
}
