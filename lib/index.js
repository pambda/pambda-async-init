const { callbackify } = require('lambda-callbackify');
const parallel = require('run-parallel');

exports.asyncInit = (tasks, callback) => next => {
  next = callbackify(next);

  const queue = [];

  function enqueue(event, context, callback) {
    queue.push([event, context, callback]);
  }

  let acceptor = enqueue;

  parallel(tasks, (err, result) => {
    const pambda = callback(err, result) || (next => next);
    acceptor = pambda(next);
    queue.forEach(args => acceptor(...args));
  });

  return (event, context, callback) => {
    acceptor(event, context, callback);
  };
};
