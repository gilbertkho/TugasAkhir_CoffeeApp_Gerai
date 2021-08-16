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

export default function Period() {
  let history = useHistory();
  const [periods, setPeriods] = useState([]);
  let [totalSize, setTotal] = useState(0);
  let [page, setPage] = useState(1);
  const sizePerPage = 10;

  const [toDelete, setToDelete] = useState(false);
  const [selected, setSelected] = useState({});
    const [fetchDate, setFetchDate] = useState(new Date());// eslint-disable-line
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
            history.push('/master/period/edit', { period: row });
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
        {row.flagactive === 'Active' ? (
          <Button
            color="danger"
            className="mr-2"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              deactivate(row);
            }}>
            Nonaktifkan
          </Button>
        ) : (
          <Button
            color="success"
            className="mr-2"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              activate(row);
            }}>
            Aktifkan
          </Button>
        )}
      </div>
    );
  };

  const deleteHandler = async () => {
    toast.dismiss();
    try {
      let res = await axios.post(
        '/b/o/master/periodregister/delete',
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

  const activate = async (period) => {
    toast.dismiss();
    period.flagactive = 'Active';
    try {
      let res = await axios.post(
        '/b/o/master/periodregister/update',
        JSON.stringify(period)
      );
      if (res.data.st) {
        if (page === 1) {
          fetchData(1, sizePerPage);
        } else {
          setPage(1);
        }
      } else {
        toast.error(res.data.msg, { containerId: 'B', transition: Zoom });
      }
    } catch (error) {
      // if (!error.response) {
      //     toast.error(error.toString(), { containerId: 'B', transition: Zoom });
      //     return
      // }
      toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
    }
  };

  const deactivate = async (period) => {
    toast.dismiss();
    period.flagactive = 'Inactive';
    try {
      let res = await axios.post(
        '/b/o/master/periodregister/update',
        JSON.stringify(period)
      );
      if (res.data.st) {
        if (page === 1) {
          fetchData(1, sizePerPage);
        } else {
          setPage(1);
        }
      } else {
        toast.error(res.data.msg, { containerId: 'B', transition: Zoom });
      }
    } catch (error) {
      // if (!error.response) {
      //     toast.error(error.toString(), { containerId: 'B', transition: Zoom });
      //     return
      // }
      toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
    }
  };

  function activeFormater(cell, row) {
    if (cell === 'Active') {
      return (
        <span>
          <strong style={{ color: 'green' }}>{cell}</strong>
        </span>
      );
    }

    return <span style={{ color: 'red' }}>{cell}</span>;
  }

  const columns = [
    {
      dataField: 'action',
      text: 'Action',
      formatter: GetActionFormat,
      headerStyle: () => {
        return { width: '300px' };
      }
    },
    {
      dataField: 'yearperiod',
      text: 'Periode'
    },
    {
      dataField: 'wavenum',
      text: 'Gelombang'
    },
    {
      dataField: 'flagactive',
      text: 'Active',
      formatter: activeFormater
    },
    {
      dataField: 'description',
      text: 'Description'
    }
  ];

  const handleTableChange = (type, { page }) => {
    setPage(page);
    // fetchData(page, sizePerPage);
  };

  async function fetchData(page, sizePerPage) {
    try {
      let res = await axios.post(
        '/b/o/master/periodregister',
        JSON.stringify({
          page: page,
          count: sizePerPage
        })
      );
      let data = res.data;
      if (data.st) {
        data.data.list.forEach((element) => {
          element.action = element.id + '-' + element.flagactive;
        });
        setTotal(data.data.total);
        setPeriods(data.data.list);
        setFetchDate(new Date());
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
            <Col xs={3}>Periode</Col>
            <Col xs={9}>{': ' + selected.yearperiod}</Col>
          </Row>
          <Row>
            <Col xs={3}>Gelombang</Col>
            <Col xs={9}>{': ' + selected.wavenum}</Col>
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
          <CardTitle>Daftar Periode Registrasi</CardTitle>
          <div className="mt-2 mb-2">
            <Button
              color="primary"
              onClick={() => {
                history.push('/master/period/create');
              }}>
              <span style={{ marginRight: 10 }}>Tambah Periode</span>
              <FontAwesomeIcon icon={['fas', 'plus']} />
            </Button>
          </div>
          <BootstrapTable
            remote
            keyField="id"
            data={periods}
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
