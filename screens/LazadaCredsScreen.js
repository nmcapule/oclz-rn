import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import * as constants from '../utils/constants';
import * as store from '../utils/store';

export class LazadaCredsScreen extends React.Component {
  static navigationOptions = {
    title: 'Input Lazada Credentials',
  };

  constructor(props) {
    super(props);
    this.state = {
      creds: {},
    };
  }

  componentDidMount() {
    (async () => {
      const creds = await store.getCreds(constants.NS_LAZADA);
      this.setState({ creds });
    })();
  }

  mergeCreds(dict) {
    const creds = {
      ...this.state.creds,
      ...dict,
    };
    this.setState({ creds });
    store.setCreds(constants.NS_LAZADA, creds);
  }

  render() {
    if (!this.state.creds) {
      return (<View><Text>Loading state...</Text></View>);
    }
    return (
      <View>
        <Text>Domain</Text>
        <TextInput 
            style={styles.input} 
            value={this.state.creds.domain}
            onChangeText={(text) => this.mergeCreds({domain: text})}/>
        <Text>App Key</Text>
        <TextInput 
            style={styles.input} 
            value={this.state.creds.appKey}
            onChangeText={(text) => this.mergeCreds({appKey: text})}/>
        <Text>App Secret</Text>
        <TextInput 
            style={styles.input} 
            value={this.state.creds.appSecret}
            onChangeText={(text) => this.mergeCreds({appSecret: text})}/>
        <Text>Access Token</Text>
        <TextInput 
            style={styles.input} 
            value={this.state.creds.accessToken}
            onChangeText={(text) => this.mergeCreds({accessToken: text})}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    height: 40,
  },
});