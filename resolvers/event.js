exports.eventResolvers = {
    Query: {
        getAllEvents: async (root, args, { Event }) => {
            let query = [];
            args.tutor ? query.push('"tutor": "' + args.tutor + '"') : 0;
            args.student ? query.push('"students": "' + args.student + '"') : 0;
            (args.booked == true) ? query.push('"booked": true') : (args.booked == false) ? query.push('"booked": false') : 0;
            let obj = JSON.parse('{ ' + query.toString() + ' }');
            const allEvents = await Event.find(obj).sort({ tutor: "asc", start_time: "asc" });
            return await allEvents;
        },
        getEvent: async (root, { tutor, start_time }, { Event }) => {
            const event = await Event.findOne({ tutor, start_time });
            return await event;
        }
    },
    Mutation: {
        createEvent: async (root, { tutor, date, start_time, end_time }, { Event }) => {
            const newEvent = await new Event({
                tutor,
                date,
                start_time,
                end_time,
                booked: false,
                expireAt : Date(end_time)
            }).save();
            return newEvent;
        },
        addStudentToEvent: async (root, { tutor, start_time, student_id }, { Event }) => {
            let event = await Event.findOne({ tutor, start_time });
            if (event) {
                let newObj = await { ...event._doc }
                console.log(newObj)
                if (!newObj.booked) {
                    if (!newObj.students.includes(student_id)) {
                        newObj.students.push(student_id);
                        newObj.booked = true;
                        event = Event.findOneAndUpdate({ tutor, start_time }, { $set: newObj }, { new: true });
                    }
                }
            }
            return await event;
        },
        deleteEvent: async (root, { tutor, start_time }, { Event }) => {
            const deletedEvent = await Event.findOneAndRemove({ tutor, start_time });
            return deletedEvent;
        }
    }
}