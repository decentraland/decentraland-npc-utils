import {
  canvas,
  SFFont,
  lightTheme,
  darkTheme,
  SFHeavyFont
} from './../utils/default-ui-components'
import { ImageData, Dialog, ButtonStyles } from '../utils/types'
import resources, { setSection, buttonIconPos } from './resources'
import { NPCDelay } from '../utils/timerComponents'

export enum ConfirmMode {
  Confirm = 0,
  Cancel = 1,
  Next = 2,
  Button3 = 3,
  Button4 = 4
}

export let UIscaleMultiplier = 0.75

let portraitXPos = -350 * UIscaleMultiplier 
let portraitYPos = 0 * UIscaleMultiplier

let imageXPos = 350 * UIscaleMultiplier
let imageYPos = 50 * UIscaleMultiplier

let portraitScale = 256 * UIscaleMultiplier 
let imageScale = 256 * UIscaleMultiplier 

let textSize = 24 * UIscaleMultiplier
let textYPos = 10 * UIscaleMultiplier

let buttonWidth = 174* UIscaleMultiplier
let buttonHeight = 46* UIscaleMultiplier


let buttonTextSize = 20 * UIscaleMultiplier

let button1XPos = 150 * UIscaleMultiplier
let button2XPos = -80 * UIscaleMultiplier
let button3XPos = -80 * UIscaleMultiplier
let button4XPos = 150 * UIscaleMultiplier

let button1YPos = -65 * UIscaleMultiplier
let button2YPos = -65 * UIscaleMultiplier
let button1YPos4 = -20 * UIscaleMultiplier
let button2YPos4 = -20 * UIscaleMultiplier
let button3YPos = -80 * UIscaleMultiplier
let button4YPos = -80 * UIscaleMultiplier

let skipButtonXPos = -300 * UIscaleMultiplier
let skipButtonYPos = -100 * UIscaleMultiplier

let buttonIconWidth = 26 * UIscaleMultiplier
let buttonIconHeight = 26 * UIscaleMultiplier

/**
 * Displays a UI screen with text from an array of Dialog objects. Each entry can also include a portrait image, questions with triggered actions by each, etc.
 *
 * @param defaultPortrait ImageData object with soruce and dimension of default portrait image to use on the Dialog UI
 * @param useDarkTheme If true, use the dark theme for all the UI. Can also be an alternative `Texture` object to use a different themed atlas, with identical coordinates for each element.
 * @param sound Path to a sound file to play once for every dialog window shown.
 *
 */
export class DialogWindow {
  public NPCScript: Dialog[] = []
  private defaultPortrait: ImageData | null
  public container: UIContainerRect
  public panel: UIImage
  public portrait: UIImage
  public defaultPortraitTexture: Texture
  public image: UIImage
  public text: UIText
  public button1: CustomDialogButton
  public button2: CustomDialogButton
  public button3: CustomDialogButton
  public button4: CustomDialogButton
  public skipButton: CustomDialogButton

  public leftClickIcon: UIImage
  public isDialogOpen: boolean = false
  public isQuestionPanel: boolean = false
  public isFixedScreen: boolean = false
  public activeTextId: number = 0
  public uiTheme: Texture
  private UIOpenTime: number = 0
  public soundEnt: Entity
  public defaultSound: string | null = null

  canvas: UICanvas = canvas
  ClickAction: null | (() => false | Subscription[]) = null
  EButtonAction: null | (() => false | Subscription[]) = null
  FButtonAction: null | (() => false | Subscription[]) = null

