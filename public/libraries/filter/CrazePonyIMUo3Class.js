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

const ACC_CALC_TIME = 3000; //ms
const GYRO_CALC_TIME = 3000000;	//us
// const localGravity = 9.81259;// sensorsone.com, latitude=52.486244, height=100m.
// var localGravity = document.getElementById("GravValue").placeholder;
const standGravity = 9.8;// based on Acc standard output 1000mg = 9.8m/s^2
const Constant_G = localGravity / standGravity;
const fixpoint = 1;// to show the 4 number of decimal
const floatpoint = 8;// to make quaternion shoren

const so3_comp_params_Kp = 1.0;
const so3_comp_params_Ki = 0.0005;//0.05
const M_PI_F = Math.PI;
// var imu = new IMU_tt; //should be defined when nodes connection done and ifContent selected
// IMU_Init(); should be no need any longer


class CrazePonyIMUo3Class {
    constructor() {
        this.q0 = 1.0;
        this.q1 = 0.0;
        this.q2 = 0.0;
        this.q3 = 0.0;
        /** quaternion of sensor frame relative to auxiliary frame */
        this.dq0 = 0.0;
        this.dq1 = 0.0;
        this.dq2 = 0.0;
        this.dq3 = 0.0;
        /** quaternion of sensor frame relative to auxiliary frame */
        this.gyro_bias = [0.0, 0.0, 0.0]; /** bias estimation */
        this.q0q0;
        this.q0q1;
        this.q0q2;
        this.q0q3;
        this.q1q1;
        this.q1q2;
        this.q1q3;
        this.q2q2;
        this.q2q3;
        this.q3q3;
        this.bFilterInit = 0;

        this.tPrev = 0;
        this.startTime = 0;	//us
        this.gyro_offsets_sum = [0.0, 0.0, 0.0]; // gyro_offsets[3] = { 0.0f, 0.0f, 0.0f },
        this.acc_offset_sum = [0, 0, 0];//for the acc offset
        this.mag_offset_sum = [0, 0, 0];//for mag offset
        this.offset_count = 0;
        this.lastAcc = [];
        this.deltaTs = 0; //=TS-lastTS; note TS from BlueST is in the 10 miliseconds, ie TS=1 means 10mili

    }

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

        this.q0 = (cosRoll * cosPitch * cosHeading + sinRoll * sinPitch * sinHeading);
        this.q1 = (sinRoll * cosPitch * cosHeading - cosRoll * sinPitch * sinHeading);
        this.q2 = (cosRoll * sinPitch * cosHeading + sinRoll * cosPitch * sinHeading);
        this.q3 = (cosRoll * cosPitch * sinHeading - sinRoll * sinPitch * cosHeading);

        // q0 = roundup(cosRoll * cosPitch * cosHeading + sinRoll * sinPitch * sinHeading, floatpoint);
        // q1 = roundup(sinRoll * cosPitch * cosHeading - cosRoll * sinPitch * sinHeading, floatpoint);
        // q2 = roundup(cosRoll * sinPitch * cosHeading + sinRoll * cosPitch * sinHeading, floatpoint);
        // q3 = roundup(cosRoll * cosPitch * sinHeading - sinRoll * sinPitch * cosHeading, floatpoint);


