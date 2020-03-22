'use strict';

/** @module server/db/mysql */


/** Modules import */
var mysql = require('mysql');

/** Local Imports */
var utils = require('../../../utils/utils.js');
var config = require('../../../config');
var constants = require('../../../secret/constants.js');

const con = mysql.createConnection({
    connectionLimit : 10,
    host: "localhost",
    user: "root",
    password: "1234",
    database: "mysql"
  });

con.connect(function(err) {
    if (err)
        console.log(err);
    else
        console.log("Connected!");
  });

function execute(query, attempt, maxAttempts, retryLag, cb) {
    var cb2 = function (err, result) {
        dbCb(query, attempt, maxAttempts, retryLag, cb, err, result);
    };
    pool.query(query, cb2);
}

/** Execute READ query and return the results in CB.
 * @param {string} query - query string for mysql db.
 * @param {string} attempt - count for attempt number.
 * @param {string} maxAttempts - max attempts allowed.
 */
function executeQuery(query, attempt, maxAttempts, cb) {
    con.query(query, function (err, data) {
        if(err) {
            console.log(err);
            cb(err, null);
        }
        cb(null, data);

    });
    //execute(query, attempt, maxAttempts, config.RETRYREADLAGMS, cb);
}

/** Execute WRITE query with retries.
 * @param {string} query - query string for mysql db.
 * @param {string} attempt - count for attempt number.
 * @param {string} maxAttempts - max attempts allowed.
 */
function executeWriteQueryWithRetries(query, attempt, maxAttempts, cb) {
    execute(query, attempt, maxAttempts, config.RETRYWRITELAGMS, cb);
}

function dbCb(query, attempt, maxAttempts, retryLag, cb, err, result) {
    if (err) {
        if (attempt < maxAttempts) {
            if (!isMySqlConnected) {
                retryLag = config.RETRYCONNECTIONLAGMS;
            }

            // Error: duplicate key value violates unique constraint
            if (err.code === "23505") {
                return (cb) ? cb(err, [[]]) : '';
            } else {

                attempt++;
                setTimeout(execute, retryLag, query, attempt, maxAttempts, retryLag, cb);
            }
        } else {
            return (cb) ? cb(err, [[]]) : '';
        }
    } else {
        // console.log('[mysql] [dbCb] Successfully Executed Query: ' + query + ' ::: In ' + attempt + '/' + maxAttempts + ' attempt.');
        //logger.profile(query);
        if (result.rows !== undefined) {
            return (cb) ? cb(null, [result.rows]) : '';
        } else if (result.length > 0) {
            return (cb) ? cb(null, [result[result.length - 1].rows]) : '';
        } else {
            return (cb) ? cb(null, [[]]) : '';
        }
    }
}

/**
 * Building the query to insert row into mysql table.
 * @param {object} params - map of key-value pairs to store.
 * @param {string} target - table in mysql where the new/updated alerts will be written.
 */
function insertQuery(params, target, conflicColStr = null, onConflictTask = null) {
    console.log('[mysql] [insertQuery] Generating Insert Query based on the target tableName and params.');
    var formedData = formInsertKeysValues(params);

    let conflictClause = '';
    if(conflicColStr !== null) {
        if(onConflictTask !== null) {
            conflictClause = `ON conflict (${conflicColStr}) DO ${onConflictTask};`
        }
    }

    formedData.insertKeys.push('inserttimeutc');
    formedData.insertValues.push('\'' + utils.getInsertUTCTime() + '\'');

    var query = writeGroup + 'INSERT INTO ' + target + ' (' + formedData.insertKeys.join(', ') + ') VALUES (' + formedData.insertValues.join(', ') + `) ${conflictClause};`;

    return query;
}

/**
 * Building the query to insert multiple rows into mysql table in a given column.
 * @param {string} tableName -  table in mysql where the new/updated alerts will be written.
 * @param {string} columnName -  column in the table where rows will be written
 * @param {string} columnValues -  list of values to be inserted in the given column and table name
 */
function insertMultipleValuesQuery(tableName, columnName, columnValues) {
    console.log('[mysql] [insertMultipleValuesQuery] Generating Query to Insert multiple rows in a given column');
    var values = '';
    columnValues.forEach(function (element) {
        if (typeof (element) === 'string') {
            values += '(\'' + element + '\',\'' + utils.getInsertUTCTime() + '\'),';
        } else {
            values += '(' + element + ',\'' + utils.getInsertUTCTime() + '\'),';
        }
    }, this);
    values = values.slice(0, -1);

    columnName = columnName + ', inserttimeutc';

    var query = writeGroup + 'INSERT INTO ' + tableName + ' (' + columnName + ') VALUES ' + values + ';';
    return query;
}

/**
 * Building the query to update rows into mysql table.
 * @param {string} dataArray - list of key-value pairs to store.
 * @param {string} target - table in mysql where the new/updated alerts will be written.
 * @param {object} matchColumns - list of columns that need to match.
 * @param {object} updateColumns - list of columns that will be updated.
 */
