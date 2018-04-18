# Pleasant 👌

[![NPM version](https://img.shields.io/npm/v/pleasant.svg)](https://www.npmjs.com/package/pleasant)
![version](https://img.shields.io/badge/node-%3E=8.5.0-brightgreen.svg)

Next-generation ES6 HTTP framework. Asynchronous and lightweight.

### Getting started

Install it
```bash
$ npm install pleasant --save
```

Add start script in *package.json*
```json
{
  "scripts": {
    "start": "pleasant index.js"
  }
}
```

Populate *index.js*
```js
export default async server => {
  server.route({
    method: 'GET',
    url: '/hello'
    handler: async (req, res) => {
      res.send('Hello World')
    }
  })
}
```

Start the server

![cli](https://media.giphy.com/media/2zoCggfqLV1IfQOBjE/giphy.gif)

 ... Is that it? **Yes** 👌

### Highlights
* Getting started is **easy!**
* Out-of-the-box support for ES modules
* Asynchronous (Use async and await)
* Middleware support (Connect/Express)
* Flexible router (Express route pattern definitions)
* Built-in request validation.
* Built-in error handling.
* Really fast ([Benchmarks](#benchmarks))
* Native HTTP server

### ES Modules
With the help of [esm](https://github.com/standard-things/esm), **pleasant** has full out-of-the-box support for ES modules. You don't need to use babel/transpiling or the `--experimental-modules` flag.

So instead of:
```js
// index.js
const something = require('something')
module.exports = async server => {}
```

You can do:
```js
// index.js
import something from 'something'
export default async server => {}
```

### Main file
The main file is where all the magic happens. You can specify it (*server.js*) by doing the following:

*package.json*
```json
{
  "scripts": {
    "start": "pleasant server.js"
  }
}
```
... or CLI
```bash
$ pleasant server.js
```

The main file is registered using the *default* exported function, passing the server instance as argument.
```js
// server.js
import cors from 'cors'

export default async server => {
  // Enable cors middleware
  server.use(cors())

  // Register a route
  server.route({
    method: 'GET',
    url: '/ping',
    handler: async (req, res) => {
      res.send({ message: 'pong' })
    }
  })
}
```

### Plugins
Plugins are registered using the *default* exported function, passing the server instance as argument. See API for more details.
```js
// index.js
export default async server => {
  // Register plugin
  await server.register(
    import('./routes/route-a')
  )
}
```

```js
// routes/route-a.js
export default async server => {
  // Register route
  server.route({
    method: 'GET',
    url: '/',
    handler: async (req, res) => {
      // Send response
      res.send({ status: 'ok' })
    }
  })
}
```


### Routing
**pleasant** is fully compatible with Express route pattern definitions.

```js
// URL: /users/34/books/8989
server.route({
  method: 'GET',
  url: '/users/:userId/books/:bookId',
  handler: async (req, res) => {
    console.log(req.params)
    // { "userId": "34", "bookId": "8989" }
  }
})
```

Let’s say we wanted a `:userId` parameter in a route rule to match only a 6 digit integer.

The following regex parameter rule does that:

```js
server.route({
  method: 'GET',
  url: '^/users/:userId([0-9]{6})',
  handler: async (req, res) => {
    const { userId } = req.params
    res.send(`Route match for user ID: ${userId}`);
  }
})
```

### Middleware
You can enable connect/express middleware using `server.use`.

```js
import cors from 'cors'

server.use(cors())
```

The following middleware is already included:
* JSON body parser
* Query parser

Route-specific middleware can be enabled like so:
```js
import cors from 'cors'

const hello = (name) => (req, res, next) => {
  console.log(`Hello ${name}!`)
  next()
}

server.route({
  method: 'GET',
  url: '/',
  handler: [
    // Middleware #1
    cors(),

    // Middleware #2
    hello('World'),
    
    // Route handler
    async (req, res) => {
      res.send('Hello World')
    }
  ]
})
```

### Validation
Validating data can be very helpful in making sure that your application is stable and secure. **pleasant** supports the incredible validator [joi](https://github.com/hapijs/joi), which allows you to create your validations with a simple and clear object syntax.

Install:
```bash
npm install joi --save
```

Example:
```js
import joi from 'joi'

server.route({
  method: 'GET',
  url: '/',
  validate: {
    query: {
      offset: joi.number().default(0),
      limit: joi.number().default(10).max(100)
    }
  },
  handler: async (req, res) => {
    const { offset, limit } = req.query
    res.send('A smile of joi!')
  }
})
```
**URL:** /?offset=0&limit=200
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "\"limit\" must be less than or equal to 100",
  "source": "query.limit"
}
```

### Error handling
**pleasant** comes with a built-in error handler, which takes care of any errors that might occur.

If an error is thrown and not caught by you, the response will automatically be 500:

```json
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "An internal server error occurred"
}
```

If the Error object that's thrown contains a `statusCode` property, that's used as the HTTP code to be sent.

You can define custom error-handling middleware last, after other `server.use()` and `server.route()` calls; for example:
```js
server.use((err, req, res, next) => {
  // Handle error
  next()
})
```

### Error responses
**pleasant** supports [boom](https://github.com/hapijs/boom) error objects.

Install:
```bash
npm install boom --save
```

Route example:
```js
import boom from 'boom'

server.route({
  method: 'GET',
  url: '/',
  handler: async (req, res) => {
    // res.send(boom.badImplementation())
    // res.send(boom.badRequest())
    res.send(boom.notFound())
  }
})
```
Middleware example:
```js
import boom from 'boom'

server.use((req, res, next) => {
  next(boom.forbidden())
})
```

Response example:
```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Not Found"
}
```

### API 🤓

#### `const server = pleasant()`
Initialize **pleasant**. The `pleasant()` function is a top-level function exported by the pleasant module.

#### `server.use([path], ...middleware)`
Use the given middleware function for all http methods on the given path, defaulting to the root path.

* `path` The path for which the middleware function is invoked
* `middleware` A middleware function

```js
server.use((req, res, next) => {
  console.log('Logged')
  next()
})
```

Define error-handling middleware functions in the same way as other middleware functions, except error-handling functions have four arguments instead of three: (err, req, res, next). For example:
```js
server.use((err, req, res, next) => {
  // Handle error
  next()
})
```

#### `await server.register([prefix], plugin, [options = {}])`
**pleasant** allows you to extend its functionalities with plugins. A plugin can be a set of routes, a server decorator or whatever.

* `prefix` An optional path prefix used by any calls to `server.route()` and `server.use()`.
* `plugin` A dynamic or static module import. (Also accepts an array of plugins).
* `options` An optional options object that's passed to the plugin(s)

Plugins are registered sequentially, each one running once the previous plugin has finished registering.

Examples:
```js
// Register a single plugin
await server.register(
  // Plugin
  import('./awesome-plugin'),

  // Options
  {
    foo: true,
    bar: false
  }
)
```

```js
// awesome-plugin.js
export default async (server, options) => {
  console.log(options) // { foo: true, bar: false }
}
```

Example with multiple (prefixed) plugins:

```js
// Static plugin import
import staticPluginImport from './route-b'

// Register multiple plugins
await server.register(
  // Prefix
  "/api/v1",

  // Array of plugins
  [
    import("./routes/route-a"),
    staticPluginImport
  ],
  
  // Options
  {
    foo: true,
    bar: false
  }
)
```

#### `server.route(config)`
Add a route
* `config`
  * `method` HTTP method. Typically one of 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'. Also supports 'ALL'.
  * `url` The url for which the handler/middleware is invoked.
  * `validate` Request input validation rules for various request components. Uses [joi](https://github.com/hapijs/joi) for validation.
    * `headers` Validation rules for incoming request headers.
    * `query` Validation rules for an incoming request URI query component. The query is parsed into its individual key-value pairs and stored in req.query prior to validation.
    * `body` Validation rules for an incoming request body.
    * `params` Validation rules for incoming request path parameters
  * `handler` The function called to generate the response. can be one of either:
    * A middleware function
    * An array of middleware functions

Example:
```js
import joi from 'joi'
import boom from 'boom'

server.route({
  method: 'GET',
  url: '/users',
  validate: {
    query: {
      offset: joi.number().default(0),
      limit: joi.number().default(10).max(100)
    }
  },
  handler: async (req, res) => {
    // res.send('Hello World')
    // res.send(200, { status: 'ok' })
    // res.send(boom.notFound())
    res.send({ status: 'ok' })
  }
})
```

Alternatively, it's also possible to specify routes like so:
```js
server.route('GET', '/', async (req, res) => {
  res.send({ status: 'ok' })
})
```

The request and response objects are plain HTTP except for `req.params`, `req.query`, and `res.send`


**`req.params`**  
This property is an object containing properties mapped to the named route “parameters”. For example, if you have the route /user/:name, then the “name” property is available as req.params.name. This object defaults to {}

**`req.query`**  
This property is an object containing a property for each query string parameter in the route.

**`res.send([statusCode = 200], data = null)`**  
Sends the HTTP response.

* `statusCode` HTTP status code. Defaults to 200.
* `data` If data is supplied it is sent in the response. Different input types are processed appropriately, and Content-Type and Content-Length are automatically set
  * `Stream`: `data` is piped as an `octet-stream`.
  * `Buffer`: `data` is written as an `octet-stream`.
  * `object`: `data` is serialized as JSON.
  * `string`: `data` is written as-is.
  * `Error`: `boom` is written as boom payload.

#### `server.routes()`
Returns an array of registered routes.

#### `server.on(type, handler)`
Register an event handler for the given type.
* `type` Type of event to listen for, or "*" for all events
* `handler` Function to call in response to given event

Example:
```js
const logger = e => console.log('foo', e)
server.on('foo', logger)
```

**pleasant** only has *one* built-in event. This event is `'ready'`, which is emitted right before the server starts listening.

#### `server.off(type, handler)`
Remove an event handler for the given type.
* `type` Type of event to unregister handler from, or "*"
* `handler` Handler function to remove

Example:
```js
const logger = e => console.log('foo', e)
server.off('foo', logger)
```

#### `await server.emit(type, event)`
Invoke all handlers for the given type. If present, "*" handlers are invoked after type-matched handlers.
* `type` The event type to invoke
* `event` Any value (object is recommended and powerful), passed to each handler

Example:
```js
await server.emit('foo', { a: 'b' })
```

#### `server.set(key, value)`
Set the value of the key

Example:
```js
server.set('foo', { a: 'b', c: 'd' })
```

#### `server.get([key])`
Get the value of the key

`key` is optional. Will return entire store if omitted.

If the key is not found, it will return undefined.

Example:
```js
server.get('foo') // { a: 'b', c: 'd' }
server.get() // { foo: { a: 'b', c: 'd' } }
```

#### `server.listen()`
The node HTTP server `listen()` function.

#### `server.close()`
The node HTTP server `close()` function.

#### `server.listener`
The node HTTP server object.

### Programmatic use
You can use **pleasant** programmatically by requiring directly:

```js
const server = require('pleasant')()

server.route({
  method: 'GET',
  url: '/',
  handler: async (req, res) => {
    res.send('Hello World')
  }
})

server.listen(3000, (err) => {
  if (err) throw err
  console.log(`Accepting connections...`)
})
```

### Benchmarks
This is a synthetic, "Hello World" benchmark that aims to evaluate the framework overhead.

Results are taken after 1 warm-up run. The tool used for results is the following:
```
wrk -t8 -c100 -d30s http://localhost:3000/
```

* pleasant: 35,359 Req/Sec
* http.createServer: 33,419 Req/Sec
* Express: 15,466 Req/Sec
* Hapi: 6,207 Req/Sec

**How come `pleasant` is faster than `http.createServer`?**

It's really not. But `pleasant` does event loop scheduling, that sometimes provides a performance boost. When multiple calls to `res.send()` are made, the functions are queued for execution. The entire queue is processed every event loop iteration.

### CLI
```bash
$ pleasant -h

  Usage: pleasant [options] [entry]
  
  Options:
    -p, --port <n>  Port to listen on (defaults to 3000)
    -H, --host      The host on which server will run
    -v, --version   Output the version number
    -h, --help      Show this usage information
```

### Inspiration
* [micro](https://github.com/zeit/micro)
* [hapi](https://github.com/hapijs/hapi)
* [express](https://github.com/expressjs/express)
