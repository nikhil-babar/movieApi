const express = require("express")
const router = express.Router()
const cors = require('cors')
const auth = require('../middleware/authentication')
const axios = require('axios')

require('dotenv').config()

const sliderDetails = [
    {
        title: 'Upcoming movies',
        url: `https://api.themoviedb.org/3/movie/upcoming?api_key=${process.env.API_KEY}&language=en-US&page=1`
    },
    {
        title: 'Top trending',
        url: `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.API_KEY}&language=en-US&page=1`
    },
    {
        title: 'Top rated',
        url: `https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.API_KEY}&language=en-US&page=1`
    }
]

router.use(cors({
    origin: ['http://192.168.43.41:3000', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))

router.use(express.json())

router.get("/", auth,  (_req, res) => {
    const data = []

    const promises = sliderDetails.map((e) => {       
        return axios.get(e.url)
    })

    Promise.all(promises)
        .then(response => {
            for (let i = 0; i < sliderDetails.length; i++) {
                data.push({
                    title: sliderDetails[i].title,
                    data: response[i].data.results
                })
            }

            res.status(200).json(data)
        }).catch(err => {
            console.log(err)
            res.status(500).json({ message: err.message })
        })

})

router.get("/search", auth, async (req, res) => {
    try {
        const url = new URL(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&language=en-US&page=1`)

        if (!req.query.term) {
            res.status(422).json({ message: "Invalid input" })
            return
        }

        url.searchParams.append('query', req.query.term)

        const response = await axios.get(url.href)

        res.status(200).json(response.data)

    } catch (error) {
        res.status(500).json(error.message)
    }
})

router.get("/genre", auth, async (req, res) => {
    try {
        const page = req.query.page
        const genre = req.query.genre

        if (isNaN(page) || isNaN(genre)) res.status(422).json({ message: 'Invalid parameters' })

        const url = new URL(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.API_KEY}`)
        url.searchParams.append('page', page)
        url.searchParams.append('with_genres', genre)

        const response = await axios.get(url.href)

        res.status(200).json(response.data)
    } catch (error) {
        res.status(500).json(error.message)
    }
})

router.get("/:id", auth, (req, res) => {
    const movieId = req.params.id

    const urls = [`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.API_KEY}`,
    `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${process.env.API_KEY}&language=en-US&page=1`,
    `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${process.env.API_KEY}&language=en-US&page=1`]

    const promises = urls.map((url) => {
        return axios.get(url)
    })

    Promise.all(promises)
        .then(response => {
            res.status(200).json({
                details: response[0].data,
                crew: getCrewDetails(response[1].data.cast, response[1].data.crew),
                related: response[2].data.results
            })
        }).catch(err => {
            if (err.response?.status === 404) {
                res.status(404).json({ message: 'resource was not available' })
            }
            console.log(err)
            res.status(500).json({ message: err.message })
        })
})


function getCrewDetails(cast, crew) {
    const crewDetails = {
        cast: [],
        directors: [],
        producers: [],
        writers: []
    }

    cast.forEach(element => {
        if (element["known_for_department"].localeCompare('Acting') === 0) {
            crewDetails.cast.push(element)
        }
    });

    crew.forEach(element => {
        switch (element["known_for_department"]) {
            case 'Directing':
                crewDetails.directors.push(element)
                break
            case 'Production':
                crewDetails.producers.push(element)
                break
            case 'Writing':
                crewDetails.writers.push(element)
                break
            default:
                break
        }
    })

    return crewDetails
}

module.exports = router;