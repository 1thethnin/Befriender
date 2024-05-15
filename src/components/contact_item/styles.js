import { StyleSheet } from "react-native";
import { COLORS } from "../../Consts";

export default StyleSheet.create({
    root: {
        flex: 1,
        padding: 16,
        paddingRight: 8,
        borderColor: '#C9CDEB',
        backgroundColor: 'white',
        borderWidth: 1,
        borderRadius: 6,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: 'rgb(201, 205, 235)',
        shadowOffset: {
            width: 4,
            height: 4,
        },
        shadowOpacity: 0.4,
    },
    body: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text_container: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'column',
        marginLeft: 16,
    },
    name: {
        fontWeight: '500',
        fontSize: 16,
        lineHeight: 16,
        color: COLORS.primary,
    },
    role: {
        lineHeight: 14,
    },
    selected: {

    },
});