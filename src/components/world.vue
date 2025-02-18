<template>
	<div class="contentfloor">
		<div class="timeChange">
			<div :class="{'active':time==='正常'}">正常</div>
			<div :class="{'active':time==='下雨'}">下雨</div>
			<div :class="{'active':time==='下雪'}">下雪</div>
		</div>
		<div class="boxContain">
			<div v-for="(item,index) in pictures" :key="index" class="boxSingo"
				:class="{'active':item.name===checkName}">
				<div class="labelname">{{item.name}}</div>
				<img :src="item.url">
			</div>
		</div>
		<div class="date">
			<div>{{date}}</div>
			<el-slider :max="500" v-model="valueTime"  :marks="marks">
			</el-slider>
		</div>
		<div id="threeContainer" element-loading-background="rgba(0, 0, 0, 0.8)" />
	</div>
</template>

<script>
	import * as THREE from 'three'
	import {Octree} from '@/assets/three/Octree.js';
	import {Capsule} from '@/assets/three/Capsule.js';
	import {ImprovedNoise} from '@/assets/three/ImprovedNoise.js';
	import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
	import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
	import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
	import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
	import { Sky } from 'three/examples/jsm/objects/Sky.js';
	import {FlameEmitter} from '@/assets/particle/emitters/flame.js'
	import {ParticleSystem} from '@/assets/particle/system.js'
	let scene
	let camera
	let controls
	let renderer
	// 循环帧
	let animationID
	let raycaster
	let clock = new THREE.Clock();
	let worldOctree
	let playerCollider
	let playerVelocity
	let playerDirection
	let keyStates = {}
	let sceneMesh
	//用于选中高亮物体
	let highlightBox
	//用于判断是否相同位置具有方块
	let commonMatri = []
	let color = new THREE.Color()
	let commonTextureloader = new THREE.TextureLoader()
	//公共平行光,环境光
	let lightS = []
	//火把
	let fires=[]
	let composer
	let iTime = {
		value: 0
	}
	let pass = null
	let sky=null
	export default {
		name: 'Tree',
		props: {

		},
		data() {
			return {
				valueTime: 0,
				date:'Day1',
				nowDay:1,
				planeDatas: null,
				worldWidth: 128,
				worldDepth: 128,
				worldHalfWidth: 64,
				worldHalfDepth: 64,
				GRAVITY: 900,
				STEPS_PER_FRAME: 5,
				playerOnFloor: false,
				checkName: '铁块',
				time: '正常',
				marks: {
					125: {
						style: {
							color: '#1989FA',
							fontSize:'24px'
						},
						label: this.$createElement('strong', '白天')
					},
					250:{
						style: {
							color: '#000000',
							fontSize:'24px'
						},
						label: this.$createElement('strong', '黑夜')
					},
					375:{
						style: {
							color: '#1989FA',
							fontSize:'24px'
						},
						label: this.$createElement('strong', '白天')
					},

				},
				pictures: [{
					index: 1,
					url: './images/材质/tie.png',
					name: '铁块'
				}, {
					index: 2,
					url: './images/材质/tree.png',
					name: '木头'
				}, {
					index: 3,
					url: './images/材质/plane.png',
					name: '泥土'
				}, {
					index: 4,
					url: './images/材质/glass.png',
					name: '玻璃'
				}, {
					index: 5,
					url: './images/材质/stone.png',
					name: '石板'
				}, {
					index: 6,
					url: './images/材质/fire.png',
					name: '火焰'
				},{
					index: 7,
					url: './images/材质/clear.png',
					name: '清除'
				}]
			}
		},
		watch: {
			time(val) {
				if (pass) {
					composer.removePass(pass)
				}
				switch (val) {
					case '正常':

						break;
					case '下雨':
						pass = new ShaderPass(new THREE.ShaderMaterial({
							uniforms: {
								iTime: iTime,
								tDiffuse: {
									value: null,
								},
								iResolution: {
									value: new THREE.Vector2(window.innerWidth, window.innerHeight)
								},
							},
							vertexShader: `
					    varying vec2 vUv;
					    void main(){
					        vUv = uv;
					        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
					    }`,
							fragmentShader: `precision mediump float;
					            varying vec2 vUv;
								uniform float iTime;
								uniform vec2 iResolution;
								uniform sampler2D tDiffuse;		
								float hash(float x){
								 return fract(sin(x*133.3)*13.13);
								}
						        void main(){
						            float time = iTime/2.0;
						            vec2 resolution = iResolution; 
						            vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
						            vec3 c=vec3(0.0,170.0/255.0,1.0); 
						            float a=-.1;
						            float si=sin(a),co=cos(a);
						            uv*=mat2(co,-si,si,co);
						            uv*=length(uv+vec2(0,4.9))*.3+1.;
						            float v=1.-sin(hash(floor(uv.x*90.))*2.);
						            float b=clamp(abs(sin(20.*time*v+uv.y*(8./(2.+v))))-.95,0.,1.)*10.;
						            c*=v*b; 
						            gl_FragColor = mix(texture2D(tDiffuse, vUv), vec4(c,1), 0.2);}`
						}));
						composer.addPass(pass)
						break;
					case '下雪':
						pass = new ShaderPass(new THREE.ShaderMaterial({
							uniforms: {
								iTime: iTime,
								tDiffuse: {
									value: null,
								},
								iResolution: {
									value: new THREE.Vector2(window.innerWidth, window.innerHeight)
								},
							},
							vertexShader: `
				 	        varying vec2 vUv;
				 	        void main(){
				 	            vUv = uv;
				 	            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				 	        }`,
							fragmentShader: `precision mediump float;
				 	                varying vec2 vUv;
				 					uniform float iTime;
				 					uniform vec2 iResolution;
				 					uniform sampler2D tDiffuse;		
				 									float snow(vec2 uv,float scale)
				 									{
				 									    float time = iTime ;
				 									    float w=smoothstep(1.,0.,-uv.y*(scale/10.));
														if(w<.1)return 0.;
				 									    uv+=time/scale;
														uv.y+=time*2./scale;
														uv.x+=sin(uv.y+time*.5)/scale;
				 									    uv*=scale;
														vec2 s=floor(uv),f=fract(uv),p;
														float k=3.,d;
				 									    p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;
														d=length(p);
														k=min(d,k);
				 									    k=smoothstep(0.,k,sin(f.x+f.y)*0.01);
				 									    return k*w;
				 									}
				 			        void main(){
				 			            vec2 uv=(gl_FragCoord.xy*2.-iResolution.xy)/min(iResolution.x,iResolution.y);
				 			            vec3 finalColor=vec3(0);
				 			            float c = 0.5;
				 			            c+=snow(uv,7.)*.0;
				 			            c+=snow(uv,6.)*.0;
				 			            c+=snow(uv,5.)*.0;
				 			            c+=snow(uv,4.);
				 			            c+=snow(uv,3.);
				 			            c+=snow(uv,2.);
				 			            c+=snow(uv,1.);
				 			            finalColor=(vec3(c));
				 			            gl_FragColor = mix(texture2D(tDiffuse, vUv), vec4(finalColor,1), 0.2);}`
						}));
						composer.addPass(pass)
						break;
				}
			}
		},
		beforeDestroy() {
			this.clearScene()
		},

		mounted() {
			this.init3D()
		},
		methods: {
			init3D() {
				this.initScene()
				this.initPlanes()
				this.initCamera()
				this.initRender()
				this.initControls()			
				this.initLight()
				this.initSky()
				this.initPostRender()
				this.render()
				setInterval(()=>{
					this.valueTime+=1
					if(this.valueTime>499){
						this.nowDay+=1
						this.valueTime-=500
						this.date=`day${this.nowDay}`
					}
				},1000)
				// 鼠标事件
				//this.initMouseClick()
			},
			initPlanes() {
				this.planeDatas = this.generateHeight(this.worldWidth, this.worldDepth)
				//sides
				const matrix = new THREE.Matrix4();
                const commonGeometry=new THREE.BoxBufferGeometry(50,50,50)
				commonGeometry.attributes.uv.array[1] = 0.5;
				commonGeometry.attributes.uv.array[3] = 0.5;
				
				commonGeometry.attributes.uv.array[9] = 0.5;
				commonGeometry.attributes.uv.array[11] = 0.5;
				
				commonGeometry.attributes.uv.array[21] = 0.5;
				commonGeometry.attributes.uv.array[23] = 0.5;
				
                commonGeometry.attributes.uv.array[25] = 0.5;
                commonGeometry.attributes.uv.array[27] = 0.5;
				
				commonGeometry.attributes.uv.array[33] = 0.5;
				commonGeometry.attributes.uv.array[35] = 0.5;
				
				commonGeometry.attributes.uv.array[41] = 0.5;
				commonGeometry.attributes.uv.array[43] = 0.5;
				const texture = commonTextureloader.load('images/材质/grass.png');
                const commonMat= new THREE.MeshLambertMaterial({
					map: texture,
					color :"#fff",
					side: 0
				})
				const mesh = new THREE.InstancedMesh(commonGeometry, commonMat , this.worldDepth*this.worldWidth);
				const pxGeometry = new THREE.PlaneBufferGeometry(50, 50);
				pxGeometry.rotateY(Math.PI / 2);
				pxGeometry.translate(25, 0, 0);

				const nxGeometry = new THREE.PlaneBufferGeometry(50, 50);
				nxGeometry.rotateY(-Math.PI / 2);
				nxGeometry.translate(-25, 0, 0);

				const pyGeometry = new THREE.PlaneBufferGeometry(50, 50);
				pyGeometry.rotateX(-Math.PI / 2);
				pyGeometry.translate(0, 25, 0);

				const pzGeometry = new THREE.PlaneBufferGeometry(50, 50);
				pzGeometry.translate(0, 0, 25);

				const nzGeometry = new THREE.PlaneBufferGeometry(50, 50);
				nzGeometry.rotateY(Math.PI);
				nzGeometry.translate(0, 0, -25);
				const geometries = [];
				let idindex = 0
				for (let z = 0; z < this.worldDepth; z++) {

					for (let x = 0; x < this.worldWidth; x++) {

						const h = this.getY(x, z);
						matrix.makeTranslation(
							x * 50 - this.worldHalfWidth * 50,
							h * 50,
							z * 50 - this.worldHalfDepth * 50
						);
						idindex++		
						mesh.setColorAt(idindex, new THREE.Color("#ffffff") );
						mesh.setMatrixAt(idindex, matrix);
						const px = this.getY( x + 1, z );
						const nx = this.getY( x - 1, z );
						const pz = this.getY( x, z + 1 );
						const nz = this.getY( x, z - 1 );
						let geometrys = [];
						geometries.push(pyGeometry.clone().applyMatrix4(matrix));
						if ((px !== h && px !== h + 1) || x === 0) {
							geometries.push(pxGeometry.clone().applyMatrix4(matrix));
							
						}

						if ((nx !== h && nx !== h + 1) || x === this.worldWidth - 1) {

							geometries.push(nxGeometry.clone().applyMatrix4(matrix));
							
						}

						if ((pz !== h && pz !== h + 1) || z === this.worldDepth - 1) {

							geometries.push(pzGeometry.clone().applyMatrix4(matrix));
							
						}

						if ((nz !== h && nz !== h + 1) || z === 0) {

							geometries.push(nzGeometry.clone().applyMatrix4(matrix));
							
						}
					}

				}


				const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
				geometry.computeBoundingSphere();
				sceneMesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
					map: texture,
					side: 0
				}));
				
				scene.add(mesh);
				let material=new THREE.MeshLambertMaterial({
					color:"#ffff00",
					transparent:true,
					opacity:0.5
				})
				highlightBox = new THREE.Mesh(
					commonGeometry,
					material);
				highlightBox.visible = false
				scene.add(highlightBox);
			},
			generateHeight(width, height) {

				const data = [],
					perlin = new ImprovedNoise(),
					size = width * height,
					z = Math.random() * 50;

				let quality = 2;

				for (let j = 0; j < 4; j++) {

					if (j === 0) {
						for (let i = 0; i < size; i++) data[i] = 0;
					}
					for (let i = 0; i < size; i++) {

						const x = i % width,
							y = (i / width) | 0;
						data[i] += perlin.noise(x / quality, y / quality, z) * quality;


					}

					quality *= 4;

				}

				return data

			},
			getY(x, z) {
				return (this.planeDatas[x + z * this.worldWidth] * 0.2) | 0;
			},
			initPostRender() {
				composer = new EffectComposer(renderer);
				let renderScene = new RenderPass(scene, camera);
				composer.addPass(renderScene)
			},
			clearScene() {
				cancelAnimationFrame(animationID) // 去除animationFrame
				// 从scene中删除模型并释放内存
				this.clearThree(scene)
				renderer.dispose()
				renderer.forceContextLoss()
				let gl = renderer.domElement.getContext('webgl')
				gl && gl.getExtension('WEBGL_lose_context').loseContext()
				scene = null
				camera = null
				controls = null
				renderer = null
				animationID = null
			},
			initSky() {
				sky = new Sky();
				sky.scale.setScalar( 450000 );
				scene.add( sky );
				let sun = new THREE.Vector3();			
				const effectController = {
					turbidity: 10,
					rayleigh: 3,
					mieCoefficient: 0.005,
					mieDirectionalG: 0.7,
					elevation: 10,
					azimuth: 180,
				};
				const uniforms = sky.material.uniforms;
				uniforms[ 'turbidity' ].value = effectController.turbidity;
				uniforms[ 'rayleigh' ].value = effectController.rayleigh;
				uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
				uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;		
				const phi = THREE.MathUtils.degToRad( 90 - effectController.elevation );
				const theta = THREE.MathUtils.degToRad( effectController.azimuth );				
				sun.setFromSphericalCoords( 1, phi, theta );
				uniforms[ 'sunPosition' ].value.copy( sun );
				this.addDirectionalLight({
					x: sun.x*450000,
					y: sun.y*450000,
					z: sun.z*450000,
					isShadow: false
				})
			},
			changeTexture(code) {
				switch (code) {
					case 'Digit1':
						this.checkName = '铁块'
						break;
					case 'Digit2':
						this.checkName = '木头'
						break;
					case 'Digit3':
						this.checkName = '泥土'
						break;
					case 'Digit4':
						this.checkName = '玻璃'
						break;
					case 'Digit5':
						this.checkName = '石板'
						break;
					case 'Digit6':
						this.checkName = '火焰'
						break;
					case 'Digit7':
						this.checkName = '清除'
						break;
						//切换天气
					case 'KeyB':
						this.time = '正常'
						break;
					case 'KeyN':
						this.time = '下雨'
						break;
					case 'KeyM':
						this.time = '下雪'
						break;
				}
			},
			initControls() {
				worldOctree = new Octree();
				worldOctree.fromGraphNode(sceneMesh);
				let pointer = new THREE.Vector2();
				let mouse = new THREE.Vector2();
				var raycaster = new THREE.Raycaster();
				let y = this.getY(this.worldHalfWidth, this.worldHalfDepth) * 50 + 300;
				playerCollider = new Capsule(new THREE.Vector3(0, y, 0), new THREE.Vector3(0, y, 0), 5);
				playerVelocity = new THREE.Vector3();
				playerDirection = new THREE.Vector3();
				let pickobj = null
				document.addEventListener('keydown', (event) => {

					keyStates[event.code] = true;
					this.changeTexture(event.code)

				});

				document.addEventListener('keyup', (event) => {

					keyStates[event.code] = false;
					playerCollider.radius = 5

				});
				document.addEventListener('mousedown', (event) => {

					document.body.requestPointerLock();

					if (document.pointerLockElement === document.body) {
						if (this.checkName === '清除') {
							if (pickobj.obj)
								this.clearBox(pickobj.obj)
						} else {
							if(this.checkName==='火焰'){
								this.addFire(pickobj.matrix.clone())
							}
							else{
								this.createBox(pickobj.matrix.clone())
							}						
							
						}

					}

				});

				document.body.addEventListener('mousemove', (event) => {

					if (document.pointerLockElement === document.body) {
						mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
						mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
						camera.rotation.y -= event.movementX / 200;
						camera.rotation.x -= event.movementY / 200;
						pointer.x = event.offsetX;
						pointer.y = event.offsetY;
						camera.updateProjectionMatrix()
						raycaster.setFromCamera(mouse, camera);
						var intersects = raycaster.intersectObjects(scene.children, true);
						var obj = intersects.find(item => {
							return item.object.userData && item.object.userData.matri4
						})
						if(pickobj&&pickobj.oldId&&pickobj.mesh){
							pickobj.mesh.setColorAt(pickobj.oldId, new THREE.Color("#ffffff") );
							pickobj.mesh.instanceColor.needsUpdate = true;
						}
						if (obj) {
							pickobj = {
								matrix: obj.object.userData.matri4.clone(),
								obj: obj.object
							}
							highlightBox.geometry = obj.object.geometry
							highlightBox.visible = true
						} else {
							highlightBox.visible = false
							var mesh = intersects[0].object;//这里就是需要操作的网格模型了
							var instanceId = intersects[0].instanceId;//这里的instanceId就是该实例的索引，对应我们之前初始化时的index
								//判断点击得到的是不是isInstancedMesh
							if (mesh.isInstancedMesh && instanceId>= 0) {							
									//如果要更改颜色
								mesh.setColorAt(instanceId, new THREE.Color("#ffff00") );
								mesh.instanceColor.needsUpdate = true;
								let Matrix=new THREE.Matrix4()
								mesh.getMatrixAt(instanceId,Matrix)
								pickobj = {
									matrix: Matrix.clone(),
									oldId:instanceId,
									mesh:mesh
								}
							}
						}

					}

				});


			},
			clearBox(obj) {
				highlightBox.visible=false
				let fire=fires.find(item=>{
					return item && item.timeId===obj.userData.timeId
				})
				let mat = commonMatri.find(item => {
					return item && item.equals(obj.userData.matri4)
				})
				
				let index=commonMatri.indexOf(mat)
				commonMatri.splice(index,1)
				if(fire){
					fire.fire.destroy()				
					if (fire.cylinder.geometry) fire.cylinder.geometry.dispose()
					
					if (fire.cylinder.material) {
						//in case of map, bumpMap, normalMap, envMap ...
						Object.keys(fire.cylinder.material).forEach(prop => {
							if (!fire.cylinder.material[prop])
								return
							if (typeof fire.cylinder.material[prop].dispose === 'function')
								fire.cylinder.material[prop].dispose()
						})
						fire.cylinder.material.dispose()
					}
					scene.remove(fire.cylinder)
					scene.remove(fire.light)
					let index=fires.indexOf(fire)
					fires.splice(index,1)
				}
				else{
					//重新计算世界
					removeTrigles(worldOctree, obj.userData.timeId)
					
					function removeTrigles(item) {
						item.subTrees.forEach(item => {
							if (item.triangles.length > 0) {
								if (item.triangles[0].timeId && item.triangles[0].timeId === obj.userData.timeId) {
									item.triangles = []
								}
							} else {
								removeTrigles(item)
							}
						})
					}
				    worldOctree.build()
					if (obj.geometry) obj.geometry.dispose()
					
					if (obj.material) {
						//in case of map, bumpMap, normalMap, envMap ...
						Object.keys(obj.material).forEach(prop => {
							if (!obj.material[prop])
								return
							if (typeof obj.material[prop].dispose === 'function')
								obj.material[prop].dispose()
						})
						obj.material.dispose()
					}
					scene.remove(obj)
				}						
			},
			addFire(matrix){
				let mat = commonMatri.find(item => {
					return item && item.equals(matrix)
				})
				if (mat) {
					return
				}
				var array = matrix.elements
				array[13] += 35
				matrix.fromArray(array)
				var timeId = Date.now()
				var geometry = new THREE.CylinderBufferGeometry( 3, 3, 40, 32 ).applyMatrix4(matrix);
				var texture = commonTextureloader.load('images/材质/tree.png');
				var cylinder = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
					map: texture,
					metalness: 0.0
				}))			
				scene.add( cylinder );
				let ps = new ParticleSystem({
				    emitter: new FlameEmitter(new THREE.Vector3(matrix.elements[12],matrix.elements[13]+20,matrix.elements[14]))
				})
				scene.add(ps.mesh)			
				ps.start()			
				ps.mesh.userData.matri4 = matrix.clone()
				ps.mesh.userData.timeId = timeId
				cylinder.userData.matri4 = matrix.clone()
				cylinder.userData.timeId = timeId
				let light=this.addPointLight(matrix.elements[12],matrix.elements[13]+30,matrix.elements[14])
				fires.push({
				    fire:ps,
					cylinder,
					light,
					timeId
				})
			},
			createBox(matrix) {
				let mat = commonMatri.find(item => {
					return item && item.equals(matrix)
				})
				if (mat) {
					return
				}
				commonMatri.push(matrix.clone())
				var geometry = new THREE.BoxBufferGeometry(50, 50, 50);
				var array = matrix.elements
				array[13] += 50
				matrix.fromArray(array)
				var geometryMatri = geometry.applyMatrix4(matrix)
				var texture,mesh
				var timeId = Date.now()
				switch (this.checkName) {
					case '铁块':
						texture = commonTextureloader.load('images/材质/tie.png');
						 mesh = new THREE.Mesh(geometryMatri, new THREE.MeshStandardMaterial({
							map: texture,
							roughness: 0.4,
							metalness: 0.7
						}))
						mesh.userData.matri4 = matrix.clone()
						mesh.userData.timeId = timeId
						scene.add(mesh);
						this.addTriangles(geometryMatri, timeId)
						break;
					case '木头':
						texture = commonTextureloader.load('images/材质/tree.png');
						 mesh = new THREE.Mesh(geometryMatri, new THREE.MeshStandardMaterial({
							map: texture,
							metalness: 0.0
						}))
						mesh.userData.matri4 = matrix.clone()
						scene.add(mesh);
						mesh.userData.timeId = timeId
						this.addTriangles(geometryMatri, timeId)
						break;
					case '泥土':
						texture = commonTextureloader.load('images/材质/plane.png');
						 mesh = new THREE.Mesh(geometryMatri, new THREE.MeshStandardMaterial({
							map: texture,
						}))
						mesh.userData.matri4 = matrix.clone()
						scene.add(mesh);
						mesh.userData.timeId = timeId
						this.addTriangles(geometryMatri, timeId)
						break;
					case '玻璃':
						texture = commonTextureloader.load('images/材质/glass.png');
						 mesh = new THREE.Mesh(geometryMatri, new THREE.MeshStandardMaterial({
							map: texture,
							color: "#00ffff",
							transparent: true,
							opacity: 0.4,
						}))
						mesh.userData.matri4 = matrix.clone()
						scene.add(mesh);
						mesh.userData.timeId = timeId
						this.addTriangles(geometryMatri, timeId)
						break;
					case '石板':
						texture = commonTextureloader.load('images/材质/stone.png');
						 mesh = new THREE.Mesh(geometryMatri, new THREE.MeshStandardMaterial({
							map: texture,
							color: "#707070",
							metalness: 0.0
						}))
						mesh.userData.matri4 = matrix.clone()
						scene.add(mesh);
						mesh.userData.timeId = timeId
						this.addTriangles(geometryMatri, timeId)
						break;
				}
			},
			addTriangles(geometry, timeId) {
				let geoClone = geometry.clone()
				const geometryTriangle = geoClone.clone().toNonIndexed();
				const positionAttribute = geometryTriangle.getAttribute('position');
				for (let i = 0; i < positionAttribute.count; i += 3) {

					const v1 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i);
					const v2 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 1);
					const v3 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 2);
					worldOctree.addTriangle(new THREE.Triangle(v1, v2, v3), timeId);
				}
				worldOctree.build()
			},
			getForwardVector() {

				camera.getWorldDirection(playerDirection);
				playerDirection.y = 0;
				playerDirection.normalize();

				return playerDirection;

			},
			getSideVector() {
				camera.getWorldDirection(playerDirection);
				playerDirection.y = 0;
				playerDirection.normalize();
				playerDirection.cross(camera.up);

				return playerDirection;
			},
			controls(deltaTime) {
				const speed = 500;
				if (this.playerOnFloor) {
					if (keyStates['Space']) {

						playerVelocity.y = 400;
						playerCollider.radius = 0

					}
					if (keyStates['KeyW']) {

						playerVelocity.add(this.getForwardVector().multiplyScalar(speed * deltaTime));

					}

					if (keyStates['KeyS']) {

						playerVelocity.add(this.getForwardVector().multiplyScalar(-speed * deltaTime));

					}

					if (keyStates['KeyA']) {

						playerVelocity.add(this.getSideVector().multiplyScalar(-speed * deltaTime));

					}

					if (keyStates['KeyD']) {

						playerVelocity.add(this.getSideVector().multiplyScalar(speed * deltaTime));

					}



				}

			},
			updatePlayer(deltaTime) {
				if (this.playerOnFloor) {

					const damping = Math.exp(-3 * deltaTime) - 1;
					playerVelocity.addScaledVector(playerVelocity, damping);

				} else {

					playerVelocity.y -= this.GRAVITY * deltaTime;

				}

				const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
				playerCollider.translate(deltaPosition);

				this.playerCollitions();
				camera.position.set(playerCollider.end.x, playerCollider.end.y + 40, playerCollider.end.z);
				camera.updateProjectionMatrix()
			},
			playerCollitions() {

				const result = worldOctree.capsuleIntersect(playerCollider);
				this.playerOnFloor = false;

				if (result) {

					this.playerOnFloor = result.normal.y > 0;

					if (!this.playerOnFloor) {

						playerVelocity.addScaledVector(result.normal, -result.normal.dot(playerVelocity));
					}
					playerCollider.translate(result.normal.multiplyScalar(result.depth));
				}
			},
			render() {
				let that = this
				let rad=10
				let lightinterval=0.00005
				let suninterval=0.0006
				let sun=new THREE.Vector3()
				animate()

				function animate() {
					// 循环帧
					
					const deltaTime = Math.min(0.05, clock.getDelta()) / that.STEPS_PER_FRAME;
					const uniforms = sky.material.uniforms;	
					// we look for collisions in substeps to mitigate the risk of
					// an object traversing another too quickly for detection.
					for (let i = 0; i < that.STEPS_PER_FRAME; i++) {
						that.controls(deltaTime);
						that.updatePlayer(deltaTime);
					}
					renderer.setRenderTarget(null)
					renderer.render(scene, camera)
					iTime.value += 0.01
					composer.render();
					if(that.valueTime===1){
						rad=10
					}
					if(that.valueTime>=125 && that.valueTime<=250){
						rad-=suninterval
						const phi = THREE.MathUtils.degToRad( 90 - rad );
						const theta = THREE.MathUtils.degToRad( 180 );				
						sun.setFromSphericalCoords( 1, phi, theta );
						uniforms[ 'sunPosition' ].value.copy( sun );
						lightS.forEach(item=>{
							item.position.set(sun.x*450000,sun.y*450000,sun.z*450000)
							if(item.type==="AmbientLight"){
								if(item.intensity<=0){
									return
								}else{
									item.intensity-=lightinterval
								}
							}else{
								item.intensity-=lightinterval
							}
							
						})
					}
					else if(that.valueTime>=370){
						rad+=suninterval
						const phi = THREE.MathUtils.degToRad( 90 - rad );
						const theta = THREE.MathUtils.degToRad( 180 );				
						sun.setFromSphericalCoords( 1, phi, theta );
						uniforms[ 'sunPosition' ].value.copy( sun );
						lightS.forEach(item=>{
							item.position.set(sun.x*450000,sun.y*450000,sun.z*450000)
							if(item.type==="AmbientLight"){
								if(item.intensity>=0.6){
									return
								}else{
									item.intensity+=lightinterval
								}
							}else{
								item.intensity+=lightinterval
							}						
						})
					}
					animationID = requestAnimationFrame(animate)
				}
				// 自适应窗口大小
				window.addEventListener('resize', () => {
					camera.aspect = window.innerWidth / window.innerHeight
					camera.updateProjectionMatrix()
					renderer.setSize(window.innerWidth, window.innerHeight)
				}, false)
			},
			initRender() {
				renderer = new THREE.WebGLRenderer({
					antialias: true, // 抗锯齿,
					alpha: true
				})
				renderer.setSize(window.innerWidth, window.innerHeight) // 设置渲染区域尺寸
				renderer.setClearColor('rgb(255, 255, 255)', 0) // 设置背景颜色
				renderer.shadowMap.enabled = true
				renderer.shadowMap.type = THREE.PCFSoftShadowMap
				renderer.setPixelRatio(window.devicePixelRatio)
				// three.js 的色彩空间渲染方式
				renderer.outputEncoding = THREE.sRGBEncoding
				let dom = document.getElementById('threeContainer')
				dom.appendChild(renderer.domElement) // body元素中插入canvas对象
			},
			initCamera() {
				camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
				camera.rotation.order = 'YXZ';
				scene.add(camera)
			},
			initLight() {
				var ambient = new THREE.AmbientLight('rgb(255, 255, 255)', 0.60)
				scene.add(ambient)
				lightS.push(ambient)
			},
			addPointLight(x, y, z) {
				var PointLight = new THREE.PointLight('#ffffff', 0.6, 500)
				scene.add(PointLight)
				PointLight.position.set(x, y, z)
				PointLight.castShadow=true
				PointLight.shadow.bias = -0.0001
				PointLight.shadow.camera.near=0.001
				PointLight.shadow.camera.far=500
				return PointLight
			},
			addDirectionalLight(object) {
				var directionalLight = new THREE.DirectionalLight(
					0xffffff,
					object.Alpha || 1.0
				) // 平行光
				directionalLight.position.set(object.x, object.y, object.z)
				directionalLight.castShadow = object.isShadow
				var target = new THREE.Object3D()
				let y = this.getY(this.worldHalfWidth, this.worldHalfDepth) * 50;
				target.position.set(0, y, 0)

				directionalLight.target = target
				scene.add(directionalLight)
				lightS.push(directionalLight)
			},
			initScene() {
				scene = new THREE.Scene()
				scene.fog = new THREE.Fog('#e1eeff', 1000, 10000);
			},
			clearThree(obj) {
				while (obj.children.length > 0) {
					this.clearThree(obj.children[0])
					obj.remove(obj.children[0]);
				}
				if (obj.geometry) obj.geometry.dispose()

				if (obj.material) {
					//in case of map, bumpMap, normalMap, envMap ...
					Object.keys(obj.material).forEach(prop => {
						if (!obj.material[prop])
							return
						if (typeof obj.material[prop].dispose === 'function')
							obj.material[prop].dispose()
					})
					obj.material.dispose()
				}
			},
			registerKeyEvents() {
				document.onkeydown = (e) => {
					let keyCode = window.event ? e.keyCode : e.which
					switch (keyCode) {
						// "A"
						case 65:
							console.log(camera, controls)
							break
					}
				}
			}
		}
	}
