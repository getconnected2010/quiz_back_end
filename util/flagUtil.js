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

exports.removeRefreshTkn= async (user_id)=>{
    if(!user_id) return
    const removeTknSql= "UPDATE users SET refresh_token = null WHERE user_id=?"
    pool.getConnection((err, connection)=>{
        if(err) return
        connection.query(removeTknSql, [user_id], (err)=>{
            connection.release()
            if(err)  return
        })
    })
}