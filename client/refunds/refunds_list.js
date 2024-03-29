import '../lib/global/indexdbstorage.js';
import { ReactiveVar } from 'meteor/reactive-var';
import { UtilityService } from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import { SalesBoardService } from '../js/sales-service';
import LoadingOverlay from "../LoadingOverlay";
import { AccountService } from "../accounts/account-service";

import { Template } from 'meteor/templating';
import './refunds_list.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import moment from "moment";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.refundlist.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.custfields = new ReactiveVar([]);
    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);

    templateObject.getDataTableList = function(data) {
        let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.TotalAmount) || 0.00;
        let totalTax = utilityService.modifynegativeCurrencyFormat(data.TotalTax) || 0.00;
        // Currency+''+data.trefundsale[i].fields.TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
        let totalAmount = utilityService.modifynegativeCurrencyFormat(data.TotalAmountInc) || 0.00;
        let totalPaid = utilityService.modifynegativeCurrencyFormat(data.Payment) || 0.00;
        let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.Balance) || 0.00;
        let salestatus = '';
        if(data.Deleted == true){
            salestatus = "Deleted";
        }else if(data.CustomerName == ''){
            salestatus = "Deleted";
        };
        var dataList = [
            data.SaleID,
            '<span style="display:none;">'+(data.SaleDate !=''? moment(data.SaleDate).format("YYYY/MM/DD"): data.SaleDate)+'</span>'+(data.SaleDate !=''? moment(data.SaleDate).format("DD/MM/YYYY"): data.SaleDate),
            data.SaleID || '',
            '<span style="display:none;">'+(data.DueDate !=''? moment(data.DueDate).format("YYYY/MM/DD"): data.DueDate)+'</span>'+(data.DueDate !=''? moment(data.DueDate).format("DD/MM/YYYY"): data.DueDate),
            data.CustomerName || '',
            totalAmountEx || 0.00,
            totalTax || 0.00,
            totalAmount || 0.00,
            totalPaid || 0.00,
            totalOutstanding || 0.00,
            data.EmployeeName || '',
            data.Comments || '',
            data.Deleted ? 'Deleted' : "",
            // data.SaleCustField1 || '',
            // data.SaleCustField2 || '',
            // data.SaleCustField3 || '',
            // shipdate:data.trefundsale[i].fields.ShipDate !=''? moment(data.trefundsale[i].fields.ShipDate).format("DD/MM/YYYY"): data.trefundsale[i].fields.ShipDate,
        ];
        return dataList;
    }

    let headerStructure = [
        { index: 0, label: 'ID', class:'colId', active: false, display: true, width: "10" },
        { index: 1, label: "Sale Date", class: "colSaleDate", active: true, display: true, width: "80" },
        { index: 2, label: "Sales No.", class: "colSalesNo", active: true, display: true, width: "110" },
        { index: 3, label: "Due Date", class: "colDueDate", active: true, display: true, width: "80" },
        { index: 4, label: "Customer", class: "colCustomer", active: true, display: true, width: "200" },
        { index: 5, label: "Amount (Ex)", class: "colAmountEx", active: true, display: true, width: "110" },
        { index: 6, label: "Tax", class: "colTax", active: true, display: true, width: "110" },
        { index: 7, label: "Amount (Inc)", class: "colAmount", active: true, display: true, width: "110" },
        { index: 8, label: "Paid", class: "colPaid", active: true, display: true, width: "110" },
        { index: 9, label: "Outstanding", class: "colBalanceOutstanding", active: false, display: true, width: "110" },
        { index: 10, label: "Employee", class: "colEmployee", active: true, display: true, width: "200" },
        { index: 11, label: "Comments", class: "colComments", active: true, display: true, width: "300" },
        { index: 12, label: "Status", class: "colStatus", active: true, display: true, width: "120" },
    ];

    templateObject.tableheaderrecords.set(headerStructure);
});