  constructor(
    defaultPortrait?: ImageData,
    useDarkTheme?: boolean,
    sound?: string,
    customTheme?: Texture
  ) {
    this.defaultPortrait = defaultPortrait ? defaultPortrait : null

    if (customTheme) {
      this.uiTheme = customTheme
    } else {
      this.uiTheme = useDarkTheme ? darkTheme : lightTheme
    }

    // Container
    this.container = new UIContainerRect(canvas)
    this.container.adaptWidth = true
    this.container.width = '100%'
    this.container.vAlign = 'bottom'
    this.container.positionY = 140* UIscaleMultiplier
    this.container.visible = false

    // Text Panel
    this.panel = new UIImage(this.container, this.uiTheme)
    setSection(this.panel, resources.backgrounds.NPCDialog)
    this.panel.width = 766  * UIscaleMultiplier
    this.panel.height = 248 * UIscaleMultiplier
    this.panel.onClick = new OnClick((): void => {
      this.confirmText(ConfirmMode.Next)
    })

    this.defaultPortraitTexture = new Texture(
      defaultPortrait ? defaultPortrait.path : this.uiTheme.src
    )

    // Portrait
    this.portrait = new UIImage(this.container, this.defaultPortraitTexture)

    this.portrait.sourceWidth =
      defaultPortrait && defaultPortrait.section ? defaultPortrait.section.sourceWidth : 256 
    this.portrait.sourceHeight =
      defaultPortrait && defaultPortrait.section ? defaultPortrait.section.sourceHeight : 256
    this.portrait.width = defaultPortrait && defaultPortrait.width ? defaultPortrait.width * UIscaleMultiplier : portraitScale
    this.portrait.height = defaultPortrait && defaultPortrait.height ? defaultPortrait.height * UIscaleMultiplier : portraitScale
    this.portrait.positionX =
      defaultPortrait && defaultPortrait.offsetX
        ? defaultPortrait.offsetX * UIscaleMultiplier + portraitXPos
        : portraitXPos
    this.portrait.positionY =
      defaultPortrait && defaultPortrait.offsetY
        ? defaultPortrait.offsetY * UIscaleMultiplier + portraitYPos
        : portraitYPos
    this.portrait.onClick = new OnClick((): void => {
      this.confirmText(ConfirmMode.Next)
    })

    // Image
    this.image = new UIImage(this.container, new Texture(this.uiTheme.src))

    this.image.sourceWidth = 256
    this.image.sourceHeight = 256
    this.image.sourceTop = 0
    this.image.sourceLeft = 0
    this.image.width = imageScale
    this.image.height = imageScale
    this.image.positionX = imageXPos
    this.image.positionY = imageYPos
    this.image.onClick = new OnClick((): void => {
      this.confirmText(ConfirmMode.Next)
    })

    // Dialog Text
    this.text = new UIText(this.container)
    this.text.adaptWidth = false
    this.text.textWrapping = true
    this.text.width = 460 * UIscaleMultiplier
    this.text.positionX = 40 * UIscaleMultiplier
    this.text.hAlign = 'center'
    this.text.vAlign = 'center'
    this.text.font = SFHeavyFont
    this.text.fontSize = textSize
    //this.text.hTextAlign = 'center'
	this.text.hTextAlign = 'left'
    this.text.vTextAlign = 'center'
    this.text.positionY = textYPos

    this.text.fontWeight = 'normal'
    this.text.color = useDarkTheme ? Color4.White() : Color4.Black()
    this.text.isPointerBlocker = false

    this.soundEnt = new Entity()
    this.soundEnt.addComponent(new Transform())
    engine.addEntity(this.soundEnt)
    this.soundEnt.setParent(Attachable.AVATAR)

    if (sound) {
      this.soundEnt.addComponent(new AudioSource(new AudioClip(sound)))
      this.soundEnt.getComponent(AudioSource).volume = 0.5

      this.defaultSound = sound
    }

    this.button1 = new CustomDialogButton(
      this.container,
      this.uiTheme,
      'yes',
      button1XPos,
      button1YPos,
      () => {
        this.confirmText(ConfirmMode.Confirm)
      },
      useDarkTheme? true: false,
      ButtonStyles.E
    )
    this.button1.hide()

    this.button2 = new CustomDialogButton(
      this.container,
      this.uiTheme,
      'no',
      button2XPos,
      button2YPos,
      () => {
        this.confirmText(ConfirmMode.Cancel)
      },
      useDarkTheme? true: false,
      ButtonStyles.F
    )
    this.button2.hide()

    this.button3 = new CustomDialogButton(
      this.container,
      this.uiTheme,
      'maybe',
      button3XPos,
      button3YPos,
      () => {
        this.confirmText(ConfirmMode.Button3)
      },
      useDarkTheme? true: false,
      ButtonStyles.DARK
    )
    this.button3.hide()

    this.button4 = new CustomDialogButton(
      this.container,
      this.uiTheme,
      'maybe',
      button4XPos,
      button4YPos,
      () => {
        this.confirmText(ConfirmMode.Button4)
      },
      useDarkTheme? true: false,
      ButtonStyles.DARK
    )
    this.button4.hide()

    this.skipButton = new CustomDialogButton(
      this.container,
      this.uiTheme,
      'Skip',
      skipButtonXPos,
      skipButtonYPos,
      () => {
        this.skipDialogs()
      },
      false,
      darkTheme ? ButtonStyles.WHITE : ButtonStyles.F
    )
    this.skipButton.image.width = 80 * UIscaleMultiplier
    this.skipButton.image.height = 30 * UIscaleMultiplier
	this.skipButton.label.hTextAlign = 'left'
    this.skipButton.label.fontSize = 12 * UIscaleMultiplier
    this.skipButton.label.positionX = 40 * UIscaleMultiplier
    this.skipButton.label.font = SFHeavyFont
    this.skipButton.icon.height = 20 * UIscaleMultiplier
    this.skipButton.icon.width = 20 * UIscaleMultiplier
    this.skipButton.icon.positionX = -20 * UIscaleMultiplier
    this.skipButton.hide()

    // Left Click Icon
    this.leftClickIcon = new UIImage(this.container, this.uiTheme)
    this.leftClickIcon.width = 32 * UIscaleMultiplier
    this.leftClickIcon.height = 48 * UIscaleMultiplier
    this.leftClickIcon.positionX = 340 * UIscaleMultiplier
    this.leftClickIcon.positionY = -80 * UIscaleMultiplier
    this.leftClickIcon.visible = false
    setSection(
      this.leftClickIcon,
      useDarkTheme ? resources.icons.ClickDark : resources.icons.ClickWhite
    )

    DialogTypeInSystem.createAndAddToEngine()
  }

