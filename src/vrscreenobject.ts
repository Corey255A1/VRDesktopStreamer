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
export class Region{
    public Left:number;
    public Top:number;
    public Width:number;
    public Height:number;
    constructor(x:number, y:number, width:number, height:number){
        this.Left = x;
        this.Top = y;
        this.Width = width;
        this.Height = height;
    }
    get Right():number{
        return this.Left + this.Width;
    }
    get Bottom():number{
        return this.Top + this.Height;
    }
    public InRegion(x:number, y:number):boolean{
        return (x >= this.Left && x <= this.Right && y >= this.Top && y <= this.Bottom);
    }
}
export class VRScreenObject{


    private _image_element:HTMLImageElement;
    private _status:ImageRenderStatus;
    private _scene:Scene;
    private _screen_region:Region;
    private _image_update_region:Region;
    
    private _context:ICanvasRenderingContext;
    private _texture:DynamicTexture;
    private _mesh:Mesh;

    constructor(scene:Scene, x:number, y:number, width:number, height:number){
        this._image_element = document.createElement('img') as HTMLImageElement;
        
        this._status = ImageRenderStatus.READY;
        this._screen_region = new Region(x,y,width,height);
        this._image_update_region = new Region(0,0,0,0);
        this._scene = scene;
        
        this._image_element.addEventListener('load',()=>{
            this._status = ImageRenderStatus.DECODED;
        });

        const scaledWidth = this.Width/500;
        const scaledHeight = this.Height/500;

        this._mesh = MeshBuilder.CreatePlane("screen1", {width:scaledWidth, height:scaledHeight}, this._scene);
        this._mesh.rotate(Axis.Y, Math.PI);
        this._mesh.position.x = -(this.X/500);
        this._mesh.position.y = 2;


        this._texture = new DynamicTexture("stexture:" + this.X + ":" + this.Y, {width:this.Width, height:this.Height}, this._scene);
        const material: StandardMaterial = new StandardMaterial('smaterial:'+ this.X + ":" + this.Y, this._scene);
        material.diffuseTexture = this._texture;
        material.specularColor = new Color3(1,1,1);
        material.emissiveColor = new Color3(1,1,1);
        material.ambientColor = new Color3(1,1,1);
        this._mesh.material = material;
        const font = "bold 24px monospace";
        this._texture.drawText('WunderVision',0,100,font,'blue','white');
        this._context = this._texture.getContext();
    }

    get X(){ return this._screen_region.Left }
    get Y(){ return this._screen_region.Top }
    get Width(){ return this._screen_region.Width }
    get Height(){ return this._screen_region.Height }

    get Mesh():Mesh{
        return this._mesh;
    }

    get ImageStatus():ImageRenderStatus{
        return this._status;
    }

    updateImageBuffer(x:number, y:number, width:number, height:number, base64Image:string){
        this._image_element.src = 'data:image/jpeg;base64, ' + base64Image;
        this._image_update_region.Left = x - this.X;
        this._image_update_region.Top = y - this.Y;
        this._image_update_region.Width = width;
        this._image_update_region.Height = height;
        this._status = ImageRenderStatus.DECODING;
    }

    update(){
        if(this._status != ImageRenderStatus.DECODED){ return; }

        this._context.clearRect(
            this._image_update_region.Left,
            this._image_update_region.Top,
            this._image_update_region.Width,
            this._image_update_region.Height
        );
        this._context.drawImage(
            this._image_element, 
            this._image_update_region.Left,
            this._image_update_region.Top,
            this._image_update_region.Width,
            this._image_update_region.Height
        );
        this._texture.update();
        this._status = ImageRenderStatus.READY
    }

}