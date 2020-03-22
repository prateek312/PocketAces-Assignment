/*jshint esversion: 6 */
'use strict';

/** Local Imports */
var mysql = require('./db/mysql.js');

/**
 * Add a transaction
 * @param {*} params - transactionId
 */
function addTransaction(params, body, cb) {
    console.log('[transaction-processor] [addTransaction] Adding transaction:' + params.transaction_id);
    var amount = body.amount;
    var type = body.type;
    var parent_id = null;

    if(parent_id in body) {
        parent_id = body.parent_id;
    }

    var queryString = `INSERT INTO transactions VALUES(${params.transaction_id}, ${amount}, ${type}, ${parent_id})`;
    mysql.executeQuery(queryString, 1, 7, function (err, data) {
        cb(err, data);
    });
}

/**
 * Gets a transaction by Id
 * @param {*} transactionId - transactionId
 */
function getTransactionById(params, cb) {
    console.log('[transaction-processor] [getTransactionById] Getting a transaction by Id : ' + params.transaction_id);
    var queryString = `SELECT * FROM transactions WHERE id =  ${params.transaction_id}`;
    mysql.executeQuery(queryString, 1, 7, function (err, data) {
        cb(null, data);
    });
}

/**
 * Gets transaction ids by type
 * @param {*} type - transactionType
 */
function getTransactionIdsByType(params, cb) {
    console.log('[transaction-processor] [getTransactionIdsByType] Fetching unbalanced family');
    var queryString = `SELECT id FROM transactions where type = '${params.type}'`;
    mysql.executeQuery(queryString, 1, 7, function (err, data) {
        if(err) {
            console.log('[transaction-processor] [getTransactionIdsByType] Error while fetching transaction list');
            cb(err, null);
        }
        var res = [];
        for(let i=0; i<data.length; i++) {
            res.push(data[i].id);
        }
        cb(null, res);
    });
}

/**
 * Gets sum of amount of transactions by Id
 * @param {*} transactionId - transactionId
 */
function getTotalByTransactionId(params, cb) {
    console.log('[transaction-processor] [getTotalByTransactionId] Total amount by transaction id');
    
    var total = 0;

    //Getting amount of particular transaction id
    var queryString = `SELECT amount FROM transactions WHERE id = ${params.transaction_id}`;
    mysql.executeQuery(queryString, 1, 7, function (err, data) {
        if(err) {
            console.log('[transaction-processor] [getTotalByTransactionId] Error while getting total');
            cb(err, null);
        }

        total = data[0].amount;

        //Getting total from all of its children
        queryString = `select sum(data.amount) as sum FROM (select  id, amount, parent_id FROM (select * from transactions) transactions, (select @pv := ${params.transaction_id}) initialisation where find_in_set(parent_id, @pv) > 0 and @pv := concat(@pv, ',', id)) AS data`;
        mysql.executeQuery(queryString, 1, 7, function (err, data) {
            if(err) {
                cb(err, total);
            } else {
                total += data[0].sum;
                cb(null, total);
            }
        });
    });
}

exports.addTransaction = addTransaction;
exports.getTransactionById = getTransactionById;
exports.getTransactionIdsByType = getTransactionIdsByType;
exports.getTotalByTransactionId = getTotalByTransactionId;