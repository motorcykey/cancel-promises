// Stop a Promise.all chain when the 2nd timer reaches its end (10 seconds)

// Slightly cleaned up example where pieces of the promise are broken out
// into their own functions.

// Some global vars are necessary:
// array of timers to cancel out processes
// an empty "token" (aka function) which will
// hold the function to assign to the promise we will use
// for canceling our promise at some point later in the code
let timers = [];
let token = {};

// these are variables related to this example for starting an array
// or timer promises
const times = [5, 10, 15, 20, 25];
const promises = [];

// handle wrapping each promise with a cancel token
// TODO: This could be updated to support more arguments for Promise function
const createCancellablePromise = (fn, fnArg, token, onCancel) => {
  return new Promise((resolve, reject) => {
    fn(fnArg, resolve, reject);
    token.cancel = reject => {
      onCancel();
    };
  });
};

// what to return into each promise
const fetchTimer = (seconds, resolve, reject) => {
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
};

// what to dispatch when cancelling the full promise chain
const onPromiseChainCancel = () => {
  timers.forEach(i => {
    clearInterval(i);
    i = null;
  })
  timers = [];
  console.error(new Error('Cancelled Promise Chain due to a bad promise'));
};

// add promises to array
times.forEach((time, index) => {
  // create timer...
  const promise = createCancellablePromise(fetchTimer, time, token, onPromiseChainCancel);

  // report back when the original promise errors out
  promise.catch((err) => {
    console.error(err);
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
  });
