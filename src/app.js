import React from 'react';
import { Text, View } from 'react-native';

import * as nacl from 'tweetnacl-util';
import * as sha256 from 'fast-sha256';

function loadMovies(cb) {
  fetch('https://facebook.github.io/react-native/movies.json')
      .then(response => response.json())
      .then(json => cb(json));
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data:'',
    };
  }

  componentDidMount() {
    loadMovies(json => {
      const strjson = JSON.stringify(json);
      const utf8in = nacl.decodeUTF8(strjson);
      const utf8out = sha256.hmac('mahkey', utf8in)
      // const data = nacl.encodeUTF8(utf8out);

      this.setState({data: utf8out});
    });
  }

  render() {
    return (
      <View>
        <Text>{this.state.data}</Text>
      </View>
    );
  }
}
