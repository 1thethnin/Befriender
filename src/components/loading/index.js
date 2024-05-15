import React, { Component } from 'react'
import { View } from 'react-native'
import { ActivityIndicator, withTheme } from 'react-native-paper'
import styles from './styles'

class Loading extends Component {
    render() {
        return (
            <View style={styles.loading}>
                <ActivityIndicator />
            </View>
        )
    }
}

export default withTheme(Loading)