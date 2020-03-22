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
}

export const Players: FC<Props> = (props: Props): ReactElement => {
    const getCard = (i: number): ReactElement => {
        return <img key={`${i}`} className="card-shell" src="/cards/0.png" alt="card back"/>
    }

    const getCardCount = (count: number): ReactElement => {
        if (count === 0) return (
            <span role="img" aria-label="ta-da">🎉</span>
        )
        const cards: ReactElement[] = []
        for (let i = 0; i < count; i++) cards.push(getCard(i))
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
                        <PersonIcon/> {player.name}{player.name === props.playerName && ' (you)'}
                    </div>
                    <div>
                        {props.gameActive && getCardCount(player.cards)}
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
