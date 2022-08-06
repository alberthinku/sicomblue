
const tofModel = function (x, y, z, verts) {
    Point3D.call(this, x, y, z);
    // Point3Ds.call(this, verts);


    this.name = "tofModeling";
    this.last_abs_Yaw = 0;
    this.last_abs_Roll = 0;
    this.last_abs_Pitch = 0;

    this.vertices_origin = verts;

    this.vertices = new Point3Ds(verts);

    // this.faces = [[0, 1, 2, 3], [0, 4, 5, 1], [1, 5, 6, 2], [3, 2, 6, 7], [0, 3, 7, 4], [4, 7, 6, 5]];
    // this.faces_fillstyle = ["#0080f0", "red", "white", "yellow", "green", "black"];
};

tofModel.prototype = {
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
        // let p;
        for (let index = this.vertices.length - 1; index > -1; --index) {
            // let p = this.vertices_origin[index];
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

            // this.vertices[index] = q;
            // console.log(q, this.vertices[index]);

        }

    }
};

var Pcx = -2000;
var Pcy = -1000;
var Pcz = -2000;

function projecttofModel(points3d, width, height) {
    var points2d = new Array(points3d.length);
    var focal_length = 200;
    let scale = 3;
    // let Pcx = 00;
    // let Pcy = 00;
    // let Pcz = 1000;

    for (let index = points3d.length - 1; index > -1; --index) {
        let p = points3d[index];
        // let x = p.x * (focal_length / p.z) + width * 0.5;
        // let y = p.y * (focal_length / p.z) + height * 0.5;

        let x = scale * (Pcx * p.z - p.x * Pcz) / (p.z - Pcz) + width * 0.5;
        let y = scale * (Pcy * p.z - p.y * Pcz) / (p.z - Pcz) + height * 0.5;

        points2d[index] = new Point2D(x, y);
    }
    return points2d;
}

function recalculatetofModel(angle) {

    if (isNaN(angle)) return 0;

    if (Math.abs(angle) <= Math.PI) {
        return angle;
    };

    if (angle < 0) return (angle + 2 * Math.PI);
    else return (angle - 2 * Math.PI);
}

