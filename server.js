const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const massive = require('massive');
const session = require('express-session');
require('dotenv').config();

const app = express();

app.use(cors());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  }))

app.use(bodyParser.json());

app.get('/api/authenticate', (req, res) => {
    req.utsession.user = {
        name:'Josh',
        id: 1,
    }
    res.send('welcome to the club!');
})

app.use((req, res, next) => {
    if(req.session.user){
        next()
    }else{
        res.send("You need to authenticate.")
    }
})

app.get('/api/hello', (req, res)=>{
    res.send(`This worked ${req.session.user.name}`)
})

const port = process.env.PORT || 8055;
app.listen(port, ()=>{
    console.log(`Humming on port ${port}`)
})