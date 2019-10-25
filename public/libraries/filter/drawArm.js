// const Point2D = function (x, y) { this.x = x; this.y = y; };
// const Point3D = function (x, y, z) { this.x = x; this.y = y; this.z = z; };

//Arm is defining the arm to be drawed as the center coordination is (x,y,z) related to the camera=(0,0,0) 
//while the size is the size of the arm in the drawing plane

//Cube is defining the cube to be drawed as the center coordination is (x,y,z) related to the camera=(0,0,0) 
//while the size is the size of the cube in the drawing plane
//axis x from 0 to the right
//axis y from 0 to the up
//axis z from 0 to the outside of the panel
//face[0]=<0,1,2,3> is in anti-clock sequence, which makes the n.p1<0
//same case for face[2] = <1,5,6,2>, face[3]=<3,2,6,7> are all in anti-clock sequence, which makes the n.p1<0
//the other faces are clock wise sequence, which n.p1>0

const Arm = function (x, y, z, sizeW, sizeL, sizeH, name, elementID, rCx, rCy, rCz) {
    Point3D.call(this, x, y, z);
    sizeW *= 0.5;
    sizeL *= 0.5;
    sizeH *= 0.5;
    this.rCx = rCx;
    this.rCy = rCy;
    this.rCz = rCz;
    this.W = sizeW;
    this.L = sizeL;
    this.H = sizeH;
    this.ctX = x;
    this.ctY = y;
    this.ctZ = z + sizeH;
    this.name = name;
    this.elementID = elementID;
    this.last_abs_Yaw = 0;
    this.last_abs_Roll = 0;
    this.last_abs_Pitch = 0;
    this.vertices_origin = [new Point3D(x - sizeW, y - sizeL, z - sizeH),//0
    new Point3D(x + sizeW, y - sizeL, z - sizeH),//1
    new Point3D(x + sizeW, y + sizeL, z - sizeH),//2
    new Point3D(x - sizeW, y + sizeL, z - sizeH),//3
    new Point3D(x - sizeW, y - sizeL, z + sizeH),//4
    new Point3D(x + sizeW, y - sizeL, z + sizeH),//5
    new Point3D(x + sizeW, y + sizeL, z + sizeH),//6
    new Point3D(x - sizeW, y + sizeL, z + sizeH),//7
    new Point3D(x, y, z),//8, add the center as no.9 vertice
    new Point3D(x, y, z - sizeH),//9, add the center of bottom face as no.9 vertice
    new Point3D(x, y, z + sizeH)];//10, add the center of top face as no.10 vertice which will give the 2nd ARM as a rO

    this.vertices = [new Point3D(x - sizeW, y - sizeL, z - sizeH),//0
    new Point3D(x + sizeW, y - sizeL, z - sizeH),//1
    new Point3D(x + sizeW, y + sizeL, z - sizeH),//2
    new Point3D(x - sizeW, y + sizeL, z - sizeH),//3
    new Point3D(x - sizeW, y - sizeL, z + sizeH),//4
    new Point3D(x + sizeW, y - sizeL, z + sizeH),//5
    new Point3D(x + sizeW, y + sizeL, z + sizeH),//6
    new Point3D(x - sizeW, y + sizeL, z + sizeH),//7
    new Point3D(x, y, z),//8, add the center as no.9 vertice
    new Point3D(x, y, z - sizeH),//9, add the center of bottom face as no.9 vertice
    new Point3D(x, y, z + sizeH)];//10, add the center of top face as no.10 vertice which will give the 2nd ARM as a rO

    this.faces = [[0, 1, 2, 3], [0, 4, 5, 1], [1, 5, 6, 2], [3, 2, 6, 7], [0, 3, 7, 4], [4, 7, 6, 5]];
    this.faces_fillstyle = ["#0080f0", "red", "white", "yellow", "green", "black"];
    // this.center = [x, y, z];
};

