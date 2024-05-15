import React, { Component } from "react";
import { View, Image, FlatList, Dimensions } from "react-native";
import { withTheme } from "react-native-paper";
import styles from "./styles";
import ImagePicker from "react-native-image-crop-picker";
import BefrienderButton from "../button";
import Toast from "react-native-toast-message";
import { connect } from "react-redux";

const Width = Dimensions.get("window").width;
const IMAGE_PICKER_OPTIONS = {
  mediaType: "photo",
  cropping: false,
  includeBase64: true,
  multiple: true,
};
class ChoosePhoto extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageSources: [],
    };
    this.fileNames = [];
  }

  componentDidMount() {
    const { photos } = this.props;
    photos.forEach((photo) => {
      this.fileNames.push(photo.filename);
    });
  }

  checkDuplicatePhoto = (newFile, { isArray = false } = {}) => {
    let filePath = newFile.path.split("/");
    let newFileName = filePath[filePath.length - 1];

    if ((this.fileNames || []).includes(newFileName)) {
      if (!isArray) {
        Toast.show({
          type: "info",
          text1: "Duplicate photo!",
          text2: `${newFileName} is already exist, and skipped.`,
        });
      }
      return false;
    }
    return true;
  };

  pickImage = () => {
    const { onImageChange } = this.props;
    ImagePicker.openPicker(IMAGE_PICKER_OPTIONS)
      .then((image) => {
        onImageChange(this.setImagePreview({ image }));
      })
      .catch((e) => {
        console.log(e.message);
      });
  };

  captureImage = () => {
    const { onImageChange } = this.props;
    ImagePicker.openCamera(IMAGE_PICKER_OPTIONS)
      .then((image) => {
        onImageChange(this.setImagePreview({ image }));
      })
      .catch((e) => {
        console.log(e.message);
      });
  };

  setImagePreview = ({ image } = {}) => {
    var imageSource = {};
    var newImageSources = this.state.imageSources || [];
    if (image) {
      if (Array.isArray(image)) {
        let isThereAnySkippedFile = false;
        image.forEach((img) => {
          if (this.checkDuplicatePhoto(img, { isArray: true }) === true) {
            imageSource = { uri: `data:${img.mime};base64,${img.data}` };
            newImageSources.forEach((newImg) => {
              var imgSource = {
                uri: `data:${newImg.mime};base64,${newImg.data}`,
              };
              if (imgSource.uri == imageSource.uri) {
                isThereAnySkippedFile = true;
              }
            });
            if (isThereAnySkippedFile) {
            } else {
              newImageSources.push({ url: imageSource, ...img });
            }
            // newImageSources.push({ url: imageSource, ...img });
          } else {
            isThereAnySkippedFile = true;
          }
        });
        if (isThereAnySkippedFile) {
          Toast.show({
            type: "info",
            text1: "Duplicate photo!",
            text2: `Some file(s) are already exist, and skipped.`,
          });
        }
      } else if (this.checkDuplicatePhoto(image) === true) {
        imageSource = { uri: `data:${image.mime};base64,${image.data}` };
        newImageSources.push({ url: imageSource, ...image });
      }
    }
    this.setState({ newImageSources });
    return newImageSources;
  };

  render() {
    const { imageSources } = this.state;
    const { isUpdating } = this.props;
    return (
      <View style={styles.root}>
        <View style={styles.picker_btn_container}>
          <BefrienderButton
            disabled={isUpdating ? true : false}
            onPress={this.captureImage}
            label={`Camera`}
            mode="contained"
            icon="camera"
            style={styles.button}
          />
          <View style={styles.btn_divider} />
          <BefrienderButton
            disabled={isUpdating ? true : false}
            onPress={this.pickImage}
            label={`Gallery`}
            mode="contained"
            icon="image"
            style={styles.button}
          />
        </View>
        <FlatList
          numColumns={2}
          data={imageSources || []}
          keyExtractor={(_item, index) => `${index}`}
          renderItem={({ item, index }) => {
            const isEven = index % 2 === 0;
            return (
              <Image
                key={index}
                source={item.url}
                style={{
                  height: Width / 2 - 40,
                  flex: 0.5,
                  marginLeft: isEven ? 12 : 6,
                  marginRight: isEven ? 6 : 12,
                  marginBottom: 12,
                }}
              />
            );
          }}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  photos: state.photos.photos,
});

export default connect(mapStateToProps)(withTheme(ChoosePhoto));
