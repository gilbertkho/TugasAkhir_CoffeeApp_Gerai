import React,{ useEffect, useState} from 'react'
import { useHistory } from 'react-router';
import {
  Card, FormGroup, Label, Input,
  FormFeedback, Col, Row, Button,
  Breadcrumb, BreadcrumbItem,  
} from 'reactstrap';
import { toast, Zoom } from 'react-toastify';
import Errormsg  from 'config/errormsg';
import axios from 'config/axios';
import urlConfig from 'config/backend';

export default function EditJawaban(props) {
  const history = useHistory();
  const [ans, setAns] = useState([]); 
  const [submited, setSubmited] = useState(false);
  const [req, setReq] = useState({ id: "", catid: "", catname: "", question: "", attachment: [] });
  const [ansActionType, setAnsActionType] = useState("add");
  const [ansReq, setAnsReq] = useState({questionid:"", optlabel:"A", optanswer:"", attachments:[] });
  const [oldAnsReq, setOldAnsReq] = useState({});
  const [ansFilePrev, setAnsFilePrev] = useState([]);
  const [ansAttState, setAnsAttState] = useState(0);
  const resetAnsReq = () => { setAnsReq({ questionid: "", optlabel: "A", optanswer: "", attachments: [] }) };
  const resetAnsFilePrev = () => { setAnsFilePrev([]); };
  const changeAnsReq = (field, value) => { setAnsReq({ ...ansReq, [field]: value}); };

  useEffect(() => {
    resetAnsReq();
    resetAnsFilePrev();
    setAnsActionType("add");
    let propsAns = props.location.state.ans;
    let propsReq = props.location.state.req;
    if (props.location.state && props.location.state.ansReq) {
      let propsAnsReq = props.location.state.ansReq;
      console.log(propsAnsReq);
      if(propsAnsReq.optlabel && propsAnsReq.optanswer){
        setAnsReq({
          ...ansReq,
          questionid: propsAnsReq.questionid ? propsAnsReq.questionid : propsAnsReq.id,
          optlabel: propsAnsReq.optlabel ? propsAnsReq.optlabel : "A",
          optanswer: propsAnsReq.optanswer,
          attachments: propsAnsReq.attachments,
        });
        setOldAnsReq(propsAnsReq);
        if(propsAnsReq.attachments.length > 0){
          let file = [];
          propsAnsReq.attachments.forEach((ra) => {
            file.push(urlConfig.urlBackend + "public/attach/" + ra.attachment);
          })
          setAnsFilePrev(file);
        }
        setAnsActionType("edit");
      }
      else{
        setAnsReq({...ansReq, questionid:propsAnsReq.questionid});
      }
    }
    setReq({
      ...req,
      id: propsReq.id,
      catid: propsReq.catid,
      catname: propsReq.catname,
      question: propsReq.question,
      attachmentlist: propsReq.attachment,
    });
    setAns(propsAns)
  },[])

  //attachment jawaban
  const addAnsRequirement = () => {
    let oldReq = ansReq.attachments;
    let oldFile = ansFilePrev;
    oldReq.push({ seq: 0, id:"", attachment:[]});
    oldFile.push('');    
    setAnsReq({ ...ansReq, attachments: oldReq });
    setAnsFilePrev(oldFile);
    // setAnsReq((prevState)=>({...prevState, attachments: oldReq }));
    // setAnsFilePrev((prevState)=>([...prevState,oldFile]));    
  }

  const delAnsRequirement = (index) => {
    let oldReq = ansReq.attachments;
    let oldFile = ansFilePrev;    
    console.log(oldReq[index].id);    
    if(ansActionType === "edit" && oldReq[index].id){
      //attachment delete
      axios.post('/b/o/master/exam/question/option/attachment/delete', JSON.stringify({
        id : oldReq[index].id
      })).then(({data}) => {
        if (data.st) {
          toast.success("Lampiran berhasil dihapus", {containerId:"B", transition:Zoom});
        }
        else{
          toast.error(data.msg, { containerId: 'B', transition: Zoom });  
        }
      }).catch((error) => {
        toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
      })
    }
    if(ansAttState > 0){
      setAnsAttState(ansAttState-1)
    }
    oldReq.splice(index, 1);
    oldFile.splice(index, 1);
    setAnsReq({ ...ansReq, attachments: oldReq });
    setAnsFilePrev(oldFile);
    // setAnsReq((prevState)=>({...prevState, attachments: oldReq }));
    // setAnsFilePrev((prevState)=>([...prevState,oldFile]));
  }

  const addAnsAttachment = (index, e) => {    
    setAnsAttState(ansAttState+1)
    let oldReq = ansReq.attachments;
    let oldFile = ansFilePrev;
    // oldReq.push({ seq: 0, id:"", attachment:[]});
    oldReq[index].attachment = e.target.files[0];
    oldFile[index] = window.URL.createObjectURL(e.target.files[0]);
    setAnsReq({ ...ansReq, attachments: oldReq });
    setAnsFilePrev(oldFile);
    // setAnsReq((prevState)=>({...prevState, attachments: oldReq }));
    // setAnsFilePrev((prevState)=>([...prevState,oldFile]));
  }

  const addHandler = async () => {
    console.log(ansReq);
    toast.dismiss();
    let cekAtc = true;
    for(let i = 0; i < ansReq.attachments.length; i++){
      if(ansReq.attachments[i].attachment.length <= 0){
        toast.error('Harap lengkapi lampiran', { containerId: 'B', transition: Zoom });
        cekAtc = false;
        break
      }
    }    
    if(cekAtc){      
      if(ansReq.optlabel === "" || ansReq.optanswer === ""){
        setSubmited(true);
        toast.error('Harap lengkapi data', { containerId: 'B', transition: Zoom });
      }
      else{                
        let formData = new FormData();
        formData.append('questionid', ansReq.questionid);
        formData.append('optlabel', ansReq.optlabel);
        formData.append('optanswer', ansReq.optanswer);
        ansReq.attachments.forEach((atc) => {
          formData.append('attachment',atc.attachment);
        })
        let url = '/b/o/master/exam/question/option/create';
        let successMsg = 'Jawaban soal ujian berhasil ditambahkan';        
        if (ansActionType === 'edit') {
          url = '/b/o/master/exam/question/option/update';
          successMsg = 'Jawaban soal ujian berhasil diubah';
          let cekLabel = false;
          if(oldAnsReq.optlabel !== ansReq.optlabel){
            cekLabel = cekAns();
          }
          if(cekLabel){
            setSubmited(true)
            toast.error('Label jawaban sudah digunakan', { containerId:"B",transition:Zoom });
          }
          else{
            axios.post(url, JSON.stringify({
              id: ansReq.questionid,
              optlabel: ansReq.optlabel,
              optanswer: ansReq.optanswer
            })).then(({ data }) => {
              if (data.sc === 200) {
                if (data.st) {
                  toast.success(successMsg, { containerId: 'B', transition: Zoom });
                  if(ansAttState > 0){
                    let attformData = new FormData();          
                    attformData.append('questionoptid', ansReq.questionid);          
                    for(let i = 0; i < ansReq.attachments.length; i++){            
                      attformData.append('attachment', ansReq.attachments[i].attachment);            
                    }
                    ansReq.attachments.forEach((atc) => {
                      attformData.append('attachment', atc.attachment);
                    })
                    axios.post('/b/o/master/exam/question/option/attachment/add', attformData).then(({data}) => {
                      if (data.st) {
                        console.log(data);
                        history.push('/master/ujian/soal/edit',{ admin: "Administrator", req: req });
                      }
                      else{
                        toast.error(data.msg, { containerId: 'B', transition: Zoom });  
                      }
                    }).catch((error) => {
                      toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
                    })
                  }
                  else{
                    history.push('/master/ujian/soal/edit',{ admin: "Administrator", req: req });
                  }
                } else {                
                  toast.error(data.msg, { containerId: 'B', transition: Zoom });
                }
                setSubmited(false);
              }
            }).catch((error) => {        
              toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
              setSubmited(false);
            })          
          }
        }
        if(ansActionType === "add"){
          console.log(formData)
          let cekLabel = cekAns();
          console.log(cekLabel)
          if(cekLabel){
            setSubmited(true);
            toast.error('Label jawaban sudah digunakan', { containerId:"B",transition:Zoom });
          }
          else{
            axios.post(url, formData).then(({ data }) => {
              if (data.sc === 200) {
                if (data.st) {
                  toast.success(successMsg, { containerId: 'B', transition: Zoom });
                  history.push('/master/ujian/soal/edit',{ admin: "Administrator", req: req});
                } else {
                  console.log("error");
                  toast.error(data.msg, { containerId: 'B', transition: Zoom });
                }
                // changeSubmitDisableState(false);
                setSubmited(false);
              }
              // console.log(res);
            }).catch((error) => {        
              toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });        
              setSubmited(false);
              // changeSubmitDisableState(false);
            })
          }
        }        
      }
    }
  }

  const cekAns = () => {
    let cekLabel = false;
    ans.forEach((an, key) => {
      if(an.optlabel === ansReq.optlabel){        
        cekLabel = true;
        key = an.length;            
      }
    })
    if(cekLabel){ return true}
    else { return false }
  }

  // const cancelEdit = () =>{
  //   resetAnsReq();
  //   resetAnsFilePrev();
  //   history.push('/master/ujian/soal/edit',{admin: "Administrator",req: req});
  // }

  return(
    <Row>
      <Col sm="12" md={{ size: 6, offset: 3 }}>
      <Card body>
        <Breadcrumb>
          <BreadcrumbItem><a href="/#" onClick={(e) => { e.preventDefault(); history.push("/master/ujian/soal") }}>Soal Ujian</a></BreadcrumbItem>
          <BreadcrumbItem><a href="/#" onClick={(e) => { e.preventDefault(); history.push("/master/ujian/soal/edit",{admin: "Administrator",  req: req}) }}>Edit Soal Ujian</a></BreadcrumbItem>
          <BreadcrumbItem active>{ansActionType === "add" ? "Tambah" : "Edit"}</BreadcrumbItem>
        </Breadcrumb>
        <FormGroup>
          <Label for="label">Label</Label>
          <Input type="select" id="label" value={ansReq.optlabel} required onChange={(e) => changeAnsReq("optlabel", e.target.value)} invalid={ansReq.optlabel === '' && submited}>
            <option value="A"> A </option>
            <option value="B"> B </option>
            <option value="C"> C </option>
            <option value="D"> D </option>
            <option value="E"> E </option>
          </Input>
          <FormFeedback>Label tidak boleh kosong</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for="jawaban">Jawaban</Label>
          <Input id="jawaban" value={ansReq.optanswer} required onChange={(e) => changeAnsReq("optanswer", e.target.value)} invalid={ansReq.optanswer === '' && submited} />
          <FormFeedback>Jawaban tidak boleh kosong</FormFeedback>
        </FormGroup>                  
        {(ansReq.attachments.map((requirement, index) => {
          console.log(ansFilePrev[index])
            return <div key={index}>
            <hr/>
            Lampiran {index + 1}
            <FormGroup>
            <Label for={"fileAnswer"+index}>File: </Label>
            <Input type="file" accept="image/*" name="fileAnswer" id={"fileAnswer"+index} onChange={(e)=>addAnsAttachment(index,e)}/>
            </FormGroup>            
              <img src={ansFilePrev[index]} className="img-fluid mb-2" alt = {"Answer Image " + index}/>              
            <Button color="danger" block onClick={() => delAnsRequirement(index)}>
              Hapus Lampiran {index + 1}
            </Button>
          </div>
        }))}
      <hr />
      <Button color="primary" block onClick={addAnsRequirement}>
        Tambah Lampiran
      </Button>      
      <Button color="primary mt-2" onClick={addHandler}>Submit</Button>      
      </Card>
      </Col>
    </Row>
      
  )
}
