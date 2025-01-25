// Import the necessary functions from Firebase SDKs
import { initializeApp } from "firebase/app"; // For initializing Firebase
import { getFirestore } from "firebase/firestore"; // For accessing Firestore database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, // API key from Firebase (from .env file)
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, // Firebase Auth domain (from .env file)
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, // Firebase Project ID (from .env file)
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, // Firebase Storage bucket URL (from .env file)
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, // Sender ID for Firebase Cloud Messaging
  appId: import.meta.env.VITE_FIREBASE_APP_ID, // Firebase App ID
};

// Initialize Firebase with the configuration object
const app = initializeApp(firebaseConfig);

// Initialize Firestore database service
const db = getFirestore(app); // Get Firestore instance from Firebase app

// Export the app and Firestore instance for use in other parts of the app
export { app, db };
