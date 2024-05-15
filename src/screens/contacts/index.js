import React, { Component } from "react";
import { FlatList, View } from "react-native";
import common_style from "../../common_style";
import BefrienderButton from "../../components/button";
import ContactItem from "../../components/contact_item";
import firestore from '@react-native-firebase/firestore';
import styles from "./styles";
import { connect } from "react-redux";
import { setState } from "../../redux/features/contact_slice";
import { Paragraph } from "react-native-paper";
import { setContact } from "../../redux/features/contact_slice";
import Loading from "../../components/loading";

class Contacts extends Component {

    componentDidMount() {
        this.listenForUserUpdate();
    }

    componentWillUnmount() {
        if (this.userSnapshotListener) this.userSnapshotListener();
    }

    listenForUserUpdate = () => {
        const { contact, setState, setContact } = this.props;
        setState({ contacts: [], hasContactsLoadingDone: false, contactsLoadingError: null })
        this.userSnapshotListener = firestore()
            .collection("users")
            .doc(contact.id)
            .onSnapshot(userDoc => {
                setContact({ id: userDoc.id, ...userDoc.data() })
                this.getContacts(userDoc.data());
            }, e => {
                console.log('listenForUserUpdate() error,', e);
                setState({ contacts: [], hasContactsLoadingDone: true, contactsLoadingError: 'User snapshot error!' });
            });
    }

    getContacts = async (contact) => {
        const { setState } = this.props;
        const idList = (contact.befriendersIDS || []).concat(contact.friendsIDS || []).concat(contact.nok_user_ids || []);
        var mappedList = await this.getContactsByIDs(idList);
        mappedList.sort((a, b) => {
            if (a.role > b.role) return 1
            else if (a.role < b.role) return -1
            else return 0
        });//sort to make befrienders come first.
        setState({ contacts: mappedList, hasContactsLoadingDone: true, contactsLoadingError: null });
    }

    getContactsByIDs = async (idList) => {
        const { setState } = this.props;
        var mappedList = [];
        while (idList.length) {
            const inQueryArray = idList.splice(0, 10);
            try {
                var userList = await firestore()
                    .collection("users")
                    .where(firestore.FieldPath.documentId(), 'in', inQueryArray)
                    .get();
                userList.forEach(r => {
                    mappedList.push({ id: r.id, ...r.data() });
                });
            } catch (e) {
                console.error(e);
                setState({ contacts: [], hasContactsLoadingDone: true, contactsLoadingError: 'Error getting contacts.' });
            }
        }
        return mappedList;
    }

    removeAContact = (contactToDelete) => {
        const { contact } = this.props
        const isDeletingFriend = contactToDelete.role === 'User'
        const isDeletingNOK = contactToDelete.role === 'NOK'
        const updatedList = []
        let nokUsers = []
        var existingList = contact.befriendersIDS
        if (isDeletingFriend) {
            existingList = contact.friendsIDS;
        } else if (isDeletingNOK) {
            existingList = contact.nok_user_ids
            contact.nok_users?.forEach(nu => {
                if (nu.uid !== contactToDelete.id) nokUsers.push(nu)
            })
        }
        existingList.forEach(o => {
            if (o !== contactToDelete.id) {
                updatedList.push(o)
            }
        })
        const docRef =
            firestore()
                .collection('users')
                .doc(contact.id)

        if (isDeletingFriend) {
            docRef.update({ friendsIDS: updatedList })
                .catch(e => {
                    console.error(e);
                })
            return;
        } else if (isDeletingNOK) {
            docRef.update({
                nok_user_ids: updatedList,
                nok_users: nokUsers
            }).catch(e => {
                console.error(e);
            })
            return;
        }

        docRef.update({ befriendersIDS: updatedList })
            .catch(e => {
                console.error(e);
            })
    }

    render() {
        const { contacts, isLoadingDone, error } = this.props;
        return (
            <View style={[common_style.body, common_style.root, styles.root]}>
                <BefrienderButton
                    onPress={this.props.onAddContactBtnPress}
                    label={`Add contact`}
                    mode='contained'
                    style={styles.button} />
                <View style={styles.list_container}>
                    {
                        isLoadingDone ?
                            error ?
                                <Paragraph>{error}</Paragraph>
                                : (contacts.length > 0) ?
                                    <FlatList
                                        style={styles.list}
                                        data={contacts}
                                        showsVerticalScrollIndicator={false}
                                        renderItem={({ item, index }) => <ContactItem contact={item} onContactDelete={this.removeAContact} />}
                                    />
                                    : <Paragraph>{`No contact yet.`}</Paragraph>
                            : <Loading />
                    }
                </View>
            </View>
        );
    }
}
const mapStateToProps = (state) => ({
    contact: state.contact.contact,
    contacts: state.contact.contacts,
    isLoadingDone: state.contact.hasContactsLoadingDone,
    error: state.contact.contactsLoadingError,
});

const mapDispatchToProps = { setState, setContact }

export default connect(mapStateToProps, mapDispatchToProps)(Contacts);