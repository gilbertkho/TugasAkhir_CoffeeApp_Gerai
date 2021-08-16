/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';

import { useHistory } from 'react-router-dom';
import {
  Card, CardTitle, CardBody, Button, Modal, ModalHeader,
  ModalBody, ModalFooter, Row, Col, Label, Input
} from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import axios from "config/axios";
import urlConfig from "config/backend";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast, Zoom } from 'react-toastify';
import moment from "moment";
import Errormsg from 'config/errormsg';

export default function UserList() {

  const history = useHistory();
  const [users, setUsers] = useState([]);
  let [totalSize, setTotal] = useState(0);
  let [page, setPage] = useState(1);
  const sizePerPage = 10;
  const searchRef = useRef();
  const [param, setParam] = useState({
    page: 1,
    count: sizePerPage,
    search: ''
  });

  const [toDelete, setToDelete] = useState(false);
  const [selected, setSelected] = useState({})
  const toggleDelete = (user) => {
    setToDelete(!toDelete);
    setSelectedUser(user)
  };

  const toEditUser = (user) => history.push('/master/user/edit', { user: user });

  const [modal, setModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});

  const toggle = (user) => { setModal(!modal); setSelectedUser(user) };

  // useEffect(() => { console.log(totalSize) }, [totalSize]);

  const GetActionFormat = (cell, row) => {
    // console.log(cell);
    return (
      <div>
        <Button color="primary" className="mr-2" size="sm" onClick={(e) => { e.stopPropagation(); toggle(row) }}>
          <FontAwesomeIcon icon={['fa', 'info-circle']} />
        </Button>
        <Button color="primary" className="mr-2" size="sm" onClick={(e) => { e.stopPropagation(); toEditUser(row) }}>
          <FontAwesomeIcon icon={['fa', 'edit']} />
        </Button>
        <Button color="danger" size="sm" onClick={(e) => { e.stopPropagation(); toggleDelete(row) }}>
          <FontAwesomeIcon icon={['fa', 'trash-alt']} />
        </Button>
      </div>
    );
  }

  const columns = [{
    dataField: 'action',
    text: 'Action',
    formatter: GetActionFormat,
    headerStyle: (column, colIndex) => {
      return { width: '240px' };
    }
  }, {
    dataField: 'fullname',
    text: 'Nama'
  }, {
    dataField: 'email',
    text: 'Email'
  }, {
    dataField: 'mobile',
    text: 'No HP'
  }];

  const selectRow = {
    mode: 'checkbox',
    clickToSelect: true,
    hideSelectAll: true,
    selectColumnStyle: { width: 40 },
    onSelect: (row, isSelect, rowIndex, e) => {
      // console.log(row.id);
      // console.log(isSelect);
      // console.log(rowIndex);
      // console.log(e);
    },
  };

  function fetchData(param) {
    axios.post('/b/o/master/users', JSON.stringify(param)).then(res => res.data)
      .then(data => {
        if (data.st) {
          setTotal(data.data.total)
          setUsers(data.data.list)
        } else {
          toast.error(data.msg, { containerId: 'B', transition: Zoom })
        }
      }).catch(error => {
        // if (!error.response) {
        //   alert(error)
        //   return
        // }
        toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
      })
  }

  useEffect(() => {
    fetchData(param)
  }, [param]);

  const handleTableChange = (type, { page, sizePerPage }) => {
    setParam((prevState) => ({
      ...prevState,
      page: page
    }))
  }

  const deleteHandler = async () => {
    toast.dismiss();
    try {
      let res = await axios.post('/b/o/master/users/delete', JSON.stringify({
        id: selectedUser.id
      }))
      if (res.data.st) {
        if (page == 1) {
          fetchData(1, sizePerPage);
        } else {
          setPage(1);
        }
        toggleDelete({});
      }
    } catch (error) {
      toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setParam((prevState) => ({ ...prevState, search: searchRef.current.value }))
  }

  return (
    <>
      <Modal zIndex={2000} centered isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Detail User</ModalHeader>
        <ModalBody>
          <Row>
            <Col xs={4}>Nama</Col>
            <Col xs={8}>{": " + selectedUser.fullname}</Col>
          </Row>
          <Row>
            <Col xs={4}>Email</Col>
            <Col xs={8}>{": " + selectedUser.email}</Col>
          </Row>
          <Row>
            <Col xs={4}>Jenis Kelamin</Col>
            <Col xs={8}>: {selectedUser.gender == 'Male' ? 'Laki-laki' : 'Perempuan'}</Col>
          </Row>
          <Row>
            <Col xs={4}>No HP</Col>
            <Col xs={8}>{": " + selectedUser.mobile}</Col>
          </Row>
          <Row>
            <Col xs={4}>Tempat Lahir</Col>
            <Col xs={8}>{": " + selectedUser.birthplace}</Col>
          </Row>
          <Row>
            <Col xs={4}>Tanggal Lahir</Col>
            {selectedUser.birthdate != '' ?
              <Col xs={8}>{": " + moment(selectedUser.birthdate).format('DD-MM-YYYY')}</Col>
              :
              <Col xs={8}>{": " + selectedUser.birthdate}</Col>
            }
          </Row>
          <Row>
            <Col xs={4}>Alamat</Col>
            <Col xs={8}>{": " + selectedUser.address}</Col>
          </Row>
          <Row>
            <Col xs={4}>Kota</Col>
            <Col xs={8}>{": " + selectedUser.city}</Col>
          </Row>
          <Row>
            <Col xs={4}>Provinsi</Col>
            <Col xs={8}>{": " + selectedUser.province}</Col>
          </Row>
          <Row>
            <Col xs={4}>Foto</Col>
            <Col xs={8}>
              {selectedUser.profilepicture != '' &&
                <img style={{ maxWidth: 200, maxHeight: 200 }} src={urlConfig.urlBackendProfile + selectedUser.profilepicture} />
              }
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          {/* <Button color="primary" onClick={toggle}>Do Something</Button>{' '} */}
          <Button color="secondary" onClick={toggle}>Tutup</Button>
        </ModalFooter>
      </Modal>
      <Modal zIndex={2000} centered isOpen={toDelete} toggle={toggleDelete}>
        <ModalHeader toggle={toggleDelete}>Apakah anda yakin untuk menghapus?</ModalHeader>
        <ModalBody>
          <Row>
            <Col xs={4}>Nama</Col>
            <Col xs={8}>{": " + selectedUser.fullname}</Col>
          </Row>
          <Row>
            <Col xs={4}>Email</Col>
            <Col xs={8}>{": " + selectedUser.email}</Col>
          </Row>
          <Row>
            <Col xs={4}>Jenis Kelamin</Col>
            <Col xs={8}>: {selectedUser.gender == 'Male' ? 'Laki-laki' : 'Perempuan'}</Col>
          </Row>
          <Row>
            <Col xs={4}>No HP</Col>
            <Col xs={8}>{": " + selectedUser.mobile}</Col>
          </Row>
          <Row>
            <Col xs={4}>Tempat Lahir</Col>
            <Col xs={8}>{": " + selectedUser.birthplace}</Col>
          </Row>
          <Row>
            <Col xs={4}>Tanggal Lahir</Col>
            {selectedUser.birthdate != '' ?
              <Col xs={8}>{": " + moment(selectedUser.birthdate).format('DD-MM-YYYY')}</Col>
              :
              <Col xs={8}>{": " + selectedUser.birthdate}</Col>
            }
          </Row>
          <Row>
            <Col xs={4}>Alamat</Col>
            <Col xs={8}>{": " + selectedUser.address}</Col>
          </Row>
          <Row>
            <Col xs={4}>Kota</Col>
            <Col xs={8}>{": " + selectedUser.city}</Col>
          </Row>
          <Row>
            <Col xs={4}>Provinsi</Col>
            <Col xs={8}>{": " + selectedUser.province}</Col>
          </Row>
          <Row>
            <Col xs={4}>Foto</Col>
            <Col xs={8}>
              {selectedUser.profilepicture != '' &&
                <img style={{ maxWidth: 200, maxHeight: 200 }} src={urlConfig.urlBackendProfile + selectedUser.profilepicture} />
              }
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={deleteHandler}>Delete</Button>
          <Button color="secondary" onClick={toggleDelete}>Tutup</Button>
        </ModalFooter>
      </Modal>
      <Card>
        <CardBody>
          <CardTitle>Daftar User</CardTitle>
          <div className="mb-2">
            <Button color="primary" size="md" className="mr-2" onClick={(e) => { history.push('/master/user/edit') }}>
              <span style={{ marginRight: 10 }}>
                Tambah User
              </span>
              <FontAwesomeIcon icon={['fas', 'plus']} />
            </Button>
          </div>
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
            keyField='id'
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
            noDataIndication="Belum ada user"
            wrapperClasses="table-responsive"
          />
        </CardBody>
      </Card>
    </>
  );
}
