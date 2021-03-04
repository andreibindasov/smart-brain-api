const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const urlExists = require('url-exists');
const morgan = require('morgan')

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const db = knex({
  // connect to your own database here
  client: 'pg',
  connection: process.env.POSTGRES_URI
  // {
    // // host : '127.0.0.1',
    // host : process.env.POSTGRES_HOST,
    // // user : 'postgres',
    // user : process.env.POSTGRES_USER,
    // // password : 'postgres',
    // password : process.env.POSTGRES_PASSWORD,
    // // database : 'smartbrain'
    // database : process.env.POSTGRES_DB

  // }
});

const app = express();

app.use(morgan('combined'))
app.use(cors())
app.use(bodyParser.json());

app.get('/', (req, res)=> { res.send("IT's WORKING") })
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db)})
app.post('/profile/:id', (req, res) => { profile.handleProfileUpdate(req, res, db) } )
app.post('/signin', signin.signinAuthentication(db, bcrypt))
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res)})
app.put('/image', (req, res) => { 
  
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



app.get('/ranking', (req, res)=> {
  
  // return db('submits')
  //   .join('users','submits.user_id', 'users.id')
  //       .select('users.name')
  //       .count('submits.user_id', {as: 'count'})
  //       .groupBy('users.name')
  //       .orderBy('count', 'desc')
  return db('users')    
    .select('name', 'entries') 
    .orderBy('entries','desc') 
    .then(rows => {
      // console.log(rows)
      res.json(rows)
    })
    .catch(err => console.log("ERROR " + err))
                
})

app.listen(3333, ()=> {
  console.log('app is running on port 3333');
})
