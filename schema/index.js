const { makeExecutableSchema } = require('graphql-tools');

const { roomTypeDefs } = require('./room');
const { roomResolvers } = require('../resolvers/room');

exports.schema = makeExecutableSchema({
    typeDefs: [roomTypeDefs],
    resolvers: [roomResolvers]
});