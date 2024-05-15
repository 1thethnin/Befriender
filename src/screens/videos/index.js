import firestore from "@react-native-firebase/firestore";
import React, { Component } from "react";
import { FlatList, View } from "react-native";
import { Paragraph } from "react-native-paper";
import { connect } from "react-redux";
import common_style from "../../common_style";
import BefrienderButton from "../../components/button";
import VideoItem from "../../components/video_item";
import { setState } from "../../redux/features/video_slice";
import styles from "./styles";
import Loading from '../../components/loading'

class Videos extends Component {

    componentDidMount() {
        const { contact, setState } = this.props;
        setState({ videos: [], hasLoadingDone: false, error: null })
        this.unsubscribe = firestore()
            .collection('videos')
            .orderBy("datetime", "desc")
            .onSnapshot(querySnapshot => {
                let videos = [];
                querySnapshot.forEach(documentSnapshot => {
                    const data = documentSnapshot.data();
                    var checkIsAll = data.is_all;
                    if (checkIsAll)
                        data.target_user_ids && data.target_user_ids.length == 0 ? checkIsAll = true : checkIsAll = false;

                    if (checkIsAll ||
                        data.target_user_ids.includes(contact.id)) {
                        videos.push({ ...data, id: documentSnapshot.id });
                    }
                })
                setState({ videos: videos, hasLoadingDone: true, error: null })
            })
    }

    componentWillUnmount() {
        if (this.unsubscribe) this.unsubscribe()
    }

    onVideoDelete = (video) => {
        firestore()
            .collection('videos')
            .doc(video.id)
            .delete()
            .catch(e => {
                console.error('onVideoDelete error,', e);
            })
    }

    render() {
        const { videos, hasLoadingDone, error } = this.props;
        return (
            <View style={[common_style.root, common_style.body, styles.root]}>
                <BefrienderButton
                    onPress={this.props.onAddVideoBtnPress}
                    label={`Add video`}
                    mode='contained'
                    style={styles.button} />
                <View style={styles.list_container}>
                    {
                        hasLoadingDone ?
                            error ?
                                <Paragraph>{error}</Paragraph>
                                : (videos.length > 0) ?
                                    <FlatList
                                        style={styles.list}
                                        data={videos}
                                        showsVerticalScrollIndicator={false}
                                        keyExtractor={(item, index) => `${index}`}
                                        renderItem={({ item }) => <VideoItem navigation={this.props.navigation} video={item} onVideoDelete={this.onVideoDelete} />}
                                    />
                                    : <Paragraph>{`No video yet.`}</Paragraph>
                            : <Loading />
                    }
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        contact: state.contact.contact,
        videos: state.videos.videos,
        hasLoadingDone: state.videos.hasLoadingDone,
        error: state.videos.error,
    }
};

const mapDispatchToProps = { setState };

export default connect(mapStateToProps, mapDispatchToProps)(Videos);