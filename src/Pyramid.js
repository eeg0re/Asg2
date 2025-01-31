class Pyramid{
    constructor(){
        this.name = "Pyramid";
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }
    render(){
        let rgba = this.color;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // darker shaded color for bottom of Pyramid
        gl.uniform4f(u_FragColor, rgba[0] * 0.6, rgba[1] * 0.6, rgba[2] * 0.6, rgba[3]);

        // bottom of Pyramid
        drawTriangle3D([0,0,0, 1,0,0, 1,0,1]);
        drawTriangle3D([0,0,0, 0,0,1, 1,0,1]);

        // color for front of Pyramid
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // front of Pyramid
        drawTriangle3D([0.5,1,0.5, 0,0,0, 1,0,0]);
        
        // shaded color for right/left side of Pyramid
        gl.uniform4f(u_FragColor, rgba[0] * 0.3, rgba[1] * 0.3, rgba[2] * 0.3, rgba[3]);
        drawTriangle3D([0.5,1,0.5, 0,0,1, 1,0,1]);      // right side
        gl.uniform4f(u_FragColor, rgba[0] * 0.5, rgba[1] * 0.5, rgba[2] * 0.5, rgba[3]);
        drawTriangle3D([0.5,1,0.5, 1,0,1, 1,0,0]);    // left side
        

        // back of Pyramid
        gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
        drawTriangle3D([0.5,1,0.5, 0,0,0, 0,0,1]);

    }

}