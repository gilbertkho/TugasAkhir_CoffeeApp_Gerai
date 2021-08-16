import React, { useState } from 'react';
import { useHistory } from 'react-router';
import {
  Card,
  CardBody,
  CardTitle,
  Col,
  FormGroup,
  Row,
  Form,
  Label,
  Input,
  FormFeedback,
  Breadcrumb,
  BreadcrumbItem
} from 'reactstrap';
import axios from 'config/axios';
import { toast, Zoom } from 'react-toastify';
import LaddaButton from 'react-ladda/dist/LaddaButton';
import Errormsg from 'config/errormsg';

export default function PeriodEdit(props) {
  const history = useHistory();
  if (!props.location.state) {
    history.goBack();
  }
  const periodObject = props.location.state.period;
  const [periodErr, setPeriodErr] = useState(false);
  const [waveErr, setWaveErr] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    toast.dismiss();
    let hasErr = false;
    if (!e.target.wavenum.value) {
      hasErr = true;
      setWaveErr(true);
    } else setWaveErr(false);
    if (!e.target.yearperiod.value) {
      hasErr = true;
      setPeriodErr(true);
    } else setPeriodErr(false);

    if (!hasErr) {
      const period = {
        id: periodObject.id,
        yearperiod: e.target.yearperiod.value,
        wavenum: parseInt(e.target.wavenum.value),
        description: e.target.description.value,
        flagactive: e.target.active.value
      };
      try {
        setLoading(true);
        let res = await axios.post(
          '/b/o/master/periodregister/update',
          JSON.stringify(period)
        );
        if (res.data.st) {
          history.push('/master/period/');
        } else {
          toast.error(res.data.msg, { containerId: 'B', transition: Zoom });
        }
      } catch (error) {
        // if (!error.response) {
        //     toast.error(error.toString(), { containerId: 'B', transition: Zoom });
        //     return
        // }
        toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <>
      <Row>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <Card>
            <CardBody>
              <Breadcrumb>
                <BreadcrumbItem>
                  <a
                    href="/#"
                    onClick={(e) => {
                      e.preventDefault();
                      history.goBack();
                    }}>
                    Periode
                  </a>
                </BreadcrumbItem>
                <BreadcrumbItem active>Edit</BreadcrumbItem>
              </Breadcrumb>
              <CardTitle>Edit Periode</CardTitle>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="yearperiod">Periode</Label>
                  <Input
                    id = "yearperiod"
                    invalid = {periodErr}
                    defaultValue = {periodObject.yearperiod}
                  />
                  <FormFeedback>Periode harus diisi</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label for="wavenum">Gelombang</Label>
                  <Input
                    id = "wavenum"
                    type = "number"
                    className = "text-right"
                    min = {1}
                    invalid = {waveErr}
                    defaultValue = {periodObject.wavenum}
                  />
                  <FormFeedback>Gelombang harus diisi</FormFeedback>
                </FormGroup>
                <FormGroup tag = "fieldset">
                  Active
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="radio"
                        name="active"
                        value="Active"
                        defaultChecked={periodObject.flagactive === 'Active'}
                      />
                      Active
                    </Label>
                  </FormGroup>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="radio"
                        name="active"
                        value="Inactive"
                        defaultChecked={periodObject.flagactive !== 'Active'}
                      />
                      Inactive
                    </Label>
                  </FormGroup>
                </FormGroup>
                <FormGroup>
                  <Label for="description">Description</Label>
                  <Input
                    id="description"
                    type="textarea"
                    maxLength={100}
                    defaultValue={periodObject.description}
                  />
                </FormGroup>
                <LaddaButton
                  className="btn btn-primary"
                  loading={loading}
                  type="submit">
                  Submit
                </LaddaButton>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
}
