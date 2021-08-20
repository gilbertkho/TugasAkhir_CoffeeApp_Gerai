/* eslint-disable */
import React, { Fragment, useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Card, CardTitle, CardBody, Button, Modal, ModalHeader,
  ModalBody, ModalFooter, Row, Col, Label, Input, 
  Breadcrumb, BreadcrumbItem, CustomInput, Toast, FormText
} from 'reactstrap';
import InfiniteScroll from 'react-infinite-scroll-component';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import axios from "config/axios";
import urlConfig from "config/backend";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast, Zoom } from 'react-toastify';
import moment from "moment";
import localForage from 'config/localForage';
import Errormsg from 'config/errormsg';
import { setFooterBgTransparent } from 'redux/reducers/ThemeOptions';
import getApiKey from 'config/getApiKey';

export default function ChatList(props) {
  const [user, setUser] = useState({
    email: "",
    pict: "",
    tu: "Internal",
    uid: ""
  });
  const [apikey, setApikey] = useState('');
  const [openMerchant, setOpenMerchant] = useState(false);

  useEffect(() => {
    (async function () {
      let user = await localForage.getItem('user');
      setUser(user);
    })()
    // fetchData();
  }, []);

  const history = useHistory();
  const [req, setReq] = useState([]);

  const [modal, setModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState({});
  const [sort, setSort] = useState(false);
  const toggle = (req) => { 
    setModal(!modal);
    setSelectedReq(req);
    console.log(req.id);
  };

  useEffect(() => {
    getApiKey().then((key) => {
      if(key.status){
        setApikey(key.key);
      }
    });
  },[])

  useEffect(() => {
    if(apikey !== ''){      
      fetchData();
      getMerchantOpenStatus();
    }
  },[apikey]);

  function fetchData() {    
    axios.post('app/gerai/openhour',{
      apikey: apikey
    }).then(({data}) => {
      if(data.status){
        setReq(JSON.parse(data.data.waktu));
      }
      else{        
        toast.error(data.msg, {containerId: "B", transition: Zoom})
        setReq([{
          day : 'Monday',
          open : '',
          close : '',
        },{
          day : 'Tuesday',
          open : '',
          close : '',
        },{
          day : 'Wednesday',
          open : '',
          close : '',
        },{
          day : 'Thursday',
          open : '',
          close : '',
        },{
          day : 'Friday',
          open : '',
          close : '',
        },{
          day : 'Saturday',
          open : '',
          close : '',
        },{
          day : 'Sunday',
          open : '',
          close : '',
        },])
      }
    }).catch((error) => {    
      setReq([{
        day : 'Monday',
        open : '',
        close : '',
      },{
        day : 'Tuesday',
        open : '',
        close : '',
      },{
        day : 'Wednesday',
        open : '',
        close : '',
      },{
        day : 'Thursday',
        open : '',
        close : '',
      },{
        day : 'Friday',
        open : '',
        close : '',
      },{
        day : 'Saturday',
        open : '',
        close : '',
      },{
        day : 'Sunday',
        open : '',
        close : '',
      },])
      if(error.response.status != 500){
        toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
      }
      else{
        toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});
      }
    })
  }

  useEffect(() => {
    console.log(req)
  },[req])

  const setValue = (info, row, val) => {
    // console.log(req[0].open)
    let find = req.findIndex((rq) => {
      return rq.day === row.day
    });
    let rq = [...req];
    console.log('ini rq', rq);
    console.log('ini req', req);
    console.log(find)
    if(info === 'close'){
      rq[find].close = val;
    }
    else{
      rq[find].open = val;
    }
    setReq(rq);
  }

  const openFormat = (cell, row) => {    
    return (
      <Input value={row.open} id={row.day + 'open'} type='time' onChange={(e) => setValue('open', row, e.target.value)}/>
    )
  }
  const closeFormat = (cell, row) => {    
    return(
      <Input value={row.close} id={row.day + 'close'} type='time' onChange={(e) => setValue('close', row, e.target.value)}/>
    )
  }

  const columns = [{     
    dataField: 'day',
    text: 'Hari',
  }, {
    dataField: 'open',
    text: 'Buka',
    formatter: openFormat
  }, {
    dataField: 'close',
    text: 'Tutup',
    formatter: closeFormat
  }];

  const saveOpenHour = () => {
    let checkOpen =  false;
    for(let i = 0; i < req.length; i++){
      if(!req[i].open ||!req[i].close){
        checkOpen = true;
        i =  req.length;
      }
    }
    if(checkOpen){
      toast.error('Harap lengkapi semua pengisian jam operasi.', {containerId:'B', transition:Zoom});
    }
    else{
      axios.post('/app/gerai/openhour/save',{
        openhour: JSON.stringify(req),
        apikey: apikey
      }).then(({data}) => {
        if(data.status){
          toast.success(data.msg, {containerId:'B', transition:Zoom});
          fetchData();
        }
        else{
          toast.error(data.msg, {transition:Zoom, containerId:'B'});
        }
      }).catch((error) => {
        if(error.response.status != 500){
          toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
        }
        else{
          toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});
        }
      })
    }
  }

  const getMerchantOpenStatus = () => {
    axios.post('/app/gerai/profile',{
      apikey: apikey
    }).then(({data}) => {
      if(data.status){
        if(data.data.gerai_buka === 'TRUE'){
          setOpenMerchant(true);
        }
        else{
          setOpenMerchant(false)
        }
      }
      else{
        toast.error(data.msg, {containerId:'B', transition:Zoom});
      }
    }).catch((error) => {
      if(error.response.status != 500){
        toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
      }
      else{
        toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});
      }
    })
  }

  const updateOpenMerchant = () => {    
    axios.post('/app/gerai/openmerchant',{
      apikey: apikey
    }).then((data) => {
      console.log(data);
      if(data.status){
        console.log(data.data)
        if(data.data === 'FALSE'){
          setOpenMerchant(false);
        }
        else{
          setOpenMerchant(true);
        }
        window.location.reload();
      }
      else{
        toast.error(data.msg, { containerId:'B', transition: Zoom });
      }
    })
    .catch((error) => {
      if(error.response.status != 500){
        toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
      }
      else{
        toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});
      }
    })
  } 

  return (
    <>
      <Card>
        <CardBody>
          <CardTitle>Jam Operasi</CardTitle>
          <FormText color='primary' className='pb-2'>Harap mengisi jam operasi dengan format waktu 24 jam (00:00 - 23:59)</FormText>
          <BootstrapTable
            remote
            keyField='day'
            data={req}
            columns={columns}
            // selectRow={selectRow}
            bodyClasses="bootstrap-table"
            // onTableChange={handleTableChange}
            noDataIndication="Belum ada jam operasi"
            wrapperClasses="table-responsive"
          />
          <div className='d-flex flex-row justify-content-center'>
            <Button color='primary' className ='w-25' onClick = {saveOpenHour}>Simpan Jam Operasi</Button>
            <div className='pl-2 w-25'>
              <Button color='primary' className = 'w-100'  onClick = {() => updateOpenMerchant()}>                
                  <FontAwesomeIcon icon='circle' color={openMerchant ? '#39ff2f' : 'red'} className='pr-1'/>                
                  {openMerchant ? 'Tutup Gerai' : 'Buka Gerai'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
