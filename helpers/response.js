/**
 * Created by Tran Viet Thang on 10/22/2016.
 */

/**
 * Create a standard response
 * @param status true or false
 * @param data returned data
 * @param message message need to send to client
 * @returns {{status: *, data: *, message: *}}
 */
var createRes = function (status, data, message) {
    return {
        status: status,
        data: data,
        message: message
    }
};

module.exports.createRes = createRes;