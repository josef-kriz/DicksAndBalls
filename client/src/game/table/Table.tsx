import React, { FC, ReactElement } from 'react'
import { Button, Grid } from '@material-ui/core'
import { Cards } from './Cards'
import { Draw, PlayerAction, SkippingTurn } from '../../models/playerAction'
import { PlayersTurnMessage } from '../../models/message'
import { sendGameMessage } from '../../api'
import { Card, getCardsAssetNumber } from '../../models/card'

interface Props {
    playerName: string
    participating: boolean
    deckTop?: Card
    playerOnTurn?: string
    cards: Card[]
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

    const getDeck = (): ReactElement => {
        if (props.deckTop) return <img src={`/cards/${getCardsAssetNumber(props.deckTop)}.png`}
                                       alt={`${props.deckTop.value} of ${props.deckTop.suit}s`}/>
        else return <img src="/cards/0.png" alt="Deck"/>
    }

    const getControls = (): ReactElement | undefined => {
        if (!props.participating) return undefined

        return (
            <>
                <Button color="primary" onClick={skipATurn}>
                    Skip a Turn
                </Button>
                <Cards cards={props.cards} playerName={props.playerName} playerOnTurn={props.playerOnTurn}
                       deckTop={props.deckTop} sendPlayerAction={sendPlayerAction}/>
            </>
        )
    }

    return (
        <>
            <Grid container spacing={2} justify="center">
                <Grid item onClick={drawCard}>
                    <img src="/cards/0.png" alt="Deck"/>
                </Grid>
                <Grid item>
                    {getDeck()}
                </Grid>
            </Grid>
            {getControls()}
        </>
    )
}
