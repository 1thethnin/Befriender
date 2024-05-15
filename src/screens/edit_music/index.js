import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import Toolbar from '../../components/Toolbar'
import styles from './styles'
import common_style from '../../common_style'
import { TextInput, HelperText } from 'react-native-paper'
import BefrienderButton from '../../components/button'
import { SafeAreaView } from 'react-native-safe-area-context'
import firestore from '@react-native-firebase/firestore'
import { showErrorDialog } from '../../services/utils'
import { removeMusic } from '../../redux/features/music_slice'

class EditMusic extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isUpdating: false,
            musicName: null,
            musicUrl: null,
            musicNameError: "",
            musicUrlError: ""
        }
    }

    componentDidMount = () => {
        const { music } = this.props.route.params;
        this.setState({
            musicName: music.music_name,
            musicUrl: music.music_url,
        })
    }

    onMusicNameChange = (musicName) => {
        this.setState({ musicName, musicNameError: null })
    }

    onMusicUrlChange = (musicUrl) => {
        this.setState({ musicUrl, musicUrlError: null });
        // var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        // if (musicUrl.match(p)) {
        //     this.setState({ musicUrl, isValidUrl: true, musicUrlError: null });
        // } else {
        //     this.setState({ musicUrl, isValidUrl: false, musicUrlError: null });
        // }
    }

    confirmToUpdate = () => {
        const { isUpdating, musicName, musicUrl } = this.state;

        if (isUpdating) return
        if (!musicName) {
            this.setState({ musicNameError: "Music Name is required!" })
            return false
        }
        if (!musicUrl) {
            this.setState({ musicUrlError: "Music Url is required!" })
            return false
        }
        var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        if (musicUrl && !musicUrl.match(p)) {
            this.setState({ musicUrlError: "Music Url is not valid!" })
            return false
        }
        Alert.alert(
            'Update',
            'Are you sure to Update music?',
            [
                {
                    text: 'No',
                    onPress: () => { },
                },
                {
                    text: 'Yes',
                    onPress: () => { this.updateMusic() },
                }
            ])
    }

    updateMusic = () => {
        const { isUpdating, musicName, musicUrl } = this.state;
        const { music } = this.props.route.params;
        if (isUpdating) return
        const { contact } = this.props
        this.setState({ isUpdating: true })
        const updatedMusic = {
            id: music.id,
            music_name: musicName,
            music_url: musicUrl,
        }
        firestore()
            .collection('music')
            .doc(music.id)
            .update(updatedMusic)
            .catch(e => {
                this.setState({ isUpdating: false })
                console.error('Edit Music, ', e);
                showErrorDialog({
                    title: "Error",
                    msg: 'Sorry, there was error, while trying to update Music.',
                    action: 'OK',
                })
            })
        this.setState({ isUpdating: false })
        this.props.navigation.navigate("Music");

    }

    render() {
        const { musicName, musicUrl, isUpdating, musicNameError, musicUrlError } = this.state
        return (
            <SafeAreaView style={[common_style.root, styles.root]}>
                <KeyboardAvoidingView
                    style={styles.root}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 20}
                    behavior={Platform.OS === 'ios' ? "padding" : 'height'}
                >
                    <Toolbar {...this.props} title={'Edit Music'} />
                    <TextInput
                        label="Music name"
                        style={styles.input}
                        value={musicName}
                        returnKeyType='next'
                        onChangeText={this.onMusicNameChange}
                        mode='outlined'
                    />
                    {
                        musicNameError ?
                            <HelperText
                                style={[styles.content_row, styles.helper_text]}
                                type='error'>
                                {musicNameError}
                            </HelperText>
                            : null
                    }
                    <TextInput
                        label="Music url"
                        style={styles.input}
                        value={musicUrl}
                        returnKeyType='done'
                        autoCapitalize='none'
                        onChangeText={musicUrl => this.onMusicUrlChange(musicUrl)}
                        mode='outlined'
                    />
                    {
                        musicUrlError ?
                            <HelperText
                                style={[styles.content_row, styles.helper_text]}
                                type='error'>
                                {musicUrlError}
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

const mapStateToProps = ({ contact }) => ({
    contact: contact.contact,
})
const mapDispatchToProps = {
    removeMusic
}

export default connect(mapStateToProps, mapDispatchToProps)(EditMusic);
