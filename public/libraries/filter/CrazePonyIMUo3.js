/*
      ____                      _____                  +---+
     / ___\                     / __ \                 | R |
    / /                        / /_/ /                 +---+
   / /   ________  ____  ___  / ____/___  ____  __   __
  / /  / ___/ __ `/_  / / _ \/ /   / __ \/ _  \/ /  / /
 / /__/ /  / /_/ / / /_/  __/ /   / /_/ / / / / /__/ /
 \___/_/   \__,_/ /___/\___/_/    \___ /_/ /_/____  /
                                                 / /
                                            ____/ /
                                           /_____/
Filename:	IMUSO3.c
Author:		祥 、nieyong
说明：这是Crazepony软件姿态解算融合文件，Crazepony已经不再使用DMP硬件解算
Part of this algrithom is referred from pixhawk.
------------------------------------
*/

// #include "stm32f10x.h"
// #include "stm32f10x_it.h"
// #include <math.h>
// #include "IMU.h"
// #include "IMUSO3.h"

const ACC_CALC_TIME = 3000; //ms
const GYRO_CALC_TIME = 3000000;	//us
const localGravity = 9.81259;// sensorsone.com, latitude=52.486244, height=100m.
const standGravity = 9.8;// based on Acc standard output 1000mg = 9.8m/s^2
const Constant_G = localGravity / standGravity;

//! Auxiliary variables to reduce number of repeated operations
var q0 = 1.0, q1 = 0.0, q2 = 0.0, q3 = 0.0;	/** quaternion of sensor frame relative to auxiliary frame */
var dq0 = 0.0, dq1 = 0.0, dq2 = 0.0, dq3 = 0.0;	/** quaternion of sensor frame relative to auxiliary frame */
var gyro_bias = [0.0, 0.0, 0.0]; /** bias estimation */
var q0q0, q0q1, q0q2, q0q3;
var q1q1, q1q2, q1q3;
var q2q2, q2q3;
var q3q3;
var bFilterInit = 0;

//函数名：invSqrt(void)
//描述：求平方根的倒数
//该函数是经典的Carmack求平方根算法，效率极高，使用魔数0x5f375a86
invSqrt = function (number) {
    // let i;
    // let x, y;
    // const f = 1.5;

    // x = number * 0.5;
    // y = number;
    // i = y;
    // i = 0x5f375a86 - (i >> 1);
    // y = i;
    // y = y * (f - (x * y * y));
    // return y;
    return (1 / Math.sqrt(number));
}

//! Using accelerometer, sense the gravity vector.
//! Using magnetometer, sense yaw.
NonlinearSO3AHRSinit = function (ax, ay, az, mx, my, mz) {
    let initialRoll, initialPitch;
    let cosRoll, sinRoll, cosPitch, sinPitch;
    let magX, magY;
    let initialHdg, cosHeading, sinHeading;

    initialRoll = Math.atan2(-ay, -az);
    initialPitch = Math.atan2(ax, -az);

    cosRoll = Math.cos(initialRoll);
    sinRoll = Math.sin(initialRoll);
    cosPitch = Math.cos(initialPitch);
    sinPitch = Math.sin(initialPitch);

    magX = mx * cosPitch + my * sinRoll * sinPitch + mz * cosRoll * sinPitch;

    magY = my * cosRoll - mz * sinRoll;

    initialHdg = Math.atan2(-magY, magX);

    cosRoll = Math.cos(initialRoll * 0.5);
    sinRoll = Math.sin(initialRoll * 0.5);

    cosPitch = Math.cos(initialPitch * 0.5);
    sinPitch = Math.sin(initialPitch * 0.5);

    cosHeading = Math.cos(initialHdg * 0.5);
    sinHeading = Math.sin(initialHdg * 0.5);

    q0 = cosRoll * cosPitch * cosHeading + sinRoll * sinPitch * sinHeading;
    q1 = sinRoll * cosPitch * cosHeading - cosRoll * sinPitch * sinHeading;
    q2 = cosRoll * sinPitch * cosHeading + sinRoll * cosPitch * sinHeading;
    q3 = cosRoll * cosPitch * sinHeading - sinRoll * sinPitch * cosHeading;

    // auxillary variables to reduce number of repeated operations, for 1st pass
    q0q0 = q0 * q0;
    q0q1 = q0 * q1;
    q0q2 = q0 * q2;
    q0q3 = q0 * q3;
    q1q1 = q1 * q1;
    q1q2 = q1 * q2;
    q1q3 = q1 * q3;
    q2q2 = q2 * q2;
    q2q3 = q2 * q3;
    q3q3 = q3 * q3;
}

