'use strict';

/** @module secret/constants.js */

/**
 Constants file.
 */

module.exports.HTTP_STATUS_CODES = {
    /**
     200 (OK) - if an existing resource has been updated
     201 (created) - if a new resource is created
     202 (accepted) - accepted for processing but not been completed (Async processing)

     301 (Moved Permanently) - the resource URI has been updated
     303 (See Other) - e.g. load balancing

     400 (bad request) - indicates a bad request
     404 (not found) - the resource does not exits
     406 (not acceptable) - the server does not support the required representation
     409 (conflict) - general conflict
     412 (Precondition Failed) e.g. conflict by performing conditional update
     415 (unsupported media type) - received representation is not supported

     500 (internal server error) - generic error response
     503 (Service Unavailable) - The server is currently unable to handle the request
     */
    HTTP_SUCCESS_CODE: 200,
    HTTP_CREATED_CODE: 201,
    HTTP_NOT_FOUND: 404,
    HTTP_NO_CONTENT: 204,
    HTTP_CONFLICT_CODE: 409,
    HTTP_BAD_REQUEST: 400,
    HTTP_INTERNAL_SERVER_ERROR: 500
};
