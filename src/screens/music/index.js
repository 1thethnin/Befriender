import React, { Component } from "react";
import { FlatList, View } from "react-native";
import { Paragraph } from "react-native-paper";
import { connect } from "react-redux";
import common_style from "../../common_style";
import MusicItem from "../../components/music_item";
import BefrienderButton from "../../components/button";
import { setState } from "../../redux/features/music_slice";
import firestore from "@react-native-firebase/firestore";
import styles from "./styles";
import Loading from '../../components/loading'

class Music extends Component {

    componentDidMount() {
        const { contact, setState } = this.props;
        setState({ music: [], hasLoadingDone: false, error: null })
        this.unsubscribe = firestore()
            .collection('music')
            .orderBy("datetime", "desc")
            .onSnapshot(querySnapshot => {
                let musics = [];
                querySnapshot.forEach(documentSnapshot => {
                    const data = documentSnapshot.data();
                    var checkIsAll = data.is_all;
                    if (checkIsAll)
                        data.target_user_ids && data.target_user_ids.length == 0 ? checkIsAll = true : checkIsAll = false;

                    if (checkIsAll ||
                        data.target_user_ids.includes(contact.id)) {
                        musics.push({ ...data, id: documentSnapshot.id })
                    }
                })
                setState({ music: musics, hasLoadingDone: true, error: null });
            })
    }

    componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe()
    }

    onMusicDelete = (music) => {
        const musicRef = firestore()
            .collection('music')
            .doc(music.id)
        if (music.target_user_ids.length > 1) {
            //remove contact id from target then return;
            const { contact } = this.props
            const updatedTargetList = music.target_user_ids.filter(t => (contact.id !== t))
            musicRef
                .update({ target_user_ids: updatedTargetList })
                .catch(e => {
                    console.error('onMusicDelete remove contact from target user error,', e);
                })
            return;
        }
        musicRef
            .delete()
            .catch(e => {
                console.error('onMusicDelete deleting music doc error,', e);
            })
    }

    render() {
        const { music, hasLoadingDone, error, onAddMusicBtnPress } = this.props;
        return (
            <View style={[common_style.body, common_style.root, styles.root]}>
                <BefrienderButton
                    onPress={onAddMusicBtnPress}
                    label={`Add music`}
                    mode='contained'
                    style={styles.button} />
                <View style={styles.list_container}>
                    {
                        hasLoadingDone ?
                            error ? <Paragraph>{error}</Paragraph>
                                : (music && music.length > 0) ?
                                    <FlatList
                                        style={styles.list}
                                        data={music || []}
                                        showsVerticalScrollIndicator={false}
                                        keyExtractor={(item, index) => `${index}`}
                                        renderItem={({ item }) => <MusicItem navigation={this.props.navigation} music={item} onMusicDelete={this.onMusicDelete} />}
                                    />
                                    : <Paragraph>{`No music yet.`}</Paragraph>
                            : <Loading />}
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    music: state.music.music,
    hasLoadingDone: state.music.hasLoadingDone,
    error: state.music.error,
    contact: state.contact.contact,
});

const mapDispatchToProps = { setState };

export default connect(mapStateToProps, mapDispatchToProps)(Music);