/**
 * Fragment of a conversation with an NPC
 *
 * @param text The dialog text
 * @param name Optional name of the dialog entry, to link other entries to this one and not worry about changes in the array length
 * @param fontSize Size of the text
 * @param offsetX Offset of the text on the X axis, relative to its normal position.
 * @param offsetY Offset of the text on the Y axis, relative to its normal position.
 * @param portrait Sets the portrait image to use on the left. This field expects a `Portrait` object.
 * @param image Sets a second image to use on the right of the dialog, and slightly up. This field expects an `ImageData` object.
 * @param typeSpeed The text appears one character at a time, simulating typing. Players can click to skip the animation. Tune the speed of this typing (30 by default) to go slower or faster. Set to _-1_ to skip the animation.
 * @param isQuestion If true, allows to use buttons to trigger different actions
 * @param isFixedScreen If true, has no buttons or "next page" functionality
 * @param buttons An array of buttons `ButtonData` objects to use in a question entry
 *
 */
export class Dialog {
  text: string
  name?: string
  fontSize?: number
  offsetX?: number
  offsetY?: number
  typeSpeed?: number
  isEndOfDialog?: boolean = false
  triggeredByNext?: () => void
  portrait?: ImageData
  image?: ImageData
  isQuestion?: boolean = false
  isFixedScreen?: boolean = false
  buttons?: ButtonData[]
}

/**
 * Data for Button to show on a question in a Dialog entry
 *
 * @param goToDialog The index or name of the next dialog entry to display when activated.
 * @param label The label to show on the button.
 * @param triggeredActions An additional function to run whenever the button is activated
 * @param fontSize Font size of the text
 * @param offsetX Offset of the text on the X axis, relative to its normal position.
 * @param offsetY Offset of the text on the Y axis, relative to its normal position.
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
}

/**
 * An NPC capable of having conversations with the player, and play different animations.
 *
 * @param portrait 2D image to show on the left-hand side of the dialog window. The structure of an `ImageData` object is described in detail below.
 * @param reactDistance Radius in meters for the player to activate the NPC or trigger the `onWalkAway()` function when leaving the radius.
 * @param idleAnim Name of the idle animation in the model. This animation is always looped. After playing a non-looping animation it returns to looping this one.
 * @param faceUser Set if the NPC rotates to face the user while active.
 * @param onlyExternalTrigger If true, the NPC can't be activated by clicking or walking near. Just by calling its `activate()` function.
 * @param onlyClickTrigger If true, the NPC can't be activated by walking near. Just by clicking on it or calling its `activate()` function.
 * @param onWalkAway Function to call every time the player walks out of the `reactDistance` radius.
 * @param continueOnWalkAway f true,when the player walks out of the `reactDistance` radius, the dialog window stays open and the NPC keeps turning to face the player (if applicable). It doesn't affect the triggering of the `onWalkAway()` function.
 * @param darkUI If true, the dialog UI uses the dark theme.
 * @param coolDownDuration Change the cooldown period for activating the NPC again. The number is in seconds.
 * @param hoverText Set the UI hover feedback when pointing the cursor at the NPC. _TALK_ by default.
 * @param dialogSound Path to sound file to play once for every line of dialog read on the UI.
 *
 */
export type NPCData = {
  portrait?: string | ImageData
  reactDistance?: number
  idleAnim?: string
  faceUser?: boolean
  onlyExternalTrigger?: boolean
  onlyClickTrigger?: boolean
  onWalkAway?: () => void
  continueOnWalkAway?: boolean
  darkUI?: boolean
  coolDownDuration?: number
  hoverText?: string
  dialogSound?: string
}

export class Dialogs {
  dialogs: Dialog[]
}

/**
 * Cut out a section of an image file
 *
 * @param sourceWidth Width in pixels to select from image, starting from the sourceLeft, going right
 * @param sourceHeight Height in pixels to select from image, starting from the sourceTop, going down
 * @param sourceLeft Leftmost pixel to select from image
 * @param sourceTop Topmost pixel to select from image
 *
 */
export type ImageSection = {
  sourceWidth: number
  sourceHeight: number
  sourceLeft?: number
  sourceTop?: number
}

/**
 * Data for displaying an image
 *
 * @param path Path to the image file.
 * @param offsetX Offset on X, relative to the normal position of the image.
 * @param offsetY Offset on Y, relative to the normal position of the image.
 * @param height The height to show the image onscreen.
 * @param width The width to show the image onscreen.
 * @param section Use only a section of the image file, useful when arranging multiple icons into an image atlas. This field takes an `ImageSection` object, specifying `sourceWidth` and `sourceHeight`, and optionally also `sourceLeft` and `sourceTop`.
 *
 */
export class ImageData {
  path: string
  offsetX?: number
  offsetY?: number
  height?: number
  width?: number
  section?: ImageSection
}
