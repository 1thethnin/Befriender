import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { View, Text } from "react-native";
import { withTheme } from "react-native-paper";
import styles from "./styles";
import common_style from "../../common_style";
import BefrienderButton from "../../components/button";
import { FlatList } from "react-native-gesture-handler";
import MessageItem from "../../components/message_item";
import { setMessage } from "../../redux/features/message_slice";
import {
  getImportantMessagesThunk,
  resetMessages,
  addSnapshotImportantMessage,
} from "../../redux/features/important_message_slice";
import Loading from "../../components/loading";
import LoadingFooter from "../../components/loading_footer";
import firestore from "@react-native-firebase/firestore";
import { showErrorDialog } from "../../services/utils";

class ImportantMessages extends Component {
  static propTypes = {
    user: PropTypes.object,
    messages: PropTypes.array,
    isLoading: PropTypes.bool,
    toggleAddMessageSheet: PropTypes.func,
  };

  componentDidMount() {
    const {
      user,
      getImportantMessagesThunk,
      resetMessages,
      addSnapshotImportantMessage,
    } = this.props;
    resetMessages(); //reset the list, as it is about to fetch from the start.
    getImportantMessagesThunk({ userID: user.id });
    this.snapshotListener = firestore()
      .collection("important_notifications")
      .where("message_creator_id", "==", user.id)
      .where("datetime", ">", new Date())
      .onSnapshot(
        (snapshot) => {
          var newDocs = [];
          snapshot.docChanges().forEach((o) => {
            if (o.type === "added") {
              newDocs.push({ id: o.doc.id, ...o.doc.data() });
            }
          });
          if (newDocs.length < 1) return;
          addSnapshotImportantMessage(newDocs);
        },
        (e) => {
          console.error("Important Messages get error, ", e);
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

  loadMore = () => {
    const { user, getImportantMessagesThunk, messages } = this.props;
    const currentFetchObject =
      messages.length > 0 && messages[messages.length - 1];
    if (this.lastFetchObject === currentFetchObject || messages.length < 10)
      return;
    this.lastFetchObject = currentFetchObject;
    getImportantMessagesThunk({
      userID: user.id,
      startingObject: currentFetchObject,
    });
  };

  goToMessageDetails = (message) => {
    const { navigation, setMessage } = this.props;
    setMessage(message);
    navigation?.navigate("MessageDetails");
  };

  onToggleAddMessageSheet = () => {
    const { toggleAddMessageSheet } = this.props;
    toggleAddMessageSheet(true, "Important");
  };

  render() {
    const { isLoading, messages, refreshing } = this.props;
    return (
      <View style={[common_style.root]}>
        <BefrienderButton
          label="Add message"
          mode="contained"
          style={styles.button}
          onPress={this.onToggleAddMessageSheet}
        />
        {isLoading ? (
          <Loading />
        ) : messages.length > 0 ? (
          <FlatList
            style={styles.content}
            data={messages}
            keyExtractor={(item, index) => `${item.id}`}
            onEndReached={this.loadMore}
            onEndReachedThreshold={0.5}
            refreshing={refreshing}
            renderItem={({ item }) => (
              <MessageItem message={item} onPress={this.goToMessageDetails} />
            )}
            ListFooterComponent={<LoadingFooter isLoading={refreshing} />}
          />
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>No important message yet</Text>
          </View>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user.user,
  messages: state.important_message.messages,
  isLoading: state.important_message.isLoading,
  refreshing: state.important_message.refreshing,
});

const mapDispatchToProps = {
  setMessage,
  getImportantMessagesThunk,
  resetMessages,
  addSnapshotImportantMessage,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(ImportantMessages));
