import "../../lib/global/indexdbstorage.js";
import { CRMService } from "../../crm/crm-service.js";

import { Template } from 'meteor/templating';
import './deliverychart.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
// import Chart from 'chart.js';

let _ = require('lodash');
let barChart
let pieChart


Template.deliverychart.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.records = new ReactiveVar([]);
  templateObject.dateAsAt = new ReactiveVar();
  templateObject.deptrecords = new ReactiveVar();

  templateObject.salesperc = new ReactiveVar();
  templateObject.expenseperc = new ReactiveVar();
  templateObject.salespercTotal = new ReactiveVar();
  templateObject.expensepercTotal = new ReactiveVar();
  templateObject.topTenData = new ReactiveVar([]);
});


Template.deliverychart.onRendered(() => {
  const templateObject = Template.instance();

  function chartClickEvent(event, array) {
      if (array[0] != undefined) {
    FlowRouter.go("/leadlist");
    }
  }

  function getModdayOfCurrentWeek(date) {
    const today = new Date(date);
    const first = today.getDate() - today.getDay() + 1;

    const monday = moment(new Date(today.setDate(first))).format("DD/MM/YYYY");
    return monday;
  }

  function getSundayOfCurrentWeek(date) {
    const today = new Date(date);
    const first = today.getDate() - today.getDay() + 1;
    const last = first + 6;

    const sunday = moment(new Date(today.setDate(last))).format("DD/MM/YYYY");
    return sunday;
  }

  function drawBarChart(records) {
    let labels = [];
    let data = [];
    let colors = [];
    for (let key in records) {
      labels.push(key);
      data.push(records[key].length);
      colors.push('#01a2d3');
    }

    try {
      var ctx = document.getElementById("chart_deliverychart").getContext("2d");
      if (barChart) barChart.destroy()
      barChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Record Count ',
            data: data,
            backgroundColor: colors,
            borderWidth: 1
          }]
        },
        options: {
          'onClick': chartClickEvent,
          maintainAspectRatio: false,
          responsive: true,
          "legend": {
            "display": false
          },
          "title": {},
          "scales": {
            "xAxes": [
              {
                "gridLines": {
                  "color": "rgb(234, 236, 244)",
                  "zeroLineColor": "rgb(234, 236, 244)",
                  "drawBorder": false,
                  "drawTicks": false,
                  "borderDash": ["2"],
                  "zeroLineBorderDash": ["2"],
                  "drawOnChartArea": false
                },
                "ticks": {
                  "fontColor": "#858796",
                  "beginAtZero": true,
                  "padding": 20
                },
                "scaleLabel": {
                  "display": true,
                  "labelString": 'Created Date',
                  "fontColor": "#546372"
                }
              }],
            "yAxes": [{
              "gridLines": {
                "color": "rgb(234, 236, 244)",
                "zeroLineColor": "rgb(234, 236, 244)",
                "drawBorder": false,
                "drawTicks": false,
                "borderDash": ["2"],
                "zeroLineBorderDash": ["2"]
              },
              "ticks": {
                "fontColor": "#858796",
                "beginAtZero": true,
                "padding": 20
              },
              "scaleLabel": {
                "display": true,
                "labelString": 'Record Count'
              }
            }
            ]
          }
        }
      });
    } catch (e) {
    }

  }


  function drawPieChart(records) {

    let labels = [];
    let data = [];
    let backgroundColors = [
      "#575",
      "#474",
      "#272",
      "#070",
      "#090",
      "#0b0",
      "#0f0"
    ];
    let borderColors = [];
    for (let key in records) {
      labels.push(key);
      data.push(records[key]);
      borderColors.push('#ffffff00');
    }

    try {
      var ctx = document.getElementById("chart_deliverychart").getContext("2d");
      if (pieChart) pieChart.destroy()
      pieChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: labels,
          datasets: [
            {
              label: labels[0],
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              data: data,
            },
          ],
        },
        options: {
          'onClick': chartClickEvent,
          maintainAspectRatio: false,
          responsive: true,
          legend: {
            display: true,
            position: "bottom",
            reverse: false,
          },
          title: {
            display: false,
          },
        },
      });

    } catch (error) {
    }
  };

  templateObject.getDataFromAPI = function() {
    let crmService = new CRMService();
    let fromDate = moment($("#dateFrom").val(), "DD/MM/YYYY").format("YYYY-MM-DD");
    let toDate = moment($("#dateTo").val(), "DD/MM/YYYY").format("YYYY-MM-DD");
    crmService.getAllLeadCharts(fromDate, toDate).then(function (data) {
      addVS1Data("Tdeliverychart", JSON.stringify(data));
      templateObject.setLeadChartData(data);
    });
  }

  templateObject.getLeadBarChartData = function () {
    getVS1Data("Tdeliverychart").then(function (dataObject) {
      if (dataObject.length) {
        let data = JSON.parse(dataObject[0].data);
        templateObject.setLeadChartData(data);
      }else{
        templateObject.getDataFromAPI()  
      }
    }).catch(function (err) {
      templateObject.getDataFromAPI()
    });
  }

  templateObject.setLeadChartData = async function (data) {
    let bar_records = [];
    let pie_records = [];
    // if (data.tprospect.length) {

    //   let accountData = data.tprospect;
    //   for (let i = 0; i < accountData.length; i++) {
    //     let recordObj = {};
    //     recordObj.Id = data.tprospect[i].Id;
    //     CreationDate = data.tprospect[i].CreationDate ? data.tprospect[i].CreationDate.substr(0, 10) : "";

    //     recordObj.CreationDateSort = CreationDate ? CreationDate : "-";
    //     recordObj.CreationDate = CreationDate ? getModdayOfCurrentWeek(CreationDate) + "~" : "-";
    //     bar_records.push(recordObj);

    //     let pieRecordObj = {};
    //     pieRecordObj.Id = data.tprospect[i].Id;
    //     pieRecordObj.SourceName = data.tprospect[i].SourceName ? data.tprospect[i].SourceName : "-";
    //     pie_records.push(pieRecordObj);
    //   }

    //   bar_records = _.sortBy(bar_records, 'CreationDateSort');
    //   bar_records = await _.groupBy(bar_records, 'CreationDate');

    //   pie_records = _.sortBy(pie_records, 'SourceName');
    //   pie_records = await _.groupBy(pie_records, 'SourceName');

    // } else {
    //   let recordObj = {};
    //   recordObj.Id = '';
    //   recordObj.CreationDate = '-';

    //   let pieRecordObj = {};
    //   pieRecordObj.Id = '';
    //   pieRecordObj.SourceName = '-';

    //   await bar_records.push(recordObj);
    //   await pie_records.push(pieRecordObj);
    // }

    pie_records = {
      // "Total Cost": 37333.11,
      "Fuel Cost": 9352.14,
      "Administrative Cost": 124.34,
      "Depreciation": 5424.34,
      "Insurance": 4544.34,
      "Loan/Lease": 24.34,
      "Maintenance": 524.34,
      "Registration": 1124.34,
      "Tolls": 1246.34,
    }
     drawBarChart(bar_records);
     drawPieChart(pie_records);
  };

  templateObject.drawChart = function() {
    let canvasElems = templateObject.$(".chart-canvas")
    if (!$(canvasElems[0]).hasClass("d-none") || !$(canvasElems[1]).hasClass("d-none")) {
      templateObject.getLeadBarChartData();    
    }
  }
  templateObject.drawChart()
  document.addEventListener("chartDisplayEvent", () => {
    templateObject.drawChart()
  }, false);
  $(document).on("change", "#dateFrom, #dateTo", () => {
    let canvasElems = templateObject.$(".chart-canvas")
    if ($(canvasElems[0]).hasClass("d-none") && $(canvasElems[1]).hasClass("d-none")) return
    templateObject.getDataFromAPI()
  })
});
