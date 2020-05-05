import { Socket } from 'socket.io'
import {
    AddPlayerMessage,
    AddTableMessage,
    ChatMessage,
    ClientMessage,
    ErrorMessage,
    isAddPlayerMessage,
    isChangeGameMessage,
    isJoinTableMessage,
    isPlayersTurnMessage,
    isRemovePlayerMessage,
    JoinTableMessage,
    PlayerUpdateMessage
} from '../models/message'

import { io } from '../server'
import { PlayerAction } from '../models/playerAction'
import { tables } from '../tables'

export function gameListener(socket: Socket): void {
    const clientId = socket.id
    let tableId = 'main'
    console.log(`* User ${clientId} connected`)

    socket.emit('table_event', tables.getTableUpdateMessage())
    socket.emit('server_event', tables.getGame(tableId).getGameStateMessage())

    tables.onTableRemove({
        id: clientId,
        cb: () => socket.emit('table_event', tables.getTableUpdateMessage()),
    })

    socket.on('table_event', async (message: AddTableMessage, callback?: Function) => {
        try {
            const newTable = tables.addTable(message.name)
            io.emit('table_event', tables.getTableUpdateMessage())
            callback && callback(undefined, newTable.id)
        } catch (e) {
            callback && callback(e.message)
        }
    })

    socket.on('chat_message', async ({author, text}: ChatMessage) => {
        socket.to(tableId).emit('chat_message', {
            author,
            text,
            own: false,
        })
        socket.emit('chat_message', {
            author,
            text,
            own: true,
        })
        console.log(`* Message from ${clientId} (${author}) [${tableId}]: ${text}`)
    })

    const getErrorMessage = (error: Error): ErrorMessage => {
        console.log('! An error occurred: ', error.message)
        return {
            type: 'error',
            message: error.message,
        }
    }

    const joinTable = (message: JoinTableMessage, callback?: Function): void => {
        try {
            socket.leave(tableId)
            if (tableId !== message.id) tableId = message.id
            socket.join(tableId)
            socket.emit('server_event', tables.getGame(tableId).getGameStateMessage())
        } catch (e) {
            socket.emit('server_event', getErrorMessage(e))
            callback && callback(true)
        }
    }

    const addPlayer = (message: AddPlayerMessage, callback?: Function): void => {
        try {
            tables.getGame(tableId).addPlayer({
                id: clientId,
                name: message.player,
                cards: [],
                place: 0,
                canBeBroughtBack: false,
                loser: false,
            })

            callback && callback('success')
            io.to(tableId).emit('server_event', tables.getGame(tableId).getGameStateMessage())
            io.emit('table_event', tables.getTableUpdateMessage())
        } catch (e) {
            callback && callback(e.message)
        }
    }

    const removePlayer = (table: string): void => {
        try {
            tables.getGame(table).removePlayer(clientId)
            io.to(table).emit('server_event', tables.getGame(table).getGameStateMessage())
            socket.emit('server_event', {
                type: 'player_update',
                cards: [],
                place: 0,
                loser: false,
            } as PlayerUpdateMessage)
        } catch (e) {
            console.log('* Remove player error, skipping')
        } finally {
            io.emit('table_event', tables.getTableUpdateMessage())
        }
    }

    const startGame = (): void => {
        try {
            tables.getGame(tableId).startGame(clientId)
            for (const playerMessage of tables.getGame(tableId).getAllPlayerMessages()) {
                io.to(`${playerMessage.playerId}`).emit('server_event', playerMessage.message)
            }
            io.to(tableId).emit('server_event', tables.getGame(tableId).getGameStateMessage())
            io.to(tableId).emit('server_event', tables.getGame(tableId).getGameUpdateMessage())
        } catch (e) {
            socket.emit('server_event', getErrorMessage(e))
        }
    }

    const stopGame = (): void => {
        tables.getGame(tableId).stopGame()
        io.to(tableId).emit('server_event', tables.getGame(tableId).getGameStateMessage())
    }

    const handlePlayersTurn = (action: PlayerAction): void => {
        try {
            const message = tables.getGame(tableId).handlePlayersTurn(clientId, action)
            io.to(tableId).emit('server_event', message.gameState)
            io.to(tableId).emit('server_event', message.gameUpdate)
            for (const playerMessage of message.players)
                io.to(`${playerMessage.player}`).emit('server_event', playerMessage.playerUpdate)
        } catch (e) {
            socket.emit('server_event', getErrorMessage(e))
        }
    }

    socket.on('disconnect', () => {
        console.log(`* User ${clientId} disconnected`)
        removePlayer(tableId)
        tables.deregisterCallback(clientId)
    })

    socket.on('player_event', async (message: ClientMessage, callback?: Function) => {
        console.log(`* Message received from client ${clientId}:`, message)
        if (isJoinTableMessage(message)) joinTable(message, callback)
        else if (isAddPlayerMessage(message)) addPlayer(message, callback)
        else if (isRemovePlayerMessage(message)) removePlayer(message.tableId)
        else if (isChangeGameMessage(message) && message.active) startGame()
        else if (isChangeGameMessage(message) && !message.active) stopGame()
        else if (isPlayersTurnMessage(message)) handlePlayersTurn(message.action)
        else {
            console.error('* Unrecognized message type')
        }
    })
}
