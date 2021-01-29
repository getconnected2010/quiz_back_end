const pool = require("../config/db")

//writes user scores to score table in db
exports.recordScore=(req, res)=>{
    const {user_id, subject, score} = req.body
    const recordScoreSql="INSERT INTO score (user_id, subject, score) values(?,?,?)"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'server error recording your score'})
        connection.query(recordScoreSql, [user_id, subject, score], (err)=>{
            connection.release()
            if(err) return res.status(500).json({msg:'database error recording your score'})
            res.status(200).json({msg:'score successfully recorded in database'})
        })
    })
}


//updates a user score in db
exports.updateScore=(req, res)=>{
    const {user_id, subject, score} = req.body
    const updateScoreSql= "UPDATE score SET score=? WHERE user_id=? AND subject=?"
    pool.getConnection((err, connection)=>{
        if(err) return res.status(500).json({msg:'server error updating your score'})
        connection.query(updateScoreSql, [score, user_id, subject], (err)=>{
            connection.release()
            if(err) return res.status(500).json({msg:'database error updating your score'})
            res.status(200).json({msg:'score sussfully recorded in database'})
        })
    })
}

//deletes rows with empty user_id values. cleans up the table after a user is deleted off db.
exports.delNullScore=()=>{
    const delSql= "DELETE FROM score WHERE user_id is null"
    pool.getConnection((err, connection)=>{
        if(err) return console.log('error deleting score')
        connection.query(delSql, (err)=>{
            connection.release()
            if(err) return console.log(err)
        })
    })
}