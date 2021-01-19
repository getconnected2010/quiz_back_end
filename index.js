const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser= require('body-parser')
const quizRoutes= require('./routes/quizRoutes')
const userRoutes = require('./routes/userRoutes')
const cookieParser= require('cookie-parser')

//resolves access-control-allow-origin header error for axios. add the 'corsOptions' obj in cors(corsOptions) middleware
const whiteList=['http://localhost:3000', 'http://localhost:8000']
const corsOptions={
    origin: (origin, callback)=>{
        if(!origin || whiteList.indexOf(origin)!== -1){
            callback(null, true)
        } else{
            callback(new Error(`Not allowed by CORS ${origin}`))
        }
    }
}

//resolves access-control-allow-credentials header error for axios
app.use((req, res, next)=>{
    res.header({'Access-Control-Allow-Credentials':true})
    next()
})

app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(cookieParser())

//quiz route
app.use('/quiz', quizRoutes)
//user route
app.use('/user', userRoutes)

const PORT= process.env.PORT || 8000
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})