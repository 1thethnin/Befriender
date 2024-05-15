/* eslint-disable prettier/prettier */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import { NavigationContainer } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import React, { Component } from 'react';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import SignInScreen from './screens/SignInScreen';
import Conference from './screens/Conference';
import { StatusBar, Alert, Platform, AppState, Vibration, Linking } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { isUserInConference, navigate, setNavigationRef, goBack } from './RootNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNCallKeep from 'react-native-callkeep';
import NativeBridge from './NativeBridge';
import Consts, { COLORS, hasConferenceTerminated, ROOT_URL, TOAST_CONFIG } from './Consts';
import Detail from './screens/detail';
import { connect } from 'react-redux';
import { setUser } from './redux/features/user_slice';
import {
  setIsThereNewNotification,
  clearNotiList,
} from './redux/features/notification_slice';
import { getCircularReplacer, showErrorDialog } from './services/utils';
import MainNavigation from './navigations/MainNavigation';
import uuid from 'react-native-uuid';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MessageDetails from './screens/message_detail';
import ResetPasswordNavigation from './navigations/ResetPasswordNavigation';
import EditProfile from './screens/edit_profile';
import EditVideo from './screens/edit_video';
import EditMusic from './screens/edit_music';
import ViewPhoto from './screens/view_photo';
import AddPhoto from './sheets/add_photo';
import EditRadio from './screens/edit_radio';
import Toast from "react-native-toast-message";
import Loading from './components/loading';
import VoipPushNotification from 'react-native-voip-push-notification';
import ForgotPassword from './screens/forgot_password';
import Sound from 'react-native-sound';
import { doLogout } from './screens/my_profile';

// Enable playback in silence mode
Sound.setCategory('Playback');

const playNotiAndVibrate = () => {
  const NOTIFICATION_SOUND = new Sound('noti.wav', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('notification sound load error:', error);
      return;
    }
    NOTIFICATION_SOUND.play((success) => {
      NOTIFICATION_SOUND.release();
    })
  });
  Vibration.vibrate();
}

const BACKGROUND_CALL_DATA = 'background_call_data';

var isAppBackground = true;
var isAppForeground = true;
var willRejectCall = true;
const isAndroid = Platform.OS === 'android';

var cancelledCallListener;

RNCallKeep.setup({
  ios: {
    appName: 'Befriender',
  },
  android: {
    alertTitle: 'Permissions required',
    alertDescription: 'This application needs to access your phone accounts',
    cancelButton: 'Cancel',
    okButton: 'Ok',
    selfManaged: true,
  }
}).then(accepted => {
  console.log('RNCallkeep setup done.');
  RNCallKeep.removeEventListener('answerCall', onAnswerCallAction);
  RNCallKeep.removeEventListener('endCall', onEndCallAction);
  if (isAndroid) {
    RNCallKeep.removeEventListener('showIncomingCallUi', onShowIncomingCallUi);
  }

  RNCallKeep.addEventListener('answerCall', onAnswerCallAction);
  RNCallKeep.addEventListener('endCall', onEndCallAction);
  if (isAndroid) RNCallKeep.addEventListener('showIncomingCallUi', onShowIncomingCallUi);

});

