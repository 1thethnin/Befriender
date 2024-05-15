import React, { Component } from 'react'
import { connect } from 'react-redux'
import { KeyboardAvoidingView, Platform, Alert, Image, View, ScrollView } from 'react-native'
import Toolbar from '../../components/Toolbar'
import styles from './styles'
import common_style from '../../common_style'
import { withTheme, HelperText } from 'react-native-paper'
import BefrienderButton from '../../components/button'
import { BefrienderDropdown } from '../../components/dropdown'
import { SafeAreaView } from 'react-native-safe-area-context'
import firestore from '@react-native-firebase/firestore'
import { removeRadio } from '../../redux/features/radio_slice'
import { showErrorDialog } from '../../services/utils';

class EditRadio extends Component {
  constructor(props) {
    super(props);
    const { radio } = props.route.params;
    this.state = {
      stationName: radio.radio_name,
      stationLogo: radio.radio_icon,
      org_stationName: radio.radio_name,
      stationLogoError: "",
      stationNameError: "",
      stations: [],
      stationNames: [],
      isUpdating: false,
    }
  }

  componentDidMount() {
    const { contact } = this.props;
    this.radioSourceUnsubscribe = firestore()
      .collection('radio_source')
      .where("language", "==", contact.preferred_language)
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

  componentWillUnmount() {
    this.radioSourceUnsubscribe();
  }

  onStationNameChange = (newStationName) => {
    this.setState({ stationName: newStationName, stationNameError: null })
    const { stations } = this.state;
    stations.forEach(station => {
      if (newStationName == station.radio_name) {
        this.setState({ stationLogo: station.image })
      }
    })
  }

  confirmToUpdate = () => {
    const { isUpdating, stationName, org_stationName } = this.state;

    if (isUpdating) return

    if (stationName == org_stationName) {
      this.setState({ stationNameError: "New Station Name is required!" })
      return false
    }

    Alert.alert(
      'Update',
      'Are you sure to Update Radio Station?',
      [
        {
          text: 'No',
          onPress: () => { },
        },
        {
          text: 'Yes',
          onPress: () => { this.updateRadio() },
        }
      ])
  }

  updateRadio = async () => {
    const { isUpdating, stationName, language, stations } = this.state;
    const { radio } = this.props.route.params;
    const { radios } = this.props;
    if (isUpdating) return;
    this.setState({ isUpdating: true })

    let radio_url = "";
    let radio_icon = "";
    stations.forEach(station => {
      if (stationName == station.radio_name) {
        radio_url = station.radio_url;
        radio_icon = station.image;
      }
    })

    let names = [];
    radios.forEach(radio => {
      names.push(radio.radio_name);
    })
    if (names.includes(stationName)) {
      alert('Radio Station is already exist!')
      this.setState({ isUpdating: false, stationName: null })
      return false;
    }

    const updatedRadio = {
      radio_name: stationName,
      radio_icon,
      radio_url,
    }

    firestore()
      .collection('radio')
      .doc(radio.id)
      .update(updatedRadio)
      .catch(e => {
        this.setState({ isUpdating: false })
        console.error('Edit Radio, ', e);
        showErrorDialog({
          title: "Error",
          msg: 'Sorry, there was error, while trying to update Radio.',
          action: 'OK',
        })
      })
    this.setState({ isUpdating: false })
    this.props.navigation.navigate("Radio");
  }

  render() {
    const { stationName, isUpdating, stationNameError, stationNames, stationLogo } = this.state

    return (
      <SafeAreaView style={[common_style.root, styles.root]}>
        <KeyboardAvoidingView
          style={styles.root}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 20}
          behavior={Platform.OS === 'ios' ? "padding" : 'height'}
        >
          <Toolbar {...this.props} title={'Edit Radio'} />
          <ScrollView style={styles.content}>
            <BefrienderDropdown
              style={[styles.row]}
              label={`Station Name`}
              value={stationName}
              onChange={this.onStationNameChange}
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
                  <Image source={{ uri: stationLogo }} style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    resizeMode: 'contain',
                  }} />
                </View>
                : null
            }
          </ScrollView>
          {/* {
            stationLogo ?
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: '90%', height: 200 }}>
                  <Image source={{ uri: editLogo ? `data:${stationLogo && stationLogo.mime};base64,${stationLogo && stationLogo.data}` : stationLogo }} style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    resizeMode: 'contain',
                  }} />
                </View>
              </View>
              : null
          }

          <BefrienderButton
            onPress={this.pickImage}
            label={`Choose Station Logo`}
            mode='contained'
            style={{ marginHorizontal: 16, marginTop: 20 }} />
          {
            stationLogoError ?
              <HelperText
                style={[styles.content_row, styles.helper_text]}
                type='error'>
                {stationLogoError}
              </HelperText>
              : null
          }
          <BefrienderDropdown
            style={[styles.row]}
            label={`Station Name`}
            value={stationName && stationName}
            onChange={this.onStationNameChange}
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
          } */}
          <BefrienderButton
            disabled={isUpdating ? true : false}
            style={styles.button}
            onPress={this.confirmToUpdate}
            label={'Save'}
            loading={isUpdating}
            mode="contained"
          />

        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }
}
const mapStateToProps = (state) => {
  return {
    contact: state.contact.contact,
    radios: state.radios.radios,
  }
};

const mapDispatchToProps = {
  removeRadio
}

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(EditRadio))
