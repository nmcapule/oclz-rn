import React from 'react';
import moment from 'moment';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

import * as constants from '../utils/constants';
import * as lazada from '../utils/lazada';
import * as store from '../utils/store';

export class LazadaOrdersScreen extends React.Component {
  static navigationOptions = {
    title: 'Lazada Orders',
  };

  constructor(props) {
    super(props);
    this.state = {
      credentials: null,
      lastNdays: 1,
      orders: null,
      ordersItems: null,
    };
  }

  componentDidMount() {
    (async () => {
      const credentials = await store.getCreds(constants.NS_LAZADA);
      this.setState({ credentials });

      await this._loadOrders();
      await this._loadOrdersItems();
      await this._attachOrdersItems();
    })();
  }

  async _loadOrders() {
    const { credentials, lastNdays } = this.state;
    const orders = await lazada.getActiveOrders(credentials, {
      ['created_after']: moment()
        .subtract(lastNdays, 'days')
        .toISOString(),
    });
    this.setState({ orders });
  }

  async _loadOrdersItems() {
    const BATCH_SIZE = 20;
    const { credentials, orders } = this.state;
    const orderIds = orders.map(order => order.id);

    let ordersItems = {};
    for (let i = 0; i < orderIds.length; i += BATCH_SIZE) {
      const batchIds = orderIds.slice(i, i + BATCH_SIZE);
      const batchItems = await lazada.getOrdersItems(credentials, batchIds);
      ordersItems = {
        ...ordersItems,
        ...batchItems,
      };
    }

    this.setState({ ordersItems });
  }

  async _attachOrdersItems() {
    const { orders, ordersItems } = this.state;
    if (!orders || !ordersItems) {
      return;
    }

    const updatedOrders = orders.map(order => ({
      ...order,
      items: ordersItems[order.id],
    }));

    this.setState({ orders: updatedOrders });
  }

  _keyExtractor({ id }) {
    return String(id);
  }

  _renderItem({ item, separators }) {
    const date = moment(item.created).format('MMM D, YYYY - hh:mmA');
    let itemIndicator = 'Loading... Please wait...';
    if (item.items) {
      itemIndicator = `(${item.items.length}) ${item.items.join(', ')}`;
    }

    return (
      <TouchableHighlight
        style={styles.item}
        onShowUnderlay={separators.highlight}
        onHideUnderlay={separators.unhighlight}
      >
        <View>
          <Text>Created On: {date}</Text>
          <Text>ID: {item.id}</Text>
          <Text>Customer: {item.customer}</Text>
          <Text>Status: {item.status}</Text>
          <Text>Items: {itemIndicator}</Text>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    if (!this.state.orders) {
      return (
        <View>
          <Text>Loading orders...</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.orders}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#efefef',
    padding: 4,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 10,
    margin: 4,
  },
});
