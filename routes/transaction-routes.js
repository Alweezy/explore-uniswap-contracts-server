'use strict'

const express = require('express');
const router = express.Router();

const transactionsHandler = require("./../handlers/transactions-handler");

router.get('/history', async(req, res) => {
  const {address} = req.query

  const transactions = await transactionsHandler.fetchAllTransactions(address)
  res.status(200).send(transactions)
})


module.exports = router