const express = require('express');
const app = express();
const port = 6445;
const orderService = require('./orderService');
var bodyParser = require('body-parser');

app.use(bodyParser.json())


app.use('/orders', orderService);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});