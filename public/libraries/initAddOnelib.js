function removeOneMoreNode(nodeCount) {
    if (!(deviceNo[nodeCount] == undefined)) {

        deviceNo[nodeCount].statusInit();
        deviceNo[nodeCount] = undefined;
        myWindow[nodeCount] = undefined;

    }

    if (nodeCount > 0) {
        document.getElementById("statusLine" + nodeCount).remove();
        document.getElementById("btn_scan" + nodeCount).remove();
        document.getElementById("btn_notify" + nodeCount).remove();
        document.getElementById("chardatanotification" + nodeCount).remove();
        document.getElementById(nodeCount + "GATTShow").remove();
    }
    else {
        alert("no nodes exist!"); deviceCount = 0;
    }
    if (nodeCount == 1) { document.getElementById("minusNode").disabled = true; }
    document.getElementById("addNode").disabled = false;
}

function addAprofile(fileinputId) {
    console.log("adding a new Json profile!");
    var files = document.getElementById(fileinputId).files;
    var file = files[0];
    var deviceId = fileinputId.slice(-1);
    if (file == null) {
        return alert('No file selected.');
    }

    console.log(file.type);
    if (!(file.type == 'application/json')) {
        return alert("wrong file type!");
    }

    //multipart encoded:
    formData = new FormData();
    formData.append('file', file);

    xhr = new XMLHttpRequest();
    xhr.open("POST", "uploads", true);
    xhr.setRequestHeader("X-File-Name", file.name);//pass the file.name to server for storage
    xhr.send(formData);

    xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            // let ctmFileName = file.name.split('.')[0];
            ctmFileName = xhr.getResponseHeader('X-File-Name').split('.')[0];
            console.log(ctmFileName);
            // ctmFileName = "uploaded"; //test only on the uploaded.json file.
            selectProfile(ctmFileName, "uploads/", deviceId);
            xhr.abort();
        } else if (!(this.status == 200)) {
            console.log("new work request for .json failed with respone " + xhr.status + ": " + xhr.statusText);
            xhr.abort();
        }
    }

}//custom profile upload

function deviceDiscoverOrDisconnectCall(device) {
    if (!(device == undefined)) {
        device.discoverDevicesOrDisconnect();
    }
    else {
        alert("please go step.1 chose a profile first!")
    }
}
function processAllCharSelections(device) {
    console.log("processingAllCharSelections:", device.name)
    myWindow[device.name].refreshSelf(device, false);
    device.commitCharActions(true, [], [], []);
}

function selectProfile(profilename, dirFix, deviceId) {
    if (!(profilename == "")) {
        deviceNo[deviceId] = new webblue_phaseOne(deviceId, profilename);
    }
    else {
        // document.getElementById("mySelectedProfileDefault").disabled = true;
    }
    mySelectedProfile(dirFix, deviceId);
}

function reinit() {

    if (deviceNo == []) return;

    let dev = deviceNo.slice(1); //deviceNo[0] = empty, so cut it off

    dev.forEach(device => {
        if (device == undefined) return;
        device.statusInit();
        document.getElementById("profileSelectForm" + device.name).reset();
        document.getElementById("uploadForm" + device.name).reset();
        document.getElementById("btn_scan" + device.name).disabled = true;
        document.getElementById("showJson" + device.name).innerHTML = "";
        document.getElementById(device.name + "GATTShow").innerHTML = "";
        device = undefined;

    });
    if (cubeEnabled) {
        document.getElementById(cubeSFCompact.elementID).hidden = true;//hide the canvas when reset
        document.getElementById(cube9Axis.elementID).hidden = true;//hide the canvas when reset
        document.getElementById("ifContent").innerText = "";
        document.getElementById("ifRawContent").innerText = "";
        document.getElementById("thenContent").innerText = "";
        cubeSFCompact = new Cube(00, 0, 400, 200, "SFCompact", "drawCube");
        cube9Axis = new Cube(00, 0, 400, 200, "9Axis", "drawCube9Axis");
        IMU_Init();
    }

    deviceNo = [];
    myWindow = [];

}

function mySelectedProfile(dirFix, deviceId) {
    try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", dirFix + deviceNo[deviceId].realname + ".json", true);
        xmlhttp.responseType = 'json';
        var myObj;

        xmlhttp.onload = function () {
            if (xmlhttp.status === 200) {
                myObj = xmlhttp.response;
                if (myObj == null) { alert('wrong profile type uploaded, please reselect!'); reinit(); return -1 }
                document.getElementById("showJson" + deviceId).innerHTML = JSON.stringify(myObj);
                myWindow[deviceId] = new refreshLayer(deviceNo[deviceId].makeObjJson(myObj), deviceId);///refresh deviceId
                myWindow[deviceId].refreshSelf(deviceNo[deviceId], false);
                xmlhttp.abort();
            } else {
                console.log("new work request for .json failed with respone " + xmlhttp.status + ": " + xmlhttp.statusText);
            }
        }
        xmlhttp.send();

    }
    catch (error) {
        alert('ERROR: ' + error);
        console.log('ERROR: ' + error);
        reinit();
        return -1;
    }
}//selected profile implementation