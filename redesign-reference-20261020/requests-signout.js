// @ts-check
/** @returns {Promise<void>} */
async function signOutRequests() {
  if (location.origin !== 'https://requests.fatpigeon.ca') throw new Error('Open sign out from the Coop.');
  const me = await fetch('/api/v1/auth/me', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000) });
  if (me.status === 200) {
    const token = document.cookie.split('; ').find(cookie => cookie.startsWith('XSRF-TOKEN='));
    if (!token) throw new Error('Requests did not provide its sign-out security token. Please retry.');
    const response = await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': decodeURIComponent(token.slice('XSRF-TOKEN='.length)) }, body: '{}', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Requests sign out returned HTTP ${response.status}. Please retry.`);
    const verified = await fetch('/api/v1/auth/me', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (![401, 403].includes(verified.status)) throw new Error('Requests did not confirm that this browser is signed out.');
  } else if (![401, 403].includes(me.status)) {
    throw new Error(`Requests sign-in check returned HTTP ${me.status}. Please retry.`);
  }
  sessionStorage.removeItem('coop-request-query');
  sessionStorage.removeItem('coop-request-return');
  sessionStorage.removeItem('coop-request-expected');
  location.replace('https://auth.fatpigeon.ca/flows/-/cancel/');
}
void signOutRequests().catch(error => {
  const status = document.getElementById('signout-status');
  if (!status) throw new Error('Sign-out status is missing.');
  status.textContent = error instanceof Error ? error.message : 'Requests sign out failed. Please retry.';
});
