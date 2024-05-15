import { StyleSheet } from "react-native";
import { COLORS } from "../../Consts";

export default StyleSheet.create({
    root: {
        backgroundColor: COLORS.background,
    },
    body: {
        paddingHorizontal: 16,
    },
    content: {
        flex: 1,
        alignSelf: 'stretch',
    },
    call_button: {
        marginTop: 16,
        width: '100%',
    },
    qr_title: {
        width: '100%',
        marginBottom: 16,
        color: COLORS.primary,
    },
    loading: {
        margin: 60,
    },
    modal_title: {
        fontSize: 20,
        marginHorizontal: 10,
        color: COLORS.primary,
    },
    qr_btn: {
        borderColor: '#4054B2',
        borderWidth: 1,
        borderRadius: 8,
        flexDirection: 'row',
        height: 48,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    view_qr: {
        marginLeft: 4,
        color: '#4054B2',
        fontSize: 18,
        fontWeight: '500',
        lineHeight: 21,
    }
});