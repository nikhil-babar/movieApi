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

                const token = new refreshToken({
                    token: jwt.sign({ ...user }, process.env.REFRESH_TOKEN_SECRET)
                })

                await token.save()

                res.cookie('token', token.token, {
                    httpOnly: true,
                })

                res.status(200).json({
                    user,
                    accessToken: jwt.sign({ ...user }, process.env.ACCESS_TOKEN_SECRET, {
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
        
        res.status(200).json({
            user: user._doc,
            accessToken: jwt.sign({ ...user._doc }, process.env.ACCESS_TOKEN_SECRET, {
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
        if (validate(req.body)) {
            if (! await isAvailable(req.body.userName)) {
                res.status(409).json({ message: 'userName already taken' })
            } else {
                const user = new User({ ...req.body, password: await bcrypt.hash(req.body.password, 10) })
                await user.save()

                const token = new refreshToken({
                    token: jwt.sign({ ...user }, process.env.REFRESH_TOKEN_SECRET)
                })

                await token.save()

                res.cookie('token', token.token, {
                    httpOnly: true,
                })


                res.status(200).json({
                    user,
                    accessToken: jwt.sign({ ...user }, process.env.ACCESS_TOKEN_SECRET, {
                        expiresIn: '60s'
                    })
                })
            }
        } else {
            res.status(422).json({ message: 'invalid input' })
        }

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: 'server side error' })
    }
})

const validate = (loginData) => {
    for (const key of INPUT_FIELDS) {
        if (typeof loginData[key] === 'undefined' || loginData[key] === null || loginData[key].length === 0) {
            return false
        }

        switch (key) {
            case "name":
                if (loginData[key].match(/(\n|[^a-zA-Z\s])/)) {
                    return false
                }
                break
            case "age":
                if (isNaN(loginData[key]) || Number(loginData[key]) < 10 || Number(loginData[key] > 110)) {
                    return false
                }
                break
            case "bio":
                if (!loginData[key].match(/\S/)) {
                    return false
                }
                break
            case "gender":
                break
            case "userName":
                if (loginData[key].match(/(\n|\s|[^a-zA-Z[0-9]]|(^[^a-zA-Z]))/)) {
                    return false
                }
                break
            case "password":
                if (loginData[key].match(/(\n|\s)/)) {
                    return false
                }
                break
            default:
                return false
        }
    }

    return true
}

const isAvailable = async (userName) => {
    const user = await User.exists({ userName: userName })
    console.log(user)
    return user === null ? true : false
}

module.exports = router