import React, { FC, ReactElement } from 'react'
import './Table.css'
import { Grid } from '@material-ui/core'
import { Cards } from './Cards'
import { Draw, PlayerAction, SkippingTurn } from '../../models/playerAction'
import { PlayersTurnMessage } from '../../models/message'
import { sendGameMessage } from '../../api'
import { Card, Suit } from '../../models/card'
import RedoIcon from '@material-ui/icons/Redo'
import { DeckCard } from './DeckCard'

interface Props {
    gameActive: boolean
    playerName: string
    participating: boolean
    deckTop: Card[]
    playerOnTurn?: string
    cards: Card[]
    colorChangedTo?: Suit
    isSkippingTurn: boolean
    shouldDraw: number
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
        if (props.isSkippingTurn) skipATurn()
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
        if (props.deckTop.length > 0) {
            const reversed = [...props.deckTop].reverse()
            return (
                <div>
                    {reversed.map((card) => <DeckCard key={`${card.suit}${card.value}`} card={card} noTransform={reversed.length === 1} colorChangedTo={card.value === 'T' ? props.colorChangedTo : undefined}/>)}
                    <img src="/cards/transparent.png" alt="deck background"/>
                </div>
            )
        }
        else return <img className="deck-card" src="/cards/0.png" alt="Deck"/>
    }

    const getDeck = (): ReactElement => {
        return (
            <>
                <img className="deck-card deck-top-card"
                     src={props.cardsInDeck === '0' ? '/cards/gray.png' : '/cards/0.png'} alt="deck"
                     onClick={handleDeckClick}/>
                {props.cardsInDeck !== '' && <div className="card-count">{props.cardsInDeck}</div>}
                {props.isSkippingTurn && <div className="action-overlay">SKIP<br/><RedoIcon/></div>}
                {props.shouldDraw !== 0 && <div className="action-overlay">DRAW<br/>{props.shouldDraw}</div>}
            </>
        )
    }

    return (
        <div id="table" className={props.playerOnTurn === props.playerName ? 'active-table' : undefined}>
            <Grid className="decks" container spacing={8} justify="center">
                <Grid className="deck-overlay-container" item>
                    {getDeck()}
                </Grid>
                <Grid item>
                    {getPlayedCards()}
                </Grid>
            </Grid>
            <hr/>
            <Cards gameActive={props.gameActive} cards={props.cards} playerName={props.playerName}
                   playerOnTurn={props.playerOnTurn} sendPlayerAction={sendPlayerAction}
                   isSkippingTurn={props.isSkippingTurn} shouldDraw={props.shouldDraw}/>
        </div>
    )
}
