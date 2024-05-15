import { StyleSheet } from "react-native";
import { COLORS } from "../../Consts";

export default StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: { flex: 1 },
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
    row_content: {
        flex: 1,
        justifyContent: 'center',
    },
    label: {
        fontSize: 13,
        color: '#525C6B',
        marginBottom: 4,
    },
    label_2: {
        fontSize: 16,
    },
    label_3: {
        flex: 1,
    },
    dropdown: {
        margin: 0
    },
    add_image: {
        flex: 1,
        height: 119,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        alignSelf: 'stretch',
        height: 120,
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginVertical: 8,
    },
    controls: {
        flexDirection: 'row',
        bottom: 0,
        paddingTop: 16,
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    control: {
        flex: 1,
        marginBottom: 20,
    },
    button_divider: {
        width: 8,
    },
    content_row: {
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: 'white',
    },
    image: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    helper_text: {
        backgroundColor: 'transparent',
        marginVertical: 0,
    },
})