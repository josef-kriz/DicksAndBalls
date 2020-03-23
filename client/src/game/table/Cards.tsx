import React, { ReactElement, FC } from 'react'
import './Cards.css'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { Card, getCardsAssetNumber, Suit } from '../../models/card'
import { CardPlayed, PlayerAction } from '../../models/playerAction'
import { Grid, IconButton } from '@material-ui/core'

interface Props {
    cards: Card[]
    playerName: string
    playerOnTurn?: string
    deckTop?: Card
    sendPlayerAction: (action: PlayerAction) => void
    isSkippingTurn: boolean
}

export const Cards: FC<Props> = (props: Props): ReactElement => {
    const [open, setOpen] = React.useState(false)
    const [pickedCard, setPickedCard] = React.useState<Card | undefined>()

    const askForColor = (): void => {
        setOpen(true)
    }

    const handleClose = (changeColorTo?: Suit): void => {
        setOpen(false)
        if (!changeColorTo || !pickedCard) return

        const action: CardPlayed = {
            action: 'card_played',
            card: pickedCard,
            changeColorTo,
        }
        props.sendPlayerAction(action)
    }

    const playCard = (card: Card): void => {
        if (!props.isSkippingTurn && card.value === 'T') {
            setPickedCard(card)
            askForColor()
        } else {
            const action: CardPlayed = {
                action: 'card_played',
                card,
            }
            props.sendPlayerAction(action)
        }
    }

    const generateCardTile = (card: Card): ReactElement => {
        const handleClick = () => playCard(card)
        return (
            <Grid key={`${card.suit}${card.value}`} item onClick={handleClick}>
                <img className="card" src={`/cards/${getCardsAssetNumber(card)}.png`} alt={`${card.value} of ${card.suit}s`}/>
            </Grid>
        )
    }

    return (
        <div className="cards-container">
            <Grid container spacing={2} justify="center">
                {props.cards.map(generateCardTile)}
            </Grid>
            <Dialog
                open={open}
                onClose={() => handleClose()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Pick a Color</DialogTitle>
                <DialogContent>
                    <div className="suit-buttons-container">
                        <IconButton className="suit-icon-button" aria-label="dicks" onClick={() => handleClose('Dick')}>
                            <img className="suit-icon" src="/suits/dick.svg" alt="dicks" />
                        </IconButton>
                        <IconButton className="suit-icon-button" aria-label="balls" onClick={() => handleClose('Ball')}>
                            <img className="suit-icon" src="/suits/ball.svg" alt="balls" />
                        </IconButton>
                        <IconButton className="suit-icon-button" aria-label="hearts" onClick={() => handleClose('Heart')}>
                            <img className="suit-icon" src="/suits/heart.svg" alt="hearts" />
                        </IconButton>
                        <IconButton className="suit-icon-button" aria-label="greens" onClick={() => handleClose('Green')}>
                            <img className="suit-icon" src="/suits/green.svg" alt="greens" />
                        </IconButton>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleClose()} color="secondary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
