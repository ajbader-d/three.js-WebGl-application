var sceneWidth;
var sceneHeight;
var camera;
var scene;
var renderer;
var world;
var sun;
var ground;
var cameraPosGame = 160;
var flag = false;
var flagTexture = true;

// the world
var worldRadius = 200;
var gravity = 0.005;
var treeReleaseInterval = 0.5;
var clock;

// the tree
var treesArray = [];
var treesInPath = [];
var particles;
var particleCount = 20;
var explosionPower = 1.06;
var pathAngleValues = [1.52, 1.57, 1.62];

// the carrot
// var carrotPool = [];
// var carrotInPath = [];

var hero;
var speed = 6;
var maxSpeed = 48;
var delta = 0;
var statusOfTheGame = "play";
var currentLane;
var leftLane = -3;
var rightLane = 3;
var middleLane = 0;
var cameraTarget = new THREE.Vector3(0, 0, -100);

var scoreText;
var score = 0;
var collided = false;

// Get the pop up modal 
var modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// Materials for the hero
var blackMat = new THREE.MeshPhongMaterial({
	color: 0x100707,
	flatShading: true,
});

var brownMat = new THREE.MeshPhongMaterial({
	color: 0xb44b39,
	shininess: 0,
	flatShading: true
});

var greenMat = new THREE.MeshPhongMaterial({
	color: 0x7abf8e,
	shininess: 0,
	flatShading: true
});

var pinkMat = new THREE.MeshPhongMaterial({
	color: 0xdc5f45,//0xb43b29,//0xff5b49,
	shininess: 0,
	flatShading: true
});

var lightBrownMat = new THREE.MeshPhongMaterial({
	color: 0xe07a57,
	flatShading: true
});

var whiteMat = new THREE.MeshPhongMaterial({
	color: 0xa49789,
	flatShading: true
});

var skinMat = new THREE.MeshPhongMaterial({
	color: 0xff9ea5,
	flatShading: true
});


function init() {

	world = document.getElementById('world');
	sceneWidth = window.innerWidth;
	sceneHeight = window.innerHeight;

	/* create a scene */
	scene = new THREE.Scene();//the 3d scene
	// scene.fog = new THREE.FogExp2(0xf0fff0, 0.14);
	scene.fog = new THREE.Fog(0xd6eae6, 160, 350);

	/* create the camera */
	camera = new THREE.PerspectiveCamera(
		50, // Angle fieldOfView
		sceneWidth / sceneHeight, // Aspect Ratio.
		1, // Near view.
		2000); // Far view.

	/* position the camera */


	// camera.position.z = 30;
	// camera.position.z = 6.5;
	camera.position.z = 9;
	camera.position.y = 2.5;

	// camera.position.z = cameraPosGame;
	// camera.position.y = 30;
	// camera.lookAt(new THREE.Vector3(0, 30, 0));

	/* create the renderer */
	renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true
	});
	renderer.setClearColor(0xfffafa, 1);
	renderer.shadowMap.enabled = true;//enable shadow
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setSize(sceneWidth, sceneHeight);
	world.appendChild(renderer.domElement);
	sphericalHelper = new THREE.Spherical();


	createWorld();
	createHero();
	createLight();
	createTreesArray();
	createPineTree();
	// createCarrot();
	createExplosion();

	clock = new THREE.Clock();
	clock.start();

	// controls = new THREE.OrbitControls(camera, renderer.domElement);
	// controls.enablePan = true;
	// controls.enableZoom = true;
	// controls.maxDistance = 1000; // Set our max zoom out distance (mouse scroll)
	// controls.minDistance = 60; // Set our min zoom in distance (mouse scroll)
	// controls.target.copy(new THREE.Vector3(0, 0, 0));

	scoreText = document.createElement('div');
	scoreText.style.position = 'absolute';
	scoreText.style.width = 100;
	scoreText.style.height = 100;
	scoreText.innerHTML = "0";
	scoreText.style.top = 50 + 'px';
	scoreText.style.left = 60 + 'px';
	scoreText.style.backgroundColor = "#7abf8e";
	scoreText.style.padding = "6px 13px";

	scoreLabel = document.createElement('div');
	scoreLabel.style.position = 'absolute';
	scoreLabel.style.width = 100;
	scoreLabel.style.height = 100;
	scoreLabel.innerHTML = "Score: ";
	scoreLabel.style.top = 50 + 'px';
	scoreLabel.style.left = 10 + 'px';
	scoreLabel.style.backgroundColor = "#7abf8e";
	scoreLabel.style.padding = "6px 13px";

	document.body.appendChild(scoreLabel);
	document.body.appendChild(scoreText);


	// document.addEventListener('mousedown', handleMouseDown, false);
	document.onkeydown = keyPressed;


}

window.onresize = function () {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
};

