import React, { useEffect, useState } from 'react';
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
import Select, { Option } from 'rc-select';
import LaddaButton from 'react-ladda/dist/LaddaButton';
import Errormsg from 'config/errormsg';

async function upload(data) {
  return axios({
    url: '/b/o/master/files/update',
    method: 'POST',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

function getFileUrl(path) {
  let url = axios.defaults.baseURL;
  url = url + 'serve/file/0/' + path;
  return <a href={url}>{path}</a>;
}

export default function FileEdit(props) {
  const history = useHistory();
  if (!props.location.state) {
    history.goBack();
  }
  const fileObject = props.location.state.file;
  const [nameErr, setNameErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState({ children: '', value: '' });

  useEffect(() => {
    switch (fileObject.level) {
      case 2:
        setLevel({ children: 'Tahap II', value: '2' });
        break;
      case 3:
        setLevel({ children: 'Tahap III', value: '3' });
        break;
      case 4:
        setLevel({ children: 'Tahap IV', value: '4' });
        break;
      case 5:
        setLevel({ children: 'Tahap V', value: '5' });
        break;
      case 6:
        setLevel({ children: 'Tahap FINAL', value: '6' });
        break;

      default:
        break;
    }
  }, [fileObject.level]);

  async function handleSubmit(e) {
    toast.dismiss();
    e.preventDefault();
    const formData = new FormData();

    const name = e.target.name.value;
    if (!name) {
      setNameErr(true);
      return;
    }

    const file = e.target.file.files[0];
    if (file !== null || file !== undefined) {
      formData.append('file', file);
    }

    formData.append('id', fileObject.id);
    formData.append('name', name);
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
                <BreadcrumbItem active>Update</BreadcrumbItem>
              </Breadcrumb>
              <CardTitle>Update File</CardTitle>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="name">Nama file</Label>
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    maxLength={100}
                    defaultValue={fileObject.name}
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
                <p>Path: {getFileUrl(fileObject.pathfile)}</p>
                <FormGroup>
                  <Label for="file">File: </Label>
                  <Input type="file" name="file" id="file" />
                </FormGroup>
                <LaddaButton
                  className="btn btn-primary"
                  loading={loading}
                  type="submit">
                  Update
                </LaddaButton>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
}
