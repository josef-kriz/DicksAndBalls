import React, { FC, ReactElement } from 'react'
import './Players.css'
import { Grid } from '@material-ui/core'
import { Opponent } from '../models/opponent'

interface Props {
    players: Opponent[]
    gameActive: boolean
    playerOnTurn?: string
    playerName: string
}

export const Players: FC<Props> = (props: Props): ReactElement => {
    const generatePlayerTile = (player: Opponent): ReactElement => {
        const cardCount = props.gameActive ? ` (${player.cards})` : ''
        const displayedName = `${player.name}${cardCount}`
        return (
            <Grid item key={player.name}>
                <span id={player.name === props.playerOnTurn ? 'playerOnTurn' : undefined}>{player.name === props.playerName ? 'You' : displayedName}</span>
            </Grid>
        )
    }

    return (
        <>
            {props.players.length > 0 && <h2 className="playersHeader">Players</h2>}
            <Grid container spacing={2} justify="center">
                {props.players.map(generatePlayerTile)}
            </Grid>
        </>
    )
}
