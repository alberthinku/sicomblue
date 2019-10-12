/*
https://www.sensorsone.com/local-gravity-calculator/

Formulas
The formulas used by this calculator are based on the International Gravity Formula IGF) 1980 from the parameters of the Geodetic Reference System 1980 (GRS80), which determines the gravity from the position of latitude, and the Free Air Correction (FAC) which corrects for height above sea level.

IGF = 9.780327 (1 + 0.0053024sin2Φ – 0.0000058sin22Φ)

FAC = -3.086 x 10-6 x h

g = IGF + FAC

Symbols
g = Theoretical local gravity
IGF = International Gravity Formula
FAC = Free Air Correction
Φ = Lattitude
h = Height relative to sea level
*/

function latitude2Gracity(lat, height) {
    let IGF = 9.780327 * (1 + 0.0053024 * Math.sin(lat) * Math.sin(lat) - 0.0000058 * Math.sin(2 * lat) * Math.sin(2 * lat));
    let FAC = -3.086 * 1e-6 * height;
    return (IGF + FAC);
}

function updateLocalGravCalc(lat = 52.486244, height = 100) {
    let latInput = document.getElementById("LatValue").value;
    let heighInput = document.getElementById("HeightValue").value;
    let d2r = Math.PI / 180;
    // let localGravity = 9.8;

    if (latInput > -90 && latInput < 90 && heighInput < 8848 && heighInput > -488) {
        localGravity = latitude2Gracity(latInput * d2r, heighInput);
    } else { localGravity = 9.8; }

    document.getElementById("GravValue").placeholder = localGravity;
}