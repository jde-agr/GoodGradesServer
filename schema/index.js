const { makeExecutableSchema } = require('graphql-tools');

const { roomTypeDefs } = require('./room');
const { roomResolvers } = require('../resolvers/room');
const { userTypeDefs } = require('./user');
const { userResolvers } = require('../resolvers/user');

exports.schema = makeExecutableSchema({
    typeDefs: [roomTypeDefs, userTypeDefs],
    resolvers: [roomResolvers, userResolvers]
});