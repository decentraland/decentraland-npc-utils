import { bubblesTexture, setUVSection, SFHeavyFont } from "../utils/default-ui-components"
import { Dialog } from "../utils/types"
import resources from "./resources"

let textSize = 1
let textYPos = 0

let maxLengthShortBubble = 8
let maxLengthNormalBubble = 25
let maxLengthLongBubble = 50
let maxLengthHugeBubble = 100

let shortBubbleXOffset = -0.1
let normalBubbleXOffset = -0.5
let longBubbleXOffset = -0.8
let hugeBubbleXOffset = -0.8

let shortBubbleYOffset = -0.2
let normalBubbleYOffset = -0.2
let longBubbleYOffset = 0
let hugeBubbleYOffset = 0.2

let shortBubbleTextWidth = 0.7
let normalBubbleTextWidth = 1.5
let longBubbleTextWidth = 2
let hugeBubbleTextWidth = 2

let shortBubbleX = 116 * 0.005
let shortBubbleY = 84 * 0.005

let normalBubbleX = 286 * 0.005
let normalBubbleY = 84 * 0.005

let longBubbleX = 497 * 0.005
let longBubbleY = 153 * 0.005

let hugeBubbleX = 497 * 0.005
let hugeBubbleY = 239 * 0.005

let defaultYOffset = 2.5

/**
 * Displays an in-world panel as a speech bubble, with text from an array of Dialog objects.
 *
 * @param parent Entity to set as parent. The Bubble will inherit the position, rotation and scale of the parent.
 * @param height Height in meters to float the bubble above the parent's position.
 * @param sound Path to a sound file to play once for every dialog window shown.
 *
 */
export class DialogBubble {
  public NPCScript: Dialog[] = []
  public container: Entity
  public panel: Entity
  public rootEntity: Entity
  public text: Entity
  public material: BasicMaterial
  public isBubleOpen: boolean = false
  public activeTextId: number = 0
  public uiTheme: Texture
  public soundEnt: Entity
  public defaultSound: string | null = null
  public baseYOffset: number = defaultYOffset
  // ClickAction: null | (() => false | Subscription[]) = null

  constructor(parent: Entity, height?: number, sound?: string) {
    this.baseYOffset = height ? height : defaultYOffset

   // Root
   this.rootEntity = new Entity()
   this.rootEntity.addComponent(new Billboard(false, true, false))
   this.rootEntity.addComponent(new Transform())
   this.rootEntity.setParent(parent)

   // Container
   this.container = new Entity()
   //this.container.addComponent(new Billboard(false, true, false))
   this.container.addComponent(
	 new Transform({
	   position: new Vector3(shortBubbleXOffset, this.baseYOffset, 0),
	 })
   )
   this.container.setParent(this.rootEntity)

    // Material
	this.material = new BasicMaterial()
	this.material.texture = bubblesTexture

    // Background Panel
    this.panel = new Entity()
    this.panel.addComponent(
      new Transform({
        scale: new Vector3(2, 1, 1),
      })
    )
    this.panel.setParent(this.container)
    this.panel.addComponent(new PlaneShape())
    this.panel.addComponent(this.material)
	this.panel.getComponent(PlaneShape).visible = false

    setUVSection(
      this.panel.getComponent(PlaneShape),
      resources.bubbles.normal,
      1024,
      1024
    )

    // Dialog Text
    this.text = new Entity()
    this.text.addComponent(
      new Transform({
        position: new Vector3(0, textYPos, 0.05),
        rotation: Quaternion.Euler(0, 180, 0),
      })
    )
    this.text.addComponent(new TextShape(''))
    this.text.setParent(this.container)

    this.text.getComponent(TextShape).textWrapping = true
    this.text.getComponent(TextShape).font = SFHeavyFont
    this.text.getComponent(TextShape).hTextAlign = 'center'
    this.text.getComponent(TextShape).vTextAlign = 'center'
    this.text.getComponent(TextShape).fontSize = textSize
    this.text.getComponent(TextShape).fontWeight = 'normal'
    this.text.getComponent(TextShape).color = Color3.Black()
	this.text.getComponent(TextShape).visible = false

    this.soundEnt = new Entity()

    if (sound) {
      this.soundEnt.addComponent(new Transform())
      engine.addEntity(this.soundEnt)
      this.soundEnt.setParent(this.container)

      this.soundEnt.addComponent(new AudioSource(new AudioClip(sound)))
      this.soundEnt.getComponent(AudioSource).volume = 0.5

      this.defaultSound = sound
    }

    WorldDialogTypeInSystem.createAndAddToEngine()
  }

