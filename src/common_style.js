import { StyleSheet } from "react-native";
import { COLORS } from "./Consts";

export default StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    title: {
        fontWeight: '500',
        fontSize: 22,
        marginLeft: 16,
        color: COLORS.primary,
    },
    body: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 32,
        backgroundColor: COLORS.background,
    },
    scroll_view: {
        width: 'auto',
    },
    sheet_handle_style: {
        backgroundColor: COLORS.background,
        borderTopEndRadius: 8,
        borderTopStartRadius: 8,
    },
});