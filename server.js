require('dotenv').config()
const express = require('express');
const app = express();

// Use default value for PORT
const PORT = process.env.PORT || 3001
// Or define the PORT in the command line:
// PORT=3003 npm start


// Functions for the debug module are managed in a separate
// script. If process.env.DEBUG was not set to "app:*" then
// placeholder functions will be used, and the demo will not
// be run. Use `npm start` to run the full demo.
const {
  debugSetNamespaces,
  debugAlwaysOn,
  debugRequest,
  debugResponse,
  debugOffByDefault,
} = require('./getDebug.js')


// <<< Use the custom `debug` functions, if they are available
debugAlwaysOn(`process.env.DEBUG: ${process.env.DEBUG}`)
debugAlwaysOn(`process.env.PORT:  ${process.env.PORT}`)

let portInfo = `PORT is set to ${PORT}`
if (process.env.PORT) {
  portInfo += " through process.env."
} else {
  portInfo = `PORT not defined in process.env.\n${portInfo} by default.`
}
debugAlwaysOn(portInfo)
// Use custom `debug` functions >>>


/**
 * "/debug-set/" is a development-only route. For security,
 * you should require authentication, but for simplicity,
 * this is not applied here.
 * 
 * This route appears before app.get("*", ...) so it takes
 * precedence. 
 */
app.get("/debug-set/:namespaces", debugSetNamespaces)


app.get("/favicon.ico", (request, response) => {
  debugAlwaysOn("favicon requested; request refused")
  response.status(404).end() // swallow the request
})


app.get("*", (request, response) => {
  logDebugData(request, response) // only works after npm start
  response.send("<!doctype html>Hello world!")
})


function logDebugData(request, response) {
  if (typeof debugOffByDefault !== "function") {
    // Show no output if process.env.DEBUG is not "app:*"
    return
  }

  // Show request url and response headers...
  // unless off:by:default is active  
  console.log(`logDebugData`)
  if (debugOffByDefault.enabled) {
    debugOffByDefault("Off-by-default is now active. EOM.")

  } else  {
    debugAlwaysOn("Off-by-default is off")

    debugRequest([request.headers.host, request.url].join(""))
    debugResponse(JSON.stringify(response.getHeaders()))

    if (!debugRequest.enabled) {
      debugAlwaysOn("debugRequest is off  ")
    }
    if (!debugResponse.enabled) {
      debugAlwaysOn("debugRepsonse is off ")
    }
  }
}


app.listen(PORT, () => {
  console.log(`\
    The server is listening on port ${PORT}
    Ctrl-click on the link below to visit
    http://localhost:${PORT}/debug-set/
  `)
});