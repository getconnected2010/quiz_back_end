const route = require('express').Router()
const CK = require('../util/cookies')
const QC = require('../controller/quizController')
const UC = require('../controller/userController')
const VAL = require('../util/validator')
const VER = require('../util/verify')

const cookieParser = require('cookie-parser')

route.use(cookieParser())

route.get('/admin/scores/:user_id/:username', VAL.user_id, VAL.username, VAL.validatorResult, CK.verifyAdmin, CK.refresh, VER.adminDB, UC.getUserId, QC.fetchScores)

route.post('/admin/delete', VAL.user_id, VAL.username, VAL.password, VAL.validatorResult, CK.verifyAdmin, CK.refresh, VER.adminDB, VER.password, UC.delUser)

route.post('/admin/dngrade', VAL.user_id, VAL.username, VAL.password, VAL.validatorResult, CK.verifyAdmin, CK.refresh, VER.adminDB, VER.password, UC.dnGradeUser)

route.post('/admin/upgrade', VAL.user_id, VAL.username, VAL.password, VAL.validatorResult, CK.verifyAdmin, CK.refresh, VER.adminDB, VER.password, UC.upgradeUser)

route.post('/admin/reset', VAL.user_id, VAL.username, VAL.password, VAL.validatorResult, CK.verifyAdmin, CK.refresh, VER.adminDB, VER.password, UC.userAdminReset)

route.post('/self/reset', VAL.username, VAL.password, VAL.validatorResult, VER.userNotTimeout, VER.usernameDobMatchDb, UC.userSelfReset)

route.post('/signin', VAL.username, VAL.password, VAL.validatorResult, VER.userNotFlagged, UC.userSignIn, VER.password, CK.assign)

route.get('/signout', CK.delete)

route.post('/signup', VAL.username, VAL.newPassword, VAL.dob, VAL.validatorResult, VER.usernameAvailable, UC.userSignUp)

route.post('/update/password', VAL.user_id, VAL.password, VAL.newPassword, VAL.validatorResult, CK.verifyLoggedUser, CK.refresh, VER.userInDB, VER.userNotFlagged, VER.password, UC.updatePassword)

route.post('/update/username', VAL.user_id, VAL.password, VAL.newUsername, VAL.validatorResult, CK.verifyLoggedUser, CK.refresh, VER.userInDB, VER.userNotFlagged, VER.password, VER.newUsernameAvailable, UC.updateUsername)

module.exports = route