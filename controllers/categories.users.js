var getModel = require('express-waterline').getModels;
var treeHelper = require('../helpers/tree');
var util = require('util');

exports.getView = function (type) {
    return function (req, res) {
        getModel(type).then(function (Field) {
            Field.find().exec(function (error, fields) {
                if (error) {
                    console.log(error);
                    req.flash('errorMessage', error.message);
                    return res.redirect('/categories/' + type + 's');
                }

                var sortedFields = treeHelper.sortNodeByLeft(fields);


                var filteredFields = sortedFields.filter(function (field) {
                    if (field.left == 1) {
                        return false;
                    } else {
                        return true;
                    }
                });

                var kHierarchy ="hierarchy";
                var kCategories = type + "s";
                console.log(kHierarchy);

                var data = {};
                data[kHierarchy] = treeHelper.createTree2(sortedFields);
                data[kCategories] = filteredFields;
                data['message'] =  req.flash('errorMessage');
                data['title'] = type+"s";
                data.req = req;

                return res.render('./search/categories.filter.ejs', data);

            })
        })
    }
};