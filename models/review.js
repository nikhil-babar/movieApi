const mongoose = require('mongoose')

const review = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        validate: {
            validator: (e) => {
                return (e && e.length > 0 && e.length < 30 && ! e.match(/(^[^a-zA-Z0-9])/))
            },
            message: 'Invalid title'
        }
    },
    likes: {
        type: Number,
        min: 0,
        default: 0
    },
    dislikes: {
        type: Number,
        min: 0,
        default: 0
    },
    movieId: {
        type: Number,
        min: 0,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    uid: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
        minLength: 10,
    },
}, {
    timestamps: true
})

const model = mongoose.model('Review', review)

module.exports = model