const onDidLoadWithNativeEvents = async (events) => {
  // `events` is passed as an Array chronologically, handle or ignore events based on the app's logic
  // see example usage in https://github.com/react-native-webrtc/react-native-callkeep/pull/169 or https://github.com/react-native-webrtc/react-native-callkeep/pull/205

  console.log("onDidLoadWithNativeEvents", events);
  const validEvents = events;//compact(events);
  let callDataToAdd = null;
  let callDataToAnswer = null;
  let callDataToReject = null;
  let callDataToInitiateCall = null;

  validEvents.forEach(event => {
    if (!event) return;

    const { name, data } = event;
    if (name === 'RNCallKeepDidDisplayIncomingCall') {
      callDataToAdd = data ? data.payload : null;
      callDataToAnswer = null;
      callDataToReject = null;
    }
    if (name === 'RNCallKeepPerformAnswerCallAction') {
      callDataToReject = null;
      callDataToAnswer = data;
    }
    if (name === 'RNCallKeepPerformEndCallAction') {
      callDataToAnswer = null;
      callDataToReject = data;
    }
  });

  // const lastEventName = get(last(validEvents), 'name');
  // if (lastEventName === 'RNCallKeepDidReceiveStartCallAction') {
  //   callDataToInitiateCall = get(last(validEvents), 'data');
  //   callDataToAnswer = null;
  //   if (!callDataToReject) {
  //     callDataToAdd = null;
  //   }
  // }

  if (callDataToAdd) {
    //this.onDisplayIncomingCall(callDataToAdd);
    console.log('update voip push data : callDataToAdd ', callDataToAdd);

    if (!callDataToAdd.callID) return

    isAppBackground = false;
    const { hostUserName, callID } = callDataToAdd;
    if (!await isCallStillValid(callID)) return;

    RNCallKeep.backToForeground();
    await AsyncStorage.setItem(BACKGROUND_CALL_DATA, JSON.stringify(callDataToAdd));

    listenForCanceledCall(callID);

    if (callDataToReject) {
      console.log("playload rejected ", callDataToReject);
      onEndCallAction(callDataToReject);
    }
    if (callDataToAnswer) {
      console.log("playload answer ", callDataToAnswer);
      onAnswerCallAction(callDataToAnswer);
    }
  }
  // if (callDataToInitiateCall) {
  //   this.onStartCall(callDataToAnswer);
  // }
}

const onShowIncomingCallUi = (p) => {
  if (isAndroid) {
    isAppBackground && NativeBridge.startActivity();
    onAnswerCallAction({});
  }
}

const onAnswerCallAction = (p) => {
  console.log("onAnswerCallAction() p=", p);
  if (cancelledCallListener) cancelledCallListener();

  //if(p && p.callUUID) RNCallKeep.answerIncomingCall(p.callUUID);
  console.log('onAnswerCallAction(): isAppBackground=', isAppBackground);
  willRejectCall = false;

  if (isAppBackground) {
    setTimeout(() => navigateToConference(), 4000);
  } else {
    if (Platform.OS === 'ios') setTimeout(() => navigateToConference(), 2000);
    else navigateToConference();

  }
};

const navigateToConference = async () => {
  const isRinging = Platform.OS === 'android';
  const pData = await AsyncStorage.getItem(BACKGROUND_CALL_DATA);
  const currentUserStr = await AsyncStorage.getItem('user_data');
  console.log('onAnserCallAction : pData=', pData);
  if (!pData || !currentUserStr) {
    console.error('onAnserCallAction(): call data or current user is not found!');
    return;
  }
  const data = JSON.parse(pData);
  const currentUser = JSON.parse(currentUserStr);
  updateToRingingState(data.callID, currentUser.id);
  navigate('Conference', {
    callID: data.callID,
    currentUserName: currentUser.name,//current user name.
    roomName: data.roomName,
    userName: data.hostUserName,
    userProfile: data.hostUserProfileImageUrl,
    gender: data.hostUserGender,
    type: Consts.STATE_RINGING,
    willJoinRoomDirectly: !isRinging,
  });
};


const updateToRingingState = (callID, userID) => {
  firestore()
    .collection(Consts.CALLS_COLLECTION_NAME)
    .doc(callID)
    .collection(Consts.CALLEE_LOGS_COLLECTION_NAME)
    .doc(userID)
    .update({
      status: Consts.STATE_RINGING,
    })
}