//_____________________ Arrows Control Logic
function keyPressed(keyEvent) {
	var validMove = true;
	if (keyEvent.keyCode === 37) {//left
		if (currentLane == middleLane) {
			currentLane = leftLane;
			hero.mesh.position.x = currentLane;
		} else if (currentLane == rightLane) {
			currentLane = middleLane;
			hero.mesh.position.x = currentLane;
		} else {
			validMove = false;
		}
	} else if (keyEvent.keyCode === 39) {//right
		if (currentLane == middleLane) {
			currentLane = rightLane;
			hero.mesh.position.x = currentLane;
		} else if (currentLane == leftLane) {
			currentLane = middleLane;
			hero.mesh.position.x = currentLane;
		} else {
			validMove = false;
		}
	} else {
		if (keyEvent.keyCode === 38) {//up, jump
			if (statusOfTheGame == "play") hero.jump();
			else if (statusOfTheGame == "readyToReplay") {
				replay();
			} if (statusOfTheGame == "play") hero.jump();
			else if (statusOfTheGame == "readyToReplay") {
				replay();
			}
		}
		validMove = false;
	}
	//heroSphere.position.x=currentLane;
}

//___________________ a big SphereGeometry primitive, rotate it on the x axis to create the moving ground illusion
function createWorld() {
	var sides = 50;
	var rows = 50;

	// // create a texture loader.
	// const textureLoader = new THREE.TextureLoader();
	// const texture = textureLoader.load('assets/textures/GroundForest003_COL_VAR1_3K.jpg');
	// // set the "color space" of the texture
	// texture.encoding = THREE.sRGBEncoding;
	// // reduce blurring at glancing angles
	// texture.anisotropy = 16;

	// create a Standard material using the texture we just loaded as a color map
	// var sphereMaterial = new THREE.MeshStandardMaterial({
	// 	map: texture,
	// });

	var sphereGeometry = new THREE.SphereGeometry(
		worldRadius,
		sides,
		rows);

	var sphereMaterial = new THREE.MeshPhongMaterial({
		color: 0x7abf8e,
		specular: 0x000000,
		shininess: 1,
		transparent: true,
		opacity: .5,
		// flatShading: true
	});

	var vIndex;
	var vertVector = new THREE.Vector3();
	var nextvertVector = new THREE.Vector3();
	var firstvertVector = new THREE.Vector3();
	var offset = new THREE.Vector3();
	var currentTier = 1;
	var lerpValue = 0.5;
	var heightValue;
	var maxHeight = 0.07;
	for (var j = 1; j < rows - 2; j++) {
		currentTier = j;
		for (var i = 0; i < sides; i++) {
			vIndex = (currentTier * sides) + 1;
			vertVector = sphereGeometry.vertices[i + vIndex].clone();
			if (j % 2 !== 0) {
				if (i == 0) {
					firstvertVector = vertVector.clone();
				}
				nextvertVector = sphereGeometry.vertices[i + vIndex + 1].clone();
				if (i == sides - 1) {
					nextvertVector = firstvertVector;
				}
				lerpValue = (Math.random() * (0.75 - 0.25)) + 0.25;
				vertVector.lerp(nextvertVector, lerpValue);
			}
			heightValue = (Math.random() * maxHeight) - (maxHeight / 2);
			offset = vertVector.clone().normalize().multiplyScalar(heightValue);
			sphereGeometry.vertices[i + vIndex] = (vertVector.add(offset));
		}
	}

	floorShadow = new THREE.Mesh(sphereGeometry, sphereMaterial);
	//floorShadow.rotation.x = -Math.PI / 2;
	floorShadow.receiveShadow = true;

	floorGrass = new THREE.Mesh(
		new THREE.SphereGeometry(
			worldRadius - .5,
			50,
			50),
		new THREE.MeshBasicMaterial({
			color: 0x7abf8e
		})
	);

	floorGrass.receiveShadow = false;

	floor = new THREE.Group();
	floor.rotation.z = -Math.PI / 2;
	floor.position.y = -worldRadius;
	floor.position.z = 0;
	// floor.position.z = 2;

	floor.add(floorGrass);
	// floor.add(floorShadow);
	scene.add(floor);
	// addWorldCarrot();
	placeTreesInWorld();
};

//___________________ Lighting
function createLight() {
	// var hemisphereLight = new THREE.HemisphereLight(
	// 	0xfffafa,
	// 	0x000000,
	// 	0.9)
	// scene.add(hemisphereLight);

	sun = new THREE.DirectionalLight(0xcdc1c5, 0.9);
	sun.position.set(12, 6, -7);
	sun.castShadow = true;
	scene.add(sun);
	//Set up shadow properties for the sun light
	sun.shadow.mapSize.width = 256;
	sun.shadow.mapSize.height = 256;
	sun.shadow.camera.near = 0.5;
	sun.shadow.camera.far = 50;

	globalLight = new THREE.AmbientLight(0xffffff, .9);

	shadowLight = new THREE.DirectionalLight(0xffffff, 1);
	shadowLight.position.set(-30, 40, 20);
	shadowLight.castShadow = true;
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 2000;
	shadowLight.shadow.mapSize.width = shadowLight.shadow.mapSize.height = 2048;
	scene.add(globalLight);
	scene.add(shadowLight);
}


