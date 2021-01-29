const route = require('express').Router()
const cookieParser = require('cookie-parser')
const JWT= require('../util/jwtUtil')
const QC = require('../controller/quizController')
const UC = require('../controller/userController')
const VAL = require('../util/validator')
const VER = require('../util/verify')


route.use(cookieParser())

//all user routes

//admin route to get scores of any user
route.get('/admin/scores/:username', VAL.username, VAL.jwt, VAL.validatorResult, JWT.verifyAdmin, UC.getUserId, QC.fetchScores)

//admin route to delete a user off db
route.post('/admin/delete', VAL.username, VAL.password, VAL.jwt, VAL.validatorResult, JWT.verifyAdmin, VER.adminDB, VER.password, UC.delUser)

//admin route to remove admin priviledge of another admin
route.post('/admin/dngrade', VAL.username, VAL.password, VAL.jwt, VAL.validatorResult, JWT.verifyAdmin, VER.adminDB, VER.password, UC.dnGradeUser)

//admin route to add admin priviledge to another user
route.post('/admin/upgrade', VAL.username, VAL.password, VAL.jwt, VAL.validatorResult, JWT.verifyAdmin, VER.adminDB, VER.password, UC.upgradeUser) 

//admin route to reset a blocked user by removing username off flaggd table
route.post('/admin/reset', VAL.username, VAL.password, VAL.jwt, VAL.validatorResult, JWT.verifyAdmin, VER.adminDB, VER.password, UC.userAdminReset) 

//user route to reset password using dob secret question
route.post('/self/reset', VAL.username, VAL.password, VAL.validatorResult, VER.userNotTimeout, VER.usernameDobMatchDb, UC.userSelfReset)

//signin route
route.post('/signin', VAL.username, VAL.password, VAL.validatorResult, VER.userNotFlagged, UC.userSignIn, VER.password, JWT.assign)

//signout route
route.get('/signout', VAL.jwt, VAL.validatorResult, JWT.signout) 

//signup route
route.post('/signup', VAL.username, VAL.newPassword, VAL.dob, VAL.validatorResult, VER.usernameAvailable, UC.userSignUp)

//route for user to change current password
route.post('/update/password', VAL.password, VAL.newPassword, VAL.jwt, VAL.validatorResult, JWT.verifyUser, VER.userInDB, VER.userNotFlagged, VER.password, UC.updatePassword)  

//route for user to change current usernam
route.post('/update/username', VAL.password, VAL.newUsername, VAL.jwt, VAL.validatorResult, JWT.verifyUser, VER.userInDB, VER.userNotFlagged, VER.password, VER.newUsernameAvailable, UC.updateUsername)

module.exports = route