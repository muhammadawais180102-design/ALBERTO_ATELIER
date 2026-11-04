/* Alberto Atelier — LOCAL-ONLY demonstration accounts.
 * This is a browser-only coursework demo, not production authentication.
 * Account records contain a salt and a PBKDF2 verifier, NEVER a plaintext password.
 * Browser storage can be changed by the browser user; do not enter real passwords.
 */
(() => {
  'use strict';
  const ACCOUNT_KEY = 'alberto_atelier_demo_accounts_v2';
  const SESSION_KEY = 'alberto_atelier_demo_session_v2';
  const ITERATIONS = 125000;

  const normEmail = value => String(value || '').trim().toLowerCase();
  const bytesToBase64 = bytes => btoa(String.fromCharCode(...bytes));
  const base64ToBytes = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));

  function loadAccounts() {
    const value = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  }
  function getSession() {
    try {
      const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      if (!session || !session.email || !session.name) return null;
      return session;
    } catch (_) { return null; }
  }
  function setSession(account) {
    const session = { name: account.name, email: account.email, signedIn: Date.now() };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }
  function signOut() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (_) { /* no session */ }
  }
  async function passwordVerifier(password, salt, iterations) {
    if (!window.crypto || !crypto.subtle || !crypto.getRandomValues) {
      throw new Error('This demo needs a secure browser context. Open the site through VS Code Live Server on localhost.');
    }
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256);
    return bytesToBase64(new Uint8Array(bits));
  }
  async function register(nameInput, emailInput, password) {
    const name = String(nameInput || '').trim().replace(/\s+/g, ' ');
    const email = normEmail(emailInput);
    if (name.length < 2 || name.length > 80) throw new Error('Enter your full name (2–80 characters).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
    if (String(password).length < 8) throw new Error('Password must contain at least 8 characters.');
    const accounts = loadAccounts();
    if (accounts.some(a => a.email === email)) throw new Error('A demo account with this email already exists. Please sign in.');
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const verifier = await passwordVerifier(password, salt, ITERATIONS);
    const account = { name, email, salt: bytesToBase64(salt), verifier, iterations: ITERATIONS };
    accounts.push(account);
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
    return setSession(account);
  }
  async function signIn(emailInput, password) {
    const email = normEmail(emailInput);
    const account = loadAccounts().find(a => a.email === email);
    if (!account || !account.salt || !account.verifier || !account.iterations) {
      throw new Error('Email or password is incorrect for this browser demo.');
    }
    const result = await passwordVerifier(password, base64ToBytes(account.salt), account.iterations);
    if (result !== account.verifier) throw new Error('Email or password is incorrect for this browser demo.');
    return setSession(account);
  }
  window.AlbertoDemoAccount = Object.freeze({ register, signIn, signOut, getSession });
})();