//函数名：NonlinearSO3AHRSupdate()
//描述：姿态解算融合，是Crazepony和核心算法
//使用的是Mahony互补滤波算法，没有使用Kalman滤波算法
//改算法是直接参考pixhawk飞控的算法，可以在Github上看到出处
//https://github.com/hsteinhaus/PX4Firmware/blob/master/src/modules/attitude_estimator_so3/attitude_estimator_so3_main.cpp
NonlinearSO3AHRSupdate = function (gx, gy, gz, ax, ay, az, mx, my, mz, twoKp, twoKi, dt) {
    let recipNorm;
    let halfex = 0.0, halfey = 0.0, halfez = 0.0;

    // Make filter converge to initial solution faster
    // This function assumes you are in static position.
    // WARNING : in case air reboot, this can cause problem. But this is very unlikely happen.
    if (bFilterInit == 0) {
        NonlinearSO3AHRSinit(ax, ay, az, mx, my, mz);
        bFilterInit = 1;
    }

    //! If magnetometer measurement is available, use it.
    if (!((mx == 0.0) && (my == 0.0) && (mz == 0.0))) {
        let hx, hy, hz, bx, bz;
        let halfwx, halfwy, halfwz;

        // Normalise magnetometer measurement
        // Will sqrt work better? PX4 system is powerful enough?
        recipNorm = invSqrt(mx * mx + my * my + mz * mz);
        mx *= recipNorm;
        my *= recipNorm;
        mz *= recipNorm;

        // Reference direction of Earth's magnetic field
        hx = 2.0 * (mx * (0.5 - q2q2 - q3q3) + my * (q1q2 - q0q3) + mz * (q1q3 + q0q2));
        hy = 2.0 * (mx * (q1q2 + q0q3) + my * (0.5 - q1q1 - q3q3) + mz * (q2q3 - q0q1));
        hz = 2.0 * mx * (q1q3 - q0q2) + 2.0 * my * (q2q3 + q0q1) + 2.0 * mz * (0.5 - q1q1 - q2q2);
        bx = Math.sqrt(hx * hx + hy * hy);
        bz = hz;

        // Estimated direction of magnetic field
        halfwx = bx * (0.5 - q2q2 - q3q3) + bz * (q1q3 - q0q2);
        halfwy = bx * (q1q2 - q0q3) + bz * (q0q1 + q2q3);
        halfwz = bx * (q0q2 + q1q3) + bz * (0.5 - q1q1 - q2q2);

        // Error is sum of cross product between estimated direction and measured direction of field vectors
        halfex += (my * halfwz - mz * halfwy);
        halfey += (mz * halfwx - mx * halfwz);
        halfez += (mx * halfwy - my * halfwx);
    }

    //增加一个条件：  加速度的模量与G相差不远时。 0.75*G < normAcc < 1.25*G
    // Compute feedback only if accelerometer measurement valid (avoids NaN in accelerometer normalisation)
    if (!((ax == 0.0) && (ay == 0.0) && (az == 0.0))) {
        let halfvx, halfvy, halfvz;

        // Normalise accelerometer measurement
        //归一化，得到单位加速度
        recipNorm = invSqrt(ax * ax + ay * ay + az * az);

        ax *= recipNorm;
        ay *= recipNorm;
        az *= recipNorm;

        // Estimated direction of gravity and magnetic field
        halfvx = q1q3 - q0q2;
        halfvy = q0q1 + q2q3;
        halfvz = q0q0 - 0.5 + q3q3;

        // Error is sum of cross product between estimated direction and measured direction of field vectors
        halfex += ay * halfvz - az * halfvy;
        halfey += az * halfvx - ax * halfvz;
        halfez += ax * halfvy - ay * halfvx;
    }

    // Apply feedback only when valid data has been gathered from the accelerometer or magnetometer
    if (halfex != 0.0 && halfey != 0.0 && halfez != 0.0) {
        // Compute and apply integral feedback if enabled
        if (twoKi > 0.0) {
            gyro_bias[0] += twoKi * halfex * dt;	// integral error scaled by Ki
            gyro_bias[1] += twoKi * halfey * dt;
            gyro_bias[2] += twoKi * halfez * dt;

            // apply integral feedback
            gx += gyro_bias[0];
            gy += gyro_bias[1];
            gz += gyro_bias[2];
        }
        else {
            gyro_bias[0] = 0.0;	// prevent integral windup
            gyro_bias[1] = 0.0;
            gyro_bias[2] = 0.0;
        }

        // Apply proportional feedback
        gx += twoKp * halfex;
        gy += twoKp * halfey;
        gz += twoKp * halfez;
    }

    // Time derivative of quaternion. q_dot = 0.5*q\otimes omega.
    //! q_k = q_{k-1} + dt*\dot{q}
    //! \dot{q} = 0.5*q \otimes P(\omega)
    dq0 = 0.5 * (-q1 * gx - q2 * gy - q3 * gz);
    dq1 = 0.5 * (q0 * gx + q2 * gz - q3 * gy);
    dq2 = 0.5 * (q0 * gy - q1 * gz + q3 * gx);
    dq3 = 0.5 * (q0 * gz + q1 * gy - q2 * gx);

    q0 += dt * dq0;
    q1 += dt * dq1;
    q2 += dt * dq2;
    q3 += dt * dq3;

    // Normalise quaternion
    recipNorm = invSqrt(q0 * q0 + q1 * q1 + q2 * q2 + q3 * q3);
    q0 *= recipNorm;
    q1 *= recipNorm;
    q2 *= recipNorm;
    q3 *= recipNorm;

    // Auxiliary variables to avoid repeated arithmetic
    q0q0 = q0 * q0;
    q0q1 = q0 * q1;
    q0q2 = q0 * q2;
    q0q3 = q0 * q3;
    q1q1 = q1 * q1;
    q1q2 = q1 * q2;
    q1q3 = q1 * q3;
    q2q2 = q2 * q2;
    q2q3 = q2 * q3;
    q3q3 = q3 * q3;
}

