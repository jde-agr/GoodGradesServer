exports.roomResolvers = {
    Query: {
        /*
        Get all Rooms in the database
        */
        getAllRooms: async (root, args, { pgPool }) => {
            const allRooms = await pgPool.query(`
                SELECT * FROM "Rooms" ORDER BY "unique_id" ASC
            `).then(res => { return res.rows })
            return await allRooms;
        },
        /*
        Get a single Room that is uniquely identified by unique_id
        */
        getRoom: async (root, { unique_id }, { pgPool }) => {
            const room = await pgPool.query(`
                SELECT * FROM "Rooms" WHERE "unique_id" = $1
            `, [ unique_id ]).then(res => { return res.rows[0] })
            return await room;
        }
    },
    Mutation: {
        /*
        Create a Room using unique_id, room_url and room_code
        */
        createRoom: async (root, { unique_id, room_url, room_code }, { pgPool }) => {
            const newRoom = await pgPool.query(`
                INSERT INTO "Rooms" ("unique_id", "room_url", "room_code")
                VALUES($1, $2, $3) RETURNING *
            `, [ unique_id, room_url, room_code ]).then(res => { return res.rows[0] })
            return newRoom;
        },
        /*
        Delete the Room that is uniquely identified by unique_id
        */
        deleteRoom : async (root, { unique_id }, { pgPool }) => {
            const deletedRoom = await pgPool.query(`
                DELETE FROM "Rooms" WHERE "unique_id" = $1
                RETURNING *;
            `, [ unique_id ]).then(res => { return res.rows[0] })
            return await deletedRoom;
        }
    }
}