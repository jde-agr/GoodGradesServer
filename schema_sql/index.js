const { makeExecutableSchema } = require('graphql-tools');

const { roomTypeDefs } = require('./room');
const { roomResolvers } = require('../resolvers_sql/room');
const { userTypeDefs } = require('./user');
const { userResolvers } = require('../resolvers_sql/user');
const { eventTypeDefs } = require('./event');
const { eventResolvers } = require('../resolvers_sql/event');
const { quickHelpTypeDefs } = require('./quickHelp');
const { quickHelpResolvers } = require('../resolvers_sql/quickHelp');

exports.schema = makeExecutableSchema({
    typeDefs: [roomTypeDefs, userTypeDefs, eventTypeDefs, quickHelpTypeDefs],
    resolvers: [roomResolvers, userResolvers, eventResolvers, quickHelpResolvers]
});