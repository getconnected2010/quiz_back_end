const route = require('express').Router()
//const CK = require('../util/cookies')
const JWT= require('../util/jwtUtil')
const QC = require('../controller/quizController')
const UC = require('../controller/userController')
const VAL = require('../util/validator')
const VER = require('../util/verify')

const cookieParser = require('cookie-parser')

route.use(cookieParser())
//user routes
route.get('/admin/scores/:username', VAL.username, VAL.jwt, VAL.validatorResult, JWT.verifyAdmin, UC.getUserId, QC.fetchScores)

route.post('/admin/delete', VAL.username, VAL.password, VAL.jwt, VAL.validatorResult, JWT.verifyAdmin, VER.adminDB, VER.password, UC.delUser)

route.post('/admin/dngrade', VAL.username, VAL.password, VAL.jwt, VAL.validatorResult, JWT.verifyAdmin, VER.adminDB, VER.password, UC.dnGradeUser)

route.post('/admin/upgrade', VAL.username, VAL.password, VAL.jwt, VAL.validatorResult, JWT.verifyAdmin, VER.adminDB, VER.password, UC.upgradeUser) 

route.post('/admin/reset', VAL.username, VAL.password, VAL.jwt, VAL.validatorResult, JWT.verifyAdmin, VER.adminDB, VER.password, UC.userAdminReset) 

route.post('/self/reset', VAL.username, VAL.password, VAL.validatorResult, VER.userNotTimeout, VER.usernameDobMatchDb, UC.userSelfReset)

route.post('/signin', VAL.username, VAL.password, VAL.validatorResult, VER.userNotFlagged, UC.userSignIn, VER.password, JWT.assign)

route.get('/signout', )  //CK.delete

route.post('/signup', VAL.username, VAL.newPassword, VAL.dob, VAL.validatorResult, VER.usernameAvailable, UC.userSignUp)

route.post('/update/password', VAL.password, VAL.newPassword, VAL.jwt, VAL.validatorResult, JWT.verifyUser, VER.userInDB, VER.userNotFlagged, VER.password, UC.updatePassword)  

route.post('/update/username', VAL.password, VAL.newUsername, VAL.jwt, VAL.validatorResult, JWT.verifyUser, VER.userInDB, VER.userNotFlagged, VER.password, VER.newUsernameAvailable, UC.updateUsername) 

module.exports = route