const onEndCallAction = async (p) => {
  console.log("onEndCallAction() p=", p, willRejectCall);
  // this.isIncomingCallDisplayed = false;
  RNCallKeep.endAllCalls();
  if (willRejectCall === false || Platform.OS === 'android') {
    willRejectCall = true;
    return;
  }
  const currentUserStr = await AsyncStorage.getItem('user_data');
  const currentUser = JSON.parse(currentUserStr);
  const d = await AsyncStorage.getItem(BACKGROUND_CALL_DATA);
  const callData = JSON.parse(d);
  firestore()
    .collection(Consts.CALLS_COLLECTION_NAME)
    .doc(callData.callID)
    .collection(Consts.CALLEE_LOGS_COLLECTION_NAME)
    .doc(currentUser.id)
    .update({ status: Consts.STATE_REJECTED, duration: 0 })
    .then(() => {
      console.log('onEndCallAction: UPDATED!!!', Consts.STATE_REJECTED);
    })
    .catch(e => {
      console.error('onEndCallAction:', e);
    });
};

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);

  isAppBackground = true;
  const isNormalNoti = !remoteMessage.data.callID;
  if (isNormalNoti || Platform.OS === 'ios') {
    if (isNormalNoti) {
      playNotiAndVibrate();
    }
    return;
  }
  if (!await isCallStillValid(remoteMessage.data.callID)) return;
  RNCallKeep.backToForeground();
  await AsyncStorage.setItem(BACKGROUND_CALL_DATA, JSON.stringify(remoteMessage.data));
  RNCallKeep.removeEventListener('answerCall', onAnswerCallAction);
  RNCallKeep.removeEventListener('endCall', onEndCallAction);
  if (isAndroid) RNCallKeep.removeEventListener('showIncomingCallUi', onShowIncomingCallUi);
  RNCallKeep.addEventListener('answerCall', onAnswerCallAction);
  RNCallKeep.addEventListener('endCall', onEndCallAction);

  const { hostUserName, callID } = remoteMessage.data;
  if (isAndroid) {
    onShowIncomingCallUi({});
  } else {
    const mUUID = uuid.v4();
    RNCallKeep.displayIncomingCall(mUUID, "Video call", hostUserName, 'generic', true);
  }
  listenForCanceledCall(callID);
});

const isCallStillValid = async (callID) => {
  try {
    const call = await firestore()
      .collection(Consts.CALLS_COLLECTION_NAME)
      .doc(callID)
      .get()
    console.log('handleRemoteMessage isCallStillValid ', call.data().status);
    return !hasConferenceTerminated(call.data().status)
  } catch (e) {
    console.error('isCallStillValid() API call error,', e);
    return false;
  }
}

const listenForCanceledCall = (callID) => {
  cancelledCallListener = firestore()
    .collection(Consts.CALLS_COLLECTION_NAME)
    .doc(callID)
    .onSnapshot(s => {
      const map = s.data()
      if (map.status !== Consts.STATE_CALLING) {
        //this call is not valid somehow.
        RNCallKeep.endAllCalls();
        if (Platform.OS === 'android' && isUserInConference()) {
          goBack();
        }
        if (cancelledCallListener) cancelledCallListener();
        console.log('listenFOrCanceledCall() done endAllCalls');
      }
    }, e => {
      console.error('listenFOrCanceledCall() error,', e);
    })
}

const theme = {
  ...DefaultTheme,
  roundness: 8,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    accent: COLORS.accent,
  },
};

const Stack = createStackNavigator();

const usersCollectionRef = firestore().collection('users');

const CREDENTIAL_CHANGED_PROPS = {
  title: 'Credential Changed',
  body: `The user's credential is no longer valid. The user must sign in again.`,
  color: '#fc4503',
  action: () => { Toast.hide() },
  actionText: `OK`,
}

class Root extends Component {
  constructor(props) {
    super(props);
    this.isIncomingCallDisplayed = false;
    this.willRejectCall = true;
    this.state = { isLogin: false, user: '', isReady: false, showTopPadding: true };
  }

  clearLocalUserInfoToLogout = () => {
    this.props.setUser({});
    this.setState({ isReady: true, isLogin: false });
    this.isAlreadyRequestUserPermission = false;
    this.isAlreadyRegisterVoip = false;
    this.isAlertAlreadyShown = false;
    this.props.clearNotiList();
  }