function updateQuery(dataArray, target, matchColumns, updateColumns) {
    console.log('[mysql] [updateQuery] Generating Query to update rows in a target table');
    var matchArray = [];
    var matchQuery = '';

    for (var i = 0; i < matchColumns.length; i++) {
        if (typeof dataArray[matchColumns[i]] === 'string') {
            matchArray.push(target + '.' + matchColumns[i] + ' = \'' + dataArray[matchColumns[i]] + '\'');
        } else if (typeof dataArray[matchColumns[i]] !== 'undefined') {
            matchArray.push(target + '.' + matchColumns[i] + ' = ' + dataArray[matchColumns[i]]);
        }

    }
    if (matchArray.length > 0) {
        matchQuery = ' WHERE ' + matchArray.join(' AND ');
    }

    var updateArray = [];
    for (i = 0; i < updateColumns.length; i++) {
        if (typeof dataArray[updateColumns[i]] === 'string') {
            updateArray.push(updateColumns[i] + ' = \'' + dataArray[updateColumns[i]] + '\'');
        } else if (typeof dataArray[updateColumns[i]] !== 'undefined') {
            updateArray.push(updateColumns[i] + ' = ' + dataArray[updateColumns[i]]);
        }
    }
    var query = updateArray.join(', ');

    var queryString = updateGroup + 'BEGIN;';
    if (matchQuery.length > 0 && query.length > 0) {
        queryString += 'UPDATE ' + target + ' SET ' + query + matchQuery + ';';
    }
    queryString += 'END;';
    return queryString;
}

function formInsertKeysValues(params) {
    var insertKeys = [];
    var insertValues = [];
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            insertKeys.push(key);
            if (typeof params[key] === 'string') {
                insertValues.push('\'' + params[key] + '\'');
            } else if (typeof params[key] !== 'undefined') {
                insertValues.push(params[key]);
            } else {
                insertValues.push('\' \'');
            }
        }
    }
    return ({ insertKeys, insertValues });
}

function formReportInsertKeysValues(params) {
    var insertKeys = [];
    var insertValues = [];
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            insertKeys.push(key);
            if (params[key] === 'NULL') {
                insertValues.push(params[key]);
            } else if (typeof params[key] === 'string') {
                insertValues.push('\'' + params[key] + '\'');
            } else if (typeof params[key] !== 'undefined') {
                insertValues.push(params[key]);
            } else {
                insertValues.push('\' \'');
            }
        }
    }
    return ({ insertKeys, insertValues });
}

/**
 * Function to Check for Tables been present for given Title or not.
 * @param {String} title - Title Name.
 * @param {Array} tables - Array of Tables to check for.
 */
function checkIfTablesArePresent(tables) {
    return new Promise(function (resolve, reject) {
        var query = 'SELECT table_name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME like \'%\' and table_schema = \'public\'';

        executeQuery(query, 1, 7, function (err, data) {
            if (err) {
                reject();
            } else {
                if (data[0].length > 0) {

                    var tablesPresent = data[0].map(ele => {
                        return ele.table_name;
                    });

                    tables = tables.filter(function (el) {
                        return tablesPresent.indexOf(el) < 0;
                    });
                    (tables.length > 0) ? reject(tables) : resolve();
                } else {
                    reject(tables);
                }
            }
        });
    });
}

/**
 * Function to Execute bunch of Queries in Transaction.
 * @param {Array} queries - An Array of queries to be executed with transaction.
 */
function executeInTransaction(queries) {
    return new Promise(function (resolve, reject) {
        if (queries && Array.isArray(queries) && queries.length > 0) {
            let query = `BEGIN;${queries.join(';')};END;`;
            executeWriteQueryWithRetries(query, 1, 7, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        } else {
            reject();
        }
    });
}

function getPgClientConnection() {
    return new Promise(function (resolve, reject) {
        transactionPool.connect(function (err, dbClient, connRelease) {
            if (err) {
                reject(err);
            } else {
                resolve({ dbClient, connRelease });
            }
        });
    });
}

function abort(client, dbClienthash, connRelease) {
    console.log(`[${dbClienthash}] ROLLing back....`);
    client.query('ROLLBACK', function (err) {
        if (err) {
        } else {
            console.log(`[${dbClienthash}] ROLLBACK. Done.`);
        }
        // release the client back to the pool
        connRelease();
    });
}

exports.executeQuery = executeQuery;
exports.executeWriteQueryWithRetries = executeWriteQueryWithRetries;
exports.updateQuery = updateQuery;
exports.insertQuery = insertQuery;
exports.insertMultipleValuesQuery = insertMultipleValuesQuery;
exports.formInsertKeysValues = formInsertKeysValues;
exports.formReportInsertKeysValues = formReportInsertKeysValues;
exports.executeInTransaction = executeInTransaction;
exports.getPgClientConnection = getPgClientConnection;
exports.abort = abort;
exports.checkIfTablesArePresent = checkIfTablesArePresent;
