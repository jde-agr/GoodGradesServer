const express = require('express');
router = express.Router();
const puppeteer = require('puppeteer');
const fetch = require('isomorphic-fetch');
const GRAPHQL_API = `${process.env.DOMAIN_URL}/graphql`;
const pgPool = require("../db").db

const default_fields = `
unique_id
username
type
`

/*
    GET request
    retrieves all users within the database
*/
router.get('/users', async (req, res) => {
    const objee = req.query;
    const fields = ((objee && objee.fields) ? objee.fields : default_fields)
    const query = `
        query {
            getAllUsers {
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
    res.send(ans.data.getAllUsers);
})

/*
    GET request
    retrieve a specific user
*/
router.get('/users/:unique_id', async (req, res) => {
    const objee = req.params;
    if (objee.unique_id) {
        const fields = ((objee && objee.fields) ? objee.fields : default_fields)
        const query = `
            query($unique_id: String!) {
                getUser(unique_id: $unique_id){
                    ${fields}
                }
            }`;
        const variables = `{ "unique_id" : "${objee.unique_id}" }`
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
        if (ans.data.getUser) {
            res.send(ans.data.getUser);
        } else {
            res.send({});
        }
    }
})

/*
    GET request
    retrieve a specific user's room details
*/
router.get('/users/:unique_id/room', async (req, res) => {
    const objee = req.params;
    if (objee.unique_id) {
        const fields = ((objee && objee.fields) ? objee.fields : default_fields)
        const query = `
            query($unique_id: String!) {
                getUser(unique_id: $unique_id){
                    ${fields}
                }
                getRoom(unique_id: $unique_id){
                    room_url
                    room_code
                }
            }`;
        const variables = `{ "unique_id" : "${objee.unique_id}" }`
        const ans = await fetch(`${GRAPHQL_API}`, {
            method: 'POST',
            body: JSON.stringify({
                query,
                variables
            }),
            headers: {
                'content-type': 'application/json'
            }
        }).then(async response => { return await response.json() }).then(async result => {
            let newObj = await result.data.getUser;
            if (result.data.getRoom) {
                newObj.room_url = await result.data.getRoom.room_url;
                newObj.room_code = await result.data.getRoom.room_code;
            }
            return await newObj;
        })
        if (ans) {
            res.send(ans);
        } else {
            res.send({});
        }
    }
})

/*
    GET request
    retrieve all users that are tutors
*/
router.get('/users/tutor/getAllTutors', async (req, res) => {
    const objee = req.query;
    const fields = ((objee && objee.fields) ? objee.fields : default_fields)
    const query = `
        query {
            getAllTutors {
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
    res.send(ans.data.getAllTutors);
})

/*
    GET request
    retrieve all users who are tutors and their corresponding events
*/
router.get('/users/tutor/getAllTutors/events', async (req, res) => {
    const objee = req.query;
    const fields = ((objee && objee.fields) ? objee.fields : default_fields)
    const query = `
        query {
            getAllTutors(events: true) {
                ${fields}
                events {
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
    res.send(ans.data.getAllTutors);
})

/*
    POST request
    create a user
*/
router.post('/users/createUser', async (req, res) => {
    const objee = req.body;
    if (objee.unique_id && objee.username && objee.type) {
        const existingID =  await pgPool.query(`
                SELECT * FROM "Users" WHERE "unique_id" = $1
            `,[objee.unique_id]).then(res => { return res.rows[0] })
        if (!existingID) {
            if (objee.type === "tutor") {
                let room_url = "";
                let room_code = "";
                (async () => {
                    const browser = await puppeteer.launch({
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                        ],
                    });
                    const page = await browser.newPage();
                    console.log(await browser.version());
                    await page.goto('https://room.sh/go', { waitUntil: 'networkidle0' });
                    room_url = await page.url();
                    room_code = room_url.split("/");
                    room_code = room_code[room_code.length - 1];
                    console.log(await room_url);
                    await browser.close();
                    const query = `
                        mutation($unique_id: String!, $username: String!, $type: String!, $room_url: String!, $room_code: String!) {
                            createUser(unique_id: $unique_id, username: $username, type: $type) {
                                unique_id
                                username
                                type
                            }
                            createRoom(unique_id: $unique_id, room_url: $room_url, room_code:$room_code) {
                                unique_id
                                room_url
                                room_code
                            }
                        }
                    `;
                    const variables = `{ "unique_id": "${objee.unique_id}", "username": "${objee.username}", "type": "${objee.type}", "room_url": "${room_url}", "room_code": "${room_code}" }`;
                    return (fetch(GRAPHQL_API, {
                        method: 'POST',
                        body: JSON.stringify({
                            query,
                            variables
                        }),
                        headers: {
                            'content-type': 'application/json'
                        }
                    }).then(async response => await response.json())).then(async result => {
                        let newObj = await result.data.createUser;
                        if (await result.data.createRoom) {
                            newObj.room_url = await result.data.createRoom.room_url;
                            newObj.room_code = await result.data.createRoom.room_code;
                            res.send(await newObj);
                        } else {
                            res.send({ message: "Failed to add Room" })
                        }
                    })
                })().catch((e) => { console.log(e) });
            } else {
                const query = `
                    mutation($unique_id: String!, $username: String!, $type: String!) {
                        createUser(unique_id: $unique_id, username: $username, type: $type) {
                            unique_id
                            username
                            type
                        }
                    }
                `;
                const variables = `{ "unique_id": "${objee.unique_id}", "username": "${objee.username}", "type": "${objee.type}" }`;
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
                    if (result.data.createUser) {
                        res.send(result.data.createUser)
                    } else {
                        res.send({ message: "Failed to add User" })
                    }
                })
            }
        } else {
            res.send({ message: "Failed to add User. Unique_id already exists." })
        }
    }
    else
        res.send({ message: "Failed to add User. Require unique_id, username and type." })
})

/*
    POST request
    delete a specific user
*/
router.post('/users/deleteUser/:unique_id', async (req, res) => {
    objee = req.params;
    if (objee.unique_id) {
        const existingID =  await pgPool.query(`
                SELECT * FROM "Users" WHERE "unique_id" = $1
            `,[objee.unique_id]).then(res => { return res.rows[0] })
        if (existingID) {
            const existingRoom = await pgPool.query(`
                SELECT * FROM "Rooms" WHERE "unique_id" = $1
            `, [ objee.unique_id ]).then(res => { return res.rows[0] })
            let query = `
                mutation($unique_id: String!) {
                    deleteUser(unique_id: $unique_id) {
                        unique_id
                        username
                        type
                    }
                }
            `;
            if (existingRoom) {
                query = `
                    mutation($unique_id: String!) {
                        deleteRoom(unique_id: $unique_id) {
                            unique_id
                            room_url
                            room_code
                        }
                        deleteUser(unique_id: $unique_id) {
                            unique_id
                            username
                            type
                        }
                    }
                `;
            }
            const variables = `{ "unique_id": "${objee.unique_id}" }`;
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
                if (result.data.deleteUser) {
                    if (result.data.deleteRoom) {
                        newObj = result.data.deleteUser;
                        newObj.room_url = result.data.deleteRoom.room_url;
                        newObj.room_code = result.data.deleteRoom.room_code;
                        res.send(newObj);
                    } else {
                        res.send(result.data.deleteUser);
                    }
                } else {
                    res.send({});
                } 
            })
        } else {
            res.send({});
        }
    } else {
        res.send({});
    }
})

module.exports = router;