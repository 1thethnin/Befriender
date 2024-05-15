import { StyleSheet } from "react-native";
import { COLORS } from "../../Consts";

export default StyleSheet.create({
    root: {
        marginHorizontal: 16,
        marginVertical: 8,
        overflow: 'hidden',
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        borderColor: '#C9CDEB',
        backgroundColor: 'white',
        borderWidth: 1,
        borderRadius: 6,
        padding: 16,
        paddingEnd: 8,
        shadowColor: 'rgb(201, 205, 235)',
        shadowOffset: {
            width: 4,
            height: 4,
        },
        shadowOpacity: 0.4,
    },
    text: {
        flex: 1,
    },
    time: {
        color: COLORS.primary,
        flex: 1,
        fontSize: 14,
        lineHeight: 17.21,
        fontWeight: '400',
    },
    body: {
        flex: 1,
        fontSize: 16,
        lineHeight: 19.66,
    }
})