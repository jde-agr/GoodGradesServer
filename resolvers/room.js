exports.roomResolvers = {
    Query: {
        getAllRooms: async (root, args, { Room }) => {
            const allRooms = await Room.find().sort({ unique_id: "asc" })
            return await allRooms;
        },
        getRoom: async (root, { unique_id }, { Room }) => {
            const room = await Room.findOne({ unique_id })
            return await room;
        }
    },
    Mutation: {
        createRoom: async (root, { unique_id, room_url, room_code }, { Room }) => {
            // const allRooms = await Room.find().sort({ unique_id: "asc" })
            // return await allRooms;
            const newRoom = await new Room({
                unique_id,
                room_url,
                room_code
            }).save();
            return newRoom;
        },
        deleteRoom : async (root, { unique_id }, { Room }) => {
            const deletedRoom = await Room.findOneAndRemove({ unique_id });
            return deletedRoom;
        }
    }
}