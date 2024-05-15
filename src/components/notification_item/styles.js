import { StyleSheet } from "react-native";

export default StyleSheet.create({
    root: {
        flex: 1,
        marginVertical: 8,
        borderColor: '#C9CDEB',
        backgroundColor: 'white',
        borderWidth: 1,
        borderRadius: 6,
        marginHorizontal: 16,
        shadowColor: 'rgb(201, 205, 235)',
        shadowOffset: {
            width: 4,
            height: 4,
        },
        shadowOpacity: 0.4,
    },
    content_root: {
        padding: 16,
        // paddingEnd: 8,//required when right icon(delete icon) is presented.
        flexDirection: 'row',
    },
    indicator: {
        width: 10,
        height: 10,
        backgroundColor: '#CA534E',
        borderRadius: 5,
        marginEnd: 8,
        marginTop: 5,
    },
    content: {
        flex: 1,
    },
    time: {
        flex: 0.2,
        fontSize: 14,
        lineHeight: 17.21,
        fontWeight: '400',
        color: '#A1A5AC',
    },
    body: {
        flex: 0.8,
        fontSize: 14,
        lineHeight: 19.88,
        fontWeight: '400',
    },
    icon: {
        alignSelf: 'center',
    }
})