/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    Image,
    StatusBar,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Linking,
} from 'react-native';
import { TextInput, withTheme, Button, Subheading, Headline, Text } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { COLORS } from '../Consts';
import Frame from '../components/Frame';
import { ScrollView } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import { doLogout } from '../screens/my_profile';
import { showErrorDialog } from '../services/utils'

class SignInScreen extends Component {
    constructor(props) {
        super(props);
        this.state = { email: '', password: '', isSigningIn: false, isPasswordVisible: false };
        this.signin = this.signin.bind(this);
    }

    setEmail(value) {
        this.setState({ email: value });
    }

    signin() {
        const { email, password, isSigningIn } = this.state;
        if (isSigningIn) {
            return;
        }
        if (!email) alert("Require Email!");
        else if (!password) alert("Require Password!");
        if (email && password) {
            this.setState({ isSigningIn: true });
            const self = this;
            let emailAddress = email.toString().trim();
            auth()
                .signInWithEmailAndPassword(emailAddress, password)
                .then((result) => {
                    console.log('signed in!', result.user);
                    this.getFirebaseProfileData(result.user);

                })
                .catch((error) => {
                    if (error.code === 'auth/email-already-in-use') {
                        console.log('That email address is already in use!');
                    }
                    let title = 'Error'
                    let msg = 'Invalid Email or Password.'
                    if (error.code === 'auth/invalid-email') {
                        console.log('That email address is invalid!');
                        title = 'Invalid Email'
                        msg = 'The email seems to be invalid, please enter correct email.'
                    } else if (error.code === 'auth/network-request-failed') {
                        console.log('Network Request failed.');
                        title = 'Network Error'
                        msg = 'Please check your network and make sure you have internet connection.'
                    } else if (error.code === 'auth/wrong-password') {
                        console.log('Error sign in ', error);
                        title = 'Invalid Password'
                        msg = 'The password is invalid or the user does not have a password.'
                    } else {
                        console.log('Error sign in ', error);
                    }
                    showErrorDialog({
                        title,
                        msg,
                        action: "OK"
                    })
                }).finally(() => {
                    this.setState({ isSigningIn: false });
                });
        }
    }

    getFirebaseProfileData = async (user) => {
        try {
            await firestore()
                .collection("users")
                .doc(user.uid)
                .get()
                .then((documentSnapshot) => {
                    const docUser = documentSnapshot.data();
                    if (!docUser) return;

                    console.log('User role ...' + docUser.role);
                    if (!docUser.role || docUser.role.toLowerCase() !== 'befriender') {
                        try {
                            //logout user
                            var currentUser = { id: user.uid };
                            doLogout(currentUser);
                        } catch (e) {
                            showErrorDialog({ title: 'Error', msg: e.message, action: 'OK' })
                        }
                        this.setState({ email: "", password: "", isSigningIn: false })
                    }

                },
                    (error) => {
                        showErrorDialog({ title: 'Error', msg: error.message, action: 'OK' });
                    },
                    () => { }
                );
        } catch (error) {
            showErrorDialog({ title: 'Error', msg: error, action: 'OK' });
        }
    };

    onPasswordVisibilityToggle = () => {
        const { isPasswordVisible } = this.state;
        this.setState({ isPasswordVisible: !isPasswordVisible })
    }

    goToForgotPasswordScreen = () => {
        const { navigation } = this.props
        navigation.navigate('ForgotPassword')
    }

