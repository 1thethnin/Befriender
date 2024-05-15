import React, { Component } from 'react';
import { Alert, View, Image, ScrollView } from 'react-native';
import { HelperText } from 'react-native-paper';
import BefrienderButton from '../../components/button';
import { BefrienderDropdown } from '../../components/dropdown'
import SheetHeader from '../header';
import firestore from '@react-native-firebase/firestore';
import styles from './styles';
import { connect } from 'react-redux';
import common_style from '../../common_style';

class AddRadio extends Component {

    constructor(props) {
        super(props)
        this.state = {
            stations: [],
            stationNames: [],
            stationName: "",
            radioLogo: "",
            isUpdating: false,
            stationNameError: null,
            selectedId: ""
        }
    }

    componentDidMount() {
        this.radioSourceUnsubscribe = firestore()
            .collection('radio_source')
            .onSnapshot(querySnapshot => {
                let stations = [];
                let stationNames = [];
                querySnapshot.forEach(documentSnapshot => {
                    stations.push({ ...documentSnapshot.data(), id: documentSnapshot.id })
                    stationNames.push(documentSnapshot.data().radio_name)
                })
                this.setState({ stations, stationNames })
            })
    }

    stationNameChange = (newStation) => {
        this.setState({ stationName: newStation, stationNameError: "" })
        const { stations } = this.state;
        stations.forEach(station => {
            if (newStation == station.radio_name) {
                this.setState({ selectedId: station.id })
            }
        })
    }

    componentWillUnmount() {
        this.radioSourceUnsubscribe();
    }

    confirmRadioCreate = () => {
        const { isUpdating, stationName } = this.state;
        if (isUpdating) { return; }
        if (!stationName) {
            this.setState({ stationNameError: "Station Name is required!" })
            return false
        }

        Alert.alert(
            'Update',
            'Are you sure to Create Radio Station?',
            [
                {
                    text: 'No',
                    onPress: () => { },
                },
                {
                    text: 'Yes',
                    onPress: () => { this.addNewRadioStation() },
                }
            ])
    }

    addNewRadioStation = async () => {
        const { stations, stationName } = this.state;
        const { onClose, contact, radios } = this.props
        this.setState({ isUpdating: true })

        let radio_url = "";
        let radio_icon = "";
        let resource_id = "";
        stations.forEach(station => {
            if (stationName == station.radio_name) {
                radio_url = station.radio_url;
                radio_icon = station.image;
                resource_id = station.id
            }
        })

        let radio_ids = [];
        radios.forEach(radio => {
            radio_ids.push(radio.resource_id);
        })
        if (radio_ids.includes(this.state.selectedId)) {
            alert('Radio Station is already exist!')
            this.setState({ isUpdating: false, stationName: null })
            return false;
        }

        firestore()
            .collection('radio')
            .add({
                datetime: new Date(),
                is_all: false,
                radio_name: "",
                radio_icon: "",
                radio_url: "",
                resource_id: resource_id,
                target_user_ids: [contact.id],
            })
            .then(() => {
                this.setState({ isUpdating: false })
                onClose()
            })
            .catch(e => {
                this.setState({ isUpdating: false })
            })

    }
    render() {
        const { onClose } = this.props
        const { isUpdating, stationNames, stationNameError, stations, stationName } = this.state;

        let radio_icon = "";
        stations.forEach(station => {
            if (stationName == station.radio_name) {
                radio_icon = station.image;
            }
        })
        return (
            <View style={[common_style.root, styles.root]}>
                <ScrollView style={styles.body}>
                    <SheetHeader title={`Add Radio Station`} onClose={onClose} />
                    <BefrienderDropdown
                        style={[styles.row]}
                        label={`Station Name`}
                        value={stationName}
                        onChange={this.stationNameChange}
                        menu={stationNames && stationNames}
                    />
                    {
                        stationNameError ?
                            <HelperText
                                style={[styles.content_row, styles.helper_text]}
                                type='error'>
                                {stationNameError}
                            </HelperText>
                            : null
                    }

                    {
                        stationName ?
                            <View style={{ width: '90%', height: 200, marginHorizontal: 16, marginVertical: 20 }}>
                                <Image source={{ uri: radio_icon }} style={{
                                    flex: 1,
                                    width: '100%',
                                    height: '100%',
                                    resizeMode: 'contain',
                                }} />
                            </View>
                            : null
                    }

                </ScrollView>
                <View style={styles.button_container}>
                    <BefrienderButton
                        label='Cancel'
                        style={styles.button}
                        mode='outlined'
                        onPress={onClose} />
                    <BefrienderButton
                        disabled={isUpdating ? true : false}
                        label='Add'
                        style={styles.button}
                        mode='contained'
                        onPress={this.confirmRadioCreate}
                        loading={isUpdating} />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    contact: state.contact.contact,
    radios: state.radios.radios,
})

export default connect(mapStateToProps)(AddRadio)
