import React, { FC, useEffect, useState, ReactElement } from 'react'
import './Game.css'
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
import { Card, Suit } from '../models/card'
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
    const [colorChangedTo, setColorChangedTo] = useState<Suit | undefined>()
    const [skippingNextPlayer, setSkippingNextPlayer] = useState<boolean>(false)
    const [cardsInDeck, setCardsInDeck] = useState<string>('')
    const [openNameTaken, setOpenNameTaken] = React.useState(false)
    const [openWinner, setOpenWinner] = React.useState(false)
    const [openLoser, setOpenLoser] = React.useState(false)

    const closeDialog = (): void => {
        setOpenWinner(false)
        setOpenLoser(false)
        setOpenNameTaken(false)
    }

    const handleWin = (): void => {
        setOpenWinner(true)
        const audio = new Audio('/sounds/win31.mp3')
        audio.play().then()
    }

    const handleLoss = (): void => {
        setOpenLoser(true)
        const audio = new Audio('/sounds/sadTrombone.mp3')
        audio.play().then()
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
            setColorChangedTo(message.changeColorTo)
            setSkippingNextPlayer(message.skippingNextPlayer)
            setCardsInDeck(message.cardsInDeck)
        } else if (isPlayerUpdateMessage(message)) {
            setCards(message.cards)
            if (message.winner) handleWin()
            else if (message.loser) handleLoss()
        }
    }

    const onServerDisconnect = (): void => {
        setParticipating(false)
        setGameActive(false)
        setPlayers([])
    }

    useEffect(() => {
        registerGameListener(handleMessage, onServerDisconnect)
    }, [handleMessage, onServerDisconnect])

    const joinGame = (player: string): void => {
        const message: AddPlayerMessage = {
            type: 'add_player',
            player,
        }
        sendGameMessage(message, (success: boolean) => {
            setParticipating(success)
            if (!success) setOpenNameTaken(true)
        })
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

    const shouldShowTable = (): boolean => {
        if (gameActive) return true
        // if there is a winner/loser among the players show the latest played game
        return players.some(player => player.winner || player.loser)

    }

    return (
        <div>
            <h1>Dicks and Balls</h1>
            <Grid container spacing={2} justify="center">
                <Grid item>
                    <JoinGameButton name={playerName} setName={setPlayerName} gameActive={gameActive}
                                    participating={participating}
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
            <Players players={players} gameActive={gameActive} playerOnTurn={playerOnTurn} playerName={playerName} participating={participating}/>
            {shouldShowTable() && <div className="message">{lastMessage}</div>}
            {shouldShowTable() &&
            <Table playerName={playerName} participating={participating} deckTop={deckTop} playerOnTurn={playerOnTurn}
                   cards={cards} colorChangedTo={colorChangedTo} skippingNextPlayer={skippingNextPlayer} cardsInDeck={cardsInDeck}/>}
            <Dialog
                open={openWinner}
                onClose={closeDialog}
                aria-labelledby="You won"
                aria-describedby="You won the game dialog"
            >
                <DialogTitle>You won!</DialogTitle>
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
            <Dialog
                open={openLoser}
                onClose={closeDialog}
                aria-labelledby="You lost"
                aria-describedby="You lost the game dialog"
            >
                <DialogTitle>You lost!</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You're a loser! <span role="img" aria-label="thumb-down">👎</span>
                        <br/>
                        Close this window and shuffle the cards!
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="primary">
                        I suck
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openNameTaken}
                onClose={closeDialog}
                aria-labelledby="This name is already taken"
                aria-describedby="This name is already taken dialog"
            >
                <DialogTitle>This name is already taken</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please choose a different one
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}