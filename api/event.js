const express = require('express');
router = express.Router();
const fetch = require('isomorphic-fetch');
const GRAPHQL_API = "http://localhost:5000/graphql";

const default_fields = `
tutor
students
start_time
end_time
`

router.get('/events', async (req, res) => {
    const objee = req.query;
    const fields = ((objee && objee.fields) ? objee.fields : default_fields)
    const query = `
        query {
            getAllEvents {
                ${fields}
            }
        }`;
    const ans = await fetch(`${GRAPHQL_API}`, {
        method: 'POST',
        body: JSON.stringify({
            query
        }),
        headers: {
            'content-type': 'application/json'
        }
    }).then(async response => { return await response.json() })
    res.send(ans.data.getAllEvents);
})

router.get('/events/byTutor/:tutor', async (req, res) => {
    const objee = req.params;
    if (objee.tutor) {
        const fields = ((objee && objee.fields) ? objee.fields : default_fields)
        const query = `
            query($tutor: String!) {
                getAllEvents(tutor: $tutor){
                    ${fields}
                }
            }`;
        const variables = `{ "tutor" : "${objee.tutor}" }`
        const ans = await fetch(`${GRAPHQL_API}`, {
            method: 'POST',
            body: JSON.stringify({
                query,
                variables
            }),
            headers: {
                'content-type': 'application/json'
            }
        }).then(async response => { return await response.json() })
        if (ans.data.getAllEvents) {
            res.send(ans.data.getAllEvents);
        } else {
            res.send([]);
        }
    }
})

router.get('/events/byStudent/:student', async (req, res) => {
    const objee = req.params;
    if (objee.student) {
        const fields = ((objee && objee.fields) ? objee.fields : default_fields)
        const query = `
            query($student: String!) {
                getAllEvents(student: $student){
                    ${fields}
                }
            }`;
        const variables = `{ "student" : "${objee.student}" }`
        const ans = await fetch(`${GRAPHQL_API}`, {
            method: 'POST',
            body: JSON.stringify({
                query,
                variables
            }),
            headers: {
                'content-type': 'application/json'
            }
        }).then(async response => { return await response.json() })
        if (ans.data.getAllEvents) {
            res.send(ans.data.getAllEvents);
        } else {
            res.send([]);
        }
    }
})

router.post('/events/createEvent', async (req, res) => {
    const objee = req.body;
    if (objee.tutor && objee.start_time && objee.end_time) {
        const query = `
        mutation($tutor: String!, $start_time: String!, $end_time: String!) {
            createEvent(tutor: $tutor, start_time: $start_time, end_time: $end_time) {
              tutor
              students
              start_time
              end_time
            }
        }
        `;
        const variables = `{ "tutor": "${objee.tutor}", "start_time": "${objee.start_time}", "end_time": "${objee.end_time}" }`;
        const ans = await fetch(GRAPHQL_API, {
            method: 'POST',
            body: JSON.stringify({
                query,
                variables
            }),
            headers: {
                'content-type': 'application/json'
            }
        }).then(response => response.json())
        if (ans.data.createEvent) {
            res.send(ans.data.createEvent);
        } else {
            res.send({ message: "Failed to add Event" })
        }
    }
    else
        res.send({ message: "Failed to add Event. Require tutor, start_time and end_time." })
})

router.post('/events/addStudentToEvent', async (req, res) => {
    const objee = req.body;
    if (objee.tutor && objee.start_time && objee.student_email) {
        const query = `
        mutation($tutor: String!, $start_time: String!, $student_email: String!) {
            addStudentToEvent(tutor: $tutor, start_time: $start_time, student_email: $student_email) {
              tutor
              students
              start_time
              end_time
            }
        }
        `;
        const variables = `{ "tutor": "${objee.tutor}", "start_time": "${objee.start_time}", "student_email": "${objee.student_email}" }`;
        const ans = await fetch(GRAPHQL_API, {
            method: 'POST',
            body: JSON.stringify({
                query,
                variables
            }),
            headers: {
                'content-type': 'application/json'
            }
        }).then(response => response.json())
        if (ans.data.addStudentToEvent) {
            res.send(ans.data.addStudentToEvent);
        } else {
            res.send({ message: "Failed to add Student to Event" })
        }
    }
    else
        res.send({ message: "Failed to add Event. Require tutor, start_time and student_email." })
})

router.post('/events/deleteEvent', async (req, res) => {
    const objee = req.body;
    if (objee.tutor && objee.start_time) {
        const query = `
        mutation($tutor: String!, $start_time: String!) {
            deleteEvent(tutor: $tutor, start_time: $start_time) {
              tutor
              students
              start_time
              end_time
            }
        }
        `;
        const variables = `{ "tutor": "${objee.tutor}", "start_time": "${objee.start_time}", "student_email": "${objee.student_email}" }`;
        const ans = await fetch(GRAPHQL_API, {
            method: 'POST',
            body: JSON.stringify({
                query,
                variables
            }),
            headers: {
                'content-type': 'application/json'
            }
        }).then(response => response.json())
        if (ans.data.deleteEvent) {
            res.send(ans.data.deleteEvent);
        } else {
            res.send({ message: "Failed to delete Event" })
        }
    }
    else
        res.send({ message: "Failed to add Event. Require tutor and start_time." })
})

module.exports = router;