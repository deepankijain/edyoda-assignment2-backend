require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

//App
const app = express()

//Express Middlewares
app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//MongoDB/Mongoose connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => console.log('MongoDB connected sucessfully!'))

//Database Schema and Model
const playerSchema = new mongoose.Schema({
  name: String,
  imageUrl: String,
})
const Player = mongoose.model('Player', playerSchema)

//Middleware
const lastPlayer = async (req, res, next) => {
  try {
    let lastPlayer = await Player.find().sort({ _id: -1 }).limit(1)
    req.lastPlayerId = lastPlayer[0]._id
  } catch (error) {
    console.log(error.stack)
  }
  next()
}

//Routes
let currentId

app.get('/', async (req, res) => {
  res.send('Hey there!!!')
})
//Adding players id for adding first player in the url in frontend manually 60f7fb4f2201e505087b7c2f
app.get('/firstplayer/', async (req, res) => {
  try {
    const response = await Player.find().sort({ _id: 1 }).limit(1)
    currentId = response[0]._id
    res.json(response[0])
  } catch (error) {
    console.log(error.message)
  }
})
app.get('/nextplayer', lastPlayer, async (req, res) => {
  try {
    if (currentId.equals(req.lastPlayerId)) {
      return res.json({ message: 'No more players!!!' })
    } else {
      const nextPlayer = await Player.findOne({ _id: { $gt: currentId } })
        .sort({ _id: 1 })
        .limit(1)
      currentId = nextPlayer._id
      res.json(nextPlayer)
    }
  } catch (error) {
    console.log(error.message)
  }
})
//Port
const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server running on port ${port}`))
