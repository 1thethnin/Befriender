import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { TextInput, View } from 'react-native'
import styles from './styles'
import common_style from '../../common_style'
import Toolbar from '../../components/Toolbar'
import { ActivityIndicator, Text, TouchableRipple } from 'react-native-paper'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import { showErrorDialog } from '../../services/utils'
import { logoutUser } from '../my_profile'
import Toast from 'react-native-toast-message'

class ConfirmOTP extends Component {
    static propTypes = {
        user: PropTypes.object
    }

    state = {
        loading: true,
        confirmation: null,
        seconds: 0,
        first: '',
        second: '',
        third: '',
        fourth: '',
        fifth: '',
        sixth: '',
    }

    componentDidMount() {
        this.sendOTP()
    }

    componentWillUnmount() {
        this.timer && clearInterval(this.timer)
    }

    sendOTP = () => {
        console.log('sendOTP entering');
        const { seconds } = this.state
        const { user } = this.props
        if (seconds > 0) {
            return
        }
        this.setState({ loading: true })
        auth()
            .verifyPhoneNumber(user.contact_no, 60)
            .on('state_changed', (phoneAuthSnapshot) => {
                console.log('onStateChanged=', phoneAuthSnapshot);
                if (phoneAuthSnapshot.state === auth.PhoneAuthState.CODE_SENT) {
                    this.setState({
                        seconds: 60,
                        confirmation: phoneAuthSnapshot,
                        loading: false
                    }, this.checkAndValidateCode)
                    this.timer = setInterval(() => {
                        const { seconds } = this.state
                        if (seconds === 0) {
                            clearInterval(this.timer)
                            return
                        }
                        const remainingTime = seconds - 1
                        this.setState({ seconds: remainingTime })
                    }, 1000);
                    return Promise.resolve(phoneAuthSnapshot)
                } else {
                    return Promise.resolve()
                }
            })
            .catch(e => {
                console.log("verifyPhoneNumber Error:", e);
                let message = e.message
                if (`auth/invalid-phone-number` === e.code) {
                    message = `The format of the phone number provided is incorrect. Please enter the phone number in a format[+][country code][subscriber number]`
                }
                showErrorDialog({
                    title: "Error",
                    msg: message,
                    action: 'OK',
                    callback: () => {
                        const { navigation } = this.props
                        navigation.goBack()
                    }
                })
            })
    }

    onFirstChange = (t) => {
        if (t.length > 1) return
        this.setState({ first: t }, () => {
            this.checkAndValidateCode()
        })
        if (t) this.second.focus()
    }

    onSecondChange = (t) => {
        if (t.length > 1) return
        this.setState({ second: t }, () => {
            this.checkAndValidateCode()
        })
        if (t) this.third.focus()
    }

    onThirdChange = (t) => {
        if (t.length > 1) return
        this.setState({ third: t }, () => {
            this.checkAndValidateCode()
        })
        if (t) this.fourth.focus()
    }

    onFourthChange = (t) => {
        if (t.length > 1) return
        this.setState({ fourth: t }, () => {
            this.checkAndValidateCode()
        })
        if (t) this.fifth.focus()
    }

    onFifthChange = (t) => {
        if (t.length > 1) return
        this.setState({ fifth: t }, () => {
            this.checkAndValidateCode()
        })
        if (t) this.sixth.focus()
    }

    onSixthChange = (t) => {
        if (t.length > 1) return
        this.setState({ sixth: t }, () => {
            this.checkAndValidateCode()
        })
    }

    checkAndValidateCode = async () => {
        const { first, second, third, fourth, fifth, sixth, confirmation } = this.state
        if (!confirmation) {
            Toast.show({
                text1: 'Please wait',
                text2: 'The OTP code is being sent and preparing.',
                type: 'info',
            })
            return
        }
        if (first && second && third && fourth && fifth && sixth) {
            this.setState({ loading: true })
            const code = `${first}${second}${third}${fourth}${fifth}${sixth}`
            try {
                try {
                    await auth().currentUser.unlink(auth.PhoneAuthProvider.PROVIDER_ID);
                    console.log('PhoneAuthProvider unlinked success.');
                } catch (error) {
                    console.log('PhoneAuthProvider unlinked fail.');
                }

                const credential = auth.PhoneAuthProvider.credential(confirmation.verificationId, code);
                let userData = await auth().currentUser.linkWithCredential(credential);
                console.log('Linking success :', userData);
                this.changePasswordAndShowSuccess()
                this.setState({ loading: false })
            } catch (error) {
                console.log('Linking error :', error);
                if (error.code == 'auth/invalid-verification-code') {
                    this.setState({ loading: false })
                    Toast.show({
                        text1: 'Error',
                        text2: 'Invalid code',
                        type: 'error',
                    })
                } else if (error.code == 'auth/session-expired') {
                    this.setState({ loading: false })
                    Toast.show({
                        text1: 'Error',
                        text2: 'The sms code has expired. Please re-send the verification code to try again.',
                        type: 'error',
                    });
                    this.props.navigation.goBack();

                } else {
                    this.setState({ loading: false })
                    Toast.show({
                        text1: 'Error',
                        text2: error ? error.message ? error.message : "An error occur" : "An error occur",
                        type: 'error',
                    });

                }
            }

        }
    }

