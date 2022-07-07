const express = require('express');
var morgan = require('morgan')
const cors = require('cors');
const app = express();
const port = process.env.PORT;
const transactionRoutes = require("./routes/transaction-routes")

app.use(cors())
app.use(morgan('combined'))
app.use('/api/v1/transactions', transactionRoutes)

app.get('/ping', (req, res) => {
  res.send ({message: "success"});
});

app.listen(port, () => {
  console.log(`Listening on port ==> ${port}`);
});