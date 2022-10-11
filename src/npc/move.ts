import { NPCLerpType, NPCState } from '../utils/types'
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
  type: NPCLerpType = NPCLerpType.SMOOTH_PATH //default
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

const walkingNPCGroup = engine.getComponentGroup(NPCLerpData)

export class NPCWalkSystem implements ISystem {
  static _instance: NPCWalkSystem | null = null
  update(dt: number) {
    for (let npcE of walkingNPCGroup.entities) {
      const npc = (npcE as NPC)
      //try{
      if (npc.state == NPCState.FOLLOWPATH) {
        let transform = npc.getComponent(Transform)
        let path = npc.getComponent(NPCLerpData)

        if(path.type !== undefined && path.type == NPCLerpType.SMOOTH_PATH){
          //stop exactly at each point
          if (path.fraction < 1) {
            path.fraction += dt * path.speed[path.origin]

            //if fraction goes over 1 push it back to 1?

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
            path.fraction = 0 //starts on this point
            transform.lookAt(path.path[path.target])
          }
        }else{
          //default follow, smooth but with low FPS could cut corners
          //always increment fraction
          path.fraction += dt * path.speed[path.origin]

          if(path.fraction >= 1){
            path.origin = path.target
            const tartInc = Math.max(1,Math.floor( path.fraction ))
            path.target += tartInc
            if (path.target >= path.path.length) {
              if (path.loop) {
                path.target = 0
              } else {
                //path.target = path.path.length - 1
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
            path.fraction -= tartInc
            //TODO consider lerping look at
            if (path.target < path.path.length) {
              transform.lookAt(path.path[path.target])
            }
          }
        }
        //if reached target
        if (path.target < path.path.length) {
          transform.position = Vector3.Lerp(
            path.path[path.origin],
            path.path[path.target],
            path.fraction
          )
        }
      }
      /*}catch(e){
        debugger
        log("npc.utils.NPCWalkSystem throw error",e)
      }*/
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
