import axios from './axios';
import localforage from 'localforage';

const checkStatus = async () => {
  let dataCek = {
    verified: false,
    status: false,
    data: {}
  };
  let apikey = '';
  try {
    apikey = await localforage.getItem('APIKEY');
  } catch (error) {
    console.log(error);
  }
  console.log('CHECK STAT', apikey);
  let cek = axios
    .post('/app/gerai/profile', {
      apikey: apikey
    })
    .then(({ data }) => {
      console.log('INI USER:', data);
      if (data.status) {
        dataCek.data = data.data;
        if (data.data.verified === 'TRUE') {
          dataCek.verified = true;
          if (data.data.status_gerai === 'AKTIF') {
            dataCek.status = true;
          } else {
            if (data.onGoingTrans) {
              //jika masih ada transaksi yang belum selesai
              dataCek.onGoingTrans = data.onGoingTrans;
            }
            if (data.notYetAcc) {
              //jika sudah paid tapi belum di konfirmasi admin
              dataCek.notYetAcc = data.notYetAcc;
            }
          }
        }
        return dataCek;
      }
    })
    .catch((error) => {
      // if(error.response.status != 500){
      console.log(error);
      //   toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
      // }
      // else{
      //   toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});        
      // }
      return dataCek;
    });
  return cek;
};

export default checkStatus;
