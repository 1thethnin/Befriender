import React, { Component } from "react";
import { Text, View, Alert } from "react-native";
import SheetHeader from "../header";
import styles from "./styles";
import PropTypes from "prop-types";
import { ActivityIndicator, TextInput } from "react-native-paper";
import ContactItem from "../../components/contact_item";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import BefrienderButton from "../../components/button";
import firestore from "@react-native-firebase/firestore";
import { connect } from "react-redux";
import {
  setContact,
  setSelectedNOKContact,
  setShowRelationshipPicker,
} from "../../redux/features/contact_slice";
import { showErrorDialog } from "../../services/utils";
import common_style from "../../common_style";
import RelationshipPicker from "../../dialogs/relationship_picker";

class AddContact extends Component {
  constructor(props) {
    super(props);
    const { contact } = props;
    const idList = (contact.befriendersIDS || [])
      .concat(contact.friendsIDS || [])
      .concat(contact.nok_user_ids || []);
    this.state = {
      result: [],
      originalList: idList,
      selectedFriendIDs: [],
      selectedBefrienderIDs: [],
      selectedNOKUserIDs: [],
      selectedNOKUsers: [],
      searchText: null,
      isSearching: false,
      isUpdating: false,
      relation: "",
      userCenterID:this.getCenterID(this.props.contact),
      lastClick: 0,
    };
  }

  onToggleSelected = (contact) => {
    const {
      selectedFriendIDs,
      selectedBefrienderIDs,
      selectedNOKUserIDs,
      selectedNOKUsers,
    } = this.state;
    if (this.isSelected(contact.id)) {
      var index = selectedFriendIDs.indexOf(contact.id);
      let nokIndex = selectedNOKUserIDs.indexOf(contact.id);
      if (index >= 0) {
        selectedFriendIDs.splice(index, 1);
      } else if (nokIndex >= 0) {
        selectedNOKUserIDs.splice(nokIndex, 1);
        selectedNOKUsers.splice(nokIndex, 1);
      } else {
        index = selectedBefrienderIDs.indexOf(contact.id);
        selectedBefrienderIDs.splice(index, 1);
      }
    } else {
      if (contact.role === "User") {
        selectedFriendIDs.push(contact.id);
      } else if (contact.role === "NOK") {
        const { setSelectedNOKContact, setShowRelationshipPicker } = this.props;
        //show relationship dialog.
        setSelectedNOKContact(contact);
        setShowRelationshipPicker(true);
      } else {
        selectedBefrienderIDs.push(contact.id);
      }
    }
    this.setState({
      selectedFriendIDs,
      selectedBefrienderIDs,
      selectedNOKUserIDs,
      selectedNOKUsers,
    });
  };

  isSelected = (id) => {
    const { selectedFriendIDs, selectedBefrienderIDs, selectedNOKUserIDs } =
      this.state;
    return (
      selectedFriendIDs.includes(id) ||
      selectedBefrienderIDs.includes(id) ||
      selectedNOKUserIDs.includes(id)
    );
  };

  getCenterID = (data) => {
    if (data.center && data.center.path) {
      
      const documentReference = firestore().doc(data.center.path);
      const centerDocID = documentReference.id;

      return centerDocID;
    }
    return "";
  }

  onSearchInputChange = async (newVal) => {
    this.setState({ searchText: newVal });

    if (new Date().getTime() - this.state.lastClick < 500) {
      return;
    }

    this.setState({
      lastClick: new Date().getTime(),
      isSearching: true
    });

    const { contact, user } = this.props;
    const { searchText, originalList, userCenterID } = this.state;

    const response = await firestore()
      .collection("users")
      //.where("center", "==", user.center)
      .get();
    const idListHolder = [];
    const userList = [];
    response.forEach((o) => {
      if (
        !originalList.includes(o.id) && contact.id !== o.id &&
        !idListHolder.includes(o.id)
      ) {
        idListHolder.push(o.id);
        if (o.data().role != "Center Admin") {
          if (o.data().role == "NOK"){
            const nokCenterID = this.getCenterID(o.data());
            
            if(nokCenterID == userCenterID) {
              userList.push({
                id: o.id,
                ...o.data(),
              });
            }
          }else{
            userList.push({
              id: o.id,
              ...o.data(),
            });
          }
          
        }
      }
    });
    const updatedData = userList.filter((item) => {
      const item_data = `${item.name ? item.name.toUpperCase() : null}`;
      const user_id = `${item.user_id ? item.user_id.toUpperCase() : null}`;
      return (
        item_data.indexOf(newVal.toUpperCase()) > -1 ||
        user_id.indexOf(newVal && newVal.toUpperCase()) > -1
      );
    });
    this.setState({ result: updatedData, isSearching: false });
  };

