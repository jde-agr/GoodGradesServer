const express = require('express');
router = express.Router();
const puppeteer = require('puppeteer');

router.get('/rooms', (req, res) => {
    var room_name = "";
    var room_code = "";
    (async() => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        console.log(await browser.version());
        await page.goto('https://room.sh/go', {waitUntil: 'networkidle0'});
        room_name = await page.url();
        room_code = room_name.split("/");
        room_code = room_code[room_code.length-1];
        console.log(await room_name);
        await browser.close();
        await res.send({"room_url": `${room_name}`, "room_code": `${room_code}`})
    })().catch((e)=>{console.log(e)});
})

module.exports = router;