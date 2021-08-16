import jwt from 'jsonwebtoken';
import localforage from 'localforage';

const auth = async () => {
  let data = {
    status: false,
    msg: '',
    data: {}
  };
  console.log('OK');
  // const cekCookie = document.cookie.split(';');
  // console.log(cekCookie);
  let getCookie = '';
  // for(let i = 0 ; i <cekCookie.length; i++){
  //   let getCookieName = cekCookie[i].split("=");
  //   if(getCookieName[0].includes("gerai")){
  //     getCookie =  getCookieName[1];
  //   }
  // }
  // const getCookie = cekCookie.findIndex()

  try {
    getCookie = await localforage.getItem('APIKEY');
  } catch (error) {
    console.log(error);
  }
  jwt.verify(getCookie, 'gerai', (err, decoded) => {
    console.log(getCookie);
    if (err) {
      data.msg = 'Token expired.';
    } else {
      console.log('okk');
      data.status = true;
      data.msg = 'OK';
      data.data = JSON.parse(decoded.data);
      console.log(data);
    }
  });

  console.log('getCOOKIE', getCookie);
  return data;
  // console.log('INI GET COOKIE', getCookie)
}

export default auth;
