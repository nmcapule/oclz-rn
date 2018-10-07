import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  createBottomTabNavigator,
} from 'react-navigation';

// import {HomeScreen} from './screens/HomeScreen'
import {LazadaCredsScreen} from './screens/LazadaCredsScreen';
import {OpencartCredsScreen} from './screens/OpencartCredsScreen';
import {ScannerScreen} from './screens/ScannerScreen';
import {LazadaOrdersScreen} from './screens/LazadaOrdersScreen';

const App = createBottomTabNavigator({
  LazadaOrders: { screen: LazadaOrdersScreen },
  // Home: { screen: HomeScreen },
  LazadaCreds: { screen: LazadaCredsScreen },
  OpencartCreds: { screen: OpencartCredsScreen },
  Scanner: { screen: ScannerScreen },
});

export default App;
