let urlConfig =
  process.env.NODE_ENV !== 'production'
    ? {
        // urlBackend: 'http://localhost:8090/',
        urlBackend: 'http://192.168.0.9:8090/'
        // urlBackend: 'https://coffeeapp-backend.herokuapp.com/'
        // urlBackendProfile: 'http://localhost:8090/serve/profile//'
      }
    : {
        urlBackend: 'https://coffeeapp-backend.herokuapp.com/'
        // urlBackendProfile: 'https://ftapi.efata.id/serve/profile//'
      };

export default urlConfig;
