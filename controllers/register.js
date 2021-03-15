const tokenBuilder = require('./token-builder')
const { createSessions } = tokenBuilder

const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password, age, phone} = req.body;

  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }

  db.select('email').from('users')
    .where('email', email).orWhere('name', name)
    .then(result => {
      if (result.length !==0) {
        return res.status(400).json('This username or Email is taken!')
      } else {
        const hash = bcrypt.hashSync(password);
        db.transaction(trx => {
          trx.insert({
            hash: hash,
            email: email
          })
          .into('login')
          .returning('email')
          .then(loginEmail => {
            return trx('users')
              .returning('*')
              .insert({
                email: loginEmail[0],
                name: name,
                age: age,
                phone: phone,
                joined: new Date()
              })
              .then(user => user[0])
              .then(data => {
                createSessions(data)
                .then(session => {
                  res.json(session)})
              })
              
          })
          .then(trx.commit)
          .catch(trx.rollback)
        })
        .catch(err => res.status(400).json('unable to register'))
      }
          
    })

    
}

module.exports = {
  handleRegister : handleRegister
}


