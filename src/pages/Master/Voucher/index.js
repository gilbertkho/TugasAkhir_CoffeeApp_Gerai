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
  const [apikey, setApikey] = useState('');
  const [users, setUsers] = useState([]);
  let [totalSize, setTotal] = useState(0);
  let [page, setPage] = useState(1);
  const sizePerPage = 10;
  const searchRef = useRef();
  const [param, setParam] = useState({
    page: 1,
    count: sizePerPage,
    nama_voucher: '',
    apikey: apikey
  });

  const [toDelete, setToDelete] = useState(false);
  const [selected, setSelected] = useState({});
  const [period, setPeriod] = useState([]);
  const toggleDelete = (user) => {
    setToDelete(!toDelete);
    setSelectedUser(user)
  };

  const toEditUser = (user) => history.push('/master/voucher/edit', { user: user });

  const [modal, setModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});

  const toggle = () => { setModal(!modal) };
  const toggleEdit = (user) => { setModal(!modal); setSelectedUser(user);};

  // useEffect(() => { console.log(totalSize) }, [totalSize]);

  const addCommas = (num) => {    
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }
  
  const removeNonNumeric = (num) => {
    return num.toString().replace(/[^0-9]/g, "")
  };

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
        <Button color="danger" className="mr-2" size="sm" onClick={(e) => { e.stopPropagation(); toggleDelete(row) }}>
          <FontAwesomeIcon icon={['fa', 'trash-alt']} />
        </Button>
      </div>
    );
  }

  const setNumberFormat = (cell,row) =>{
    if(row.value_voucher){
      return (
        <>{addCommas(row.value_voucher)}</>
      )
    }
    else if(row.discount_value){
      return (
        <>{addCommas(row.discount_value)}</>
      )
    }
    else if(row.kuota_voucher){
      return (
        <>{addCommas(row.kuota_voucher)}</>
      )
    }
    else if(row.minimal_pay){
      return (
        <>{addCommas(row.minimal_pay)}</>
      )
    }
  }

  const statusFormat = (cell,row) => {    
    return(
      <>
        {row.status_voucher === 'NONAKTIF' ? 
          <p className = 'text-warning m-0 font-weight-bold'>{row.status_voucher}</p> 
          :
          <p className = 'text-success m-0 font-weight-bold'>{row.status_voucher}</p> 
        } 
      </>
    )
  }

  const columns = [{
    dataField: 'action',
    text: 'Action',
    formatter: GetActionFormat,
    headerStyle: (column, colIndex) => {
      return { width: '240px' };
    }
  }, {
    dataField: 'nama_voucher',
    text: 'Nama Voucher'
  }, {
    dataField: 'kuota_voucher',
    text: 'Kuota'
  }, {
    dataField: 'kode_voucher',
    text: 'Kode Voucher'  
  }, {
    dataField: 'value_voucher',
    text: 'Nilai Voucher / Jumlah Diskon Maksimal',
    formatter: setNumberFormat
  },{
    dataField: 'status_voucher',
    text: 'Status',
    formatter: statusFormat
  }];

  function fetchData(param) { 
    console.log(param)
    axios.post('/app/gerai/voucher', param).then(({data}) => {
        console.log(data)              
        if (data.status) {
          setTotal(parseInt(data.total));
          setUsers(data.data);
        } else {
          toast.error(data.msg, { containerId: 'B', transition: Zoom });
        }
      }).catch(error => {
        if(error.response.status != 500){
          toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
        }        
        else{
          toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});        
        }        
      })
  }

  useEffect(() => {
    getApiKey().then((key) => {
      if(key.status){
        setApikey(key.key)
        setParam({...param, apikey: key.key})
      }
    })
  },[])

  useEffect(() => {
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

  const deleteHandler = async () => {
    toast.dismiss();
    axios.post('app/gerai/voucher/delete', {id_voucher: selectedUser.id_voucher, apikey: apikey}).then(({data}) => {
        if (data.status) {        
          toast.success(data.msg, {containerId:"B", transition:Zoom});
          fetchData(param);
          toggleDelete({});
        }
        else{
          toast.error(data.msg, {containerId:"B", transition:Zoom});
        }
      })
    .catch(error => { 
      if(error.response.status != 500){
        toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
      }        
      else{
        toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});        
      }      
    })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setParam((prevState) => ({ ...prevState, page: 1, nama_voucher: searchRef.current.value }))
  }

  return (
    <>
      <Modal zIndex={2000} centered isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Detail Voucher</ModalHeader>
        <ModalBody>
          <Row>
            <Col xs={5}>Tipe Voucher</Col>
            <Col xs={7}>{": " + selectedUser.tipe_voucher}</Col>
          </Row>
          <Row>
            <Col xs={5}>Nama Voucher</Col>
            <Col xs={7}>{": " + selectedUser.nama_voucher}</Col>
          </Row>
          <Row>
            <Col xs={5}>Deskripsi</Col>
            <Col xs={7}>{": " + selectedUser.deskripsi_voucher}</Col>
          </Row>          
          <Row>
            <Col xs={5}>Pembayaran Minimal</Col>
            <Col xs={7}>{modal ? ": " + addCommas(selectedUser.minimal_pay) : ": " + selectedUser.minimal_pay}</Col>
          </Row>
          <Row>
            <Col xs={5}>Jumlah Diskon</Col>
            <Col xs={7}>{modal ? ": " + addCommas(selectedUser.discount_value) : ": " + selectedUser.discount_value}</Col>
          </Row>
          <Row>
            <Col xs={5}>Nilai Voucher / Jumlah Diskon Maksimal</Col>
            <Col xs={7}>{modal ? ": " + addCommas(selectedUser.value_voucher) : ": " + selectedUser.value_voucher}</Col>
          </Row>
          <Row>
            <Col xs={5}>Kuota</Col>
            <Col xs={7}>{modal ? ": " + addCommas(selectedUser.kuota_voucher) : ": " + selectedUser.kuota_voucher}</Col>
          </Row>
          <Row>
            <Col xs={5}>Kode Voucher</Col>
            <Col xs={7}>{": " + selectedUser.kode_voucher}</Col>
          </Row>          
          <Row>
            <Col xs={5}>Tanggal Berlaku</Col>
            {selectedUser.time_start != '' ?
              <Col xs={7}>{": " + moment(selectedUser.time_start).format('DD MMMM YYYY')}</Col>
              :
              <Col xs={7}>{": " + selectedUser.time_start}</Col>
            }
          </Row>
          <Row>
            <Col xs={5}>Tanggal Berakhir</Col>
            {selectedUser.time_end != '' ?
              <Col xs={7}>{": " + moment(selectedUser.time_end).format('DD MMMM YYYY')}</Col>
              :
              <Col xs={7}>{": " + selectedUser.time_end}</Col>
            }
          </Row>
          <Row>
            <Col xs={5}>Status Voucher</Col>
            <Col xs={7}>{": " + selectedUser.status_voucher}</Col>
          </Row>         
        </ModalBody>
        <ModalFooter>
          {/* <Button color="primary" onClick={toggle}>Do Something</Button>{' '} */}
          <Button color="secondary" onClick={toggle}>Tutup</Button>
        </ModalFooter>
      </Modal>
      <Modal zIndex={2000} centered isOpen={toDelete} toggle={toggleDelete}>
        <ModalHeader toggle={toggleDelete}>Apakah anda yakin untuk menghapus voucher ini?</ModalHeader>
        <ModalBody>          
          <Row>
            <Col xs={5}>Tipe Voucher</Col>
            <Col xs={7}>{": " + selectedUser.tipe_voucher}</Col>
          </Row>
          <Row>
            <Col xs={5}>Nama Voucher</Col>
            <Col xs={7}>{": " + selectedUser.nama_voucher}</Col>
          </Row>
          <Row>
            <Col xs={5}>Deskripsi</Col>
            <Col xs={7}>{": " + selectedUser.deskripsi_voucher}</Col>
          </Row>          
          <Row>
            <Col xs={5}>Pembayaran Minimal</Col>
            <Col xs={7}>{toDelete ? ": " + addCommas(selectedUser.minimal_pay) : ": " + selectedUser.minimal_pay}</Col>
          </Row>
          <Row>
            <Col xs={5}>Jumlah Diskon</Col>
            <Col xs={7}>{toDelete ? ": " + addCommas(selectedUser.discount_value) : ": " + selectedUser.discount_value}</Col>
          </Row>
          <Row>
            <Col xs={5}>Nilai Voucher / Jumlah Diskon Maksimal</Col>
            <Col xs={7}>{toDelete ? ": " + addCommas(selectedUser.value_voucher) : ": " + selectedUser.value_voucher}</Col>
          </Row>
          <Row>
            <Col xs={5}>Kuota</Col>
            <Col xs={7}>{toDelete ? ": " + addCommas(selectedUser.kuota_voucher) : ": " + selectedUser.kuota_voucher}</Col>
          </Row>
          <Row>
            <Col xs={5}>Kode Voucher</Col>
            <Col xs={7}>{": " + selectedUser.kode_voucher}</Col>
          </Row>          
          <Row>
            <Col xs={5}>Tanggal Berlaku</Col>
            {selectedUser.time_start != '' ?
              <Col xs={7}>{": " + moment(selectedUser.time_start).format('DD MMMM YYYY')}</Col>
              :
              <Col xs={7}>{": " + selectedUser.time_start}</Col>
            }
          </Row>
          <Row>
            <Col xs={5}>Tanggal Berakhir</Col>
            {selectedUser.time_end != '' ?
              <Col xs={7}>{": " + moment(selectedUser.time_end).format('DD MMMM YYYY')}</Col>
              :
              <Col xs={7}>{": " + selectedUser.time_end}</Col>
            }
          </Row>
          <Row>
            <Col xs={5}>Status Voucher</Col>
            <Col xs={7}>{": " + selectedUser.status_voucher}</Col>
          </Row>         
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={deleteHandler}>Delete</Button>
          <Button color="secondary" onClick={toggleDelete}>Tutup</Button>
        </ModalFooter>
      </Modal>
      <Card>
        <CardBody>
          <CardTitle>Daftar Voucher</CardTitle>
          <Button color = "primary" onClick = {() => {history.push('voucher/edit')} }>+ Tambah Voucher</Button>
          <div className="my-2">
            <Label>Search</Label>
            <Input className="m-0" type="search" placeholder="Nama, Email, No.HP" innerRef={searchRef} />
            <Button onClick={handleSearch} color="primary" className="mt-2">
              <FontAwesomeIcon icon={['fas', 'search']} />
              <span style={{ marginLeft: 10 }}>
                Cari
              </span>
            </Button>
          </div>
          <BootstrapTable
            remote
            keyField='id_voucher'
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
            onTableChange={handleTableChange}
            noDataIndication="Belum ada pendaftar"
            wrapperClasses="table-responsive"
          />
        </CardBody>
      </Card>
    </>
  );
}
