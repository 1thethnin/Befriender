import { StyleSheet } from "react-native";
import { COLORS } from "../../Consts";

export default StyleSheet.create({
    root: {
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#C9CDEB',
        backgroundColor: 'white',
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: 'rgb(201, 205, 235)',
        shadowOffset: {
            width: 4,
            height: 4,
        },
        shadowOpacity: 0.4,
    },
    thumbnail: {
        minHeight: 200,
        backgroundColor: '#DDDDDD',
        margin: 4,
    },
    title_container: {
        position: 'absolute',
        margin: 12,
        flexDirection: 'row',
    },
    title: {
        marginLeft: 16,
        color: 'white',
        marginRight: 20
    },
    description_container: {
        minHeight: 42,
        marginLeft: 16,
        marginEnd: 8,
        marginVertical: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    description_texts: {
        flexDirection: 'column',
        flex: 1,
    },
    descritpion: {
        fontWeight: '500',
        fontSize: 16,
        color: COLORS.primary,
    },
    duration: {
        lineHeight: 14,
        display: 'none',
    },
    delete: {
        margin: 0,
    },
    youtube_label: {
        position: 'absolute',
        bottom: 12,
        left: 4,
    },
});