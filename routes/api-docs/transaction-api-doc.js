'use strict';
/** @module routes/api */

/** Modules import */
var express = require('express');
var router = module.exports = express.Router();

/** Local Imports */
var appHandlers = require('../api-route-handlers');

/** define the api root route */
router.put('/transactionservice/transaction/:transaction_id', appHandlers.transactionAPI.addTransaction);

router.get('/transactionservice/transaction/:transaction_id', appHandlers.transactionAPI.getTransactionById);

router.get('/transactionservice/types/:type', appHandlers.transactionAPI.getTransactionIdsByType);

router.get('/transactionservice/sum/:transaction_id', appHandlers.transactionAPI.getTotalByTransactionId);
