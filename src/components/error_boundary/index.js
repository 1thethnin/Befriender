import React, { Component } from 'react'
import { Paragraph, Subheading, Text, Title, withTheme } from 'react-native-paper'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native-gesture-handler'
import crashlytics from '@react-native-firebase/crashlytics'
import styles from './styles'

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error: error.message }
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.log('Error boundary error:', error, ', errorInfo:', errorInfo)
        crashlytics().recordError(error);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <SafeAreaView>
                    <ScrollView>
                        <View style={styles.content}>
                            <Title >{`Ooops, Error Found!`}</Title>
                            <Subheading>{`Please contact developer`}</Subheading>
                            <Paragraph>{this.state.error}</Paragraph>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            )
        }
        return this.props.children
    }
}

export default withTheme(ErrorBoundary)