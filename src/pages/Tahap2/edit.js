import axios from 'config/axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { toast, Zoom } from 'react-toastify';
import {
  Row,
  Card,
  CardBody,
  FormGroup,
  Input,
  Form,
  Label,
  Button,
  Col,
  Container,
  CardTitle,
  CardSubtitle,
  Breadcrumb,
  BreadcrumbItem
} from 'reactstrap';
import AttachmentPage from './attachment';
import ScorePage from './score';
import TextPage from './text';
import { NavLink } from 'react-router-dom';
import Errormsg from 'config/errormsg';

export default function DetailEdit(props) {
  const history = useHistory();
  if (!props.location.state) {
    history.goBack();
  }
  // console.log("req", props.location.state)
  const active = props.location.state.active;
  const req = props.location.state.req;
  const [reqDetails, setReqDetails] = useState([]);

  async function handleSubmit(e) {
    toast.dismiss();
    e.preventDefault();
    if (!active) {
      return;
    }
    let request = {
      registerid: req.registerid,
      reqid: req.reqid,
      status: e.target.status.value,
      adminnotes: e.target.adminnotes.value
    };
    if (!request.status) {
      request.status = 'Pending';
    }
    try {
      let res = await axios.post('/b/o/trans/admreq/update', request);
      let data = res.data;
      if (data.st) {
        toast.success('Berhasil tersimpan', {
          containerId: 'B',
          transition: Zoom
        });
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

  const fetchDetails = useCallback(async () => {
    try {
      let request = {
        registerid: req.registerid,
        reqid: req.reqid
      };
      let res = await axios.post('/b/o/trans/admreq/detail', request);
      let data = res.data;
      if (data.st) {
        setReqDetails(data.data);
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
  }, [req]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const getDetailCode = (detailCode) => {
    let detailStr = ``;
    switch (detailCode) {
      case 'TBPJS':
        detailStr = 'Pendaftar memiliki BPJS / KIS / Sejenisnya?';
        break;
      case 'ABPJS':
        detailStr = 'Kelengkapan BPJS / KIS / Sejenisnya';
        break;
      case 'TDEPOSIT':
        detailStr = 'Pendaftar setuju untuk deposit uang Rp 1.000.000?';
        break;
      case 'ADEPOSIT':
        detailStr = 'Kelengkapan Deposit';
        break;

      default:
        break;
    }
    return detailStr;
  };

  return (
    <Container className="m-2">
      <Col>
        <Row>
          <Col lg={12} className="my-2">
            <Card>
              <CardBody>
                <Breadcrumb>
                  <BreadcrumbItem>
                    <NavLink to="/tahap2">Tahap II</NavLink>
                  </BreadcrumbItem>
                  <BreadcrumbItem>
                    <a
                      href="/#"
                      onClick={(e) => {
                        e.preventDefault();
                        history.goBack();
                      }}>
                      Syarat Administrasi
                    </a>
                  </BreadcrumbItem>
                  <BreadcrumbItem active>{req.name}</BreadcrumbItem>
                </Breadcrumb>
                <CardTitle style={{ fontWeight: 'bold' }}>{req.name}</CardTitle>
                <CardSubtitle>
                  {req.completed ? 'Lengkap' : 'Belum Lengkap'}
                </CardSubtitle>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg={6} className="my-2">
            <Card>
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="status">Status</Label>
                    <Input
                      id="status"
                      name="status"
                      type="select"
                      defaultValue={req.status}>
                      <option>Pending</option>
                      <option>Incorrect</option>
                      <option>Approve</option>
                    </Input>
                  </FormGroup>
                  <FormGroup>
                    <Label for="adminnotes">Catatan</Label>
                    <Input
                      id="adminnotes"
                      name="adminnotes"
                      type="textarea"
                      defaultValue={req.adminnotes}
                    />
                  </FormGroup>
                  <Button
                    color="primary"
                    type="submit"
                    block
                    disabled={!active}>
                    Submit
                  </Button>
                </Form>
              </CardBody>
            </Card>
          </Col>
          {reqDetails.map((detail) => {
            return (
              <Col lg={6} className="my-2" key={detail.id}>
                <Card>
                  <CardBody>
                    <CardTitle>
                      {detail.type}
                      {detail.code && <> | {getDetailCode(detail.code)}</>}
                    </CardTitle>
                    {detail.type === 'Attachment' && (
                      <AttachmentPage attachment={detail.attachment} />
                    )}
                    {detail.type === 'Text' && (
                      <TextPage texts={detail.text} reqName={req.name} />
                    )}
                    {detail.type === 'Score' && (
                      <ScorePage scores={detail.score} />
                    )}
                  </CardBody>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Col>
    </Container>
  );
}
