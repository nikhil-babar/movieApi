const express = require("express")
const router = express.Router()
const cors = require('cors')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const refreshToken = require('../models/refreshToken')
const db = require('mongoose')
const jwt = require('jsonwebtoken')
const INPUT_FIELDS = Object.keys(User.schema.paths).filter((value) => value !== '_id' && value !== '__v')
const cookieParser = require('cookie-parser')


db.set('strictQuery', true)

db.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
}).then(() => console.log('connected to db'))
    .catch((err) => console.log(err))

router.use(bodyParser.urlencoded({ extended: true }))
router.use(express.json())
router.use(cookieParser())
router.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))

router.post('/login', async (req, res) => {
    try {
        const { userName, password } = req.body

        if (userName && password) {
            const user = await User.findOne({
                userName: userName,
            })

            if (user && bcrypt.compare(password, user.password)) {
                delete user.password
                delete user.iat

                const token = new refreshToken({
                    token: jwt.sign({...user}._doc, process.env.REFRESH_TOKEN_SECRET)
                })

                await token.save()

                res.cookie('token', token.token, {
                    httpOnly: true,
                })

                res.status(200).json({
                    user,
                    accessToken: jwt.sign({...user}._doc, process.env.ACCESS_TOKEN_SECRET, {
                        expiresIn: '60s'
                    })
                })

            } else {
                res.status(404).json({ message: 'user not found' })
            }
        } else {
            res.status(422).json({ message: 'invalid input' })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: 'server side error' })
    }
})

router.get("/getAccessToken", (req, res) => {
    const token = req.cookies?.token;

    try {
        const user = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

        delete user.iat

        res.status(200).json({
            user: user.name,
            accessToken: jwt.sign({...user}, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '60s'
            })
        })

    } catch (error) {
        res.clearCookie('token')
        res.status(403).json({ message: 'Invalid Refresh token' })
    }
})

router.post("/createAccount", async (req, res) => {
    try {
        const data = new User({ ...req.body, password: await bcrypt.hash(req.body.password, 10) })
        const user = data.save()

        const token = new refreshToken({
            token: jwt.sign({...user}._doc, process.env.REFRESH_TOKEN_SECRET)
        })

        await token.save()

        res.cookie('token', token.token, {
            httpOnly: true,
        })

        res.status(200).json({
            user,
            accessToken: jwt.sign({...user}._doc, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '60s'
            })
        })

    } catch (error) {
        console.log(error.message)

        if (error?.name === 'ValidationError') {
            let response = {}
            let message = error.errors
            console.log(message)

            Object.keys(message).forEach((key) => {
                response[key] = message[key].message
            })

            res.status(400).json({ ...response })
            return
        }

        res.status(500).json({ message: 'server side error' })
    }
})

module.exports = router