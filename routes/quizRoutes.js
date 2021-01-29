const express = require('express')
const router = express.Router()
const JWT= require('../util/jwtUtil')
const QC= require('../controller/quizController')
const VAL = require('../util/validator')

//all quiz routes

//admin route to add to questions/answers into db
router.post('/add', VAL.addQA, VAL.jwt, VAL.validatorResult, JWT.verifyAdmin, QC.addQa)

//admin route to delete question off db
router.delete('/delete/:id', VAL.id, VAL.jwt, VAL.validatorResult, JWT.verifyAdmin, QC.deleteQa)

//route gets questions/answers based on specific subject area
router.get('/list/:subject', VAL.subject, VAL.validatorResult, QC.getQa)

//fetch score of a user from db
router.get('/scores', VAL.jwt, VAL.validatorResult, JWT.verifyUser, QC.fetchScores) 

//post score of a user in db
router.post('/score', VAL.subject, VAL.jwt, VAL.validatorResult, JWT.verifyUser, QC.recordScore)
 
module.exports= router