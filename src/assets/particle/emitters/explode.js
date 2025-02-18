import {ParticleEmitter} from '../emitter.js'
import {Tween} from '../tween.js'
import { Shape } from '../const.js'
import * as THREE from 'three'
class ExplodeEmitter extends ParticleEmitter {

  constructor() {

    super({
      positionShape: Shape.SPHERE,
      position: new THREE.Vector3(0, 10, 0),
      positionRadius: 10,
      velocityShape: Shape.SPHERE,
      velocity: new THREE.Vector3(30, 200, 30),
      velocityRange: new THREE.Vector3(10, 20, 10),
      texture: new THREE.TextureLoader().load('images/particleImg/explode.png'),
      size: 10,
      sizeRange: 100,
      sizeTween: new Tween( [0, 0.05, 0.3, 0.45], [0, 100, 300, 10] ),
      opacityTween: new Tween( [0, 0.05, 0.3, 0.45], [1, 1, 0.5, 0] ),

      blendMode: THREE.AdditiveBlending,
      particlesPerSecond: 10,
      particleDeathAge: 1,		
    })
  }

}

export  {ExplodeEmitter}