//UI textinput dialog : id = "TTin"+uuid
//UI label : id = "LB" +uuid

class refreshLayer {
    constructor(obj) {
        this.textG = document.getElementById("GATTShow");
        this.textG.innerHTML = "";
        // document.getElementById
        this.L1_tagPre = "L1_Svc";
        this.L2_tagPre = "L2_Chr";
        if (!(obj == null)) {
            this.obj = obj;
            //obj is the parsedJson which contains fully info of the profile!
            this.textGATT = this.textG;
            this.textGATT.appendChild(document.createElement("hr"));
            // this.textGATT = document.createElement("form");
            // this.textGATT.setAttribute("class", "form-inline");
            // this.textG.appendChild(this.textGATT);


            //L1
            this.L1_Service_Status = [];
            this.L1_Service_Show(obj.L1_Service, obj.L1_Service_name);
            //L2
            this.L2_Char_Status = [];
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

    L2_Char_refresh(dev, obj) {
        var status;
        dev.updated_Char_choice_R = [];
        dev.updated_Char_choice_W = [];
        dev.updated_Char_choice_N = [];
        for (var i = 0; i < this.L2_Char_Status.length; i++) {
            // if dev.selected_Char[i].property
            try {

                var tmp_selected_Char_uuid = [];
                dev.selected_Char.forEach(element => {
                    tmp_selected_Char_uuid.push(element.uuid);
                });

                var uuid = obj.L2_Char[i];//comparing each L2 char UUID

                var index = tmp_selected_Char_uuid.indexOf(uuid);

                if (!(index < 0)) {
                    var selected_C = dev.selected_Char[index];
                    if (!(selected_C == null)) {
                        //sometime discovery service will put empty char in the array

                        var selected_Char_properties = selected_C.properties;

                        status = document.getElementById(this.L2_tagPre + i + "ckbox_R");
                        if (status.checked && selected_Char_properties.read) {
                            console.log("Char " + obj.L2_Char_name[i] + ">reading");
                            dev.updated_Char_choice_R.push(selected_C);
                        }
                        else if (status.checked) {
                            alert(obj.L2_Char_name[i] + ":Char is not readable!");
                            status.checked = false;
                        }

                        status = document.getElementById(this.L2_tagPre + i + "ckbox_W");
                        if (status.checked && selected_Char_properties.write) {
                            console.log("Char " + obj.L2_Char_name[i] + ">writing");
                            var tag_RWN_textinput = "TTin" + selected_C.uuid;
                            //this.L2_tagPre + i + "text";
                            this.RWN_textinputenable(tag_RWN_textinput, status);
                            dev.updated_Char_choice_W.push(selected_C);
                        }
                        else if (status.checked) {
                            alert(obj.L2_Char_name[i] + ":Char is not writable!");
                            status.checked = false;
                        }

                        status = document.getElementById(this.L2_tagPre + i + "ckbox_N");
                        if (status.checked && selected_Char_properties.notify) {
                            console.log("Char " + obj.L2_Char_name[i] + ">notifying");
                            dev.updated_Char_choice_N.push(selected_C);
                        }
                        else if (status.checked) {
                            alert(obj.L2_Char_name[i] + ":Char not notifyable!");
                            status.checked = false;
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
                // this.RWN_boxclear(i);
            }//catch
        }
    }
    RWN_textinputenable(tagName, element) {
        var textinputW = document.getElementById(tagName);
        // textinputW.setAttribute("type", false);
        textinputW.disabled = false;
    }

    RWN_textinputplacement(tagName, element) {
        var textinputW = document.createElement("input");
        textinputW.setAttribute("id", tagName);
        textinputW.setAttribute("type", "text");
        textinputW.setAttribute("value", "put data to be sent here ...");
        // textinputW.setAttribute("disabled", true);
        // element.insertAdjacentElement("afterend", textinputW);
        textinputW.disabled = true;
        element.appendChild(textinputW);

    }

    RWN_boxclear = function (i, uuid) {
        document.getElementById(this.L2_tagPre + i + "ckbox_R").checked = false;
        document.getElementById(this.L2_tagPre + i + "ckbox_W").checked = false;
        document.getElementById(this.L2_tagPre + i + "ckbox_N").checked = false;

        var tag_RWN_textinput = "TTin" + uuid;//this.L2_tagPre + i.toString() + "text";
        document.getElementById(tag_RWN_textinput).disabled = true;
    }
    refreshSelf = function (connected_dev) {
        this.L1_Service_refresh(connected_dev, this.obj);
        this.L2_Char_refresh(connected_dev, this.obj);
    }


    L0_namePrefix_Show(subj) {
        this.L0_button = document.createElement("BUTTON");
        this.L0_button.innerHTML = "namePrefix" + subj + "to be reached";
        this.textGATT.appendChild(this.L0_button);
        var line = document.createElement("lable");
        // line.insertAdjacentText("afterend", "hr");
        this.textGATT.appendChild(line);
    }

    RWN_placement(RWNlable, tag) {
        var checkPointType = "checkbox";
        // var checkPointType = "radio";
        var newLable = document.createElement("lable");
        newLable.setAttribute("class", "container");
        var strRWN = RWNlable;
        newLable.append(strRWN);



        var checkinput = document.createElement("input");
        // checkinput.setAttribute("name", RWNlable);
        checkinput.setAttribute("id", tag);
        checkinput.setAttribute("type", checkPointType);
        checkinput.setAttribute("name", checkPointType);
        newLable.append(checkinput);

        // checkinput.setAttribute("checked", "checked");
        var tmp = document.createElement("span");
        tmp.setAttribute("class", "checkmark");
        // tmp.append(strRWN);

        // tmp.append(checkinput);
        // newLable.insertAdjacentText("afterbegin", "&" + RWNlable);
        newLable.append(tmp);

        this.textGATT.appendChild(newLable);
        // document.body.appendChild(newLable);

    }

    RWN_checkbox = function (RWN_tag) {
        this.RWN_placement("N", RWN_tag + "ckbox_N");
        this.RWN_placement("R", RWN_tag + "ckbox_R");
        this.RWN_placement("W", RWN_tag + "ckbox_W");

    }

    L1_Service_Show(subj, subj_name) {
        for (var i in subj) {
            var newLable = document.createElement("lable");
            newLable.setAttribute("id", "LB" + subj[i]);
            newLable.setAttribute("name", subj_name[i]);
            newLable.setAttribute("class", "label warning");

            var L1_Service_info = "";
            L1_Service_info = "Service Name - " + subj_name[i] + " > UUID : " + subj[i];

            // L1_Service_info.
            newLable.insertAdjacentText("beforeend", L1_Service_info);

            this.textGATT.appendChild(newLable);

            this.L1_Service_Status.push(L1_Service_info);

            // var L1_tag = document.createElement("");
            var line = document.createElement("hr");
            this.textGATT.appendChild(line);//Display the line
        }
    }

    L2_Char_Show(subj, subj_name) {
        for (var i in subj) {
            var newLable = document.createElement("lable");
            newLable.setAttribute("id", "LB" + subj[i]);
            newLable.setAttribute("name", subj_name[i]);
            newLable.setAttribute("class", "label info");
            var L2_Char_info = ">>Char name - " + subj_name[i] + " > UUID : " + subj[i];

            newLable.insertAdjacentText("beforeend", L2_Char_info);
            this.textGATT.appendChild(newLable);

            var tag_RWN_textinput = "TTin" + subj[i];
            //this.L2_tagPre + i.toString() + "text";
            this.RWN_textinputplacement(tag_RWN_textinput, this.textGATT);

            this.RWN_checkbox(this.L2_tagPre + i.toString());


            this.L2_Char_Status.push(L2_Char_info);

            var line = document.createElement("hr");
            this.textGATT.appendChild(line);
        }
    }
}

