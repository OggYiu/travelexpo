import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off, set, DataSnapshot } from 'firebase/database';

// TODO: Replace the following with your app's Firebase configuration
const firebaseConfig = {
  // Add your Firebase configuration here
  // apiKey: "your-api-key",
  // authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://cayee-guru-default-rtdb.asia-southeast1.firebasedatabase.app/", // Required for Realtime Database
  // projectId: "your-project",
  // storageBucket: "your-project.appspot.com",
  // messagingSenderId: "123456789",
  // appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export type CompanyId = 'A' | 'B' | 'C' | 'D';

export { database, ref, onValue, off, set };
export type { DataSnapshot };
export default app;
