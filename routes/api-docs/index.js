'use strict';

/** @module routes/index
 * This is the root of all the types of api routers.
 * for Example:- If we want all the calls starting with /api to redirect to apiRouter
 * For version changes/admin api this will be easier than making changes than making change at million places.
 */
/** module imports */

var transactionApiRouter = require('./transaction-api-doc.js');

var setup = function (app) {
    app.use('/api/v1', transactionApiRouter);
    app.use('/', (_, res) => res.sendStatus(404));
};

exports.setup = setup;