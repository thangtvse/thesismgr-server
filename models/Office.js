/*
 * Project: ThesisMgr-Server
 * File: models\Office.js
 */

var mongoose = require('mongoose');
var NestedSetPlugin = require('mongoose-nested-set')
var Schema = mongoose.Schema;

var officeSchema = new Schema({
    name: { type: String },
});

// indexes
officeSchema.index({
    name: 'text'
});

// Include plugin 
officeSchema.plugin(NestedSetPlugin);

var Office = mongoose.model('office', officeSchema);

module.exports = Office;
