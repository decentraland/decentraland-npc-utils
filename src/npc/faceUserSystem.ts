@Component('trackUserFlag')
export class TrackUserFlag {
  lockXZRotation: boolean = false
  active: boolean = false
  rotSpeed: number
  constructor(lockXZRotation?: boolean, rotSpeed?: number, active?: boolean) {
    if (!faceUserAdded) {
      addFaceUserSystem()
    }

    this.lockXZRotation = lockXZRotation ? lockXZRotation : false

    this.rotSpeed = rotSpeed ? rotSpeed : 2

    if (active) {
      this.active = true
    }
  }
}

let faceUserAdded: boolean = false
const player = Camera.instance

// Rotates NPC to face the user during interaction
export function addFaceUserSystem() {
  faceUserAdded = true

  engine.addSystem(new FaceUserSystem())
}

class FaceUserSystem implements ISystem {
  private followingNPCs = engine.getComponentGroup(TrackUserFlag)
  update(dt: number) {
    for (let npc of this.followingNPCs.entities) {
      let transform = npc.getComponent(Transform)
      let trackUser = npc.getComponent(TrackUserFlag)
      if (trackUser.active) {
        // Rotate to face the player
        let lookAtTarget = new Vector3(player.position.x, player.position.y, player.position.z)
        let direction = lookAtTarget.subtract(transform.position)
        transform.rotation = Quaternion.Slerp(
          transform.rotation,
          Quaternion.LookRotation(direction),
          dt * trackUser.rotSpeed
        )

        if (trackUser.lockXZRotation) {
          transform.rotation.x = 0
          transform.rotation.z = 0
        }
      }
    }
  }
}
