import {ParticleEmitter} from '../emitter.js'
import {Tween} from '../tween.js'
import { Shape } from '../const.js'
import * as THREE from 'three'
class TunnelEmitter extends ParticleEmitter {

  constructor() {
    super({
      positionShape: Shape.CUBE,
      position: new THREE.Vector3(0, -20, 0),
      positionRange: new THREE.Vector3(10, 10, 10),

      velocityShape: Shape.CUBE,
      velocity: new THREE.Vector3(0, 100, 0),
      velocityRange: new THREE.Vector3(20, 40, 20), 
      
      angle: 0,
      angleRange: 720,
      angleVelocity: 10,
      angleVelocityRange: 0,
      
      texture: new THREE.TextureLoader().load('img/spikey.png'),

      size: 8.0,
      sizeRange: 20.0,				
      color: new THREE.Vector3(0.15, 1.0, 0.8),
      colorRange: new THREE.Vector3(1, 1, 1),
      opacity: 1,
      blendMode: THREE.AdditiveBlending,

      particlesPerSecond: 500,
      particleDeathAge: 1,		
      deathAge: 60
    })
  }

}

export  {TunnelEmitter}