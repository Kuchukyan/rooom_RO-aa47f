let isMobile = false;
let antialias = true;

// three let
let camera, scene, light, renderer, canvas, controls, content;
let meshs = [];
let grounds = [];
let paddel;
let matBox, matSphere, matBoxSleep, matSphereSleep, matGround, matGroundTrans;
let buffgeoSphere, buffgeoBox;
let ray, mouse;
let ToRad = Math.PI / 180;
let ToDeg = 180 / Math.PI;
let rotTest;

//oimo let
let world = null;
let bodys = null;
let infos;
let type = 1;

init();
loop();

function init() {
    let n = navigator.userAgent;
    if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i) || n.match(/Windows Phone/i)) {
        isMobile = true;
        antialias = false;
        document.getElementById("MaxNumber").value = 200;
    }

    infos = document.getElementById("info");

    canvas = document.getElementById("canvas");

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.set(-400, 160, 0);

    controls = new THREE.OrbitControls(camera, canvas);
    controls.target.set(0, 20, 0);
    controls.update();

    ray = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({canvas: canvas, precision: "mediump", antialias: antialias});
    renderer.setSize(window.innerWidth, window.innerHeight);

    content = new THREE.Object3D();
    scene.add(content);

    let materialType = 'MeshBasicMaterial';

    if (!isMobile) {

        scene.add(new THREE.AmbientLight(0x3D4143));

        light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(300, 1000, 500);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadowCameraNear = 500;
        light.shadowCameraFar = 1600;
        light.shadowCameraFov = 70;
        light.shadowBias = 0.0001;
        light.shadowDarkness = 0.7;
        light.shadowMapWidth = light.shadowMapHeight = 1024;
        scene.add(light);

        materialType = 'MeshPhongMaterial';

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;//THREE.BasicShadowMap;
    }

    // background
    let buffgeoBack = new THREE.BufferGeometry();
    buffgeoBack.fromGeometry(new THREE.IcosahedronGeometry(3000, 1));
    let back = new THREE.Mesh(buffgeoBack, new THREE.MeshBasicMaterial({
        map: gradTexture([[1, 0.75, 0.5, 0.25], ['#1B1D1E', '#3D4143', '#72797D', '#b0babf']]),
        side: THREE.BackSide,
        depthWrite: false
    }));
    back.geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(15 * ToRad));
    scene.add(back);

    buffgeoSphere = new THREE.BufferGeometry();
    buffgeoSphere.fromGeometry(new THREE.SphereGeometry(1, 20, 10));

    buffgeoBox = new THREE.BufferGeometry();
    buffgeoBox.fromGeometry(new THREE.BoxGeometry(1, 1, 1));

    matSphere = new THREE[materialType]({map: basicTexture(0), name: 'sph'});
    matBox = new THREE[materialType]({map: basicTexture(2), name: 'box'});
    matSphereSleep = new THREE[materialType]({map: basicTexture(1), name: 'ssph'});
    matBoxSleep = new THREE[materialType]({map: basicTexture(3), name: 'sbox'});
    matGround = new THREE[materialType]({color: 0x3D4143, transparent: true, opacity: 0.5});
    matGroundTrans = new THREE[materialType]({color: 0x3D4143, transparent: true, opacity: 0.6});

    paddel = new THREE.Object3D();

    rotTest = new THREE.Vector3();

    // events

    window.addEventListener('resize', onWindowResize, false);
    canvas.addEventListener('mousemove', rayTest, false);
    //canvas.onmousemove = rayTest;

    // physics

    initOimoPhysics();
}

