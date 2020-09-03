const express = require('express');
router = express.Router();
const fetch = require('isomorphic-fetch');
const GRAPHQL_API = `${process.env.DOMAIN_URL}/graphql`;
const pgPool = require("../db").db

const default_fields = `
tutor
tutor_username
room_code
students {
    unique_id
    username
}
start_time
end_time
booked
`

/*  
    GET request
    retrieve all events in the database 
*/
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

/*
    GET request
    retrieve all available events
*/
router.get('/events/available', async (req, res) => {
    const objee = req.query;
    const fields = ((objee && objee.fields) ? objee.fields : default_fields)
    const query = `
        query {
            getAllEvents(booked: false) {
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

/*
    GET request
    retrieve all the events belonging to a specific tutor
*/
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

/*
    GET request
    retrieve all the booked events belonging to a specific tutor
*/
router.get('/events/byTutor/:tutor/booked', async (req, res) => {
    const objee = req.params;
    if (objee.tutor) {
        const fields = ((objee && objee.fields) ? objee.fields : default_fields)
        const query = `
            query($tutor: String!) {
                getAllEvents(tutor: $tutor, booked: true){
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

/*
    GET request
    retrieve all the available events belonging to a specific tutor
*/
router.get('/events/byTutor/:tutor/available', async (req, res) => {
    const objee = req.params;
    if (objee.tutor) {
        const fields = ((objee && objee.fields) ? objee.fields : default_fields)
        const query = `
            query($tutor: String!) {
                getAllEvents(tutor: $tutor, booked: false){
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

/*
    GET request
    retrieve all the events booked by a specific student
*/
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

/*
    POST request
    create an event
*/
router.post('/events/createEvent', async (req, res) => {
    const objee = req.body;
    const existingID =  await pgPool.query(`
            SELECT * FROM "Users" WHERE "unique_id" = $1
        `,[objee.tutor]).then(res => { return res.rows[0] })
    if (existingID.type == "tutor") {
        if (objee.tutor && objee.start_time && objee.end_time) {
            const query = `
            mutation($tutor: String!, $start_time: String!, $end_time: String!) {
                createEvent(tutor: $tutor, start_time: $start_time, end_time: $end_time) {
                  tutor
                  tutor_username
                  room_code
                  students {
                      unique_id
                      username
                  }
                  start_time
                  end_time
                  booked
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
    }
    else
        res.send({ message: "Failed to add Event. User is not of type tutor." })
})

/*
    POST request
    add a student to a specific event
*/
router.post('/events/addStudentToEvent', async (req, res) => {
    const objee = req.body;
    if (objee.tutor && objee.start_time && objee.student_id) {
        const query = `
        mutation($tutor: String!, $start_time: String!, $student_id: String!) {
            addStudentToEvent(tutor: $tutor, start_time: $start_time, student_id: $student_id) {
              tutor
              tutor_username
              room_code
              students {
                  unique_id
                  username
              }
              start_time
              end_time
              booked
            }
        }
        `;
        const variables = `{ "tutor": "${objee.tutor}", "start_time": "${objee.start_time}", "student_id": "${objee.student_id}" }`;
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
        res.send({ message: "Failed to add Student to Event. Require tutor, start_time and student_id." })
})

/*
    POST request
    update the times for a specific event
*/
router.post('/events/updateEvent', async (req, res) => {
    const objee = req.body;
    if (objee.tutor && objee.old_start_time && objee.new_start_time && objee.new_end_time) {
        const query = `
        mutation($tutor: String!, $old_start_time: String!, $new_start_time: String!, $new_end_time: String!) {
            updateEvent(tutor: $tutor, old_start_time: $old_start_time, new_start_time: $new_start_time, new_end_time: $new_end_time) {
              tutor
              tutor_username
              room_code
              students {
                  unique_id
                  username
              }
              start_time
              end_time
              booked
            }
        }
        `;
        const variables = `{ "tutor": "${objee.tutor}", "old_start_time": "${objee.old_start_time}", "new_start_time": "${objee.new_start_time}", "new_end_time": "${objee.new_end_time}" }`;
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
        if (ans.data.updateEvent) {
            res.send(ans.data.updateEvent);
        } else {
            res.send({ message: "Failed to update Event" })
        }
    }
    else
        res.send({ message: "Failed to update Event. Require tutor, old_start_time, new_start_time and new_end_time." })
})

/*
    POST request
    delete a specific event
*/
router.post('/events/deleteEvent', async (req, res) => {
    const objee = req.body;
    if (objee.tutor && objee.start_time) {
        const query = `
        mutation($tutor: String!, $start_time: String!) {
            deleteEvent(tutor: $tutor, start_time: $start_time) {
              tutor
              tutor_username
              room_code
              students {
                  unique_id
                  username
              }
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