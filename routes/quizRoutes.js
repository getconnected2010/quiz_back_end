const express = require('express')
const router = express.Router()
const JWT= require('../util/jwtUtil')
const QC= require('../controller/quizController')
const VAL = require('../util/validator')
//const CK= require('../util/cookies')
const VER = require('../util/verify')


router.post('/add/:userToken', VAL.user_id, VAL.addQA, VAL.validatorResult, JWT.verifyAdmin,  QC.addQa)  //CK.verifyAdmin, CK.refresh, VER.adminDB,

router.delete('/delete/:id/:user_id/:userToken', VAL.id, VAL.user_id, VAL.validatorResult, JWT.verifyAdmin, QC.deleteQa)  //CK.verifyAdmin, CK.refresh,  VER.adminDB,

router.get('/list/:subject', VAL.subject, VAL.validatorResult, QC.getQa)

router.get('/scores/:user_id/:userToken', VAL.user_id, VAL.validatorResult, JWT.verifyUser, QC.fetchScores)  //CK.verifyLoggedUser, CK.refresh, VER.userInDB, 

router.post('/score/:userToken', VAL.user_id, VAL.subject, VAL.validatorResult, JWT.verifyUser, QC.recordScore)  //CK.verifyLoggedUser, CK.refresh, VER.userInDB,
 
module.exports= router