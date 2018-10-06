const ENDPOINT_PRODUCTS = 'module/store_sync/listlocalproducts';

export async function request(credentials, endpoint) {
  const { domain, username, password } = credentials;
  const url = `${domain}/common/login`;

  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  formData.append('redirect', `${domain}${endpoint}`);

  const response = await fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    credentials: 'include',
    body: formData,
    // redirect: 'follow',
  });
  const json = await response.json();

  return json;
}

export async function loadProducts(credentials) {
  return await request(credentials, ENDPOINT_PRODUCTS);
}