  startSearching = async () => {
    const { searchText, originalList, userCenterID } = this.state;
    const { contact, user } = this.props;
    this.setState({ isSearching: true });
    if (searchText == "") this.setState({ isSearching: false });

    const response = await firestore()
      .collection("users")
      //.where("center", "==", user.center)
      .get();
    const idListHolder = [];
    const userList = [];
    response.forEach((o) => {
      if (
        !originalList.includes(o.id) &&
        contact.id !== o.id &&
        !idListHolder.includes(o.id)
      ) {
        idListHolder.push(o.id);
        if (o.data().role != "Center Admin") {

          if (o.data().role == "NOK"){
            const nokCenterID = this.getCenterID(o.data());
            
            if(nokCenterID == userCenterID) {
              userList.push({
                id: o.id,
                ...o.data(),
              });
            }
          }else{
            userList.push({
              id: o.id,
              ...o.data(),
            });
          }
        }
      }
    });
    const updatedData = userList.filter((item) => {
      const item_data = `${item.name ? item.name.toUpperCase() : null}`;
      const user_id = `${item.user_id ? item.user_id.toUpperCase() : null}`;
      return (
        item_data.indexOf(searchText && searchText.toUpperCase()) > -1 ||
        user_id.indexOf(searchText && searchText.toUpperCase()) > -1
      );
    });
    this.setState({ result: updatedData, isSearching: false });
    // this.setState({ isSearching: true })
    // const { contact, user } = this.props
    // const { searchText, originalList } = this.state;
    // let listHolder = []
    // try {
    //     const response = await firestore()
    //         .collection('users')
    //         .where('center', '==', user.center)
    //         .where('user_id', '>=', searchText)
    //         .where('user_id', '<=', searchText + '~')
    //         //java.lang.IllegalArgumentException: All where filters with an inequality (notEqualTo, notIn, lessThan, lessThanOrEqualTo, greaterThan, or greaterThanOrEqualTo) must be on the same field.
    //         // .where(firestore.FieldPath.documentId(), 'not-in', originalList)
    //         .get()
    //     const responseByName = await firestore()
    //         .collection('users')
    //         .where('center', '==', user.center)
    //         .where('name', '>=', searchText)
    //         .where('name', '<=', searchText + '~')
    //         .get()
    //     listHolder = response.docs.concat(responseByName.docs)
    //     console.log("List Holder.....", listHolder)
    // } catch (e) {
    //     console.error('User search error, ', e);
    //     showErrorDialog({
    //         title: 'Error',
    //         msg: `Sorry, searching user encountered errors, ${e.message}`,
    //         action: 'OK',
    //     })
    // }
    // const idListHolder = []
    // const userList = []
    // listHolder.forEach(o => {
    //     if (o.name.toUpperCase() == searchText.toUpperCase()) {
    //         userList.push({
    //             id: o.id,
    //             ...o.data()
    //         })
    //     }
    //     if (!originalList.includes(o.id)
    //         && contact.id !== o.id
    //         && !idListHolder.includes(o.id)) {
    //         idListHolder.push(o.id)
    //         userList.push({
    //             id: o.id,
    //             ...o.data()
    //         })
    //     }
    // })
    // this.setState({ result: userList, isSearching: false })
  };

  confirmToAdd = () => {
    Alert.alert("Update", "Are you sure to Add Contact?", [
      {
        text: "No",
        onPress: () => {},
      },
      {
        text: "Yes",
        onPress: () => {
          this.updateContactList();
        },
      },
    ]);
  };

