/**
 * Fragment of a conversation with an NPC
 *
 * @typedef {Object} Dialog - An entry in an NPC conversation
 * @property {string} text The dialog text
 * @property {string} name Optional name of the dialog entry, to link other entries to this one and not worry about changes in the array length
 * @property {number} fontSize Size of the text
 * @property {number} offsetX Offset of the text on the X axis, relative to its normal position.
 * @property {number} offsetY Offset of the text on the Y axis, relative to its normal position.
 * @property {ImageData} portrait Sets the portrait image to use on the left. This field expects a `Portrait` object.
 * @property {ImageData} image Sets a second image to use on the right of the dialog, and slightly up. This field expects an `ImageData` object.
 * @property {number} typeSpeed The text appears one character at a time, simulating typing. Players can click to skip the animation. Tune the speed of this typing (30 by default) to go slower or faster. Set to _-1_ to skip the animation.
 * @property {boolean} isQuestion If true, allows to use buttons to trigger different actions
 * @property {boolean} isFixedScreen If true, has no buttons or "next page" functionality
 * @property {ButtonData[]} buttons An array of buttons `ButtonData` objects to use in a question entry
 * @property {string} audio Path to sound file to play when the dialog is shown in the UI
 * @property {boolean} skipable If true, a "Skip" button on the UI lets players skip to the next non-skipable entry.
 * @property {number} timeOn How long to keep the text visible before moving on to the next entry. Only for bubble dialogs!
 *
 */
export type Dialog = {
  text: string
  name?: string
  fontSize?: number
  offsetX?: number
  offsetY?: number
  typeSpeed?: number
  isEndOfDialog?: boolean
  triggeredByNext?: () => void
  portrait?: ImageData
  image?: ImageData
  isQuestion?: boolean
  isFixedScreen?: boolean
  buttons?: ButtonData[]
  audio?: string
  skipable?: boolean
  timeOn?: number
}

/**
 *
 * @typedef {Object} TriggerData - Object with data for a NPCTriggerComponent
 * @property {number} layer  layer of the Trigger, useful to discriminate between trigger events. You can set multiple layers by using a | symbol.
 * @property {number} triggeredByLayer against which layers to check collisions
 * @property {(entity: Entity) => void } onTriggerEnter callback when an entity of a valid layer enters the trigger area
 * @property {(entity: Entity) => void} onTriggerExit callback when an entity of a valid layer leaves the trigger area
 * @property {() => void} onCameraEnter callback when the player enters the trigger area
 * @property {() => void} onCameraExit callback when the player leaves the trigger area
 * @property {boolean} enableDebug when true makes the trigger area visible for debug purposes.
 */
export type TriggerData = {
  layer?: number
  triggeredByLayer?: number
  onTriggerEnter?: (entity: Entity) => void
  onTriggerExit?: (entity: Entity) => void
  onCameraEnter?: () => void
  onCameraExit?: () => void
  enableDebug?: boolean
}

/**
 * Data for Button to show on a question in a Dialog entry
 *
 * @typedef {Object} ButtonData - Object with data for a Dialog UI button
 * @property {string|number} goToDialog The index or name of the next dialog entry to display when activated.
 * @property {string} label The label to show on the button.
 * @property {() => void} triggeredActions An additional function to run whenever the button is activated
 * @property {number} fontSize Font size of the text
 * @property {number}offsetX Offset of the text on the X axis, relative to its normal position.
 * @property {number} offsetY Offset of the text on the Y axis, relative to its normal position.
 *
 */
export type ButtonData = {
  goToDialog: number | string
  label: string
  triggeredActions?: () => void
  fontSize?: number
  offsetX?: number
  offsetY?: number
}

export enum ButtonStyles {
  E = `e`,
  F = `f`,
  DARK = `dark`,
  RED = `red`,
  ROUNDBLACK = `roundblack`,
  ROUNDWHITE = `roundwhite`,
  ROUNDSILVER = `roundsilver`,
  ROUNDGOLD = `roundgold`,
  SQUAREBLACK = `squareblack`,
  SQUAREWHITE = `squarewhite`,
  SQUARESILVER = `squaresilver`,
  SQUAREGOLD = `squaregold`,
  WHITE = `white`
}

