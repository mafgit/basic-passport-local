const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const MongoStore = require('connect-mongo')
require('dotenv').config()

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log('Connected to database'))
  .catch(() => console.log('x - Connection to database has failed - x'))

const app = express()

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    // this part is only needed if you wanna store sessions in mongodb, otherwise if server restarts, you get logged out
    store: MongoStore.create({
      collectionName: 'sessions',
      // time to live for sessions in seconds
      ttl: 1209600, // 14 days (default)
      mongoUrl: process.env.MONGO_URI,
    }),
  })
)

app.use(passport.initialize())
app.use(passport.session())
require('./passport')(passport)

app.use('/', require('./routes/'))

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server running at port ${port}`))
