import {
    MeshBuilder, 
    Scene, 
    ArcRotateCamera,
    Mesh,
    Vector3,
    HemisphericLight,
    Engine,
    WebXRExperienceHelper,
    Axis,
    DynamicTexture,
    StandardMaterial,
    Color3
} from "babylonjs";
import { Material } from "babylonjs/Materials/material";
import { ImageRenderStatus, VRScreenObject } from "./vrscreenobject";


class VRDesktop{

    private _scene: Scene;
    private _screens:Map<string,VRScreenObject>;
    constructor(){
        // create the canvas html element and attach it to the webpage
        let canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
        if(canvas == null) { return; }
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        this._screens = new Map<string,VRScreenObject>();


        // initialize babylon scene and engine
        let engine = new Engine(canvas, true);
        this._scene = new Scene(engine);

        let camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this._scene);
        camera.attachControl(canvas, true);
        camera.target.y = 2;
        let light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), this._scene);


        const font = "bold 24px monospace";

        const client = new WebSocket("wss://"+location.host+"/socket");
        client.addEventListener('open',()=>{
            client.send("HELLO");
        });
        client.addEventListener('message',(msg)=>{            
            const jdata = JSON.parse(msg.data);
            switch(jdata.cmd){
                case "init":{
                    jdata.screens.forEach((screen=>{
                        this._screens.set(
                            screen.x+":"+screen.y,
                            new VRScreenObject(this._scene, 
                                screen.x, screen.y, 
                                screen.width, screen.height));
                    }));
                }break;
                case "update":{
                    const screen = this._screens.get(jdata.screen.x+":"+jdata.screen.y);
                    if(screen.ImageStatus === ImageRenderStatus.READY){
                        screen.ImageBuffer = jdata.screen.image;
                    }
                }break;
            }             
        });

 
        // run the main render loop
        engine.runRenderLoop(() => {
            this._screens.forEach((screen)=>{
                screen.update();
            });
            
            this._scene.render();
        });

        this.InitializeVR();
    }

    async InitializeVR(){
        try {
            var defaultXRExperience = await this._scene.createDefaultXRExperienceAsync();
            
        } catch (e) {
            console.log(e);
        }
    }
}

const app = new VRDesktop();