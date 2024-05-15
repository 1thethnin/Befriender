import React, { Component } from "react";
import { View } from "react-native";
import { Headline, IconButton, Title } from "react-native-paper";
import PropTypes from 'prop-types';
import styles from "./styles";
import { COLORS } from "../../Consts";

class SheetHeader extends Component {
    render() {
        const { title, onClose } = this.props;
        return (
            <View style={styles.root}>
                <Title style={styles.title}>{title}</Title>
                <IconButton style={styles.close} icon={`close`} onPress={onClose} color={COLORS.primary} />
            </View>
        );
    }
}

SheetHeader.propTypes = {
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default (SheetHeader);