  onAuthStateChanged = async (user) => {
    console.log('onAuthStateChanged init');
    // stop the user listener first.
    if (Platform.OS === 'ios') {
      VoipPushNotification.removeEventListener('didLoadWithEvents');
      VoipPushNotification.removeEventListener('register');
      VoipPushNotification.removeEventListener('notification');
    }

    if (user === null || typeof user === 'undefined' || user.uid === null || typeof user.uid === 'undefined') {
      console.log('auth state change user is null, log out.');
      this.clearLocalUserInfoToLogout();
      if (this.appUserChangeListener) this.appUserChangeListener();
      return
    }

    // if (this.appUserChangeListener) return;

    const uid = user.uid;
    const userDBRef = usersCollectionRef
      .doc(uid)

    const sn = await userDBRef.get()

    var currentUser = { id: uid, ...sn.data() };
    if (currentUser.role.toLowerCase() === 'befriender') {
      this.props.setUser(currentUser);
      //removing all non-serializable fields, like firestore reference
      const userJsonString = JSON.stringify(currentUser, getCircularReplacer());
      currentUser = JSON.parse(userJsonString);
      AsyncStorage.setItem('user_data', userJsonString);
      this.setState({
        isLogin: true,
        user: currentUser,
        isReady: true,
      });
      console.log('onAuthStateChanged', this.state.isLogin);
      await this.requestUserPermission(currentUser);

      if (Platform.OS === 'ios') this.addVOIPListener();
    } else {
      if (!this.isAlertAlreadyShown || this.isAlertAlreadyShown !== true) {
        showErrorDialog({
          title: 'Error',
          msg: 'You must be befriender to login.',
          action: 'OK',
          cancelable: false,
          callback: () => {
            this.isAlertAlreadyShown = false
          },
        })
        this.isAlertAlreadyShown = true
      }
      return
    }
    this.isFirstTime = true
    if (this.appUserChangeListener) this.appUserChangeListener();
    this.appUserChangeListener = userDBRef
      .onSnapshot(documentSnapshot => {
        if (this.isFirstTime === true) {
          this.isFirstTime = false
          return
        }

        if(!documentSnapshot || !documentSnapshot.data()) return;

        var currentUser = { id: uid, ...documentSnapshot.data() };
        this.props.setUser(currentUser);
        //console.log("user data changed : ", this.state.user.detectNewLogin, currentUser.detectNewLogin);
        if (
          currentUser.email?.toLowerCase() !== this.state.user.email?.toLowerCase()
          || (this.state.user.password && this.state.user.password !== currentUser.password)) {
          //the current users email, which we used as a login info, this user should be logged out.
          Toast.show({
            type: 'notify',
            props: CREDENTIAL_CHANGED_PROPS,
            autoHide: false,
          })
          this.clearLocalUserInfoToLogout();
          return;
        } 
      });
  }

  handleRemoteMessage = async (remoteMessage) => {
    console.log('handleRemoteMessage isForeground ', isAppForeground);
    if (!remoteMessage.data.callID) {
      return
    }

    if (isAppForeground) {
      isAppBackground = false;

      const { hostUserName, callID } = remoteMessage.data;
      var d = await AsyncStorage.getItem(BACKGROUND_CALL_DATA);
      const isAlreadyRinging = d && remoteMessage.data.callID !== JSON.parse(d).callID;
      console.log('handleRemoteMessage isAlreadyRinging ', isAlreadyRinging);
      console.log('handleRemoteMessage isUserInConference ', isUserInConference());
      if (isUserInConference()) {
        //user is busy.
        firestore().collection(Consts.CALLS_COLLECTION_NAME)
          .doc(callID)
          .collection(Consts.CALLEE_LOGS_COLLECTION_NAME)
          .doc(this.state.user.id)
          .update({ status: Consts.STATE_BUSY });
        return;
      }
      if (!await isCallStillValid(callID)) return;
      this.isIncomingCallDisplayed = true;
      RNCallKeep.backToForeground();
      await AsyncStorage.setItem(BACKGROUND_CALL_DATA, JSON.stringify(remoteMessage.data));

      if (isAndroid) {
        onShowIncomingCallUi({});
      } else {
        const mUUID = uuid.v4();
        RNCallKeep.displayIncomingCall(mUUID, "Video call", hostUserName, 'generic', true);
      }
      listenForCanceledCall(callID);

    } else {

      isAppBackground = true;
      const { hostUserName, callID } = remoteMessage.data;
      if (!await isCallStillValid(callID)) return;
      RNCallKeep.backToForeground();
      await AsyncStorage.setItem(BACKGROUND_CALL_DATA, JSON.stringify(remoteMessage.data));

      RNCallKeep.removeEventListener('answerCall', onAnswerCallAction);
      RNCallKeep.removeEventListener('endCall', onEndCallAction);
      if (isAndroid) RNCallKeep.removeEventListener('showIncomingCallUi', onShowIncomingCallUi);
      RNCallKeep.addEventListener('answerCall', onAnswerCallAction);
      RNCallKeep.addEventListener('endCall', onEndCallAction);
      if (isAndroid) {
        onShowIncomingCallUi({});
      }
      listenForCanceledCall(callID);
    }
  }

