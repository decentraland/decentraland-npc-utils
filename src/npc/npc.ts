import { DialogWindow } from '../ui/index'
import { Dialog, FollowPathData, NPCData, NPCState, TriggerData } from '../utils/types'
import { TrackUserFlag } from './faceUserSystem'

import { TriggerSphereShape, NPCTriggerComponent } from '../trigger/triggerSystem'
import { NPCDelay } from '../utils/timerComponents'
import { NPCLerpData, walkingNPCGroup } from './move'
import { DialogBubble } from '../ui/bubble'

/**
 * Creates a talking, walking and animated NPC
 *
 * @param {TranformConstructorArgs} position Transform argument object that can contain position, rotation and scale for NPC
 * @param {string} model String with path to 3D model to use for NPC
 * @param {() => void} onActivate Function to execute each time the NPC is activated. By default when clicking it or walking near, or calling the `activate()` function
 * @param {NPCData} data Object of type NPCData, containing multiple configurable parameters
 *
 */
export class NPC extends Entity {
  public introduced: boolean = false
  public dialog: DialogWindow
  public bubble: DialogBubble | undefined
  public onActivate: () => void
  public onWalkAway: null | (() => void) = null
  public inCooldown: boolean = false
  public coolDownDuration: number = 5
  public faceUser: boolean = false
  public idleAnim: AnimationState
  public walkingAnim: null | AnimationState = null
  public walkingSpeed: number = 2
  public lastPlayedAnim: AnimationState
  public endAnimTimer: Entity
  public closeDialogTimer: Entity
  public pauseWalkingTimer: Entity
  public state: NPCState
  public bubbleHeight: number = 2
  /**
   * Creates a talking, walking and animated NPC
   *
   * @param {TranformConstructorArgs} position Transform argument object that can contain position, rotation and scale for NPC
   * @param {string} model String with path to 3D model to use for NPC
   * @param {() => void} onActivate Function to execute each time the NPC is activated. By default when clicking it or walking near, or calling the `activate()` function
   * @param {NPCData} data Object of type NPCData, containing multiple configurable parameters
   *
   */
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

    this.state = NPCState.STANDING

    // dialogs
    if (data && data.noUI) {
    } else if (data && data.portrait) {
      this.dialog = new DialogWindow(
        typeof data.portrait === `string` ? { path: data.portrait } : data.portrait,
        data && data.darkUI ? data.darkUI : false,
        data.dialogSound ? data.dialogSound : undefined
      )
    } else {
      this.dialog = new DialogWindow(
        undefined,
        data && data.darkUI ? data.darkUI : false,
        data && data.dialogSound ? data.dialogSound : undefined
      )
    }

    if (data && data.textBubble) {
      if (data && data.bubbleHeight) {
        this.bubbleHeight = data.bubbleHeight
      }
      this.bubble = new DialogBubble(
        this,
        this.bubbleHeight,
        data.dialogSound ? data.dialogSound : undefined
      )
    }

    // animations
    this.addComponent(new Animator())

    this.idleAnim = new AnimationState(data && data.idleAnim ? data.idleAnim : 'Idle', {
      looping: true,
    })
    this.getComponent(Animator).addClip(this.idleAnim)
    this.lastPlayedAnim = this.idleAnim
    this.idleAnim.play()

    if (data && data.walkingAnim) {
      this.walkingAnim = new AnimationState(data.walkingAnim, {
        looping: true,
      })
      this.getComponent(Animator).addClip(this.walkingAnim)
    }

    this.onActivate = onActivate

    if (data && data.onWalkAway) {
      this.onWalkAway = data.onWalkAway
    }

    this.endAnimTimer = new Entity()
    engine.addEntity(this.endAnimTimer)

    this.closeDialogTimer = new Entity()
    engine.addEntity(this.closeDialogTimer)

    this.pauseWalkingTimer = new Entity()
    engine.addEntity(this.pauseWalkingTimer)

    let activateButton = data && data.onlyClickTrigger ? ActionButton.POINTER : ActionButton.PRIMARY

    // Reaction when clicked
    this.addComponent(
      new OnPointerDown(
        (e) => {
          if (this.inCooldown || (this.dialog && this.dialog.isDialogOpen)) return

          this.activate()
        },
        {
          button: activateButton,
          hoverText: data && data.hoverText ? data.hoverText : 'Talk',
          showFeedback: data && data.onlyExternalTrigger ? false : true,
        }
      )
    )

    if (data && data.onlyExternalTrigger) {
      this.removeComponent(OnPointerDown)
    }

    // Trigger
    let triggerData: TriggerData = {}

    // when exiting trigger
    if (!data || (data && !data.continueOnWalkAway)) {
      triggerData.onCameraExit = () => {
        this.handleWalkAway()
      }
    }

