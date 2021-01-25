const jwt = require('jsonwebtoken')
const pool = require("../config/db")


exports.assign = (req, res)=>{
    try {
        const {user_id, admin}= req.body
        const userToken= jwt.sign({user_id, admin}, process.env.JWT_USER_SET_TOKEN,{
            expiresIn: 60*1
        })
        const refreshToken = jwt.sign({user_id, admin}, process.env.JWT_REFRESH_TOKEN,{
            expiresIn: 60*10
        })
        pool.getConnection((err, connection)=>{
            if(err) return res.status(500).json({msg:'server error processing tokens'})
            const refreshSql= "UPDATE users SET refresh_token=? WHERE user_id=? AND admin=?"
            connection.query(refreshSql, [refreshToken, user_id, admin], (err, result)=>{
                connection.release()
                if(err) return res.status(500).json({msg:'server error processing tokens'})
                res.set({'usertoken': userToken}) //sets a header 'usertoken' and adds the token as value
                res.status(200).json({msg:'welcome'})
            })
        })
        
    } catch (error) {
        res.status(400).json({msg: 'server error assigning tokens'})
    }
}

exports.verifyRefresh=(req, res, next, userToken)=>{
    try {
        const payload = jwt.decode(userToken)
        const {user_id, admin} = payload
        const refreshSql= "SELECT refresh_token FROM users WHERE user_id=? AND admin=?"
        pool.getConnection((err, connection)=>{
            if(err) return res.status(401).json({msg:'Your session has expired. Please login using credentials.'})
            connection.query(refreshSql, [user_id, admin], (err, result)=>{
                connection.release()
                if(err) return res.status(401).json({msg:'Your session has expired. Please login using credentials.'})
                if(result.length===1) {
                    const refreshToken= result[0].refresh_token
                    console.log(refreshToken)
                }else{
                    res.status(401).json({msg:'Your session has expired. Please login using credentials.'})
                }
            })
        })
    } catch (error) {
        res.status(401).json({msg:'Your session has expired. Please login using credentials.'})
    }
}

exports.verifyAdmin= (req, res, next)=>{
    const userToken = req.headers.authorization
    const user_id= Number(req.params.user_id || req.body.user_id)
    if(!userToken) return res.status(400).json({msg:'you are not logged in'})
    jwt.verify(userToken, process.env.JWT_USER_SET_TOKEN, (err, decoded)=>{
        if(err) return res.status(401).json({msg:'invalid admin token'})
        if(decoded.user_id!==user_id) return res.status(401).json({msg:'invalid admin token'})
        if(decoded.admin!=='true') return res.status(401).json({msg:"you don't have admin priviledge"})
        if(decoded.user_id===user_id && decoded.admin==='true') return next()
        res.status(401).json({msg:"your admin tokens couldn't be verified"})
    })
}

exports.verifyUser = (req, res, next)=>{
    const userToken = req.headers.authorization
    if(!userToken) return res.status(400).json({msg:'you are not logged in'})
    jwt.verify(userToken, process.env.JWT_USER_SET_TOKEN, (err, decoded)=>{
        console.log('in jwtutil', decoded)
        if(err && err.name==='TokenExpiredError') return this.verifyRefresh(req, res, next, userToken)
        if(err) return res.status(401).json({msg:"server error verifying your access tokens"})
        if(decoded) {
            req.body.user_id = decoded.user_id
            next()
        }else{
            res.status(401).json({msg:"your user tokens couldn't be verified"})
        }
    })
}