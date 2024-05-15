import { StyleSheet } from "react-native";

export default StyleSheet.create({
    root: {},
    content: {
        height: 440,
        paddingBottom: 0,
    },
    title: {
        fontSize: 17,
        lineHeight: 17,
    },
    count: {
        fontSize: 9,
    },
    row: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#aeb0b5',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
})