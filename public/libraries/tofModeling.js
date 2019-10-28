
var scaleModel = 10;
var radiusMax = 10;

tofModeling = function () {
    let nodeTof = deviceNo[1];
    let nodeObj = deviceNo[2];
    let point;
    let newpoint;

    if (nodeTof.last_tofReading <= tof2obj + radiusMax) {
        point = fmodel(nodeTof.last_tofReading, nodeObj.last_EularRadian);
        newpoint = new Point3D(point.x, point.y, point.z);
        if (tofPointArray.length < tofPointArrayLengthMax) {
            tofPointArray.push(newpoint);
        }
        else if ((tofPointArray.length == tofPointArrayLengthMax) && (tofM == null)) {
            tofM = new tofModel(0, 0, 0, tofPointArray);
        }
        else {
            looptof(0, 0, 0, tofM, nodeObj.last_EularRadian);
        }
    }


    // else if (tofPointArray.length == 1) {
    //     initEurlaRadian = nodeObj.last_EularRadian;
    // }

}

tof_rotateXYZ = function (Yaw, Pitch, Roll, p, q) {
    let cosineYaw = Math.cos(Yaw);
    let sinYaw = Math.sin(Yaw);
    let cosinePitch = Math.cos(Pitch);
    let sinPitch = Math.sin(Pitch);
    let cosineRoll = Math.cos(Roll);
    let sinRoll = Math.sin(Roll);

    // let ox = p.x - this.x;
    // let oy = p.y - this.y;
    // let oz = p.z - this.z;

    let ox = p.x;
    let oy = p.y;
    let oz = p.z;


    let x = -oy * sinYaw + ox * cosineYaw;

    let y = oy * cosineYaw + ox * sinYaw;

    ox = x;
    let z = oz * cosineRoll - ox * sinRoll;

    x = oz * sinRoll + ox * cosineRoll;
    oy = y;

    oz = z;

    y = oy * cosinePitch - oz * sinPitch;
    z = oy * sinPitch + oz * cosinePitch;

    // q.x = x + this.x;
    // q.y = y + this.y;
    // q.z = z + this.z;
    q.x = x * scaleModel;
    q.y = y * scaleModel;
    q.z = z * scaleModel;

    return (q);
}

eularRadianCal = function (a, b) {
    return ({ "eurla_pitch": a.eurla_pitch - b.eurla_pitch, "eurla_yaw": a.eurla_yaw - b.eurla_yaw, "eurla_roll": a.eurla_roll - b.eurla_roll });
}

fmodel = function (tof, eularRadian_obj, e_tof = { 'x': 0, 'y': 0, 'z': 0 }) {
    let x, y, z;
    let r = tof2obj - tof;
    let eularRadian_tof = { 'eurla_pitch': 0, 'eurla_yaw': 0, 'eurla_roll': 0 };
    let eularRadian = eularRadianCal(eularRadian_obj, eularRadian_tof);
    let p = { 'x': -r, 'y': 0, 'z': 0 };
    let q = { 'x': -r, 'y': 0, 'z': 0 };
    return (tof_rotateXYZ(eularRadian.eurla_yaw, eularRadian.eurla_pitch, eularRadian.eurla_roll, p, q));
    // return ({ x, y, z });
}