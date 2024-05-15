import React, { Component } from "react";
import { Alert, Image, View } from "react-native";
import { Avatar, Caption, IconButton, Paragraph, Subheading } from "react-native-paper";
import { COLORS } from "../../Consts";
import { getThumbnailUrl } from "../../services/utils";
import YoutubeLabel from "../youtube_label";
import styles from "./styles";

class MusicItem extends Component {

    confirmDelete = () => {
        const { music, onMusicDelete } = this.props;
        Alert.alert(
            "Delete music?",
            `Are you sure to delete "${music.music_name}"?`,
            [
                {
                    text: 'No',
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        onMusicDelete(music)
                    }
                }
            ])
    };

    render() {
        const { music, navigation } = this.props;
        return (
            <View style={styles.root}>
                <View>
                    <Image source={{ uri: getThumbnailUrl(music.music_url) }} style={styles.thumbnail} />
                    <YoutubeLabel style={styles.youtube_label} />
                </View>
                <View style={styles.title_container}>
                    <Avatar.Image size={24} />
                    <Caption numberOfLines={1} style={styles.title}>{music.music_name}</Caption>
                </View>
                <View style={styles.description_container}>
                    <View style={styles.description_texts}>
                        <Subheading numberOfLines={1} style={styles.descritpion}>{music.music_name}</Subheading>
                        <Paragraph style={styles.duration}>{`8:22 min`}</Paragraph>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <IconButton icon={`pencil-outline`}
                            style={styles.delete}
                            onPress={() => navigation.navigate("EditMusic", { music: music })} />
                        <IconButton icon={`trash-can-outline`} style={styles.delete} onPress={this.confirmDelete} />
                    </View>
                </View>
            </View>
        );
    }
}
export default (MusicItem);