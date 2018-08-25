const test = require('tape');
const { asyncInit } = require('..');

test('test', t => {
  t.plan(12);

  const steps = [];
  let resume;

  const pambda = asyncInit({
    foo(callback) {
      t.deepEqual(steps, []);

      steps.push(1);

      resume = () => {
        steps.push(2);

        callback(null, 'foo');
      };
    },
  }, (err, result) => {
    steps.push(3);

    t.error(err);

    return next => (event, context, callback) => {
      steps.push(4);

      event.result = result;

      next(event, context, callback);
    };
  });

  const lambda = pambda((event, context, callback) => {
    steps.push(5);

    callback(null, event);
  });

  t.ok(resume);

  lambda({}, {}, (err, result) => {
    steps.push(6);

    t.error(err);

    t.deepEqual(result, {
      result: {
        foo: 'foo',
      },
    });

    t.deepEqual(steps, [1, 2, 3, 4, 5, 6]);
  });

  process.nextTick(() => {
    t.deepEqual(steps, [1]);

    resume();

    t.deepEqual(steps, [1, 2, 3, 4, 5, 6]);

    lambda({}, {}, (err, result) => {
      steps.push(7);

      t.error(err);

      t.deepEqual(result, {
        result: {
          foo: 'foo',
        },
      });

      t.deepEqual(steps, [1, 2, 3, 4, 5, 6, 3, 4, 5, 7]);
    });
  });
});
