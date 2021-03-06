exports.userResolvers = {
    Query: {
        /*
        Get all Users within the database
        */
        getAllUsers: async (root, args, { pgPool }) => {
            const allUsers = await pgPool.query(`
                SELECT * FROM "Users" ORDER BY "unique_id" ASC
            `).then(res => { return res.rows })
            return allUsers;
        },
        /*
        Get a single User that is uniquely identified by unique_id
        */
        getUser: async (root, { unique_id }, { pgPool }) => {
            const user =  await pgPool.query(`
                SELECT * FROM "Users" WHERE "unique_id" = $1
            `,[unique_id]).then(res => { return res.rows[0] })
            return user;
        },
        /*
        Get all Users who are tutors
        */
        getAllTutors: async (root, args , { pgPool }) => {
            const tutors = await pgPool.query(`
                 SELECT * FROM "Users" WHERE "type" = 'tutor' ORDER BY "unique_id" ASC
            `).then(res => { return res.rows })
            const allEvents = (args.events == true) ? await pgPool.query(`
                SELECT * FROM "Events" ORDER BY "tutor" ASC
            `).then(res => { return res.rows }) : null;
            if (allEvents) {
                await (tutors).forEach((elem) => {
                    elem.events = (allEvents.filter((elem2) => {
                        return (elem.unique_id == elem2.tutor);
                    }))
                })
            }
            return await tutors;
        }
    },
    Mutation: {
        /*
        Create a User using a unique_id, username and type (tutor or student)
        */
        createUser: async (root, { unique_id, username, type }, { pgPool }) => {
            const newUser = await pgPool.query(`
                INSERT INTO "Users" ("unique_id", "username", "type")
                VALUES($1, $2, $3) RETURNING *
            `, [ unique_id, username, type ]).then(res => { return res.rows[0] })
            return newUser;
        },
        /*
        Delete a User who is uniquely identified by unique_id
        */
        deleteUser: async (root, { unique_id }, { pgPool }) => {
            const deletedUser = await pgPool.query(`
                DELETE FROM "Users" WHERE "unique_id" = $1
                RETURNING *;
            `, [ unique_id ]).then(res => { return res.rows[0] })
            return await deletedUser;
        }
    }
}