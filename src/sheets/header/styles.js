import { StyleSheet } from "react-native";
import { COLORS } from '../../Consts'

export default StyleSheet.create({
    root: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        paddingHorizontal: 16,
        borderBottomColor: COLORS.primary,
        paddingBottom: 8,
        borderBottomWidth: 1,
    },
    title: {
        flex: 1,
        color: COLORS.primary,
    },
    close: {
        margin: 0,
    },
});