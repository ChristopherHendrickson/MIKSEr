
require('dotenv').config()
const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
const authorizationString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')



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




const search = async (token,query,limit,offset=0) => {
    const results = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track,artist&limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
            'Authorization' : 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
    })
    const data = await results.json();
    return data
}


module.exports = {
    search,
    getToken,
    getTrack
}