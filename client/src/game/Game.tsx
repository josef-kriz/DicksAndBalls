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
import inactivityDetection from '../helpers/inactivityDetection'

export const Game: FC = (): ReactElement => {
    const [playerName, setPlayerName] = useState<string>('')
    const [participating, setParticipating] = useState<boolean>(false)
    const [gameActive, setGameActive] = useState<boolean>(false)
    const [players, setPlayers] = useState<Opponent[]>([])
    const [deckTop, setDeckTop] = useState<Card>()
    const [playerOnTurn, setPlayerOnTurn] = useState<string | undefined>()
    const [cards, setCards] = useState<Card[]>([])
    const [lastMessage, setLastMessage] = useState<{
        error: boolean
        text: string
    }>({
        error: false,
        text: '',
    })
    const [colorChangedTo, setColorChangedTo] = useState<Suit | undefined>()
    const [isSkippingTurn, setIsSkippingTurn] = useState<boolean>(false)
    const [shouldDraw, setShouldDraw] = useState<number>(0)
    const [isWinner, setIsWinner] = React.useState<boolean>(false)
    const [cardsInDeck, setCardsInDeck] = useState<string>('')
    const [openNameTaken, setOpenNameTaken] = React.useState<boolean>(false)
    const [openWinner, setOpenWinner] = React.useState<boolean>(false)
    const [openLoser, setOpenLoser] = React.useState<boolean>(false)
    const [openBroughtBack, setOpenBroughtBack] = React.useState<boolean>(false)

    const closeDialog = (): void => {
        setOpenWinner(false)
        setOpenLoser(false)
        setOpenNameTaken(false)
        setOpenBroughtBack(false)
    }

    useEffect(() => {
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

        const handleMessage = (message: ServerMessage): void => {
            if (isErrorMessage(message)) setLastMessage({
                error: true,
                text: message.message
            })
            else if (isGameStateMessage(message)) {
                setGameActive(message.active)
                setPlayers(message.players)
            } else if (isGameUpdateMessage(message)) {
                setPlayers(message.players)
                setDeckTop(message.deckTop)
                setPlayerOnTurn(message.playerOnTurn)
                if (message.playerOnTurn === playerName) inactivityDetection.startDetecting()
                setLastMessage({
                    error: false,
                    text: message.message,
                })
                setColorChangedTo(message.changeColorTo)
                setIsSkippingTurn(participating && message.skippingNextPlayer && message.playerOnTurn === playerName)
                if (message.playerOnTurn === playerName) setShouldDraw(message.shouldDraw)
                else setShouldDraw(0)
                setCardsInDeck(message.cardsInDeck)
                if (message.broughtBackToGame) handleBroughtBackToGame(message.broughtBackToGame === playerName)
                playDrawCardSound(message.drewCards)
            } else if (isPlayerUpdateMessage(message)) {
                setCards(message.cards)
                setIsWinner(message.place > 0)
                if (message.place > 0) handleWin()
                else if (message.loser) handleLoss()
            }
        }

        const onServerDisconnect = (): void => {
            setParticipating(false)
            setGameActive(false)
            setPlayers([])
        }

        registerGameListener(handleMessage, onServerDisconnect)
    }, [participating, playerName])

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
        return players.some(player => player.place > 0 || player.loser)
    }

    return (
        <div>
            <h1>Dicks and Balls</h1>
            <Grid container spacing={2} justify="center">
                <Grid item>
                    <JoinGameButton name={playerName} setName={setPlayerName} gameActive={gameActive}
                                    participating={participating} isWinner={isWinner}
                                    onJoin={joinGame} onLeave={leaveGame}/>
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary"
                            onClick={gameActive ? stopGame : startGame}
                            disabled={players.length < 2 || !participating}
                    >
                        {gameActive ? 'End Game' : 'New Game'}
                    </Button>
                </Grid>
            </Grid>
            <Players players={players} gameActive={gameActive} playerOnTurn={playerOnTurn} playerName={playerName}
                     participating={participating}/>
            {shouldShowTable() &&
            <div className={`message ${lastMessage.error ? 'error-message' : ''}`}>{lastMessage.text}</div>}
            {shouldShowTable() &&
            <Table gameActive={gameActive} playerName={playerName} participating={participating} deckTop={deckTop}
                   playerOnTurn={playerOnTurn}
                   cards={cards} colorChangedTo={colorChangedTo} isSkippingTurn={isSkippingTurn} shouldDraw={shouldDraw}
                   cardsInDeck={cardsInDeck}/>}
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