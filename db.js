require('dotenv').config();

if (process.env.IS_SQL === "true") {
    console.log("YE")
    const pg = require('pg')
    const db = new pg.Pool({ 
        host : 'localhost',
        user : 'good_grades_user',
        database : 'good_grades',
        password : 'p@ssword1',
        port : 5432
    })

    db.query(`
        CREATE TABLE IF NOT EXISTS "Users" 
        ("id" SERIAL, "unique_id" VARCHAR(255) NOT NULL PRIMARY KEY, 
        "username" VARCHAR(255) NOT NULL, 
        "type" VARCHAR(255) NOT NULL);

        CREATE TABLE IF NOT EXISTS "Rooms" 
        ("id" SERIAL, "unique_id" VARCHAR(255) NOT NULL PRIMARY KEY, 
        "room_url" VARCHAR(255) NOT NULL, 
        "room_code" VARCHAR(255) NOT NULL);

        CREATE TABLE IF NOT EXISTS "QuickHelps" 
        ("id" SERIAL, "student_id" VARCHAR(255) NOT NULL PRIMARY KEY, 
        "tutor_id" VARCHAR(255), 
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL);

        CREATE TABLE IF NOT EXISTS "Events" 
        ("id" SERIAL, "tutor" VARCHAR(255) NOT NULL, 
        "tutor_username" VARCHAR(255) NOT NULL, 
        "room_code" VARCHAR(255) NOT NULL, 
        "students" jsonb, 
        "start_time" VARCHAR(255) NOT NULL, 
        "end_time" VARCHAR(255) NOT NULL, 
        "booked" BOOLEAN NOT NULL, 
        "expireAt" TIMESTAMP WITH TIME ZONE NOT NULL, 
        PRIMARY KEY ("tutor", "start_time"));
    `)

    const { schema } = require('./schema_sql/index');

    module.exports = {
        db, schema
    }

} else {
    console.log("NO")
    const mongoose = require('mongoose');

    const db = mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URI}/room-gen?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }).then(conn => {
        if (conn)
            console.log('Connected to Database');
    }).catch(error => {
        console.log('ERROR: ', error.message || error);
    });

    const Room = require('./models/Room');
    const User = require('./models/User');
    const Event = require('./models/Event');
    const QuickHelp = require('./models/QuickHelp');

    const { schema } = require('./schema/index');

    module.exports = {
        db, Room, User, Event, QuickHelp, schema
    };
}