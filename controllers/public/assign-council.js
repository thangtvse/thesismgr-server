var docGenHelper = require('../../helpers/gendoc');


exports.assginThesis = function (req,res) {
     docGenHelper.genAssginThesis(req,function (error,buffer) {
        if (error) {
            return res.status(400).send(createResponse(false, null, error.message));
        }

        res.writeHead(200, {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Length': buffer.byteLength
        });
        res.write(buffer);
        res.end();
    })
};