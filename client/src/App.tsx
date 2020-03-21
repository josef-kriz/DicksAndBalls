import React from 'react'
import './App.css'
import { Game } from './game/Game'
import { Container } from '@material-ui/core'

function App() {
    return (
        <Container className="App" fixed>
            <Game/>
        </Container>
    )
}

export default App
