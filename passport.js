const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const User = require('./models/User')

const verifyUser = (email, password, done) => {
  User.findOne({ email })
    .then((user) => {
      if (!user)
        return done(null, false, { message: 'This email is not registered' })
      bcrypt.compare(password, user.password).then((match) => {
        if (match) return done(null, user)
        return done(null, false, { message: 'Incorrect Password' })
      })
    })
    .catch((err) => done(err, false))
}

const verifyAuth = (passport) => {
  passport.use(new LocalStrategy({ usernameField: 'email' }, verifyUser))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((_id, done) => {
    User.findById(_id, (err, user) => done(err, user))
  })
}

module.exports = verifyAuth