//___________________ The Hero Class
Hero = function () {
	this.status = "running";
	this.runningCycle = 0;
	this.mesh = new THREE.Group();
	this.body = new THREE.Group();
	this.mesh.scale.x = 0.06;
	this.mesh.scale.y = 0.06;
	this.mesh.scale.z = 0.06;

	// this.body.rotation.y = 1.5;


	this.mesh.add(this.body);

	// console.log(this.mesh)
	var torsoGeom = new THREE.CubeGeometry(7, 7, 10, 1);

	this.torso = new THREE.Mesh(torsoGeom, brownMat);
	this.torso.position.z = 0;
	this.torso.position.y = 7;
	this.torso.castShadow = true;
	this.body.add(this.torso);

	var pantsGeom = new THREE.CubeGeometry(9, 9, 5, 1);
	this.pants = new THREE.Mesh(pantsGeom, whiteMat);
	this.pants.position.z = -3;
	this.pants.position.y = 0;
	this.pants.castShadow = true;
	this.torso.add(this.pants);

	var tailGeom = new THREE.CubeGeometry(3, 3, 3, 1);
	tailGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -2));
	this.tail = new THREE.Mesh(tailGeom, lightBrownMat);
	this.tail.position.z = -4;
	this.tail.position.y = 5;
	this.tail.castShadow = true;
	this.torso.add(this.tail);

	this.torso.rotation.x = -Math.PI / 8;

	var headGeom = new THREE.CubeGeometry(10, 10, 13, 1);

	headGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 7.5));
	this.head = new THREE.Mesh(headGeom, brownMat);
	this.head.position.z = 2;
	this.head.position.y = 11;
	this.head.castShadow = true;
	this.body.add(this.head);

	var cheekGeom = new THREE.CubeGeometry(1, 4, 4, 1);
	this.cheekR = new THREE.Mesh(cheekGeom, pinkMat);
	this.cheekR.position.x = -5;
	this.cheekR.position.z = 7;
	this.cheekR.position.y = -2.5;
	this.cheekR.castShadow = true;
	this.head.add(this.cheekR);

	this.cheekL = this.cheekR.clone();
	this.cheekL.position.x = - this.cheekR.position.x;
	this.head.add(this.cheekL);


	var noseGeom = new THREE.CubeGeometry(6, 6, 3, 1);
	this.nose = new THREE.Mesh(noseGeom, lightBrownMat);
	this.nose.position.z = 13.5;
	this.nose.position.y = 2.6;
	this.nose.castShadow = true;
	this.head.add(this.nose);

	var mouthGeom = new THREE.CubeGeometry(4, 2, 4, 1);
	mouthGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 3));
	mouthGeom.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 12));
	this.mouth = new THREE.Mesh(mouthGeom, brownMat);
	this.mouth.position.z = 8;
	this.mouth.position.y = -4;
	this.mouth.castShadow = true;
	this.head.add(this.mouth);


	var pawFGeom = new THREE.CubeGeometry(3, 3, 3, 1);
	this.pawFR = new THREE.Mesh(pawFGeom, lightBrownMat);
	this.pawFR.position.x = -2;
	this.pawFR.position.z = 6;
	this.pawFR.position.y = 1.5;
	this.pawFR.castShadow = true;
	this.body.add(this.pawFR);

	this.pawFL = this.pawFR.clone();
	this.pawFL.position.x = - this.pawFR.position.x;
	this.pawFL.castShadow = true;
	this.body.add(this.pawFL);

	var pawBGeom = new THREE.CubeGeometry(3, 3, 6, 1);
	this.pawBL = new THREE.Mesh(pawBGeom, lightBrownMat);
	this.pawBL.position.y = 1.5;
	this.pawBL.position.z = 0;
	this.pawBL.position.x = 5;
	this.pawBL.castShadow = true;
	this.body.add(this.pawBL);

	this.pawBR = this.pawBL.clone();
	this.pawBR.position.x = - this.pawBL.position.x;
	this.pawBR.castShadow = true;
	this.body.add(this.pawBR);

	var earGeom = new THREE.CubeGeometry(7, 18, 2, 1);
	earGeom.vertices[6].x += 2;
	earGeom.vertices[6].z += .5;

	earGeom.vertices[7].x += 2;
	earGeom.vertices[7].z -= .5;

	earGeom.vertices[2].x -= 2;
	earGeom.vertices[2].z -= .5;

	earGeom.vertices[3].x -= 2;
	earGeom.vertices[3].z += .5;
	earGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 9, 0));

	this.earL = new THREE.Mesh(earGeom, brownMat);
	this.earL.position.x = 2;
	this.earL.position.z = 2.5;
	this.earL.position.y = 5;
	this.earL.rotation.z = -Math.PI / 12;
	this.earL.castShadow = true;
	this.head.add(this.earL);

	this.earR = this.earL.clone();
	this.earR.position.x = -this.earL.position.x;
	this.earR.rotation.z = -this.earL.rotation.z;
	this.earR.castShadow = true;
	this.head.add(this.earR);

	var eyeGeom = new THREE.CubeGeometry(2, 4, 4);

	this.eyeL = new THREE.Mesh(eyeGeom, whiteMat);
	this.eyeL.position.x = 5;
	this.eyeL.position.z = 5.5;
	this.eyeL.position.y = 2.9;
	this.eyeL.castShadow = true;
	this.head.add(this.eyeL);

	var irisGeom = new THREE.CubeGeometry(.6, 2, 2);

	this.iris = new THREE.Mesh(irisGeom, blackMat);
	this.iris.position.x = 1.2;
	this.iris.position.y = 1;
	this.iris.position.z = 1;
	this.eyeL.add(this.iris);

	this.eyeR = this.eyeL.clone();
	this.eyeR.children[0].position.x = -this.iris.position.x;


	this.eyeR.position.x = -this.eyeL.position.x;
	this.head.add(this.eyeR);

	this.body.traverse(function (object) {
		if (object instanceof THREE.Mesh) {
			object.castShadow = true;
			object.receiveShadow = true;
		}
	});
}

