import React, { Component } from "react";
import { Platform, View } from "react-native";
import styles from "./styles";

class TopSpacer extends Component {

    render() {
        const { height } = this.props
        var custom = { height: 12 }
        if (height && Platform.OS === 'android') {
            custom = { height }
        }
        return <View style={[styles.top_spacer, custom]} />;
    }
}

export default (TopSpacer);