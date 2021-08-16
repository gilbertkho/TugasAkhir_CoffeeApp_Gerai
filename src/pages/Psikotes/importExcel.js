import axios from 'config/axios';
import Errormsg from 'config/errormsg';
import React, { useEffect, useState } from 'react';
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
    url: '/b/o/psikotes/score/import',
    method: 'POST',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export default function PsikotesImport() {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [fileErr, setFileErr] = useState(false);
  const [fileName, setFileName] = useState('');
  const [periodReg, setPeriodReg] = useState([]);
  const [choosenPer,setChoosePer] = useState('');
  const [errorWarning, setErrorWarning]=useState([]);

  async function handleSubmit(e) {
    setFileErr("");
    setErrorWarning([]);
    e.preventDefault();
    toast.dismiss();
    const file = e.target.file.files[0];
    if (file === null || file === undefined) {
      setFileErr(true);
      return;
    }
    const formData = new FormData();
    formData.append('psikotes', file);
    formData.append('periodid',choosenPer);
    try {
      setLoading(true);
      let res = await upload(formData);
      if (res.data.st) {
        toast.success('Berhasil menambahkan', {
          containerId: 'B',
          transition: Zoom
        });
        //history.push('/psikotes/');
      } else {
        toast.error(res.data.msg, { containerId: 'B', transition: Zoom });
        setErrorWarning(res.data.error);
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

  const getPeriodReg = () => {
    axios.post('/b/o/master/periodregister', JSON.stringify({
      page: 1, count: 100
    })).then(({ data }) => {
      console.log(data);
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

  useEffect(() => {
    if(periodReg.length<=0)
    {
      getPeriodReg();
    }
  });

  const warningUser=()=>{
    return <div>
    <Card>
      <CardBody>
      <Breadcrumb style={{color:'red'}}>
      Warning!
      </Breadcrumb>
      <p style={{whiteSpace:"pre-line", paddingLeft:30}}>
      {errorWarning.map((err) => {
          return <container>
            {err+"\n"} <hr/>
          </container>
        })}
        </p>
      </CardBody>
    </Card>
  </div>
  }

  return (
    <>
      <Row>
        <Col sm="12" md={{ size: 8, offset: 1 }}>
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
                    Nilai Psikotes
                  </a>
                </BreadcrumbItem>
                <BreadcrumbItem active>Import</BreadcrumbItem>
              </Breadcrumb>
              <CardTitle>Import nilai psikotes dari Excel</CardTitle>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="period">Periode Ujian</Label>
                  <Input id="period" name="period" type="select" onChange={(e)=>setChoosePer(e)}>
                    {/* <option value="">Pilih Periode Ujian</option> */}
                    {periodReg.map((pr, key) => {
                      if(pr.flagactive==="Active")
                      {
                        if(choosenPer==='')
                        {
                          setChoosePer(pr.id);
                        }
                        return (
                        <option key={key} value={pr.id}>{pr.yearperiod + " Gelombang: " + pr.wavenum}</option>
                      )}
                      else return null;
                    })}
                  </Input>
                  <br />
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
              <br />
              {(errorWarning.length>0)?warningUser():null}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
}
