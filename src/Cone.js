class Cone {
    constructor(segments){
        this.type = "cone";
        this.position = [0.0, 0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 10.0;
        this.segments = 8;
        this.matrix = new Matrix4();
        this.matrix.setRotate(270, 1, 0, 0);
    }

    render(){
        let xyz = this.position;
        let rgba = this.color;
        let size = this.size;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        let delta = size/200.0
        let angleStep = 360.0/this.segments;
        for(let angle = 0; angle < 360; angle += angleStep){
            let centerPt = [xyz[0], xyz[1], xyz[2]];
            let angle1 = angle;
            let angle2 = angle + angleStep;
            let v1 = [(Math.cos(angle1*Math.PI/180)*delta),(Math.sin(angle1*Math.PI/180)*delta)];
            let v2 = [(Math.cos(angle2*Math.PI/180)*delta),(Math.sin(angle2*Math.PI/180)*delta)];
            let point1 = [centerPt[0]+v1[0], centerPt[1]+v1[1], centerPt[2]]; // MIGHT NEED TO CHANGE THIS
            let point2 = [centerPt[0]+v2[0], centerPt[1]+v2[1], centerPt[2]];

            gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
            drawTriangle3D([xyz[0], xyz[1], xyz[2], point1[0], point1[1], point1[2], point2[0], point2[1], point2[2]]); // circular base
            
            gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
            drawTriangle3D([xyz[0], xyz[1], xyz[2]+0.5, point1[0], point1[1], point1[2], point2[0], point2[1], point2[2]]);

        }
    }



}