function loop() {

    updateOimoPhysics();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

function addStaticBox(size, position, rotation, spec) {
    let mesh;
    if (spec) mesh = new THREE.Mesh(buffgeoBox, matGroundTrans);
    else mesh = new THREE.Mesh(buffgeoBox, matGround);
    mesh.scale.set(size[0], size[1], size[2]);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.rotation.set(rotation[0] * ToRad, rotation[1] * ToRad, rotation[2] * ToRad);
    if (!grounds.length) content.add(mesh);
    else scene.add(mesh);
    grounds.push(mesh);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
}

function clearMesh() {
    let i = meshs.length;
    while (i--) scene.remove(meshs[i]);
    i = grounds.length;
    while (i--) scene.remove(grounds[i]);
    grounds = [];
    meshs = [];
}

//----------------------------------
//  OIMO PHYSICS
//----------------------------------

function initOimoPhysics() {

    world = new OIMO.World(1 / 60, 2, 8);
    populate(1);
    //setInterval(updateOimoPhysics, 1000/60);
};

function populate(n) {

    // The Bit of a collision group
    let group1 = 1 << 0;  // 00000000 00000000 00000000 00000001
    let group2 = 1 << 1;  // 00000000 00000000 00000000 00000010
    let group3 = 1 << 2;  // 00000000 00000000 00000000 00000100
    let all = 0xffffffff; // 11111111 11111111 11111111 11111111

    let max = document.getElementById("MaxNumber").value;

    type = 3;

    // reset old
    clearMesh();
    world.clear();
    bodys = [];

    // Is all the physics setting for rigidbody
    let config = [
        1, // The density of the shape.
        0.4, // The coefficient of friction of the shape.
        0.2, // The coefficient of restitution of the shape.
        1, // The bits of the collision groups to which the shape belongs.
        all // The bits of the collision groups with which the shape collides.
    ];


    //add ground
    let ground = world.add({size: [400, 40, 400], pos: [0, -20, 0], config: config});
    addStaticBox([400, 40, 400], [0, -20, 0], [0, 0, 0]);

    let ground2 = world.add({size: [200, 30, 390], pos: [130, 40, 0], rot: [0, 0, 32], config: config});
    addStaticBox([200, 30, 390], [130, 40, 0], [0, 0, 32]);

    /*config[3] = group1;
     config[4] = all & ~group2;
     let ground3 = world.add({size:[5, 100, 390], pos:[0,40,0], rot:[0,0,0], world:world, config:config});
     addStaticBox([5, 100, 390], [0,40,0], [0,0,0], true);*/

    // now add object
    let x, y, z, w, h, d;
    let i = max;


    while (i--) {
        if (type === 3) t = Math.floor(Math.random() * 2) + 1;
        else t = type;
        x = 150;
        z = -100 + Math.random() * 200;
        y = 100 + Math.random() * 1000;
        w = 10 + Math.random() * 10;
        h = 10 + Math.random() * 10;
        d = 10 + Math.random() * 10;

        config[4] = all;

        if (t === 1) {
            config[3] = group2;
            bodys[i] = world.add({
                type: 'sphere',
                size: [w * 0.5],
                pos: [x, y, z],
                move: true,
                config: config,
                name: 'sphere'
            });
            meshs[i] = new THREE.Mesh(buffgeoSphere, matSphere);
            meshs[i].scale.set(w * 0.5, w * 0.5, w * 0.5);
        } else if (t === 2) {
            config[3] = group3;
            bodys[i] = world.add({
                type: 'box',
                size: [w, h, d],
                pos: [x, y, z],
                move: true,
                config: config,
                name: 'box'
            });
            meshs[i] = new THREE.Mesh(buffgeoBox, matBox);
            meshs[i].scale.set(w, h, d);
        }

        meshs[i].castShadow = true;
        meshs[i].receiveShadow = true;

        scene.add(meshs[i]);
    }

    config[3] = 1;
    config[4] = all;
    bodys[max] = world.add({
        size: [20, 40, 60],
        pos: [-150, 20, 0],
        rot: [0, 0, 0],
        move: true,
        noSleep: true,
        config: config,
        name: 'paddle'
    });
    meshs[max] = new THREE.Mesh(buffgeoBox, matBox);
    meshs[max].scale.set(20, 40, 60);
    scene.add(meshs[max]);
}


function updateOimoPhysics() {

    if (world == null) return;

    world.step();

    // apply new position on last rigidbody
    bodys[bodys.length - 1].setPosition(paddel.position);

    paddel.lookAt(new THREE.Vector3(100, paddel.position.y, 0));
    paddel.rotation.y += 90 * ToRad;

    // apply new rotation on last rigidbody
    bodys[bodys.length - 1].setQuaternion(paddel.quaternion);


    let p, r, m, x, y, z;
    let mtx = new THREE.Matrix4();
    let i = bodys.length;
    let mesh;
    let body;

    while (i--) {
        body = bodys[i];
        mesh = meshs[i];

        if (!body.sleeping) {

            mesh.position.copy(body.getPosition());
            mesh.quaternion.copy(body.getQuaternion());


            // change material
            if (mesh.material.name === 'sbox') mesh.material = matBox;
            if (mesh.material.name === 'ssph') mesh.material = matSphere;

            // reset position
            if (mesh.position.y < -100) {
                x = 150;
                z = -100 + Math.random() * 200;
                y = 100 + Math.random() * 1000;
                body.resetPosition(x, y, z);
            }
        } else {
            if (mesh.material.name === 'box') mesh.material = matBoxSleep;
            if (mesh.material.name === 'sph') mesh.material = matSphereSleep;
        }
    }

    // contact test
    if (world.checkContact('paddle', 'sphere')) meshs[bodys.length - 1].material = matSphere;
    else if (world.checkContact('paddle', 'box')) meshs[bodys.length - 1].material = matBox;
    else meshs[bodys.length - 1].material = matBoxSleep;

    infos.innerHTML = world.performance.show();
}

function gravity(g) {
    nG = document.getElementById("gravity").value
    world.gravity = new OIMO.Vec3(0, nG, 0);
}

let unwrapDegrees = function (r) {
    r = r % 360;
    if (r > 180) r -= 360;
    if (r < -180) r += 360;
    return r;
}

//----------------------------------
//  TEXTURES
//----------------------------------

function gradTexture(color) {
    let c = document.createElement("canvas");
    let ct = c.getContext("2d");
    c.width = 16;
    c.height = 256;
    let gradient = ct.createLinearGradient(0, 0, 0, 256);
    let i = color[0].length;
    while (i--) {
        gradient.addColorStop(color[0][i], color[1][i]);
    }
    ct.fillStyle = gradient;
    ct.fillRect(0, 0, 16, 256);
    let texture = new THREE.Texture(c);
    texture.needsUpdate = true;
    return texture;
}

function basicTexture(n) {
    let canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    let ctx = canvas.getContext('2d');
    let colors = [];
    if (n === 0) { // sphere
        colors[0] = "#58AA80";
        colors[1] = "#58FFAA";
    }
    if (n === 1) { // sphere sleep
        colors[0] = "#383838";
        colors[1] = "#38AA80";
    }
    if (n === 2) { // box
        colors[0] = "#AA8058";
        colors[1] = "#FFAA58";
    }
    if (n === 3) { // box sleep
        colors[0] = "#383838";
        colors[1] = "#AA8038";
    }
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = colors[1];
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillRect(32, 32, 32, 32);

    let tx = new THREE.Texture(canvas);
    tx.needsUpdate = true;
    return tx;
}

//----------------------------------
//  RAY TEST
//----------------------------------

function rayTest(e) {
    mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = -( e.clientY / window.innerHeight ) * 2 + 1;

    ray.setFromCamera(mouse, camera);
    let intersects = ray.intersectObjects(content.children, true);
    if (intersects.length) {
        paddel.position.copy(intersects[0].point.add(new THREE.Vector3(0, 20, 0)));
    }
}
