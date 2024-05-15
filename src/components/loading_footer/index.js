import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { View } from 'react-native'
import styles from './styles'
import Loading from '../loading'
import { withTheme } from 'react-native-paper'

class LoadingFooter extends Component {
    static propTypes = {
        isLoading: PropTypes.bool,
    }

    render() {
        const { isLoading } = this.props
        return (
            <View style={styles.root}>
                {
                    isLoading
                        ? <Loading />
                        : null
                }
            </View>
        )
    }
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(LoadingFooter))
