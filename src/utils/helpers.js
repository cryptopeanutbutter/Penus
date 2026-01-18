/**
 * helpers.js - Utility functions
 */

// Suit symbols
export const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

// Suit colors
export const SUIT_COLORS = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-900',
  spades: 'text-gray-900'
};

// Format chips
export function formatChips(chips) {
  if (chips >= 1000000) {
    return (chips / 1000000).toFixed(1) + 'M';
  }
  if (chips >= 1000) {
    return (chips / 1000).toFixed(1) + 'K';
  }
  return chips.toString();
}

// Format ETH
export function formatEth(eth, decimals = 4) {
  if (eth === null || eth === undefined) return '0';
  const num = parseFloat(eth);
  if (isNaN(num)) return '0';
  return num.toFixed(decimals).replace(/\.?0+$/, '');
}

// Convert chips to ETH
export function chipsToEth(chips) {
  const CHIPS_PER_ETH = 100000;
  return chips / CHIPS_PER_ETH;
}

// Convert ETH to chips
export function ethToChips(eth) {
  const CHIPS_PER_ETH = 100000;
  return Math.floor(parseFloat(eth) * CHIPS_PER_ETH);
}

// Shorten session ID
export function shortenId(id, chars = 6) {
  if (!id) return '';
  return `${id.slice(0, chars)}...${id.slice(-4)}`;
}

// Get phase display name
export function getPhaseDisplay(phase) {
  const phases = {
    waiting: 'Waiting for Players',
    pre_flop: 'Pre-Flop',
    flop: 'Flop',
    turn: 'Turn',
    river: 'River',
    showdown: 'Showdown',
    ended: 'Hand Complete'
  };
  return phases[phase] || phase;
}

// Validate ETH address format
export function isValidEthAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Copy to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
