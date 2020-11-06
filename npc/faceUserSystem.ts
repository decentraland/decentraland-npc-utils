@Component('trackUserSlerp')
export class TrackUserSlerp {
  fraction: number = 0
  onlyXAxis: boolean = true
  active: boolean = false
  dummyTarget: Entity
  constructor(pos: TranformConstructorArgs, active?: boolean) {
    if (!faceUserAdded) {
      addFaceUserSystem()
    }

    this.dummyTarget = new Entity()
    this.dummyTarget.addComponent(
      new Transform({
        position: new Vector3(0, 0, 0),
      })
    )
    this.dummyTarget.getComponent(Transform).position.copyFrom(pos.position)
    this.dummyTarget.getComponent(Transform).position.y = 0
    engine.addEntity(this.dummyTarget)

    if (active) {
      this.active = true
    }
  }
}

let currentPosition = new Vector3()

let faceUserAdded: boolean = false

const followingNPCs = engine.getComponentGroup(TrackUserSlerp)

// Rotates NPC to face the user during interaction
export function addFaceUserSystem() {
  faceUserAdded = true

  engine.addSystem(new FaceUserSystem())
}

class FaceUserSystem implements ISystem {
  update(dt: number) {
    if (followingNPCs.entities.length == 0) return

    let moved: boolean = false

    let posOnFloor = Camera.instance.position.clone()
    posOnFloor.y = 0

    if (currentPosition.equals(posOnFloor)) {
      //log('player is NOT moving')
    } else {
      currentPosition.copyFrom(posOnFloor)
      moved = true
      //log('player is moving')
    }

    for (let npc of followingNPCs.entities) {
      let transform = npc.getComponent(Transform)
      let trackUserSlerp = npc.getComponent(TrackUserSlerp)
      if (trackUserSlerp.active) {
        let dummyTarget = trackUserSlerp.dummyTarget

        if (moved) {
          dummyTarget.getComponent(Transform).lookAt(posOnFloor)
          trackUserSlerp.fraction = 0
        }

        trackUserSlerp.fraction += dt / 12

        if (trackUserSlerp.fraction < 1) {
          transform.rotation = Quaternion.Slerp(
            npc.getComponent(Transform).rotation,
            dummyTarget.getComponent(Transform).rotation,
            trackUserSlerp.fraction
          )
        }
      }
    }
  }
}
