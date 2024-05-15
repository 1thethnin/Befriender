import React, { Component } from 'react'
import { View } from 'react-native'
import { TextInput } from 'react-native-paper'
import { EMOTICONS, INPUT_THEME } from '../../Consts'
import IconPicker from '../react-native-vector-icon-picker'
import styles from './styles'

export default class MessageResponseInput extends Component {
    render() {
        const { icon, text, label, onIconSelect, onTextChanged } = this.props
        return (
            <View style={styles.root}>
                <IconPicker
                    icons={[{
                        family: 'FontAwesome5',
                        icons: EMOTICONS
                    }]}
                    onSelect={onIconSelect}
                    value={icon} />

                <TextInput
                    style={styles.input}
                    value={text}
                    label={label}
                    mode='outlined'
                    theme={INPUT_THEME}
                    onChangeText={onTextChanged}
                />
            </View>
        )
    }
}
