import { StyleSheet } from "react-native";

export const backgroundColor = '#9C9C9C'

export default StyleSheet.create({
    tab_root: {
        flexDirection: 'row',
        width: '100%',
        borderTopColor: backgroundColor,
        borderTopWidth: 1,
    },
    active: {
        height: 4,
        width: '100%',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 58,
    },
    icon: {

    },
    label: {
        fontSize: 14,
    },
    badge: {
        position: 'absolute',
        top: 8,
        end: 28,
    }
});