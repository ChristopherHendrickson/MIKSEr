const notFoundHandler = (req,res) => {
    res.status(404).render('404.ejs')
}

const errorHandler = (error,req,res,next) => {
    res.status(500).send('Internal Server Error 500')
}


module.exports = {
    notFoundHandler,
    errorHandler
}