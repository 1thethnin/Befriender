import React, { Component } from "react";
import { View } from "react-native";
import { Caption, Subheading, Text } from "react-native-paper";
import styles from "./styles";

class UserInfoGridItem extends Component {

    render() {
        const { label, value, style } = this.props;
        return (
            <View {...this.props} style={[styles.root, style]}>
                <Caption style={styles.label}>{label}</Caption>
                <Subheading style={styles.value}>{value}</Subheading>
            </View>
        );
    }
}

export default (UserInfoGridItem);