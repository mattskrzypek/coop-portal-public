// @ts-check
/** @param {HTMLAnchorElement} link @param {URL} current @returns {boolean} */
function opensNewTab(link, current) {
  const destination = new URL(link.href, current);
  if (!['https:', 'http:'].includes(destination.protocol) || link.hasAttribute('download')) return false;
  if (destination.origin === current.origin && destination.pathname === current.pathname && destination.search === current.search && destination.hash) return false;
  return link.id !== 'nav-signout' && !/\/(?:outpost\.goauthentik\.io\/sign_out|coop-signout|coop\/requests-signout\.html|auth\/logout)(?:\/|$)/.test(destination.pathname);
}
/** @param {HTMLAnchorElement} link @returns {void} */
function setNewTab(link) {
  if (!opensNewTab(link, new URL(location.href))) return;
  link.target = '_blank';
  link.relList.add('noopener', 'noreferrer');
}
for (const link of document.querySelectorAll('a[href]')) {
  if (link instanceof HTMLAnchorElement) setNewTab(link);
}
// Capture also covers links added later by app search, chat and request history.
document.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest('a[href]');
  if (link instanceof HTMLAnchorElement) setNewTab(link);
}, true);
