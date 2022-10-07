const express=require('express')
const app=express()
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config()
app.use(express.static('public'))
const PORT = 3000

const clientId = '57852aea98324d35bcd740ec2956a782'
const clientSecret = '2ecb740301db42988337177902e5703c'
const authorizationString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
const songId = '0nJdcCGiQ1mKKTq8yaUCiH'
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

    return results
}



app.get('/search/:query', async (req,res)=>{
    getToken()
        .then((token)=>{
            const searchResults = search(token,req.params.query,limit)
            return searchResults
        })
        .then(results=>results.json())
        .then((data)=>{
            const results = []
            data.tracks.items.forEach((track)=>{
                if (track.preview_url) {
                    const trackName = track.name
                    const trackArtist = track.artists[0].name
                    // console.log(trackName + ' by ' + trackArtist + '. sample: ' + track.preview_url)
                    results.push({
                        track:trackName,
                        artist:trackArtist
                    })
                }
            })
            console.log(results)
            return results
        })
        .then((results)=>{
            res.send(results)
        })
})

app.get('/search', (req,res)=>{
    setTimeout(() => {
        res.send([])
    }, 1000);
})

app.get('/',(req,res)=>{
    res.render('new.ejs')
})

//LISTENER
app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`)
  })
  

