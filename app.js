const express = require("express")
const app = express()
const movieRouter = require("./routes/movies")
const userRouter = require('./routes/user')
const cors = require("cors")

require('dotenv').config()

app.use(express.json())
app.use('/movies', movieRouter)
app.use('/user', userRouter)

app.get("/", (req, res) => {
    res.status(200).json({message: 'hello user'})
})


app.listen(5000,['192.168.43.41','localhost'] ,()=>{
    console.log("server on port 5000");
})

