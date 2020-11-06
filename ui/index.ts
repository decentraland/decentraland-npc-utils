import {
  canvas,
  SFFont,
  lightTheme,
  darkTheme,
  SFHeavyFont,
} from './../utils/default-ui-components'
import { ImageData, Dialog } from '../utils/types'
import resources, { setSection } from './resources'

export enum ConfirmMode {
  Confirm = 0,
  Cancel = 1,
  Next = 2,
}

let portraitXPos = -350
let portraitYPos = 0

let imageXPos = 350
let imageYPos = 50

let textSize = 24
let textYPos = 10

let buttonTextSise = 18

export class DialogWindow {
  public NPCScript: Dialog[]
  private defaultPortrait: ImageData = null
  public container: UIContainerRect
  public panel: UIImage
  public portrait: UIImage
  public image: UIImage
  public text: UIText
  public buttonE: UIImage
  public buttonELabel: UIText
  public buttonF: UIImage
  public buttonFLabel: UIText
  public leftClickIcon: UIImage
  public isDialogOpen: boolean
  public isQuestionPanel: boolean
  public isFixedScreen: boolean
  public activeTextId: number
  public uiTheme: Texture
  private UIOpenTime: number

  canvas: UICanvas = canvas
  ClickAction: () => false | Subscription[]
  EButtonAction: () => false | Subscription[]
  FButtonAction: () => false | Subscription[]
  constructor(defaultPortrait?: ImageData, useDarkTheme?: boolean, customTheme?: Texture) {
    this.defaultPortrait = defaultPortrait ? defaultPortrait : null

    this.uiTheme = customTheme ? customTheme : useDarkTheme ? darkTheme : lightTheme

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

    // Button E
    this.buttonE = new UIImage(this.container, this.uiTheme)
    this.buttonE.width = 174
    this.buttonE.height = 46
    setSection(this.buttonE, resources.buttons.buttonE)
    this.buttonE.positionX = 150
    this.buttonE.positionY = -65
    this.buttonE.visible = false
    this.buttonE.isPointerBlocker = true
    this.buttonE.onClick = new OnClick((): void => {
      this.confirmText(ConfirmMode.Confirm)
    })

    // Label E Text
    this.buttonELabel = new UIText(this.buttonE)
    this.buttonELabel.hTextAlign = 'center'
    this.buttonELabel.vTextAlign = 'center'
    this.buttonELabel.positionX = 30
    this.buttonELabel.fontSize = buttonTextSise
    this.buttonELabel.font = SFFont
    this.buttonELabel.color = Color4.White()
    this.buttonELabel.isPointerBlocker = false

    // Button F
    this.buttonF = new UIImage(this.container, this.uiTheme)
    this.buttonF.width = 174
    this.buttonF.height = 46
    setSection(this.buttonF, resources.buttons.buttonF)
    this.buttonF.positionX = -80
    this.buttonF.positionY = -65
    this.buttonF.visible = false
    this.buttonF.isPointerBlocker = true
    this.buttonF.onClick = new OnClick((): void => {
      this.confirmText(ConfirmMode.Cancel)
    })

    // Label F Text
    this.buttonFLabel = new UIText(this.buttonF)
    this.buttonFLabel.hTextAlign = 'center'
    this.buttonFLabel.vTextAlign = 'center'
    this.buttonFLabel.positionX = 30
    this.buttonFLabel.fontSize = buttonTextSise
    this.buttonFLabel.font = SFFont
    this.buttonFLabel.color = Color4.White()
    this.buttonFLabel.isPointerBlocker = false

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
  }

