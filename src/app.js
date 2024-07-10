const express = require('express')
require('dotenv').config()
require('./db/db')
const app = express()
const userRoutes = require('./routes/user')
const TaskRoutes = require('./routes/task')
const cors = require('cors')

app.use(
    cors({
        origin: "*"
    })
)

const port = process.env.PORT

app.use(express.json())

app.use(userRoutes)
app.use(TaskRoutes)

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})