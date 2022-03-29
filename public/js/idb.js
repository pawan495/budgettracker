// DB Variables ~ Initial States
let dbOpenReq;
let version = 1;
let db = null;

/**-------------------------------------------------------------------------
 *                       CREATE DATABASE & STORE
 *------------------------------------------------------------------------**/

// Create Database
function createDB() {
  // Connect to DB, create if it doesn't exist
  dbOpenReq = indexedDB.open("budgetDB", version);

  // If DB doesn't connect
  dbOpenReq.addEventListener("error", (err) => {
    console.warn(err);
  });

  // If DB connected successfully
  dbOpenReq.addEventListener("success", (e) => {
    // DB has opened after upgradeNeeded
    db = e.target.result;
    console.log(`${db.name} successfully connected`, db);

    // Check if online, if yes then send POST request with transactions to mongoDB
    if (navigator.onLine) {
      console.log("Client is online");
      checkIDB();
    }
  });

  // If versionNumber is changed
  dbOpenReq.addEventListener("upgradeneeded", (e) => {
    // Is fired off when: First time opening this DB
    // OR a new version was passed into open()
    db = e.target.result;
    let oldVersion = e.oldVersion;
    let newVersion = e.newVersion;
    console.log(`DB upgraded from ver.${oldVersion} to ver.${newVersion}`);

    // Check if store(collection) exists, if not, create it
    if (!db.objectStoreNames.contains("transactions")) {
      // We only have one store so I won't assign it to a variable
      db.createObjectStore("transactions", { keyPath: "id" });
    }
  });
}

/**-------------------------------------------------------------------------
 *                              HELPER FUNCTIONS
 *------------------------------------------------------------------------**/
// Function to generate unique ID's
function UUID() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

// Transaction Function
function makeTX(storeName, mode) {
  let tx = db.transaction(storeName, mode);
  tx.onerror = (err) => {
    console.warn(err);
  };
  return tx;
}

// Clears all data
function clearData() {
  // open a read/write db transaction, ready for clearing the data
  const tx = db.transaction("transactions", "readwrite");

  // report on the success of the transaction completing, when everything is done
  tx.oncomplete = function (event) {};

  tx.onerror = function (err) {
    console.log(err);
  };

  // create an object store on the transaction
  const store = tx.objectStore("transactions");

  // Make a request to clear all the data out of the object store
  const storeRequest = store.clear();

  storeRequest.onsuccess = function (e) {
    // report the success of our request
    console.log("Clear data successful");
  };
}

function checkIDB() {
  // Create transaction
  const tx = makeTX("transactions", "readwrite");
  console.log(tx);
  // Will run once transaction is complete
  tx.oncomplete = (e) => {
    console.log(`Added transaction`, e);
  };

  // Target the store
  const store = tx.objectStore("transactions");

  // POST REQUEST
  const request = store.getAll();
  console.log(request);

  // What will happen after the object has been added to the DB (yet before the the transaction is considered complete)
  request.onsuccess = (e) => {
    if (request.result.length > 0) {
      console.log("Added data to database");
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(request.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          // Clear data in IDB
          clearData();
        })
        .catch((err) => {
          console.log(`Fetch Error:`, err);
        });
    }
  };

  // What happens if there is an error
  request.onerror = (err) => {
    console.log("Error in request to add transaction");
  };
}

function saveRecord(record) {
  const { name, value, date } = record;
  console.log(`saveRecord:`, name, value, date);
  const transaction = {
    id: UUID(),
    name,
    value,
    date,
  };

  // Create transaction
  const tx = makeTX("transactions", "readwrite");
  // Will run once transaction is complete
  tx.oncomplete = (e) => {
    console.log(`Records saved to IDB`);
  };

  // Target the store
  const store = tx.objectStore("transactions");

  // POST REQUEST
  const request = store.add(transaction);

  // What will happen after the object has been added to the DB (yet before the the transaction is considered complete)
  request.onsuccess = (e) => {};

  // What happens if there is an error
  request.onerror = (err) => {
    console.log("Error in request to add transaction");
  };
}

// Testing to see if window.onLoad is was causing the problem by making this a regular function
createDB();

//FIXME: Doesn't work, not even the console.log
// window.addEventListener("online", () => {
// Check if online, if yes then send POST request with transactions to mongoDB
// if (navigator.onLine) {
//   console.log("Client is online");
//   checkIDB();
// }
// });
