const jwt = require('jsonwebtoken')
const pool = require("../config/db")


exports.assign = (req, res, next)=>{
    try {
        const {user_id, admin, tknRefreshed}= req.body
        let refreshCount
        tknRefreshed===undefined? refreshCount=0 : refreshCount= tknRefreshed
        const userToken= jwt.sign({user_id, admin}, process.env.JWT_USER_SET_TOKEN,{
            expiresIn: 60*1
        })
        const refreshToken = jwt.sign({user_id, admin, refreshCount}, process.env.JWT_REFRESH_TOKEN,{
            expiresIn: 60*10
        })
        pool.getConnection((err, connection)=>{
            if(err) return res.status(401).json({msg:'server error processing tokens'})
            const refreshSql= "UPDATE users SET refresh_token=? WHERE user_id=? AND admin=?"
            connection.query(refreshSql, [refreshToken, user_id, admin], (err, result)=>{
                connection.release()
                if(err) return res.status(401).json({msg:'database error processing tokens'})
                res.set({'usertoken': userToken}) //sets a header 'usertoken' and adds the token as value
                if(refreshCount!==0) return next()
                res.status(200).json({msg:'welcome'})
            })
        })
        
    } catch (error) {
        res.status(401).json({msg: 'server error assigning tokens'})
    }
}

exports.refresh=(req, res, next, userToken)=>{
    try {
        const payload = jwt.decode(userToken)
        const {user_id, admin} = payload
        const refreshSql= "SELECT refresh_token FROM users WHERE user_id=? AND admin=?"
        pool.getConnection((err, connection)=>{
            if(err) return res.status(401).json({msg:'Server error refreshing your expired session. Please login.'})
            connection.query(refreshSql, [user_id, admin], (err, result)=>{
                connection.release()
                if(err) return res.status(401).json({msg:'Database error refreshing your expired session. Please login.'})
                if(result.length===1) {
                    const refreshToken= result[0].refresh_token
                    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, (err, decoded)=>{
                        if(err) return res.status(401).json({msg:'Your session has expired. Please login.'})
                        if(decoded.refreshCount>5) return res.status(401).json({msg:'your session has expired and reached maximum refresh count. Please login.'})
                        req.body.user_id = decoded.user_id
                        req.body.admin= decoded.admin
                        req.body.tknRefreshed = decoded.refreshCount+1
                        this.assign(req, res, next)
                    })
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
    try {
        const userToken = req.headers.authorization
        const payload= jwt.decode(userToken)
        if(payload.admin!=='true') return res.status(401).json({msg:"you don't have admin priviledge.."})
        if(!userToken) return res.status(401).json({msg:'you are not logged in'})
        jwt.verify(userToken, process.env.JWT_USER_SET_TOKEN, (err, decoded)=>{
            if(err && err.name==='TokenExpiredError') return this.refresh(req, res, next, userToken)
            if(err) return res.status(401).json({msg:'invalid admin token'})
            if(decoded.admin!=='true') return res.status(401).json({msg:"you don't have admin priviledge."})
            if(decoded.admin==='true') {
                req.body.user_id = decoded.user_id
                next()
            } else{
                res.status(401).json({msg:"your admin tokens couldn't be verified"})
            }
        })
    } catch (error) {
        res.status(401).json({msg:"your admin tokens couldn't be verified"})
    }
}

exports.verifyUser = (req, res, next)=>{
    const userToken = req.headers.authorization
    if(!userToken) return res.status(401).json({msg:'you are not logged in'})
    jwt.verify(userToken, process.env.JWT_USER_SET_TOKEN, (err, decoded)=>{
        if(err && err.name==='TokenExpiredError') return this.refresh(req, res, next, userToken)
        if(err) return res.status(401).json({msg:"server error verifying your session. Please login."})
        if(decoded) {
            req.body.user_id = decoded.user_id
            next()
        }else{
            res.status(401).json({msg:"server couldn't verify your session. Please login."})
        }
    })
}