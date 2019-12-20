exports.userTypeDefs = `

type User {
    _id: ID
    email: String!
    username: String!
    type: String!
    room: Room
}

extend type Query {
    getAllUsers : [User]
    getUser(email: String!): User
}

extend type Mutation {
    createUser(email: String!, username: String!, type: String!) : User
    deleteUser(email: String!) : User
}
`