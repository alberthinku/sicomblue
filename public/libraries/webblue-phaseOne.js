//of index js code

class webblue_phaseOne {

    constructor(name, realname) {
        this.name = name;
        this.realname = realname;
        this.scanObj = null;
        this.status_connected = 'status_connected' + this.name;
        this.status_discovered = 'status_discovered' + this.name;
        this.status_notifications = 'status_notifications' + this.name;
        this.charFeatureMotionSensorLable = 'charFeatureMotionSensor' + this.name;
        this.chardatanotification = 'chardatanotification' + this.name
        this.status_device_name = 'device_name' + this.name;
        this.device_name = 'NaN';
        this.btn_scan = 'btn_scan' + this.name;
        this.discoveredSvcsAndChars = [];

        this.UI_textInputDialogPrefix = "TTin";
        this.UI_labelPrefix = "LB";
        this.UI_checkboxPrefix = "CB";//the UI_checkboxEndfix = "R/W/N" depending on the box

        this.parsedJsonObj = new parseJson(null);

        this.connected = false;
        this.services_discovered = false;
        this.collectedData = [];

        this.selected_device = null;
        this.connected_server = null;

        this.notification_enabled = [];
        this.detected_services = [];//will collect all the detected services handle
        this.detected_Chars = [];//will collect all the detected characteristics handle
        this.detected_Chars_uuid = [];//will collect all the detected uuid in chars' discovery sequence.
        this.selected_Service_uuid = "";

        this.parseObjJson_Char_uuid = [];//should collect all the characteristic uuid, note this uuid list comes from parsedJsonObj file, it not matching to selected_Char after the discovery process!

        this.selected_Char = []; //should collect all the selected characteristic handle

        this.updated_Char_choice_R = [];//should collect all the selected char with Readable confirmed
        this.updated_Char_choice_W = [];//should collect all the selected char with writable confirmed
        this.updated_Char_choice_N = [];//should collect all the selected char with Notifiable confirmed

        this.has_selected_service = false;
        this.has_selected_Char = false;
        this.statusInit();

    }//webblue_phaseOne constructor

    statusInit = function () {
        if (this.connected) {
            //note there will be a slim chance (as a matter of fact) that during the servicechar discovery process statusInit() been called by step.1 choice change
            //which might create ui and read connection not in pair.... this is a known bug, but can be fixed if user push reset button once he found something wrong
            this.selected_device.gatt.disconnect();
            this.unlockMySelectedProfile();
        }//if device is connected, then disconnect it

        this.resetUI();
        // document.getElementById(this.status_connected).innerHTML = "false";
        // document.getElementById(this.status_device_name).innerHTML = "NA";
        // document.getElementById(this.status_discovered).innerHTML = "false";
        document.getElementById(this.status_notifications).innerHTML = "false";
    }

    disassembleEventDataOffset(uuid) {
        // var offset = this.parsedJsonObj.L2_Char_offset[this.parsedJsonObj.L2_Char.indexOf(uuid)];
        var offset = this.parsedJsonObj.L2_Char_offset[uuid];
        return offset;
    }

    disassembleEventDataValidEnd(uuid) {
        // var ValidEnd = this.parsedJsonObj.L2_Char_end[this.parsedJsonObj.L2_Char.indexOf(uuid)];
        var ValidEnd = this.parsedJsonObj.L2_Char_end[uuid];
        return ValidEnd;
    }

    makeObjJson = function (obj) {
        this.scanObj = obj; //this.scanObj is the Json.Parse() output result, which did not make data interpretion yet
        this.parsedJsonObj = new parseJson(obj); //this.parsedJsonObj is the parseJson() output result, which has been interpreted
        return this.parsedJsonObj;
    }

    getPrepared(target) {
        var prefix = target.name.substring(0, 2); //namePrefix matching var

        var index = this.scanObj.namePrefix.indexOf(prefix); //if the prefix in the scanObj.namePrefix then obtain all the char

        if (index > -1) {
            this.selected_Service_uuid = this.scanObj.Service[0].UUID;//note this Service[0] stored the only services array matched by prefix name, as we put name options in same prefix array instead of split
            //TODO may need to think about a better way to match the prefix and services.//TODO
            for (var sel in this.scanObj.Char) {
                this.parseObjJson_Char_uuid.push(this.scanObj.Char[sel].UUID);
            }
        }
    }//of getPrepared

