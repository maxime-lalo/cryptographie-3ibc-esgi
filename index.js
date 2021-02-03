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

const loginKey = "Afih5D87&m%";
/**
 * MySQL connection
 */
const mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: '3308',
    password: '',
    database: 'crypto'
});
connection.connect();

var fs = require('fs');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', 'templates');
app.set('view engine', 'html');
app.engine('html', twig.__express);


/**
 * Routes pour le signup
 */
app.get('/signup', signup);
app.post('/signup',signup);

function signup(req, res){
    if(req.method == "GET"){
        res.render(path.join(__dirname + '/templates/signup.twig'), { 'url': 'signup' });
    }else{
        connection.query('SELECT * FROM user', function (error, results, fields) {
            var alreadyExists = false;
            var plainEmail = req.body.email;
            var encryptedEmail = CryptoJS.AES.encrypt(JSON.stringify(plainEmail), loginKey).toString();

            for (var i = 0; i < results.length; i++) {
                var emailDb = CryptoJS.AES.decrypt(results[i].email, key);
                var decryptedEmail = JSON.parse(emailDb.toString(CryptoJS.enc.Utf8));
                if (decryptedEmail == plainEmail) {
                    alreadyExists = true;
                }
            }

            if(alreadyExists){
                res.render(path.join(__dirname + '/templates/signup.twig'), { 'url': 'signup', 'error': 'Ce compte existe déjà' });
            }else{
                connection.query('INSERT INTO user (email,password) VALUES ("' + encryptedEmail + '","' + sha3_512(req.body.password) + '")', (error, results, fields) => {
                    res.render(path.join(__dirname + '/templates/signup.twig'), { 'url': 'signup', 'info': 'Vous avez bien été inscrit' });
                });
            }
        });
    }
}

/**
 * Routes pour le sign-in
 */
app.get('/signin', signin);
app.post('/signin', signin);

function signin(req, res) {
    if(req.method == "GET"){
         res.render(path.join(__dirname + '/templates/signin.twig'), { 'url': 'signin' });
    }else{  
        connection.query('SELECT * FROM user', function (error, results, fields) {
            var userFound = false;
            var plainEmail = req.body.email;
            var encryptedEmail = CryptoJS.AES.encrypt(JSON.stringify(plainEmail), loginKey).toString();

            for (var i = 0; i < results.length; i++) {
                var emailDb = CryptoJS.AES.decrypt(results[i].email, loginKey);
                var decryptedEmail = JSON.parse(emailDb.toString(CryptoJS.enc.Utf8));
                if (decryptedEmail == plainEmail) {
                    userFound = true;
                    user = results[i];
                }
            }

            if (userFound) {
                var hashedPassword = sha3_512(req.body.password);

                if(hashedPassword == user.password){
                    res.render(path.join(__dirname + '/templates/signup.twig'), { 'url': 'signup', 'info': 'Connexion réussie'});
                }else{
                    res.render(path.join(__dirname + '/templates/signup.twig'), { 'url': 'signup', 'error': 'Le mot de passe est incorrect' }); 
                }
            } else {
                res.render(path.join(__dirname + '/templates/signup.twig'), { 'url': 'signup', 'error': 'Ce compte n\'existe pas'});
            }
        });
    }
}

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
    // Si fileCompare1 existe
    if (req.body.fileCompare1){
        // Si on veut comparer les checksum

        var hash1 = CryptoJS.MD5(req.body.compare1).toString();
        var hash2 = CryptoJS.MD5(req.body.compare2).toString();

        if(hash1 == hash2){
            var result = "Identique";
        }else{
            var result = "Pas identique";
        }

        res.render(path.join(__dirname + '/templates/MD5.twig'), {
            'url': 'md5',
            'hashCompare1': hash1,
            'hashCompare2': hash2,
            'result' : result
        });
    } else{
        // Si on veut hasher en md5
        res.render(path.join(__dirname + '/templates/MD5.twig'), {
            'plain': req.body.md5,
            'hash': CryptoJS.MD5(req.body.md5),
            'url': 'md5'
        });
    }
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
        var rsa_key = cryptico.generateRSAKey(passphrase, bits); 
        var public_key = cryptico.publicKeyString(rsa_key);

        if (req.body.type == "1"){
            var result = cryptico.encrypt(req.body.plain, req.body.key)
            
            res.render(path.join(__dirname + '/templates/RSA.twig'), {
                'url': 'rsa',
                'result' : result.cipher,
                'plain' : req.body.plain, 
                'key' : req.body.key,
                'passphrase' : passphrase, 
                'public_key' : public_key,
            });
        } else if (req.body.type == "2"){
            var result = cryptico.decrypt(req.body.plain, cryptico.generateRSAKey(req.body.key, bits))
            
            res.render(path.join(__dirname + '/templates/RSA.twig'), {
                'url': 'rsa',
                'result' : result.plaintext,
                'plain' : req.body.plain, 
                'key' : req.body.key,
                'passphrase' : passphrase, 
                'public_key' : public_key,
            });
        } else {
            res.render(path.join(__dirname + '/templates/RSA.twig'), {
                'url': 'rsa',
                'passphrase' : passphrase, 
                'public_key' : public_key, 
            });
        }
         
    } else { 
        if (req.body.type == "1"){
            var result = cryptico.encrypt(req.body.plain, req.body.key)
            
            res.render(path.join(__dirname + '/templates/RSA.twig'), {
                'url': 'rsa',
                'result' : result.cipher,
                'plain' : req.body.plain, 
                'key' : req.body.key,
                'passphrase' : passphrase, 
                'public_key' : public_key,
            });
        } else if (req.body.type == "2"){
            var result = cryptico.decrypt(req.body.plain, cryptico.generateRSAKey(req.body.key, bits))
            
            res.render(path.join(__dirname + '/templates/RSA.twig'), {
                'url': 'rsa',
                'result' : result.plaintext,
                'plain' : req.body.plain, 
                'key' : req.body.key,
                'passphrase' : passphrase, 
                'public_key' : public_key,
            });
        }
    }

    
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
    const bf = new Blowfish(req.body.key, Blowfish.MODE.ECB, Blowfish.PADDING.NULL)

    if (req.body.type == "1"){
        var encrypted = bf.encode(req.body.plain);
        res.render(path.join(__dirname + '/templates/BlowFish.twig'),{  
            'url' : 'blowfish',
            'result' : encrypted
        });
    } else {
        var decrypted = bf.decode(req.body.plain, Blowfish.TYPE.STRING);
        res.render(path.join(__dirname + '/templates/BlowFish.twig'),{  
            'url' : 'blowfish', 
            'result' : decrypted
        });
    }

});

/**
 * Lancement du serveur
 */
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})