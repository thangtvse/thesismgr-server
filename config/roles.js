/*
 * Project: ThesisMgr-Server
 * File: config\role.js
 */

module.exports = {
    admin: ['admin'],
    moderator: ['admin', 'moderator'],
    public: ['lecturer', 'student'],
    lecturer: ['lecturer', 'moderator'],
    student: ['student']
};