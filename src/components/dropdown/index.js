import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { View } from 'react-native'
import { Menu, Text, TextInput, withTheme } from 'react-native-paper'
import styles from './styles'
import BefrienderButton from '../button'
import { INPUT_THEME } from '../../Consts'

export class BefrienderDropdown extends Component {
    static propTypes = {
        // value: PropTypes.oneOf([object, PropTypes.string]),
        label: PropTypes.string,
        onChange: PropTypes.func,
        menu: PropTypes.array,
        getValue: PropTypes.func,
        getLabel: PropTypes.func,
    }

    constructor(props) {
        super(props)
        this.state = {
            visible: false,
        }
    }

    showMenu = () => {
        this.setState({ visible: true })
    }

    onValueChange = (s) => {
        this.setState({ visible: false })
        const { onChange } = this.props
        onChange && onChange(s)
    }

    onMenuDismiss = () => {
        this.setState({ visible: false })
    }

    render() {
        const { visible } = this.state
        const { label, menu, style, getLabel, getValue, value } = this.props
        return (
            <View style={[style, styles.root]}>
                <TextInput
                    style={styles.input}
                    value={(getLabel && getLabel(value)) || value}
                    label={label}
                    mode='outlined'
                    editable={false}
                    theme={INPUT_THEME}
                    right={<TextInput.Icon name="menu-down" />}
                />
                <View style={styles.content} >
                    <Menu
                        anchor={
                            <BefrienderButton
                                style={styles.overlay}
                                content_style={{ padding: Platform.OS === 'android' ? 10 : 13 }}
                                onPress={this.showMenu}
                            />
                        }
                        visible={visible}
                        onDismiss={this.onMenuDismiss}
                    >
                        {
                            (menu || []).map(s => (
                                <Menu.Item
                                    key={(getValue && getValue(s)) || s}
                                    title={<Text>{(getLabel && getLabel(s)) || s}</Text>}
                                    onPress={() => this.onValueChange(s)}
                                />
                            ))
                        }
                    </Menu>
                </View>
            </View>
        )
    }
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(BefrienderDropdown))