  updateVOIPToken = (data) => {
    const { isLogin, user } = this.state
    var currentToken = data;
    if (__DEV__) {
      console.log('I am in debug');
      currentToken = 'DEV-' + currentToken;
    }
    if (currentToken && currentToken !== user.voipToken) {
      console.log('voip register currentToken : ', user.voipToken, ' == ' + currentToken);

      if (!isLogin) return;

      console.log('update voip token : ', currentToken);
      usersCollectionRef.doc(user.id).update({ voipToken: currentToken });

    }
  }

  addVOIPListener = () => {
    console.log('call register voip =', this.isAlreadyRegisterVoip, 'isBackground = ' + isAppBackground
      , 'isForeground = ' + isAppForeground);

    if (this.isAlreadyRegisterVoip === true) return;
    this.isAlreadyRegisterVoip = true;

    VoipPushNotification.addEventListener('register', (token) => {
      console.log('voip register token : ', token);
      this.updateVOIPToken(token);
    });

    VoipPushNotification.addEventListener('notification', (remoteMessage) => {
      console.log('voip register notification : ', remoteMessage);

      this.handleRemoteMessage(remoteMessage);

      // if (!remoteMessage.data.callID) {
      //   return;
      // }
      // --- optionally, if you `addCompletionHandler` from the native side, 
      //once you have done the js jobs to initiate a call, call `completion()`
      //VoipPushNotification.onVoipNotificationCompleted(notification.uuid);
    });

    // ===== Step 3: subscribe `didLoadWithEvents` event =====
    VoipPushNotification.addEventListener('didLoadWithEvents', async (events) => {
      // --- this will fire when there are events occured before js bridge initialized
      // --- use this event to execute your event handler manually by event type

      console.log('voip register events : ', events);

      if (!events || !Array.isArray(events) || events.length < 1) {
        return;
      }
      for (let voipPushEvent of events) {
        let { name, data } = voipPushEvent;
        if (name === VoipPushNotification.RNVoipPushRemoteNotificationsRegisteredEvent) {

          const { isLogin, user } = this.state
          var currentToken = data;
          if (__DEV__) {
            console.log('I am in debug');
            currentToken = 'DEV-' + currentToken;
          }
          if (currentToken && currentToken !== user.voipToken) {
            console.log('voip register currentToken : ', user.voipToken, ' == ' + currentToken);

            if (!isLogin) return;

            console.log('update voip token : ', currentToken, name);
            usersCollectionRef.doc(user.id).update({ voipToken: currentToken });

          }
          this.updateVOIPToken(data);
        } else if (name === VoipPushNotification.RNVoipPushRemoteNotificationReceivedEvent) {

          // const remoteMessage = data;
          // console.log('update voip push data : ', remoteMessage);
          // //handleRemoteMessage

          // if (!remoteMessage.data.callID) {
          //   return
          // }

          // isAppBackground = false;
          // const { hostUserName, callID } = remoteMessage.data;
          // if (!await isCallStillValid(callID)) return;

          // RNCallKeep.backToForeground();
          // await AsyncStorage.setItem(BACKGROUND_CALL_DATA, JSON.stringify(remoteMessage.data));

          // listenForCanceledCall(callID);

          //RNCallKeep.answerIncomingCall(p.callUUID)
          //answer call for app kill state ios
          //if (cancelledCallListener) cancelledCallListener();
          //willRejectCall = false;
          //setTimeout(() => navigateToConference(), 2000);

        }
      }

    });

    VoipPushNotification.registerVoipToken();
  }

