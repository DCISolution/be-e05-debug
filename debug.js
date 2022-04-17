const debug = require('debug')

// <<< HARD-CODED collection of debug function names and
// their corresponding namespace signatures
const debugFunctions = {
  "debugAlwaysOn":  'app:always-on*',
  "debugRequest":      'app:router:request',
  "debugResponse":     'app:router:response',
  "debugOffByDefault": 'off:by:default',

  debugSetNamespaces, // already a function (see below)
}
// HARD-CODED collection >>>

// NOTE // NOTE // NOTE // NOTE // NOTE // NOTE // NOTE // NOTE
// DEBUG=app:* is set in the package.json "start" script.
// The off: namespace is not enabled.

// Create a helper variable with a short name
const d = debugFunctions

// Convert namespaces (such as "app:one") to debug functions
// that use those namespaces
const debugFunctionNames = 
  Object.keys(debugFunctions)
        .filter( name => (
          // exclude the debugSetNamespaces function
          typeof debugFunctions[name] === "string"
        ))

// debugFunctionNames = [
//   "debugAlwaysOn",
//   "debugRequest",
//   "debugResponse",
//   "debugOffByDefault"
// ]

debugFunctionNames.forEach( name => {
  debugFunctions[name] = debug(debugFunctions[name])
})

// debugFunctions = {
//   "debugAlwaysOn": <debug function>,
//   "debugRequest": <debug function>,
//   "debugResponse": <debug function>,
//   "debugOffByDefault": <debug function>
// }


// Start up tests
runDebugDisableTests()


/**
 * debugSetNamespaces is called when the route "/debug-set"
 * is requested in the browser
 * 
 * For security, you should require authentication or disable
 * this function in production but, for simplicity, this is not
 * done here.
 */
function debugSetNamespaces (request, response, next) {
  const { namespaces } = request.params

  console.log("debugSetNamespaces")
  d.debugAlwaysOn((`Previously active: ${nowAvailable(1)}`))
  d.debugAlwaysOn((`Enabling "${namespaces}"`))

  // Enable the chosen namespaces
  debug.enable(namespaces)

  d.debugAlwaysOn((`Currently active:  ${nowAvailable(1)}`))

  // Update the browser
  response.send(nowAvailable())
}


function nowAvailable(asString) {
  const debugs  = Object.entries(debugFunctions)

  const items = debugs.filter(([ name, fn ]) => (
    fn.enabled
  )).map(([ name, fn ]) => [name, fn.namespace])  

  if (asString) {
    return "\n  " + items.map(item => item[1]).join("\n  ")
  }

  const list = `<dl><dt>
  ${items.map(([ name, space ]) => {
    return `<strong>${name}</strong><dt><dd>"${space}"`
  }).join("</dd><dt>")}
  </dt></dl>`

  return `
    <!doctype html>
    <h2>Debug functions now enabled</h2>
    ${list}
  `
};


function runDebugDisableTests() {
  console.log("\nTesting the debug module on start up:")
  console.log("process.env.DEBUG:", process.env.DEBUG, "\n");
  
  d.debugAlwaysOn("     on... always")
  d.debugRequest(" on")
  d.debugResponse("on")

  console.log(
    "\nAll debug functions that start with `app:' are enabled because 'process.env.DEBUG:' has the value 'app:*'. The namespace 'app:always-on*' has an 'always on' asterisk at then end, so it would be enabled even if 'process.env.DEBUG' had another value.\n\n  let disabledNamespaces = debug.disable()"
  )

  let disabledNamespaces = debug.disable()
  // debug.enable("app:*")
  d.debugAlwaysOn("is still active, even after debug.disable()")
  d.debugAlwaysOn(`disabledNamespaces: "${disabledNamespaces || ''}"`)

  console.log("\ndebug.enable(<namespaces>) enables only the namespaces that are explicitly listed. In other words it disables all name spaces that are not included in <namespaces>.\n\nTo disable a single name space, you must:\n1. Enable all current name spaces.\n2. Use `-` to disable just the namespaces that you want to switch off.\n\nNote: You can use commas to list several namespaces.\n\nFor example:\n\n  debug.enable(`${namespaces},-app:router:response`)")

  debug.enable(`${disabledNamespaces},-app:router:response`)
  // No: the .enable method replaces all of the current
  // namespaces. 
  d.debugAlwaysOn("You won't see output from app:router:response")
  d.debugRequest("but app:router:request is still active.")
  d.debugResponse("YOU CAN'T SEE THIS, EVEN IF I SHOUT!")

  console.log("\nRestore all custom namespaces except 'off:by:default' which has not been activated yet.\n\n  debug.enable(disabledNamespaces)")
  debug.enable(disabledNamespaces)
  d.debugAlwaysOn(" And now all")
  d.debugRequest(" namespaces")
  d.debugResponse("work again")

  // ... except for "off:by:default" which wasn't enabled yet
  d.debugOffByDefault("This won't be visible")

  console.log("\nThe test is complete and server.js can use the custom debug functions.\n")
}


module.exports = debugFunctions
