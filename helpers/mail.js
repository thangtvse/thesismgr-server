var jwt = require('jsonwebtoken');
var hostConfig = require('../config/host');

/**
 * Send invitation mail
 * @param email
 * @param password
 * @param officerNumber
 * @param senderEmail
 * @param mailTransporter
 */
exports.sendMail = function (email, password, officerNumber, senderEmail, mailTransporter) {
    // setup e-mail data with unicode symbols

    var token = jwt.sign({
        data: {
            officerNumber: officerNumber,
            password: password
        }
    }, require('../config/auth').jwtSecret, {
        expiresIn: '7d'
    });

    var mailOptions = {
        from: '"ThesisMgr System 👥" <' + senderEmail + '>', // sender address
        to: email, // list of receivers
        subject: 'Invitation Mail', // Subject line
        text: hostConfig.domain + ":" + hostConfig.port + "/change-password-first-time" + "?token=" + token // plaintext body
        //  html: '<b>Hello world 🐴</b>' // html body
    };

    console.log("sending mail to " + email);
    // send mail with defined transport object
    mailTransporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(util.inspect(error, false, 2, true));
        }

        console.log(util.inspect(info, false, 2, true));
    });
};
