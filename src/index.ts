import {EventType, LoginCredentials, MinecraftClient} from "@webpejs/network";
import {NoaImpl} from "./NoaImpl";

let client = new MinecraftClient(undefined, 19133);

client.on(EventType.PlayerLoginRequest, (cred: LoginCredentials) => {
    cred.displayName = 'WebNoaClient';
});
client.connect();

new NoaImpl(client).startEngine();


// client.on(EventType.PlayerSpawn, () => {
//     setTimeout(function () {
//         console.log('PlayerSpawn!');
//         new NoaImpl(client).startEngine();
//     }, 5000);
//
// });
// new NoaImpl(null).startEngine();

// setTimeout(startNoa.bind(this), 5000);
// function startNoa() {}