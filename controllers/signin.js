const jwt = require('jsonwebtoken')

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

const getAuthTokenId = () => {
  console.log('auth ok')
}

const signToken = (email) => {
  const jwtPayload = { email }
  return jwt.sign(jwtPayload, 'superhiddenstring', { expiresIn: '2 days' })
}

const createSessions = (user) => {
  // JWT token, return user data
  
  const { email } = user._user
  const token = signToken(email)
  return { success: 'true', user : {_user:user._user, _links:user._links}, token }
}

const signinAuthentication = (db, bcrypt) => (req,res) => {
  const { authorization } = req.headers
  return authorization ? 
          getAuthTokenId() : 
          handleSignin(db, bcrypt, req, res)
            .then(data => {
              
              return data._user.id && data._user.email ? createSessions(data) : Promise.reject(data)
            })
            .then(session => res.json(session))
            .catch(err => res.status(400).json(err))
}

module.exports = {
  signinAuthentication: signinAuthentication
}