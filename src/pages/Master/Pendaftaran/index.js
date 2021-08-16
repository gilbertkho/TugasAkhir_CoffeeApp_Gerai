import React, { useEffect, useState, useRef } from 'react';
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
  Input,
  Label
} from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { useHistory } from 'react-router';
import axios from 'config/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast, Zoom } from 'react-toastify';
import Errormsg from 'config/errormsg';

export function getPPUrl(path) {
  let url = axios.defaults.baseURL;
  url = url + 'serve/register/0/' + path;
  return url;
}

function getPPFormat(cell, row) {
  let url = getPPUrl(cell);
  return <a href={url}>{cell}</a>;
}

export default function Pendaftaran() {
  let history = useHistory();
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState({
    period: null,
    wave: []
  });
  let [totalSize, setTotal] = useState(0);
  const sizePerPage = 10;
  const [param, setParam] = useState({
    page: 1,
    count: sizePerPage,
    search: '',
    yearperiod: '',
    wavenum: ''
  });

  const searchRef = useRef();

  const [toDelete, setToDelete] = useState(false);
  const [selected, setSelected] = useState({});
  const toggleDelete = (register) => {
    setToDelete(!toDelete);
    setSelected(register);
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
            history.push('/master/pendaftaran/edit', { register: row });
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
        '/b/o/master/register/delete',
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

  const handleSearch = (e) => {
    e.preventDefault();
    setParam((prevState) => ({
      ...prevState,
      search: searchRef.current.value
    }));
  };

  const columns = [
    {
      dataField: 'action',
      text: 'Action',
      formatter: GetActionFormat,
      headerStyle: { minWidth: '10em' }
    },
    {
      dataField: 'fullname',
      text: 'Name'
    },
    {
      dataField: 'email',
      text: 'Email'
    },
    {
      dataField: 'code',
      text: 'Code'
    },
    {
      dataField: 'gender',
      text: 'Gender'
    },
    {
      dataField: 'birthplace',
      text: 'Birthplace'
    },
    {
      dataField: 'birthdate',
      text: 'Birthdate'
    },
    {
      dataField: 'mobile',
      text: 'Mobile'
    },
    {
      dataField: 'address',
      text: 'Address'
    },
    {
      dataField: 'schoolname',
      text: 'School Name'
    },
    {
      dataField: 'major',
      text: 'Major'
    },
    {
      dataField: 'majordetail',
      text: 'Major Detail'
    },
    {
      dataField: 'province',
      text: 'Province'
    },
    {
      dataField: 'city',
      text: 'City'
    },
    {
      dataField: 'graduateyear',
      text: 'Graduate Year'
    },
    {
      dataField: 'religion',
      text: 'Religion'
    },
    {
      dataField: 'baptismdate',
      text: 'Baptism Date'
    },
    {
      dataField: 'churchname',
      text: 'Church Name'
    },
    {
      dataField: 'socialaccount',
      text: 'Social Account'
    },
    {
      dataField: 'profilepicture',
      text: 'Profile Picture',
      formatter: getPPFormat
    },
    {
      dataField: 'created',
      text: 'Tanggal Pendaftaran'
    },
    {
      dataField: 'allowcontact',
      text: 'Allow Contact'
    },
    {
      dataField: 'regstatus',
      text: 'Status'
    },
    {
      dataField: 'regrepeat',
      text: 'Repeat'
    },
    {
      dataField: 'regrepeatcount',
      text: 'Repeat Count'
    }
  ];

  const handleTableChange = (_type, { page }) => {
    setParam((prevState) => ({
      ...prevState,
      page: page
    }));
  };

  async function fetchData(param) {
    try {
      let res = await axios.post('/b/o/master/register', JSON.stringify(param));
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

  async function fetchPeriod() {
    try {
      let res = await axios.post(
        '/b/o/master/periodregister',
        JSON.stringify({
          page: 1,
          count: 30
        })
      );
      if (!res.data.st) {
        toast.error(res.data.msg, { containerId: 'B', transition: Zoom });
        return;
      }
      let data = res.data.data.list;
      let periods = [];
      data.forEach((x) => {
        let period = {
          period: x.yearperiod,
          wave: [x.wavenum]
        };
        let y = periods.find((element) => element.period === period.period);
        if (y) {
          y.wave = [...y.wave, ...period.wave];
        } else periods.push(period);
      });
      setPeriod(periods);
    } catch (error) {
      // if (!error.response) {
      //     toast.error(error.toString(), { containerId: 'B', transition: Zoom });
      //     return
      // }
      toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
    }
  }

  function handleSelectPeriod(e) {
    let val = e.target.value;
    if (val === 'All') {
      setParam((prevState) => ({
        ...prevState,
        yearperiod: ''
      }));
    } else {
      let x = period.find((i) => i.period === val);
      setSelectedPeriod(x);
      setParam((prevState) => ({
        ...prevState,
        yearperiod: x.period
      }));
    }
  }

  function handleSelectWave(e) {
    let val = e.target.value;
    if (val === 'All') {
      setParam((prevState) => ({
        ...prevState,
        wavenum: ''
      }));
    } else {
      setParam((prevState) => ({
        ...prevState,
        wavenum: val
      }));
    }
  }

  useEffect(() => {
    fetchData(param);
  }, [param]);

  useEffect(() => {
    fetchPeriod();
  }, []);

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
            <Col xs={9}>{': ' + selected.fullname}</Col>
          </Row>
          <Row>
            <Col xs={3}>Email</Col>
            <Col xs={9}>{': ' + selected.email}</Col>
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
          <CardTitle>Pendaftaran</CardTitle>
          <div className="my-2">
            <Row>
              <Col className="m-2">
                <Label>Search</Label>
                <Input
                  className="m-0"
                  type="search"
                  placeholder="Nama, Email, No.HP"
                  innerRef={searchRef}
                />
                <Button onClick={handleSearch} color="primary" className="mt-2">
                  <FontAwesomeIcon icon={['fas', 'search']} />
                  <span style={{ marginLeft: 10 }}>Cari</span>
                </Button>
              </Col>
              <Col md="6" className="my-2">
                <Row className="mx-2 mb-2">
                  <Label htmlFor="exampleSelect">Periode</Label>
                  <Input
                    type="select"
                    name="period"
                    id="period"
                    onChange={handleSelectPeriod}>
                    <option>All</option>
                    {period.map((x) => {
                      return <option key={x.period}>{x.period}</option>;
                    })}
                  </Input>
                </Row>
                <Row className="mx-2">
                  <Label htmlFor="exampleSelect">Gelombang</Label>
                  <Input
                    type="select"
                    name="wave"
                    id="wave"
                    onChange={handleSelectWave}>
                    <option>All</option>
                    {selectedPeriod.wave.map((x) => {
                      return <option key={x}>{x}</option>;
                    })}
                  </Input>
                </Row>
              </Col>
            </Row>
          </div>
          <BootstrapTable
            remote
            keyField="id"
            data={data}
            columns={columns}
            bodyClasses="bootstrap-table"
            pagination={paginationFactory({
              hideSizePerPage: true,
              hidePageListOnlyOnePage: true,
              page: param.page,
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
