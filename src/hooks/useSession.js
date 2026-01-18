/**
 * useSession.js - Session management hook
 *
 * Manages player session without wallet connection.
 * Session ID stored in localStorage for persistence.
 */

import { useState, useEffect, useCallback } from 'react';

const SESSION_KEY = 'anubis_session_id';
const NICKNAME_KEY = 'anubis_nickname';

export function useSession() {
  const [sessionId, setSessionId] = useState(null);
  const [nickname, setNickname] = useState('');
  const [chips, setChips] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem(SESSION_KEY);
    const storedNickname = localStorage.getItem(NICKNAME_KEY) || '';

    if (storedSession) {
      setSessionId(storedSession);
    }
    setNickname(storedNickname);
    setIsInitialized(true);
  }, []);

  // Save session ID
  const saveSessionId = useCallback((id) => {
    setSessionId(id);
    localStorage.setItem(SESSION_KEY, id);
  }, []);

  // Update nickname
  const updateNickname = useCallback((newNickname) => {
    const sanitized = newNickname.slice(0, 20).replace(/[^a-zA-Z0-9_]/g, '');
    setNickname(sanitized);
    localStorage.setItem(NICKNAME_KEY, sanitized);
    return sanitized;
  }, []);

  // Update chips
  const updateChips = useCallback((newChips) => {
    setChips(newChips);
  }, []);

  // Clear session (for testing)
  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(NICKNAME_KEY);
    setSessionId(null);
    setNickname('');
    setChips(0);
  }, []);

  // Convert chips to ETH display
  const chipsToEth = useCallback((chipAmount) => {
    const CHIPS_PER_ETH = 100000;
    return (chipAmount / CHIPS_PER_ETH).toFixed(6);
  }, []);

  return {
    sessionId,
    nickname,
    chips,
    isInitialized,
    saveSessionId,
    updateNickname,
    updateChips,
    clearSession,
    chipsToEth
  };
}
