import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Button,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Container,
  Label,
  Input
} from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { useHistory } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'config/axios';
import { toast, Zoom } from 'react-toastify';
import Errormsg from 'config/errormsg';

export default function School() {
  let history = useHistory();
  const [data, setData] = useState([]);
  let [totalSize, setTotal] = useState(0);
  let [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const searchRef = useRef();
  const sizePerPage = 10;

  const [toDelete, setToDelete] = useState(false);
  const [selected, setSelected] = useState({});
  const toggleDelete = (period) => {
    setToDelete(!toDelete);
    setSelected(period);
  };

  const GetActionFormat = (cell, row) => {
    return (
      <div>
        <Button
          color="primary"
          className="mr-2"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            history.push('/master/school/edit', { school: row });
          }}>
          <FontAwesomeIcon icon={['fa', 'edit']} />
        </Button>
        <Button
          color="danger"
          className="mr-2"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleDelete(row);
          }}>
          <FontAwesomeIcon icon={['fa', 'trash-alt']} />
        </Button>
      </div>
    );
  };

  const deleteHandler = async () => {
    toast.dismiss();
    try {
      let res = await axios.post(
        '/b/o/master/schools/delete',
        JSON.stringify({
          id: selected.id
        })
      );
      if (res !== null || res !== undefined) {
        if (res.data.st) {
          window.location.reload();
        } else {
          toast.error(res.data.msg, { containerId: 'B', transition: Zoom });
        }
      }
    } catch (error) {
      toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
    }
  };

  const columns = [
    {
      dataField: 'action',
      text: 'Action',
      formatter: GetActionFormat,
      headerStyle: { minWidth: '10em' }
    },
    {
      dataField: 'name',
      text: 'Nama Sekolah'
    },
    {
      dataField: 'province',
      text: 'Provinsi'
    },
    {
      dataField: 'city',
      text: 'Kota/Kabupaten'
    },
    {
      dataField: 'district',
      text: 'Kecamatan'
    },
    {
      dataField: 'schooltype',
      text: 'Bentuk'
    },
    {
      dataField: 'address',
      text: 'Alamat'
    }
  ];

  //handleTableChange (type, {page, sizePerPage})
  const handleTableChange = (_type, { page }) => {
    setPage(page);
    // fetchData(page, sizePerPage);
  };

  function handleSearch(e) {
    e.preventDefault();
    setSearch(searchRef.current.value);
  }

  async function fetchData(page, sizePerPage, search = '') {
    try {
      let res = await axios.post(
        '/b/o/master/schools',
        JSON.stringify({
          page: page,
          count: sizePerPage,
          search: search
        })
      );
      let data = res.data;
      if (data.st) {
        setTotal(data.data.total);
        setData(data.data.list);
      } else {
        toast.error(data.msg, { containerId: 'B', transition: Zoom });
      }
    } catch (error) {
      // if (!error.response) {
      //     toast.error(error.toString(), { containerId: 'B', transition: Zoom });
      //     return
      // }
      toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
    }
  }

  useEffect(() => {
    fetchData(page, sizePerPage, search);
  }, [page, search]);

  return (
    <>
      <Modal zIndex={2000} centered isOpen={toDelete} toggle={toggleDelete}>
        <ModalHeader toggle={toggleDelete}>
          Apakah anda yakin untuk menghapus?
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col xs={3}>ID</Col>
            <Col xs={9}>{': ' + selected.id}</Col>
          </Row>
          <Row>
            <Col xs={3}>Sekolah</Col>
            <Col xs={9}>{': ' + selected.name}</Col>
          </Row>
          <Row>
            <Col xs={3}>Provinsi</Col>
            <Col xs={9}>{': ' + selected.province}</Col>
          </Row>
          <Row>
            <Col xs={3}>Kota/Kabupaten</Col>
            <Col xs={9}>{': ' + selected.city}</Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={deleteHandler}>
            Delete
          </Button>
          <Button color="secondary" onClick={toggleDelete}>
            Tutup
          </Button>
        </ModalFooter>
      </Modal>
      <Card>
        <CardBody>
          <CardTitle>Daftar Sekolah</CardTitle>
          <Container style={{ marginLeft: 0 }}>
            <Row lg={4}>
              <Button
                color="primary"
                style={{ marginRight: '1rem', marginBottom: '1rem' }}
                onClick={() => {
                  history.push('/master/school/create');
                }}>
                <span style={{ marginRight: 10 }}>Tambah Sekolah</span>
                <FontAwesomeIcon icon={['fas', 'plus']} />
              </Button>
              <Button
                outline
                color="primary"
                style={{ marginBottom: '1rem' }}
                onClick={() => {
                  history.push('/master/school/import');
                }}>
                <span style={{ marginRight: 10 }}>Import dari Excel</span>
                <FontAwesomeIcon icon={['fas', 'plus']} />
              </Button>
            </Row>
            <Row className="mt-2 mb-4">
              <Label>Search</Label>
              <Input
                className="m-0"
                type="search"
                placeholder="Nama atau Kota"
                innerRef={searchRef}
              />
              <Button onClick={handleSearch} color="primary" className="mt-2">
                <FontAwesomeIcon icon={['fas', 'search']} />
                <span style={{ marginLeft: 10 }}>Cari</span>
              </Button>
            </Row>
          </Container>
          <BootstrapTable
            remote
            keyField="id"
            data={data}
            columns={columns}
            bodyClasses="bootstrap-table"
            pagination={paginationFactory({
              hideSizePerPage: true,
              hidePageListOnlyOnePage: true,
              page,
              sizePerPage,
              totalSize
            })}
            onTableChange={handleTableChange}
            noDataIndication="Belum ada data"
            wrapperClasses="table-responsive"
          />
        </CardBody>
      </Card>
    </>
  );
}
