const APP = {
  SW: null,
  init() {
    // Check if browser supports service workers
    if ("serviceWorker" in navigator) {
      // Register Service Worker
      navigator.serviceWorker
        .register("../sw.js", { scope: "/" })
        .then((registrationObject) => {
          // The SW could be in any of these, the others that its not will be null
          APP.SW =
            registrationObject.installing ||
            registrationObject.waiting ||
            registrationObject.active;

          console.log("Service Worker Registered");
        });

      // 2. Check if there is a service worker currently running
      if (navigator.serviceWorker.controller) {
        console.log("We have a service worker installed");
      }

      // Register a handler to listen for when a new or updated service worker is installed and activated
      navigator.serviceWorker.oncontrollerchange = (e) => {
        console.log("New service worker activated");
      };

      // Listen for messages from the service worker
    } else {
      console.log("Service Workers are not supported");
    }
  },
};

document.addEventListener("DOMContentLoaded", APP.init);
