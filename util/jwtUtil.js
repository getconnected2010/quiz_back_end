const jwt = require('jsonwebtoken')
const pool = require("../config/db")
const flagUtil= require('../util/flagUtil')

//assigns a userToken and sends it to client and stores refreshToken in db
exports.assign = (req, res, next)=>{
    try {
        let {user_id, admin, refreshCount}= req.body
        //at initial signin, refreshing tokens hasn't occured yet. so its set to default 0.
        //once refresh routes direct a token here, refesh count will have a value
        refreshCount===undefined? refreshCount=0 : refreshCount  
        const userToken= jwt.sign({user_id, admin}, process.env.JWT_USER_SET_TOKEN,{
            expiresIn: 60*15     //userToken expires in 15 min
        })
        //refresh count is inserted into refresh token so we can control how many session refreshes are allowed
        const refreshToken = jwt.sign({user_id, admin, refreshCount}, process.env.JWT_REFRESH_TOKEN,{
            expiresIn: 60*45    //refresh token expires in 45 min
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
                //sets a header 'usertoken' and adds the token as value in response header.
                //add res.header({'Access-Control-Expose-Headers':'userToken'}) in index.js to allow browser to access this header
                res.set({'usertoken': userToken}) 
                if(refreshCount!==0) {  //if refresh count is 0, then its a new logged user. so it skips to last line to send welcome msg.
                    req.body.user_id = user_id  //if refresh count isnot 0, then this is a refresh middleware and directs to next task.
                    next()
                    return
                }
                res.status(200).json({msg:'welcome'})
            })
        })
    } catch (error) {
        const {user_id} = req.body
        flagUtil.removeRefreshTkn(user_id)  //any fails to assing a token will remove any existing refresh token off db for that user_id
        res.status(401).json({msg: 'server error assigning tokens'})
    }
}

//refreshes a current expired user token so long as the refresh token in db isn't expired or 
//number of session refresh represented by refresCount hasn't passed a set amount
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
                        if(decoded.refreshCount>5){   //user can only refresh sessions 5 times
                            flagUtil.removeRefreshTkn(user_id)  //removes the refresh token off db.
                            res.status(401).json({msg:'your session has expired. Please login.'})
                            return
                            }
                        req.body.user_id = decoded.user_id
                        req.body.admin= decoded.admin
                        req.body.refreshCount = decoded.refreshCount+1   //adds to the current refreshCount 
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

//signout removes refreshToken off db
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

//verifies admin jwt and attaches a user_id off the token to the req.body to be user by other fn
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
            //if the error is an expired token, its directed to refresh funciton
            if(err && err.name==='TokenExpiredError') return this.refresh(req, res, next, userToken)
            if(err) {
                flagUtil.removeRefreshTkn(user_id)  //anyother errors remove token off db
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
        const userToken = req.headers.authorization //headers from front end send the jwt token
        const {user_id} = jwt.decode(userToken)
        flagUtil.removeRefreshTkn(user_id)
        res.status(401).json({msg:"your admin tokens couldn't be verified"})
    }
}

//verifies a logged user is present
exports.verifyUser = (req, res, next)=>{
    try {
        const userToken = req.headers.authorization
        if(!userToken) return res.status(401).json({msg:'you are not logged in'})
        const {user_id} = jwt.decode(userToken)
        jwt.verify(userToken, process.env.JWT_USER_SET_TOKEN, (err, decoded)=>{
            //if the token error is expired, then direct to refresh fn
            if(err && err.name==='TokenExpiredError') return this.refresh(req, res, next, userToken)
            if(err) { 
                flagUtil.removeRefreshTkn(user_id)   //anyother error removes token off db
                res.status(401).json({msg:"server error verifying your session. Please login."})
                return
                }
            if(decoded) {
                req.body.user_id = decoded.user_id  //upon success a user_id is attached to req.body
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