  /**
   * Opens a dialog bubble to start a conversation.
   * @param {Dialog[]} NPCScript  Instructions to follow during the conversation
   * @param {number|string} textId Where to start in the script. Can refer to an index in the array or the `name` field of a Dialog entry.
   */
  public openDialogWindow(NPCScript: Dialog[], textId?: number | string): void {
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
      this.soundEnt.addComponentOrReplace(
        new AudioSource(new AudioClip(currentText.audio))
      )
      this.soundEnt.getComponent(AudioSource).volume = 0.5
      this.soundEnt.getComponent(AudioSource).playOnce()
    } else if (this.defaultSound) {
      this.soundEnt.addComponentOrReplace(
        new AudioSource(new AudioClip(this.defaultSound))
      )
      this.soundEnt.getComponent(AudioSource).playOnce()
    }

    // Set text
    this.text.getComponent(TextShape).fontSize = currentText.fontSize
      ? currentText.fontSize
      : textSize
    this.text.getComponent(Transform).position.y = currentText.offsetY
      ? currentText.offsetY + textYPos
      : textYPos
    this.text.getComponent(Transform).position.x = currentText.offsetX
      ? currentText.offsetX
      : 0
    this.text.getComponent(TextShape).visible = true
    this.panel.getComponent(PlaneShape).visible = true
    this.text.getComponent(TextShape).value = ''

    if (currentText.text.length < maxLengthHugeBubble) {
      currentText.text.slice(0, maxLengthHugeBubble)
    }

    WorldDialogTypeInSystem._instance!.newText(
      this,
      currentText.text,
      this.activeTextId,
      currentText.timeOn ? currentText.timeOn : undefined,
      currentText.typeSpeed ? currentText.typeSpeed : undefined
    )

    this.adjustBubble(currentText.text.length)

    // Global button events
    //   if (!this.ClickAction) {
    // 	this.ClickAction = Input.instance.subscribe(
    // 	  'BUTTON_DOWN',
    // 	  ActionButton.POINTER,
    // 	  false,
    // 	  (e) => {
    // 		if (!this.isDialogOpen || +Date.now() - this.UIOpenTime < 100) return

    // 		if (!DialogTypeInSystem._instance!.done) {
    // 		  DialogTypeInSystem._instance!.rush()
    // 		  return
    // 		} else if (!this.isQuestionPanel && !this.isFixedScreen) {
    // 		  this.confirmText(ConfirmMode.Next)
    // 		}
    // 	  }
    // 	)

    // }

