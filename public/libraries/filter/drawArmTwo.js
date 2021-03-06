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

//given 3 points forming a arms obj(O,P2,P1), the fusion result for OP2 is angle_w2, fusion result for P2P1 is angle_w1, 
//then the new coordination should be ==>1) P2' = R(o, P20, angle_w2_abs), 2) P1'temp = P2'-P20+P10, 3) P1' = R(P2', P1'temp, angle_w1_abs)


const ArmTwo = function (x = 0, y = 0, z = 0, elementID) {
    Point3D.call(this, x, y, z);
    this.elementID = elementID;
    this.name = "arms";
    this.legPx = 0;
    this.legPy = 0;
    this.legPz = 50;
    let leg = 50;
    this.vertices_origin = [
        new Point3D(x, y, z), //O0
        new Point3D(x, y, z + leg),//P20
        new Point3D(x, y, z + 2 * leg)//P10
    ];
    this.vertices = [
        new Point3D(x, y, z),//O
        new Point3D(x, y, z + leg),//P2
        new Point3D(x, y, z + 2 * leg)//P1
    ];
    // this.faces = [[0, 1, 2, 3], [0, 4, 5, 1], [1, 5, 6, 2], [3, 2, 6, 7], [0, 3, 7, 4], [4, 7, 6, 5]];
    this.arms_fillstyle = ["blue", "red", "green"];
    // this.center = [x, y, z];
};
ArmTwo.prototype = {
    rotateX: function (radian, seq = 0) {
        var cosine = Math.cos(radian);
        var sine = Math.sin(radian);

        let rCx = this.vertices[seq].x;
        let rCy = this.vertices[seq].y;
        let rCz = this.vertices[seq].z;

        for (let index = this.vertices.length - 1; index >= seq; --index) {
            let p = this.vertices[index];

            let y = (p.y - rCy) * cosine - (p.z - rCz) * sine;
            let z = (p.y - rCy) * sine + (p.z - rCz) * cosine;
            p.y = y + rCy;
            p.z = z + rCz;
        }

    },
    rotateY: function (radian, seq = 0) {
        var cosine = Math.cos(radian);
        var sine = Math.sin(radian);
        let rCx = this.vertices[seq].x;
        let rCy = this.vertices[seq].y;
        let rCz = this.vertices[seq].z;

        for (let index = this.vertices.length - 1; index >= seq; --index) {
            let p = this.vertices[index];

            let x = (p.z - rCz) * sine + (p.x - rCx) * cosine;
            let z = (p.z - rCz) * cosine - (p.x - rCx) * sine;
            p.x = x + rCx;
            p.z = z + rCz;
        }

    },
    rotateZ: function (radian, seq = 0) {
        var cosine = Math.cos(radian);
        var sine = Math.sin(radian);

        let rCx = this.vertices[seq].x;
        let rCy = this.vertices[seq].y;
        let rCz = this.vertices[seq].z;

        for (let index = this.vertices.length - 1; index >= seq; --index) {
            let p = this.vertices[index];
            let x = -(p.y - rCy) * sine + (p.x - rCx) * cosine;
            let y = (p.y - rCy) * cosine + (p.x - rCx) * sine;

            // let x = (p.y - this.rCy) * sine + (p.x - this.rCx) * cosine;
            // let y = (p.y - this.rCy) * cosine - (p.x - this.rCx) * sine;
            p.x = x + rCx;
            p.y = y + rCy;
        }

    },
    rotateXYZ: function (Yaw, Pitch, Roll, seq = 0) {
        let cosineYaw = Math.cos(Yaw);
        let sinYaw = Math.sin(Yaw);
        let cosinePitch = Math.cos(Pitch);
        let sinPitch = Math.sin(Pitch);
        let cosineRoll = Math.cos(Roll);
        let sinRoll = Math.sin(Roll);
        let rCx = this.vertices[seq].x;
        let rCy = this.vertices[seq].y;
        let rCz = this.vertices[seq].z;
        // for (let index = this.vertices.length - 1; index >= seq; --index) {
        {//1) P2' = R(o, P20, angle_w2_abs),3) P1' = R(P2', P1'temp, angle_w1_abs)
            let index = seq + 1;
            let p = this.vertices_origin[index];
            let q = this.vertices[index];
            let ox = p.x - rCx;
            let oy = p.y - rCy;
            let oz = p.z - rCz;
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

            q.x = x + rCx;
            q.y = y + rCy;
            q.z = z + rCz;

            for (let ind = index + 1; ind < this.vertices.length; ++ind) {
                // if (index == 1) {
                this.vertices_origin[ind].x = this.vertices[ind - 1].x + this.legPx;
                // (q.x - p.x) + this.vertices_origin[index + 1].x;
                this.vertices_origin[ind].y = this.vertices[ind - 1].y + this.legPy;
                // (q.y - p.y) + this.vertices_origin[index + 1].y;
                this.vertices_origin[ind].z = this.vertices[ind - 1].z + this.legPz;
                // }//2) P1'temp = P2'-P20+P10,
            }
        }
    },

    refreshArmC: function () {
        return;
    }
};

