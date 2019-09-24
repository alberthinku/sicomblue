checkBoxRWNAsst = function (deviceId) {
    myWindow[deviceId].refreshSelf(deviceNo[deviceId], true);
}

checkBoxImmyActAsst = function (tag) {
    let uuid = tag.slice(-36);//tag = [deviceId]+[">CB"]+uuid
    // console.log(uuid);
    let deviceId = tag.split(">", 1);
    if (deviceNo[deviceId] == null) return;
    deviceNo[deviceId].commitCharActionsImmy(uuid);
}
