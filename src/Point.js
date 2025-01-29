class Point{
    constructor(){
        this.type = "point";
        this.position = [0.0, 0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
    }

    render(){
        let xy = this.position;
        let rgba = this.color;
        let size = this.size;

        gl.disableVertexAttribArray(a_Position);

        // pass attributes from this shape to GL
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_Size, size);

        // draw
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}