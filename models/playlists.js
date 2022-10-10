const mongoose = require('mongoose')
const Schema = mongoose.Schema

const playlistSchema = new Schema({
    name:{type:String, required:true},
    creator:{type:String, required:true},
    creator_id:{type:String, required:true},
    tracks:[{}],
    length:Number,
    warp:{type:String, required:true},
    likeCount:Number,
    likedBy:[String],
    display:String
})

const Playlist = mongoose.model('playlist', playlistSchema)

module.exports = Playlist
