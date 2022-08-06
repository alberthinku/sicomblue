
var scaleModel = 1.2; //060822 scaleModel should be near to 1, to make the canvas draw looks good. if too big, the shell became solid (scaleModel indicating the thickness of the ball shell)
var radiusMax = 10; //cm

eularRadianCal = function (a, b) {
    return ({
        "eurla_pitch": a.eurla_pitch - b.eurla_pitch, "eurla_yaw": a.eurla_yaw - b.eurla_yaw, "eurla_roll": a.eurla_roll - b.eurla_roll,
        "eurla_pitch_Angle": a.eurla_pitch_Angle - b.eurla_pitch_Angle, "eurla_yaw_Angle": a.eurla_yaw_Angle - b.eurla_yaw_Angle, "eurla_roll_Angle": a.eurla_roll_Angle - b.eurla_roll_Angle
    });
}

tofModeling = function (calibration_done = false) {
    let nodeTof = deviceNo[1];
    let nodeObj = deviceNo[2];
    //due to the mistake for initial status, nodeTof.lastEularRadian need to re-adjust to the base, i.e. delta_yaw=(-pi/2);
    // nodeTof.last_EularRadian.eurla_yaw + Math.PI / 2;
    // nodeTof.last_EularRadian.eurla_yaw_Angle + 90;

    let point;
    let point_9axis;
    let newpoint;
    let newpoint_9axis;

    if (tofPointArray.length == 0) {
        initEurlaRadian_obj = { 'eurla_pitch': 0, 'eurla_yaw': 0, 'eurla_roll': 0, "eurla_pitch_Angle": 0, "eurla_yaw_Angle": 0, "eurla_roll_Angle": 0 };
        // initEurlaRadian_obj = nodeObj.last_EularRadian;

        initEurlaRadian_tof = nodeTof.last_EularRadian;
        initEurlaRadian_tof_raw = nodeTof.last_EularRadian_Raw;
        // initEurlaRadian_tof_raw = { 'eurla_pitch': 0, 'eurla_yaw': 0, 'eurla_roll': 0, "eurla_pitch_Angle": 0, "eurla_yaw_Angle": 0, "eurla_roll_Angle": 0 };
    }

    if (nodeTof.last_tofReading <= tof2obj + radiusMax) {
        let Obj_AngleRadian_abs = eularRadianCal(nodeObj.last_EularRadian, initEurlaRadian_obj);
        let Tof_AngleRadian_abs = eularRadianCal(nodeTof.last_EularRadian, initEurlaRadian_tof);
        let Tof_AngleRadian_raw_abs = eularRadianCal(nodeTof.last_EularRadian_Raw, initEurlaRadian_tof_raw);
        let tmp = Tof_AngleRadian_raw_abs;
        let Tof_AngleRadian_raw_abs_adjust = { 'eurla_pitch': -tmp.eurla_roll, 'eurla_yaw': tmp.eurla_yaw, 'eurla_roll': -tmp.eurla_pitch, "eurla_pitch_Angle": -tmp.eurla_roll_Angle, "eurla_yaw_Angle": tmp.eurla_yaw_Angle, "eurla_roll_Angle": -tmp.eurla_pitch_Angle };




        point = fmodel(nodeTof.last_tofReading, Obj_AngleRadian_abs, Tof_AngleRadian_abs, tof2obj);
        point_9axis = fmodel(nodeTof.last_tofReading, Obj_AngleRadian_abs, Tof_AngleRadian_raw_abs_adjust, tof2obj);


        newpoint = new Point3D(point.x, point.y, point.z);

        newpoint_9axis = new Point3D(point_9axis.x, point_9axis.y, point_9axis.z);


        if (tofPointArray.length < tofPointArrayLengthMax) {
            tofPointArray.push(newpoint);
            tofM = new tofModel(0, 0, 0, tofPointArray);
        }

        looptof(0, 0, 0, tofM, Obj_AngleRadian_abs);

        if (tofPointArray_9Axis.length < tofPointArrayLengthMax) {
            tofPointArray_9Axis.push(newpoint_9axis);
            tofM_9Axis = new tofModel(0, 0, 0, tofPointArray_9Axis);
        }

        // looptof(0, 0, 0, tofM_9Axis, Obj_AngleRadian_abs, true); //060822 let alone the SFC first, 9Axis to be further investigated.

        // else if ((tofPointArray.length == tofPointArrayLengthMax) && (tofM == null)) {
        //     tofM = new tofModel(0, 0, 0, tofPointArray);
        // }
        // else {
        //     looptof(0, 0, 0, tofM, Obj_AngleRadian_abs);
        // }

        // if (tofPointArray.length < tofPointArrayLengthMax) {
        //     if (tofPointArray.length == 0) {
        //         initEurlaRadian_obj = nodeObj.last_EularRadian;
        //         initEurlaRadian_tof = nodeTof.last_EularRadian;
        //     }
        //     tofPointArray.push(newpoint);
        // }
        // else if ((tofPointArray.length == tofPointArrayLengthMax) && (tofM == null)) {
        //     tofM = new tofModel(0, 0, 0, tofPointArray);
        // }
        // else {
        //     looptof(0, 0, 0, tofM, nodeObj.last_EularRadian);
        // }

    }


    // else if (tofPointArray.length == 1) {
    //     initEurlaRadian = nodeObj.last_EularRadian;
    // }

}

