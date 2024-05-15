import { StyleSheet } from "react-native";

export default StyleSheet.create({
    root: {
        flex: 1,
    },
    search: {
        margin: 16,
        backgroundColor: 'white',
    },
    list_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button_container: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 4,
        justifyContent: 'space-between',
    },
    button: {
        width: '49%',
    },
    list: {
        minWidth: '100%',
        flex: 1,
    },
});