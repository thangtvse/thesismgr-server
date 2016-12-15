var _ = require('underscore');

module.exports = {
    compactObject : function(o) {
        var clone = _.clone(o);
        _.each(clone, function(v, k) {
            if(!v) {
                delete clone[k];
            }
        });
        return clone;
    }
};