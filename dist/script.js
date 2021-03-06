const colorLegend = [
  { threshold: 60, color: [28, 0, 112, 1] },
  { threshold: 55, color: [56, 0, 112, 1] },
  { threshold: 50, color: [77, 0, 112, 1] },
  { threshold: 45, color: [152, 0, 150, 1] },
  { threshold: 40, color: [148, 0, 0, 1] },
  { threshold: 35, color: [180, 0, 0, 1] },
  { threshold: 30, color: [230, 139, 11, 1] },
  { threshold: 25, color: [218, 169, 0, 1] },
  { threshold: 20, color: [182, 231, 0, 1] },
  { threshold: 18, color: [172, 230, 0, 1] },
  { threshold: 17, color: [0, 230, 0, 1] },
  { threshold: 16, color: [0, 229, 21, 1] },
  { threshold: 14, color: [0, 230, 115, 1] },
  { threshold: 12, color: [0, 230, 172, 1] },
  { threshold: 10, color: [0, 227, 175, 1] },
  { threshold: 8, color: [0, 133, 133, 1] },
  { threshold: 6, color: [0, 116, 132, 1] },
  { threshold: 4, color: [33, 92, 99, 1] },
  { threshold: 2, color: [60, 71, 73, 1] },
  { threshold: 1, color: [57, 68, 70, 1] },
  { threshold: "negative-infinity", color: [57, 68, 70, 1] }
]

const DEG2RAD = Math.PI / 180
const RAD2DEG = 1 / DEG2RAD

/**
 * @brief tries to find the color of a given value inside the above color
 * legends array
 *
 * @param {number} value the value to get the color from
 *
 * @returns {number[]} the array of the closest previous threshold
 */
const getColorFromValue = value => {
  const length = colorLegend.length
  for (let i = 0; i < length; i += 1) {
    const { threshold } = colorLegend[i]
    if (value >= threshold) {
      const legendUp = colorLegend[i - 1]
      if (legendUp) {
        const { threshold: thresholdUp, color: colorUp } = legendUp
        const thresholdDown = threshold
        if (
          typeof thresholdDown === "number" &&
          typeof thresholdUp === "number"
        ) {
          const weightUp =
            (value - thresholdDown) / (thresholdUp - thresholdDown)
          const weightDown = 1 - weightUp
          const [rUp, gUp, bUp, aUp] = colorUp
          const [rDown, gDown, bDown, aDown] = colorLegend[i].color
          return [
            rUp * weightUp + rDown * weightDown,
            gUp * weightUp + gDown * weightDown,
            bUp * weightUp + bDown * weightDown,
            aUp * weightUp + aDown * weightDown
          ]
        }
      } else {
        return [28, 0, 112, 1]
      }
    }
  }
  return [57, 68, 70, 1]
}

/**
 * @brief checks whether a given point is inside the circle from the center
 * to a given radius
 *
 * @param {number[]} point the x and y coordinates of the point
 * @param {number[]} center the x and y coordinates of the center
 * @param {number} radius the radius of the circle to check
 *
 * @returns {boolean} true if point is inside the circle
 */
const insideCircle = (point, center, radius) => {
  return (
    Math.sqrt(
      Math.pow(point[0] - center[0], 2) + Math.pow(point[1] - center[1], 2)
    ) <= radius
  )
}

/**
 * @brief takes an array of numbers going from 0 to 255 and returns
 * a string in the form of a rgba color
 *
 * @param {number[]} array the array containing the numbers
 *
 * @returns {string} the rgba color
 */
const arrayToRgba = array => `rgba(${array.join(", ")})`

/**
 * @brief takes two points as parameters and returns the distance between
 * these points
 *
 * @param {number[]} point1 the x and y coordinates of the first point
 * @param {number[]} point2 the x and y coordinates of the second point
 *
 * @returns {number} the distance between the points
 */
const getDistanceBetweenPoints = ([x1, y1], [x2, y2]) => {
  const a = (x1 - x2) ** 2
  const b = (y1 - y2) ** 2
  return Math.sqrt(a + b)
}

