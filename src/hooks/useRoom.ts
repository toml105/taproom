import { useEffect } from 'react'
import { RoomController } from '../engine/roomController'
import { useRoomStore } from '../store/useRoomStore'
import { loadIdentity } from '../lib/identity'

let controller: RoomController | null = null

export function getController(): RoomController | null {
  return controller
}

/** Mount a room: instantiates the controller for its lifetime and returns the
 * live store. Components call getController() for actions. */
export function useRoom(roomCode: string, asHost: boolean) {
  useEffect(() => {
    const ident = loadIdentity()
    controller = new RoomController(roomCode, ident, asHost)
    controller.start()
    return () => {
      controller?.destroy()
      controller = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode])

  return useRoomStore()
}
