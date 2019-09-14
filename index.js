// const express = require('express');
// const app = express();
// const debug = require('debug')('myapp:server');
// const path = require('path');
// const multer = require('multer');
// const logger = require('morgan');
// const serveIndex = require('serve-index');

// var storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './public/uploads')
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
//     }
// });

// //will be using this for updating
// const upload = multer({ storage: storage });

// //get teh router
// const userRouter = require('./public/routes/user.route');


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
    // let filename = req.url;
    // if (req.url === '/') {
    //     filename = 'index.html';
    // } else if (req.url === '/upload') {
    //     filename = "/fileupload.html";
    // } else { filename = req.url; }

    // let filePath = path.join(__dirname, 'public', filename);

    let filePath = path.join(__dirname, 'public', req.url === '/' ?
        'index.html' : req.url);

    if (req.method == "POST") {
        console.log("received POST request now!");
        filePath = path.join(filePath, "uploaded.json");

        // var fileName = req.files.type;
        // console.log(fileName);
        // req.on()
        req.on("data", chunk => {
            var datafile = chunk;
            var isJson = false;
            // console.log(datafile);
            try { var data = JSON.parse(datafile.toString()); isJson = true; }
            catch (err) { console.log("Json file not correct!" + err); isJson = false; }

            if (isJson) {
                fs.writeFile(filePath, datafile, (err, content) => {
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
                        res.writeHead(200, { "Content-Type": "text/html" });
                        res.end("file POST request served!");
                        console.log("file POST requst served!");
                        // })

                    }
                });

            } else {

                //Page not found
                // fs.readFile(path.join(__dirname, 'public', '404.html'), (err, content) => {
                //     res.writeHead(200, { 'Content-Type': 'text/html' });
                //     res.end(content, 'utf8');
                // })

                res.writeHead(413, "not supported file type!");
                res.end("not supported file type!");
                console.log("file type not supported");
            }

        })

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
        })
        // console.log(filePath);
        // res.end();

    }

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));