  /**
   * Opens a dialog UI to start a conversation.
   * @param {Dialog[]} NPCScript  Instructions to follow during the conversation
   * @param {number|string} textId Where to start in the script. Can refer to an index in the array or the `name` field of a Dialog entry.
   */
  public openDialogWindow(NPCScript: Dialog[], textId?: number | string): void {
    this.UIOpenTime = +Date.now()

    this.NPCScript = NPCScript

    if (!textId) {
      this.activeTextId = 0
    } else if (typeof textId === 'number') {
      this.activeTextId = textId
    } else {
      this.activeTextId = findDialogByName(NPCScript, textId)
    }

    let currentText: Dialog = NPCScript[this.activeTextId]
      ? NPCScript[this.activeTextId]
      : { text: '' }

    if (currentText.audio) {
      this.soundEnt.addComponentOrReplace(new AudioSource(new AudioClip(currentText.audio)))
      this.soundEnt.getComponent(AudioSource).volume = 0.5
      this.soundEnt.getComponent(AudioSource).playOnce()
    } else if (this.defaultSound) {
      this.soundEnt.addComponentOrReplace(new AudioSource(new AudioClip(this.defaultSound)))
      this.soundEnt.getComponent(AudioSource).playOnce()
    }

    // Set portrait

    if (currentText.portrait) {
      this.portrait.source = new Texture(currentText.portrait.path)

      this.portrait.positionX = currentText.portrait.offsetX
        ? currentText.portrait.offsetX * UIscaleMultiplier + portraitXPos
        : portraitXPos

      this.portrait.positionY = currentText.portrait.offsetY
        ? currentText.portrait.offsetY * UIscaleMultiplier + portraitYPos
        : portraitYPos

      this.portrait.width = currentText.portrait.width ? currentText.portrait.width * UIscaleMultiplier : portraitScale

      this.portrait.height = currentText.portrait.height ? currentText.portrait.height * UIscaleMultiplier : portraitScale

      if (currentText.portrait.section) {
        setSection(this.portrait, currentText.portrait.section)
      }
      this.portrait.visible = true
    } else if (this.defaultPortrait) {
      this.portrait.source = this.defaultPortraitTexture

      this.portrait.positionX =
        this.defaultPortrait && this.defaultPortrait.offsetX
          ? this.defaultPortrait.offsetX * UIscaleMultiplier + portraitXPos
          : portraitXPos
      this.portrait.positionY =
        this.defaultPortrait && this.defaultPortrait.offsetY
          ? this.defaultPortrait.offsetY * UIscaleMultiplier + portraitYPos
          : portraitYPos
      this.portrait.width =
        this.defaultPortrait && this.defaultPortrait.width ? this.defaultPortrait.width * UIscaleMultiplier : portraitScale
      this.portrait.height =
        this.defaultPortrait && this.defaultPortrait.height ? this.defaultPortrait.height * UIscaleMultiplier : portraitScale

      if (this.defaultPortrait.section) {
        setSection(this.portrait, this.defaultPortrait.section)
      }
      this.portrait.visible = true
    } else {
      log('No portrait')
      this.portrait.visible = false
    }

    // Set image on the right
    if (currentText.image) {
      let image: ImageData = currentText.image
      log('setting image to ', image.path)
      this.image.source = new Texture(image.path)

      this.image.positionX = image.offsetX ? image.offsetX * UIscaleMultiplier + imageXPos : imageXPos
      this.image.positionY = image.offsetY ? image.offsetY * UIscaleMultiplier + imageYPos : imageYPos

      this.image.width = image.width ? image.width * UIscaleMultiplier : imageScale
      this.portrait.height = image.height ? image.height * UIscaleMultiplier : imageScale

      if (image.section) {
        setSection(this.image, image.section)
      }
      this.image.visible = true
    } else {
      this.image.visible = false
    }

    // Set text
    //this.text.value = currentText.text
    this.text.fontSize = currentText.fontSize ? currentText.fontSize * UIscaleMultiplier : textSize
    this.text.positionY = currentText.offsetY ? currentText.offsetY * UIscaleMultiplier + textYPos : textYPos
    this.text.positionX = currentText.offsetX ? currentText.offsetX * UIscaleMultiplier : 0
    this.text.visible = true
    this.container.visible = true

    DialogTypeInSystem._instance!.newText(
      this,
      currentText.text,
      this.activeTextId,
      currentText.typeSpeed ? currentText.typeSpeed : undefined
    )

    // Global button events
    if (!this.ClickAction) {
      this.ClickAction = Input.instance.subscribe('BUTTON_DOWN', ActionButton.POINTER, false, e => {
        if (!this.isDialogOpen || +Date.now() - this.UIOpenTime < 100) return
        if (!DialogTypeInSystem._instance!.done) {
          DialogTypeInSystem._instance!.rush()
          return
        } else if (!this.isQuestionPanel && !this.isFixedScreen) {
          this.confirmText(ConfirmMode.Next)
        }
      })
      this.EButtonAction = Input.instance.subscribe(
        'BUTTON_DOWN',
        ActionButton.PRIMARY,
        false,
        e => {
		  if (!this.isDialogOpen || +Date.now() - this.UIOpenTime < 100) return

          if (
            this.isQuestionPanel
          ) {
            this.confirmText(ConfirmMode.Confirm)
          } else if (!this.isQuestionPanel && !this.isFixedScreen) {
			this.confirmText(ConfirmMode.Next)
		  }
        }
      )
      this.FButtonAction = Input.instance.subscribe(
        'BUTTON_DOWN',
        ActionButton.SECONDARY,
        false,
        e => {
		  if (!this.isDialogOpen || +Date.now() - this.UIOpenTime < 100) return

          if (
            this.isQuestionPanel
          ) {
            this.confirmText(ConfirmMode.Cancel)
          } else if (
            currentText.skipable && !this.isFixedScreen
          ) {
            this.skipDialogs()
          }
        }
      )
    }

    this.layoutDialogWindow(this.activeTextId)
    this.isDialogOpen = true
  }

