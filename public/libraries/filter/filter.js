/*
*  TOBE FIXED: Use filter object instead of repeated code
*
*/

// const M_PI_F = Math.PI;
var _cutoff_freq1;
var _a11;
var _a21;
var _b01;
var _b11;
var _b21;
var _delay_element_11; // buffered sample -1
var _delay_element_21; // buffered sample -2

function LPF2pSetCutoffFreq_1(sample_freq, cutoff_freq) {
    let fr = 0;
    let ohm = 0;
    let c = 0;

    fr = sample_freq / cutoff_freq;
    ohm = Math.tan(M_PI_F / fr);
    c = 1.0 + 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm;

    _cutoff_freq1 = cutoff_freq;
    if (_cutoff_freq1 > 0.0) {
        _b01 = ohm * ohm / c;
        _b11 = 2.0 * _b01;
        _b21 = _b01;
        _a11 = 2.0 * (ohm * ohm - 1.0) / c;
        _a21 = (1.0 - 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm) / c;
    }
}

function LPF2pApply_1(sample) {

    let delay_element_0 = 0, output = 0;
    if (_cutoff_freq1 <= 0.0) {
        // no filtering
        return sample;
    }
    else {
        delay_element_0 = sample - _delay_element_11 * _a11 - _delay_element_21 * _a21;
        // do the filtering
        if (isNaN(delay_element_0) || (!isFinite(delay_element_0))) {
            // don't allow bad values to propogate via the filter
            delay_element_0 = sample;
        }
        output = delay_element_0 * _b01 + _delay_element_11 * _b11 + _delay_element_21 * _b21;

        _delay_element_21 = _delay_element_11;
        _delay_element_11 = delay_element_0;

        // return the value.  Should be no need to check limits
        return output;
    }
}

var _cutoff_freq2;
var _a12;
var _a22;
var _b02;
var _b12;
var _b22;
var _delay_element_12; // buffered sample -1
var _delay_element_22; // buffered sample -2
function LPF2pSetCutoffFreq_2(sample_freq, cutoff_freq) {
    let fr = 0;
    let ohm = 0;
    let c = 0;

    fr = sample_freq / cutoff_freq;
    ohm = Math.tan(M_PI_F / fr);
    c = 1.0 + 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm;

    _cutoff_freq2 = cutoff_freq;
    if (_cutoff_freq2 > 0.0) {
        _b02 = ohm * ohm / c;
        _b12 = 2.0 * _b02;
        _b22 = _b02;
        _a12 = 2.0 * (ohm * ohm - 1.0) / c;
        _a22 = (1.0 - 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm) / c;
    }
}

function LPF2pApply_2(sample) {

    let delay_element_0 = 0, output = 0;
    if (_cutoff_freq2 <= 0.0) {
        // no filtering
        return sample;
    }
    else {
        delay_element_0 = sample - _delay_element_12 * _a12 - _delay_element_22 * _a22;
        // do the filtering
        if (isNaN(delay_element_0) || (!isFinite(delay_element_0))) {
            // don't allow bad values to propogate via the filter
            delay_element_0 = sample;
        }
        output = delay_element_0 * _b02 + _delay_element_12 * _b12 + _delay_element_22 * _b22;

        _delay_element_22 = _delay_element_12;
        _delay_element_12 = delay_element_0;

        // return the value.  Should be no need to check limits
        return output;
    }
}

var _cutoff_freq3;
var _a13;
var _a23;
var _b03;
var _b13;
var _b23;
var _delay_element_13; // buffered sample -1
var _delay_element_23; // buffered sample -2

function LPF2pSetCutoffFreq_3(sample_freq, cutoff_freq) {
    let fr = 0;
    let ohm = 0;
    let c = 0;

    fr = sample_freq / cutoff_freq;
    ohm = Math.tan(M_PI_F / fr);
    c = 1.0 + 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm;

    _cutoff_freq3 = cutoff_freq;
    if (_cutoff_freq3 > 0.0) {
        _b03 = ohm * ohm / c;
        _b13 = 2.0 * _b03;
        _b23 = _b03;
        _a13 = 2.0 * (ohm * ohm - 1.0) / c;
        _a23 = (1.0 - 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm) / c;
    }
}

function LPF2pApply_3(sample) {

    let delay_element_0 = 0, output = 0;
    if (_cutoff_freq3 <= 0.0) {
        // no filtering
        return sample;
    }
    else {
        delay_element_0 = sample - _delay_element_13 * _a13 - _delay_element_23 * _a23;
        // do the filtering
        if (isNaN(delay_element_0) || (!isFinite(delay_element_0))) {
            // don't allow bad values to propogate via the filter
            delay_element_0 = sample;
        }
        output = delay_element_0 * _b03 + _delay_element_13 * _b13 + _delay_element_23 * _b23;

        _delay_element_23 = _delay_element_13;
        _delay_element_13 = delay_element_0;

        // return the value.  Should be no need to check limits
        return output;
    }
}

