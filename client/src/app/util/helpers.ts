export function focusOnAlertInput(alert: HTMLIonAlertElement): void {
  const alertInput: HTMLInputElement | null = document.querySelector('ion-alert input')
  if (alertInput) {
    alertInput.focus()
    alertInput.onkeyup = async (event) => {
      if (event.key === 'Enter') {
        await alert.dismiss({values: {name: alertInput.value}}, 'submit')
      }
    }
  }
}
