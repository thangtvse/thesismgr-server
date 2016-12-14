/*
 * Project: ThesisMgr-Server
 * File: config\mail.js
 */

module.exports = {
    transportConfig: {
        pool: true,
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'uendno@gmail.com',
            pass: 'headofdead'
        }
    }
};