    changePasswordAndShowSuccess = async () => {
        const { navigation, route, user } = this.props
        //change password in firestore
        if (route.params?.password) {
            await firestore()
                .collection('users')
                .doc(user.id)
                .update({ password: route.params.password })
            navigation.navigate('Success')
        } else {
            navigation.navigate('ResetPassword')
        }
    }

    render() {
        const { user } = this.props
        const { seconds, first, second, third, fourth, fifth, sixth, loading } = this.state
        return (
            <View style={[common_style.root, styles.root]}>
                <Toolbar title={'Reset password'} {...this.props} />
                <View style={styles.content}>
                    <Text style={styles.message}>{`Enter pin sent to your registered phone (${user.contact_no})`}</Text>
                    <View style={styles.code_container}>
                        <TextInput style={styles.code} ref={(r) => this.first = r} onChangeText={this.onFirstChange} value={first} keyboardType='number-pad'
                            onKeyPress={({ nativeEvent }) => {
                                nativeEvent.key === 'Backspace' ? this.first.focus() : this.second.focus()
                            }} />
                        <TextInput style={styles.code} ref={(r) => this.second = r} onChangeText={this.onSecondChange} value={second} keyboardType='number-pad'
                            onKeyPress={({ nativeEvent }) => {
                                nativeEvent.key === 'Backspace' ? this.first.focus() : this.third.focus()
                            }} />
                        <TextInput style={styles.code} ref={(r) => this.third = r} onChangeText={this.onThirdChange} value={third} keyboardType='number-pad'
                            onKeyPress={({ nativeEvent }) => {
                                nativeEvent.key === 'Backspace' ? this.second.focus() : this.fourth.focus()
                            }} />
                        <TextInput style={styles.code} ref={(r) => this.fourth = r} onChangeText={this.onFourthChange} value={fourth} keyboardType='number-pad'
                            onKeyPress={({ nativeEvent }) => {
                                nativeEvent.key === 'Backspace' ? this.third.focus() : this.fifth.focus()
                            }} />
                        <TextInput style={styles.code} ref={(r) => this.fifth = r} onChangeText={this.onFifthChange} value={fifth} keyboardType='number-pad'
                            onKeyPress={({ nativeEvent }) => {
                                nativeEvent.key === 'Backspace' ? this.fourth.focus() : this.sixth.focus()
                            }} />
                        <TextInput style={styles.code} ref={(r) => this.sixth = r} onChangeText={this.onSixthChange} value={sixth} keyboardType='number-pad'
                            onKeyPress={({ nativeEvent }) => {
                                nativeEvent.key === 'Backspace' ? this.fifth.focus() : this.sixth.focus()
                            }} />
                        {
                            seconds == 0 ?
                                <TouchableRipple style={styles.resend_btn}
                                    borderless={true}
                                    rippleColor={'white'}
                                    disabled={seconds > 0}
                                    onPress={this.sendOTP}>
                                    {
                                        !loading
                                            ? <Text
                                                style={styles.resend_btn_label}>
                                                {`Resend\nOTP`}
                                            </Text>
                                            : <ActivityIndicator color='white' size={24} />
                                    }
                                </TouchableRipple>
                                : null
                        }
                        { seconds != 0 && loading ?
                            <TouchableRipple style={styles.resend_btn}
                                borderless={true}
                                rippleColor={'white'}
                                disabled={seconds > 0}
                                onPress={this.sendOTP}>

                                <ActivityIndicator color='white' size={24} />

                            </TouchableRipple>
                            : null
                        }

                    </View>
                    <Text style={styles.duration}>{`${seconds} s`}</Text>
                </View>
            </View>
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.user.user,
})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmOTP)
