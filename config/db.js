require('dotenv').config()
const mysql= require('mysql')

const pool = process.env.NODE_ENV==='production'?
    mysql.createPool({
        connectionLimit: 10,
        host: process.env.HOST,
        user: process.env.USER,
        password:process.env.PASSWORD,
        database: process.env.DATABASE

    })
    :
    mysql.createPool({
        connectionLimit: 10,
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'quiz'
    })

pool.getConnection((err, connection)=>{
    if(err){
        console.log('error connecting to db')
    }else{
        console.log('connected to db')
    }
})

module.exports= pool