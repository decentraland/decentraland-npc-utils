export class Dialog {
  text: string
  fontSize?: number
  offsetX?: number
  offsetY?: number
  isQuestion?: boolean = false
  isFixedScreen?: boolean = false
  labelE?: {
    label: string
    fontSize?: number
    offsetX?: number
    offsetY?: number
  }
  ifPressE?: number
  triggeredByE?: () => void
  labelF?: {
    label: string
    fontSize?: number
    offsetX?: number
    offset?: number
  }
  ifPressF?: number
  triggeredByF?: () => void
  isEndOfDialog?: boolean = false
  triggeredByNext?: () => void
  portrait?: ImageData
  image?: ImageData
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
