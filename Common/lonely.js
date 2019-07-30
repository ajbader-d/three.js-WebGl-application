let scene, camera, renderer;
let lampLight, moonLight;
let lampMesh = [];
let stones = [];
let largeStones = [];
let house = [];
let dirt;
var time = 0;
var controlFlag = false;

var mainOptions = {
    speed: .8,
    bounds: {
        min: 70,
        max: 80
    }
}

//_______________________________________ Model initializing array
let modelsInit = {
    gravity: 0.981,
    ready: {
        count: 0
    },
    mouse: {
        x: 0,
        y: 0,
        z: 0.5
    },
    models: {
        lamp: "assets/models/lamp.gltf",
    },
    texture: {},
    targetList: []
}

//_______________________________________ Textures
modelsInit.texture.moon = new THREE.TextureLoader().load("assets/textures/moon.jpg");
modelsInit.texture.lamp = new THREE.TextureLoader().load("assets/textures/lamp.png");

//___________________________________________ Random Number

function numberGenerator(min, max, bool) {

    var number = Math.floor(Math.random() * max) + min; // this will get a number between 1 and 99;
    if (bool || typeof bool == "undefined") {
        number *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
    }
    return number;
}


function pointInCircle(point, target, radius) {
    var distsquare = (point.x - target.x) * (point.x - target.x) + (point.y - target.y) * (point.y - target.y) + (point.z - target.z) * (point.z - target.z);
    // returns bool , distance to target origin 
    return [distsquare <= radius * radius * radius, distsquare];
}

//___________________________________________ update viewport on resize
window.addEventListener('resize', function () {
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height; //aspect ratio
    camera.updateProjectionMatrix();
});

//_______________________________________  Camera and Scene
container = document.getElementById('world');

scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x1D1F20, 0.001);

// camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, .1, 10000);
camera.position.x = -50;
camera.position.y = 20;
camera.position.z = -135;
camera.lookAt(new THREE.Vector3(0, 20, 0));

scene.add(camera);

//_______________________________________  RENDERER

renderer = new THREE.WebGLRenderer({
    antialias: true,
    transparent: true,
    alpha: true
});
renderer.shadowMap.enabled = true;

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// renderer.shadowMap.enabled = true;

//___________________________________________ CONTROLS
// controls = new THREE.OrbitControls(camera);
// controls.damping = 0.2;
// // controls.addEventListener('change', render);
// controls.maxPolarAngle = Math.PI / 2;

// controls.target = new THREE.Vector3(0, 20, 0);
// controls.maxDistance = 200;

//___________________________________________ lighting
var ambientLight = new THREE.AmbientLight(0x1A1324, 1);
scene.add(ambientLight);

//Conterlight
var pointLight = new THREE.PointLight(0xffffff, .5, 300);
pointLight.position.set(100, 100, 0);
scene.add(pointLight);

// LAMP  light
lampLight = new THREE.SpotLight(0xffffff, 1); // FEE191
lampLight.position.set(100, 260, 100).multiplyScalar(1);
//
lampLight.castShadow = true;

lampLight.shadow.mapSize.width = 1024;
lampLight.shadow.mapSize.height = 1024;

// var helper = new THREE.CameraHelper( camera );

var d = 5000;
lampLight.shadow.camera.left = -d;
lampLight.shadow.camera.right = d;
lampLight.shadow.camera.top = d;
lampLight.shadow.camera.bottom = -d;
lampLight.shadow.camera.near = 0.01;
lampLight.shadow.camera.far = 350;
// lampLight.shadow.camera.fov = 30;

scene.add(lampLight);
// scene.add(helper);

// moon light
moonLight = new THREE.SpotLight(0xffffff, .5);
moonLight.position.set(0, 50, 0).multiplyScalar(1);

moonLight.castShadow = true;

moonLight.shadow.mapSize.width = 1024;
moonLight.shadow.mapSize.height = 1024;

moonLight.target.position.set(100, 100, 200);
moonLight.target.updateMatrixWorld();

