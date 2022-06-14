const express = require('express')
const colors = require('colors')
const dotenv = require('dotenv').config()
const { errorHandler } = require('./middleware/errorMiddleware')
const connectDB = require('./config/db')
const port = process.env.PORT || 5000

/// connect to MongoDB
connectDB()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

/// API here {
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/seasons', require('./routes/seasonRoutes'))
app.use('/api/clubs', require('./routes/clubRoutes'))
app.use('/api/players', require('./routes/playerRoutes'))
app.use('/api/rankings', require('./routes/rankingRoutes'))
app.use('/api/matches', require('./routes/matchRoutes'))
app.use('/api/goals', require('./routes/goalRoutes'))

/// } end API section

app.use(errorHandler)

app.listen(port, () => console.log(`Server started on port ${port}`))