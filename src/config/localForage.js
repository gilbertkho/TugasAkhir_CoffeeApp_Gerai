import localForage from 'localforage';

localForage.config({
  name: 'flatssafaribo',
  storeName: 'flatspersist',
  version: '1.0'
});

export default localForage;
