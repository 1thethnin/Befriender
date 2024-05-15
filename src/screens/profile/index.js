import React, { Component } from "react";
import { View, Dimensions, Image, TouchableOpacity, Text, Modal, StatusBar, Platform } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import common_style from "../../common_style";
import ProfileAvatar from "../../components/profile_avatar";
import styles from "./styles";
import UserInfoGrid from "../../components/user_info_grid";
import UserInfoGridItem from "../../components/user_info_grid_item";
import BefrienderButton from "../../components/button";
import BefrienderDivider from "../../components/divider";
import { ActivityIndicator, Caption } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
import { encryptString } from "../../services/utils";
import BefrienderFooter from "../../components/footer";
import { connect } from "react-redux";
import Toast from 'react-native-toast-message'
import firestore from '@react-native-firebase/firestore'
import { setCallingUsers } from '../../redux/features/user_slice.js'
import { setContact } from '../../redux/features/contact_slice.js'
import Consts from "../../Consts";

// import Modal from "react-native-modal";
const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

class Profile extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoadingQR: true,
            qrCode: null,
            isModalVisible: false
        };
    }

    componentDidMount() {
        this.generateQRData();
        const { user, setContact } = this.props;
        this.snapshotListener = firestore()
            .collection('users')
            .doc(user.id)
            .onSnapshot(snapshot => {
                const updatedUser = { id: snapshot.id, ...snapshot.data() }
                setContact(updatedUser)
            })
    }

    componentWillUnmount() {
        if (this.delay) clearTimeout(this.delay);
        if (this.snapshotListener) this.snapshotListener();
    }

    generateQRData = async () => {
        const { user } = this.props;
        var data = {
            email: user.email,
            name: user.name,
            password: user.password,
            device_id: user.device_id
        };

        var encryptedString = encryptString(JSON.stringify(data), 'my-secret-key@123');
        this.setState({ qrCode: encryptedString, isLoadingQR: false });
    };

    makeVideoCall = () => {
        const { user, appUser, navigation, setCallingUsers } = this.props
        let users = [user]
        var userName = `Hosting group call ...`;
        var userProfile = appUser.profile_image_url;
        var gender = "Connecting ...";
        if (users.length <= 1) {
            userName = users[0].name;
            userProfile = users[0].profile_image_url;
            gender = users[0].gender;
        }
        const params = {
            currentUserName: appUser.name,
            roomName: appUser.id,
            userName,
            userProfile,
            gender,
            type: Consts.STATE_CALLING,
            isNotShareable: true,
        };
        setCallingUsers(users)
        navigation.navigate('Conference', params);
    };

    render() {
        const { user } = this.props;
        const { qrCode, isLoadingQR, isModalVisible } = this.state;
        return (
            <ScrollView style={[common_style.scroll_view, styles.root]}>
                <View style={[common_style.body, styles.body]}>
                    <ProfileAvatar profileImageUrl={user.profile_image_url} />
                    <UserInfoGrid user={user} style={styles.content} />
                    <UserInfoGridItem
                        label={`Address`}
                        value={user.address || `N/A`}
                        style={styles.content} />
                    <BefrienderButton
                        label={`Video call client`}
                        mode='contained'
                        style={styles.call_button}
                        onPress={this.makeVideoCall}
                    />
                    <BefrienderDivider />
                    <Caption style={styles.qr_title}>{`Onboarding QR code`}</Caption>
                    {
                        isLoadingQR ?
                            <ActivityIndicator style={styles.loading} />
                            :
                            <TouchableOpacity style={styles.qr_btn} onPress={() => this.setState({ isModalVisible: true })}>
                                <Image source={require('../../../assets/icons/scan.png')} style={{ width: 24, height: 24 }} />
                                <Text style={styles.view_qr}>View QR code</Text>
                            </TouchableOpacity>
                    }
                    <BefrienderFooter />
                </View>
                <Modal
                    visible={isModalVisible}
                    transparent={true}
                    style={{ width: WIDTH, height: HEIGHT }}
                    onRequestClose={() => this.setState({ isModalVisible: false })}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => this.setState({ isModalVisible: false })}
                            style={{ position: 'absolute', width: 35, height: 35, alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', top: (Platform.OS === 'ios' ? '5%' : '3%'), right: '2%' }}>
                            <Image source={require('../../../assets/icons/cancel.png')} style={{ width: 15, height: 15 }} />
                        </TouchableOpacity>
                        <View>
                            <View style={{ backgroundColor: 'white', width: WIDTH, height: WIDTH, justifyContent: 'center', alignItems: 'center' }}>
                                <QRCode
                                    value={qrCode ? qrCode : "NA"}
                                    size={WIDTH - 40}
                                    color='black'
                                    backgroundColor='white' />
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        appUser: state.user.user,
    }
}

const mapDispatchToProps = { setContact, setCallingUsers }

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
