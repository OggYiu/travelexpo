import { initializeApp } from "firebase/app";
import { DataSnapshot, getDatabase, onValue, ref, set } from "firebase/database";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  // ...
  // The value of `databaseURL` depends on the location of the database
  databaseURL: "https://cayee-guru-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);
console.log(database);

type CompanyId = 'A' | 'B' | 'C' | 'D';

function writeQueueData(companyId: CompanyId, current: number) {
  set(ref(database, 'queue/' + companyId), {
    current: current,
  });
}
function writeTicketData(companyId: CompanyId, current: number) {
  set(ref(database, 'ticket/' + companyId), {
    current: current,
  });
}

function writeTestQueueData() {
  writeQueueData('A', 1);
}

function writeTestTicketData() {
  writeTicketData('A', 2);
}

writeTestQueueData();
writeTestTicketData();


const starCountRef = ref(database, 'queue/A/current');
onValue(starCountRef, (snapshot: DataSnapshot) => {
  const data = snapshot.val();
  console.log("here is the data: " + data);
});