/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardBody, CardTitle, Row, Col, Label, Input, Button, Modal, ModalHeader, ModalFooter, ModalBody, FormGroup, FormFeedback } from 'reactstrap'
import BootstrapTable from "react-bootstrap-table-next";
import axios from 'config/axios';
import { toast, Zoom } from 'react-toastify';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHistory } from 'react-router';
import Errormsg from 'config/errormsg';

export default function Detail() {
    const history = useHistory();
    const searchRef = useRef();

    const [period, setPeriod] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState({});
    const [data, setData] = useState([]);
    let [totalSize, setTotal] = useState(0);
    const sizePerPage = 10;
    const [toLevel3, setToLevel3] = useState(false);
    const [regStatusModal, setRegStatusModal] = useState(false);
    const [regStatusForm, setRegStatusForm] = useState({
        regid: '',
        status: '',
        description: ''
    });
    const [selected, setSelected] = useState({
        id: "",
        name: ""
    });
    const [undoToggle, setUndo] = useState(false);
    const [toReject, setToReject] = useState(false);
    const [submited, setSubmited] = useState(false);
    const changeRegStatus = (field, value) => { setRegStatusForm({ ...regStatusForm, [field]: value }); };

    // toggle modal
    const toggleLevel3 = () => {
        setToLevel3(!toLevel3);
    };
    const toggleReject = () => {
        setToReject(!toReject);
    }

    const toggleUndo = (user) => {
        setUndo(!undoToggle);
        let selectUser = {
            id: user.registerid,
            name: user.fullname,
            requirement: user.requirement,
            level:user.currentlevel
        }
        setSelected(selectUser);
    };

    const toggleRegStatusModal = (user) => {
        setRegStatusModal(!regStatusModal);
        let regStatus = {
            regid: user.registerid,
            status: user.regstatus,
            description: user.regdesc
        };
        let selectUser = {
            id: user.registerid,
            name: user.fullname,
            requirement: user.requirement,
            level:user.currentlevel
        }
        setSelected(selectUser);
        setRegStatusForm(regStatus);
    };
    // end toggle modal

    const [param, setParam] = useState({
        page: 1,
        count: sizePerPage,
        search: '',
        period: '',
    });

    const completeFormatter = (cell, row) => {
        return (cell ? (
            <span>
                <FontAwesomeIcon icon={["far", "check-circle"]} size='lg' color='green' />
            </span>
        ) : (<></>)
        );
    }
    /* const actionFormatter = (cell, row) => {
        return (
            <Button color="primary" className="m-2" size="sm" onClick={e => {
                e.stopPropagation();
                history.push("/tahap2/edit", { req: row })
            }}>
                <FontAwesomeIcon icon={['fa', 'info-circle']} />
            </Button>
        )
    } */

    const GetActionFormat = (cell, row) => {
        let a;
        if (row.regstatus === "Reject" || row.regstatus === "Blacklist") {
            a = (<Button color="warning" size="sm" disabled={selectedPeriod.active !== "Active"||row.currentlevel!==2}
                onClick={e => {
                    e.stopPropagation();
                    toggleUndo(row);
                }}>
                <FontAwesomeIcon icon={['fa', 'undo']} />
            </Button>)
        } else {
            a = (<Button color="primary" size="sm" disabled={selectedPeriod.active !== "Active"}
                onClick={e => {
                    e.stopPropagation();
                    toggleRegStatusModal(row);
                }}>
                <FontAwesomeIcon icon={['fa', 'edit']} />
            </Button>)
        }
        return (
            <div>
                <Button color="primary" className="mr-2" size="sm"
                    onClick={e => {
                        e.stopPropagation();
                        history.push("/tahap2/req", { req: row, active: selectedPeriod.active === "Active" })
                    }}>
                    <FontAwesomeIcon icon={['fa', 'info-circle']} />
                </Button>
                {a}
            </div>
        );
    }

    function statusFormatter(cell, row) {
        if (cell === "Pending") {
            return (<span className="text-warning">{cell}</span>);
        }
        if (cell === "Reject") {
            return (<span className="text-danger">Ditolak</span>);
        }
        if (cell === "Approve") {
            return (<span className="text-success">Diterima ke Tahap III</span>);
        }
        if (cell === "Blacklist") {
            return (<span style={{ color: "black" }}>Blacklist</span>);
        }
        return <>{cell}</>
    }

    const columns = [
        {
            dataField: 'action',
            text: 'Action',
            formatter: GetActionFormat,
        },
        {
            dataField: 'fullname',
            text: 'Nama Lengkap'
        },
        {
            dataField: 'email',
            text: 'Email'
        },
        {
            dataField: 'mobile',
            text: 'No. HP'
        },
        {
            dataField: 'regstatus',
            text: 'S. Pendaftaran',
            formatter: statusFormatter,
        },
    ];

    const innerColumns = [
        // {
        //     dataField: 'action',
        //     text: 'Action',
        //     formatter: actionFormatter,
        // },
        {
            dataField: 'name',
            text: 'Nama',
        },
        {
            dataField: 'completed',
            text: 'Completed',
            formatter: completeFormatter,
        },
        {
            dataField: 'status',
            text: 'Status',
        },
        {
            dataField: 'adminnotes',
            text: 'Catatan',
        }
    ];

    const expandRow = {
        onlyOneExpanding: true,
        showExpandColumn: true,
        renderer: row => {
            row.requirement.forEach(e => { e.registerid = row.registerid })
            return (
                <>
                    <BootstrapTable
                        keyField='reqid'
                        data={row.requirement}
                        columns={innerColumns}
                        noDataIndication="Belum ada data"
                        wrapperClasses="table-responsive"
                    />
                </>
            )
        }
    };

    const handleTableChange = (type, { page, sizePerPage }) => {
        setParam((prevState) => ({
            ...prevState,
            page: page
        }))
    }

    const handleSearch = (e) => {
        e.preventDefault();
        setParam((prevState) => ({ ...prevState, search: searchRef.current.value }));
    }

    const handleSelectPeriod = (e) => {
        let val = e.target.value;
        if (val === 'Pilih Periode') {
            return;
        }
        setSelectedPeriod(period.find(x => x.id === val));
        setParam((prevState) => ({
            ...prevState, period: val
        }));
    }

    async function fetchData(param) {
        if (!param.period) {
            return;
        }
        try {
            let res = await axios.post('/b/o/trans/admreq', JSON.stringify(param))
            let data = res.data;
            if (data.st) {
                setTotal(data.data.total)
                setData(data.data.list)
                console.log(res);
            } else {
                toast.error(data.msg, { containerId: 'B', transition: Zoom });
            }
        } catch (error) {
            // if (!error.response) {
            //     toast.error(error.toString(), { containerId: 'B', transition: Zoom });
            //     return
            // }
            console.log("masuk fetchdata");
            toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
        }
    }

    async function fetchPeriod() {
        try {
            let res = await axios.post('/b/o/master/periodregister', JSON.stringify({
                page: 1, count: 30
            }));
            if (!res.data.st) {
                toast.error(res.data.msg, { containerId: 'B', transition: Zoom });
                return;
            }
            let data = res.data.data.list;
            let activePeriode = '';
            let mapped = data.map(e => {
                if (e.flagactive === 'Active') {
                    activePeriode = e.id;
                }
                return {
                    id: e.id,
                    active: e.flagactive,
                    period: e.yearperiod.concat('-', e.wavenum)
                }
            });
            if (activePeriode !== '') {
                setParam((prevState) => ({
                    ...prevState, period: activePeriode
                }));
                setSelectedPeriod(mapped.find(x => x.id === activePeriode));
            }
            setPeriod(mapped);
        } catch (error) {
            // if (!error.response) {
            //     toast.error(error.toString(), { containerId: 'B', transition: Zoom });
            //     return
            // }
            console.log("masuk fetchperiod");
            toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
        }
    }

    async function handleUndo(e) {
        e.preventDefault();
        toast.dismiss();
        try {
            // console.log(selected);
            let res = await axios.post('/b/o/leveltwo/undo', { regid: selected.id });
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
            console.log("masuk handleundo");
            toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
            toggleUndo({});
        }
    }

    const level3Handler = async () => {
        toast.dismiss();
        try {
            let res = await axios.post('/b/o/levelthree', JSON.stringify({
                regid: selected.registerid
            }))
            if (res.data.st) {
                toast.success("Pendaftar berhasil dinaikan ke tahap III", { containerId: 'B', transition: Zoom })
                toggleLevel3();
            }
        } catch (error) {
            toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
        }
    }

    const regStatusHandler = async () => {
        //console.log(selected)        
        toast.dismiss();
        if ((regStatusForm.status === 'Reject' || regStatusForm.status === 'Blacklist') && regStatusForm.description === '') {
            setSubmited(true);
            toast.error('Harap lengkapi data', { containerId: 'B', transition: Zoom });
        } else {
            let cekLampiran = true;
            if (regStatusForm.status === 'Approve') {
                cekLampiran = await selected.requirement.every((sr, key) => {
                    if (!sr.completed || sr.status !== "Approve") {
                        return false
                    }
                    else {
                        return true
                    }
                })
                if (cekLampiran) {
                    toggleLevel3();
                }
                else {
                    toast.error("Harap memeriksa kembali kelengkapan berkas pendaftaran peserta", {
                        containerId: "B",
                        transition: Zoom
                    })
                    console.log("masuk regstatushandler");
                }
            }
            else { toggleReject(); }
        }
    }

    const submitStatus = async () => {
        try {
            let res = await axios.post('/b/o/registerstatus', JSON.stringify(regStatusForm))
            if (res.data.st) {
                toast.success("Status Pendaftar berhasil diubah", { containerId: 'B', transition: Zoom })
                fetchData(param);
            } else {
                toast.error(res.data.msg, { containerId: 'B', transition: Zoom });
            }
            if (toLevel3) toggleLevel3();
            if (toReject) toggleReject();
            toggleRegStatusModal({});
        } catch (error) {
            toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
            if (toLevel3) { toggleLevel3() };
            if (toReject) { toggleReject() };
            toggleRegStatusModal({});
        }
    }

    useEffect(() => { fetchData(param) }, [param]);
    useEffect(() => { fetchPeriod() }, []);
    return (
        <>
            <Modal zIndex={2000} centered isOpen={toLevel3} toggle={toggleLevel3}>
                <ModalHeader toggle={toggleLevel3}>Apakah anda yakin untuk menaikan {selected.name} ke tahap III ?</ModalHeader>
                <ModalFooter>
                    <Button color="primary" onClick={submitStatus}>Ya</Button>
                    <Button color="secondary" onClick={toggleLevel3}>Tutup</Button>
                </ModalFooter>
            </Modal>
            <Modal zIndex={2000} centered isOpen={toReject} toggle={toggleReject}>
                <ModalHeader toggle={toggleReject}>Apakah anda yakin untuk {(regStatusForm.status === 'Reject') ? "menolak" : "blacklist"} {selected.name}?</ModalHeader>
                <ModalFooter>
                    <Button color="primary" onClick={submitStatus}>Ya</Button>
                    <Button color="secondary" onClick={toggleReject}>Tutup</Button>
                </ModalFooter>
            </Modal>
            <Modal zIndex={2000} centered isOpen={undoToggle} toggle={toggleUndo}>
                <ModalHeader toggle={toggleUndo}>Apakah anda yakin untuk mengembalikan {selected.name} ke status Pending ?</ModalHeader>
                <ModalFooter>
                    <Button color="primary" onClick={handleUndo}>Ya</Button>
                    <Button color="secondary" onClick={toggleUndo}>Tutup</Button>
                </ModalFooter>
            </Modal>
            <Modal zIndex={2000} centered isOpen={regStatusModal} toggle={toggleRegStatusModal}>
                <ModalHeader toggle={toggleRegStatusModal}>Ubah status pendaftaran</ModalHeader>
                <ModalBody>
                    <FormGroup tag="fieldset">
                        <legend>Status Pendaftaran</legend>
                        {   (selected.level===2)? (<FormGroup check>
                            <Label check>
                                <Input type="radio" name="regstatus" value='Approve'
                                    onClick={() => { setRegStatusForm((prevState) => ({ ...prevState, status: 'Approve' })) }}
                                    checked={regStatusForm.status == 'Approve'} />{' '}
                                Lulus ke tahap III
                            </Label>
                        </FormGroup>):null}
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
                                    checked={regStatusForm.status == 'Reject'} />{' '}
                                Ditolak
                            </Label>
                        </FormGroup>
                        <FormGroup check>
                            <Label check>
                                <Input type="radio" name="regstatus" value='Blacklist'
                                    onClick={() => { setRegStatusForm((prevState) => ({ ...prevState, status: 'Blacklist' })) }}
                                    checked={regStatusForm.status == 'Blacklist'} />{' '}
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
                            invalid={regStatusForm.description == '' && regStatusForm.status !== 'Approve' && submited} />
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
                    <CardTitle>Administrasi</CardTitle>
                    <div className="my-2">
                        <Row>
                            <Col className="m-2">
                                <Label>Search</Label>
                                <Input className="m-0" type="search" placeholder="Nama, Email, No.HP" innerRef={searchRef} />
                                <Button onClick={handleSearch} color="primary" className="mt-2">
                                    <FontAwesomeIcon icon={['fas', 'search']} />
                                    <span style={{ marginLeft: 10 }}>
                                        Cari
                                </span>
                                </Button>
                            </Col>
                            <Col md="6" className="my-2">
                                <Row className="mx-2 mb-2">
                                    <Label htmlFor="exampleSelect">Periode</Label>
                                    <Input type="select" name="period" id="period" onChange={handleSelectPeriod} value={selectedPeriod.id}>
                                        <option>Pilih Periode</option>
                                        {
                                            period.map(x => (
                                                <option key={x.id} value={x.id}>{x.period}</option>
                                            ))
                                        }
                                    </Input>
                                </Row>
                            </Col>
                        </Row>
                    </div>

                    <BootstrapTable
                        remote
                        keyField='registerid'
                        data={data}
                        columns={columns}
                        bodyClasses="bootstrap-table"
                        pagination={paginationFactory(
                            {
                                hideSizePerPage: true,
                                hidePageListOnlyOnePage: true,
                                page: param.page,
                                sizePerPage,
                                totalSize,
                            }
                        )}
                        onTableChange={handleTableChange}
                        expandRow={expandRow}
                        noDataIndication="Belum ada data"
                        wrapperClasses="table-responsive"
                    />
                </CardBody>
            </Card>
        </>
    )
}
