import { NPCState } from '../utils/types'
import { NPC } from './npc'

@Component('npclerpData')
export class NPCLerpData {
  path: Vector3[]
  origin: number = 0
  target: number = 1
  fraction: number = 0
  totalDuration: number = 0
  speed: number[] = []
  loop: boolean = false
  onFinishCallback?: () => void
  onReachedPointCallback?: () => void
  constructor(path: Vector3[]) {
    this.path = path
    NPCWalkSystem.createAndAddToEngine()
  }

  setIndex(index: number) {
    this.fraction = 0
    this.origin = index
    this.target = index + 1 < this.path.length ? index + 1 : 0
  }
}

export let walkingNPCGroup: NPC[] = []

export class NPCWalkSystem implements ISystem {
  static _instance: NPCWalkSystem | null = null
  update(dt: number) {
    for (let npc of walkingNPCGroup) {
      if (npc.state == NPCState.FOLLOWPATH) {
        let transform = npc.getComponent(Transform)
        let path = npc.getComponent(NPCLerpData)
        if (path.fraction < 1) {
          path.fraction += dt * path.speed[path.origin]
          transform.position = Vector3.Lerp(
            path.path[path.origin],
            path.path[path.target],
            path.fraction
          )
        } else {
          path.origin = path.target
          path.target += 1
          if (path.target >= path.path.length) {
            if (path.loop) {
              path.target = 0
            } else {
              npc.stopWalking()
              if (path.onFinishCallback) {
                path.onFinishCallback()
              }
              path.fraction = 1
              return
            }
          } else if (path.onReachedPointCallback) {
            path.onReachedPointCallback()
          }
          path.fraction = 0
          transform.lookAt(path.path[path.target])
        }
      }
    }
  }

  static createAndAddToEngine(): NPCWalkSystem {
    if (this._instance == null) {
      this._instance = new NPCWalkSystem()
      engine.addSystem(this._instance)
    }
    return this._instance
  }

  private constructor() {
    NPCWalkSystem._instance = this
  }
}
