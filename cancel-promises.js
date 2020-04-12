// Stop a Promise.all chain when the 2nd timer reaches its end (10 seconds)

// This is a longer example where everything is constricted to one function
// fetch function which returns the promise that gets stuck in Promise.all() array
function fetchTimer(seconds, token) {
  return new Promise((resolve, reject) => {
      let counter = 1;

      // kick-off timer
      const timer = setInterval(() => {
        if (counter === seconds) {
          // criteria for canceling
          if (seconds === 10) {
            clearInterval(timer);
            reject(new Error('Encountered a bad promise...'));
          }
          clearInterval(timer);
          resolve();
        }
        counter++;
      }, 1000);

      // keep track of each timer/XHR Object you're creating outside chain
      timers.push(timer);

      // assign cancel behavior to token -- onCancel
      token.cancel = () => {
        // abort every object that remains
        timers.forEach(i => {
          clearInterval(i);
          i = null;
        })
        timers = [];
        reject(new Error('Cancelled Promise Chain due to a bad promise'));
      };
  });
};

let timers = [];
let token = {};
const times = [5, 10, 15, 20, 25];
const promises = [];

// add promises to array
times.forEach((time, index) => {
  // create timer...
  const promise = fetchTimer(time, token);

  // not really necessary unless you want additional error logging for
  // individual promises in the Promise.all chain
  promise
    .then(() => {
      console.log('fetchTimer PROMISE - SUCCESS!');
    })
    .catch((err) => {
      console.log('fetchTimer PROMISE - ERROR: ', err);
    });

  // add promise to array of promises
  promises.push(promise);
});

// Kick-off Promise.all()
let allPromises = Promise.all(promises);
allPromises
  .then(() => {
    console.log('PROMISE.ALL - HAS SUCCESSFULLY COMPLETED?');
  })
  .catch(() => {
    console.log('PROMISE.ALL - A PROMISE HAS BEEN REJECTED!');
    token.cancel();
  })
  .finally(() => {
    console.log('PROMISE.ALL HAS MADE A CALLBACK');
  });
