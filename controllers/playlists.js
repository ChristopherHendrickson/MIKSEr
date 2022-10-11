const express = require('express')
const router = express.Router()
const Playlist = require('../models/playlists')
const ensureLogin = require('connect-ensure-login')

const { search, getToken, getTrack } = require('../lib/spotifyAPIfuncs')
const User = require('../models/users')

const limit=10


//INDEX
router.get('/playlists', async (req,res)=>{
    const playlists = await Playlist.find()

    res.render('index.ejs', {
        playlists:playlists,
        tabTitle:'update title',
        currentUser:req.user,
        viewingOwn:false,
    })
})
//PERSONAL INDEX
router.get('/playlists/user/:username', async (req,res)=> {
    if (req.user.username===req.params.username) {
        const usersPlaylists = await Playlist.find({creator:req.params.username})
        res.render('index.ejs', {
            playlists:usersPlaylists,
            tabTitle:'update title',
            currentUser:req.user,
            viewingOwn:true,
        })
    } else {
        res.redirect(`/playlists/user/${req.user.username}`)
    }
})

//NEW
router.get('/playlists/new', ensureLogin.ensureLoggedIn(), (req,res)=>{
    res.render('new.ejs', {
        currentUser:req.user,
        tabTitle:'title'
    })
})

//CREATE
router.post('/playlists', async (req,res)=>{
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
        warp:req.body.warp,
        likedBy:[],
        likes:0,
    }
    await Playlist.create(newPlaylist)
    res.redirect('/playlists')
})

//EDIT SHOW
router.get('/playlists/edit/:id', async (req,res)=>{
    const playlist = await Playlist.findById(req.params.id)
    const selectedTracks = {}
    playlist.tracks.forEach((track)=>{
        selectedTracks[track.display]=track
    })
    res.render('edit.ejs', {
        playlist,
        selectedTracks:JSON.stringify(selectedTracks),
        currentUser:req.user,
        tabTitle:'title'
    })
})

//EDIT
router.put('/playlists/:id', async (req,res)=>{
    const playlist = await Playlist.findById(req.params.id)
    const tracks = JSON.parse(req.body.tracks)
    const trackList = []
    for (const [key, value] of Object.entries(tracks)) {
        trackList.push(value)
      }
      
    const newPlaylist = {
        name:playlist.name,
        creator:playlist.creator,
        creator_id:playlist.user_id,
        tracks:trackList,
        length:trackList.length,
        warp:req.body.warp,
        likedBy:playlist.likedBy,
        likes:playlist.likes,
    }
    await Playlist.findByIdAndUpdate(req.params.id,newPlaylist,{new:true})
    res.redirect(`/playlists/user/${playlist.creator}`)
})

router.delete('/playlists/:id', async (req,res)=>{
    console.log('delete route')
    const deleteObject = await Playlist.findByIdAndRemove(req.params.id)
    console.log(`deleted ${deleteObject.name} from DB`)
    res.redirect(`/playlists/user/${req.user.username}`)
  })


//SHOW 
router.get('/playlists/:id', async (req,res)=>{
    const playlist = await Playlist.findOne({_id:req.params.id})
    res.render('show.ejs', {
        playlist:playlist,
        tabTitle:`MIKSEr | ${playlist.name}`,
        currentUser:req.user
        
    })
})




//BLANK SEARCH
router.get('/search', (req,res)=>{
    setTimeout(() => {
        res.send([])
    }, 10);
})


router.get('/',(req,res)=>{
    res.render('home.ejs')
})

//API SEARCH
router.get('/search/:query', async (req,res)=>{
    await getToken()
        .then((token)=>{
            const searchResult = search(token,req.params.query,limit)
            return searchResult
        })
        .then((data)=>{
            const results = []
            if (data.tracks) { //if the token is invalid, the spotify api will return an error object, this will not execute and an empty list will be retured
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
            }
            res.send(results) 
        })
})

//Database search
router.get('/database/:id', async (req,res)=>{
    const playlist = await Playlist.findOne({_id:req.params.id})
    
    res.send(playlist)
})


module.exports = router