  componentDidMount() {
    console.log('Root\'s mounted with ROOT_URL=', ROOT_URL);
    StatusBar.setBarStyle('light-content', true);

    if (this.appStateListener) this.appStateListener.remove();
    this.appStateListener = AppState.addEventListener('change', this._handleAppStateChange);

    if (Platform.OS === 'android') StatusBar.setBackgroundColor(COLORS.background);

    if (auth().currentUser) {
      auth()
        .currentUser
        .reload()
        .then(() => {
          console.log('Current user reload successfully.');
        }, (_reason) => {
          //Reason : [Error: [auth/user-token-expired] The user's credential is no longer valid. The user must sign in again.]
          Toast.show({
            type: 'notify',
            props: CREDENTIAL_CHANGED_PROPS,
            autoHide: false,
          })
          this.clearLocalUserInfoToLogout()
        }).finally(() => {
          this.userChangeListener && this.userChangeListener()
          this.userChangeListener = auth().onUserChanged(this.onAuthStateChanged)
        })
    } else {
      this.userChangeListener && this.userChangeListener()
      this.userChangeListener = auth().onUserChanged(this.onAuthStateChanged)
    }

    if (!isAndroid) RNCallKeep.addEventListener('didLoadWithEvents', onDidLoadWithNativeEvents);

  }

  componentWillUnmount() {
    if (this.appStateListener) this.appStateListener.remove();

    if (this.unsubscribeFCM) this.unsubscribeFCM();
    if (this.unsubscribeTokenRefreshListener) this.unsubscribeTokenRefreshListener();
    if (this.appUserChangeListener) this.appUserChangeListener();
    if (this.userChangeListener) this.userChangeListener();

    VoipPushNotification.removeEventListener('didLoadWithEvents');
    VoipPushNotification.removeEventListener('register');
    VoipPushNotification.removeEventListener('notification');

    RNCallKeep.removeEventListener('answerCall', onAnswerCallAction);
    RNCallKeep.removeEventListener('endCall', onEndCallAction);
    if (isAndroid) RNCallKeep.removeEventListener('showIncomingCallUi', onShowIncomingCallUi);
    else RNCallKeep.removeEventListener('didLoadWithEvents', onDidLoadWithNativeEvents);
  }

  _handleAppStateChange = (nextAppState) => {

    console.log('App State Login', nextAppState);
    if (nextAppState === 'active') {
      console.log('Foreground!');
      isAppForeground = true;
    } else {
      console.log('background!');
      isAppForeground = false;
    }
  }

  goToNotificationsTab = () => {
    navigate('Notifications')
  }

