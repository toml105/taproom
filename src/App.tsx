import { useEffect, useState } from 'react'
import { AgeGate, Landing, JoinScreen, NamePicker } from './screens/Onboarding'
import { Room } from './screens/Room'
import { ageConfirmed } from './lib/age'
import { loadIdentity } from './lib/identity'
import { generateRoomCode, normalizeRoomCode, isValidRoomCode } from './lib/roomCode'

type Route = 'gate' | 'landing' | 'join' | 'name' | 'room'

function hashCode(): string {
  return normalizeRoomCode(window.location.hash.replace(/^#\/?/, ''))
}
function hasName(): boolean {
  return loadIdentity().name.trim().length > 0
}

export default function App() {
  const [route, setRoute] = useState<Route>('gate')
  const [code, setCode] = useState('')
  const [asHost, setAsHost] = useState(false)

  function routeFromHash() {
    const hc = hashCode()
    if (isValidRoomCode(hc)) {
      setCode(hc)
      setAsHost(false)
      setRoute(hasName() ? 'room' : 'name')
    } else {
      setRoute('landing')
    }
  }

  useEffect(() => {
    if (!ageConfirmed()) setRoute('gate')
    else routeFromHash()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function create() {
    const c = generateRoomCode()
    window.location.hash = c
    setCode(c)
    setAsHost(true)
    setRoute(hasName() ? 'room' : 'name')
  }
  function join(c: string) {
    window.location.hash = c
    setCode(c)
    setAsHost(false)
    setRoute(hasName() ? 'room' : 'name')
  }
  function leave() {
    window.location.hash = ''
    setCode('')
    setRoute('landing')
  }

  switch (route) {
    case 'gate':
      return <AgeGate onConfirm={routeFromHash} />
    case 'landing':
      return <Landing onCreate={create} onJoin={() => setRoute('join')} />
    case 'join':
      return <JoinScreen onJoin={join} onBack={() => setRoute('landing')} />
    case 'name':
      return <NamePicker onDone={() => setRoute('room')} />
    case 'room':
      return <Room key={code} code={code} asHost={asHost} onLeave={leave} />
    default:
      return null
  }
}
