import { FlatList, View } from "react-native";
import React, { Component } from "react";
import { Dialog, List, Portal } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import styles from "./styles";
import { connect } from "react-redux";
import { setShowRelationshipPicker } from "../../redux/features/contact_slice";
import ContactItem from "../../components/contact_item";
import BefrienderButton from "../../components/button";

class RelationshipPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      relationship: [],
    };
  }

  componentDidMount() {
    this.snapshotListener = firestore()
      .collection("relation_status")
      .onSnapshot(
        (snapshot) => {
          var newDocs = [];
          snapshot.docChanges().forEach((o) => {
            newDocs.push({ id: o.doc.id, ...o.doc.data() });
          });
          this.setState({ relationship: newDocs });
        },
        (e) => {
          console.error("Relationship get error, ", e);
          showErrorDialog({
            title: "Error",
            msg: e.message,
            action: "OK",
          });
        }
      );
  }
  componentWillUnmount() {
    if (this.snapshotListener) this.snapshotListener();
  }

  onDismiss = () => {
    const { setShowRelationshipPicker } = this.props;
    setShowRelationshipPicker(false);
  };

  onSelect = (value) => {
    const { contact } = this.props;
    this.props.onRelationshipPicked?.(contact, value.id);
    this.onDismiss();
  };

  render() {
    const { contact, showRelationshipPicker } = this.props;
    return (
      <>
        <Portal>
          <Dialog visible={showRelationshipPicker} onDismiss={this.onDismiss}>
            <View style={styles.body}>
              <ContactItem
                withID={true}
                contact={contact}
                withoutDelete={true}
                isSelected={true}
              />
            </View>
            <Dialog.Title>{`Select relationship`}</Dialog.Title>
            <Dialog.ScrollArea>
              <FlatList
                data={this.state.relationship}
                keyExtractor={(item, index) => `${index}`}
                renderItem={({ item }) => (
                  <List.Item
                    title={item.rel_name}
                    onPress={() => this.onSelect(item)}
                  />
                )}
              />
            </Dialog.ScrollArea>
            <Dialog.Actions>
              <BefrienderButton
                onPress={this.onDismiss}
                label={`Cancel`}
                mode="outlined"
              />
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  contact: state.contact.selectedNOKContact,
  showRelationshipPicker: state.contact.showRelationshipPicker,
});

const mapDispatchToProps = { setShowRelationshipPicker };

export default connect(mapStateToProps, mapDispatchToProps)(RelationshipPicker);
