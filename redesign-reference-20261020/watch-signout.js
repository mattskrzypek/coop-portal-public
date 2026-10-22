// @ts-check
/** @param {unknown} value @returns {Record<string, unknown>} */
function signoutObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error('Watch returned invalid sign-out data.');
  return /** @type {Record<string, unknown>} */ (value);
}
/** @returns {Promise<void>} */
async function signOutWatch() {
  if (location.origin !== 'https://watch.fatpigeon.ca') throw new Error('Open sign out from the Coop.');
  const stored = localStorage.getItem('jellyfin_credentials');
  if (stored !== null) {
    const credentials = signoutObject(JSON.parse(stored));
    if (!Array.isArray(credentials.Servers)) throw new Error('Watch has invalid saved server details.');
    const response = await fetch('/System/Info/Public', { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Watch identification returned HTTP ${response.status}. Please retry.`);
    const info = signoutObject(await response.json());
    if (typeof info.Id !== 'string' || !/^[a-f0-9]{32}$/i.test(info.Id)) throw new Error('Watch did not identify its server.');
    const servers = credentials.Servers.map(signoutObject);
    const current = servers.filter(server => server.Id === info.Id);
    if (current.length > 1) throw new Error('Watch has duplicate saved server entries. Ask Matt to check sign out.');
    const server = current[0];
    if (server && typeof server.AccessToken === 'string' && server.AccessToken.length > 0) {
      const device = localStorage.getItem('_deviceId2');
      if (device === null || !/^[A-Za-z0-9+/_=-]{1,2048}$/.test(device)) throw new Error('Watch has invalid saved device details.');
      const authorization = `MediaBrowser Client="Coop sign out", Device="Browser", DeviceId="${device}", Version="1.0", Token="${server.AccessToken}"`;
      const logout = await fetch('/Sessions/Logout', { method: 'POST', headers: { Authorization: authorization, 'X-Emby-Authorization': authorization }, signal: AbortSignal.timeout(15000) });
      if (![200, 204, 401, 403].includes(logout.status)) throw new Error(`Watch sign out returned HTTP ${logout.status}. Please retry.`);
    } else if (server && server.AccessToken !== undefined && server.AccessToken !== null && server.AccessToken !== '') {
      throw new Error('Watch has invalid saved sign-in details.');
    }
    localStorage.setItem('jellyfin_credentials', JSON.stringify({ ...credentials, Servers: servers.map(server => server.Id === info.Id ? { ...server, AccessToken: null, UserId: null } : server) }));
    localStorage.removeItem('twofactor_device_token');
    localStorage.removeItem('__tfa_rp_logout');
  }
  location.replace('https://requests.fatpigeon.ca/coop/requests-signout.html');
}
void signOutWatch().catch(error => {
  const status = document.getElementById('signout-status');
  if (!status) throw new Error('Sign-out status is missing.');
  status.textContent = error instanceof Error ? error.message : 'Watch sign out failed. Please retry.';
});