    resetUI() {
        this.setConnectedStatus(false);
        this.setDiscoveryStatus(false);

        document.getElementById(this.chardatanotification).innerHTML = "";

        this.collectedData = [];
        console.log('ended resetUI');
    }//resetUI

    setNotificationStatus(uuid, status, updated_Char_choice_N) {

        // if (index == -1) { this.notification_enabled = []; }
        this.notification_enabled[uuid] = status;
        document.getElementById(this.UI_checkboxPrefix + uuid + "ckbox_N").disabled = status;//make sure when char is notifying, dont change the notification status before stop it
        var notification_status_output = "";
        updated_Char_choice_N.forEach(_ => {
            var uuidforN = _.uuid;
            notification_status_output += uuidforN + ":" + this.notification_enabled[uuidforN] + "<br>";
        });
        document.getElementById(this.status_notifications).innerHTML = notification_status_output;
    }//setNotificationStatus

    setConnectedStatus(status) {
        this.connected = status;
        document.getElementById(this.status_connected).innerHTML = status;
        if (status == true) {
            document.getElementById(this.btn_scan).innerHTML = "Disconnect_" + this.name;
            document.getElementById(this.status_device_name).innerHTML = this.device_name;
        } else {
            document.getElementById(this.btn_scan).innerHTML = "discoverDevices_" + this.name;
            document.getElementById(this.status_device_name).innerHTML = 'NaN';
        }
    }//setConnectedStatus

    setDiscoveryStatus(status) {
        this.has_selected_service = status;
        document.getElementById(this.status_discovered).innerHTML = status;
    }//setDiscoveryStatus



    discoverDevicesOrDisconnect() {
        console.log("discoverDevicesOrDisconnect");
        if (!this.connected) {
            this.discoverDevices();
        } else {
            this.statusInit();
            // this.selected_device.gatt.disconnect();

        }
    }//discoverDevicesOrDisconnect

    discoverDevices() {
        console.log("discoverDevices");

        var tmpFilter = [];
        this.parsedJsonObj.L0_namePrefix
            .forEach(element => {
                tmpFilter.push({ namePrefix: element });
            });
        this.parsedJsonObj.L1_Service
            .forEach(element => {
                tmpFilter.push({ services: [element] })
            });
        var options = {
            filters:
                tmpFilter,
            optionalServices: []
        }

        navigator.bluetooth.requestDevice(options)
            .then(device => {
                console.log('> Name:           ' + device.name);
                console.log('> Id:             ' + device.id);
                console.log('> Connected:      ' + device.gatt.connected);
                this.selected_device = device;
                console.log(this.selected_device);
                this.getPrepared(this.selected_device);
                this.connect();// this function will connect to the device
                this.device_name = device.name;
            })
            .catch(error => {
                alert('ERROR: ' + error);
                console.log('ERROR: ' + error);
            });

    }//discoverDevices

    readDataview(uuid, buffer) {
        //TODO

        var dataType = this.parsedJsonObj.L2_Char_datatype[uuid];
        var byteOffset = this.parsedJsonObj.L2_Char_offset[uuid];
        var byteLength = this.parsedJsonObj.L2_Char_byteLength[uuid];
        if (byteLength > buffer.byteLength - byteOffset) byteLength = buffer.byteLength - byteOffset;
        var littleEndian = this.parsedJsonObj.L2_Char_littleEndian[uuid];
        var dataview = new DataView(buffer.buffer, byteOffset, byteLength);

        var bufferArray = [];

        if (dataType == "Int16") {
            // textencodeKey = "Int16";
            bufferArray = new Int16Array(dataview.buffer, byteOffset, byteLength / 2);
        }

        if (dataType == "Int32") {
            // textencodeKey = "Int16";
            bufferArray = new Int32Array(dataview.buffer, byteOffset, byteLength / 4);
        }

        if (dataType == "Uint8") {
            // textencodeKey = "Uint8";
            bufferArray = new Uint8Array(dataview.buffer, byteOffset, byteLength);
        }

        if (dataType == "Int8") {
            // textencodeKey = "Int8";
            bufferArray = new Int8Array(dataview.buffer, byteOffset, byteLength);
        }

        if (dataType == "Uint16") {
            // textencodeKey = "Uint16";
            bufferArray = new Uint16Array(dataview.buffer, byteOffset, byteLength / 2);
        }

        if (dataType == "Utf8") {
            // textencodeKey = "utf-8";
            bufferArray = new Uint8Array(dataview.buffer, byteOffset, byteLength);
        }

        return bufferArray;
    }//readDataview