var d = 5000;
moonLight.shadow.camera.left = -d;
moonLight.shadow.camera.right = d;
moonLight.shadow.camera.top = d;
moonLight.shadow.camera.bottom = -d;
moonLight.shadow.camera.near = 0.01;
moonLight.shadow.camera.far = 350;

scene.add(moonLight);

//__________________________________ LOAD MODEL GLTFLoader loader
var loader = new THREE.GLTFLoader();

//___________________________________________ LAMP

loader.load(
    modelsInit.models.lamp,
    function (gltf) {
        const lampModel = gltf.scene.children[0];

        // console.log(gltf.scene)
        lampModel.traverse(function (child) {
            if (child.isMesh) {
                child.material.shininess = 10;
                child.material.map = modelsInit.texture.lamp;
                child.material.side = THREE.DoubleSide;
                child.material.transparent = true;
                child.material.depthTest = true;
            }
        });

        lampModel.material = new THREE.MeshPhongMaterial({
            map: modelsInit.texture.lamp,
            shininess: 10,
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: true
        });

        console.log(lampMesh)

        for (let l = 0; l < 2; l++) {

            lampMesh[l] = new THREE.Mesh(lampModel.geometry, lampModel.material);
            lampMesh[l].position.z = -80 + (l * 65);
            lampMesh[l].position.x = -50;
            lampMesh[l].receiveShadow = true;
            lampMesh[l].castShadow = true;

            lampMesh[l].update = function (time) {

                this.position.z -= mainOptions.speed;

                if (this.position.z > 0 && this.position.y > 4) {
                    this.position.y -= modelsInit.gravity;
                }

                if (this.position.z < -70) {
                    this.position.y -= (.1 + numberGenerator(0.1, 1.2, false));
                    this.rotation.x -= numberGenerator(0.01, 0.06, false);
                }

                if (this.position.z < -(80)) {
                    this.position.z = 80;
                    this.position.y = (16 + numberGenerator(1, 3));
                    this.rotation.x = numberGenerator(1, 8, true) * Math.PI / 180;
                    this.rotation.y = numberGenerator(1, 8, true) * Math.PI / 180;
                    this.rotation.z = 0;
                }

            } //end of update

            let pointLight = new THREE.PointLight(0xF7D747, 1, 100);
            pointLight.position.set(0, 55, 0);
            lampMesh[l].add(pointLight);

            scene.add(lampMesh[l]);
        }
    },
    // called while loading is progressing
    function (xhr) {

        console.log((xhr.loaded / xhr.total * 100) + '% loaded');

    },
    // called when loading has errors
    function (error) {

        console.log('An error happened');

    }
);

//___________________________________________ Moon

var moonGeometry = new THREE.SphereGeometry(85, 32, 32)
var moonMaterial = new THREE.MeshPhongMaterial({
    transparent: true,
    opacity: .7,
    map: modelsInit.texture.moon,
    bumpMap: modelsInit.texture.moon,
    bumpScale: .001
})
var moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.set(100, 100, 200);
scene.add(moon);


//___________________________________________ Dirt effect

var dirtGeometry = new THREE.Geometry();

var kMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: .25,
    transparent: true,
    opacity: .5,
    vertexColors: true
});

var colors = [];
var colorArray = [0x363A3F, 0x846550];
var turbulence = [];

for (var i = 0; i < 250; i++) {

    var x = numberGenerator(0, 5, true);
    var y = 2 + numberGenerator(0.1, 25, false);
    var z = numberGenerator(0, 25, false);

    dirtGeometry.vertices.push(new THREE.Vector3(numberGenerator(0, 2.1, true), 0, numberGenerator(0, .2, true)));
    turbulence.push(new THREE.Vector3(x, y, z));

    colors.push(new THREE.Color(colorArray[Math.floor(Math.random() * colorArray.length)]));
}

dirt = new THREE.Points(dirtGeometry, kMaterial);
dirt.turbulence = turbulence;
dirt.geometry.colors = colors;
dirt.geometry.colorsNeedUpdate = true;
dirt.position.set(0, 0, 0);

