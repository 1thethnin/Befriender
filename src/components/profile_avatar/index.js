import React, { Component } from "react";
import { View } from "react-native";
import { Avatar, IconButton, Menu, withTheme } from "react-native-paper";
import styles from "./styles";
import ImagePicker from "react-native-image-crop-picker";
import { COLORS } from "../../Consts";

const IMAGE_PICKER_OPTIONS = {
    mediaType: 'photo',
    cropping: true,
    includeBase64: true,
};
class ProfileAvatar extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isMenuVisible: false,
            image: null,
        }
    }

    showMenu = () => this.setState({ isMenuVisible: true })

    onMenuDismiss = () => this.setState({ isMenuVisible: false })

    pickImage = () => {
        const { onImageChange } = this.props
        ImagePicker
            .openPicker(IMAGE_PICKER_OPTIONS)
            .then(image => {
                onImageChange(image)
                this.setState({ isMenuVisible: false, image })
            }).catch(e => {
                this.setState({ isMenuVisible: false })
            })
    }

    captureImage = () => {
        const { onImageChange } = this.props
        ImagePicker
            .openCamera(IMAGE_PICKER_OPTIONS)
            .then(image => {
                onImageChange(image)
                this.setState({ isMenuVisible: false, image })
            }).catch(e => {
                this.setState({ isMenuVisible: false })
            })
    }

    render() {
        const { isMenuVisible, image } = this.state
        const { profileImageUrl, style, iconBackgroundColor, editable } = this.props;
        var imageSource = {};
        if (profileImageUrl) {
            imageSource = { uri: profileImageUrl };
        }
        if (image) {
            imageSource = { uri: `data:${image.mime};base64,${image.data}` }
        }
        return (
            <View>
                <Avatar.Image
                    source={imageSource}
                    size={134}
                    theme={{ colors: { primary: COLORS.primary } }} //'#C4C4C4'
                    style={[styles.profile, style]} />
                {
                    editable
                        ? <View
                            style={styles.button}>
                            <Menu
                                visible={isMenuVisible}
                                onDismiss={this.onMenuDismiss}
                                anchor={
                                    <View style={styles.anchor_container}>
                                        <Avatar.Icon
                                            size={37}
                                            theme={{
                                                colors: {
                                                    primary: iconBackgroundColor || '#1443A6'
                                                }
                                            }} />
                                        <IconButton
                                            style={styles.anchor_button}
                                            icon='camera'
                                            size={22}
                                            color="white"
                                            onPress={this.showMenu} />
                                    </View>
                                }>
                                <Menu.Item icon='camera' title={'Camera'} onPress={this.captureImage} />
                                <Menu.Item icon='image-outline' title={'Gallery'} onPress={this.pickImage} />
                            </Menu>
                        </View>
                        : null
                }
            </View>
        );
    }
}

export default withTheme(ProfileAvatar);