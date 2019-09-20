// const express = require('express');
// const app = express();
// // const debug = require('debug')('myapp:server');
// const path = require('path');
// const multer = require('multer');
// // const logger = require('morgan');
// // const serveIndex = require('serve-index');

// var storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './public/uploads')
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
//     }
// });

// // //will be using this for updating
// const upload = multer({ storage: storage }).single('userJson');

// // console.log(upload);

// // //get teh router
// // const userRouter = require('./public/routes/user.route');

// app.use(express.static('./public'));
// app.get('/', function (req, res) {
//     res.sendFile(path.join(__dirname, 'public', "index.html"));
// });

// app.post('/upload', function (req, res) {
//     upload(req, res, function (err) {
//         if (err) {
//             return res.end("Error uploading file.");
//         }
//         //     debug(req.file);
//         console.log('storage time is ', Date.now());
//         //     return res.send(req.file);
//         res.status(200);
//         // res.sendFile(path.join(__dirname, 'public', "index.html"));
//     });
// });

// app.listen(3000,function(){
//   console.log("Working on port 3000");
// });


// app.use(logger('tiny'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }))
// // app.use('/ftp', express.static('public'), serveIndex('public', { 'icons': true }));
// app.engine('html', require('ejs').renderFile);
// // app.set('views', './views');
// app.use(express.static('./public'));

// app.get('/', function (req, res) {
//     // return res.send('hello from my app express server!');
//     return res.render('./public/views/index1.html');
// })

/*
 * Respond to GET requests to /account.
 * Upon request, render the 'account.html' web page in views/ directory.
//  */
// app.get('/upload', (req, res) => res.render('fileupload.html'));

// app.post('/testUpload', upload.single('file'), function (req, res) {
//     debug(req.file);
//     console.log('storage location is ', req.hostname + '/' + req.file.path);
//     return res.send(req.file);
// })

// //if end point is /users/, use the router
// app.use('/users', userRouter);

const http = require('http');
// const https = require('https');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const moment = require('moment');

var remoteIP = [];
// fs.readFile(path.join(__dirname, 'public', 'remoteIP.store'), (content, err) => {
//     if (err) console.log(err);
//     console.log(content);
//     remoteIP = content.toString('utf8').split(',');
// });