Hero.prototype.run = function () {
	this.status = "running";

	var s = Math.min(speed, maxSpeed);

	this.runningCycle += delta * s * .7;
	this.runningCycle = this.runningCycle % (Math.PI * 2);
	var t = this.runningCycle;

	var amp = 4;
	var disp = .2;

	// BODY

	this.body.position.y = 6 + Math.sin(t - Math.PI / 2) * amp;
	this.body.rotation.x = .2 + Math.sin(t - Math.PI / 2) * amp * .1;

	this.torso.rotation.x = Math.sin(t - Math.PI / 2) * amp * .1;
	this.torso.position.y = 7 + Math.sin(t - Math.PI / 2) * amp * .5;

	// MOUTH
	this.mouth.rotation.x = Math.PI / 16 + Math.cos(t) * amp * .05;

	// HEAD
	this.head.position.z = 2 + Math.sin(t - Math.PI / 2) * amp * .5;
	this.head.position.y = 8 + Math.cos(t - Math.PI / 2) * amp * .7;
	this.head.rotation.x = -.2 + Math.sin(t + Math.PI) * amp * .1;

	// EARS
	this.earL.rotation.x = Math.cos(-Math.PI / 2 + t) * (amp * .2);
	this.earR.rotation.x = Math.cos(-Math.PI / 2 + .2 + t) * (amp * .3);

	// EYES
	this.eyeR.scale.y = this.eyeL.scale.y = .7 + Math.abs(Math.cos(-Math.PI / 4 + t * .5)) * .6;

	// TAIL
	this.tail.rotation.x = Math.cos(Math.PI / 2 + t) * amp * .3;

	// FRONT RIGHT PAW
	this.pawFR.position.y = 1.5 + Math.sin(t) * amp;
	this.pawFR.rotation.x = Math.cos(t) * Math.PI / 4;


	this.pawFR.position.z = 6 - Math.cos(t) * amp * 2;

	// FRONT LEFT PAW

	this.pawFL.position.y = 1.5 + Math.sin(disp + t) * amp;
	this.pawFL.rotation.x = Math.cos(t) * Math.PI / 4;


	this.pawFL.position.z = 6 - Math.cos(disp + t) * amp * 2;

	// BACK RIGHT PAW
	this.pawBR.position.y = 1.5 + Math.sin(Math.PI + t) * amp;
	this.pawBR.rotation.x = Math.cos(t + Math.PI * 1.5) * Math.PI / 3;


	this.pawBR.position.z = - Math.cos(Math.PI + t) * amp;

	// BACK LEFT PAW
	this.pawBL.position.y = 1.5 + Math.sin(Math.PI + t) * amp;
	this.pawBL.rotation.x = Math.cos(t + Math.PI * 1.5) * Math.PI / 3;


	this.pawBL.position.z = - Math.cos(Math.PI + t) * amp;


}

