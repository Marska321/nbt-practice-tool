// auth.js

// Use the auth instance created and exported from your firebase-config.js
const auth = window.firebaseAuth;

// --- GET HTML ELEMENTS ---
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const welcomeMessage = document.getElementById('welcome-message');

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');

const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const resetButton = document.getElementById('reset-button');
const logoutButton = document.getElementById('logout-button');

const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const showForgotPassword = document.getElementById('show-forgot-password');
const backToLogin = document.getElementById('back-to-login');

const authError = document.getElementById('auth-error');

// --- AUTH STATE OBSERVER ---
// This master function controls what the user sees
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        authContainer.style.display = 'none';
        appContainer.style.display = 'block';
        welcomeMessage.textContent = `Welcome, ${user.displayName || 'User'}!`;
    } else {
        // User is signed out
        authContainer.style.display = 'block';
        appContainer.style.display = 'none';
        welcomeMessage.textContent = '';
    }
});

// --- EVENT LISTENERS ---

// Signup
signupButton.addEventListener('click', () => {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    authError.textContent = '';

    if (!name) {
        authError.textContent = "Please enter your name.";
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
          // After creating the user, update their profile with the name
          return userCredential.user.updateProfile({ displayName: name });
      })
      .then(() => {
          // onAuthStateChanged handles the UI change automatically
      })
      .catch(error => {
          authError.textContent = error.message;
      });
});

// Login
loginButton.addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
      .catch(error => {
          authError.textContent = error.message;
      });
});

// Logout
logoutButton.addEventListener('click', () => {
    auth.signOut();
});

// Forgot Password
resetButton.addEventListener('click', () => {
    const email = document.getElementById('reset-email').value;

    auth.sendPasswordResetEmail(email)
      .then(() => {
          authError.textContent = "Password reset email sent! Check your inbox.";
      })
      .catch(error => {
          authError.textContent = error.message;
      });
});

// --- FORM SWITCHING ---
showSignup.addEventListener('click', (e) => { e.preventDefault(); loginForm.style.display = 'none'; forgotPasswordForm.style.display = 'none'; signupForm.style.display = 'block'; authError.textContent = ''; });
showLogin.addEventListener('click', (e) => { e.preventDefault(); signupForm.style.display = 'none'; loginForm.style.display = 'block'; authError.textContent = ''; });
showForgotPassword.addEventListener('click', (e) => { e.preventDefault(); loginForm.style.display = 'none'; forgotPasswordForm.style.display = 'block'; authError.textContent = ''; });
backToLogin.addEventListener('click', (e) => { e.preventDefault(); forgotPasswordForm.style.display = 'none'; loginForm.style.display = 'block'; authError.textContent = ''; });
