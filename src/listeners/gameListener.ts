import { Socket } from 'socket.io'
import {
    AddPlayerMessage,
    ClientMessage,
    ErrorMessage,
    isAddPlayerMessage, isChangeGameMessage, isPlayersTurnMessage,
    isRemovePlayerMessage
} from '../models/message'
import { game } from '../game'
import { io } from '../server'
import { PlayerAction } from '../models/playerAction'

export function gameListener(socket: Socket): void {
    const clientId = socket.id
    console.log(`* User ${clientId} connected`)
    socket.emit('server_event', game.getGameStateMessage())

    const getErrorMessage = (error: Error): ErrorMessage => {
        console.log('! An error occurred: ', error.message)
        return {
            type: 'error',
            message: error.message,
        }
    }

    const addPlayer = (message: AddPlayerMessage, callback?: Function): void => {
        try {
            game.addPlayer({
                id: clientId,
                name: message.player,
                cards: [],
                place: 0,
                canBeBroughtBack: false,
                loser: false,
            })

            callback && callback('success')
            io.emit('server_event', game.getGameStateMessage())
        } catch (e) {
            callback && callback(e.message)
        }
    }

    const removePlayer = (): void => {
        game.removePlayer(clientId)
        io.emit('server_event', game.getGameStateMessage())
    }

    const startGame = (): void => {
        try {
            game.startGame(clientId)
            for (const playerMessage of game.getAllPlayerMessages()) {
                io.to(`${playerMessage.playerId}`).emit('server_event', playerMessage.message)
            }
            io.emit('server_event', game.getGameStateMessage())
            io.emit('server_event', game.getGameUpdateMessage('The game has started'))
        } catch (e) {
            socket.emit('server_event', getErrorMessage(e))
        }
    }

    const stopGame = (): void => {
        game.stopGame()
        io.emit('server_event', game.getGameStateMessage())
    }

    const handlePlayersTurn = (action: PlayerAction): void => {
        try {
            const message = game.handlePlayersTurn(clientId, action)
            io.emit('server_event', message.gameState)
            io.emit('server_event', message.gameUpdate)
            for (const playerMessage of message.players)
                io.to(`${playerMessage.player}`).emit('server_event', playerMessage.playerUpdate)
        } catch (e) {
            socket.emit('server_event', getErrorMessage(e))
        }
    }

    socket.on('disconnect', () => {
        console.log(`* User ${clientId} disconnected`)
        removePlayer()
    })

    socket.on('player_event', async (message: ClientMessage, callback?: Function) => {
        console.log(`* Message received from client ${clientId}:`, message)
        if (isAddPlayerMessage(message)) addPlayer(message, callback)
        else if (isRemovePlayerMessage(message)) removePlayer()
        else if (isChangeGameMessage(message) && message.active) startGame()
        else if (isChangeGameMessage(message) && !message.active) stopGame()
        else if (isPlayersTurnMessage(message)) handlePlayersTurn(message.action)
        else {
            console.error('* Unrecognized message type')
        }
    })
}
