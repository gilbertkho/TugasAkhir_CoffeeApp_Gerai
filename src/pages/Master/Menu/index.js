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

export default function ListMenu() {

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

  const toEditUser = (user) => history.push('/master/menu/edit', { user: user });

  const [modal, setModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});

  const toggle = () => { setModal(!modal) };
  const toggleEdit = (user) => { setModal(!modal); setSelectedUser(user) };

  // useEffect(() => { console.log(totalSize) }, [totalSize]);

  useEffect(() => {
    getApiKey().then((key) => {
      if(key.status){
        setApikey(key.key);
        setParam({...param, apikey: key.key})
      }
    })
  },[])

  const addCommas = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
        <Button color="danger" className="mr-2" size="sm" onClick={(e) => { e.stopPropagation(); toggleDelete(row) }}>
          <FontAwesomeIcon icon={['fa', 'trash-alt']} />
        </Button>
      </div>
    );
  }

  const setNumberFormat = (cell,row) =>{
    if(row.harga_menu){
      return (
        <>{addCommas(row.harga_menu)}</>
      )
    }    
  }

  const statusFormat = (cell,row) => {    
    return(
      <>
        {row.status_menu === 'NONAKTIF' ? 
          <p className = 'text-warning m-0 font-weight-bold'>{row.status_menu}</p> 
          :
          <p className = 'text-success m-0 font-weight-bold'>{row.status_menu}</p> 
        } 
      </>
    )
  }
  
  const getPhotoFormat = (cell,row) =>{    
    return (
      <img height="150" width="150" src={urlConfig.urlBackend + "app/gerai/menu_photo/" + row.id_menu + "/" + apikey }/>
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
    dataField: 'foto',
    text: 'Foto Menu',
    formatter: getPhotoFormat,    
  }, {
    dataField: 'nama_menu',
    text: 'Nama Menu'
  }, {
    dataField: 'deskripsi_menu',
    text: 'Deskripsi'
  }, {
    dataField: 'harga_menu',
    text: 'Harga',
    formatter: setNumberFormat
  }, {
    dataField: 'status_menu',
    text: 'Status',
    formatter: statusFormat
  }];

  function fetchData(param) { 
    console.log(param)
    axios.post('/app/gerai/menu', param).then(({data}) => {
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
    axios.post('app/gerai/menu/delete', {id_menu: selectedUser.id_menu, apikey: apikey}).then(({data}) => {
        if (data.status) {
          // if (page == 1) {
          //   fetchData(1, sizePerPage);
          // } else {
          //   setPage(1);
          // }
          // setTotal(totalSize - 1)
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
    setParam((prevState) => ({ ...prevState, page: 1, search: searchRef.current.value }))
  }

  return (
    <>
      <Modal zIndex={2000} centered isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Detail Menu</ModalHeader>
        <ModalBody>
          <Row>
            <Col xs={4}>Nama Menu</Col>
            <Col xs={8}>{": " + selectedUser.nama_menu}</Col>
          </Row>
          <Row>
            <Col xs={4}>Deskripsi</Col>
            <Col xs={8}>{": " + selectedUser.deskripsi_menu}</Col>
          </Row>
          <Row>
            <Col xs={4}>Tipe Menu</Col>
            <Col xs={8}>{": " + selectedUser.nama_tipe}</Col>
          </Row>
          <Row>
            <Col xs={4}>Harga</Col>
            <Col xs={8}>{modal ? ": " + addCommas(selectedUser.harga_menu) : ": " + selectedUser.harga_menu}</Col>
          </Row>
          <Row>
            <Col xs={4}>Status</Col>
            <Col xs={8}>{": " + selectedUser.status_menu}</Col>
          </Row>          
        </ModalBody>
        <ModalFooter>
          {/* <Button color="primary" onClick={toggle}>Do Something</Button>{' '} */}
          <Button color="secondary" onClick={toggle}>Tutup</Button>
        </ModalFooter>
      </Modal>
      <Modal zIndex={2000} centered isOpen={toDelete} toggle={toggleDelete}>
        <ModalHeader toggle={toggleDelete}>Apakah anda yakin untuk menghapus menu ini?</ModalHeader>
        <ModalBody>
          <Row>
            <Col xs={4}>Nama Menu</Col>
            <Col xs={8}>{": " + selectedUser.nama_menu}</Col>
          </Row>
          <Row>
            <Col xs={4}>Deskripsi</Col>
            <Col xs={8}>{": " + selectedUser.deskripsi_menu}</Col>
          </Row>
          <Row>
            <Col xs={4}>Tipe Menu</Col>
            <Col xs={8}>{": " + selectedUser.nama_tipe}</Col>
          </Row>
          <Row>
            <Col xs={4}>Harga</Col>
            <Col xs={8}>{toDelete ? ": " + addCommas(selectedUser.harga_menu) : ": " + selectedUser.harga_menu}</Col>
          </Row>
          <Row>
            <Col xs={4}>Status</Col>
            <Col xs={8}>{": " + selectedUser.status_menu}</Col>
          </Row>          
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={deleteHandler}>Delete</Button>
          <Button color="secondary" onClick={toggleDelete}>Tutup</Button>
        </ModalFooter>
      </Modal>
      <Card>
        <CardBody>
          <CardTitle>Daftar Menu</CardTitle>
          <Button color = "primary" onClick = {() => {history.push('menu/edit')} }>+ Tambah Menu</Button>
          <div className="my-2">
            <Label>Search</Label>
            <Input className="m-0" type="search" placeholder="Nama Menu" innerRef={searchRef} />
            <Button onClick={handleSearch} color="primary" className="mt-2">
              <FontAwesomeIcon icon={['fas', 'search']} />
              <span style={{ marginLeft: 10 }}>
                Cari
              </span>
            </Button>
          </div>
          <BootstrapTable
            remote
            keyField='id_menu'
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
            noDataIndication="Belum ada menu"
            wrapperClasses="table-responsive"
          />
        </CardBody>
      </Card>
    </>
  );
}
