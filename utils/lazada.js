import jssha from 'jssha';
import moment from 'moment';

// Used lazada endpoints.
const ENDPOINT_ORDERS = '/orders/get';
const ENDPOINT_ORDERS_ITEMS = '/orders/items/get';
const ENDPOINT_PRODUCTS = '/products/get';

// Default offset and limits consts.
const LIMIT = 50;

/**
 * Generates the sign for the input request to Lazada Open API.
 * @param  {string} secret   The app secret.
 * @param  {string} endpoint The endpoint the request is made for.
 * @param  {Object} params   Request parameters.
 * @return {string}          Generated hex-encoded signature.
 */
export function sign(secret, endpoint, params) {
  const keys = Object.keys(params).sort();
  const pairs = keys.map(key => `${key}${params[key]}`);
  const concatenated = `${endpoint}${pairs.join('')}`;

  const codec = new jssha('SHA-256', 'TEXT');
  codec.setHMACKey(secret, 'TEXT');
  codec.update(concatenated);

  return codec.getHMAC('HEX').toUpperCase();
}

/**
 * Initiates a request to Lazada Open API.
 * @param  {Object} credentials The Lazada credentials. Checkout first line.
 * @param  {string} endpoint    The endpoint the request is made for.
 * @param  {Object?} extras     Additional parameters for the request.
 * @param  {any?} payload       Baggage to the request.
 * @return {Object}             Response JSON object.
 */
export async function request(credentials, endpoint, extras, payload) {
  const { appKey, appSecret, accessToken, domain } = credentials;

  let parameters = {
    ...extras,
    // Get away with prettier's stupid formatting of Object keys.
    ['app_key']: appKey,
    ['sign_method']: 'sha256',
    ['timestamp']: Date.now(),
    ['partner_id']: 'oclz-js-service',
  };

  if (accessToken) {
    parameters['access_token'] = accessToken;
  }
  if (payload) {
    parameters['payload'] = payload;
  }
  parameters['sign'] = sign(appSecret, endpoint, parameters);

  // TODO(nmcapule): Confirm if payload needs to be in the bodey.

  const esc = encodeURIComponent;
  const query = Object.keys(parameters)
    .map(k => esc(k) + '=' + esc(parameters[k]))
    .join('&');

  const url = `${domain}${endpoint}?${query}`;

  // TODO(ncapule): Handle error returns.
  const response = await fetch(url, { mode: 'no-cors' });
  const json = await response.json();

  return json;
}

/**
 * Get all Lazada products.
 * @param  {Object} credentials Lazada credentials.
 * @param  {Dict} extras        Additional request parameters.
 * @return {Array}              List of products.
 */
export async function getProducts(credentials, extras) {
  extras = {
    ['filter']: 'all',
    ['offset']: 0,
    ['limit']: LIMIT,
    ...extras,
  };

  // Trim down what we need from the products response object.
  const extract = product => ({
    model: product['skus'][0]['SellerSku'],
    itemId: product['item_id'],
    skus: product['skus'][0],
  });

  let products = [];
  while (true) {
    const response = await request(credentials, ENDPOINT_PRODUCTS, extras);
    if (response['code'] && response['code'] != '0') {
      throw `Get active products: ${response['code']}: ${response['message']}`;
    }

    // If no more results, break out of loop.
    if (!response['data']['products'] || !response['data']['products'].length) {
      break;
    }
    products = products.concat(response['data']['products'].map(extract));

    // Bump offset!
    extras['offset'] += LIMIT;

    console.log(`Loaded ${products.length} products`);
  }

  return products;
}

/**
 * Loads all active Lazada orders.
 * @param  {Object} credentials Lazada credentials.
 * @param  {Dict} extras        Additional request parameters.
 * @return {Array}              List of orders.
 */
export async function getActiveOrders(credentials, extras) {
  // Date format in this particular endpoint -- because Lazada, that's why.
  const DATE_FMT = 'YYYY-MM-DD HH:mm:ss ZZ';
  extras = {
    ['created_after']: moment()
      .subtract(7, 'days')
      .toISOString(),
    ['offset']: 0,
    ['limit']: LIMIT,
    ['sort_by']: 'created_at',
    ['sort_direction']: 'DESC',
    ...extras,
  };

  // Trim down what we need from the orders response object.
  const extract = order => ({
    id: Number(order['order_id']),
    number: Number(order['order_number']),
    customer:
      `${order['address_billing']['first_name']} ` +
      `${order['address_billing']['last_name']} / ` +
      `${order['customer_first_name']} ${order['customer_last_name']}`,
    status: Array.isArray(order['statuses'])
      ? order['statuses'][0]
      : order['statuses'],
    price: Number(order['price']),
    created: moment(order['created_at'], DATE_FMT).toISOString(),
    updated: moment(order['updated_at'], DATE_FMT).toISOString(),
  });

  let orders = [];
  while (true) {
    const response = await request(credentials, ENDPOINT_ORDERS, extras);
    if (response['code'] && response['code'] != '0') {
      throw `Get active orders: ${response['code']}: ${response['message']}`;
    }

    // If no more results, break out of loop.
    if (!response['data']['count']) {
      break;
    }

    orders = orders.concat(response['data']['orders'].map(extract));

    // Bump offset!
    extras['offset'] += LIMIT;
  }

  return orders;
}

/**
 * Retrieves items for the given order ids.
 * @param  {Object} credentials     Lazada credentials.
 * @param  {Array<number>} orderIds List of order ids (duh).
 * @param  {Dict} extras            Additional request parameters.
 * @return {Dict}                   Lookup table for items SKU with order id as key.
 */
export async function getOrdersItems(credentials, orderIds, extras) {
  const encodedIds = JSON.stringify(orderIds);
  const response = await request(credentials, ENDPOINT_ORDERS_ITEMS, {
    // Get away with prettier's stupid formatting of Object keys.
    ['order_ids']: encodedIds,
  });
  if (response['code'] && response['code'] != '0') {
    throw `Get order items: ${response['code']}: ${response['message']}`;
  }

  const table = {};
  for (const order of response['data']) {
    const key = order['order_id'];
    table[key] = order['order_items'].map(item => item['sku']);
  }

  return table;
}
