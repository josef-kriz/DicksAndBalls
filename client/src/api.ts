import io from 'socket.io-client'
import { ClientMessage } from './models/message'

const socket = io()

socket.on('connect', () => {
    console.log('Connected to the server')
})

export const registerGameListener = (callback: Function, disconnect: Function) => {
    // make sure no other listeners are registered
    // socket.off('server_event')
    // socket.off('disconnect')

    socket.on('server_event', callback)
    socket.on('disconnect', disconnect)
}

export const sendGameMessage = (message: ClientMessage, callback?: Function): void => {
    socket.emit('player_event', message, callback)
}
