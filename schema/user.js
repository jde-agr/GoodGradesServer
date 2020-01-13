exports.userTypeDefs = `

type User {
    _id: ID
    unique_id: String!
    username: String!
    type: String!
    room: Room
}

extend type Query {
    getAllUsers : [User]
    getUser(unique_id: String!): User
    getAllTutors: [User]
}

extend type Mutation {
    createUser(unique_id: String!, username: String!, type: String!) : User
    deleteUser(unique_id: String!) : User
}
`