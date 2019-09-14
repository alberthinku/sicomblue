class parseJson {
    constructor(obj) {
        this.obj = obj;
        if (!(obj == null)) {
            this.layerOneLen = obj.Service.length;
            this.layerTwoLen = obj.Char.length;
            this.L0_namePrefix = [];//namePrefix array
            this.L1_Service = []; //service UUID array
            this.L1_Service_name = []; //service name array
            this.L2_Char = []; //Char UUID array
            this.L2_Char_name = []; //Char name array
            this.L2_Char_offset = []; //Char offset array
            this.L2_Char_end = []; //Char end array
            this.L2_Char_wTS = []; //Char wTS array
            this.L2_Char_datatype = []; //Char data type array
            this.L2_Char_littleEndian = [];//Char littleEndian array
            this.L2_Char_byteLength = [];//Char byteLength array
            this.parseJsonTask(obj);
        }
    }

    reDrawLayerZero = function (params) {
        for (var i in params) {
            this.L0_namePrefix.push(params[i]);
        }
        return;
    }//service will be array, so i is the index of the service[];

    reDrawLayerOne = function (params) {
        for (var i in params) {
            this.L1_Service.push(params[i].UUID);
            this.L1_Service_name.push(params[i].name);
        }
        // return;
    }//service will be array, so i is the index of the service[];

    reDrawLayerTwo = function (params) {
        for (var i in params) {
            var UUID = params[i].UUID;
            this.L2_Char.push(UUID);
            this.L2_Char_name.push(params[i].name);

            this.L2_Char_offset[UUID] = (params[i].offset);
            this.L2_Char_end[UUID] = (params[i].length + params[i].offset);
            this.L2_Char_byteLength[UUID] = params[i].length;

            this.L2_Char_wTS[UUID] = (params[i].wtimestamp);
            this.L2_Char_datatype[UUID] = (params[i].datatype);
            this.L2_Char_littleEndian[UUID] = (params[i].littleEndian);
        }
        // return;
    }//char will be array, so i is the index of the char[];

    isValidJsonFile = function (params) {
        // var err = false;
        if (!(params.Service == null) && !(params.Char == null) && !(params.namePrefix == null)) return true;
        return false;
    }

    parseJsonTask = function (params) {
        if (!this.isValidJsonFile(this.obj)) { return console.log("error: invalid profile!"); }
        this.reDrawLayerZero(this.obj.namePrefix);
        this.reDrawLayerOne(this.obj.Service);
        console.log("reDrawlayerOne prepared");
        this.reDrawLayerTwo(this.obj.Char);
        console.log("reDrawlayerTwo prepared");
    }
}