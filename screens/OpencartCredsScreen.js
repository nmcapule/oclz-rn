import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import * as constants from '../utils/constants';
import * as store from '../utils/store';

export class OpencartCredsScreen extends React.Component {
  static navigationOptions = {
    title: 'Input Opencart Credentials',
  };

  constructor(props) {
    super(props);
    this.state = {
      creds: null,
    };
  }

  componentDidMount() {
    (async () => {
      const creds = await store.getCreds(constants.NS_OPENCART, {
        domain: '',
        username: '',
        password: '',
      });
      this.setState({ creds });
    })();
  }

  mergeCreds(dict) {
    const creds = {
      ...this.state.creds,
      ...dict,
    };
    this.setState({ creds });
    store.setCreds(constants.NS_OPENCART, creds);
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
        <Text>Username</Text>
        <TextInput 
            style={styles.input} 
            value={this.state.creds.username}
            onChangeText={(text) => this.mergeCreds({username: text})}/>
        <Text>Password</Text>
        <TextInput 
            style={styles.input} 
            value={this.state.creds.password}
            onChangeText={(text) => this.mergeCreds({password: text})}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    height: 40,
  },
});