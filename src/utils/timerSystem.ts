import { NPCDelay } from './timerComponents'

const entitiesWithDelay = engine.getComponentGroup(NPCDelay)

export class NPCTimerSystem implements ISystem {
  private static _instance: NPCTimerSystem | null = null

  static createAndAddToEngine(): NPCTimerSystem {
    if (this._instance == null) {
      this._instance = new NPCTimerSystem()
      engine.addSystem(this._instance)
    }
    return this._instance
  }

  private constructor() {
    NPCTimerSystem._instance = this
  }

  update(dt: number) {
    for (let ent of entitiesWithDelay.entities) {
      let timerComponent = ent.getComponent(NPCDelay)

      timerComponent.elapsedTime += dt

      if (timerComponent.elapsedTime >= timerComponent.targetTime) {
        timerComponent.onTargetTimeReached(ent)
      }
    }
  }
}
