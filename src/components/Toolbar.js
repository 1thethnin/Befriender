/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { Appbar } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { COLORS } from '../Consts';

class Toolbar extends Component {
    signout = () => {
        auth()
            .signOut()
            .then(() => console.log('User signed out!'));
    };

    checkAndGoBack = () => {
        const { navigation, backInterceptor } = this.props;
        if ((backInterceptor && !backInterceptor()) || !navigation.canGoBack()) {
            return;
        }
        navigation.goBack();
    };

    render() {
        return (
            <Appbar.Header
                dark={false}
                style={{ backgroundColor: COLORS.background, elevation: 0 }}
            >
                <Appbar.BackAction
                    onPress={this.checkAndGoBack}
                    color={COLORS.primary} />
                <Appbar.Content
                    title={this.props.title || 'Back'}
                    titleStyle={{ color: COLORS.primary, fontSize: 22 }}
                    style={{ alignItems: 'flex-start' }} />
                {/* <Appbar.Action
                    icon='logout-variant'
                    onPress={this.signout}
                /> */}
            </Appbar.Header>
        );
    }
}

export default Toolbar;
