/*jshint esversion: 6 */
'use strict';

/** Local Imports */
var processor = require('../../server/processor/transaction-data-processor');
var utils = require('../../utils/utils.js');
var constants = require('../../secret/constants');

exports.addTransaction = function(req, res) {
    var params = utils.getPathParams(req);
    var body = req.body;

    if(body == null || body == undefined) {
        res.status(constants.HTTP_STATUS_CODES.HTTP_BAD_REQUEST);
        res.send("Body is empty");
    } else {
        processor.addTransaction(params, body, function (err, data) {
            if (err) {
                console.log('Error while adding transaction');
                res.status(constants.HTTP_STATUS_CODES.HTTP_BAD_REQUEST);
                res.send(err);
            } else {
                res.send(data);
            }
        });
    }
}

exports.getTransactionById = function(req, res) {
    var params = utils.getPathParams(req);

    processor.getTransactionById(params, function (err, data) {
        if (err) {
            console.log('Error while getting transaction');
            res.status(constants.HTTP_STATUS_CODES.HTTP_BAD_REQUEST);
            res.send(err);
        } else {
            res.send(data);
        }
    });
}

exports.getTransactionIdsByType = function(req, res) {
    var params = utils.getPathParams(req);

    processor.getTransactionIdsByType(params, function (err, data) {
        if (err) {
            console.log('Error while getting transaction Ids');
            res.status(constants.HTTP_STATUS_CODES.HTTP_BAD_REQUEST);
            res.send(err);
        } else {
            res.send(data);
        }
    });
}

exports.getTotalByTransactionId = function(req, res) {
    var params = utils.getPathParams(req);

    processor.getTotalByTransactionId(params, function (err, data) {
        if (err) {
            console.log('Error while getting total amount by transaction id');
            res.status(constants.HTTP_STATUS_CODES.HTTP_BAD_REQUEST);
            res.send(err);
        } else {
            res.send({'Total': data});
        }
    });
}
