import React, { FC, ReactElement } from 'react'
import './Players.css'
import { Grid } from '@material-ui/core'
import { Opponent } from '../models/opponent'
import PersonIcon from '@material-ui/icons/Person'

interface Props {
    players: Opponent[]
    gameActive: boolean
    playerOnTurn?: string
    playerName: string
    participating: boolean
}

export const Players: FC<Props> = (props: Props): ReactElement => {
    const getCard = (i: number): ReactElement => {
        return <img key={`${i}`} className="card-shell" src="/cards/0.png" alt="card back"/>
    }

    const getCardCount = (player: Opponent): ReactElement | undefined => {
        if (!props.gameActive && !props.players.some(player => player.place > 0)) return undefined

        if (player.place === 1) {
            return (
                <span role="img" aria-label="first place">🥇</span>
            )
        } else if (player.place === 2) {
            return (
                <span role="img" aria-label="second place">🥈</span>
            )
        } else if (player.place === 3) {
            return (
                <span role="img" aria-label="third place">🥉</span>
            )
        } else if (player.place > 3) {
            return (
                <span role="img" aria-label="ta-da">🎉</span>
            )
        } else if (player.loser) return (
            <span role="img" aria-label="loser">👎</span>
        )

        const cards: ReactElement[] = []
        for (let i = 0; i < player.cards; i++) cards.push(getCard(i))
        return (
            <span>{cards}</span>
        )
    }

    const generatePlayerTile = (player: Opponent): ReactElement => {
        return (
            <Grid item key={player.name}>
                <div className="player-container">
                    <div className="player-name"
                         id={player.name === props.playerOnTurn && props.gameActive ? 'playerOnTurn' : undefined}>
                        <PersonIcon/> {player.name}{player.name === props.playerName && props.participating && ' (you)'}
                    </div>
                    <div>
                        {getCardCount(player)}
                    </div>
                </div>
            </Grid>
        )
    }

    return (
        <Grid container spacing={2} justify="center">
            {props.players.map(generatePlayerTile)}
        </Grid>
    )
}
