import React, { Component } from "react";
import { Button } from "react-native-paper";
import styles from "./styles";

class BefrienderButton extends Component {

    render() {
        const { label, style, content_style, label_style, icon, disabled } = this.props;
        return (
            <Button
                {...this.props}
                disabled={disabled}
                style={[styles.button, style]}
                contentStyle={[styles.button_content, content_style]}
                labelStyle={[label_style]}
                icon={icon}
                uppercase={false}>
                {label}
            </Button>
        );
    }
}

export default (BefrienderButton);