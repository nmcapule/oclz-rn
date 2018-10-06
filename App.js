import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  createStackNavigator,
} from 'react-navigation';

import {HomeScreen} from './screens/HomeScreen'
import {LazadaCredsScreen} from './screens/LazadaCredsScreen';
import {OpencartCredsScreen} from './screens/OpencartCredsScreen';

const App = createStackNavigator({
  Home: { screen: HomeScreen },
  LazadaCreds: { screen: LazadaCredsScreen },
  OpencartCreds: { screen: OpencartCredsScreen },
});

export default App;
