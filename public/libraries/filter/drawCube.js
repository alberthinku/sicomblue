const Point2D = function (x, y) { this.x = x; this.y = y; };
const Point3D = function (x, y, z) { this.x = x; this.y = y; this.z = z; };

//Cube is defining the cube to be drawed as the center coordination is (x,y,z) related to the camera=(0,0,0) 
//while the size is the size of the cube in the drawing plane
//axis x from 0 to the right
//axis y from 0 to the up
//axis z from 0 to the outside of the panel
//face[0]=<0,1,2,3> is in anti-clock sequence, which makes the n.p1<0
//same case for face[2] = <1,5,6,2>, face[3]=<3,2,6,7> are all in anti-clock sequence, which makes the n.p1<0
//the other faces are clock wise sequence, which n.p1>0
const Cube = function (x, y, z, size, name, elementID) {
    Point3D.call(this, x, y, z);
    size *= 0.5;
    this.name = name;
    this.elementID = elementID;
    this.vertices_origin = [new Point3D(x - size, y - size, z - size),//0 ---
    new Point3D(x + size, y - size, z - size),//1 +--
    new Point3D(x + size, y + size, z - size),//2 ++-
    new Point3D(x - size, y + size, z - size),//3 -+-
    new Point3D(x - size, y - size, z + size),//4 --+
    new Point3D(x + size, y - size, z + size),//5 +-+
    new Point3D(x + size, y + size, z + size),//6 +++
    new Point3D(x - size, y + size, z + size)];//7 -++

    this.vertices = [new Point3D(x - size, y - size, z - size),//0 ---
    new Point3D(x + size, y - size, z - size),//1 +--
    new Point3D(x + size, y + size, z - size),//2 ++-
    new Point3D(x - size, y + size, z - size),//3 -+-
    new Point3D(x - size, y - size, z + size),//4 --+
    new Point3D(x + size, y - size, z + size),//5 +-+
    new Point3D(x + size, y + size, z + size),//6 +++
    new Point3D(x - size, y + size, z + size)];//7 -++
    this.faces = [[0, 1, 2, 3], [0, 4, 5, 1], [1, 5, 6, 2], [3, 2, 6, 7], [0, 3, 7, 4], [4, 7, 6, 5]];
    this.faces_fillstyle = ["#0080f0", "red", "white", "yellow", "green", "black"];
};
Cube.prototype = {
    rotateX: function (radian) {
        var cosine = Math.cos(radian);
        var sine = Math.sin(radian);
        for (let index = this.vertices.length - 1; index > -1; --index) {
            let p = this.vertices[index];
            // let y = (p.y - this.y) * cosine - (p.z - this.z) * sine;
            // let z = (p.y - this.y) * sine + (p.z - this.z) * cosine;
            let y = (p.y - this.y) * cosine - (p.z - this.z) * sine;
            let z = (p.y - this.y) * sine + (p.z - this.z) * cosine;
            p.y = y + this.y;
            p.z = z + this.z;
        }
    },
    rotateY: function (radian) {
        var cosine = Math.cos(radian);
        var sine = Math.sin(radian);
        for (let index = this.vertices.length - 1; index > -1; --index) {
            let p = this.vertices[index];
            // let x = (p.z - this.z) * sine + (p.x - this.x) * cosine;
            // let z = (p.z - this.z) * cosine - (p.x - this.x) * sine;
            let x = (p.z - this.z) * sine + (p.x - this.x) * cosine;
            let z = (p.z - this.z) * cosine - (p.x - this.x) * sine;
            p.x = x + this.x;
            p.z = z + this.z;
        }
    },
    rotateZ: function (radian) {
        var cosine = Math.cos(radian);
        var sine = Math.sin(radian);
        for (let index = this.vertices.length - 1; index > -1; --index) {
            let p = this.vertices[index];
            // let x = (p.y - this.y) * sine + (p.x - this.x) * cosine;
            // let y = (p.y - this.y) * cosine - (p.x - this.x) * sine;
            let x = -(p.y - this.y) * sine + (p.x - this.x) * cosine;
            let y = (p.y - this.y) * cosine + (p.x - this.x) * sine;

            p.x = x + this.x;
            p.y = y + this.y;
        }
    },
    rotateXYZ: function (Yaw, Pitch, Roll) {
        let cosineYaw = Math.cos(Yaw);
        let sinYaw = Math.sin(Yaw);
        let cosinePitch = Math.cos(Pitch);
        let sinPitch = Math.sin(Pitch);
        let cosineRoll = Math.cos(Roll);
        let sinRoll = Math.sin(Roll);
        for (let index = this.vertices.length - 1; index > -1; --index) {
            let p = this.vertices_origin[index];
            let q = this.vertices[index];
            let ox = p.x - this.x;
            let oy = p.y - this.y;
            let oz = p.z - this.z;
            let x = -oy * sinYaw + ox * cosineYaw;
            let y = oy * cosineYaw + ox * sinYaw;

            ox = x;
            let z = oz * cosineRoll - ox * sinRoll;

            x = oz * sinRoll + ox * cosineRoll;
            oy = y;

            oz = z;

            y = oy * cosinePitch - oz * sinPitch;
            z = oy * sinPitch + oz * cosinePitch;
            // x = (p.z - this.z) * sinRoll + (p.x - this.x) * cosineRoll;
            // y = (p.y - this.y) * cosinePitch - (p.z - this.z) * sinPitch;
            // z = (p.y - this.y) * sinPitch + (p.z - this.z) * cosinePitch;

            q.x = x + this.x;
            q.y = y + this.y;
            q.z = z + this.z;

        }

    }
};

