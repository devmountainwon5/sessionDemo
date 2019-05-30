const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const massive = require('massive');
const session = require('express-session');
const bcrypt = require('bycrpt');
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

app.post('/api/register', (req, res) => {
    // Get DB instance
    const db = req.app.get('db');

    // Set up varaibles off of req.body
    const {email, password} = req.body;

    //Check to make sure is new user.
    
    db.user_table.findOne({email})
        .then((user)=>{
            // Send back message if email was there
            if(user){
                res.send('Sorry this email already exists. Please login.')
            }else{ // Make New user
                /// Encrypt password
                bcrypt.hash(password, saltRounds, (err, hash) => {
                    if(err){ // Handle error
                        res.send('Something broke')
                    }else{
                        /// create new user with hashed password.
                        return db.user_table.insert({email, password:hash})
                    }
                  });
            }
        })
        // assign user to session. 
        .then((user)=>{
            console.log(user);
            res.send('check')
        })

})

app.post('/api/login', (req, res) => {
    
})

app.use((req, res)=>{

})




const port = process.env.PORT || 8055;
app.listen(port, ()=>{
    console.log(`Humming on port ${port}`)
})