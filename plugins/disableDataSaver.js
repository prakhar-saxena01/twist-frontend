export default ({ req, store }) => {
  const notification = {
    message: 'Disable Data Saver to watch anime otherwise it may not load',
    timeout: 1000 * 18,
    icon: 'warning',
  };

  // show notification if "save-data" header is present
  if (req && req.headers['save-data']) {
    store.dispatch('showNotification', notification);
  }
}
