import React, { Component } from 'react';
import { View, Alert } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import BefrienderButton from '../../components/button';
import SheetHeader from '../header';
import firestore from '@react-native-firebase/firestore';
import styles from './styles';
import { connect } from 'react-redux';
import common_style from '../../common_style';
import Toast from 'react-native-toast-message';

class AddMusic extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isUpdating: false,
            musicName: null,
            musicUrl: null,
            isValidUrl: false,
            musicNameError: "",
            musicUrlError: ""
        }
    }

    onMusicNameChange = (musicName) => {
        this.setState({ musicName, musicNameError: null })
    }

    onMusicUrlChange = (musicUrl) => {
        var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        if (musicUrl.match(p)) {
            this.setState({ musicUrl, isValidUrl: true, musicUrlError: null });
        } else {
            this.setState({ musicUrl, isValidUrl: false, musicUrlError: null });
        }
    }

    confirmMusicCreate = () => {
        const { isUpdating, musicName, musicUrl, isValidUrl } = this.state;

        if (isUpdating) return
        if (!musicName) {
            this.setState({ musicNameError: "Music Name is required!" })
            return false
        }
        if (!musicUrl) {
            this.setState({ musicUrlError: "Music Url is required!" })
            return false
        }
        if (musicUrl && isValidUrl == false) {
            this.setState({ musicUrlError: "Music Url is not valid!" })
            return false
        }
        Alert.alert(
            'Update',
            'Are you sure to Create music?',
            [
                {
                    text: 'No',
                    onPress: () => { },
                },
                {
                    text: 'Yes',
                    onPress: () => { this.addNewMusic() },
                }
            ])
    }

    addNewMusic = () => {
        const { musicName, musicUrl } = this.state

        const { onClose, contact } = this.props
        this.setState({ isUpdating: true })
        firestore()
            .collection('music')
            .add({
                is_all: false,
                responded_users: [],
                responded_user_ids: [],
                music_name: musicName,
                music_url: musicUrl,
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
        const { musicName, musicUrl, isUpdating, musicNameError, musicUrlError } = this.state
        return (
            <View style={[common_style.root, styles.root]}>
                <View style={styles.body}>
                    <SheetHeader title={`Add music`} onClose={onClose} />
                    <TextInput
                        label="Music name *"
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
                        label="Music url *"
                        style={styles.input}
                        value={musicUrl}
                        returnKeyType='done'
                        autoCapitalize='none'
                        onChangeText={this.onMusicUrlChange}
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
                        onPress={this.confirmMusicCreate}
                        loading={isUpdating} />
                </View>
            </View>
        );
    }
}

const mapStateToProps = ({ contact }) => ({
    contact: contact.contact,
})

export default connect(mapStateToProps)(AddMusic);