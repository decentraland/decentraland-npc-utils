export interface ITimerComponent {
  elapsedTime: number
  targetTime: number
  onTargetTimeReached: (ownerEntity: IEntity) => void
}

/**
 * Execute once after X milliseconds
 */
@Component('npcTimerDelay')
export class NPCDelay implements ITimerComponent {
  elapsedTime: number
  targetTime: number
  onTargetTimeReached: (ownerEntity: IEntity) => void

  private onTimeReachedCallback: () => void

  /**
   * @param seconds amount of time in seconds
   * @param onTimeReachedCallback callback for when time is reached
   */
  constructor(seconds: number, onTimeReachedCallback: () => void) {
    NPCTimerSystem.createAndAddToEngine()

    this.elapsedTime = 0
    this.targetTime = seconds
    this.onTimeReachedCallback = onTimeReachedCallback
    this.onTargetTimeReached = entity => {
      this.onTimeReachedCallback()
      entity.removeComponent(NPCDelay)
    }
  }

  setCallback(onTimeReachedCallback: () => void) {
    this.onTimeReachedCallback = onTimeReachedCallback
  }
}

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
