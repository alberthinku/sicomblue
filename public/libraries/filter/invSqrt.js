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
