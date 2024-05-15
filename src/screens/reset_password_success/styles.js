import { StyleSheet } from "react-native";

export default StyleSheet.create({
    root: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon_background: {
        width: 72,
        height: 72,
        borderRadius: 72 / 2,
        marginBottom: 16,
        backgroundColor: '#228B22', //#C9CDEB
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
    },
    message: {
        fontSize: 18,
        lineHeight: 21.09,
    },
    button: {
        margin: 16,
    },
    button_content: {
        flexDirection: 'row-reverse',
    }
})