import { StyleSheet } from "react-native";
import { COLORS } from "../../Consts";

export default StyleSheet.create({
    root: {
        flex: 1,
    },
    body: {
        flex: 1,
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
    button_container: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 4,
        justifyContent: 'space-between',
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