import { DialogWindow } from '../ui/index'
import { Dialog, NPCData } from '../utils/types'
import { TrackUserSlerp } from './faceUserSystem'

import { TriggerSphereShape, NPCTriggerComponent } from '../trigger/triggerSystem'
import { NPCDelay } from '../utils/timerComponents'

/**
 * Creates a talking and animated NPC
 *
 * @param position Transform argument object that can contain position, rotation and scale for NPC
 * @param model String with path to 3D model to use for NPC
 * @param onActivate Function to execute each time the NPC is activated. By default when clicking it or walking near, or calling the `activate()` function
 * @param data Object of type NPCData, containing multiple configurable parameters
 *
 */
export class NPC extends Entity {
  public introduced: boolean = false
  public dialog: DialogWindow
  public onActivate: () => void
  public onWalkAway: () => void
  public continueOnWalkAway: boolean
  public inCooldown: boolean
  public coolDownDuration: number = 5
  public faceUser: boolean
  public idleAnim: AnimationState
  public lastPlayedAnim: AnimationState
  public endAnimTimer: Entity
  public closeDialogTimer: Entity
  constructor(
    position: TranformConstructorArgs,
    model: string,
    onActivate: () => void,
    data?: NPCData
  ) {
    super()
    this.addComponent(new GLTFShape(model))
    this.addComponent(new Transform(position))
    engine.addEntity(this)

    if (data && data.portrait) {
      this.dialog = new DialogWindow(
        typeof data.portrait === `string` ? { path: data.portrait } : data.portrait,
        data && data.darkUI ? data.darkUI : false,
        data.dialogSound ? data.dialogSound : null
      )
    } else {
      this.dialog = new DialogWindow(
        null,
        data && data.darkUI ? data.darkUI : false,
        data && data.dialogSound ? data.dialogSound : null
      )
    }
    this.addComponent(new Animator())

    this.idleAnim = new AnimationState(data && data.idleAnim ? data.idleAnim : 'Idle', {
      looping: true,
    })
    this.getComponent(Animator).addClip(this.idleAnim)
    this.lastPlayedAnim = this.idleAnim
    this.idleAnim.play()

    this.onActivate = onActivate

    if (data && data.onWalkAway) {
      this.onWalkAway = data.onWalkAway
    }

    if (data && data.continueOnWalkAway) {
      this.continueOnWalkAway = data.continueOnWalkAway
    }

    this.endAnimTimer = new Entity()
    engine.addEntity(this.endAnimTimer)

    this.closeDialogTimer = new Entity()
    engine.addEntity(this.closeDialogTimer)

    // Reaction when clicked
    this.addComponent(
      new OnPointerDown(
        (e) => {
          if (this.inCooldown || this.dialog.isDialogOpen) return

          this.activate()
        },
        {
          button: ActionButton.POINTER,
          hoverText: data && data.hoverText ? data.hoverText : 'Talk',
          showFeedback: data && data.onlyExternalTrigger ? false : true,
        }
      )
    )

    if (data && data.onlyExternalTrigger) {
      this.removeComponent(OnPointerDown)
    }

    // trigger when player walks near
    this.addComponent(
      new NPCTriggerComponent(
        new TriggerSphereShape(data && data.reactDistance ? data.reactDistance : 6, Vector3.Zero()),
        null,
        null,
        null,
        null,
        () => {
          if (this.inCooldown) {
            log(this.name, ' in cooldown')
            return
          } else if (
            this.dialog.isDialogOpen ||
            (data && data.onlyExternalTrigger) ||
            (data && data.onlyClickTrigger)
          ) {
            return
          }

          this.activate()
        },
        () => {
          this.handleWalkAway()
        }
      )
    )

    if (data && data.faceUser) {
      this.addComponent(new TrackUserSlerp(this.getComponent(Transform)))
      this.faceUser = true
    }

    if (data && data.coolDownDuration) {
      this.coolDownDuration = data.coolDownDuration
    }
  }
  activate() {
    if (this.faceUser) {
      this.getComponent(TrackUserSlerp).active = true
    }
    this.onActivate()
  }
  endInteraction() {
    if (this.faceUser) {
      this.getComponent(TrackUserSlerp).active = false
    }
    if (this.dialog.isDialogOpen) {
      this.dialog.closeDialogWindow()
    }
  }
  handleWalkAway() {
    if (!this.continueOnWalkAway) {
      this.endInteraction()
    }
    if (this.onWalkAway) {
      this.onWalkAway()
    }
  }

  talk(script: Dialog[], startIndex?: number | string, duration?: number) {
    this.introduced = true
    this.inCooldown = true
    if (this.closeDialogTimer.hasComponent(NPCDelay)) {
      this.closeDialogTimer.removeComponent(NPCDelay)
    }

    this.dialog.openDialogWindow(script, startIndex ? startIndex : 0)
    this.addComponentOrReplace(
      new NPCDelay(this.coolDownDuration, () => {
        this.inCooldown = false
      })
    )

    if (duration) {
      this.closeDialogTimer.addComponentOrReplace(
        new NPCDelay(duration, () => {
          this.dialog.closeDialogWindow()
        })
      )
    }
  }
  playAnimation(animationName: string, noLoop?: boolean, duration?: number) {
    this.lastPlayedAnim.stop()
    if (this.endAnimTimer.hasComponent(NPCDelay)) {
      this.endAnimTimer.removeComponent(NPCDelay)
    }
    let newAnim = this.getComponent(Animator).getClip(animationName)

    //log('playing anim : ', animationName)

    if (noLoop) {
      newAnim.looping = false
      if (duration) {
        this.endAnimTimer.addComponentOrReplace(
          new NPCDelay(duration, () => {
            newAnim.stop()
            if (this.idleAnim) {
              this.idleAnim.play()
              this.lastPlayedAnim = this.idleAnim
            }
          })
        )
      }
    }

    newAnim.stop()
    newAnim.play()
    this.lastPlayedAnim = newAnim
  }
}
