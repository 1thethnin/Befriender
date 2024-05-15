import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View } from 'react-native'
import styles from './styles'
import { IconButton, Text, TouchableRipple } from 'react-native-paper'
import { COLORS } from '../../Consts'
import { connect } from 'react-redux'
import { formatDuration } from '../../services/utils'

class NotificationItem extends Component {
    static propTypes = {
        notification: PropTypes.object.isRequired,
        index: PropTypes.number,
        onPress: PropTypes.func,
    }

    hasMessageBeenRead = () => {
        const { notification, user } = this.props
        if (!user.noti_last_read_datetime) return false
        return notification.datetime.toDate().getTime() < user.noti_last_read_datetime.toDate().getTime()
    }

    getDuration = () => {
        const { notification } = this.props
        if (notification.datetime) {
            const durationMills = new Date() - notification.datetime.toDate()
            return `${formatDuration(durationMills)} ago`
        }
        return "unknown"
    }

    onNotificationPress = (id) => {
        // console.log("Id", id)
    }

    render() {
        const { notification } = this.props
        var unread_border = {}
        const isMessageAlreadyRead = this.hasMessageBeenRead()
        if (!isMessageAlreadyRead) {
            unread_border.borderColor = '#1443A6'
        }
        return (
            <View style={[styles.root, unread_border]}>
                <TouchableRipple
                    borderless={true}
                    rippleColor={COLORS.primary}
                    onPress={this.onNotificationPress(notification.id)}
                    disabled={true}//enable it if there is any touch function.
                >
                    <View style={styles.content_root}>
                        <View style={[styles.indicator, (isMessageAlreadyRead ? { backgroundColor: '#d9c6c5' } : {})]} />
                        <View style={styles.content}>
                            <Text style={styles.body}>{notification.body}</Text>
                            <Text style={styles.time}>{this.getDuration()}</Text>
                        </View>
                        {/* <IconButton style={styles.icon} icon='trash-can-outline' color={COLORS.primary} /> */}
                    </View>
                </TouchableRipple>
            </View>
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.user.user,
})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationItem)