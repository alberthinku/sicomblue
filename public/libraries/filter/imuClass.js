const IMU_SAMPLE_RATE = 166; //as pre the TS of BLUEST output calculated, not a fixed rate so far, this will impact the digital filter

const IMU_FILTER_CUTOFF_FREQ = 30;

const CrazePony_Gyro_Max = 2000;
const CrazePony_Acc_Max = 8;

const GYRO_SCALE = 2000; //dps, BLUEST's output fullscale rating for gyro, since it is equal to CrazePony's algorithm request, so no need to rescale
const gyro_rps = Math.PI / 180; //rad per degree
const gyro_scale_rps_rate = GYRO_SCALE * gyro_rps / CrazePony_Gyro_Max;//to match to the algorithm normalization

const ACC_SCALE = CrazePony_Acc_Max; //g, BLUEST's output fullscale rate for acc, since CrazePony is using 8g as full scale, so need to down grade the acc reading of 4
const acc_scale_rate = ACC_SCALE / CrazePony_Acc_Max;//since the raw 9Axis are absolute g data (instead of ADC reading), so the scale does not need to be justified as it was for the ADC reading case, scale should be 1 for the BlueST 9Axis Raw 

class IMU_tt {
    constructor() {
        this.caliPass = 0;
        this.ready = 0;
        this.accADC = [];
        this.gyroADC = [];
        this.magADC = [];
        this.accRaw = [];    //m/s^2
        this.gyroRaw = [];   //rad/s
        this.magRaw = [];    //
        this.accOffset = []; //m/s^2
        this.gyroOffset = [];
        this.magOffset = [];
        this.accb = []; //filted, in body frame
        this.accg = [];
        this.gyro = [];
        this.mag = [];
        this.DCMgb = [];//DCMgb = [3][3]
        this.q = [];
        this.roll = 0; //deg
        this.pitch = 0;
        this.yaw = 0;
        this.rollRad = 0; //rad
        this.pitchRad = 0;
        this.yawRad = 0;

        this._cutoff_freq1;
        this._a11;
        this._a21;
        this._b01;
        this._b11;
        this._b21;
        this._delay_element_11; // buffered sample -1
        this._delay_element_21; // buffered sample -2



        this._cutoff_freq2;
        this._a12;
        this._a22;
        this._b02;
        this._b12;
        this._b22;
        this._delay_element_12; // buffered sample -1
        this._delay_element_22; // buffered sample -2


        this._cutoff_freq3;
        this._a13;
        this._a23;
        this._b03;
        this._b13;
        this._b23;
        this._delay_element_13; // buffered sample -1
        this._delay_element_23; // buffered sample -2



        this._cutoff_freq4;
        this._a14;
        this._a24;
        this._b04;
        this._b14;
        this._b24;
        this._delay_element_14; // buffered sample -1
        this._delay_element_24; // buffered sample -2


        this._cutoff_freq5;
        this._a15;
        this._a25;
        this._b05;
        this._b15;
        this._b25;
        this._delay_element_15; // buffered sample -1
        this._delay_element_25; // buffered sample -2


        this._cutoff_freq6;
        this._a16;
        this._a26;
        this._b06;
        this._b16;
        this._b26;
        this._delay_element_16; // buffered sample -1
        this._delay_element_26; // buffered sample -2

        this.IMU_Init();

    };


    LPF2pSetCutoffFreq_1(sample_freq, cutoff_freq) {
        let fr = 0;
        let ohm = 0;
        let c = 0;

        fr = sample_freq / cutoff_freq;
        ohm = Math.tan(M_PI_F / fr);
        c = 1.0 + 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm;

        this._cutoff_freq1 = cutoff_freq;
        if (this._cutoff_freq1 > 0.0) {
            this._b01 = ohm * ohm / c;
            this._b11 = 2.0 * this._b01;
            this._b21 = this._b01;
            this._a11 = 2.0 * (ohm * ohm - 1.0) / c;
            this._a21 = (1.0 - 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm) / c;
        }
    }

    LPF2pSetCutoffFreq_2(sample_freq, cutoff_freq) {
        let fr = 0;
        let ohm = 0;
        let c = 0;

        fr = sample_freq / cutoff_freq;
        ohm = Math.tan(M_PI_F / fr);
        c = 1.0 + 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm;

        this._cutoff_freq2 = cutoff_freq;
        if (this._cutoff_freq2 > 0.0) {
            this._b02 = ohm * ohm / c;
            this._b12 = 2.0 * this._b02;
            this._b22 = this._b02;
            this._a12 = 2.0 * (ohm * ohm - 1.0) / c;
            this._a22 = (1.0 - 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm) / c;
        }
    }

    LPF2pSetCutoffFreq_3(sample_freq, cutoff_freq) {
        let fr = 0;
        let ohm = 0;
        let c = 0;

        fr = sample_freq / cutoff_freq;
        ohm = Math.tan(M_PI_F / fr);
        c = 1.0 + 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm;

        this._cutoff_freq3 = cutoff_freq;
        if (this._cutoff_freq3 > 0.0) {
            this._b03 = ohm * ohm / c;
            this._b13 = 2.0 * this._b03;
            this._b23 = this._b03;
            this._a13 = 2.0 * (ohm * ohm - 1.0) / c;
            this._a23 = (1.0 - 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm) / c;
        }
    }