var Pcx = 00;
var Pcy = 00;
var Pcz = -400;

function project(points3d, width, height) {
    var points2d = new Array(points3d.length);
    var focal_length = 200;
    // let Pcx = 00;
    // let Pcy = 00;
    // let Pcz = 1000;

    for (let index = points3d.length - 1; index > -1; --index) {
        let p = points3d[index];
        // let x = p.x * (focal_length / p.z) + width * 0.5;
        // let y = p.y * (focal_length / p.z) + height * 0.5;

        let x = (Pcx * p.z - p.x * Pcz) / (p.z - Pcz) + width * 0.5;
        let y = (Pcy * p.z - p.y * Pcz) / (p.z - Pcz) + height * 0.5;

        points2d[index] = new Point2D(x, y);
    }
    return points2d;
}

function recalculate(angle) {

    if (isNaN(angle)) return 0;

    if (Math.abs(angle) <= Math.PI) {
        return angle;
    };

    if (angle < 0) return (angle + 2 * Math.PI);
    else return (angle - 2 * Math.PI);
}

function loop(Yaw = 0.000, Pitch = 0.000, Roll = 0.000, cube, imuAngle) {
    // window.requestAnimationFrame(loop);
    // initDraw(cube);
    var canvas = document.getElementById(cube.elementID);
    var context = canvas.getContext("2d");
    var height = canvas.clientHeight;
    var width = canvas.clientWidth;



    startX = 0;
    startY = 0;
    // height = canvas.clientHeight;
    // width = canvas.clientWidth;
    // if (cube.x > 0) { startX = width; }
    context.canvas.height = height;
    context.canvas.width = width;
    context.fillStyle = "#ffffff";
    context.fillRect(startX, startY, width, height);
    context.strokeStyle = "#000000";

    context.fillStyle = "black";
    context.font = "20px Arial";
    context.fillText(cube.name, 0, 30);

    context.fillStyle = "blue";
    context.font = "25px Arial";
    let outp = 'P>' + imuAngle.eurla_pitch_Angle + '/ R>' + imuAngle.eurla_roll_Angle + '/ Y>' + imuAngle.eurla_yaw_Angle;
    context.fillText(outp, 0, 50);
    if (imuAngle.eurla_pitch_Angle == 0 && imuAngle.eurla_roll_Angle == 0 && imuAngle.eurla_yaw_Angle == 0) {
        context.fillStyle = "red";
        context.fillText("calibrating ... please wait...", width / 2, height / 2);
    }


    let nYaw, nPitch, nRoll;
    // let nYaw = recalculate(-imuAngle.eurla_yaw + cube.last_abs_Yaw);
    // let nPitch = recalculate(-imuAngle.eurla_pitch + cube.last_abs_Pitch);
    // let nRoll = recalculate(-imuAngle.eurla_roll + cube.last_abs_Roll);

    // console.log(nYaw, nPitch, nRoll, "~", Yaw, Pitch, Roll);

    // cube.last_abs_Pitch = imuAngle.eurla_pitch;
    // cube.last_abs_Roll = imuAngle.eurla_roll;
    // cube.last_abs_Yaw = imuAngle.eurla_yaw;

    // let nYaw = recalculate(Yaw);
    // let nPitch = recalculate(Pitch);
    // let nRoll = recalculate(Roll);

    //aligned with motion sensors for below
    // cube.rotateZ(nYaw);
    // cube.rotateX(nPitch);
    // cube.rotateY(nRoll);

    // cube.rotateXYZ(nYaw, nRoll, nPitch);
    if (!armsEnabled) {
        nYaw = recalculate(-imuAngle.eurla_yaw);
        nPitch = recalculate(-imuAngle.eurla_pitch);
        nRoll = recalculate(-imuAngle.eurla_roll);
        cube.rotateXYZ(nYaw, nRoll, nPitch);

    } else {
        // nYaw = recalculate(-imuAngle.eurla_yaw + cube.last_abs_Yaw);
        // nPitch = recalculate(-imuAngle.eurla_pitch + cube.last_abs_Pitch);
        // nRoll = recalculate(-imuAngle.eurla_roll + cube.last_abs_Roll);
        // cube.last_abs_Pitch = imuAngle.eurla_pitch;
        // cube.last_abs_Roll = imuAngle.eurla_roll;
        // cube.last_abs_Yaw = imuAngle.eurla_yaw;
        nYaw = recalculate(Yaw);
        nPitch = recalculate(Pitch);
        nRoll = recalculate(Roll);

        cube.rotateZ(nYaw);
        cube.rotateX(nPitch);
        cube.rotateY(nRoll);
    };




    var vertices = project(cube.vertices, width, height);
    for (let index = cube.faces.length - 1; index > -1; --index) {
        let face = cube.faces[index];
        let p1 = cube.vertices[face[0]];
        let p2 = cube.vertices[face[1]];
        let p3 = cube.vertices[face[2]];
        let v1 = new Point3D(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
        let v2 = new Point3D(p3.x - p1.x, p3.y - p1.y, p3.z - p1.z);
        let n = new Point3D(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
        //n = v1 x v2
        let ndotp1 = ((p1.x - Pcx) * n.x + (p1.y - Pcy) * n.y + (p1.z - Pcz) * n.z);
        if (ndotp1 > 0) {
            // if p1.n>0 
            //(notice: the displace space pO is (0,0,0), while the cube created along bO(0,0,400), so that the p1.n may turn negative)

            // if (n.z >= 0) {

            context.fillStyle = cube.faces_fillstyle[index];
            context.beginPath();
            context.moveTo(vertices[face[0]].x, vertices[face[0]].y);
            context.lineTo(vertices[face[1]].x, vertices[face[1]].y);
            context.lineTo(vertices[face[2]].x, vertices[face[2]].y);
            context.lineTo(vertices[face[3]].x, vertices[face[3]].y);
            context.closePath();
            context.fill();
            context.stroke();

        }
    }
}
