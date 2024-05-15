import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import Toolbar from "../../components/Toolbar";
import styles from "./styles";
import common_style from "../../common_style";
import ProfileAvatar from "../../components/profile_avatar";
import { TextInput, withTheme, HelperText } from "react-native-paper";
import BefrienderButton from "../../components/button";
import { SafeAreaView } from "react-native-safe-area-context";
import firestore from "@react-native-firebase/firestore";
import firebaseStorage from "@react-native-firebase/storage";
import { COLORS } from "../../Consts";
import { BefrienderDropdown } from "../../components/dropdown";
import { containsUppercase, showErrorDialog } from "../../services/utils";
import { setUser } from "../../redux/features/user_slice";
import { validate } from "email-validator";
class EditProfile extends Component {
  static propTypes = {
    user: PropTypes.object,
  };

  constructor(props) {
    super(props);
    const { profile_image_url, gender, name, role, contact_no, email } =
      props.user;
    this.state = {
      profile_image_url,
      gender,
      name,
      role,
      contact_no,
      email,
      newImage: null,
      isUploading: false,
      nameError: "",
      contactNoError: "",
      emailError: "",
    };
  }

  profileChange = (newProfile) => this.setState({ newImage: newProfile });

  genderChange = (newGender) => this.setState({ gender: newGender });

  nameChange = (newName) => this.setState({ name: newName, nameError: null });

  roleChange = (newRole) => this.setState({ role: newRole });

  contactNoChange = (newContactNo) => {
    const phoneRegExp =
      /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

    if (phoneRegExp.test(newContactNo) === false) {
      this.setState({
        contact_no: newContactNo,
        contactNoError: "Contact No. is invalid!",
      });
      return false;
    } else {
      this.setState({
        contact_no: newContactNo,
        contactNoError: null,
      });
      return true;
    }

    // this.setState({
    //   contact_no: newContactNo,
    //   contactNoError: null,
    // });
  };

  emailChange = (newEmail) =>
    this.setState({ email: newEmail, emailError: null });

  confirmProfileUpdate = () => {
    const { isUploading, name, contact_no, email } = this.state;
    if (isUploading) {
      return;
    }
    if (!name && !name.trim()) {
      this.setState({ nameError: "Name is required!" });
      return false;
    }
    if (!contact_no) {
      this.setState({ contactNoError: "Contact No. is required!" });
      return false;
    }

    if (!email) {
      this.setState({ emailError: "Email is required!" });
      return false;
    } else if (!validate(email)) {
      this.setState({ emailError: "Email is not valid!" });
      return false;
    } else if (containsUppercase(email)) {
      this.setState({
        emailError: "Email with capital letter is not allowed!",
      });
      return false;
    }
    Alert.alert("Update", "Are you sure to update profile?", [
      {
        text: "No",
        onPress: () => {},
      },
      {
        text: "Yes",
        onPress: () => {
          this.updateProfile();
        },
      },
    ]);
  };

  updateProfile = async () => {
    const { user } = this.props;
    const {
      profile_image_url,
      gender,
      name,
      role,
      contact_no,
      newImage,
      email,
    } = this.state;
    this.setState({ isUploading: true });
    const updatedUser = {
      profile_image_url,
      gender,
      name,
      role,
      contact_no,
      email,
    };
    if (newImage) {
      //upload profile image.
      const notiStorageRef = firebaseStorage().ref(
        `profiles/${Date.now()}.jpg`
      );
      await notiStorageRef.putString(newImage.data, "base64", {
        contentType: newImage.mime,
      });
      const imageUrl = await notiStorageRef.getDownloadURL();
      updatedUser.profile_image_url = imageUrl;
    }

    //update user info.
    await firestore()
      .collection("users")
      .doc(user.id)
      .update(updatedUser)
      .catch((e) => {
        this.setState({ isUploading: false });
        console.error("Edit profile, ", e);
        showErrorDialog({
          title: "Error",
          msg: "Sorry, there was error, while trying to update profile.",
          action: "OK",
        });
      });
    this.setState({ isUploading: false });
    this.props.navigation.goBack();
  };

  render() {
    const {
      profile_image_url,
      gender,
      name,
      role,
      contact_no,
      email,
      isUploading,
      nameError,
      contactNoError,
      emailError,
    } = this.state;
    return (
      <SafeAreaView style={[common_style.root, styles.root]}>
        <KeyboardAvoidingView
          style={styles.root}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Toolbar {...this.props} title={"Edit Profile"} />
          <ScrollView style={styles.content}>
            <View style={{ alignItems: "center" }}>
              <ProfileAvatar
                style={styles.avatar}
                profileImageUrl={profile_image_url}
                iconBackgroundColor={COLORS.primary}
                editable={true}
                onImageChange={this.profileChange}
              />
            </View>
            <View>
              <BefrienderDropdown
                style={[styles.row, styles.top]}
                label={`Salutation`}
                value={gender}
                onChange={this.genderChange}
                menu={["Mr", "Madam", "Mrs", "Miss"]}
              />

              <TextInput
                style={[styles.row, styles.top]}
                value={name}
                onChangeText={this.nameChange}
                label={`Full name *`}
                mode="outlined"
                outlineColor="#DADDE2"
                maxLength={30}
              />
              {nameError ? (
                <HelperText
                  style={[styles.content_row, styles.helper_text]}
                  type="error"
                >
                  {nameError}
                </HelperText>
              ) : null}
              <TextInput
                style={[styles.row, styles.top]}
                value={role}
                onChangeText={this.roleChange}
                label={`Role`}
                mode="outlined"
                disabled={true}
                outlineColor="#DADDE2"
                activeOutlineColor="#DADDE2"
              />

              <TextInput
                style={[styles.row, styles.top]}
                value={contact_no}
                onChangeText={this.contactNoChange}
                label={`Contact number *`}
                mode="outlined"
                outlineColor="#DADDE2"
                keyboardType="phone-pad"
                maxLength={14}
              />
              {contactNoError ? (
                <HelperText
                  style={[styles.content_row, styles.helper_text]}
                  type="error"
                >
                  {contactNoError}
                </HelperText>
              ) : null}
              <TextInput
                style={[styles.row, styles.top]}
                value={email}
                onChangeText={this.emailChange}
                label={`Email *`}
                mode="outlined"
                keyboardType="email-address"
                outlineColor="#DADDE2"
              />
              {emailError ? (
                <HelperText
                  style={[styles.content_row, styles.helper_text]}
                  type="error"
                >
                  {emailError}
                </HelperText>
              ) : null}
            </View>
          </ScrollView>
          <BefrienderButton
            style={styles.button}
            onPress={this.confirmProfileUpdate}
            label={"Save"}
            loading={isUploading}
            mode="contained"
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user.user,
});

const mapDispatchToProps = {
  setUser,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(EditProfile));
