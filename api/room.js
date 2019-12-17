const express = require('express');
router = express.Router();
const puppeteer = require('puppeteer');
const fetch = require('isomorphic-fetch')
const GRAPHQL_API = `http://localhost:5000/graphql`;
const Room = require('../models/Room');

const default_fields = `
email
room_url
room_code
`

router.get('/rooms', async (req, res) => {
    const objee = req.query;
    const fields = ((objee && objee.fields) ? objee.fields : default_fields)
    const query = `
        query {
            getAllRooms {
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
    res.send(ans.data.getAllRooms);
})

router.get('/rooms/:email', async (req, res) => {
    const objee = req.params;
    if (objee.email) {
        const fields = ((objee && objee.fields) ? objee.fields : default_fields)
        const query = `
            query($email: String!) {
                getRoom(email: $email){
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
        if (ans.data.getRoom) {
            res.send(ans.data.getRoom);
        } else {
            res.send({});
        }
    }
})

router.post('/rooms/createRoom', async (req, res) => {
    const objee = req.body;
    if (objee.email) {
        let existingEmail = await Room.findOne({ email: `${objee.email}` })
        console.log(existingEmail)
        if (!existingEmail) {
            var room_url = "";
            var room_code = "";
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
                    mutation($email: String!, $room_url: String!, $room_code: String!) {
                        createRoom(email: $email, room_url: $room_url, room_code:$room_code) {
                        email
                        room_url
                        room_code
                        }
                    }
                `;
                const variables = `{ "email": "${objee.email}", "room_url": "${room_url}", "room_code": "${room_code}" }`;
                console.log(variables)
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
                    console.log(result)
                    if (result.data.createRoom) {
                        res.send(result.data.createRoom)
                    } else {
                        res.send({ message: "Failed to add Room" })
                    }
                })
                // await res.send({ "room_url": `${room_name}`, "room_code": `${room_code}` })
            })().catch((e) => { console.log(e) });
        } else {
            res.send({ message: "Failed to add Room. Email already exists." })
        }
    }
    else
        res.send({ message: "Failed to add Room" })
})

module.exports = router;