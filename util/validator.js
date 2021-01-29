const {check, validationResult} = require ('express-validator')

//express validator middleware to check & sanitize user inputs
exports.validatorResult = (req, res, next)=>{
    const result= validationResult(req)  //any errors in validation are collected here
    if(!result.isEmpty()){   //if any errors present, server sends reject to client with error messages
        if(result.errors[0].msg) return res.status(422).json({msg: result.errors[0].msg})
        res.status(422).json({msg: 'server detected an invalid input'})
        return
    }
    next()
}

//validates the add to questions/answers route
exports.addQA= [
    check('subject')  //checks incoming subject data
        .escape()
        .trim()
        .notEmpty().withMessage('a subject area is required')
        .isLength({max:45}).withMessage('maximun of 45 characters allowed for subject')
        .isAlphanumeric().withMessage('subject field can only contain letters and numbers'),
    check('question')
        .escape()
        .trim()
        .notEmpty().withMessage('question is required')
        .isLength({max: 45}).withMessage('maximum of 45 characters allowed for question')
        .matches(/^[ a-zA-Z0-9~!@$^*()_+={}:;.?|#%&-]+$/).withMessage('only letters, numbers and special characters ~!@$^*()_+={}:;.?|#%&- allowed in question'),
    check('answer1')
        .escape()
        .trim()
        .notEmpty().withMessage('answer option #1 is required')
        .isLength({max: 45}).withMessage('maximum of 45 characters allowed for answer option #1')
        .matches(/^[ a-zA-Z0-9~!@$^*()_+={}:;.?|#%&-]+$/).withMessage('only letters, numbers and special characters ~!@$^*()_+={}:;.?|#%&- in option #1'),
    check('answer2')
        .escape()
        .trim()
        .notEmpty().withMessage('answer option #2 is required')
        .isLength({max: 45}).withMessage('maximum of 45 characters allowed for answer option #2')
        .matches(/^[ a-zA-Z0-9~!@$^*()_+={}:;.?|#%&-]+$/).withMessage('only letters, numbers and special characters ~!@$^*()_+={}:;.?|#%&- allowed in option #2'),
    check('answer3')
        .escape()
        .trim()
        .notEmpty().withMessage('answer option #3 is requied')
        .isLength({max: 45}).withMessage('maximum of 45 characters allowed for answer option #3')
        .matches(/^[ a-zA-Z0-9~!@$^*()_+={}:;.?|#%&-]+$/).withMessage('only letters, numbers and special characters ~!@$^*()_+={}:;.?|#%&- allowed in option #3'),
    check('answer4')
        .escape()
        .trim()
        .notEmpty().withMessage('answer option #4 is required')
        .isLength({max: 45}).withMessage('maximum of 45 characters allowed for answer option #4')
        .matches(/^[ a-zA-Z0-9~!@$^*()_+={}:;.?|#%&-]+$/).withMessage('only letters, numbers and special characters ~!@$^*()_+={}:;.?|#%&- allowed in option #4'),
    check('correct')
        .escape()
        .trim()
        .notEmpty().withMessage('a correct answer must be identified')
        .isLength({max: 45}).withMessage('maximum of 45 characters allowed as a correct answer')
        .matches(/^[ a-zA-Z0-9~!@$^*()_+={}:;.?|#%&-]+$/).withMessage('only letters, numbers and special characters ~!@$^*()_+={}:;.?|#%&- in correct answer')
     //custom validation to check if 'correct' field value matches atleast one of the other fields
        .custom((value, {req})=>{   
            if(![req.body.answer1, req.body.answer2, req.body.answer3, req.body.answer4].includes(value)){  //Array.includes(value) format
                throw new Error ("correct answer value doesn't match any of the answer options")
            }else{
                return value
            }
        })
]

//checks dob secret question input
exports.dob=[
    check('dob')
        .trim()
        .notEmpty().withMessage('birth month and date as MMDD format required')
        .isLength({min:4, max:4}).withMessage('birth month and date as MMDD format required')
        .isInt().withMessage('only numbers allowed as date of birth as MMDD')
]

//checks id input
exports.id=[
    check('id')
        .trim()
        .notEmpty().withMessage('id required')
        .isInt().withMessage('id must be a number')
]

//checks incoming jwt in headers
exports.jwt=[
    check('authorization')
        .trim()
        .notEmpty().withMessage('access tokens not found')
        .matches(/^[a-zA-Z0-9-_+/.]+$/).withMessage('invalid character found in access tokens')
]

exports.newPassword=[
    check('newPassword')
        .trim()
        .notEmpty().withMessage('new password is required')
        .isLength({min:6, max:12}).withMessage('new password must be 6 to 12 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$*+=:.])/).withMessage('password must contain lower case letter, upper case letter, number and special character from !@#$*+=:.')
        .matches(/^[a-zA-Z0-9!@#$*+=:.]+$/).withMessage('password can only contain letters, numbers and special characters !@#$*+=:.')//allows any of these characters
]

exports.newUsername=[
    check('newUsername')
        .escape()
        .trim()
        .notEmpty().withMessage('new username required')
        .isLength({min:4, max: 40}).withMessage('new username must be 4 to 40 characters long')
        .matches(/^[ a-zA-Z0-9~!@$^*()_+={}:;.]+$/).withMessage('username can only contain letters, numbers and special characters ~!@$^*()_+={}:;.')
]

exports.password =[
    check('password')
        .trim()
        .notEmpty().withMessage('password is required')
        .isLength({min: 4, max: 12}).withMessage('password must be 4 to 12 characters long')
        .matches(/^[a-zA-Z0-9!@#$*+=:.]+$/).withMessage('password can only contain letters, numbers and special characters !@#$*+=:.')
]

exports.subject =[
    check('subject')
        .escape()
        .trim()
        .notEmpty().withMessage('a value is required for subject')
        .isLength({max:45}).withMessage('maximum of 45 characters allowed for subject field')
        .isAlphanumeric().withMessage('subject field can only contain letters or numbers')
        .custom((value)=>{
            if(!['History', 'Geography', 'General', 'Science'].includes(value)){
                throw new Error('invalid subject field')
            }else{
                return value
            }
        })
]

exports.username=[
    check('username')
        .escape()
        .trim()
        .notEmpty().withMessage('a username value is required')
        .isLength({min:4, max:40}).withMessage('username must be 4 to 40 characters long')
        .matches(/^[ a-zA-Z0-9~!@$^*()_+={}:;.]+$/).withMessage('username can only contain letters, numbers and special characters ~!@$^*()_+={}:;.')
    ]