</script>

<style lang="less">
	.contentfloor {
		width: 100%;
		height: 100%;
		padding: 0px;
		margin: 0px;

		#threeContainer {
			width: 100%;
			height: 100%;
			padding: 0px;
			margin: 0px;
			background: black;
		}

		.timeChange {
			position: absolute;
			z-index: 999;
			left: 10px;
			top: 10px;
			text-align: left;
			font-size: 20px;

			>div {
				display: inline-block;
				padding: 10px;
				box-shadow: 0 0 5px rgb(0, 85, 255) inset, 0 0 10px rgb(0, 85, 255);

			}

			.active {
				background-color: aqua;
			}
		}

		.date {
			position: absolute;
			right: 100px;
			top: 10px;
			width: 500px;
			z-index: 999;
            >div{
			display: inline-block;
			font-size: 30px;
			font-weight: bolder;
			font-style:  italic;
			margin-right: 40px;
			width: 50px;
			
			}
			.el-slider {
				width: 350px;
			}
		}

		.boxContain {
			width: 1200px;
			height: 150px;
			position: absolute;
			z-index: 999;
			left: 400px;
			bottom: 10px;
			color: black;
			border-radius: 15px;
			box-shadow: 0 0 10px rgb(0, 0, 0) inset, 0 0 20px rgb(0, 0, 0);

			.boxSingo {
				float: left;
				width: 10%;
				height: 90%;
				margin-left: 40px;
				margin-top: 10px;

				.labelname {
					color: black;
					font-size: 27px;
					margin-top: 10%;
					font-weight: bold;
				}

				img {
					width: 60%;
					margin-top: 10%;
					height: 50%;
				}
			}

			.active {
				border-radius: 15px;
				box-shadow: 0 0 10px rgb(0, 85, 255) inset, 0 0 20px rgb(0, 85, 255);
			}
		}
	}
</style>