var _cutoff_freq4;
var _a14;
var _a24;
var _b04;
var _b14;
var _b24;
var _delay_element_14; // buffered sample -1
var _delay_element_24; // buffered sample -2
function LPF2pSetCutoffFreq_4(sample_freq, cutoff_freq) {
    let fr = 0;
    let ohm = 0;
    let c = 0;

    fr = sample_freq / cutoff_freq;
    ohm = Math.tan(M_PI_F / fr);
    c = 1.0 + 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm;

    _cutoff_freq4 = cutoff_freq;
    if (_cutoff_freq4 > 0.0) {
        _b04 = ohm * ohm / c;
        _b14 = 2.0 * _b04;
        _b24 = _b04;
        _a14 = 2.0 * (ohm * ohm - 1.0) / c;
        _a24 = (1.0 - 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm) / c;
    }
}

function LPF2pApply_4(sample) {

    let delay_element_0 = 0, output = 0;
    if (_cutoff_freq4 <= 0.0) {
        // no filtering
        return sample;
    }
    else {
        delay_element_0 = sample - _delay_element_14 * _a14 - _delay_element_24 * _a24;
        // do the filtering
        if (isNaN(delay_element_0) || (!isFinite(delay_element_0))) {
            // don't allow bad values to propogate via the filter
            delay_element_0 = sample;
        }
        output = delay_element_0 * _b04 + _delay_element_14 * _b14 + _delay_element_24 * _b24;

        _delay_element_24 = _delay_element_14;
        _delay_element_14 = delay_element_0;

        // return the value.  Should be no need to check limits
        return output;
    }
}

var _cutoff_freq5;
var _a15;
var _a25;
var _b05;
var _b15;
var _b25;
var _delay_element_15; // buffered sample -1
var _delay_element_25; // buffered sample -2
function LPF2pSetCutoffFreq_5(sample_freq, cutoff_freq) {
    let fr = 0;
    let ohm = 0;
    let c = 0;

    fr = sample_freq / cutoff_freq;
    ohm = Math.tan(M_PI_F / fr);
    c = 1.0 + 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm;

    _cutoff_freq5 = cutoff_freq;
    if (_cutoff_freq5 > 0.0) {
        _b05 = ohm * ohm / c;
        _b15 = 2.0 * _b05;
        _b25 = _b05;
        _a15 = 2.0 * (ohm * ohm - 1.0) / c;
        _a25 = (1.0 - 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm) / c;
    }
}

function LPF2pApply_5(sample) {

    let delay_element_0 = 0, output = 0;
    if (_cutoff_freq5 <= 0.0) {
        // no filtering
        return sample;
    }
    else {
        delay_element_0 = sample - _delay_element_15 * _a15 - _delay_element_25 * _a25;
        // do the filtering
        if (isNaN(delay_element_0) || (!isFinite(delay_element_0))) {
            // don't allow bad values to propogate via the filter
            delay_element_0 = sample;
        }
        output = delay_element_0 * _b05 + _delay_element_15 * _b15 + _delay_element_25 * _b25;

        _delay_element_25 = _delay_element_15;
        _delay_element_15 = delay_element_0;

        // return the value.  Should be no need to check limits
        return output;
    }
}

var _cutoff_freq6;
var _a16;
var _a26;
var _b06;
var _b16;
var _b26;
var _delay_element_16; // buffered sample -1
var _delay_element_26; // buffered sample -2
function LPF2pSetCutoffFreq_6(sample_freq, cutoff_freq) {
    let fr = 0;
    let ohm = 0;
    let c = 0;

    fr = sample_freq / cutoff_freq;
    ohm = Math.tan(M_PI_F / fr);
    c = 1.0 + 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm;

    _cutoff_freq6 = cutoff_freq;
    if (_cutoff_freq6 > 0.0) {
        _b06 = ohm * ohm / c;
        _b16 = 2.0 * _b06;
        _b26 = _b06;
        _a16 = 2.0 * (ohm * ohm - 1.0) / c;
        _a26 = (1.0 - 2.0 * Math.cos(M_PI_F / 4.0) * ohm + ohm * ohm) / c;
    }
}

function LPF2pApply_6(sample) {

    let delay_element_0 = 0, output = 0;
    if (_cutoff_freq6 <= 0.0) {
        // no filtering
        return sample;
    }
    else {
        delay_element_0 = sample - _delay_element_16 * _a16 - _delay_element_26 * _a26;
        // do the filtering
        if (isNaN(delay_element_0) || !(isFinite(delay_element_0))) {
            // don't allow bad values to propogate via the filter
            delay_element_0 = sample;
        }
        output = delay_element_0 * _b06 + _delay_element_16 * _b16 + _delay_element_26 * _b26;

        _delay_element_26 = _delay_element_16;
        _delay_element_16 = delay_element_0;

        // return the value.  Should be no need to check limits
        return output;
    }
}