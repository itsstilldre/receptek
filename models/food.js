var Waterline = require('waterline');

module.exports = Waterline.Collection.extend({
    identity: 'food',
    connection: 'disk',
    attributes: {
        name: {
            type: 'string',
            required: true
        },
        idotartam: {
            type: 'string'
        },
        leiras: {
            type: 'string'
        },
        user: {
            model: 'user'
        }
    }
});