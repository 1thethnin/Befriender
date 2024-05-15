/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { Checkbox, Text, withTheme } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import ListItem from '../components/ListItem';
import { getDefaultState, Screens } from '../GlobalStates';
import BefrienderButton from '../components/button';
import { setUser, setContacts, setCallingUsers } from '../redux/features/user_slice';
import { setContact } from "../redux/features/contact_slice";
import { connect } from 'react-redux';
import Consts, { COLORS, hasConferenceTerminated } from '../Consts';
import common_style from '../common_style';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Loading from '../components/loading';
import { setIsThereNewNotification } from '../redux/features/notification_slice';
import { setShowCheckbox } from '../redux/features/home_slice';
class HomeScreen extends Component {
    constructor(props) {
        super(props);
        this.tmp = Screens.Home;
        Screens.Home = this;
        this.state = {
            isReady: false,
            isCall: false,
            callId: null,
            selectedUsers: [],
            showOngoingCall: false,
            ...getDefaultState(),
        };
        this._call = this._call.bind(this);
    }

    componentDidMount() {
        const { user, setContacts } = this.props;
        this.dataSource = firestore()
            .collection('users')
            .doc(user.id)
            .onSnapshot((documentSnapshot) => {
                if (this.userListUnsubscribe) this.userListUnsubscribe();

                if(!documentSnapshot) return;
                if(!documentSnapshot.data()) return;

                this.userListUnsubscribe = firestore()
                    .collection('users')
                    .where('role', '==', 'User')
                    .where('befriendersIDS', 'array-contains', user.id)
                    //.where('center', "==", documentSnapshot.data().center)
                    .onSnapshot((querySnapshot) => {
                        const { selectedUsers } = this.state
                        let userList = [];
                        let selectedUsersUpdated = [];
                        if(!querySnapshot || !querySnapshot.docs) return;

                        querySnapshot.docs.forEach((doc) => {
                            const updatedUser = { id: doc.id, ...doc.data() }
                            userList.push(updatedUser)
                            if (selectedUsers) {
                                selectedUsers.forEach(su => {
                                    if (doc.id === su.id) {
                                        selectedUsersUpdated.push(updatedUser)
                                    }
                                })
                            }
                        });
                        setContacts(userList);
                        this.setState({ isReady: true.valueOf, selectedUsers: selectedUsersUpdated });
                    });
            })
    }

    componentWillUnmount() {
        Screens.Home = this.tmp;
        this.dataSource && this.dataSource();
        this.userListUnsubscribe && this.userListUnsubscribe();
        if (this.groupRoomRef) {
            this.groupRoomRef();
        }
    }

    async _call(users, adminName, adminProfile, adminGender, { isNotShareable = false } = {}) {
        const { user, navigation, setCallingUsers } = this.props;
        var userName = `Hosting group call ...`;
        var userProfile = adminProfile;
        var gender = "";
        if (users.length <= 1) {
            userName = users[0].name;
            userProfile = users[0].profile_image_url;
            gender = users[0].gender;
        }
        const params = {
            currentUserName: adminName,
            roomName: user.id,
            userName,
            userProfile,
            gender,
            type: Consts.STATE_CALLING,
            isNotShareable,
        };
        setCallingUsers(users)
        navigation.navigate('Conference', params);

        // if (!isSingleUserCall && wasCallCreatedSuccessfully) {
        //     console.log('_call wasCallCreatedSuccessfully(),', wasCallCreatedSuccessfully);
        //     this.setState({ showOngoingCall: true });
        //     this.groupRoomRef = firestore()
        //         .collection(Consts.CALLS_COLLECTION_NAME)
        //         .doc(user.id)
        //         .onSnapshot((doc) => {
        //             if (!doc || !doc.data()) {
        //                 return;
        //             }
        //             if (hasConferenceTerminated(doc.data().status)) {
        //                 this.groupRoomRef()
        //                 this.setState({ showOngoingCall: false });
        //             }
        //         });
        // }
    }

    _onRejoinConference = () => {
        const {
            callID,
            currentUserName,//current user name.
            roomName,
            userName,
            userProfile,
            gender,
            type,
            isSingleUserCall,//if befriender can rejoin it, its not single call for sure.
        } = this.state;
        this.props.navigation.navigate('Conference', {
            callID,
            currentUserName,//current user name.
            roomName,
            userName,
            userProfile,
            gender,
            type,
            isSingleUserCall,//if befriender can rejoin it, its not single call for sure.
        });
    };

    goToUserProfile = (user) => {
        const { navigation, setContact } = this.props;
        setContact(user);
        navigation.navigate('Detail');
    };

