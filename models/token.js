const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tokenSchema = new Schema({
    token:{type:String, required:true},
    expiration:{type:Date,required:true}
})

const Token = mongoose.model('token', tokenSchema)

module.exports = Token
