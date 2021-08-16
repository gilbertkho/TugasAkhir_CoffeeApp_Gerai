/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardBody, CardTitle, Row, Col, Label, Input, Button, Modal, ModalHeader, ModalFooter, Breadcrumb, BreadcrumbItem } from 'reactstrap'
import BootstrapTable from "react-bootstrap-table-next";
import axios from 'config/axios';
import { toast, Zoom } from 'react-toastify';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHistory } from 'react-router';
import Errormsg from 'config/errormsg';

export default function Requirement(props) {
    const history = useHistory();
    const searchRef = useRef();

    if (!props.location.state) {
        history.goBack();
    }
    //const req = props.location.state.req;
    const active = props.location.state.active;
    const [req, setReq] = useState(props.location.state.req);
    const [period, setPeriod] = useState([]);
    const [data, setData] = useState([]);
    let [totalSize, setTotal] = useState(0);
    const sizePerPage = 10;
    const [toLevel3, setToLevel3] = useState(false);
    const [selected, setSelected] = useState({});
    const toggleLevel3 = (user) => {
        setToLevel3(!toLevel3);
        setSelected(user);
        // console.log(user, selected);
    };
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
    const actionFormatter = (cell, row) => {
        return (
            <Button color="primary" className="m-2" size="sm" onClick={e => {
                e.stopPropagation();
                let param = row;
                row.registerid = req.registerid;
                history.push("/tahap2/edit", { req: param, active: active });
            }}>
                <FontAwesomeIcon icon={['fa', 'info-circle']} />
            </Button>
        )
    }

    const GetActionFormat = (cell, row) => {
        return (
            <div>
                <Button color="primary" className="m-2" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    toggleLevel3(row);
                }}>
                    III
                </Button>
            </div>
        );
    }

    // const columns = [
    //     {
    //         dataField: 'action',
    //         text: 'Action',
    //         formatter: GetActionFormat,
    //     },
    //     {
    //         dataField: 'fullname',
    //         text: 'Nama Lengkap'
    //     },
    //     {
    //         dataField: 'email',
    //         text: 'Email'
    //     },
    //     {
    //         dataField: 'mobile',
    //         text: 'No. HP'
    //     },
    // ];

    const columns = [
        {
            dataField: 'action',
            text: 'Action',
            formatter: actionFormatter,
        },
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

    async function fetchDataReq() {
        try {
            let res = await axios.post('/b/o/trans/admreq/register', JSON.stringify({
                registerid: req.registerid
            }))
            let data = res.data;
            if (data.st) {
                setReq(data.data);
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
                if (e.flagactive == 'Active') {
                    activePeriode = e.id;
                }
                return {
                    id: e.id,
                    active: e.flagactive,
                    period: e.yearperiod.concat('-', e.wavenum)
                }
            });
            if(activePeriode != ''){
                setParam((prevState) => ({
                    ...prevState, period: activePeriode
                }));
            }
            setPeriod(mapped);
        } catch (error) {
            // if (!error.response) {
            //     toast.error(error.toString(), { containerId: 'B', transition: Zoom });
            //     return
            // }
            toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
        }
    }

    // useEffect(() => { fetchData(param) }, [param]);
    // useEffect(() => { fetchPeriod() }, []);
    useEffect(() => {fetchDataReq() },[]);
    return (
        <>
            <Card>
                <CardBody>
                    <Breadcrumb>
                        <BreadcrumbItem><a href="/#" onClick={(e)=>{e.preventDefault(); history.goBack()}}>Tahap II</a></BreadcrumbItem>
                        <BreadcrumbItem active>Syarat Administrasi</BreadcrumbItem>
                    </Breadcrumb>
                    <CardTitle>Detail Syarat Administrasi</CardTitle>
                    <div className="my-2">
                        <Row>
                            <Col md={3}>
                                Nama :
                            </Col>
                            <Col md={9} className='pl-4'>
                                {req.fullname}
                            </Col>
                            <Col md={3}>
                                Email :
                            </Col>
                            <Col md={9} className='pl-4'>
                                {req.email}
                            </Col>
                            <Col md={3}>
                                No. HP :
                            </Col>
                            <Col md={9} className='pl-4'>
                                {req.mobile}
                            </Col>
                            <Col md={3}>
                                Status Pendaftaran :
                            </Col>
                            <Col md={9} className='pl-4'>
                                {
                                    req.regstatus
                                }
                            </Col>
                        </Row>
                    </div>               
                    <BootstrapTable
                        remote
                        keyField='reqid'
                        bodyClasses="bootstrap-table"
                        data={req.requirement}
                        columns={columns}
                        noDataIndication="Belum ada data"
                        wrapperClasses="table-responsive"
                    />
                </CardBody>
            </Card>
        </>
    )
}