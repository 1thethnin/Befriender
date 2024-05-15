import React, { Component } from "react";
import { Text, View } from "react-native";
import { Caption } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from "./styles";

class YoutubeLabel extends Component {
    render() {
        const { style } = this.props;
        return (
            <View style={[styles.root, style]}>
                <Caption style={styles.prefix}>Watch on </Caption>
                <Icon name='youtube' size={20} color='#FFFFFF' />
                <Text style={styles.youtube}>{'YouTube'}</Text>
            </View>
        );
    }
}

export default (YoutubeLabel);