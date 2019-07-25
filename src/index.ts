let noaEngine = require("noa-engine");
import 'babylonjs';

const opts = {
    babylon: BABYLON,

    debug: true,
    showFPS: true,
    silent: true,
    // chunkSize: 32,
    // chunkAddDistance: 1,
    // chunkRemoveDistance: 3,
    // blockTestDistance: 20,
    // texturePath: 'textures/',
    // playerStart: [0.5,15,0.5],
    // playerHeight: 1.4,
    // playerWidth: 1.0,
    // playerAutoStep: true,
    // useAO: true,
    // AOmultipliers: [ 0.93, 0.8, 0.5 ],
    // reverseAOmultiplier: 1.0,
};

let noa = noaEngine(opts);

let textureURL = null;
let brownish = [0.45, 0.36, 0.22];
let greenish = [0.1, 0.8, 0.2];
noa.registry.registerMaterial('dirt', brownish, textureURL);
noa.registry.registerMaterial('grass', greenish, textureURL);

let dirtID = noa.registry.registerBlock(1, { material: 'dirt' });
let grassID = noa.registry.registerBlock(2, { material: 'grass' });

noa.world.on('worldDataNeeded', function (id, data, x, y, z) {
    for (let i = 0; i < data.shape[0]; ++i) {
        for (let k = 0; k < data.shape[2]; ++k) {
            const height = getHeightMap(x + i, z + k);
            for (let j = 0; j < data.shape[1]; ++j) {
                if (y + j < height) {
                    if (y + j < 0) data.set(i, j, k, dirtID);
                    else data.set(i, j, k, grassID);
                }
            }
        }
    }

    noa.world.setChunkData(id, data)
});

function getHeightMap(x, z) {
    const xs = 0.8 + Math.sin(x / 10);
    const zs = 0.4 + Math.sin(z / 15 + x / 30);
    return xs + zs;
}

const eid = noa.playerEntity;
const dat = noa.entities.getPositionData(eid);
const w = dat.width;
const h = dat.height;

const scene = noa.rendering.getScene();
const mesh = noa.BABYLON.Mesh.CreateBox('player', 1, scene);
mesh.scaling.x = mesh.scaling.z = w;
mesh.scaling.y = h;

const offset = [0, h / 2, 0];

noa.entities.addComponent(eid, noa.entities.names.mesh, {
    mesh: mesh,
    offset: offset
});

noa.inputs.down.on('fire', function () {
    if (noa.targetedBlock) noa.setBlock(0, noa.targetedBlock.position)
});

noa.inputs.down.on('alt-fire', function () {
    if (noa.targetedBlock) noa.addBlock(grassID, noa.targetedBlock.adjacent)
});

noa.inputs.bind('alt-fire', 'E');


let zoom = 0;
noa.on('tick', function (dt) {
    const scroll = noa.inputs.state.scrolly;
    if (scroll === 0) return;

    zoom += (scroll > 0) ? 1 : -1;
    if (zoom < 0) zoom = 0;
    if (zoom > 10) zoom = 10;
    noa.camera.zoomDistance = zoom;
});