    onCheckChange = async (user) => {
        const { selectedUsers } = this.state;
        const isChecked = this.isAlreadySelected(user);
        var updatedUsers = [];
        if (isChecked) {
            //remove from list and return.
            updatedUsers = selectedUsers.filter(u => user.id !== u.id);
        } else {
            if (selectedUsers.length > 3) {
                Toast.show({
                    type: 'error',
                    text1: 'Too many participants',
                    text2: `Sorry, more than 5 participants is allowed in a call.`,
                })
                return
            }
            //add to list.
            updatedUsers = selectedUsers.concat(user);
        }
        this.setState({ selectedUsers: updatedUsers });
    };

    isAlreadySelected = (user) => {
        const { selectedUsers } = this.state;
        const alreadyAdded = selectedUsers.filter(obj => (obj.id === user.id));
        return alreadyAdded.length > 0;
    };

    onToggleCheckbox = () => {
        const { setShowCheckbox, showCheckbox } = this.props
        setShowCheckbox(!showCheckbox)
        if (!showCheckbox) {
            this.setState({ selectedUsers: [] })
        }
    }

    onSingleUserCall = (user) => {
        const { adminName, adminProfile, adminGender } = this.props
        this._call([user], adminName, adminProfile, adminGender, { isNotShareable: true })
    }

    render() {
        const { adminName, adminProfile, adminGender, contacts, showCheckbox } = this.props;
        const { isReady, selectedUsers, showOngoingCall } = this.state;
        const showSingleCall = selectedUsers.length < 1;

        if (isReady) {
            return (
                <SafeAreaView
                    style={styles.root}
                    edges={['top']}
                >
                    <View style={styles.header}>
                        <Text style={[common_style.title, styles.title]}>{'My clients'}</Text>
                        {
                            contacts.length > 0 ?
                                <Checkbox.Android
                                    status={showCheckbox ? 'checked' : 'unchecked'}
                                    color={COLORS.primary}
                                    onPress={this.onToggleCheckbox}
                                /> : null
                        }

                    </View>
                    <View style={styles.listContainer}>
                        {
                            contacts.length > 0 ?
                                <FlatList
                                    key={'user_list'}
                                    style={styles.userList}
                                    scrollEnabled={true}
                                    data={contacts}
                                    keyExtractor={(item, _index) => `${item.id}`}
                                    renderItem={({ item }) => {
                                        const user = item;
                                        return (
                                            <ListItem
                                                user={user}
                                                gender={user.gender}
                                                name={user.name}
                                                img={user.profile_image_url}
                                                _onCheckChange={this.onCheckChange}
                                                _onPress={this.goToUserProfile}
                                                key={user.id}
                                                isChecked={this.isAlreadySelected(user)}
                                                showSingleCall={showSingleCall}
                                                onCallBtnPressed={this.onSingleUserCall}
                                            />
                                        );
                                    }}
                                />
                                : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text>No Client yet</Text>
                                </View>}
                    </View>
                    {(selectedUsers.length > 0 && showCheckbox) ?
                        <View
                            style={styles.fab}>
                            <BefrienderButton
                                onPress={() => this._call(selectedUsers, adminName, adminProfile, adminGender)}
                                label={selectedUsers.length > 1 ? `Make group video call` : `Make video call`}
                                mode='contained'
                            />
                        </View>
                        : null
                    }
                    {
                        showOngoingCall === true ?
                            <TouchableOpacity style={styles.ongoingCallIndicator} onPress={this._onRejoinConference}>
                                <Text style={styles.ongoingCallText}>{'Ongoing call (tap to join)...'}</Text>
                            </TouchableOpacity>
                            : null
                    }
                </SafeAreaView>
            );
        }
        return (
            <Loading />
        );
    }
}

const styles = StyleSheet.create({
    loadingRoot: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    root: {
        backgroundColor: COLORS.background,
        display: 'flex',
        flex: 1,
    },
    listContainer: {
        flex: 1,
    },
    userList: {
        // height: '100%',
    },
    fab: {
        width: '100%',
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: 'grey',
    },
    ongoingCallIndicator: {
        position: 'absolute',
        width: '100%',
        padding: 16,
        justifyContent: 'center',
        backgroundColor: '#0a8a0a',
        top: 0,
    },
    ongoingCallText: {
        color: '#FFFFFF'
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        paddingRight: 16,
        paddingBottom: 16,
    },
    title: {
        fontSize: 22,
        flex: 1,
        color: COLORS.primary,
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user.user,
        contacts: state.user.contacts,
        showCheckbox: state.home.showCheckbox,
    };
};

const mapDispatchToProps = { setUser, setContact, setIsThereNewNotification, setContacts, setCallingUsers, setShowCheckbox };

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(HomeScreen));