const server = http.createServer((req, res) => {
    // if (req.url === '/') {
    //     fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
    //         if (err) throw err;
    //         res.writeHead(200, { 'Content-Type': 'text/html' });

    //         res.end('<h1>HOMEpage is empty!</h1>');
    //     });
    // }
    // if (req.url === '/api/users') {
    //     const users = [
    //         { name: 'bob smith', age: 40 },
    //         { name: 'Jon smith', age: 30 }
    //     ];
    //     res.writeHead(200, { 'Content-Type': 'application/json' });
    //     res.end(JSON.stringify(users));
    // }

    //To show how the req is
    // console.log(req);

    //Build file path
    let filename = req.url;
    switch (req.url) {
        case "/": {
            filename = "index.html";
            // let rIP = req.headers['x-forwarded-for'];
            break;
        }
        case "/upload": filename = "uploads/uploaded.json"; break;
        case "/remoteIP": filename = "remoteIP.store"; break;
        case "/about": filename = "about.html"; break;
        case "/help": filename = "help.html"; break;
        case "/manual": filename = "manual/SiComBlueusermanual.docx.html"; break;

    }

    // if (req.url === '/') {
    //     filename = 'index.html';
    //     // filename = 'application.html';
    // } else if (req.url === '/upload') {
    //     filename = "uploads/uploaded.json";
    // } else { filename = req.url; }

    var filePath = path.join(__dirname, 'public', filename);

    // let filePath = path.join(__dirname, 'public', req.url === '/' ?
    //     'index.html' : req.url);

    if (req.method == "POST" && req.url == "/uploads") {
        console.log("received POST request now!");
        console.log("req url = ", req.url);
        console.log("req headers = ", req.headers);
        var uploadfilename = uuid.v4() + '-' + req.headers["x-file-name"];//generate a uuid plus updated filename

        console.log("new X-file-name is " + uploadfilename);
        var uploadfiletype = req.headers["content-type"];
        console.log("X-file-type is " + uploadfiletype);

        // if (!(uploadfiletype == "application/json")) {
        //     res.writeHead(413, "not supported file type!");
        //     res.end("");
        // } else {
        {
            // uploadfilename = "uploaded.json";//test only on this uploaded.json file.

            const filePathP = path.join(__dirname, "public/uploads", uploadfilename);


            var rawDin = "";
            req.on("data", chunk => {
                var datafile = chunk;
                rawDin += datafile.toString();
            });
            req.on("end", function () {
                // console.log(datafile.toString());
                let rawData = rawDin;
                let begN = rawData.indexOf("{");
                let endM = rawData.lastIndexOf("}");
                let newData = rawData.slice(begN, endM + 1);
                var isJson = false;

                try {
                    var jsonObj = JSON.parse(newData);
                    // console.log(jsonObj);
                    isJson = true;
                }
                catch (err) {
                    isJson = false;
                    console.log("Json file not correct!" + err);
                    res.writeHead(413, "not supported file type!");
                    res.end("not supported file type!");
                    console.log("file type not supported");
                };



                if (isJson) {
                    var jsonContent = JSON.stringify(jsonObj);
                    // console.log(jsonContent);

                    let flieExistedJson = path.join(__dirname, 'public/uploads', "uploaded.json");//the file to be appended with new uploadfile contents
                    fs.readFile(flieExistedJson, function (err, content) {
                        if (err) throw err;
                        let newJson = JSON.parse(content);
                        let mergeJson = newJson;
                        let obj = jsonObj;
                        obj["filename"] = uploadfilename;//add the uploadfilename info onto the Json hist log file
                        mergeJson.push(obj);
                        if (mergeJson.length > 10) mergeJson = mergeJson.slice(-10);
                        fs.writeFile(flieExistedJson, JSON.stringify(mergeJson), function (err) {
                            if (err) throw err;
                        });
                    });


                    fs.writeFile(filePathP, jsonContent, (err, content) => {
                        if (err) {
                            if (err.code == 'ENOENT') {
                                //Page not found
                                fs.readFile(path.join(__dirname, 'public', '404.html'), (err, content) => {
                                    res.writeHead(200, { 'Content-Type': 'text/html' });
                                    res.end(content, 'utf8');
                                })
                            } else {
                                //some other error
                                res.writeHead(500);
                                res.end(`Server Error: ${err.code}`);
                            }
                        } else {
                            //Success
                            // fs.readFile(path.join(__dirname, 'public', 'about.html'), (err, content) => {
                            // var fs = require('fs');
                            // let newName = path.join(__dirname, 'public', 'uploads', 'upload.json');
                            // fs.rename(filePathP, newName, function (err) {
                            //     if (err) console.log('ERROR: ' + err);
                            // });
                            res.writeHead(200, { "Content-Type": "text/html" });
                            res.writeHead(200, { "X-File-Name": uploadfilename });//writeHead to transfer uploadfilename
                            res.end("file POST request served!");
                            console.log("file POST requst served!");
                            // })

                        }


                    });
                };

            });
        }
        // } else if (req.method == "GET" && req.url == "/addnodes") {
        //     // && req.url == "/addnodes") {
        //     console.log("req.url = ", req.url);
        //     console.log("current nodes number is ", statusDeviceCount);
        //     statusDeviceCount++;
        //     addOneMoreNodes(statusDeviceCount);
        //     res.writeHead(200, { 'Content-Type': 'text/html' });
        //     res.end();
    } else {
        console.log(filePath);

        //Extension of file
        let extname = path.extname(filePath);
        console.log(extname);

        //Initial content type
        let contentType = 'text/html';
        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'img/png';
                break;
            case '.jpg':
                contentType = 'img/jpg';
                break;
            case '.store':
                {
                    contentType = 'text/plain';
                    let ip = (req.headers['x-forwarded-for'] || '').split(',').pop() ||
                        req.connection.remoteAddress ||
                        req.socket.remoteAddress ||
                        req.connection.socket.remoteAddress;
                    let time = moment().format(moment.defaultFormat);
                    remoteIP = ip + "-AT-" + time;
                    let content = fs.readFileSync(path.join(__dirname, 'public', 'remoteIP.store'), "utf8");
                    let contentArray = content.split(',')
                    console.log("remoteIP is", ip, "at", time);
                    contentArray.push(remoteIP);
                    let visitorCount = contentArray.length;
                    // let contstr = JSON.stringify({remoteIP+visitorCount});
                    console.log(contentArray);
                    fs.writeFile(path.join(__dirname, 'public', 'remoteIP.store'), contentArray, (err) => { if (err) throw err; });
                    fs.readFile(path.join(__dirname, 'public', 'visitorCount.num'), (err, counter) => { if (err) throw err; if (counter > visitorCount) visitorCount = counter + 1; });
                    fs.writeFile(path.join(__dirname, 'public', 'visitorCount.num'), visitorCount, (err) => { if (err) throw err; });
                    break;
                }
            case '.num': contentType = 'text/plain'; break
        }

        // read file
        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code == 'ENOENT') {
                    //Page not found
                    fs.readFile(path.join(__dirname, 'public', '404.html'), (err, content) => {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf8');
                    })
                } else {
                    //some other error
                    res.writeHead(500);
                    res.end(`Server Error: ${err.code}`);
                }
            } else {
                //Success
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf8');
            }
        });

        // let ip = (req.headers['x-forwarded-for'] || '').split(',').pop() ||
        //     req.connection.remoteAddress ||
        //     req.socket.remoteAddress ||
        //     req.connection.socket.remoteAddress;
        // let time = Date.now();
        // remoteIP.push(ip + ">" + time);
        // console.log("remoteIP is", ip, "at", time);
        // fs.writeFile(path.join(__dirname, 'public', 'remoteIP.store'), remoteIP, (err) => { if (err) throw err; });


    }

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));