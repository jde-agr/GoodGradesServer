exports.userResolvers = {
    Query: {
        getAllUsers: async (root, args, { User }) => {
            const allUsers = await User.find().sort({ unique_id: "asc" })
            return await allUsers;
        },
        getUser: async (root, { unique_id }, { User }) => {
            const user = await User.findOne({ unique_id })
            return await user;
        }
    },
    Mutation: {
        createUser: async (root, { unique_id, username, type }, { User }) => {
            // const allRooms = await Room.find().sort({ unique_id: "asc" })
            // return await allRooms;
            const newUser = await new User({
                unique_id,
                username,
                type
            }).save();
            return newUser;
        },
        deleteUser: async (root, { unique_id }, { User }) => {
            const deletedUser = await User.findOneAndRemove({ unique_id });
            return deletedUser
        }
    }
}