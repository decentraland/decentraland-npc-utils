import { ImageSection } from '../utils/types'

export function setSection(UIImage: UIImage, section: ImageSection) {
  UIImage.sourceWidth = section.sourceWidth
  UIImage.sourceHeight = section.sourceHeight
  UIImage.sourceLeft = section.sourceLeft ? section.sourceLeft : 0
  UIImage.sourceTop = section.sourceTop ? section.sourceTop : 0
}

export function buttonIconPos(textLen: number) {
  let pos = -10 - textLen * 4
  return pos > -65 ? pos : -65
}

export default {
  buttons: {
    buttonE: {
      sourceWidth: 174,
      sourceHeight: 46,
      sourceLeft: 512,
      sourceTop: 662,
    },
    buttonF: {
      sourceWidth: 174,
      sourceHeight: 46,
      sourceLeft: 512,
      sourceTop: 612,
    },
    buttonRed: {
      sourceWidth: 174,
      sourceHeight: 46,
      sourceLeft: 512,
      sourceTop: 662,
    },
    buttonDark: {
      sourceWidth: 174,
      sourceHeight: 46,
      sourceLeft: 512,
      sourceTop: 612,
    },
    roundBlack: {
      sourceWidth: 128,
      sourceHeight: 32,
      sourceLeft: 512,
      sourceTop: 458,
    },
    squareBlack: {
      sourceWidth: 128,
      sourceHeight: 32,
      sourceLeft: 646,
      sourceTop: 457,
    },
    roundWhite: {
      sourceWidth: 128,
      sourceHeight: 32,
      sourceLeft: 512,
      sourceTop: 494,
    },
    squareWhite: {
      sourceWidth: 128,
      sourceHeight: 32,
      sourceLeft: 646,
      sourceTop: 493,
    },
    roundSilver: {
      sourceWidth: 128,
      sourceHeight: 32,
      sourceLeft: 512,
      sourceTop: 531,
    },
    squareSilver: {
      sourceWidth: 128,
      sourceHeight: 32,
      sourceLeft: 646,
      sourceTop: 531,
    },
    roundGold: {
      sourceWidth: 128,
      sourceHeight: 32,
      sourceLeft: 512,
      sourceTop: 567,
    },
    squareGold: {
      sourceWidth: 128,
      sourceHeight: 32,
      sourceLeft: 646,
      sourceTop: 567,
    },
  },
  buttonLabels: {
    E: {
      sourceWidth: 26,
      sourceHeight: 26,
      sourceLeft: 697,
      sourceTop: 611,
    },
    F: {
      sourceWidth: 26,
      sourceHeight: 26,
      sourceLeft: 733,
      sourceTop: 611,
    },
  },
  backgrounds: {
    promptBackground: {
      sourceWidth: 416,
      sourceHeight: 352,
      sourceLeft: 501,
      sourceTop: 12,
    },
    promptLargeBackground: {
      sourceWidth: 480,
      sourceHeight: 384,
      sourceLeft: 7,
      sourceTop: 12,
    },
    promptSlantedBackground: {
      sourceWidth: 486,
      sourceHeight: 326,
      sourceLeft: 7,
      sourceTop: 413,
    },
    NPCDialog: {
      sourceWidth: 766,
      sourceHeight: 248,
      sourceLeft: 22,
      sourceTop: 756,
    },
  },
  icons: {
    closeW: {
      sourceWidth: 32,
      sourceHeight: 32,
      sourceLeft: 942,
      sourceTop: 306,
    },
    closeD: {
      sourceWidth: 32,
      sourceHeight: 32,
      sourceLeft: 986,
      sourceTop: 306,
    },
    closeWLarge: {
      sourceWidth: 64,
      sourceHeight: 64,
      sourceLeft: 512,
      sourceTop: 381,
    },
    closeDLarge: {
      sourceWidth: 64,
      sourceHeight: 64,
      sourceLeft: 583,
      sourceTop: 381,
    },
    closeWNoBack: {
      sourceWidth: 24,
      sourceHeight: 24,
      sourceLeft: 946,
      sourceTop: 252,
    },
    closeDNoBack: {
      sourceWidth: 24,
      sourceHeight: 24,
      sourceLeft: 946,
      sourceTop: 214,
    },
    closeWNoBackLarge: {
      sourceWidth: 32,
      sourceHeight: 32,
      sourceLeft: 987,
      sourceTop: 214,
    },
    closeDNoBackLarge: {
      sourceWidth: 32,
      sourceHeight: 32,
      sourceLeft: 987,
      sourceTop: 260,
    },
    FDark: {
      sourceWidth: 32,
      sourceHeight: 32,
      sourceLeft: 950,
      sourceTop: 4,
    },
    FWhite: {
      sourceWidth: 32,
      sourceHeight: 32,
      sourceLeft: 987,
      sourceTop: 4,
    },
    EDark: {
      sourceWidth: 32,
      sourceHeight: 32,
      sourceLeft: 950,
      sourceTop: 40,
    },
    EWhite: {
      sourceWidth: 32,
      sourceHeight: 32,
      sourceLeft: 987,
      sourceTop: 40,
    },
    Timer: {
      sourceWidth: 24,
      sourceHeight: 32.2,
      sourceLeft: 718,
      sourceTop: 388,
    },
    TimerLarge: {
      sourceWidth: 48,
      sourceHeight: 68,
      sourceLeft: 662,
      sourceTop: 386,
    },
    ClickWhite: {
      sourceWidth: 32,
      sourceHeight: 48,
      sourceLeft: 799,
      sourceTop: 389,
    },
    ClickDark: {
      sourceWidth: 32,
      sourceHeight: 48,
      sourceLeft: 757,
      sourceTop: 389,
    },
  },
  checkboxes: {
    wOff: {
      sourceWidth: 24,
      sourceHeight: 24,
      sourceLeft: 987,
      sourceTop: 76,
    },
    wOn: {
      sourceWidth: 24,
      sourceHeight: 24,
      sourceLeft: 987,
      sourceTop: 104,
    },
    dOff: {
      sourceWidth: 24,
      sourceHeight: 24,
      sourceLeft: 958,
      sourceTop: 76,
    },
    dOn: {
      sourceWidth: 24,
      sourceHeight: 24,
      sourceLeft: 958,
      sourceTop: 104,
    },
    wLargeOff: {
      sourceWidth: 32,
      sourceHeight: 32,
      sourceLeft: 987,
      sourceTop: 132,
    },
    wLargeOn: {
      sourceWidth: 32,
      sourceHeight: 32,
      sourceLeft: 987,
      sourceTop: 168,
    },
    dLargeOff: {
      sourceWidth: 32,
      sourceHeight: 32,
      sourceLeft: 950,
      sourceTop: 132,
    },
    dLargeOn: {
      sourceWidth: 32,
      sourceHeight: 32,
      sourceLeft: 950,
      sourceTop: 168,
    },
  },
  switches: {
    roundOff: {
      sourceWidth: 64,
      sourceHeight: 32,
      sourceLeft: 783,
      sourceTop: 454,
    },
    roundRed: {
      sourceWidth: 64,
      sourceHeight: 32,
      sourceLeft: 853,
      sourceTop: 454,
    },
    roundGreen: {
      sourceWidth: 64,
      sourceHeight: 32,
      sourceLeft: 923,
      sourceTop: 454,
    },
    squareOff: {
      sourceWidth: 64,
      sourceHeight: 32,
      sourceLeft: 783,
      sourceTop: 501,
    },
    squareRed: {
      sourceWidth: 64,
      sourceHeight: 32,
      sourceLeft: 852,
      sourceTop: 501,
    },
    squareGreen: {
      sourceWidth: 64,
      sourceHeight: 32,
      sourceLeft: 921,
      sourceTop: 501,
    },
  },
}
