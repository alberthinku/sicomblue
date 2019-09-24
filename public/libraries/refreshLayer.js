//UI textinput dialog : id = "TTin"+uuid
//UI label : id = "LB" +uuid
//UI checkbox : id = "CB" + uuid + "R/W/N"

class refreshLayer {
    constructor(obj, deviceId) {
        this.deviceId = deviceId;
        this.UI_textInputDialogPrefix = deviceId + ">TTin";
        this.UI_labelPrefix = deviceId + ">LB";
        this.UI_checkboxPrefix = deviceId + ">CB";//the UI_checkboxEndfix = "R/W/N" depending on the box
        this.textG = document.getElementById(deviceId + "GATTShow");
        this.textG.innerHTML = "";
        // document.getElementById
        this.L1_tagPre = "L1_Svc";
        this.L2_tagPre = "L2_Chr";
        this.L1_refreshed = false;
        if (!(obj == null)) {
            this.obj = obj;
            //obj is the parsedJson which contains fully info of the profile!
            this.textGATT = this.textG;
            // this.textGATT.appendChild(document.createElement("hr"));

            //L1
            this.L1_Service_Status = [];
            this.L1_Service_Show(obj.L1_Service, obj.L1_Service_name);
            //L2
            this.Listed_L2_Char = [];
            this.L2_Char_Show(obj.L2_Char, obj.L2_Char_name);
            //L0
            this.L0_button = "";
            this.L0_namePrefix_Show(obj.L0_namePrefix);
        }
    }

    L1_Service_refresh(dev, obj) {

        this.L1_refreshed = true;

        obj.L1_Service.forEach(uuid => {
            let index = dev.selected_Service.indexOf(uuid);
            if (index < 0) {
                let Srv_dev_UUID_span = document.getElementById("Service" + this.deviceId + uuid);
                Srv_dev_UUID_span.remove();
            }
        });

        dev.selected_Char.forEach(selected_C => {
            let uuid_Srv = selected_C.service.uuid;
            let uuid_Char = selected_C.uuid;
            let Char_dev_UUID_span = document.getElementById("Char" + this.deviceId + uuid_Char);
            let Srv_dev_UUID_span = document.getElementById("Service" + this.deviceId + uuid_Srv);
            Srv_dev_UUID_span.appendChild(Char_dev_UUID_span);//put the related Char under its Service
        });

        //TODO service connection status check
    }

    L2_Char_outputRestore(name, uuid) {
        var outputRestore = ">>Char name - " + name + " > UUID : " + uuid;
        var handle = document.getElementById(this.UI_labelPrefix + uuid);
        handle.className = "info";
        handle.innerHTML = (outputRestore);

    }//L2_Char_outputRestore

    L2_Char_refresh(dev, obj) {
        var status;
        dev.updated_Char_choice_R = [];
        dev.updated_Char_choice_W = [];
        dev.updated_Char_choice_N = [];
        var tmp_selected_Char_uuid = [];
        dev.selected_Char.forEach(element => {
            tmp_selected_Char_uuid.push(element.uuid);
        });

        for (var i = 0; i < this.Listed_L2_Char.length; i++) {
            // if dev.selected_Char[i].property
            if (this.Listed_L2_Char[i]) {
                try {

                    let uuid = obj.L2_Char[i];//comparing each L2 char UUID

                    let name = obj.L2_Char_name[i];
                    this.L2_Char_outputRestore(name, uuid);

                    let index = tmp_selected_Char_uuid.indexOf(uuid);

                    if (!(index < 0)) {
                        let selected_C = dev.selected_Char[index];
                        if (!(selected_C == null)) {
                            //sometime discovery service will put empty char in the array
                            let selected_Char_properties = selected_C.properties;

                            let tagCB = this.UI_checkboxPrefix + uuid;// the tagCB should seach each of the each L2 uuid and comparing it with selected_C

                            status = document.getElementById(tagCB + "ckbox_R");
                            let statusback = document.getElementById(tagCB + "ckbox_R" + "backbutton");

                            if (status.checked && selected_Char_properties.read) {
                                console.log("Char " + obj.L2_Char_name[i] + ">reading");
                                dev.updated_Char_choice_R.push(selected_C);
                            }
                            else if (status.checked) {
                                alert(obj.L2_Char_name[i] + ":Char is not readable!");
                                status.checked = false;
                                status.disabled = true;
                                statusback.disabled = true;

                            }
                            // status.disabled = !(selected_Char_properties.read);//disable the checkbox if not in the selected_Char_properties.read


                            status = document.getElementById(tagCB + "ckbox_W");
                            statusback = document.getElementById(tagCB + "ckbox_W" + "backbutton");
                            if (status.checked && selected_Char_properties.write) {
                                console.log("Char " + obj.L2_Char_name[i] + ">writing");
                                var tag_RWN_textinput = this.UI_textInputDialogPrefix + selected_C.uuid;
                                //this.L2_tagPre + i + "text";
                                this.RWN_textinputenable(tag_RWN_textinput, status);
                                dev.updated_Char_choice_W.push(selected_C);
                            }
                            else if (status.checked) {
                                alert(obj.L2_Char_name[i] + ":Char is not writable!");
                                status.checked = false;
                                status.disabled = true;
                                statusback.disabled = true;

                            }
                            else {
                                document.getElementById(this.UI_textInputDialogPrefix + selected_C.uuid).disabled = true;
                            }
                            // status.disabled = !(selected_Char_properties.write);//disable the checkbox if not in the selected_Char_properties.write

                            status = document.getElementById(tagCB + "ckbox_N");
                            statusback = document.getElementById(tagCB + "ckbox_N" + "backbutton");

                            // this.L2_tagPre + i
                            if (status.checked && selected_Char_properties.notify) {
                                console.log("Char " + obj.L2_Char_name[i] + ">notifying");
                                dev.updated_Char_choice_N.push(selected_C);
                            }
                            else if (status.checked) {
                                alert(obj.L2_Char_name[i] + ":Char not notifyable!");
                                status.checked = false;
                                status.disabled = true;
                                statusback.disabled = true;

                            }

                        }
                        else {
                            this.RWN_boxclear(i, uuid);
                        }
                    }//if
                    else {
                        this.RWN_boxclear(i, uuid);
                    }
                }//try
                catch (error) {
                    console.log(error);
                    alert(error);
                }//catch

            }//if
        }
    }
    RWN_textinputenable(tagName, element) {
        var textinputW = document.getElementById(tagName);
        // textinputW.setAttribute("type", false);
        textinputW.disabled = false;
    }

