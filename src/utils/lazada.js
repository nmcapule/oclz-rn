import jssha from 'jssha';

export function sign(secret, endpoint, params) {
  const keys = Object.keys(params).sort();
  const pairs = keys.map(key => `${key}${params[key]}`);
  const concatenated = `${endpoint}${pairs.join('')}`;

  const codec = new jssha("SHA-256", "TEXT");
  codec.setHMACKey(secret, "TEXT");
  codec.update(concatenated);

  return codec.getHMAC("HEX").toUpperCase();
}

export async function request(credentials, endpoint, payload, extras) {
  const {appKey, accessToken, domain} = credentials;

  let parameters = {
    ...extras,
    'app_key': appKey,
    'sign_method': 'sha256',
    'timestamp': Date.now(),
    'partner_id': 'oclz-js-service',
  };

  if (accessToken) {
    parameters['access_token'] = accessToken;
  }
  if (payload) {
    parameters['payload'] = payload;
  }
  parameters['sign'] = sign(appKey, endpoint, parameters);

  const esc = encodeURIComponent;
  const query = Object.keys(parameters)
      .map(k => esc(k) + '=' + esc(parameters[k]))
      .join('&');

  const url = `${domain}${endpoint}?${query}`;

  // TODO(ncapule): Handle error returns.
  const response = await fetch(url, {mode: 'no-cors'})
  const json = await response.json();

  return json;
}