    // when entering trigger
    if (
      !data ||
      (data && !data.onlyExternalTrigger && !data.onlyClickTrigger && !data.onlyETrigger)
    ) {
      triggerData.onCameraEnter = () => {
        if (this.inCooldown) {
          log(this.name, ' in cooldown')
          return
        } else if (
          (this.dialog && this.dialog.isDialogOpen) ||
          (data && data.onlyExternalTrigger) ||
          (data && data.onlyClickTrigger)
        ) {
          return
        }
        this.activate()
      }
    }

    // add trigger
    if (triggerData.onCameraEnter || triggerData.onCameraExit) {
      this.addComponent(
        new NPCTriggerComponent(
          new TriggerSphereShape(
            data && data.reactDistance ? data.reactDistance : 6,
            Vector3.Zero()
          ),
          triggerData
        )
      )
    }

    if (data && data.faceUser) {
      this.addComponent(new TrackUserFlag(true, data.turningSpeed ? data.turningSpeed : undefined))
      this.faceUser = true
    }

    if (data && data.walkingSpeed) {
      this.walkingSpeed = data.walkingSpeed
    }

    if (data && data.coolDownDuration) {
      this.coolDownDuration = data.coolDownDuration
    }

    if (data && data.path) {
      this.addComponent(new NPCLerpData(data.path ? data.path : []))
      this.getComponent(NPCLerpData).loop = true
      walkingNPCGroup.push(this)
      this.followPath()
    }
  }

  /**
   * Calls the NPC's activation function (set on NPC definition). If NPC has `faceUser` = true, it will rotate to face the player. It starts a cooldown counter to avoid reactivating.
   */
  activate() {
    if (this.faceUser) {
      this.getComponent(TrackUserFlag).active = true
    }
    this.inCooldown = true
    this.addComponentOrReplace(
      new NPCDelay(this.coolDownDuration, () => {
        this.inCooldown = false
      })
    )
    this.onActivate()
  }
  /**
   * Closes dialog UI and makes NPC stop turning to face player
   */
  endInteraction() {
    if (this.faceUser) {
      this.getComponent(TrackUserFlag).active = false
    }
    if (this.dialog && this.dialog.isDialogOpen) {
      this.dialog.closeDialogWindow()
    }
    if (this.bubble && this.bubble.isBubleOpen) {
      this.bubble.closeDialogWindow()
    }
    this.state = NPCState.STANDING
  }
  /**
   * Ends interaction and calls the onWalkAway function
   */
  handleWalkAway() {
    if (this.state == NPCState.FOLLOWPATH) {
      //|| this.state == NPCState.FOLLOWPLAYER
      return
    }

    this.endInteraction()

    if (this.onWalkAway) {
      this.onWalkAway()
    }
  }
  /**
   * Starts a conversation, using the Dialog UI
   * @param {Dialog[]} script Instructions to follow during the conversation
   * @param {number|string} startIndex Where to start in the script. Can refer to an index in the array or the `name` field of a Dialog entry.
   * @param {number} duration In seconds. If set, the UI will close after the set time
   *
   */
  talk(script: Dialog[], startIndex?: number | string, duration?: number) {
    this.introduced = true
    this.state = NPCState.TALKING
    if (this.closeDialogTimer.hasComponent(NPCDelay)) {
      this.closeDialogTimer.removeComponent(NPCDelay)
    }

    if (this.bubble && this.bubble.isBubleOpen) {
      this.bubble.closeDialogWindow()
    }

    this.dialog.openDialogWindow(script, startIndex ? startIndex : 0)

    if (duration) {
      this.closeDialogTimer.addComponentOrReplace(
        new NPCDelay(duration, () => {
          this.dialog.closeDialogWindow()
        })
      )
    }
  }

  /**
   * Starts a conversation, using the Dialog UI
   * @param {Dialog[]} script Instructions to follow during the conversation
   * @param {number|string} startIndex Where to start in the script. Can refer to an index in the array or the `name` field of a Dialog entry.
   *
   */
  talkBubble(script: Dialog[], startIndex?: number | string) {
    // this.introduced = true
    // this.state = NPCState.TALKING
    // if (this.closeDialogTimer.hasComponent(NPCDelay)) {
    //   this.closeDialogTimer.removeComponent(NPCDelay)
    // }

    if (!this.bubble) {
      this.bubble = new DialogBubble(this, this.bubbleHeight)
    }

    this.bubble.openDialogWindow(script, startIndex ? startIndex : 0)
  }

  /**
   * The NPC model plays an animation
   * @param {string} animationName Name of the animation to play, as stored in the model
   * @param {boolean} noLoop If true, animation plays only once. You must also provide a duration
   * @param {number} duration In seconds. After the duration is over, the NPC will return to the default animation.
   *
   */
  playAnimation(animationName: string, noLoop?: boolean, duration?: number) {
    // this.lastPlayedAnim.stop()
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

    // newAnim.stop()
    newAnim.play(true)
    this.lastPlayedAnim = newAnim
  }

  /**
   * Change the idle animation on the NPC.
   * @param {animation} string Name of the new animation to set as idle.
   * @param {play} boolean If true, start playing this new idle animation.
   */
  changeIdleAnim(animation: string, play?: boolean) {
    // this.idleAnim.stop()
    this.idleAnim = new AnimationState(animation, { looping: true })
    this.getComponent(Animator).addClip(this.idleAnim)
    if (play) {
      // this.lastPlayedAnim.stop()
      this.idleAnim.play()
      this.lastPlayedAnim = this.idleAnim
    }
  }

  /**
   * Instruct the NPC to walk following a path. If no data is provided, the NPC uses data from the last time `followPath` was called, or its definition.
   * @param {FollowPathData} data Object with data to describe a path that an NPC can walk.
   */
  followPath(data?: FollowPathData) {
    if (!this.hasComponent(NPCLerpData)) {
      if (!data) {
        return
      }
      this.addComponent(new NPCLerpData(data.path ? data.path : []))
      walkingNPCGroup.push(this)
    }

    if (this.faceUser) {
      this.getComponent(TrackUserFlag).active = false
    }

    let lerp = this.getComponent(NPCLerpData)

    if (data) {
      if (data.path) {
        if (data.curve) {
          let curvedPath = Curve3.CreateCatmullRomSpline(
            data.path,
            data.path.length * 4,
            data.loop ? true : false
          ).getPoints()
          if (data.loop) {
            curvedPath.pop()
          }
          lerp.path = curvedPath
        } else {
          lerp.path = data.path
        }
      }

      if (data.loop != null) {
        lerp.loop = data.loop
      }

      if (data.startingPoint != null) {
        lerp.setIndex(data.startingPoint)
      }

      if (data.onFinishCallback) {
        lerp.onFinishCallback = data.onFinishCallback
      }

      if (data.onReachedPointCallback) {
        lerp.onReachedPointCallback = data.onReachedPointCallback
      }
    }

    // add current location to start of path
    let currentPos = this.getComponent(Transform).position

    if (
      (lerp.fraction == 0 && lerp.path[lerp.origin].subtract(currentPos).lengthSquared() > 0.1) ||
      (lerp.fraction > 0 &&
        currentPos.subtract(lerp.path[lerp.origin]).normalize() ==
          lerp.path[lerp.target].subtract(lerp.path[lerp.origin]).normalize())
    ) {
      lerp.path.splice(lerp.origin, 0, this.getComponent(Transform).position)
      lerp.fraction = 0
    }

    this.getComponent(Transform).lookAt(lerp.path[lerp.target])

    // speed of sections

    let totalDist = 0
    let pointsDist = []
    for (let i = 0; i < lerp.path.length - 1; i++) {
      let sqDist = Vector3.Distance(lerp.path[i], lerp.path[i + 1])
      totalDist += sqDist
      pointsDist.push(sqDist)
    }
    // measure return to start
    if (lerp.loop) {
      let sqDist = Vector3.Distance(lerp.path[lerp.path.length - 1], lerp.path[0])
      totalDist += sqDist
      pointsDist.push(sqDist)
    }

    if (data && data.totalDuration) {
      lerp.totalDuration = data.totalDuration
    } else if (data && data.speed) {
      lerp.totalDuration = totalDist / data.speed
    } else if (!lerp.totalDuration) {
      lerp.totalDuration = totalDist / this.walkingSpeed
    }

    lerp.speed = []
    for (let i = 0; i < pointsDist.length; i++) {
      lerp.speed.push(1 / ((pointsDist[i] / totalDist) * lerp.totalDuration))
    }

    if (this.walkingAnim) {
      if (this.endAnimTimer.hasComponent(NPCDelay)) {
        this.endAnimTimer.removeComponent(NPCDelay)
      }
      //   this.idleAnim.stop()
      //   this.lastPlayedAnim.stop()
      this.walkingAnim.play()
      this.lastPlayedAnim = this.walkingAnim
    }

    this.state = NPCState.FOLLOWPATH
  }

  /**
   * Stops the NPC's walking. If a default animation exists, it will play it.
   * @param {number} duration In seconds. If a duration is provided, the NPC will return to walking after the duration is over.
   */
  stopWalking(duration?: number) {
    this.state = NPCState.STANDING

    if (this.walkingAnim) {
      //   this.walkingAnim.stop()
      this.idleAnim.play()
      this.lastPlayedAnim = this.idleAnim
    }

    if (duration) {
      this.pauseWalkingTimer.addComponentOrReplace(
        new NPCDelay(duration, () => {
          if (this.dialog && this.dialog.isDialogOpen) return
          this.lastPlayedAnim.stop()
          if (this.walkingAnim) {
            this.walkingAnim.play()
            this.lastPlayedAnim = this.walkingAnim
          }
          if (this.endAnimTimer.hasComponent(NPCDelay)) {
            this.endAnimTimer.removeComponent(NPCDelay)
          }
          this.state = NPCState.FOLLOWPATH
        })
      )
    }
  }
}
