/* eslint-disable */
import React, { Fragment, useState, useEffect, useRef } from 'react';

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
import localForage from 'config/localForage';
import Errormsg from 'config/errormsg';
import { faSortNumericUpAlt } from '@fortawesome/free-solid-svg-icons';

export default function Ujian() {
  const [user, setUser] = useState({
    email: "",
    pict: "",
    tu: "Internal",
    uid: ""
  });

  useEffect(() => {
    (async function () {
      let user = await localForage.getItem('user');
      setUser(user);
    })()
  }, []);

  const history = useHistory();
  const [req, setReq] = useState([]);
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
  const toggleDelete = (req) => {
    setToDelete(!toDelete);
    setSelectedReq(req)
  };

  const toEditReq = (req) => history.push('/master/ujian/kategori/edit', { req: req, admin: user.tu === "Administrator" });

  const [modal, setModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState({});
  const [sort, setSort] = useState(false);  
  const toggle = (req) => { setModal(!modal); setSelectedReq(req) };

  // useEffect(() => { console.log(totalSize) }, [totalSize]);

  const GetActionFormat = (cell, row) => {      
    return (      
      <div>
        <Button color="primary" className="mr-2" size="sm" onClick={(e) => { e.stopPropagation(); toggle(row) }}>
          <FontAwesomeIcon icon={['fa', 'info-circle']} />
        </Button>
        <Button color="primary" className="mr-2" size="sm" onClick={(e) => { e.stopPropagation(); toEditReq(row) }}>
          <FontAwesomeIcon icon={['fa', 'edit']} />
        </Button>
        <Button color="danger" className="mr-2" size="sm"
          disabled={user.tu !== "Administrator"}
          onClick={(e) => {
            e.stopPropagation();
            // if (user.tu === "Administrator") {
              toggleDelete(row)
            // }
          }}>
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
      return { width: '230px' };
    }
  }, {
    dataField: 'name',
    text: 'Kategori'
  }, {
    dataField: 'total',
    text: 'Jumlah Soal'
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
    axios.post('/b/o/master/exam/categories',JSON.stringify(param)).then(res => res.data)
      .then(data => {
        if (data.st) {
          console.log(data)
          setTotal(data.data.total)
          setReq(data.data.list)
          // columns.forEach()
          console.log(data.data.list);
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
      let res = await axios.post('/b/o/master/exam/categories/delete', JSON.stringify({
        id: selectedReq.id
      }))
      if (res.data.st) {
        if (param.page == 1) {
          fetchData(param);
        } else {
          setParam((prevState) => ({
            ...prevState,
            page: 1
          }));
        }
        toggleDelete({});
        toast.success("Kategori ujian berhasil dihapus", { containerId: 'B', transition: Zoom });
      } else {
        toast.error(res.data.msg, { containerId: 'B', transition: Zoom });
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
        <ModalHeader toggle={toggle}>Detail Kategori Ujian</ModalHeader>
        <ModalBody>
          <Row>
            <Col xs={4}>Nama</Col>
            <Col xs={8}>{": " + selectedReq.name}</Col>
          </Row>
          {/* <Row>
            <Col xs={4}>Code</Col>
            <Col xs={8}>{": " + selectedReq.code}</Col>
          </Row> */}
          <Row>
            <Col xs={4}>Deskripsi</Col>
            <Col xs={8}>{": " + selectedReq.description}</Col>
          </Row>
          {(selectedReq.requirement && selectedReq.requirement.map((req, index) => {
            if (index == 0) {
              return <Row>
                <Col xs={4}>Kategori</Col>
                <Col xs={8}>{": - " + req.type + " (" + req.condition + ")"}</Col>
              </Row>
            } else {
              return <Row>
                <Col xs={{ size: 8, offset: 4 }}>&nbsp; - {req.type + " (" + req.condition + ")"}</Col>
              </Row>
            }
          }))}
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
            <Col xs={8}>{": " + selectedReq.name}</Col>
          </Row>
          {/* <Row>
            <Col xs={4}>Code</Col>
            <Col xs={8}>{": " + selectedReq.code}</Col>
          </Row> */}
          <Row>
            <Col xs={4}>Deskripsi</Col>
            <Col xs={8}>{": " + selectedReq.description}</Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={deleteHandler}>Delete</Button>
          <Button color="secondary" onClick={toggleDelete}>Tutup</Button>
        </ModalFooter>
      </Modal>
      <Card>
        <CardBody>
          <CardTitle>Kategori Ujian</CardTitle>
          {/* {
            user.tu === "Administrator" &&             */}
            <div className="mb-2">
              <Button color="primary" size="md" className="mr-2" onClick={(e) => {
                history.push('/master/ujian/kategori/edit', { admin: user.tu === "Administrator" })
              }}>
                <span style={{ marginRight: 10 }}>
                  Tambah Kategori
            </span>
                <FontAwesomeIcon icon={['fas', 'plus']} />
              </Button>                          
            </div>
          {/* } */}

          {/* <div className="my-2">                      
            <Label>Search</Label>
            <Input className="m-0" type="search" placeholder="" innerRef={searchRef} />
            <Button onClick={handleSearch} color="primary" className="mt-2">
              <FontAwesomeIcon icon={['fas', 'search']} />
              <span style={{ marginLeft: 10 }}>
                Cari
              </span>
            </Button>
          </div> */}
          <BootstrapTable
            remote
            keyField='id'
            data={req}
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
            noDataIndication="Belum ada kategori ujian"
            wrapperClasses="table-responsive"
          />
        </CardBody>
      </Card>
    </>
  );
}
