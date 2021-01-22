const express = require('express')
const router = express.Router()
const QC= require('../controller/quizController')
const VAL = require('../util/validator')
//const CK= require('../util/cookies')
const VER = require('../util/verify')


router.post('/add', VAL.user_id, VAL.addQA, VAL.validatorResult,  VER.adminDB, QC.addQa)  //CK.verifyAdmin, CK.refresh,

router.delete('/delete/:id/:user_id', VAL.id, VAL.user_id, VAL.validatorResult,  VER.adminDB, QC.deleteQa)  //CK.verifyAdmin, CK.refresh,

router.get('/list/:subject', VAL.subject, VAL.validatorResult, QC.getQa)

router.get('/scores/:user_id', VAL.user_id, VAL.validatorResult, VER.userInDB, QC.fetchScores)  //CK.verifyLoggedUser, CK.refresh, 

router.post('/score', VAL.user_id, VAL.subject, VAL.validatorResult,  VER.userInDB, QC.recordScore)  //CK.verifyLoggedUser, CK.refresh,
 
module.exports= router