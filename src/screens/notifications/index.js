import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Text, withTheme } from "react-native-paper";
import styles from "./styles";
import { FlatList, View } from "react-native";
import BefrienderButton from "../../components/button";
import common_style from "../../common_style";
import NotificationItem from "../../components/notification_item";
import { SafeAreaView } from "react-native-safe-area-context";
import firestore from "@react-native-firebase/firestore";
import { showErrorDialog } from "../../services/utils";
import Loading from "../../components/loading";
import LoadingFooter from "../../components/loading_footer";
import {
  getNotificationsThunk,
  addNewNotifications,
  setState,
} from "../../redux/features/notification_slice";

const COLLECTION = firestore().collection("send_admin_mails");
class Notifications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isReadAll: false,
    };
  }

  static propTypes = {
    user: PropTypes.object,
  };

  componentDidMount() {
    const { user, addNewNotifications } = this.props;
    this.userRef = firestore().collection("users").doc(user.id);
    this.getNotificationsByPagination();
    this.notificationListener = COLLECTION.where(
      "befrienders",
      "array-contains",
      user.id
    )
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
          addNewNotifications(newDocs);
        },
        (e) => {
          console.error("notifications get error, ", e);
          showErrorDialog({
            title: "Error",
            msg: e.message,
            action: "OK",
          });
        }
      );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.user.noti_last_read_datetime !==
      this.props.user.noti_last_read_datetime
    ) {
      this.checkIsAllRead();
    }
  }

  componentWillUnmount() {
    if (this.notificationListener) this.notificationListener();
  }

  getNotificationsByPagination = async () => {
    const { user, notifications, getNotificationsThunk } = this.props;
    var startingObject;
    if (notifications.length > 0) {
      startingObject = notifications[notifications.length - 1];
      if (
        this.lastStartingObject == startingObject ||
        notifications.length % 10 !== 0
      )
        return;
      this.lastStartingObject = startingObject;
    }
    getNotificationsThunk({ userID: user.id, startingObject: startingObject });
  };

  onReadAll = () => {
    const { isReadAll } = this.state;
    if (isReadAll) return;
    this.userRef
      .update({
        noti_last_read_datetime: new Date(),
      })
      .catch((e) => {
        showErrorDialog({
          title: "Error",
          msg: e.message,
          action: "OK",
        });
      });
  };

  checkIsAllRead = async () => {
    const { user, notifications } = this.props;
    let isThereUnreadNoti = false;
    notifications.forEach((notification) => {
      if (
        notification.datetime?.toDate().getTime() >
        user.noti_last_read_datetime?.toDate().getTime()
      ) {
        isThereUnreadNoti = true;
        return false;
      }
    });
    this.setState({ isReadAll: !isThereUnreadNoti });
  };

  render() {
    const { notifications, refreshing, isLoading } = this.props;
    const { isReadAll } = this.state;
    return (
      <SafeAreaView style={[common_style.root]} edges={["top"]}>
        <Text style={common_style.title}>{`Notifications`}</Text>
        <BefrienderButton
          //   disabled={isReadAll}
          disabled={
            notifications && notifications.length > 0 ? isReadAll : true
          }
          label="Read all"
          style={styles.button}
          content_style={styles.see_all}
          onPress={this.onReadAll}
        />
        {isLoading ? (
          <Loading />
        ) : notifications && notifications.length > 0 ? (
          <FlatList
            style={styles.content}
            data={notifications}
            keyExtractor={(item, index) => index.toString()}
            onEndReached={this.getNotificationsByPagination}
            onEndReachedThreshold={0.5}
            refreshing={refreshing}
            listKey={`list_key`}
            renderItem={({ item, index }) => (
              <NotificationItem index={index} notification={item} />
            )}
            ListFooterComponent={<LoadingFooter isLoading={refreshing} />}
          />
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>No notification yet</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user.user,
  notifications: state.notification.notifications,
  isLoading: state.notification.isLoading,
  refreshing: state.notification.refreshing,
});

const mapDispatchToProps = {
  addNewNotifications,
  getNotificationsThunk,
  setState,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(Notifications));
