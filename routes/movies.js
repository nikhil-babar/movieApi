const express = require("express")
const router = express.Router()
const cors = require('cors')
const auth = require('../middleware/authentication')
const axios = require('../axiosClient')

require('dotenv').config()


const TREND = [
    {
        title: 'Upcoming movies',
        path: '/movie/upcoming'
    },
    {
        title: 'Top trending',
        path: '/movie/popular'
    },
    {
        title: 'Top rated',
        path: '/movie/top_rated'
    }
]

router.use(express.json())

router.get("/", auth,  (req, res) => {
    const data = []

    const promises = TREND.map((e) => {       
        return axios.get(e.path)
    })

    Promise.all(promises)
        .then(response => {
            for (let i = 0; i < TREND.length; i++) {
                data.push({
                    title: TREND[i].title,
                    data: response[i].data.results
                })
            }

            res.status(200).json(data)
        }).catch(err => {
            console.log("catched err" + err.message)
            res.status(500).json({ message: err.message })
        })

})

router.get("/search", auth, async (req, res) => {
    try {
        const { term } = req.query

        if (!term) {
            res.status(422).json({ message: "Invalid input" })
            return
        }

        const { data: response } = await axios.get('/search/movie', {
            params: {
                query: term
            }
        })

        res.status(200).json(response.results)

    } catch (err) {
        console.log(err.message)
        res.status(500).json({ message: err.message })
    }
})

router.get("/genre", auth, async (req, res) => {
    try {
        const page = req.query.page
        const genre = req.query.genre

        if (isNaN(page) || isNaN(genre)) {
            res.status(422).json({ message: 'Invalid parameters' })
            return
        }

        const response = await axios.get('/discover/movie', {
            params: {
                page,
                with_genres: genre
            }
        })

        res.status(200).json(response.data)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ message: err.message })
    }
})

router.get("/:id", auth, async (req, res) => {
    try {
        const movieId = req.params.id

        const { data: response } = await axios.get(`/movie/${movieId}`, {
            params: {
                append_to_response: 'videos,recommendations,credits'
            }
        })
    
        const crew = getCrewDetails(response.credits.cast, response.credits.crew)
    
        res.status(200).json({
            ...response,
            videos: response.videos.results,
            crew,
            related: response.recommendations.results
        })  

    } catch (err) {
        console.log(err.message)
        res.status(500).json({ message: err.message })
    }
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
