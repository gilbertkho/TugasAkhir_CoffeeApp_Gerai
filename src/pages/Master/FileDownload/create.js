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
import Select, { Option } from 'rc-select';
import { toast, Zoom } from 'react-toastify';
import LaddaButton from 'react-ladda/dist/LaddaButton';
import Errormsg from 'config/errormsg';

async function upload(data) {
  return axios({
    url: '/b/o/master/files/create',
    method: 'POST',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export default function FileCreate() {
  const history = useHistory();
  const [nameErr, setNameErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState({ children: '', value: '' });

  async function handleSubmit(e) {
    toast.dismiss();
    e.preventDefault();
    const name = e.target.name.value;
    if (!name) {
      setNameErr(true);
      return;
    }
    const file = e.target.file.files[0];
    if (file === null || file === undefined) {
      toast.error('Silahkan pilih file terlebih dahulu', {
        containerId: 'B',
        transition: Zoom
      });
      return;
    }
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);
    formData.append('level', level.value);
    try {
      setLoading(true);
      let res = await upload(formData);
      if (res.data.st) {
        history.push('/master/file/');
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

  return (
    <>
      <Row>
        <Col md={{ size: 8, offset: 2 }}>
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
                    File
                  </a>
                </BreadcrumbItem>
                <BreadcrumbItem active>Upload</BreadcrumbItem>
              </Breadcrumb>
              <CardTitle>Upload File</CardTitle>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="name">Nama file</Label>
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    maxLength={100}
                    invalid={nameErr}
                  />
                  <FormFeedback>Nama harus diisi!</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label for="level">Tahap</Label>
                  <Select
                    // disabled={disabled}
                    placeholder="Pilih Tahap"
                    className="register-box"
                    allowClear
                    name="level"
                    id="level"
                    style={{ width: '100%' }}
                    value={level.children}
                    onChange={(value, option) => {
                      option === undefined
                        ? setLevel({ children: '', value: '' })
                        : setLevel(option.props);
                    }}>
                    {/* <Option value="1">Tahap I</Option> */}
                    <Option value="2">Tahap II</Option>
                    <Option value="3">Tahap III</Option>
                    <Option value="4">Tahap IV</Option>
                    <Option value="5">Tahap V</Option>
                    <Option value="6">Tahap Final</Option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label for="file">File: </Label>
                  <Input type="file" name="file" id="file" />
                </FormGroup>
                <LaddaButton
                  className="btn btn-primary"
                  loading={loading}
                  type="submit">
                  Upload
                </LaddaButton>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
}