dirt.update = function (time) {
    var that = this;
    this.geometry.vertices.forEach(function (p, index) {

        p.x += .01 * that.turbulence[index].x;
        p.y += Math.sin(time) * .0001 * that.turbulence[index].y + numberGenerator(.1, .8, false);
        p.z -= .01 * that.turbulence[index].z + numberGenerator(.1, .8, false);

        var radius_checker = pointInCircle({
            x: 0,
            y: 0,
            z: -9
        }, p, 5);

        if (!radius_checker[0]) {
            p.x = 0;
            p.y = 0;
            p.z = -9;
        }
    });

    this.geometry.verticesNeedUpdate = true;
}

frontDirt = dirt.clone();

frontDirt.position.z = 15;
frontDirt.castShadow = true;

//___________________________________________ Base Material

var baseMaterial = new THREE.MeshLambertMaterial({
    color: 0x333333,
    transparent: true
});

var box = new THREE.BoxGeometry(5, 5, 5);
var pool_options = {
    position: {
        x: 0,
        y: 0,
        z: 80
    },
    radius: 5
}
var smallStone = {
    offset: {
        x: -30,
        z: -55
    },
    stone_row: 0,
    stone_col: 0
}

for (var i = 0; i < 480; i++) {
    stones[i] = new THREE.Mesh(box, baseMaterial);

    if (i % 15 == 0) {
        smallStone.stone_row++;
        smallStone.stone_col = 0;
    }

    stones[i].position.x = smallStone.offset.x + 5 * smallStone.stone_col + numberGenerator(.1, .8, true);
    stones[i].position.z = smallStone.offset.z + 5 * smallStone.stone_row + numberGenerator(.1, .8, true);
    stones[i].rotation.x = numberGenerator(1, 8, true) * Math.PI / 180;
    stones[i].rotation.y = numberGenerator(1, 8, true) * Math.PI / 180;

    stones[i].update = function (time) {

        this.position.z -= mainOptions.speed;
        pool_options.position.z -= mainOptions.speed;

        if (this.position.z > 0 && this.position.y < -(1 + numberGenerator(.1, .8, true))) {
            this.position.y += modelsInit.gravity;
        }

        if (this.position.z < -51) {
            this.position.y -= (.1 + numberGenerator(0.1, 1.2, false));
            this.rotation.x += numberGenerator(0.1, 0.6, true);
            this.rotation.y += numberGenerator(0.1, 0.6, true);
            this.rotation.z += numberGenerator(0.1, 0.6, true);
        }

        if (this.position.z < -(80)) {
            this.position.z = 80;
            this.position.y = -(16 + numberGenerator(1, 3));
            this.rotation.x = numberGenerator(1, 8, true) * Math.PI / 180;
            this.rotation.y = numberGenerator(1, 8, true) * Math.PI / 180;
            this.rotation.z = 0;
        }

    }


    scene.add(stones[i]);

    stones[i].receiveShadow = true;
    smallStone.stone_col++;
}

//___________________________________________ BIG STONES

var largeBox = new THREE.BoxGeometry(40, 5, 29);

var largeStone = {
    offset: {
        x: -52.5,
        z: -70,
    },
    stone_row: 0,
    stone_col: 0
}


for (var i = 0; i < 12; i++) {
    largeStones[i] = new THREE.Mesh(largeBox, baseMaterial);

    if (i % 2 == 0) {
        largeStone.stone_row++;
        largeStone.stone_col = 0;
    }

    largeStones[i].position.x = largeStone.offset.x + 115 * largeStone.stone_col + numberGenerator(.1, .8, true);
    largeStones[i].position.z = largeStone.offset.z + 27 * largeStone.stone_row;
    largeStones[i].rotation.x = numberGenerator(1, 3, true) * Math.PI / 180;
    largeStones[i].rotation.z = numberGenerator(1, 3, true) * Math.PI / 180;
    largeStones[i].position.y = 0;

    largeStones[i].update = function (time) {

        this.position.z -= mainOptions.speed;

        if (this.position.z > 0 && this.position.y < numberGenerator(.1, .8, true)) {
            this.position.y += modelsInit.gravity;
        }

        if (this.position.z < -70) {
            this.position.y -= (.1 + numberGenerator(0.1, 1.2, false));
            this.rotation.x -= numberGenerator(0.01, 0.1, false);
        }

        if (this.position.z < -(80)) {
            this.position.z = 80;
            this.position.y = -(16);

            this.rotation.x = numberGenerator(1, 3, true) * Math.PI / 180;
            this.rotation.z = numberGenerator(1, 3, true) * Math.PI / 180;
            this.rotation.y = 0;
        }
    }

    largeStones[i].receiveShadow = true;
    scene.add(largeStones[i]);

    largeStone.stone_col++;
}

