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

export default function ListPendaftar() {

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
  const [selected, setSelected] = useState({});
  const [period, setPeriod] = useState([]);
  const toggleDelete = (user) => {
    setToDelete(!toDelete);
    setSelectedUser(user)
  };

  const toEditUser = (user) => history.push('/master/pendaftar/edit', { user: user });

  const [modal, setModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});

  const toggle = () => { setModal(!modal) };
  const toggleEdit = (user) => { getDetailRegister(user.id); setModal(!modal); setSelectedUser(user) };

  // useEffect(() => { console.log(totalSize) }, [totalSize]);

  const GetActionFormat = (cell, row) => {
    // console.log(cell);
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
  }, {
    dataField: 'regcount',
    text: 'Total'
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
    axios.post('/b/o/master/registered', JSON.stringify(param)).then(res => res.data)
      .then(data => {
        if (data.st) {
          setTotal(data.data.total)
          setUsers(data.data.list)
        } else {
          toast.error(data.msg, { containerId: 'B', transition: Zoom });
        }
      }).catch(error => {
        // if (!error.response) {
        //   alert(error)
        //   return
        // }
        toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
      })
  }

  function getDetailRegister(id) {
    toast.dismiss();
    axios.post('/b/o/master/registered/period', JSON.stringify({ id: id })).then(res => res.data)
      .then(data => {
        // console.log("period", data);
        setPeriod(data.data);
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
      let res = await axios.post('/b/o/master/registered/delete', JSON.stringify({
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
        <ModalHeader toggle={toggle}>Detail Pendaftar</ModalHeader>
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
          <hr />
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
          <hr />
          <Row>
            <Col xs={4}>Sekolah</Col>
            <Col xs={8}>{": " + selectedUser.schoolname}</Col>
          </Row>
          <Row>
            <Col xs={4}>Jurusan</Col>
            <Col xs={8}>{": " + selectedUser.major}</Col>
          </Row>
          {selectedUser.major == 'SMK' &&
            <Row>
              <Col xs={4}>Jurusan SMK</Col>
              <Col xs={8}>{": " + selectedUser.majordetail}</Col>
            </Row>
          }
          <Row>
            <Col xs={4}>Tahun Lulus</Col>
            <Col xs={8}>{": " + selectedUser.graduateyear}</Col>
          </Row>
          <hr />
          <Row>
            <Col xs={4}>Agama</Col>
            <Col xs={8}>{": " + selectedUser.religion}</Col>
          </Row>
          <Row>
            <Col xs={4}>Tanggal Baptis</Col>
            {selectedUser.baptismdate != '' ?
              <Col xs={8}>{": " + moment(selectedUser.baptismdate).format('DD-MM-YYYY')}</Col>
              :
              <Col xs={8}>{": " + selectedUser.baptismdate}</Col>
            }
          </Row>
          <Row>
            <Col xs={4}>Nama Gereja</Col>
            <Col xs={8}>{": " + selectedUser.churchname}</Col>
          </Row>
          <hr />
          <Row>
            <Col xs={4}>Total Mendaftar</Col>
            <Col xs={8}>{": " + selectedUser.regcount}</Col>
          </Row>
          {(period.length > 0) &&
            <div className="table-responsive-md">
              <Table className="text-nowrap mb-0">
                <thead className="thead-light">
                  <tr>
                    <th>Tahun</th>
                    <th>Gelombang</th>
                  </tr>
                </thead>
                <tbody>
                  {(period.map((pdetail) => {
                    return <tr>
                      <td>
                        <div className="align-box-row">
                          {pdetail.yearperiod}
                        </div>
                      </td>
                      <td>
                        {pdetail.wavenum}
                      </td>
                    </tr>
                  }))}
                </tbody>
              </Table>
            </div>
          }
          <hr />
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
          <hr />
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
          <hr />
          <Row>
            <Col xs={4}>Sekolah</Col>
            <Col xs={8}>{": " + selectedUser.schoolname}</Col>
          </Row>
          <Row>
            <Col xs={4}>Jurusan</Col>
            <Col xs={8}>{": " + selectedUser.major}</Col>
          </Row>
          {selectedUser.major == 'SMK' &&
            <Row>
              <Col xs={4}>Jurusan SMK</Col>
              <Col xs={8}>{": " + selectedUser.majordetail}</Col>
            </Row>
          }
          <Row>
            <Col xs={4}>Tahun Lulus</Col>
            <Col xs={8}>{": " + selectedUser.graduateyear}</Col>
          </Row>
          <hr />
          <Row>
            <Col xs={4}>Agama</Col>
            <Col xs={8}>{": " + selectedUser.religion}</Col>
          </Row>
          <Row>
            <Col xs={4}>Tanggal Baptis</Col>
            {selectedUser.baptismdate != '' ?
              <Col xs={8}>{": " + moment(selectedUser.baptismdate).format('DD-MM-YYYY')}</Col>
              :
              <Col xs={8}>{": " + selectedUser.baptismdate}</Col>
            }
          </Row>
          <Row>
            <Col xs={4}>Nama Gereja</Col>
            <Col xs={8}>{": " + selectedUser.churchname}</Col>
          </Row>
          <hr />
          <Row>
            <Col xs={4}>Total Mendaftar</Col>
            <Col xs={8}>{": " + selectedUser.regcount}</Col>
          </Row>
          <hr />
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
          <CardTitle>Daftar Pendaftar</CardTitle>
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
            noDataIndication="Belum ada pendaftar"
            wrapperClasses="table-responsive"
          />
        </CardBody>
      </Card>
    </>
  );
}
