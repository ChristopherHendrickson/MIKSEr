const mongoose = require('mongoose')
const Schema = mongoose.Schema

const playlistSchema= new Schema({
    creator:{type:String, required:true},
    tracks:[{}],
    length:Number,
    warp:{typee:String, required:true}
})

const Playlist = mongoose.model('playlist', playlistSchema)

module.exports = Playlist