        // auxillary variables to reduce number of repeated operations, for 1st pass
        this.q0q0 = this.q0 * this.q0;
        this.q0q1 = this.q0 * this.q1;
        this.q0q2 = this.q0 * this.q2;
        this.q0q3 = this.q0 * this.q3;
        this.q1q1 = this.q1 * this.q1;
        this.q1q2 = this.q1 * this.q2;
        this.q1q3 = this.q1 * this.q3;
        this.q2q2 = this.q2 * this.q2;
        this.q2q3 = this.q2 * this.q3;
        this.q3q3 = this.q3 * this.q3;
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
        if (this.bFilterInit == 0) {
            this.NonlinearSO3AHRSinit(ax, ay, az, mx, my, mz);
            this.bFilterInit = 1;
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
            hx = 2.0 * (mx * (0.5 - this.q2q2 - this.q3q3) + my * (this.q1q2 - this.q0q3) + mz * (this.q1q3 + this.q0q2));
            hy = 2.0 * (mx * (this.q1q2 + this.q0q3) + my * (0.5 - this.q1q1 - this.q3q3) + mz * (this.q2q3 - this.q0q1));
            hz = 2.0 * mx * (this.q1q3 - this.q0q2) + 2.0 * my * (this.q2q3 + this.q0q1) + 2.0 * mz * (0.5 - this.q1q1 - this.q2q2);
            bx = Math.sqrt(hx * hx + hy * hy);
            bz = hz;

            // Estimated direction of magnetic field
            halfwx = bx * (0.5 - this.q2q2 - this.q3q3) + bz * (this.q1q3 - this.q0q2);
            halfwy = bx * (this.q1q2 - this.q0q3) + bz * (this.q0q1 + this.q2q3);
            halfwz = bx * (this.q0q2 + this.q1q3) + bz * (0.5 - this.q1q1 - this.q2q2);

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
            halfvx = this.q1q3 - this.q0q2;
            halfvy = this.q0q1 + this.q2q3;
            halfvz = this.q0q0 - 0.5 + this.q3q3;

            // Error is sum of cross product between estimated direction and measured direction of field vectors
            halfex += ay * halfvz - az * halfvy;
            halfey += az * halfvx - ax * halfvz;
            halfez += ax * halfvy - ay * halfvx;
        }

        // Apply feedback only when valid data has been gathered from the accelerometer or magnetometer
        if (halfex != 0.0 && halfey != 0.0 && halfez != 0.0) {
            // Compute and apply integral feedback if enabled
            if (twoKi > 0.0) {
                this.gyro_bias[0] += twoKi * halfex * dt;	// integral error scaled by Ki
                this.gyro_bias[1] += twoKi * halfey * dt;
                this.gyro_bias[2] += twoKi * halfez * dt;

                // apply integral feedback
                gx += this.gyro_bias[0];
                gy += this.gyro_bias[1];
                gz += this.gyro_bias[2];
            }
            else {
                this.gyro_bias[0] = 0.0;	// prevent integral windup
                this.gyro_bias[1] = 0.0;
                this.gyro_bias[2] = 0.0;
            }

            // Apply proportional feedback
            gx += twoKp * halfex;
            gy += twoKp * halfey;
            gz += twoKp * halfez;
        }

        // Time derivative of quaternion. q_dot = 0.5*q\otimes omega.
        //! q_k = q_{k-1} + dt*\dot{q}
        //! \dot{q} = 0.5*q \otimes P(\omega)
        this.dq0 = 0.5 * (-this.q1 * gx - this.q2 * gy - this.q3 * gz);
        this.dq1 = 0.5 * (this.q0 * gx + this.q2 * gz - this.q3 * gy);
        this.dq2 = 0.5 * (this.q0 * gy - this.q1 * gz + this.q3 * gx);
        this.dq3 = 0.5 * (this.q0 * gz + this.q1 * gy - this.q2 * gx);

        this.q0 += dt * this.dq0;
        this.q1 += dt * this.dq1;
        this.q2 += dt * this.dq2;
        this.q3 += dt * this.dq3;

        // Normalise quaternion
        recipNorm = invSqrt(this.q0 * this.q0 + this.q1 * this.q1 + this.q2 * this.q2 + this.q3 * this.q3);
        this.q0 *= recipNorm;
        this.q1 *= recipNorm;
        this.q2 *= recipNorm;
        this.q3 *= recipNorm;

        // q0 = roundup(q0, floatpoint);
        // q1 = roundup(q1, floatpoint);
        // q2 = roundup(q2, floatpoint);
        // q3 = roundup(q3, floatpoint);

