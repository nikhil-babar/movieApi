const mongoose = require('mongoose')

const user = new mongoose.Schema({
    name: 'String',
    age: 'Number',
    gender: 'String',
    userName: 'String',
    password: 'String',
    bio: 'String'
})

const model = mongoose.model('User', user)

module.exports = model