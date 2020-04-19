export class InactivityDetection {
    private readonly TIMEOUT = 5000
    private readonly events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    private timer?: number

    public startDetecting = (): void => {
        this.timer = setTimeout(this.inactive, this.TIMEOUT)
        for (const event of this.events) { document.addEventListener(event, this.stopTimer, true) }
    }

    private inactive = async (): Promise<void> => {
        const audio = new Audio('/sounds/idle.mp3')
        await audio.play()
    }

    private stopTimer = (): void => {
        for (const event of this.events) { document.removeEventListener(event, this.stopTimer, true) }
        if (this.timer) { clearTimeout(this.timer) }
    }
}

const inactivityDetection = new InactivityDetection()
export default inactivityDetection