  // Progresses text
  public confirmText(mode: ConfirmMode): void {
    let currentText = this.NPCScript[this.activeTextId]
	this.UIOpenTime = +Date.now()

    // Update active text
    if (mode == ConfirmMode.Next) {
      if (!currentText.isQuestion) {
        if (currentText.triggeredByNext) {
          currentText.triggeredByNext()
        }
        if (currentText.isEndOfDialog) {
          this.closeDialogWindow()
          return
        }
        this.activeTextId++
      }
    }

    if (mode == ConfirmMode.Confirm) {
      if (currentText.buttons && currentText.buttons.length >= 1) {
        if (typeof currentText.buttons[0].goToDialog === 'number') {
          this.activeTextId = currentText.buttons[0].goToDialog
        } else {
          this.activeTextId = findDialogByName(this.NPCScript, currentText.buttons[0].goToDialog)
        }
        if (currentText.buttons[0].triggeredActions) {
          currentText.buttons[0].triggeredActions()
        }
      }
    }

    if (mode == ConfirmMode.Cancel) {
      if (currentText.buttons && currentText.buttons.length >= 2) {
        if (typeof currentText.buttons[1].goToDialog === 'number') {
          this.activeTextId = currentText.buttons[1].goToDialog
        } else {
          this.activeTextId = findDialogByName(this.NPCScript, currentText.buttons[1].goToDialog)
        }
        if (currentText.buttons[1].triggeredActions) {
          currentText.buttons[1].triggeredActions()
        }
      }
    }

    if (mode == ConfirmMode.Button3) {
      if (currentText.buttons && currentText.buttons.length >= 3) {
        if (typeof currentText.buttons[2].goToDialog === 'number') {
          this.activeTextId = currentText.buttons[2].goToDialog
        } else {
          this.activeTextId = findDialogByName(this.NPCScript, currentText.buttons[2].goToDialog)
        }
        if (currentText.buttons[2].triggeredActions) {
          currentText.buttons[2].triggeredActions()
        }
      }
    }

    if (mode == ConfirmMode.Button4) {
      if (currentText.buttons && currentText.buttons.length >= 4) {
        if (typeof currentText.buttons[3].goToDialog === 'number') {
          this.activeTextId = currentText.buttons[3].goToDialog
        } else {
          this.activeTextId = findDialogByName(this.NPCScript, currentText.buttons[3].goToDialog)
        }
        if (currentText.buttons[3].triggeredActions) {
          currentText.buttons[3].triggeredActions()
        }
      }
    }
    // Update active text with new active text
    currentText = this.NPCScript[this.activeTextId]

    DialogTypeInSystem._instance!.newText(
      this,
      currentText.text,
      this.activeTextId,
      currentText.typeSpeed ? currentText.typeSpeed : undefined
    )
  }

