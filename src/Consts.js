import React from "react";
import Config from "react-native-config";
import { Button, Caption, Card, Text } from "react-native-paper";
import { View } from 'react-native';
const Consts = {
    CALLS_COLLECTION_NAME: 'calls',
    CALLEE_LOGS_COLLECTION_NAME: 'callee_logs',
    ACTIVITY_LOGS_COLLECTION_NAME: 'activity_logs',
    STATE_CALLING: 'calling',
    STATE_TIMEOUT: 'timeout',
    STATE_PICK_UP: 'pickup',
    STATE_REJECTED: 'rejected',
    STATE_BUSY: 'busy',
    STATE_ENDED: 'ended',
    STATE_CANCELED: 'canceled',
    STATE_RINGING: 'ringing',
    STATE_CONNECTING: 'connecting',
};

export const VIDEO_CALL_STATUS = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
}

export const COLORS = {
    primary: '#1443A6',
    accent: '#17D2D2',
    background: '#F5F7FA',
};

export const INPUT_THEME = {
    colors: {
        placeholder: '#aeb0b5',
        text: '#000E24',
        backgroundColor: 'white',
    }
}

export const hasConferenceTerminated = (status) => {
    return status === Consts.STATE_TIMEOUT
        || status === Consts.STATE_REJECTED
        || status === Consts.STATE_ENDED
        || status === Consts.STATE_CANCELED
        || status === Consts.STATE_BUSY;
}

export const TOP_TAB_OPTIONS = {
    tabBarLabelStyle: {
        textTransform: 'capitalize',
        color: COLORS.primary,
        fontSize: 10.5,
        margin: 0,
        padding: 0,
    },
    tabBarIndicatorStyle: {
        backgroundColor: COLORS.primary,
        height: 4
    },
    lazy: true,
    tabBarStyle: {
        backgroundColor: COLORS.background,
        shadowColor: COLORS.primary,
        shadowRadius: 6,
        shadowOpacity: 0.4
    },
}

export const EMOTICONS = [
    "frown",
    "meh",
    "smile",
    "frown-open",
    "grimace",
    "grin",
    "grin-squint",
    "grin-alt",
    "grin-beam",
    "grin-beam-sweat",
    "grin-hearts",
    "grin-squint-tears",
    "grin-wink",
    "grin-tongue-wink",
    "grin-tongue-squint",
    "grin-tongue",
    "grin-tears",
    "grin-stars",
    "kiss",
    "kiss-beam",
    "kiss-wink-heart",
    "meh-blank",
    "meh-rolling-eyes",
    "thumbs-down",
    "thumbs-up",
];

export const TOAST_CONFIG = {
    notify: ({ text1, props }) => {
        const { title, body, actionText, action, color } = props
        return (
            <Card style={{
                backgroundColor: color || COLORS.primary,
            }}>
                <Card.Content style={{
                    width: 300,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    marginLeft: 4,
                }}>
                    <View style={{
                        flex: 1,
                    }}>
                        <Text numberOfLines={1}>{title}</Text>
                        <Caption>{body}</Caption>
                    </View>
                    {
                        (action && actionText)
                            ? <Button
                                onPress={action}>
                                {actionText}
                            </Button>
                            : null
                    }
                </Card.Content>
            </Card>
        )
    }
}

export const ROOT_URL = Config.ROOT_URL;

export default Consts;