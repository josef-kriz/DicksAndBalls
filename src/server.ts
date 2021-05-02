import express from 'express'
import * as socketIo from 'socket.io'
import { gameListener } from './listeners/gameListener'
import * as path from 'path'

const isDevelopment = process.env.NODE_ENV === 'development'
const port = process.env.PORT || 3001

const app = express()

app.use(express.static('./client/www'))

app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, '../client/www', 'index.html'));
})

const server = app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}.`)
})

const socketOptions = isDevelopment ? {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"],
        credentials: true,
    },
} : {}

export const io = new socketIo.Server()
io.attach(server, socketOptions)

io.on('connection', gameListener)
