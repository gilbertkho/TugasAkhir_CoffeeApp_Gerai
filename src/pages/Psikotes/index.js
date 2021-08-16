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
  FormGroup,
  FormFeedback,
  Input
} from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { useHistory } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'config/axios';
import { toast, Zoom } from 'react-toastify';
import Errormsg from 'config/errormsg';
import localforage from 'config/localForage';

export default function Psikotes() {
  let history = useHistory();
  const [data, setData] = useState([]);
  let [totalSize, setTotal] = useState(0);
  let [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const searchRef = useRef();
  const sizePerPage = 10;
  const [choosenPer, setChoosePer] = useState("");
  const [periodReg, setPeriodReg] = useState([]);
  const [activePeriod, setActivePeriod] = useState("");
  const [user, setUser] = useState("");
  //untuk edeit status
  const [selected, setSelected] = useState({
    id: "",
    name: ""
  });
  const [regStatusModal, setRegStatusModal] = useState(false);
  const [submited, setSubmited] = useState(false);
  const changeRegStatus = (field, value) => { setRegStatusForm({ ...regStatusForm, [field]: value }); };
  const [regStatusForm, setRegStatusForm] = useState({
    regid: '',
    status: '',
    description: ''
  });
  const [undoToggle, setUndo] = useState(false);
  const [toLevel4, setToLevel4] = useState(false);
  const [toReject, setToReject] = useState(false);
  const roman= ["","I","II","III","IV","V"];

  const getUser = async () => {
    try {
      const value = await localforage.getItem('user');
      // This code runs once the value has been loaded
      // from the offline store.
      // console.log("user private", value);
      setUser(value.tu);
    } catch (err) {
      // This code runs if there were any errors.
      console.log(err);
    }
  };

  const getActivePeriod = () => {
    axios.get("/app/activeperiod", {}).then(({ data }) => {
      if (data.data.active) {
        setActivePeriod(data.data.msg)
      }
      else {
        toast.error(data.data.msg, { containerId: "B", transition: Zoom });
      }
    })
      .catch(error => {
        toast.error(Errormsg['500'], { containerId: "B", transition: Zoom });
      })
  }

  function getPeriodReg() {
    axios.post('/b/o/master/periodregister', JSON.stringify({
      page: 1, count: 100
    })).then(({ data }) => {
      //console.log(data);
      if (data.st) {
        setPeriodReg(data.data.list);
      }
      else {
        toast.error(data.msg, { containerId: "B", transition: Zoom });
      }
    }).catch(error => {
      toast.error(Errormsg['500'], { containerId: "B", transition: Zoom })
    })
  }

  const GetActionFormat = (cell, row) => {
    let val = "non aktif";
    periodReg.forEach((pr, key) => {
      if (pr.flagactive === "Active" && pr.id === choosenPer) val = "Active";
    });
    let a;
    let disablePermission=false;
        if(val !== "Active"||row.currentlevel!==3)
        {
            disablePermission=true;
        }
    if (row.regstatus === "Reject" || row.regstatus === "Blacklist") {
      a = (<Button color="warning" size="sm" disabled={disablePermission}
        onClick={e => {
          e.stopPropagation();
          toggleUndo(row);
        }}>
        <FontAwesomeIcon icon={['fa', 'undo']} />
      </Button>)
    } else {
      a = (<Button color="primary" size="sm" disabled={val !== "Active"}
        onClick={e => {
          e.stopPropagation();
          toggleRegStatusModal(row);
        }}>
        <FontAwesomeIcon icon={['fa', 'edit']} />
      </Button>)
    }
    return a
  }

  function statusFormatter(cell, row) {
    if (cell === "Reject") {
      return (<span className="text-danger">Ditolak</span>);
    }
    if (cell === "Approve") {
      if (row.examstatus === "Completed") {
        return (<span className="text-success">Diterima ke Tahap IV</span>);
      }
      else if(row.examstatus === "Psikotes")
      {return (<span className="text-success">Tahap III - Psikotes</span>);}
      else {return <span className="text-success">Tahap {roman[row.currentlevel]} {(row.currentlevel===3)? " - Exam Online":""}</span>}
    }
    if (cell === "Blacklist") {
      return (<span style={{ color: "black" }}>Blacklist</span>);
    }
    // console.log(row);
    return <>{cell}</>
  }

  const psikoColumns = [
    {
      dataField: 'email',
      text: 'Email'
    },
    {
      dataField: 'name',
      text: 'Nama'
    },
    {
      dataField: 'regstatus',
      text: 'S. Pendaftaran',
      formatter: statusFormatter,
    },
  ]

  const columns = [
    {
      dataField: 'action',
      text: 'Action',
      formatter: GetActionFormat,
      style: { width: "5em" }
    }, psikoColumns[0], psikoColumns[1], psikoColumns[2],
  ]

  //handleTableChange (type, {page, sizePerPage})
  const handleTableChange = (_type, { page }) => {
    setPage(page);
    // fetchData(page, sizePerPage);
  };

  function handleSearch(e) {
    e.preventDefault();
    setSearch(searchRef.current.value);
  }

  async function fetchData(page, sizePerPage, search = '', period) {
    try {
      let res = await axios.post(
        '/b/o/master/psikotes/list/',
        JSON.stringify({
          page: page,
          count: sizePerPage,
          search: search,
          period: period,
        })
      );
      let data = res.data;
      console.log(data);
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
    if (choosenPer !== "") {
      fetchData(page, sizePerPage, search, choosenPer);
    }
  }, [page, search, choosenPer]);

  useEffect(() => {
    getPeriodReg();
    getActivePeriod();
    getUser();
  }, []);

  const expandRow = {
    onlyOneExpanding: true,
    showExpandColumn: true,
    renderer: row => {
      row.aspekpsikotes.forEach(e => { e.UserID = row.UserID })
      {
        var aspekdata = row.aspekpsikotes;
        return (
          <>
            <BootstrapTable
              keyField='id'
              data={aspekdata}
              columns={innerColumns}
              noDataIndication="Belum ada data"
              wrapperClasses="table-responsive"
            />
          </>
        )
      }
    }
  };
  const innerColumns = [
    {
      dataField: 'aspek',
      text: 'Aspek Penilaian Kepribadian',
    },
    {
      dataField: 'bobot',
      text: 'Bobot (%)',
    },
    {
      dataField: 'realisasi',
      text: 'Realisasi',
    },
    {
      dataField: 'ketercapaian',
      text: 'Catatan',
    },
    {
      dataField: 'nilaiakhir',
      text: 'Nilai Akhir',
    }
  ];

  //toogle modal
  const toggleRegStatusModal = (row) => {
    setRegStatusModal(!regStatusModal);
    let regStatus = {
      regid: row.RegisterID,
      status: row.regstatus,
      description: ""
    };
    let selectUser = {
      id: row.RegisterID,
      name: row.name,
      level: row.currentlevel,
      examstatus: row.examstatus
    }
    //console.log("status " + row.regstatus)
    setRegStatusForm(regStatus);
    setSelected(selectUser);
  }

  const toggleReject = () => {
    setToReject(!toReject);
  }

  const toggleLevel4 = () => {
    setToLevel4(!toLevel4);
  };
  const toggleUndo = (row) => {
    setUndo(!undoToggle);
    let selectUser = {
      id: row.RegisterID,
      name: row.name,
      level: row.currentlevel
    }
    setSelected(selectUser);
  };
  //end toggle

  //function ubah status
  const regStatusHandler = async () => {
    toast.dismiss();
    if (regStatusForm.status === 'Approve') {
      toggleLevel4();
    }
    else {
      if ((regStatusForm.status === 'Reject' || regStatusForm.status === 'Blacklist') && regStatusForm.description === '') {
        setSubmited(true);
        toast.error('Harap lengkapi data', { containerId: 'B', transition: Zoom });
      } else {
        toggleReject();
      }
    }
  }

  const level4Handler = async () => {
    toast.dismiss();
    try {
      let res = await axios.post('/b/o/levelfour', JSON.stringify({
        regid: regStatusForm.regid,
        status: regStatusForm.status,
        description: regStatusForm.description
      }))
      console.log(res);
      if (res.data.st) {
        toast.success("Status Pendaftar berhasil diubah", { containerId: 'B', transition: Zoom })
        fetchData(page, sizePerPage, search, choosenPer);
      }
      else toast.error(res.data.msg, { containerId: 'B', transition: Zoom });
      (regStatusForm.status !== "Approve") ? toggleReject() : toggleLevel4();
      toggleRegStatusModal({});
    } catch (error) {
      toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
      (regStatusForm.status !== "Approve") ? toggleReject() : toggleLevel4();
      toggleRegStatusModal({});
    }
  }

  async function handleUndo(e) {
    e.preventDefault();
    toast.dismiss();
    try {
      let res = await axios.post('/b/o/levelthreepsi/undo', { regid: selected.id });
      if (res.data.st) {
        toast.success("Status berhasil diubah", { containerId: 'B', transition: Zoom })
        fetchData(page, sizePerPage, search, choosenPer);
      } else {
        toast.error(res.data.msg, { containerId: 'B', transition: Zoom });
      }
      toggleUndo({});
    } catch (error) {
      // if (!error.response) {
      //     toast.error(error.toString(), { containerId: 'B', transition: Zoom });
      //     return
      // }
      toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
    }
  }


  return (
    <>
      {/* modal naik level 4 */}
      <Modal zIndex={2000} centered isOpen={toLevel4} toggle={toggleLevel4}>
        <ModalHeader toggle={toggleLevel4}>Apakah anda yakin untuk menaikan {selected.name} ke tahap IV ?</ModalHeader>
        <ModalFooter>
          <Button color="primary" onClick={level4Handler}>Ya</Button>
          <Button color="secondary" onClick={toggleLevel4}>Tutup</Button>
        </ModalFooter>
      </Modal>
      {/* modal reject / Blacklist */}
      <Modal zIndex={2000} centered isOpen={toReject} toggle={toggleReject}>
        <ModalHeader toggle={toggleReject}>Apakah anda yakin untuk {(regStatusForm.status === 'Reject') ? "menolak" : "blacklist"} {selected.name}?</ModalHeader>
        <ModalFooter>
          <Button color="primary" onClick={level4Handler}>Ya</Button>
          <Button color="secondary" onClick={toggleReject}>Tutup</Button>
        </ModalFooter>
      </Modal>
      {/* modal untuk undo */}
      <Modal zIndex={2000} centered isOpen={undoToggle} toggle={toggleUndo}>
        <ModalHeader toggle={toggleUndo}>Apakah anda yakin untuk mengembalikan status {selected.name}?</ModalHeader>
        <ModalFooter>
          <Button color="primary" onClick={handleUndo}>Ya</Button>
          <Button color="secondary" onClick={toggleUndo}>Tutup</Button>
        </ModalFooter>
      </Modal>
      {/* modal untuk pilih status */}
      <Modal zIndex={2000} centered isOpen={regStatusModal} toggle={toggleRegStatusModal}>
        <ModalHeader toggle={toggleRegStatusModal}>Ubah status pendaftaran</ModalHeader>
        <ModalBody>
          <FormGroup tag="fieldset">
            <legend>Status Pendaftaran</legend>
            {console.log(selected)}
            {(selected.level === 3 && selected.examstatus==="Psikotes") ?(
              <FormGroup check>
                <Label check>
                  <Input type="radio" name="regstatus" value='Approve'
                    onClick={() => { setRegStatusForm((prevState) => ({ ...prevState, status: 'Approve' })) }}
                    defaultChecked={regStatusForm.status === 'Approve'} />{' '}
                              Lulus ke tahap IV
                          </Label>
              </FormGroup>
            ):null
            }
            {/* <FormGroup check>
                            <Label check>
                                <Input type="radio" name="regstatus" value='Pending'
                                    onClick={() => { setRegStatusForm((prevState) => ({ ...prevState, status: 'Pending' })) }}
                                    checked={regStatusForm.status == 'Pending'} />{' '}
                                Pending
                            </Label>
                        </FormGroup> */}
            <FormGroup check>
              <Label check>
                <Input type="radio" name="regstatus" value='Reject'
                  onClick={() => { setRegStatusForm((prevState) => ({ ...prevState, status: 'Reject' })) }}
                  defaultChecked={regStatusForm.status === 'Reject'} />{' '}
                                Ditolak
                            </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input type="radio" name="regstatus" value='Blacklist'
                  onClick={() => { setRegStatusForm((prevState) => ({ ...prevState, status: 'Blacklist' })) }}
                  defaultChecked={regStatusForm.status === 'Blacklist'} />{' '}
                                Blacklist
                            </Label>
            </FormGroup>
          </FormGroup>
          <FormGroup>
            <Label for="description">Deskripsi</Label>
            <Input id="description" value={regStatusForm.description} required
              disabled={regStatusForm.status === 'Approve' ? true : false}
              onChange={(e) => changeRegStatus("description", e.target.value)}
              // onChange={(e) => {console.log(e.target.value)}}
              invalid={regStatusForm.description === '' && submited} />
            <FormFeedback>Deskripsi tidak boleh kosong</FormFeedback>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={regStatusHandler}>Ubah</Button>
          <Button color="secondary" onClick={toggleRegStatusModal}>Tutup</Button>
        </ModalFooter>
      </Modal>
      <Card>
        <CardBody>
          <CardTitle>Nilai Psikotes</CardTitle>
          <Container style={{ marginLeft: 0 }}>
            {(user=== 'Psikotes')?
              (<Row lg={4}>
                <Button
                  outline
                  color="primary"
                  style={{ marginBottom: '1rem' }}
                  onClick={() => {
                    history.push('/psikotes/import');
                  }}>
                  <span style={{ marginRight: 10 }}>Import dari Excel</span>
                  <FontAwesomeIcon icon={['fas', 'plus']} />
                </Button>
              </Row>):null
            }
            <Row>
              {activePeriod ?
                <p>Periode Ujian Aktif Saat Ini: <strong className="text-info">{activePeriod}</strong></p>
                : null}
            </Row>
            <Row>
              <Label for="period">Periode Ujian</Label>
              <Input id="period" name="period" type="select" onChange={(e) => setChoosePer(e.target.value)}>
                {/* <option value="">Pilih Periode Ujian</option> */}
                {periodReg.map((pr, key) => {
                  if (choosenPer === '') {
                    if (pr.flagactive === "Active") {
                      setChoosePer(pr.id);
                    }
                  }
                  return (
                    <option key={key} value={pr.id}>{pr.yearperiod + " Gelombang: " + pr.wavenum}</option>
                  )
                })}
              </Input>
            </Row>
            <Row className="mt-2 mb-4">
              <Label>Search</Label>
              <Input
                className="m-0"
                type="search"
                placeholder="Email atau Nama"
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
            keyField="UserID"
            data={data}
            columns={(user === 'Psikotes') ? psikoColumns : columns}
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
            expandRow={expandRow}
          />
        </CardBody>
      </Card>
    </>
  );
}
