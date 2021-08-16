/* eslint-disable */
import React, { Fragment, useState, useEffect, useRef } from 'react';

import { useHistory } from 'react-router-dom';
import {
  Card, CardTitle, CardBody, Button, Modal, ModalHeader,
  ModalBody, ModalFooter, Row, Col, Label, Input,
  FormGroup, FormFeedback, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, UncontrolledButtonDropdown
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
import Psikotes from 'pages/Psikotes';

export default function AdminReqList() {
  const [user, setUser] = useState({
    email: "",
    pict: "",
    tu: "Internal",
    uid: ""
  });
  const [submited, setSubmited] = useState(false);
  useEffect(() => {
    (async function () {
      let user = await localForage.getItem('user');
      setUser(user);
    })()
    getActivePeriod();
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
    search: '',
    periodid: ''
  });

  const [periodReg, setPeriodReg] = useState([]);
  const [toDelete, setToDelete] = useState(false);
  const [toRequest, setToRequest] = useState(false);
  const [selected, setSelected] = useState({})
  const [toStatus, setToStatus] = useState(false);
  const [toPsikotes, setToPsikotes] = useState(false);
  const [toReject, setToReject] = useState(false);
  const [statusForm, setStatusForm] = useState({
    "regid": "",
    "status": "",
    "description": ""
  });
  const [selectUser, setSelectUser] = useState({
    id: "",
    name: ""
  });
  const roman= ["","I","II","III","IV","V"];

  const toggleDelete = (req) => {
    setToDelete(!toDelete);
    setSelectedReq(req)
  };

  const toggleRequest = (req) => {
    setToRequest(!toRequest);
    setSelectedReq(req)
  };

  const toggleStatusModal = (req) => {
    setToStatus(!toStatus);
    if (req.regid) {
      setStatusForm((prevState) => ({
        ...prevState,
        regid: req.regid,
        status: req.status,
        description: req.description
      }))
    }
    setSelectedReq(req)
    let selectUser = {
      id: req.regid,
      name: req.name,
      level: req.currentlevel,
      examstatus: req.examlevel
    }
    setSelectUser(selectUser);
  }

  const [activePeriod, setActivePeriod] = useState("");

  const captureUjian = (req) => history.push('/master/ujian/capture', { req: req, admin: user.tu === "Administrator" });
  const detailUjian = (req) => history.push('/master/ujian/hasil/detail', { req: req, admin: user.tu === "Administrator" });

  const [modal, setModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState({});
  const [sort, setSort] = useState(false);
  const [undoToggle, setUndo] = useState(false);
  const [dropdownOpen, setdrop] = useState(false);

  const toggledrop = (row) => {
    setdrop(!dropdownOpen);
    // console.log(row);
  };

  const toggle = (req) => {
    setModal(!modal);
    setSelectedReq(req)
  };
  const toggleUndo = (user) => {
    setUndo(!undoToggle);
    let selectUser = {
      id: user.regid,
      name: user.name,
      requirement: user.requirement,
      examstatus: user.examlevel
    }
    setSelectUser(selectUser);
  };

  useEffect(() => {
    if (selectedReq.id) {
      // axios.post("/b/o/exam/score/detail",{
      //   "page":1,
      //   "count":100,
      //   "id":selectedReq.id
      // }).then(({data}) => {
      //   console.log(data)
      // }).catch(error => {
      //   toast.error(Errormsg['500'], {containerId:"B", transition:Zoom});
      // })
    }
  }, [selectedReq])

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

  const requestUjian = (row) => {
    axios.post("/b/o/exam/generatenewcode", { "id": row.id }).then(({ data }) => {
      if (data.st) {
        toast.success("Kode Ujian berhasil dikirim kembali ke peserta", { containerId: "B", transition: Zoom });
        fetchData(param);
        toggleRequest({})
      }
      else {
        toast.error(data.msg, { containerId: "B", transition: Zoom });
      }
    })
      .catch(error => {
        toast.error(Errormsg['500'], { containerId: "B", transition: Zoom });
      })
  }

  const changeStatus = (field, value) => { setStatusForm({ ...statusForm, [field]: value }); };

  const GetActionFormat = (cell, row) => {
    let a;
    if (row.status === "Reject" || row.status === "Blacklist") {
      a = (
        <DropdownItem size="sm" onClick={e => {
          e.stopPropagation();
          toggleUndo(row);
        }} disabled={(row.currentlevel===3 && row.examlevel==="OnlineExam")? false:true}>
          <FontAwesomeIcon icon={['fa', 'undo']}  /> Undo Status
        </DropdownItem>)
    } else {
      a = (
        <DropdownItem size="sm" onClick={e => {
          e.stopPropagation();
          toggleStatusModal(row);
        }}>
          <FontAwesomeIcon icon={['fa', 'edit']} /> Ubah Status
        </DropdownItem>)
    }
    return (
      <UncontrolledButtonDropdown size="sm">
        <DropdownToggle size="sm" color="primary" caret>
          Action
      </DropdownToggle>
        <DropdownMenu>
          <DropdownItem size="sm" onClick={(e) => { e.stopPropagation(); toggle(row) }}><FontAwesomeIcon icon={['fa', 'info-circle']} /> Detail Ujian</DropdownItem>
          <DropdownItem size="sm" onClick={(e) => { e.stopPropagation(); captureUjian(row) }}><FontAwesomeIcon icon={['fa', 'images']} /> Foto</DropdownItem>
          <DropdownItem size="sm" onClick={(e) => { e.stopPropagation(); toggleRequest(row) }}><FontAwesomeIcon icon={['fa', 'envelope']} /> Request Kode</DropdownItem>
          <DropdownItem size="sm" onClick={(e) => { e.stopPropagation(); detailUjian(row) }}><FontAwesomeIcon icon={['fa', 'clipboard-list']} /> Hasil Ujian</DropdownItem>
          {a}
        </DropdownMenu>
      </UncontrolledButtonDropdown>
      // <div>d</div>
    );
  }

  const waktuUjian = (cell, row) => {
    let date = new Date(row.tstart);
    return (
      <>
        {date.getDate() + " " + date.toLocaleDateString('default', { month: 'long' }) + " " + date.getFullYear()}
      </>
    )
  }

  const gelombangUjian = (cell, row) => {
    return (
      <>
        Periode {row.yearperiod}, Gelombang {row.wavenum}
      </>
    )
  }

  const statusUjian = (cell, row) => {
    return (
      <>
        <strong className={row.examstatus === "Active" ? "text-success" : "text-danger"}>{row.examstatus}</strong>
      </>
    )
  }

  const regStatusHandler = async () => {
    toast.dismiss();
    if (statusForm.status === 'Approve') {
      togglePsikotes();
    }
    else {
      toggleReject();
    }
  }

  const statusHandler = () => {
    axios.post("/b/o/topsikotes", statusForm).then(({ data }) => {
      if (data.st) {
        toast.success("Berhasil mengganti status peserta ujian", { containerId: "B", transition: Zoom });
        toggleStatusModal({});
        fetchData(param)
        setSubmited(false)
      }
      else {
        toast.error(data.msg, { containerId: "B", transition: Zoom });
        setSubmited(true);
      }
    })
      .catch(error => {
        setSubmited(true);
        toast.error(Errormsg['500'], { containerId: "B", transition: Zoom });
      })

      if (statusForm.status === 'Approve') {
        togglePsikotes();
      }
      else {
        toggleReject();
      }
  }

  function statusFormatter(cell, row) {
    //console.log(row);
    if (cell === "Reject") {
      return (<span className="text-danger">Ditolak</span>);
    }
    if (cell === "Approve") {
      if (row.examlevel === "Completed") {
        return (<span className="text-success">Diterima ke Tahap IV</span>);
      }
      else if(row.examlevel === "Psikotes")
      {return (<span className="text-success">Tahap III - Psikotes</span>);}
      else {return <span className="text-success">Tahap {roman[row.currentlevel]} {(row.currentlevel===3)? " - Exam Online":""}</span>}
    }
    if (cell === "Blacklist") {
      return (<span style={{ color: "black" }}>Blacklist</span>);
    }
    // console.log(row);
    return <>{cell}</>
  }

  const columns = [{
    dataField: 'action',
    text: 'Action',
    formatter: GetActionFormat,
    headerStyle: (column, colIndex) => {
      return { width: '10px' };
    }
  }, {
    dataField: 'name',
    text: 'Nama Peserta Ujian',
    // formatter: gelombangUjian
  },
  {
    dataField: 'tstart',
    text: 'Tanggal Mulai',
    formatter: waktuUjian
  }
    , {
    dataField: 'canswered',
    text: 'Soal Terjawab',
    // formatter: statusUjian
  }, {
    dataField: 'score',
    text: 'Nilai Akhir'
  },{
    dataField: 'status',
    text: 'Status Pendaftaran',
    formatter: statusFormatter,
  },{
    dataField: 'newcoderequested',
    text: 'Status Ujian',
    formatter: codeFormatter,
  },
];

function codeFormatter(cell, row) {
  if (cell === "No") {
    return (<span className="text-primary">Baru</span>);
  }
  else
  {
    return (<span className="text-danger">Lama</span>);
  }
}

  const selectRow = {
    mode: 'checkbox',
    clickToSelect: true,
    hideSelectAll: true,
    selectColumnStyle: { width: 40 },
    // onSelect: (row, isSelect, rowIndex, e) => {
    //   console.log(row.id);
    //   console.log(isSelect);
    //   console.log(rowIndex);
    //   console.log(e);
    // },
  };

  const getPeriodReg = () => {
    axios.post('/b/o/master/periodregister', JSON.stringify({
      page: 1, count: 100
    })).then(({ data }) => {
      if (data.st) {
        setPeriodReg(data.data.list);
        let a = {
          page: page,
          count: sizePerPage,
          search: '',
          periodid: data.data.list[0]['id']
        };
        setParam(a);
      }
      else {
        toast.error(data.msg, { containerId: "B", transition: Zoom });
      }
    }).catch(error => {
      toast.error(Errormsg['500'], { containerId: "B", transition: Zoom })
    })
  }

  function fetchData(param) {
    axios.post('/b/o/exam/score', JSON.stringify(param)).then(res => res.data)
      .then(data => {
        if (data.st) {
          // console.log(data)
          setTotal(data.data.total)
          setReq(data.data.list)
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
    if (param.periodid !== "") {
      fetchData(param);
    }
  }, [param]);
  
  useEffect(() => {
    if (param.periodid === "") {
      getPeriodReg();
    }
  }, []);

  const handleTableChange = (type, { page, sizePerPage }) => {
    setParam((prevState) => ({
      ...prevState,
      page: page
    }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setParam((prevState) => ({ ...prevState, search: searchRef.current.value }))
  }
  async function handleUndo(e) {
    e.preventDefault();
    toast.dismiss();
    try {
      let res = await axios.post('/b/o/levelthreeexam/undo', { regid: selectUser.id });
      if (res.data.st) {
        toast.success("Berhasil diubah", { containerId: 'B', transition: Zoom })
        //setUndo(false);
        fetchData(param);
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
      toggleUndo({});
    }
  }

  const chgPeriodReg = (e) => {
    setParam({ ...param, periodid: e.target.value });
  }

  const splitDate = (tanggalMulai) => {
    var arrTanggal = tanggalMulai.split('-');
    var tanggal = arrTanggal[2] + "-" + arrTanggal[1] + "-" + arrTanggal[0];
    return tanggal;
  }

  const togglePsikotes=()=>
  {
    setToPsikotes(!toPsikotes);
  }

  const toggleReject=()=>
  {
    setToReject(!toReject);
  }
  return (
    <>
    {/* modal undo */}
      <Modal zIndex={2000} centered isOpen={undoToggle} toggle={toggleUndo}>
        <ModalHeader toggle={toggleUndo}>Apakah anda yakin untuk mengembalikan status {selected.name}?</ModalHeader>
        <ModalFooter>
          <Button color="primary" onClick={handleUndo}>Ya</Button>
          <Button color="secondary" onClick={toggleUndo}>Tutup</Button>
        </ModalFooter>
      </Modal>
      {/* modal info peserta */}
      <Modal zIndex={2000} centered isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Detail Ujian</ModalHeader>
        <ModalBody>
          <Row>
            <Col xs={6}>Nama Peserta Ujian</Col>
            <Col xs={6}>{": " + selectedReq.name}</Col>
          </Row>
          <Row>
            <Col xs={6}>Soal Terjawab</Col>
            <Col xs={6}>{": " + selectedReq.canswered}</Col>
          </Row>
          <Row>
            <Col xs={6}>Nilai Ujian</Col>
            <Col xs={6}>{": " + selectedReq.score}</Col>
          </Row>
          <Row>
            <Col xs={6}>Selesai Ujian</Col>
            <Col xs={6}>{": " + selectedReq.completed}</Col>
          </Row>
          <Row>
            <Col xs={6}>Tanggal Ujian</Col>
            <Col xs={6}>{selectedReq.tstart ?            
            ": " + (selectedReq.tstart.split(" ")[0] = new Date(selectedReq.tstart.split(" ")[0]).getDate()) + " " + (selectedReq.tstart.split(" ")[0] = new Date(selectedReq.tstart.split(" ")[0]).toLocaleDateString('default', { month: 'long' })) + " " + (selectedReq.tstart.split(" ")[0] = new Date(selectedReq.tstart.split(" ")[0]).getFullYear())
            : ""}</Col>
          </Row>
          <Row>
            <Col xs={6}>Waktu Mulai Ujian</Col>
            <Col xs={6}>{selectedReq.tstart ? ": " + (selectedReq.tstart.split(" ")[1]) : ""}</Col>
          </Row>
          <Row>
            <Col xs={6}>Waktu Selesai Ujian</Col>
            <Col xs={6}>{selectedReq.tstart ? ": " + (selectedReq.tend.split(" ")[1]) : ""}</Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          {/* <Button color="primary" onClick={toggle}>Do Something</Button>{' '} */}
          <Button color="secondary" onClick={toggle}>Tutup</Button>
        </ModalFooter>
      </Modal>
      {/* modal request kode ujian */}
      <Modal zIndex={2000} centered isOpen={toRequest} toggle={toggleRequest}>
        <ModalHeader toggle={toggleRequest}>Apakah anda yakin untuk mengirim ulang kode ujian untuk peserta ini?</ModalHeader>
        <ModalBody>
          <Row>
            <Col xs={6}>Nama Peserta Ujian</Col>
            <Col xs={6}>{": " + selectedReq.name}</Col>
          </Row>
          <Row>
            <Col xs={6}>Soal Terjawab</Col>
            <Col xs={6}>{": " + selectedReq.canswered}</Col>
          </Row>
          <Row>
            <Col xs={6}>Nilai Ujian</Col>
            <Col xs={6}>{": " + selectedReq.score}</Col>
          </Row>
          <Row>
            <Col xs={6}>Selesai Ujian</Col>
            <Col xs={6}>{": " + selectedReq.completed}</Col>
          </Row>
          <Row>
            <Col xs={6}>Tanggal Ujian</Col>
            <Col xs={6}>{selectedReq.tstart ?
              ": " + (selectedReq.tstart.split(" ")[0] = new Date(selectedReq.tstart.split(" ")[0]).getDate()) + " " + (selectedReq.tstart.split(" ")[0] = new Date(selectedReq.tstart.split(" ")[0]).toLocaleDateString('default', { month: 'long' })) + " " + (selectedReq.tstart.split(" ")[0] = new Date(selectedReq.tstart.split(" ")[0]).getFullYear())
              : ""}</Col>
          </Row>
          <Row>
            <Col xs={6}>Waktu Mulai Ujian</Col>
            <Col xs={6}>{selectedReq.tstart ? ": " + (selectedReq.tstart.split(" ")[1]) : ""}</Col>
          </Row>
          <Row>
            <Col xs={6}>Waktu Selesai Ujian</Col>
            <Col xs={6}>{selectedReq.tstart ? ": " + (selectedReq.tend.split(" ")[1]) : ""}</Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => requestUjian(selectedReq)}>Send</Button>
          <Button color="secondary" onClick={toggleRequest}>Tutup</Button>
        </ModalFooter>
      </Modal>
      {/* modal ubah status ujian */}
      <Modal zIndex={2000} centered isOpen={toStatus} toggle={toggleStatusModal}>
        <ModalHeader toggle={toggleStatusModal}>Ubah Status Peserta Ujian</ModalHeader>
        <ModalBody>
          <FormGroup tag="fieldset">
            <legend>Status Peserta</legend>
            {
            (selectUser.level===3 && selectUser.examstatus==="OnlineExam")?(<FormGroup check>
              <Label check>
                <Input type="radio" name="regstatus" value='Approve'
                  onClick={() => {
                    setStatusForm((prevState) => ({
                      ...prevState, status: 'Approve',
                      description: ''
                    }))
                  }}
                  checked={statusForm.status == 'Approve'} />{' '}
                        Lulus ke tahap psikotes
                    </Label>
            </FormGroup>):null
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
                  onClick={() => {
                    setStatusForm((prevState) => ({
                      ...prevState, status: 'Reject',
                      description: ''
                    }))
                  }}
                  checked={statusForm.status === 'Reject'} />{' '}
                        Ditolak
                    </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input type="radio" name="regstatus" value='Blacklist'
                  onClick={() => {
                    setStatusForm((prevState) => ({
                      ...prevState, status: 'Blacklist',
                      description: ''
                    }))
                  }}
                  checked={statusForm.status == 'Blacklist'} />{' '}
                        Blacklist
                    </Label>
            </FormGroup>
          </FormGroup>
          <FormGroup>
            <Label for="description">{statusForm.status !== 'Approve' ? 'Deskripsi' : 'Link Psikotes'}</Label>
            <Input id="description" value={statusForm.description} required
              onChange={(e) => changeStatus("description", e.target.value)}
              invalid={statusForm.description === '' && submited} />
            <FormFeedback>{statusForm.status !== 'Approve' && statusForm.description === '' && submited ? "Deskripsi tidak boleh kosong" : "Link psikotes tidak boleh kosong"}</FormFeedback>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={regStatusHandler}>Ubah</Button>
          <Button color="secondary" onClick={toggleStatusModal}>Tutup</Button>
        </ModalFooter>
      </Modal>
      {/* modal naik psikotes */}
      <Modal zIndex={2000} centered isOpen={toPsikotes} toggle={togglePsikotes}>
        <ModalHeader toggle={togglePsikotes}>Apakah anda yakin untuk mengganti status ujian {selectUser.name} ke psikotes ?</ModalHeader>
        <ModalFooter>
          <Button color="primary" onClick={statusHandler}>Ya</Button>
          <Button color="secondary" onClick={togglePsikotes}>Tutup</Button>
        </ModalFooter>
      </Modal>
      {/* modal reject / Blacklist */}
      <Modal zIndex={2000} centered isOpen={toReject} toggle={toggleReject}>
        <ModalHeader toggle={toggleReject}>Apakah anda yakin untuk {(selectedReq.status === 'Reject') ? "menolak" : "blacklist"} {selected.name}?</ModalHeader>
        <ModalFooter>
          <Button color="primary" onClick={statusHandler}>Ya</Button>
          <Button color="secondary" onClick={toggleReject}>Tutup</Button>
        </ModalFooter>
      </Modal>
      <Card>
        <CardBody>
          <CardTitle>Hasil Ujian</CardTitle>
          {/* <div>
        <Dropdown isOpen={dropdownOpen} toggle={toggledrop}>
          <DropdownToggle color="primary" caret>
            Dropdown
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Header</DropdownItem>
            <DropdownItem>Some Action</DropdownItem>
            <DropdownItem text>Dropdown Item Text</DropdownItem>
            <DropdownItem disabled>Action (disabled)</DropdownItem>
            <DropdownItem divider />
            <DropdownItem>Foo Action</DropdownItem>
            <DropdownItem>Bar Action</DropdownItem>
            <DropdownItem>Quo Action</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div> */}
          {activePeriod ?
            <p>Periode Ujian Aktif Saat Ini: <strong className="text-info">{activePeriod}</strong></p>
            : null}
          <Label for="period">Periode Ujian</Label>
          <Input id="period" name="period" type="select" onChange={(e) => chgPeriodReg(e)}>
            {/* <option value="">Pilih Periode Ujian</option> */}
            {periodReg.map((pr, key) => {
              return (
                <option key={key} value={pr.id}>{pr.yearperiod + " Gelombang: " + pr.wavenum}</option>
              )
            })}
          </Input>
          <div className="my-2">
            <Label>Search</Label>
            <Input className="m-0" type="search" placeholder="" innerRef={searchRef} />
            <Button onClick={handleSearch} color="primary" className="mt-2">
              <FontAwesomeIcon icon={['fas', 'search']} />
              <span style={{ marginLeft: 10 }}>
                Cari
              </span>
            </Button>
          </div>
          <Label>Keterangan</Label>
          <div className="pl-1">
            <Row>
              <Col xs={1}>
                <FontAwesomeIcon icon={['fa', 'info-circle']} />
              </Col>
              <Col className="pl-0">
                : Detail Ujian
              </Col>
            </Row>
            <Row>
              <Col xs={1}>
                <FontAwesomeIcon icon={['fa', 'images']} />
              </Col>
              <Col className="pl-0">
                : Hasil Foto Capture Ujian
              </Col>
            </Row>
            <Row>
              <Col xs={1}>
                <FontAwesomeIcon icon={['fa', 'envelope']} />
              </Col>
              <Col className="pl-0">
                : Request Ulang Kode Ujian
              </Col>
            </Row>
            <Row>
              <Col xs={1}>
                <FontAwesomeIcon icon={['fa', 'clipboard-list']} />
              </Col>
              <Col className="pl-0">
                : Detail Hasil Ujian
              </Col>
            </Row>
            <Row>
              <Col xs={1}>
                <FontAwesomeIcon icon={['fa', 'edit']} />
              </Col>
              <Col className="pl-0">
                : Ubah Status Peserta Ujian
              </Col>
            </Row>
            <Row>
              <Col xs={1}>
                <FontAwesomeIcon icon={['fa', 'undo']} />
              </Col>
              <Col className="pl-0">
                : Mengembalikan Status Peserta Ujian
              </Col>
            </Row>
          </div>
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
            noDataIndication="Belum ada data ujian"
            wrapperClasses="table-responsive"
          />
        </CardBody>
      </Card>
    </>
  );
}