Arm.prototype = {
    rotateX: function (radian) {
        var cosine = Math.cos(radian);
        var sine = Math.sin(radian);

        for (let index = this.vertices.length - 1; index > -1; --index) {
            let p = this.vertices[index];

            let y = (p.y - this.rCy) * cosine - (p.z - this.rCz) * sine;
            let z = (p.y - this.rCy) * sine + (p.z - this.rCz) * cosine;
            p.y = y + this.rCy;
            p.z = z + this.rCz;
        }

    },
    rotateY: function (radian) {
        var cosine = Math.cos(radian);
        var sine = Math.sin(radian);
        for (let index = this.vertices.length - 1; index > -1; --index) {
            let p = this.vertices[index];

            let x = (p.z - this.rCz) * sine + (p.x - this.rCx) * cosine;
            let z = (p.z - this.rCz) * cosine - (p.x - this.rCx) * sine;
            p.x = x + this.rCx;
            p.z = z + this.rCz;
        }

    },
    rotateZ: function (radian) {
        var cosine = Math.cos(radian);
        var sine = Math.sin(radian);
        for (let index = this.vertices.length - 1; index > -1; --index) {
            let p = this.vertices[index];
            let x = -(p.y - this.rCy) * sine + (p.x - this.rCx) * cosine;
            let y = (p.y - this.rCy) * cosine + (p.x - this.rCx) * sine;

            // let x = (p.y - this.rCy) * sine + (p.x - this.rCx) * cosine;
            // let y = (p.y - this.rCy) * cosine - (p.x - this.rCx) * sine;
            p.x = x + this.rCx;
            p.y = y + this.rCy;
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
            let ox = p.x - this.rCx;
            let oy = p.y - this.rCy;
            let oz = p.z - this.rCz;
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

            q.x = x + this.rCx;
            q.y = y + this.rCy;
            q.z = z + this.rCz;

        }
    }
}

var Px = 00;
var Py = 00;
var Pz = 1000;

function armProject(points3d, width, height) {
    var points2d = new Array(points3d.length);
    var focal_length = 200;


    for (let index = points3d.length - 1; index > -1; --index) {
        let p = points3d[index];
        // let x = (p.x * (focal_length / p.z) + width * 0.5);
        // let y = (p.y * (focal_length / p.z) + height * 0.5);

        let x = (Px * p.z - p.x * Pz) / (p.z - Pz) + width * 0.5;
        let y = (Py * p.z - p.y * Pz) / (p.z - Pz) + height * 0.5;

        points2d[index] = new Point2D(x, y);
    }
    return points2d;
}


