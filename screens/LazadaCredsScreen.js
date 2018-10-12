import React from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

import * as constants from '../utils/constants';
import * as store from '../utils/store';

export class LazadaCredsScreen extends React.Component {
  static navigationOptions = {
    title: 'Lazada Creds',
  };

  constructor(props) {
    super(props);
    this.state = {
      creds: null,
      credsSource: '',
      showModal: false,
    };
  }

  async componentDidMount() {
    const creds = await store.getCreds(constants.NS_LAZADA, {
      domain: 'https://api.lazada.com.ph/rest',
      appKey: '',
      appSecret: '',
      accessToken: '',
      boxDocId: '',
    });
    this.setState({ creds });
  }

  async componentWillUnmount() {
    await this.mergeCreds();
  }

  async mergeCreds(dict) {
    const creds = {
      ...this.state.creds,
      ...dict,
    };
    this.setState({ creds });
    await store.setCreds(constants.NS_LAZADA, creds);
  }

  async loadCredsSource() {
    const id = this.state.credsSource;
    const url = `https://docs.google.com/spreadsheets` +
        `/d/e/${id}/pub?gid=0&single=true&output=csv`
    const response = await fetch(url, { mode: 'no-cors' });
    const text = await response.text();
    const [domain, appKey, appSecret, accessToken, boxDocId] = text.split(',');

    await this.mergeCreds({domain, appKey, appSecret, accessToken, boxDocId});
  }

  render() {
    if (!this.state.creds) {
      return (
        <View>
          <Text>Loading state...</Text>
        </View>
      );
    }
    return (
      <View style={{padding: 12}}>
        <Text>Domain</Text>
        <TextInput
          style={styles.input}
          value={this.state.creds.domain}
          onChangeText={text => this.mergeCreds({ domain: text })}
        />
        <Text>App Key</Text>
        <TextInput
          style={styles.input}
          value={this.state.creds.appKey}
          onChangeText={text => this.mergeCreds({ appKey: text })}
        />
        <Text>App Secret</Text>
        <TextInput
          style={styles.input}
          value={this.state.creds.appSecret}
          onChangeText={text => this.mergeCreds({ appSecret: text })}
        />
        <Text>Access Token</Text>
        <TextInput
          multiline={true}
          numberOfLines={4}
          value={this.state.creds.accessToken}
          onChangeText={text => this.mergeCreds({ accessToken: text })}
        />
        <Text>Box Doc Id</Text>
        <TextInput
          style={styles.input}
          value={this.state.creds.boxDocId}
          onChangeText={text => this.mergeCreds({ boxDocId: text })}
        />
        <View style={{marginTop: 64, flexDirection: "row"}}>
          <TextInput
            style={[styles.input, {flex: 1}]}
            onChangeText={credsSource => this.setState({ credsSource })}
          />
          <Button 
            onPress={this.loadCredsSource.bind(this)}
            title="???">
          </Button>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    height: 40,
  },
});
