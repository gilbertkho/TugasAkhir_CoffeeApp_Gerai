import localforage from 'localforage';

const getApiKey = async () => {
  let data = {
    key: '',
    msg: '',
    status: false
  }
  try{
    data.key = await localforage.getItem('APIKEY');
    data.status = true;
    data.msg = 'OK';
  }
  catch(error){
    data.msg = error;
  }

  return data;
}

export default getApiKey;
