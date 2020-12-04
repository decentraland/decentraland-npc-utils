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

let portraitXPos = -350
let portraitYPos = 0

let imageXPos = 350
let imageYPos = 50

let textSize = 24
let textYPos = 10

let buttonTextSise = 18

let button1XPos = 150
let button2XPos = -80
let button3XPos = -80
let button4XPos = 150

let button1YPos = -65
let button2YPos = -65
let button1YPos4 = -20
let button2YPos4 = -20
let button3YPos = -80
let button4YPos = -80

/**
 * Displays a UI screen with text from an array of Dialog objects. Each entry can also include a portrait image, questions with triggered actions by each, etc.
 *
 * @param defaultPortrait ImageData object with soruce and dimension of default portrait image to use on the Dialog UI
 * @param useDarkTheme If true, use the dark theme for all the UI. Can also be an alternative `Texture` object to use a different themed atlas, with identical coordinates for each element.
 * @param sound Path to a sound file to play once for every dialog window shown.
 *
 */
export class DialogWindow {
  public NPCScript: Dialog[]
  private defaultPortrait: ImageData = null
  public container: UIContainerRect
  public panel: UIImage
  public portrait: UIImage
  public image: UIImage
  public text: UIText
  public button1: CustomDialogButton
  public button2: CustomDialogButton
  public button3: CustomDialogButton
  public button4: CustomDialogButton

  public leftClickIcon: UIImage
  public isDialogOpen: boolean
  public isQuestionPanel: boolean
  public isFixedScreen: boolean
  public activeTextId: number
  public uiTheme: Texture
  private UIOpenTime: number
  public soundEnt: Entity

  canvas: UICanvas = canvas
  ClickAction: () => false | Subscription[]
  EButtonAction: () => false | Subscription[]
  FButtonAction: () => false | Subscription[]

  constructor(defaultPortrait?: ImageData, useDarkTheme?: boolean | Texture, sound?: string) {
    this.defaultPortrait = defaultPortrait ? defaultPortrait : null

    this.uiTheme =
      useDarkTheme instanceof Texture ? useDarkTheme : useDarkTheme == true ? darkTheme : lightTheme
    //this.uiTheme =useDarkTheme == true ? darkTheme : lightTheme

    // Container
    this.container = new UIContainerRect(canvas)
    this.container.adaptWidth = true
    this.container.width = '100%'
    this.container.vAlign = 'bottom'
    this.container.positionY = 140
    this.container.visible = false

    // Text Panel
    this.panel = new UIImage(this.container, this.uiTheme)
    setSection(this.panel, resources.backgrounds.NPCDialog)
    this.panel.width = 766
    this.panel.height = 248
    this.panel.onClick = new OnClick((): void => {
      this.confirmText(ConfirmMode.Next)
    })

    // Portrait
    this.portrait = new UIImage(
      this.container,
      new Texture(defaultPortrait ? defaultPortrait.path : this.uiTheme.src)
    )

    this.portrait.sourceWidth =
      defaultPortrait && defaultPortrait.section ? defaultPortrait.section.sourceWidth : 256
    this.portrait.sourceHeight =
      defaultPortrait && defaultPortrait.section ? defaultPortrait.section.sourceHeight : 256
    this.portrait.width = defaultPortrait && defaultPortrait.width ? defaultPortrait.width : 256
    this.portrait.height = defaultPortrait && defaultPortrait.height ? defaultPortrait.height : 256
    this.portrait.positionX =
      defaultPortrait && defaultPortrait.offsetX
        ? defaultPortrait.offsetX + portraitXPos
        : portraitXPos
    this.portrait.positionY =
      defaultPortrait && defaultPortrait.offsetY
        ? defaultPortrait.offsetY + portraitYPos
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
    this.image.width = 256
    this.image.height = 256
    this.image.positionX = imageXPos
    this.image.positionY = imageYPos
    this.image.onClick = new OnClick((): void => {
      this.confirmText(ConfirmMode.Next)
    })

    // Dialog Text
    this.text = new UIText(this.container)
    this.text.adaptWidth = false
    this.text.textWrapping = true
    this.text.width = 450
    this.text.positionX = 20
    this.text.hAlign = 'center'
    this.text.vAlign = 'center'
    this.text.font = SFHeavyFont
    this.text.fontSize = textSize
    this.text.hTextAlign = 'center'
    this.text.vTextAlign = 'center'
    this.text.positionY = textYPos

    this.text.fontWeight = 'normal'
    this.text.color = useDarkTheme ? Color4.White() : Color4.Black()
    this.text.isPointerBlocker = false

    this.soundEnt = new Entity()

    if (sound) {
      this.soundEnt.addComponent(new Transform())
      this.soundEnt.addComponent(new AudioSource(new AudioClip(sound)))
      this.soundEnt.getComponent(AudioSource).volume = 0.5
      engine.addEntity(this.soundEnt)
      this.soundEnt.setParent(Attachable.AVATAR)
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
      false,
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
      false,
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
      false,
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
      false,
      ButtonStyles.DARK
    )
    this.button4.hide()

    // Left Click Icon
    this.leftClickIcon = new UIImage(this.container, this.uiTheme)
    this.leftClickIcon.width = 32
    this.leftClickIcon.height = 48
    this.leftClickIcon.positionX = 340
    this.leftClickIcon.positionY = -80
    this.leftClickIcon.visible = false
    setSection(
      this.leftClickIcon,
      darkTheme ? resources.icons.ClickWhite : resources.icons.ClickDark
    )

    DialogTypeInSystem.createAndAddToEngine()
  }

