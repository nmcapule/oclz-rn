export async function request(credentials, endpoint) {
  const { domain, username, password } = credentials;
  const url = `${domain}/common/login`;

  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  formData.append('redirect', `${domain}${endpoint}`);
  console.log(formData);

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