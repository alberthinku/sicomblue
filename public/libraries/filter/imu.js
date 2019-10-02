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
        this.accb = []; //filted, in body frame
        this.accg = [];
        this.gyro = [];
        this.DCMgb = [];//DCMgb = [3][3]
        this.q = [];
        this.roll = 0; //deg
        this.pitch = 0;
        this.yaw = 0;
        this.rollRad = 0; //rad
        this.pitchRad = 0;
        this.yawRad = 0;
    }
}

//函数名：IMU_Init(void)
//描述：姿态解算融合初始化函数
//现在使用软件解算，不再使用MPU6050的硬件解算单元DMP，IMU_SW在SysConfig.h中定义
const IMU_SAMPLE_RATE = 166; //as pre the TS of BLUEST output calculated, not a fixed rate so far, this will impact the digital filter

const IMU_FILTER_CUTOFF_FREQ = 30;

function IMU_Init() {
    // #ifdef IMU_SW		//软解需要先校陀螺
    imu.ready = 0;
    imu.caliPass = 1;
    //filter rate
    LPF2pSetCutoffFreq_1(IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);		//30Hz
    LPF2pSetCutoffFreq_2(IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);
    LPF2pSetCutoffFreq_3(IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);
    LPF2pSetCutoffFreq_4(IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);
    LPF2pSetCutoffFreq_5(IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);
    LPF2pSetCutoffFreq_6(IMU_SAMPLE_RATE, IMU_FILTER_CUTOFF_FREQ);
}


function ReadIMUSensorHandle(param) {
    let i;

    // //read raw
    // MPU6050AccRead(imu.accADC);
    // MPU6050GyroRead(imu.gyroADC);
    // //tutn to physical
    // for(i=0; i<3; i++)
    // {
    //     imu.accRaw[i]= imu.accADC[i] *ACC_SCALE * CONSTANTS_ONE_G ;
    //     imu.gyroRaw[i]= imu.gyroADC[i] * GYRO_SCALE * Math.pitch /180;		//deg/s
    // }

    // imu.accb[0] = LPF2pApply_1(imu.accRaw[0] - imu.accOffset[0]);
    // imu.accb[1] = LPF2pApply_2(imu.accRaw[1] - imu.accOffset[1]);
    // imu.accb[2] = LPF2pApply_3(imu.accRaw[2] - imu.accOffset[2]);

    imu.accRaw[0] = param[0] / 1000; //g
    imu.accRaw[1] = param[1] / 1000;
    imu.accRaw[2] = param[2] / 1000;
    imu.gyroRaw[0] = param[3] / 10; //dps
    imu.gyroRaw[1] = param[4] / 10;
    imu.gyroRaw[2] = param[5] / 10;
    imu.magRaw[0] = param[6] / 1000;//gauss
    imu.magRaw[1] = param[7] / 1000;
    imu.magRaw[2] = param[8] / 1000;

    imu.accb[0] = LPF2pApply_1(imu.accRaw[0]);
    imu.accb[1] = LPF2pApply_2(imu.accRaw[1]);
    imu.accb[2] = LPF2pApply_3(imu.accRaw[2]);

    // #ifdef IMU_SW
    imu.gyro[0] = LPF2pApply_4(imu.gyroRaw[0]);
    imu.gyro[1] = LPF2pApply_5(imu.gyroRaw[1]);
    imu.gyro[2] = LPF2pApply_6(imu.gyroRaw[2]);

}