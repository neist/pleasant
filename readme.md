# Pleasant

[![NPM version](https://img.shields.io/npm/v/pleasant.svg)](https://www.npmjs.com/package/pleasant)

A minimalistic, asynchronous and ESM-ready HTTP framework.

### Getting started

Install it
```bash
$ npm install pleasant --save
```

Add a start script in *package.json*
```json
{
  "scripts": {
    "start": "pleasant"
  }
}
```

Populate *routes/index.mjs*
```js
export default async (server) => {
  server.route({
    method: 'GET',
    url: '/',
    handler: (req, res) => {
      res.send('Hello World')
    }
  })
}
```

Start the server
```bash
$ npm start
```

... Is that it? **Yes**

### Highlights
* Out-of-the-box ESM support (.mjs)
* No configuration - focus on the code
* Middleware, routing and validation
* Plain HTTP
* Asynchronous
* Fast

### ES Modules
With the help of [@std/esm](https://github.com/standard-things/esm), **pleasant** has full out-of-the-box ESM support.

You don't need to set up babel or any other transpiling.

So instead of:
```js
// routes/index.js
const something = require('something')
module.exports = (server) => {}
```

You do:
```js
// routes/index.mjs
import something from 'something'
export default (server) => {}
```

### Registering routes
The file-system is the main API. Every *.mjs* file inside the *routes/* directory becomes a plugin that gets automatically registered.

**pleasant** uses the following glob pattern:
`routes/{*,**/index}.mjs`

An example:
```text
routes/
  route-a.mjs <-- Registered
  route-b.mjs <-- Registered
  route-c.mjs <-- Registered
  route-d/
    index.mjs <-- Registered
    helper.mjs <-- Ignored
    sub-directory/
      index.mjs <-- Ignored
```

A plugin is registered using the *default* exported function:
```js
// routes/route-a.mjs
export default async (server) => {
  // Do your magic
  // server.route({
  //   ...
  // })
}
```

### Main entry file (optional)
The main entry file is called *before* automatically registering routes, which makes it useful for configuration, plugins, middleware etc. You can even choose to opt-out of automatically registering routes and do it manually.

You can specify a main entry file by doing one of the following:

*package.json*
```json
{
  "main": "index.mjs",
  "scripts": {
    "start": "pleasant"
  }
}
```
... or CLI
```bash
$ pleasant index.mjs
```

The main entry file is registered using the *default* exported function:
```js
// index.mjs
const { NODE_ENV = 'development' } = process.env

export default async (server) => {
  // Set config
  server.set('config', {
    env: NODE_ENV
  })
  
  // Register plugins
  await server.register([
    import('./plugins/plugin-a'),
    import('./plugins/plugin-b')
  ])
  
  // Continues to automatically
  // register plugins in routes/*
}
```

Opt-out of automatically registering routes:
```js
// index.mjs
import importedPlugin from './plugins/plugin-c'

export default async (server) => {
  // Register
  await server.register([
    // Plugins
    import('./plugins/plugin-a'),
    import('./plugins/plugin-b'),
    importedPlugin,
    
    // Routes
    import('./routes/route-a'),
    import('./routes/route-b')
  ])
  
  // Return false to opt-out of automatically
  // registering plugins in routes/*
  return false
}
```

### Routing
**pleasant** is built on [router](https://github.com/pillarjs/router) and supports express-like route parameters.

```js
server.route({
  method: 'GET',
  url: '/users/:userId/books/:bookId',
  handler: (req, res) => {
    // Request URL: http://localhost:3000/users/34/books/8989
    // req.params: { "userId": "34", "bookId": "8989" }
  }
})
```

### Validation
Validating data can be very helpful in making sure that your application is stable and secure. **pleasant** allows this functionality by using the module [joi](https://github.com/hapijs/joi).

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
  handler: (req, res) => {
    const { offset, limit } = req.query
    //res.send()
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
**pleasant** supports [boom](https://github.com/hapijs/boom) error objects in `res.send`
```js
import boom from 'boom'

server.route({
  method: 'GET',
  url: '/',
  handler: (req, res) => {
    // res.send(boom.notFound())
    // res.send(boom.badRequest())
    res.send(boom.badImplementation())
  }
})
```
```json
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "An internal server error occurred"
}
```

### Middleware
You can enable connect/express-like middleware using `server.use`

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

server.route({
  method: 'GET',
  url: '/',
  handler: [
    cors(),
    // ... and more
    (req, res) => {
      res.send('Hello World')
    }
  ]
})
```

### API

### `const server = pleasant()`
Initialize **pleasant**. The `pleasant()` function is a top-level function exported by the pleasant module.

#### `server.use([path], ...middleware)`
Use the given middleware function for all http methods on the given path, defaulting to the root path.

* `path` The path for which the middleware function is invoked
* `middleware` A middleware function

#### `server.register(plugins)`
**pleasant** allows the user to extend its functionalities with plugins.

* `plugins` An array of dynamic or static module  imports

Plugins are loaded and executed in series, each one running once the previous plugin has finished registering.

Example:
```js
import awesomePlugin from './awesome-plugin'

await server.register([
  awesomePlugin,
  import('./another-plugin')
])
```
#### `server.route(config)`
Add a route
* `config`
  * `method` HTTP method. Typically one of 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', or 'OPTIONS'.
  * `url` The url for which the handler/middleware is invoked.
  * `validate` Request input validation rules for various request components. Uses [joi](https://github.com/hapijs/joi) for validation.
    * `headers` Validation rules for incoming request headers.
    * `query` Validation rules for an incoming request URI query component. The query is parsed into its individual key-value pairs and stored in req.query prior to validation.
    * `body` Validation rules for an incoming request body.
    * `params` Validation rules for incoming request path parameters
  * `handler` The function called to generate the response. can be one of either:
    * A middleware function
    * An array of middleware functions

The response object is plain HTTP except for `res.query` and `res.send`

`res.query`
This property is an object containing a property for each query string parameter in the route.

`res.send([statusCode], data = null)`
Sends the HTTP response.

* `statusCode` is a `Number` with the HTTP status code. Defaults to 200.
* `data` If data is supplied it is sent in the response. Different input types are processed appropriately, and Content-Type and Content-Length are automatically set
  * `Stream`: `data` is piped as an `octet-stream`.
  * `Buffer`: `data` is written as an `octet-stream`.
  * `object`: `data` is serialized as JSON.
  * `string`: `data` is written as-is.
  * `boom`: `Error` is written as boom payload.

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
  handler: (req, res) => {
    // res.send('Hello World')
    // res.send(200, { status: 'ok' })
    // res.send(boom.notFound())
    res.send({ status: 'ok' })
  }
})
```

#### `server.on(type, handler)`
Register an event handler for the given type.
* `type` Type of event to listen for, or "*" for all events
* `handler` Function to call in response to given event

Example:
```js
const logger = e => console.log('foo', e)
server.on('foo', logger)
```

#### `server.off(type, handler)`
Remove an event handler for the given type.
* `type` Type of event to unregister handler from, or "*"
* `handler` Handler function to remove

Example:
```js
const logger = e => console.log('foo', e)
server.off('foo', logger)
```

#### `server.emit(type, event)`
Invoke all handlers for the given type. If present, "*" handlers are invoked after type-matched handlers.
* `type` The event type to invoke
* `event` Any value (object is recommended and powerful), passed to each handler

Example:
```js
server.emit('foo', { a: 'b' })
```

#### `server.set(key, value)`
Set the value of the key

Example:
```js
server.set('config', { a: 'b', c: 'd' })
```

#### `server.get([key])`
Get the value of the key

`key` is optional. Will return entire store if omitted.

If the key is not found, it will return undefined.

Example:
```js
server.get('config') // { a: 'b', c: 'd' }
server.get() // { config: { a: 'b', c: 'd' } }
```

### Programmatic use
You can use **pleasant** programmatically by requiring directly:

```js
const server = require('pleasant')()

server.route({
  method: 'GET',
  url: '/',
  handler: (req, res) => {
    res.send('Hello World')
  }
})

server.listen(3000, (err) => {
  if (err) throw err
  console.log(`Accepting connections...`)
})
```

### Benchmarks
This is a synthetic, "hello world" benchmark that aims to evaluate the framework overhead.


* http.createServer: 27,851 Req/Sec
* micro: 23,624 Req/Sec
* **pleasant: 20,529 Req/Sec**
* Express: 12,362 Req/Sec
* Hapi: 4,357 Req/Sec

### Inspiration
* [hapi](https://github.com/hapijs/hapi)
* [next.js](https://github.com/zeit/next.js/)
* [micro](https://github.com/zeit/micro)