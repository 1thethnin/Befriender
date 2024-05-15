import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Alert, View } from 'react-native'
import styles from './styles'
import { IconButton, Text, TouchableRipple, withTheme } from 'react-native-paper'
import { COLORS } from '../../Consts'
import { format } from 'date-fns'
import { connect } from 'react-redux'
import { removeMessage } from '../../redux/features/message_slice'
import { removeImportantMessage } from '../../redux/features/important_message_slice'
import { deleteMessage } from '../../redux/services/message_api'
import { deleteImportantMessage } from '../../redux/services/important_message_api'
class MessageItem extends Component {
    static propTypes = {
        message: PropTypes.object.isRequired,
    }

    onMessageClick = () => {
        const { message, onPress } = this.props;
        onPress && onPress(message)
    }

    onDelete = () => {
        Alert.alert("Delete"
            , "Are you sure to delete this message?"
            , [
                {
                    text: 'Cancel',
                    onPress: () => { }
                },
                {
                    text: 'OK',
                    onPress: () => { this.doDelete() }
                }
            ]
        )
    }

    doDelete = async () => {
        const {
            message,
            removeImportantMessage,
            removeMessage,
        } = this.props;
        if (message.type) {
            const isSuccess = await deleteMessage(message.id)
            if (isSuccess) {
                removeMessage(message)
            }
            return
        }
        const isSuccess = await deleteImportantMessage(message.id)
        if (isSuccess) {
            removeImportantMessage(message)
        }
    }

    render() {
        const { message } = this.props;
        var date
        if (message.datetime instanceof Date) {
            date = message.datetime
        } else {
            date = message.datetime.toDate()
        }
        return (
            <View style={styles.root}>
                <TouchableRipple
                    borderless={true}
                    rippleColor={COLORS.primary}
                    style={styles.content}
                    onPress={this.onMessageClick}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={styles.text}>
                            <Text style={styles.time}>{`${message.type ? `${message.type.name == "acknowledge" ? "Normal" : "Respond"} •` : 'Important •'} ${message.datetime && format(date, 'dd MMM yyyy')}`}</Text>
                            <Text style={styles.body} numberOfLines={2}>{`${message.message}`}</Text>
                        </View>
                        <IconButton
                            icon='trash-can-outline'
                            color={COLORS.primary}
                            onPress={this.onDelete}
                        />
                    </View>
                </TouchableRipple>
            </View>
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.user.user,
    messages: state.message.messages,
    important_messages: state.important_message.messages,
})

const mapDispatchToProps = {
    removeMessage,
    removeImportantMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(MessageItem))
