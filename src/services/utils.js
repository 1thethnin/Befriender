import { Alert } from "react-native";
import CryptoJS from "react-native-crypto-js";
var getYouTubeID = require('get-youtube-id');

export const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};

export const removeNonSerializableFields = (obj) => {
    const objJsonString = JSON.stringify(obj, getCircularReplacer());
    return JSON.parse(objJsonString);
};

export const encrypt = function (salt, iv, passPhrase, plainText) {
    var rkEncryptionKey = CryptoJS.enc.Base64.parse('32e32277ebd60288df7d49==');//
    var rkEncryptionIv = CryptoJS.enc.Base64.parse('be55dd81a3e708f1d98bc3==');//
    var utf8Stringified = CryptoJS.enc.Utf8.parse(plainText);
    var encrypted = CryptoJS.AES.encrypt(utf8Stringified, rkEncryptionKey, { mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7, iv: rkEncryptionIv });

    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
}

export const decrypt = function (salt, iv, passPhrase, cipherText) {
    var rkEncryptionKey = CryptoJS.enc.Base64.parse('32e32277ebd60288df7d49==');
    var rkEncryptionIv = CryptoJS.enc.Base64.parse('be55dd81a3e708f1d98bc3==');

    var decrypted = CryptoJS.AES.decrypt(cipherText, rkEncryptionKey, { mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7, iv: rkEncryptionIv });

    return decrypted.toString(CryptoJS.enc.Utf8);
}

export function encryptString(plaintext, passphrase) {
    var iv = CryptoJS.lib.WordArray.random(128 / 16).toString(CryptoJS.enc.Hex);
    var salt = CryptoJS.lib.WordArray.random(128 / 16).toString(CryptoJS.enc.Hex);

    var encryptedString = encrypt(salt, iv, passphrase, plaintext);
    // console.log(`encryptedString = ${encryptedString}`);
    // console.log('decryptedString = ', JSON.stringify(decrypt(salt, iv, passphrase, encryptedString)));

    return encryptedString;
}

export const getVideoID = (url) => {
    let id = getYouTubeID(url);
    return id;

    // const startIndex = url.indexOf("v=") + 2
    // const id = url.slice(startIndex, url.length)
    // return id
}

export const getThumbnailUrl = (videoUrl) => {
    const url = `https://img.youtube.com/vi/${getVideoID(videoUrl)}/sddefault.jpg`;
    return url;
}

export const showErrorDialog = ({ title, msg, action, callback }) => {
    displayDialog({ title, msg, action, callback })
}

export const displayDialog = ({ title, msg, action, callback, cancelable = true }) => {
    Alert.alert(
        title,
        msg,
        [
            {
                text: action,
                onPress: () => {
                    callback && callback()
                }
            }
        ],
        { cancelable },
    )
}

function parseDuration(duration) {
    let remain = duration;

    let days = Math.floor(remain / (1000 * 60 * 60 * 24));
    remain = remain % (1000 * 60 * 60 * 24);

    let hours = Math.floor(remain / (1000 * 60 * 60));
    remain = remain % (1000 * 60 * 60);

    let minutes = Math.floor(remain / (1000 * 60));
    remain = remain % (1000 * 60);

    let seconds = Math.floor(remain / 1000);
    remain = remain % 1000;

    let milliseconds = remain;

    return {
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
    };
}

function formatTime(o, useMilli = false) {
    let parts = [];
    if (o.days) {
        let ret = o.days + " day";
        if (o.days !== 1) {
            ret += "s";
        }
        parts.push(ret);
    }
    if (o.hours) {
        let ret = o.hours + " hour";
        if (o.hours !== 1) {
            ret += "s";
        }
        parts.push(ret);
    }
    if (o.minutes) {
        let ret = o.minutes + " min";
        if (o.minutes !== 1) {
            ret += "s";
        }
        parts.push(ret);
    }
    if (o.seconds) {
        let ret = o.seconds + " sec";
        if (o.seconds !== 1) {
            ret += "s";
        }
        parts.push(ret);
    }
    if (useMilli && o.milliseconds) {
        let ret = o.milliseconds + " millisecond";
        if (o.milliseconds !== 1) {
            ret += "s";
        }
        parts.push(ret);
    }
    if (parts.length === 0) {
        return "instantly";
    } else {
        return parts.join(" ");
    }
}

export const formatDuration = (duration, useMilli = false) => {
    let time = parseDuration(duration);
    return formatTime(time, useMilli);
}

export const getGoogleSpeech = async (text) => {
    // const key = Platform.OS === 'ios' ? Config.KEY_IOS : Config.KEY_ANDROID
    const key = "AIzaSyDnrKYv0zDnWpR1ldIpXeCUb6pAjQCfvkA";
    const address = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`;
    const payload = createRequest(text);
    try {
        const response = await fetch(`${address}`, payload);
        const result = await response.json();
        return result.audioContent;
    } catch (err) {
        console.warn(err)
        throw Error("unexpected error");
    }
}

const createRequest = text => {
    var english = /^[a-zA-Z0-9!?@#"\n$%^&*\s)|(+=.,_-]*$/;
    let languageCode = 'cmn-CN';
    let voiceName = 'cmn-CN-Standard-A';
    let speakingRate = 0.70;
    if (english.test(text)) {
        languageCode = 'en-US';
        voiceName = "en-US-Standard-H";
        speakingRate = 1.0;
    }
    console.log("createRequest lc=", languageCode, ", vn=", voiceName);
    return {
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            input: {
                text
            },
            voice: {
                languageCode: languageCode,
                name: voiceName
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate,
            }
        }),
        method: 'POST'
    }
};

export function calculateAge(birthday) { // birthday is a date
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function isIsoDate(str) {
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
    var d = new Date(str);
    return d.toISOString() === str;
}

export const containsUppercase = (input) => {
    return /[A-Z]/.test(input)
}