        // Auxiliary variables to avoid repeated arithmetic
        this.q0q0 = this.q0 * this.q0;
        this.q0q1 = this.q0 * this.q1;
        this.q0q2 = this.q0 * this.q2;
        this.q0q3 = this.q0 * this.q3;
        this.q1q1 = this.q1 * this.q1;
        this.q1q2 = this.q1 * this.q2;
        this.q1q3 = this.q1 * this.q3;
        this.q2q2 = this.q2 * this.q2;
        this.q2q3 = this.q2 * this.q3;
        this.q3q3 = this.q3 * this.q3;
    }


    //函数名：IMUSO3Thread(void)
    //描述：姿态软件解算融合函数
    //该函数对姿态的融合是软件解算，Crazepony现在不使用DMP硬件解算
    //对应的硬件解算函数为IMU_Process()
    IMUSO3Thread = function (imu, param, TS) {
        //! Time constant
        let dt = this.deltaTs / 100;		//s
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
        let eurla_pitch_Angle = 0;
        let eurla_roll_Angle = 0;
        let eurla_yaw_Angle = 0;

        // let now = micros();//time of now in microSeconds
        // now = Date.now();//now is time in miliSeconds
        now = performance.now() * 1000;
        dt = (this.tPrev > 0) ? (now - this.tPrev) / 1000000.0 : 0;
        // if (dt > 0) imu.LPFset(10 / dt, 30); //due to the BLE connection datarate, LPFset need to have at least 100hz, so use 10/dt. ie. we are manipulating the LPF samples rate by x10.
        this.tPrev = now;

        // console.log(dt, "/", deltaTs / 1000, '=', Date.now());

        imu.ReadIMUSensorHandle(param, TS);
        // if (!sensorReady) return;

        if (!imu.ready) {
            //calibrate the IMU before entering into algorithm
            if (this.startTime == 0)
                this.startTime = now;

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

            this.gyro_offsets_sum[0] += imu.gyroRaw[0];
            this.gyro_offsets_sum[1] += imu.gyroRaw[1];
            this.gyro_offsets_sum[2] += imu.gyroRaw[2];

            //here above the original way

            //try to add acc_offset as well
            // acc_offset_sum[0] += imu.accb[0];
            // acc_offset_sum[1] += imu.accb[1];
            // acc_offset_sum[2] += imu.accb[2];

            this.acc_offset_sum[0] += imu.accRaw[0];
            this.acc_offset_sum[1] += imu.accRaw[1];
            this.acc_offset_sum[2] += imu.accRaw[2];

            //try end

            //try to add acc_offset as well
            this.mag_offset_sum[0] += imu.magRaw[0];
            this.mag_offset_sum[1] += imu.magRaw[1];
            this.mag_offset_sum[2] += imu.magRaw[2];
            //try end
            this.offset_count++;

            if (now > this.startTime + GYRO_CALC_TIME) {
                imu.gyroOffset[0] = this.gyro_offsets_sum[0] / this.offset_count;
                imu.gyroOffset[1] = this.gyro_offsets_sum[1] / this.offset_count;
                imu.gyroOffset[2] = this.gyro_offsets_sum[2] / this.offset_count;

                imu.accOffset[0] = this.acc_offset_sum[0] / this.offset_count;
                imu.accOffset[1] = this.acc_offset_sum[1] / this.offset_count;
                imu.accOffset[2] = this.acc_offset_sum[2] / this.offset_count - Constant_G;

                imu.magOffset[0] = this.mag_offset_sum[0] / this.offset_count;
                imu.magOffset[1] = this.mag_offset_sum[1] / this.offset_count;
                imu.magOffset[2] = this.mag_offset_sum[2] / this.offset_count;


                this.offset_count = 0;
                this.gyro_offsets_sum[0] = 0;
                this.gyro_offsets_sum[1] = 0;
                this.gyro_offsets_sum[2] = 0;

                this.acc_offset_sum[0] = 0;
                this.acc_offset_sum[1] = 0;
                this.acc_offset_sum[2] = 0;

                this.mag_offset_sum[0] = 0;
                this.mag_offset_sum[1] = 0;
                this.mag_offset_sum[2] = 0;

                imu.ready = 1;
                this.startTime = 0;

            }
            return ({ eurla_pitch, eurla_roll, eurla_yaw, eurla_pitch_Angle, eurla_roll_Angle, eurla_yaw_Angle });
        }


        // gyro[0] = imu.gyroRaw[0] - imu.gyroOffset[0]; //remove offset
        // gyro[1] = imu.gyroRaw[1] - imu.gyroOffset[1];
        // gyro[2] = imu.gyroRaw[2] - imu.gyroOffset[2];
        gyro[0] = imu.gyro[0] - imu.gyroOffset[0]; //remove offset
        gyro[1] = imu.gyro[1] - imu.gyroOffset[1];
        gyro[2] = imu.gyro[2] - imu.gyroOffset[2];

        this.lastAcc = acc;

        // acc[0] = imu.accRaw[0] - imu.accOffset[0]; //remove offset
        // acc[1] = imu.accRaw[1] - imu.accOffset[1];
        // acc[2] = imu.accRaw[2] - imu.accOffset[2];
        acc[0] = imu.accb[0] - imu.accOffset[0]; //remove offset
        acc[1] = imu.accb[1] - imu.accOffset[1];
        acc[2] = imu.accb[2] - imu.accOffset[2];

        // acc[0] = imu.accb[0]; // incase the level cannot be found ,it is better to leave the offset there otherwise created manual drift by remove G
        // acc[1] = imu.accb[1];
        // acc[2] = imu.accb[2];

        // mag[0] = (imu.magRaw[0] - imu.magOffset[0]) * 0.1; //remove offset
        // mag[1] = (imu.magRaw[1] - imu.magOffset[1]) * 0.1;
        // mag[2] = (imu.magRaw[2] - imu.magOffset[2]) * 0.1;
        let magRate = 1;
        let gyroRate = 1;//set it to 0 to test if only acc can make fusion
        if ((this.lastAcc[0] - acc[0]) * (this.lastAcc[1] - acc[1]) * (this.lastAcc[2] - acc[2]) < 0.0000001) { magRate = 0; }

        gyro[0] *= gyroRate;
        gyro[1] *= gyroRate;
        gyro[2] *= gyroRate;

        mag[0] = imu.mag[0] * magRate; //remove offset
        mag[1] = imu.mag[1] * magRate;
        mag[2] = imu.mag[2] * magRate;
        // if (!(mag == [0, 0, 0])) {
        //     let recipNorm = invSqrt(mag[0] * mag[0] + mag[1] * mag[1] + mag[2] * mag[2]);
        //     mag[0] *= recipNorm;
        //     mag[1] *= recipNorm;
        //     mag[2] *= recipNorm;
        //     //         console.log(mag);
        // }

        // NOTE : Accelerometer is reversed.
        // Because proper mount of PX4 will give you a reversed accelerometer readings.
        // dt = deltaTs / 100;
        this.NonlinearSO3AHRSupdate(gyro[0], gyro[1], gyro[2],
            acc[0], acc[1], acc[2],
            mag[0], mag[1], mag[2],
            so3_comp_params_Kp,
            so3_comp_params_Ki,
            dt);

        // Convert q->R, This R converts inertial frame to body frame.
        Rot_matrix[0] = this.q0q0 + this.q1q1 - this.q2q2 - this.q3q3;// 11
        Rot_matrix[1] = 2. * (this.q1 * this.q2 + this.q0 * this.q3);	// 12
        Rot_matrix[2] = 2. * (this.q1 * this.q3 - this.q0 * this.q2);	// 13
        Rot_matrix[3] = 2. * (this.q1 * this.q2 - this.q0 * this.q3);	// 21
        Rot_matrix[4] = this.q0q0 - this.q1q1 + this.q2q2 - this.q3q3;// 22
        Rot_matrix[5] = 2. * (this.q2 * this.q3 + this.q0 * this.q1);	// 23
        Rot_matrix[6] = 2. * (this.q1 * this.q3 + this.q0 * this.q2);	// 31
        Rot_matrix[7] = 2. * (this.q2 * this.q3 - this.q0 * this.q1);	// 32
        Rot_matrix[8] = this.q0q0 - this.q1q1 - this.q2q2 + this.q3q3;// 33
        // console.log("9Axis Fusion is : ", q0, '/', q1, '/', q2, '/', q3);
        // console.log(acc);
        // console.log(Rot_matrix[1], '/', Rot_matrix[0], '=', Rot_matrix[1] / Rot_matrix[0]);
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

        eurla_pitch_Angle = imu.pitch.toFixed(fixpoint);
        eurla_roll_Angle = imu.roll.toFixed(fixpoint);
        eurla_yaw_Angle = imu.yaw.toFixed(fixpoint);


        return ({ eurla_pitch, eurla_roll, eurla_yaw, eurla_pitch_Angle, eurla_roll_Angle, eurla_yaw_Angle });
    }//end of IMUthread
}// end of Class

//! Auxiliary variables to reduce number of repeated operations

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


