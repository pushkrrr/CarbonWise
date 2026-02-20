// auth.js — Frontend-only mock authentication using localStorage
// No backend calls. Users are stored as JSON in localStorage["cw_users"].

const USERS_KEY = 'cw_users';
const SESSION_KEY = 'cw_session';

// ─── Helpers ──────────────────────────────────────────────────────

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSession(user) {
  const session = { name: user.name, email: user.email, loggedInAt: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // Also keep the old key so existing dashboard code still works
  localStorage.setItem('carbonUser', user.email);
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('carbonUser');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 'Weak',   color: '#e57373', pct: '25%' };
  if (score <= 2) return { level: 'Fair',   color: '#ffb74d', pct: '50%' };
  if (score <= 3) return { level: 'Good',   color: '#81c784', pct: '75%' };
  return              { level: 'Strong', color: '#4caf78', pct: '100%' };
}

function showAlert(id, message, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '';
  el.innerHTML = (type === 'success' ? '✅ ' : '⚠️ ') + message;
  el.className = `auth-alert ${type} show`;
}

function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.className = 'auth-alert';
}

function setFieldError(inputId, errorId, show) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.toggle('error', show);
  if (error) error.classList.toggle('show', show);
}

// ─── LOGIN ────────────────────────────────────────────────────────

const loginForm = document.getElementById('loginForm');

if (loginForm) {
  // Toggle password visibility
  document.getElementById('togglePw')?.addEventListener('click', () => {
    const input = document.getElementById('loginPassword');
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert('loginAlert');

    const email    = document.getElementById('loginEmail')?.value.trim()    || '';
    const password = document.getElementById('loginPassword')?.value         || '';
    const btn      = document.getElementById('loginBtn');
    const btnText  = document.getElementById('loginBtnText');

    // Validate
    let valid = true;
    if (!isValidEmail(email)) { setFieldError('loginEmail', 'emailError', true);    valid = false; } else { setFieldError('loginEmail', 'emailError', false); }
    if (password.length < 1)  { setFieldError('loginPassword', 'passwordError', true); valid = false; } else { setFieldError('loginPassword', 'passwordError', false); }
    if (!valid) return;

    // Loading
    btn.disabled = true;
    btnText.textContent = 'Signing in…';

    // Simulate async
    setTimeout(() => {
      const users = getUsers();
      const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        showAlert('loginAlert', 'No account found with that email. Please register first.', 'error');
        btn.disabled = false;
        btnText.textContent = 'Sign In →';
        return;
      }

      if (user.password !== password) {
        showAlert('loginAlert', 'Incorrect password. Please try again.', 'error');
        btn.disabled = false;
        btnText.textContent = 'Sign In →';
        return;
      }

      // Success
      setSession(user);
      showAlert('loginAlert', `Welcome back, ${user.name}! Redirecting…`, 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);

    }, 600);
  });
}

// ─── REGISTER ────────────────────────────────────────────────────

const registerForm = document.getElementById('registerForm');

if (registerForm) {
  // Password strength meter
  const pwInput = document.getElementById('regPassword');
  if (pwInput) {
    pwInput.addEventListener('input', () => {
      const pw       = pwInput.value;
      const strength = document.getElementById('pwStrength');
      const fill     = document.getElementById('pwStrengthFill');
      const label    = document.getElementById('pwStrengthLabel');

      if (pw.length === 0) {
        strength?.classList.remove('show');
        return;
      }

      strength?.classList.add('show');
      const result = getPasswordStrength(pw);
      if (fill)  { fill.style.width = result.pct; fill.style.background = result.color; }
      if (label) { label.textContent = result.level; label.style.color = result.color; }
    });
  }

  // Toggle password visibility
  document.getElementById('togglePw')?.addEventListener('click', () => {
    const input = document.getElementById('regPassword');
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert('registerAlert');

    const name     = document.getElementById('regName')?.value.trim()     || '';
    const email    = document.getElementById('regEmail')?.value.trim()    || '';
    const password = document.getElementById('regPassword')?.value         || '';
    const confirm  = document.getElementById('regConfirm')?.value          || '';
    const btn      = document.getElementById('registerBtn');
    const btnText  = document.getElementById('registerBtnText');

    // Validate all fields
    let valid = true;

    if (name.length < 2) {
      setFieldError('regName', 'nameError', true);
      valid = false;
    } else {
      setFieldError('regName', 'nameError', false);
    }

    if (!isValidEmail(email)) {
      setFieldError('regEmail', 'emailError', true);
      valid = false;
    } else {
      setFieldError('regEmail', 'emailError', false);
    }

    if (password.length < 6) {
      setFieldError('regPassword', 'passwordError', true);
      valid = false;
    } else {
      setFieldError('regPassword', 'passwordError', false);
    }

    if (confirm !== password) {
      setFieldError('regConfirm', 'confirmError', true);
      valid = false;
    } else {
      setFieldError('regConfirm', 'confirmError', false);
    }

    if (!valid) return;

    // Loading
    btn.disabled = true;
    btnText.textContent = 'Creating account…';

    setTimeout(() => {
      const users = getUsers();

      // Check duplicate email
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        showAlert('registerAlert', 'An account with this email already exists. Try logging in.', 'error');
        btn.disabled = false;
        btnText.textContent = 'Create Account 🌿';
        return;
      }

      // Save new user
      const newUser = { name, email, password, createdAt: Date.now() };
      users.push(newUser);
      saveUsers(users);

      // Auto-login
      setSession(newUser);
      showAlert('registerAlert', `Account created! Welcome, ${name}! Redirecting…`, 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 900);

    }, 700);
  });
}
