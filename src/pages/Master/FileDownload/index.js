import React, { useEffect, useState } from 'react';
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
  ModalBody
} from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { useHistory } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'config/axios';
import { toast, Zoom } from 'react-toastify';
import Errormsg from 'config/errormsg';

export default function File() {
  let history = useHistory();
  const [files, setFiles] = useState([]);
  let [totalSize, setTotal] = useState(0);
  let [page, setPage] = useState(1);
  const sizePerPage = 10;

  const [toDelete, setToDelete] = useState(false);
  const [selected, setSelected] = useState({});
  const toggleDelete = (file) => {
    setToDelete(!toDelete);
    setSelected(file);
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
            history.push('/master/file/edit', { file: row });
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
  const getFileUrl = (cell, row) => {
    let url = axios.defaults.baseURL;
    url = url + 'serve/file/0/' + cell;
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        Lihat
      </a>
    );
  };

  const getLevel = (cell, row) => {
    let tahap = '';
    switch (cell) {
      case 1:
        tahap = 'Tahap I';
        break;
      case 2:
        tahap = 'Tahap II';
        break;
      case 3:
        tahap = 'Tahap III';
        break;
      case 4:
        tahap = 'Tahap IV';
        break;
      case 5:
        tahap = 'Tahap V';
        break;
      case 6:
        tahap = 'Tahap FINAL';
        break;

      default:
        break;
    }
    return tahap;
  };

  const deleteHandler = async () => {
    toast.dismiss();
    try {
      let res = await axios.post(
        '/b/o/master/files/delete',
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
      text: 'Name'
    },
    {
      dataField: 'level',
      text: 'Tahap',
      formatter: getLevel
    },
    {
      dataField: 'pathfile',
      text: 'Lihat',
      formatter: getFileUrl
    }
  ];

  const handleTableChange = (type, { page }) => {
    setPage(page);
  };

  async function fetchData(page, sizePerPage) {
    try {
      let res = await axios.post(
        '/b/o/master/files',
        JSON.stringify({
          page: page,
          count: sizePerPage
        })
      );
      let data = res.data;
      if (data.st) {
        setTotal(data.data.total);
        setFiles(data.data.list);
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
    fetchData(page, sizePerPage);
  }, [page]);

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
            <Col xs={3}>Name</Col>
            <Col xs={9}>{': ' + selected.name}</Col>
          </Row>
          <Row>
            <Col xs={3}>FilePath</Col>
            <Col xs={9}>{': ' + selected.pathfile}</Col>
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
          <CardTitle>Daftar File Download</CardTitle>
          <div className="mt-2 mb-2">
            <Button
              color="primary"
              onClick={() => {
                history.push('/master/file/create');
              }}>
              <span style={{ marginRight: 10 }}>Tambah File</span>
              <FontAwesomeIcon icon={['fas', 'plus']} />
            </Button>
          </div>
          <BootstrapTable
            remote
            keyField="id"
            data={files}
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
