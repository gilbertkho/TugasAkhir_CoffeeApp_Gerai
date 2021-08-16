import React from 'react';

import { Row, Col, CardBody, Card, CardHeader } from 'reactstrap';

import Chart from 'react-apexcharts';

export default function LivePreviewExample(props) {
  const reg = () => {
    let data = props.regdata;
    let dataVal = [];
    let dataOpt = [];
    /* data.map((d,key)=>{      
      dataOpt.push(d.day);
      dataVal.push(d.total);
    }); 
    //change to for each */

    data.forEach((element) => {
      dataOpt.push(element.day);
      dataVal.push(element.total);
    });
    let res = {
      day: dataOpt,
      total: dataVal
    };
    return res;
  };

  const chartDashboardStatistics2BOptions = {
    chart: {
      toolbar: {
        show: false
      },
      sparkline: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    colors: ['#3c44b1', 'rgba(60, 68, 177, 0.27)'],
    fill: {
      opacity: 0.85,
      colors: ['#3c44b1', 'rgba(60, 68, 177, 0.27)']
    },
    grid: {
      strokeDashArray: '5',
      borderColor: 'rgba(125, 138, 156, 0.3)'
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    legend: {
      show: false
    },
    labels: reg().day
  };
  const chartDashboardStatistics2BData = [{ data: reg().total }];
  // console.log(chartDashboardStatistics2BOptions);
  // console.log(chartDashboardStatistics2BData);
  return (
    <>
      <Row>
        <Col xl="6">
          <Card className="card-box mb-5">
            <CardHeader>
              <div className="card-header--title">
                <h4 className="font-size-lg mb-0 py-2 font-weight-bold">
                  Laporan Gerai
                </h4>
              </div>
              <div className="card-header--actions">
                {/* <Button size="sm" color="neutral-first">
                  <span className="btn-wrapper--label">Actions</span>
                  <span className="btn-wrapper--icon">
                    <FontAwesomeIcon
                      icon={['fas', 'chevron-down']}
                      className="opacity-8 font-size-xs"
                    />
                  </span>
                </Button> */}
              </div>
            </CardHeader>
            <CardBody>
              <Chart
                options={chartDashboardStatistics2BOptions}
                series={chartDashboardStatistics2BData}
                type="bar"
                height={280}
              />
              {/* <Row>
                <Col md="6">
                  <div className="p-3">
                    <div className="mb-1 font-weight-bold">Orders</div>
                    <Progress
                      animated
                      className="progress-xs progress-animated-alt"
                      color="primary"
                      value="34"
                    />
                    <div className="align-box-row progress-bar--label mt-1 text-muted">
                      <small className="text-dark">0</small>
                      <div className="ml-auto">100%</div>
                    </div>
                  </div>
                </Col>
                <Col md="6">
                  <div className="p-3">
                    <div className="mb-1 font-weight-bold">Sales</div>
                    <Progress
                      animated
                      className="progress-xs progress-animated-alt"
                      color="success"
                      value="51"
                    />
                    <div className="align-box-row progress-bar--label mt-1 text-muted">
                      <small className="text-dark">0</small>
                      <div className="ml-auto">100%</div>
                    </div>
                  </div>
                </Col>
                <Col md="6">
                  <div className="p-3">
                    <div className="mb-1 font-weight-bold">Users</div>
                    <Progress
                      animated
                      className="progress-xs progress-animated-alt"
                      color="warning"
                      value="29"
                    />
                    <div className="align-box-row progress-bar--label mt-1 text-muted">
                      <small className="text-dark">0</small>
                      <div className="ml-auto">100%</div>
                    </div>
                  </div>
                </Col>
                <Col md="6">
                  <div className="p-3">
                    <div className="mb-1 font-weight-bold">Customers</div>
                    <Progress
                      animated
                      className="progress-xs progress-animated-alt"
                      color="danger"
                      value="76"
                    />
                    <div className="align-box-row progress-bar--label mt-1 text-muted">
                      <small className="text-dark">0</small>
                      <div className="ml-auto">100%</div>
                    </div>
                  </div>
                </Col>
              </Row> */}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
}
