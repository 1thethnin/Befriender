import React, { Component } from 'react'
import { KeyboardAvoidingView, Platform, StatusBar, View } from 'react-native'
import { HelperText, Text, TextInput } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { connect } from 'react-redux'
import common_style from '../../common_style'
import BefrienderButton from '../../components/button'
import Toolbar from '../../components/Toolbar'
import styles from './styles'
import auth from '@react-native-firebase/auth'
import { COLORS } from '../../Consts'
import { displayDialog, showErrorDialog } from '../../services/utils'
import firestore from '@react-native-firebase/firestore';

class ForgotPassword extends Component {
    state = {
        email: '',
        error: null,
        sendingEmail: false,
    }

    onEmailTextChange = (val) => {
        this.setState({ email: val })
    }

    sendResetPasswordEmail = () => {
        const { email } = this.state
        if (!email || email.length < 1) {
            this.setState({ error: 'Email is required to proceed!' })
            return;
        }
        this.setState({ sendingEmail: true })
        this.getFirebaseProfileData(email);

    }

    getFirebaseProfileData = async (email) => {
        try {
            const querySnapshot = await firestore()
                .collection("users")
                .where('email', "==", email)
                .get()

            if (querySnapshot.docs.length === 0) {
                throw new Error(`No user with ${email} is found!`)
            }

            querySnapshot.forEach(documentSnapshot => {
                const docUser = documentSnapshot.data();
                if (!docUser) return;
                if (docUser.role && docUser.role.toLowerCase() === 'befriender') {
                    auth()
                        .sendPasswordResetEmail(email)
                        .then((r) => {
                            displayDialog({
                                title: 'Done sending',
                                msg: `The password reset link was sent to ${email}, please check the email.`,
                                action: 'OK',
                                callback: () => {
                                    const { navigation } = this.props
                                    navigation.goBack()
                                },
                                cancelable: false,
                            })
                        }, (e) => {
                            this.setState({ error: e.message })
                            console.log('rejected reset password:', e)
                        }).catch(e => {
                            this.setState({ error: e.message })
                            console.log('sendResetPasswordEmail Error:', e);
                        }).finally(() => {
                            this.setState({ sendingEmail: false })
                        })
                } else {
                    alert('Email must be befriender email.');
                    this.setState({ email: '', sendingEmail: false })
                }
            })
        } catch (error) {
            console.log("Error", error)
            this.setState({ sendingEmail: false })
            showErrorDialog({ title: 'Error', msg: error.message, action: 'OK' });
        }
    };

    render() {
        const { email, sendingEmail, error } = this.state
        const isErrorShown = error !== null && error.length > 0
        return (
            <SafeAreaView style={[common_style.root, styles.root]}>
                <StatusBar barStyle={'dark-content'} backgroundColor={COLORS.background} />
                <Toolbar title={'Forgot password'} {...this.props} />
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}>
                    <View style={styles.content}>
                        <TextInput
                            underlineColor='#DADDE2'
                            style={[styles.row, styles.input]}
                            error={isErrorShown}
                            label={'Enter registered email'}
                            value={email}
                            onChangeText={this.onEmailTextChange}
                            mode='outlined' />
                        <HelperText
                            style={styles.row}
                            type="error"
                            visible={isErrorShown}>
                            {error}
                        </HelperText>
                    </View>
                    <BefrienderButton
                        style={[styles.button]}
                        label={'Send reset link to registered email'}
                        mode='contained'
                        loading={sendingEmail}
                        onPress={this.sendResetPasswordEmail}
                    />
                </KeyboardAvoidingView>
            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword)
