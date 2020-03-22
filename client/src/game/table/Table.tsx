import React, { FC, ReactElement } from 'react'
import './Table.css'
import { Button, Grid } from '@material-ui/core'
import { Cards } from './Cards'
import { Draw, PlayerAction, SkippingTurn } from '../../models/playerAction'
import { PlayersTurnMessage } from '../../models/message'
import { sendGameMessage } from '../../api'
import { Card, getCardsAssetNumber, Suit } from '../../models/card'

interface Props {
    playerName: string
    participating: boolean
    deckTop?: Card
    playerOnTurn?: string
    cards: Card[]
    colorChangedTo?: Suit
    cardsInDeck: string
}

export const Table: FC<Props> = (props: Props): ReactElement => {
    const sendPlayerAction = (action: PlayerAction): void => {
        const message: PlayersTurnMessage = {
            type: 'players_turn',
            action,
        }
        sendGameMessage(message)
    }

    const drawCard = (): void => {
        if (!props.participating) return

        const action: Draw = {
            action: 'draw',
        }
        sendPlayerAction(action)
    }

    const skipATurn = (): void => {
        if (!props.participating) return

        const action: SkippingTurn = {
            action: 'skipping_turn',
        }
        sendPlayerAction(action)
    }

    const getPlayedCards = (): ReactElement => {
        if (props.deckTop) return <img src={`/cards/${getCardsAssetNumber(props.deckTop)}.png`}
                                       alt={`${props.deckTop.value} of ${props.deckTop.suit}s`}/>
        else return <img src="/cards/0.png" alt="Deck"/>
    }

    const getControls = (): ReactElement | undefined => {
        if (!props.participating || props.cards.length === 0) return undefined

        return (
            <>
                <Cards cards={props.cards} playerName={props.playerName} playerOnTurn={props.playerOnTurn}
                       deckTop={props.deckTop} sendPlayerAction={sendPlayerAction}/>
                <Button color="primary" onClick={skipATurn}>
                    Skip a Turn
                </Button>
            </>
        )
    }

    const getDeck = (): ReactElement => {
        if (props.cardsInDeck === '0') return <img className="deck-top-card" src="/cards/gray.png" alt="deck placeholder"/>
        else return (
            <>
                <img className="deck-top-card" src="/cards/0.png" alt="deck"/>
                <div className="card-count">{props.cardsInDeck}</div>
            </>
        )
    }

    const getSuitIcon = (suit: Suit): ReactElement => {
        switch (suit) {
            case 'Ball':
                return <img className="overlay-suit-icon" src="/suits/ball.svg" alt="balls" />
            case 'Dick':
                return <img className="overlay-suit-icon" src="/suits/dick.svg" alt="dicks" />
            case 'Green':
                return <img className="overlay-suit-icon" src="/suits/green.svg" alt="greens" />
            case 'Heart':
                return <img className="overlay-suit-icon" src="/suits/heart.svg" alt="hearts" />
        }
    }

    return (
        <>
            <Grid className="decks" container spacing={4} justify="center">
                <Grid className="deck-overlay-container" item onClick={drawCard}>
                    {getDeck()}
                </Grid>
                <Grid className="color-overlay-container" item>
                    {getPlayedCards()}
                    {props.colorChangedTo && <div className="color-overlay">{getSuitIcon(props.colorChangedTo)}</div>}
                </Grid>
            </Grid>
            {getControls()}
        </>
    )
}
