/**
 * Created by Tran Viet Thang on 10/22/2016.
 */
var mongoAdapter = require('sails-mongo');
var path = require('path');

// module.exports = {
//     dbURI: "mongodb://localhost:27017/thesis_mgr",
//     root_username: "admin@gmail.com",
//     root_password: "nopassword"
// };

console.log(path.join(process.cwd(), 'models'));

module.exports = {
    dir: path.join(process.cwd(), 'models'),
    adapters: {
        mongo: mongoAdapter
    },
    connections: {
        mongo: {
            adapter: 'mongo',
            host: 'localhost',
            port: 27017,
            database: 'thesis-mgr'
        }
    }
};