Hero.prototype.jump = function () {
	if (this.status == "jumping") return;
	this.status = "jumping";
	var _this = this;
	var totalSpeed = 10 / speed;
	var jumpHeight = 2;

	TweenMax.to(this.earL.rotation, totalSpeed, { x: "+=.3", ease: Back.easeOut });
	TweenMax.to(this.earR.rotation, totalSpeed, { x: "-=.3", ease: Back.easeOut });

	TweenMax.to(this.pawFL.rotation, totalSpeed, { x: "+=.7", ease: Back.easeOut });
	TweenMax.to(this.pawFR.rotation, totalSpeed, { x: "-=.7", ease: Back.easeOut });
	TweenMax.to(this.pawBL.rotation, totalSpeed, { x: "+=.7", ease: Back.easeOut });
	TweenMax.to(this.pawBR.rotation, totalSpeed, { x: "-=.7", ease: Back.easeOut });

	TweenMax.to(this.tail.rotation, totalSpeed, { x: "+=1", ease: Back.easeOut });

	TweenMax.to(this.mouth.rotation, totalSpeed, { x: .5, ease: Back.easeOut });

	TweenMax.to(this.mesh.position, totalSpeed / 2, { y: jumpHeight, ease: Power2.easeOut });
	TweenMax.to(this.mesh.position, totalSpeed / 2, {
		y: 0, ease: Power4.easeIn, delay: totalSpeed / 2, onComplete: function () {
			//t = 0;
			_this.status = "running";
		}
	});

}

Hero.prototype.sit = function () {
	var sp = 1.2;
	var ease = Power4.easeOut;
	var _this = this;
	TweenMax.to(this.torso.rotation, sp, { x: -1.3, ease: ease });
	TweenMax.to(this.torso.position, sp, {
		y: -5, ease: ease, onComplete: function () {
			//   _this.nod();
			statusOfTheGame = "readyToReplay";
		}
	});

	TweenMax.to(this.head.rotation, sp, { x: Math.PI / 3, y: -Math.PI / 3, ease: ease });
	TweenMax.to(this.tail.rotation, sp, { x: 2, y: Math.PI / 4, ease: ease });
	TweenMax.to(this.pawBL.rotation, sp, { x: -.1, ease: ease });
	TweenMax.to(this.pawBR.rotation, sp, { x: -.1, ease: ease });
	TweenMax.to(this.pawFL.rotation, sp, { x: 1, ease: ease });
	TweenMax.to(this.pawFR.rotation, sp, { x: 1, ease: ease });
	TweenMax.to(this.mouth.rotation, sp, { x: .3, ease: ease });
	TweenMax.to(this.eyeL.scale, sp, { y: 1, ease: ease });
	TweenMax.to(this.eyeR.scale, sp, { y: 1, ease: ease });

	//TweenMax.to(this.body.rotation, sp, {y:Math.PI/4});

}

//___________________ Creating the hero
function createHero() {
	hero = new Hero();
	hero.mesh.position.z = 2;
	hero.mesh.rotation.y = Math.PI / 1;
	scene.add(hero.mesh);
	currentLane = middleLane;
	hero.mesh.position.x = currentLane;
}

//______________________ creating create Explosion when the hero hits a tree

function createExplosion() {
	particleGeometry = new THREE.Geometry();
	for (var i = 0; i < particleCount; i++) {
		var vertex = new THREE.Vector3();
		particleGeometry.vertices.push(vertex);
	}
	var pMaterial = new THREE.PointsMaterial({
		color: 0xfffafa,
		size: 0.2
	});
	particles = new THREE.Points(particleGeometry, pMaterial);
	scene.add(particles);
	particles.visible = false;
}

//_______________________ array to hold the trees
function createTreesArray() {
	var maxTreesInPool = 10;
	var tree;
	for (var i = 0; i < maxTreesInPool; i++) {
		tree = createTree();
		treesArray.push(tree);
	}
}

//_______________________ the logic of where to put the tree, which lane/path
function putTreeInPath() {
	var options = [0, 1, 2]; // options to the three lanes 
	var lane = Math.floor(Math.random() * 3);
	addTree(true, lane);
	options.splice(lane, 1);
	if (Math.random() > 0.5) {
		lane = Math.floor(Math.random() * 2);
		addTree(true, options[lane]);
	}
}

//_______________________ the logic of placing the tree on the path
function placeTreesInWorld() {
	var numTrees = 36;
	var gap = 6.28 / 36;
	for (var i = 0; i < numTrees; i++) {
		addTree(false, i * gap, true);
		addTree(false, i * gap, false);
	}
}


