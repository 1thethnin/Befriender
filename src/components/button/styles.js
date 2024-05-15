import { StyleSheet } from "react-native";
import { COLORS } from "../../Consts";

export default StyleSheet.create({
    button: {
        width: 'auto',
        borderColor: COLORS.primary,
    },
    button_content: {
        textTransform: 'capitalize',
        padding: 8,
        fontSize: 18,
        fontWeight: '500',
    },
});