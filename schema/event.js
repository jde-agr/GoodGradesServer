exports.eventTypeDefs = `

type Event {
    _id: ID
    tutor: String!
    students: [String]
    start_time: String!
    duration: Int!
}

extend type Query {
    getAllEvents(tutor: String) : [Event]
    getEvent(tutor: String, start_time: String): Event
}

extend type Mutation {
    createEvent(tutor: String!, start_time: String!, duration: Int!) : Event
    addStudentToEvent(tutor: String!, start_time: String!, student_email: String!) : Event
    deleteEvent(tutor: String!, start_time: String!): Event
}
`