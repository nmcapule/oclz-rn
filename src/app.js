import {
  createStackNavigator,
} from 'react-navigation';

import {HomeScreen} from './screens/home_screen';
import {LazadaCredsScreen} from './screens/lazada_creds_screen';

const App = createStackNavigator({
  Home: { screen: HomeScreen },
  LazadaCreds: { screen: LazadaCredsScreen },
});

export default App;