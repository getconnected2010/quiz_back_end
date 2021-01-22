const jwt = require('jsonwebtoken')


exports.assign = (req, res)=>{
    try {
        const {user_id, admin}= req.body
        const userToken= jwt.sign({user_id, admin}, process.env.JWT_USER_SET_TOKEN)
        res.status(200).json({userToken: userToken})
    } catch (error) {
        res.status(400).json({msg: 'server error assigning tokens'})
    }
}

exports.verifyAdmin= (req, res, next)=>{
    const userToken = req.params.userToken
    const user_id= Number(req.params.user_id || req.body.user_id)
    if(!userToken) res.status(400).json({msg:'you are not logged in'})
    jwt.verify(userToken, process.env.JWT_USER_SET_TOKEN, (err, decoded)=>{
        if(err) return res.status(401).json({msg:'invalid admin token'})
        if(decoded.user_id!==user_id) return res.status(401).json({msg:'invalid admin token'})
        if(decoded.admin!=='true') return res.status(401).json({msg:"you don't have admin priviledge"})
        if(decoded.user_id===user_id && decoded.admin==='true') return next()
        res.status(401).json({msg:"your admin tokens couldn't be verified"})
    })
}

exports.verifyUser = (req, res, next)=>{
    const userToken = req.params.userToken
    const user_id = Number(req.params.user_id||req.body.user_id)
    if(!userToken) return res.status(400).json({msg:'you are not logged in'})
    jwt.verify(userToken, process.env.JWT_USER_SET_TOKEN, (err, decoded)=>{
        if(err) return res.status(401).json({msg:'invalid user token'})
        if(decoded.user_id!==user_id) return res.status(401).json({msg:'invalid user token'})
        if(decoded.user_id===user_id) return next()
        res.status(401).json({msg:"your user tokens couldn't be verified"})
    })
}