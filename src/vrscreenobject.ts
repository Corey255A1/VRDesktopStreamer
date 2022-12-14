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

export class ImageRegion extends Region{
    private _element:HTMLImageElement;
    private _status:ImageRenderStatus;

    constructor(){
        super(0,0,0,0);
        this._element = document.createElement('img') as HTMLImageElement;
        this._status = ImageRenderStatus.READY;
        this._element.addEventListener('load',()=>{
            this._status = ImageRenderStatus.DECODED;
        });
    }

    public get Image():HTMLImageElement{
        return this._element;
    }

    public get Status():ImageRenderStatus{
        return this._status;
    }

    public Reset(){
        this._status = ImageRenderStatus.READY;
    }

    public UpdateImageBuffer(x:number, y:number, width:number, height:number, base64Image:string){
        this._element.src = 'data:image/jpeg;base64, ' + base64Image;
        this.Left = x;
        this.Top = y;
        this.Width = width;
        this.Height = height;
        this._status = ImageRenderStatus.DECODING;
    }

}

export class VRScreenObject{

    private _image_update_buffer:Array<ImageRegion>;
    private _image_update_pending:Array<ImageRegion>;
    private _scene:Scene;
    private _screen_region:Region;
    private _image_update_region:Region;
    
    private _context:ICanvasRenderingContext;
    private _texture:DynamicTexture;
    private _mesh:Mesh;

    constructor(scene:Scene, x:number, y:number, width:number, height:number){       
        
        this._screen_region = new Region(x,y,width,height);
        this._image_update_region = new Region(0,0,0,0);
        this._scene = scene;
        this._image_update_pending = new Array<ImageRegion>();
        this._image_update_buffer = new Array<ImageRegion>();
        for(let i=0;i<100;i++){
            this._image_update_buffer.push(new ImageRegion());
        }

        const scaledWidth = this.Width/500;
        const scaledHeight = this.Height/500;

        //Plane Mesh
        //Size the width and height of the mesh, scaled to the actual pixels
        // this._mesh = MeshBuilder.CreatePlane("screen1", {width:scaledWidth, height:scaledHeight}, this._scene);
        // this._mesh.rotate(Axis.Y, Math.PI);
        // this._mesh.position.x = -(this.X/500);
        // this._mesh.position.y = 2;


        //Arch Mesh
        //Calculate the curve segment length
        //Full Circle 1920*4 = 7680
        //20 Segments for full circle
        //1920/5
        const segment_start = Math.round((this.X / 7680)*20);
        const segment_end = Math.round(((this.X+this.Width) / 7680)*20)
        const screen_arc = [];
        for(let i=segment_start;i<=segment_end; i++){
            screen_arc.push(new Vector3(Math.cos(i*Math.PI/10), Math.sin(i*Math.PI/10),0));
        }
    
        const extrusion_path = [
                new Vector3(0, 0, 0),
                new Vector3(0, this.Height/this.Width, 0),
        ];
        
        
        this._mesh = MeshBuilder.ExtrudeShape("screen", {shape: screen_arc, path: extrusion_path, sideOrientation: BABYLON.Mesh.BACKSIDE}, this._scene);
        this._mesh.position.y = -(this.Height/this.Width/2);



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

    updateImageBuffer(x:number, y:number, width:number, height:number, base64Image:string){
        let image = this._image_update_buffer.pop();
        image.UpdateImageBuffer(x,y,width,height,base64Image);
        this._image_update_pending.push(image);
    }

    update(){
        // this._context.clearRect(
        //     this._image_update_region.Left,
        //     this._image_update_region.Top,
        //     this._image_update_region.Width,
        //     this._image_update_region.Height
        // );
        for(let i=0; i<this._image_update_pending.length; i++){
            let img = this._image_update_pending[i];
            if(img.Status == ImageRenderStatus.DECODED){
                this._context.drawImage(
                    img.Image, 
                    img.Left,
                    img.Top,
                    img.Width,
                    img.Height
                );
                img.Reset();
                this._image_update_pending.splice(i,1);
                this._image_update_buffer.push(img);
            }
        }

        this._texture.update();
    }

}