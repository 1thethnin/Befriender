import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
var { width } = Dimensions.get('window');
export default (props) => <ScrollView>
    <View style={styles.container}>
        {props.data.map((prop, index) => {
            var span = 1;
            if (props.data.length === 3 && index === 2) {
                span = 2;
            }
            return <View key={prop.id} style={{
                width: (100 / props.columns) * span + '%',
                height: props.rowHeight === undefined ? width / props.columns : props.rowHeight
            }} >

                {props.renderItem(prop)}

            </View>
        })}

    </View>
</ScrollView>

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
});