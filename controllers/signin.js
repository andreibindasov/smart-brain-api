const jwt = require('jsonwebtoken')
const redis = require('redis')

// setup Redis:
const redisClient = redis.createClient(process.env.REDIS_URI)



const handleSignin = (db, bcrypt, req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    // return res.status(400).json('incorrect form submission');
    return Promise.reject('incorrect form submission');
  }

  return db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', email)
          .then(user => {
            return db.select('link').from('submits')
              .where('user_id','=',user[0].id)
              .then(rows => ({
                    _user:user[0],
                    _links:rows
                  })
              )
          })
          .catch(err => Promise.reject('unable to get user'))
      } else {
        Promise.reject('wrong credentials')
      }
    })
    .catch(err => Promise.reject('wrong credentials'))

  // db.select('email', 'hash').from('login')
  //   .where('email', '=', email)
  //   .then(data => {
  //     const isValid = bcrypt.compareSync(password, data[0].hash);
  //     if (isValid) {
  //       return db.select('*').from('users')
  //         .where('email', '=', email)
  //         .then(user => {
  //           db.select('link').from('submits')
  //             .where('user_id','=',user[0].id)
  //             .then(rows => {
                
  //               console.log(rows)
  //               res.json({_user:user[0], _links:rows})
  //             })
            
  //           // res.json(user[0])
  //         })
  //         .catch(err => res.status(400).json('unable to get user'))
  //     } else {
  //       res.status(400).json('wrong credentials')
  //     }
  //   })
  //   .catch(err => res.status(400).json('wrong credentials'))
}

const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(400).json('Unauthorized attempt!')
    }

    return res.json({id: reply})
  })

}

const signToken = (email) => {
  const jwtPayload = { email }
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '2 days' })
}

const setToken = (key, value) => {
  return Promise.resolve(redisClient.set(key, value))
}

const createSessions = (user) => {
  // JWT token, return user data
  
  const { email, id } = user._user
  const token = signToken(email)
  return setToken(token, id)
            .then(() => { 
              return { success: 'true', user: {_user:user._user, _links:user._links}, token }
            })
            .catch(console.log)
  // return { success: 'true', user : {_user:user._user, _links:user._links}, token }
}

const signinAuthentication = (db, bcrypt) => (req,res) => {
  const { authorization } = req.headers
  return authorization ? 
          getAuthTokenId(req, res) : 
          handleSignin(db, bcrypt, req, res)
            .then(data => {
              
              return data._user.id && data._user.email ? createSessions(data) : Promise.reject(data)
            })
            .then(session => res.json(session))
            .catch(err => res.status(400).json(err))
}

module.exports = {
  signinAuthentication: signinAuthentication,
  redisClient: redisClient
}