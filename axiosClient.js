const {default: axios} = require('axios')

require('dotenv').config()

module.exports = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    params: {
        api_key: process.env.API_KEY
    }
})