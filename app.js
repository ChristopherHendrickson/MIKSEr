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
// const playlistsRouter = require('./controllers/playlists')
const authRouter = require('./controllers/auth')




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

//app.use routers here

app.use(authRouter)
// app.use(playlistsRouter)











//THINGS THAT WILL BE MOVED TO ROUTERS

const authorizationString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
const limit=10

const getToken = async () => {
    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded', 
            'Authorization' : `Basic ${authorizationString}`
        },
        body: 'grant_type=client_credentials'
    });

    const data = await result.json();
    // console.log('access token ',data.access_token)
    return data.access_token;
}




const getTrack = async (token, trackId) => {

    const result = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + token}
    });

    const data = await result.json();
    return data;
}




const search = async (token,query,limit) => {
    // const results = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`, {
    const results = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track,artist&limit=${limit}&offset=0`, {
        method: 'GET',
        headers: {
            'Authorization' : 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
    })
    const data = await results.json();
    return data
}






//INDEX
app.get('/playlists', async (req,res)=>{
    const playlists = await Playlist.find()

    res.render('index.ejs', {
        playlists:playlists,
        tabTitle:'update title',
        currentUser:req.user
    })
})

//NEW
app.get('/playlists/new', (req,res)=>{
    res.render('new.ejs', {

    })
})

//CREATE
app.post('/playlists', async (req,res)=>{
    const user_id=req.user._id.valueOf()
    const username=req.user.username
    const tracks = JSON.parse(req.body.tracks)
    const trackList = []
    for (const [key, value] of Object.entries(tracks)) {
        trackList.push(value)
      }
      
    const newPlaylist = {
        name:req.body.name,
        creator:username,
        creator_id:user_id,
        tracks:trackList,
        length:trackList.length,
        warp:req.body.warp
    }
    await Playlist.create(newPlaylist)
    res.redirect('/playlists')
})

//EDIT SHOW
app.get('/playlists/:id/edit', (req,res)=>{

})

//EDIT
app.put('/playlists/:id', (req,res)=>{

})


//SHOW 
app.get('/playlists/:id', async (req,res)=>{
    const playlist = await Playlist.findOne({_id:req.params.id})
    res.render('show.ejs', {
        playlist:playlist,
        tabTitle:`MIKSEr | ${playlist.name}`,
        currentUser:req.user
        
    })
})




//BLANK SEARCH
app.get('/search', (req,res)=>{
    setTimeout(() => {
        res.send([])
    }, 10);
})


app.get('/',(req,res)=>{
    res.render('home.ejs')
})

//API SEARCH
app.get('/search/:query', async (req,res)=>{

    getToken()
        .then((token)=>{
            const searchResults = search(token,req.params.query,limit)
            return searchResults
        })
        .then((data)=>{
            const results = []
            data.tracks.items.forEach((track)=>{
                if (track.preview_url) {
                    const trackName = track.name
                    const trackArtist = track.artists[0].name
                    results.push({
                        track:trackName,
                        artist:trackArtist,
                        id:track.id,
                        preview:track.preview_url,
                        popularity:track.popularity,
                        image:track.album.images[0].url,
                        display:`${trackName} - ${trackArtist}`
                    })
                }
            })
            res.send(results)
        })
})      

//Database search
app.get('/database/:id', async (req,res)=>{
    const playlist = await Playlist.findOne({_id:req.params.id})
    
    res.send(playlist)
})



















//LISTENER
app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`)
})
  

//DB CONNECT
mongoose.connect(dbURL, ()=>{
    console.log('connected to database')
})
