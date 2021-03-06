const pool = require('../config/db')
const scoreUtil = require('../util/scoreUtil')

//adds a question to db
exports.addQa = (req, res)=>{
    const {subject, question, answer1, answer2, answer3, answer4, correct} = req.body
    const sqlAdd = "INSERT INTO quiz_list (subject, question, answer1, answer2, answer3, answer4, correct) VALUES (?,?,?,?,?,?,?)";
    pool.getConnection((err, connection)=>{   //creating a db connection
        if(err) return res.status(500).json({msg:'server error adding question to database'})
        connection.query(sqlAdd, [subject, question, answer1, answer2, answer3, answer4, correct], (err, result)=>{
            connection.release()   //connection release makes the pool available for other fn to call db
            if(err) return res.status(500).json({msg:'database error adding question to database'})
            res.status(200).send(result)
        })
    })
}

//delete a question from db
exports.deleteQa=(req, res)=>{
    const id= req.params.id  //the id reference of a question in db is sent in params
    const deleteSql= "DELETE FROM quiz_list WHERE id=?"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(400).json(({msg:'server error deleting question.'}))
        connection.query(deleteSql, [id], (err)=>{
            connection.release()
            if(err) return res.status(400).json(({msg:'database error deleting question'}))
            res.status(200).json({msg: 'successfully deleted'})
        })
    })
}

//fetch scores of a user from db
exports.fetchScores=(req, res)=>{
    const {user_id}= req.body   //user_id is attached to body inside express middleware after verifying jwt
    const scoresSql= "SELECT subject, score FROM score WHERE user_id=? ORDER BY subject ASC"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'server error retrieving your scores'})
        connection.query(scoresSql, [user_id], (err, result)=>{
            connection.release()
            if(err) return res.status(500).json({msg:'database error retrieving your scores'})
            res.status(200).json({result})
        })
    })
}

//fetch question/answers from db by subject area
exports.getQa = (req, res)=>{
    const subject = req.params.subject
    const listSql= "SELECT * FROM quiz_list WHERE subject=? ORDER BY id DESC";
    pool.getConnection((err, connection)=>{
        if(err) return res.status(400).json({msg:'server error fetching questions'})
        connection.query(listSql,[subject], (err, results)=>{
            connection.release()
            if(err) return res.status(400).json({msg:'database error fetching questions'})
            res.status(200).json(results)
        })
    })
}

//record score of a user
exports.recordScore=(req, res)=>{
    const {user_id, subject} = req.body
    const scoreSql= "SELECT COUNT(*) as user FROM score WHERE user_id=? AND subject=?"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'server error recording your score'})
        connection.query(scoreSql, [user_id, subject], (err, result)=>{
            connection.release()
            if(err) return res.status(500).json({msg:'database error recording your score'})
            if(result[0].user===1) return scoreUtil.updateScore(req, res)
            if(result[0].user===0) return scoreUtil.recordScore(req, res)
            res.status(401).json({msg:"invalid user detected. Your score can't be recorded."})
        })
    })
}