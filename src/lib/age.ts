const KEY = 'taproom.age.v1'

export function ageConfirmed(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function confirmAge(): void {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    // ignore
  }
}
