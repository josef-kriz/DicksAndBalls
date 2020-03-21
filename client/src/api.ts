import io from 'socket.io-client'
import { ClientMessage } from './models/message'

const socket = io()

socket.on('connect', () => {
    console.log('Connected to the server')
})

export const registerGameListener = (cb: Function, disconnect: Function) => {
    socket.on('server_event', cb)
    socket.on('disconnect', disconnect)
}

export const sendGameMessage = (message: ClientMessage): void => {
    socket.emit('player_event', message)
}