    RWN_textinputplacement(tagName, element, inputDatatype) {
        let textinputW = document.createElement("input");
        textinputW.setAttribute("id", tagName);
        textinputW.setAttribute("type", "text");
        textinputW.setAttribute("class", "small button");
        textinputW.setAttribute("value", inputDatatype);
        textinputW.disabled = true;
        element.appendChild(textinputW);

    }

    RWN_boxclear = function (i, uuid) {

        let tagCB = this.UI_checkboxPrefix + uuid;

        this.Listed_L2_Char[i] = false;

        document.getElementById(tagCB + "ckbox_R").checked = false;
        document.getElementById(tagCB + "ckbox_W").checked = false;
        document.getElementById(tagCB + "ckbox_N").checked = false;

        document.getElementById(tagCB + "ckbox_R").disabled = true;
        document.getElementById(tagCB + "ckbox_W").disabled = true;
        document.getElementById(tagCB + "ckbox_N").disabled = true;

        document.getElementById(tagCB + "ckbox_R" + "backbutton").disabled = true;
        document.getElementById(tagCB + "ckbox_W" + "backbutton").disabled = true;
        document.getElementById(tagCB + "ckbox_N" + "backbutton").disabled = true;

        var tag_RWN_textinput = this.UI_textInputDialogPrefix + uuid;//this.L2_tagPre + i.toString() + "text";
        document.getElementById(tag_RWN_textinput).disabled = true;

        let id = "Char" + this.deviceId + uuid;
        document.getElementById(id).remove();

    }

    refreshSelf = function (connected_dev, needL1refresh) {
        //if needL1refresh = true, L1 refresh will be processed, otherwise will not
        if (!this.L1_refreshed && needL1refresh) this.L1_Service_refresh(connected_dev, this.obj);
        if (connected_dev.has_selected_service) {
            this.L2_Char_refresh(connected_dev, this.obj);
        }
        else {
            // alert("please make device connected before confirm your char choice!");
            connected_dev.updated_Char_choice_R = [];
            connected_dev.updated_Char_choice_W = [];
            connected_dev.updated_Char_choice_N = [];
        }
    }


    L0_namePrefix_Show(subj) {
        // this.L0_button = document.createElement("BUTTON");
        //  this.L0_button.innerHTML = "namePrefix" + subj + "to be reached";
        // this.textGATT.appendChild(this.L0_button);
        // var line = document.createElement("lable");
        // this.textGATT.appendChild(line);
    }

    RWN_placement(RWNlable, tag) {
        //tag = this.UIcheckBoxprefix + uuid + ckbx123 = [deviceID] + "CB" + [uuid] + "1234567";
        let Char_dev_UUID_span = document.getElementById('Char' + this.deviceId + tag.slice(-43, -7));

        let newLable = document.createElement("lable");
        newLable.setAttribute("class", "container");

        let checkinput = document.createElement("input");
        checkinput.setAttribute("class", "small button");
        checkinput.setAttribute("name", RWNlable);
        checkinput.setAttribute("id", tag);
        checkinput.setAttribute("disabled", true);//disable it when created
        // if (RWNlable == "ActImmy") {
        //     checkinput.setAttribute("type", "button");
        //     checkinput.setAttribute("onclick", "checkBoxImmyActAsst()");
        // }
        // else {
        checkinput.setAttribute("type", "checkbox");
        // checkinput.setAttribute("onclick", "checkBoxRWNAsst(" + tag.slice(0, 1) + ")");
        checkinput.setAttribute("onclick", "checkBoxRWNAsst(" + tag.split(">", 1) + ")");
        // checkinput.setAttribute("checked", "checked");
        // }

        let tmp = document.createElement("button");
        tmp.setAttribute("class", "small blue button");
        tmp.setAttribute("id", tag + "backbutton");
        // tmp.setAttribute("disabled", true);

        let strRWN = RWNlable + " ";
        tmp.append(strRWN);

        tmp.appendChild(checkinput);
        newLable.appendChild(tmp);

        // this.textGATT.appendChild(newLable);
        Char_dev_UUID_span.appendChild(newLable);

    }

