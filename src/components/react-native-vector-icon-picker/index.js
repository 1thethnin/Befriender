import React, { Component } from "react";
import {
    View,
    TouchableOpacity,
    FlatList
} from 'react-native';
import styles from './styles';

const numColumns = 4;

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Button, Dialog, Portal } from "react-native-paper";

const familyMap = {
    FontAwesome5
};

class IconPicker extends Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false
        }
    }

    formatData = (data, numColumns) => {
        const numberOfFullRows = Math.floor(data.length / numColumns);

        let numberOfElementsLastRow = data.length - (numberOfFullRows * numColumns);
        while (numberOfElementsLastRow !== numColumns && numberOfElementsLastRow !== 0) {
            data.push({ key: `blank-${numberOfElementsLastRow}`, empty: true });
            numberOfElementsLastRow++;
        }

        return data;
    };

    onSelect = (item) => {
        this.setState({ visible: false });
        this.props.onSelect(item);
    }

    renderItem = ({ item, index }) => {
        if (item.empty === true) {
            return <View style={[styles.item, styles.itemInvisible]} />;
        }

        const Icon = familyMap[item.family];

        if (!Icon) return <View style={[styles.item, styles.itemInvisible]} />;

        return (
            <TouchableOpacity
                style={styles.item}
                onPress={() => this.onSelect(item)}
            >
                <Icon name={item.icon} size={30} color="#000" />
            </TouchableOpacity>
        );

    };

    closeDialog = () => {
        this.setState({ visible: false })
    }

    render() {

        const { visible } = this.state;
        const { icons, value } = this.props;
        const title = this.props.title ? this.props.title : 'Choose icon...';

        const data = [];
        icons.map(i => {
            const family = i.family;
            i.icons.map(j => {
                const icon = {};
                icon.family = family;
                icon.icon = j;
                data.push(icon);
            })
        });

        return (
            <>
                <Portal>
                    <Dialog
                        visible={visible}
                        onDismiss={this.closeDialog}>
                        <Dialog.Title>{title}</Dialog.Title>
                        <Dialog.ScrollArea>
                            <FlatList
                                data={this.formatData(data, numColumns)}
                                renderItem={this.renderItem}
                                numColumns={numColumns}
                                keyExtractor={k => k.icon}
                            />
                        </Dialog.ScrollArea>
                        <Dialog.Actions>
                            <Button onPress={this.closeDialog}>Cancel</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
                <Button
                    style={styles.icon}
                    onPress={() => this.setState({ visible: true })}
                    mode="outlined">
                    <FontAwesome5
                        name={value}
                        size={30}
                        color="#000" />
                </Button>
            </>
        );
    }
}

export default IconPicker;
