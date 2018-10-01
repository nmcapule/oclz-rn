import React from 'react';
import { Text, View } from 'react-native';

import * as lazada from './utils/lazada';

async function loadMovies(cb) {
  const response = await fetch('https://facebook.github.io/react-native/movies.json')
  const json = await response.json();
  cb(json);
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
      const secret = 'mysecret';
      const api = '/HelloAPI';
      const params = {
        'this': 'is',
        'my': 'test params',
      };

      const data = lazada.sign(secret, api, params);
      this.setState({data});
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
