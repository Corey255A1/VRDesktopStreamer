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
    Color3,
    ICanvasRenderingContext
} from "babylonjs";
export enum ImageRenderStatus {READY, DECODING, DECODED }
export class VRScreenObject{


    private _image_element:HTMLImageElement;
    private _status:ImageRenderStatus;
    private _scene:Scene;
    private _x:number;
    private _y:number;
    private _width:number;
    private _height:number;
    
    private _context:ICanvasRenderingContext;
    private _texture:DynamicTexture;
    private _mesh:Mesh;

    constructor(scene:Scene, x:number, y:number, width:number, height:number){
        this._image_element = document.createElement('img') as HTMLImageElement;
        
        this._status = ImageRenderStatus.READY;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._scene = scene;
        
        this._image_element.addEventListener('load',()=>{
            this._status = ImageRenderStatus.DECODED;
        });

        const scaledWidth = this._width/500;
        const scaledHeight = this._height/500;

        this._mesh = MeshBuilder.CreatePlane("screen1", {width:scaledWidth, height:scaledHeight}, this._scene);
        this._mesh.rotate(Axis.Y, Math.PI);
        this._mesh.position.x = -(this._x/500);
        this._mesh.position.y = 2;


        this._texture = new DynamicTexture("stexture:" + this._x + ":" + this._y, {width:1920, height:1080}, this._scene);
        const material: StandardMaterial = new StandardMaterial('smaterial:'+ this._x + ":" + this._y, this._scene);
        material.diffuseTexture = this._texture;
        material.specularColor = new Color3(1,1,1);
        material.emissiveColor = new Color3(1,1,1);
        material.ambientColor = new Color3(1,1,1);
        this._mesh.material = material;
        const font = "bold 24px monospace";
        this._texture.drawText('WunderVision',0,100,font,'blue','white');
        this._context = this._texture.getContext();
    }

    get Mesh():Mesh{
        return this._mesh;
    }

    get ImageStatus():ImageRenderStatus{
        return this._status;
    }

    set ImageBuffer(base64Image:string){
        this._image_element.src = 'data:image/jpeg;base64, ' + base64Image;
        this._status = ImageRenderStatus.DECODING;
    }

    update(){
        if(this._status != ImageRenderStatus.DECODED){ return; }

        this._context.clearRect(0,0,1920,1080);
        this._context.drawImage(this._image_element, 0, 0, 1920, 1080);
        this._texture.update();
        this._status = ImageRenderStatus.READY
    }

}