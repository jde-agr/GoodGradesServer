exports.roomResolvers = {
    Query: {
        getAllRooms: async (root, args, { Room }) => {
            const allRooms = await Room.find().sort({ email: "asc" })
            return await allRooms;
        },
        getRoom: async (root, { email }, { Room }) => {
            const room = await Room.findOne({ email })
            return await room;
        }
    },
    Mutation: {
        createRoom: async (root, { email, room_url, room_code }, { Room }) => {
            // const allRooms = await Room.find().sort({ email: "asc" })
            // return await allRooms;
            const newRoom = await new Room({
                email,
                room_url,
                room_code
            }).save();
            return newRoom;
        },
        deleteRoom : async (root, { email }, { Room }) => {
            const deletedRoom = await Room.findOneAndRemove({ email });
            return deletedRoom;
        }
    }
}