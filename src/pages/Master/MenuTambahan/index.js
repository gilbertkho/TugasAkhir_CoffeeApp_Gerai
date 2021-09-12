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

export default function ListMenuTambahan() {

  const history = useHistory();
  const [apikey, setApikey] = useState('')
  const [users, setUsers] = useState([]);
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
  const toggleDelete = (user) => {
    setToDelete(!toDelete);
    setSelectedUser(user)
  };

  const toEditUser = (user) => history.push('/master/menu_tambahan/edit', { user: user });

  const [modal, setModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});

  const toggle = () => { setModal(!modal) };

  const GetActionFormat = (cell, row) => {
    console.log(row);
    return (
      <div>
        {/* <Button color="primary" className="mr-2" size="sm" onClick={(e) => { e.stopPropagation(); toggleEdit(row) }}>
          <FontAwesomeIcon icon={['fa', 'info-circle']} />
        </Button> */}
        <Button color="primary" className="mr-2" size="sm" onClick={(e) => { e.stopPropagation(); toEditUser(row) }}>
          <FontAwesomeIcon icon={['fa', 'edit']} />
        </Button>
        <Button color="danger" className="mr-2" size="sm" onClick={(e) => { e.stopPropagation(); toggleDelete(row) }}>
          <FontAwesomeIcon icon={['fa', 'trash-alt']} />
        </Button>
      </div>
    );
  }

  const addCommas = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const formatHarga = (cell,row) => {
    return(
      <>
        {addCommas(row.harga_menu)}
      </>
    )
  }

  const columns = [{
    dataField: 'action',
    text: 'Action',
    formatter: GetActionFormat,
    headerStyle: (column, colIndex) => {
      return { width: '200px' };
    }
  }, {
    dataField: 'nama_menu',
    text: 'Nama Menu Tambahan'
  }, {
    dataField: 'harga_menu',
    text: 'Harga Menu Tambahan',
    formatter: formatHarga
  }];

  function fetchData(param) { 
    console.log(param)    
    axios.post('/app/gerai/menu_tambahan', param).then(({data}) => {
        console.log(data.data)
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
        setApikey(key.key);
        setParam({...param, apikey: key.key});
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
    axios.post('app/gerai/menu_tambahan/delete', {id_menu_tambahan: selectedUser.id_menu_tambahan, apikey: apikey}).then(({data}) => {
        console.log(data);
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
    setParam((prevState) => ({ ...prevState, page: 1, search: searchRef.current.value }))
  }

  return (
    <>
      <Modal zIndex={2000} centered isOpen={toDelete} toggle={toggleDelete}>
        <ModalHeader toggle={toggleDelete}>Apakah anda yakin untuk menghapus tipe menu ini?</ModalHeader>
        <ModalFooter>
          <Button color="danger" onClick={deleteHandler}>Delete</Button>
          <Button color="secondary" onClick={toggleDelete}>Tutup</Button>
        </ModalFooter>
      </Modal>
      <Card>
        <CardBody>
          <CardTitle>Daftar Menu Tambahan</CardTitle>
          <Button color = "primary" onClick = {() => {history.push('menu_tambahan/edit')} }>+ Tambah Menu Tambahan</Button>
          <div className="my-2">
            <Label>Search</Label>
            <Input className="m-0" type="search" placeholder="Nama Menu Tambahan" innerRef={searchRef} />
            <Button onClick={handleSearch} color="primary" className="mt-2">
              <FontAwesomeIcon icon={['fas', 'search']} />
              <span style={{ marginLeft: 10 }}>
                Cari
              </span>
            </Button>
          </div>
          <BootstrapTable
            remote
            keyField='id_menu_tambahan'
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
            noDataIndication="Belum ada menu tambahan"
            wrapperClasses="table-responsive"
          />
        </CardBody>
      </Card>
    </>
  );
}
