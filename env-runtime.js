
// Environment variables injected at runtime
window.FIREBASE_API_KEY = "AIzaSyCGxmnGL3p5PqMlvyOXEGblNLu9VMlbCQU";
window.FIREBASE_PROJECT_ID = "nbt-practice-tool";
window.FIREBASE_APP_ID = "1:540475325874:web:c1fc369cf6d417f54738ab";

console.log('Environment variables injected:', {
  hasApiKey: !!window.FIREBASE_API_KEY,
  hasProjectId: !!window.FIREBASE_PROJECT_ID,
  hasAppId: !!window.FIREBASE_APP_ID,
  projectId: window.FIREBASE_PROJECT_ID
});