Template.refundlist.onRendered(function () {
    $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();

    // set initial table rest_data
    function init_reset_data() {
      let reset_data = [
        { index: 0, label: 'ID', class:'colID', active: false, display: false, width: "30" },
        { index: 1, label: "Sale Date", class: "colSaleDate", active: true, display: true, width: "100" },
        { index: 2, label: "Sales No.", class: "colSalesNo", active: true, display: true, width: "80" },
        { index: 3, label: "Due Date", class: "colDueDate", active: true, display: true, width: "100" },
        { index: 4, label: "Customer", class: "colCustomer", active: true, display: true, width: "200" },
        { index: 5, label: "Amount (Ex)", class: "colAmountEx", active: true, display: true, width: "100" },
        { index: 6, label: "Tax", class: "colTax", active: true, display: true, width: "80" },
        { index: 7, label: "Amount (Inc)", class: "colAmount", active: true, display: true, width: "100" },
        { index: 8, label: "Paid", class: "colPaid", active: true, display: true, width: "80" },
        { index: 9, label: "Outstanding", class: "colBalanceOutstanding", active: false, display: true, width: "120" },
        { index: 10, label: "Employee", class: "colEmployee", active: true, display: true, width: "200" },
        { index: 11, label: "Comments", class: "colComments", active: true, display: true, width: "300" },
        { index: 12, label: "Status", class: "colStatus", active: true, display: true, width: "120" }
      ];

      let templateObject = Template.instance();
      templateObject.reset_data.set(reset_data);
    }
    init_reset_data();
    // set initial table rest_data

    // custom field displaysettings
    templateObject.initCustomFieldDisplaySettings = function(data, listType) {
      let templateObject = Template.instance();
      let reset_data = templateObject.reset_data.get();
      showCustomFieldDisplaySettings(reset_data);
      // try {
      //   getVS1Data("VS1_Customize").then(function (dataObject) {
      //     if (dataObject.length == 0) {
      //       sideBarService.getNewCustomFieldsWithQuery(parseInt(localStorage.getItem('mySessionEmployeeLoggedID')), listType).then(function (data) {
      //           // reset_data = data.ProcessLog.CustomLayout.Columns;
      //           reset_data = data.ProcessLog.Obj.CustomLayout[0].Columns;
      //           showCustomFieldDisplaySettings(reset_data);
      //       }).catch(function (err) {
      //       });
      //     } else {
      //        let data = JSON.parse(dataObject[0].data);
      //        if(data.ProcessLog.Obj.CustomLayout.length > 0){
      //         for (let i = 0; i < data.ProcessLog.Obj.CustomLayout.length; i++) {
      //           if(data.ProcessLog.Obj.CustomLayout[i].TableName == listType){
      //             reset_data = data.ProcessLog.Obj.CustomLayout[i].Columns;
      //             showCustomFieldDisplaySettings(reset_data);
      //           }
      //         }
      //       };
      //       // handle process here
      //     }
      //   });
      // } catch (error) {
      // }
      return;
    }

    function showCustomFieldDisplaySettings(reset_data) {
      let custFields = [];
      let customData = {};
      let customFieldCount = reset_data.length;

      for (let r = 0; r < customFieldCount; r++) {
        customData = {
          active: reset_data[r].active,
          id: reset_data[r].index,
          custfieldlabel: reset_data[r].label,
          class: reset_data[r].class,
          display: reset_data[r].display,
          width: reset_data[r].width ? reset_data[r].width : ''
        };
        custFields.push(customData);
      }
      templateObject.displayfields.set(custFields);
    }
    templateObject.initCustomFieldDisplaySettings("", "tblRefundlist");
    // custom field displaysettings


    let accountService = new AccountService();
    let salesService = new SalesBoardService();
    const customerList = [];
    let salesOrderTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];
    if (FlowRouter.current().queryParams.success) {
        $('.btnRefresh').addClass('btnRefreshAlert');
    }

    var today = moment().format('DD/MM/YYYY');
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");
    let fromDateMonth = (currentDate.getMonth() + 1);
    let fromDateDay = currentDate.getDate();
    if ((currentDate.getMonth() + 1) < 10) {
        fromDateMonth = "0" + (currentDate.getMonth() + 1);
    }

    if (currentDate.getDate() < 10) {
        fromDateDay = "0" + currentDate.getDate();
    }
    var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();

    $("#date-input,#dateTo,#dateFrom").datepicker({
        showOn: 'button',
        buttonText: 'Show Date',
        buttonImageOnly: true,
        buttonImage: '/img/imgCal2.png',
        dateFormat: 'dd/mm/yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: "-90:+10",
        onChangeMonthYear: function(year, month, inst){
        // Set date to picker
        $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
        // Hide (close) the picker
        // $(this).datepicker('hide');
        // // Change ttrigger the on change function
        // $(this).trigger('change');
       }
    });

    $("#dateFrom").val(fromDate);
    $("#dateTo").val(begunDate);

    // Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblRefundlist', function (error, result) {
    //     if (error) {}
    //     else {
    //         if (result) {
    //             for (let i = 0; i < result.customFields.length; i++) {
    //                 let customcolumn = result.customFields;
    //                 let columData = customcolumn[i].label;
    //                 let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
    //                 let hiddenColumn = customcolumn[i].hidden;
    //                 let columnClass = columHeaderUpdate.split('.')[1];
    //                 let columnWidth = customcolumn[i].width;
    //                 // let columnindex = customcolumn[i].index + 1;
    //                 $("th." + columnClass + "").html(columData);
    //                 $("th." + columnClass + "").css('width', "" + columnWidth + "px");
    //
    //             }
    //         }
    //
    //     }
    // });

    function MakeNegative() {
        $('td').each(function () {
            if ($(this).text().indexOf('-' + Currency) >= 0)
                $(this).addClass('text-danger')
        });

        $('td.colStatus').each(function(){
            if($(this).text() == "Deleted") $(this).addClass('text-deleted');
            if ($(this).text() == "Full") $(this).addClass('text-fullyPaid');
            if ($(this).text() == "Part") $(this).addClass('text-partialPaid');
            if ($(this).text() == "Rec") $(this).addClass('text-reconciled');
        });
    };

    templateObject.resetData = function (dataVal) {
        location.reload();
    }

    templateObject.loadCustomFields = async() => {
      let custFields = [];
      let customFieldCount = 3; // customfield tempcode
      let customData = {};
      let displayfields = templateObject.displayfields.get();
  
      await sideBarService.getAllCustomFields().then(function (data) {
        for (let x = 0; x < data.tcustomfieldlist.length; x++) {
          if (data.tcustomfieldlist[x].fields.ListType == 'ltSales') {
            customData = {
              active: data.tcustomfieldlist[x].fields.Active || false,
              id: parseInt(data.tcustomfieldlist[x].fields.ID) || 0,
              custfieldlabel: data.tcustomfieldlist[x].fields.Description || "",
              class: "custfield" + x,
              display: data.tcustomfieldlist[x].fields.Active || false,
              width: "100"
            };
            custFields.push(customData);  
          }
        }
  
        if (custFields.length < customFieldCount) {
          let remainder = customFieldCount - custFields.length;
          let getRemCustomFields = parseInt(custFields.length);
          // count = count + remainder;
          for (let r = 0; r < remainder; r++) {
            getRemCustomFields++;
            customData = {
              active: false,
              id: "",
              custfieldlabel: "Custom Field " + getRemCustomFields,
              class: "custfield" + r + customFields.length,
              display: false,
              width: "120"
            };
            // count++;
            custFields.push(customData);
          }
        }
        
        displayfields = displayfields.concat(custFields);
        templateObject.custfields.set(custFields);
        setTimeout(() => {
          templateObject.displayfields.set(displayfields);
        }, 500);
        
      })
    }

    // templateObject.getAllRefundData = function () {
    //
    //   var currentBeginDate = new Date();
    //   var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
    //   let fromDateMonth = (currentBeginDate.getMonth() + 1);
    //   let fromDateDay = currentBeginDate.getDate();
    //   if ((currentBeginDate.getMonth() + 1) < 10) {
    //       fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
    //   } else {
    //       fromDateMonth = (currentBeginDate.getMonth() + 1);
    //   }
    //
    //   if (currentBeginDate.getDate() < 10) {
    //       fromDateDay = "0" + currentBeginDate.getDate();
    //   }
    //   var toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
    //   let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");
    //
    //     getVS1Data('TRefundSaleList').then(function (dataObject) {
    //         if (dataObject.length == 0) {
    //             sideBarService.getAllTRefundSaleListData(prevMonth11Date,toDate, true,initialReportLoad,0).then(function (data) {
    //                 let lineItems = [];
    //                 let lineItemObj = {};
    //                 addVS1Data('TRefundSaleList', JSON.stringify(data)).then(function (datareturn) {}).catch(function (err) {});
    //                 if (data.Params.IgnoreDates == true) {
    //                     $('#dateFrom').attr('readonly', true);
    //                     $('#dateTo').attr('readonly', true);
    //
    //                 } else {
    //                   $('#dateFrom').attr('readonly', false);
    //                   $('#dateTo').attr('readonly', false);
    //                     $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
    //                     $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
    //                 }
    //                 for (let i = 0; i < data.trefundsalelist.length; i++) {
    //                     let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.trefundsalelist[i].TotalAmount) || 0.00;
    //                     let totalTax = utilityService.modifynegativeCurrencyFormat(data.trefundsalelist[i].TotalTax) || 0.00;
    //                     // Currency+''+data.trefundsale[i].fields.TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
    //                     let totalAmount = utilityService.modifynegativeCurrencyFormat(data.trefundsalelist[i].TotalAmountInc) || 0.00;
    //                     let totalPaid = utilityService.modifynegativeCurrencyFormat(data.trefundsalelist[i].Payment) || 0.00;
    //                     let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.trefundsalelist[i].Balance) || 0.00;
    //                     let salestatus = data.trefundsalelist[i].QuoteStatus || '';
    //                     if(data.trefundsalelist[i].Deleted == true){
    //                       salestatus = "Deleted";
    //                     }else if(data.trefundsalelist[i].CustomerName == ''){
    //                       salestatus = "Deleted";
    //                     };
    //                     var dataList = {
    //                         id: data.trefundsalelist[i].SaleID || '',
    //                         employee: data.trefundsalelist[i].EmployeeName || '',
    //                         sortdate: data.trefundsalelist[i].SaleDate != '' ? moment(data.trefundsalelist[i].SaleDate).format("YYYY/MM/DD") : data.trefundsale[i].SaleDate,
    //                         saledate: data.trefundsalelist[i].SaleDate != '' ? moment(data.trefundsalelist[i].SaleDate).format("DD/MM/YYYY") : data.trefundsale[i].SaleDate,
    //                         duedate: data.trefundsalelist[i].DueDate != '' ? moment(data.trefundsalelist[i].DueDate).format("DD/MM/YYYY") : data.trefundsale[i].DueDate,
    //                         customername: data.trefundsalelist[i].CustomerName || '',
    //                         totalamountex: totalAmountEx || 0.00,
    //                         totaltax: totalTax || 0.00,
    //                         totalamount: totalAmount || 0.00,
    //                         totalpaid: totalPaid || 0.00,
    //                         totaloustanding: totalOutstanding || 0.00,
    //                         salestatus: salestatus || '',
    //                         custfield1: data.trefundsalelist[i].SaleCustField1 || '',
    //                         custfield2: data.trefundsalelist[i].SaleCustField2 || '',
    //                         custfield3: data.trefundsalelist[i].SaleCustField3 || '',
    //                         comments: data.trefundsalelist[i].Comments || '',
    //                         // shipdate:data.trefundsale[i].fields.ShipDate !=''? moment(data.trefundsale[i].fields.ShipDate).format("DD/MM/YYYY"): data.trefundsale[i].fields.ShipDate,
    //
    //                     };
    //
    //                     //if (data.trefundsale[i].fields.Deleted == false && data.trefundsale[i].fields.CustomerName.replace(/\s/g, '') != '') {
    //                         dataTableList.push(dataList);
    //                     //}
    //
    //                     //}
    //                 }
    //
    //                 templateObject.datatablerecords.set(dataTableList);
    //
    //                 if (templateObject.datatablerecords.get()) {
    //
    //                     Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblRefundlist', function (error, result) {
    //                         if (error) {}
    //                         else {
    //                             if (result) {
    //                                 for (let i = 0; i < result.customFields.length; i++) {
    //                                     let customcolumn = result.customFields;
    //                                     let columData = customcolumn[i].label;
    //                                     let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
    //                                     let hiddenColumn = customcolumn[i].hidden;
    //                                     let columnClass = columHeaderUpdate.split('.')[1];
    //                                     let columnWidth = customcolumn[i].width;
    //                                     let columnindex = customcolumn[i].index + 1;
    //
    //                                     if (hiddenColumn == true) {
    //
    //                                         $("." + columnClass + "").addClass('hiddenColumn');
    //                                         $("." + columnClass + "").removeClass('showColumn');
    //                                     } else if (hiddenColumn == false) {
    //                                         $("." + columnClass + "").removeClass('hiddenColumn');
    //                                         $("." + columnClass + "").addClass('showColumn');
    //                                     }
    //
    //                                 }
    //                             }
    //
    //                         }
    //                     });
    //
    //                     setTimeout(function () {
    //                         MakeNegative();
    //                     }, 100);
    //                 }
    //
    //                 $('.fullScreenSpin').css('display', 'none');
    //                 setTimeout(function () {
    //                     $('#tblRefundlist').DataTable({
    //                         columnDefs: [{
    //                                 type: 'date',
    //                                 targets: 0
    //                             }
    //                         ],
    //                         "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //                         buttons: [{
    //                                 extend: 'excelHtml5',
    //                                 text: '',
    //                                 download: 'open',
    //                                 className: "btntabletocsv hiddenColumn",
    //                                 filename: "Refund List excel - " + moment().format(),
    //                                 orientation: 'portrait',
    //                                 exportOptions: {
    //                                     columns: ':visible',
    //                                     format: {
    //                                         body: function (data, row, column) {
    //                                             if (data.includes("</span>")) {
    //                                                 var res = data.split("</span>");
    //                                                 data = res[1];
    //                                             }
    //
    //                                             return column === 1 ? data.replace(/<.*?>/ig, "") : data;
    //
    //                                         }
    //                                     }
    //                                 }
    //                             }, {
    //                                 extend: 'print',
    //                                 download: 'open',
    //                                 className: "btntabletopdf hiddenColumn",
    //                                 text: '',
    //                                 title: 'Refund List',
    //                                 filename: "Refund List - " + moment().format(),
    //                                 exportOptions: {
    //                                     columns: ':visible',
    //                                     stripHtml: false
    //                                 }
    //                             }
    //                         ],
    //                         select: true,
    //                         destroy: true,
    //                         colReorder: true,
    //                         // bStateSave: true,
    //                         // rowId: 0,
    //                         pageLength: initialDatatableLoad,
    //                         "bLengthChange": false,
    //                         info: true,
    //                         responsive: true,
    //                         "order": [[ 0, "desc" ],[ 2, "desc" ]],
    //                         action: function () {
    //                             $('#tblRefundlist').DataTable().ajax.reload();
    //                         },
    //                         "fnDrawCallback": function (oSettings) {
    //                           let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;
    //
    //                           $('.paginate_button.page-item').removeClass('disabled');
    //                           $('#tblRefundlist_ellipsis').addClass('disabled');
    //
    //                           if(oSettings._iDisplayLength == -1){
    //                             if(oSettings.fnRecordsDisplay() > 150){
    //                               $('.paginate_button.page-item.previous').addClass('disabled');
    //                               $('.paginate_button.page-item.next').addClass('disabled');
    //                             }
    //                           }else{
    //
    //                           }
    //                           if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
    //                               $('.paginate_button.page-item.next').addClass('disabled');
    //                           }
    //
    //                           $('.paginate_button.next:not(.disabled)', this.api().table().container())
    //                            .on('click', function(){
    //                              $('.fullScreenSpin').css('display','inline-block');
    //                              let dataLenght = oSettings._iDisplayLength;
    //                              var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
    //                              var dateTo = new Date($("#dateTo").datepicker("getDate"));
    //
    //                              let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
    //                              let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
    //                              if(data.Params.IgnoreDates == true){
    //                                sideBarService.getAllTRefundSaleListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
    //                                  getVS1Data('TRefundSaleList').then(function (dataObjectold) {
    //                                    if(dataObjectold.length == 0){
    //
    //                                    }else{
    //                                      let dataOld = JSON.parse(dataObjectold[0].data);
    //
    //                                      var thirdaryData = $.merge($.merge([], dataObjectnew.trefundsalelist), dataOld.trefundsalelist);
    //                                      let objCombineData = {
    //                                        Params: dataOld.Params,
    //                                        trefundsalelist:thirdaryData
    //                                      }
    //
    //
    //                                        addVS1Data('TRefundSaleList',JSON.stringify(objCombineData)).then(function (datareturn) {
    //                                          templateObject.resetData(objCombineData);
    //                                        $('.fullScreenSpin').css('display','none');
    //                                        }).catch(function (err) {
    //                                        $('.fullScreenSpin').css('display','none');
    //                                        });
    //
    //                                    }
    //                                   }).catch(function (err) {
    //
    //                                   });
    //
    //                                }).catch(function(err) {
    //                                  $('.fullScreenSpin').css('display','none');
    //                                });
    //                              }else{
    //                              sideBarService.getAllTRefundSaleListData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
    //                                getVS1Data('TRefundSaleList').then(function (dataObjectold) {
    //                                  if(dataObjectold.length == 0){
    //
    //                                  }else{
    //                                    let dataOld = JSON.parse(dataObjectold[0].data);
    //
    //                                    var thirdaryData = $.merge($.merge([], dataObjectnew.trefundsalelist), dataOld.trefundsalelist);
    //                                    let objCombineData = {
    //                                      Params: dataOld.Params,
    //                                      trefundsalelist:thirdaryData
    //                                    }
    //
    //
    //                                      addVS1Data('TRefundSaleList',JSON.stringify(objCombineData)).then(function (datareturn) {
    //                                        templateObject.resetData(objCombineData);
    //                                      $('.fullScreenSpin').css('display','none');
    //                                      }).catch(function (err) {
    //                                      $('.fullScreenSpin').css('display','none');
    //                                      });
    //
    //                                  }
    //                                 }).catch(function (err) {
    //
    //                                 });
    //
    //                              }).catch(function(err) {
    //                                $('.fullScreenSpin').css('display','none');
    //                              });
    //                            }
    //                            });
    //
    //                             setTimeout(function () {
    //                                 MakeNegative();
    //                             }, 100);
    //                         },
    //                         language: { search: "",searchPlaceholder: "Search List..." },
    //                         "fnInitComplete": function () {
    //                           this.fnPageChange('last');
    //                           if(data.Params.Search.replace(/\s/g, "") == ""){
    //                             $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblRefundlist_filter");
    //                           }else{
    //                             $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblRefundlist_filter");
    //                           };
    //                             $("<button class='btn btn-primary btnRefreshRefundList' type='button' id='btnRefreshRefundList' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblRefundlist_filter");
    //                             $('.myvarFilterForm').appendTo(".colDateFilter");
    //                         },
    //                         "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
    //                           let countTableData = data.Params.Count || 0; //get count from API data
    //
    //                             return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
    //                         }
    //
    //                     }).on('page', function () {
    //                         setTimeout(function () {
    //                             MakeNegative();
    //                         }, 100);
    //                         let draftRecord = templateObject.datatablerecords.get();
    //                         templateObject.datatablerecords.set(draftRecord);
    //                     }).on('column-reorder', function () {}).on('length.dt', function (e, settings, len) {
    //                         setTimeout(function () {
    //                             MakeNegative();
    //                         }, 100);
    //                     });
    //
    //                     // $('#tblRefundlist').DataTable().column( 0 ).visible( true );
    //                     $('.fullScreenSpin').css('display', 'none');
    //
    //                 }, 0);
    //
    //                 // var columns = $('#tblRefundlist th');
    //                 // let sTible = "";
    //                 // let sWidth = "";
    //                 // let sIndex = "";
    //                 // let sVisible = "";
    //                 // let columVisible = false;
    //                 // let sClass = "";
    //                 // $.each(columns, function (i, v) {
    //                 //     if (v.hidden == false) {
    //                 //         columVisible = true;
    //                 //     }
    //                 //     if ((v.className.includes("hiddenColumn"))) {
    //                 //         columVisible = false;
    //                 //     }
    //                 //     sWidth = v.style.width.replace('px', "");
    //
    //                 //     let datatablerecordObj = {
    //                 //         custid: $(this).attr("custid") || 0,
    //                 //         sTitle: v.innerText || '',
    //                 //         sWidth: sWidth || '',
    //                 //         sIndex: v.cellIndex || '',
    //                 //         sVisible: columVisible || false,
    //                 //         sClass: v.className || ''
    //                 //     };
    //                 //     tableHeaderList.push(datatablerecordObj);
    //                 // });
    //                 // templateObject.tableheaderrecords.set(tableHeaderList);
    //                 $('div.dataTables_filter input').addClass('form-control form-control-sm');
    //                 $('#tblRefundlist tbody').on('click', 'tr', function () {
    //                     var listData = $(this).closest('tr').find(".colSalesNo").text();
    //                     var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
    //                     if (listData) {
    //                       if(checkDeleted == "Deleted"){
    //                         swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
    //                       }else{
    //                         FlowRouter.go('/refundcard?id=' + listData);
    //                       }
    //                     }
    //                 });
    //
    //             }).catch(function (err) {
    //                 // Bert.alert('<strong>' + err + '</strong>!', 'danger');
    //                 $('.fullScreenSpin').css('display', 'none');
    //                 // Meteor._reload.reload();
    //             });
    //         } else {
    //             let data = JSON.parse(dataObject[0].data);
    //
    //             let useData = data;
    //             let lineItems = [];
    //             let lineItemObj = {};
    //             if (data.Params.IgnoreDates == true) {
    //                 $('#dateFrom').attr('readonly', true);
    //                 $('#dateTo').attr('readonly', true);
    //             } else {
    //               $('#dateFrom').attr('readonly', false);
    //               $('#dateTo').attr('readonly', false);
    //                 $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
    //                 $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
    //             }
    //             for (let i = 0; i < data.trefundsalelist.length; i++) {
    //                 let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.trefundsalelist[i].TotalAmount) || 0.00;
    //                 let totalTax = utilityService.modifynegativeCurrencyFormat(data.trefundsalelist[i].TotalTax) || 0.00;
    //                 // Currency+''+data.trefundsale[i].fields.TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
    //                 let totalAmount = utilityService.modifynegativeCurrencyFormat(data.trefundsalelist[i].TotalAmountInc) || 0.00;
    //                 let totalPaid = utilityService.modifynegativeCurrencyFormat(data.trefundsalelist[i].Payment) || 0.00;
    //                 let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.trefundsalelist[i].Balance) || 0.00;
    //                 let salestatus = data.trefundsalelist[i].QuoteStatus || '';
    //                 if(data.trefundsalelist[i].Deleted == true){
    //                   salestatus = "Deleted";
    //                 }else if(data.trefundsalelist[i].CustomerName == ''){
    //                   salestatus = "Deleted";
    //                 };
    //                 var dataList = {
    //                     id: data.trefundsalelist[i].SaleID || '',
    //                     employee: data.trefundsalelist[i].EmployeeName || '',
    //                     sortdate: data.trefundsalelist[i].SaleDate != '' ? moment(data.trefundsalelist[i].SaleDate).format("YYYY/MM/DD") : data.trefundsale[i].SaleDate,
    //                     saledate: data.trefundsalelist[i].SaleDate != '' ? moment(data.trefundsalelist[i].SaleDate).format("DD/MM/YYYY") : data.trefundsale[i].SaleDate,
    //                     duedate: data.trefundsalelist[i].DueDate != '' ? moment(data.trefundsalelist[i].DueDate).format("DD/MM/YYYY") : data.trefundsale[i].DueDate,
    //                     customername: data.trefundsalelist[i].CustomerName || '',
    //                     totalamountex: totalAmountEx || 0.00,
    //                     totaltax: totalTax || 0.00,
    //                     totalamount: totalAmount || 0.00,
    //                     totalpaid: totalPaid || 0.00,
    //                     totaloustanding: totalOutstanding || 0.00,
    //                     salestatus: salestatus || '',
    //                     custfield1: data.trefundsalelist[i].SaleCustField1 || '',
    //                     custfield2: data.trefundsalelist[i].SaleCustField2 || '',
    //                     custfield3: data.trefundsalelist[i].SaleCustField3 || '',
    //                     comments: data.trefundsalelist[i].Comments || '',
    //                     // shipdate:data.trefundsale[i].fields.ShipDate !=''? moment(data.trefundsale[i].fields.ShipDate).format("DD/MM/YYYY"): data.trefundsale[i].fields.ShipDate,
    //
    //                 };
    //
    //                 //if (data.trefundsale[i].fields.Deleted == false && data.trefundsale[i].fields.CustomerName.replace(/\s/g, '') != '') {
    //                     dataTableList.push(dataList);
    //                 //}
    //
    //                 //}
    //             }
    //
    //             templateObject.datatablerecords.set(dataTableList);
    //
    //             if (templateObject.datatablerecords.get()) {
    //
    //                 Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblRefundlist', function (error, result) {
    //                     if (error) {}
    //                     else {
    //                         if (result) {
    //                             for (let i = 0; i < result.customFields.length; i++) {
    //                                 let customcolumn = result.customFields;
    //                                 let columData = customcolumn[i].label;
    //                                 let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
    //                                 let hiddenColumn = customcolumn[i].hidden;
    //                                 let columnClass = columHeaderUpdate.split('.')[1];
    //                                 let columnWidth = customcolumn[i].width;
    //                                 let columnindex = customcolumn[i].index + 1;
    //
    //                                 if (hiddenColumn == true) {
    //
    //                                     $("." + columnClass + "").addClass('hiddenColumn');
    //                                     $("." + columnClass + "").removeClass('showColumn');
    //                                 } else if (hiddenColumn == false) {
    //                                     $("." + columnClass + "").removeClass('hiddenColumn');
    //                                     $("." + columnClass + "").addClass('showColumn');
    //                                 }
    //
    //                             }
    //                         }
    //
    //                     }
    //                 });
    //
    //                 setTimeout(function () {
    //                     MakeNegative();
    //                 }, 100);
    //             }
    //
    //             $('.fullScreenSpin').css('display', 'none');
    //             setTimeout(function () {
    //                 $('#tblRefundlist').DataTable({
    //                     columnDefs: [{
    //                             type: 'date',
    //                             targets: 0
    //                         }
    //                     ],
    //                     "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //                     buttons: [{
    //                             extend: 'excelHtml5',
    //                             text: '',
    //                             download: 'open',
    //                             className: "btntabletocsv hiddenColumn",
    //                             filename: "Refund List excel - " + moment().format(),
    //                             orientation: 'portrait',
    //                             exportOptions: {
    //                                 columns: ':visible',
    //                                 format: {
    //                                     body: function (data, row, column) {
    //                                         if (data.includes("</span>")) {
    //                                             var res = data.split("</span>");
    //                                             data = res[1];
    //                                         }
    //
    //                                         return column === 1 ? data.replace(/<.*?>/ig, "") : data;
    //
    //                                     }
    //                                 }
    //                             }
    //                         }, {
    //                             extend: 'print',
    //                             download: 'open',
    //                             className: "btntabletopdf hiddenColumn",
    //                             text: '',
    //                             title: 'Refund List',
    //                             filename: "Refund List - " + moment().format(),
    //                             exportOptions: {
    //                                 columns: ':visible',
    //                                 stripHtml: false
    //                             }
    //                         }
    //                     ],
    //                     select: true,
    //                     destroy: true,
    //                     colReorder: true,
    //                     // bStateSave: true,
    //                     // rowId: 0,
    //                     pageLength: initialDatatableLoad,
    //                     "bLengthChange": false,
    //                     info: true,
    //                     responsive: true,
    //                     "order": [[ 0, "desc" ],[ 2, "desc" ]],
    //                     action: function () {
    //                         $('#tblRefundlist').DataTable().ajax.reload();
    //                     },
    //                     "fnDrawCallback": function (oSettings) {
    //                       let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;
    //
    //                       $('.paginate_button.page-item').removeClass('disabled');
    //                       $('#tblRefundlist_ellipsis').addClass('disabled');
    //
    //                       if(oSettings._iDisplayLength == -1){
    //                         if(oSettings.fnRecordsDisplay() > 150){
    //                           $('.paginate_button.page-item.previous').addClass('disabled');
    //                           $('.paginate_button.page-item.next').addClass('disabled');
    //                         }
    //                       }else{
    //
    //                       }
    //                       if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
    //                           $('.paginate_button.page-item.next').addClass('disabled');
    //                       }
    //
    //                       $('.paginate_button.next:not(.disabled)', this.api().table().container())
    //                        .on('click', function(){
    //                          $('.fullScreenSpin').css('display','inline-block');
    //                          let dataLenght = oSettings._iDisplayLength;
    //                          var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
    //                          var dateTo = new Date($("#dateTo").datepicker("getDate"));
    //
    //                          let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
    //                          let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
    //                          if(data.Params.IgnoreDates == true){
    //                            sideBarService.getAllTRefundSaleListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
    //                              getVS1Data('TRefundSaleList').then(function (dataObjectold) {
    //                                if(dataObjectold.length == 0){
    //
    //                                }else{
    //                                  let dataOld = JSON.parse(dataObjectold[0].data);
    //
    //                                  var thirdaryData = $.merge($.merge([], dataObjectnew.trefundsalelist), dataOld.trefundsalelist);
    //                                  let objCombineData = {
    //                                    Params: dataOld.Params,
    //                                    trefundsalelist:thirdaryData
    //                                  }
    //
    //
    //                                    addVS1Data('TRefundSaleList',JSON.stringify(objCombineData)).then(function (datareturn) {
    //                                      templateObject.resetData(objCombineData);
    //                                    $('.fullScreenSpin').css('display','none');
    //                                    }).catch(function (err) {
    //                                    $('.fullScreenSpin').css('display','none');
    //                                    });
    //
    //                                }
    //                               }).catch(function (err) {
    //
    //                               });
    //
    //                            }).catch(function(err) {
    //                              $('.fullScreenSpin').css('display','none');
    //                            });
    //                          }else{
    //                          sideBarService.getAllTRefundSaleListData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
    //                            getVS1Data('TRefundSaleList').then(function (dataObjectold) {
    //                              if(dataObjectold.length == 0){
    //
    //                              }else{
    //                                let dataOld = JSON.parse(dataObjectold[0].data);
    //
    //                                var thirdaryData = $.merge($.merge([], dataObjectnew.trefundsalelist), dataOld.trefundsalelist);
    //                                let objCombineData = {
    //                                  Params: dataOld.Params,
    //                                  trefundsalelist:thirdaryData
    //                                }
    //
    //
    //                                  addVS1Data('TRefundSaleList',JSON.stringify(objCombineData)).then(function (datareturn) {
    //                                    templateObject.resetData(objCombineData);
    //                                  $('.fullScreenSpin').css('display','none');
    //                                  }).catch(function (err) {
    //                                  $('.fullScreenSpin').css('display','none');
    //                                  });
    //
    //                              }
    //                             }).catch(function (err) {
    //
    //                             });
    //
    //                          }).catch(function(err) {
    //                            $('.fullScreenSpin').css('display','none');
    //                          });
    //                        }
    //                        });
    //
    //                         setTimeout(function () {
    //                             MakeNegative();
    //                         }, 100);
    //                     },
    //                     language: { search: "",searchPlaceholder: "Search List..." },
    //                     "fnInitComplete": function () {
    //                       this.fnPageChange('last');
    //                       if(data.Params.Search.replace(/\s/g, "") == ""){
    //                         $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblRefundlist_filter");
    //                       }else{
    //                         $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblRefundlist_filter");
    //                       };
    //                         $("<button class='btn btn-primary btnRefreshRefundList' type='button' id='btnRefreshRefundList' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblRefundlist_filter");
    //                         $('.myvarFilterForm').appendTo(".colDateFilter");
    //                     },
    //                     "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
    //                       let countTableData = data.Params.Count || 0; //get count from API data
    //
    //                         return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
    //                     }
    //
    //                 }).on('page', function () {
    //                     setTimeout(function () {
    //                         MakeNegative();
    //                     }, 100);
    //                     let draftRecord = templateObject.datatablerecords.get();
    //                     templateObject.datatablerecords.set(draftRecord);
    //                 }).on('column-reorder', function () {}).on('length.dt', function (e, settings, len) {
    //                     setTimeout(function () {
    //                         MakeNegative();
    //                     }, 100);
    //                 });
    //
    //                 // $('#tblRefundlist').DataTable().column( 0 ).visible( true );
    //                 $('.fullScreenSpin').css('display', 'none');
    //
    //             }, 0);
    //
    //             // var columns = $('#tblRefundlist th');
    //             // let sTible = "";
    //             // let sWidth = "";
    //             // let sIndex = "";
    //             // let sVisible = "";
    //             // let columVisible = false;
    //             // let sClass = "";
    //             // $.each(columns, function (i, v) {
    //             //     if (v.hidden == false) {
    //             //         columVisible = true;
    //             //     }
    //             //     if ((v.className.includes("hiddenColumn"))) {
    //             //         columVisible = false;
    //             //     }
    //             //     sWidth = v.style.width.replace('px', "");
    //
    //             //     let datatablerecordObj = {
    //             //         custid: $(this).attr("custid") || 0,
    //             //         sTitle: v.innerText || '',
    //             //         sWidth: sWidth || '',
    //             //         sIndex: v.cellIndex || '',
    //             //         sVisible: columVisible || false,
    //             //         sClass: v.className || ''
    //             //     };
    //             //     tableHeaderList.push(datatablerecordObj);
    //             // });
    //             // templateObject.tableheaderrecords.set(tableHeaderList);
    //             $('div.dataTables_filter input').addClass('form-control form-control-sm');
    //             $('#tblRefundlist tbody').on('click', 'tr', function () {
    //                 var listData = $(this).closest('tr').attr('id');
    //                 var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
    //                 if (listData) {
    //                   if(checkDeleted == "Deleted"){
    //                     swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
    //                   }else{
    //                     FlowRouter.go('/refundcard?id=' + listData);
    //                   }
    //                 }
    //             });
    //
    //         }
    //     }).catch(function (err) {
    //       sideBarService.getAllTRefundSaleListData(prevMonth11Date,toDate, true,initialReportLoad,0).then(function (data) {
    //           let lineItems = [];
    //           let lineItemObj = {};
    //           addVS1Data('TRefundSaleList', JSON.stringify(data)).then(function (datareturn) {}).catch(function (err) {});
    //           if (data.Params.IgnoreDates == true) {
    //               $('#dateFrom').attr('readonly', true);
    //               $('#dateTo').attr('readonly', true);
    //           } else {
    //             $('#dateFrom').attr('readonly', false);
    //             $('#dateTo').attr('readonly', false);
    //               $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
    //               $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
    //           }
    //           for (let i = 0; i < data.trefundsalelist.length; i++) {
    //               let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.trefundsalelist[i].TotalAmount) || 0.00;
    //               let totalTax = utilityService.modifynegativeCurrencyFormat(data.trefundsalelist[i].TotalTax) || 0.00;
    //               // Currency+''+data.trefundsale[i].fields.TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
    //               let totalAmount = utilityService.modifynegativeCurrencyFormat(data.trefundsalelist[i].TotalAmountInc) || 0.00;
    //               let totalPaid = utilityService.modifynegativeCurrencyFormat(data.trefundsalelist[i].Payment) || 0.00;
    //               let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.trefundsalelist[i].Balance) || 0.00;
    //               let salestatus = data.trefundsalelist[i].QuoteStatus || '';
    //               if(data.trefundsalelist[i].Deleted == true){
    //                 salestatus = "Deleted";
    //               }else if(data.trefundsalelist[i].CustomerName == ''){
    //                 salestatus = "Deleted";
    //               };
    //               var dataList = {
    //                   id: data.trefundsalelist[i].SaleID || '',
    //                   employee: data.trefundsalelist[i].EmployeeName || '',
    //                   sortdate: data.trefundsalelist[i].SaleDate != '' ? moment(data.trefundsalelist[i].SaleDate).format("YYYY/MM/DD") : data.trefundsale[i].SaleDate,
    //                   saledate: data.trefundsalelist[i].SaleDate != '' ? moment(data.trefundsalelist[i].SaleDate).format("DD/MM/YYYY") : data.trefundsale[i].SaleDate,
    //                   duedate: data.trefundsalelist[i].DueDate != '' ? moment(data.trefundsalelist[i].DueDate).format("DD/MM/YYYY") : data.trefundsale[i].DueDate,
    //                   customername: data.trefundsalelist[i].CustomerName || '',
    //                   totalamountex: totalAmountEx || 0.00,
    //                   totaltax: totalTax || 0.00,
    //                   totalamount: totalAmount || 0.00,
    //                   totalpaid: totalPaid || 0.00,
    //                   totaloustanding: totalOutstanding || 0.00,
    //                   salestatus: salestatus || '',
    //                   custfield1: data.trefundsalelist[i].SaleCustField1 || '',
    //                   custfield2: data.trefundsalelist[i].SaleCustField2 || '',
    //                   custfield3: data.trefundsalelist[i].SaleCustField3 || '',
    //                   comments: data.trefundsalelist[i].Comments || '',
    //                   // shipdate:data.trefundsale[i].fields.ShipDate !=''? moment(data.trefundsale[i].fields.ShipDate).format("DD/MM/YYYY"): data.trefundsale[i].fields.ShipDate,
    //
    //               };
    //
    //               //if (data.trefundsale[i].fields.Deleted == false && data.trefundsale[i].fields.CustomerName.replace(/\s/g, '') != '') {
    //                   dataTableList.push(dataList);
    //               //}
    //
    //               //}
    //           }
    //
    //           templateObject.datatablerecords.set(dataTableList);
    //
    //           if (templateObject.datatablerecords.get()) {
    //
    //               Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblRefundlist', function (error, result) {
    //                   if (error) {}
    //                   else {
    //                       if (result) {
    //                           for (let i = 0; i < result.customFields.length; i++) {
    //                               let customcolumn = result.customFields;
    //                               let columData = customcolumn[i].label;
    //                               let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
    //                               let hiddenColumn = customcolumn[i].hidden;
    //                               let columnClass = columHeaderUpdate.split('.')[1];
    //                               let columnWidth = customcolumn[i].width;
    //                               let columnindex = customcolumn[i].index + 1;
    //
    //                               if (hiddenColumn == true) {
    //
    //                                   $("." + columnClass + "").addClass('hiddenColumn');
    //                                   $("." + columnClass + "").removeClass('showColumn');
    //                               } else if (hiddenColumn == false) {
    //                                   $("." + columnClass + "").removeClass('hiddenColumn');
    //                                   $("." + columnClass + "").addClass('showColumn');
    //                               }
    //
    //                           }
    //                       }
    //
    //                   }
    //               });
    //
    //               setTimeout(function () {
    //                   MakeNegative();
    //               }, 100);
    //           }
    //
    //           $('.fullScreenSpin').css('display', 'none');
    //           setTimeout(function () {
    //               $('#tblRefundlist').DataTable({
    //                   columnDefs: [{
    //                           type: 'date',
    //                           targets: 0
    //                       }
    //                   ],
    //                   "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //                   buttons: [{
    //                           extend: 'excelHtml5',
    //                           text: '',
    //                           download: 'open',
    //                           className: "btntabletocsv hiddenColumn",
    //                           filename: "Refund List excel - " + moment().format(),
    //                           orientation: 'portrait',
    //                           exportOptions: {
    //                               columns: ':visible',
    //                               format: {
    //                                   body: function (data, row, column) {
    //                                       if (data.includes("</span>")) {
    //                                           var res = data.split("</span>");
    //                                           data = res[1];
    //                                       }
    //
    //                                       return column === 1 ? data.replace(/<.*?>/ig, "") : data;
    //
    //                                   }
    //                               }
    //                           }
    //                       }, {
    //                           extend: 'print',
    //                           download: 'open',
    //                           className: "btntabletopdf hiddenColumn",
    //                           text: '',
    //                           title: 'Refund List',
    //                           filename: "Refund List - " + moment().format(),
    //                           exportOptions: {
    //                               columns: ':visible',
    //                               stripHtml: false
    //                           }
    //                       }
    //                   ],
    //                   select: true,
    //                   destroy: true,
    //                   colReorder: true,
    //                   // bStateSave: true,
    //                   // rowId: 0,
    //                   pageLength: initialDatatableLoad,
    //                   "bLengthChange": false,
    //                   info: true,
    //                   responsive: true,
    //                   "order": [[ 0, "desc" ],[ 2, "desc" ]],
    //                   action: function () {
    //                       $('#tblRefundlist').DataTable().ajax.reload();
    //                   },
    //                   "fnDrawCallback": function (oSettings) {
    //                     let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;
    //
    //                     $('.paginate_button.page-item').removeClass('disabled');
    //                     $('#tblRefundlist_ellipsis').addClass('disabled');
    //
    //                     if(oSettings._iDisplayLength == -1){
    //                       if(oSettings.fnRecordsDisplay() > 150){
    //                         $('.paginate_button.page-item.previous').addClass('disabled');
    //                         $('.paginate_button.page-item.next').addClass('disabled');
    //                       }
    //                     }else{
    //
    //                     }
    //                     if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
    //                         $('.paginate_button.page-item.next').addClass('disabled');
    //                     }
    //
    //                     $('.paginate_button.next:not(.disabled)', this.api().table().container())
    //                      .on('click', function(){
    //                        $('.fullScreenSpin').css('display','inline-block');
    //                        let dataLenght = oSettings._iDisplayLength;
    //                        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
    //                        var dateTo = new Date($("#dateTo").datepicker("getDate"));
    //
    //                        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
    //                        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
    //                        if(data.Params.IgnoreDates == true){
    //                          sideBarService.getAllTRefundSaleListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
    //                            getVS1Data('TRefundSaleList').then(function (dataObjectold) {
    //                              if(dataObjectold.length == 0){
    //
    //                              }else{
    //                                let dataOld = JSON.parse(dataObjectold[0].data);
    //
    //                                var thirdaryData = $.merge($.merge([], dataObjectnew.trefundsalelist), dataOld.trefundsalelist);
    //                                let objCombineData = {
    //                                  Params: dataOld.Params,
    //                                  trefundsalelist:thirdaryData
    //                                }
    //
    //
    //                                  addVS1Data('TRefundSaleList',JSON.stringify(objCombineData)).then(function (datareturn) {
    //                                    templateObject.resetData(objCombineData);
    //                                  $('.fullScreenSpin').css('display','none');
    //                                  }).catch(function (err) {
    //                                  $('.fullScreenSpin').css('display','none');
    //                                  });
    //
    //                              }
    //                             }).catch(function (err) {
    //
    //                             });
    //
    //                          }).catch(function(err) {
    //                            $('.fullScreenSpin').css('display','none');
    //                          });
    //                        }else{
    //                        sideBarService.getAllTRefundSaleListData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
    //                          getVS1Data('TRefundSaleList').then(function (dataObjectold) {
    //                            if(dataObjectold.length == 0){
    //
    //                            }else{
    //                              let dataOld = JSON.parse(dataObjectold[0].data);
    //
    //                              var thirdaryData = $.merge($.merge([], dataObjectnew.trefundsalelist), dataOld.trefundsalelist);
    //                              let objCombineData = {
    //                                Params: dataOld.Params,
    //                                trefundsalelist:thirdaryData
    //                              }
    //
    //
    //                                addVS1Data('TRefundSaleList',JSON.stringify(objCombineData)).then(function (datareturn) {
    //                                  templateObject.resetData(objCombineData);
    //                                $('.fullScreenSpin').css('display','none');
    //                                }).catch(function (err) {
    //                                $('.fullScreenSpin').css('display','none');
    //                                });
    //
    //                            }
    //                           }).catch(function (err) {
    //
    //                           });
    //
    //                        }).catch(function(err) {
    //                          $('.fullScreenSpin').css('display','none');
    //                        });
    //                      }
    //                      });
    //
    //                       setTimeout(function () {
    //                           MakeNegative();
    //                       }, 100);
    //                   },
    //                   language: { search: "",searchPlaceholder: "Search List..." },
    //                   "fnInitComplete": function () {
    //                     this.fnPageChange('last');
    //                     if(data.Params.Search.replace(/\s/g, "") == ""){
    //                       $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblRefundlist_filter");
    //                     }else{
    //                       $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblRefundlist_filter");
    //                     };
    //                       $("<button class='btn btn-primary btnRefreshRefundList' type='button' id='btnRefreshRefundList' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblRefundlist_filter");
    //                       $('.myvarFilterForm').appendTo(".colDateFilter");
    //                   },
    //                   "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
    //                     let countTableData = data.Params.Count || 0; //get count from API data
    //
    //                       return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
    //                   }
    //
    //               }).on('page', function () {
    //                   setTimeout(function () {
    //                       MakeNegative();
    //                   }, 100);
    //                   let draftRecord = templateObject.datatablerecords.get();
    //                   templateObject.datatablerecords.set(draftRecord);
    //               }).on('column-reorder', function () {}).on('length.dt', function (e, settings, len) {
    //                   setTimeout(function () {
    //                       MakeNegative();
    //                   }, 100);
    //               });
    //
    //               // $('#tblRefundlist').DataTable().column( 0 ).visible( true );
    //               $('.fullScreenSpin').css('display', 'none');
    //
    //           }, 0);
    //
    //           // var columns = $('#tblRefundlist th');
    //           // let sTible = "";
    //           // let sWidth = "";
    //           // let sIndex = "";
    //           // let sVisible = "";
    //           // let columVisible = false;
    //           // let sClass = "";
    //           // $.each(columns, function (i, v) {
    //           //     if (v.hidden == false) {
    //           //         columVisible = true;
    //           //     }
    //           //     if ((v.className.includes("hiddenColumn"))) {
    //           //         columVisible = false;
    //           //     }
    //           //     sWidth = v.style.width.replace('px', "");
    //
    //           //     let datatablerecordObj = {
    //           //       custid: $(this).attr("custid") || 0,
    //           //         sTitle: v.innerText || '',
    //           //         sWidth: sWidth || '',
    //           //         sIndex: v.cellIndex || '',
    //           //         sVisible: columVisible || false,
    //           //         sClass: v.className || ''
    //           //     };
    //           //     tableHeaderList.push(datatablerecordObj);
    //           // });
    //           // templateObject.tableheaderrecords.set(tableHeaderList);
    //           $('div.dataTables_filter input').addClass('form-control form-control-sm');
    //           $('#tblRefundlist tbody').on('click', 'tr', function () {
    //               var listData = $(this).closest('tr').attr('id');
    //               var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
    //               if (listData) {
    //                 if(checkDeleted == "Deleted"){
    //                   swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
    //                 }else{
    //                   FlowRouter.go('/refundcard?id=' + listData);
    //                 }
    //               }
    //           });
    //
    //       }).catch(function (err) {
    //           // Bert.alert('<strong>' + err + '</strong>!', 'danger');
    //           $('.fullScreenSpin').css('display', 'none');
    //           // Meteor._reload.reload();
    //       });
    //     });
    // }

    //templateObject.getAllRefundData();

    templateObject.getAllFilterRefundData = function(fromDate, toDate, ignoreDate) {
        sideBarService.getAllTRefundSaleListData(fromDate, toDate, ignoreDate,initialReportLoad,0).then(function(data) {
            addVS1Data('TRefundSaleList', JSON.stringify(data)).then(function(datareturn) {
                location.reload();
            }).catch(function(err) {
                location.reload();
            });
        }).catch(function(err) {
            $('.fullScreenSpin').css('display', 'none');
        });
    }

    let urlParametersDateFrom = FlowRouter.current().queryParams.fromDate;
    let urlParametersDateTo = FlowRouter.current().queryParams.toDate;
    let urlParametersIgnoreDate = FlowRouter.current().queryParams.ignoredate;
    if (urlParametersDateFrom) {
        if (urlParametersIgnoreDate == true) {
            $('#dateFrom').attr('readonly', true);
            $('#dateTo').attr('readonly', true);
        } else {

            $("#dateFrom").val(urlParametersDateFrom != '' ? moment(urlParametersDateFrom).format("DD/MM/YYYY") : urlParametersDateFrom);
            $("#dateTo").val(urlParametersDateTo != '' ? moment(urlParametersDateTo).format("DD/MM/YYYY") : urlParametersDateTo);
        }
    }

    templateObject.initPage = async () => {
      LoadingOverlay.show();
       await templateObject.loadCustomFields();
       // templateObject.getAllRefundData();
      
      LoadingOverlay.hide();
    }
    //templateObject.initPage();
});

