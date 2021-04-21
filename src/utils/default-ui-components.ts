import { ImageSection } from "./types"

export const canvas = new UICanvas()
canvas.visible = true

export let SFFont = new Font(Fonts.SanFrancisco)

export let SFHeavyFont = new Font(Fonts.SanFrancisco_Heavy)

export let lightTheme = new Texture('https://decentraland.org/images/ui/light-atlas-v3.png')
export let darkTheme = new Texture('https://decentraland.org/images/ui/dark-atlas-v3.png')

export let bubblesTexture = new Texture('https://decentraland.org/images/ui/dialog-bubbles.png')


export function setUVs(
	plane: PlaneShape,
	_uv00: Vector2,
	_uv10: Vector2,
	_uv11: Vector2,
	_uv01: Vector2
  ) {
	//log(_uv00, _uv10, _uv11, _uv01)
	plane.uvs = [
	  _uv00.x,
	  _uv00.y,
  
	  _uv10.x,
	  _uv10.y,
  
	  _uv11.x,
	  _uv11.y,
  
	  _uv01.x,
	  _uv01.y,
	  //----
	  _uv00.x,
	  _uv00.y,
  
	  _uv10.x,
	  _uv10.y,
  
	  _uv11.x,
	  _uv11.y,
  
	  _uv01.x,
	  _uv01.y,
	]
  }
  
  export function setUVSection(
	plane: PlaneShape,
	section: ImageSection,
	sizeX: number = 512,
	sizeY: number = 512
  ) {
	setUVs(
	  plane,
	  new Vector2(
		section.sourceLeft / sizeX,
		(sizeY - section.sourceTop - section.sourceHeight) / sizeY
	  ),
	  new Vector2(
		(section.sourceLeft + section.sourceWidth) / sizeX,
		(sizeY - section.sourceTop - section.sourceHeight) / sizeY
	  ),
  
	  new Vector2(
		(section.sourceLeft + section.sourceWidth) / sizeX,
		(sizeY - section.sourceTop) / sizeY
	  ),
	  new Vector2(section.sourceLeft / sizeX, (sizeY - section.sourceTop) / sizeY)
	)
  }
  