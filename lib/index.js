const { callbackify } = require('lambda-callbackify');
const { wait } = require('task-waiter');
const parallel = require('run-parallel');

exports.asyncInit = (tasks, callback) => {
  const then = wait(callback => parallel(tasks, callback));

  return next => {
    next = callbackify(next);

    return (event, context, callback2) => then(
      (err, result) => callback(err, result)(next)(event, context, callback2)
    );
  };
};
