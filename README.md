# pambda-async-init

## Installation

```
npm i pambda-async-init
```

## Usage

``` javascript
const { compose, createLambda } = require('pambda');
const { asyncInit } = require('pambda-async-init');

exports.handler = createLambda(
  compose(
    asyncInit({
      config: callback => readJson('config.json', callback),
    }, (err, result) => {
      if (err) {
        return next => (event, context, callback) => callback(err);
      }

      if (!result.config) {
        return;
      }

      return next => (event, context, callback) => {
        context.config = result.config;

        next(event, context, callback);
      };
    }),

    next => (event, context, callback) => {
      // context.config can be used.
    },
  )
);
```

## asyncInit(tasks, callback)

- `tasks`
    - An array or object that is passed to [run-parallel](https://github.com/feross/run-parallel).
- `callback(err, result)`
    - A function that is called when the tasks is completed or an error occurs.
    - This function must return either a pambda function that uses the result, or a falsy value that means delegating to a subsequent pambda without doing anything.

## License

MIT
