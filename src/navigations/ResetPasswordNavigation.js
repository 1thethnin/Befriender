import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'
import common_style from '../common_style'
import TopSpacer from '../components/top_spacer'
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'
import Success from '../screens/reset_password_success'
import { COLORS } from '../Consts'
import ConfirmOTP from '../screens/confirm_otp'
import ConfirmPassword from '../screens/confirm_password'

const ResetPasswordStack = createStackNavigator();

class ResetPasswordNavigation extends Component {
    static propTypes = {
        user: PropTypes.object
    }

    render() {
        return (
            <SafeAreaView style={[common_style.root]}>
                <ResetPasswordStack.Navigator
                    initialRouteName="ConfirmPassword"
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
                    }}>

                    <ResetPasswordStack.Screen name="ConfirmPassword" component={ConfirmPassword} />
                    <ResetPasswordStack.Screen name="ConfirmOTP" component={ConfirmOTP} />
                    <ResetPasswordStack.Screen name="Success" component={Success} />
                </ResetPasswordStack.Navigator>
            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(ResetPasswordNavigation)