const so3_comp_params_Kp = 1.0;
const so3_comp_params_Ki = 0.05;
const M_PI_F = Math.PI;
var imu = new IMU_tt;
IMU_Init();
// var tPrev = 0;
var tPrev = 0, startTime = 0;	//us
var gyro_offsets_sum = [0.0, 0.0, 0.0]; // gyro_offsets[3] = { 0.0f, 0.0f, 0.0f },
var acc_offset_sum = [0, 0, 0];//for the acc offset
var mag_offset_sum = [0, 0, 0];//for mag offset
var offset_count = 0;

//函数名：IMUSO3Thread(void)
//描述：姿态软件解算融合函数
//该函数对姿态的融合是软件解算，Crazepony现在不使用DMP硬件解算
//对应的硬件解算函数为IMU_Process()
IMUSO3Thread = function (param) {
    //! Time constant
    let dt = 0.01;		//s
    let now;
    let i;

    /* output euler angles */
    let euler = [0.0, 0.0, 0.0];	//rad

    /* Initialization */
    let Rot_matrix = [1., 0.0, 0.0, 0.0, 1., 0.0, 0.0, 0.0, 1.];		/**< init: identity matrix */
    let acc = [0.0, 0.0, 0.0];		//m/s^2
    let gyro = [0.0, 0.0, 0.0];		//rad/s
    let mag = [0.0, 0.0, 0.0];
    //need to calc gyro offset before imu start working
    let eurla_roll = 0;
    let eurla_pitch = 0;
    let eurla_yaw = 0;


    // let now = micros();//time of now in microSeconds
    // now = Date.now();//now is time in miliSeconds
    now = performance.now() * 1000;
    dt = (tPrev > 0) ? (now - tPrev) / 1000000.0 : 0;
    tPrev = now;

    ReadIMUSensorHandle(param);
    // if (!sensorReady) return;

    if (!imu.ready) {
        //calibrate the IMU before entering into algorithm
        if (startTime == 0)
            startTime = now;

        // albert correction on the gyroOffset calculation is as below
        // gyro_offsets_sum[0] += imu.gyro[0];
        // gyro_offsets_sum[1] += imu.gyro[1];
        // gyro_offsets_sum[2] += imu.gyro[2];
        // albert correction on the gyroOffset calculation is as above

        //the original Crazepony algorithm is using gyroRaw to make the offset calculation, which to be a bit wield. as the 
        // ==>gyro=imu.gyro-gyroOffset, while imu.gyro = LPF(imu.gyroRaw). 
        // logically, gyroOffset should be based on the LPF(imu.gyroRaw) otherwise, risk is there
        // while in reality due to the fact, gyroOffset was another low pass filter, i.e. it makes the similar effect of the LPF
        // so that even if you calculate the gyroOffset based on gyroRaw, the value are quite similar to the original Crazepony algorithm
        // 041019.
        //here below the original way

        gyro_offsets_sum[0] += imu.gyroRaw[0];
        gyro_offsets_sum[1] += imu.gyroRaw[1];
        gyro_offsets_sum[2] += imu.gyroRaw[2];

        //here above the original way

        //try to add acc_offset as well
        acc_offset_sum[0] += imu.accRaw[0];
        acc_offset_sum[1] += imu.accRaw[1];
        acc_offset_sum[2] += imu.accRaw[2];
        //try end

        //try to add acc_offset as well
        mag_offset_sum[0] += imu.magRaw[0];
        mag_offset_sum[1] += imu.magRaw[1];
        mag_offset_sum[2] += imu.magRaw[2];
        //try end
        offset_count++;

        if (now > startTime + GYRO_CALC_TIME) {
            imu.gyroOffset[0] = gyro_offsets_sum[0] / offset_count;
            imu.gyroOffset[1] = gyro_offsets_sum[1] / offset_count;
            imu.gyroOffset[2] = gyro_offsets_sum[2] / offset_count;

            imu.accOffset[0] = acc_offset_sum[0] / offset_count;
            imu.accOffset[1] = acc_offset_sum[1] / offset_count;
            imu.accOffset[2] = acc_offset_sum[2] / offset_count - Constant_G;


            imu.magOffset[0] = mag_offset_sum[0] / offset_count;
            imu.magOffset[1] = mag_offset_sum[1] / offset_count;
            imu.magOffset[2] = mag_offset_sum[2] / offset_count;


            offset_count = 0;
            gyro_offsets_sum[0] = 0;
            gyro_offsets_sum[1] = 0;
            gyro_offsets_sum[2] = 0;

            acc_offset_sum[0] = 0;
            acc_offset_sum[1] = 0;
            acc_offset_sum[2] = 0;

            mag_offset_sum[0] = 0;
            mag_offset_sum[1] = 0;
            mag_offset_sum[2] = 0;

            imu.ready = 1;
            startTime = 0;

        }
        return ({ eurla_pitch, eurla_roll, eurla_yaw });
    }


    gyro[0] = imu.gyro[0] - imu.gyroOffset[0]; //remove offset
    gyro[1] = imu.gyro[1] - imu.gyroOffset[1];
    gyro[2] = imu.gyro[2] - imu.gyroOffset[2];

    acc[0] = imu.accb[0] - imu.accOffset[0]; //remove offset
    acc[1] = imu.accb[1] - imu.accOffset[1];
    acc[2] = imu.accb[2] - imu.accOffset[2];

    //     mag[0] = imu.magRaw[0] - imu.magOffset[0]; //remove offset
    //     mag[1] = imu.magRaw[1] - imu.magOffset[1];
    //     mag[2] = imu.magRaw[2] - imu.magOffset[2];

    //     if (!(mag == [0, 0, 0])) {
    //         let recipNorm = invSqrt(mag[0] * mag[0] + mag[1] * mag[1] + mag[2] * mag[2]);
    //         mag[0] *= recipNorm;
    //         mag[1] *= recipNorm;
    //         mag[2] *= recipNorm;
    // //         console.log(mag);
    //     }

    // NOTE : Accelerometer is reversed.
    // Because proper mount of PX4 will give you a reversed accelerometer readings.
    NonlinearSO3AHRSupdate(gyro[0], gyro[1], gyro[2],
        acc[0], acc[1], acc[2],
        mag[0], mag[1], mag[2],
        so3_comp_params_Kp,
        so3_comp_params_Ki,
        dt);

    // Convert q->R, This R converts inertial frame to body frame.
    Rot_matrix[0] = q0q0 + q1q1 - q2q2 - q3q3;// 11
    Rot_matrix[1] = 2. * (q1 * q2 + q0 * q3);	// 12
    Rot_matrix[2] = 2. * (q1 * q3 - q0 * q2);	// 13
    Rot_matrix[3] = 2. * (q1 * q2 - q0 * q3);	// 21
    Rot_matrix[4] = q0q0 - q1q1 + q2q2 - q3q3;// 22
    Rot_matrix[5] = 2. * (q2 * q3 + q0 * q1);	// 23
    Rot_matrix[6] = 2. * (q1 * q3 + q0 * q2);	// 31
    Rot_matrix[7] = 2. * (q2 * q3 - q0 * q1);	// 32
    Rot_matrix[8] = q0q0 - q1q1 - q2q2 + q3q3;// 33
    // console.log("9Axis Fusion is : ", q0, '/', q1, '/', q2, '/', q3);
    //1-2-3 Representation.
    //Equation (290)
    //Representing Attitude: Euler Angles, Unit Quaternions, and Rotation Vectors, James Diebel.
    // Existing PX4 EKF code was generated by MATLAB which uses coloum major order matrix.
    euler[0] = Math.atan2(Rot_matrix[5], Rot_matrix[8]);	//! Roll
    euler[1] = -safe_asin(Rot_matrix[2]);									//! Pitch
    // euler[1] = Math.asin(Rot_matrix[2]);									//! why asin is so much concerned??
    euler[2] = Math.atan2(Rot_matrix[1], Rot_matrix[0]);

    //DCM . ground to body
    // for (i = 0; i < 9; i++) {
    //     * (& (imu.DCMgb[0][0]) + i)=Rot_matrix[i];
    // }
    imu.DCMgb = Rot_matrix;

    imu.rollRad = euler[0];
    imu.pitchRad = euler[1];
    imu.yawRad = euler[2];

    imu.roll = euler[0] * 180.0 / M_PI_F;
    imu.pitch = euler[1] * 180.0 / M_PI_F;
    imu.yaw = euler[2] * 180.0 / M_PI_F;

    eurla_roll = euler[0];
    eurla_pitch = euler[1];
    eurla_yaw = euler[2];


    return ({ eurla_pitch, eurla_roll, eurla_yaw });
}