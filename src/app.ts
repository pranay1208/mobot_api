import express from 'express'
import dotenv from 'dotenv'
import { makeScrapeParams, scrapeRunner } from './scrape/runner'
import { ScrapeBody, ScrapeRequestParams } from './interface'
import { decryptText } from './crypto'

dotenv.config()

const app = express()
const PORT = parseInt(process.env.PORT)

app.use(express.json())

app.get('/', (req, res) => {
    res.status(200)
    res.send(process.env.PUBLIC_KEY)
})

//Endpoint to get data from Moodle
app.post("/scrape", async (req, res) => {
    console.log(req.body)
    const body = req.body as ScrapeBody
    let scrapeParams : ScrapeRequestParams

    body.password = decryptText(body.password)

    //validate input and convert to uniform format
    try {
        scrapeParams = makeScrapeParams(body)
    } catch(e) {
        const err = e as Error
        res.status(400)
        res.send(err.message)
        return
    }

    //run the scrape
    try {
        const responseData = await scrapeRunner(scrapeParams)
        res.status(200)
        res.send(responseData)
    } catch (err) {
        console.error("Received error", err)
        res.sendStatus(500)
    }
})

app.listen(PORT)
console.log(`Server running on port ${PORT}`)