import { StyleSheet } from "react-native";

export default StyleSheet.create({
    root: {
        alignItems: 'stretch',
    },
    list_container: {
        flex: 1,
        paddingTop: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        width: '100%',
    },
    button: {
        width: '60%',
        marginHorizontal: 16,
    },
    selectButton: {
        width: '28%',
        marginLeft: 'auto',
        marginRight: 16
    },
    button_container: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 4,
    },
});