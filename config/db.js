/**
 * Created by Tran Viet Thang on 10/22/2016.
 */
var mongoAdapter = require('sails-mongo');
var path = require('path');
var mysqlAdapter = require('sails-mysql');
// module.exports = {
//     dbURI: "mongodb://localhost:27017/thesis_mgr",
//     root_username: "admin@gmail.com",
//     root_password: "nopassword"
// };

console.log(path.join(process.cwd(), 'models'));

module.exports = {
    dir: path.join(process.cwd(), 'models'),
    adapters: {
        mongo: mongoAdapter,
        mysql: mysqlAdapter
    },
    connections: {
        // default: {
        //     adapter: 'mongo',
        //     host: 'localhost',
        //     port: 27017,
        //     database: 'thesis-mgr'
        // }
        default: {
            adapter: 'mysql',
            host: 'localhost',
            database: 'thesis-mgr',
            port: 3306,
            user: 'root'
        }
    }
};