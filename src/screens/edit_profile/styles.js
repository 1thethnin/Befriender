import { StyleSheet } from "react-native";
import { COLORS } from "../../Consts";

export default StyleSheet.create({
    root: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    content_container: {
        alignItems: 'center',
    },
    avatar: {
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#BDBFD2',
        overflow: 'hidden',
    },
    top: {
        marginTop: 32,
    },
    row: {
        alignSelf: 'stretch',
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: 'white',
        borderColor: '#DADDE2',
    },
    button: {
        margin: 16,
        backgroundColor: COLORS.primary,
    },
    content_row: {
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: 'white',
    },
    helper_text: {
        backgroundColor: 'transparent',
        marginVertical: 0,
    },
})