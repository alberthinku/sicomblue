function dragstart_handler(ev) {
    // console.log("dragStart");
    // Change the source element's background color to signify drag has started
    // ev.currentTarget.style.border = "dashed";
    // Add the id of the drag source element to the drag data payload so
    // it is available when the drop event is fired
    // ev.dataTransfer.setData("text", ev.target.parentElement.id);//if it is label object, use this
    ev.dataTransfer.setData("text", ev.target.id);//if it is textarea object, use this
    // Tell the browser both copy and move are possible
    ev.effectAllowed = "copyMove";
}
function dragover_handler(ev, devNo) {
    // console.log("dragOver");
    // Change the target element's border to signify a drag over event
    // has occurred
    ev.currentTarget.style.background = "lightblue";
    ev.preventDefault();
}
function drop_handler(ev, devNo) {
    // console.log("Drop");
    let device = deviceNo[devNo];
    ev.preventDefault();
    // Get the id of drag source element (that was added to the drag data
    // payload by the dragstart event handler)
    var id = ev.dataTransfer.getData("text");
    // Only Move the element if the source and destination ids are both "move"
    if (ev.target.id == "dest_copy_then" + devNo) {
        // let nodeCopy = document.createElement("text");
        // nodeCopy.setAttribute("id", "thenContent");
        let nodeCopy = document.getElementById(device.thenContent);
        nodeCopy.innerHTML = id;
        ev.target.appendChild(nodeCopy);
    }

    // Copy the element if the source and destination ids are both "copy"
    else if (ev.target.id == "dest_copy" + devNo) {
        // let nodeCopy = document.createElement("text");
        // nodeCopy.setAttribute("id", "ifContent");
        let nodeCopy = document.getElementById(device.ifContent);
        nodeCopy.innerHTML = id;
        ev.target.clearData;
        ev.target.appendChild(nodeCopy);
    }

    else if (ev.target.id == "dest_copy_raw" + devNo) {
        // let nodeCopy = document.createElement("text");
        // nodeCopy.setAttribute("id", "ifContent");
        let nodeCopy = document.getElementById(device.ifRawContent);
        nodeCopy.innerHTML = id;
        ev.target.clearData;
        ev.target.appendChild(nodeCopy);
    }

    else if (ev.target.id == "dest_copy_tof" + devNo) {
        // let nodeCopy = document.createElement("text");
        // nodeCopy.setAttribute("id", "ifContent");
        let nodeCopy = document.getElementById(device.ifTofContent);
        nodeCopy.innerHTML = id;
        ev.target.clearData;
        ev.target.appendChild(nodeCopy);
    }
}
function dragend_handler(ev) {
    // console.log("dragEnd");
    // Restore source's border
    // ev.target.style.border = "solid black";
    // Remove all of the drag data
    ev.dataTransfer.clearData();
}