  // Adds the buttons or mouse icon depending on the type of window
  public layoutDialogWindow(textId: number): void {
    let currentText: Dialog = this.NPCScript[textId] ? this.NPCScript[textId] : { text: '' }

    // Update text
    let textY = currentText.offsetY ? currentText.offsetY * UIscaleMultiplier + textYPos : textYPos

    if (currentText.buttons && currentText.buttons.length >= 3) {
      textY += 50 *  UIscaleMultiplier
    } else if (currentText.buttons && currentText.buttons.length >= 1) {
      textY += 24 * UIscaleMultiplier
    }

    this.text.fontSize = currentText.fontSize ? currentText.fontSize * UIscaleMultiplier : textSize
    this.text.positionY = textY

    if (currentText.audio) {
      this.soundEnt.addComponentOrReplace(new AudioSource(new AudioClip(currentText.audio)))
      this.soundEnt.getComponent(AudioSource).volume = 0.5
      this.soundEnt.getComponent(AudioSource).playOnce()
    } else if (this.defaultSound) {
      this.soundEnt.addComponentOrReplace(new AudioSource(new AudioClip(this.defaultSound)))
      this.soundEnt.getComponent(AudioSource).playOnce()
    }

    if (currentText.portrait) {
      this.portrait.source = new Texture(currentText.portrait.path)

      this.portrait.positionX = currentText.portrait.offsetX
        ? currentText.portrait.offsetX * UIscaleMultiplier+ portraitXPos
        : portraitXPos

      this.portrait.positionY = currentText.portrait.offsetY
        ? currentText.portrait.offsetY* UIscaleMultiplier + portraitYPos
        : portraitYPos

      this.portrait.width = currentText.portrait.width ? currentText.portrait.width * UIscaleMultiplier: portraitScale

      this.portrait.height = currentText.portrait.height ? currentText.portrait.height * UIscaleMultiplier: portraitScale

      if (currentText.portrait.section) {
        setSection(this.portrait, currentText.portrait.section)
      }
      this.portrait.visible = true
    } else if (this.defaultPortrait) {
      this.portrait.source = new Texture(this.defaultPortrait.path)

      this.portrait.positionX =
        this.defaultPortrait && this.defaultPortrait.offsetX
          ? this.defaultPortrait.offsetX* UIscaleMultiplier + portraitXPos
          : portraitXPos
      this.portrait.positionY =
        this.defaultPortrait && this.defaultPortrait.offsetY
          ? this.defaultPortrait.offsetY* UIscaleMultiplier + portraitYPos
          : portraitYPos

      this.portrait.width =
        this.defaultPortrait && this.defaultPortrait.width ? this.defaultPortrait.width * UIscaleMultiplier: portraitScale
      this.portrait.height =
        this.defaultPortrait && this.defaultPortrait.height ? this.defaultPortrait.height * UIscaleMultiplier: portraitScale

      if (this.defaultPortrait.section) {
        setSection(this.portrait, this.defaultPortrait.section)
      }
      this.portrait.visible = true
    } else {
      log('No portrait')
      this.portrait.visible = false
    }

    this.image.visible = false

    // Set image on the right
    if (currentText.image) {
      let image: ImageData = currentText.image
      log('setting image to ', image.path)
      this.image.source = new Texture(image.path)

      this.image.positionX = image.offsetX ? image.offsetX* UIscaleMultiplier + imageXPos : imageXPos
      this.image.positionY = image.offsetY ? image.offsetY* UIscaleMultiplier + imageYPos : imageYPos

      this.image.width = currentText.image.width ? currentText.image.width* UIscaleMultiplier : imageScale
      this.image.height = currentText.image.height ? currentText.image.height* UIscaleMultiplier : imageScale

      if (image.section) {
        setSection(this.image, image.section)
      }
      this.image.visible = true
    } else {
      this.image.visible = false
    }

    this.isQuestionPanel = currentText.isQuestion ? currentText.isQuestion : false

    this.isFixedScreen = currentText.isFixedScreen ? currentText.isFixedScreen : false
    this.button1.hide()
    this.button2.hide()
    this.button3.hide()
    this.button4.hide()

    // Mouse icon
    this.leftClickIcon.visible = false

    if (currentText.isQuestion) {
      this.skipButton.hide()
      // Button E
      if (currentText.buttons && currentText.buttons.length >= 1) {
        this.button1.update(
          currentText.buttons[0].label,
          currentText.buttons[0].offsetX
            ? currentText.buttons[0].offsetX * UIscaleMultiplier+ button1XPos
            : button1XPos,
          currentText.buttons.length >= 3
            ? currentText.buttons[0].offsetY
              ? currentText.buttons[0].offsetY* UIscaleMultiplier + button1YPos4
              : button1YPos4
            : currentText.buttons[0].offsetY
            ? currentText.buttons[0].offsetY* UIscaleMultiplier + button1YPos
            : button1YPos
        )
      }

      // Button F
      if (currentText.buttons && currentText.buttons.length >= 2) {
        this.button2.update(
          currentText.buttons[1].label,
          currentText.buttons[1].offsetX* UIscaleMultiplier
            ? currentText.buttons[1].offsetX* UIscaleMultiplier + button2XPos
            : button2XPos,
          currentText.buttons.length >= 3
            ? currentText.buttons[1].offsetY* UIscaleMultiplier
              ? currentText.buttons[1].offsetY* UIscaleMultiplier + button2YPos4
              : button2YPos4
            : currentText.buttons[1].offsetY* UIscaleMultiplier
            ? currentText.buttons[1].offsetY* UIscaleMultiplier + button2YPos
            : button2YPos
        )
      }

      // Button 3
      if (currentText.buttons && currentText.buttons.length >= 3) {
        this.button3.update(
          currentText.buttons[2].label,
          currentText.buttons[2].offsetX* UIscaleMultiplier
            ? currentText.buttons[2].offsetX* UIscaleMultiplier + button3XPos
            : button3XPos,
          currentText.buttons[2].offsetY* UIscaleMultiplier
            ? currentText.buttons[2].offsetY * UIscaleMultiplier+ button3YPos
            : button3YPos
        )
      }

      // Button 4
      if (currentText.buttons && currentText.buttons.length >= 4) {
        this.button4.update(
          currentText.buttons[3].label,
          currentText.buttons[3].offsetX* UIscaleMultiplier
            ? currentText.buttons[3].offsetX* UIscaleMultiplier + button4XPos
            : button4XPos,
          currentText.buttons[3].offsetY* UIscaleMultiplier
            ? currentText.buttons[3].offsetY* UIscaleMultiplier + button4YPos
            : button4YPos
        )
      }

      dummyQuestionDelays.addComponentOrReplace(
        new NPCDelay(0.7, () => {
          // Button E
          if (currentText.buttons && currentText.buttons.length >= 1) {
            this.button1.show()
          }
          // Button F
          if (currentText.buttons && currentText.buttons.length >= 2) {
            this.button2.show()
          }

          // Button 3
          if (currentText.buttons && currentText.buttons.length >= 3) {
            this.button3.show()
          }

          // Button 4
          if (currentText.buttons && currentText.buttons.length >= 4) {
            this.button4.show()
          }
        })
      )
    } else if (!this.isFixedScreen) {
      this.leftClickIcon.visible = true

      if (currentText.skipable) {
        this.skipButton.show()
      } else {
        this.skipButton.hide()
      }
    }
  }

