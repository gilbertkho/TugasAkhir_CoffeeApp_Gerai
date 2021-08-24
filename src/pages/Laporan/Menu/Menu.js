/* eslint-disable */
import React, { Fragment, useState, useEffect, useRef } from 'react';

import { useHistory } from 'react-router-dom';
import {
  Card, CardTitle, CardBody, Button, Modal, ModalHeader,
  ModalBody, ModalFooter, Row, Col, Label, Input, Table, FormText, Breadcrumb, BreadcrumbItem
} from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import axios from "config/axios";
import moment from "moment";
import urlConfig from "config/backend";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast, Zoom } from 'react-toastify';
import Errormsg from 'config/errormsg';
import getApiKey from 'config/getApiKey';
import Chart from 'react-apexcharts';

export default function LaporanMenu(props) {

  const history = useHistory();
  const [users, setUsers] = useState([]);
  let [totalSize, setTotal] = useState(0);
  let [page, setPage] = useState(1);
  const [apikey, setApikey] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [chartOptions, setChartOptions] = useState({    
      chart:{
        id: "basic-bar"
      },
      xaxis: {
        categories: []
      },
      noData: {
        text: "Data not found."
      }
  })
  const [chartSeries, setChartSeries] = useState([
    {
      name: "Jumlah Pesanan",
      data: []
    }
  ])

  const resetChart = () => {
   setChartSeries([
    {
      name: "Jumlah Pesanan",
      data: []
    }
   ]);
   setChartOptions({
      chart:{
        id: "basic-bar"
      },
      xaxis: {
        categories: []
      },
      noData: {
        text: "Data not found."
      }
   });
  }
  const sizePerPage = 10;
  const searchRef = useRef();
  const [param, setParam] = useState({
    page: 1,
    count: sizePerPage,
    id_menu: '',
    nama_menu: '',
    harga_menu: '',    
    time_start: timeStart,
    time_end: timeEnd,
    apikey: apikey
  });

  const [toDelete, setToDelete] = useState(false);
  const [selected, setSelected] = useState({});
  const [period, setPeriod] = useState([]);
  const toggleDelete = (user) => {
    setToDelete(!toDelete);
    setSelectedUser(user)
  };

  const toEditUser = (user) => history.push('/order/edit', { user: user });

  const [modal, setModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});

  const toggle = () => { setModal(!modal) };
  const toggleEdit = (user) => { setModal(!modal); setSelectedUser(user) };

  // useEffect(() => { console.log(totalSize) }, [totalSize]);

  const addCommas = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  };

  function fetchData(param) { 
    console.log(param)    
    axios.post('/app/gerai/report/menu', param).then(({data}) => {
        console.log(data)
        if (data.status) {
          console.log(data);
          let series = [...chartSeries];
          let options = {...chartOptions};
          data.data.forEach((dt, key) => {            
            series[0].data.push(parseInt(dt.total_pesanan));
            options.xaxis.categories.push(moment(dt.tgl_pesanan).format('DD MMMM YYYY'))
          })
          setChartSeries(series)
          setChartOptions(options)
        } else {
          toast.error(data.msg, { containerId: 'B', transition: Zoom });
        }
      }).catch(error => {
        console.log(error)
        if(error.response.status != 500){
          toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
        }
        else{
          toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});        
        }
      })
  }

  useEffect(() => {
    let propsReq = props.location.state.menu;
    getApiKey().then((key) => {
      if(key.status){
        setApikey(key.key)
        setParam({
          ...param, 
          id_menu: propsReq.id_menu,
          nama_menu: propsReq.nama_menu,
          harga_menu: propsReq.harga_menu,
          apikey: key.key
        })
      }
    });
  }, [])

  useEffect(() => {    
    if(param.apikey !== ''){
      fetchData(param)
    }
  }, [param]);

  const setTimeFilter = (e,val) => {
    if(val === "ts"){
      setTimeStart(e.target.value)      
    }
    else{
      setTimeEnd(e.target.value)     
    }
    console.log(e.target.value)
  }

  const clearSearch = () => {
    setTimeStart('')
    setTimeEnd('')
    setParam((prevState) => ({ ...prevState, page: 1, time_start: '', time_end: '' }))
  }

  const handleSearch = (e) => {
    e.preventDefault();
    // setParam((prevState) => ({ ...prevState, nama_tipe: searchRef.current.value }))
    if(Date.parse(timeStart) >  Date.parse(timeEnd)){
      toast.error('Tanggal berlaku tidak boleh melebihi tanggal berakhir', { containerId: 'B', transition: Zoom });
    }
    else{
      setParam((prevState) => ({ ...prevState, page: 1, time_start: timeStart, time_end: timeEnd, apikey: apikey }));
      resetChart();
    }
  }
  useEffect(() => {
    console.log('INI OPTIONS' , chartOptions)
    console.log('INI SERIES' , chartSeries)
    // chart.updateSeries(chartSeries)    
  },[chartOptions, chartSeries])

  return (
    <>            
      <Card>
        <CardBody>
          <Breadcrumb>
            <BreadcrumbItem><a href="/#" onClick={(e) => { e.preventDefault(); history.push('/laporan/menu/list') }}>Menu</a></BreadcrumbItem>
            <BreadcrumbItem active>Laporan Menu</BreadcrumbItem>
          </Breadcrumb>
          <Breadcrumb class='p-0'>            
            <h6 class='m-0 p-0 font-weight-bold'>{param.nama_menu + ' - Rp.' + addCommas(param.harga_menu)}</h6>
          </Breadcrumb>
          <div className="my-2">
            {/* <Label>Search</Label>
            <Input className="m-0" type="search" placeholder="ID Pesanan, Nama Pelanggan" innerRef={searchRef} /> */}
            <div className = 'd-flex'>
              <div className = "w-50">
                <Label for = "time_start">Mulai Dari</Label>
                <Input id = "time_start" type="date" value = {timeStart} onChange = {(e) => setTimeFilter(e,"ts")}/>
              </div>
              <div className = "w-50 pl-3">
                <Label for = "time_end">Hingga</Label>
                <Input id = "time_end" type="date" value = {timeEnd} onChange = {(e) => setTimeFilter(e,"te")}/>
              </div>
            </div>
            <FormText color='primary'>Data akan ditampilkan secara default dengan jangka waktu selama 1 minggu terakhir, jika tidak ada pengaturan jangka waktu laporan</FormText>
            <Button onClick={handleSearch} color="primary" className="mt-2">
              <FontAwesomeIcon icon={['fas', 'search']} />
              <span style={{ marginLeft: 10 }}>
                Cari
              </span>
            </Button>
            {
              timeStart !== '' || timeEnd !== '' ? 
              <Button onClick={clearSearch} color="info" className="mt-2 ml-2">
                <FontAwesomeIcon icon={['fas', 'trash-alt']} />
                <span style={{ marginLeft: 10 }}>
                  Clear
                </span>
              </Button>
              : null
            }
          </div>          
        </CardBody>
        {chartOptions.xaxis.categories.length > 0 ?
        <Chart
          options = {{...chartOptions}}
          series = {[...chartSeries]}
          type = 'bar'
          width = '95%'
          className = 'd-flex justify-content-center'
        />
        : null }
      </Card>
    </>
  );
}