function armLoop(Yaw = 0.000, Pitch = 0.000, Roll = 0.000, arm, imuAngle) {
    // window.requestAnimationFrame(loop);
    // initDraw(arm);
    var canvas = document.getElementById(arm.elementID);
    var context = canvas.getContext("2d");
    var height = canvas.clientHeight;
    var width = canvas.clientWidth;

    startX = 0;
    startY = 0;
    context.canvas.height = height;
    context.canvas.width = width;
    context.fillStyle = "#ffffff";
    context.fillRect(startX, startY, width, height);
    context.strokeStyle = "#000000";

    context.fillStyle = "black";
    context.font = "20px Arial";
    context.fillText(arm.name, 0, 30);

    context.fillStyle = "blue";
    context.font = "25px Arial";
    // let outp = 'P>' + imuAngle.eurla_pitch_Angle + '/ R>' + imuAngle.eurla_roll_Angle + '/ Y>' + imuAngle.eurla_yaw_Angle;
    // context.fillText(outp, 0, 50);
    let outp = 'P>' + imuAngle.eurla_pitch_Angle;
    //  + '/ R>' + imuAngle.eurla_roll_Angle + '/ Y>' + imuAngle.eurla_yaw_Angle;
    context.fillText(outp, 0, 50);
    let outr = 'R>' + imuAngle.eurla_roll_Angle;
    context.fillText(outr, 0, 70);
    let outy = 'Y>' + imuAngle.eurla_yaw_Angle;
    context.fillText(outy, 0, 90);

    let centerX = width * 0.5;
    let centerY = height * 0.5;

    context.beginPath();
    context.moveTo(centerX - 5, centerY);
    context.lineTo(centerX + 5, centerY);
    context.moveTo(centerX, centerY - 5);
    context.lineTo(centerX, centerY + 5);
    // context.moveTo(centerX, centerY);
    // context.lineTo(arm.x, arm.y);
    context.closePath();
    context.stroke();

    // let nYaw = recalculate(-imuAngle.eurla_yaw + arm.last_abs_Yaw);
    // let nPitch = recalculate(-imuAngle.eurla_pitch + arm.last_abs_Pitch);
    // let nRoll = recalculate(-imuAngle.eurla_roll + arm.last_abs_Roll);

    // console.log(nYaw, nPitch, nRoll, "~", Yaw, Pitch, Roll);

    // arm.last_abs_Pitch = imuAngle.eurla_pitch;
    // arm.last_abs_Roll = imuAngle.eurla_roll;
    // arm.last_abs_Yaw = imuAngle.eurla_yaw;

    // let nYaw = recalculate(Yaw);
    // let nPitch = recalculate(Pitch);
    // let nRoll = recalculate(Roll);

    //aligned with motion sensors for below
    // arm.rotateZ(nYaw);
    // arm.rotateX(nPitch);
    // arm.rotateY(nRoll);

    //here below is using the absolute angle to make cube/arms to make sure the position showed are inline with the current angle calculated by fusion
    //the previous method (above) is using delta angle to make the draw which may accumulate the integraion erros!
    let nYaw = recalculate(-imuAngle.eurla_yaw);
    let nPitch = recalculate(-imuAngle.eurla_pitch);
    let nRoll = recalculate(-imuAngle.eurla_roll);
    arm.rotateXYZ(nYaw, nRoll, nPitch);

    var vertices = armProject(arm.vertices, width, height);

    for (let index = arm.faces.length - 1; index > -1; --index) {
        let face = arm.faces[index];
        let p1 = arm.vertices[face[0]];
        let p2 = arm.vertices[face[1]];
        let p3 = arm.vertices[face[2]];
        // let v1 = new Point3D(p2.x, p2.y, p2.z);
        // let v2 = new Point3D(p3.x, p3.y, p3.z);

        let v1 = new Point3D(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
        // let v2 = new Point3D(-p3.x + p1.x, -p3.y + p1.y, -p3.z + p1.z);
        // let v1 = new Point3D(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
        let v2 = new Point3D(p3.x - p1.x, p3.y - p1.y, p3.z - p1.z);
        let n = new Point3D(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);

        let ndotp1 = ((p1.x - Px) * n.x + (p1.y - Py) * n.y + (p1.z - Pz) * n.z);
        //(p1-(0,0,500)).n
        //(notice: the displace space pO is (0,0,0), while the cube created along bO(0,0,bCz), and (p1-(0,0,H*10+1)) is definitely from outside the arm. so that the ndotp1 may turn negative)

        if (ndotp1 > 0) {
            // if (((p1.x - arm.vertices[8].x) * n.x + (p1.y - arm.vertices[8].y) * n.y + (p1.z - arm.vertices[8].z) * n.z) > 0) {
            context.fillStyle = arm.faces_fillstyle[index];
            context.beginPath();
            context.moveTo(vertices[face[0]].x, vertices[face[0]].y);
            context.lineTo(vertices[face[1]].x, vertices[face[1]].y);
            context.lineTo(vertices[face[2]].x, vertices[face[2]].y);
            context.lineTo(vertices[face[3]].x, vertices[face[3]].y);
            context.closePath();
            context.fill();
            // context.stroke();

            context.beginPath();
            context.moveTo(vertices[9].x, vertices[9].y);
            context.lineTo(vertices[8].x, vertices[8].y);
            context.closePath();
            context.stroke();
        }
    }

}