var Px = 00;
var Py = 00;
var Pz = 1000;

function armTwoProject(points3d, width, height) {
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


function armTwoLoop(Yaw = 0.000, Pitch = 0.000, Roll = 0.000, arm, nodeID, imuAngle) {
    // window.requestAnimationFrame(loop);
    // initDraw(arm);
    var canvas = document.getElementById(arm.elementID);
    var context = canvas.getContext("2d");
    var height = canvas.clientHeight;
    var width = canvas.clientWidth;

    // var armX = arm.x;
    // var armY = arm.Y;
    // var armZ = arm.Z;


    let seq = nodeID - 1;

    startX = 0;
    startY = 0;
    // height = canvas.clientHeight;
    // width = canvas.clientWidth;
    // if (arm.x > 0) { startX = width; }
    context.canvas.height = height;
    context.canvas.width = width;
    context.fillStyle = "#ffffff";
    context.fillRect(startX, startY, width, height);
    context.strokeStyle = "#000000";

    context.fillStyle = "black";
    context.font = "20px Arial";
    let nodePos = 30;
    if (nodeID == 2) nodePos = width - 100;
    context.fillText(arm.name + nodeID, 0 + nodePos, 30);

    context.fillStyle = "blue";
    context.font = "25px Arial";
    // let outp = 'P>' + imuAngle.eurla_pitch_Angle + '/ R>' + imuAngle.eurla_roll_Angle + '/ Y>' + imuAngle.eurla_yaw_Angle;
    // context.fillText(outp, 0, 50 + nodePos);

    let outp = 'P>' + imuAngle.eurla_pitch_Angle;
    //  + '/ R>' + imuAngle.eurla_roll_Angle + '/ Y>' + imuAngle.eurla_yaw_Angle;
    context.fillText(outp, 0 + nodePos, 50);
    let outr = 'R>' + imuAngle.eurla_roll_Angle;
    context.fillText(outr, 0 + nodePos, 70);
    let outy = 'Y>' + imuAngle.eurla_yaw_Angle;
    context.fillText(outy, 0 + nodePos, 90);

    if (imuAngle.eurla_pitch_Angle == 0 && imuAngle.eurla_roll_Angle == 0 && imuAngle.eurla_yaw_Angle == 0) {
        context.fillStyle = "red";
        context.fillText("calibrating ... please wait...", width / 2, height / 2);
    }

    let centerX = width * 0.5;
    let centerY = height * 0.5;
    // let centerX = width * 0.5 + arm.vertices[9].x;
    // let centerY = height * 0.5 + arm.vertices[9].y;

    context.beginPath();
    context.moveTo(centerX - 5, centerY);
    context.lineTo(centerX + 5, centerY);
    context.moveTo(centerX, centerY - 5);
    context.lineTo(centerX, centerY + 5);
    // context.moveTo(centerX, centerY);
    // context.lineTo(arm.x, arm.y);
    context.closePath();
    context.stroke();

    //from the monitor display point, the y axis is the body Z, and z axis is pointing out from display which means body y. 
    //while rotation by ym in the reverse angle, so ym = -YAW, xm = Pitch, zm = Roll
    // arm.rotateZ(Yaw);
    // arm.rotateX(Roll);
    // arm.rotateY(Pitch);

    // arm.rotateZ(Roll);
    // arm.rotateX(Pitch);
    // arm.rotateY(-Yaw);

    // let nYaw = recalculate(-imuAngle.eurla_yaw + arm.last_abs_Yaw);
    // let nPitch = recalculate(-imuAngle.eurla_pitch + arm.last_abs_Pitch);
    // let nRoll = recalculate(-imuAngle.eurla_roll + arm.last_abs_Roll);

    // // console.log(nYaw, nPitch, nRoll, "~", Yaw, Pitch, Roll);

    // arm.last_abs_Pitch = imuAngle.eurla_pitch;
    // arm.last_abs_Roll = imuAngle.eurla_roll;
    // arm.last_abs_Yaw = imuAngle.eurla_yaw;

    // // aligned with motion sensors for below
    // arm.rotateZ(nYaw, seq);
    // arm.rotateX(nPitch, seq);
    // arm.rotateY(nRoll, seq);

    // let nYaw = recalculate(Yaw);
    // let nPitch = recalculate(Pitch);
    // let nRoll = recalculate(Roll);

    // // aligned with motion sensors for below
    // arm.rotateZ(nYaw, seq);
    // arm.rotateX(nPitch, seq);
    // arm.rotateY(nRoll, seq);

    let nYaw = recalculate(-imuAngle.eurla_yaw);
    let nPitch = recalculate(-imuAngle.eurla_pitch);
    let nRoll = recalculate(-imuAngle.eurla_roll);
    arm.rotateXYZ(nYaw, nRoll, nPitch, seq);

    var vertices = armTwoProject(arm.vertices, width, height);

    context.strokeStyle = arm.arms_fillstyle[0];
    context.beginPath();
    context.moveTo(centerX, centerY);

    for (let index = 0; index < vertices.length; ++index) {
        context.strokeStyle = arm.arms_fillstyle[index];
        context.lineTo(vertices[index].x, vertices[index].y);
        context.lineTo(vertices[index].x - 3, vertices[index].y - 3);
        context.lineTo(vertices[index].x + 3, vertices[index].y + 3);
        context.stroke();
        context.closePath();
        context.beginPath();
        context.moveTo(vertices[index].x, vertices[index].y);
    }

    context.closePath();


    // for (let index = arm.faces.length - 1; index > -1; --index) {
    //     let face = arm.faces[index];
    //     let p1 = arm.vertices[face[0]];
    //     let p2 = arm.vertices[face[1]];
    //     let p3 = arm.vertices[face[2]];
    //     // let v1 = new Point3D(p2.x, p2.y, p2.z);
    //     // let v2 = new Point3D(p3.x, p3.y, p3.z);

    //     let v1 = new Point3D(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
    //     // let v2 = new Point3D(-p3.x + p1.x, -p3.y + p1.y, -p3.z + p1.z);
    //     // let v1 = new Point3D(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
    //     let v2 = new Point3D(p3.x - p1.x, p3.y - p1.y, p3.z - p1.z);
    //     let n = new Point3D(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);

    //     let ndotp1 = ((p1.x - Px) * n.x + (p1.y - Py) * n.y + (p1.z - Pz) * n.z);
    //     //(p1-(0,0,500)).n
    //     //(notice: the displace space pO is (0,0,0), while the cube created along bO(0,0,bCz), and (p1-(0,0,H*10+1)) is definitely from outside the arm. so that the ndotp1 may turn negative)

    //     if (ndotp1 > 0) {
    //         // if (((p1.x - arm.vertices[8].x) * n.x + (p1.y - arm.vertices[8].y) * n.y + (p1.z - arm.vertices[8].z) * n.z) > 0) {
    //         context.fillStyle = arm.faces_fillstyle[index];
    //         context.beginPath();
    //         context.moveTo(vertices[face[0]].x, vertices[face[0]].y);
    //         context.lineTo(vertices[face[1]].x, vertices[face[1]].y);
    //         context.lineTo(vertices[face[2]].x, vertices[face[2]].y);
    //         context.lineTo(vertices[face[3]].x, vertices[face[3]].y);
    //         context.closePath();
    //         context.fill();
    //         // context.stroke();

    //         context.beginPath();
    //         context.moveTo(vertices[9].x, vertices[9].y);
    //         context.lineTo(vertices[8].x, vertices[8].y);
    //         context.closePath();
    //         context.stroke();
    //     }
    // }

}
