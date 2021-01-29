require('dotenv').config()
const mysql= require('mysql')

//creates an instance of db configuration depending on production or dev env
const pool = process.env.NODE_ENV==='production'?
    //production env mysql config
    mysql.createPool({
        connectionLimit: 10,  //number of parallel connections to db
        host: process.env.HOST,
        user: process.env.USER,
        password:process.env.PASSWORD,
        database: process.env.DATABASE

    })
    :
    //dev env mysql config
    mysql.createPool({
        connectionLimit: 10,
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'quiz'
    })

    //checks connection at initial startup
pool.getConnection((err, connection)=>{
    if(err){
        console.log('error connecting to db')
    }else{
        console.log('connected to db')
    }
})

module.exports= pool //access pool to make db calls from server files