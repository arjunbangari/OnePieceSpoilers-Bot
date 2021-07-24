const mongoose = require('mongoose')

const mangaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    spoilersLastChapter: {
        type: Number,
    },
    spoilersText: {
        type: String,
        default: ''
    },
    mangaLastChapter: {
        type: Number,
    }
})

const Manga = mongoose.model('Manga', mangaSchema)

module.exports = Manga