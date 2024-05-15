import {
    StyleSheet,
    Dimensions
} from 'react-native';
const numColumns = 4;

export default StyleSheet.create({
    item: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        margin: 3,
        height: (Dimensions.get('window').width - 120) / numColumns, // approximate a square
        borderWidth: 1,
        borderColor: '#ddd'
    },
    itemInvisible: {
        backgroundColor: 'transparent',
        borderWidth: 0
    },
    icon: {
        marginTop: 6,
        height: '90%',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
