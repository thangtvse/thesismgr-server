/**
 * Send invitation mail
 * @param email
 * @param password
 * @param senderEmail
 * @param mailTransporter
 */
exports.sendMail = function (email, password, senderEmail, mailTransporter) {
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"ThesisMgr System 👥" <' + senderEmail + '>', // sender address
        to: email, // list of receivers
        subject: 'Invitation Mail', // Subject line
        text: 'email: ' + email + "\n" + "password: " + password // plaintext body
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
