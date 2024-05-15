import React, { Component } from 'react'
import PropTypes from 'prop-types'
import firestore from '@react-native-firebase/firestore'
import { connect } from 'react-redux'
import { View } from 'react-native'
import common_style from '../../common_style'
import Tick from '../../components/Tick'
import BefrienderButton from '../../components/button'
import styles from './styles'
import { Text } from 'react-native-paper'
import Toolbar from "../../components/Toolbar";
import Consts from '../../Consts'
import { showErrorDialog } from '../../services/utils'
import { doLogout } from '../my_profile'

class Success extends Component {
    static propTypes = {
        user: PropTypes.object
    }

    state = {
        loading: false,
    }

    finalizePasswordReset = async () => {
        const { user } = this.props
        const { loading } = this.state
        if (loading) return
        this.setState({ loading: true })
        try {
            //logout user
            doLogout(user)
        } catch (e) {
            showErrorDialog({ title: 'Error', msg: e.message, action: 'OK' })
        }
        this.setState({ loading: false })
    }

    render() {
        const { loading } = this.state
        return (
            <View style={[common_style.root, styles.root]}>
                <Toolbar {...this.props} title={'Reset password'} />
                <View style={styles.content}>
                    <View style={styles.icon_background}>
                        <Tick style={styles.icon} />
                    </View>
                    <Text style={styles.message}>{'Your password has been\nchanged successfully.'}</Text>
                </View>
                <BefrienderButton
                    loading={loading}
                    style={styles.button}
                    content_style={styles.button_content}
                    icon='arrow-right'
                    label={'Continue to login'}
                    mode="contained"
                    onPress={this.finalizePasswordReset}
                />
            </View>
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.user.user,
})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(Success)
