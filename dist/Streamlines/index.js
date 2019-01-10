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
