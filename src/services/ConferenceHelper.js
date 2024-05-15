
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import Consts, { hasConferenceTerminated, ROOT_URL } from '../Consts';
import * as RootNavigation from '../RootNavigation';

export async function checkAndAskPermissions() {
    // it will ask the permission for user
    if (Platform.OS === 'ios') {
        return true;
    }
    try {
        const userResponse = await PermissionsAndroid.requestMultiple([
            'android.permission.READ_PHONE_NUMBERS',
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        return (
            userResponse['android.permission.READ_PHONE_NUMBERS'] && 
            userResponse[PermissionsAndroid.PERMISSIONS.CAMERA] &&
            userResponse[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] &&
            userResponse[
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            ] === 'granted'
        );
    } catch (err) {
        console.log(err);
    }
    return null;
}

var ongoingCallID;

export var handleIncomingCallEvents = async (data) => {
    const { status, callID } = data;
    var userData = await AsyncStorage.getItem("user_data");
    if (!userData) {
        console.error("Sorry, user data is not found!");
        return;
    }
    userData = JSON.parse(userData);
    console.log('Data =', data);
    console.log('call id =', callID, ',status=', status);
    if (status === Consts.STATE_CALLING && callID) {
        if (ongoingCallID && ongoingCallID === callID) {
            return;
        }
        ongoingCallID = callID;
        //ring user.
        RootNavigation.navigate('Conference', {
            callID: callID || "tempid",
            currentUserName: userData.name,//current user name.
            roomName: data.roomName,
            userName: data.hostUserName,
            userProfile: data.hostUserProfileImageUrl,
            gender: data.hostUserGender,
            type: 'receiving',
        });
    }
    if (hasConferenceTerminated(status)) {
        // RootNavigation.goBack();
        ongoingCallID = null;
        return;
    }
};

export const initiateVideoCall = async (users, adminName, adminProfile, adminGender, user, hasCallEnded) => {
    // on start we are asking the permisions
    const isPermissionGranted = await checkAndAskPermissions();
    if (!isPermissionGranted) {
        console.log('permission denied');
        return;
    }
    var callee = users.map(u => (u.id));
    //setting room name as current app user's id, now.
    var roomName = user.id;
    if (hasCallEnded && hasCallEnded()) {
        return
    }
    try {
        const CALL_COLLECTION = firestore().collection(Consts.CALLS_COLLECTION_NAME)
        const newCallDocID = `${new Date().getTime()}`
        let newDoc = CALL_COLLECTION.doc(newCallDocID)
        await firestore().runTransaction((transaction) => {
            transaction.set(newDoc, {
                callee,
                hostUserName: adminName,
                hostUserProfileImageUrl: adminProfile,
                hostUserGender: adminGender,
                type: 'video',
                status: Consts.STATE_CALLING,
                roomName,
                duration: 0,
                datetime: new Date(),
            });

            users.forEach(u => {
                const ref = newDoc
                    .collection(Consts.CALLEE_LOGS_COLLECTION_NAME)
                    .doc(u.id)
                transaction.set(ref, { status: 'calling', duration: 0, name: u.name })
            });
            return Promise.resolve();
        })
        return newCallDocID;
    } catch (e) {
        console.log('call add exception, ', e);
    }
    return null;
}

export const getTwilioToken = async ({ roomName, currentUserName, roomType = 'go' }) => {
    let token = '';
    try {
        const url = `${ROOT_URL}/getTwilioToken?roomName=${roomName}&identity=${currentUserName}&type=${roomType}`;
        const response = await fetch(url);
        token = await response.text();
    } catch (e) {
        console.log("getTwilioToken error:", e);
        Alert.alert(
            "Error",
            "Server cannot be reached, please try again later.",
            [
                { text: "OK", onPress: () => RootNavigation.goBack() }
            ]);
        return;
    }
    if (!token || token === '') {
        Alert.alert(
            "Empty Token",
            "Token is returned empty, please try again later.",
            [
                { text: "OK", onPress: () => RootNavigation.goBack() }
            ]);
    }
    return token;
}