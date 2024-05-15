import { StyleSheet } from "react-native";
import { COLORS } from "../../Consts";

export default StyleSheet.create({
    root: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    message: {
        fontSize: 14,
        lineHeight: 22.4,
    },
    code_container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 16,
    },
    code: {
        flex: 1,
        height: 56,
        marginRight: 4,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 18,
        fontWeight: '700',
        borderColor: '#DADDE2',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
    },
    resend_btn: {
        padding: 8,
        height: 57,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resend_btn_label: {
        fontWeight: '500',
        lineHeight: 16.41,
        fontSize: 14,
        color: 'white',
        textAlign: 'center',
    },
    duration: {
        fontWeight: '700',
        fontSize: 14,
    },
})