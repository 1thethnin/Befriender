/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    BackHandler,
    Alert,
    StatusBar,
    TouchableWithoutFeedback,
    Animated,
    Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    TwilioVideoLocalView, // to get local view
    TwilioVideoParticipantView, //to get participant view
    TwilioVideo,
} from 'react-native-twilio-video-webrtc';
import firestore from '@react-native-firebase/firestore';
import { Avatar, Snackbar, Text } from 'react-native-paper';
import Consts, { hasConferenceTerminated, ROOT_URL, VIDEO_CALL_STATUS } from '../Consts';
import BrickList from '../components/BrickList';
import { checkAndAskPermissions, getTwilioToken, initiateVideoCall } from '../services/ConferenceHelper';
import RNCallKeep from 'react-native-callkeep';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import Toast from 'react-native-toast-message';
import { connect } from 'react-redux';
import Share from 'react-native-share';
import Config from 'react-native-config';
import { SafeAreaView } from 'react-native-safe-area-context';
import Sound from 'react-native-sound';
import { isIphoneX } from 'react-native-iphone-x-helper';

const buttonSize = 60;

class Conference extends Component {
    constructor(props) {
        super(props);
        this.state = {
            identity: null,
            jwt: null,
            wasPartnerLeft: null,
            status: props.route.params.type === Consts.STATE_CALLING ? Consts.STATE_CONNECTING : Consts.STATE_RINGING,
            videoTracks: {},
            startedTime: new Date().getTime(),
            dimension: Dimensions.get('window'),
            currentUser: {},
            isMute: false,
            enableLocalView: true,
            dominantSpeakerSID: '',
            hightAndColumn: { itemHeight: 0, column: 1 },
            isCallShareable: false,
            mutedParticipants: [],
        };
        this.isHidden = false;
        this.slideAnimation = new Animated.Value(0);
        this._getTwillioToken = this._getTwillioToken.bind(this);
        this._onHangupBtnPress = this._onHangupBtnPress.bind(this);
        this._onPickupBtnPress = this._onPickupBtnPress.bind(this);
    }

