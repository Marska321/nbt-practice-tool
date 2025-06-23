// Firebase Configuration
const firebaseConfig = {
  apiKey: window.FIREBASE_API_KEY || "AIzaSyCGxmnGL3p5PqMlvyOXEGblNLu9VMlbCQU",
  authDomain: (window.FIREBASE_PROJECT_ID || "nbt-practice-tool") + ".firebaseapp.com",
  projectId: window.FIREBASE_PROJECT_ID || "nbt-practice-tool",
  storageBucket: (window.FIREBASE_PROJECT_ID || "nbt-practice-tool") + ".appspot.com",
  messagingSenderId: "540475325874",
  appId: window.FIREBASE_APP_ID || "1:540475325874:web:c1fc369cf6d417f54738ab",
  measurementId: "G-TK07VKVN89"
};

console.log('Firebase Config Loaded:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey,
  hasAppId: !!firebaseConfig.appId
});

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Configure auth settings for better browser compatibility
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

// Export for use in other modules
window.firebaseAuth = auth;
window.firebaseDb = db;
