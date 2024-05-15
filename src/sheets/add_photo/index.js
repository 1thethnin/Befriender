import React, { Component } from 'react';
import { View, Alert } from 'react-native';
import { HelperText } from 'react-native-paper';
import BefrienderButton from '../../components/button';
import firestore from '@react-native-firebase/firestore';
import styles from './styles';
import { connect } from 'react-redux';
import common_style from '../../common_style';
import Toast from 'react-native-toast-message';
import ChoosePhoto from '../../components/choose_photo';
import firebaseStorage from '@react-native-firebase/storage'
import Toolbar from '../../components/Toolbar'

class AddPhoto extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isUpdating: false,
            fileNameError: "",
            imageUrlError: "",
            newImages: [],
        }
    }

    onImageAdded = (newProfile) => {
        if (Array.isArray(newProfile)) {
            this.setState({ newImages: newProfile, imageUrlError: "" })
        } else {
            let newImages = []
            newImages.push({ ...newProfile });
            this.setState({ newImages: newImages, imageUrlError: "" })
        }
    }

    confirmPhotoCreate = () => {
        const { isUpdating, newImages } = this.state;
        if (isUpdating) return
        if (newImages.length <= 0) {
            this.setState({ imageUrlError: "Photo is required!" })
            return false
        }

        Alert.alert(
            'Add',
            'Are you sure to add photo(s)?',
            [
                {
                    text: 'No',
                    onPress: () => { },
                },
                {
                    text: 'Yes',
                    onPress: () => { this.addNewPhoto() },
                }
            ])
    }

    addPost = async (addPhoto) => {
        const { contact } = this.props;
        await firestore()
            .collection('users')
            .doc(contact.id)
            .collection('photos')
            .add(addPhoto)
    }

    uploadImage = async (photo) => {
        let photoPath = photo.path.split("/");
        let fileMeta = photoPath[photoPath.length - 1];

        const addPhoto = {
            created_date: new Date(),
            filename: fileMeta,
        }
        const notiStorageRef = firebaseStorage()
            .ref(`photos/${fileMeta}`)
        await notiStorageRef
            .putString(photo.data, 'base64', { contentType: photo.mime })
        const imageUrl = await notiStorageRef.getDownloadURL()
        // let fileMeta = await notiStorageRef.getMetadata(imageUrl);
        addPhoto.url = imageUrl;
        // addPhoto.filename = fileMeta.name;
        await this.addPost(addPhoto);
    };

    addNewPhoto = async () => {
        this.setState({ isUpdating: true })
        const { newImages } = this.state;
        await Promise.all(newImages.map(photo => this.uploadImage(photo)))
        this.setState({ isUpdating: false })
        this.props.navigation.goBack()
    };

    backInterceptor = () => {
        const { isUpdating } = this.state
        if (!isUpdating) return true
        Toast.show({
            type: 'info',
            text1: 'Work in progress',
            text2: 'Image(s) are being uploaded, please wait.'
        })
        return false;
    }

    render() {
        const { isUpdating, imageUrlError } = this.state;
        return (
            <View style={[common_style.root, styles.root]}>
                <View style={styles.body}>
                    <Toolbar
                        {...this.props}
                        title={'Add Photo'}
                        backInterceptor={this.backInterceptor}
                    />
                    <ChoosePhoto
                        isUpdating={isUpdating}
                        style={styles.innerPreview}
                        onImageChange={this.onImageAdded}
                    />
                    {
                        imageUrlError ?
                            <HelperText
                                style={[styles.content_row, styles.helper_text]}
                                type='error'>
                                {imageUrlError}
                            </HelperText>
                            : null
                    }
                </View>
                <View style={styles.button_container}>
                    <BefrienderButton
                        disabled={isUpdating ? true : false}
                        label='Cancel'
                        style={styles.button}
                        mode='outlined'
                        onPress={() => this.props.navigation.goBack()} />
                    <BefrienderButton
                        disabled={isUpdating ? true : false}
                        label='Add'
                        style={styles.button}
                        mode='contained'
                        onPress={this.confirmPhotoCreate}
                        loading={isUpdating} />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    contact: state.contact.contact,
    photos: state.photos.photos,
})

export default connect(mapStateToProps)(AddPhoto);