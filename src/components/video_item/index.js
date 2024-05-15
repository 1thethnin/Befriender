import React, { Component } from "react";
import { Alert, Image, View } from "react-native";
import { Avatar, Caption, IconButton, Paragraph, Subheading } from "react-native-paper";
import { getThumbnailUrl } from "../../services/utils";
import YoutubeLabel from "../youtube_label";
import styles from "./styles";

class VideoItem extends Component {

    confirmDelete = () => {
        const { onVideoDelete, video } = this.props;
        Alert.alert(
            "Delete video?",
            `Are you sure to delete "${video.video_name}"?`,
            [
                {
                    text: 'No',
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        onVideoDelete(video)
                    }
                }
            ])
    }

    render() {
        const { video, navigation } = this.props;
        return (
            <View style={styles.root}>
                <View>
                    <Image source={{ uri: getThumbnailUrl(video.video_url) }} style={styles.thumbnail} />
                    <YoutubeLabel style={styles.youtube_label} />
                </View>
                <View style={styles.title_container}>
                    <Avatar.Image size={24} />
                    <Caption numberOfLines={1} style={styles.title}>{video.video_name}</Caption>
                </View>
                <View style={styles.description_container}>
                    <View style={styles.description_texts}>
                        <Subheading numberOfLines={1} style={styles.descritpion}>{video.video_name}</Subheading>
                        <Paragraph style={styles.duration}>{`8:22 min`}</Paragraph>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <IconButton icon={`pencil-outline`}
                            style={styles.delete}
                            onPress={() => navigation.navigate("EditVideo", { video: video })} />
                        <IconButton icon={`trash-can-outline`} style={styles.delete} onPress={this.confirmDelete} />
                    </View>

                </View>
            </View>
        );
    }
}
export default (VideoItem);