    RWN_ActImmyPlacement(RWNlable, tag) {
        //tag is coming from the this.UI_checkboxprefix+uuid
        let Char_dev_UUID_span = document.getElementById('Char' + this.deviceId + tag.slice(-36));

        let newLable = document.createElement("lable");
        newLable.setAttribute("class", "container");

        let checkinput = document.createElement("button");

        checkinput.setAttribute("class", "small button");
        checkinput.setAttribute("name", RWNlable);
        checkinput.setAttribute("id", tag);

        checkinput.setAttribute("type", "button");
        checkinput.setAttribute("onclick", "checkBoxImmyActAsst('" + tag + "')");

        let tmp = document.createElement("text");
        // // tmp.setAttribute("class", "checkmark");

        let strRWN = RWNlable;
        tmp.append(strRWN);

        newLable.appendChild(checkinput);
        checkinput.appendChild(tmp);

        // this.textGATT.appendChild(newLable);
        Char_dev_UUID_span.appendChild(newLable);

    }

    RWN_checkbox = function (RWN_tag) {
        //RWN_tag = this.UIcheckboxprefix + uuid
        this.RWN_placement("N", RWN_tag + "ckbox_N");
        this.RWN_placement("R", RWN_tag + "ckbox_R");
        this.RWN_placement("W", RWN_tag + "ckbox_W");
        //add actImmy button for each uuid
        this.RWN_ActImmyPlacement("Act!", RWN_tag);
    }

    L1_Service_Show(subj, subj_name) {
        for (var i in subj) {
            let Srv_dev_UUID_span = document.createElement("span");
            Srv_dev_UUID_span.setAttribute("id", "Service" + this.deviceId + subj[i])
            this.textGATT.appendChild(Srv_dev_UUID_span);

            var newLable = document.createElement("lable");
            newLable.setAttribute("id", this.UI_labelPrefix + subj[i]);
            newLable.setAttribute("name", subj_name[i]);
            newLable.setAttribute("class", "label warning");

            var L1_Service_info = "";
            L1_Service_info = "#" + this.deviceId + ": Service Name - " + subj_name[i] + " > UUID : " + subj[i];

            // L1_Service_info.
            newLable.insertAdjacentText("beforeend", L1_Service_info);

            // this.textGATT.appendChild(newLable);
            Srv_dev_UUID_span.appendChild(newLable);

            this.L1_Service_Status.push(L1_Service_info);

            // var L1_tag = document.createElement("");
            var line = document.createElement("br");
            // this.textGATT.appendChild(line);//Display the line
            Srv_dev_UUID_span.appendChild(line);
        }
    }

    L2_Char_Show(subj, subj_name) {
        for (let i in subj) {
            let Char_dev_UUID_span = document.createElement("span");
            Char_dev_UUID_span.setAttribute("id", "Char" + this.deviceId + subj[i]);
            this.textGATT.appendChild(Char_dev_UUID_span);

            var tag_RWN_textinput = this.UI_textInputDialogPrefix + subj[i];
            //this.L2_tagPre + i.toString() + "text";
            var L2_Char_inputDatatype = this.obj.L2_Char_datatype[subj[i]];

            //textInputinterface
            // this.RWN_textinputplacement(tag_RWN_textinput, this.textGATT, L2_Char_inputDatatype);
            this.RWN_textinputplacement(tag_RWN_textinput, Char_dev_UUID_span, L2_Char_inputDatatype);

            this.RWN_checkbox(this.UI_checkboxPrefix + subj[i]);
            // this.L2_tagPre + i.toString()

            this.Listed_L2_Char.push(true);


            // var newLable = document.createElement("div");
            var newLable = document.createElement("lable");
            newLable.setAttribute("id", this.UI_labelPrefix + subj[i]);
            newLable.setAttribute("name", subj_name[i]);
            newLable.setAttribute("class", "label info");
            // make the text dragdroppable
            newLable.setAttribute("droppable", "true");
            newLable.setAttribute("ondragstart", "dragstart_handler(event);");
            newLable.setAttribute("ondragend", "dragend_handler(event);");

            var L2_Char_info = ">>Char name - " + subj_name[i] + " > UUID : " + subj[i];
            newLable.insertAdjacentText("beforeend", L2_Char_info);
            // this.textGATT.appendChild(newLable);
            Char_dev_UUID_span.appendChild(newLable);

            var line = document.createElement("br");
            // this.textGATT.appendChild(line);
            Char_dev_UUID_span.appendChild(line);

        }
    }

}

