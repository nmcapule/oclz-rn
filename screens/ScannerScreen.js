import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BarCodeScanner, Permissions } from 'expo';

export class ScannerScreen extends React.Component {
  state = {
    hasCameraPermission: null,
    type: null,
    data: null,
    box: '',
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  render() {
    const { hasCameraPermission } = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    return (
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <View>
          <BarCodeScanner
            onBarCodeScanned={this.handleBarCodeScanned}
            style={{height: 400}}
          />
        </View>
        <View>
          <Text>SKU: {this.state.data}</Text>
          <Text>Box: {this.state.box}</Text>
        </View>
      </View>
    );
  }

  handleBarCodeScanned = ({ type, data }) => {
    let box = 'Unknown Box';
    const lookup = this.props.navigation.getParam('lookup', {});
    if (lookup) {
      box = lookup[data];
    }
    this.setState({ type, data, box });
  };
}
