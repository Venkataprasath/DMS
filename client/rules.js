var authenication_types = {
    optional: 0,
    required: 1
}


const crypto = require('crypto');
const e = require('express');
const algorithm = 'aes-256-cbc'; //Using AES encryption
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encrypt(text) {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
}

function decrypt(text) {
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

var urls = [
    { url: "/login", regex: false, "authenication": authenication_types.optional, method: "post" },
    { url: "/register", regex: false, "authenication": authenication_types.optional, method: "post" },
    { url: "/folder", regex: false, "authenication": authenication_types.required, method: "post" },
    { url: "/file", regex: false, "authenication": authenication_types.required, method: "post" },
    { url: "/file/\d*", regex: true, "authenication": authenication_types.required, method: "put" },
    { url: "/file/\d*/move", regex: true, "authenication": authenication_types.required, method: "put" },
    { url: "/resources/\d*", regex: true, "authenication": authenication_types.required, method: "get" },
]

function validateRequest(req, callback, err) {
    console.log(req.url);
    for (var i = 0; i < urls.length; i++) {
        var url = urls[0];
        if ((url.regex && new RegExp(url).test(req.uri)) || (!url.regex && url === req.url) && url.method == req.method) {
            if (url.authenication) {
                var dms_cookie = req.cookies["dms_auth"];
                var json;
                try {
                    if (dms_cookie) {
                        var data = decrypt(dms_cookie);
                        var json = JSON.parse(data);
                        if (json.user_id)
                            callback(json.user_id)
                        else
                            throw false;
                    } else {
                        throw false;
                    }
                } catch (error) {
                    err();
                }

            } else {
                console.log(req.uri);
                callback();
            }
            return;
        }
    }

}


module.exports = {
    validate: validateRequest,
    encrypt: encrypt
}