var getModel = require('express-waterline').getModels;
var beforeCreateANode = require('../helpers/tree').beforeCreateANode;
var treeHelper = require('../helpers/tree');
var util = require('util');

module.exports = {
    identity: 'unit',
    connection: 'default',
    autoPK: true,
    autoCreatedAt: true,
    attributes: {
        name: {
            type: 'string',
            required: true
        },

        parent: {
            model: 'unit'
        },

        left: {
            type: 'integer',
        },

        right: {
            type: 'integer',
        },

        users: {
            collection: 'user',
            via: 'unit'
        },

        type: {
            type: 'string',
            in: ['faculty', 'laboratory', 'department', 'class', 'root'],
            required: true
        }
    },
    beforeCreate: function (values, next) {
        getModel('unit').then(function (Unit) {
            beforeCreateANode(Unit, values, next);
        })
    },

    /**
     * Get faculty of an unit
     * @param unit
     * @param next
     */
    getFacultyOfUnit: function (unit, next) {

        if (unit == null) {
            return next(new Error('Null unit.'));
        }

        if (unit.type == 'faculty') {
            return next(null, unit);
        }

        treeHelper.findAncestorsAndDescendantsForUnit(unit, function (error, ancestors, descendants) {

            console.log("ANCESTORS: " + util.inspect(ancestors));

            if (error) {
                return next(error);
            }

            ancestors.forEach(function (ancestor) {
                if (ancestor.type == 'faculty') {
                    return next(null, ancestor);
                }
            });
        })
    },


    /**
     * Get faculty of an unit ID
     * @param unitID
     * @param next
     */
    getFacultyOfUnitID: function (unitID, next) {

        getModel('unit').then(function (Unit) {
            Unit.findOne({
                id: unitID
            }).exec(function (error, unit) {

                if (error) {
                    console.log(error);
                    return next(error);
                }

               return Unit.getFacultyOfUnit(unit, next);
            })
        });


    }
};