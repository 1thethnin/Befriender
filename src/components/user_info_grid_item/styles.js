import { StyleSheet } from "react-native";
import { COLORS } from "../../Consts";

export default StyleSheet.create({
    root: {
        alignSelf: 'flex-start',
    },
    label: {
        color: COLORS.primary,
        lineHeight: 14,
    },
    value: {
        fontSize: 16,
        lineHeight: 19.66,
        fontWeight: '500',
        textAlign: 'justify'
    },
});