import React, { Component } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Profile from "../profile";
import Contacts from "../contacts";
import Videos from "../videos";
import Music from "../music";
import Toolbar from "../../components/Toolbar";
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import common_style from "../../common_style";
import SheetBackdrop from "../../components/sheet_backdrop";
import AddContact from "../../sheets/add_contact";
import AddVideo from "../../sheets/add_video";
import AddMusic from "../../sheets/add_music";
import AddRadio from "../../sheets/add_radio";
import { connect } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, TOP_TAB_OPTIONS } from "../../Consts";
import { StatusBar } from "react-native";
import Photos from "../photos";
import AddPhoto from "../../sheets/add_photo";
import Radio from "../radio";

const TopTab = createMaterialTopTabNavigator();

class Detail extends Component {

    onAddContactBtnPress = () => {
        this.addContactBottomSheetRef.present();
    };

    closeAddContactSheet = () => {
        this.addContactBottomSheetRef.close();
    };

    onAddVideoBtnPress = () => {
        this.addVideoBottomSheetRef.present();
    };

    closeAddVideoSheet = () => {
        this.addVideoBottomSheetRef.close();
    };

    onAddMusicBtnPress = () => {
        this.addMusicBottomSheetRef.present();
    };

    closeAddMusicSheet = () => {
        this.addMusicBottomSheetRef.close();
    };

    onAddRadioBtnPress = () => {
        this.addRadioBottomSheetRef.present();
    };

    closeAddRadioSheet = () => {
        this.addRadioBottomSheetRef.close();
    };

    onAddPhotoBtnPress = () => {
        this.addPhotoBottomSheetRef.present();
    };

    closeAddPhotoSheet = () => {
        this.addPhotoBottomSheetRef.close();
    };

    render() {
        const { user, navigation } = this.props;
        return (
            <BottomSheetModalProvider>
                <SafeAreaView
                    style={common_style.root}
                >
                    <StatusBar barStyle={'dark-content'} backgroundColor={COLORS.background} />
                    <Toolbar {...this.props} title={`Client's details`} />
                    <TopTab.Navigator
                        initialRouteName="Profile"
                        screenOptions={TOP_TAB_OPTIONS}>
                        <TopTab.Screen name="Profile" >
                            {() => <Profile user={user} navigation={navigation} />}
                        </TopTab.Screen>
                        <TopTab.Screen name="Contacts">
                            {() => <Contacts user={user} onAddContactBtnPress={this.onAddContactBtnPress} />}
                        </TopTab.Screen>
                        <TopTab.Screen name="Videos" >
                            {() => <Videos navigation={navigation} user={user} onAddVideoBtnPress={this.onAddVideoBtnPress} />}
                        </TopTab.Screen>
                        {/* <TopTab.Screen name="Music">
                            {() => <Music navigation={navigation} onAddMusicBtnPress={this.onAddMusicBtnPress} />}
                        </TopTab.Screen> */}
                        <TopTab.Screen name="Radio">
                            {() => <Radio navigation={navigation} onAddRadioBtnPress={this.onAddRadioBtnPress} />}
                        </TopTab.Screen>
                        <TopTab.Screen name="Photos">
                            {() => <Photos navigation={navigation} onAddPhotoBtnPress={this.onAddPhotoBtnPress} />}
                        </TopTab.Screen>
                    </TopTab.Navigator>
                    <BottomSheetModal
                        ref={(ref) => { this.addContactBottomSheetRef = ref }}
                        index={1}
                        snapPoints={['50%', '90%']}
                        // handleComponent={null}
                        handleStyle={common_style.sheet_handle_style}
                        backdropComponent={SheetBackdrop}>
                        <AddContact onClose={this.closeAddContactSheet} user={user} />
                    </BottomSheetModal>
                    <BottomSheetModal
                        ref={(ref) => { this.addVideoBottomSheetRef = ref }}
                        index={1}
                        snapPoints={['50%', '90%']}
                        // handleComponent={null}
                        handleStyle={common_style.sheet_handle_style}
                        backdropComponent={SheetBackdrop}>
                        <AddVideo onClose={this.closeAddVideoSheet} />
                    </BottomSheetModal>
                    <BottomSheetModal
                        ref={(ref) => { this.addMusicBottomSheetRef = ref }}
                        index={1}
                        snapPoints={['50%', '90%']}
                        // handleComponent={null}
                        handleStyle={common_style.sheet_handle_style}
                        backdropComponent={SheetBackdrop}>
                        <AddMusic onClose={this.closeAddMusicSheet} />
                    </BottomSheetModal>
                    <BottomSheetModal
                        ref={(ref) => { this.addRadioBottomSheetRef = ref }}
                        index={1}
                        snapPoints={['50%', '90%']}
                        // handleComponent={null}
                        handleStyle={common_style.sheet_handle_style}
                        backdropComponent={SheetBackdrop}>
                        <AddRadio onClose={this.closeAddRadioSheet} />
                    </BottomSheetModal>
                    <BottomSheetModal
                        ref={(ref) => { this.addPhotoBottomSheetRef = ref }}
                        index={1}
                        snapPoints={['50%', '90%']}
                        // handleComponent={null}
                        handleStyle={common_style.sheet_handle_style}
                        backdropComponent={SheetBackdrop}>
                        <AddPhoto onClose={this.closeAddPhotoSheet} />
                    </BottomSheetModal>
                </SafeAreaView>
            </BottomSheetModalProvider>
        );
    }
}

const mapStateToProps = (state) => ({
    user: state.contact.contact,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Detail);
