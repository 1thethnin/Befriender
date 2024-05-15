import React, { Component } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Messages from "../screens/messages"
import ImportantMessages from "../screens/important_messages"
import { Text, withTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import common_style from "../common_style";
import { TOP_TAB_OPTIONS } from "../Consts";

const MessagesTopTab = createMaterialTopTabNavigator();
class MessageNavigation extends Component {
    static propTypes = {
        user: PropTypes.object,
        toggleAddMessageSheet: PropTypes.func,
    }

    render() {
        const { navigation, toggleAddMessageSheet } = this.props
        return (
            <SafeAreaView
                style={[common_style.root]}
                edges={['top']} >
                <Text style={common_style.title}>{`Messages`}</Text>
                <MessagesTopTab.Navigator
                    screenOptions={TOP_TAB_OPTIONS}
                    initialRouteName={"Normal"}>
                    <MessagesTopTab.Screen
                        name="Normal">
                        {(props) => (<Messages navigation={navigation} toggleAddMessageSheet={toggleAddMessageSheet} />)}
                    </MessagesTopTab.Screen>
                    <MessagesTopTab.Screen
                        name="Important" >
                        {(props) => (<ImportantMessages navigation={navigation} toggleAddMessageSheet={toggleAddMessageSheet} />)}
                    </MessagesTopTab.Screen>
                </MessagesTopTab.Navigator>
            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(MessageNavigation))
