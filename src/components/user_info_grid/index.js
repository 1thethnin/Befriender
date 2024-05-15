import React, { Component } from "react";
import { View } from "react-native";
import UserInfoGridItem from "../user_info_grid_item";
import styles from "./styles";

class UserInfoGrid extends Component {

    componentDidMount = () => {
        //do nothing
    }
    render() {
        const { user, style } = this.props;
        return (
            <View {...this.props} style={[styles.root, (style || {})]}>
                <View style={styles.container}>
                    <UserInfoGridItem style={styles.item} label={`Salutation`} value={user.gender || 'N/A'} />
                    <UserInfoGridItem style={styles.item} label={`Full Name`} value={user.name || `N/A`} />
                </View>
                <View style={styles.container}>
                    {/* <UserInfoGridItem 
                      style={styles.item} label={`Age`} 
                      value={isIsoDate(user.date_of_birth) 
                        ? user.date_of_birth ? calculateAge(user.date_of_birth) : "N/A"
                        : user.date_of_birth.toDate() ? calculateAge(user.date_of_birth.toDate()) : "N/A"} /> */}
                    <UserInfoGridItem style={styles.item} label={`Contact No.`} value={user.contact_no || `91234567`} />
                    <UserInfoGridItem style={styles.item} label={`Email`} value={user.email || `abc@befriender.com`} />
                </View>
            </View>
        );
    }
}

export default (UserInfoGrid);