    commitCharacteristicRead(updated_Char_choice_R) {
        console.log("CharacteristicReading");
        if (!(this.connectStatusValidated())) return;


        updated_Char_choice_R.forEach(sChars => {
            if (sChars == null) return;
            if ((updated_Char_choice_R.indexOf(sChars) < 0)) return;

            var index = this.selected_Char.indexOf(sChars);
            if ((index < 0)) return;

            sChars.readValue()
                .then(dataRcv => {
                    console.log("data read successfully" + dataRcv);

                    var uuid = sChars.uuid;
                    var dataReadout = this.readDataview(uuid, dataRcv);
                    console.log(dataReadout);

                    var wTS = this.parsedJsonObj.L2_Char_wTS[uuid];
                    var TS = -1;

                    var handle = document.getElementById(this.UI_labelPrefix + uuid);
                    handle.className = "danger";

                    if (wTS) {
                        var TS = dataRcv.getUint16(0, this.parsedJsonObj.L2_Char_littleEndian[uuid]);
                        handle.innerHTML = "Char Reading>>" + uuid + ":" + wTS + "TS=" + TS + ">" + dataReadout;
                    } else {
                        handle.innerHTML = "Char Reading>>" + uuid + "=" + ">" + dataReadout;
                    }


                })
                .catch(error => {
                    console.log('Error: ' + error);
                    alert('Error: ' + error);
                    return;
                });

        });
    }

    getCharTextInput(uuid) {
        var buffer = document.getElementById("TTin" + uuid).value;
        return buffer;
    }

    commitCharacteristicWrite(updated_Char_choice_W) {
        console.log("CharacteristicWriting");
        //state validation
        if (!(this.connectStatusValidated())) return;

        updated_Char_choice_W.forEach(sChars => {
            if (sChars == null) return;
            if ((updated_Char_choice_W.indexOf(sChars) < 0)) return;

            var index = this.selected_Char.indexOf(sChars);
            if ((index < 0)) return;

            var dataType = this.parsedJsonObj.L2_Char_datatype[sChars.uuid];
            var dataLength = this.parsedJsonObj.L2_Char_byteLength[sChars.uuid];
            var byteOffset = this.parsedJsonObj.L2_Char_offset[sChars.uuid];
            var littleEndian = this.parsedJsonObj.L2_Char_littleEndian[sChars.uuid];
            var textencodeKey = "";

            var strInput = this.getCharTextInput(sChars.uuid);
            var numberArray = strInput.split(",");

            //TODO: should be the length overflowed, then process safely and completely the write.

            if (strInput.length > dataLength) strInput = strInput.substring(0, dataLength);
            var buffer = new ArrayBuffer(1);
            if (numberArray.length > dataLength) numberArray = numberArray.slice(0, dataLength);

            if (dataType == "Int16") {
                textencodeKey = "Int16";
                // buffer = new Int16Array([parseInt(strInput)]);
                buffer = new Int16Array(numberArray.map(x => parseInt(x)));
            }

            if (dataType == "Int32") {
                textencodeKey = "Int32";
                // buffer = new Int16Array([parseInt(strInput)]);
                buffer = new Int32Array(numberArray.map(x => parseInt(x)));
            }

            if (dataType == "Uint8") {
                textencodeKey = "Uint8";
                // buffer = new Uint8Array([parseInt(strInput)]);
                buffer = new Uint8Array(numberArray.map(x => parseInt(x)));
            }

            if (dataType == "Int8") {
                textencodeKey = "Int8";
                // buffer = new Int8Array([parseInt(strInput)]);
                buffer = new Int8Array(numberArray.map(x => parseInt(x)));
            }

            if (dataType == "Uint16") {
                textencodeKey = "Uint16";
                // buffer = new Uint16Array([parseInt(strInput)]);
                buffer = new Uint16Array(numberArray.map(x => parseInt(x)));
            }

            if (dataType == "Utf8") {
                textencodeKey = "utf-8";
                buffer = new TextEncoder(textencodeKey).encode(strInput);
            }

            console.log("writing: " + buffer.length + "bytes" + "=" + buffer);

            sChars.writeValue(buffer.buffer)
                .then(_ => {
                    console.log("value writed");
                    //TODO to show accordingly
                    var uuid = sChars.uuid;
                    var handle = document.getElementById(this.UI_labelPrefix + uuid);
                    handle.className = "danger";
                    handle.innerHTML = "Char writing>>" + uuid + "<=" + buffer;
                })
                .catch(error => {
                    console.log('Error: ' + error);
                    alert('Error: ' + error);
                    return;
                });


        });

    }

