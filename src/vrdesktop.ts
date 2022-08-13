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

        const leftImage = document.createElement('img') as HTMLImageElement;
        const rightImage = document.createElement('img') as HTMLImageElement;
        let leftScreen = {status:0, obj:null};
        let rightScreen = {status:0, obj:null};

        const client = new WebSocket("wss://"+location.host+"/socket");
        client.addEventListener('open',()=>{
            client.send("HELLO");
        });
        client.addEventListener('message',(msg)=>{
            
            const jdata = JSON.parse(msg.data);
            try{
                if(jdata.x < 0 && leftScreen.status === 0){
                    leftScreen.obj = jdata;
                    leftImage.src = 'data:image/jpeg;base64, ' + leftScreen.obj.image;
                    leftScreen.status = 1;
                    //leftImage.decode().then(()=>{leftScreen.status = 2}).catch(()=>{leftScreen.status = 0});
                }else if(jdata.x >= 0 && rightScreen.status === 0){
                    rightScreen.obj = jdata;
                    rightImage.src = 'data:image/jpeg;base64, ' + rightScreen.obj.image;
                    rightScreen.status = 1;
                    //rightImage.decode().then(()=>{rightScreen.status = 2}).catch(()=>{rightScreen.status = 0});
                }       
            }catch(e){

            }
             
        });
        leftImage.addEventListener('load',()=>{
            leftScreen.status = 2;
        });
        rightImage.addEventListener('load',()=>{
            rightScreen.status = 2;
        });

        // canvas.id = "gameCanvas";
        // document.body.appendChild(canvas);

        // initialize babylon scene and engine
        let engine = new Engine(canvas, true);
        this._scene = new Scene(engine);

        let camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this._scene);
        camera.attachControl(canvas, true);
        camera.target.y = 2;
        let light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), this._scene);
        //var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this._scene);
        let leftPlane: Mesh = MeshBuilder.CreatePlane("screen1", {width:1.9*2, height:2.1}, this._scene);
        leftPlane.rotate(Axis.Y, Math.PI);
        leftPlane.position.y = 2;
        leftPlane.position.x = 1.9;
        let rightPlane: Mesh = MeshBuilder.CreatePlane("screen2", {width:1.9*2, height:2.1}, this._scene);
        rightPlane.rotate(Axis.Y, Math.PI);
        rightPlane.position.y = 2;
        rightPlane.position.x = -1.9;

        let leftTexture: DynamicTexture = new DynamicTexture("s1", {width:1920, height:1080}, this._scene);
        let rightTexture: DynamicTexture = new DynamicTexture("s2", {width:1920, height:1080}, this._scene);
        let mat1: StandardMaterial = new StandardMaterial('m1', this._scene);
        let mat2: StandardMaterial = new StandardMaterial('m2', this._scene);
        mat1.diffuseTexture = leftTexture;
        mat1.specularColor = new Color3(1,1,1);
        mat1.emissiveColor = new Color3(1,1,1);
        mat1.ambientColor = new Color3(1,1,1);
        leftPlane.material = mat1;

        mat2.diffuseTexture = rightTexture;
        mat2.specularColor = new Color3(1,1,1);
        mat2.emissiveColor = new Color3(1,1,1);
        mat2.ambientColor = new Color3(1,1,1);
        rightPlane.material = mat2;

        const font = "bold 24px monospace";
        leftTexture.drawText('WunderVision',0,100,font,'blue','white');
        const leftContext = leftTexture.getContext();
        rightTexture.drawText('WunderVision',0,100,font,'blue','white');
        const rightContext = rightTexture.getContext();

    
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
            if(leftScreen.status === 2){
                leftContext.clearRect(0,0,1920,1080);
                leftContext.drawImage(leftImage, 0, 0, 1920, 1080);
                leftTexture.update();
                leftScreen.status = 0;
            }
            if(rightScreen.status === 2){
                rightContext.clearRect(0,0,1920,1080);
                rightContext.drawImage(rightImage, 0, 0, 1920, 1080);
                rightTexture.update();
                rightScreen.status = 0;
            }
            
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