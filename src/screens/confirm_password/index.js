import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { View } from 'react-native'
import styles from './styles'
import common_style from '../../common_style'
import Toolbar from '../../components/Toolbar'
import BefrienderButton from '../../components/button'
import { HelperText, TextInput } from 'react-native-paper'
import auth from '@react-native-firebase/auth'
class ConfirmPassword extends Component {
    static propTypes = {
        user: PropTypes.object
    }

    state = {
        oldPass: '',
        newPass: '',
        confirmPass: '',
        oldPassVisible: false,
        newPassVisible: false,
        confirmPassVisible: false,
        oldPassErrorVisible: false,
        newPassErrorVisible: false,
        confirmPassErrorVisible: false,
        loading: false,
    }

    onOldPassTextChange = (val) => {
        this.setState({ oldPassErrorVisible: false, oldPass: val })
    }

    onNewPassTextChange = (val) => {
        this.setState({ newPassErrorVisible: false, newPass: val })
    }

    onConfirmPassTextChange = (val) => {
        this.setState({ confirmPassErrorVisible: false, confirmPass: val })
    }

    onOldPasswordVisibilityChange = () => {
        const { oldPassVisible } = this.state
        this.setState({ oldPassVisible: !oldPassVisible })
    }

    onNewPasswordVisibilityChange = () => {
        const { newPassVisible } = this.state
        this.setState({ newPassVisible: !newPassVisible })
    }

    onConfirmPasswordVisibilityChange = () => {
        const { confirmPassVisible } = this.state
        this.setState({ confirmPassVisible: !confirmPassVisible })
    }

    isOldPasswordIncorrect = async () => {
        const { user } = this.props
        const { oldPass } = this.state
        try {
            const res = await auth().signInWithEmailAndPassword(user.email, oldPass)
            return (typeof res.user === 'undefined' || res.user === null);
        } catch (e) {
            console.log('Old password is incorrect,', e);
        }
        return true
    }

    goToConfirmOTP = () => {
        this.setState({ loading: true })
        this.validateAndNavigate()
            .finally(() => {
                this.setState({ loading: false })
            })
    }

    validateAndNavigate = async () => {
        const { newPass, confirmPass, oldPass } = this.state
        if (!oldPass || await this.isOldPasswordIncorrect()) {
            this.setState({ oldPassErrorVisible: true })
            return
        }
        if (newPass.length < 4) {
            this.setState({ newPassErrorVisible: true })
            return
        }
        if (newPass !== confirmPass) {
            this.setState({ confirmPassErrorVisible: true })
            return
        }
        if (oldPass == newPass) {
            alert("Old Password and New Password must not be the same!")
            this.setState({ oldPass: '', newPass: '', confirmPass: '' })
            return
        }
        const { navigation } = this.props
        navigation.navigate('ConfirmOTP', { password: newPass })
    }

    render() {
        const {
            oldPassVisible,
            newPassVisible,
            confirmPassVisible,
            oldPassErrorVisible,
            newPassErrorVisible,
            confirmPassErrorVisible,
            oldPass,
            newPass,
            confirmPass,
            loading,
        } = this.state
        return (
            <View style={[common_style.root, styles.root]}>
                <Toolbar title={'Reset password'} {...this.props} />
                <View style={styles.content}>
                    <TextInput
                        underlineColor='#DADDE2'
                        style={[styles.row, styles.input]}
                        error={oldPassErrorVisible}
                        label={'Enter old password *'}
                        secureTextEntry={!oldPassVisible}
                        value={oldPass}
                        onChangeText={this.onOldPassTextChange}
                        right={<TextInput.Icon forceTextInputFocus={false} name={oldPassVisible ? "eye" : "eye-off"} onPress={this.onOldPasswordVisibilityChange} />}
                        mode='outlined' />
                    <HelperText
                        style={styles.row}
                        type="error"
                        visible={oldPassErrorVisible}>
                        {`${'Old password is incorrect!'}`}
                    </HelperText>
                    <TextInput
                        style={[styles.row, styles.input]}
                        label={'Enter new password *'}
                        error={newPassErrorVisible}
                        secureTextEntry={!newPassVisible}
                        value={newPass}
                        onChangeText={this.onNewPassTextChange}
                        right={<TextInput.Icon forceTextInputFocus={false} name={newPassVisible ? "eye" : "eye-off"} onPress={this.onNewPasswordVisibilityChange} />}
                        mode='outlined' />
                    <HelperText
                        style={styles.row}
                        type="error"
                        visible={newPassErrorVisible}>
                        {`${'New password is too weak!'}`}
                    </HelperText>
                    <TextInput
                        style={[styles.row, styles.input]}
                        error={confirmPassErrorVisible}
                        label={'Enter confirm password *'}
                        secureTextEntry={!confirmPassVisible}
                        value={confirmPass}
                        onChangeText={this.onConfirmPassTextChange}
                        right={<TextInput.Icon forceTextInputFocus={false} name={confirmPassVisible ? "eye" : "eye-off"} onPress={this.onConfirmPasswordVisibilityChange} />}
                        mode='outlined' />
                    <HelperText
                        style={styles.row}
                        type="error"
                        visible={confirmPassErrorVisible}>
                        {`${'Incorrect password. Please try again.'}`}
                    </HelperText>
                </View>
                <BefrienderButton
                    loading={loading}
                    style={[styles.row, styles.button]}
                    label={'Send OTP to registered phone'}
                    mode='contained'
                    onPress={this.goToConfirmOTP}
                />
            </View>
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.user.user,
})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmPassword)
