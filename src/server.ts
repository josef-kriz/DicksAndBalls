import express from 'express'
import socketIo from 'socket.io'
import { gameListener } from './listeners/gameListener'
import * as path from 'path'

const port = process.env.PORT || 3001

const app = express()

app.use(express.static('./client/www'))

app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, '../client/www', 'index.html'));
})

const server = app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}.`)
})

export const io = socketIo.listen(server)

io.on('connection', gameListener)