    toggleControls = () => {
        Animated.timing(this.slideAnimation, {
            toValue: this.isHidden ? 0 : 100,
            duration: 400,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                this.isHidden = !this.isHidden
            }
        })
    }

    async componentDidMount() {
        await SystemNavigationBar.navigationHide();
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        var userData = this.props.user;
        this.setState({ currentUser: userData });
        // Event Listener for orientation changes
        Dimensions.addEventListener('change', () => {
            this.setState({
                dimension: Dimensions.get('screen')
            });
        });
        const { route, user } = this.props;
        const {
            roomName,
            willJoinRoomDirectly,
            callID,
            isNotShareable,
        } = route.params;
        this.setState({
            dimension: Dimensions.get('screen'),
            isCallShareable: roomName === user.id && !isNotShareable,
        });
        if (willJoinRoomDirectly) {
            this._onPickupBtnPress();
            return;
        }
        const { status } = this.state;
        if (status === Consts.STATE_CONNECTING) {
            this.callElder();
        }
        if (status === Consts.STATE_RINGING) {
            this.callID = callID;
            this.playRingtone();
        }
        if (this.callID) {
            //listen for rejected call and ended call
            this.roomRef = firestore()
                .collection(Consts.CALLS_COLLECTION_NAME)
                .doc(this.callID)
                .onSnapshot((doc) => {
                    if (!doc || !doc.data()) {
                        return;
                    }
                    if (hasConferenceTerminated(doc.data().status)) {
                        this._stopRingtone();
                        this.setState({ status: doc.data().status, calleeName: doc.data().name });
                        this.disconnectCurrentUser();
                        this.goBackAfterTimeout();
                    }
                });
        }
    }

    callElder = async () => {
        const { route, user, callingUsers } = this.props;
        const {
            currentUserName,
            roomName,
        } = route.params;
        const isPermissionGranted = await checkAndAskPermissions();
        if (!isPermissionGranted) {
            this.setState({ status: Consts.STATE_CANCELED });
            this.goBackAfterTimeout();
            return;
        }
        const result = await this._getTwillioToken(currentUserName, roomName);
        if (!result) {
            this.setState({ status: Consts.STATE_CANCELED });
            this.goBackAfterTimeout();
            return;
        }
        // connecting state will be when this user calls another one.
        this.callID = await initiateVideoCall(callingUsers, user.name, user.profile_image_url, user.gender, user, () => {
            const { status } = this.state
            return hasConferenceTerminated(status)
        });
        if (!this.callID) {
            this.setState({ status: Consts.STATE_CANCELED });
            this.goBackAfterTimeout();
            return;
        }
        this.onlineTimeout = setTimeout(() => {
            const isSingleUserCall = callingUsers.length === 1
            Toast.show({
                type: 'info',
                text1: 'Call cancelled',
                text2: `Sorry, selected user${isSingleUserCall ? '' : 's'} seem${isSingleUserCall ? 's' : ''} to be offline.`,
            })
            this.setState({ status: Consts.STATE_CANCELED });
            this.timeoutCall({ status: Consts.STATE_CANCELED });
            this.goBackAfterTimeout();
        }, 5000);
        let currentCallRef = firestore()
            .collection(Consts.CALLS_COLLECTION_NAME)
            .doc(this.callID)
        this.calleeLogRef = currentCallRef
            .collection(Consts.CALLEE_LOGS_COLLECTION_NAME)
            .onSnapshot((docs) => {
                if (
                    docs.docs.length === 1
                    && !hasConferenceTerminated(this.state.status)
                    && hasConferenceTerminated(docs.docs[0].data().status)
                ) {
                    const { status, name } = docs.docs[0].data();
                    if (this.callTimeout) clearTimeout(this.callTimeout);
                    this._stopRingtone();
                    this.setState({ status, calleeName: name });

                    //remove room ref first because status update will trigger causing double back.
                    if (this.roomRef) this.roomRef();
                    currentCallRef.update({ status: status });

                    this.disconnectCurrentUser();
                    this.goBackAfterTimeout();
                    this.calleeLogRef && this.calleeLogRef();
                    return true;
                }
                docs.docChanges().forEach(cd => {
                    const changedStatus = cd.doc.data().status;
                    if (changedStatus === Consts.STATE_PICK_UP) {
                        if (this.callTimeout) {
                            clearTimeout(this.callTimeout);
                        }
                        return true;
                    } else if (changedStatus === Consts.STATE_RINGING) {
                        const { status } = this.state
                        if (status === Consts.STATE_RINGING) return//if ringing state has been set earlier, we can skip.
                        if (this.onlineTimeout) clearTimeout(this.onlineTimeout)
                        this.setState({ status: Consts.STATE_RINGING })
                        this.callTimeout = setTimeout(() => {
                            this.setState({ status: Consts.STATE_TIMEOUT });
                            this.timeoutCall();
                            this.goBackAfterTimeout();
                        }, 30000);
                    }
                });
            });
    }

    goBackAfterTimeout = () => {
        if (this.doneViewTimeout) return
        this.doneViewTimeout = setTimeout(() => {
            console.log('goBacAfterTimeout() doneViewTimeout callback');
            this.goBack();
        }, 2000);
    };

    handleBackButton = () => {
        this.confirmConferenceExit(() => {
            /*const {
                type,
                isSingleUserCall,
            } = this.props.route.params;
            //if this call was initiated by current user, we need to end the conference.
            if (type === Consts.STATE_CALLING && isSingleUserCall) {
                this.endConference();
            }
            this.goBack()*/
            this._onEndBtnPress();

        });
        return true;
    }

    confirmConferenceExit = (callback) => {
        const { status } = this.state
        if (hasConferenceTerminated(status)) {
            this.goBack();
            return;
        }
        Alert.alert(
            "Leave Call?",
            "Are you sure to exit?",
            [
                {
                    text: "Cancel",
                    onPress: () => SystemNavigationBar.fullScreen(true),
                    style: "cancel"
                },
                { text: "Yes", onPress: () => callback() }
            ]
        );
    };

    playRingtone() {
        try {
            var self = this;
            this.ringtone = new Sound("lions_befriender_ringtone.mpg", Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    console.log('failed to load the sound', error);
                    return;
                }
                self.ringtone.setNumberOfLoops(-1);//loop indefinite
                self.ringtone.play();
            });
        } catch (e) {
            console.error(`cannot play the sound file`, e);
        }
    }

    componentWillUnmount() {
        console.log('call component unmount!');
        SystemNavigationBar.navigationShow();
        if (this.callID && !hasConferenceTerminated(this.state.status)) {
            this._onEndBtnPress();
        }
        if (this.callTimeout) {
            clearTimeout(this.callTimeout);
        }
        if (this.calleeLogRef) {
            this.calleeLogRef();
        }
        this._stopRingtone();
        if (this.roomRef) {
            this.roomRef();
        }
        this.disconnectCurrentUser();
        if (this.backHandler) {
            this.backHandler.remove();
        }
        if (this.doneViewTimeout) clearTimeout(this.doneViewTimeout);
        this._stopRingtone();
    }

    _stopRingtone = () => {
        if (this.ringtone) {
            this.ringtone.stop();
            this.ringtone.release();
        }
    }

    async _getTwillioToken(currentUserName, roomName) {
        try {
            const { isCallShareable } = this.state;
            const roomType = isCallShareable ? 'group' : 'go';
            const token = await getTwilioToken({ roomName: roomName, currentUserName: currentUserName, roomType });
            const { status } = this.state
            if (!token || hasConferenceTerminated(status)) {
                return;
            }
            this.setState({
                identity: currentUserName,
                userName: currentUserName,
                jwt: token,
                wasPartnerLeft: false,
            });
            if (!this.twilioVideo) {
                console.error('Twilio Video reference is null.');
                return;
            }
            this.twilioVideo.connect({
                roomName: roomName,
                accessToken: token,
                enableVideo: true,
                dominantSpeakerEnabled: true,
                maintainVideoTrackInBackground: true,
            });
            return token;
        } catch (e) {
            console.error('token get error', e);
        }
        return null;
    }

    timeoutCall = ({ status = Consts.STATE_TIMEOUT } = {}) => {
        firestore()
            .collection(Consts.CALLS_COLLECTION_NAME)
            .doc(this.callID)
            .update({ status })
            .catch(e => {
                console.log('timeoutCall() error:', e);
            });
    }

    goBack = async () => {
        const { navigation } = this.props;
        if (!navigation.canGoBack()) {
            return;
        }
        navigation.goBack(null);
    }

    _onEndBtnPress = async (status) => {
        this.disconnectCurrentUser();
        const { currentUser } = this.state;
        const { type } = this.props.route.params;
        if (type === Consts.STATE_CALLING
            && VIDEO_CALL_STATUS.CONNECTED === (status || this.state.status)) {
            this.setState({ status: Consts.STATE_ENDED, videoTracks: {} });
        } else {
            this.setState({ status: Consts.STATE_CANCELED });
        }
        const {
            currentUserName,
            roomName,
        } = this.props.route.params;
        const isCurrentUserHost = roomName === currentUser.id && currentUserName === currentUser.name;
        if (isCurrentUserHost) {
            //destroy conference end listener to avoid double back.
            this.calleeLogRef && this.calleeLogRef();
            this.roomRef && this.roomRef();
        }
        await this.endConference();
        this.goBackAfterTimeout();
    };

    _releaseAllResources = () => {
        if (!this.twilioVideo) {
            console.log('twilio video is already destroyed!');
        }
        this.twilioVideo.disconnect();
    };

    async endConference() {
        const startedTime = this.state.startedTime;
        const duration = (new Date().getTime() - startedTime) / 1000 / 60;
        const { type } = this.props.route.params;
        if (type === Consts.STATE_CALLING) {
            const { status } = this.state;
            if (status === Consts.STATE_CONNECTING) {
                return;
            }
            const docRef = firestore().collection(Consts.CALLS_COLLECTION_NAME).doc(this.callID);
            var snapshot = await docRef.get();
            let callStatus = this.state.status === VIDEO_CALL_STATUS.CONNECTED ? Consts.STATE_ENDED : this.state.status
            //update all participants state and duration as the host ended the session.
            snapshot.data()?.callee?.map(userIDArg => {
                this._getCalleeLogRef(userIDArg).update({ status: callStatus, duration });
            });
            //current conference is initiated by current app user, terminating the whole conference.
            firestore()
                .collection(Consts.CALLS_COLLECTION_NAME)
                .doc(this.callID)
                .update({
                    status: callStatus,
                    duration,
                }).catch(e => {
                    console.log("call state update error:", e);
                });
        } else {
            this.endIncomingCall(Consts.STATE_ENDED, duration);
        }
    }

    endIncomingCall = (status, duration) => {
        var { currentUser } = this.state;
        //current conference is initiated by another user, quitting callee(or participant) just for current app user.
        this._getCalleeLogRef(currentUser.id).update({ status, duration });
        this.dismissCallKeep();
    }

    _getCalleeLogRef = (userID) => {
        return firestore().collection(Consts.CALLS_COLLECTION_NAME).doc(this.callID).collection(Consts.CALLEE_LOGS_COLLECTION_NAME).doc(userID);
    }

    _onRoomDidConnect = () => {
        this.startDate = new Date();
        const { status, isCallShareable } = this.state
        if (hasConferenceTerminated(status) || (isCallShareable && status !== Consts.STATE_RINGING)) return
        this.setState({ status: VIDEO_CALL_STATUS.CONNECTED });
    };

    _onRoomDidDisconnect = ({ roomName, error }) => {
        if (error) {
            console.error('disconnected ERROR: ', JSON.stringify(error));
        }
        console.log(`_onRoomDidDisconnect() room name=${roomName}`);
        //this.setState({ status: VIDEO_CALL_STATUS.DISCONNECTED });
    };

    _onRoomDidFailToConnect = (error) => {
        if (error) {
            console.error('failed to connect ERROR: ', JSON.stringify(error));
            this.setState({ showSnackbar: true, snackbarMsg: error.error });
        }
        this._onEndBtnPress(VIDEO_CALL_STATUS.DISCONNECTED);
    };

    _onParticipantAddedVideoTrack = ({ participant, track }) => {
        // clear call timeout if anonymous or any participant is added.
        if (this.callTimeout) clearTimeout(this.callTimeout);
        // call everytime a participant joins the same room
        if (this.waitingTimeout) {
            clearTimeout(this.waitingTimeout);
        }
        const vTracks = this.state.videoTracks;
        vTracks[track.trackSid] = {
            id: track.trackSid,
            participantSid: participant.sid,
            videoTrackSid: track.trackSid,
            identity: participant.identity,
            audioEnabled: track.enabled,
        };

        const { dimension } = this.state;
        const participantCount = Object.values(vTracks).length;
        var hightAndColumn = this.getItemHeightAndColumns(
            participantCount,
            dimension.height - (Platform.OS === 'ios' ? this.hasNotch() ? 50 : 25 : StatusBar.currentHeight),
            this.isPortrait()
        );
        this.setState({
            videoTracks: vTracks,
            hightAndColumn,
        }, () => {
            if (this.isHidden) return
            this.toggleControls()
        });
    };

    hasNotch = () => {
        return StatusBar.currentHeight > 24 || isIphoneX();
    };

    _onParticipantRemovedVideoTrack = ({ participant, track }) => {
        // gets called when a participant disconnects.
        const videoTracks = this.state.videoTracks;

        delete videoTracks[track.trackSid];
        const { dimension } = this.state;
        const participantCount = Object.values(videoTracks).length;
        var hightAndColumn = this.getItemHeightAndColumns(
            participantCount,
            dimension.height - (Platform.OS === 'ios' ? this.hasNotch() ? 50 : 25 : StatusBar.currentHeight),
            this.isPortrait()
        );
        this.setState({ videoTracks, hightAndColumn });
        //if the last participant left the room, terminate the conference.
        if (Object.values(videoTracks).length < 1) {
            //sometimes, participant unsubscribe unintentionally, may be because of network.
            //and wait for it a moment to subcribe automatically.
            this.waitingTimeout = setTimeout(() => {
                const { status } = this.state;
                if (hasConferenceTerminated(status)) return;
                this._onEndBtnPress();
            }, 2000);
        }
    };

    _onHangupBtnPress() {
        this.setState({ status: Consts.STATE_REJECTED });
        this.dismissCallKeep();
        this._stopRingtone();
        this.endIncomingCall(Consts.STATE_REJECTED, 0);
        this.goBack();
    }

    dismissCallKeep = () => {
        RNCallKeep.endAllCalls();
    }

    async _onPickupBtnPress() {
        const { route } = this.props;
        const {
            currentUserName,
            roomName,
            callID,
        } = route.params;
        this.callID = callID;
        const { currentUser } = this.state;
        this.dismissCallKeep();
        this._stopRingtone();
        this._getCalleeLogRef(currentUser.id).update({ status: Consts.STATE_PICK_UP });
        this.setState({
            status: "connecting"
        });
        const isPermissionGranted = await checkAndAskPermissions();
        if (!isPermissionGranted) {
            this._onEndBtnPress();
            return;
        }
        this._getTwillioToken(currentUserName, roomName);
    }

    getItemHeightAndColumns = (itemCount, screenHeightPixels, isPortrait) => {
        var rowsAndColumn;
        if (itemCount < 3) {//4 is maximum portrait column count.
            if (isPortrait) {
                //if count is only 3, its equal to row count.
                rowsAndColumn = { row: itemCount, column: 1 };
            } else {
                //if count is only 3, its equal to row count.
                rowsAndColumn = { row: 1, column: itemCount };
            }
        } else {
            var startingColumnCount = isPortrait ? 2 : 4;
            rowsAndColumn = this.getNumberOfRowsAndColumn(itemCount, startingColumnCount, isPortrait);
        }
        var itemHeight = screenHeightPixels / rowsAndColumn.row;
        return { itemHeight, column: rowsAndColumn.column };
    };

    getNumberOfRowsAndColumn = (itemCount, columnCount, isPortrait) => {
        const rowCount = Math.round((itemCount * 1.0) / columnCount);
        var rowAndColumn = { row: rowCount, column: columnCount };
        const maxRowCount = isPortrait ? 6 : 3;
        const maxColumnCount = isPortrait ? 3 : 6;
        if (rowCount > maxRowCount && columnCount < maxColumnCount) {
            //increase column count.
            rowAndColumn = this.getNumberOfRowsAndColumn(itemCount, columnCount + 1, isPortrait);
        }
        return rowAndColumn;
    };

    /**
     * Returns true if the screen is in portrait mode
     */
    isPortrait = () => {
        const { dimension } = this.state;
        return dimension.height >= dimension.width;
    };

    _toggleMute = async () => {
        const { isMute } = this.state;
        const isEnabled = await this.twilioVideo.setLocalAudioEnabled(isMute);
        this.setState({
            isMute: !isEnabled,
        });
    };

    _toggleMuteParticipant = async (username, isMute, pSid) => {
        //the bellow code is working only on android.
        const rootRef = firestore().collection(Consts.CALLS_COLLECTION_NAME)
            .doc(this.callID)
            .collection(Consts.CALLEE_LOGS_COLLECTION_NAME);

        const data = await rootRef
            .where('name', '==', username)
            .get();
        const { isCallShareable } = this.state
        if (isCallShareable && data.docs.length < 1) {
            //do nothing
            this.setState({ showSnackbar: true, snackbarMsg: 'Sorry, mute is disabled for guest users.' });
            return;
        }
        rootRef.doc(data.docs[0].id).update({ isMute });
        let mutedList = [].concat(this.state.mutedParticipants);
        if (isMute) {
            mutedList.push(pSid);
        } else {
            mutedList = mutedList.filter(sid => pSid !== sid)
        }
        this.setState({ mutedParticipants: mutedList });
    };

    handleAudioStateChange = ({ participant, track }) => {
        // const { videoTracks } = this.state;
        // const update = {};
        // Object.values(videoTracks).forEach(v => {
        //     let e = { ...v };
        //     if (participant.sid === e.participantSid) {
        //         e.audioEnabled = track.enabled;
        //     }
        //     update[v.id] = e;
        // });
        // this.setState({ videoTracks: update });

        // const pSid = participant.sid;
        // const isMute = !track.enabled;
        // let mutedList = [].concat(this.state.mutedParticipants);
        // if (isMute) {
        //     mutedList.push(pSid);
        // } else {
        //     mutedList = mutedList.filter(sid => pSid !== sid)
        // }
        // this.setState({ mutedParticipants: mutedList });
    };

    _onParticipantDisabledAudioTrack = (p) => {
        this.handleAudioStateChange(p);
    };

    _onParticipantEnabledAudioTrack = (p) => {
        this.handleAudioStateChange(p);
    };

    // _onNetworkLevelChanged = ({ participant, isLocalUser, quality }) => {
    //     console.log("Participant", participant, "isLocalUser", isLocalUser, "quality", quality);
    // };

    _onDominantSpeakerDidChange = ({ roomName, roomSid, participant }) => {
        const { videoTracks } = this.state;
        if (Object.values(videoTracks).length < 2) {
            this.setState({ dominantSpeakerSID: '' });
            return;
        }
        this.setState({ dominantSpeakerSID: participant.sid });
    };

    /*This method is created to disconnect user, as sdk disconnect is not working */
    disconnectCurrentUser = async () => {
        this._releaseAllResources()
    };

    shareBtnClick = async () => {
        try {
            const {
                currentUserName,
                roomName,
            } = this.props.route.params;
            const roomUrl = `https://${Config.PROJECT_ALIAS}.web.app/room?rn=${roomName}&un=${'Guest'}`
            console.log('roomUrl=', roomUrl);
            const shareAction = await Share.open({
                title: 'Video call Invitation',
                message: `You have been invited to join a video call with "${currentUserName}". You can join here ${roomUrl}`,
            });
            // Toast.show({
            //     text1: shareAction.message,
            //     type: 'success',
            // });
            await SystemNavigationBar.navigationHide();
        } catch (e) {
            // Toast.show({
            //     text1: e.message,
            //     type: 'info',
            // });
        }
    }

    isParticipantMute = (pSid) => {
        const { mutedParticipants } = this.state;
        const isMuted = mutedParticipants.includes(pSid);
        console.log('isParticipantMute=', isMuted);
        return isMuted;
    }

    render() {
        const {
            gender,
            userName,
            userProfile,
            type,
        } = this.props.route.params;
        const {
            status,
            isMute,
            calleeName,
            showSnackbar,
            snackbarMsg,
            enableLocalView,
            dominantSpeakerSID,
            hightAndColumn,
            videoTracks,
            isCallShareable,
        } = this.state;
        const isRinging = (status === Consts.STATE_RINGING);
        const hasTerminated = hasConferenceTerminated(status);
        if (isRinging || hasTerminated) {
            var buttonVisibility = 1;
            var contentText = `Incoming call ...`;
            if (hasTerminated) {
                buttonVisibility = 0;
                contentText = (status === Consts.STATE_BUSY) ? `${calleeName} was ${status}!` : `Call was ${status}!`;
            }
        }
        const participantCount = Object.values(videoTracks).length;
        var listID = `${participantCount < 3 ? 1 : hightAndColumn.column}`;
        return (
            <SafeAreaView
                edges={['top']}
                style={styles.container}>
                <View style={styles.container} >
                    <StatusBar barStyle={'light-content'} backgroundColor={'black'} />
                    {
                        ((isRinging && type !== Consts.STATE_CALLING) || hasTerminated)
                            ? <>
                                <View
                                    style={styles.waitingViewContainer}>
                                    <Text style={styles.waitingComponents}>{`${gender} ${userName}`}</Text>
                                    {userProfile ? <Avatar.Image size={100} source={{ uri: userProfile }} /> : null}
                                    <Text style={styles.waitingComponents}>{contentText}</Text>
                                </View>
                                <View style={[styles.ringButtonsContainer,]}>
                                    <TouchableOpacity
                                        onPress={this._onHangupBtnPress}
                                        style={[styles.hangupBtn, { opacity: buttonVisibility }]}
                                        disabled={hasTerminated}>
                                        <MaterialCommunityIcons
                                            name="phone-hangup"
                                            size={30}
                                            color="white"
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={this._onPickupBtnPress}
                                        style={[styles.pickupBtn, { opacity: buttonVisibility }]}
                                        disabled={hasTerminated}>
                                        <MaterialCommunityIcons
                                            name="phone-outline"
                                            size={30}
                                            color="white"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </>
                            : <>
                                {
                                    (participantCount < 1)
                                        ? <View
                                            style={styles.waitingViewContainer}>
                                            <Text style={styles.waitingComponents}>{`${gender} ${userName}`}</Text>
                                            {userProfile ? <Avatar.Image size={100} source={{ uri: userProfile }} /> : null}
                                            <Text style={styles.waitingComponents}>
                                                {
                                                    status === VIDEO_CALL_STATUS.CONNECTED
                                                        ? 'Waiting ...'
                                                        : (status === Consts.STATE_RINGING)
                                                            ? 'Ringing ...'
                                                            : 'Connecting ...'
                                                }
                                            </Text>
                                        </View>
                                        : <View style={styles.participantsContainer}>
                                            <BrickList
                                                key={listID}
                                                data={Object.values(videoTracks)}
                                                rowHeight={hightAndColumn.itemHeight}
                                                renderItem={(item) => {
                                                    var border = {};
                                                    var micColor = '#FFFFFF';
                                                    if (item.participantSid === dominantSpeakerSID) {
                                                        border = { borderColor: '#2dbf1d', borderWidth: 4, padding: 4 };
                                                        micColor = '#2dbf1d';
                                                    }
                                                    const isMuted = this.isParticipantMute(item.participantSid);
                                                    return (
                                                        <View
                                                            key={item.videoTrackSid}
                                                            style={[styles.remoteVideo, border]}
                                                        >
                                                            <TouchableWithoutFeedback onPress={this.toggleControls}>
                                                                <TwilioVideoParticipantView
                                                                    style={[{ flex: 1, height: hightAndColumn.itemHeight }]}
                                                                    key={`${item.videoTrackSid}`}
                                                                    trackIdentifier={item}
                                                                    applyZOrder={false}
                                                                />
                                                            </TouchableWithoutFeedback>
                                                            <Text style={styles.identity} numberOfLines={1} ellipsizeMode='tail'>{item.identity}</Text>
                                                            {
                                                                isCallShareable
                                                                    ? <TouchableOpacity
                                                                        style={styles.micIcon}
                                                                        onPress={() => { this._toggleMuteParticipant(item.identity, !isMuted, item.participantSid); }}>
                                                                        <MaterialCommunityIcons
                                                                            name={!isMuted ? 'microphone' : 'microphone-off'}
                                                                            color={micColor}
                                                                            size={24} />
                                                                    </TouchableOpacity>
                                                                    : null
                                                            }
                                                        </View>);
                                                }
                                                }
                                                columns={hightAndColumn.column}
                                            >
                                            </BrickList>
                                        </View>
                                }
                                {
                                    status === VIDEO_CALL_STATUS.CONNECTED ?
                                        <Animated.View
                                            style={[
                                                styles.localVideoContainer,
                                                { transform: [{ translateY: this.slideAnimation }] },
                                            ]}>
                                            <TwilioVideoLocalView
                                                enabled={enableLocalView}
                                                style={styles.localVideo}
                                                applyZOrder={true}
                                            />
                                        </Animated.View>
                                        : null
                                }
                                <Animated.View
                                    style={[
                                        styles.endBtnContainer,
                                        { transform: [{ translateY: this.slideAnimation }] }]}
                                >
                                    {
                                        status === Consts.STATE_ENDED
                                            ? null
                                            : <>
                                                {
                                                    status === VIDEO_CALL_STATUS.CONNECTED ?
                                                        <TouchableOpacity
                                                            onPress={this._toggleMute}
                                                            style={styles.toggleMuteBtn}>
                                                            <MaterialCommunityIcons
                                                                name={isMute ? "microphone-off" : "microphone"}
                                                                size={30}
                                                                color="white"
                                                            />
                                                        </TouchableOpacity>
                                                        : null
                                                }
                                                <TouchableOpacity
                                                    onPress={() => this._onEndBtnPress()}
                                                    style={styles.hangupBtn} >
                                                    <MaterialCommunityIcons
                                                        name="phone-hangup"
                                                        size={30}
                                                        color="white"
                                                    />
                                                </TouchableOpacity>
                                                {
                                                    (isCallShareable) ?//this call is hosted
                                                        <TouchableOpacity
                                                            onPress={this.shareBtnClick}
                                                            style={styles.share}>
                                                            <MaterialCommunityIcons
                                                                name='share-variant'
                                                                color='black'
                                                                size={30} />
                                                        </TouchableOpacity>
                                                        : null
                                                }
                                            </>
                                    }
                                </Animated.View>
                            </>
                    }

                    <TwilioVideo
                        ref={(ref) => (this.twilioVideo = ref)}
                        onRoomDidConnect={this._onRoomDidConnect}
                        onRoomDidDisconnect={this._onRoomDidDisconnect}
                        onRoomDidFailToConnect={this._onRoomDidFailToConnect}
                        onParticipantAddedVideoTrack={
                            this._onParticipantAddedVideoTrack
                        }
                        onParticipantRemovedVideoTrack={
                            this._onParticipantRemovedVideoTrack
                        }
                        onParticipantDisabledAudioTrack={this._onParticipantDisabledAudioTrack}
                        onParticipantEnabledAudioTrack={this._onParticipantEnabledAudioTrack}
                        onDominantSpeakerDidChange={this._onDominantSpeakerDidChange}
                    />
                    <Snackbar
                        visible={showSnackbar === true}
                        onDismiss={() => { this.setState({ showSnackbar: false }) }}
                        action={{
                            label: 'OK',
                            onPress: () => {
                                this.setState({ showSnackbar: false });
                            },
                        }}>
                        {snackbarMsg}
                    </Snackbar>
                </View >
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'black',
        flex: 1,
    },
    remoteVideo: {
        flexDirection: 'column',
        flex: 1,
    },
    localVideo: {
        width: '100%',
        height: '100%',
    },
    localVideoContainer: {
        width: 120,
        height: 160,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        zIndex: 2,
        position: 'absolute',
        bottom: 110,
        right: 16,
    },
    endBtnContainer: {
        position: 'absolute',
        width: '100%',
        flexDirection: 'row',
        bottom: 32,
        justifyContent: 'space-evenly',
        zIndex: 3,
        height: 64,
    },
    ringButtonsContainer: {
        position: 'absolute',
        display: 'flex',
        flexDirection: "row",
        width: "100%",
        justifyContent: 'space-evenly',
        bottom: 10,
    },
    toggleMuteBtn: {
        backgroundColor: 'green',
        borderRadius: 50,
        display: 'flex',
        width: buttonSize,
        height: buttonSize,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hangupBtn: {
        backgroundColor: 'red',
        borderRadius: 50,
        display: 'flex',
        width: buttonSize,
        height: buttonSize,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickupBtn: {
        backgroundColor: 'green',
        borderRadius: 50,
        display: 'flex',
        width: buttonSize,
        height: buttonSize,
        alignItems: 'center',
        justifyContent: 'center',
    },
    waitingComponents: {
        color: '#FFFFFF',
        fontSize: 18,
    },
    waitingViewContainer: {
        position: 'absolute',
        backgroundColor: "black",
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    participantsContainer: {
        flex: 1,
        height: "100%",
        alignItems: 'stretch'
    },
    doneLayout: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    identity: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        color: '#FFFFFF',
        width: '100%',
        padding: 4,
        left: 0,
        top: 0,
        textAlign: 'center',
        position: 'absolute',
    },
    micIcon: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 8,
        color: '#FFFFFF',
        padding: 8,
        left: 0,
        bottom: 0,
        textAlign: 'center',
        position: 'absolute',
    },
    share: {
        backgroundColor: 'white',
        borderRadius: 50,
        display: 'flex',
        width: buttonSize,
        height: buttonSize,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

const mapStateToProps = (state) => ({
    user: state.user.user,
    callingUsers: state.user.callingUsers,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Conference);
