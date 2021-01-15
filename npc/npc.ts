import { DialogWindow } from '../ui/index'
import { Dialog, FollowPathData, NPCData, NPCState } from '../utils/types'
import { TrackUserSlerp } from './faceUserSystem'

import { TriggerSphereShape, NPCTriggerComponent } from '../trigger/triggerSystem'
import { NPCDelay } from '../utils/timerComponents'
import { NPCLerpData, walkingNPCGroup } from './move'

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
  public walkingAnim: AnimationState
  public walkingSpeed: number = 2
  //public runningAnim: AnimationState
  public lastPlayedAnim: AnimationState
  public endAnimTimer: Entity
  public closeDialogTimer: Entity
  public pauseWalkingTimer: Entity
  public state: NPCState
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
      looping: true
    })
    this.getComponent(Animator).addClip(this.idleAnim)
    this.lastPlayedAnim = this.idleAnim
    this.idleAnim.play()

    if (data && data.walkingAnim) {
      this.walkingAnim = new AnimationState(data.walkingAnim, {
        looping: true
      })
      this.getComponent(Animator).addClip(this.walkingAnim)
    }

    // if (data && data.runningAnim) {
    //   this.runningAnim = new AnimationState(data.runningAnim, {
    //     looping: true
    //   })
    //   this.getComponent(Animator).addClip(this.runningAnim)
    // }

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

    this.pauseWalkingTimer = new Entity()
    engine.addEntity(this.pauseWalkingTimer)

    // Reaction when clicked
    this.addComponent(
      new OnPointerDown(
        e => {
          if (this.inCooldown || this.dialog.isDialogOpen) return

          this.activate()
        },
        {
          button: ActionButton.POINTER,
          hoverText: data && data.hoverText ? data.hoverText : 'Talk',
          showFeedback: data && data.onlyExternalTrigger ? false : true
        }
      )
    )

    if (data && data.onlyExternalTrigger) {
      this.removeComponent(OnPointerDown)
    }

    // trigger when player walks near
    if (!data || (data && !data.onlyExternalTrigger) || (data && !data.onlyClickTrigger)) {
      this.addComponent(
        new NPCTriggerComponent(
          new TriggerSphereShape(
            data && data.reactDistance ? data.reactDistance : 6,
            Vector3.Zero()
          ),
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
    }

    if (data && data.faceUser) {
      this.addComponent(new TrackUserSlerp(this.getComponent(Transform)))
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
  activate() {
    if (this.faceUser) {
      this.getComponent(TrackUserSlerp).active = true
    }
    this.inCooldown = true
    this.addComponentOrReplace(
      new NPCDelay(this.coolDownDuration, () => {
        this.inCooldown = false
      })
    )
    this.onActivate()
  }
  endInteraction() {
    if (this.faceUser) {
      this.getComponent(TrackUserSlerp).active = false
    }
    if (this.dialog.isDialogOpen) {
      this.dialog.closeDialogWindow()
    }
    this.state = NPCState.STANDING
  }
  handleWalkAway() {
    if (this.state == NPCState.FOLLOWPATH || this.state == NPCState.FOLLOWPLAYER) {
      return
    }
    if (!this.continueOnWalkAway) {
      this.endInteraction()
    }
    if (this.onWalkAway) {
      this.onWalkAway()
    }
  }

  talk(script: Dialog[], startIndex?: number | string, duration?: number) {
    this.introduced = true
    this.state = NPCState.TALKING
    if (this.closeDialogTimer.hasComponent(NPCDelay)) {
      this.closeDialogTimer.removeComponent(NPCDelay)
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

  followPath(data?: FollowPathData) {
    if (!this.hasComponent(NPCLerpData)) {
      if (!data) {
        return
      }
      this.addComponent(new NPCLerpData(data.path ? data.path : []))
      walkingNPCGroup.push(this)
    }

    if (this.faceUser) {
      this.getComponent(TrackUserSlerp).active = false
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
      this.idleAnim.stop()
      this.lastPlayedAnim.stop()
      this.walkingAnim.play()
      this.lastPlayedAnim = this.walkingAnim
    }

    this.state = NPCState.FOLLOWPATH
  }
  stopWalking(duration?: number) {
    this.state = NPCState.STANDING

    if (this.faceUser) {
      let dummyTransform = this.getComponent(TrackUserSlerp).dummyTarget.getComponent(Transform)
      dummyTransform.position.copyFrom(this.getComponent(Transform).position)
      dummyTransform.position.y = 0
    }

    if (this.walkingAnim) {
      this.walkingAnim.stop()
      this.idleAnim.play()
      this.lastPlayedAnim = this.idleAnim
    }

    if (duration) {
      this.pauseWalkingTimer.addComponentOrReplace(
        new NPCDelay(duration, () => {
          if (this.dialog.isDialogOpen) return
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
