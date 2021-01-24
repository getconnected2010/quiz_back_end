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
route.get('/admin/scores/:user_id/:username/:userToken', VAL.user_id, VAL.username, VAL.validatorResult, JWT.verifyAdmin, UC.getUserId, QC.fetchScores)  //CK.verifyAdmin, CK.refresh, VER.adminDB,

route.post('/admin/delete/:userToken', VAL.user_id, VAL.username, VAL.password, VAL.validatorResult, JWT.verifyAdmin, VER.password, UC.delUser) //CK.verifyAdmin, CK.refresh, VER.adminDB,

route.post('/admin/dngrade/:userToken', VAL.user_id, VAL.username, VAL.password, VAL.validatorResult, JWT.verifyAdmin, VER.password, UC.dnGradeUser) //CK.verifyAdmin, CK.refresh, VER.adminDB,

route.post('/admin/upgrade/:userToken', VAL.user_id, VAL.username, VAL.password, VAL.validatorResult, JWT.verifyAdmin, VER.password, UC.upgradeUser) //CK.verifyAdmin, CK.refresh, VER.adminDB,

route.post('/admin/reset/:userToken', VAL.user_id, VAL.username, VAL.password, VAL.validatorResult, JWT.verifyAdmin, VER.password, UC.userAdminReset) //CK.verifyAdmin, CK.refresh,  VER.adminDB,

route.get('/refresh/:userToken', JWT.refresh, JWT.assign)

route.post('/self/reset', VAL.username, VAL.password, VAL.validatorResult, VER.userNotTimeout, VER.usernameDobMatchDb, UC.userSelfReset)

route.post('/signin', VAL.username, VAL.password, VAL.validatorResult, VER.userNotFlagged, UC.userSignIn, VER.password, JWT.assign)  //, CK.assign

route.get('/signout', )  //CK.delete

route.post('/signup', VAL.username, VAL.newPassword, VAL.dob, VAL.validatorResult, VER.usernameAvailable, UC.userSignUp)

route.post('/update/password/:userToken', VAL.user_id, VAL.password, VAL.newPassword, VAL.validatorResult, JWT.verifyUser, VER.userNotFlagged, VER.password, UC.updatePassword) //CK.verifyLoggedUser, CK.refresh,  VER.userInDB,

route.post('/update/username/:userToken', VAL.user_id, VAL.password, VAL.newUsername, VAL.validatorResult, JWT.verifyUser, VER.userNotFlagged, VER.password, VER.newUsernameAvailable, UC.updateUsername) // CK.verifyLoggedUser, CK.refresh, VER.userInDB,

module.exports = route