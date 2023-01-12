const express = require("express")
const router = express.Router()
const cors = require('cors')
const db = require('mongoose')
const Review = require('../models/review')
const auth = require("../middleware/authentication")
const bodyParser = require('body-parser')

require('dotenv').config()

db.set('strictQuery', true)

db.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
}).then(() => console.log('connected to db'))
    .catch((err) => console.log(err))

router.use(cors({
    origin: ['http://192.168.43.41:3000', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))

router.use(bodyParser.urlencoded({ extended: true }))
router.use(express.json())

router.get('/:id', auth, async (req, res) => {
    try {
        const id = parseInt(req.params.id)

        if (!id || isNaN(id)) {
            res.status(422).json({ message: 'Invalid parameters' })
            return
        }

        const reviews = await Review.where({ movieId: id }).populate('user', 'name userName')

        res.status(200).json({ reviews })
    } catch (error) {
        res.status(500).json({ message: 'server side error' })
    }
})

router.post('/', auth, async (req, res) => {
    try {
        const review = new Review({ ...req.body, user: req.user._id })
        const response = await review.save()

        delete response.user

        res.status(201).json(response)
    } catch (error) {
        console.log(error)
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