function looptof(Yaw = 0.000, Pitch = 0.000, Roll = 0.000, tof, imuAngle, is9Axis = false) {

    // var canvas = document.getElementById(tof.elementID);
    let canvasName = "tofModeldraw";
    if (is9Axis) canvasName += "_9AxisFusion"
    var canvas = document.getElementById(canvasName);

    canvas.hidden = false;
    var context = canvas.getContext("2d");
    var height = canvas.clientHeight;
    var width = canvas.clientWidth;



    startX = 0;
    startY = 0;
    // height = canvas.clientHeight;
    // width = canvas.clientWidth;
    // if (tof.x > 0) { startX = width; }
    context.canvas.height = height;
    context.canvas.width = width;
    context.fillStyle = "#ffffff";
    context.fillRect(startX, startY, width, height);
    context.strokeStyle = "#000000";

    context.fillStyle = "black";
    context.font = "20px Arial";
    context.fillText(canvasName, 0, 30);
    // context.fillText("tofModeling", 0, 30);

    context.fillStyle = "blue";
    context.font = "25px Arial";
    let outp = 'P>' + imuAngle.eurla_pitch_Angle;
    //  + '/ R>' + imuAngle.eurla_roll_Angle + '/ Y>' + imuAngle.eurla_yaw_Angle;
    context.fillText(outp, 0, 50);
    let outr = 'R>' + imuAngle.eurla_roll_Angle;
    context.fillText(outr, 0, 70);
    let outy = 'Y>' + imuAngle.eurla_yaw_Angle;
    context.fillText(outy, 0, 90);
    let outcount = 'points scanned>' + tof.vertices.length;
    context.fillText(outcount, 0, 200);

    if (imuAngle.eurla_pitch_Angle == 0 && imuAngle.eurla_roll_Angle == 0 && imuAngle.eurla_yaw_Angle == 0) {
        context.fillStyle = "red";
        context.fillText("calibrating ... please wait...", width / 2, height / 2);
    }


    // let nYaw, nPitch, nRoll;
    // let nYaw = recalculatetofModel(-imuAngle.eurla_yaw + tof.last_abs_Yaw);
    // let nPitch = recalculatetofModel(-imuAngle.eurla_pitch + tof.last_abs_Pitch);
    // let nRoll = recalculatetofModel(-imuAngle.eurla_roll + tof.last_abs_Roll);

    // console.log(nYaw, nPitch, nRoll, "~", Yaw, Pitch, Roll);

    // tof.last_abs_Pitch = imuAngle.eurla_pitch;
    // tof.last_abs_Roll = imuAngle.eurla_roll;
    // tof.last_abs_Yaw = imuAngle.eurla_yaw;

    // let nYaw = recalculate(Yaw);
    // let nPitch = recalculate(Pitch);
    // let nRoll = recalculate(Roll);

    //aligned with motion sensors for below
    // tof.rotateZ(nYaw);
    // tof.rotateX(nPitch);
    // tof.rotateY(nRoll);

    // tof.rotateXYZ(nYaw, nRoll, nPitch);
    // if (!armsEnabled) {
    // nYaw = recalculatetofModel(initEurlaRadian.eurla_yaw - imuAngle.eurla_yaw);
    // nPitch = recalculatetofModel(initEurlaRadian.eurla_pitch - imuAngle.eurla_pitch);
    // nRoll = recalculatetofModel(initEurlaRadian.eurla_roll - imuAngle.eurla_roll);
    nYaw = recalculatetofModel(- imuAngle.eurla_yaw);
    nPitch = recalculatetofModel(- imuAngle.eurla_pitch);
    nRoll = recalculatetofModel(- imuAngle.eurla_roll);

    tof.rotateXYZ(nYaw, nRoll, nPitch);

    // } else {
    // nYaw = recalculate(-imuAngle.eurla_yaw + tof.last_abs_Yaw);
    // nPitch = recalculate(-imuAngle.eurla_pitch + tof.last_abs_Pitch);
    // nRoll = recalculate(-imuAngle.eurla_roll + tof.last_abs_Roll);
    // tof.last_abs_Pitch = imuAngle.eurla_pitch;
    // tof.last_abs_Roll = imuAngle.eurla_roll;
    // tof.last_abs_Yaw = imuAngle.eurla_yaw;

    // nYaw = recalculatetofModel(Yaw);
    // nPitch = recalculatetofModel(Pitch);
    // nRoll = recalculatetofModel(Roll);

    // tof.rotateZ(nYaw);
    // tof.rotateX(nPitch);
    // tof.rotateY(nRoll);
    // };




    var vertices = projecttofModel(tof.vertices, width, height);

    context.strokeStyle = "blue";
    context.beginPath();
    context.moveTo(width / 2, height / 2);
    context.lineTo(width / 2 + 5, height / 2);
    context.lineTo(width / 2 - 5, height / 2);
    context.moveTo(width / 2, height / 2 - 5);
    context.lineTo(width / 2, height / 2 + 5);
    context.closePath();
    context.stroke();

    context.strokeStyle = "black";
    for (let index = tof.vertices.length - 1; index > -1; --index) {
        context.beginPath();
        context.moveTo(vertices[index].x, vertices[index].y);
        context.lineTo(vertices[index].x + 1, vertices[index].y);
        context.lineTo(vertices[index].x - 1, vertices[index].y);
        context.moveTo(vertices[index].x, vertices[index].y);
        context.lineTo(vertices[index].x, vertices[index].y + 1);
        context.lineTo(vertices[index].x, vertices[index].y - 1);
        context.closePath();
        context.stroke();
        // context.moveTo(vertices[index].x, vertices[index].y);
    }
    let index = 0;
    context.strokeStyle = "red";
    context.beginPath();
    context.moveTo(vertices[index].x, vertices[index].y);
    context.lineTo(vertices[index].x + 1, vertices[index].y + 1);
    context.lineTo(vertices[index].x - 1, vertices[index].y - 1);
    context.moveTo(vertices[index].x, vertices[index].y);
    context.lineTo(vertices[index].x - 1, vertices[index].y + 1);
    context.lineTo(vertices[index].x + 1, vertices[index].y - 1);
    context.closePath();
    context.stroke();
    // context.closePath();
    // context.stroke();

    // for (let index = tof.faces.length - 1; index > -1; --index) {
    //     let face = tof.faces[index];
    //     let p1 = tof.vertices[face[0]];
    //     let p2 = tof.vertices[face[1]];
    //     let p3 = tof.vertices[face[2]];
    //     let v1 = new Point3D(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
    //     let v2 = new Point3D(p3.x - p1.x, p3.y - p1.y, p3.z - p1.z);
    //     let n = new Point3D(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
    //     //n = v1 x v2
    //     let ndotp1 = ((p1.x - Pcx) * n.x + (p1.y - Pcy) * n.y + (p1.z - Pcz) * n.z);
    //     if (ndotp1 > 0) {
    //         // if p1.n>0 
    //         //(notice: the displace space pO is (0,0,0), while the tof created along bO(0,0,400), so that the p1.n may turn negative)

    //         // if (n.z >= 0) {

    //         context.fillStyle = tof.faces_fillstyle[index];
    //         context.beginPath();
    //         context.moveTo(vertices[face[0]].x, vertices[face[0]].y);
    //         context.lineTo(vertices[face[1]].x, vertices[face[1]].y);
    //         context.lineTo(vertices[face[2]].x, vertices[face[2]].y);
    //         context.lineTo(vertices[face[3]].x, vertices[face[3]].y);
    //         context.closePath();
    //         context.fill();
    //         context.stroke();

    //     }
    // }
}
