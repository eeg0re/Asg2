class Circle{
    constructor(segments){
        this.type = "circle";
        this.position = [0.0, 0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = segments;
    }

    render(){
        let xy = this.position;
        let rgba = this.color;
        let size = this.size;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        let delta = size/200.0
        let angleStep = 360.0/this.segments;
        for(let angle = 0; angle < 360; angle += angleStep){
            let centerPt = [xy[0], xy[1]];
            let angle1 = angle;
            let angle2 = angle + angleStep;
            let v1 = [(Math.cos(angle1*Math.PI/180)*delta),(Math.sin(angle1*Math.PI/180)*delta)];
            let v2 = [(Math.cos(angle2*Math.PI/180)*delta),(Math.sin(angle2*Math.PI/180)*delta)];
            let point1 = [centerPt[0]+v1[0], centerPt[1]+v1[1]];
            let point2 = [centerPt[0]+v2[0], centerPt[1]+v2[1]];

            drawTriangle([xy[0], xy[1], point1[0], point1[1], point2[0], point2[1]]);
        }
    }
}