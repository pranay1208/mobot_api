import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = parseInt(process.env.PORT)

app.get('/', (req, res) => {
    res.status(200)
    res.send("Server up")
})

app.listen(PORT)
console.log(`Server running on port ${PORT}`)