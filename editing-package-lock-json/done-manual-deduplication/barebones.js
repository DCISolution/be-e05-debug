const debug = require('debug')
const express = require('express');
const app = express();

const debugOne = debug("app:one")
const debugTwo = debug("app:two")

app.get("/debug-set/:namespaces", (request, response, next) => {
  const { namespaces } = request.params
  debug.enable(namespaces)
  next()
})

app.get("*", (request, response) => {
  debugOne([request.headers.host, request.url].join(""))
  debugTwo(JSON.stringify(response.getHeaders()))

  response.send("Hello world!")
})

app.listen(3333, () => {
   console.log("Visit http://localhost:3333/debug-set/app:*,express:*")
});