exports.quickHelpResolvers = {
    Query: {
        getAllQuickHelp: async (root, args, { QuickHelp, User }) => {
            let query = [];
            args.student_id ? query.push('"student_id": "' + args.student_id + '"') : 0;
            args.tutor_id ? query.push('"tutor_id": "' + args.tutor_id + '"') : 0;
            let obj = JSON.parse('{ ' + query.toString() + ' }');
            const allQuickHelp = await QuickHelp.find(obj).sort({ createdAt: "asc" });
            const studentDetails = await User.find();
            const tutorDetails = await User.find();
            await allQuickHelp.map((elem) => {
                let oneStudent = studentDetails.find(element => element.unique_id == elem.student_id);
                elem.student_username = oneStudent.username;
                if (elem.tutor_id) {
                    let oneTutor = tutorDetails.find(element => element.unique_id == elem.tutor_id);
                    elem.tutor_username = oneTutor.username;
                } else {
                    elem.tutor_username = "";
                }
                return elem;
            })
            if (args.booked == true) {
                const filterd = allQuickHelp.filter(elem => elem.tutor_id != "");
                return filterd;
            }
            return await allQuickHelp;
        }
    },
    Mutation: {
        createQuickHelp: async (root, { student_id }, { QuickHelp, User }) => {
            const studentDetails = await User.findOne({ unique_id : student_id });
            if (studentDetails) {
                const newQuickHelp = await new QuickHelp({
                    student_id,
                    tutor_id : "",
                    createdAt : new Date(Date.now()).toISOString()
                }).save();
                newQuickHelp.student_username = studentDetails.username;
                newQuickHelp.tutor_username = "";
                return newQuickHelp;
            }
        },
        addTutorToQuickHelp: async (root, { student_id, tutor_id }, { QuickHelp, User }) => {
            const oneTutor = await User.findOne({ unique_id : tutor_id });
            if (oneTutor) {
                const oneStudent = await User.findOne({ unique_id : student_id });
                if (oneStudent) {
                    let quickHelp = await QuickHelp.findOne({ student_id });
                    quickHelp.student_username = oneStudent.username;
                    quickHelp.tutor_username = oneTutor.username ? oneTutor.username : "";
                    if (quickHelp.tutor_id == "") {
                        quickHelp.tutor_id = oneTutor.unique_id ? oneTutor.unique_id : "";
                        await QuickHelp.findOneAndUpdate({ student_id }, { $set: quickHelp }, { new: true });
                    }
                    return await quickHelp;
                }
            }
        },
        deleteQuickHelp: async (root, { student_id }, { QuickHelp, User }) => {
            const deletedQuickHelp = await QuickHelp.findOneAndRemove({ student_id });
            if (deletedQuickHelp && deletedQuickHelp.student_id) {
                const oneStudent = await User.findOne({ unique_id : student_id });
                deletedQuickHelp.student_username = oneStudent.username;
                if (deletedQuickHelp && deletedQuickHelp.tutor_id) {
                    const oneTutor = await User.findOne({ unique_id : deletedQuickHelp.tutor_id });
                    deletedQuickHelp.tutor_username = oneTutor.username;
                } else {
                    deletedQuickHelp.tutor_username = "";
                }
                return deletedQuickHelp;
            }
        }
    }
}