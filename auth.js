// Authentication Module
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userIsPremium = false;
        this.googleProvider = new firebase.auth.GoogleAuthProvider();
        this.authSection = document.getElementById('authSection');
        this.userStatus = document.getElementById('userStatus');
        
        this.initializeAuth();
    }

    async initializeAuth() {
        try {
            console.log('Initializing authentication system...');
            console.log('Current domain:', window.location.hostname);
            console.log('Firebase config loaded:', {
                projectId: window.FIREBASE_PROJECT_ID,
                hasApiKey: !!window.FIREBASE_API_KEY
            });
            
            // Handle redirect result first
            await this.handleRedirectResult();
            
            // Set up auth state listener
            auth.onAuthStateChanged(async (user) => {
                console.log('Auth state changed:', user ? `User logged in: ${user.email}` : 'User logged out');
                if (user) {
                    await this.setupUser(user);
                } else {
                    this.updateUIAfterLogout();
                }
            });
            
            console.log('Authentication system initialized successfully');
        } catch (error) {
            console.error("Error initializing auth:", error);
            this.showError(`Failed to initialize authentication: ${error.message}`);
        }
    }

    async handleRedirectResult() {
        try {
            console.log('Checking for redirect result...');
            const result = await auth.getRedirectResult();
            if (result && result.user) {
                console.log("User signed in via redirect:", result.user.email);
                return true;
            }
            console.log('No redirect result found');
            return false;
        } catch (error) {
            console.error("Firebase Redirect Error:", error);
            
            // Provide specific error messages based on error codes
            let userMessage = 'Sign-in failed';
            if (error.code === 'auth/unauthorized-domain') {
                userMessage = `This domain (${window.location.hostname}) is not authorized for Google sign-in. Please add it to Firebase Console > Authentication > Settings > Authorized domains.`;
            } else if (error.code === 'auth/operation-not-allowed') {
                userMessage = 'Google sign-in is not enabled for this app. Please contact support.';
            } else if (error.code === 'auth/invalid-api-key') {
                userMessage = 'Invalid API key configuration. Please contact support.';
            } else {
                userMessage = `Sign-in failed: ${error.message}`;
            }
            
            this.showError(userMessage);
            return false;
        }
    }

    async setupUser(user) {
        try {
            this.currentUser = user;
            const userRef = db.collection('users').doc(user.uid);
            
            const doc = await userRef.get();
            if (!doc.exists) {
                await userRef.set({
                    email: user.email,
                    displayName: user.displayName,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    isPremium: false
                });
                this.userIsPremium = false;
            } else {
                this.userIsPremium = doc.data().isPremium || false;
            }
            
            this.updateUIAfterLogin();
            
            // Notify app of successful login
            if (window.app) {
                window.app.onUserLogin(user, this.userIsPremium);
            }
        } catch (error) {
            console.error("Error setting up user in Firestore:", error);
            this.showError("Error connecting to database. Please try again.");
        }
    }

    async signInWithGoogle() {
        try {
            console.log('Starting Google sign-in...');
            console.log('Current domain:', window.location.hostname);
            
            // Configure Google provider for better compatibility
            this.googleProvider.addScope('email');
            this.googleProvider.addScope('profile');
            
            // Wait a moment for Firebase to initialize fully
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Try popup first regardless of domain for testing
            console.log('Attempting popup sign-in...');
            const result = await auth.signInWithPopup(this.googleProvider);
            console.log('Popup sign-in successful:', result.user.email);
        } catch (error) {
            console.error("Google sign-in error:", error);
            
            if (error.code === 'auth/popup-blocked') {
                console.log('Popup blocked, falling back to redirect...');
                try {
                    await auth.signInWithRedirect(this.googleProvider);
                } catch (redirectError) {
                    console.error('Redirect also failed:', redirectError);
                    this.showError("Sign-in failed. Please allow popups or try refreshing the page.");
                }
            } else if (error.code === 'auth/unauthorized-domain') {
                console.log('Domain authorization may still be propagating...');
                this.showError(`Domain authorization is still propagating. Please wait 2-3 minutes and try again. If the issue persists, verify "${window.location.hostname}" is in Firebase Console > Authentication > Settings > Authorized domains`);
            } else if (error.code === 'auth/operation-not-allowed') {
                this.showError("Google sign-in is not enabled. Please contact support.");
            } else {
                this.showError(`Sign-in failed: ${error.message}`);
            }
        }
    }

    shouldUsePopup() {
        // Use popup for desktop, redirect for mobile
        return window.innerWidth > 768 && !this.isMobile();
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    async signUpWithEmail() {
        const email = document.getElementById('emailInput')?.value;
        const password = document.getElementById('passwordInput')?.value;
        
        if (!email || !password) {
            this.showError("Please enter both email and password");
            return;
        }
        
        if (password.length < 6) {
            this.showError("Password must be at least 6 characters long");
            return;
        }
        
        try {
            await auth.createUserWithEmailAndPassword(email, password);
        } catch (error) {
            console.error("Sign-up Error:", error);
            this.showError(`Sign-up failed: ${error.message}`);
        }
    }

    async signInWithEmail() {
        const email = document.getElementById('emailInput')?.value;
        const password = document.getElementById('passwordInput')?.value;
        
        if (!email || !password) {
            this.showError("Please enter both email and password");
            return;
        }
        
        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            console.error("Sign-in Error:", error);
            this.showError(`Sign-in failed: ${error.message}`);
        }
    }

    async signOut() {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Sign-out Error:", error);
            this.showError("Failed to sign out");
        }
    }

    updateUIAfterLogin() {
        this.authSection.innerHTML = `<button class="btn" onclick="authManager.signOut()">Sign Out</button>`;
        this.userStatus.innerHTML = `Welcome, ${this.currentUser.displayName || this.currentUser.email}! 
            <span style="background:${this.userIsPremium ? '#16a34a' : '#9ca3af'}; color:white; padding: 2px 8px; border-radius:10px; font-size:0.8rem;">
                ${this.userIsPremium ? 'Premium' : 'Free Tier'}
            </span>`;
    }

    updateUIAfterLogout() {
        this.currentUser = null;
        this.userIsPremium = false;
        
        this.authSection.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
                <button class="google-btn" onclick="authManager.signInWithGoogle()">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                </button>
                <div style="color: white; font-size: 0.9rem; text-align: center; margin: 5px 0;">
                    <strong>Email Authentication Available</strong><br>
                    <span style="opacity: 0.8;">Use email sign-in while Google authorization propagates</span>
                </div>
                <span class="email-auth-toggle" onclick="authManager.toggleEmailAuth()" style="display: block;">
                    Sign in with Email
                </span>
                <div class="email-form" id="emailForm" style="display: block;">
                    <input type="email" id="emailInput" placeholder="Email" required>
                    <input type="password" id="passwordInput" placeholder="Password (min. 6 characters)" required>
                    <button class="btn" onclick="authManager.signInWithEmail()">Sign In</button>
                    <button class="btn btn-secondary" onclick="authManager.signUpWithEmail()">Sign Up</button>
                </div>
            </div>`;
        
        this.userStatus.innerHTML = '';
        
        // Notify app of logout
        if (window.app) {
            window.app.onUserLogout();
        }
    }

    toggleEmailAuth() {
        const emailForm = document.getElementById('emailForm');
        if (emailForm) {
            emailForm.style.display = emailForm.style.display === 'none' ? 'block' : 'none';
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Remove any existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Insert after auth section
        this.authSection.parentNode.insertBefore(errorDiv, this.authSection.nextSibling);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

// Initialize auth manager
const authManager = new AuthManager();
