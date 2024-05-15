import React from 'react';
import { View, Image, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import ImageViewer from "react-native-image-zoom-viewer";
import { SafeAreaView } from 'react-native-safe-area-context';
const Width = Dimensions.get("window").width;
export default class ViewPhoto extends React.Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         selectedIndex: this.props.id
    //     }
    // }
    // selectPhoto = (index) => {
    //     this.setState({ selectedIndex: index })
    // }
    render() {
        // const { image, images, id } = this.props;
        const { images, id } = this.props.route.params;
        let imageList = []
        images.forEach(image => {
            imageList.push({ url: image.url })
        });
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
                <View style={{ flex: 1 }}>
                    <ImageViewer
                        saveToLocalByLongPress={false}
                        imageUrls={imageList}
                        index={id}
                    />
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={{ top: 20, right: 20, position: 'absolute' }}>
                        <Image source={require('../../../assets/icons/cancel.png')} style={{ width: 20, height: 20 }} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }
}