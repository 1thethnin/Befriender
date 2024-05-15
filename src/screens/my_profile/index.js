import React, { Component } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Text } from "react-native-paper";
import common_style from "../../common_style";
import BefrienderButton from "../../components/button";
import ProfileAvatar from "../../components/profile_avatar";
import styles from "./styles";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import UserInfoGrid from "../../components/user_info_grid";
import { connect } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { displayDialog, showErrorDialog } from "../../services/utils";

export async function doLogout(user) {
    try {
        await firestore()
            .collection('users')
            .doc(user.id)
            .update({
                deviceToken: null,
                voipToken: null,
            }).then(function () {
                console.log("Clear token updated!");
                auth()
                    .signOut()
                    .then(() => console.log('User signed out!'));
            });


    } catch (e) {
        console.error('signOut error, ', e);
        showErrorDialog({
            title: 'Sign out Error',
            msg: e.message,
            action: 'OK',
        })
    }
}
class MyProfile extends Component {

    state = { sendingEmail: false }

    signOut = async () => {
        const { user } = this.props
        doLogout(user)
    };

    confirmLogout = () => {
        Alert.alert(
            "Log out?",
            "Are you sure to logout?",
            [
                {
                    text: "No",
                    onPress: () => console.log("Cancel logout"),
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: this.signOut
                }
            ]
        );
    };

    goToResetPassword = () => {
        const { sendingEmail } = this.state
        const { navigation, user } = this.props
        if (sendingEmail) return
        if (user.contact_no) {
            navigation.navigate("ResetPassword")
        } else {
            this.setState({ sendingEmail: true })
            this.doSendPasswordResetEmail()
        }
    }

    doSendPasswordResetEmail = () => {
        const { user } = this.props
        auth().sendPasswordResetEmail(user.email)
            .then(o => {
                displayDialog({
                    title: 'Done sending',
                    msg: `The password reset link was sent to ${user.email}, please check the email.`,
                    action: 'OK',
                    callback: () => {
                        this.signOut(user)
                    },
                    cancelable: false,
                })
                // navigation.navigate("ConfirmOTP")
            }, (reason) => {
                showErrorDialog({
                    title: 'Rejected',
                    msg: JSON.stringify(reason),
                    action: 'OK',
                })
            }).catch(e => {
                showErrorDialog({
                    title: 'Error',
                    msg: e.message,
                    action: 'OK',
                })
            }).finally(() => {
                this.setState({ sendingEmail: false })
            })
    }

    goToEditProfile = () => {
        const { navigation } = this.props
        navigation.navigate("EditProfile")
    }

    render() {
        const { sendingEmail } = this.state
        const { user } = this.props;
        return (
            <SafeAreaView
                style={[common_style.root]}
                edges={['top']}
            >
                <Text style={common_style.title}>{`My Profile`}</Text>
                <ScrollView style={common_style.scroll_view}>
                    <View style={[common_style.body]} >
                        <ProfileAvatar profileImageUrl={user.profile_image_url} />
                        <UserInfoGrid user={user} style={styles.content} />
                    </View>
                </ScrollView>
                <View style={styles.root}>
                    <BefrienderButton
                        style={styles.edit_btn}
                        mode='contained'
                        onPress={this.goToEditProfile}
                        label={`Edit Profile`} />
                    <BefrienderButton
                        style={styles.reset_btn}
                        mode='outlined'
                        loading={sendingEmail}
                        onPress={this.goToResetPassword}
                        label={`Reset Password`} />
                    <BefrienderButton
                        style={styles.logout_btn}
                        mode='outlined'
                        label={`Logout`}
                        onPress={this.confirmLogout} />
                </View>
            </SafeAreaView >
        );
    }
}

const mapStateToProps = (state) => ({
    user: state.user.user,
});

export default connect(mapStateToProps)(MyProfile);