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
      const credentials = {
        domain: 'https://api.lazada.com.ph/rest',
        appKey: 'the app key',
        accessToken: 'test token',
      };
      const endpoint = '/products/get';
      const payload = '';
      const params = {
        'filter': 'all',
        'offset': 0,
        'limit': 10,
      };

      lazada.request(credentials, endpoint, payload, params)
          .then(response => console.log(response));

      const data = 'check me out';
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
