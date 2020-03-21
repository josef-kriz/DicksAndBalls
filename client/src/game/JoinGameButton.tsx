import React, { ReactElement, FC, useState, ChangeEvent } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

interface Props {
    name: string
    setName: (name: string) => void
    participating: boolean
    onJoin: (name: string) => void
    onLeave: () => void
}

export const JoinGameButton: FC<Props> = (props: Props): ReactElement => {
    const [open, setOpen] = useState<boolean>(false)

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        props.setName(event.target.value)
    }

    const handleClickOpen = (): void => {
        setOpen(true)
    }

    const handleClose = (): void => {
        setOpen(false)
    }

    const handleSubmit = (): void => {
        if (props.name) {
            setOpen(false)
            props.onJoin(props.name)
        }
    }

    return (
        <span>
            <Button variant="contained" color={props.participating ? 'secondary' : 'default'}
                    onClick={props.participating ? props.onLeave : handleClickOpen}>{props.participating ? 'Leave Game' : 'Join Game'}</Button>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <form>
                    <DialogTitle id="form-dialog-title">Choose a Name</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Insert a name that will be seen by your opponents.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Player Name"
                            type="text"
                            fullWidth
                            required
                            value={props.name}
                            onChange={handleInputChange}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button type="submit" formMethod="dialog" onClick={handleSubmit} color="primary">
                            Join Game
                        </Button>
                        <Button onClick={handleClose} color="secondary">
                            Cancel
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </span>
    )
}