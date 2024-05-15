import React, { Component } from 'react';
import { Alert, View } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import BefrienderButton from '../../components/button';
import SheetHeader from '../header';
import firestore from '@react-native-firebase/firestore';
import styles from './styles';
import { connect } from 'react-redux';
import common_style from '../../common_style';
class AddVideo extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isUpdating: false,
            videoName: null,
            videoUrl: null,
            isValidUrl: false,
            videoNameError: "",
            videoUrlError: ""
        }
    }

    onVideoNameChange = (videoName) => {
        this.setState({ videoName: videoName, videoNameError: null })
    }

    onVideoUrlChange = (videoUrl) => {
        var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        if (videoUrl.match(p)) {
            this.setState({ videoUrl: videoUrl, isValidUrl: true, videoUrlError: null });
        } else {
            this.setState({ videoUrl: videoUrl, isValidUrl: false, videoUrlError: null });
        }
    }

    confirmVideoCreate = () => {
        const { isUpdating, videoName, videoUrl, isValidUrl } = this.state;
        if (isUpdating) { return; }
        if (!videoName) {
            this.setState({ videoNameError: "Video name is required!" })
            return false
        }
        if (!videoUrl) {
            this.setState({ videoUrlError: "Video url is required!" })
            return false
        }
        if (videoUrl && isValidUrl == false) {
            this.setState({ videoUrlError: "Video url is not valid!" })
            return false
        }

        Alert.alert(
            'Update',
            'Are you sure to create video?',
            [
                {
                    text: 'No',
                    onPress: () => { },
                },
                {
                    text: 'Yes',
                    onPress: () => { this.addNewVideo() },
                }
            ])
    }

    addNewVideo = () => {
        const { videoName, videoUrl } = this.state;
        const { onClose, contact } = this.props
        this.setState({ isUpdating: true })
        firestore()
            .collection('videos')
            .add({
                is_all: false,
                responded_users: [],
                responded_user_ids: [],
                video_name: videoName,
                video_url: videoUrl,
                target_user_ids: [contact.id],
                datetime: new Date(),
            })
            .then(() => {
                this.setState({ isUpdating: false })
                onClose()
            })
            .catch(e => {
                this.setState({ isUpdating: false })
            })

    }

    render() {
        const { onClose } = this.props
        const { videoName, videoUrl, isUpdating, videoNameError, videoUrlError } = this.state;
        return (
            <View style={[common_style.root, styles.root]}>
                <View style={styles.body}>
                    <SheetHeader title={`Add video`} onClose={onClose} />
                    <TextInput
                        label="Video name *"
                        style={styles.input}
                        value={videoName}
                        returnKeyType='next'
                        onChangeText={this.onVideoNameChange}
                        mode='outlined'
                    />
                    {
                        videoNameError ?
                            <HelperText
                                style={[styles.content_row, styles.helper_text]}
                                type='error'>
                                {videoNameError}
                            </HelperText>
                            : null
                    }
                    <TextInput
                        label="Video url *"
                        style={styles.input}
                        value={videoUrl}
                        returnKeyType='done'
                        autoCapitalize='none'
                        onChangeText={videoUrl => this.onVideoUrlChange(videoUrl)}
                        mode='outlined'
                    />
                    {
                        videoUrlError ?
                            <HelperText
                                style={[styles.content_row, styles.helper_text]}
                                type='error'>
                                {videoUrlError}
                            </HelperText>
                            : null
                    }
                </View>
                <View style={styles.button_container}>
                    <BefrienderButton
                        label='Cancel'
                        style={styles.button}
                        mode='outlined'
                        onPress={onClose} />
                    <BefrienderButton
                        disabled={isUpdating ? true : false}
                        label='Add'
                        style={styles.button}
                        mode='contained'
                        onPress={this.confirmVideoCreate}
                        loading={isUpdating} />
                </View>
            </View>
        );
    }
}

const mapStateToProps = ({ contact }) => ({
    contact: contact.contact,
})

export default connect(mapStateToProps)(AddVideo)
