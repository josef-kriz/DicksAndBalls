import React, { FC, ReactElement } from 'react'
import './Table.css'
import { Grid } from '@material-ui/core'
import { Cards } from './Cards'
import { Draw, PlayerAction, SkippingTurn } from '../../models/playerAction'
import { PlayersTurnMessage } from '../../models/message'
import { sendGameMessage } from '../../api'
import { Card, getCardsAssetNumber, Suit } from '../../models/card'
import RedoIcon from '@material-ui/icons/Redo';

interface Props {
    playerName: string
    participating: boolean
    deckTop?: Card
    playerOnTurn?: string
    cards: Card[]
    colorChangedTo?: Suit
    skippingPlayer: boolean
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

    const handleDeckClick = (): void => {
        if (props.skippingPlayer) skipATurn()
        else drawCard()
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
        if (props.deckTop) return <img className="deck-card" src={`/cards/${getCardsAssetNumber(props.deckTop)}.png`}
                                       alt={`${props.deckTop.value} of ${props.deckTop.suit}s`}/>
        else return <img className="deck-card" src="/cards/0.png" alt="Deck"/>
    }

    const getDeck = (): ReactElement => {
        if (props.cardsInDeck === '0') return <img className="deck-card deck-top-card" src="/cards/gray.png" alt="deck placeholder"/>
        else return (
            <>
                <img className="deck-card deck-top-card" src="/cards/0.png" alt="deck"/>
                <div className="card-count">{props.cardsInDeck}</div>
                {props.skippingPlayer && <div className="skipping-overlay">SKIP <RedoIcon /></div>}
            </>
        )
    }

    const getControls = (): ReactElement | undefined => {
        if (!props.participating || props.cards.length === 0) return undefined

        return (
            <>
                <hr />
                <Cards cards={props.cards} playerName={props.playerName} playerOnTurn={props.playerOnTurn}
                       deckTop={props.deckTop} sendPlayerAction={sendPlayerAction}/>
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
        <div id="table">
            <Grid className="decks" container spacing={4} justify="center">
                <Grid className="deck-overlay-container" item onClick={handleDeckClick}>
                    {getDeck()}
                </Grid>
                <Grid className="color-overlay-container" item>
                    {getPlayedCards()}
                    {props.colorChangedTo && <div className="color-overlay">{getSuitIcon(props.colorChangedTo)}</div>}
                </Grid>
            </Grid>
            {getControls()}
        </div>
    )
}
