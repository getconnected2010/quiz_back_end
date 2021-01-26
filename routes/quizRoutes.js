const express = require('express')
const router = express.Router()
const JWT= require('../util/jwtUtil')
const QC= require('../controller/quizController')
const VAL = require('../util/validator')
//const CK= require('../util/cookies')
const VER = require('../util/verify')


router.post('/add', VAL.addQA, VAL.jwt, VAL.validatorResult, JWT.verifyAdmin,  QC.addQa)

router.delete('/delete/:id', VAL.id, VAL.jwt, VAL.validatorResult, JWT.verifyAdmin, QC.deleteQa)

router.get('/list/:subject', VAL.subject, VAL.validatorResult, QC.getQa)

router.get('/scores', VAL.jwt, VAL.validatorResult, JWT.verifyUser, QC.fetchScores) 

router.post('/score', VAL.subject, VAL.jwt, VAL.validatorResult, JWT.verifyUser, QC.recordScore)
 
module.exports= router