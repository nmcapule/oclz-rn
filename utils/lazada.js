import jssha from 'jssha';

const ENDPOINT_ORDERS = '/orders/get';
const ENDPOINT_ORDERS_ITEMS = '/orders/items/get';

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
 * Loads all active Lazada orders.
 * @param  {Object} credentials Lazada credentials.
 * @return {Array}              List of orders.
 */
export async function getActiveOrders(credentials) {
  const response = await request(credentials, ENDPOINT_ORDERS);
  if (response['code'] && response['code'] != '0') {
    throw `Get active orders: ${response['code']}: ${response['message']}`;
  }
  // Trim down what we need from the orders response object.
  const orders = response['data']['orders'].map(order => ({
    id: Number(order['order_id']),
    number: Number(order['order_number']),
    customer: order['customer_last_name'],
    status: order['status'],
    price: Number(order['price']),
    created: new Date(Number(order['created_at'])),
    updated: new Date(Number(order['updated_at'])),
  }));

  return orders;
}

/**
 * Retrieves items for the given order ids.
 * @param  {Object} credentials     Lazada credentials.
 * @param  {Array<number>} orderIds List of order ids (duh).
 * @return {Dict}                   Lookup table for items shop SKU with order id as key.
 */
export async function getOrdersItems(credentials, orderIds) {
  const encodedIds = JSON.stringify(orderIds);
  const response = await request(credentials, ENDPOINT_ORDERS_ITEMS, {
    // Get away with prettier's stupid formatting of Object keys.
    ['order_ids']: encodedIds,
  });
  if (response['code'] && response['code'] != '0') {
    throw `Get order items: ${response['code']}: ${response['message']}`;
  }

  const table = {};
  for (const order in response['data']) {
    const key = order['order_id'];
    table[key] = order['order_items'].map(item => item['shop_sku']);
  }

  return table;
}
