import React,{ useEffect, useState} from 'react'
import { useHistory } from 'react-router';
import {
  Card,FormGroup, Label, Input,
  FormFeedback, Col, Row, Button,
  Breadcrumb, BreadcrumbItem, FormText,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import { toast, Zoom } from 'react-toastify';
import Errormsg  from 'config/errormsg';
import axios from 'config/axios';
// import urlConfig from 'config/backend';

export default function EditJurusan(props) {
  const history = useHistory();
  const [submited, setSubmited] = useState(false);
  // const [selectedReq, setSelectedReq] = useState({});
  let [page, setPage] = useState(1);
  const sizePerPage = 100;
  const [param, setParam] = useState({
    page: page,
    count: sizePerPage,
    setupid: "",
  });
  const [req, setReq] = useState({ 
    id: "",
    periodregisterid: "",        
    description: "",
    datestart: "",
    dateend: "",
    yearperiod: "",
    wavenum: 0,
    examstatus: "Active",
    duration: 0
  });
  const [major, setMajor] = useState([]);
  const [reqMajor, setReqMajor] = useState({id:"",  setupid:"", major:"", countquestion:0, setupquestion:[]});  
  const [majorActionType, setMajorActionType] = useState("add");
  // const [countQ, setCountQ] = useState(0);
  const [category, setCategory] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectedCatIdx, setSelectedCatIdx] = useState([]);
  const changeReqMajor = (field, value) => { setReqMajor({ ...reqMajor,[field]: value}); };
  const resetReqMajor = () => { setReqMajor({id:"",  setupid: "", major:"", countquestion:"", setupquestion:[] })};  
  // const resetCountQ = () => { setCountQ(0) };
  const [oldReqMajor, setOldReqMajor] = useState({});
  const [openModal, setOpenModal] = useState(false);
  useEffect(() => {
    getCategory();    
    resetReqMajor();
    setMajorActionType("add");
    let propsReq = props.location.state.req;
    let propsMajor = props.location.state.major;
    let propsReqParam = props.location.state.param;
    if (props.location.state && props.location.state.reqMajor) {      
      let propsReqMajor = props.location.state.reqMajor;
      console.log(propsReqMajor);
      if(propsReqMajor.countquestion > 0){
        setReqMajor({
          ...reqMajor,
          id: propsReqMajor.id,
          setupid: propsReqMajor.setupid,
          major: propsReqMajor.major,
          countquestion: propsReqMajor.countquestion,
          setupquestion: propsReqMajor.setupquestion
        });
        setOldReqMajor(propsReqMajor);
        setMajorActionType("edit");
      }
      else{        
        setReqMajor({...reqMajor, setupid: propsReqMajor.setupid});
      }
    }
    setReq({
      ...req,
      id: propsReq.id,
      periodregisterid: propsReq.periodregisterid,
      description: propsReq.description,
      datestart: propsReq.datestart,
      dateend: propsReq.dateend,
      yearperiod: propsReq.yearperiod,
      wavenum: parseInt(propsReq.wavenum),
      examstatus: propsReq.examstatus,
      duration: parseInt(propsReq.duration)
    });
    setMajor(propsMajor)
    setParam(propsReqParam);
  },[])
  
  useEffect(() => {
    console.log(reqMajor);
    let jmlSoal = [];
    console.log(category)
    if(category.length > 0){
      reqMajor.setupquestion.forEach((setupq, key) => {
        if(setupq.categoryquestionid){
          console.log(setupq)
          let getIdx = category.findIndex((cat) => cat.id === setupq.categoryquestionid)
          // console.log(getIdx)          
          jmlSoal.push(category[getIdx].total);
          if(key === reqMajor.setupquestion.length-1){            
            setSelectedCatIdx(jmlSoal);
          }
        }
      })
    }
    // console.log(countQ)
  },[reqMajor,category])

  useEffect(() => {
    console.log(selectedCatIdx)
  },[selectedCatIdx])

  const addMajorQuestion = () => {
    let oldReq = reqMajor.setupquestion;    
    oldReq.push({id:"", setupmajorid:reqMajor.id, categoryquestionid:"", countquestion:0});    
    setReqMajor({ ...reqMajor, setupquestion: oldReq });
    // setCountQ(countQ + 1);
  }

  const deleteMajorQuestion = (index) => {
    let oldReq = reqMajor.setupquestion;
    if(majorActionType === "edit" && oldReq[index].id){
      axios.post("/b/o/master/exam/setup/question/delete",JSON.stringify({
        id:oldReq[index].id
      })).then(({data})=>{
        if (data.st) {                    
          toast.success("Soal berhasil dihapus", {containerId:"B", transition:Zoom});
        }
        else{
          toast.error(data.msg, { containerId: 'B', transition: Zoom });  
        }
      }).catch((error) => {
        toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
      })
    }
    // if(countQ > 0){
    //   setCountQ(countQ - 1);
    // }
    if(selectedIdx > 0 ){
      setSelectedIdx(selectedIdx - 1)
    }
    setOpenModal(false);
    oldReq.splice(index, 1);
    setReqMajor({ ...reqMajor, setupquestion: oldReq });
  }  

  const changeMajorQuestion = (field,index,value) =>{
    let oldQuestion = reqMajor.setupquestion;      
    // reqMajor.setupquestion.forEach((rm, key)=>{          
    //   let cekKategori = reqMajor.setupquestion.find((rs) => rs.categoryquestionid === rm.categoryquestionid);
    //   if(cekKategori){
    //     console.log(cekKategori)
    //     toast.error("Kategori soal sudah terdaftar pada ujian ini", { containerId:"B", transition:Zoom })
    //     key = rm.length
    //   }
    // })
    if(oldQuestion[index].id === ""){
      oldQuestion[index][field] = value;
      oldQuestion[index].setupmajorid = reqMajor.id;
      console.log(oldQuestion)
      // setCountQ(countQ + 1);
      setReqMajor({ ...reqMajor, setupquestion:oldQuestion });    
    }
  }

  const addHandler = async () => {
    toast.dismiss();
    let cekQuest = true;
    for(let i = 0; i < reqMajor.setupquestion.length; i++){
      if(reqMajor.setupquestion[i].categoryquestionid === "" ||  reqMajor.setupquestion[i].countquestion === 0){
        toast.error('Harap lengkapi pengaturan soal', { containerId: 'B', transition: Zoom });
        setSubmited(true)
        cekQuest = false;
        break
      }
    }
    if(cekQuest){
      if(reqMajor.countquestion === 0 || reqMajor.countquestion === '' || reqMajor.major === ''){
        setSubmited(true)
        toast.error('Harap lengkapi data', { containerId: 'B', transition: Zoom });
      }
      else{
        let url = '/b/o/master/exam/setup/major/create';
        let successMsg = 'Jurusan ujian berhasil ditambahkan';
        
        if (majorActionType === 'edit') {
          url = '/b/o/master/exam/setup/major/update';          
          successMsg = 'Jurusan ujian berhasil diubah';
          let sameMajor = false;
          let sameCategory = cekCategory();
          if(oldReqMajor.major !== reqMajor.major){
            sameMajor = cekMajor();
          }
          if(sameMajor) {
            setSubmited(true)
            toast.error("Jurusan ini sudah terdaftar pada periode ujian ini", { containerId:"B", transition:Zoom });
          }
          else{
            if(sameCategory) {
              setSubmited(true)
              toast.error("Tidak bisa mendaftarkan dua atau lebih kategori yang sama dalam satu ujian", { containerId:"B", transition:Zoom });
            }
            else {
              axios.post(url, JSON.stringify(reqMajor)).then(({ data }) => {            
                if (data.sc === 200) {
                  if (data.st) {
                    console.log(reqMajor.setupquestion[reqMajor.setupquestion.length-1])
                    let countQ = 0;
                    let countNewQ = 0;
                    // {id:"", setupmajorid:reqMajor.id, categoryquestionid:"", countquestion:0}
                    reqMajor.setupquestion.forEach((sq)=>{
                      countQ += sq.countquestion;
                      if(sq.id === ""){
                        countNewQ += sq.countquestion;
                      }
                    })
                    if(countQ > reqMajor.countquestion){
                      setSubmited(true)
                      toast.error("Jumlah soal melebihi slot soal yang tersedia", { containerId:"B", transition:Zoom });              
                    }
                    else if(countNewQ > 0){
                      axios.post("/b/o/master/exam/setup/question/add",reqMajor.setupquestion[reqMajor.setupquestion.length-1]).then(({data})=>{
                        if(data.st){
                          console.log(data);
                          toast.success(successMsg, { containerId: 'B', transition: Zoom });
                          history.push('/master/ujian/setting/edit',{ req: req, param: param });
                        }
                        else{                
                          toast.error(data.msg, {containerId:"B", transition:Zoom});                
                        }
                      }).catch((error) => {
                        toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
                      })
                    }
                    else{
                      toast.success(successMsg, { containerId: 'B', transition: Zoom });
                      history.push('/master/ujian/setting/edit',{ req: req, param: param });                                     
                    }
                  } else {
                    console.log("error");
                    toast.error(data.msg, { containerId: 'B', transition: Zoom });
                  }
                }
              }).catch((error) => {        
                toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
              })
            }
          }
        }
        if(majorActionType === "add"){
          // console.log(formData)
          console.log(reqMajor);
          let sameMajor = cekMajor();
          let sameCategory = cekCategory();
          if(sameMajor) {
            // setSubmited(true)
            toast.error("Jurusan ini sudah terdaftar pada periode ujian ini", { containerId:"B", transition:Zoom });
          }
          else{
            if(sameCategory) {
              // setSubmited(true)
              toast.error("Tidak bisa mendaftarkan dua atau lebih kategori yang sama dalam satu ujian", { containerId:"B", transition:Zoom });
            }
            else {
              console.log("MASUK")
              axios.post(url, JSON.stringify(reqMajor)).then(({ data }) => {
                if (data.sc === 200) {
                  if (data.st) {
                    toast.success(successMsg, { containerId: 'B', transition: Zoom });
                    setReqMajor({...reqMajor, id: data.data.id, setupid: data.data.setupid})
                    setOldReqMajor(reqMajor)
                    setMajorActionType("edit");
                    // history.push('/master/ujian/setting/edit',{ admin: "Administrator", req: req });
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
  }

  const cekMajor = () => {
    let sameMajor = false;
    major.forEach((mj,key) => {
      if(mj.major === reqMajor.major){        
        sameMajor = true;
        key = mj.length
      }
    })
    if(sameMajor){ return true; }
    else { return false; }    
  }

  const cekCategory = () => {
    let sameCategory = false;
    reqMajor.setupquestion.forEach((osq, key) => {
      reqMajor.setupquestion.forEach((rsq, key1) => {
        if(osq.categoryquestionid === rsq.categoryquestionid && key !== key1){
          sameCategory = true;
          key1 = reqMajor.setupquestion.length;
          key = oldReqMajor.setupquestion.length;        
        }
      })
    })
    if(sameCategory) { return true }
    else { return false }
  }

  const modalMajorQuestion = (index) => {
    setSelectedIdx(index);
    setOpenModal(!openModal);
  }

  // const cancelEdit = () =>{
  //   resetReqMajor();    
  //   history.push('/master/ujian/setting/edit',{admin: "Administrator",req: req});
  // }

  const getCategory = () =>{  
    axios.post("/b/o/master/exam/categories",JSON.stringify({
     page:1, count:100
    }))
    .then(({data}) => {
      console.log(data)
      if(data.st){
        setCategory(data.data.list); 
        // console.log(category);       
      }
      else{
        toast.error(data.msg, {containerId:"B", transition:Zoom});
      }
    })
    .catch((error)=>{
      toast.error(Errormsg[500], {containerId:"B", transition:Zoom});
    })
  }

  return(
    <Row>
      <Col sm = "12" md = {{ size: 6, offset: 3 }}>
      <Card body>
        <Breadcrumb>
          <BreadcrumbItem><a href = "/#" onClick = {(e) => { e.preventDefault(); history.push("/master/ujian/setting");}}>Ujian</a></BreadcrumbItem>
          <BreadcrumbItem><a href = "/#" onClick = {(e) => { e.preventDefault(); history.push("/master/ujian/setting/edit",{admin: "Administrator",  req: req, param: param }) }}>Edit Ujian</a></BreadcrumbItem>
          <BreadcrumbItem active>{majorActionType === "add" ? "Tambah" : "Edit"}</BreadcrumbItem>
        </Breadcrumb>
        <FormGroup>          
          <Label for = "jurusan">Jurusan</Label>
          <Input type = "select" id = "jurusan" value = {reqMajor.major} required onChange= {(e) => changeReqMajor("major", e.target.value)} invalid={reqMajor.major === '' && submited}>
            <option value ="">Harap pilih jurusan</option>
            <option value ="IPA">IPA</option>
            <option value ="IPS">IPS</option>
            <option value ="SMK">SMK</option>
            <option value ="Bahasa">Bahasa</option>
          </Input>
          <FormFeedback>Jurusan tidak boleh kosong</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for = "jumlah">Jumlah Soal</Label>
          <Input id = "jumlah" className = "text-right" type = "number" step = "1" min = "1" value = { reqMajor.countquestion } required onChange= {(e) => changeReqMajor("countquestion", parseInt(e.target.value))} invalid={reqMajor.countquestion === 0 && submited}/>
          <FormFeedback>Jumlah soal tidak boleh kosong</FormFeedback>
        </FormGroup>        
        {majorActionType === "edit" ?        
        (reqMajor.setupquestion.map((requirement, index) => {
          return <div key = {index} className="mb-3">            
          {index === 0 ?
          <FormText className = "mb-2 text-justify" color = "primary">*Kategori yang sudah disubmit, tidak dapat diedit langsung, anda dapat menghapus dan menambahkan kembali untuk mengedit kategori tersebut. </FormText> 
          : null }
            <hr/>
            Kategori Soal {index + 1}
            <FormGroup>
            <Label for = {"soal" + index}>Soal: </Label>            
            <Input type = "select" value = {requirement.categoryquestionid} id = {"soal" + index} onChange = {(e) => changeMajorQuestion("categoryquestionid", index, e.target.value)}
              disabled = { requirement.id ? true : false }
            >
              <option value = "">Harap pilih kategori soal</option>
              {(category.map((cat,key) => {
                console.log(category[key].name);
                return(
                  <option key = {key} value = {cat.id}>{cat.name}</option>
                )
              }))}
            </Input>
            {requirement.categoryquestionid ?
            <FormText color="info">Jumlah Bank Soal Kategori Ini: <strong>{selectedCatIdx[index]}</strong></FormText>
            : null}
            </FormGroup>
            <FormGroup>
            <Label for = {"jmlSoal"}>Jumlah Soal: </Label>
            <Input type = "number" className = "text-right" min = "1" step = "1" value = {requirement.countquestion} id = {"jmlSoal" + index} onChange = {(e) => changeMajorQuestion("countquestion", index, parseInt(e.target.value))}
              disabled = { requirement.id ? true : false } invalid={(requirement.countquestion === 0 && submited) || (requirement.countquestion > selectedCatIdx[index] && submited)}
            />
            {requirement.countquestion === 0 ?
              <FormFeedback>Jumlah soal tidak boleh kosong</FormFeedback>
            : <FormFeedback>Jumlah soal melebihi bank soal</FormFeedback>
            }
            </FormGroup>
            <Button color = "danger" block onClick = {() => modalMajorQuestion(index)}>
              Hapus Kategori Soal {index + 1}
            </Button>
            <Modal zIndex = {2000} centered isOpen = {openModal} toggle = {() => modalMajorQuestion(selectedIdx)}>
              <ModalHeader toggle = {() => modalMajorQuestion(selectedIdx)}>Apakah anda yakin untuk menghapus?</ModalHeader>
              {reqMajor.setupquestion[selectedIdx].categoryquestionid ?
              <ModalBody>                
                <Row>
                  <Col xs = {6}>Kategori Soal</Col>
                  <Col xs = {6}>
                    {category.length > 0 && selectedIdx < reqMajor.setupquestion.length ?
                      category.map((cat,key)=>{
                        if(cat.id === reqMajor.setupquestion[selectedIdx].categoryquestionid){
                          key = cat.length
                          return(
                            ": " + cat.name
                          )
                        }
                      })
                    : null}
                  </Col>
                </Row>
                <Row>
                  <Col xs = {6}>Jumlah Soal</Col>
                  <Col xs = {6}>{selectedIdx < reqMajor.setupquestion.length ? ": " + reqMajor.setupquestion[selectedIdx].countquestion : null}</Col>
                </Row>                
              </ModalBody>
              :null}
              <ModalFooter>
                <Button color = "danger" onClick = {() => deleteMajorQuestion(selectedIdx)}>Delete</Button>
                <Button color = "secondary" onClick = {() => modalMajorQuestion(selectedIdx)}>Tutup</Button>
              </ModalFooter>
            </Modal>
          </div>
        })) : null}
        {majorActionType === "edit"?
        <Button color = "primary" block onClick = {addMajorQuestion}>
          Tambah Soal
        </Button>
        : null}
      <hr/>
      <Button color = "primary" onClick = {addHandler}>Submit</Button>      
      </Card>
      </Col>
    </Row>      
  )
}
