const express = require('express')
const router = express.Router()
const QC= require('../controller/quizController')
const VAL = require('../util/validator')
const CK= require('../util/cookies')
const VER = require('../util/verify')


router.post('/add', VAL.user_id, VAL.addQA, VAL.validatorResult, CK.verifyAdmin, CK.refresh, VER.adminDB, QC.addQa)

router.delete('/delete/:id/:user_id', VAL.id, VAL.user_id, VAL.validatorResult, CK.verifyAdmin, CK.refresh, VER.adminDB, QC.deleteQa)

router.get('/list/:subject', VAL.subject, VAL.validatorResult, QC.getQa)

router.get('/scores/:user_id', VAL.user_id, VAL.validatorResult, CK.verifyLoggedUser, CK.refresh, VER.userInDB, QC.fetchScores)

router.post('/score', VAL.user_id, VAL.subject, VAL.validatorResult, CK.verifyLoggedUser, CK.refresh, VER.userInDB, QC.recordScore)

module.exports= router