tof_rotateXYZ = function (Yaw, Pitch, Roll, p, q = { 'x': 0, 'y': 0, 'z': 0 }) {
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

caltof2sent_impactangle = function (qSen) {
    //calculate the TofPt's impact to the P0 delta(PRY), oSPt and oST caculated the delta_yaw/pitch/roll
    let delta_yaw = Math.atan2(qSen.y, qSen.x);
    let delta_pitch = 0;
    let delta_roll = Math.atan2(qSen.z, qSen.x);
    return ({ delta_pitch, delta_roll, delta_yaw });
}


fmodel = function (tof, eularRadian_obj, eularRadian_tof = { 'eurla_pitch': 0, 'eurla_yaw': 0, 'eurla_roll': 0 }, TS = tof2obj) {

    let tp = tof;
    let ts = TS;
    let p_tof_new = { 'x': 0, 'y': 0, 'z': tp };
    let q_tof_origin = tof_rotateXYZ(eularRadian_tof.eurla_yaw, eularRadian_tof.eurla_pitch, eularRadian_tof.eurla_roll, p_tof_new);
    //q_tof_origin is the coordination in Tof axis removing the measured tof body rotation

    let q_sent_new = { 'x': q_tof_origin.z - ts, 'y': q_tof_origin.x, 'z': q_tof_origin.y };
    //q_sent_new is the coordination in SenT mapping from tof measuring

    let delta_angle = caltof2sent_impactangle(q_sent_new);
    //delta_angle is the angle for the Tof body rotation effect to the equvalent SenT body rotation (careless SenT origin body rotation)

    let P = tof_rotateXYZ(delta_angle.delta_yaw, delta_angle.delta_pitch, delta_angle.delta_roll, q_sent_new);
    //P is the coordination in SenT axis completely removing tof impact (i.e. the delta_angle)

    let Q = tof_rotateXYZ(eularRadian_obj.eurla_yaw, eularRadian_obj.eurla_pitch, eularRadian_obj.eurla_roll, P);
    //Q is the origin coordination in SenT axis removing SenT origin rotation

    return Q;

}


// TofcalPt = function (tp, ts, Pitch, Roll, Yaw) {
//     //due to the mistake for initial status, nodeTof.lastEularRadian need to re-adjust to the base, i.e. rotate_x = R_Y = -Roll, rotate_y = R_X = Pitch;
//     let P = Roll;
//     let R = -Pitch;
//     let Y = Yaw;

//     let yy = tp * Math.sin(P);
//     let xx = tp * Math.cos(P) - ts;

//     let x = tp * Math.cos(R) * Math.cos(P) - ts;
//     let y = tp * Math.cos(R) * Math.sin(P);
//     let z = tp * Math.sin(R);

//     //calculate the TofPt's impact to the P0 delta(PRY), oSPt and oST caculated the delta_yaw/pitch/roll
//     let delta_yaw = Math.atan2(y, x);
//     let delta_pitch = 0;
//     let delta_roll = Math.atan2(z, x);

//     return ({ x, y, z, delta_pitch, delta_roll, delta_yaw });
// }

// fmodel = function (tof, eularRadian_obj, eularRadian_tof = { 'eurla_pitch': 0, 'eurla_yaw': 0, 'eurla_roll': 0 }, TS = tof2obj) {

//     let tp = tof;
//     let ts = TS;
//     //P(t)= (abs(TP).CosRoll.CosPitch - abs(TS), abs(TP).CosRoll.SinPitch, abs(TP).SinRoll)
//     //P(0) = P(t).PRYRotation(Pitch,Roll,Yaw)
//     //
//     //

//     let Ptof = TofcalPt(tp, ts, eularRadian_tof.eurla_pitch, eularRadian_tof.eurla_roll, eularRadian_tof.eurla_yaw);
//     let p = Ptof;
//     let q = { 'x': 0, 'y': 0, 'z': 0 };
//     q = tof_rotateXYZ(eularRadian_obj.eurla_yaw + Ptof.delta_yaw, eularRadian_obj.eurla_pitch + Ptof.delta_pitch, eularRadian_obj.eurla_roll + Ptof.delta_roll, p, q);
//     return q;
// }

// fmodel = function (tof, eularRadian_obj, eularRadian_tof = { 'x': 0, 'y': 0, 'z': 0 }) {
//     let x, y, z;
//     // let r = tof2obj - tof;
//     // let eularRadian_tof = { 'eurla_pitch': 0, 'eurla_yaw': 0, 'eurla_roll': 0 };
//     let oST = tof2obj * Math.sqrt(3);
//     let oTP = tof * Math.sqrt(3);
//     let eularRadian_oST = eularRadianCal(eularRadian_tof, eularRadian_obj);
//     // let initEurlaRadian_oST = eularRadianCal(initEurlaRadian_tof, initEurlaRadian_obj);
//     let eularRadian_oTP = eularRadianCal(eularRadian_tof, initEurlaRadian_tof);

//     //voSP = voST + voTP 
//     //voST= ABS(oST) /_eularRadian_oST
//     //voTP= ABS(oTP) /_eularRadian_oTP

//     //voSP = ABS(oST) /_eularRadian_oST + ABS(oTP) /_eularRadian_oTP
//     //voSP = tof_rotateXYZ(eularRadian_oST, ABS(oST)) + tof_rotateXYZ(eularRadian_oTP, ABS(oTP))
//     /////questions: the angle of the vector, is not the rotationPRY angle!!! 
//     /////so the rotationXYZ cant be used to represent voSP/voST/voTP
//     ///TBD

//     let pvoST = { 'x': oST, 'y': oST, 'z': oST };
//     let pvoTP = { 'x': oTP, 'y': oTP, 'z': oTP };
//     let qvoST, qvoTP;

//     qvoST = tof_rotateXYZ(eularRadian_oST.eurla_yaw, eularRadian_oST.eurla_pitch, eularRadian_oST.eurla_roll, pvoST);
//     qvoTP = tof_rotateXYZ(eularRadian_oTP.eurla_yaw, eularRadian_oTP.eurla_pitch, eularRadian_oTP.eurla_roll, pvoTP);

//     let voSP = { x: qvoST.x + qvoTP.x, y: qvoST.y + qvoTP.y, z: qvoST.z + qvoTP.z };//voSP is the vector based in geo system
//     let vqP;

//     vqP = tof_rotateXYZ(-initEurlaRadian_obj.eurla_yaw, -initEurlaRadian_obj.eurla_pitch, -eularRadian_obj.eurla_roll, voSP);
//     //turn the voSP back to obj body system by reverse the rotation of initial radian_obj.

//     return (vqP);

//     // let p = { 'x': -r, 'y': 0, 'z': 0 };
//     // let q = { 'x': -r, 'y': 0, 'z': 0 };
//     // return (tof_rotateXYZ(eularRadian.eurla_yaw, eularRadian.eurla_pitch, eularRadian.eurla_roll, p, q));
//     // // return ({ x, y, z });
// }

// 
// fmodel = function (tof, eularRadian_obj, e_tof = { 'x': 0, 'y': 0, 'z': 0 }) {
//     let x, y, z;
//     let r = tof2obj - tof;
//     let eularRadian_tof = { 'eurla_pitch': 0, 'eurla_yaw': 0, 'eurla_roll': 0 };
//     let eularRadian = eularRadianCal(eularRadian_obj, eularRadian_tof);
//     let p = { 'x': -r, 'y': 0, 'z': 0 };
//     let q = { 'x': -r, 'y': 0, 'z': 0 };
//     return (tof_rotateXYZ(eularRadian.eurla_yaw, eularRadian.eurla_pitch, eularRadian.eurla_roll, p, q));
//     // return ({ x, y, z });
// }