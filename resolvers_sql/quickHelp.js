exports.quickHelpResolvers = {
    Query: {
        /*
        Get all QuickHelp from the database. It is filterable by student_id,
        and tutor_id
        */
        getAllQuickHelp: async (root, args, { pgPool }) => {
            let query = ""
            args.student_id ? query += `"student_id" = '${ args.student_id}' ` : 0;
            args.tutor_id ? query ? query += `AND "tutor_id" = '${args.tutor_id}' ` : query += `"tutor_id" = '${args.tutor_id}' ` : 0;
            query = query ? "WHERE " + query + " " : query
            const allQuickHelp = await pgPool.query(`
                SELECT * FROM "QuickHelps" ${query}ORDER BY "createdAt" ASC
            `).then(res => { return res.rows })
            const studentDetails = await pgPool.query(`
                SELECT * FROM "Users" ORDER BY "unique_id" ASC
            `).then(res => { return res.rows })
            const tutorDetails = await pgPool.query(`
                SELECT * FROM "Users" ORDER BY "unique_id" ASC
            `).then(res => { return res.rows })
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
    /*
    Creates a QuickHelp, using the student_id to uniquely identify it
    */
    Mutation: {
        createQuickHelp: async (root, { student_id }, { pgPool }) => {
            const studentDetails = await pgPool.query(`
                SELECT * FROM "Users" WHERE "unique_id" = $1
            `, [ student_id ]).then(res => { return res.rows[0] })
            if (studentDetails) {
                const newQuickHelp = await pgPool.query(`
                    INSERT INTO "QuickHelps" ("student_id", "tutor_id", "createdAt")
                    VALUES($1, $2, $3) RETURNING *
                `, [ student_id, "", new Date(Date.now()).toISOString() ]).then(res => { return res.rows[0] })
                newQuickHelp.student_username = studentDetails.username;
                newQuickHelp.tutor_username = "";
                return newQuickHelp;
            }
        },
        /*
        Assigns a tutor (tutor_id) to the QuickHelp that is uniquely identified by the
        student_id
        */
        addTutorToQuickHelp: async (root, { student_id, tutor_id }, { pgPool }) => {
            const oneTutor = await pgPool.query(`
                SELECT * FROM "Users" WHERE "unique_id" = $1
            `, [ tutor_id ]).then(res => { return res.rows[0] })
            if (oneTutor) {
                const oneStudent = await pgPool.query(`
                    SELECT * FROM "Users" WHERE "unique_id" = $1
                `, [ student_id ]).then(res => { return res.rows[0] })
                if (oneStudent) {
                    let quickHelp = await pgPool.query(`
                        SELECT * FROM "QuickHelps" WHERE "student_id" = $1
                    `, [ student_id ]).then(res => { return res.rows[0] })
                    quickHelp.student_username = oneStudent.username;
                    quickHelp.tutor_username = oneTutor.username ? oneTutor.username : "";
                    if (quickHelp.tutor_id == "") {
                        quickHelp.tutor_id = oneTutor.unique_id ? oneTutor.unique_id : "";
                        await pgPool.query(`
                            UPDATE "QuickHelps" SET "tutor_id" = $1 WHERE "student_id" = $2
                            RETURNING *
                        `, [ tutor_id, student_id]).then(res => { return res.rows[0] })
                    }
                    return await quickHelp;
                }
            }
        },
        /*
        Deletes the QuickHelp uniquely identified by student_id
        */
        deleteQuickHelp: async (root, { student_id }, { pgPool }) => {
            const deletedQuickHelp = await pgPool.query(`
                DELETE FROM "QuickHelps" WHERE "student_id" = $1
                RETURNING *;
            `, [ student_id ]).then(res => { return res.rows[0] })
            if (deletedQuickHelp && deletedQuickHelp.student_id) {
                const oneStudent = await pgPool.query(`
                    SELECT * FROM "Users" WHERE "unique_id" = $1
                `, [ student_id ]).then(res => { return res.rows[0] })
                deletedQuickHelp.student_username = oneStudent.username;
                if (deletedQuickHelp && deletedQuickHelp.tutor_id) {
                    const oneTutor = await pgPool.query(`
                        SELECT * FROM "Users" WHERE "unique_id" = $1
                    `, [ deletedQuickHelp.tutor_id ]).then(res => { return res.rows[0] })
                    deletedQuickHelp.tutor_username = oneTutor.username;
                } else {
                    deletedQuickHelp.tutor_username = "";
                }
                return deletedQuickHelp;
            }
        }
    }
}