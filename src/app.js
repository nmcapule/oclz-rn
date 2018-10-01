import React from 'react';
import { Text, View } from 'react-native';

import jssha from 'jssha';

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
      const codec = new jssha("SHA-256", "TEXT");
      codec.setHMACKey("abc", "TEXT");
      codec.update(JSON.stringify(json));
      const data = codec.getHMAC("HEX");
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
