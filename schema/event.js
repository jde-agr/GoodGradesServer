exports.eventTypeDefs = `

type Event {
    _id: ID
    tutor: String!
    students: [String]
    start_time: String!
    end_time: String!
    booked: Boolean!
}

extend type Query {
    getAllEvents(tutor: String, student: String, booked: Boolean) : [Event]
    getEvent(tutor: String, start_time: String): Event
}

extend type Mutation {
    createEvent(tutor: String!, start_time: String!, end_time: String!) : Event
    addStudentToEvent(tutor: String!, start_time: String!, student_id: String!) : Event
    updateEvent(tutor: String!, old_start_time: String!, new_start_time: String!, new_end_time: String!) : Event
    deleteEvent(tutor: String!, start_time: String!): Event
}
`