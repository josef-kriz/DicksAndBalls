import React, { CSSProperties, FC, ReactElement, useMemo } from 'react'
import './DeckCard.css'
import { Card, getCardsAssetNumber, Suit } from '../../models/card'

interface Props {
    card: Card
    noTransform: boolean
    colorChangedTo?: Suit
}

export const DeckCard: FC<Props> = (props: Props): ReactElement => {
    return useMemo(() => {
        const getRandomArbitrary = (min: number, max: number) => {
            return Math.floor(Math.random() * Math.floor(max - min)) + min
        }

        const getRandomShift = (): CSSProperties => {
            return {
                position: 'absolute',
                transform: props.noTransform ? undefined : `translateX(${getRandomArbitrary(-10, 11)}px) translateY(${getRandomArbitrary(-5, 5)}px) rotate(${getRandomArbitrary(-60, 61)}deg)`,
            }
        }

        const getSuitIcon = (suit: Suit): ReactElement => {
            switch (suit) {
                case 'Ball':
                    return <img className="overlay-suit-icon" src="/suits/ball.svg" alt="balls"/>
                case 'Dick':
                    return <img className="overlay-suit-icon" src="/suits/dick.svg" alt="dicks"/>
                case 'Green':
                    return <img className="overlay-suit-icon" src="/suits/green.svg" alt="greens"/>
                case 'Heart':
                    return <img className="overlay-suit-icon" src="/suits/heart.svg" alt="hearts"/>
            }
        }

        return (
            <div className="deck-card-container">
                <div style={getRandomShift()}>
                    <img className="deck-card"
                         src={`/cards/${getCardsAssetNumber(props.card)}.png`}
                         alt={`${props.card.value} of ${props.card.suit}s`}/>
                    {props.colorChangedTo && <div className="color-overlay">{getSuitIcon(props.colorChangedTo)}</div>}
                </div>
            </div>
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}