  /**
   * Closes a dialog UI.
   */
  public closeDialogWindow(): void {
    if (this.isDialogOpen) {
      this.isDialogOpen = false

      this.portrait.visible = false
      this.text.value = ''
      this.text.visible = false
      this.button1.hide()
      this.button2.hide()
      this.button3.hide()
      this.button4.hide()
      this.skipButton.hide()
      this.leftClickIcon.visible = false
      this.container.visible = false
    }
  }

  public skipDialogs() {
    if (!this.isDialogOpen || +Date.now() - this.UIOpenTime < 100) return

    while (
		this.NPCScript[this.activeTextId] &&
      this.NPCScript[this.activeTextId].skipable &&
      !this.NPCScript[this.activeTextId].isQuestion
    ) {
	  if (this.NPCScript[this.activeTextId].triggeredByNext) {
			this.NPCScript[this.activeTextId].triggeredByNext()
	  }
     
      if (
        this.NPCScript[this.activeTextId].skipable &&
        this.NPCScript[this.activeTextId].isEndOfDialog
      ) {
        this.closeDialogWindow()
        return
      }
	  this.activeTextId += 1
    }
    //this.activeTextId -= 1

    this.confirmText(ConfirmMode.Next)
  }
}

const DEFAULT_SPEED = 45

