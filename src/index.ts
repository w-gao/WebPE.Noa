import {MinecraftClient} from "@webpejs/network";
import {NoaImpl} from "./NoaImpl";

let client = new MinecraftClient(undefined, 19133);
client.connect();

client.onPlayerSpawn = () => {

    setTimeout(function () {
        console.log('PlayerSpawn!');
        new NoaImpl(client).startEngine();
    }, 5000);

};

// setTimeout(startNoa.bind(this), 5000);
// function startNoa() {}
