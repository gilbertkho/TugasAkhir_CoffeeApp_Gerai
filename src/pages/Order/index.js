/* eslint-disable */
import React, { Fragment, useState, useEffect, useRef } from 'react';

import { useHistory } from 'react-router-dom';
import {
  Card, CardTitle, CardBody, Button, Modal, ModalHeader,
  ModalBody, ModalFooter, Row, Col, Label, Input, Table
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

export default function ListPendaftar() {

  const history = useHistory();
  const [users, setUsers] = useState([]);
  const [apikey, setApikey] = useState('');
  let [totalSize, setTotal] = useState(0);
  let [page, setPage] = useState(1);
  const sizePerPage = 10;
  const searchRef = useRef();
  const [param, setParam] = useState({
    page: 1,
    count: sizePerPage,
    search: '',
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

  useEffect(() => {
    getApiKey().then((key) => {
      if(key.status){
        setApikey(key.key)
        setParam({...param, apikey:key.key})
      }
    });
  },[])

  const addCommas = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  const removeNonNumeric = num => num.toString().replace(/[^0-9]/g, "");

  const GetActionFormat = (cell, row) => {
    console.log(row);
    return (
      <div>
        <Button color="primary" className="mr-2" size="sm" onClick={(e) => { e.stopPropagation(); toggleEdit(row) }}>
          <FontAwesomeIcon icon={['fa', 'info-circle']} />
        </Button>
        <Button color="primary" className="mr-2" size="sm" onClick={(e) => { e.stopPropagation(); toEditUser(row) }}>
          <FontAwesomeIcon icon={['fa', 'edit']} />
        </Button>
      </div>
    );
  }

  const setNumberFormat = (cell,row) =>{
    if(row.total_harga){
      return (
        <>{addCommas(row.total_harga)}</>
      )
    }    
  }

  const timeFormat = (cell,row) =>{    
    return(
      <>
        {moment(row.tgl_pesanan).format('DD MMM YYYY, HH:mm')}
      </>
    )
  }

  const statusPesanan  = (cell,row) => {
    return(
      <>
        {row.status_pesanan === 'DIPROSES' ? 
            <p className = 'text-warning m-0 font-weight-bold'>{row.status_pesanan}</p> 
          : row.status_pesanan === 'SELESAI' ?        
            <p className = 'text-success m-0 font-weight-bold'>{row.status_pesanan}</p> 
          : <p className = 'text-info m-0 font-weight-bold'>{row.status_pesanan}</p>
        } 
      </>
    )
  }

  const columns = [{
    dataField: 'action',
    text: 'Action',
    formatter: GetActionFormat,
    headerStyle: (column, colIndex) => {
      return { width: '180px' };
    }
  }
  , {
    dataField: 'nama_pelanggan',
    text: 'Nama Pelanggan'
  }, {
    dataField: 'waktu_pesanan',
    text: 'Tanggal Pesanan',
    formatter : timeFormat
  }, {
    dataField: 'total_pesanan',
    text: 'Jumlah Pesanan'
  }, {
    dataField: 'total_harga',
    text: 'Total Harga',
    formatter: setNumberFormat
  },{
    dataField: 'status_pesanan',
    text: 'Status Pesanan',
    formatter: statusPesanan
  }];

  function fetchData(param) { 
    console.log(param)
    axios.post('/app/gerai/order', param).then(({data}) => {
        console.log(data)
        if (data.status) {
          setTotal(parseInt(data.total))
          setUsers(data.data)          
        } else {
          toast.error(data.msg, { containerId: 'B', transition: Zoom });
        }
      }).catch(error => {
        console.log(error.response)
        if(error.response.status != 500){
          toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
        }        
        else{
          toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});        
        }
      })
  }

  useEffect(() => {
    console.log(param)
    if(param.apikey !== ''){
      fetchData(param)
    }
  }, [param]);

  const handleTableChange = (type, { page, sizePerPage }) => {
    setParam((prevState) => ({
      ...prevState,
      page: page
    }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setParam((prevState) => ({ ...prevState, page: 1, search: searchRef.current.value }))
  }

  const innerColumns = [
    {
      dataField: 'nama_menu',
      text: 'Nama Menu',      
    },
    {
      dataField: 'total_pesanan',
      text: 'Jumlah Menu',
    },
    {
      dataField: 'total_harga',
      text: 'Total Harga Menu',      
    },
  ];

  const expandRow = {    
    onlyOneExpanding: true,
    showExpandColumn: true,
    renderer: (row) => {
      // row.detail.forEach((e) => {
      //     e.id_pesanan;
      // });
      return (
        <>
          <BootstrapTable
            keyField="id_pesanan"
            data={row.detail}
            columns={innerColumns}
            noDataIndication="Tidak ada pesanan"
            wrapperClasses="table-responsive"
          />
        </>
      );
    }
  };

  return (
    <>
      <Modal zIndex={2000} centered isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Detail Pesanan</ModalHeader>
        <ModalBody>
          <Row>
            <Col xs={4}>ID Pesanan</Col>
            <Col xs={8}>{": " + selectedUser.id_pesanan}</Col>
          </Row>
          <Row>
            <Col xs={4}>Nama Pelanggan</Col>
            <Col xs={8}>{": " + selectedUser.nama_pelanggan}</Col>
          </Row>
          <Row>
            <Col xs={4}>Tanggal Pesanan</Col>
            <Col xs={8}>{": " + moment(selectedUser.tgl_pesanan).format('DD MMM YYYY, HH:mm')}</Col>
          </Row>
          <Row>
            <Col xs={4}>Jumlah Pesanan</Col>
            <Col xs={8}>{": " + selectedUser.total_pesanan}</Col>
          </Row>
          <Row>
            <Col xs={4}>Total Harga</Col>
            <Col xs={8}>{modal ? ": " + addCommas(selectedUser.total_harga) : ": " + selectedUser.total_harga}</Col>
          </Row>
          <Row>
            <Col xs={4}>Pengambilan</Col>
            <Col xs={8}>{": " + selectedUser.tipe_pengambilan}</Col>
          </Row>
          <Row>
            <Col xs={4}>Biaya Delivery</Col>
            <Col xs={8}>{modal ? ": " + addCommas(selectedUser.biaya_delivery): ": " + selectedUser.biaya_delivery}</Col>
          </Row>
          <Row>
            <Col xs={4}>Voucher</Col>
            <Col xs={8}>{": " + (selectedUser.nama_voucher !== 'undefined' ? selectedUser.nama_voucher : 'Tidak menggunakan voucher apapun' )}</Col>
          </Row>
          <Row>
            <Col xs={4}>Status Pesanan</Col>
            <Col xs={8}>{": " + selectedUser.status_pesanan}</Col>
          </Row>
          <Row>
            <Col xs={4}>Catatan Tambahan</Col>
            <Col xs={8}>{": " + selectedUser.catatan_tambahan}</Col>
          </Row>
          <Row className = 'p-3'>
              <Col className = 'border border-primary'>
                <p className = 'text-center'>Detail Pesanan</p>
                {
                  selectedUser.detail?
                  selectedUser.detail.map((sd, key) => {
                    console.log(selectedUser.detail.length)
                    return(
                      <div key={key} className = 'border mb-2 p-2'>
                        <Row>
                          <Col xs={5}>Nama Menu </Col>
                          <Col xs={7}> : {sd.nama_menu} </Col>
                        </Row>
                        <Row>
                          <Col xs={5}>Total Harga</Col>
                          <Col xs={7}>: {addCommas(sd.total_harga)} </Col>
                        </Row>
                        <Row>
                          <Col xs={5}>Total Pesanan</Col>
                          <Col xs={7}>: {sd.total_pesanan}</Col>
                        </Row>
                        <Row>
                          <Col xs={5}>Menu Tambahan</Col>
                          <Col xs={7}>:</Col>
                        </Row>
                        <Row>
                          <Col>
                              {
                                // console.log(JSON.parse(sd.menu_tambahan))
                                JSON.parse(sd.menu_tambahan)?
                                JSON.parse(sd.menu_tambahan).map((mt, key) => {
                                  return(                                  
                                    <ul key={key}>
                                      <li>
                                        <Row>
                                            <Col xs={3}>Tambahan</Col>
                                            <Col xs={9}>: {mt.nama}</Col>
                                        </Row>
                                        <Row>
                                            <Col xs={3}>Harga</Col>
                                            <Col xs={9}>: {addCommas(mt.harga)}</Col>
                                        </Row>
                                      </li>
                                    </ul>
                                  )
                                })
                                :null
                              }
                          </Col>
                        </Row>
                      </div>
                    )
                  })
                  :null
                }
              </Col>
          </Row>          
        </ModalBody>
        <ModalFooter>
          {/* <Button color="primary" onClick={toggle}>Do Something</Button>{' '} */}
          <Button color="secondary" onClick={toggle}>Tutup</Button>
        </ModalFooter>
      </Modal>
      <Card>
        <CardBody>
          <CardTitle>Daftar Pemesanan</CardTitle>
          {/* <Button color = "primary" onClick = {() => {history.push('menu/edit')} }>+ Tambah Menu</Button> */}
          <div className="my-2">
            <Label>Search</Label>
            <Input className="m-0" type="search" placeholder="ID Pesanan, Nama Pelanggan" innerRef={searchRef} />
            <Button onClick={handleSearch} color="primary" className="mt-2">
              <FontAwesomeIcon icon={['fas', 'search']} />
              <span style={{ marginLeft: 10 }}>
                Cari
              </span>
            </Button>
          </div>
          <BootstrapTable
            remote
            keyField='id_pesanan'
            data={users}
            columns={columns}
            // selectRow={selectRow}
            bodyClasses="bootstrap-table"
            pagination={paginationFactory({
              hideSizePerPage: true,
              hidePageListOnlyOnePage: true,
              page: param.page,
              sizePerPage,
              totalSize
            })}
            expandRow = {expandRow}
            onTableChange={handleTableChange}
            noDataIndication="Belum ada pesanan"
            wrapperClasses="table-responsive"
          />
        </CardBody>
      </Card>
    </>
  );
}