/**
 * @brief Re-maps a number from one range to another.
 *
 * @param {Number} value the incoming value to be converted
 * @param {Number} start1 lower bound of the value's current range
 * @param {Number} stop1 upper bound of the value's current range
 * @param {Number} start2 lower bound of the value's target range
 * @param {Number} stop2 upper bound of the value's target range
 *
 * @returns {Number} remapped number
 */
const mapValue = (value, start1, stop1, start2, stop2) =>
  ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2

/**
 * @brief returns a random number between the min and max parameters
 *
 * @param {number} min the minimum possible value
 * @param {number} max the maximum possible value
 *
 * @returns {number} the random number
 */
const getRandomNumberBetween = (min, max) =>
  Math.floor(Math.random() * max + min)

const getAngle = ([originX, originY], [targetX, targetY]) => {
  const dx = originX - targetX
  const dy = originY - targetY
  let theta = Math.atan2(-dy, -dx) // [0, Ⲡ] then [-Ⲡ, 0]; clockwise; 0° = east
  theta *= 180 / Math.PI // [0, 180] then [-180, 0]; clockwise; 0° = east
  if (theta < 0) theta += 360 // [0, 360]; clockwise; 0° = east
  return theta
}

const shiftIntoValidRange = value => {
  const nShifts = Math.floor(value / 360.0)
  return value - nShifts * 360
}

const getNextPosition = (intensity, x, y, cellX, cellY, nextX, nextY) => {
  // Get the distance between the points and map it between 0 and 1
  // where 100 = 0, 50 = 0.5 and 1 = 1
  const distance = getDistanceBetweenPoints([x, y], [cellX, cellY])
  const distMultiplier = mapValue(distance, 100, 0, 0, 1)

  // map the intensity between 0 and 1
  const intensityMultiplier = mapValue(intensity, 0, 60, 0, 1)

  // The avgMultiplier is used in order balance the weight of the acceleration
  // if the current cell has a high  intensity, but a high distance, its weight
  // should be less than a medium intensity at a short distance.
  const avgMultiplier = (distMultiplier + intensityMultiplier) / 2

  // Calculate the current angle with the current direction
  const nextPos = [x + nextX, y + nextY]
  const currentAngle = getAngle([x, y], nextPos)

  // Calculate the angle with the currently checked cell
  const cellAngle = getAngle([x, y], [cellX, cellY])

  // Get the difference between those two angles and multiply it by the multiplier
  const angleDifference = Math.abs(currentAngle - cellAngle)
  const steeredAngle = angleDifference * avgMultiplier
  const nextAngle = currentAngle + steeredAngle

  const newAngle = shiftIntoValidRange(nextAngle) * DEG2RAD
  const mappedIntensity = mapValue(intensity * avgMultiplier, 0, 60, 1, 8)
  const newX = Math.cos(newAngle) * mappedIntensity
  const newY = Math.sin(newAngle) * mappedIntensity
  return [newX, newY]
}

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

class Streamlines {
  static getRandomParticle(ctx) {
    const x = getRandomNumberBetween(0, nbColumns)
    const y = getRandomNumberBetween(0, nbRows)
    const finalX = intervalX * x
    const finalY = intervalY * y
    return new Particle(ctx, finalX, finalY, 3)
  }

  constructor(ctx, total) {
    this.ctx = ctx
    this.particles = []
    this.total = total

    for (let i = 0; i < total; i += 1) {
      this.particles[i] = Streamlines.getRandomParticle(this.ctx)
    }
  }

  replaceDeadParticles() {
    const nextParticles = []
    this.particles.forEach(particle => {
      if (particle.shouldDie()) {
        nextParticles.push(Streamlines.getRandomParticle(this.ctx))
      } else {
        nextParticles.push(particle)
      }
    })
    this.particles = nextParticles
  }