    LPF2pSetCutoffFreq_4(sample_freq, cutoff_freq) {
        let fr = 0;
        let ohm = 0;
        let c = 0;

        fr = sample_freq / cutoff_freq;
        ohm = Math.tan(M_PI_F / fr);
        c = 1.0 + 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm;

        this._cutoff_freq4 = cutoff_freq;
        if (this._cutoff_freq4 > 0.0) {
            this._b04 = ohm * ohm / c;
            this._b14 = 2.0 * this._b04;
            this._b24 = this._b04;
            this._a14 = 2.0 * (ohm * ohm - 1.0) / c;
            this._a24 = (1.0 - 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm) / c;
        }
    }

    LPF2pSetCutoffFreq_5(sample_freq, cutoff_freq) {
        let fr = 0;
        let ohm = 0;
        let c = 0;

        fr = sample_freq / cutoff_freq;
        ohm = Math.tan(M_PI_F / fr);
        c = 1.0 + 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm;

        this._cutoff_freq5 = cutoff_freq;
        if (this._cutoff_freq5 > 0.0) {
            this._b05 = ohm * ohm / c;
            this._b15 = 2.0 * this._b05;
            this._b25 = this._b05;
            this._a15 = 2.0 * (ohm * ohm - 1.0) / c;
            this._a25 = (1.0 - 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm) / c;
        }
    }

    LPF2pSetCutoffFreq_6(sample_freq, cutoff_freq) {
        let fr = 0;
        let ohm = 0;
        let c = 0;

        fr = sample_freq / cutoff_freq;
        ohm = Math.tan(M_PI_F / fr);
        c = 1.0 + 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm;

        this._cutoff_freq6 = cutoff_freq;
        if (this._cutoff_freq6 > 0.0) {
            this._b06 = ohm * ohm / c;
            this._b16 = 2.0 * this._b06;
            this._b26 = this._b06;
            this._a16 = 2.0 * (ohm * ohm - 1.0) / c;
            this._a26 = (1.0 - 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm) / c;
        }
    }

    LPF2pApply_1(sample) {

        let delay_element_0 = 0, output = 0;
        if (this._cutoff_freq1 <= 0.0) {
            // no filtering
            return sample;
        }
        else {
            delay_element_0 = sample - this._delay_element_11 * this._a11 - this._delay_element_21 * this._a21;
            // do the filtering
            if (isNaN(delay_element_0) || (!isFinite(delay_element_0))) {
                // don't allow bad values to propogate via the filter
                delay_element_0 = sample;
            }
            output = delay_element_0 * this._b01 + this._delay_element_11 * this._b11 + this._delay_element_21 * this._b21;

            this._delay_element_21 = this._delay_element_11;
            this._delay_element_11 = delay_element_0;

            // return the value.  Should be no need to check limits
            return output;
        }
    }


    LPF2pApply_2(sample) {

        let delay_element_0 = 0, output = 0;
        if (this._cutoff_freq2 <= 0.0) {
            // no filtering
            return sample;
        }
        else {
            delay_element_0 = sample - this._delay_element_12 * this._a12 - this._delay_element_22 * this._a22;
            // do the filtering
            if (isNaN(delay_element_0) || (!isFinite(delay_element_0))) {
                // don't allow bad values to propogate via the filter
                delay_element_0 = sample;
            }
            output = delay_element_0 * this._b02 + this._delay_element_12 * this._b12 + this._delay_element_22 * this._b22;

            this._delay_element_22 = this._delay_element_12;
            this._delay_element_12 = delay_element_0;

            // return the value.  Should be no need to check limits
            return output;
        }
    }


    LPF2pApply_3(sample) {

        let delay_element_0 = 0, output = 0;
        if (this._cutoff_freq3 <= 0.0) {
            // no filtering
            return sample;
        }
        else {
            delay_element_0 = sample - this._delay_element_13 * this._a13 - this._delay_element_23 * this._a23;
            // do the filtering
            if (isNaN(delay_element_0) || (!isFinite(delay_element_0))) {
                // don't allow bad values to propogate via the filter
                delay_element_0 = sample;
            }
            output = delay_element_0 * this._b03 + this._delay_element_13 * this._b13 + this._delay_element_23 * this._b23;

            this._delay_element_23 = this._delay_element_13;
            this._delay_element_13 = delay_element_0;

            // return the value.  Should be no need to check limits
            return output;
        }
    }

    LPF2pApply_4(sample) {

        let delay_element_0 = 0, output = 0;
        if (this._cutoff_freq4 <= 0.0) {
            // no filtering
            return sample;
        }
        else {
            delay_element_0 = sample - this._delay_element_14 * this._a14 - this._delay_element_24 * this._a24;
            // do the filtering
            if (isNaN(delay_element_0) || (!isFinite(delay_element_0))) {
                // don't allow bad values to propogate via the filter
                delay_element_0 = sample;
            }
            output = delay_element_0 * this._b04 + this._delay_element_14 * this._b14 + this._delay_element_24 * this._b24;

            this._delay_element_24 = this._delay_element_14;
            this._delay_element_14 = delay_element_0;

            // return the value.  Should be no need to check limits
            return output;
        }
    }


