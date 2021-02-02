const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const bodyParser = require('body-parser');
const twig = require('twig');
const CryptoJS = require("crypto-js");
sha3_512 = require('js-sha3').sha3_512;
keccak512 = require('js-sha3').keccak512;
const RIPEMD160 = require('ripemd160');
const Blowfish = require('egoroof-blowfish');
const NodeRSA = require('node-rsa');
const cryptico = require('cryptico')


var fs = require('fs');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', 'templates');
app.set('view engine', 'html');
app.engine('html', twig.__express);

/**
 * Routes pour l'index
 */
app.get('/', function (req, res) {
    res.render(path.join(__dirname + '/templates/index.twig'), { 'url': 'home' });
});

/**
 * Routes pour le md5
 */
app.get('/MD5', function (req, res) {
    res.render(path.join(__dirname + '/templates/MD5.twig'), {
        'url' : 'md5'
    });
});

app.post('/MD5', function (req, res) {
    res.render(path.join(__dirname + '/templates/MD5.twig'), { 
        'plain': req.body.md5, 
        'hash': CryptoJS.MD5(req.body.md5),
        'url' : 'md5'
    });
});

/**
 * Routes pour le Keccak
 */
app.get('/Keccak-512', function (req, res) {
    res.render(path.join(__dirname + '/templates/Keccak-512.twig'),{
        'url' : 'keccak-512'
    });
});

app.post('/Keccak-512', function (req, res) {
    res.render(path.join(__dirname + '/templates/Keccak-512.twig'), { 
        'plain': req.body.keccak, 
        'hash': keccak512(req.body.keccak),
        'url' : 'keccak-512'
    });

});

/**
 * Routes pour le Ripemd160
 */
app.get('/RipeMD160', function (req, res) {
    res.render(path.join(__dirname + '/templates/RipeMD160.twig'),{
        'url' : 'ripemd160'
    });
});

app.post('/RipeMD160', function (req, res) {
    res.render(path.join(__dirname + '/templates/RipeMD160.twig'),{
        'url' : 'ripemd160',
        'plain' : req.body.ripemd160,
        'hash': new RIPEMD160().update(req.body.ripemd160).digest("hex")
    });
});

/**
 * Routes pour le SHA2-256
 */
app.get('/SHA2-256', function (req, res) {
    res.render(path.join(__dirname + '/templates/SHA2-256.twig'),{
        'url' : 'sha2-256'
    });
});

app.post('/SHA2-256', function (req, res) {
    res.render(path.join(__dirname + '/templates/SHA2-256.twig'), { 
        'plain': req.body.sha2, 
        'hash': CryptoJS.SHA256(req.body.sha2),
        'url' : 'sha2-256'
    });
});

/**
 * Routes pour le sha3-512
 */
app.get('/SHA3-512', function (req, res) {
    res.render(path.join(__dirname + '/templates/SHA3-512.twig'),{
        'url' : 'sha3-512'
    });
});

app.post('/SHA3-512', function (req, res) {
    res.render(path.join(__dirname + '/templates/SHA3-512.twig'), { 
        'plain': req.body.sha3512, 
        'hash': sha3_512(req.body.sha3512),
        'url' : 'sha3-512'
    });
});


/**
 * Routes pour le AES
 */
app.get('/AES', function (req, res) {
    res.render(path.join(__dirname + '/templates/AES.twig'),{
        'url' : 'aes',  
    });
});

app.post('/AES', function (req, res) {
    var plain = req.body.aes; 
    var key = req.body.key;

    if (req.body.type == "1"){
        var result = CryptoJS.AES.encrypt(JSON.stringify(plain), key).toString(); 
    } else {
        var result = CryptoJS.AES.decrypt(plain,key); 
        result = JSON.parse(result.toString(CryptoJS.enc.Utf8)); 
    }

    res.render(path.join(__dirname + '/templates/AES.twig'),{
        'url' : 'aes', 
        'res' : result,
        'plain' : plain,
        'key' : key
    });
});

/**
 * Routes pour le RSA
 */
app.get('/RSA', function (req, res) {
    res.render(path.join(__dirname + '/templates/RSA.twig'), {
        'url': 'rsa'
    });
});

app.post('/RSA', function (req, res) {

    if (req.body.passphrase != "") {
        var passphrase = req.body.passphrase ; 
        var bits = 1024 ; 
        
    }

    var plain = req.body.rsa; 
    var key = req.body.key;
    const RSA = new NodeRSA()

    res.render(path.join(__dirname + '/templates/RSA.twig'), {
        'url': 'rsa'
    });
});

/**
 * Routes pour le Blowfish
 */
app.get('/BlowFish', function (req, res) {
   res.render(path.join(__dirname + '/templates/BlowFish.twig'),{  
       'url' : 'blowfish'
   });
});
 
app.post('/BlowFish', function (req, res) {
    const bf = new Blowfish(req.body.secret_key, Blowfish.MODE.ECB, Blowfish.PADDING.NULL);
    
    // Si type = 1 on encrypte sinon on décrypte
    if(req.body.type == "1"){
        var result = bf.encode(req.body.blowfish, Blowfish.TYPE.STRING);
        console.log(bf.decode(result,Blowfish.TYPE.STRING));
    }else{
        var result = bf.decode(req.body.blowfish, Blowfish.TYPE.STRING);
    }

    res.render(path.join(__dirname + '/templates/BlowFish.twig'),{
        'url' : 'blowfish',
        'plain' : req.body.blowfish,
        'hash' : result
    });
});

/**
 * Lancement du serveur
 */
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})