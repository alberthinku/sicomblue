function addOneMoreNode(nodeCount) {

    document.getElementById("minusNode").disabled = false;

    if (nodeCount > nodeMax) {
        alert("out of number!");
        deviceCount = nodeMax;
        return
    } else if (nodeCount == nodeMax) {
        document.getElementById("addNode").disabled = true;
    }

    console.log("add one more node!");
    let statusTable = document.getElementById("statusTbody");
    let oneMoreLine = document.createElement("tr");
    oneMoreLine.setAttribute("id", "statusLine" + nodeCount);
    // oneMoreLine.setAttribute("type", "tr");
    let lineBox = document.createElement("td");
    lineBox.append(nodeCount);
    // lineBox.setAttribute("type", "td");
    oneMoreLine.appendChild(lineBox);//append nodeCount to oneMoreLine

    let lineBoxConnectStatus = document.createElement("td");
    lineBoxConnectStatus.setAttribute("id", "status_connected" + nodeCount);
    lineBoxConnectStatus.append("false");
    oneMoreLine.append(lineBoxConnectStatus);//append the Connect_Status to oneMoreLine

    let lineBoxDeviceName = document.createElement("td");
    lineBoxDeviceName.setAttribute("id", "device_name" + nodeCount);
    lineBoxDeviceName.append("NA");
    oneMoreLine.append(lineBoxDeviceName);//append the device_name to oneMoreLine

    let lineBoxStatusDiscovered = document.createElement("td");
    lineBoxStatusDiscovered.setAttribute("id", "status_discovered" + nodeCount);
    lineBoxStatusDiscovered.append("false");
    oneMoreLine.append(lineBoxStatusDiscovered);//append the status_discoverd to oneMoreLine

    let lineBoxStatusNotifications = document.createElement("td");
    lineBoxStatusNotifications.setAttribute("id", "status_notifications" + nodeCount);
    lineBoxStatusNotifications.append("false");
    oneMoreLine.append(lineBoxStatusNotifications);//append the status_discoverd to oneMoreLine

    let lineBoxSelectProfileTd = document.createElement("td"); //start to draw the select profile form
    oneMoreLine.append(lineBoxSelectProfileTd); //append profile td to oneMoreLine
    let lineBoxSelectProfileForm = document.createElement("form");
    lineBoxSelectProfileTd.appendChild(lineBoxSelectProfileForm); //append profileform as child of profileTd
    lineBoxSelectProfileForm.setAttribute("id", "profileSelectForm" + nodeCount);
    let lineBoxSelectProfile = document.createElement('select');
    lineBoxSelectProfileForm.appendChild(lineBoxSelectProfile);//append profileselect as child of profileForm
    lineBoxSelectProfile.setAttribute("class", "small grey button");
    lineBoxSelectProfile.setAttribute("id", "mySelectedProfile" + nodeCount);
    lineBoxSelectProfile.setAttribute("onchange", "selectProfile(this.value, 'libraries/', " + nodeCount + ")");
    let lineBoxSelectProfileOption = document.createElement("option");
    lineBoxSelectProfile.appendChild(lineBoxSelectProfileOption);//append profileOption as child of profile
    lineBoxSelectProfileOption.setAttribute("value", "");
    lineBoxSelectProfileOption.setAttribute("selected", "selected");
    lineBoxSelectProfileOption.setAttribute("disabled", "true");
    let lineBoxSelectProfileOptionBBC = document.createElement("option");
    lineBoxSelectProfile.appendChild(lineBoxSelectProfileOptionBBC);//append profileOption as child of profile
    lineBoxSelectProfileOptionBBC.setAttribute("value", "BBC_Microbit");
    lineBoxSelectProfileOptionBBC.append("BBC Microbit");
    let lineBoxSelectProfileOptionBlueST = document.createElement("option");
    lineBoxSelectProfile.appendChild(lineBoxSelectProfileOptionBlueST);//append profileOption as child of profile
    lineBoxSelectProfileOptionBlueST.setAttribute("value", "ST_BLUEST");
    lineBoxSelectProfileOptionBlueST.append("ST BlueST");
    let lineBoxSelectProfileOptionBlueSTfull = document.createElement("option");
    lineBoxSelectProfile.appendChild(lineBoxSelectProfileOptionBlueSTfull);//append profileOption as child of profile
    lineBoxSelectProfileOptionBlueSTfull.setAttribute("value", "ST_BLUEST_full");
    lineBoxSelectProfileOptionBlueSTfull.append("ST BlueST_full");
    let lineBoxSelectProfileOptionBlueNRG = document.createElement("option");
    lineBoxSelectProfile.appendChild(lineBoxSelectProfileOptionBlueNRG);//append profileOption as child of profile
    lineBoxSelectProfileOptionBlueNRG.setAttribute("value", "ST_BlueNRG");
    lineBoxSelectProfileOptionBlueNRG.append("ST BlueNRG");

    if (cubeEnabled) {
        let lineBoxSelectProfileOptionBlueSTFusion = document.createElement("option");
        lineBoxSelectProfile.appendChild(lineBoxSelectProfileOptionBlueSTFusion);//append profileOption as child of profile
        lineBoxSelectProfileOptionBlueSTFusion.setAttribute("value", "ST_BLUEST_fusion");
        lineBoxSelectProfileOptionBlueSTFusion.append("ST fusion");
    };

    let lineBoxUploadProfileTd = document.createElement("td"); //start to draw the upload profile form
    oneMoreLine.append(lineBoxUploadProfileTd); //append upload profile td to oneMoreLine
    let lineBoxUploadProfileForm = document.createElement("form");
    lineBoxUploadProfileTd.appendChild(lineBoxUploadProfileForm); //append profileform as child of profileTd
    lineBoxUploadProfileForm.setAttribute("id", "uploadForm" + nodeCount);
    let lineBoxUploadProfileInput = document.createElement("input");
    lineBoxUploadProfileForm.appendChild(lineBoxUploadProfileInput);//append uploadprofileinput as child of uploadprofileForm
    lineBoxUploadProfileInput.setAttribute("type", "file");
    lineBoxUploadProfileInput.setAttribute("id", "file-input" + nodeCount);
    lineBoxUploadProfileInput.setAttribute("oninput", "addAprofile('file-input" + nodeCount + "')");

    statusTable.appendChild(oneMoreLine);

    let btnScanButton = document.getElementById("btnScanButton");
    let oneMoreButton = document.createElement("button");
    oneMoreButton.setAttribute("id", "btn_scan" + nodeCount);
    oneMoreButton.setAttribute("class", "small button");
    oneMoreButton.setAttribute("onclick", "deviceDiscoverOrDisconnectCall(deviceNo['" + nodeCount + "'])");
    oneMoreButton.setAttribute("disabled", true);
    oneMoreButton.append("discoverDevices");

    btnScanButton.appendChild(oneMoreButton);//add oneMoreButton to btnScanButton as a child

    let step3AllAction = document.getElementById("step3AllAction");
    let oneMoreActionButton = document.createElement("button");
    oneMoreActionButton.setAttribute("id", "btn_notify" + nodeCount);
    oneMoreActionButton.setAttribute("class", "small button");
    oneMoreActionButton.setAttribute("onclick", "processAllCharSelections(deviceNo['" + nodeCount + "'])");
    oneMoreActionButton.setAttribute("disabled", "true");
    oneMoreActionButton.append("Dev_" + nodeCount + ":ProcessAllChar");

    step3AllAction.appendChild(oneMoreActionButton);//add oneMoreButton to btnScanButton as a child


    let charDataArea = document.getElementById("charDataArea");
    let oneMoreArea = document.createElement("div");
    oneMoreArea.setAttribute("id", "chardatanotification" + nodeCount);
    oneMoreArea.setAttribute("class", "notification");

    charDataArea.appendChild(oneMoreArea);


    let step3FinalShow = document.getElementById("step3FinalShow");
    // let addOneMoreLine = document.createElement("hr");
    // step3FinalShow.appendChild(addOneMoreLine);
    let oneMoreGattShow = document.createElement("span");
    oneMoreGattShow.setAttribute("id", nodeCount + "GATTShow");
    oneMoreGattShow.setAttribute("disabled", true);
    // oneMoreGattShow.append("device_no.", nodeCount);
    step3FinalShow.appendChild(oneMoreGattShow);


    let showJsonFile = document.getElementById("showJsonFile");
    let oneMoreShowJson = document.createElement("span");
    oneMoreShowJson.setAttribute("id", "showJson" + nodeCount);
    oneMoreShowJson.setAttribute("class", "xJSON");
    oneMoreShowJson.setAttribute("hidden", "true");
    // oneMoreShowJson.append("<br>");

    showJsonFile.appendChild(oneMoreShowJson);

    if (cubeEnabled) {
        let step4Cube = document.getElementById("step4Cube");
        // let oneMoredest_copyh1 = document.createElement("h1");
        // oneMoredest_copyh1.innerHTML = "drag Node" + nodeCount + " SensorFusionCompact Char into box :";
        // step4Cube.appendChild(oneMoredest_copyh1);
        let oneMoredest_copy = document.createElement("div");
        oneMoredest_copy.setAttribute("id", "dest_copy" + nodeCount);
        oneMoredest_copy.setAttribute("class", "info");
        oneMoredest_copy.setAttribute("ondrop", "drop_handler(event," + nodeCount + ");");
        oneMoredest_copy.setAttribute("ondragover", "dragover_handler(event," + nodeCount + ");");
        let oneMoredest_copyh1 = document.createElement("h1");
        oneMoredest_copyh1.innerHTML = "drag Node" + nodeCount + " SensorFusionCompact Char into box";
        oneMoredest_copy.appendChild(oneMoredest_copyh1);
        // oneMoredest_copy.innerHTML = "drag Node" + nodeCount + " SensorFusionCompact Char into box";
        step4Cube.appendChild(oneMoredest_copy);


        // step4Cube.appendChild(oneMoredest_copyRawh1);
        let oneMoredest_copyRaw = document.createElement("div");
        oneMoredest_copyRaw.setAttribute("id", "dest_copy_raw" + nodeCount);
        oneMoredest_copyRaw.setAttribute("class", "info");
        oneMoredest_copyRaw.setAttribute("ondrop", "drop_handler(event," + nodeCount + ");");
        oneMoredest_copyRaw.setAttribute("ondragover", "dragover_handler(event," + nodeCount + ");");
        let oneMoredest_copyRawh1 = document.createElement("h1");
        oneMoredest_copyRawh1.innerHTML = "drag Node" + nodeCount + " Raw 9 Axis Char into box";
        oneMoredest_copyRaw.appendChild(oneMoredest_copyRawh1);
        // oneMoredest_copyRaw.innerHTML = "drag Node" + nodeCount + " Raw 9 Axis Char into box";
        step4Cube.appendChild(oneMoredest_copyRaw);
        let oneMoredest_text = document.createElement("text");
        oneMoredest_text.setAttribute("id", "ifContent" + nodeCount);
        step4Cube.appendChild(oneMoredest_text);
        oneMoredest_text = document.createElement("text");
        oneMoredest_text.setAttribute("id", "thenContent" + nodeCount);
        step4Cube.appendChild(oneMoredest_text);
        oneMoredest_text = document.createElement("text");
        oneMoredest_text.setAttribute("id", "ifRawContent" + nodeCount);
        step4Cube.appendChild(oneMoredest_text);

    }

}
