import React, { FC, useEffect, useState, ReactElement } from 'react'
import { registerGameListener, sendGameMessage } from '../api'
import {
    AddPlayerMessage,
    isGameStateMessage,
    ServerMessage,
    ChangeGameStateMessage,
    RemovePlayerMessage, isErrorMessage, isGameUpdateMessage, isPlayerUpdateMessage
} from '../models/message'
import { Button, Grid } from '@material-ui/core'
import { Opponent } from '../models/opponent'
import { JoinGameButton } from './JoinGameButton'
import { Card } from '../models/card'
import { Table } from './table/Table'
import { Players } from './Players'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Dialog from '@material-ui/core/Dialog'
import DialogContentText from '@material-ui/core/DialogContentText'

export const Game: FC = (): ReactElement => {
    const [playerName, setPlayerName] = useState<string>('')
    const [participating, setParticipating] = useState<boolean>(false)
    const [gameActive, setGameActive] = useState<boolean>(false)
    const [players, setPlayers] = useState<Opponent[]>([])
    const [deckTop, setDeckTop] = useState<Card>()
    const [playerOnTurn, setPlayerOnTurn] = useState<string | undefined>()
    const [cards, setCards] = useState<Card[]>([])
    const [lastMessage, setLastMessage] = useState<string>('')
    const [open, setOpen] = React.useState(false)

    const closeDialog = (): void => {
        setOpen(false)
    }

    const handleMessage = (message: ServerMessage): void => {
        if (isErrorMessage(message)) setLastMessage(message.message)
        else if (isGameStateMessage(message)) {
            setGameActive(message.active)
            setPlayers(message.players)
        } else if (isGameUpdateMessage(message)) {
            setPlayers(message.players)
            setDeckTop(message.deckTop)
            setPlayerOnTurn(message.playerOnTurn)
            setLastMessage(message.message)
        } else if (isPlayerUpdateMessage(message)) {
            setCards(message.cards)
            if (message.winner) setOpen(true)
        }
    }

    const onServerDisconnect = (): void => {
        setParticipating(false)
        setGameActive(false)
        setPlayers([])
    }

    useEffect(() => {
        registerGameListener(handleMessage, onServerDisconnect)
    }, [])

    const joinGame = (player: string): void => {
        const message: AddPlayerMessage = {
            type: 'add_player',
            player,
        }
        sendGameMessage(message, (success: boolean) => setParticipating(success))
    }

    const leaveGame = (): void => {
        const message: RemovePlayerMessage = {
            type: 'remove_player',
        }
        sendGameMessage(message)
        setParticipating(false)
    }

    const startGame = (): void => {
        const message: ChangeGameStateMessage = {
            type: 'change_game',
            active: true,
        }
        sendGameMessage(message)
    }

    const stopGame = (): void => {
        const message: ChangeGameStateMessage = {
            type: 'change_game',
            active: false,
        }
        sendGameMessage(message)
    }

    return (
        <div>
            <h1>Dicks and Balls</h1>
            <Grid container spacing={2} justify="center">
                <Grid item>
                    <JoinGameButton name={playerName} setName={setPlayerName} gameActive={gameActive} participating={participating}
                                    onJoin={joinGame} onLeave={leaveGame}/>
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary"
                            onClick={gameActive ? stopGame : startGame}
                            disabled={players.length < 2 || !participating}
                    >
                        {gameActive ? 'End Game' : 'Start Game'}
                    </Button>
                </Grid>
            </Grid>
            <Players players={players} gameActive={gameActive} playerOnTurn={playerOnTurn} playerName={playerName} />
            <div>{lastMessage}</div>
            {gameActive && <Table playerName={playerName} participating={participating} deckTop={deckTop} playerOnTurn={playerOnTurn} cards={cards}/>}
            <Dialog
                open={open}
                onClose={closeDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">You won!</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You're a winner! <span role="img" aria-label="ta-da">🎉</span>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="primary">
                        I'm awesome!
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}