export class DialogTypeInSystem implements ISystem {
  static _instance: DialogTypeInSystem | null = null

  timer: number = 0
  speed: number = DEFAULT_SPEED
  visibleChars: number = 0
  fullText: string = ''
  UIText: UIText | null = null
  done: boolean = true

  static createAndAddToEngine(): DialogTypeInSystem {
    if (this._instance == null) {
      this._instance = new DialogTypeInSystem()
      engine.addSystem(this._instance)
    }
    return this._instance
  }

  private constructor() {
    DialogTypeInSystem._instance = this
  }

  update(dt: number) {
    if (this.done) return

    this.timer += dt
    if (this.timer >= 2 / this.speed) {
      let charsToAdd = Math.floor(this.timer / (1 / this.speed))
      this.timer = 0
      this.visibleChars += charsToAdd
      
	  // support <> tags
	  this.closeTag(charsToAdd)

	  if (this.visibleChars >= this.fullText.length) {
        this.done = true
        this.visibleChars = this.fullText.length
	  }

      if (this.UIText) {
        this.UIText.value = this.fullText.substr(0, this.visibleChars)
      }
    }
  }

  newText(dialog: DialogWindow, text: string, textId: number, speed?: number) {
    this.timer = 0
    this.done = false
    this.UIText = dialog.text
    this.fullText = text
    this.visibleChars = 0

    if (speed && speed <= 0) {
      this.rush()
    } else if (speed) {
      this.speed = speed
    } else {
      this.speed = DEFAULT_SPEED
    }

    // Buttons & action icons
    dialog.layoutDialogWindow(textId)
  }
  rush() {
    this.done = true
    this.timer = 0
    this.visibleChars = this.fullText.length

    if (this.UIText) {
      this.UIText.value = this.fullText
    }
  }
  closeTag(newChars: number){
	  if(this.visibleChars == 0 || newChars ==0 ) return

	let openTag: boolean = false
	let closeTag : boolean = false
	for(let i = this.visibleChars-newChars; i < this.visibleChars ; i++){
		
		if(!openTag){
			if(this.fullText.substr(i, 1) == '<'){
				openTag= true
				
			}
		} else {
			if(this.fullText.substr(i, 1) == '>'){
				closeTag= true
				
			}
		}
	}

	if(!openTag || closeTag){	
		return
	}

	while(this.visibleChars < this.fullText.length && this.fullText.substr(this.visibleChars-1, 1) != '>'){
		this.visibleChars+=1
	}
	return
  }
}

