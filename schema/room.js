exports.roomTypeDefs = `

type Room {
    _id: ID
    email: String!
    room_url: String!
    room_code: String!
}

type Query {
    getAllRooms : [Room]
    getRoom(email: String!): Room
}

type Mutation {
    createRoom(email: String!, room_url: String!, room_code: String!) : Room
}
`