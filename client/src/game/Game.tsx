import React, { FC, ReactElement, useEffect, useReducer, useState } from 'react'
import './Game.css'
import { registerGameListener, sendGameMessage } from '../api'
import {
    AddPlayerMessage,
    ChangeGameStateMessage,
    isErrorMessage,
    isGameStateMessage,
    isGameUpdateMessage,
    isPlayerUpdateMessage,
    RemovePlayerMessage,
    ServerMessage
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
import inactivityDetection from '../helpers/inactivityDetection'

interface GameState {
    active: boolean
    players: Opponent[],
    deckTop: Card[],
    playerOnTurn?: string,
    cards: Card[],
    lastMessage: {
        error: boolean
        text: string
    },
    colorChangedTo?: Suit
    isSkippingTurn: boolean
    shouldDraw: number
    isWinner: boolean
    cardsInDeck: string
}

export const Game: FC = (): ReactElement => {
    const initialState = {
        active: false,
        players: [],
        deckTop: [],
        cards: [],
        lastMessage: {
            error: false,
            text: '',
        },
        isSkippingTurn: false,
        shouldDraw: 0,
        isWinner: false,
        cardsInDeck: ''
    }

    const [error, setError] = useState<boolean>(false)
    const [playerName, setPlayerName] = useState<string>('')
    const [participating, setParticipating] = useState<boolean>(false)
    const [openNameTaken, setOpenNameTaken] = React.useState<boolean>(false)
    const [openWinner, setOpenWinner] = React.useState<boolean>(false)
    const [openLoser, setOpenLoser] = React.useState<boolean>(false)
    const [openBroughtBack, setOpenBroughtBack] = React.useState<boolean>(false)

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

    const handleBroughtBackToGame = (me: boolean = false): void => {
        if (me) setOpenBroughtBack(true)
        const audio = new Audio('/sounds/airHorn.mp3')
        audio.play().then()
    }

    const playDrawCardSound = (cards: number): void => {
        let audioFile: string
        switch (cards) {
            case 4:
                audioFile = '/sounds/crack_the_whip.mp3'
                break
            case 6:
                audioFile = '/sounds/badumtss.mp3'
                break
            case 8:
                audioFile = '/sounds/holy_shit.mp3'
                break
            default:
                return
        }
        const audio = new Audio(audioFile)
        audio.play().then()
    }

    const closeDialog = (): void => {
        setOpenWinner(false)
        setOpenLoser(false)
        setOpenNameTaken(false)
        setOpenBroughtBack(false)
    }

    const reducer = (state: GameState, message: ServerMessage) => {
        if (isErrorMessage(message)) return {
            ...state, ...{
                lastMessage: {
                    error: true,
                    text: message.message
                }
            }
        }
        else if (isGameStateMessage(message)) {
            const {active, players} = message

            return {
                ...state,
                active,
                players,
            }
        } else if (isGameUpdateMessage(message)) {
            const {players, colorChangedTo, deckTop, playerOnTurn, skippingNextPlayer, shouldDraw, cardsInDeck, broughtBackToGame, drewCards} = message
            if (playerOnTurn === playerName && state.active) inactivityDetection.startDetecting()
            if (broughtBackToGame) handleBroughtBackToGame(broughtBackToGame === playerName)
            playDrawCardSound(drewCards)

            return {
                ...state,
                players,
                colorChangedTo,
                deckTop,
                playerOnTurn,
                lastMessage: {
                    error: false,
                    text: message.message,
                },
                isSkippingTurn: participating && skippingNextPlayer && playerOnTurn === playerName,
                shouldDraw: playerOnTurn === playerName ? shouldDraw : 0,
                cardsInDeck,

            }
        } else if (isPlayerUpdateMessage(message)) {
            const {cards, place, loser} = message
            if (place > 0) handleWin()
            else if (loser) handleLoss()

            return {
                ...state,
                cards,
                isWinner: place > 0
            }
        }
        return state
    }

    const [gameState, setGameState] = useReducer(reducer, initialState)

    useEffect(() => {
        const onServerDisconnect = (): void => {
            setParticipating(false)
            setError(true)
        }

        const onServerMessage = (message: ServerMessage): void => {
            if (error) setError(false)
            setGameState(message)
        }

        registerGameListener(onServerMessage, onServerDisconnect)
    }, [error])

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
        if (error) return false
        if (gameState.active) return true
        // if there is a winner/loser among the players show the latest played game
        return gameState.players.some(player => player.place > 0 || player.loser)
    }

    return (
        <div>
            <h1>Dicks and Balls</h1>
            <Grid container spacing={2} justify="center">
                <Grid item>
                    <JoinGameButton name={playerName} setName={setPlayerName} gameActive={gameState.active}
                                    participating={participating} isWinner={gameState.isWinner}
                                    onJoin={joinGame} onLeave={leaveGame}/>
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary"
                            onClick={gameState.active ? stopGame : startGame}
                            disabled={gameState.players.length < 2 || !participating}
                    >
                        {gameState.active ? 'End Game' : 'New Game'}
                    </Button>
                </Grid>
            </Grid>
            <Players players={gameState.players} gameActive={gameState.active} playerOnTurn={gameState.playerOnTurn}
                     playerName={playerName}
                     participating={participating}/>
            {shouldShowTable() &&
            <div
                className={`message ${gameState.lastMessage.error ? 'error-message' : ''}`}>{gameState.lastMessage.text}</div>}
            {shouldShowTable() &&
            <Table gameActive={gameState.active} playerName={playerName} participating={participating}
                   deckTop={gameState.deckTop}
                   playerOnTurn={gameState.playerOnTurn}
                   cards={gameState.cards} colorChangedTo={gameState.colorChangedTo}
                   isSkippingTurn={gameState.isSkippingTurn} shouldDraw={gameState.shouldDraw}
                   cardsInDeck={gameState.cardsInDeck}/>}
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
            <Dialog
                open={openBroughtBack}
                onClose={closeDialog}
                aria-labelledby="You've been brought back to the game!"
                aria-describedby="You've been brought back to the game dialog"
            >
                <DialogTitle>You've been brought back to the game!</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Another player has brought you back to the game with a 7 of Hearts!
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="primary">
                        Back to Game
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
