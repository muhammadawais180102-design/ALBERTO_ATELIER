/* Alberto Atelier account UI. Browser-local demonstration, no server account. */
(() => {
  'use strict';
  const api = window.AlbertoDemoAccount;
  const authContainer = document.getElementById('container');
  const registerBtn = document.querySelector('.register-btn');
  const loginBtn = document.querySelector('.login-btn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const profilePanel = document.getElementById('profilePanel');
  const loginMessage = document.getElementById('loginMessage');
  const registerMessage = document.getElementById('registerMessage');
  let switchTimer;

  function notify(target, text, success = false) {
    target.textContent = text;
    target.classList.toggle('aa-success-message', success);
  }
  function clearMessages() {
    for (const target of [loginMessage, registerMessage]) notify(target, '');
  }
  function switchAtelierForm(showRegister, button) {
    if (authContainer.classList.contains('is-switching')) return;
    authContainer.classList.add('is-switching');
    if (button) button.classList.add('vip-clicked');
    authContainer.classList.toggle('active', showRegister);
    clearMessages();
    clearTimeout(switchTimer);
    switchTimer = setTimeout(() => {
      authContainer.classList.remove('is-switching');
      if (button) button.classList.remove('vip-clicked');
    }, 1850);
  }
  registerBtn.addEventListener('click', () => switchAtelierForm(true, registerBtn));
  loginBtn.addEventListener('click', () => switchAtelierForm(false, loginBtn));

  document.querySelectorAll('[data-password]').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.password);
      if (!input) return;
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      button.innerHTML = visible ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
      button.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
    });
  });

  function showProfile() {
    const session = api.getSession();
    profilePanel.hidden = !session;
    if (session) {
      document.getElementById('profileGreeting').textContent = 'Welcome, ' + session.name;
      document.getElementById('profileEmail').textContent = session.email;
    }
  }
  document.getElementById('signOutBtn').addEventListener('click', () => {
    api.signOut();
    profilePanel.hidden = true;
    clearMessages();
    notify(loginMessage, 'You have signed out of your local demo account.', true);
    loginForm.reset();
    registerForm.reset();
    authContainer.classList.remove('active');
  });

  async function submitAccount(form, task, messageTarget, event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector('button[type="submit"]');
    if (button.disabled) return;
    button.disabled = true;
    const oldLabel = button.textContent;
    button.textContent = task === 'register' ? 'CREATING PROFILE…' : 'SIGNING IN…';
    clearMessages();
    try {
      let session;
      if (task === 'register') {
        session = await api.register(
          document.getElementById('registerName').value,
          document.getElementById('registerEmail').value,
          document.getElementById('registerPassword').value
        );
      } else {
        session = await api.signIn(
          document.getElementById('loginEmail').value,
          document.getElementById('loginPassword').value
        );
      }
      notify(messageTarget, 'Welcome, ' + session.name + '. Your local demo session is active.', true);
      form.reset();
      showProfile();
    } catch (error) {
      notify(messageTarget, error?.message || 'Unable to save the local account. Check browser storage.');
    } finally {
      button.disabled = false;
      button.textContent = oldLabel;
    }
  }
  loginForm.addEventListener('submit', e => submitAccount(loginForm, 'login', loginMessage, e));
  registerForm.addEventListener('submit', e => submitAccount(registerForm, 'register', registerMessage, e));

  document.getElementById('forgotLink').addEventListener('click', event => {
    event.preventDefault();
    notify(loginMessage, 'Password recovery is not available in this browser-only demo. Please use another demo email or ask your teacher about backend authentication.');
  });

  function openRequestedForm() {
    const registerByPage = location.pathname.toLowerCase().endsWith('/register.html');
    const hash = location.hash.toLowerCase();
    authContainer.classList.toggle('active', hash === '#register' || (registerByPage && hash !== '#login'));
  }
  window.addEventListener('hashchange', openRequestedForm);
  openRequestedForm();
  showProfile();

  // Original ambient particle effect preserved.
  const particles = document.getElementById('particles');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (particles && !reducedMotion) {
    const count = window.innerWidth < 650 ? 18 : 40;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'particle';
      particle.style.setProperty('--size', (Math.random() * 2.5 + 1).toFixed(1) + 'px');
      particle.style.setProperty('--left', (Math.random() * 100).toFixed(1) + '%');
      particle.style.setProperty('--duration', (Math.random() * 14 + 12).toFixed(1) + 's');
      particle.style.setProperty('--delay', (-Math.random() * 25).toFixed(1) + 's');
      particles.appendChild(particle);
    }
  }
})();
