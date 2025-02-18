import {ParticleEmitter} from '../emitter.js'
import {Tween} from '../tween.js'
import { Shape } from '../const.js'
import * as THREE from 'three'
class FireflyEmitter extends ParticleEmitter {

  constructor() {

    super({
      positionShape: Shape.CUBE,
      position: new THREE.Vector3(3645, 20, 700),
      positionRange: new THREE.Vector3(4000, 40, 1100),
      velocityShape: Shape.CUBE,
      velocity: new THREE.Vector3(0, 0, 0),
      velocityRange: new THREE.Vector3(60, 20, 60), 
      
      texture: new THREE.TextureLoader().load('./particle/emitters/img/spark.png'),

      size: 100.0,
      sizeRange: 2.0,
      opacityTween: new Tween([0.0, 1.0, 1.1, 2.0, 2.1, 3.0, 3.1, 4.0, 4.1, 5.0, 5.1, 6.0, 6.1],[0.2, 0.2, 1.0, 1.0, 0.2, 0.2, 1.0, 1.0, 0.2, 0.2, 1.0, 1.0, 0.2]),				
      color: new THREE.Vector3(0.30, 1.0, 0.6), 
      colorRange: new THREE.Vector3(0.3, 0.0, 0.0),
      particlesPerSecond: 20,
      particleDeathAge: 6.1,		
      deathAge: 600
    })
  }

}

export  {FireflyEmitter}