const express = require('express');
router = express.Router();
const fetch = require('isomorphic-fetch');
const GRAPHQL_API = `${process.env.DOMAIN_URL}/graphql`;

const default_fields = `
student_id
student_username
tutor_id
tutor_username
createdAt
`

/*
    GET request
    retrieve all the quickhelps in the database
*/
router.get('/quickHelp', async (req, res) => {
    const objee = req.query;
    const fields = ((objee && objee.fields) ? objee.fields : default_fields)
    const query = `
        query {
            getAllQuickHelp {
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
    res.send(ans.data.getAllQuickHelp);
})

/*
    GET request
    retrieve all the booked quickhelps
*/
router.get('/quickHelp/booked', async (req, res) => {
    const objee = req.params;
    const fields = ((objee && objee.fields) ? objee.fields : default_fields)
    const query = `
        query {
            getAllQuickHelp(booked: true) {
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
    if (ans.data.getAllQuickHelp) {
        res.send(ans.data.getAllQuickHelp);
    } else {
        res.send([]);
    }
})

/*
    POST request
    create a quickhelp
*/
router.post('/quickHelp/createQuickHelp', async (req, res) => {
    const objee = req.body;
    if (objee.student_id) {
        const query = `
            mutation($student_id: String!) {
                createQuickHelp(student_id: $student_id) {
                  student_id
                  student_username
                  tutor_id
                  tutor_username
                  createdAt
                }
            }
        `;
        const variables = `{ "student_id": "${objee.student_id}" }`;
        return (fetch(GRAPHQL_API, {
            method: 'POST',
            body: JSON.stringify({
                query,
                variables
            }),
            headers: {
                'content-type': 'application/json'
            }
        }).then(response => response.json())).then(result => {
            if (result.data.createQuickHelp) {
                res.send(result.data.createQuickHelp);
            } else {
                res.send({});
            } 
        });
    }
    else
        res.send({ message: "Failed to create QuickHelp. Require student_id." })
})

/*
    POST request
    add a tutor to a specific quickhelp
*/
router.post('/quickHelp/addTutorToQuickHelp', async (req, res) => {
    const objee = req.body;
    if (objee.student_id && objee.tutor_id) {
        const query = `
            mutation($student_id: String!, $tutor_id: String!) {
                addTutorToQuickHelp(student_id: $student_id, tutor_id: $tutor_id) {
                  student_id
                  student_username
                  tutor_id
                  tutor_username
                  createdAt
                }
            }
        `;
        const variables = `{ "student_id": "${objee.student_id}", "tutor_id": "${objee.tutor_id}" }`;
        return (fetch(GRAPHQL_API, {
            method: 'POST',
            body: JSON.stringify({
                query,
                variables
            }),
            headers: {
                'content-type': 'application/json'
            }
        }).then(response => response.json())).then(result => {
            if (result.data.addTutorToQuickHelp) {
                res.send(result.data.addTutorToQuickHelp);
            } else {
                res.send({});
            } 
        });
    }
    else
        res.send({ message: "Failed to add tutor to QuickHelp. Require student_id and tutor_id." })
})

/*
    POST request
    delete a specific quickhelp
*/
router.post('/quickHelp/deleteQuickHelp', async (req, res) => {
    const objee = req.body;
    if (objee.student_id) {
        const query = `
            mutation($student_id: String!) {
                deleteQuickHelp(student_id: $student_id) {
                  student_id
                  student_username
                  tutor_id
                  tutor_username
                  createdAt
                }
            }
        `;
        const variables = `{ "student_id": "${objee.student_id}" }`;
        return (fetch(GRAPHQL_API, {
            method: 'POST',
            body: JSON.stringify({
                query,
                variables
            }),
            headers: {
                'content-type': 'application/json'
            }
        }).then(response => response.json())).then(result => {
            if (result.data.deleteQuickHelp) {
                res.send(result.data.deleteQuickHelp);
            } else {
                res.send({});
            } 
        });
    }
    else
        res.send({ message: "Failed to delete QuickHelp. Require student_id." })
})

module.exports = router;