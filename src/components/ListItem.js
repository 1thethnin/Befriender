/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Caption, Checkbox, IconButton, Subheading, TouchableRipple, withTheme } from 'react-native-paper';
import { COLORS } from '../Consts';
import { calculateAge } from '../services/utils';
import { useSelector } from 'react-redux';

function ListItem({
    user,
    gender,
    name,
    img,
    _onCheckChange,
    _onPress,
    isChecked,
    onCallBtnPressed,
}) {
    const [check, setCheck] = useState(isChecked);
    const showCheckbox = useSelector((state) => state.home.showCheckbox)

    useEffect(() => {
        setCheck(isChecked);
    }, [isChecked]);

    var imageSource = {};
    if (img && typeof img === 'string') {
        imageSource = { uri: img };
    }

    return (
        <View style={styles.container}>
            {
                showCheckbox ?
                    <View style={styles.checkbox}>
                        <Checkbox.Android
                            status={check ? 'checked' : 'unchecked'}
                            color={COLORS.primary}
                            onPress={() => _onCheckChange(user)}
                        />
                    </View>
                    : null
            }

            <View
                style={styles.body}>
                <TouchableRipple
                    style={styles.content}
                    borderless={true}
                    rippleColor={COLORS.primary}
                    onPress={() => {
                        _onPress(user)
                    }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Avatar.Image source={imageSource} />
                        <View style={styles.textContainer}>
                            <Subheading style={styles.text}>
                                {gender} {name}
                            </Subheading>
                            <Caption numberOfLines={1} style={styles.captions}>
                                {`Age: ${user.date_of_birth ? calculateAge(user.date_of_birth.toDate()) : 'N/A'}`}
                            </Caption>
                            <Caption numberOfLines={1} style={styles.captions}>
                                {user.address || 'No address'}
                            </Caption>
                        </View>
                    </View>
                </TouchableRipple>
                <IconButton
                    style={styles.singleCall}
                    icon={'phone'}
                    centered
                    onPress={() => onCallBtnPressed(user)}
                    color={COLORS.primary} />
            </View>
        </View>
    );
}

export default withTheme(ListItem)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: 8,
        marginRight: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    body: {
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: '#C9CDEB',
        backgroundColor: 'white',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingStart: 16,
        paddingVertical: 16,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    textContainer: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    text: {
        fontWeight: '500',
        color: COLORS.primary,
    },
    captions: { lineHeight: 14 },
    checkbox: {
        marginEnd: 8,
    },
    singleCall: {
        transform: [{ rotateY: '180deg' }],
    },
});
