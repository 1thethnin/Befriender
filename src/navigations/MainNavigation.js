import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import MyProfile from '../screens/my_profile';
import HomeScreen from '../screens/HomeScreen';
import Notifications from '../screens/notifications';
import Tab from '../components/tab';
import { StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import common_style from '../common_style';
import { backgroundColor } from '../components/tab/styles';
import { COLORS } from '../Consts';
import TopSpacer from '../components/top_spacer';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import AddMessage from '../sheets/add_message';
import SheetBackdrop from '../components/sheet_backdrop';
import MessageNavigation from './MessageNavigation';
import messaging from '@react-native-firebase/messaging';
import Loading from '../components/loading';
import firebase from "@react-native-firebase/app";
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import Toast from "react-native-toast-message";
import ErrorBoundary from '../components/error_boundary';

const MainTab = createBottomTabNavigator();

class MainNavigation extends Component {
    static propTypes = {
        user: PropTypes.object,
    }

    state = {
        isLoading: true,
        defaultType: 'Normal',
        initialRoute: 'Clients',
    }

    componentDidMount() {
        StatusBar.setBarStyle('dark-content', true)
        this.prepareUserOnlineStatus()
        messaging().onNotificationOpenedApp(remoteMessage => {
            const { navigation } = this.props
            navigation.navigate('Notifications')
        });
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    this.setState({ initialRoute: 'Notifications' });
                }
                this.setState({ isLoading: false })
            });
    }

    toggleAddMessageSheet = (show, defaultType) => {
        this.setState({ defaultType })
        if (show && show === true)
            this.addMessageRef.present()
        else this.addMessageRef.dismiss()
    }

    prepareUserOnlineStatus = () => {
        var { id, name, profile_image_url } = this.props.user;
        let user = { id, name, profile_image_url };

        var userStatusDatabaseRef = database().ref("/status/" + id);
        var userStatusFirestoreRef = firestore().collection("users").doc(id);

        //this code will prevent db 60s inactivity issue of offline.
        userStatusDatabaseRef.keepSynced(true);

        var isOfflineStatus = {
            state: "offline",
            last_changed: firebase.database.ServerValue.TIMESTAMP,
            user,
        };

        var isOnlineStatus = {
            state: "online",
            last_changed: firebase.database.ServerValue.TIMESTAMP,
            user,
        };
        var isOfflineForFirestore = {
            state: "offline",
            last_changed: firebase.firestore.FieldValue.serverTimestamp(),
        };

        var isOnlineForFirestore = {
            state: "online",
            last_changed: firebase.firestore.FieldValue.serverTimestamp(),
        };

        database()
            .ref(".info/connected")
            .on("value", function (snapshot) {
                // If we're not currently connected, don't do anything.
                if (snapshot.val() == false) {
                    userStatusFirestoreRef.update({ status: isOfflineForFirestore });
                    return;
                }

                // If we are currently connected, then use the 'onDisconnect()'
                // method to add a set which will only trigger once this
                // client has disconnected by closing the app,
                // losing internet, or any other means.
                userStatusDatabaseRef
                    .onDisconnect()
                    .set(isOfflineStatus)
                    .then(function () {
                        userStatusDatabaseRef.set(isOnlineStatus);
                        userStatusFirestoreRef.update({ status: isOnlineForFirestore });
                    });
            });
    }

    render() {
        const { user } = this.props
        const { defaultType, initialRoute, isLoading } = this.state
        if (isLoading) {
            return <Loading />
        }
        return (
            <BottomSheetModalProvider>
                <SafeAreaView
                    style={[common_style.root, { backgroundColor: COLORS.primary }]}
                    edges={['bottom']}
                >
                    <StatusBar barStyle={'dark-content'} backgroundColor={COLORS.background} />
                    <TopSpacer />
                    <MainTab.Navigator
                        initialRouteName={initialRoute}
                        screenOptions={{
                            lazy: true,
                            headerShown: false,
                            tabBarStyle: { backgroundColor: backgroundColor }
                        }}
                        tabBar={(props) => (<Tab {...props} />)}
                    >
                        <MainTab.Screen name="Clients" options={{
                            tabBarLabel: "Clients",
                            tabBarIcon: 'briefcase-variant'
                        }}>
                            {(props) => (
                                <HomeScreen
                                    {...props}
                                    adminName={user.name}
                                    adminProfile={user.profile_image_url}
                                    adminGender={user.gender}
                                />
                            )}
                        </MainTab.Screen>
                        <MainTab.Screen name="Messages"
                            options={{
                                tabBarLabel: "Messages",
                                tabBarIcon: 'mail'
                            }} >
                            {(props) => (<MessageNavigation toggleAddMessageSheet={this.toggleAddMessageSheet} {...props} />)}
                        </MainTab.Screen>
                        <MainTab.Screen name="MyProfile"
                            options={{
                                tabBarLabel: "My Profile",
                                tabBarIcon: 'account'
                            }}>
                            {(props) => (<ErrorBoundary><MyProfile {...props} /></ErrorBoundary>)}
                        </MainTab.Screen>
                        <MainTab.Screen name="Notifications"
                            options={{
                                tabBarLabel: "Notifications",
                                tabBarIcon: 'bell'
                            }} >
                            {(props) => (<ErrorBoundary><Notifications {...props} /></ErrorBoundary>)}
                        </MainTab.Screen>
                    </MainTab.Navigator>
                </SafeAreaView>
                <BottomSheetModal
                    ref={(ref) => { this.addMessageRef = ref }}
                    index={1}
                    snapPoints={['50%', '90%']}
                    // handleComponent={null}
                    handleStyle={common_style.sheet_handle_style}
                    backdropComponent={SheetBackdrop}>
                    <AddMessage onClose={() => this.toggleAddMessageSheet(false)} defaultType={defaultType} />
                </BottomSheetModal>
            </BottomSheetModalProvider>
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.user.user,
})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(MainNavigation)
