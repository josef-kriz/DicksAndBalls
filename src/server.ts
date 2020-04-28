import express from 'express'
import socketIo from 'socket.io'
import { gameListener } from './listeners/gameListener'

const port = process.env.PORT || 3001

const app = express()

app.use(express.static('./client-ionic/www'))

const server = app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}.`)
})

export const io = socketIo.listen(server)

io.on('connection', gameListener)
