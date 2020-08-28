exports.eventResolvers = {
    Query: {
        getAllEvents: async (root, args, { pgPool }) => {
            let query = ""
            args.tutor ? query += `"tutor" = '${ args.tutor}' ` : 0;
            args.student ? query ? query += `AND "students" -> 'unique_id' = '${args.student}' ` : query += `students -> 'unique_id' = '${args.student}' ` : 0;
            (args.booked == true) ? 
            (query ? query += `AND "booked" = 'true' ` : query += `"booked" = 'true' `) : 
            (args.booked == false) ? (query ? query += `AND "booked" = 'false' ` : query += `"booked" = 'false' `): 0;
            query = query ? "WHERE " + query + " " : query
            const allEvents = await pgPool.query(`
                SELECT * FROM "Events" ${query}ORDER BY "tutor" ASC, "start_time" ASC`
            ).then(res => { return res.rows })
            return allEvents;
        },
        getEvent: async (root, { tutor, start_time }, { pgPool }) => {
            const event = await pgPool.query(`
                SELECT * FROM "Events" WHERE "tutor" = $1 AND "start_time" = $2
            `, [ tutor, start_time ]).then(res => { return res.rows[0] })
            return await event;
        }
    },
    Mutation: {
        createEvent: async (root, { tutor, start_time, end_time }, { pgPool }) => {
            const tutorDetails =  await pgPool.query(`
                SELECT * FROM "Users" WHERE "unique_id" = $1
            `,[tutor]).then(res => { return res.rows[0] })
            const roomDetails =  await pgPool.query(`
                SELECT * FROM "Rooms" WHERE "unique_id" = $1
            `,[tutor]).then(res => { return res.rows[0] })
            if (tutorDetails && roomDetails) {
                const newEvent = await pgPool.query(`
                    INSERT INTO "Events" ("tutor", "tutor_username", "room_code", "students",
                    "start_time", "end_time", "booked", "expireAt")
                    VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
                `, [ tutor, tutorDetails.username, roomDetails.room_code,
                    JSON.stringify([]), start_time, end_time, false, new Date(end_time) ]).then(res => { return res.rows[0] })
                return newEvent;
            }
            return null;
        },
        addStudentToEvent: async (root, { tutor, start_time, student_id }, { pgPool }) => {
            let event =  await pgPool.query(`
                SELECT * FROM "Events" WHERE "tutor" = $1 AND "start_time" = $2
            `,[tutor, start_time]).then(res => { return res.rows[0] })
            let student =  await pgPool.query(`
                SELECT * FROM "Users" WHERE "unique_id" = $1
            `,[student_id]).then(res => { return res.rows[0] })
            if (event && student) {
                console.log(event)
                let newObj = await {...event}
                if (!newObj.booked) {
                    if (newObj.students.length == 0 || newObj.students.filter(data => (data.unique_id == student_id)).length == 0) {
                        newObj.students.push(JSON.parse(`{ "unique_id" : "${student.unique_id}", "username" : "${student.username}", "type" : "${student.type}" }`))
                        newObj.booked = true;
                        event = await pgPool.query(`
                            UPDATE "Events" SET "students" = $1, "booked" = $2 WHERE "tutor" = $3 AND "start_time" = $4
                            RETURNING *
                        `, [JSON.stringify(newObj.students), newObj.booked, tutor, start_time]).then(res => { return res.rows[0] })
                    }
                }
            }
            return await event;
        },
        updateEvent: async (root, { tutor, old_start_time, new_start_time, new_end_time }, { pgPool }) => {
            const updatedEvent = await pgPool.query(`
                            UPDATE "Events" SET "start_time" = $1, "end_time" = $2 WHERE "tutor" = $3 AND "start_time" = $4
                            RETURNING *
                        `, [new_start_time, new_end_time, tutor, old_start_time]).then(res => { return res.rows[0] })
            return updatedEvent;
        },
        deleteEvent: async (root, { tutor, start_time }, { pgPool }) => {
            // const deletedEvent = await Event.findOneAndRemove({ tutor, start_time });
            const deletedEvent = await pgPool.query(`
                DELETE FROM "Events" WHERE "tutor" = $1 AND "start_time" = $2
                RETURNING *
            `, [ tutor, start_time ]).then(res => { return res.rows[0] })
            return deletedEvent;
        }
    }
}