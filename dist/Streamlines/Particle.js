const AURA_RADIUS = 100
const MAX_SPEED = 50
// The higher, the less precision in the directions of the streamlines, but the faster
// everything will run.
const SIMPLIFICATION = 5
const UPDATE_EVERY = 5 // Updates only applied every x frames

class Particle {
  constructor(ctx, x, y, radius) {
    this.ctx = ctx
    this.x = x
    this.y = y
    this.radius = radius
    this.directionX = (getRandomNumberBetween(0, 20) - 10) / 10
    this.directionY = (getRandomNumberBetween(0, 20) - 10) / 10
    this.maxLifeSpan = getRandomNumberBetween(300, 500)
    this.lifeSpan = 0
    this.nbUpdates = 0
  }

  draw() {
    const { ctx } = this
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = "#FFF"
    ctx.fill()
    ctx.closePath()
    this.lifeSpan += 1
  }

  getNextDirection() {
    if (this.nbUpdates !== UPDATE_EVERY) {
      this.nbUpdates += 1
      return [this.directionX, this.directionY]
    }

    this.nbUpdates = 0
    const cells = getCellsInRadius(this.x, this.y, AURA_RADIUS, SIMPLIFICATION)

    return cells.reduce(
      ([nextX, nextY], [cellX, cellY]) => {
        const currentCell = grid[cellX][cellY]
        const intensity = currentCell.getIntensity()
        if (intensity === 0) {
          return [nextX, nextY]
        }
        return getNextPosition(
          intensity,
          this.x,
          this.y,
          cellX,
          cellY,
          nextX,
          nextY
        )
      },
      [this.directionX, this.directionY]
    )
  }

  move() {
    this.x += this.directionX
    this.y += this.directionY
  }

  setDirection(x, y) {
    this.directionX = x
    this.directionY = y
  }

  shouldDie() {
    return (
      this.x < -this.radius ||
      this.x >= width + this.radius ||
      this.y < -this.radius ||
      this.y >= height + this.radius ||
      this.lifeSpan === this.maxLifeSpan
    )
  }
}
