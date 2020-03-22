import React, { ReactElement, FC } from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { Card, getCardsAssetNumber, Suit } from '../../models/card'
import { CardPlayed, PlayerAction } from '../../models/playerAction'
import { Grid } from '@material-ui/core'

interface Props {
    cards: Card[]
    playerName: string
    playerOnTurn?: string
    deckTop?: Card
    sendPlayerAction: (action: PlayerAction) => void
}

export const Cards: FC<Props> = (props: Props): ReactElement | null => {
    const [open, setOpen] = React.useState(false)
    const [pickedCard, setPickedCard] = React.useState<Card | undefined>()

    if (props.cards.length === 0) return null

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
        if (card.value === 'T') {
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
                <img src={`/cards/${getCardsAssetNumber(card)}.png`} alt={`${card.value} of ${card.suit}s`}/>
            </Grid>
        )
    }

    return (
        <div>
            <h2>Your cards</h2>
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
                    <Button onClick={() => handleClose('Dick')} color="primary">
                        Dicks
                    </Button>
                    <Button onClick={() => handleClose('Ball')} color="primary">
                        Balls
                    </Button>
                    <Button onClick={() => handleClose('Heart')} color="primary">
                        Hearts
                    </Button>
                    <Button onClick={() => handleClose('Green')} color="primary">
                        Greens
                    </Button>
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
