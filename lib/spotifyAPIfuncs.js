
require('dotenv').config()
const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
const authorizationString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
const Token = require('../models/token')



const getToken = async () => {
    const tokens = await Token.find()
    const dbToken = tokens[0] //there should only ever be one token in the collection. 
    
    
    if (!dbToken || dbToken.expiration<=Date.now()) {
        
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : `Basic ${authorizationString}`
            },
            body: 'grant_type=client_credentials'
        });
        const data = await result.json();
        //if somehow there is no token in the database, create a new one
        if (!dbToken) {
            // console.log('did not find a token... creating token')
            Token.create({
                token:data.access_token,
                expiration:Date.now()+data.expires_in*1000-60000 //10 min buffer
                
            })
            // console.log('created token... exipres in', data.expires_in, ' seconds')
        //otherwise update existing
        } else {
            // console.log('token expired... updating token')
            //uddate token in db
            dbToken.token = data.access_token
            dbToken.expiration = Date.now()+data.expires_in*1000-60000 //10 min buffer
            dbToken.save()
            console.log('updated token... exipres in', data.expires_in, ' seconds')

            //return new token
        }
        return data.access_token;

    } else {
        // console.log('token still active, using existing')
        // console.log('expires at ',dbToken.expiration,' which is in ',(dbToken.expiration-Date.now())/1000, ' seconds')
        return dbToken.token
    }
}

//Get Track is not currently used
const getTrack = async (token, trackId) => {

    const result = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + token}
    });

    const data = await result.json();

    return data;
}




const search = async (token,query,limit,offset=0) => {
    const results = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=${limit}&offset=${offset}`, {
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