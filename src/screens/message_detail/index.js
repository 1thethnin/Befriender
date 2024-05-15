import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Image, ScrollView, View } from 'react-native'
import Toolbar from '../../components/Toolbar'
import common_style from '../../common_style'
import { Caption, Subheading, Button } from "react-native-paper";
import UserInfoGridItem from '../../components/user_info_grid_item'
import styles from './styles'
import { COLORS } from "../../Consts";
import ContactItem from "../../components/contact_item"
import BefrienderButton from "../../components/button"
import { SafeAreaView } from 'react-native-safe-area-context'
import firestore from '@react-native-firebase/firestore'
class MessageDetails extends Component {
    static propTypes = {
        message: PropTypes.object,
    }

    state = {
        targetUsers: [],
    }

    componentDidMount() {
        this.getTargetUsers()
    }

    getTargetUsers = async () => {
        const { message } = this.props
        var targetUsersID = [].concat(message.target_user_ids)
        const batch = []
        while (targetUsersID.length) {
            batch.push(
                firestore()
                    .collection('users')
                    .where(firestore.FieldPath.documentId(), 'in', targetUsersID.splice(0, 10))
                    .get()
            )
        }
        const resultNestedArrays = await Promise.all(batch)
        var targetUsers = []
        resultNestedArrays.forEach(docArr => {
            targetUsers = targetUsers.concat(docArr.docs.map(o => ({ id: o.id, ...o.data() })))
        })
        this.setState({ targetUsers, })
    }

    render() {
        const { message } = this.props
        const { targetUsers } = this.state
        return (
            <SafeAreaView style={[common_style.root, styles.root]}>
                <Toolbar {...this.props} title={`Message details`} />
                <ScrollView>
                    <View style={styles.content}>
                        {
                            message.image_url
                                ? <Image style={styles.banner} source={{ uri: message.image_url }} resizeMode='cover' />
                                : null
                        }
                        <UserInfoGridItem
                            label={`Type`}
                            value={message.type ? message.type.name == "acknowledge" ? "Normal" : "Respond" : 'Important'}
                            style={styles.info} />
                        <UserInfoGridItem label={`Message`} value={message.message} style={[styles.info, {textAlign: 'justify'}]} />
                        <UserInfoGridItem label={`Target clients`} value={message.is_all ? `All` : `Targeted only`} style={styles.info} />
                        {
                            targetUsers.map((o, index) => (<ContactItem
                                key={`${index}`}
                                contact={o}
                                withoutDelete={true}
                                withID={true} />
                            ))
                        }
                        {
                            message.type && message.type.name == "respond" ?
                                <View style={[{ alignSelf: 'flex-start' }, styles.info]}>
                                    <Caption style={{
                                        color: COLORS.primary,
                                        lineHeight: 14,
                                    }}>Positive Text</Caption>
                                    <View style={{ flexDirection: 'row' }}>
                                        {/* <Button icon={message.type.positiveIcon}></Button> */}
                                        <Subheading style={styles.value}>{message.type.positiveText}</Subheading>
                                    </View>
                                </View> : null
                        }

                        {
                            message.type && message.type.name == "respond" ?
                                <View style={[{ alignSelf: 'flex-start' }, styles.info]}>
                                    <Caption style={{
                                        color: COLORS.primary,
                                        lineHeight: 14,
                                    }}>Negative Text</Caption>
                                    <View style={{ flexDirection: 'row' }}>
                                        {/* <Button icon={{ source: message.type.positiveIcon.replace("far fa-", ""), direction: 'rtl' }}></Button> */}
                                        <Subheading style={styles.value}>{message.type.negativeText}</Subheading>
                                    </View>
                                </View> : null
                        }
                        <UserInfoGridItem label={`Alert sound`} value={`${message.sound_name}`} style={styles.info} />
                        <UserInfoGridItem label={`Language`} value={`${message.language}`} style={styles.info} />
                        {
                            message.type ?
                                <View>
                                    <UserInfoGridItem label={`Alert duration`} value={`${message.reminder} min`} style={styles.info} />
                                    <UserInfoGridItem label={`Notify for no response`} value={`After ${message.admin_reminder} min`} style={styles.info} />
                                </View> : null
                        }

                        {/* <BefrienderButton label={`Edit message`} mode='contained' style={styles.button} /> */}
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => {
    return { message: state.message.message, }
}

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(MessageDetails)
