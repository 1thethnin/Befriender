import { StyleSheet } from "react-native";

export default StyleSheet.create({
    root: {
        flex: 1,
    },
    body: {
        flex: 1,
    },
    input: {
        marginTop: 16,
        marginHorizontal: 16,
        backgroundColor: 'white'
        ,
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
    content_row: {
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: 'white',
    },
    helper_text: {
        backgroundColor: 'transparent',
        marginVertical: 0,
    },
});