    toggleCharacteristicNotifications(updated_Char_choice_N) {
        console.log("toggleCharacteristicNotifications");

        if (!(this.connectStatusValidated())) return;

        updated_Char_choice_N.forEach(sChars => {
            if (sChars == null) return;

            var index = this.selected_Char.indexOf(sChars);

            if ((index < 0)) return;

            var uuid = sChars.uuid;

            if (!this.notification_enabled[uuid]) {
                sChars.startNotifications()
                    .then(_ => {
                        console.log(sChars + 'notification started');
                        this.setNotificationStatus(uuid, true, updated_Char_choice_N);
                        sChars.addEventListener('characteristicvaluechanged', this.onSelectedCharData.bind(this));
                    })
                    .catch(error => {
                        console.log('Error: ' + error);
                        alert('Error: ' + error);
                        return;
                    });
            } else {
                sChars.stopNotifications()
                    .then(_ => {
                        console.log(sChars + 'notificaitons stopped');
                        console.log('saving data');
                        this.setNotificationStatus(uuid, false, updated_Char_choice_N);
                        //remove this event listener when we unsubscribe
                        sChars.removeEventListener('characteristicvaluechanged', this.onSelectedCharData);
                    })
                    .catch(error => {
                        console.log('Could not stop' + sChars + 'notifications: ' + error);
                    });
            }
        });

    }//toggleCharisticNotifications

    connectStatusValidated = function () {
        //state validation
        if (!this.connected) {
            alert("Error: Discover and connect to a device before using this function");
            return false;
        }
        if (!this.has_selected_service) {
            alert("Error: Service discovery has not yet completed");
            return false;
        }
        return true;
    }//connectStatusValidated

    commitCharActions = function (isCommitAllAction, choice_N, choice_R, choice_W) {
        //if commitAllAction, then scan all the updated_Char_choice_x, otherwise, scan specific choice_x
        if (isCommitAllAction) {
            var updated_Char_choice_N = this.updated_Char_choice_N;
            var updated_Char_choice_R = this.updated_Char_choice_R;
            var updated_Char_choice_W = this.updated_Char_choice_W;
        } else {
            var updated_Char_choice_N = choice_N;
            var updated_Char_choice_R = choice_R;
            var updated_Char_choice_W = choice_W;
        }

        if ((updated_Char_choice_N.length > 0)) this.toggleCharacteristicNotifications(updated_Char_choice_N);
        if ((updated_Char_choice_R.length > 0)) this.commitCharacteristicRead(updated_Char_choice_R);
        if ((updated_Char_choice_W.length > 0)) this.commitCharacteristicWrite(updated_Char_choice_W);
    }//commitCharActions

    commitCharActionsImmy(uuid) {
        var box_N = document.getElementById(this.UI_checkboxPrefix + uuid + "ckbox_N").checked;
        var box_W = document.getElementById(this.UI_checkboxPrefix + uuid + "ckbox_W").checked;
        var box_R = document.getElementById(this.UI_checkboxPrefix + uuid + "ckbox_R").checked;
        var choice_N = [];
        var choice_W = [];
        var choice_R = [];

        var charForPush = this.detected_Chars[this.detected_Chars_uuid.indexOf(uuid)];

        if (box_N) choice_N.push(charForPush);
        if (box_W) choice_W.push(charForPush);
        if (box_R) choice_R.push(charForPush);

        this.commitCharActions(false, choice_N, choice_R, choice_W);
    }

    lockMySelectedProfile() {
        document.getElementById("mySelectedProfile").disabled = true;
    }//lock step.1 selection

    unlockMySelectedProfile() {
        document.getElementById("mySelectedProfile").disabled = false;
    }//lock step.1 selection

    connect() {
        if (this.connected == false) {
            this.lockMySelectedProfile();//once entering into connect process, lock the selectedprofile ui
            console.log('connecting');
            this.selected_device.gatt.connect()
                .then(server => {
                    console.log('Connected to ' + server.device.id);
                    console.log('connected = ' + server.connected);
                    this.setConnectedStatus(true);
                    this.connected_server = server;
                    this.selected_device.addEventListener(
                        'gattserverdisconnected',
                        this.onDisconnected.bind(this));
                    // onDisconnected.bind(this));
                    this.discoverSvcsAndChars();
                })
                .catch(error => {
                    console.log('ERROR: could not connect -' + error);
                    alert('ERROR: could not connect -' + error);
                    this.setConnectedStatus(false);
                });
        }
    }//connect


