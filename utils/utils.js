/**
 * To get query params as object
 * @param {Object} req - reqParams
 */
exports.getQueryParams = function(req) {
    console.log('[utils] [getQueryParams] To get all the Query parameters of the Request Object');
    var queryParams = {};
    for (var field in req.query) {
        if (req.query.hasOwnProperty(field)) {
            queryParams[field] = req.query[field];
        }
    }
    return queryParams;
}

/**
 * To get path params as object
 * @param {Object} req - reqParams
 */
exports.getPathParams = function(req) {
    console.log('[utils] [getPathParams] To get all the Path parameters of the Request Object');
    var params = {};
    for (var field in req.params) {
        if (req.params.hasOwnProperty(field)) {
            params[field] = req.params[field];
        }
    }
    return params;
}