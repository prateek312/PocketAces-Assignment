'use strict';

/**
 * The app.js file does all the bootstrapping by require-ing all the controllers, models and middlewares.
 * We can break the app.js into 3 parts. Bootstrapping
 * Controllers (./app/controllers/) :- The controller files contain the routes, routing middlewares, business logic, template rendering and dispatching.
 * TODO:- Settings (./settings.js) :- The settings file deals with express specific settings. It sets the view engine, some dynamic view
 * helpers and other environment specific settings.
 */

/** Modules import */
var express = require('express');

/** Local Imports */
var routes = require('./routes/api-docs/');

/** Global Vars */
var app = express();

/** setup routes */
routes.setup(app);

app.use(function (req, res, next) {

    // setting content type to json by default
    if (req.headers.accept === 'text/json') {
        res.setHeader('Content-Type', 'text/json');
    } else {
        res.setHeader('Content-Type', 'text/json');
    }

});


module.exports = app;