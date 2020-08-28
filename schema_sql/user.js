exports.userTypeDefs = `

type User {
    id: ID
    unique_id: String!
    username: String!
    type: String!
    room: Room
    events: [Event]
}

extend type Query {
    getAllUsers : [User]
    getUser(unique_id: String!): User
    getAllTutors(events: Boolean): [User]
}

extend type Mutation {
    createUser(unique_id: String!, username: String!, type: String!) : User
    deleteUser(unique_id: String!) : User
}
`