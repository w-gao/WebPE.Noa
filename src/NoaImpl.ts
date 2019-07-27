import noaEngine = require("noa-engine");
import 'babylonjs';
import {MinecraftClient} from "@webpejs/network";

export class NoaImpl {

    private client: MinecraftClient;

    private noaEngine;      // noaEngine

    constructor(client: MinecraftClient) {
        this.client = client;
    }

    public startEngine() {

        const opts = {
            babylon: BABYLON,
            debug: true,
            showFPS: true,
            silent: true,
            chunkSize: 16,
            chunkAddDistance: 8,
            // chunkRemoveDistance: 3,
            // blockTestDistance: 20,
            // texturePath: 'textures/',
            playerStart: [128.5, 64, 128.5],        // change to spawn point
            // playerHeight: 1.4,
            // playerWidth: 1.0,
            // playerAutoStep: true,
            // useAO: true,
            // AOmultipliers: [ 0.93, 0.8, 0.5 ],
            // reverseAOmultiplier: 1.0,
        };

        this.noaEngine = noaEngine(opts);

        this.registerBlocks();
        this.registerListeners();

        let noa = this.noaEngine;

        noa.rendering.getScene().getCameraByName('camera').fov = 1.25;

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
            if (noa.targetedBlock) {
                noa.addBlock(2, noa.targetedBlock.adjacent)
            }
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

    }

    private registerBlocks() {

        let textureURL = null;
        let brownish = [0.45, 0.36, 0.22];
        let greenish = [0.1, 0.8, 0.2];
        let black = [0, 0, 0];
        let white = [0.95, 0.95, 0.95];
        this.noaEngine.registry.registerMaterial('dirt', brownish, textureURL);
        this.noaEngine.registry.registerMaterial('grass', greenish, textureURL);
        this.noaEngine.registry.registerMaterial('unknown', black, textureURL);
        this.noaEngine.registry.registerMaterial('snow', white, textureURL);

        this.noaEngine.registry.registerBlock(1, {material: 'dirt'});
        this.noaEngine.registry.registerBlock(2, {material: 'grass'});
        this.noaEngine.registry.registerBlock(3, {material: 'unknown'});
        this.noaEngine.registry.registerBlock(4, {material: 'snow'});

    }

    private registerListeners() {

        let noa = this.noaEngine;
        let world = this.client.world;

        noa.world.on('worldDataNeeded', function (id, data, x, y, z) {

            // todo: add callback when chunks are received and set data from there

            for (let i = 0; i < data.shape[0]; ++i) {
                for (let j = 0; j < data.shape[1]; ++j) {
                    for (let k = 0; k < data.shape[2]; ++k) {

                        // flip the x-axis across the spawn point
                        // (2 * originX) - x
                        let ax = 257 - (x + i);

                        // if (ax == 130 && (y + j) == 63 && (z + k) == 130) {
                        //     data.set(i, j, k, 3);
                        //     continue;
                        // }

                        let blockId = world.getBlock(ax, y + j, z + k);
                        // It'd be cool if we use the same ID system
                        if (blockId == 3) {     // dirt
                            data.set(i, j, k, 1);       // brown
                        } else if (blockId == 80) {     // snow
                            data.set(i, j, k, 4);  // white-ish
                        } else if (blockId != 0) {
                            data.set(i, j, k, 2);  // green
                        } else {
                            // air
                            data.set(i, j, k, 0);
                        }
                    }
                }
            }

            noa.world.setChunkData(id, data)
        });
    }

}