/**
 * An NPC capable of having conversations with the player, and play different animations.
 *
 * @typedef {Object} NPCData Object with data to instance a new NPC
 * @property {string|ImageData} portrait 2D image to show on the left-hand side of the dialog window. The structure of an `ImageData` object is described in detail below.
 * @property {number} reactDistance Radius in meters for the player to activate the NPC or trigger the `onWalkAway()` function when leaving the radius.
 * @property {string} idleAnim Name of the idle animation in the model. This animation is always looped. After playing a non-looping animation it returns to looping this one.
 * @property {boolean} faceUser Set if the NPC rotates to face the user while active.
 * @property {boolean} onlyExternalTrigger If true, the NPC can't be activated by clicking or walking near. Just by calling its `activate()` function.
 * @property {boolean} onlyClickTrigger If true, the NPC can't be activated by walking near. Just by clicking on it or calling its `activate()` function.
 * @property {boolean} onlyETrigger If true, the NPC can't be activated by walking near. Just by pressing E on it or calling its `activate()` function.
 * @property {() => void} onWalkAway Function to call every time the player walks out of the `reactDistance` radius.
 * @property {boolean} continueOnWalkAway f true,when the player walks out of the `reactDistance` radius, the dialog window stays open and the NPC keeps turning to face the player (if applicable). It doesn't affect the triggering of the `onWalkAway()` function.
 * @property {boolean} darkUI If true, the dialog UI uses the dark theme.
 * @property {number} coolDownDuration Change the cooldown period for activating the NPC again. The number is in seconds.
 * @property {string} hoverText Set the UI hover feedback when pointing the cursor at the NPC. _TALK_ by default.
 * @property {string} dialogSound Path to sound file to play once for every line of dialog read on the UI.
 * @property {string} walkingAnim Animation to play when walking with followPath
 * @property {number} walkingSpeed Default speed to use when walking with followPath
 * @property {Vector3[]} path Array of Vector3 points representing the default path to walk over. The NPC will walk looping over these points
* @property {boolean} textBubble If true, the NPC can display text bubbles with dialogs
 * @property {number} bubbleHeight The default height to display text bubbles over the NPC's position
 * @property {boolean} noUI If true, no UI dialog elements are constructed. The NPC can use speech bubbles.
*
 */
export type NPCData = {
  portrait?: string | ImageData
  reactDistance?: number
  idleAnim?: string
  faceUser?: boolean
  turningSpeed?: number
  onlyExternalTrigger?: boolean
  onlyClickTrigger?: boolean
  onlyETrigger?: boolean
  onWalkAway?: () => void
  continueOnWalkAway?: boolean
  darkUI?: boolean
  coolDownDuration?: number
  hoverText?: string
  dialogSound?: string
  walkingAnim?: string
  walkingSpeed?: number
  path?: Vector3[]
  textBubble?: boolean
  bubbleHeight?: number
  noUI?: boolean
  
}

/**
 * Make an NPC walk following a path
 *
 * @typedef {Object} FollowPathData - Object with data to describe a path that an NPC can walk
 * @property {Vector3[]} path Array of `Vector3` positions to walk over.
 * @property {number} speed Speed to move at while walking this path. If no `speed` or `totalDuration` is provided, it uses the NPC's `walkingSpeed`, which is _2_ by default.
 * @property {number} totalDuration The duration in _seconds_ that the whole path should take. The NPC will move at the constant speed required to finish in that time. This value overrides that of the _speed_.
 * @property {boolean} loop _boolean_ If true, the NPC walks in circles over the provided set of points in the path. _false_ by default, unless the NPC is initiated with a `path`, in which case it starts as _true_.
 * @property {boolean} curve _boolean_ If true, the path is traced a single smooth curve that passes over each of the indicated points. The curve is made out of straight-line segments, the path is stored with 4 times as many points as originally defined. _false_ by default.
 * @property {number} startingPoint Index position for what point to start from on the path. _0_ by default.
 * @property {() => void} onFinishCallback Function to call when the NPC finished walking over all the points on the path. This is only called when `loop` is _false_.
 * @property {() => void} onReachedPointCallback Function to call once every time the NPC reaches a point in the path.
 *
 */
export type FollowPathData = {
  startingPoint?: number
  loop?: boolean
  curve?: boolean
  totalDuration?: number
  speed?: number
  path?: Vector3[]
  onFinishCallback?: () => void
  onReachedPointCallback?: () => void
}

/**
 * Cut out a section of an image file
 *
 * @typedef {Object} ImageSection - Object with data to only display a section of an image
 * @property {number} sourceWidth Width in pixels to select from image, starting from the sourceLeft, going right
 * @property {number} sourceHeight Height in pixels to select from image, starting from the sourceTop, going down
 * @property {number} sourceLeft Leftmost pixel to select from image
 * @property {number} sourceTop Topmost pixel to select from image
 *
 */
export type ImageSection = {
  sourceWidth: number
  sourceHeight: number
  sourceLeft?: number
  sourceTop?: number
}

/**
 *
 *
 * @typedef {Object} ImageData - Object with data for displaying an image
 * @property {string} path Path to the image file.
 * @property {number} offsetX Offset on X, relative to the normal position of the image.
 * @property {number} offsetY Offset on Y, relative to the normal position of the image.
 * @property {number} height The height to show the image onscreen.
 * @property {number} width The width to show the image onscreen.
 * @property {ImageSection} section Use only a section of the image file, useful when arranging multiple icons into an image atlas. This field takes an `ImageSection` object, specifying `sourceWidth` and `sourceHeight`, and optionally also `sourceLeft` and `sourceTop`.
 *
 */
export type ImageData = {
  path: string
  offsetX?: number
  offsetY?: number
  height?: number
  width?: number
  section?: ImageSection
}

export enum NPCState {
  STANDING = 'standing',
  TALKING = 'talking',
  FOLLOWPATH = 'followPath'
  //FOLLOWPLAYER = 'followPlayer'
}
