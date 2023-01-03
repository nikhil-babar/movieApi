const mongoose = require('mongoose')

const refreshToken = new mongoose.Schema({
    token: String
})

const model = mongoose.model('Token', refreshToken)

module.exports = model