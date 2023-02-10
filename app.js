const express = require("express")
const app = express()
const movieRouter = require("./routes/movies")
const reviewRouter = require('./routes/reviews')
const mongoose = require('mongoose')
const admin = require('firebase-admin')

const firebaseConfig = {
    "type": process.env.TYPE,
    "project_id": proccess.env.PROJECT_ID,
    "private_key_id": proccess.env.PRIVATE_KEY_ID,
    "private_key": proccess.env.PRIVATE_KEY,
    "client_email": proccess.env.CLIENT_EMAIL,
    "client_id": proccess.env.CLIENT_ID,
    "auth_uri": proccess.env.AUTH_URI,
    "token_uri": proccess.env.TOKEN_URI,
    "auth_provider_x509_cert_url": proccess.env.AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": proccess.env.CLIENT_X509_CERT_URL
}

admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig)
})

app.use(express.json())
app.use('/movies', movieRouter)
app.use('/reviews', reviewRouter)

mongoose.set('strictQuery', true)

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
}).then(() => console.log('connected to db'))
    .catch((err) => console.log(err))


app.get("/", (req, res) => {
    res.status(200).json({ message: 'hello user' })
})


app.listen(5000, process.env.PORT, () => {
    console.log("server on port 5000");
})

