import { getDatabase, ref, set } from "firebase/database";
import app from "../lib/firebase";

// Initialize Firebase Realtime Database
const db = getDatabase(app);

// Path to store your numbers
const numbersRef = ref(db, 'myNumbers');

// Set all four initial numbers to 0
set(numbersRef, {
  number1: 0,
  number2: 0,
  number3: 0,
  number4: 0
})
.then(() => {
  console.log("Initial numbers set successfully!");
  process.exit(0);
})
.catch((error) => {
  console.error("Error setting initial numbers:", error);
  process.exit(1);
});
