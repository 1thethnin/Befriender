import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Dialog, List, Portal, Text, withTheme } from 'react-native-paper'
import styles from './styles'
import firestore from '@react-native-firebase/firestore'
import BefrienderButton from '../../components/button'
import ContactItem from '../../components/contact_item'
import { FlatList } from 'react-native'
import Loading from '../../components/loading'

class UserPicker extends Component {
    static propTypes = {
        user: PropTypes.object,
        contacts: PropTypes.array,
        customTitle: PropTypes.string,
        willReturnFullUserObject: PropTypes.bool,
        callback: PropTypes.func,
        defaultSelected: PropTypes.array,
        isVisible: PropTypes.bool,
    }

    constructor(props) {
        super(props)
        this.state = {
            selectedList: props.defaultSelected || [],
            openUserPickerDialog: false,
        }
    }

    isSelected = (id) => {
        const { selectedList } = this.state
        let isIDSelected = false
        selectedList.forEach((v) => {
            if (id === v.id) {
                isIDSelected = true;
                return false
            }
        });
        return isIDSelected
    }

    getIndexOf = (id) => {
        const { selectedList } = this.state;
        let index = -1;
        selectedList.forEach((v, i) => {
            if (id === v.id) {
                index = i;
                return false;
            }
        });
        return index;
    }

    onPickDone = () => {
        const { willReturnFullUserObject, callback } = this.props
        if (willReturnFullUserObject) {
            callback(true, this.state.selectedList)
            return;
        }
        const userIDList = this.state.selectedList.map((v) => v.id)
        callback(true, userIDList)
        this.handleDismiss()
    }

    onItemSelected = (user) => {
        const { selectedList } = this.state
        let index = this.getIndexOf(user.id)
        if (index >= 0) {
            selectedList.splice(index, 1)
        } else {
            selectedList.push(user)
        }
        this.setState({ selectedList })
    }

    handleDismiss = () => this.setState({ openUserPickerDialog: false })

    handleCancel = () => {
        this.setState({ openUserPickerDialog: false, selectedList: this.props.defaultSelected || [] })
    }

    render() {
        const {
            customTitle,
            isVisible,
            contacts,
        } = this.props
        const {
            selectedList,
            openUserPickerDialog,
        } = this.state
        return (
            <>
                {
                    isVisible
                        ? (
                            <List.Item
                                style={styles.row}
                                title={`Tag to choose target users*`}
                                description={`${selectedList.length} item selected`}
                                left={props => <List.Icon {...props} icon="target-account" />}
                                right={props => <List.Icon {...props} icon="menu-down" />}
                                onPress={() => this.setState({ openUserPickerDialog: true })}
                            />
                        )
                        : null
                }
                <Portal>
                    <Dialog
                        onDismiss={this.handleDismiss}
                        visible={openUserPickerDialog}
                        style={styles.root}
                    >
                        <Dialog.Title
                            style={styles.title} >
                            {customTitle ? customTitle : "Pick users to be notified "}
                            <Text style={styles.count}>
                                {`${selectedList.length} selected`}
                            </Text>
                        </Dialog.Title>
                        <Dialog.Content style={[styles.content]}>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                data={contacts}
                                keyExtractor={(item, index) => `${item.id}`}
                                renderItem={({ item }) => (
                                    <ContactItem
                                        contact={item}
                                        withID={false}
                                        withoutDelete={true}
                                        onToggleSelected={this.onItemSelected}
                                        isSelected={this.isSelected(item.id)} />
                                )} />
                        </Dialog.Content>
                        <Dialog.Actions>
                            <BefrienderButton label={`Cancel`} onPress={this.handleCancel} />
                            <BefrienderButton label={`Done`} onPress={this.onPickDone} />
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </>
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.user.user,
    contacts: state.user.contacts,
})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(UserPicker))
