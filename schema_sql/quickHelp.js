exports.quickHelpTypeDefs = `

type QuickHelp {
    id: ID
    student_id: String!
    student_username: String
    tutor_id: String!
    tutor_username: String
    createdAt: String!
}

extend type Query {
    getAllQuickHelp(student_id: String, tutor_id: String, booked: Boolean) : [QuickHelp]
}

extend type Mutation {
    createQuickHelp(student_id: String!) : QuickHelp
    addTutorToQuickHelp(student_id: String!, tutor_id: String!) : QuickHelp
    deleteQuickHelp(student_id: String!): QuickHelp
}
`