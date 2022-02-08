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

var rules = [
    { url: "/", regex: false, "authenication": authenication_types.optional, method: "get" },
    { url: "/login", regex: false, "authenication": authenication_types.optional, method: "post" },
    { url: "/user", regex: false, "authenication": authenication_types.optional, method: "post" },
    { url: "/dms/api/folder", regex: false, "authenication": authenication_types.required, method: "post" },
    { url: "/dms/api/file", regex: false, "authenication": authenication_types.required, method: "post" },
    { url: "/dms/api/file/\d*", regex: true, "authenication": authenication_types.required, method: "put" },
    { url: "/dms/api/file/\d*", regex: true, "authenication": authenication_types.required, method: "get" },
    { url: "/dms/api/file/\d*/move", regex: true, "authenication": authenication_types.required, method: "put" },
    { url: "/dms/api/resources/\d*", regex: true, "authenication": authenication_types.required, method: "get" },
    { url: "/dms/api/resources", regex: true, "authenication": authenication_types.required, method: "get" },
    { url: "/dms/resources/\d*", regex: true, "authenication": authenication_types.required, method: "get" },
    { url: "/dms/resources", regex: false, "authenication": authenication_types.required, method: "get" },
    { url: "/dms/file/\d*", regex: true, "authenication": authenication_types.required, method: "get" },
]

function validateRequest(req, callback, err) {

    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        var url = rule.url
        if (((rule.regex && new RegExp(url).test(req.url)) || (!rule.regex && url == req.url)) && rule.method.toUpperCase() == req.method) {
            console.log('fgdfdfg')
            if (rule.authenication) {
                console.log(req.cookies);
                var dms_cookie = req.cookies["dms_auth"];
                var json;
                try {
                    if (dms_cookie) {
                        console.log(dms_cookie);
                        var data = decrypt(dms_cookie);
                        console.log(data);
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
                console.log('dfgdfgdfg');
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