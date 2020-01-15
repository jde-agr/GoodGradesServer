exports.userResolvers = {
    Query: {
        getAllUsers: async (root, args, { User }) => {
            const allUsers = await User.find().sort({ unique_id: "asc" });
            return await allUsers;
        },
        getUser: async (root, { unique_id }, { User }) => {
            const user = await User.findOne({ unique_id });
            return await user;
        },
        getAllTutors: async (root, args , { User, Event }) => {
            const tutors = await User.find({ type : "tutor" });
            const allEvents = (args.events == true) ? await Event.find().sort({ tutor: "asc" }) : null;
            if (allEvents) {
                tutors.forEach((elem) => {
                    elem.events = (allEvents.filter((elem2) => {
                        return (elem.unique_id == elem2.tutor);
                    }))
                })
            }
            return await tutors;
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
            return deletedUser;
        }
    }
}