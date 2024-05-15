import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Image, KeyboardAvoidingView, View, Alert } from "react-native";
import SheetHeader from "../header";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import styles from "./styles";
import {
  HelperText,
  Menu,
  Text,
  TextInput,
  TouchableRipple,
  withTheme,
} from "react-native-paper";
import BefrienderButton from "../../components/button";
import BefrienderDropdown from "../../components/dropdown";
import ImagePicker from "react-native-image-crop-picker";
import firestore from "@react-native-firebase/firestore";
import firebaseStorage from "@react-native-firebase/storage";
import { COLORS, INPUT_THEME } from "../../Consts";
import UserPicker from "../../dialogs/user_picker";
import { getGoogleSpeech, showErrorDialog } from "../../services/utils";
import MessageResponseInput from "../../components/msg-response-input";

const IMAGE_PICKER_OPTIONS = {
  mediaType: "photo",
  cropping: true,
  includeBase64: true,
};

const ALERT_SOUND_LIST = [
  { label: "Sound 1", value: "sound1.mpeg" },
  { label: "Sound 2", value: "sound2.mpeg" },
  { label: "Sound 3", value: "sound3.mpeg" },
  { label: "Sound 4", value: "sound4.mpeg" },
];
class AddMessage extends Component {
  static propTypes = {
    user: PropTypes.object,
    defaultType: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      type: props.defaultType || "Normal",
      targetType: "All",
      showImagePickerMenu: false,
      targetedUserIDs: [],
      alertSound: { label: "Sound 1", value: "sound1.mpeg" },
      language: "English",
      image: null,
      message: "",
      background: null,
      backgroundList: [],
      positiveIcon: "smile",
      negativeIcon: "frown",
      positiveText: "Yes",
      negativeText: "No",
    };
  }

  componentDidMount() {
    Promise.all([this.getDefaultAlarm(), this.getBackgrounds()]).then((raw) => {
      this.setState({
        alertSound: this.getSoundByValue(raw[0]),
        background: raw[1][0],
        backgroundList: raw[1],
      });
    });
  }

  getSoundByValue = (value) => {
    var result = { label: "Sound 1", value: "sound1.mpeg" };
    ALERT_SOUND_LIST.forEach((a) => {
      if (value === a.value) {
        result = a;
        return false;
      }
    });
    return result;
  };

  getDefaultAlarm = async () => {
    try {
      const defaultAlarmValue = await firestore()
        .collection("settings")
        .doc("default_alarm")
        .get();
      return defaultAlarmValue.data().sound_name;
    } catch (e) {
      console.error("getDefaultAlarm error", e);
    }
    return "sound1.mpeg";
  };

  getBackgrounds = async () => {
    try {
      const allBackgroundRefs = await firebaseStorage()
        .ref("/backgrounds")
        .listAll();
      const backgroundList = [];
      for (let i = 0; i < allBackgroundRefs.items.length; i++) {
        backgroundList.push(await allBackgroundRefs.items[i].getDownloadURL());
      }
      return backgroundList;
    } catch (e) {
      console.error("getBackgrounds error ", e);
    }
    return [];
  };

  typeChange = (newType) => this.setState({ type: newType });

  targetTypeChange = (newTargetType) =>
    this.setState({ targetType: newTargetType });

  pickMessageImage = () => this.setState({ showImagePickerMenu: true });

  pickImage = () => {
    ImagePicker.openPicker(IMAGE_PICKER_OPTIONS)
      .then((image) => this.setImage(image))
      .catch((e) => {
        this.setState({ isMenuVisible: false });
      });
  };

  captureImage = () => {
    ImagePicker.openCamera(IMAGE_PICKER_OPTIONS)
      .then((image) => this.setImage(image))
      .catch((e) => {
        this.setState({ showImagePickerMenu: false });
      });
  };

  setImage = (image) => {
    this.setState({
      image: image,
      showImagePickerMenu: false,
      imageError: null,
    });
  };

  onImagePickerMenuDismiss = () =>
    this.setState({ showImagePickerMenu: false });

  alertSoundChange = (newAlertSound) =>
    this.setState({ alertSound: newAlertSound });

  languageChange = (newLanguage) => this.setState({ language: newLanguage });

  messageChange = (newValue) =>
    this.setState({ message: newValue, messageError: null });

  notifyForNoResponseChange = (newValue) => {
    this.setState({ notifyForNoResponse: newValue.replace(/[^0-9]/g, "") });
  };

  alertDurationChange = (newValue) =>
    this.setState({ alertDuration: newValue.replace(/[^0-9]/g, "") });

  backgroundChange = (newValue) => this.setState({ background: newValue });

  userPickerCallback = (willSave, data) => {
    this.setState({ targetedUserIDs: data, targetError: null });
  };

  saveNotification = async () => {
    const {
      image,
      targetType,
      message,
      type,
      targetedUserIDs,
      alertSound,
      background,
      alertDuration,
      notifyForNoResponse,
      positiveIcon,
      positiveText,
      negativeIcon,
      negativeText,
      language,
    } = this.state;
    const isAll = targetType === "All";
    const isNormal = type !== "Important";
    const isRespondedType = type === "Respond";

    const datetimeObj = new Date();
    let imageUrl = null;
    if (image && isNormal) {
      const notiStorageRef = firebaseStorage().ref(
        `notifications/${Date.now()}.jpg`
      );
      await notiStorageRef.putString(image.data, "base64", {
        contentType: image.mime,
      });
      imageUrl = await notiStorageRef.getDownloadURL();
    }
    // get text speech and add it to data.
    //const audio_content = await getGoogleSpeech(message.trim())
    const { user } = this.props;
    var data = {
      datetime: datetimeObj,
      is_all: isAll,
      message: message.trim(),
      target_user_ids: isAll
        ? this.getAllContactsIDList(user.id)
        : targetedUserIDs,
      responded_user_ids: [],
      sound_name: alertSound.value,
      language: language,
      message_creator_id: user.id,
      //audio_content,
      center_ids: [user.center ? user.center.id : ""],
    };
    if (!isNormal) {
      // data.background_url = background;
    } else {
      if (isRespondedType) {
        data.type = {
          name: "respond",
          positiveIcon,
          positiveText,
          negativeIcon,
          negativeText,
        };
      } else {
        data.type = { name: "acknowledge" };
      }
      if (imageUrl) {
        data.image_url = imageUrl;
      } else {
        data.image_url = "";
      }
      data.reminder = (alertDuration && parseInt(alertDuration, 10)) || 0;
      data.admin_reminder =
        (notifyForNoResponse && parseInt(notifyForNoResponse, 10)) || 0;
    }
    await firestore()
      .collection(isNormal ? "notifications" : "important_notifications")
      .add(data);
    return true;
  };

  getAllContactsIDList = (userId) => {
    const { contacts } = this.props;
    if (contacts.length > 0) {
      return contacts.map((c) => c.id);
    } else {
      return [];
    }
  };

  confirmToAdd = () => {
    const { type, targetType, message, targetedUserIDs } = this.state;
    if (!message && !message.trim()) {
      this.setState({ messageError: "Message is required!" });
      return false;
    }
    if (targetType !== "All" && targetedUserIDs.length < 1) {
      this.setState({ targetError: "Target user(s) must be selected!" });
      return false;
    }
    Alert.alert(
      "Update",
      `Are you sure to create a new ${type.toLowerCase()} message?`,
      [
        {
          text: "No",
          onPress: () => {},
        },
        {
          text: "Yes",
          onPress: () => {
            this.addMessage();
          },
        },
      ]
    );
  };

  addMessage = async () => {
    const { loading } = this.state;
    if (loading) {
      return;
    }
    this.setState({ loading: true });
    try {
      const isSuccess = await this.saveNotification();
      this.setState({ loading: false });
      if (!isSuccess) return;
    } catch (e) {
      this.setState({ loading: false });
      showErrorDialog({ title: "Error", msg: e.message, action: "OK" });
      console.error("addMessage error, ", e);
      return;
    }
    const { onClose } = this.props;
    onClose();
  };

  render() {
    const { onClose, defaultType } = this.props;
    const {
      loading,
      type,
      targetType,
      showImagePickerMenu,
      alertSound,
      language,
      image,
      alertDuration,
      message,
      notifyForNoResponse,
      imageError,
      messageError,
      targetError,
      positiveIcon,
      negativeIcon,
      positiveText,
      negativeText,
    } = this.state;
    return (
      <KeyboardAvoidingView
        style={styles.root}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 120}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SheetHeader title={`Add message`} onClose={onClose} />
        <BottomSheetScrollView style={styles.content}>
          <View>
            <BefrienderDropdown
              style={[styles.content_row]}
              label={`Type`}
              value={type}
              onChange={this.typeChange}
              menu={
                defaultType === "Important"
                  ? ["Important"]
                  : ["Normal", "Respond"]
              }
            />

            {type === "Important" ? null : (
              <>
                <TouchableRipple
                  borderless={true}
                  rippleColor={COLORS.primary}
                  style={[styles.row]}
                  onPress={this.pickMessageImage}
                >
                  <>
                    <Menu
                      visible={showImagePickerMenu}
                      onDismiss={this.onImagePickerMenuDismiss}
                      anchor={
                        <View style={styles.add_image}>
                          <Text
                            style={[styles.label, styles.label_2]}
                          >{`+ Add image`}</Text>
                        </View>
                      }
                    >
                      <Menu.Item
                        title={`Camera`}
                        icon={"camera"}
                        onPress={this.captureImage}
                      />
                      <Menu.Item
                        title={`Gallery`}
                        icon={"image-outline"}
                        onPress={this.pickImage}
                      />
                    </Menu>
                    {image === null ? null : (
                      <Image
                        style={styles.image}
                        source={{
                          uri: `data:${image.mime};base64,${image.data}`,
                        }}
                        resizeMode="cover"
                      />
                    )}
                  </>
                </TouchableRipple>

                {imageError ? (
                  <HelperText
                    style={[styles.content_row, styles.helper_text]}
                    type="error"
                  >
                    {imageError}
                  </HelperText>
                ) : null}
              </>
            )}

            <TextInput
              style={styles.message}
              multiline={true}
              mode="outlined"
              value={message}
              onChangeText={this.messageChange}
              label={`Message *`}
              numberOfLines={8}
              theme={INPUT_THEME}
            />
            {messageError ? (
              <HelperText
                style={[styles.content_row, styles.helper_text]}
                type="error"
              >
                {messageError}
              </HelperText>
            ) : null}
            <BefrienderDropdown
              key={"target_clients"}
              style={styles.content_row}
              label={`Target clients`}
              value={targetType}
              onChange={this.targetTypeChange}
              menu={["All", "Targeted only"]}
            />
            <UserPicker
              key={"user_picker"}
              defaultSelected={[]}
              callback={this.userPickerCallback}
              isVisible={targetType !== "All"}
            />
            {targetError ? (
              <HelperText
                style={[styles.content_row, styles.helper_text]}
                type="error"
              >
                {targetError}
              </HelperText>
            ) : null}
            <BefrienderDropdown
              key={"alert_sound"}
              style={styles.content_row}
              label={`Alert sound`}
              value={alertSound}
              onChange={this.alertSoundChange}
              getLabel={(s) => s.label}
              getValue={(s) => s.value}
              menu={ALERT_SOUND_LIST}
            />
            <BefrienderDropdown
              key={"preferred_language"}
              style={styles.content_row}
              label={`Preferred Language`}
              value={language}
              onChange={this.languageChange}
              menu={["English", "Chinese", "Tamil", "Malay"]}
            />
            {type === "Important" ? null : (
              <>
                {type !== "Respond" ? null : (
                  <>
                    <MessageResponseInput
                      label={`Enter positive text`}
                      icon={positiveIcon}
                      text={positiveText}
                      onIconSelect={(iconObject) =>
                        this.setState({ positiveIcon: iconObject.icon })
                      }
                      onTextChanged={(txt) =>
                        this.setState({ positiveText: txt })
                      }
                    />

                    <MessageResponseInput
                      label={`Enter negative text`}
                      icon={negativeIcon}
                      text={negativeText}
                      onIconSelect={(iconObject) =>
                        this.setState({ negativeIcon: iconObject.icon })
                      }
                      onTextChanged={(txt) =>
                        this.setState({ negativeText: txt })
                      }
                    />
                  </>
                )}

                <TextInput
                  style={styles.content_row}
                  mode="outlined"
                  label={`Alert duration`}
                  value={alertDuration}
                  onChangeText={this.alertDurationChange}
                  theme={INPUT_THEME}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.content_row}
                  mode="outlined"
                  label={`Notify for no response`}
                  value={notifyForNoResponse}
                  onChangeText={(text) => this.notifyForNoResponseChange(text)}
                  theme={INPUT_THEME}
                  keyboardType="numeric"
                />
              </>
            )}
          </View>
        </BottomSheetScrollView>
        <View style={styles.controls}>
          <BefrienderButton
            label={"Cancel"}
            style={styles.control}
            mode={"outlined"}
            onPress={onClose}
          />
          <View style={styles.button_divider} />
          <BefrienderButton
            disabled={loading ? true : false}
            label={"Add"}
            style={styles.control}
            loading={loading}
            mode={"contained"}
            onPress={this.confirmToAdd}
          />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user.user,
  contacts: state.user.contacts,
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(AddMessage));
