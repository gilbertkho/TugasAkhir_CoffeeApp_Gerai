/* eslint-disable */
import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHistory } from 'react-router-dom';
import ChartAdmin from './chartAdmin';
import axios from 'config/axios';
import { toast, Zoom } from 'react-toastify';
import { Row, Col, CardBody, Card, Button, Toast } from 'reactstrap';
import Errormsg from 'config/errormsg';
import checkStatus from 'config/checkStatus';
import localforage from 'localforage';
import auth from 'config/auth';

class dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apikey: '',
      menu: 0,
      verified: false,
      email: '',
      tipeMenu: 0,
      task: 0,
      voucher: 0,
      saldo_gerai: 0,
      rating: 0,
      NoSubs: true,
      order_id: '',
      onGoing: {},
      paid: 'NO'
    };
  }

  getData = async () => {
    let key = '';
    try {
      key = await localforage.getItem('APIKEY');
      this.setState({ apikey: key });
      let statusGerai = await checkStatus();
      // console.log('STATUS GERAI', statusGerai);
      this.setState({email: statusGerai.data.email});
      if (statusGerai.verified) {
        this.setState({ verified: true });
        if (!statusGerai.status) {
          // console.log('GERAI BELUM AKTIF');
          if (statusGerai.onGoingTrans) {
            //jika masih ada transaksi yang belum selesai
            // console.log('GERAI BELUM AKTIF || TRANSAKSI BELUM SELESAI');
            this.setState({
              onGoing: statusGerai.onGoingTrans,
              paid: 'WAIT',
              order_id: statusGerai.onGoingTrans.id_subscription
            });
          }
          if (statusGerai.notYetAcc) {
            //jika sudah paid tapi belum di konfirmasi admin
            // console.log('GERAI BELUM AKTIF || TRANSAKSI OK BELUM DI KONFIRMASI');
            this.setState({
              NoSubs: true,
              paid: 'YES'
            });
          }
        } else {
          //jika gerai sudah aktif
          // console.log('GERAI SUDAH AKTIF');
          this.setState({ NoSubs: false });
        }
      }
    } catch (error) {
      toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
    }
    await axios.post('/app/gerai/dashboard', { 
      apikey: key 
    }).then(({ data }) => {
        if (data.status) {
          this.setState({
            menu: data.data.total_menu,
            tipeMenu: data.data.total_tipemenu,
            rating: data.data.rating,
            task: data.data.total_task,
            voucher: data.data.total_voucher,
            saldo_gerai: data.data.saldo_gerai
          });
          // this.setState({tipeMenu : data.data.total_tipemenu});
          // this.setState({task : data.data.total_task});
          // this.setState({voucher : data.data.total_voucher});
          // this.setState({saldo_gerai : data.data.saldo_gerai});
        } else {
          toast.error(data.msg, { containerId:'B', transition: Zoom });
        }
      })
      .catch((error) => {
        if(error.response.status != 500){
          toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
        }
        else{
          toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});
        }
    });
  };

  componentDidMount() {
    this.getData();
  }

  getSubs = async () => {
    let statusGerai = await checkStatus();
    if (!statusGerai.status) {
      console.log(JSON.stringify(this.state.onGoing));
      if (JSON.stringify(this.state.onGoing) !== '{}') {
        console.log('ONGOING STATE');
        //reset if expire
        let d = new Date();
        if(parseInt(this.state.onGoing.payment_timeout) <= d){
          this.setState({
            paid: 'NO',
            order_id: '',
            onGoing: {},
            NoSubs: true
          })
          toast.error('Waktu pembayaran telah habis', {containerId:"B", transition:Zoom});
        }
        else{
          window.open(this.state.onGoing.link)
        }
      }
      else if(statusGerai.onGoingTrans){
        console.log("ONGOING STATUS")
        //reset if expire
        let d =  new Date();
        if(parseInt(this.state.onGoing.payment_timeout) <= d){
          console.log("RESET")
          this.setState({
            paid: 'NO',
            order_id: '',
            onGoing: {},
            NoSubs: true
          })
        }
        else{
          console.log("MASUK ONGOING")
          this.setState({paid:'WAIT', onGoing: statusGerai.onGoingTrans})
          window.open(statusGerai.onGoingTrans.link)
        }
      }      
      else{
        axios.post('/payment/gerai',{
          apikey: this.state.apikey
        }).then(({data}) => {
          if(data.status){
            console.log("INI DATA PAYMENT: ",data.data)
            if(data.data){
              console.log("TRANSAKSI DICETAK")
              this.setState({order_id: data.data.id_subscription, paid: 'WAIT'});          
              window.open(data.data.link)
            }
          }
          else{
            toast.error(data.msg , {containerId:"B", transition:Zoom})
          }      
        }).catch(error => {
          console.log(error);
          if(error.response.status != 500){
            this.setState({paid: 'NO', order_id: '',onGoing: {}})
            toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
          }
          else{
            toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});        
          }
        })
      }
    }
  }

  getPaymentStatus = async() => {
    let statusGerai = await checkStatus();
    if(!statusGerai.status){
      if(JSON.stringify(this.state.onGoing) !== '{}'){
        //reset if expire
        let d = new Date();
        if(parseInt(this.state.onGoing.payment_timeout) <= d){
          this.setState({
            paid: 'NO',
            order_id: '',
            onGoing: {},
            NoSubs: true
          })
          toast.error('Waktu pembayaran telah habis', {containerId:"B", transition:Zoom});
        }
      }
      if(this.state.order_id){
        console.log(this.state.order_id)      
        axios.post('/payment/gerai/notification',{
          order_id: this.state.order_id,
          apikey: this.state.apikey
        }).then(({data}) => {
          console.log("CEK TRANSAKSI:", data)
          if(data.status){
            if(data.msg === 'Transaksi berhasil.'){
              this.setState({paid: 'YES'})
            }
            else if(data.msg === 'Transaksi gagal.'){
              this.setState({paid: 'NO'})            
            }          
            toast.info(data.msg, {containerId:"B", transition:Zoom});
          }
          else{
            toast.error(data.msg, {containerId:'B', transition: Zoom});
          }
          }).catch(error => {
            console.log(error)      
            if(error.response.status != 500){
              // if(error.response.data.msg === 'Waktu pembayaran telah habis'){
                this.setState({paid: 'NO', order_id: '',onGoing: {}})
              // }
              toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
            }
            else{
              toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});        
            }
          })
      }
    }    
  }

  addCommas = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  requestWithdraw = () => {
    this.props.history.push('./withdraw');
  };

  toRatingReview = () => {
    this.props.history.push('./rating');
  };

  sendVerification = () => {
    toast.info('Sedang mengirim email verifikasi', {containerId:'B', transition:Zoom, autoClose:5000});
    axios.post('/app/gerai/verify/request',{
      email: this.state.email
    }).then(({data}) => {
      if(data.status){
        toast.success(data.msg, {containerId:'B', transition:Zoom});
      }
      else{
        toast.error(data.msg, {containerId:'B', transition:Zoom});
      }
    }).catch((error) => {
      if(error.response.status != 500){
        toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
      }
      else{
        toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});
      }
    })
  }

  checkVerification = async() => {
    let statusGerai = await checkStatus();
    if (statusGerai.verified) {
      this.setState({ verified: true });
      toast.success('Gerai terverifikasi', {containerId:'B', transition:Zoom});
    }
    else{
      toast.warning('Gerai belum terverifikasi', {containerId:'B', transition:Zoom});
    }
  }

  render() {
    return (
      <>
        <div className="app-wrapper bg-white min-vh-100">
          <div className="app-main min-vh-100">
            <div className="app-content p-0">
              <div className="flex-grow-1 w-100 p-5">
                {/* <h1>{this.state.wave}</h1> */}
                {/* <h4 className="text-info">{"Total Pendaftaran: " + this.state.totalreg}</h4> */}
                <Row className={this.state.verified ? "d-none" : "d-block"}>
                  <Col>
                    <Card className= "card-box mb-5 bg-warning border-0 text-light" >
                      <CardBody>
                        <div className="align-box-row align-items-start">
                          <div className="font-weight-bold">
                            <small className="text-white-50 d-block mb-1 text-uppercase">
                              Status Verifikasi
                            </small>
                            <span className="font-size-md mt-1 text-justify">
                              Akun gerai masih dalam tahap verifikasi, harap periksa email anda dan lakukan verifikasi akun untuk dapat menggunakan akun sepenuhnya.
                              {/* Jika email masih belum terkirim silahkan tekan tombol kirim ulang verifikasi. Untuk memeriksa ulang status verifikasi silahkan tekan tombol cek status verifikasi. */}
                            </span><br/>
                            <Button className ='mt-2 mr-2' color='primary' onClick = {this.sendVerification}>Kirim Ulang Email Verifikasi</Button>
                            <Button className ='mt-2' color='primary' onClick = {this.checkVerification}>Cek Status Verifikasi</Button>
                          </div>
                          <div className="ml-auto">
                            <div className="bg-white text-center text-info font-size-xl d-50 rounded-circle btn-icon">
                              <FontAwesomeIcon icon={['fa', 'user-check']} />
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <Row className={this.state.verified && this.state.NoSubs? "d-block" : "d-none"}>
                  <Col>
                    <Card className={this.state.paid === 'YES' ? "card-box mb-5 bg-success border-0 text-light"
                    : this.state.paid === 'NO'? "card-box mb-5 bg-warning border-0 text-light"
                    : "card-box mb-5 bg-info border-0 text-light"}>
                      <CardBody>
                        <div className="align-box-row align-items-start">
                          <div className="font-weight-bold">
                            <small className="text-white-50 d-block mb-1 text-uppercase">
                              Status Gerai
                            </small>
                            <span className="font-size-md mt-1 text-justify">
                              {this.state.paid === 'YES' ?
                                "Transaksi sudah dikonfirmasi, harap menunggu proses pengaktifan akun gerai maksimal 1 x 24 jam."
                              : this.state.paid === 'NO' ?
                                "Penggunaan fitur aplikasi gerai masih terbatas. Untuk membuka semua fitur silahkan lakukan pembelian akses dengan cara berlangganan setiap bulannya seharga Rp.100,000."
                              : "Anda sedang dalam proses transaksi, harap menyelesaikan transaksi anda dalam 15 menit." 
                              }
                            </span>
                          </div>
                          <div className="ml-auto">
                            <div className="bg-white text-center text-info font-size-xl d-50 rounded-circle btn-icon">
                              <FontAwesomeIcon icon={['fa', 'calendar']} />
                            </div>
                          </div>
                        </div>
                        {this.state.paid !== 'YES'?
                          <Button className = "mt-2" color="success" onClick= {this.getSubs} >
                            {this.state.order_id ? "Ke Link Pembayaran" : "Berlangganan Sekarang" }
                          </Button>
                          :null
                        }
                        {this.state.paid !== 'YES' && this.state.order_id ?                            
                            <Button className = "mt-2 ml-3" color="first" onClick= {this.getPaymentStatus} >
                              Cek Status Pembayaran
                            </Button>
                        :null
                        }
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Col lg="12" xl="6">
                    <Card className="card-box mb-5 bg-midnight-bloom border-0 text-light">
                      <CardBody>
                        <div className="align-box-row align-items-start">
                          <div className="font-weight-bold">
                            <small className="text-white-50 d-block mb-1 text-uppercase">
                              Saldo Gerai
                            </small>
                            <span className="font-size-xxl mt-1">
                              Rp.{this.addCommas(this.state.saldo_gerai)}
                            </span>
                          </div>
                          <div className="ml-auto">
                            <Button className="bg-success text-center text-white font-size-xl d-50 rounded-circle btn-icon"
                              onClick = {this.requestWithdraw}>
                              <FontAwesomeIcon icon={['fa', 'wallet']} />
                            </Button>
                          </div>
                        </div>
                        {/* <div className="mt-3">
                          <FontAwesomeIcon icon={['fas', 'arrow-up']} className="text-success" />
                          <span className="text-success px-1">15.4%</span>
                          <span className="text-white-50">increase this month</span>
                        </div> */}
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Col lg="12" xl="6">
                    <Card className="card-box mb-5 bg-midnight-bloom border-0 text-light">
                      <CardBody>
                        <div className="align-box-row align-items-start">
                          <div className="font-weight-bold">
                            <small className="text-white-50 d-block mb-1 text-uppercase">
                              Rating Gerai
                            </small>
                            <span className="font-size-xxl mt-1">
                              {(Math.round(this.state.rating * 100) / 100).toFixed(1) + ' / 5'}
                            </span>
                          </div>
                          <div className="ml-auto">
                            <Button className = 'bg-success text-center text-white font-size-xl d-50 rounded-circle btn-icon'
                              onClick = {this.toRatingReview}>
                              <FontAwesomeIcon icon={['fa', 'star']} color='yellow' />
                            </Button>
                          </div>
                        </div>
                        {/* <div className="mt-3">
                          <FontAwesomeIcon icon={['fas', 'arrow-up']} className="text-success" />
                          <span className="text-success px-1">15.4%</span>
                          <span className="text-white-50">increase this month</span>
                        </div> */}
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Col lg="6" xl="6">
                    <Card className="card-box mb-5 bg-midnight-bloom border-0 text-light">
                      <CardBody>
                        <div className="align-box-row align-items-start">
                          <div className="font-weight-bold">
                            <small className="text-white-50 d-block mb-1 text-uppercase">
                              Total Tipe Menu
                            </small>
                            <span className="font-size-xxl mt-1">
                              {this.state.tipeMenu}
                            </span>
                          </div>
                          <div className="ml-auto">
                            <div className="bg-white text-center text-info font-size-xl d-50 rounded-circle btn-icon">
                              <FontAwesomeIcon icon={['fa', 'list']} />
                            </div>
                          </div>
                        </div>
                        {/* <div className="mt-3">
                          <FontAwesomeIcon icon={['fas', 'arrow-up']} className="text-success" />
                          <span className="text-success px-1">15.4%</span>
                          <span className="text-white-50">increase this month</span>
                        </div> */}
                      </CardBody>
                    </Card>
                  </Col>
                  <Col lg="6" xl="6">
                    <Card className="card-box mb-5 bg-midnight-bloom text-light">
                      <CardBody>
                        <div className="align-box-row align-items-start">
                          <div className="font-weight-bold">
                            <small className="text-white-50 d-block mb-1 text-uppercase">
                              Total Voucher
                            </small>
                            <span className="font-size-xxl mt-1">
                              {this.state.voucher}
                            </span>
                          </div>
                          <div className="ml-auto">
                            <div className="bg-white text-center text-info font-size-xl d-50 rounded-circle btn-icon">
                              <FontAwesomeIcon icon={['fa', 'receipt']} />
                            </div>
                          </div>
                        </div>
                        {/* <div className="mt-3">
                          <FontAwesomeIcon icon={['fas', 'arrow-up']} className="text-success" />
                          <span className="text-success px-1">12.65%</span>
                          <span className="text-white-50">same as before</span>
                        </div> */}
                      </CardBody>
                    </Card>
                  </Col>
                  {/* <Col lg="12" xl="4">
                    <Card className="card-box mb-5 bg-midnight-bloom text-white">
                      <CardBody>
                        <div className="align-box-row align-items-start">
                          <div className="font-weight-bold">
                            <small className="text-white-50 d-block mb-1 text-uppercase">Orders</small>
                            <span className="font-size-xxl mt-1">345</span>
                          </div>
                          <div className="ml-auto">
                            <div className="bg-white text-center text-danger font-size-xl d-50 rounded-circle btn-icon">
                              <FontAwesomeIcon icon={['far', 'keyboard']} />
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <FontAwesomeIcon icon={['fas', 'arrow-up']} className="text-warning" />
                          <span className="text-warning px-1">4.2%</span>
                          <span className="text-white-50">lower order numbers</span>
                        </div>
                      </CardBody>
                    </Card>
                  </Col> */}
                </Row>
                <Row>
                  <Col lg="6" xl="6">
                    <Card className="card-box mb-5 bg-midnight-bloom border-0 text-light">
                      <CardBody>
                        <div className="align-box-row align-items-start">
                          <div className="font-weight-bold">
                            <small className="text-white-50 d-block mb-1 text-uppercase">
                              Total Menu
                            </small>
                            <span className="font-size-xxl mt-1">
                              {this.state.menu}
                            </span>
                          </div>
                          <div className="ml-auto">
                            <div className="bg-white text-center text-info font-size-xl d-50 rounded-circle btn-icon">
                              <FontAwesomeIcon icon={['fa', 'utensils']} />
                            </div>
                          </div>
                        </div>
                        {/* <div className="mt-3">
                          <FontAwesomeIcon icon={['fas', 'arrow-up']} className="text-success" />
                          <span className="text-success px-1">15.4%</span>
                          <span className="text-white-50">increase this month</span>
                        </div> */}
                      </CardBody>
                    </Card>
                  </Col>
                  <Col lg="6" xl="6">
                    <Card className="card-box mb-5 bg-midnight-bloom border-0 text-light">
                      <CardBody>
                        <div className="align-box-row align-items-start">
                          <div className="font-weight-bold">
                            <small className="text-white-50 d-block mb-1 text-uppercase">
                              Total Task
                            </small>
                            <span className="font-size-xxl mt-1">
                              {this.state.task}
                            </span>
                          </div>
                          <div className="ml-auto">
                            <div className="bg-white text-center text-info font-size-xl d-50 rounded-circle btn-icon">
                              <FontAwesomeIcon icon={['fa', 'tasks']} />
                            </div>
                          </div>
                        </div>
                        {/* <div className="mt-3">
                          <FontAwesomeIcon icon={['fas', 'arrow-up']} className="text-success" />
                          <span className="text-success px-1">15.4%</span>
                          <span className="text-white-50">increase this month</span>
                        </div> */}
                      </CardBody>
                    </Card>
                  </Col>
                </Row>                
                                
                {/* <ChartAdmin regdata={this.state.regdata} /> */}
                {/* {
                this.state.notes.map((note,key)=>{
                  return(
                  <div key={key}>
                      tes
                    {note}
                  </div>
                  )
                })
              } */}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default dashboard;
