const express = require("express")
const router = express.Router()
const cors = require('cors')
const fetch = require('node-fetch')
const auth = require('../middleware/authentication')

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
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))

router.use(express.json())


router.get("/", auth , (req, res) => {
    const data = []

    const promises = sliderDetails.map((e) => {
        return fetch(e.url)
    })

    Promise.all(promises)
        .then(response => {
            return Promise.all(response.map(e => e.json()))
        }).then(output => {

            for (let i = 0; i < sliderDetails.length; i++) {
                data.push({
                    title: sliderDetails[i].title,
                    data: output[i]['results']
                })
            }

            res.status(200).json(data)
        }).catch(err => {
            console.log(err)
            res.status(500).json({ message: err.message })
        })

})

router.get("/:id", auth,  (req, res) => {
    const movieId = req.params.id

    const urls = [`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.API_KEY}`,
    `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${process.env.API_KEY}&language=en-US&page=1`,
    `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${process.env.API_KEY}&language=en-US&page=1`]

    const promises = urls.map((url) => {
        return fetch(url)
    })

    Promise.all(promises)
        .then(response => {
            if (response.status === 404) {
                res.status(404).json({ message: 'resource was not available' })
            }
            return Promise.all(response.map(e => e.json()))
        }).then(output => {
            res.status(200).json({
                details: output[0],
                crew: getCrewDetails(output[1].cast, output[1].crew),
                related: output[2].results
            })
        }).catch(err => {
            console.log(err)
            res.status(500).json({ message: err.message })
        })

})

router.get("/genre/:id", (req, res)=>{

    const page = req.query.page
    
    if(isNaN(page) || req.query.genre.match('/[^0-9,]/')) res.status(422).json({message: 'Invalid parameters'})

    const url = new URL(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.API_KEY}`)
    url.searchParams.append('page', page)
    url.searchParams.append('with_genres', req.query.genre)

    fetch(url.href)
        .then((response)=>{
            if(response.status === 200){
                console.log(response.headers)
                return response.json()
            }
            return Promise.reject('Invalid fetch request for genre route')
        })
        .then((data)=>{
            res.status(200).json({
                ...data
            })
        })
        .catch((err)=>{
            console.log(err)
            res.status(500).json({
                message: 'Server side error'
            })
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
        if(element["known_for_department"].localeCompare('Acting') === 0){
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