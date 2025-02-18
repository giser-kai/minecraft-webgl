import {ParticleEmitter} from '../emitter.js'
import {Tween} from '../tween.js'
import { Shape } from '../const.js'
import * as THREE from 'three'
class FlameEmitter extends ParticleEmitter {

  constructor(position) {

    super({
      positionShape: Shape.SPHERE,
      position: position,
      positionRadius: 1,
      velocityShape: Shape.CUBE,
      velocity: new THREE.Vector3(0, 70, 0),
      velocityRange: new THREE.Vector3(15, 0, 15),
      texture: new THREE.TextureLoader().load('images/particleImg/smoke.png'),
      sizeTween: new Tween( [0, 0.3, 1.2], [30, 50, 1] ),
      opacityTween: new Tween( [0.9, 1.5], [1, 0] ),
      colorTween : new Tween( [0.5, 1.0], [new THREE.Vector3(0.02, 1, 0.5), new THREE.Vector3(0.05, 1, 0)] ),
      blendMode : THREE.AdditiveBlending,
      particlesPerSecond: 80
    })
  }

}

export  {FlameEmitter}