  public openDialogWindow(NPCScript: Dialog[], textId: number): void {
    this.UIOpenTime = +Date.now()

    this.NPCScript = NPCScript
    this.activeTextId = textId

    let currentText = NPCScript[textId]

    // Set portrait
    // Looks for portrait in current text, otherwise use default portrait data
    let hasPortrait = NPCScript[textId].portrait ? true : false

    if (hasPortrait || this.defaultPortrait) {
      log(
        'setting portrait to ',
        hasPortrait ? NPCScript[textId].portrait.path : this.defaultPortrait.path
      )
      this.portrait.source = new Texture(
        hasPortrait ? NPCScript[textId].portrait.path : this.defaultPortrait.path
      )

      this.portrait.positionX = hasPortrait
        ? NPCScript[textId].portrait.offsetX
          ? NPCScript[textId].portrait.offsetX + portraitXPos
          : portraitXPos
        : this.defaultPortrait && this.defaultPortrait.offsetX
        ? this.defaultPortrait.offsetX + portraitXPos
        : portraitXPos
      this.portrait.positionY = hasPortrait
        ? NPCScript[textId].portrait.offsetY
          ? NPCScript[textId].portrait.offsetY + portraitYPos
          : portraitYPos
        : this.defaultPortrait && this.defaultPortrait.offsetY
        ? this.defaultPortrait.offsetY + portraitYPos
        : portraitYPos
      this.portrait.width = hasPortrait
        ? NPCScript[textId].portrait.width
          ? NPCScript[textId].portrait.width
          : 256
        : this.defaultPortrait && this.defaultPortrait.width
        ? this.defaultPortrait.width
        : 256
      this.portrait.height = hasPortrait
        ? NPCScript[textId].portrait.height
          ? NPCScript[textId].portrait.height
          : 256
        : this.defaultPortrait && this.defaultPortrait.height
        ? this.defaultPortrait.height
        : 256

      if (hasPortrait && NPCScript[textId].portrait.section) {
        setSection(this.portrait, NPCScript[textId].portrait.section)
      } else if (!hasPortrait && this.defaultPortrait && this.defaultPortrait.section) {
        setSection(this.portrait, this.defaultPortrait.section)
      }
      this.portrait.visible = true
    } else {
      log('No portrait')
      this.portrait.visible = false
    }

    let hasImage = NPCScript[textId].image ? true : false

    // Set image on the right
    if (hasImage) {
      let image = NPCScript[textId].image
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
    this.text.value = currentText.text
    this.text.fontSize = currentText.fontSize ? currentText.fontSize : textSize
    this.text.positionY = currentText.offsetY ? currentText.offsetY + textYPos : textYPos
    this.text.positionX = currentText.offsetX ? currentText.offsetX : 0
    this.text.visible = true
    this.container.visible = true

    // Global button events
    if (!this.ClickAction) {
      this.ClickAction = Input.instance.subscribe(
        'BUTTON_DOWN',
        ActionButton.POINTER,
        false,
        (e) => {
          if (
            this.isDialogOpen &&
            !this.isQuestionPanel &&
            !this.isFixedScreen &&
            +Date.now() - this.UIOpenTime > 100
          ) {
            this.confirmText(ConfirmMode.Next)
          }
        }
      )
      this.EButtonAction = Input.instance.subscribe(
        'BUTTON_DOWN',
        ActionButton.PRIMARY,
        false,
        (e) => {
          if (this.isDialogOpen && this.isQuestionPanel && +Date.now() - this.UIOpenTime > 100) {
            this.confirmText(ConfirmMode.Confirm)
          }
        }
      )
      this.FButtonAction = Input.instance.subscribe(
        'BUTTON_DOWN',
        ActionButton.SECONDARY,
        false,
        (e) => {
          if (this.isDialogOpen && this.isQuestionPanel && +Date.now() - this.UIOpenTime > 100) {
            this.confirmText(ConfirmMode.Cancel)
          }
        }
      )
    }

    // Layout panel buttons and icon
    this.layoutDialogWindow(textId)

    this.isDialogOpen = true
  }

  // Progresses text
  public confirmText(mode: ConfirmMode): void {
    let currentText = this.NPCScript[this.activeTextId]

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

    if (mode == ConfirmMode.Confirm && currentText.ifPressE) {
      this.activeTextId = currentText.ifPressE
      if (currentText.triggeredByE) {
        currentText.triggeredByE()
      }
    }

    if (mode == ConfirmMode.Cancel && currentText.ifPressF) {
      this.activeTextId = currentText.ifPressF
      if (currentText.triggeredByF) {
        currentText.triggeredByF()
      }
    }

    // Update active text with new active text
    currentText = this.NPCScript[this.activeTextId]

    // Update text
    this.text.value = currentText.text
    this.text.fontSize = currentText.fontSize ? currentText.fontSize : textSize
    this.text.positionY = currentText.offsetY ? currentText.offsetY + textYPos : textYPos

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

    if (currentText.isQuestion) {
      // Button E and label

      this.buttonE.visible = true

      this.buttonELabel.value =
        currentText.labelE && currentText.labelE['label'] ? currentText.labelE['label'] : 'Yes'
      this.buttonELabel.positionX =
        currentText.labelE && currentText.labelE['offsetX']
          ? currentText.labelE['offsetX'] + 22
          : 22
      this.buttonELabel.positionY =
        currentText.labelE && currentText.labelE['offsetY'] ? currentText.labelE['offsetY'] : 0
      this.buttonELabel.fontSize =
        currentText.labelE && currentText.labelE['fontSize']
          ? currentText.labelE['fontSize']
          : buttonTextSise

      this.buttonELabel.visible = true

      // Button F and label
      this.buttonF.visible = true

      this.buttonFLabel.value =
        currentText.labelF && currentText.labelF['label'] ? currentText.labelF['label'] : 'No'
      this.buttonFLabel.positionX =
        currentText.labelF && currentText.labelF['offsetX']
          ? currentText.labelF['offsetX'] + 22
          : 22
      this.buttonFLabel.positionY =
        currentText.labelF && currentText.labelF['offsetY'] ? currentText.labelF['offsetY'] : 0
      this.buttonFLabel.fontSize =
        currentText.labelF && currentText.labelF['fontSize']
          ? currentText.labelF['fontSize']
          : buttonTextSise

      this.buttonFLabel.visible = true

      // Mouse icon
      this.leftClickIcon.visible = false
    } else if (!this.isFixedScreen) {
      this.leftClickIcon.visible = true
      this.buttonE.visible = false
      this.buttonELabel.visible = false
      this.buttonF.visible = false
      this.buttonFLabel.visible = false
    }
  }

  public closeDialogWindow(): void {
    if (this.isDialogOpen) {
      this.isDialogOpen = false
      this.container.visible = false
      this.portrait.visible = false
      this.text.visible = false
      this.buttonE.visible = false
      this.buttonELabel.visible = false
      this.buttonF.visible = false
      this.buttonFLabel.visible = false
      this.leftClickIcon.visible = false
    }
  }
}
