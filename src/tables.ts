import { Game } from './game'
import { TableInfo, TableUpdateMessage } from './models/message'
import { v4 as uuidv4 } from 'uuid'

const MAX_TABLES = 3

interface Table {
  id: string
  name: string
  game: Game
}

class Tables {
  private readonly tables: Table[]

  constructor() {
    this.tables = [
      {
        id: 'main',
        name: 'Main',
        game: new Game(),
      },
    ]
  }

  getTableUpdateMessage(): TableUpdateMessage {
    return {
      type: 'table_update',
      tables: this.tables.map(this.getTableInfo),
    }
  }

  addTable(name: string): TableInfo {
    if (this.tables.length >= MAX_TABLES) throw new Error('The maximum number of tables was reached')
    // TODO name validation

    const newTable = {
      id: uuidv4(),
      name,
      game: new Game(),
    }
    this.tables.push(newTable)
    return this.getTableInfo(newTable)
  }

  private getTableInfo({id, name, game}: Table): TableInfo {
    return {
      id,
      name,
      playersCount: game.getPlayersCount(),
    }
  }
}

export const tables = new Tables()
