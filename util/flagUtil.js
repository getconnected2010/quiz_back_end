const pool = require("../config/db")

//enters a username into flagged table, after failed password attempt anywhere in the app
//once a username is flagged a set number of times, its blocked and has to be reset using secret question.
//and if secret question fails set number of times, username is completely blocked for a set time.
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

//once a secret question is verified a username is removed off flagged table to enable login.
//an admin can also remove username off flagged table to allow login.
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

//removes refresh_token off db so user has to authenticate using password and start a new session.
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