function addTree(inPath, row, isLeft) {
	var tree;
	if (inPath) {
		if (treesArray.length == 0) return;
		tree = treesArray.pop();
		tree.visible = true;
		// console.log("add tree");
		treesInPath.push(tree);
		sphericalHelper.set(worldRadius - 0.3, pathAngleValues[row], -floor.rotation.x + 4);
	} else {
		tree = createTree();
		var forestAreaAngle = 0;//[1.52,1.57,1.62];
		if (isLeft) {
			forestAreaAngle = 1.68 + Math.random() * 0.1;
		} else {
			forestAreaAngle = 1.46 - Math.random() * 0.1;
		}
		sphericalHelper.set(worldRadius - 0.3, forestAreaAngle, row);
	}
	tree.position.setFromSpherical(sphericalHelper);
	var rollingGroundVector = floor.position.clone().normalize();
	var treeVector = tree.position.clone().normalize();
	tree.quaternion.setFromUnitVectors(treeVector, rollingGroundVector);
	tree.rotation.x += (Math.random() * (2 * Math.PI / 10)) + -Math.PI / 10;

	floor.add(tree);
}

function createTree() {
	var sides = 8;
	var rows = 6;
	var scalarMultip = (Math.random() * (0.25 - 0.1)) + 0.05;
	var midPointVector = new THREE.Vector3();
	var vertVector = new THREE.Vector3();

	var treeGeometry = new THREE.ConeGeometry(
		0.5, 1,
		sides,
		rows);

	var treeMaterial = new THREE.MeshStandardMaterial({
		color: 0x33ff33,
		flatShading: true
	});

	var offset;
	midPointVector = treeGeometry.vertices[0].clone();
	var currentTier = 0;
	var vIndex;
	pushOutTree(treeGeometry.vertices, sides, 0, scalarMultip);
	pushInTree(treeGeometry.vertices, sides, 1);
	pushOutTree(treeGeometry.vertices, sides, 2, scalarMultip * 1.1, true);
	pushInTree(treeGeometry.vertices, sides, 3);
	pushOutTree(treeGeometry.vertices, sides, 4, scalarMultip * 1.2);
	pushInTree(treeGeometry.vertices, sides, 5);

	var treeTop = new THREE.Mesh(treeGeometry, treeMaterial);
	treeTop.castShadow = true;
	treeTop.receiveShadow = false;
	treeTop.position.y = 0.8;
	treeTop.rotation.y = (Math.random() * (Math.PI));

	var treeTrunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5);

	var trunkMaterial = new THREE.MeshStandardMaterial({
		color: 0x886633,
		flatShading: true
	});

	var treeTrunk = new THREE.Mesh(
		treeTrunkGeometry,
		trunkMaterial);

	// change the postion of the trunk
	treeTrunk.position.y = 0.15;
	var tree = new THREE.Object3D();
	tree.scale.x = 6;
	tree.scale.y = 6;
	tree.scale.z = 6;
	tree.add(treeTrunk);
	tree.add(treeTop);
	return tree;
}

//  pushes out every alternative vertex in a ring of vertices while keeping the other vertices in the ring at a lesser height
function pushOutTree(vertices, sides, currentTier, scalarMultip, odd) {
	var vIndex;
	var vertVector = new THREE.Vector3();
	var midPointVector = vertices[0].clone();
	var offset;
	for (var i = 0; i < sides; i++) {
		vIndex = (currentTier * sides) + 1;
		vertVector = vertices[i + vIndex].clone();
		midPointVector.y = vertVector.y;
		offset = vertVector.sub(midPointVector);
		if (odd) {
			if (i % 2 === 0) {
				offset.normalize().multiplyScalar(scalarMultip / 6);
				vertices[i + vIndex].add(offset);
			} else {
				offset.normalize().multiplyScalar(scalarMultip);
				vertices[i + vIndex].add(offset);
				vertices[i + vIndex].y = vertices[i + vIndex + sides].y + 0.05;
			}
		} else {
			if (i % 2 !== 0) {
				offset.normalize().multiplyScalar(scalarMultip / 6);
				vertices[i + vIndex].add(offset);
			} else {
				offset.normalize().multiplyScalar(scalarMultip);
				vertices[i + vIndex].add(offset);
				// give it a random rotation on the y axis to make it look slightly different
				vertices[i + vIndex].y = vertices[i + vIndex + sides].y + 0.05;
			}
		}
	}
}

function pushInTree(vertices, sides, currentTier) {
	var vIndex;
	var vertVector = new THREE.Vector3();
	var midPointVector = vertices[0].clone();
	var offset;
	for (var i = 0; i < sides; i++) {
		vIndex = (currentTier * sides) + 1;
		vertVector = vertices[i + vIndex].clone();
		midPointVector.y = vertVector.y;
		offset = vertVector.sub(midPointVector);
		offset.normalize().multiplyScalar(0.06);
		vertices[i + vIndex].sub(offset);
	}
}