  updateContactList = () => {
    var {
      selectedFriendIDs,
      selectedBefrienderIDs,
      selectedNOKUserIDs,
      selectedNOKUsers,
      isUpdating,
    } = this.state;
    if (isUpdating) {
      return;
    }
    this.setState({ isUpdating: true });
    const { contact, onClose } = this.props;
    selectedFriendIDs = selectedFriendIDs.concat(contact.friendsIDS);
    selectedBefrienderIDs = selectedBefrienderIDs.concat(
      contact.befriendersIDS
    );
    selectedNOKUserIDs = selectedNOKUserIDs.concat(contact.nok_user_ids);
    selectedNOKUsers = selectedNOKUsers.concat(contact.nok_users);
    firestore()
      .collection("users")
      .doc(contact.id)
      .update({
        friendsIDS: selectedFriendIDs,
        befriendersIDS: selectedBefrienderIDs,
        nok_user_ids: selectedNOKUserIDs,
        nok_users: selectedNOKUsers,
      })
      .then(() => {
        setContact({
          ...contact,
          friendsIDS: selectedFriendIDs,
          befriendersIDS: selectedBefrienderIDs,
          nok_user_ids: selectedNOKUserIDs,
          nok_users: selectedNOKUsers,
        });
        this.setState({ isUpdating: false });
        onClose();
      })
      .catch((e) => {
        this.setState({ isUpdating: false });
        console.error("updateContactList error,", e);
      });
  };

  isSelectionEmpty = () => {
    const { selectedFriendIDs, selectedBefrienderIDs, selectedNOKUserIDs } =
      this.state;
    return (
      selectedFriendIDs.length < 1 &&
      selectedBefrienderIDs.length < 1 &&
      selectedNOKUserIDs.length < 1
    );
  };

  onRelationshipPicked = async (contact, value) => {
    const { selectedNOKUsers, selectedNOKUserIDs } = this.state;
    selectedNOKUserIDs.push(contact.id);
    selectedNOKUsers.push({
      uid: contact.id,
      relationship: value,
    });
    this.setState({ selectedNOKUserIDs, selectedNOKUsers });

    const relationStatus = await firestore()
      .collection("relation_status")
      .doc(value)
      .get();
    this.setState({ relation: relationStatus.data().rel_name });
  };

  render() {
    const { onClose } = this.props;
    const { result, searchText, isSearching, isUpdating } = this.state;
    return (
      <View style={[common_style.root, styles.root]}>
        <SheetHeader title={`Add contact`} onClose={onClose} />
        <TextInput
          label="Search user ID"
          style={styles.search}
          value={searchText}
          returnKeyType="search"
          autoCapitalize="none"
          onChangeText={this.onSearchInputChange}
          onSubmitEditing={this.startSearching}
          mode="outlined"
          right={
            <TextInput.Icon name={"magnify"} onPress={this.startSearching} />
          }
        />
        <View style={styles.list_container}>
          {isSearching ? (
            <ActivityIndicator />
          ) : result.length > 0 ? (
            <BottomSheetFlatList
              data={result}
              style={styles.list}
              keyExtractor={(item, index) => `${item.user_id}_${index}`}
              renderItem={({ item }) => (
                <ContactItem
                  withID={true}
                  contact={item}
                  withoutDelete={true}
                  isSelected={this.isSelected(item.id)}
                  onToggleSelected={this.onToggleSelected}
                  relation={this.state.relation}
                />
              )}
            />
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>No Clients found!</Text>
            </View>
          )}
        </View>
        {!this.isSelectionEmpty() ? (
          <View style={styles.button_container}>
            <BefrienderButton
              label="Cancel"
              style={styles.button}
              mode="outlined"
              onPress={onClose}
            />
            <BefrienderButton
              disabled={isUpdating ? true : false}
              label="Add"
              style={styles.button}
              mode="contained"
              onPress={this.confirmToAdd}
              loading={isUpdating}
            />
          </View>
        ) : null}
        <RelationshipPicker onRelationshipPicked={this.onRelationshipPicked} />
      </View>
    );
  }
}

AddContact.propTypes = {
  onClose: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  contact: state.contact.contact,
  user: state.user.user,
});

const mapDispatchToProps = {
  setContact,
  setSelectedNOKContact,
  setShowRelationshipPicker,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddContact);
