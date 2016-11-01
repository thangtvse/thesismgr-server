/*
 * Project: ThesisMgr-Server
 * File: models\ThesisField.js
 */

var mongoose = require('mongoose');
var NestedSetPlugin = require('mongoose-nested-set')
var Schema = mongoose.Schema;

var fieldSchema = new Schema({
    name: { type: String },
});

// indexes
fieldSchema.index({
    name: 'text'
});

// Include plugin 
fieldSchema.plugin(NestedSetPlugin);

var Field = mongoose.model('field', fieldSchema);

module.exports = Field;
