import React, { Component } from "react";
import { Platform, TouchableWithoutFeedback, View } from "react-native";
import { Badge, Text, withTheme } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { setIsThereNewNotification } from '../../redux/features/notification_slice';
import { connect } from "react-redux";
import { COLORS } from "../../Consts";
import styles from "./styles";

class Tab extends Component {

    render() {
        const {
            descriptors,
            isThereNewNotification,
            setIsThereNewNotification,
        } = this.props;
        return (
            <View
                style={[
                    styles.tab_root,
                    (Platform.OS === 'android' ? { paddingBottom: 4 } : {})
                ]}>
                {Object.values(descriptors).map((descriptor, index) => {
                    const { route, options, navigation } = descriptor;
                    const isFocused = navigation.isFocused() || index === navigation.getState().index;
                    const color = isFocused ? 'white' : '#BBBBBB';
                    // Badge is currently implemented in notifications.
                    const isBadgeVisible = isThereNewNotification && options.tabBarLabel === 'Notifications';
                    // if notifications tab is already selected, and new noti flag set to true, disable the flag.
                    if (isBadgeVisible && isFocused) setIsThereNewNotification(false)
                    return (
                        <TouchableWithoutFeedback
                            key={route.key}
                            accessibilityLabel={`${route.name} route`}
                            onPress={() => {
                                if (this.last_route === route.name) return
                                if (isBadgeVisible) setIsThereNewNotification(false)
                                this.last_route = route.name
                                navigation.navigate(route.name)
                            }}>
                            <View
                                style={[styles.content]}>
                                <View style={[styles.active, { backgroundColor: isFocused ? COLORS.accent : null }]} />
                                <Icon style={[styles.icon, { color }]} name={`${options.tabBarIcon}`} size={24} />
                                <Badge style={[styles.badge]} size={12} visible={isBadgeVisible} />
                                <Text style={[styles.label, { color }]}>{options.tabBarLabel}</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    );
                })}
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    user: state.user.user,
    isThereNewNotification: state.notification.isThereNewNotification
});

const mapDispatchToProps = { setIsThereNewNotification };

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(Tab));