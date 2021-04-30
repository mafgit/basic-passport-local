const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const passport = require('passport')

// A middleware to protect pages like dashboard
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next()
  res.redirect('/login')
}

router.get('/', (req, res) => {
  res.render('welcome.ejs')
})

router.get('/login', (req, res) => {
  res.render('login.ejs')
})

router.get('/register', (req, res) => {
  res.render('register.ejs')
})

// In this case, only dashboard is protected
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard.ejs', { email: req.user.email })
})

router.post('/register', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).send('Both fields required')
  if (password.length < 6)
    return res.status(400).send('Password length must be 6 or more')
  bcrypt.genSalt().then((salt) => {
    bcrypt.hash(password, salt).then((hashedPassword) => {
      User.create({ email, password: hashedPassword }, (err, user) => {
        if (err) {
          console.log(err)
          res.send('Registration failed')
        } else {
          res.redirect('/login')
          console.log('user created', user)
        }
      })
    })
  })
})

// The only route in this case that needs passport.authenticate is the post login route
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  })(req, res, next) // idk why but this line is in the docs
})

router.get('/logout', (req, res, next) => {
  req.logout()
  res.redirect('/login')
})

module.exports = router
