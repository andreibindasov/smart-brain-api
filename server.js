const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const urlExists = require('url-exists');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const db = knex({
  // connect to your own database here
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'postgres',
    database : 'smartbrain'
  }
});

const app = express();

app.use(cors())
app.use(bodyParser.json());

app.get('/', (req, res)=> { res.send(db.users) })
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db)})
app.post('/signin', signin.handleSignin(db, bcrypt))
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res)})
app.put('/image', (req, res) => { 
  
  console.log(req.body.imageUrl)
  
  urlExists(req.body.imageUrl, (err, exists)=>{
    if (exists && (req.body.imageUrl.toLowerCase().includes('.jpg') || 
                   req.body.imageUrl.toLowerCase().includes('.gif') || 
                   req.body.imageUrl.toLowerCase().includes('.png') || 
                   req.body.imageUrl.toLowerCase().includes('.bing'))) {
        image.handleImage(req, res, db)
    } else {
        res.json("URL doesn't exist")
    }
  })
})


app.listen(3333, ()=> {
  console.log('app is running on port 3333');
})
