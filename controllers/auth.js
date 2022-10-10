const express = require('express')
const router = express.Router()
const User = require('../models/users')
const passport = require('passport')

router.get('/login',(req,res)=>{
    if (req.isAuthenticated()) {
        res.redirect('back')
    } else {
        res.render('login.ejs')
    }
})

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect:'/playlists',
    failureFlash:true 
}))

router.get('/register',(req,res)=>{
    if (req.isAuthenticated()) {
        res.redirect('back')
    } else {
        res.render('register.ejs')
    }
})

router.post('/register', async (req,res)=>{
    try {
        const {username, password} = req.body //object destructuring to get data from post
        const user = await User.register(     //User.register({username: 'some username'}, 'password')
            new User({ username: username }),
            password
        )

        req.login(user, () => {
            res.redirect('/playlists')
    })

    } catch (error) {
        req.flash('error',error.message)
        res.render('register.ejs')
    }
})



router.post('/logout', (req,res) => {
    req.logout(()=> {
        res.redirect('/')
    })
})



module.exports = router