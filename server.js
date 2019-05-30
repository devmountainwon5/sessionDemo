const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const massive = require('massive');
const session = require('express-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;

require('dotenv').config();

const app = express();

massive(process.env.CONNECTION_STRING)
    .then((dbInstance)=>{
        app.set('db', dbInstance)
        console.log('The DB is working')
    })
app.use(cors());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  }))

app.use(bodyParser.json());

app.post('/api/register', (req, res, next) => {
    // Get DB instance
    const db = req.app.get('db');

    // Set up varaibles off of req.body
    const {email, password} = req.body;

    //Check to make sure is new user.
    
    db.user_table.findOne({email})
        .then((user)=>{
            // Send back message if email was there
            if(user){
               throw('Sorry this email already exists. Please login.')
            }else{ // Make New user
                /// Encrypt password
                return bcrypt.hash(password, saltRounds);
            }
        })
        .then((hash) => {
            /// create new user with hashed password.
            return db.user_table.insert({email, password:hash})
          })
        // assign user to session. 
        .then((user)=>{
            //This is very very important
            delete user.password;
            //Assign user to session
            req.session.user = user;
            // Send message
            res.send('Registered!')
        })
        .catch((err)=>{
            res.send(err)
        })

})

app.post('/api/login', (req, res) => {
    // Get Db instance
    const db = req.app.get('db');

    // Set up vars from req.body
    const {email, password} = req.body;
    let currentUser;
    // Try to login. 
    //1. Check to make sure is user
    db.user_table.findOne({email})
        .then((user)=>{
            if(!user){
                throw('No user found. Please Register')
            }else{
    //2. Check password
                currentUser = user; 
                return bcrypt.compare(password, user.password)            
            }
        })
    //3. If its a match assign user to session else throw error?    
        .then((correctPassword) => {
            if(correctPassword){
                delete currentUser.password;
                req.session.user =currentUser;
                res.send('Logged in')
            }else{
                throw('Sorry your credentials didnt match')
            }
        })
        .catch((err)=>{
            res.send(err)
        })

})

app.use((req, res)=>{

})




const port = process.env.PORT || 8055;
app.listen(port, ()=>{
    console.log(`Humming on port ${port}`)
})