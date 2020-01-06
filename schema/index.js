const { makeExecutableSchema } = require('graphql-tools');

const { roomTypeDefs } = require('./room');
const { roomResolvers } = require('../resolvers/room');
const { userTypeDefs } = require('./user');
const { userResolvers } = require('../resolvers/user');
const { eventTypeDefs } = require('./event');
const { eventResolvers } = require('../resolvers/event');

exports.schema = makeExecutableSchema({
    typeDefs: [roomTypeDefs, userTypeDefs, eventTypeDefs],
    resolvers: [roomResolvers, userResolvers, eventResolvers]
});