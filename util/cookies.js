const jwt=require('jsonwebtoken')

exports.tokenToCookies= async(res, accessToken, refreshToken, userToken)=>{
    res.cookie('accessToken', accessToken,{
        maxAge: 1000*60*15,
        httpOnly: true,
        secure: false
    })
    res.cookie('refreshToken', refreshToken, {
        maxAge: 1000*60*45,
        httpOnly: true,
        secure: false
    })
    res.cookie('userToken', userToken, {
        maxAge: 1000*60*45,
        httpOnly: false,
        secure: false
    })
}

exports.assign = async (req, res)=>{
    try {
        const {user_id, admin}= req.body
        const accessToken= jwt.sign({user_id, admin}, process.env.JWT_ACCESS_TOKEN)
        const refreshToken= jwt.sign({user_id, admin}, process.env.JWT_REFRESH_TOKEN)
        const userToken= jwt.sign({user_id, admin}, process.env.JWT_USER_SET_TOKEN)
        await this.tokenToCookies(res, accessToken, refreshToken, userToken)
        res.status(200).json({msg:'Welcome'})
    } catch (error) {
        res.status(400).json({msg: 'server error with assigning cookies'})
    }
}

exports.delete=async (req, res)=>{
    try {
        res.cookie('accessToken', '',{
            maxAge: 0,
            httpOnly: true,
            secure: false
        })
        res.cookie('refreshToken', '', {
            maxAge: 0,
            httpOnly: true,
            secure: false
        })
        res.cookie('userToken', '', {
            maxAge: 0,
            httpOnly: false,
            secure: false
        })
        res.status(200).json({msg:'successfully logged out'})
    } catch (error) {
        console.log(error)
        res.status(500).json({msg:'server error deleting cookies'})
    }
}

exports.refresh =async(req, res, next)=>{
    try {
        let refreshToken= req.cookies.refreshToken
        let accessToken= req.cookies.accessToken
        if(accessToken) return next()
        if(!accessToken){
            const {user_id, admin}= jwt.decode(refreshToken)
            accessToken= jwt.sign({user_id, admin}, process.env.JWT_ACCESS_TOKEN)
            refreshToken = jwt.sign({user_id, admin}, process.env.JWT_REFRESH_TOKEN)
            const userToken = jwt.sign({user_id, admin}, process.env.JWT_USER_SET_TOKEN)
            await this.tokenToCookies(res, accessToken, refreshToken, userToken)
            next()
        }
    } catch (error) {
        res.status(500).json({msg:'server error with access cookies'})
    }
}

exports.verifyAdmin=(req, res, next)=>{
    try {
        const {refreshToken}= req.cookies
        const {userToken} = req.cookies
        const refreshPayload= jwt.decode(refreshToken)
        const userPayload= jwt.decode(userToken)
        if(refreshToken && userToken 
            && 
            jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN) 
            && 
            jwt.verify(userToken, process.env.JWT_USER_SET_TOKEN) 
            && 
            userPayload.user_id===Number(req.params.user_id||req.body.user_id)
            && 
            refreshPayload.user_id===Number(req.params.user_id||req.body.user_id)
            &&
            refreshPayload.admin==='true' && userPayload.admin==='true'
            ){
                next()
        }else{
            res.status(401).json({msg: "you don't have admin priviledge"})
        }
    } catch (error) {
        res.status(500).json({msg:'server error checking cookies'})
    }
}

exports.verifyLoggedUser=async (req, res, next)=>{
    try {
        const {refreshToken}= req.cookies
        const {userToken} = req.cookies
        const refreshPayload= jwt.decode(refreshToken)
        const userPayload= jwt.decode(userToken)
        if(refreshToken && userToken 
            && 
            jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN) 
            && 
            jwt.verify(userToken, process.env.JWT_USER_SET_TOKEN) 
            && 
            userPayload.user_id===Number(req.params.user_id||req.body.user_id)
            && 
            refreshPayload.user_id===Number(req.params.user_id||req.body.user_id)){
                next()
            }else{
                res.status(401).json({msg:"You are not a logged in user."})
            }
    } catch (error) {
        res.status(401).json({msg:"You are not a logged in user"})
    }
}