  public openDialogWindow(NPCScript: Dialog[], textId?: number | string): void {
    this.UIOpenTime = +Date.now()

    this.NPCScript = NPCScript

    if (!textId) {
      this.activeTextId = 0
    }
    if (typeof textId === 'number') {
      this.activeTextId = textId
    } else {
      this.activeTextId = findDialogByName(NPCScript, textId)
    }

    let currentText = NPCScript[this.activeTextId]

    if (this.soundEnt.hasComponent(AudioSource)) {
      this.soundEnt.getComponent(AudioSource).playOnce()
    }

    // Set portrait
    // Looks for portrait in current text, otherwise use default portrait data
    let hasPortrait = NPCScript[this.activeTextId].portrait ? true : false

    if (hasPortrait || this.defaultPortrait) {
      log(
        'setting portrait to ',
        hasPortrait ? NPCScript[this.activeTextId].portrait.path : this.defaultPortrait.path
      )
      this.portrait.source = new Texture(
        hasPortrait ? NPCScript[this.activeTextId].portrait.path : this.defaultPortrait.path
      )

      this.portrait.positionX = hasPortrait
        ? NPCScript[this.activeTextId].portrait.offsetX
          ? NPCScript[this.activeTextId].portrait.offsetX + portraitXPos
          : portraitXPos
        : this.defaultPortrait && this.defaultPortrait.offsetX
        ? this.defaultPortrait.offsetX + portraitXPos
        : portraitXPos
      this.portrait.positionY = hasPortrait
        ? NPCScript[this.activeTextId].portrait.offsetY
          ? NPCScript[this.activeTextId].portrait.offsetY + portraitYPos
          : portraitYPos
        : this.defaultPortrait && this.defaultPortrait.offsetY
        ? this.defaultPortrait.offsetY + portraitYPos
        : portraitYPos
      this.portrait.width = hasPortrait
        ? NPCScript[this.activeTextId].portrait.width
          ? NPCScript[this.activeTextId].portrait.width
          : 256
        : this.defaultPortrait && this.defaultPortrait.width
        ? this.defaultPortrait.width
        : 256
      this.portrait.height = hasPortrait
        ? NPCScript[this.activeTextId].portrait.height
          ? NPCScript[this.activeTextId].portrait.height
          : 256
        : this.defaultPortrait && this.defaultPortrait.height
        ? this.defaultPortrait.height
        : 256

      if (hasPortrait && NPCScript[this.activeTextId].portrait.section) {
        setSection(this.portrait, NPCScript[this.activeTextId].portrait.section)
      } else if (!hasPortrait && this.defaultPortrait && this.defaultPortrait.section) {
        setSection(this.portrait, this.defaultPortrait.section)
      }
      this.portrait.visible = true
    } else {
      log('No portrait')
      this.portrait.visible = false
    }

    let hasImage = NPCScript[this.activeTextId].image ? true : false

    // Set image on the right
    if (hasImage) {
      let image = NPCScript[this.activeTextId].image
      log('setting image to ', image.path)
      this.image.source = new Texture(image.path)

      this.image.positionX = image.offsetX ? image.offsetX + imageXPos : imageXPos
      this.image.positionY = image.offsetY ? image.offsetY + imageYPos : imageYPos

      this.image.width = image.width ? image.width : 256
      this.portrait.height = image.height ? image.height : 256

      if (image.section) {
        setSection(this.image, image.section)
      }
      this.image.visible = true
    } else {
      this.image.visible = false
    }

    // Set text
    //this.text.value = currentText.text
    this.text.fontSize = currentText.fontSize ? currentText.fontSize : textSize
    this.text.positionY = currentText.offsetY ? currentText.offsetY + textYPos : textYPos
    this.text.positionX = currentText.offsetX ? currentText.offsetX : 0
    this.text.visible = true
    this.container.visible = true

    DialogTypeInSystem._instance.newText(
      this.text,
      currentText.text,
      currentText.typeSpeed ? currentText.typeSpeed : null
    )

    // Global button events
    if (!this.ClickAction) {
      this.ClickAction = Input.instance.subscribe('BUTTON_DOWN', ActionButton.POINTER, false, e => {
        if (!this.isDialogOpen || +Date.now() - this.UIOpenTime < 100) return

        if (!DialogTypeInSystem._instance.done) {
          DialogTypeInSystem._instance.rush()
        } else if (!this.isQuestionPanel && !this.isFixedScreen) {
          this.confirmText(ConfirmMode.Next)
        }
      })
      this.EButtonAction = Input.instance.subscribe(
        'BUTTON_DOWN',
        ActionButton.PRIMARY,
        false,
        e => {
          if (
            this.isDialogOpen &&
            this.isQuestionPanel &&
            DialogTypeInSystem._instance.done &&
            +Date.now() - this.UIOpenTime > 100
          ) {
            this.confirmText(ConfirmMode.Confirm)
          }
        }
      )
      this.FButtonAction = Input.instance.subscribe(
        'BUTTON_DOWN',
        ActionButton.SECONDARY,
        false,
        e => {
          if (
            this.isDialogOpen &&
            this.isQuestionPanel &&
            DialogTypeInSystem._instance.done &&
            +Date.now() - this.UIOpenTime > 100
          ) {
            this.confirmText(ConfirmMode.Cancel)
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

    // Update active text
    if (mode == ConfirmMode.Next) {
      if (!currentText.isQuestion && DialogTypeInSystem._instance.done) {
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
      if (currentText.buttons.length >= 1) {
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
      if (currentText.buttons.length >= 2) {
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
      if (currentText.buttons.length >= 3) {
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
      if (currentText.buttons.length >= 4) {
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

    // Update text
    let textY = currentText.offsetY ? currentText.offsetY + textYPos : textYPos

    if (
      this.NPCScript[this.activeTextId].buttons &&
      this.NPCScript[this.activeTextId].buttons.length >= 3
    ) {
      textY += 50
    } else if (
      this.NPCScript[this.activeTextId].buttons &&
      this.NPCScript[this.activeTextId].buttons.length >= 1
    ) {
      textY += 24
    }

    this.text.fontSize = currentText.fontSize ? currentText.fontSize : textSize
    this.text.positionY = textY

    if (this.soundEnt.hasComponent(AudioSource)) {
      this.soundEnt.getComponent(AudioSource).playOnce()
    }

    DialogTypeInSystem._instance.newText(
      this.text,
      currentText.text,
      currentText.typeSpeed ? currentText.typeSpeed : null
    )

    let hasPortrait = currentText.portrait ? true : false

    if (hasPortrait || this.defaultPortrait) {
      log(
        'setting portrait to ',
        hasPortrait ? currentText.portrait.path : this.defaultPortrait.path
      )
      this.portrait.source = new Texture(
        hasPortrait ? currentText.portrait.path : this.defaultPortrait.path
      )

      this.portrait.positionX = hasPortrait
        ? currentText.portrait.offsetX
          ? currentText.portrait.offsetX + portraitXPos
          : portraitXPos
        : this.defaultPortrait && this.defaultPortrait.offsetX
        ? this.defaultPortrait.offsetX + portraitXPos
        : portraitXPos
      this.portrait.positionY = hasPortrait
        ? currentText.portrait.offsetY
          ? currentText.portrait.offsetY + portraitYPos
          : portraitYPos
        : this.defaultPortrait && this.defaultPortrait.offsetY
        ? this.defaultPortrait.offsetY + portraitYPos
        : portraitYPos

      this.portrait.width = hasPortrait
        ? currentText.portrait.width
          ? currentText.portrait.width
          : 256
        : this.defaultPortrait && this.defaultPortrait.width
        ? this.defaultPortrait.width
        : 256
      this.portrait.height = hasPortrait
        ? currentText.portrait.height
          ? currentText.portrait.height
          : 256
        : this.defaultPortrait && this.defaultPortrait.height
        ? this.defaultPortrait.height
        : 256

      if (hasPortrait && currentText.portrait.section) {
        setSection(this.portrait, currentText.portrait.section)
      } else if (!hasPortrait && this.defaultPortrait && this.defaultPortrait.section) {
        setSection(this.portrait, this.defaultPortrait.section)
      }
      this.portrait.visible = true
    } else {
      log('No portrait')
      this.portrait.visible = false
    }

    this.image.visible = false
    let hasImage = currentText.image ? true : false

    // Set image on the right
    if (hasImage) {
      let image = currentText.image
      log('setting image to ', image.path)
      this.image.source = new Texture(image.path)

      this.image.positionX = image.offsetX ? image.offsetX + imageXPos : imageXPos
      this.image.positionY = image.offsetY ? image.offsetY + imageYPos : imageYPos

      this.image.width = currentText.image.width ? currentText.image.width : 256
      this.image.height = currentText.image.height ? currentText.image.height : 256

      if (image.section) {
        setSection(this.image, image.section)
      }
      this.image.visible = true
    } else {
      this.image.visible = false
    }

    // Buttons & action icons
    this.layoutDialogWindow(this.activeTextId)
  }

  // Adds the buttons or mouse icon depending on the type of window
  private layoutDialogWindow(textId: number): void {
    let currentText = this.NPCScript[textId]

    this.isQuestionPanel = currentText.isQuestion

    this.isFixedScreen = currentText.isFixedScreen
    this.button1.hide()
    this.button2.hide()
    this.button3.hide()
    this.button4.hide()

    // Mouse icon
    this.leftClickIcon.visible = false

    if (currentText.isQuestion) {
      // Button E
      if (currentText.buttons.length >= 1) {
        this.button1.update(
          currentText.buttons[0].label,
          currentText.buttons[0].offsetX
            ? currentText.buttons[0].offsetX + button1XPos
            : button1XPos,
          currentText.buttons.length >= 3
            ? currentText.buttons[0].offsetY
              ? currentText.buttons[0].offsetY + button1YPos4
              : button1YPos4
            : currentText.buttons[0].offsetY
            ? currentText.buttons[0].offsetY + button1YPos
            : button1YPos
        )
      }

      // Button F
      if (currentText.buttons.length >= 2) {
        this.button2.update(
          currentText.buttons[1].label,
          currentText.buttons[1].offsetX
            ? currentText.buttons[1].offsetX + button2XPos
            : button2XPos,
          currentText.buttons.length >= 3
            ? currentText.buttons[1].offsetY
              ? currentText.buttons[1].offsetY + button2YPos4
              : button2YPos4
            : currentText.buttons[1].offsetY
            ? currentText.buttons[1].offsetY + button2YPos
            : button2YPos
        )
      }

      // Button 3
      if (currentText.buttons.length >= 3) {
        this.button3.update(
          currentText.buttons[2].label,
          currentText.buttons[2].offsetX
            ? currentText.buttons[2].offsetX + button3XPos
            : button3XPos,
          currentText.buttons[2].offsetY
            ? currentText.buttons[2].offsetY + button3YPos
            : button3YPos
        )
      }

      // Button 4
      if (currentText.buttons.length >= 4) {
        this.button4.update(
          currentText.buttons[3].label,
          currentText.buttons[3].offsetX
            ? currentText.buttons[3].offsetX + button4XPos
            : button4XPos,
          currentText.buttons[3].offsetY
            ? currentText.buttons[3].offsetY + button4YPos
            : button4YPos
        )
      }

      dummyQuestionDelays.addComponentOrReplace(
        new NPCDelay(0.7, () => {
          // Button E
          if (currentText.buttons.length >= 1) {
            this.button1.show()
          }
          // Button F
          if (currentText.buttons.length >= 2) {
            this.button2.show()
          }

          // Button 3
          if (currentText.buttons.length >= 3) {
            this.button3.show()
          }

          // Button 4
          if (currentText.buttons.length >= 4) {
            this.button4.show()
          }
        })
      )
    } else if (!this.isFixedScreen) {
      this.leftClickIcon.visible = true
    }
  }

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
      this.leftClickIcon.visible = false
      this.container.visible = false
    }
  }
}

const DEFAULT_SPEED = 30

export class DialogTypeInSystem implements ISystem {
  static _instance: DialogTypeInSystem | null = null

  timer: number = 0
  speed: number = DEFAULT_SPEED
  visibleChars: number = 0
  fullText: string = ''
  UIText: UIText
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
    if (this.timer >= 1 / this.speed) {
      let charsToAdd = Math.floor(this.timer / (1 / this.speed))
      this.timer = 0
      this.visibleChars += charsToAdd
      if (this.visibleChars >= this.fullText.length) {
		    this.done = true
		    this.visibleChars = this.fullText.length
      }
      this.UIText.value = this.fullText.substr(0, this.visibleChars)
    }
  }

  newText(ui: UIText, text: string, speed?: number) {
    this.UIText = ui
    this.fullText = text
    this.visibleChars = 0
    this.timer = 0
    this.done = false

    if (speed && speed <= 0) {
      this.rush()
    } else if (speed) {
      this.speed = speed
    } else {
      this.speed = DEFAULT_SPEED
    }
  }
  rush() {
    this.done = true
    this.UIText.value = this.fullText
    this.visibleChars = this.fullText.length
  }
}

export class CustomDialogButton extends Entity {
  label: UIText
  image: UIImage
  icon: UIImage
  style: ButtonStyles
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
    this.image.width = 174
    this.image.height = 46

    this.label = new UIText(this.image)
    this.style = style

    this.onClick = onClick

    if (style) {
      switch (style) {
        case ButtonStyles.E:
          setSection(this.image, resources.buttons.buttonE)
          this.label.positionX = 25

          this.icon = new UIImage(this.image, useDarkTheme == true ? darkTheme : lightTheme)
          this.icon.width = 26
          this.icon.height = 26
          // this.button1Icon.positionY = 15
          this.icon.hAlign = 'center'
          this.icon.vAlign = 'center'
          this.icon.isPointerBlocker = false
          setSection(this.icon, resources.buttonLabels.E)
          this.icon.positionX = buttonIconPos(label.length)

          break
        case ButtonStyles.F:
          setSection(this.image, resources.buttons.buttonF)
          this.label.positionX = 25

          this.icon = new UIImage(this.image, useDarkTheme == true ? darkTheme : lightTheme)
          this.icon.width = 26
          this.icon.height = 26
          // this.button1Icon.positionY = 15
          this.icon.hAlign = 'center'
          this.icon.vAlign = 'center'
          this.icon.isPointerBlocker = false
          setSection(this.icon, resources.buttonLabels.F)
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
    this.label.fontSize = 20
    this.label.font = SFFont
    this.label.color =
      style == ButtonStyles.ROUNDWHITE || style == ButtonStyles.SQUAREWHITE
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

    if (this.style == ButtonStyles.E || this.style == ButtonStyles.F) {
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
