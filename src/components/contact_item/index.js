import React, { Component } from "react";
import { Alert, View } from "react-native";
import {
  Avatar,
  IconButton,
  Paragraph,
  Subheading,
  TouchableRipple,
  withTheme,
} from "react-native-paper";
import { connect } from "react-redux";
import { COLORS } from "../../Consts";
import styles from "./styles";
import firestore from "@react-native-firebase/firestore";

class ContactItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      relation_status: "",
    };
  }

  componentDidMount() {
    this.relationListener = this.getRelationShipOf(this.props.contact);
  }
  componentWillUnmount() {
    if (this.relationListener) this.relationListener();
  }
  confirmDelete = () => {
    const { contact, onContactDelete } = this.props;
    Alert.alert(
      "Delete contact?",
      `Are you sure to remove "${contact.name}" from contact?`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            onContactDelete(contact);
          },
        },
      ]
    );
  };

  getRelationShipOf = (nok) => {
    const { elder } = this.props;
    let relationship = "N/A";
    elder.nok_users?.forEach(async (u) => {
      if (u.uid === nok.id) {
        // relationship = u.relationship
        const relationStatus = await firestore()
          .collection("relation_status")
          .doc(u.relationship)
          .get();
        // relationship = relationStatus.data().rel_name;
        this.setState({ relation_status: relationStatus.data().rel_name });
      }
    });
  };

  render() {
    const { contact, withID, withoutDelete, onToggleSelected, isSelected } =
      this.props;
    var imageSource = {};
    if (contact.profile_image_url) {
      imageSource = { uri: contact.profile_image_url };
    }
    return (
      <TouchableRipple
        borderless={true}
        rippleColor={COLORS.primary}
        style={[
          styles.root,
          isSelected
            ? {
                borderWidth: 1,
                borderColor: COLORS.primary,
                backgroundColor: "#C9CDEB",
              }
            : {},
        ]}
        onPress={() => {
          onToggleSelected && onToggleSelected(contact);
        }}
      >
        <View style={styles.body}>
          <Avatar.Image source={imageSource} size={60} />
          <View style={styles.text_container}>
            {withID ? (
              <Paragraph numberOfLines={1}>{contact.user_id}</Paragraph>
            ) : null}
            <Subheading numberOfLines={1} style={styles.name}>
              {contact.name}
            </Subheading>
            <Paragraph numberOfLines={1} style={styles.role}>
              {contact.role === "User"
                ? "Friend"
                : contact.role === "Befriender"
                ? contact.role
                : isSelected
                ? this.props.relation
                : this.state.relation_status}
            </Paragraph>
          </View>
          {withoutDelete === true ? null : (
            <IconButton
              icon="trash-can-outline"
              onPress={this.confirmDelete}
              color={COLORS.primary}
            />
          )}
        </View>
      </TouchableRipple>
    );
  }
}

const mapStateToProps = (state) => ({ elder: state.contact.contact });

export default connect(mapStateToProps, {})(withTheme(ContactItem));
