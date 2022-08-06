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


class VRDesktop{

    private _scene: Scene;
    constructor(){
        // create the canvas html element and attach it to the webpage
        let canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
        if(canvas == null) { return; }
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        const img = document.createElement('img') as HTMLImageElement;
        let currentObj = {ready:false, obj:null};

        const client = new WebSocket("wss://"+location.host+"/socket");
        client.addEventListener('open',()=>{
            client.send("HELLO");
        });
        client.addEventListener('message',(msg)=>{
            currentObj.ready = false;
            currentObj.obj = JSON.parse(msg.data);
            img.src = 'data:image/jpeg;base64, ' + currentObj.obj.image;
            
        });
        img.addEventListener('load',()=>{
            currentObj.ready = true;
        })

        // canvas.id = "gameCanvas";
        // document.body.appendChild(canvas);

        // initialize babylon scene and engine
        let engine = new Engine(canvas, true);
        this._scene = new Scene(engine);

        let camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this._scene);
        camera.attachControl(canvas, true);
        let light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), this._scene);
        //var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this._scene);
        let plane1: Mesh = MeshBuilder.CreatePlane("screen1", {size:1}, this._scene);
        plane1.rotate(Axis.Y, Math.PI);

        let dTexture: DynamicTexture = new DynamicTexture("s1", {width:256, height:256}, this._scene);
        let mat: StandardMaterial = new StandardMaterial('m1', this._scene);
        mat.diffuseTexture = dTexture;
        mat.specularColor = new Color3(1,0,0);
        mat.emissiveColor = new Color3(1,0,0);
        mat.ambientColor = new Color3(1,0,0);
        plane1.material = mat;

        let font = "bold 24px monospace";
        dTexture.drawText('WunderVision',0,100,font,'blue','white');
        let ctx = dTexture.getContext();

    
        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        });

        let x =0;
        // run the main render loop
        engine.runRenderLoop(() => {
            
            // x+=0.1;
            // ctx.fillStyle = '#0033ff';
            // ctx.fillRect(x,0,100,100);
            if(currentObj.ready){
                ctx.clearRect(0,0,256,256);
                ctx.drawImage(img, currentObj.obj.x, currentObj.obj.y, 100, 100);
                dTexture.update();
            }
            
            this._scene.render();
            
        });

        this.InitializeVR();
    }

    async InitializeVR(){
        try {
            var defaultXRExperience = await this._scene.createDefaultXRExperienceAsync( /* optional configuration options */ );
        } catch (e) {
            console.log(e);
        }
    }
}

const app = new VRDesktop();