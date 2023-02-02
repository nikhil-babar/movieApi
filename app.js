const express = require("express")
const app = express()
const movieRouter = require("./routes/movies")
const userRouter = require('./routes/user')
const reviewRouter = require('./routes/reviews')
const mongoose = require('mongoose')

require('dotenv').config()

app.use(express.json())
app.use('/movies', movieRouter)
app.use('/user', userRouter)
app.use('/reviews', reviewRouter)

mongoose.set('strictQuery', true)

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
}).then(() => console.log('connected to db'))
    .catch((err) => console.log(err))

app.get("/", (req, res) => {
    res.status(200).json({message: 'hello user'})
})


app.listen(5000,['192.168.43.41','localhost'] ,()=>{
    console.log("server on port 5000");
})

