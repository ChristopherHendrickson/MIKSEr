const express=require('express')
const app=express()

const methodOverride = require('method-override')
const session = require('express-session')
const mongoDBSession = require('connect-mongodb-session')
const passport = require('passport')
const flash = require('express-flash')
const Playlist = require('./models/playlists')
const User = require('./models/users')
const mongoose = require('mongoose')
const playlistsRouter = require('./controllers/playlists')
const authRouter = require('./controllers/auth')
const { notFoundHandler, errorHandler } = require('./middlewares/error-handlers')



require('dotenv').config()
const PORT = process.env.PORT
const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
const dbURL = process.env.MONGODB_URL

const mongoDBStore = mongoDBSession(session)
const sessionStore = new mongoDBStore({
  uri:dbURL,
  collection:'sessions'
})



app.use(express.static('public'))
app.use(methodOverride('_method'))
app.use(express.urlencoded({extended:true}))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}))

app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(authRouter)
app.use(playlistsRouter)
app.use(notFoundHandler)
app.use(errorHandler)






//LISTENER
app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`)
})
  

//DB CONNECT
mongoose.connect(dbURL, ()=>{
    console.log('connected to database')
})