    this.layoutDialogWindow(this.activeTextId)
    this.isBubleOpen = true
  }

  private adjustBubble(textLength: number): void {
    if (textLength < maxLengthShortBubble) {
      setUVSection(
        this.panel.getComponent(PlaneShape),
        resources.bubbles.short,
        1024,
        1024
      )
      this.panel.getComponent(Transform).scale.x = shortBubbleX
      this.panel.getComponent(Transform).scale.y = shortBubbleY
      this.container.getComponent(Transform).position.x = shortBubbleXOffset
      this.container.getComponent(Transform).position.y =
        this.baseYOffset + shortBubbleYOffset
      this.text.getComponent(TextShape).width = shortBubbleTextWidth
    } else if (textLength < maxLengthNormalBubble) {
      setUVSection(
        this.panel.getComponent(PlaneShape),
        resources.bubbles.normal,
        1024,
        1024
      )
      this.panel.getComponent(Transform).scale.x = normalBubbleX
      this.panel.getComponent(Transform).scale.y = normalBubbleY
      this.container.getComponent(Transform).position.x = normalBubbleXOffset
      this.container.getComponent(Transform).position.y =
        this.baseYOffset + normalBubbleYOffset
      this.text.getComponent(TextShape).width = normalBubbleTextWidth
    } else if (textLength < maxLengthLongBubble) {
      setUVSection(
        this.panel.getComponent(PlaneShape),
        resources.bubbles.long,
        1024,
        1024
      )
      this.panel.getComponent(Transform).scale.x = longBubbleX
      this.panel.getComponent(Transform).scale.y = longBubbleY
      this.container.getComponent(Transform).position.y =
        this.baseYOffset + longBubbleYOffset
      this.container.getComponent(Transform).position.x = longBubbleXOffset
      this.text.getComponent(TextShape).width = longBubbleTextWidth
    } else {
      setUVSection(
        this.panel.getComponent(PlaneShape),
        resources.bubbles.huge,
        1024,
        1024
      )
      this.panel.getComponent(Transform).scale.x = hugeBubbleX
      this.panel.getComponent(Transform).scale.y = hugeBubbleY
      this.container.getComponent(Transform).position.y =
        this.baseYOffset + hugeBubbleYOffset
      this.container.getComponent(Transform).position.x = hugeBubbleXOffset
      this.text.getComponent(TextShape).width = hugeBubbleTextWidth
    }
  }

  // Progresses text
  public next(): void {
    let currentText = this.NPCScript[this.activeTextId]

	if(!currentText){
		currentText = this.NPCScript[this.activeTextId-1]
	}

    if (currentText.triggeredByNext) {
      currentText.triggeredByNext()
    }

	if (currentText.isEndOfDialog) {
		this.closeDialogWindow()
		return
	  }
   
	 // Update active text
    this.activeTextId++

    // Update active text with new active text
    currentText = this.NPCScript[this.activeTextId]

    if (currentText.text.length < maxLengthHugeBubble) {
      currentText.text.slice(0, maxLengthHugeBubble)
    }
    this.text.getComponent(TextShape).value = ''

    this.adjustBubble(currentText.text.length)

    WorldDialogTypeInSystem._instance!.newText(
      this,
      currentText.text,
      this.activeTextId,
      currentText.timeOn ? currentText.timeOn : undefined,
      currentText.typeSpeed ? currentText.typeSpeed : undefined
    )
	this.layoutDialogWindow(this.activeTextId)

  }

  // Adds the buttons or mouse icon depending on the type of window
  public layoutDialogWindow(textId: number): void {
    let currentText: Dialog = this.NPCScript[textId]
      ? this.NPCScript[textId]
      : { text: '' }

    // Update text
    let textY = currentText.offsetY ? currentText.offsetY + textYPos : textYPos

    if (currentText.buttons && currentText.buttons.length >= 3) {
      textY += 50
    } else if (currentText.buttons && currentText.buttons.length >= 1) {
      textY += 24
    }

    this.text.getComponent(TextShape).fontSize = currentText.fontSize
      ? currentText.fontSize
      : textSize
    
	this.text.getComponent(TextShape).visible = true
	this.text.getComponent(Transform).position.y = textY

    if (currentText.audio) {
      this.soundEnt.addComponentOrReplace(
        new AudioSource(new AudioClip(currentText.audio))
      )
      this.soundEnt.getComponent(AudioSource).volume = 0.5
      this.soundEnt.getComponent(AudioSource).playOnce()
    } else if (this.defaultSound) {
      this.soundEnt.addComponentOrReplace(
        new AudioSource(new AudioClip(this.defaultSound))
      )
      this.soundEnt.getComponent(AudioSource).playOnce()
    }
  }

  /**
   * Closes the dialog bubble, executing associated triggeredByNext functions.
   */
  public closeDialogWindow(): void {
    if (this.isBubleOpen) {
      this.isBubleOpen = false

      this.text.getComponent(TextShape).value = ''
      this.text.getComponent(TextShape).visible = false

      this.panel.getComponent(PlaneShape).visible = false
    }
  }

   /**
   * Closes the dialog bubble, and stops executed any associated triggeredByNext actions.
   */
  public closeDialogEndAll(): void {
    if (this.isBubleOpen) {
    
	  if(WorldDialogTypeInSystem._instance.Dialog == this){
		WorldDialogTypeInSystem._instance.done = true
		WorldDialogTypeInSystem._instance.Dialog = null
	  }
	  this.isBubleOpen = false

      this.text.getComponent(TextShape).value = ''
      this.text.getComponent(TextShape).visible = false
      this.panel.getComponent(PlaneShape).visible = false
	  
    }
  }

  public skipDialogs() {
    if (!this.isBubleOpen) return


    while (
      this.NPCScript[this.activeTextId]
    ) {

		if (this.NPCScript[this.activeTextId].triggeredByNext) {
			this.NPCScript[this.activeTextId].triggeredByNext()
		  }
      
      if (
        this.NPCScript[this.activeTextId].isEndOfDialog
      ) {
        this.closeDialogWindow()
        return
      }
	  this.activeTextId += 1
    }

  }
}