    discoverSvcsAndChars = function () {
        //         discoveredSvcsAndChars = [];
        console.log("discoverSvcsAndChars server=" + this.connected_server);
        this.connected_server.getPrimaryServices()
            .then(services => {

                this.has_selected_service = false;

                var service_discovered = 0;
                var service_count = services.length;
                console.log("Got" + this.service_count + " services");

                services.forEach(service => {
                    var serviceUUID = service.uuid;
                    if (serviceUUID == this.selected_Service_uuid) {
                        this.has_selected_service = true;
                    }

                    console.log('getting Characteristics for service' + serviceUUID);

                    this.detected_services.push(service);//collect all the detected service handles
                    this.discoveredSvcsAndChars.push({ serviceUUID });


                    service.getCharacteristics().then(characteriscs => {
                        console.log('> Service: ' + service.uuid);
                        service_discovered++;
                        var characteriscs_discovered = 0;
                        var characterisc_count = characteriscs.length;

                        characteriscs.forEach(characterisc => {
                            characteriscs_discovered++;
                            var charUUID = characterisc.uuid;
                            console.log('>> Characteristic: ' + charUUID);

                            this.detected_Chars.push(characterisc);//collect all the discovered char handle
                            this.detected_Chars_uuid.push(charUUID);

                            this.discoveredSvcsAndChars.push({ charUUID });

                            var index = this.parseObjJson_Char_uuid.indexOf(characterisc.uuid);//from parsedJson Obj, we shrink the range of selected_Char

                            // if (!(index < 0)) { this.selected_Char[index] = characterisc; }
                            if (!(index < 0)) {
                                this.selected_Char.push(characterisc);
                            }

                            if (service_discovered == service_count && characteriscs_discovered == characterisc_count) {
                                console.log("FINISHED DISCOVERY");
                                this.setDiscoveryStatus(true);
                            }
                        });
                    });
                });
            })
            .catch(error => {
                console.log('ERROR: getPrimaryservice -' + error);
                alert('ERROR: getPrimaryservice -' + error);
                this.setConnectedStatus(false);
            });

    }//discoverSvcsAndChars

    onDisconnected = function () {
        var tmp = this;
        console.log("onDisconnected");
        var userPreference = "";

        if (tmp.collectedData.length > 0) {
            if (confirm("Do you want to save datalogs?") == true) {
                userPreference = "Data saved successfully!";
                if (tmp.collectedData.length > 0) {
                    saveData(tmp.collectedData, tmp.realname + "-my-webblue-data.json");
                } else {
                    alert("no available data!");
                } //if length
            } else {
                userPreference = "Save Canceled!";
            }// if confirmation

            console.log(userPreference);
        }

        // if (tmp.discoveredSvcsAndChars.length > 0)
        //     saveData(tmp.discoveredSvcsAndChars, tmp.realname + "discoveredSvsAndChars.json");

        tmp.resetUI();
    }//onDisconnencted

    buf2hex = function (buffer) { // buffer is an ArrayBuffer
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    }


    onSelectedCharData = function (event) {
        var node = this;
        // function onFeatureSensorData(event) {
        // console.log(node);
        var uuid = event.currentTarget.uuid;

        var buffer = event.target.value.buffer;
        var dataview = new DataView(buffer);
        var TS = dataview.getUint16(0, true);

        var readoutData = this.readDataview(uuid, dataview);
        // var rowData = TextDecoderStream()
        document.getElementById(node.chardatanotification).innerHTML = uuid + ":" + readoutData;

        var wTS = node.parsedJsonObj.L2_Char_wTS[uuid];
        var bufferIn = new Uint8Array(buffer).buffer;
        var bufferInhex = this.buf2hex(bufferIn);

        // console.log(bufferInhex); // 
        var handle = document.getElementById(node.UI_labelPrefix + uuid);
        handle.className = "danger";
        handle.innerHTML = "Char Notifying>>" + uuid + ":" + wTS + "TS=" + TS + ">" + readoutData;

        node.collectedData.push({ uuid, bufferInhex, wTS, TS, readoutData });
        // return motionSensorData;

    }//onSelectedChar

}//webblue-phaseOne
