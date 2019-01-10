class Cell {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.intensity = 0
    this.alpha = 1
  }

  getCellColor() {
    return arrayToRgba(getColorFromValue(this.intensity))
  }

  getIntensity() {
    return this.intensity
  }

  updateColor(toAdd) {
    if (this.intensity + toAdd <= 60) {
      this.intensity += toAdd
    }
  }

  update() {
    const startX = this.x * intervalX
    const startY = this.y * intervalY
    ctx.beginPath()
    ctx.rect(startX, startY, intervalX, intervalY)
    ctx.fillStyle = this.getCellColor()
    ctx.fill()
    ctx.closePath()
  }
}