//__________________ detect the collision 
function collision() {
	var oneTree;
	var treePosition = new THREE.Vector3();
	var treesToRemove = [];
	treesInPath.forEach(function (element, index) {
		oneTree = treesInPath[index];
		treePosition.setFromMatrixPosition(oneTree.matrixWorld);
		if (treePosition.z > 6 && oneTree.visible) {//gone out of our view zone
			treesToRemove.push(oneTree);
		}
		else {//check collision
			if (treePosition.distanceTo(hero.mesh.position) <= 0.6) {
				collided = true;
				explode();
			}
		}
	});
	var fromWhere;
	treesToRemove.forEach(function (element, index) {
		oneTree = treesToRemove[index];
		fromWhere = treesInPath.indexOf(oneTree);
		treesInPath.splice(fromWhere, 1);
		treesArray.push(oneTree);
		oneTree.visible = false;
		// console.log("remove tree");
	});
}

function showExplosion() {
	if (!particles.visible)
		return;
	for (var i = 0; i < particleCount; i++) {
		particleGeometry.vertices[i].multiplyScalar(explosionPower);
	}
	if (explosionPower > 1.005) {
		explosionPower -= 0.001;
	} else {
		particles.visible = false;
	}
	particleGeometry.verticesNeedUpdate = true;
}

function explode() {
	particles.position.y = 2;
	particles.position.z = 4.8;
	particles.position.x = hero.mesh.position.x;
	for (var i = 0; i < particleCount; i++) {
		var vertex = new THREE.Vector3();
		vertex.x = -0.2 + Math.random() * 0.4;
		vertex.y = -0.2 + Math.random() * 0.4;
		vertex.z = -0.2 + Math.random() * 0.4;
		particleGeometry.vertices[i] = vertex;
	}
	explosionPower = 1.07;
	particles.visible = true;
}

function updateCamera(flag) {

	camera = new THREE.PerspectiveCamera(
		50,
		sceneWidth / sceneHeight,
		1,
		2000);
	// _______First shooter 
	if (flag) {
		hero.mesh.add(camera);
		camera.position.x = 0;
		camera.position.y = -2.5;
		camera.position.z = 10;
		camera.lookAt(new THREE.Vector3(0, 0, -100));
	} else {
		camera.position.z = 9;
		camera.position.y = 2.5;
	}
}

function updateTexture(flagTexture) {

	// create a texture loader.
	var textureLoader = new THREE.TextureLoader();
	var texture = textureLoader.load('assets/textures/GroundForest003_COL_VAR1_3K.jpg');
	// set the "color space" of the texture
	texture.encoding = THREE.sRGBEncoding;
	// reduce blurring at glancing angles
	texture.anisotropy = 16;

	if (flagTexture) {
		floorGrass = new THREE.Mesh(
			new THREE.SphereGeometry(
				worldRadius - .5,
				50,
				50),
			new THREE.MeshStandardMaterial({
				color: 0x7abf8e
			}));
	} else {
		floorGrass = new THREE.Mesh(
			new THREE.SphereGeometry(
				worldRadius - .5,
				50,
				50),
			new THREE.MeshStandardMaterial({
				map: texture,
			})
		);
	}

	floor.add(floorGrass);
	scene.add(floor);
}

// _______________________ Pine tree
PineTree = function () {
	var height = 200;
	var truncGeom = new THREE.CylinderGeometry(2, 1, height, 6, 1);
	truncGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, height / 2, 0));
	this.mesh = new THREE.Mesh(truncGeom, greenMat);
	this.mesh.castShadow = true;
}

var PineTrees = new THREE.Group();

function createPineTree() {

	var nTrees = 20;
	for (var i = 0; i < nTrees; i++) {
		var phi = i * (Math.PI * 2) / nTrees;
		var theta = Math.PI / 2;
		//theta += .25 + Math.random()*.3; 
		theta += (Math.random() > .05) ? .25 + Math.random() * .3 : - .35 - Math.random() * .1;

		var PineTree = new Tree();
		PineTree.mesh.position.x = Math.sin(theta) * Math.cos(phi) * (worldRadius - 50);
		PineTree.mesh.position.y = Math.sin(theta) * Math.sin(phi) * (worldRadius - 60);
		PineTree.mesh.position.z = Math.cos(theta) * worldRadius;

		var vec = PineTree.mesh.position.clone();
		var axis = new THREE.Vector3(0, 1, 0);
		PineTree.mesh.quaternion.setFromUnitVectors(axis, vec.clone().normalize());
		floor.add(PineTree.mesh);
	}
	return PineTree.mesh;
}

Tree = function () {
	this.mesh = new THREE.Object3D();
	this.trunc = new Trunc();
	this.mesh.add(this.trunc.mesh);
}


