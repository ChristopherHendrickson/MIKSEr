const express = require('express')
const router = express.Router()
const Playlist = require('../models/playlists')
const ensureLogin = require('connect-ensure-login')

const { search, getToken, getTrack } = require('../lib/spotifyAPIfuncs')
const User = require('../models/users')



const searchSpotifyTracks = async (query,limit,offset) => {
    const results = []
    await getToken()
    .then((token)=>{
        const searchResult = search(token,query,limit,offset)
        return searchResult
    })
    .then((data)=>{
        if (data.tracks) {
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
                        image:track.album?.images?.[0]?.url,
                        display:`${trackName} - ${trackArtist}`
                    })
                }
            })
        }
        
    })
    return results
}


//INDEX
router.get('/playlists', async (req,res)=>{
    const playlists = await Playlist.find()

    res.render('index.ejs', {
        playlists:playlists,
        tabTitle:'MIKSEr | Browse',
        currentUser:req.user,
        viewingOwn:false,
    })
})
//PERSONAL INDEX
router.get('/playlists/user/:username', ensureLogin.ensureLoggedIn(), async (req,res)=> {
    if (req.user) {
        if (req.user.username===req.params.username) {
            const usersPlaylists = await Playlist.find({creator:req.params.username})
            res.render('index.ejs', {
                playlists:usersPlaylists,
                tabTitle:`MIKSEr | ${req.params.username}`,
                currentUser:req.user,
                viewingOwn:true,
            })
        } else {
            res.redirect(`/playlists/user/${req.user.username}`)
        }
    } else {
        res.redirect(`/login`)
    }
})

//NEW
router.get('/playlists/new', ensureLogin.ensureLoggedIn(), (req,res)=>{
    res.render('new.ejs', {
        currentUser:req.user,
        tabTitle:'MIKSEr | New'
    })
})

//CREATE
router.post('/playlists', ensureLogin.ensureLoggedIn(), async (req,res)=>{
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
    res.redirect('/playlists') //redirecting before await to speed up the redirect. Reduces the likelihood of duplicates being made by double clicking the submit, firing two posts.

    await Playlist.create(newPlaylist)

})

//EDIT SHOW
router.get('/playlists/edit/:id', ensureLogin.ensureLoggedIn(), async (req,res,next)=>{
    try {
        const playlist = await Playlist.findById(req.params.id)
        const selectedTracks = {}
        playlist.tracks.forEach((track)=>{
            selectedTracks[track.display]=track
        })
        res.render('edit.ejs', {
            playlist,
            selectedTracks:JSON.stringify(selectedTracks),
            currentUser:req.user,
            tabTitle:'MIKSEr'
        })
    } catch (error) {
        next(error)
    }
})

//EDIT
router.put('/playlists/:id', ensureLogin.ensureLoggedIn(), async (req,res,next)=>{
    try {
        const playlist = await Playlist.findById(req.params.id)
        const tracks = JSON.parse(req.body.tracks)
        const trackList = []
        for (const [key, value] of Object.entries(tracks)) {
            trackList.push(value)
        }
        
        const newPlaylist = {
            name:req.body.name,
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
    } catch (error) {
        next(error)
    }
})

//DELETE
router.delete('/playlists/:id', ensureLogin.ensureLoggedIn(), async (req,res)=>{
    console.log('delete route')
    const deleteObject = await Playlist.findByIdAndRemove(req.params.id)
    console.log(`deleted ${deleteObject.name} from DB`)
    res.redirect(`/playlists/user/${req.user.username}`)
  })


//SHOW RANDOM

router.get('/playlists/random/:warp', async (req,res)=>{
    const warp = req.params.warp.charAt(0).toUpperCase() + req.params.warp.slice(1)
    
    const playlist = {
        name:'Random: ' + warp,
        creator:'MIKSEr',
        warp:warp,
        tracks:[],
        _id:null,
    }

    let l = 50 //search limit
    const maxOffset = 220
    let randomOffset = Math.floor(Math.random()*maxOffset)
    const minPopularity = 77
    const maxPlaylistLength = 2
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    const vowels = 'aeiou'
    let randomCharacter = chars[Math.floor(Math.random()*chars.length)] + vowels[Math.floor(Math.random()*vowels.length)] + chars[Math.floor(Math.random()*chars.length)]

    while (playlist.tracks.length<maxPlaylistLength) { 

        let results = await searchSpotifyTracks(randomCharacter,l,randomOffset) //searching for 20 as songs without preview urls are not added back. Higher limit create less chance of recalling api 
        // console.log('start for, checking songs: ',results.length,' from input: ',randomCharacter, 'at offset: ',randomOffset)
        for (let result of results) {
            if (!result.track.includes('`') && !result.artist.includes(`'`) && result.popularity>=minPopularity) {
                playlist.tracks.push(result);
                break //only add one song from each call so each song is not from the same search query string
            }
        }
        randomOffset = Math.floor(Math.random()*maxOffset)
        randomCharacter = chars[Math.floor(Math.random()*chars.length)] + vowels[Math.floor(Math.random()*vowels.length)] + chars[Math.floor(Math.random()*chars.length)]
    }

    playlist.length=playlist.tracks.length
    res.render('show.ejs', {
        playlist:playlist,
        tabTitle:`MIKSEr | ${playlist.name}`,
        currentUser:req.user
        
    })
})



//SHOW 
router.get('/playlists/:id', async (req,res,next)=>{
    try {
        const playlist = await Playlist.findOne({_id:req.params.id})
        res.render('show.ejs', {
            playlist:playlist,
            tabTitle:`MIKSEr | ${playlist.name}`,
            currentUser:req.user
            
        })
    } catch (error) {
        next(error)
    }
})




//BLANK SEARCH
router.get('/search', (req,res)=>{
    res.send([])
})


router.get('/',(req,res)=>{
    res.redirect('/playlists')
})

//API SEARCH
router.get('/search/:query/:offset', async (req,res,next)=>{
    try {
        const results = await searchSpotifyTracks(req.params.query,9,req.params.offset)
        res.send(results)
    } catch(error) {
        next(error)
    }
})

//Database search
router.get('/database/:id', async (req,res,next)=>{
    try {
        const playlist = await Playlist.findOne({_id:req.params.id})
        
        res.send(playlist)
    } catch(error) {
        next(error)
    }
})


module.exports = router