    render() {
        const { email, password, isSigningIn, isPasswordVisible } = this.state;
        return (
            <SafeAreaView style={[classes.root, { backgroundColor: COLORS.primary }]}>
                <StatusBar barStyle={'light-content'} backgroundColor={COLORS.primary} />
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}>
                    <ScrollView>
                        <View style={classes.inputContainer}>
                            <View>
                                <View style={classes.logoConatiner}>
                                    <Image
                                        source={require('../../assets/icons/icon_c.png')}
                                        style={classes.img}
                                    />
                                    <Text style={classes.caption}>{"Connecting Seniors,\nEnriching Lives \u00AE"}</Text>
                                </View>
                                <View style={[classes.frame]}>
                                    <Frame />
                                </View>
                            </View>
                            <Headline
                                style={[classes.heading]}>
                                {"Login to your\nBefriender account"}
                            </Headline>
                            <TextInput
                                style={[classes.input]}
                                label="User ID (Email)"
                                keyboardType="email-address"
                                textContentType="emailAddress"
                                returnKeyType="next"
                                autoCapitalize='none'
                                value={email}
                                underlineColor="#00000000"
                                theme={{ colors: { underlineColor: '#00000000' } }}
                                mode="flat"
                                onChangeText={(text) => this.setEmail(text)}
                            />
                            <TextInput
                                style={[classes.input]}
                                secureTextEntry={!isPasswordVisible}
                                label="Password"
                                value={password}
                                mode="flat"
                                autoCapitalize='none'
                                returnKeyType="go"
                                right={
                                    <TextInput.Icon forceTextInputFocus={false} name={isPasswordVisible ? "eye" : "eye-off"} onPress={this.onPasswordVisibilityToggle} />
                                }
                                underlineColor="#00000000"
                                activeOutlineColor="#00000000"
                                onChangeText={(text) =>
                                    this.setState({ password: text })
                                }
                            />
                            <Button
                                style={[classes.button]}
                                mode="contained"
                                onPress={this.signin}
                                dark={true}
                                uppercase={false}
                                color={COLORS.accent}
                                contentStyle={classes.signin}
                                loading={isSigningIn}>
                                {'Login'}
                            </Button>

                            <Text style={classes.tncTextStyle} >
                                By signing in, you are agree to our {' '}
                                <Text
                                    style={classes.hyperlinkStyle}
                                    onPress={() => {
                                        Linking.openURL('https://www.lionsbefrienders.org.sg/privacy-policy/');
                                    }}>
                                    terms of use
                                </Text>
                                {' '}and{' '}
                                <Text
                                    style={classes.hyperlinkStyle}
                                    onPress={() => {
                                        Linking.openURL('https://www.lionsbefrienders.org.sg/privacy-policy/');
                                    }}>
                                    privacy policy
                                </Text>
                                .
                            </Text>

                            <Button
                                style={[classes.button2]}
                                mode="text"
                                color={COLORS.accent}
                                contentStyle={classes.forget_password}
                                onPress={this.goToForgotPasswordScreen}
                                uppercase={false}>
                                {"Forgot password?"}
                            </Button>


                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}

const classes = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.primary,
    },
    inputContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
        maxWidth: 900,
    },
    button: {
        marginTop: 16,
    },
    button2: {
        marginTop: 5,
    },
    signin: {
        padding: 8,
        fontSize: 18,
    },
    forget_password: {
        fontSize: 14,
    },
    img: {
        width: 90,
        height: 90,
    },
    logoConatiner: {
        alignItems: 'center',
        position: 'absolute',
        backgroundColor: 'white',
        width: 140,
        height: 140,
        borderRadius: 140 / 2,
        padding: 16,
        zIndex: 1,
        right: 16,
    },
    input: {
        marginTop: 16,
        borderBottomLeftRadius: 8,
        borderBottomEndRadius: 8,
    },
    heading: {
        fontWeight: 'bold',
        color: 'white',
        marginTop: -5,
        marginBottom: 16,
        lineHeight: 34,
        fontSize: 28,
    },
    frame: {
        width: '100%',
        aspectRatio: 1,
        marginTop: 20,
        marginBottom: 14,
        right: 0,
    },
    caption: {
        fontSize: 8,
        fontStyle: 'italic',
        textAlign: 'center',
        fontWeight: 'bold',
        position: 'absolute',
        bottom: 16,
    },
    tncTextStyle: {
        flex: 1,
        fontSize: 11,
        lineHeight: 14,
        marginTop: 10,
        color: 'white',
        textAlign: 'center'
    },
    hyperlinkStyle: {
        flex: 1,
        fontSize: 11,
        lineHeight: 14,
        marginTop: 10,
        color: COLORS.accent,
        textAlign: 'center'
    }
});

export default withTheme(SignInScreen);