Trunc = function () {
	// var truncHeight = 50 + Math.random() * 150;
	var truncHeight = 50 + Math.random() * 100;
	var topRadius = 1 + Math.random() * 5;
	// var bottomRadius = 5 + Math.random() * 5;
	var bottomRadius = 3 + Math.random() * 5;
	var mats = [blackMat, brownMat, pinkMat, whiteMat, greenMat, lightBrownMat, pinkMat];
	var matTrunc = blackMat;//mats[Math.floor(Math.random()*mats.length)];
	var nhSegments = 3;//Math.ceil(2 + Math.random()*6);
	var nvSegments = 3;//Math.ceil(2 + Math.random()*6);
	var geom = new THREE.CylinderGeometry(
		topRadius,
		bottomRadius,
		truncHeight,
		nhSegments,
		nvSegments);
	geom.applyMatrix(new THREE.Matrix4().makeTranslation(0, truncHeight / 2, 0));

	this.mesh = new THREE.Mesh(geom, matTrunc);

	for (var i = 0; i < geom.vertices.length; i++) {
		var noise = Math.random();
		var v = geom.vertices[i];
		v.x += -noise + Math.random() * noise * 2;
		v.y += -noise + Math.random() * noise * 2;
		v.z += -noise + Math.random() * noise * 2;

		geom.computeVertexNormals();

		// FRUITS

		if (Math.random() > .7) {
			var size = Math.random() * 3;
			var fruitGeometry = new THREE.CubeGeometry(size, size, size, 1);
			var matFruit = mats[Math.floor(Math.random() * mats.length)];
			var fruit = new THREE.Mesh(fruitGeometry, matFruit);
			fruit.position.x = v.x;
			fruit.position.y = v.y + 3;
			fruit.position.z = v.z;
			fruit.rotation.x = Math.random() * Math.PI;
			fruit.rotation.y = Math.random() * Math.PI;

			this.mesh.add(fruit);
		}

		// BRANCHES

		if (Math.random() > .5 && v.y > 10 && v.y < truncHeight - 10) {
			var h = 3 + Math.random() * 5;
			var thickness = .2 + Math.random();

			var branchGeometry = new THREE.CylinderGeometry(thickness / 2, thickness, h, 3, 1);
			branchGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, h / 2, 0));
			var branch = new THREE.Mesh(branchGeometry, matTrunc);
			branch.position.x = v.x;
			branch.position.y = v.y;
			branch.position.z = v.z;

			var vec = new THREE.Vector3(v.x, 2, v.z);
			var axis = new THREE.Vector3(0, 1, 0);
			branch.quaternion.setFromUnitVectors(axis, vec.clone().normalize());

			this.mesh.add(branch);
		}

	}
	this.mesh.castShadow = true;
}


function update() {
	// camera.updateProjectionMatrix();
	delta = clock.getDelta();

	floor.rotation.x += 0.004;
	if (clock.getElapsedTime() > treeReleaseInterval) {
		clock.start();
		putTreeInPath();
		if (!collided) {
			score += 2 * treeReleaseInterval;
			scoreText.innerHTML = score.toString();
		}
	}
	if (statusOfTheGame == "play") {
		if (hero.status == "running") {
			hero.run();
		}
	}

	if (score > 100) {
		// score = 0;
		gameOver();
	}
	collision();
	// carrotLogic();
	showExplosion();
}


function render() {
	renderer.render(scene, camera);//draw
}


function gameOver() {
	floor.rotation.x = 0;
	statusOfTheGame = "gameOver";
	hero.sit();
	cancelAnimationFrame(gameLoop);
	// open the modal 
	modal.style.display = "block";

	// When the user clicks on <span> (x), close the modal
	/*span.onclick = function () {
		modal.style.display = "none";
		init();
	}*/

	// window.clearInterval( powerupSpawnIntervalID );
}

setTimeout(function () {
	gameOver();

}, 90000);


//__________________  Animate the scene
function gameLoop() {
	requestAnimationFrame(gameLoop);
	update();
	render();
}

function resetGame() {
	location.reload();
}


//__________________ init function
init();
//__________________ game logic
gameLoop();

document.body.setAttribute("class", "noscroll");

document.getElementById("overlay").style.display = "block";
document.getElementById("spinner").style.display = "block";


setTimeout(function () {
	document.getElementById("spinner").style.display = "none";
	document.getElementById("overlay").style.display = "none";

	document.body.className = document.body.className.replace(/\bnoscroll\b/, '');
}, 2500);

document.getElementById("btn-reset").onclick = function () {
	resetGame()
};

// window.onload = function () {
// 	document.getElementById("spinner").style.display = "none";
// 	document.getElementById("overlay").style.display = "none";

// 	document.body.className = document.body.className.replace(/\bnoscroll\b/, '');
// }

document.getElementById("btn").onclick = function () {
	flag = !flag;
	updateCamera(flag);
};

document.getElementById("btn-texture").onclick = function () {
	flagTexture = !flagTexture;
	updateTexture(flagTexture)
	console.log(flagTexture)
};