//___________________________________________ HOUSE

// house gemetric, the width, height and depth 
var houseGeo = new THREE.BoxGeometry(5, 10, 20);

console.log(houseGeo)

// to position the house to the right of the screen
var houseOptions = {
    offset: {
        x: -73,
        y: 0,
        z: -50
    },
    stone_row: 0,
    stone_col: 0
}

console.log(house)
// we have 56 meshs so we loop through them
for (var i = 0; i < 56; i++) {
    house[i] = new THREE.Mesh(houseGeo, baseMaterial);

    // to add a row
    if (i % 8 == 0) {
        houseOptions.stone_row++;
        houseOptions.stone_col = 0;
    }

    // reposition the house
    house[i].position.x = houseOptions.offset.x + numberGenerator(.1, .8, true);
    house[i].position.y = -5 + (houseOptions.stone_row * 10 + numberGenerator(.1, .8, true));
    house[i].position.z = houseOptions.offset.z + 20 * houseOptions.stone_col + numberGenerator(.1, .8, true);
    house[i].rotation.y = numberGenerator(1, 8, true) * Math.PI / 180;
    house[i].options = {
        row: houseOptions.stone_row,
        col: houseOptions.stone_col
    }

    scene.add(house[i]);

    house[i].receiveShadow = true;
    houseOptions.stone_col++;
}

//___________________________________________ Camera Orbit Control
function updateControl(controlFlag) {
    var menu = document.querySelector('#controls-instruction');
    if (controlFlag) {
        controls = new THREE.OrbitControls(camera);
        controls.damping = 0.2;
        controls.maxPolarAngle = Math.PI / 2;

        controls.target = new THREE.Vector3(0, 20, 0);
        controls.maxDistance = 200;

        // if (menu.style.display == "") {
        //     menu.style.display = "block";
        // }


    } else {

        // menu.style.display = "none";
        camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, .1, 10000);
        camera.position.x = -50;
        camera.position.y = 20;
        camera.position.z = -135;
        camera.lookAt(new THREE.Vector3(0, 20, 0));

        scene.add(camera);
    }

}


//___________________________________________ Game logic
var update = function () {
    //cube.rotation.x += 0.01;
    //cube.rotation.y += 0.005;

    if (typeof stones != "undefined") {

        stones.forEach(function (el) {
            el.update(time);
        });

        largeStones.forEach(function (el) {
            el.update(time);
        });

        lampMesh.forEach(function (el) {
            el.update(time);
        });
    }

    if (typeof dirt != "undefined") {
        dirt.update(time);
    }

    if (typeof manModel != "undefined") {
        manModel.update(time);
    }

    // console.clear();

    //   if (typeof house != "undefined") {
    //     house.forEach(function(el) {
    //       el.update(time);
    //     });
    //   }
};

//render logic
var render = function () {
    renderer.render(scene, camera);
};

//run game loop (update, render, repeat)
var GameLoop = function () {
    requestAnimationFrame(GameLoop);
    update();
    render();
};

document.getElementById("btn").onclick = function () {
    controlFlag = !controlFlag;
    updateControl(controlFlag);
    
};


// Show an element
var show = function (elem) {
	elem.classList.add('is-visible');
};

//__________________________ Hide and show control instructions

var button = document.querySelector('#btn');

button.addEventListener('click', function (event) {

    var next = document.querySelector('#controls-instruction');;

    if (next.style.display == "none") {
        next.style.display = "block";

    } else {
        next.style.display = "none";
    }
});


GameLoop();