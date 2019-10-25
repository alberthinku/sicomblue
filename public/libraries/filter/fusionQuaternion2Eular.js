
//Quaternion elements are {w,v} or {w, qi, qj, qk} and those elements should be normalized before makeing the 2Eular process
function fusionQuaternion2Eular(w, qi, qj, qk) {
    let norm = w * w + qi * qi + qj * qj + qk * qk;
    // if (!(norm === 1)) {
    //     let k = invSqrt(norm);
    //     w *= k;
    //     qi *= k;
    //     qj *= k;
    //     qk *= k;
    //     //now quaternion elements are normalized, ready for next 2Eular process
    // }
    let eurla_roll = 0;
    let eurla_pitch = 0;
    let eurla_yaw = 0;
    let s2d = 180 / Math.PI;
    // eurla_roll = (Math.atan2(2.0 * (w * qi + qj * qk), 1 - 2.0 * (qi * qi + qj * qj)));// * 180 / M_PI;
    // eurla_pitch = safe_asin(2.0 * (w * qj - qk * qi));// * 180 / M_PI;
    // eurla_yaw = -Math.atan2(2.0 * (w * qk + qi * qj), 1 - 2.0 * (qj * qj + qk * qk));// * 180 / M_PI;

    eurla_roll = (Math.atan2(2.0 * (w * qi + qj * qk), 1 - 2.0 * (qi * qi + qj * qj)));// * 180 / M_PI;
    eurla_pitch = -safe_asin(2.0 * (w * qj - qk * qi));// * 180 / M_PI;
    eurla_yaw = Math.atan2(2.0 * (w * qk + qi * qj), 1 - 2.0 * (qj * qj + qk * qk));// * 180 / M_PI;

    let eurla_roll_Angle = (eurla_roll * s2d).toFixed(fixpoint);
    let eurla_pitch_Angle = (eurla_pitch * s2d).toFixed(fixpoint);
    let eurla_yaw_Angle = (eurla_yaw * s2d).toFixed(fixpoint);

    return ({ eurla_pitch, eurla_roll, eurla_yaw, eurla_pitch_Angle, eurla_roll_Angle, eurla_yaw_Angle });
}