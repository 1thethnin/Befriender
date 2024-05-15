import React, { Component } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from "react-native";
import { Checkbox } from "react-native-paper";
import { connect } from "react-redux";
import common_style from "../../common_style";
import BefrienderButton from "../../components/button";
import { setState } from "../../redux/features/photo_slice";
import firestore from "@react-native-firebase/firestore";
import styles from "./styles";
import Loading from '../../components/loading'
import { COLORS } from "../../Consts";
import firebaseStorage from '@react-native-firebase/storage'
import ImageLoad from "react-native-image-placeholder";
import Toast from "react-native-toast-message";
const Width = Dimensions.get('window').width;
class Photos extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isSelected: false,
            isSelectedAll: false,
            isDeleting: false,
            showRemovePhotoBtn: false,
            photoList: [],
            deleteLoading: false
        }
    }

    componentDidMount() {
        const { contact, setState } = this.props;
        setState({ photos: [], hasLoadingDone: false })
        this.photoListener = firestore()
            .collection('users')
            .doc(contact.id)
            .collection('photos')
            .orderBy("created_date", "desc")
            .onSnapshot(querySnapshot => {
                let photos = [];
                let photoList = [];
                querySnapshot.forEach(documentSnapshot => {
                    photos.push({ id: documentSnapshot.id, ...documentSnapshot.data() })
                    photoList.push({ id: documentSnapshot.id, ...documentSnapshot.data(), isChecked: false })
                })
                this.setState({ photoList: photoList })
                setState({ photos: photos, hasLoadingDone: true });
            })
    }

    componentWillUnmount() {
        if (this.photoListener) this.photoListener();
    }

    onChecked = (id) => {
        let temp = this.state.photoList.map((photo) => {
            if (id === photo.id) {
                return { ...photo, isChecked: !photo.isChecked };
            }
            return photo;
        });
        this.setState({ photoList: temp })
        let checkedItems = []
        temp.forEach(item => {
            checkedItems.push(item.isChecked)
        })
        if (checkedItems.includes(true)) {
            this.setState({ showRemovePhotoBtn: true, isSelectedAll: true })
        } else {
            this.setState({ showRemovePhotoBtn: false, isSelectedAll: false })
        }
    }

    selectedAll = () => {
        const { isSelectedAll } = this.state;
        this.setState({ isSelectedAll: !isSelectedAll })
        let temp = this.state.photoList.map((photo) => {
            if (isSelectedAll) {
                this.setState({ showRemovePhotoBtn: false })
                return { ...photo, isChecked: false };
            } else {
                this.setState({ showRemovePhotoBtn: true })
                return { ...photo, isChecked: true }
            }
        });
        this.setState({ photoList: temp })
    }

    onConfirmToDelete = () => {
        Alert.alert(
            'Delete',
            'Are you sure to delete selected Photo(s)?',
            [
                {
                    text: 'No',
                    onPress: () => { },
                },
                {
                    text: 'Yes',
                    onPress: () => {
                        this.setState({ showRemovePhotoBtn: false })
                        this.removeSelectedPhoto()
                    },
                }
            ])
    }
    removeSelectedPhoto = async () => {
        const { photoList } = this.state;
        this.setState({ deleteLoading: true })
        await Promise.all(photoList.map(photo => this.removePhoto(photo)))
    }

    removeFile = async (photo) => {
        firebaseStorage()
            .ref(`photos/${photo.filename}`)
            .delete()
            .then(() => {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Photo was successfully deleted.'
                })
            }).catch(e => {
                console.log('removeFile() image delete error', e);
                Toast.show({
                    type: 'error',
                    text1: 'File delete error',
                    text2: 'There is an issue, file may not be deleted.'
                })
            }).finally(() => {
                this.setState({
                    deleteLoading: false,
                    showRemovePhotoBtn: false,
                    isSelectedAll: false,
                    isSelected: false
                })
            })

    };
    removePhoto = async (photo) => {
        const { contact } = this.props;
        if (photo.isChecked == true) {
            firestore()
                .collection('users')
                .doc(contact.id)
                .collection('photos')
                .doc(photo.id)
                .delete()
                .then(() => {
                    // this.setState({deleteLoading: false})
                    this.removeFile(photo)
                })
                .catch(e => {
                    // this.setState({ isUpdating: false })
                })
        }
    }

    onPressSelect = () => {
        this.setState({ isSelected: true })
        let temp = this.state.photoList.map((photo) => {
            return { ...photo, isChecked: false };
        });
        this.setState({ photoList: temp, showRemovePhotoBtn: false, isSelectedAll: false })
    }

    onImageClick = ({ index } = {}) => {
        const { photoList, isSelected } = this.state
        if (isSelected) {
            this.onChecked(photoList[index].id)
            return
        }
        this.props.navigation.navigate("ViewPhoto", { id: index, images: photoList })
    }

    render() {
        const { hasLoadingDone } = this.props;
        const { isSelected, photoList, isSelectedAll, isDeleting, showRemovePhotoBtn, deleteLoading } = this.state;
        if (deleteLoading || !hasLoadingDone) {
            return <Loading />
        }
        return (
            <View style={[common_style.body, common_style.root, styles.root]}>
                {
                    photoList.length > 0 ?
                        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                            {
                                isSelected ?
                                    <BefrienderButton
                                        onPress={() => this.selectedAll()}
                                        label={isSelectedAll ? 'Unselect All' : 'Select all'}
                                        mode='outlined'
                                        style={[styles.button, { backgroundColor: 'white' }]} /> :
                                    <BefrienderButton
                                        onPress={() => this.props.navigation.navigate("AddPhoto")}
                                        label={`Add photo`}
                                        mode={'contained'}
                                        style={styles.button} />
                            }
                            {
                                isSelected ? <BefrienderButton
                                    label='Cancel'
                                    style={styles.selectButton}
                                    mode='outlined'
                                    onPress={() => this.setState({ isSelected: false })}
                                /> : <BefrienderButton
                                    label='Select'
                                    style={styles.selectButton}
                                    mode='outlined'
                                    onPress={() => this.onPressSelect()}
                                />
                            }

                        </View> :
                        <BefrienderButton
                            onPress={() => this.props.navigation.navigate("AddPhoto")}
                            label={`Add photo`}
                            mode={'contained'}
                            style={{
                                marginHorizontal: 16,
                            }} />
                }

                {hasLoadingDone ?
                    photoList.length > 0 ?
                        <ScrollView style={{ flex: 1 }} bounces={false}>
                            <View style={{
                                flex: 1,
                                flexDirection: "row",
                                flexWrap: "wrap",
                                justifyContent: 'space-between',
                                margin: 16
                            }}>
                                {
                                    photoList && photoList.map((item, index) => {
                                        return (
                                            <TouchableOpacity
                                                onPress={() => this.onImageClick({ index: index })} key={index}>
                                                <View>
                                                    <ImageLoad
                                                        source={{ uri: item.url }}
                                                        loadingStyle={{ size: 'large', color: COLORS.primary }}
                                                        style={{
                                                            width: Width / 2 - 20,
                                                            height: Width / 2 - 20,
                                                            marginBottom: 10,
                                                            borderRadius: 10
                                                        }}
                                                        resizeMode="cover"
                                                    />
                                                    {
                                                        isSelected
                                                            ? <>
                                                                <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', width: '100%', height: '100%', position: 'absolute' }} />
                                                                <TouchableOpacity onPress={() => this.onChecked(item.id)} style={{ position: 'absolute', bottom: 10 }}>
                                                                    <Checkbox.Android status={item.isChecked ? "checked" : "unchecked"} color={COLORS.primary} uncheckedColor={COLORS.primary} style={{ backgroundColor: 'white' }} />
                                                                </TouchableOpacity>
                                                            </>
                                                            : null
                                                    }
                                                </View>

                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </View>
                        </ScrollView>
                        :
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text>No photo yet.</Text>
                        </View>
                    : <Loading />
                }{
                    isSelected && showRemovePhotoBtn ?
                        <View style={styles.button_container}>
                            <BefrienderButton
                                disabled={isDeleting ? true : false}
                                label='Remove selected photos'
                                mode='contained'
                                onPress={this.onConfirmToDelete}
                                loading={isDeleting}
                            />
                        </View>
                        : null
                }
            </View>
        );

    }
}

const mapStateToProps = (state) => ({
    photos: state.photos.photos,
    hasLoadingDone: state.photos.hasLoadingDone,
    error: state.photos.error,
    contact: state.contact.contact,
});

const mapDispatchToProps = { setState };

export default connect(mapStateToProps, mapDispatchToProps)(Photos);