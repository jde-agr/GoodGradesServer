exports.roomTypeDefs = `

type Room {
    id: ID
    unique_id: String!
    room_url: String!
    room_code: String!
}

type Query {
    getAllRooms : [Room]
    getRoom(unique_id: String!): Room
}

type Mutation {
    createRoom(unique_id: String!, room_url: String!, room_code: String!) : Room
    deleteRoom(unique_id: String!): Room
}
`