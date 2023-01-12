const mongoose = require('mongoose')

const user = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        validate: {
            validator: (e) => {
                return !e?.match(/(\n|[^a-zA-Z\s])/)
            },
            message: 'Invalid Name'
        }
    },
    age: {
        type: Number,
        required: true,
        min: [12, "You should be 13 and above to use this website"],
        max: 120,
    },
    gender: {
        type: String,
        validate: {
            validator: (e) => {
                return ['male','female','other','not to specify'].includes(e.toLowerCase())
            },
            message: 'Invalid gender'
        }
    },
    userName: {
        type: String,
        validate: {
            validator: async function (e) {
                return (e && !e.match(/(\n|\s|[^a-zA-Z[0-9]]|(^[^a-zA-Z]))/) && ! await mongoose.model('User').exists({userName: e}))
            },
            message: 'Invalid Username',
        }
    },
    password: {
        type: String,
        validate: {
            validator: (e) => {
                return !e?.match(/(\n|\s)/)
            },
            message: 'Invalid password'
        }
    },
    bio: String
})

const model = mongoose.model('User', user)

module.exports = model