    LPF2pApply_5(sample) {

        let delay_element_0 = 0, output = 0;
        if (this._cutoff_freq5 <= 0.0) {
            // no filtering
            return sample;
        }
        else {
            delay_element_0 = sample - this._delay_element_15 * this._a15 - this._delay_element_25 * this._a25;
            // do the filtering
            if (isNaN(delay_element_0) || (!isFinite(delay_element_0))) {
                // don't allow bad values to propogate via the filter
                delay_element_0 = sample;
            }
            output = delay_element_0 * this._b05 + this._delay_element_15 * this._b15 + this._delay_element_25 * this._b25;

            this._delay_element_25 = this._delay_element_15;
            this._delay_element_15 = delay_element_0;

            // return the value.  Should be no need to check limits
            return output;
        }
    }

    LPF2pApply_6(sample) {

        let delay_element_0 = 0, output = 0;
        if (this._cutoff_freq6 <= 0.0) {
            // no filtering
            return sample;
        }
        else {
            delay_element_0 = sample - this._delay_element_16 * this._a16 - this._delay_element_26 * this._a26;
            // do the filtering
            if (isNaN(delay_element_0) || !(isFinite(delay_element_0))) {
                // don't allow bad values to propogate via the filter
                delay_element_0 = sample;
            }
            output = delay_element_0 * this._b06 + this._delay_element_16 * this._b16 + this._delay_element_26 * this._b26;

            this._delay_element_26 = this._delay_element_16;
            this._delay_element_16 = delay_element_0;

            // return the value.  Should be no need to check limits
            return output;
        }
    }

    //函数名：IMU_Init(void)
    //描述：姿态解算融合初始化函数
    //现在使用软件解算，不再使用MPU6050的硬件解算单元DMP，IMU_SW在SysConfig.h中定义


    IMU_Init() {
        // #ifdef IMU_SW		//软解需要先校陀螺
        this.ready = 0;
        this.caliPass = 1;
        //filter rate
        this.LPF2pSetCutoffFreq_1(IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);		//30Hz
        this.LPF2pSetCutoffFreq_2(IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);
        this.LPF2pSetCutoffFreq_3(IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);
        this.LPF2pSetCutoffFreq_4(IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);
        this.LPF2pSetCutoffFreq_5(IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);
        this.LPF2pSetCutoffFreq_6(IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);
    };

    LPFset(imu_sample_rate, imu_filter_cutoff_freq) {
        this.LPF2pSetCutoffFreq_1(imu_sample_rate, imu_filter_cutoff_freq);		//30Hz
        this.LPF2pSetCutoffFreq_2(imu_sample_rate, imu_filter_cutoff_freq);
        this.LPF2pSetCutoffFreq_3(imu_sample_rate, imu_filter_cutoff_freq);
        this.LPF2pSetCutoffFreq_4(imu_sample_rate, imu_filter_cutoff_freq);
        this.LPF2pSetCutoffFreq_5(imu_sample_rate, imu_filter_cutoff_freq);
        this.LPF2pSetCutoffFreq_6(imu_sample_rate, imu_filter_cutoff_freq);
    };


    ReadIMUSensorHandle(param, ts = 0) {
        let i;
        //filters from below
        // const M_PI_F = Math.PI;



        // let ts_IMU_SAMPLE_RATE = 100 / deltaTs;

        // LPFset(ts_IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);

        this.accRaw[0] = param[0] / 1000 * acc_scale_rate; //mg -> g with scale matching
        this.accRaw[1] = param[1] / 1000 * acc_scale_rate;
        this.accRaw[2] = param[2] / 1000 * acc_scale_rate;
        this.gyroRaw[0] = param[3] / 10 * gyro_scale_rps_rate; //dps->rps with scale matching
        this.gyroRaw[1] = param[4] / 10 * gyro_scale_rps_rate;
        this.gyroRaw[2] = param[5] / 10 * gyro_scale_rps_rate;
        this.magRaw[0] = param[7] / 1000;//mg -> gauss // the x of 303 is y of 6dsl
        this.magRaw[1] = param[6] / 1000;//the y of 303 is x of 6dsl
        this.magRaw[2] = param[8] / 1000;

        this.accb[0] = this.LPF2pApply_1(this.accRaw[0]);
        this.accb[1] = this.LPF2pApply_2(this.accRaw[1]);
        this.accb[2] = this.LPF2pApply_3(this.accRaw[2]);

        // // // #ifdef IMU_SW
        this.gyro[0] = this.LPF2pApply_4(this.gyroRaw[0]);
        this.gyro[1] = this.LPF2pApply_5(this.gyroRaw[1]);
        this.gyro[2] = this.LPF2pApply_6(this.gyroRaw[2]);

        this.mag[0] = (this.magRaw[0]);
        this.mag[1] = (this.magRaw[1]);
        this.mag[2] = (this.magRaw[2]);
    };
} //end of class




