import { StyleSheet } from "react-native";
import { COLORS } from "../../Consts";

export default StyleSheet.create({
    root: {
        flex: 1,
        alignSelf: 'stretch',
        backgroundColor: COLORS.background,
    },
    input: {
        backgroundColor: 'white',
        borderColor: '#DADDE2',
    },
    content: {
        position: 'absolute',
        width: '100%',
        height: 64,
        top: 6,
    },
    overlay: {},
})