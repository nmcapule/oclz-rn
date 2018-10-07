import React from 'react';
import { Button, Text, View } from 'react-native';
import moment from 'moment';

import * as constants from '../utils/constants';
import * as lazada from '../utils/lazada';
import * as opencart from '../utils/opencart';
import * as store from '../utils/store';

async function loadMovies(cb) {
  const response = await fetch(
    'https://facebook.github.io/react-native/movies.json'
  );
  const json = await response.json();
  cb(json);
}

export class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Welcome',
  };

  constructor(props) {
    super(props);
    this.state = {
      data: '',
    };
  }

  componentDidMount() {
    loadMovies(async json => {
      // const credentials = {
      //   domain: 'https://api.lazada.com.ph/rest',
      //   appKey: '',
      //   appSecret: '',
      //   accessToken: '',
      // };
      // store.setCreds(constants.NS_LAZADA, credentials);

      // const params = {
      //   ['filter']: 'all',
      //   ['offset']: 0,
      //   ['limit']: 100,
      // };
      // const endpoint = '/products/get';
      // const response = await lazada.request(credentials, endpoint, params)
      // console.log(response);

      // const products = await lazada.getProducts(credentials);
      // console.log(products.filter(p => !p.model));

      // const orders = await lazada.getActiveOrders(credentials, {
      //   ['created_after']: moment().subtract(1, 'days').toISOString(),
      // });
      // const orderIds = orders.map(order => order.id);
      // console.log(orderIds);
      // const items = await lazada.getOrdersItems(credentials, orderIds);
      // console.log(items);

      // const credentials = {
      //   domain: 'http://ohno',
      //   username: 'ohno',
      //   password: 'apassword!',
      // };
      // opencart
      //     .request(credentials, 'module/store_sync/listlocalproducts')
      //     .then(response => console.log(response));
      //
      // const products = await opencart.loadProducts(credentials);
      // console.log(products);

      const data = 'check me out';
      this.setState({ data });
    });
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <Text>{this.state.data}</Text>
        <Button title="Lazada Config" onPress={() => navigate('LazadaCreds')} />
        <Button
          title="Opencart Config"
          onPress={() => navigate('OpencartCreds')}
        />
        <Button
          title="BarCode Scanner Playground"
          onPress={() => navigate('Scanner')}
        />
      </View>
    );
  }
}
