//UI textinput dialog : id = "TTin"+uuid
//UI label : id = "LB" +uuid
//UI checkbox : id = "CB" + uuid + "R/W/N"

class refreshLayer {
    constructor(obj, deviceId) {
        this.deviceId = deviceId;
        this.UI_textInputDialogPrefix = deviceId + "TTin";
        this.UI_labelPrefix = deviceId + "LB";
        this.UI_checkboxPrefix = deviceId + "CB";//the UI_checkboxEndfix = "R/W/N" depending on the box
        this.textG = document.getElementById(deviceId + "GATTShow");
        this.textG.innerHTML = "";
        // document.getElementById
        this.L1_tagPre = "L1_Svc";
        this.L2_tagPre = "L2_Chr";
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
        // if (this.L1_Service_Status[0].checked) console.log("read!");
        // this.textGATT.appendChild(this.L1_Service_Status[0]);
        var status = false;
        // for (var i = 0; i < this.L1_Service_Status.length; i++) {
        //     status = document.getElementById(this.L1_tagPre + i + "ckbox_R").checked;
        //     if (status) console.log("Service " + obj.L1_Service_name[i] + ">reading");
        //     status = document.getElementById(this.L1_tagPre + i + "ckbox_W").checked;
        //     if (status) console.log("Service " + obj.L1_Service_name[i] + ">writing");
        //     status = document.getElementById(this.L1_tagPre + i + "ckbox_N").checked;
        //     if (status) console.log("Service " + obj.L1_Service_name[i] + ">notifying");

        // }

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

                    var uuid = obj.L2_Char[i];//comparing each L2 char UUID

                    var name = obj.L2_Char_name[i];
                    this.L2_Char_outputRestore(name, uuid);

                    var index = tmp_selected_Char_uuid.indexOf(uuid);

                    if (!(index < 0)) {
                        var selected_C = dev.selected_Char[index];
                        if (!(selected_C == null)) {
                            //sometime discovery service will put empty char in the array

                            var selected_Char_properties = selected_C.properties;

                            var tagCB = this.UI_checkboxPrefix + uuid;// the tagCB should seach each of the each L2 uuid and comparing it with selected_C

                            status = document.getElementById(tagCB + "ckbox_R");
                            var statusback = document.getElementById(tagCB + "ckbox_R" + "backbutton");

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
                            // status.disabled = !(selected_Char_properties.notify);//disable the checkbox if not in the selected_Char_properties.notify

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
                    // this.RWN_boxclear(i);
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
        var textinputW = document.createElement("input");
        textinputW.setAttribute("id", tagName);
        textinputW.setAttribute("type", "text");
        textinputW.setAttribute("class", "small button");
        textinputW.setAttribute("value", inputDatatype);
        textinputW.disabled = true;
        element.appendChild(textinputW);

    }

    RWN_boxclear = function (i, uuid) {

        var tagCB = this.UI_checkboxPrefix + uuid;

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
    }

    refreshSelf = function (connected_dev) {
        if (connected_dev.has_selected_service) {
            this.L1_Service_refresh(connected_dev, this.obj);
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
        var newLable = document.createElement("lable");
        newLable.setAttribute("class", "container");

        var checkinput = document.createElement("input");
        checkinput.setAttribute("class", "small button");
        checkinput.setAttribute("name", RWNlable);
        checkinput.setAttribute("id", tag);
        // if (RWNlable == "ActImmy") {
        //     checkinput.setAttribute("type", "button");
        //     checkinput.setAttribute("onclick", "checkBoxImmyActAsst()");
        // }
        // else {
        checkinput.setAttribute("type", "checkbox");
        checkinput.setAttribute("onclick", "checkBoxRWNAsst(" + tag.slice(0, 1) + ")");
        // checkinput.setAttribute("checked", "checked");
        // }

        var tmp = document.createElement("button");
        tmp.setAttribute("class", "small blue button");
        tmp.setAttribute("id", tag + "backbutton");

        var strRWN = RWNlable + " ";
        tmp.append(strRWN);

        tmp.appendChild(checkinput);
        newLable.appendChild(tmp);

        this.textGATT.appendChild(newLable);

    }

    RWN_ActImmyPlacement(RWNlable, tag) {
        var newLable = document.createElement("lable");
        newLable.setAttribute("class", "container");

        var checkinput = document.createElement("button");

        checkinput.setAttribute("class", "small button");
        checkinput.setAttribute("name", RWNlable);
        checkinput.setAttribute("id", tag);

        checkinput.setAttribute("type", "button");
        checkinput.setAttribute("onclick", "checkBoxImmyActAsst('" + tag + "')");

        var tmp = document.createElement("text");
        // // tmp.setAttribute("class", "checkmark");

        var strRWN = RWNlable;
        tmp.append(strRWN);

        newLable.appendChild(checkinput);
        checkinput.appendChild(tmp);

        this.textGATT.appendChild(newLable);

    }

    RWN_checkbox = function (RWN_tag) {
        this.RWN_placement("N", RWN_tag + "ckbox_N");
        this.RWN_placement("R", RWN_tag + "ckbox_R");
        this.RWN_placement("W", RWN_tag + "ckbox_W");
        //add actImmy button for each uuid
        this.RWN_ActImmyPlacement("Act!", RWN_tag);
    }

    L1_Service_Show(subj, subj_name) {
        for (var i in subj) {
            var newLable = document.createElement("lable");
            newLable.setAttribute("id", this.UI_labelPrefix + subj[i]);
            newLable.setAttribute("name", subj_name[i]);
            newLable.setAttribute("class", "label warning");

            var L1_Service_info = "";
            L1_Service_info = "Service Name - " + subj_name[i] + " > UUID : " + subj[i];

            // L1_Service_info.
            newLable.insertAdjacentText("beforeend", L1_Service_info);

            this.textGATT.appendChild(newLable);

            this.L1_Service_Status.push(L1_Service_info);

            // var L1_tag = document.createElement("");
            var line = document.createElement("br");
            this.textGATT.appendChild(line);//Display the line
        }
    }

    L2_Char_Show(subj, subj_name) {
        for (var i in subj) {

            var tag_RWN_textinput = this.UI_textInputDialogPrefix + subj[i];
            //this.L2_tagPre + i.toString() + "text";
            var L2_Char_inputDatatype = this.obj.L2_Char_datatype[subj[i]];

            //textInputinterface
            this.RWN_textinputplacement(tag_RWN_textinput, this.textGATT, L2_Char_inputDatatype);

            this.RWN_checkbox(this.UI_checkboxPrefix + subj[i]);
            // this.L2_tagPre + i.toString()

            this.Listed_L2_Char.push(true);


            var newLable = document.createElement("lable");
            newLable.setAttribute("id", this.UI_labelPrefix + subj[i]);
            newLable.setAttribute("name", subj_name[i]);
            newLable.setAttribute("class", "label info");
            var L2_Char_info = ">>Char name - " + subj_name[i] + " > UUID : " + subj[i];
            newLable.insertAdjacentText("beforeend", L2_Char_info);
            this.textGATT.appendChild(newLable);

            var line = document.createElement("br");
            this.textGATT.appendChild(line);


        }
    }

}

