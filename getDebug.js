const noop = !process.env.DEBUG.includes("app:*")

if (noop) {
  // Run no tests and export only placeholder functions if
  // process.env.DEBUG was not set by the "start" script in
  // package.json 
  module.exports = {
    debugNoOffSwitch: () => {},
    debugSetNamespaces: (req, res, next) => next(),
    debugOffByDefault: { enabled: false }
  }

} else {
  // process.env.DEBUG was set by the "start" script in
  // package.json. Run the full demo.
  module.exports = require('./debug.js')
}