const DEFAULT_SPEED = 45

const DEFAULT_TIME_ON = 3

export class WorldDialogTypeInSystem implements ISystem {
  static _instance: WorldDialogTypeInSystem | null = null

  timer: number = 0
  speed: number = DEFAULT_SPEED
  visibleChars: number = 0
  fullText: string = ''
  Dialog: DialogBubble | null
  Text: TextShape | null = null
  textId: number = 0
  done: boolean = true
  showing: boolean = false
  timeOn: number = DEFAULT_TIME_ON
  window: DialogBubble

  static createAndAddToEngine(): WorldDialogTypeInSystem {
    if (this._instance == null) {
      this._instance = new WorldDialogTypeInSystem()
      engine.addSystem(this._instance)
    }
    return this._instance
  }

  private constructor() {
    WorldDialogTypeInSystem._instance = this
  }

  update(dt: number) {
    if (this.done) return

    this.timer += dt
    if (this.showing) {
      if (this.timer > this.timeOn) {
        this.showing = false
        this.done = true
		this.timer = 0
        this.window.next()
      }
    } else if (this.timer >= 2 / this.speed) {
      let charsToAdd = Math.floor(this.timer / (1 / this.speed))
      this.timer = 0
      this.visibleChars += charsToAdd

	   // support <> tags
	   this.closeTag(charsToAdd)

      if (this.visibleChars >= this.fullText.length) {
        this.showing = true
        this.timer = 0
        this.visibleChars = this.fullText.length
      }
      if (this.Text) {
        this.Text.value = this.fullText.substr(0, this.visibleChars)
      }
    }
  }

  newText(
    dialog: DialogBubble,
    text: string,
    textId: number,
    timeOn?: number,
    speed?: number
  ) {

	// prevent circular loops
	if(dialog == this.Dialog && textId == this.textId){
		return
	}

	let oldDialog = this.Dialog

	this.Dialog = dialog
	this.Text = this.Dialog.text.getComponent(TextShape)
	this.textId = textId

	if(oldDialog && dialog != oldDialog){
		oldDialog.skipDialogs()
	} 
	

    this.timer = 0
    this.done = false
    this.showing = false
    
    this.fullText = text
    this.visibleChars = 0
    this.window = dialog

    if (speed && speed <= 0) {
      this.rush()
    } else if (speed) {
      this.speed = speed
    } else {
      this.speed = DEFAULT_SPEED
    }

    if (timeOn) {
      this.timeOn = timeOn
    } else {
      this.timeOn = DEFAULT_TIME_ON
    }

    // Buttons & action icons
    //dialog.layoutDialogWindow(textId)
  }
  rush() {
    this.showing = true
    this.timer = 0
    this.visibleChars = this.fullText.length

    if (this.Text) {
      this.Text.value = this.fullText
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

function findDialogByName(dialogs: Dialog[], name: string) {
  for (let i = 0; i < dialogs.length; i++) {
    if (dialogs[i].name && dialogs[i].name == name) {
      return i
    }
  }
  return 0
}
