const pool = require("../config/db")

exports.flagUser= (username)=>{
    const flagUserSql="INSERT INTO flagged (username) VALUES (?)"
    pool.getConnection((err, connection)=>{
        if(err) return console.log('error flagging username')
        connection.query(flagUserSql, [username], (err)=>{
            connection.release()
            if(err) return console.log('error flagging username')
        })
    })
}

exports.flaggedUserReset = async(username)=>{
    const flaggedUserResetSql="DELETE FROM flagged WHERE username=?"
    pool.getConnection((err, connection)=>{
        if(err) return console.log('error unflagging username')
        connection.query(flaggedUserResetSql, [username], (err)=>{
            connection.release()
            if(err) return console.log('error unflagging username')
        })
    })
}