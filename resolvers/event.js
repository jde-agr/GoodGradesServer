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
                expireAt : new Date(end_time)
            }).save();
            return newEvent;
        },
        addStudentToEvent: async (root, { tutor, start_time, student_id }, { Event, User }) => {
            let event = await Event.findOne({ tutor, start_time });
            let student = await User.findOne({ unique_id : student_id});
            if (event) {
                let newObj = await { ...event._doc }
                if (!newObj.booked) {
                    console.log("NO BOOKING", student)
                    if (newObj.students.length == 0 || newObj.students.filter(data => (data.unique_id == student_id)).length == 0) {
                        console.log("NO PRIOR")
                        console.log(newObj)
                        newObj.students.push(JSON.parse(`{ "unique_id" : "${student.unique_id}", "username" : "${student.username}", "type" : "${student.type}" }`))
                        console.log(newObj)
                        event = await Event.findOneAndUpdate({ tutor, start_time }, { $set: newObj }, { new: true });
                    }
                }
            }
            return await event;
        },
        updateEvent: async (root, { tutor, old_start_time, old_end_time, new_start_time, new_end_time }, { Event }) => {
            let updatedEvent = await Event.findOne({ tutor, start_time : old_start_time });
            if (updatedEvent) {
                let newObj = await { ...updatedEvent._doc }
                // console.log("Old obj", newObj);
                newObj.start_time = new_start_time;
                newObj.end_time = new_end_time;
                newObj.expireAt = new Date(new_end_time);
                // console.log("New Obj", newObj)
                updatedEvent = await Event.findOneAndUpdate({ tutor, start_time : old_start_time }, { $set: newObj }, { new: true });
            }
            return updatedEvent;
        },
        deleteEvent: async (root, { tutor, start_time }, { Event }) => {
            const deletedEvent = await Event.findOneAndRemove({ tutor, start_time });
            return deletedEvent;
        }
    }
}