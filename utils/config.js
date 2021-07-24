require('dotenv').config()

const TOKEN = process.env.TOKEN
let MONGODB_URI = process.env.MONGODB_URI

module.exports = {
  TOKEN,
  MONGODB_URI
}