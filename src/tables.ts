import { Game } from './game'
import { TableInfo, TableUpdateMessage } from './models/message'
import { v4 as uuidv4 } from 'uuid'

const MAX_TABLES = 3
const TABLE_DESTROY_TIMEOUT = 1000 * 60 * 30 // 30 minutes

interface Table {
  id: string
  name: string
  game: Game
  expires?: NodeJS.Timeout
}

interface ClientCallback {
  id: string
  cb: () => void
}

class Tables {
  private readonly tables: Table[]
  private clientsToNotify: ClientCallback[] = []

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
      tables: this.tables.map(Tables.getTableInfo),
    }
  }

  addTable(name: string): TableInfo {
    if (this.tables.length >= MAX_TABLES) throw new Error('Messages.table_error_limit_reached')
    if (!name) throw new Error('Messages.table_error_empty_name')
    const trimmed = name.trim().toLowerCase()
    if (trimmed.length > 10) throw new Error('Messages.table_error_name_too_long')
    if (!trimmed.match(/^[0-9a-zA-Z ]+$/)) throw new Error('Messages.table_error_unsupported_character')
    if (this.tables.some(table => table.name === trimmed)) throw new Error('Messages.table_error_table_already_exists')

    const id = uuidv4()
    const newTable = {
      id,
      name: trimmed,
      game: new Game(),
      expires: setTimeout(() => this.removeTable(id), TABLE_DESTROY_TIMEOUT),
    }
    this.tables.push(newTable)
    return Tables.getTableInfo(newTable)
  }

  removeTable(id: string): void {
    const tableIndex = this.tables.findIndex(table => table.id === id)
    if (tableIndex !== -1) this.tables.splice(tableIndex, 1)
    for (const client of this.clientsToNotify) {
      client.cb()
    }
  }

  getGame(id: string): Game | never {
    const table = this.tables.find(table => table.id === id)
    if (!table) throw new Error('Messages.table_error_not_found')
    if (table.expires) {
      clearTimeout(table.expires)
      table.expires = setTimeout(() => this.removeTable(id), TABLE_DESTROY_TIMEOUT)
    }
    return table.game
  }

  onTableRemove(client: ClientCallback): void {
    this.clientsToNotify.push(client)
  }

  deregisterCallback(clientId: string): void {
    const clientIndex = this.clientsToNotify.findIndex(client => client.id === clientId)
    if (clientIndex !== -1) this.clientsToNotify.splice(clientIndex, 1)
  }

  private static getTableInfo({id, name, game}: Table): TableInfo {
    return {
      id,
      name,
      playersCount: game.getPlayersCount(),
    }
  }
}

export const tables = new Tables()
