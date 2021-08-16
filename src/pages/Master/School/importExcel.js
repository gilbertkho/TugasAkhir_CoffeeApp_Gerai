import axios from 'config/axios';
import Errormsg from 'config/errormsg';
import React, { useState } from 'react';
import LaddaButton from 'react-ladda/dist/LaddaButton';
import { useHistory } from 'react-router';
import { toast, Zoom } from 'react-toastify';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Row
} from 'reactstrap';

async function upload(data) {
  return axios({
    url: '/b/o/master/schools/import',
    method: 'POST',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export default function SchoolImport() {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [fileErr, setFileErr] = useState(false);
  const [fileName, setFileName] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    toast.dismiss();
    const file = e.target.file.files[0];
    if (file === null || file === undefined) {
      setFileErr(true);
      return;
    }
    const formData = new FormData();
    formData.append('schools', file);
    try {
      setLoading(true);
      let res = await upload(formData);
      if (res.data.st) {
        toast.success('Berhasil menambahkan', {
          containerId: 'B',
          transition: Zoom
        });
        history.push('/master/school/');
      } else {
        toast.error(res.data.msg, { containerId: 'B', transition: Zoom });
      }
    } catch (error) {
      // if (!error.response) {
      //   toast.error(error.toString(), { containerId: 'B', transition: Zoom });
      //   return
      // }
      toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
    } finally {
      setLoading(false);
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
                    Sekolah
                  </a>
                </BreadcrumbItem>
                <BreadcrumbItem active>Import</BreadcrumbItem>
              </Breadcrumb>
              <CardTitle>Import Sekolah dari Excel</CardTitle>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label htmlFor="photo">File Excel</Label>
                  <br />
                  <Input
                    type="file"
                    name="file"
                    id="file"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files.length > 0) {
                        setFileName(e.target.files[0].name);
                      }
                    }}
                  />

                  {fileErr && (
                    <div
                      style={{
                        color: '#f83245',
                        marginTop: '0.25rem',
                        marginBottom: '0.25rem'
                      }}>
                      Silahkan pilih file terlebih dahulu
                    </div>
                  )}
                  {fileName !== '' && <div>File: {fileName}</div>}
                  <Button
                    className="btn-pill font-weight-bold px-4 text-uppercase font-size-sm"
                    style={{ marginTop: '0.25rem' }}
                    outline
                    color="primary"
                    onClick={() => {
                      document.getElementById('file').click();
                    }}>
                    Pilih File
                  </Button>
                </FormGroup>
                <LaddaButton
                  className="btn btn-primary"
                  loading={loading}
                  type="submit">
                  Import
                </LaddaButton>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
}
