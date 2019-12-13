exports.userResolvers = {
    Query: {
        getAllUsers: async (root, args, { User }) => {
            const allUsers = await User.find().sort({ email: "asc" })
            return await allUsers;
        },
        getUser: async (root, { email }, { User }) => {
            const user = await User.findOne({ email })
            return await user;
        }
    },
    Mutation: {
        createUser: async (root, { email, username, type }, { User }) => {
            // const allRooms = await Room.find().sort({ email: "asc" })
            // return await allRooms;
            const newUser = await new User({
                email,
                username,
                type
            }).save();
            return newUser;
        }
    }
}