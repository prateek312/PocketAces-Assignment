'use strict';
/** @module routes/api-route-handlers/index.js */

exports.transactionAPI = require('./transaction-api-handler');

exports.apiroot = function (req, res) {

    res.jsend.success({
        apiVersion: 1
    });
};
