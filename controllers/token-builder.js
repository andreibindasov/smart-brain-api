const jwt = require('jsonwebtoken')
const redis = require('redis')

// setup Redis:
const redisClient = redis.createClient(process.env.REDIS_URI)


const signToken = (email) => {
    const jwtPayload = { email }
    return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '2 days' })
}
  
const setToken = (key, value) => {
    return Promise.resolve(redisClient.set(key, value))
}

const createSessions = (user) => {
// JWT token, return user data

const { email, id } = user
const token = signToken(email)

return setToken(token, id)
        .then(() => { 
            return { success: 'true', user, token }
        })
        .catch(console.log)
// return { success: 'true', user : {_user:user._user, _links:user._links}, token }
}

module.exports = {
    createSessions : createSessions
}