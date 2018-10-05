import React from 'react';
import { Text, View } from 'react-native';

import * as constants from './utils/constants';
import * as lazada from './utils/lazada';
import * as store from './utils/store';

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
    store.getCreds(constants.NS_LAZADA)
      .then(creds => console.log(creds));
  }

  componentDidMount() {
    loadMovies(json => {
      const credentials = {
        domain: 'https://api.lazada.com.ph/rest',
        appKey: 'the app key',
        appSecret: 'the app secret',
        accessToken: 'test token',
      };
      const endpoint = '/products/get';
      const payload = '';
      const params = {
        'filter': 'all',
        'offset': 0,
        'limit': 10,
      };
      store.setCreds(constants.NS_LAZADA, credentials);

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