  update() {
    const { ctx } = this
    ctx.save()
    ctx.globalCompositeOperation = "destination-out"
    ctx.globalAlpha = 0.2
    ctx.fillRect(0, 0, width, height)
    ctx.restore()
    this.replaceDeadParticles()
    this.particles.forEach(particle => {
      const [x, y] = particle.getNextDirection()
      particle.setDirection(x, y)
      particle.move()
      particle.draw()
    })
  }
}

const width = Math.floor(window.innerWidth)
const height = Math.floor(window.innerHeight)
const nbRows = Math.round(height / 1)
const nbColumns = Math.round(width / 1)
const intervalX = width / nbColumns
const intervalY = height / nbRows
const grid = []
const heatRadius = 50 // The higher, the bigger the radius around the mouse will be
const intensity = 8 // The higher this const, the faster the heatmap will get to his highest point
const nbStreamlines = 100 // Number of particles to be displayed simultaniously
let ctx
let streamlines

const initializeGrid = () => {
  for (let i = 0; i < nbColumns; i += 1) {
    grid[i] = []
    for (let j = 0; j < nbRows; j += 1) {
      grid[i][j] = new Cell(i, j)
    }
  }
}

const setBackground = color => {
  ctx.beginPath()
  ctx.rect(0, 0, width, height)
  ctx.fillStyle = color
  ctx.fill()
  ctx.closePath()
}

/**
 * Handle the events
 */

let mouseDown = false
let clientX = 0
let clientY = 0

const onMouseDown = event => {
  clientX = event.clientX
  clientY = event.clientY
  mouseDown = true
}

const onMouseUp = () => {
  mouseDown = false
}

const onMouseMove = event => {
  if (mouseDown) {
    clientX = event.clientX
    clientY = event.clientY
  }
}

const getCellsInRadius = (x, y, radius, interval = 1) => {
  let startX = Math.floor(x - radius)
  let startY = Math.ceil(y - radius)
  startX = startX < 0 ? 0 : startX
  startY = startY < 0 ? 0 : startY

  let endX = x + radius
  let endY = y + radius
  endX = endX > nbColumns - 1 ? nbColumns - 1 : endX
  endY = endY > nbRows - 1 ? nbRows - 1 : endY

  const cellsToUpdate = []
  for (let i = startX; i <= endX; i += interval) {
    for (let j = startY; j <= endY; j += interval) {
      if (insideCircle([i, j], [x, y], radius)) {
        cellsToUpdate.push([i, j])
      }
    }
  }
  return cellsToUpdate
}

const loop = () => {
  if (mouseDown) {
    // Get the cell index and update the color
    const x = Math.floor(clientX / intervalX)
    const y = Math.floor(clientY / intervalY)
    const cellsToUpdate = getCellsInRadius(x, y, heatRadius)
    cellsToUpdate.forEach(([cellX, cellY]) => {
      const distance = getDistanceBetweenPoints([x, y], [cellX, cellY])
      const intensityDiff = mapValue(distance, 0, heatRadius, 0, intensity)

      grid[cellX][cellY].updateColor(intensity - intensityDiff)
      grid[cellX][cellY].update()
    })
  }

  if (streamlines.update) {
    streamlines.update()
  }

  window.requestAnimationFrame(loop)
}

;(function() {
  const canvas = document.getElementById("map")
  ctx = canvas.getContext("2d")
  initializeGrid()

  const streamlinesCanvas = document.getElementById("streamlines")
  streamlinesCanvas.addEventListener("mousedown", onMouseDown)
  streamlinesCanvas.addEventListener("mouseup", onMouseUp)
  streamlinesCanvas.addEventListener("mousemove", onMouseMove)
  const streamlinesCtx = streamlinesCanvas.getContext("2d")
  streamlinesCanvas.width = width
  streamlinesCanvas.height = height

  streamlines = new Streamlines(streamlinesCtx, nbStreamlines)

  // Set the with and height of the canvas and fill with black background
  canvas.width = width
  canvas.height = height
  setBackground("rgba(57, 68, 70, 1)")

  window.requestAnimationFrame(loop)
})()
