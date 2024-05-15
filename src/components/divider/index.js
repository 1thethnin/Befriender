import React, { Component } from "react";
import { View } from "react-native";
import { Divider } from "react-native-paper";
import styles from "./styles";

class BefrienderDivider extends Component {
    render() {
        return (
            <Divider style={styles.divider} {...this.props} />
        );
    }
}

export default (BefrienderDivider);