Template.refundlist.events({
    'click #tblRefundlist tbody tr': function (event) {
        var listData = $(event.target).closest('tr').find('td.colId').text();
        var checkDeleted = $(event.target).closest('tr').find('.colStatus').text() || '';
        if(listData){
            if(checkDeleted == "Deleted"){
                swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
            }else{
                FlowRouter.go('/refundcard?id=' + listData);
            }
        }
    },
    'click #newRefund': function (event) {
        FlowRouter.go('/refundcard');
    },
    'keyup #tblRefundlist_filter input': function (event) {
        if ($(event.target).val() != '') {
            $(".btnRefreshRefundList").addClass('btnSearchAlert');
        } else {
            $(".btnRefreshRefundList").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
            $(".btnRefreshRefundList").trigger("click");
        }
    },
    'click .btnRefreshRefundList': function (event) {
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let tableProductList;
        const dataTableList = [];
        var splashArrayRefundList = new Array();
        const lineExtaSellItems = [];
        $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('#tblRefundlist_filter input').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getNewRefundByNameOrID(dataSearchName).then(function (data) {
              $(".btnRefreshRefundList").removeClass('btnSearchAlert');
                let lineItems = [];
                let lineItemObj = {};
                if (data.trefundsale.length > 0) {
                    for (let i = 0; i < data.trefundsale.length; i++) {
                        let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.trefundsale[i].fields.TotalAmount) || 0.00;
                        let totalTax = utilityService.modifynegativeCurrencyFormat(data.trefundsale[i].fields.TotalTax) || 0.00;
                        // Currency+''+data.trefundsale[i].fields.TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                        let totalAmount = utilityService.modifynegativeCurrencyFormat(data.trefundsale[i].fields.TotalAmountInc) || 0.00;
                        let totalPaid = utilityService.modifynegativeCurrencyFormat(data.trefundsale[i].fields.TotalPaid) || 0.00;
                        let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.trefundsale[i].fields.TotalBalance) || 0.00;
                        let salestatus = data.trefundsale[i].fields.SalesStatus || '';
                        if(data.trefundsale[i].fields.Deleted == true){
                          salestatus = "Deleted";
                        }else if(data.trefundsale[i].fields.CustomerName == ''){
                          salestatus = "Deleted";
                        };
                        var dataList = {
                            id: data.trefundsale[i].fields.ID || '',
                            employee: data.trefundsale[i].fields.EmployeeName || '',
                            sortdate: data.trefundsale[i].fields.SaleDate != '' ? moment(data.trefundsale[i].fields.SaleDate).format("YYYY/MM/DD") : data.trefundsale[i].fields.SaleDate,
                            saledate: data.trefundsale[i].fields.SaleDate != '' ? moment(data.trefundsale[i].fields.SaleDate).format("DD/MM/YYYY") : data.trefundsale[i].fields.SaleDate,
                            duedate: data.trefundsale[i].fields.DueDate != '' ? moment(data.trefundsale[i].fields.DueDate).format("DD/MM/YYYY") : data.trefundsale[i].fields.DueDate,
                            customername: data.trefundsale[i].fields.CustomerName || '',
                            totalamountex: totalAmountEx || 0.00,
                            totaltax: totalTax || 0.00,
                            totalamount: totalAmount || 0.00,
                            totalpaid: totalPaid || 0.00,
                            totaloustanding: totalOutstanding || 0.00,
                            salestatus: salestatus || '',
                            custfield1: data.trefundsale[i].fields.SaleCustField1 || '',
                            custfield2: data.trefundsale[i].fields.SaleCustField2 || '',
                            comments: data.trefundsale[i].fields.Comments || '',
                            // shipdate:data.trefundsale[i].fields.ShipDate !=''? moment(data.trefundsale[i].fields.ShipDate).format("DD/MM/YYYY"): data.trefundsale[i].fields.ShipDate,

                        };

                        //if(data.trefundsale[i].fields.Deleted == false){
                        //splashArrayRefundList.push(dataList);
                        dataTableList.push(dataList);
                        //}


                        //}
                    }
                    templateObject.datatablerecords.set(dataTableList);

                    let item = templateObject.datatablerecords.get();
                    $('.fullScreenSpin').css('display', 'none');
                    if (dataTableList) {
                        var datatable = $('#tblRefundlist').DataTable();
                        $("#tblRefundlist > tbody").empty();
                        for (let x = 0; x < item.length; x++) {
                            $("#tblRefundlist > tbody").append(
                                ' <tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
                                '<td contenteditable="false" class="colSortDate hiddenColumn">' + item[x].sortdate + '</td>' +
                                '<td contenteditable="false" class="colSaleDate" ><span style="display:none;">' + item[x].sortdate + '</span>' + item[x].saledate + '</td>' +
                                '<td contenteditable="false" class="colSalesNo">' + item[x].id + '</td>' +
                                '<td contenteditable="false" class="colDueDate" >' + item[x].duedate + '</td>' +
                                '<td contenteditable="false" class="colCustomer">' + item[x].customername + '</td>' +
                                '<td contenteditable="false" class="colAmountEx" style="text-align: right!important;">' + item[x].totalamountex + '</td>' +
                                '<td contenteditable="false" class="colTax" style="text-align: right!important;">' + item[x].totaltax + '</td>' +
                                '<td contenteditable="false" class="colAmount" style="text-align: right!important;">' + item[x].totalamount + '</td>' +
                                '<td contenteditable="false" class="colPaid" style="text-align: right!important;">' + item[x].totalpaid + '</td>' +
                                '<td contenteditable="false" class="colBalanceOutstanding" style="text-align: right!important;">' + item[x].totaloustanding + '</td>' +
                                '<td contenteditable="false" class="colStatus">' + item[x].salestatus + '</td>' +
                                '<td contenteditable="false" class="colSaleCustField1 hiddenColumn">' + item[x].custfield1 + '</td>' +
                                '<td contenteditable="false" class="colSaleCustField2 hiddenColumn">' + item[x].custfield2 + '</td>' +
                                '<td contenteditable="false" class="colEmployee hiddenColumn">' + item[x].employee + '</td>' +
                                '<td contenteditable="false" class="colComments">' + item[x].comments + '</td>' +
                                '</tr>');

                        }
                        $('.dataTables_info').html('Showing 1 to ' + data.trefundsale.length + ' of ' + data.trefundsale.length + ' entries');

                    }

                } else {
                    $('.fullScreenSpin').css('display', 'none');

                    swal({
                        title: 'Question',
                        text: "Product does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            FlowRouter.go('/productview');
                        } else if (result.dismiss === 'cancel') {
                            //$('#productListModal').modal('toggle');
                        }
                    });
                }
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {

          $(".btnRefresh").trigger("click");
        }
    },
    'click #btnRefundBOList': function (event) {
        //FlowRouter.go('/invoicelistBO');
    },
    // 'click .chkDatatable': function (event) {
    //     var columns = $('#tblRefundlist th');
    //     let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();
    //
    //     $.each(columns, function (i, v) {
    //         let className = v.classList;
    //         let replaceClass = className[1];
    //
    //         if (v.innerText == columnDataValue) {
    //             if ($(event.target).is(':checked')) {
    //                 $("." + replaceClass + "").css('display', 'table-cell');
    //                 $("." + replaceClass + "").css('padding', '.75rem');
    //                 $("." + replaceClass + "").css('vertical-align', 'top');
    //             } else {
    //                 $("." + replaceClass + "").css('display', 'none');
    //             }
    //         }
    //     });
    // },
    //
    // // custom field displaysettings
    // 'click .resetTable' : function(event) {
    //   let templateObject = Template.instance();
    //   let reset_data = templateObject.reset_data.get();
    //   reset_data = reset_data.filter(redata => redata.display);
    //
    //   $(".displaySettings").each(function (index) {
    //     let $tblrow = $(this);
    //     $tblrow.find(".divcolumn").text(reset_data[index].label);
    //     $tblrow.find(".custom-control-input").prop("checked", reset_data[index].active);
    //
    //     let title = $("#tblRefundlist").find("th").eq(index+1);
    //     $(title).html(reset_data[index].label);
    //
    //     if (reset_data[index].active) {
    //       $('.col' + reset_data[index].class).addClass('showColumn');
    //       $('.col' + reset_data[index].class).removeClass('hiddenColumn');
    //     } else {
    //       $('.col' + reset_data[index].class).addClass('hiddenColumn');
    //       $('.col' + reset_data[index].class).removeClass('showColumn');
    //     }
    //     $(".rngRange" + reset_data[index].class).val('');
    //   });
    // },
    //
    // // custom field displaysettings
    // 'click .saveTable' : async function(event){
    //   let lineItems = [];
    //   $(".fullScreenSpin").css("display", "inline-block");
    //
    //   $(".displaySettings").each(function (index) {
    //     var $tblrow = $(this);
    //     var fieldID = $tblrow.attr("custid") || 0;
    //     var colTitle = $tblrow.find(".divcolumn").text() || "";
    //     var colWidth = $tblrow.find(".custom-range").val() || 0;
    //     var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || "";
    //     var colHidden = false;
    //     if ($tblrow.find(".custom-control-input").is(":checked")) {
    //       colHidden = true;
    //     } else {
    //       colHidden = false;
    //     }
    //     let lineItemObj = {
    //       index: parseInt(fieldID),
    //       label: colTitle,
    //       active: colHidden,
    //       width: parseInt(colWidth),
    //       class: colthClass,
    //       display: true
    //     };
    //
    //     lineItems.push(lineItemObj);
    //   });
    //
    //   let templateObject = Template.instance();
    //   let reset_data = templateObject.reset_data.get();
    //   reset_data = reset_data.filter(redata => redata.display == false);
    //   lineItems.push(...reset_data);
    //   lineItems.sort((a,b) => a.index - b.index);
    //
    //   try {
    //     let erpGet = erpDb();
    //     let tableName = "tblRefundlist";
    //     let employeeId = parseInt(localStorage.getItem('mySessionEmployeeLoggedID'))||0;
    //     let added = await sideBarService.saveNewCustomFields(erpGet, tableName, employeeId, lineItems);
    //     $(".fullScreenSpin").css("display", "none");
    //     if(added) {
    //       sideBarService.getNewCustomFieldsWithQuery(parseInt(localStorage.getItem('mySessionEmployeeLoggedID')),'').then(function (dataCustomize) {
    //           addVS1Data('VS1_Customize', JSON.stringify(dataCustomize));
    //       });
    //         swal({
    //           title: 'SUCCESS',
    //           text: "Display settings is updated!",
    //           type: 'success',
    //           showCancelButton: false,
    //           confirmButtonText: 'OK'
    //         }).then((result) => {
    //             if (result.value) {
    //               $('#myModal2').modal('hide');
    //             }
    //         });
    //     } else {
    //       swal("Something went wrong!", "", "error");
    //     }
    //   } catch (error) {
    //     $(".fullScreenSpin").css("display", "none");
    //     swal("Something went wrong!", "", "error");
    //   }
    // },

    // 'blur .divcolumn': function (event) {
    //     let columData = $(event.target).text();

    //     let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
    //     var datable = $('#tblRefundlist').DataTable();
    //     var title = datable.column(columnDatanIndex).header();
    //     $(title).html(columData);

    // },


  'click .chkSaleDate': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colSaleDate').addClass('showColumn');
      $('.colSaleDate').removeClass('hiddenColumn');
    } else {
      $('.colSaleDate').addClass('hiddenColumn');
      $('.colSaleDate').removeClass('showColumn');
    }
  },
  'click .chkSalesNo': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colSalesNo').addClass('showColumn');
      $('.colSalesNo').removeClass('hiddenColumn');
    } else {
      $('.colSalesNo').addClass('hiddenColumn');
      $('.colSalesNo').removeClass('showColumn');
    }
  },
  'click .chkDueDate': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colDueDate').addClass('showColumn');
      $('.colDueDate').removeClass('hiddenColumn');
    } else {
      $('.colDueDate').addClass('hiddenColumn');
      $('.colDueDate').removeClass('showColumn');
    }
  },
  'click .chkCustomer': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colCustomer').addClass('showColumn');
      $('.colCustomer').removeClass('hiddenColumn');
    } else {
      $('.colCustomer').addClass('hiddenColumn');
      $('.colCustomer').removeClass('showColumn');
    }
  },
  'click .chkcustfield53': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colcustfield53').addClass('showColumn');
      $('.colcustfield53').removeClass('hiddenColumn');
    } else {
      $('.colcustfield53').addClass('hiddenColumn');
      $('.colcustfield53').removeClass('showColumn');
    }
  },
  'click .chkcustfield54': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colcustfield54').addClass('showColumn');
      $('.colcustfield54').removeClass('hiddenColumn');
    } else {
      $('.colcustfield54').addClass('hiddenColumn');
      $('.colcustfield54').removeClass('showColumn');
    }
  },
  'click .chkcustfield58': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colcustfield58').addClass('showColumn');
      $('.colcustfield58').removeClass('hiddenColumn');
    } else {
      $('.colcustfield58').addClass('hiddenColumn');
      $('.colcustfield58').removeClass('showColumn');
    }
  },

  'click .chkAmountEx': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colAmountEx').addClass('showColumn');
      $('.colAmountEx').removeClass('hiddenColumn');
    } else {
      $('.colAmountEx').addClass('hiddenColumn');
      $('.colAmountEx').removeClass('showColumn');
    }
  },
  'click .chkTax': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colTax').addClass('showColumn');
      $('.colTax').removeClass('hiddenColumn');
    } else {
      $('.colTax').addClass('hiddenColumn');
      $('.colTax').removeClass('showColumn');
    }
  },
  // displaysettings
  'click .chkAmount': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colAmount').addClass('showColumn');
      $('.colAmount').removeClass('hiddenColumn');
    } else {
      $('.colAmount').addClass('hiddenColumn');
      $('.colAmount').removeClass('showColumn');
    }
  },
  'click .chkPaid': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colPaid').addClass('showColumn');
      $('.colPaid').removeClass('hiddenColumn');
    } else {
      $('.colPaid').addClass('hiddenColumn');
      $('.colPaid').removeClass('showColumn');
    }
  },

  'click .chkBalanceOutstanding': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colBalanceOutstanding').addClass('showColumn');
      $('.colBalanceOutstanding').removeClass('hiddenColumn');
    } else {
        $('.colBalanceOutstanding').addClass('hiddenColumn');
        $('.colBalanceOutstanding').removeClass('showColumn');
    }
  },
  'click .chkStatus': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colStatus').addClass('showColumn');
      $('.colStatus').removeClass('hiddenColumn');
    } else {
      $('.colStatus').addClass('hiddenColumn');
      $('.colStatus').removeClass('showColumn');
    }
  },
  'click .chkEmployee': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colEmployee').addClass('showColumn');
      $('.colEmployee').removeClass('hiddenColumn');
    } else {
      $('.colEmployee').addClass('hiddenColumn');
      $('.colEmployee').removeClass('showColumn');
    }
  },
  'click .chkComments': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colComments').addClass('showColumn');
      $('.colComments').removeClass('hiddenColumn');
    } else {
      $('.colComments').addClass('hiddenColumn');
      $('.colComments').removeClass('showColumn');
    }
  },
  'click .chkPONumber': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colPONumber').addClass('showColumn');
      $('.colPONumber').removeClass('hiddenColumn');
    } else {
      $('.colPONumber').addClass('hiddenColumn');
      $('.colPONumber').removeClass('showColumn');
    }
  },
  'click .chkReference': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colReference').addClass('showColumn');
      $('.colReference').removeClass('hiddenColumn');
    } else {
      $('.colReference').addClass('hiddenColumn');
      $('.colReference').removeClass('showColumn');
    }
  },
  // display settings


  'change .rngRangeSaleDate': function(event) {
      let range = $(event.target).val();
      $('.colSaleDate').css('width', range);
  },
  'change .rngRangeSalesNo': function(event) {
      let range = $(event.target).val();
      $('.colSalesNo').css('width', range);
  },
  'change .rngRangeDueDate': function(event) {
      let range = $(event.target).val();
      $('.colDueDate').css('width', range);
  },
  'change .rngRangeUnitPriceInc': function(event) {
      let range = $(event.target).val();
      $('.colUnitPriceInc').css('width', range);
  },
  'change .rngRangeUnitPriceEx': function(event) {
      let range = $(event.target).val();
      $('.colUnitPriceEx').css('width', range);
  },
  'change .rngRangeTax': function(event) {
      let range = $(event.target).val();
      $('.colTax').css('width', range);
  },
  'change .rngRangeAmountInc': function (event) {
      let range = $(event.target).val();
      $('.colAmountInc').css('width', range);
  },
  'change .rngRangeAmountEx': function (event) {
      let range = $(event.target).val();
      $('.colAmountEx').css('width', range);
  },
  'change .rngRangePaid': function (event) {
      let range = $(event.target).val();
      $('.colPaid').css('width', range);
  },
  'change .rngRangeBalanceOutstanding': function (event) {
      let range = $(event.target).val();
      $('.colBalanceOutstanding').css('width', range);
  },
  'change .rngRangeStatus': function (event) {
      let range = $(event.target).val();
      $('.colStatus').css('width', range);
  },
  'change .rngRangeAmount': function (event) {
      let range = $(event.target).val();
      $('.colAmount').css('width', range);
  },
  'change .rngRangeCustomer': function(event) {
      let range = $(event.target).val();
      $('.colCustomer').css('width', range);
  },
  'change .rngRangeEmployee': function(event) {
      let range = $(event.target).val();
      $('.colEmployee').css('width', range);
  },
  'change .rngRangeComments': function(event) {
      let range = $(event.target).val();
      $('.colComments').css('width', range);
  },
  'change .rngRangePONumber': function(event) {
      let range = $(event.target).val();
      $('.colPONumber').css('width', range);
  },
  'change .rngRangeReference': function(event) {
      let range = $(event.target).val();
      $('.colReference').css('width', range);
  },
  "blur .divcolumn": function (event) {
    let columData = $(event.target).html();
    let columHeaderUpdate = $(event.target).attr("valueupdate");
    $("th.col" + columHeaderUpdate + "").html(columData);
  },

    'change .rngRange': function (event) {
        let range = $(event.target).val();
        $(event.target).closest("div.divColWidth").find(".spWidth").html(range + 'px');

        let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblRefundlist th');
        $.each(datable, function (i, v) {

            if (v.innerText == columnDataValue) {
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("." + replaceClass + "").css('width', range + 'px');

            }
        });

    },
    // 'click .btnOpenSettings': function (event) {
    //     let templateObject = Template.instance();
    //     var columns = $('#tblRefundlist th');

    //     const tableHeaderList = [];
    //     let sTible = "";
    //     let sWidth = "";
    //     let sIndex = "";
    //     let sVisible = "";
    //     let columVisible = false;
    //     let sClass = "";
    //     $.each(columns, function (i, v) {
    //         if (v.hidden == false) {
    //             columVisible = true;
    //         }
    //         if ((v.className.includes("hiddenColumn"))) {
    //             columVisible = false;
    //         }
    //         sWidth = v.style.width.replace('px', "");

    //         let datatablerecordObj = {
    //           custid: $(this).attr("custid") || 0,
    //             sTitle: v.innerText || '',
    //             sWidth: sWidth || '',
    //             sIndex: v.cellIndex || '',
    //             sVisible: columVisible || false,
    //             sClass: v.className || ''
    //         };
    //         tableHeaderList.push(datatablerecordObj);
    //     });
    //     templateObject.tableheaderrecords.set(tableHeaderList);
    // },
    // 'click #exportbtn': function () {
    //     $('.fullScreenSpin').css('display', 'inline-block');
    //     jQuery('#tblRefundlist_wrapper .dt-buttons .btntabletocsv').click();
    //     $('.fullScreenSpin').css('display', 'none');
    //
    // },
    'click .btnRefresh': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentDate = new Date();
        let hours = currentDate.getHours(); //returns 0-23
        let minutes = currentDate.getMinutes(); //returns 0-59
        let seconds = currentDate.getSeconds(); //returns 0-59
        let month = (currentDate.getMonth() + 1);
        let days = currentDate.getDate();

        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if((currentBeginDate.getMonth()+1) < 10){
            fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
        }else{
          fromDateMonth = (currentBeginDate.getMonth()+1);
        }

        if(currentBeginDate.getDate() < 10){
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDate = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);
        let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

        sideBarService.getAllTRefundSaleListData(prevMonth11Date,toDate, true,initialReportLoad,0).then(function (dataRefund) {
            addVS1Data('TRefundSaleList', JSON.stringify(dataRefund)).then(function (datareturn) {
              sideBarService.getAllRefundList(initialDataLoad, 0).then(function (data) {
                  addVS1Data('TRefundSale', JSON.stringify(data)).then(function (datareturn) {

                      sideBarService.getSalesListData(prevMonth11Date, toDate, true, initialReportLoad, 0).then(function (dataSales) {
                          addVS1Data("TSalesList", JSON.stringify(dataSales)).then(function (datareturn) {
                              window.open('/refundlist', '_self');
                            }).catch(function (err) {
                                window.open('/refundlist', '_self');
                             });
                      }).catch(function (err) {
                          window.open('/refundlist', '_self');
                      });
                  }).catch(function (err) {
                      window.open('/refundlist', '_self');
                  });
              }).catch(function (err) {
                  window.open('/refundlist', '_self');
              });
            }).catch(function (err) {
              sideBarService.getAllRefundList(initialDataLoad, 0).then(function (data) {
                  addVS1Data('TRefundSale', JSON.stringify(data)).then(function (datareturn) {
                      window.open('/refundlist', '_self');
                  }).catch(function (err) {
                      window.open('/refundlist', '_self');
                  });
              }).catch(function (err) {
                  window.open('/refundlist', '_self');
              });
            });
        }).catch(function (err) {
            window.open('/refundlist', '_self');
        });



    },
    'change #dateTo': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        setTimeout(function(){
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

        } else {
            templateObject.getAllFilterRefundData(formatDateFrom, formatDateTo, false);
        }
        },500);
    },
    'change #dateFrom': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        setTimeout(function(){
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

        } else {
            templateObject.getAllFilterRefundData(formatDateFrom, formatDateTo, false);
        }
        },500);
    },
    // 'click .printConfirm': function (event) {
    //   playPrintAudio();
    //   setTimeout(function(){
    //     $('.fullScreenSpin').css('display', 'inline-block');
    //     jQuery('#tblRefundlist_wrapper .dt-buttons .btntabletopdf').click();
    //     $('.fullScreenSpin').css('display', 'none');
    //   }, delayTimeAfterSound);
    // }

});

Template.refundlist.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function (a, b) {
            if (a.saledate == 'NA') {
                return 1;
            } else if (b.saledate == 'NA') {
                return -1;
            }
            return (a.saledate.toUpperCase() > b.saledate.toUpperCase()) ? 1 : -1;
            // return (a.saledate.toUpperCase() < b.saledate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: localStorage.getItem('mycloudLogonID'),
            PrefName: 'tblRefundlist'
        });
    },


    // custom fields displaysettings
    custfields: () => {
      return Template.instance().custfields.get();
    },

    // custom fields displaysettings
    displayfields: () => {
      return Template.instance().displayfields.get();
    },

    apiFunction:function() {
        let sideBarService = new SideBarService();
        return sideBarService.getAllTRefundSaleListData;
    },

    searchAPI: function() {
        return sideBarService.getNewRefundByName;
    },

    service: ()=>{
        let sideBarService = new SideBarService();
        return sideBarService;

    },

    datahandler: function () {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    exDataHandler: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    apiParams: function() {
        return ["dateFrom","dateTo","ignoredate","limitCount","limitFrom", 'deleteFilter'];
    },
});
