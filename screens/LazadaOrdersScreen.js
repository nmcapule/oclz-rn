import React from 'react';
import moment from 'moment';
import {
  Alert,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

import * as constants from '../utils/constants';
import * as lazada from '../utils/lazada';
import * as store from '../utils/store';
import { TEMPORARY_BOX_LOOKUP as tmpBox } from '../utils/boxmap';

export class LazadaOrdersScreen extends React.Component {
  static navigationOptions = {
    title: 'Lazada Orders',
  };

  constructor(props) {
    super(props);
    this.state = {
      credentials: null,
      lastNdays: 7,
      orders: null,
      ordersItems: null,
      sections: null,
      refreshing: false,
    };

    this.refreshSub = null;
  }

  async componentDidMount() {
    this.refreshSub = this.props.navigation.addListener(
      'willFocus',
      this._refresh.bind(this)
    );
  }

  async componentWillUnmount() {
    this.refreshSub.remove();
  }

  async _refresh() {
    const credentials = await store.getCreds(constants.NS_LAZADA);
    this.setState({ credentials });
    this.setState({ refreshing: true });

    try {
      await this._loadOrders();
      this._attachOrdersItems();
      this._computeSectionedOrders();

      await this._loadOrdersItems();
      this._attachOrdersItems();
      this._computeSectionedOrders();
    } catch (e) {
      console.warn(
        'Invalid credentials. Please input correct Lazada credentials.'
      );
      this.props.navigation.navigate('LazadaCreds');
    }

    this.setState({ refreshing: false });
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

  /** Merges orders and ordersItems as orders.items. */
  _attachOrdersItems() {
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

  /** Returns sections for state.orders with created date as section title. */
  _computeSectionedOrders() {
    const sectionsTable = {};
    for (const order of this.state.orders) {
      const title = moment(order.created).format('MMM D, YYYY');
      const data = sectionsTable[title] || [];
      sectionsTable[title] = [...data, order];
    }

    const sections = Object.entries(sectionsTable).map(([title, data]) => ({
      title: `${title} (${data.length} orders)`,
      data,
    }));
    this.setState({ sections });
  }

  _keyExtractor({ id }) {
    return String(id);
  }

  _renderItem({ item, separators }) {
    return <OrderContainer item={item} />;
  }

  _renderSectionHeader({ section: { title } }) {
    return <Text style={{ fontWeight: 'bold' }}>{title}</Text>;
  }

  render() {
    if (!this.state.sections) {
      return (
        <View>
          <Text>Loading orders...</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <SectionList
          sections={this.state.sections}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
          renderSectionHeader={this._renderSectionHeader}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._refresh.bind(this)}
            />
          }
        />
      </View>
    );
  }
}

class OrderContainer extends React.PureComponent {
  _onPress() {
    Alert.alert(
      `Order ${this.props.item.id}`,
      this.props.item.items
        .map(v => `${v}: @box "${tmpBox[v] || '<unknown box>'}"`)
        .join('\n')
    );
  }

  render() {
    const { item } = this.props;

    const time = moment(item.created).format('hh:mmA');
    const itemCount = item.items ? item.items.length : '?';
    const itemStrs = item.items ? item.items.join(', ') : '---';

    let statusStyle = [styles.itemStatus];
    let statusColor = '#fff';
    switch (item.status) {
      case 'shipped':
        statusStyle = [...statusStyle, styles.itemStatusShipped];
        break;
      case 'pending':
        statusStyle = [...statusStyle, styles.itemStatusPending];
        statusColor = '#000';
        break;
      default:
        statusStyle = [...statusStyle, styles.itemStatusCancelled];
    }

    return (
      <TouchableHighlight
        style={styles.item}
        onPress={this._onPress.bind(this)}
      >
        <View>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text style={styles.itemID}>
              {time} @{item.id}
            </Text>
            <View style={statusStyle}>
              <Text style={{ color: statusColor, textAlign: 'center' }}>
                {item.status}
              </Text>
            </View>
          </View>
          <Text>{item.customer}</Text>
          <View>
            <Text>
              {itemCount} item/s: {itemStrs}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
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
  itemID: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  itemStatus: {
    borderRadius: 4,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  itemStatusShipped: {
    backgroundColor: '#1b5e20',
  },
  itemStatusPending: {
    backgroundColor: '#ffff8d',
  },
  itemStatusCancelled: {
    backgroundColor: '#e65100',
  },
});
