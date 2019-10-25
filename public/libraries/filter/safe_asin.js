safe_asin = function (v) {
    // console.log(v);//watch how the v is impacting the asin.
    if (isNaN(v)) {
        return 0.0;
    }
    if (v >= 1.0) {
        return Math.PI / 2;
    }
    if (v <= -1.0) {
        return -Math.PI / 2;
    }
    return Math.asin(v);
}
