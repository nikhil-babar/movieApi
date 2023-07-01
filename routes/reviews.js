const express = require("express")
const router = express.Router()
const cors = require('cors')
const Review = require('../models/review')
const auth = require("../middleware/authentication")
const bodyParser = require('body-parser')

require('dotenv').config()

router.use(bodyParser.urlencoded({ extended: true }))
router.use(express.json())

router.get('/:id', auth, async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const page = (isNaN(req.query.page)) ? 1 : parseInt(req.query.page)
        const limit = (isNaN(req.query.limit)) ? 1 : parseInt(req.query.limit)

        if (isNaN(id)) {
            res.status(422).json({ message: 'Invalid parameters' })
            return
        }

        const totalCount = await Review.countDocuments({ movieId: id })

        if (totalCount === 0) {
            res.status(404).json({ message: 'no review available' })
            return
        }

        const index = (page - 1) * limit
        const next = (page * limit > totalCount) ? null : page + 1
        const previous = (page <= 1) ? null : page - 1

        const reviews = await Review.find({ movieId: id }).sort({ updatedAt: -1 }).skip(index).limit(limit)

        res.status(200).json({ totalCount, next, previous, limit, reviews })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: 'server side error' })
    }
})

router.post('/', auth, async (req, res) => {
    try {
        const review = new Review({ ...req.body })
        const response = await review.save()

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
