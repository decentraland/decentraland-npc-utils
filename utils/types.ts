export class Dialog {
  text: string
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

export type ButtonData = {
  goToDialog: number
  label: string
  triggeredActions?: () => void
  fontSize?: number
  offsetX?: number
  offsetY?: number
}

export enum ButtonStyles {
  E = `e`,
  F = `f`,
  ROUNDBLACK = `roundblack`,
  ROUNDWHITE = `roundwhite`,
  ROUNDSILVER = `roundsilver`,
  ROUNDGOLD = `roundgold`,
  SQUAREBLACK = `squareblack`,
  SQUAREWHITE = `squarewhite`,
  SQUARESILVER = `squaresilver`,
  SQUAREGOLD = `squaregold`,
}

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

export type ImageSection = {
  sourceWidth: number
  sourceHeight: number
  sourceLeft?: number
  sourceTop?: number
}

export class ImageData {
  path: string
  offsetX?: number
  offsetY?: number
  height?: number
  width?: number
  section?: ImageSection
}
