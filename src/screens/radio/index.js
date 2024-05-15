import React, { Component } from "react";
import { FlatList, View, Text, Image, Alert } from "react-native";
import { IconButton, Paragraph } from "react-native-paper";
import { connect } from "react-redux";
import common_style from "../../common_style";
import BefrienderButton from "../../components/button";
import { setState } from "../../redux/features/radio_slice";
import firestore from "@react-native-firebase/firestore";
import styles from "./styles";
import Loading from '../../components/loading';
class Radio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stations: [],
    }
  }

  componentDidMount() {
    const { contact, setState } = this.props;
    setState({ radios: [], hasLoadingDone: false, error: null });
    this.radiosUnsubscribe = firestore()
      .collection('radio')
      .orderBy("datetime", "desc")
      .onSnapshot(querySnapshot => {
        let radios = [];
        querySnapshot.forEach(documentSnapshot => {
          const data = documentSnapshot.data();
          var checkIsAll = data.is_all;
          if (checkIsAll)
            data.target_user_ids && data.target_user_ids.length == 0 ? checkIsAll = true : checkIsAll = false;
          if (checkIsAll ||
            data.target_user_ids.includes(contact.id)) {
            radios.push({ ...data, id: documentSnapshot.id })
          }
        })
        setState({ radios: radios, hasLoadingDone: true, error: null });
      })

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

  componentWillUnmount() {
    this.radiosUnsubscribe();
    this.radioSourceUnsubscribe();
  }

  onRadioDelete = (radio) => {
    const radioRef = firestore()
      .collection('radio')
      .doc(radio.id)
    if (radio.target_user_ids.length > 1) {
      const { contact } = this.props;
      const updatedTargetList = radio.target_user_ids.filter(t => (contact.id !== t))
      radioRef
        .update({ target_user_ids: updatedTargetList })
        .catch(e => {
          console.error('onRadioDelete remove contact from target user error,', e);
        })
      return;
    }
    radioRef
      .delete()
      .catch(e => {
        console.error('onRadioDelete deleting music doc error,', e);
      })
  }

  confirmDelete = (radio) => {
    Alert.alert(
      "Delete radio?",
      `Are you sure to delete "${radio.name}"?`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            this.onRadioDelete(radio)
          }
        }
      ])
  };

  render() {
    const { radios, hasLoadingDone, error, onAddRadioBtnPress } = this.props;
    const { stations } = this.state;
    let radioList = radios && radios.map(radio => {
      const currentRadio = stations && stations.length > 0 && stations.filter(station => station.id === radio.resource_id)[0]
      let name = currentRadio.radio_name;
      let image = currentRadio.image;
      return {
        ...radio,
        name,
        image
      }
    })

    return (
      <View style={[common_style.body, common_style.root, styles.root]}>
        <BefrienderButton
          onPress={onAddRadioBtnPress}
          label={`Add Radio Station`}
          mode='contained'
          style={styles.button} />
        <View style={styles.list_container}>
          {
            hasLoadingDone ?
              error ? <Paragraph>{error}</Paragraph>
                : (radioList && radioList.length > 0) ?
                  <FlatList
                    style={styles.list}
                    data={radioList && radioList}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => `${index}`}
                    renderItem={(item, index) => (
                      <View
                        key={index}
                        style={{
                          marginTop: 10,
                          marginHorizontal: 16,
                          flexDirection: 'row',
                          alignItems: 'center',
                          // backgroundColor: '#F8FAFB',
                          borderColor: 'black',
                          borderWidth: 1,
                        }}
                      >
                        <View style={{
                          width: 100,
                          height: 70,
                          marginHorizontal: 5,
                          marginVertical: 5,
                        }}>
                          <Image
                            source={item.item.image ? { uri: item.item.image } : require('../../../assets/icons/radio_station.png')}
                            style={{
                              flex: 1,
                              width: '100%',
                              height: '100%',
                              resizeMode: 'contain',
                            }}
                          />
                        </View>

                        <Text numberOfLines={2}
                          style={{
                            flex: 1,
                            color: '#000000',
                            flexShrink: 1
                          }}>
                          {item.item.name}
                        </Text>

                        <View style={{ marginLeft: 'auto' }}>
                          <IconButton icon={`trash-can-outline`} onPress={() => this.confirmDelete(item.item)} />
                        </View>
                      </View>
                    )}
                  />
                  : <Paragraph>{`No radio station yet.`}</Paragraph>
              : <Loading />
          }
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  radios: state.radios.radios,
  hasLoadingDone: state.radios.hasLoadingDone,
  error: state.radios.error,
  contact: state.contact.contact,
});

const mapDispatchToProps = { setState };

export default connect(mapStateToProps, mapDispatchToProps)(Radio);