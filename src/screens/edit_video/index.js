import React, { Component } from 'react'
import { connect, useSelector } from 'react-redux'
import { KeyboardAvoidingView, Platform, Alert } from 'react-native'
import Toolbar from '../../components/Toolbar'
import styles from './styles'
import common_style from '../../common_style'
import { TextInput, withTheme, HelperText } from 'react-native-paper'
import BefrienderButton from '../../components/button'
import { SafeAreaView } from 'react-native-safe-area-context'
import firestore from '@react-native-firebase/firestore'
import { setVideo, removeVideo } from '../../redux/features/video_slice'
import { showErrorDialog } from '../../services/utils'

class EditVideo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isUpdating: false,
            videoName: null,
            videoUrl: null,
            isValidUrl: false,
            videoNameError: "",
            videoUrlError: ""
        }
    }

    componentDidMount = () => {
        const { video } = this.props.route.params;
        this.setState({
            videoName: video.video_name,
            videoUrl: video.video_url,
        })
    }

    onVideoNameChange = (videoName) => {
        this.setState({ videoName, videoNameError: null })
    }

    onVideoUrlChange = (videoUrl) => {
        this.setState({ videoUrl, videoUrlError: null });
    }

    confirmToUpdate = () => {
        const { isUpdating, videoName, videoUrl } = this.state;

        if (isUpdating) return
        if (!videoName) {
            this.setState({ videoNameError: "Video name is required!" })
            return false
        }
        if (!videoUrl) {
            this.setState({ videoUrlError: "Video url is required!" })
            return false
        }
        var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        if (videoUrl && !videoUrl.match(p)) {
            this.setState({ videoUrlError: "Video url is not valid!" })
            return false
        }
        Alert.alert(
            'Update',
            'Are you sure to update video?',
            [
                {
                    text: 'No',
                    onPress: () => { },
                },
                {
                    text: 'Yes',
                    onPress: () => { this.updateVideo() },
                }
            ])
    }

    updateVideo = async () => {
        const { isUpdating, videoName, videoUrl, isValidUrl } = this.state;
        const { video } = this.props.route.params;
        if (isUpdating) return;
        this.setState({ isUpdating: true })
        const updatedVideo = {
            id: video.id,
            video_name: videoName,
            video_url: videoUrl,
        }
        firestore()
            .collection('videos')
            .doc(video.id)
            .update(updatedVideo)
            .catch(e => {
                this.setState({ isUpdating: false })
                console.error('Edit Video, ', e);
                showErrorDialog({
                    title: "Error",
                    msg: 'Sorry, there was error, while trying to update video.',
                    action: 'OK',
                })
            })
        this.setState({ isUpdating: false })
        this.props.navigation.navigate("Videos");
    }

    render() {
        const { videoName, videoUrl, isUpdating, videoNameError, videoUrlError } = this.state
        return (
            <SafeAreaView style={[common_style.root, styles.root]}>
                <KeyboardAvoidingView
                    style={styles.root}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 20}
                    behavior={Platform.OS === 'ios' ? "padding" : 'height'}
                >
                    <Toolbar {...this.props} title={'Edit Video'} />
                    <TextInput
                        label="Video name"
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
                        label="Video url"
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
                    <BefrienderButton
                        disabled={isUpdating ? true : false}
                        style={styles.button}
                        onPress={this.confirmToUpdate}
                        label={'Save'}
                        loading={isUpdating}
                        mode="contained"
                    />

                </KeyboardAvoidingView>
            </SafeAreaView>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        videos: state.videos.videos,
    }
};

const mapDispatchToProps = {
    removeVideo
}

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(EditVideo))
