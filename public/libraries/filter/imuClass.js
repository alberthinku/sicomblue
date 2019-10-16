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
        this.IMU_Init();
    };

    //函数名：IMU_Init(void)
    //描述：姿态解算融合初始化函数
    //现在使用软件解算，不再使用MPU6050的硬件解算单元DMP，IMU_SW在SysConfig.h中定义

    IMU_Init() {
        // #ifdef IMU_SW		//软解需要先校陀螺
        this.ready = 0;
        this.caliPass = 1;
        //filter rate
        LPF2pSetCutoffFreq_1(IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);		//30Hz
        LPF2pSetCutoffFreq_2(IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);
        LPF2pSetCutoffFreq_3(IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);
        LPF2pSetCutoffFreq_4(IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);
        LPF2pSetCutoffFreq_5(IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);
        LPF2pSetCutoffFreq_6(IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);
    };

    LPFset(imu_sample_rate, imu_filter_cutoff_freq) {
        LPF2pSetCutoffFreq_1(imu_sample_rate, imu_filter_cutoff_freq);		//30Hz
        LPF2pSetCutoffFreq_2(imu_sample_rate, imu_filter_cutoff_freq);
        LPF2pSetCutoffFreq_3(imu_sample_rate, imu_filter_cutoff_freq);
        LPF2pSetCutoffFreq_4(imu_sample_rate, imu_filter_cutoff_freq);
        LPF2pSetCutoffFreq_5(imu_sample_rate, imu_filter_cutoff_freq);
        LPF2pSetCutoffFreq_6(imu_sample_rate, imu_filter_cutoff_freq);
    };


    ReadIMUSensorHandle(param, ts = 0) {
        let i;


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

        this.accb[0] = LPF2pApply_1(this.accRaw[0]);
        this.accb[1] = LPF2pApply_2(this.accRaw[1]);
        this.accb[2] = LPF2pApply_3(this.accRaw[2]);

        // // // #ifdef IMU_SW
        this.gyro[0] = LPF2pApply_4(this.gyroRaw[0]);
        this.gyro[1] = LPF2pApply_5(this.gyroRaw[1]);
        this.gyro[2] = LPF2pApply_6(this.gyroRaw[2]);

        this.mag[0] = (this.magRaw[0]);
        this.mag[1] = (this.magRaw[1]);
        this.mag[2] = (this.magRaw[2]);
    };
} //end of class