export class CustomDialogButton extends Entity {
  label: UIText
  image: UIImage
  icon: UIImage | null = null
  style: ButtonStyles | null
  onClick: () => void
  constructor(
    parent: UIContainerRect,
    texture: Texture,
    //UIOpenTime: number,
    label: string,
    posX: number,
    posY: number,
    onClick: () => void,
    useDarkTheme?: boolean,
    style?: ButtonStyles
  ) {
    super()
    this.image = new UIImage(parent, texture)
    this.image.positionX = posX
    this.image.positionY = posY
    this.image.width = buttonWidth
    this.image.height = buttonHeight

    this.label = new UIText(this.image)
    this.style = style ? style : null

    this.onClick = onClick

    if (this.style) {
      switch (this.style) {
        case ButtonStyles.E:
          setSection(this.image, resources.buttons.buttonE)
          this.label.positionX = 25 * UIscaleMultiplier

          this.icon = new UIImage(this.image, useDarkTheme == true ? darkTheme : lightTheme)
          this.icon.width = buttonIconWidth
          this.icon.height = buttonIconHeight
          // this.button1Icon.positionY = 15
          this.icon.hAlign = 'center'
          this.icon.vAlign = 'center'
          this.icon.isPointerBlocker = false
          setSection(this.icon, resources.buttonLabels.E)
          this.icon.positionX = buttonIconPos(label.length)

          break
        case ButtonStyles.F:
          setSection(this.image, resources.buttons.buttonF)
          this.label.positionX = 25 * UIscaleMultiplier

          this.icon = new UIImage(this.image, useDarkTheme == true ? darkTheme : lightTheme)
          this.icon.width = buttonIconWidth
          this.icon.height = buttonIconHeight
          // this.button1Icon.positionY = 15
          this.icon.hAlign = 'center'
          this.icon.vAlign = 'center'
          this.icon.isPointerBlocker = false
          setSection(this.icon, resources.buttonLabels.F)
          this.icon.positionX = buttonIconPos(label.length)
          break

        case ButtonStyles.WHITE:
          setSection(this.image, resources.buttons.white)
          this.label.positionX = 25 * UIscaleMultiplier

          this.icon = new UIImage(this.image, useDarkTheme == true ? darkTheme : lightTheme)
          this.icon.width = buttonIconWidth
          this.icon.height = buttonIconHeight
          // this.button1Icon.positionY = 15
          this.icon.hAlign = 'center'
          this.icon.vAlign = 'center'
          this.icon.isPointerBlocker = false
          setSection(this.icon, resources.buttonLabels.FBlack)
          this.icon.positionX = buttonIconPos(label.length)
          break

        case ButtonStyles.RED:
          setSection(this.image, resources.buttons.buttonRed)
          break
        case ButtonStyles.DARK:
          setSection(this.image, resources.buttons.buttonDark)
          break
        case ButtonStyles.ROUNDBLACK:
          setSection(this.image, resources.buttons.roundBlack)
          break
        case ButtonStyles.ROUNDWHITE:
          setSection(this.image, resources.buttons.roundWhite)
          break
        case ButtonStyles.ROUNDSILVER:
          setSection(this.image, resources.buttons.roundSilver)
          break
        case ButtonStyles.ROUNDGOLD:
          setSection(this.image, resources.buttons.roundGold)
          break
        case ButtonStyles.SQUAREBLACK:
          setSection(this.image, resources.buttons.squareBlack)
          break
        case ButtonStyles.SQUAREWHITE:
          setSection(this.image, resources.buttons.squareWhite)
          break
        case ButtonStyles.SQUARESILVER:
          setSection(this.image, resources.buttons.squareSilver)
          break
        case ButtonStyles.SQUAREGOLD:
          setSection(this.image, resources.buttons.squareGold)
          break
      }
    } else {
      setSection(this.image, resources.buttons.roundSilver)
    }

    this.label.value = label
    this.label.hTextAlign = 'center'
    this.label.vTextAlign = 'center'
    this.label.fontSize = buttonTextSize
    this.label.font = SFFont
    this.label.color =
      style == ButtonStyles.ROUNDWHITE ||
      style == ButtonStyles.SQUAREWHITE ||
      style == ButtonStyles.WHITE
        ? Color4.Black()
        : Color4.White()
    this.label.isPointerBlocker = false

    this.image.onClick = new OnClick(() => {
      this.onClick()
    })

    if (style == ButtonStyles.E) {
      Input.instance.subscribe('BUTTON_DOWN', ActionButton.PRIMARY, false, e => {
        if (this.image.visible) {
          // && +Date.now() - UIOpenTime > 100) {
          this.onClick()
        }
      })
    } else if (style == ButtonStyles.F) {
      Input.instance.subscribe('BUTTON_DOWN', ActionButton.SECONDARY, false, e => {
        if (this.image.visible) {
          // && +Date.now() - UIOpenTime > 100) {
          this.onClick()
        }
      })
    }
  }

  public hide(): void {
    this.image.visible = false
  }

  public show(): void {
    this.image.visible = true
  }

  public grayOut(): void {
    this.label.color = Color4.Gray()
    this.image.isPointerBlocker = false
  }

  public enable(): void {
    this.label.color = Color4.White()
    this.image.isPointerBlocker = true
  }
  public update(label: string, posX: number, posY: number) {
    this.label.value = label
    this.image.positionX = posX
    this.image.positionY = posY

    if (this.icon && (this.style == ButtonStyles.E || this.style == ButtonStyles.F)) {
      this.icon.positionX = buttonIconPos(label.length)
    }
  }
}

let dummyQuestionDelays = new Entity()
engine.addEntity(dummyQuestionDelays)

function findDialogByName(dialogs: Dialog[], name: string) {
  for (let i = 0; i < dialogs.length; i++) {
    if (dialogs[i].name && dialogs[i].name == name) {
      return i
    }
  }
  return 0
}
