import React from 'react';
import { Text, View } from 'react-native';

function loadMovies(cb) {
  fetch('https://facebook.github.io/react-native/movies.json')
      .then(response => response.json())
      .then(json => cb(json));
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {ohshit:''};
  }

  componentDidMount() {
    loadMovies(json => this.setState({ohshit: JSON.stringify(json)}));
  }

  render() {
    return (
      <View>
        <Text>{this.state.ohshit}</Text>
      </View>
    );
  }
}