  requestUserPermission = async (user) => {
    if (this.isAlreadyRequestUserPermission === true) return;
    console.log("Check Your Firebase Token update enable : ", this.isAlreadyRequestUserPermission);
    this.isAlreadyRequestUserPermission = true;
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      this.checkAndUpdateUserDeviceToken(user);
      if (this.unsubscribeFCM) this.unsubscribeFCM();
      this.unsubscribeFCM = messaging().onMessage(async remoteMessage => {
        isAppBackground = false;
        if (!remoteMessage.data.callID) {
          playNotiAndVibrate();
          let props = {
            title: remoteMessage.notification.title,
            body: remoteMessage.notification.body,
            action: this.goToNotificationsTab,
            actionText: 'View',
          }
          if (isUserInConference()) {
            props = {
              title: remoteMessage.notification.title,
              body: remoteMessage.notification.body,
              action: () => { },
              actionText: '',
            }
          }
          Toast.show({
            position: 'top',
            type: 'notify',
            visibilityTime: 6000,
            props
          })
          this.props.setIsThereNewNotification(true)
          return
        }

        if (Platform.OS === 'ios') return;

        isAppForeground = true;
        this.handleRemoteMessage(remoteMessage);
      });
      console.log('Authorization status:', authStatus);
    } else if (Platform.OS === 'ios') {
      Alert.alert
        ('Warning', 'In order to receive a call notification, please enable push notification.',
          [
            {
              text: "Later",
              onPress: () => { },
              style: "cancel",
            },
            {
              text: "Enable",
              onPress: () => {
                //this.requestUserPermission(user);
                Linking.openURL('app-settings:')

              },
            }
          ]);
    }
  }

  updateUserDeviceToken = (user, newToken) => {
    const { isLogin } = this.state;
    if (!isLogin) return;

    usersCollectionRef.doc(user.id).update({
      deviceToken: newToken,
      lastDevice: Platform.OS === 'ios' ? 'ios' : 'android',
    });
  };

  checkAndUpdateUserDeviceToken = async (user) => {
    const currentToken = await this.getFcmToken();
    console.log("Check Your Firebase Token update!");
    if (currentToken && currentToken !== user.deviceToken) {
      console.log("Your Firebase Token update :", currentToken, ' == ' + user.deviceToken);
      this.updateUserDeviceToken(user, currentToken);
    }
    this.listenAndUpdateTokenChange(user);
  };

  getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {//check and upload fcmToken.
      console.log("Your Firebase Token is:", fcmToken);
      return fcmToken;
    } else {
      console.log("Failed", "No token received");
      return null;
    }
  };

  listenAndUpdateTokenChange = (user) => {
    if (this.unsubscribeTokenRefreshListener) this.unsubscribeTokenRefreshListener()
    this.unsubscribeTokenRefreshListener = messaging()
      .onTokenRefresh(async newFcmToken => {
        if (newFcmToken === user.deviceToken) return
        this.updateUserDeviceToken(user, newFcmToken);
      });
  };

  render() {
    const { isLogin, isReady } = this.state;
    return (
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <NavigationContainer ref={setNavigationRef}>
            {isLogin ? (
              <Stack.Navigator
                initialRouteName="Befriender"
                screenOptions={{
                  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                  header: () => null,
                  headerShadowVisible: false,
                  cardStyle: {
                    backgroundColor: COLORS.background,
                  },
                  headerMode: 'screen',
                  headerStatusBarHeight: 0,
                  detachPreviousScreen: true,
                }}
              >
                <Stack.Screen name="Befriender"
                  component={MainNavigation}
                />
                <Stack.Screen name="Conference"
                  component={Conference}
                />
                <Stack.Screen name="Detail"
                  component={Detail}
                />
                <Stack.Screen name="MessageDetails"
                  component={MessageDetails}
                />
                <Stack.Screen name="ResetPassword"
                  component={ResetPasswordNavigation}
                />
                <Stack.Screen name="EditProfile"
                  component={EditProfile}
                />
                <Stack.Screen name="EditVideo"
                  component={EditVideo}
                />
                <Stack.Screen name="EditMusic"
                  component={EditMusic}
                />
                <Stack.Screen name="EditRadio"
                  component={EditRadio}
                />
                <Stack.Screen name="ViewPhoto"
                  component={ViewPhoto}
                />
                <Stack.Screen name="AddPhoto"
                  component={AddPhoto}
                />
              </Stack.Navigator>
            ) : (
              <Stack.Navigator screenOptions={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                header: () => null
              }}>
                {isReady
                  ? (<>
                    <Stack.Screen
                      name="Sign In"
                      component={SignInScreen}
                    />
                    <Stack.Screen
                      name="ForgotPassword"
                      component={ForgotPassword} />
                  </>
                  )
                  : <Stack.Screen
                    name="LandingPage"
                    component={Loading} />
                }
              </Stack.Navigator>
            )}
          </NavigationContainer>
          <Toast config={TOAST_CONFIG} position='bottom' />
        </SafeAreaProvider>
      </PaperProvider>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user.user,
});

const mapDispatchToProps = { setUser, setIsThereNewNotification, clearNotiList };

export default connect(mapStateToProps, mapDispatchToProps)(Root);
