const express = require('express');
router = express.Router();
const puppeteer = require('puppeteer');
const fetch = require('isomorphic-fetch');
const GRAPHQL_API = "http://localhost:5000/graphql";
const User = require('../models/User');
const Room = require('../models/Room');

const default_fields = `
email
username
type
`

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

router.get('/users/:email', async (req, res) => {
    const objee = req.params;
    if (objee.email) {
        const fields = ((objee && objee.fields) ? objee.fields : default_fields)
        const query = `
            query($email: String!) {
                getUser(email: $email){
                    ${fields}
                }
            }`;
        const variables = `{ "email" : "${objee.email}" }`
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

router.get('/users/:email/room', async (req, res) => {
    const objee = req.params;
    if (objee.email) {
        const fields = ((objee && objee.fields) ? objee.fields : default_fields)
        const query = `
            query($email: String!) {
                getUser(email: $email){
                    ${fields}
                }
                getRoom(email: $email){
                    room_url
                    room_code
                }
            }`;
        const variables = `{ "email" : "${objee.email}" }`
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
            // console.log(result)
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

router.post('/users/createUser', async (req, res) => {
    const objee = req.body;
    if (objee.email && objee.username && objee.type) {
        let existingEmail = await User.findOne({ email: `${objee.email}` })
        console.log(existingEmail)
        if (!existingEmail) {
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
                        mutation($email: String!, $username: String!, $type: String!, $room_url: String!, $room_code: String!) {
                            createUser(email: $email, username: $username, type: $type) {
                                email
                                username
                                type
                            }
                            createRoom(email: $email, room_url: $room_url, room_code:$room_code) {
                                email
                                room_url
                                room_code
                            }
                        }
                    `;
                    const variables = `{ "email": "${objee.email}", "username": "${objee.username}", "type": "${objee.type}", "room_url": "${room_url}", "room_code": "${room_code}" }`;
                    // console.log(variables)
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
                        // console.log(result);
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
                    mutation($email: String!, $username: String!, $type: String!) {
                        createUser(email: $email, username: $username, type: $type) {
                            email
                            username
                            type
                        }
                    }
                `;
                const variables = `{ "email": "${objee.email}", "username": "${objee.username}", "type": "${objee.type}" }`;
                // console.log(variables)
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
                    // console.log(result)
                    if (result.data.createUser) {
                        res.send(result.data.createUser)
                    } else {
                        res.send({ message: "Failed to add User" })
                    }
                })
            }
        } else {
            res.send({ message: "Failed to add User. Email already exists." })
        }
    }
    else
        res.send({ message: "Failed to add User. Require email, username and type." })
})

router.post('/users/deleteUser/:email', async (req, res) => {
    objee = req.params;
    if (objee.email) {
        let existingEmail = await User.findOne({ email: `${objee.email}` })
        console.log(existingEmail)
        if (existingEmail) {
            let existingRoom = await Room.findOne({ email: `${objee.email}` })
            console.log(existingRoom)
            let query = `
                mutation($email: String!) {
                    deleteUser(email: $email) {
                        email
                        username
                        type
                    }
                }
            `;
            if (existingRoom) {
                query = `
                    mutation($email: String!) {
                        deleteRoom(email: $email) {
                            email
                            room_url
                            room_code
                        }
                        deleteUser(email: $email) {
                            email
                            username
                            type
                        }
                    }
                `;
            }
            const variables = `{ "email": "${objee.email}" }`;
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
                // console.log(result)
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