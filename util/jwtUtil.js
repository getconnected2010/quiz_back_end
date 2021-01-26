const jwt = require('jsonwebtoken')
const pool = require("../config/db")
const flagUtil= require('../util/flagUtil')

exports.assign = (req, res, next)=>{
    try {
        let {user_id, admin, refreshCount}= req.body
        refreshCount===undefined? refreshCount=0 : refreshCount
        const userToken= jwt.sign({user_id, admin}, process.env.JWT_USER_SET_TOKEN,{
            expiresIn: 60*1
        })
        const refreshToken = jwt.sign({user_id, admin, refreshCount}, process.env.JWT_REFRESH_TOKEN,{
            expiresIn: 60*10
        })
        pool.getConnection((err, connection)=>{
            if(err) return res.status(401).json({msg:'server error processing tokens'})
            const refreshSql= "UPDATE users SET refresh_token=? WHERE user_id=? AND admin=?"
            connection.query(refreshSql, [refreshToken, user_id, admin], (err)=>{
                connection.release()
                if(err) {
                    flagUtil.removeRefreshTkn(user_id)
                    res.status(401).json({msg:'database error processing tokens'})
                    return
                }
                res.set({'usertoken': userToken}) //sets a header 'usertoken' and adds the token as value
                if(refreshCount!==0) return next()
                res.status(200).json({msg:'welcome'})
            })
        })
    } catch (error) {
        const {user_id} = req.body
        flagUtil.removeRefreshTkn(user_id)
        res.status(401).json({msg: 'server error assigning tokens'})
    }
}

exports.refresh=(req, res, next, userToken)=>{
    try {
        const {user_id, admin} = jwt.decode(userToken)
        const refreshSql= "SELECT refresh_token FROM users WHERE user_id=? AND admin=?"
        pool.getConnection((err, connection)=>{
            if(err) return res.status(401).json({msg:'Server error refreshing your expired session. Please login.'})
            connection.query(refreshSql, [user_id, admin], (err, result)=>{
                connection.release()
                if(err){
                    flagUtil.removeRefreshTkn(user_id)
                    res.status(401).json({msg:'Database error refreshing your expired session. Please login.'})
                     return
                    }
                if(result.length===1) {
                    const refreshToken= result[0].refresh_token
                    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, (err, decoded)=>{
                        if(err){
                            flagUtil.removeRefreshTkn(user_id)
                            res.status(401).json({msg:'Your session has expired. Please login.'})
                            return
                            }
                        if(decoded.refreshCount>5){
                            flagUtil.removeRefreshTkn(user_id)
                            res.status(401).json({msg:'your session has expired. Please login.'})
                            return
                            }
                        req.body.user_id = decoded.user_id
                        req.body.admin= decoded.admin
                        req.body.refreshCount = decoded.refreshCount+1
                        this.assign(req, res, next)
                    })
                }else{
                    flagUtil.removeRefreshTkn(user_id)
                    res.status(401).json({msg:'Your session has expired. Please login using credentials.'})
                }
            })
        })
    } catch (error) {
        const {user_id} = jwt.decode(userToken)
        flagUtil.removeRefreshTkn(user_id)
        res.status(401).json({msg:'Your session has expired. Please login.'})
    }
}

exports.signout= async(req, res)=>{
    try {
        const userToken= req.headers.authorization
        if(!userToken) return res.status(401).json({msg:'no active session found'})
        const {user_id} = jwt.decode(userToken)
        flagUtil.removeRefreshTkn(user_id)
        res.status(200).json({msg:'signed out'})
    } catch (error) {
        res.status(401).json({msg:'server error ending your session'})
    }
}

exports.verifyAdmin= (req, res, next)=>{
    try {
        const userToken = req.headers.authorization
        if(!userToken) return res.status(401).json({msg:'you are not logged in'})
        const {user_id, admin }= jwt.decode(userToken)
        if(admin!=='true') {
            flagUtil.removeRefreshTkn(user_id)
            res.status(401).json({msg:"you don't have admin priviledge.."})
            return
            }
        jwt.verify(userToken, process.env.JWT_USER_SET_TOKEN, (err, decoded)=>{
            if(err && err.name==='TokenExpiredError') return this.refresh(req, res, next, userToken)
            if(err) {
                flagUtil.removeRefreshTkn(user_id)
                res.status(401).json({msg:'invalid admin token'})
                return
            } 
            if(decoded.admin!=='true'){
                flagUtil.removeRefreshTkn(user_id)
                res.status(401).json({msg:"you don't have admin priviledge."})
                return
                } 
            if(decoded.admin==='true') {
                req.body.user_id = decoded.user_id
                next()
            } else{
                flagUtil.removeRefreshTkn(user_id)
                res.status(401).json({msg:"your admin tokens couldn't be verified"})
            }
        })
    } catch (error) {
        const userToken = req.headers.authorization
        const {user_id} = jwt.decode(userToken)
        flagUtil.removeRefreshTkn(user_id)
        res.status(401).json({msg:"your admin tokens couldn't be verified"})
    }
}

exports.verifyUser = (req, res, next)=>{
    try {
        const userToken = req.headers.authorization
        if(!userToken) return res.status(401).json({msg:'you are not logged in'})
        const {user_id} = jwt.decode(userToken)
        jwt.verify(userToken, process.env.JWT_USER_SET_TOKEN, (err, decoded)=>{
            if(err && err.name==='TokenExpiredError') return this.refresh(req, res, next, userToken)
            if(err) {
                flagUtil.removeRefreshTkn(user_id)
                res.status(401).json({msg:"server error verifying your session. Please login."})
                return
                }
            if(decoded) {
                req.body.user_id = decoded.user_id
                next()
            }else{
                flagUtil.removeRefreshTkn(user_id)
                res.status(401).json({msg:"server couldn't verify your session. Please login."})
            }
        })
    } catch (error) {
        const userToken = req.headers.authorization
        const {user_id} = jwt.decode(userToken)
        flagUtil.removeRefreshTkn(user_id)
        res.status(401).json({msg:"server couldn't verify your session. Please login."})
    }
}