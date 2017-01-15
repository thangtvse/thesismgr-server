var getModel = require('express-waterline').getModels;
var beforeCreateANode = require('../helpers/tree').beforeCreateANode;
var treeHelper = require('../helpers/tree');
var util = require('util');
var slug = require('vietnamese-slug');

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

        slugName: {
            type: 'string',
            unique: true
        },

        urlName: {
            type: 'string',
            unique: true
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
            beforeCreateANode(Unit, values, function (error) {
                if (values.name) {
                    values.slugName = slug(values.name, ' ');
                    values.urlName = slug(values.name, '-');
                }
                next(error);
            });
        })
    },

    beforeUpdate: function (values, next) {

        if (values.name) {
            values.slugName = slug(values.name, ' ');
            values.urlName = slug(values.name, '-');
        }
        next();

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

            if (ancestors == null || ancestors.length == 0) {
                return next(null, unit);
            }

            if (error) {
                return next(error);
            }

            ancestors.forEach(function (ancestor) {
                if (ancestor.type == 'faculty') {
                    return next(null, ancestor);
                }
            });
        })
    }
    ,


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
    ,

    /**
     * Get all units of a faculty
     * @param facultyID
     * @param next
     */
    getAllFaculties: function (next) {
        getModel('unit').then(function (Unit) {
            Unit.find({
                type: 'faculty'
            }).exec(function (error, units) {
                if (error) {
                    return next(error);
                }

                var filteredUnits = units.filter(function (unit) {
                    if (unit.left == 1) {
                        return false
                    } else {
                        return true
                    }
                });

                return next(null, filteredUnits);
            })
        });
    },

    getAllUnits: function (next) {
        getModel('unit').then(function (Unit) {
            Unit.find().exec(function (error, units) {
                if (error) {
                    return next(error);
                }

                var filteredUnits = units.filter(function (unit) {
                    if (unit.left == 1) {
                        return false
                    } else {
                        return true
                    }
                });

                return next(null, filteredUnits);
            })
        })
    }
}
;