class ParticleSystem {

  constructor(params) {
    Object.assign(this, params)
  }

  get emitter() {
    return this._emitter
  }

  set emitter(val) {
    this._emitter = val
    this.mesh = this._emitter.mesh
  }

  update() {
    const now = +new Date
    const dt = (now - this._startTime) / 1000
    this._emitter.update(dt*0.5)
    this._startTime = now
    this.id = requestAnimationFrame(this.update.bind(this))
  }

  start() {
    this._startTime = +new Date
    this.update()
  }

  stop() {
    cancelAnimationFrame(this.id)
  }

  destroy() {
    this.stop()
	if (this.mesh.geometry) this.mesh.geometry.dispose()
	
	if (this.mesh.material) {
		//in case of map, bumpMap, normalMap, envMap ...
		Object.keys(this.mesh.material).forEach(prop => {
			if (!this.mesh.material[prop])
				return
			if (typeof this.mesh.material[prop].dispose === 'function')
				this.mesh.material[prop].dispose()
		})
		this.mesh.material.dispose()
	}
    this.mesh.parent.remove(this.mesh)
  }

}

export  {ParticleSystem}