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
