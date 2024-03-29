import { PurchaseBoardService } from '../js/purchase-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import { DashBoardService } from "../Dashboard/dashboard-service";
import { UtilityService } from "../utility-service";
import { ProductService } from "../product/product-service";
import { AccountService } from "../accounts/account-service";
import '../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';

import { Random } from 'meteor/random';
import { jsPDF } from 'jspdf';
import 'jQuery.print/jQuery.print.js';
import { autoTable } from 'jspdf-autotable';

import { TaxRateService } from "../settings/settings-service";
import 'jquery-editable-select';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import "../deposits/frm_deposit_temp.html"

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
var times = 0;

var template_list = [
    "Deposits",
];
var noHasTotals = ["Customer Payment", "Customer Statement", "Supplier Payment", "Statement", "Delivery Docket", "Journal Entry", "Deposit"];

Template.depositcard_temp.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar();
    templateObject.CleintName = new ReactiveVar();
    templateObject.Department = new ReactiveVar();
    templateObject.Date = new ReactiveVar();
    templateObject.DueDate = new ReactiveVar();
    templateObject.BillNo = new ReactiveVar();
    templateObject.RefNo = new ReactiveVar();
    templateObject.Branding = new ReactiveVar();
    templateObject.Currency = new ReactiveVar();
    templateObject.Total = new ReactiveVar();
    templateObject.Subtotal = new ReactiveVar();
    templateObject.TotalTax = new ReactiveVar();
    templateObject.record = new ReactiveVar({});
    templateObject.taxrateobj = new ReactiveVar();
    templateObject.Accounts = new ReactiveVar([]);
    templateObject.BillId = new ReactiveVar();
    templateObject.selectedCurrency = new ReactiveVar([]);
    templateObject.inputSelectedCurrency = new ReactiveVar([]);
    templateObject.currencySymbol = new ReactiveVar([]);
    templateObject.deptrecords = new ReactiveVar();
    templateObject.hasFollow = new ReactiveVar(false);
    templateObject.termrecords = new ReactiveVar();
    templateObject.clientrecords = new ReactiveVar([]);
    templateObject.taxraterecords = new ReactiveVar([]);


    templateObject.uploadedFile = new ReactiveVar();
    templateObject.uploadedFiles = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar();

    templateObject.address = new ReactiveVar();
    templateObject.abn = new ReactiveVar();
    templateObject.referenceNumber = new ReactiveVar();

    templateObject.statusrecords = new ReactiveVar([]);

    templateObject.totalCredit = new ReactiveVar();
    templateObject.totalCredit.set(Currency + '0.00');
    templateObject.totalDebit = new ReactiveVar();
    templateObject.totalDebit.set(Currency + '0.00');
    templateObject.accountnamerecords = new ReactiveVar();
    templateObject.datatablepaymentlistrecords = new ReactiveVar([]);

    templateObject.customerRecord = new ReactiveVar();

    templateObject.headerfields = new ReactiveVar();
    templateObject.headerbuttons = new ReactiveVar();
    templateObject.tranasctionfooterfields = new ReactiveVar();
    templateObject.gridfields = new ReactiveVar();
    templateObject.printOptions = new ReactiveVar();


    function formatDate (date) {
        return moment(date).format('DD/MM/YYYY');
    }

    let options = [{ title: 'Purchase Orders', number: 1, nameFieldID: 'Purchase_orders_1' }, { title: 'Purchase_Orders', number: 2, nameFieldID: 'Purchase_Orders_2' }, { title: 'Purchase_Orders', number: 3, nameFieldID: 'Purchase_Orders_3' },
    { title: 'Email', number: 1, nameFieldID: 'Email_1' }, { title: 'Email', number: 2, nameFieldID: 'Email_2' }, { title: 'Email', number: 3, nameFieldID: 'Email_3' },
    { title: 'SMS', number: 1, nameFieldID: 'SMS_1' }, { title: 'SMS', number: 2, nameFieldID: 'SMS_2' }, { title: 'SMS', number: 3, nameFieldID: 'SMS_3' },
    { title: 'Preview', number: 1, nameFieldID: 'Preview_1' }, { title: 'Preview', number: 2, nameFieldID: 'Preview_2' }, { title: 'Preview', number: 3, nameFieldID: 'Preview_3' },
    ]

    templateObject.initialRecords = (data) => {

        $('.fullScreenSpin').css('display', 'none');

        // setTimeout(function () {
        //     templateObject.getAllDepositIds();
        // }, 500);
        let lineItems = [];
        let lineItemsTable = [];
        let lineItemObj = {};

        lineItemObj = {
            lineID: Random.id(),
            id: '',
            accountname: '',
            accountno: '',
            memo: '',
            lineamount: 0,
            companyname: '',
            paymentmethod: ''
        };
        lineItems.push(lineItemObj);

        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");
        let record = {
            id: '',
            lid: 'New Deposit Entry',
            accountname: '',
            memo: '',
            department: defaultDept,
            entryno: '',
            deposittotal: 0.00,
            transdate: begunDate,
            LineItems: lineItems,
            isReconciled: false

        };
        $("#form :input").prop("disabled", false);
        templateObject.record.set(record);
        if (templateObject.record.get()) {
            Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblDepositEntryLine', function (error, result) {
                if (error) {


                } else {
                    if (result) {
                        for (let i = 0; i < result.customFields.length; i++) {
                            let customcolumn = result.customFields;
                            let columData = customcolumn[i].label;
                            let columHeaderUpdate = customcolumn[i].thclass;
                            let hiddenColumn = customcolumn[i].hidden;
                            let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
                            let columnWidth = customcolumn[i].width;

                            $("" + columHeaderUpdate + "").html(columData);
                            if (columnWidth !== 0) {
                                $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
                            }
                            if (hiddenColumn === true) {
                                $("." + columnClass + "").addClass('hiddenColumn');
                                $("." + columnClass + "").removeClass('showColumn');
                                $(".chk" + columnClass + "").removeAttr('checked');
                            } else if (hiddenColumn === false) {
                                $("." + columnClass + "").removeClass('hiddenColumn');
                                $("." + columnClass + "").addClass('showColumn');
                                $(".chk" + columnClass + "").attr('checked', 'checked');
                            }

                        }
                    }

                }
            });
        }

        return templateObject.record.get()


    }

    templateObject.printOptions.set(options)

    // Methods

    let transactionheaderfields = [
        { label: 'Account', type: 'search', id: 'account', listModalId: 'accountListModalABC12', listModalTemp: 'accountlistpop', colName: 'colAccoutName', editModalId: 'vs1_dropdown_modal', editModalTemp: 'addaccountpop', editable: true, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
        { label: 'Deposit No.', type: 'default', id: 'edtEntryNo', value: '', readonly: false, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
        { label: 'Deposit Total', type: 'default', id: 'depositTotal', value: '0', readonly: false, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
        { label: "Date", type: "date", id:"dtTransDate", readonly: false, value: formatDate(new Date()), divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader", },
    ]
    templateObject.headerfields.set(transactionheaderfields);

    let transactionheaderbuttons = [
        { label: "Copy Deposit", class: 'btnTransaction copyPO', id: 'copyDeposit', bsColor: 'primary' }
    ]
    templateObject.headerbuttons.set(transactionheaderbuttons)

    let transactionfooterfields = [
        { label: 'Referenc No', id: "txaNotes", name: "txaNotes", row: 12 },
    ];

    templateObject.tranasctionfooterfields.set(transactionfooterfields);


    let transactiongridfields = [
        { index: 0,  custfieldlabel: "From Account", parentClass:'colAccount', label: "From Account",  type: "select", id:"sltFromAccount", listtemplatename: 'accountlistpop', modalId: 'fromaccountlistmodal', targettemplate:'addAccountModal', targetId: 'edtfromaccountmodal', editable: true,  class: "sltAccountName lineAccountName", colName:'colAccountName',  width: "300",       active: true,   display: true },
        { index: 1,  custfieldlabel: "Payment Method", parentClass:'colPaymentMethod', label: "Payment Method", type: "select", id:"sltPaymentMethod", listtemplatename: 'paymentmethodpop', modalId:"paymentmethodmodal", editable: false, class: "linePaymentMethod",   colName:'colNamePopUp', width: "",          active: true,   display: true },
        { index: 2,  custfieldlabel: "Amount",      label: "Amount",       class: "colAmount lineAmount",   width: "200",       active: true,   display: true },
        { index: 3,  custfieldlabel: "Reference No", parentClass:'colReference',label: "Reference No", class: "lineReference", width: "",  active: true,   display: true },
        { index: 4,  custfieldlabel: "Received From", parentClass:'colCompany', label: "Received From",  type: "select", id:"sltCompanyFrom", listtemplatename: 'customerlistpop', modalId: 'companylistmodal', targettemplate:'addcustomerpop', targetId: 'edtcustomermodal', editable: true,  class: "sltAccountName1 lineAccountName1", colName:'colCompany',  width: "300",       active: true,   display: true },
    ]
    // { index: 5,  custfieldlabel: "Received From", parentClass: 'colCompany', label: "Received From", type:"select", id:"sltCompanyFrom", listtemplatename: 'customerlistpop', modalId: "companylistmodal", targettemplate: "addcustomerpop", targetId: 'edtcustomermodal', editable: true, class: "lineCompany sltCompanyFrom", colName: 'colCompany', width: "300", active: true,   display: true },


    templateObject.gridfields.set(transactiongridfields)
    setTimeout(function () {

        var x = window.matchMedia("(max-width: 1024px)");

        function mediaQuery(x) {
            if (x.matches) {

                $("#colDate").removeClass("col-1");
                $("#colDate").addClass("col-4");
                $("#colDepartment").removeClass("col-2");
                $("#colDepartment").addClass("col-4");
                $("#colEntryNo").removeClass("col-2");
                $("#colEntryNo").addClass("col-4");
                $("#colMemo").removeClass("col-5");
                $("#colMemo").addClass("col-12");

            }
        }
        mediaQuery(x);
        x.addListener(mediaQuery)
    }, 10);

    setTimeout(function () {

        var x = window.matchMedia("(max-width: 420px)");

        function mediaQuery(x) {
            if (x.matches) {

                $("#colDate").removeClass("col-1");
                $("#colDate").addClass("col-12");
                $("#colDepartment").removeClass("col-2");
                $("#colDepartment").addClass("col-12");
                $("#colEntryNo").removeClass("col-2");
                $("#colEntryNo").addClass("col-12");
                $("#colMemo").removeClass("col-5");
                $("#colMemo").addClass("col-12");

            }
        }
        mediaQuery(x);
        x.addListener(mediaQuery)
    }, 10);

});

Template.depositcard_temp.onRendered(() => {
    let templateObject = Template.instance();
    templateObject.hasFollowings = async function () {
        var currentDate = new Date();
        let purchaseService = new PurchaseBoardService();
        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentInvoice = getso_id[getso_id.length - 1];
        if (getso_id[1]) {
      
            // some get following deposit logic
            templateObject.hasFollow.set(false)
        }
    }
    templateObject.hasFollowings();
    $('#edtFrequencyDetail').css('display', 'none');

    const records = [];
    let purchaseService = new PurchaseBoardService();
    let clientsService = new PurchaseBoardService();
    let productsService = new PurchaseBoardService();
    let taxRateService = new TaxRateService();
    const dataTableList = [];

    const clientList = [];
    const productsList = [];
    const accountsList = [];
    const deptrecords = [];

    const termrecords = [];
    const statusList = [];
    let newDepositId = '';

    // templateObject.getAllDepositIds = function () {
    //     purchaseService.getDepositEntryIds().then(function (data) {
    //         let latestPOId;
    //         if (data.tvs1bankdeposit.length) {
    //             let lastElement = data.tvs1bankdeposit[data.tvs1bankdeposit.length - 1];
    //             latestPOId = (lastElement.Id);
    //         } else {
    //             latestPOId = 0;
    //         }

    //         newDepositId = (latestPOId + 1);
    //         $('#edtEnrtyNo').val(newDepositId);

    //     }).catch(function (err) {
    //         newDepositId = 0;
    //         $('#edtEnrtyNo').val(newDepositId);
    //     });
    // };




    jQuery(document).ready(function($) {
    
        if (window.history && window.history.pushState) {

            window.history.pushState('forward', null, FlowRouter.current().path);

            $(window).on('popstate', function() {
            swal({
                    title: 'Save Or Cancel To Continue',
                    text: "Do you want to Save or Cancel this transaction?",
                    type: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Save'
                }).then((result) => {
                    if (result.value) {
                        $(".btnSave").trigger("click");
                    } else if (result.dismiss === 'cancel') {
                        let lastPageVisitUrl = window.location.pathname;
                        if (FlowRouter.current().oldRoute) {
                            lastPageVisitUrl = FlowRouter.current().oldRoute.path;
                        } else {
                            lastPageVisitUrl = window.location.pathname;
                        }
                        //FlowRouter.go(lastPageVisitUrl);
                        window.open(lastPageVisitUrl, '_self');
                    } else {}
                });
            });

        }
    });

    $('.fullScreenSpin').css('display', 'inline-block');
   

    setTimeout(function () {
        $('#account_fromtransactionheader').trigger("click");
    }, 500);
    // var url = FlowRouter.current().path;
    // if (url.indexOf('?id=') > 0) {
    //     var getso_id = url.split('?id=');
    //     var currentDeposit = getso_id[getso_id.length - 1];
    //     if (getso_id[1]) {
    //         currentDeposit = parseInt(currentDeposit);
    //         templateObject.getDepositData = function () {
    //             getVS1Data('TVS1BankDeposit').then(function (dataObject) {
    //                 if (dataObject.length === 0) {
    //                     purchaseService.getOneDepositEnrtyData(currentDeposit).then(function (data) {
    //                         $('.fullScreenSpin').css('display', 'none');
    //                         let lineItems = [];
    //                         let lineItemObj = {};
    //                         let lineItemsTable = [];
    //                         let lineItemTableObj = {};
    //                         let currencySymbol = Currency;
    //                         let department = data.fields.Lines[0].fields.DeptName;
    //                         let totalDeposit = utilityService.modifynegativeCurrencyFormat(data.fields.Deposit) || 0.00;
    //                         if (data.fields.Lines != null) {
    //                             if (data.fields.Lines.length) {
    //                                 for (let i = 0; i < data.fields.Lines.length; i++) {
    //                                     let lineAmount = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.Amount) || 0.00;

    //                                     lineItemObj = {
    //                                         lineID: Random.id(),
    //                                         id: data.fields.Lines[i].fields.ID || '',
    //                                         accountname: data.fields.Lines[i].fields.AccountName || data.fields.AccountName || '',
    //                                         accountno: data.fields.Lines[i].fields.AccountNumber || '',
    //                                         memo: data.fields.Lines[i].fields.ReferenceNo || '',
    //                                         lineamount: lineAmount || 0,
    //                                         companyname: data.fields.Lines[i].fields.CompanyName || '',
    //                                         paymentmethod: data.fields.Lines[i].fields.PaymentMethod || ''

    //                                     };


    //                                     lineItems.push(lineItemObj);
    //                                 }
    //                             }
    //                         }

    //                         let record = {
    //                             id: data.fields.ID,
    //                             lid: 'Edit Deposit' + ' ' + data.fields.ID,
    //                             accountname: data.fields.AccountName || '',
    //                             memo: data.fields.Notes,
    //                             department: department,
    //                             entryno: data.fields.ID,
    //                             deposittotal: totalDeposit || 0.00,
    //                             transdate: data.fields.DepositDate ? moment(data.fields.DepositDate).format('DD/MM/YYYY') : "",
    //                             LineItems: lineItems,
    //                             isReconciled: data.fields.Reconciled
    //                         };
    //                         if (data.fields.Reconciled) {
    //                             $(".btnDeleteDepositEntry").prop("disabled", true);
    //                             $(".btnDelete").prop("disabled", true);
    //                             $(".btnSave").prop("disabled", true);
    //                             $("#form :input").prop("disabled", true);
    //                             $(".btn-light").prop("disabled", false);
    //                             $(".close").prop("disabled", false);
    //                         }


    //                         $(".printConfirm").prop("disabled", false);
    //                         $(".btnBack").prop("disabled", false);
    //                         templateObject.record.set(record);

    //                         $('#sltAccountName').val(data.fields.AccountName);

    //                         if (templateObject.record.get()) {
    //                             Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblDepositEntryLine', function (error, result) {
    //                                 if (error) {


    //                                 } else {
    //                                     if (result) {
    //                                         for (let i = 0; i < result.customFields.length; i++) {
    //                                             let customcolumn = result.customFields;
    //                                             let columData = customcolumn[i].label;
    //                                             let columHeaderUpdate = customcolumn[i].thclass;
    //                                             let hiddenColumn = customcolumn[i].hidden;
    //                                             let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
    //                                             let columnWidth = customcolumn[i].width;


    //                                             $("" + columHeaderUpdate + "").html(columData);
    //                                             if (columnWidth !== 0) {
    //                                                 $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
    //                                             }

    //                                             if (hiddenColumn === true) {

    //                                                 $("." + columnClass + "").addClass('hiddenColumn');
    //                                                 $("." + columnClass + "").removeClass('showColumn');
    //                                                 $(".chk" + columnClass + "").removeAttr('checked');
    //                                             } else if (hiddenColumn === false) {
    //                                                 $("." + columnClass + "").removeClass('hiddenColumn');
    //                                                 $("." + columnClass + "").addClass('showColumn');
    //                                                 $(".chk" + columnClass + "").attr('checked', 'checked');

    //                                             }

    //                                         }
    //                                     }

    //                                 }
    //                             });
    //                         }
    //                     }).catch(function (err) {
    //                         swal({
    //                             title: 'Oooops...',
    //                             text: err,
    //                             type: 'error',
    //                             showCancelButton: false,
    //                             confirmButtonText: 'Try Again'
    //                         }).then((result) => {
    //                             if (result.value) { if (err === checkResponseError) { window.open('/', '_self'); } }
    //                             else if (result.dismiss === 'cancel') {

    //                             }
    //                         });
    //                         $('.fullScreenSpin').css('display', 'none');

    //                     });
    //                 } else {
    //                     let data = JSON.parse(dataObject[0].data);
    //                     let useData = data.tvs1bankdeposit;
    //                     var added = false;
    //                     for (let d = 0; d < useData.length; d++) {
    //                         if (parseInt(useData[d].fields.ID) === currentDeposit) {
    //                             added = true;

    //                             $('.fullScreenSpin').css('display', 'none');

    //                             let lineItems = [];
    //                             let lineItemObj = {};
    //                             let lineItemsTable = [];
    //                             let lineItemTableObj = {};
    //                             let currencySymbol = Currency;
    //                             let department = useData[d].fields.Lines[0].fields.DeptName;
    //                             let totalDeposit = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Deposit) || 0.00;

    //                             if (useData[d].fields.Lines.length) {
    //                                 for (let i = 0; i < useData[d].fields.Lines.length; i++) {
    //                                     let lineAmount = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.Amount) || 0.00;

    //                                     lineItemObj = {
    //                                         lineID: Random.id(),
    //                                         id: useData[d].fields.Lines[i].fields.ID || '',
    //                                         accountname: useData[d].fields.Lines[i].fields.AccountName || useData[d].fields.AccountName || '',
    //                                         accountno: useData[d].fields.Lines[i].fields.AccountNumber || '',
    //                                         memo: useData[d].fields.Lines[i].fields.ReferenceNo || '',
    //                                         lineamount: lineAmount || 0,
    //                                         companyname: useData[d].fields.Lines[i].fields.CompanyName || '',
    //                                         paymentmethod: useData[d].fields.Lines[i].fields.PaymentMethod || ''

    //                                     };


    //                                     lineItems.push(lineItemObj);
    //                                 }
    //                             }

    //                             let record = {
    //                                 id: useData[d].fields.ID,
    //                                 lid: 'Edit Deposit' + ' ' + useData[d].fields.ID,
    //                                 accountname: useData[d].fields.AccountName || '',
    //                                 memo: useData[d].fields.Notes,
    //                                 department: department,
    //                                 entryno: useData[d].fields.ID,
    //                                 deposittotal: totalDeposit || 0.00,
    //                                 transdate: useData[d].fields.DepositDate ? moment(useData[d].fields.DepositDate).format('DD/MM/YYYY') : "",
    //                                 LineItems: lineItems,
    //                                 isReconciled: useData[d].fields.Reconciled
    //                             };
    //                             if (useData[d].fields.Reconciled) {
    //                                 $(".btnDeleteDepositEntry").prop("disabled", true);
    //                                 $(".btnDelete").prop("disabled", true);
    //                                 $(".btnSave").prop("disabled", true);
    //                                 $("#form :input").prop("disabled", true);
    //                                 $(".btn-light").prop("disabled", false);
    //                                 $(".close").prop("disabled", false);
    //                             }


    //                             $(".printConfirm").prop("disabled", false);
    //                             $(".btnBack").prop("disabled", false);
    //                             templateObject.record.set(record);
    //                             $('#sltAccountName').val(useData[d].fields.AccountName);
    //                             if (templateObject.record.get()) {
    //                                 Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblDepositEntryLine', function (error, result) {
    //                                     if (error) {

    //                                     } else {
    //                                         if (result) {
    //                                             for (let i = 0; i < result.customFields.length; i++) {
    //                                                 let customcolumn = result.customFields;
    //                                                 let columData = customcolumn[i].label;
    //                                                 let columHeaderUpdate = customcolumn[i].thclass;
    //                                                 let hiddenColumn = customcolumn[i].hidden;
    //                                                 let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
    //                                                 let columnWidth = customcolumn[i].width;


    //                                                 $("" + columHeaderUpdate + "").html(columData);
    //                                                 if (columnWidth !== 0) {
    //                                                     $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
    //                                                 }

    //                                                 if (hiddenColumn === true) {

    //                                                     $("." + columnClass + "").addClass('hiddenColumn');
    //                                                     $("." + columnClass + "").removeClass('showColumn');
    //                                                     $(".chk" + columnClass + "").removeAttr('checked');
    //                                                 } else if (hiddenColumn === false) {
    //                                                     $("." + columnClass + "").removeClass('hiddenColumn');
    //                                                     $("." + columnClass + "").addClass('showColumn');
    //                                                     $(".chk" + columnClass + "").attr('checked', 'checked');

    //                                                 }

    //                                             }
    //                                         }

    //                                     }
    //                                 });
    //                             }
    //                         }
    //                     }

    //                     if (!added) {
    //                         purchaseService.getOneDepositEnrtyData(currentDeposit).then(function (data) {
    //                             $('.fullScreenSpin').css('display', 'none');
    //                             let lineItems = [];
    //                             let lineItemObj = {};
    //                             let lineItemsTable = [];
    //                             let lineItemTableObj = {};
    //                             let currencySymbol = Currency;
    //                             let department = data.fields.Lines[0].fields.DeptName;
    //                             let totalDeposit = utilityService.modifynegativeCurrencyFormat(data.fields.Deposit) || 0.00;

    //                             if (data.fields.Lines.length) {
    //                                 for (let i = 0; i < data.fields.Lines.length; i++) {
    //                                     let lineAmount = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.Amount) || 0.00;

    //                                     lineItemObj = {
    //                                         lineID: Random.id(),
    //                                         id: data.fields.Lines[i].fields.ID || '',
    //                                         accountname: data.fields.Lines[i].fields.AccountName || data.fields.AccountName || '',
    //                                         accountno: data.fields.Lines[i].fields.AccountNumber || '',
    //                                         memo: data.fields.Lines[i].fields.ReferenceNo || '',
    //                                         lineamount: lineAmount || 0,
    //                                         companyname: data.fields.Lines[i].fields.CompanyName || '',
    //                                         paymentmethod: data.fields.Lines[i].fields.PaymentMethod || ''

    //                                     };


    //                                     lineItems.push(lineItemObj);
    //                                 }
    //                             }

    //                             let record = {
    //                                 id: data.fields.ID,
    //                                 lid: 'Edit Deposit' + ' ' + data.fields.ID,
    //                                 accountname: data.fields.AccountName || '',
    //                                 memo: data.fields.Notes,
    //                                 department: department,
    //                                 entryno: data.fields.ID,
    //                                 deposittotal: totalDeposit || 0.00,
    //                                 transdate: data.fields.DepositDate ? moment(data.fields.DepositDate).format('DD/MM/YYYY') : "",
    //                                 LineItems: lineItems,
    //                                 isReconciled: data.fields.Reconciled
    //                             };
    //                             if (data.fields.Reconciled) {
    //                                 $(".btnDeleteDepositEntry").prop("disabled", true);
    //                                 $(".btnDelete").prop("disabled", true);
    //                                 $(".btnSave").prop("disabled", true);
    //                                 $("#form :input").prop("disabled", true);
    //                                 $(".btn-light").prop("disabled", false);
    //                                 $(".close").prop("disabled", false);
    //                             }


    //                             $(".printConfirm").prop("disabled", false);
    //                             $(".btnBack").prop("disabled", false);
    //                             templateObject.record.set(record);

    //                             $('#sltAccountName').val(data.fields.AccountName);

    //                             if (templateObject.record.get()) {
    //                                 Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblDepositEntryLine', function (error, result) {
    //                                     if (error) {


    //                                     } else {
    //                                         if (result) {
    //                                             for (let i = 0; i < result.customFields.length; i++) {
    //                                                 let customcolumn = result.customFields;
    //                                                 let columData = customcolumn[i].label;
    //                                                 let columHeaderUpdate = customcolumn[i].thclass;
    //                                                 let hiddenColumn = customcolumn[i].hidden;
    //                                                 let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
    //                                                 let columnWidth = customcolumn[i].width;


    //                                                 $("" + columHeaderUpdate + "").html(columData);
    //                                                 if (columnWidth !== 0) {
    //                                                     $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
    //                                                 }

    //                                                 if (hiddenColumn === true) {

    //                                                     $("." + columnClass + "").addClass('hiddenColumn');
    //                                                     $("." + columnClass + "").removeClass('showColumn');
    //                                                     $(".chk" + columnClass + "").removeAttr('checked');
    //                                                 } else if (hiddenColumn === false) {
    //                                                     $("." + columnClass + "").removeClass('hiddenColumn');
    //                                                     $("." + columnClass + "").addClass('showColumn');
    //                                                     $(".chk" + columnClass + "").attr('checked', 'checked');

    //                                                 }

    //                                             }
    //                                         }

    //                                     }
    //                                 });
    //                             }
    //                         }).catch(function (err) {
    //                             swal({
    //                                 title: 'Oooops...',
    //                                 text: err,
    //                                 type: 'error',
    //                                 showCancelButton: false,
    //                                 confirmButtonText: 'Try Again'
    //                             }).then((result) => {
    //                                 if (result.value) { if (err === checkResponseError) { window.open('/', '_self'); } }
    //                                 else if (result.dismiss === 'cancel') {

    //                                 }
    //                             });
    //                             $('.fullScreenSpin').css('display', 'none');

    //                         });
    //                     }
    //                 }
    //             }).catch(function (err) {
    //                 purchaseService.getOneDepositEnrtyData(currentDeposit).then(function (data) {
    //                     $('.fullScreenSpin').css('display', 'none');
    //                     let lineItems = [];
    //                     let lineItemObj = {};
    //                     let lineItemsTable = [];
    //                     let lineItemTableObj = {};
    //                     let currencySymbol = Currency;
    //                     let department = data.fields.Lines[0].fields.DeptName;
    //                     let totalDeposit = utilityService.modifynegativeCurrencyFormat(data.fields.Deposit) || 0.00;

    //                     if (data.fields.Lines.length) {
    //                         for (let i = 0; i < data.fields.Lines.length; i++) {
    //                             let lineAmount = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.Amount) || 0.00;

    //                             lineItemObj = {
    //                                 lineID: Random.id(),
    //                                 id: data.fields.Lines[i].fields.ID || '',
    //                                 accountname: data.fields.Lines[i].fields.AccountName || data.fields.AccountName || '',
    //                                 accountno: data.fields.Lines[i].fields.AccountNumber || '',
    //                                 memo: data.fields.Lines[i].fields.ReferenceNo || '',
    //                                 lineamount: lineAmount || 0,
    //                                 companyname: data.fields.Lines[i].fields.CompanyName || '',
    //                                 paymentmethod: data.fields.Lines[i].fields.PaymentMethod || ''

    //                             };


    //                             lineItems.push(lineItemObj);
    //                         }
    //                     }

    //                     let record = {
    //                         id: data.fields.ID,
    //                         lid: 'Edit Deposit' + ' ' + data.fields.ID,
    //                         accountname: data.fields.AccountName || '',
    //                         memo: data.fields.Notes,
    //                         department: department,
    //                         entryno: data.fields.ID,
    //                         deposittotal: totalDeposit || 0.00,
    //                         transdate: data.fields.DepositDate ? moment(data.fields.DepositDate).format('DD/MM/YYYY') : "",
    //                         LineItems: lineItems,
    //                         isReconciled: data.fields.Reconciled
    //                     };
    //                     if (data.fields.Reconciled) {
    //                         $(".btnDeleteDepositEntry").prop("disabled", true);
    //                         $(".btnDelete").prop("disabled", true);
    //                         $(".btnSave").prop("disabled", true);
    //                         $("#form :input").prop("disabled", true);
    //                         $(".btn-light").prop("disabled", false);
    //                         $(".close").prop("disabled", false);
    //                     }


    //                     $(".printConfirm").prop("disabled", false);
    //                     $(".btnBack").prop("disabled", false);
    //                     templateObject.record.set(record);

    //                     $('#sltAccountName').val(data.fields.AccountName);

    //                     if (templateObject.record.get()) {
    //                         Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblDepositEntryLine', function (error, result) {
    //                             if (error) {


    //                             } else {
    //                                 if (result) {
    //                                     for (let i = 0; i < result.customFields.length; i++) {
    //                                         let customcolumn = result.customFields;
    //                                         let columData = customcolumn[i].label;
    //                                         let columHeaderUpdate = customcolumn[i].thclass;
    //                                         let hiddenColumn = customcolumn[i].hidden;
    //                                         let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
    //                                         let columnWidth = customcolumn[i].width;


    //                                         $("" + columHeaderUpdate + "").html(columData);
    //                                         if (columnWidth !== 0) {
    //                                             $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
    //                                         }

    //                                         if (hiddenColumn === true) {

    //                                             $("." + columnClass + "").addClass('hiddenColumn');
    //                                             $("." + columnClass + "").removeClass('showColumn');
    //                                             $(".chk" + columnClass + "").removeAttr('checked');
    //                                         } else if (hiddenColumn === false) {
    //                                             $("." + columnClass + "").removeClass('hiddenColumn');
    //                                             $("." + columnClass + "").addClass('showColumn');
    //                                             $(".chk" + columnClass + "").attr('checked', 'checked');

    //                                         }

    //                                     }
    //                                 }

    //                             }
    //                         });
    //                     }
    //                 }).catch(function (err) {
    //                     swal({
    //                         title: 'Oooops...',
    //                         text: err,
    //                         type: 'error',
    //                         showCancelButton: false,
    //                         confirmButtonText: 'Try Again'
    //                     }).then((result) => {
    //                         if (result.value) { if (err === checkResponseError) { window.open('/', '_self'); } }
    //                         else if (result.dismiss === 'cancel') {

    //                         }
    //                     });
    //                     $('.fullScreenSpin').css('display', 'none');

    //                 });
    //             });

    //         };

    //         templateObject.getDepositData();
    //     }

    // } else {
    //     $('.fullScreenSpin').css('display', 'none');

    //     setTimeout(function () {
    //         templateObject.getAllDepositIds();
    //     }, 500);
    //     let lineItems = [];
    //     let lineItemsTable = [];
    //     let lineItemObj = {};

    //     lineItemObj = {
    //         lineID: Random.id(),
    //         id: '',
    //         accountname: '',
    //         accountno: '',
    //         memo: '',
    //         lineamount: 0,
    //         companyname: '',
    //         paymentmethod: ''
    //     };
    //     lineItems.push(lineItemObj);

    //     var currentDate = new Date();
    //     var begunDate = moment(currentDate).format("DD/MM/YYYY");
    //     let record = {
    //         id: '',
    //         lid: 'New Deposit Entry',
    //         accountname: '',
    //         memo: '',
    //         department: defaultDept,
    //         entryno: '',
    //         deposittotal: 0.00,
    //         transdate: begunDate,
    //         LineItems: lineItems,
    //         isReconciled: false

    //     };
    //     $("#form :input").prop("disabled", false);
    //     templateObject.record.set(record);
    //     if (templateObject.record.get()) {
    //         Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblDepositEntryLine', function (error, result) {
    //             if (error) {


    //             } else {
    //                 if (result) {
    //                     for (let i = 0; i < result.customFields.length; i++) {
    //                         let customcolumn = result.customFields;
    //                         let columData = customcolumn[i].label;
    //                         let columHeaderUpdate = customcolumn[i].thclass;
    //                         let hiddenColumn = customcolumn[i].hidden;
    //                         let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
    //                         let columnWidth = customcolumn[i].width;

    //                         $("" + columHeaderUpdate + "").html(columData);
    //                         if (columnWidth !== 0) {
    //                             $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
    //                         }
    //                         if (hiddenColumn === true) {
    //                             $("." + columnClass + "").addClass('hiddenColumn');
    //                             $("." + columnClass + "").removeClass('showColumn');
    //                             $(".chk" + columnClass + "").removeAttr('checked');
    //                         } else if (hiddenColumn === false) {
    //                             $("." + columnClass + "").removeClass('hiddenColumn');
    //                             $("." + columnClass + "").addClass('showColumn');
    //                             $(".chk" + columnClass + "").attr('checked', 'checked');
    //                         }

    //                     }
    //                 }

    //             }
    //         });
    //     }


    //     setTimeout(function () {
    //         $('#sltAccountName').trigger("click");
    //     }, 200);

    // }

    let table;
    // $(document).ready(function () {

    //     $('#addRow').on('click', function () {
    //         let recordTempData = templateObject.record.get();
    //         let tokenid = Random.id();
    //         recordTempData.LineItems.push({
    //             accountname: "",
    //             accountno: "",
    //             companyname: "",
    //             id: "",
    //             lineamount: 0,
    //             memo: "",
    //             paymentmethod: "",
    //             lineID: tokenid,
    //         });
    //         templateObject.record.set(recordTempData);
    //     });

    // });


    // $(document).on("click", "#tblAccountListPop tbody tr", function(e) {
    //     var table = $(this);
    //     let isHeader = table.find(".isHeader").text() == "true";
    //     if (isHeader) {
    //         swal({
    //             title: 'This account is header',
    //             text: "You can't do anything on this account",
    //             type: 'info',
    //             showCancelButton: false,
    //             confirmButtonText: 'OK'
    //             }).then((result) => {
    //                 return;
    //             });
    //         return;
    //     }
    //     $(".colAccount").removeClass('boldtablealertsborder');
    //     let selectLineID = $('#selectLineID').val();
    //     let taxcodeList = templateObject.taxraterecords.get();
    //     let utilityService = new UtilityService();
    //     let $tblrows = $("#tblDepositEntryLine tbody tr");

    //     if(selectLineID){
    //         let lineaccountname = table.find(".colAccountName").text();
    //         let lineAccoutNo = table.find(".accountnumber").text();


    //         $('#'+selectLineID+" .lineAccountName").val(lineaccountname);
    //         $('#accountListModal').modal('toggle');

    //           $(".colAccount").removeClass('boldtablealertsborder');
    //     }else{
    //       let accountname = table.find(".colAccountName").text();
    //       $('#accountListModal').modal('toggle');
    //       $('#sltAccountName').val(accountname);
    //       if($tblrows.find(".lineAccountName").val() === ''){
    //           $tblrows.find(".colAccount").addClass('boldtablealertsborder');
    //       }
    //     }

    //     $('#tblAccount_filter .form-control-sm').val('');
    //     setTimeout(function () {
    //         $('.btnRefreshAccount').trigger('click');
    //         $('.fullScreenSpin').css('display', 'none');
    //           // $(".colAccount").removeClass('boldtablealertsborder');
    //     }, 1000);
    // });

    // $(document).on("click", "#tblCustomerlist tbody tr", function (e) {
    //     let selectCustomerLineID = $('#customerSelectLineID').val();
    //     var table = $(this);
    //     let utilityService = new UtilityService();

    //     if (selectCustomerLineID) {
    //         let lineCompany = table.find(".colCompany").text();

    //         $('#' + selectCustomerLineID + " .lineCompany").val(lineCompany);
    //         $('#customerListModal').modal('toggle');

    //     }
    // });

    // $(document).on("click", "#paymentmethodList tbody tr", function (e) {
    //     let selectPaymentLineID = $('#selectPaymentMethodLineID').val();

    //     var table = $(this);
    //     let utilityService = new UtilityService();

    //     if (selectPaymentLineID) {
    //         let linePaymentMethod = table.find(".colName").text();

    //         $('#' + selectPaymentLineID + " .linePaymentMethod").val(linePaymentMethod);
    //         $('#paymentMethodModal').modal('toggle');

    //     }
    // });


    $(document).on("click", "#tblTaxRate tbody tr", function (e) {
        let selectLineID = $('#selectLineID').val();
        let taxcodeList = templateObject.taxraterecords.get();
        var table = $(this);
        let utilityService = new UtilityService();
        let $tblrows = $("#tblDepositEntryLine tbody tr");

        if (selectLineID) {
            let lineTaxCode = table.find(".taxName").text();
            let lineTaxRate = table.find(".taxRate").text();
            let lineAmount = 0;
            let subGrandTotal = 0;
            let taxGrandTotal = 0;

            $('#' + selectLineID + " .lineTaxRate").text(lineTaxRate || 0);
            $('#' + selectLineID + " .lineTaxCode").text(lineTaxCode);


            $('#taxRateListModal').modal('toggle');
            $tblrows.each(function (index) {
                var $tblrow = $(this);
                var amount = $tblrow.find(".colAmount").text() || 0;
                var taxcode = $tblrow.find(".lineTaxCode").text() || '';

                var taxrateamount = 0;
                if (taxcodeList) {
                    for (var i = 0; i < taxcodeList.length; i++) {
                        if (taxcodeList[i].codename === taxcode) {

                            taxrateamount = taxcodeList[i].coderate;

                        }
                    }
                }


                var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
                if ((taxrateamount === '') || (taxrateamount === ' ')) {
                    var taxTotal = 0;
                } else {
                    var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                }

                if (!isNaN(subTotal)) {
                    $tblrow.find('.colAmount').text(Currency + '' + subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }));
                    subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                    document.getElementById("subtotal_total").innerHTML = Currency + '' + subGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });
                }

                if (!isNaN(taxTotal)) {
                    taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
                    document.getElementById("subtotal_tax").innerHTML = Currency + '' + taxGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });
                }

                if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                    let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                    document.getElementById("grandTotal").innerHTML = Currency + '' + GrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });
                    document.getElementById("balanceDue").innerHTML = Currency + '' + GrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });
                    document.getElementById("totalBalanceDue").innerHTML = Currency + '' + GrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });

                }
            });
        }
    });
    
});
Template.depositcard_temp.onRendered(function () {
    let templateObject = Template.instance();
    let utilityService = new UtilityService();
    let productService = new ProductService();
    let accountService = new AccountService();
    let purchaseService = new PurchaseBoardService();
    let tableProductList;
    var splashArrayProductList = new Array();
    var splashArrayTaxRateList = new Array();
    const taxCodesList = [];
    const accountnamerecords = [];

    templateObject.setOneDepositData = (data) => {

        $('.fullScreenSpin').css('display', 'none');
        let lineItems = [];
        let lineItemObj = {};
        let lineItemsTable = [];
        let lineItemTableObj = {};
        let currencySymbol = Currency;
        let department = data.fields.Lines[0].fields.DeptName;
        let totalDeposit = utilityService.modifynegativeCurrencyFormat(data.fields.Deposit) || 0.00;
        if (data.fields.Lines != null) {
            if (data.fields.Lines.length) {
                for (let i = 0; i < data.fields.Lines.length; i++) {
                    let lineAmount = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.Amount) || 0.00;

                    lineItemObj = {
                        lineID: Random.id(),
                        id: data.fields.Lines[i].fields.ID || '',
                        accountname: data.fields.Lines[i].fields.AccountName || data.fields.AccountName || '',
                        accountno: data.fields.Lines[i].fields.AccountNumber || '',
                        memo: data.fields.Lines[i].fields.ReferenceNo || '',
                        lineamount: lineAmount || 0,
                        companyname: data.fields.Lines[i].fields.CompanyName || '',
                        paymentmethod: data.fields.Lines[i].fields.PaymentMethod || ''

                    };


                    lineItems.push(lineItemObj);
                }
            }
        }

        let record = {
            id: data.fields.ID,
            lid: 'Edit Deposit' + ' ' + data.fields.ID,
            accountname: data.fields.AccountName || '',
            memo: data.fields.Notes,
            department: department,
            entryno: data.fields.ID,
            deposittotal: totalDeposit || 0.00,
            transdate: data.fields.DepositDate ? moment(data.fields.DepositDate).format('DD/MM/YYYY') : "",
            LineItems: lineItems,
            isReconciled: data.fields.Reconciled
        };
        if (data.fields.Reconciled) {
            $(".btnDeleteDepositEntry").prop("disabled", true);
            $(".btnDelete").prop("disabled", true);
            $(".btnSave").prop("disabled", true);
            $("#form :input").prop("disabled", true);
            $(".btn-light").prop("disabled", false);
            $(".close").prop("disabled", false);
        }


        $(".printConfirm").prop("disabled", false);
        $(".btnBack").prop("disabled", false);
        templateObject.record.set(record);

        $('#sltAccountName').val(data.fields.AccountName);

        if (templateObject.record.get()) {
            Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblDepositEntryLine', function (error, result) {
                if (error) {


                } else {
                    if (result) {
                        for (let i = 0; i < result.customFields.length; i++) {
                            let customcolumn = result.customFields;
                            let columData = customcolumn[i].label;
                            let columHeaderUpdate = customcolumn[i].thclass;
                            let hiddenColumn = customcolumn[i].hidden;
                            let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
                            let columnWidth = customcolumn[i].width;


                            $("" + columHeaderUpdate + "").html(columData);
                            if (columnWidth !== 0) {
                                $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
                            }

                            if (hiddenColumn === true) {

                                $("." + columnClass + "").addClass('hiddenColumn');
                                $("." + columnClass + "").removeClass('showColumn');
                                $(".chk" + columnClass + "").removeAttr('checked');
                            } else if (hiddenColumn === false) {
                                $("." + columnClass + "").removeClass('hiddenColumn');
                                $("." + columnClass + "").addClass('showColumn');
                                $(".chk" + columnClass + "").attr('checked', 'checked');

                            }

                        }
                    }

                }
            });
        }
        return {record: record, attachmentCount: templateObject.attachmentCount.get(), uploadedFiles: templateObject.uploadedFiles.get(), selectedCurrency: record.currency}

    }

    templateObject.saveDeposite = (data) => {

        playSaveAudio();
        let templateObject = Template.instance();
        let purchaseService = new PurchaseBoardService();
        let uploadedItems = templateObject.uploadedFiles.get();
        setTimeout(function () {

            let account = $('#sltAccountName').val();
            let depositTotal = $('#depositTotal').val();
            let depositTotalLine = $('#depositTotalLine').text();
            let txaNotes = $('#txaNotes').val();

            if (account === '') {
                swal('Account has not been selected!', '', 'warning');
                e.preventDefault();
            } else {
                if ($('#depositTotalLine').val().replace(/[^0-9.-]+/g, "") !== $('#depositTotalLine').text().replace(/[^0-9.-]+/g, "")) {

                    swal({
                        title: 'Total Deposit does not equal Total Deposited!',
                        text: 'Do You Wish To Update Deposit Total?',
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            $('.fullScreenSpin').css('display', 'inline-block');
                            var splashLineArray = [];
                            let lineItemsForm = [];
                            let lineItemObjForm = {};
                            let tdtaxCode = "";

                            var transdateTime = new Date($("#dtTransDate").datepicker("getDate"));
                            let transDate = transdateTime.getFullYear() + "-" + (transdateTime.getMonth() + 1) + "-" + transdateTime.getDate();
                            let entryNo = $('#edtEnrtyNo').val();

                            var url = FlowRouter.current().path;
                            var getso_id = url.split('?id=');
                            var currentDeposit = getso_id[getso_id.length - 1];

                            var objDetails = '';
                            if (getso_id[1]) {
                                $('#tblDepositEntryLine > tbody > tr').each(function () {
                                    var lineID = this.id;
                                    let tdaccount = $('#' + lineID + " .lineAccountName").val() || $('#sltAccountName').val();
                                    let tdpaymentmethod = $('#' + lineID + " .linePaymentMethod").val();
                                    let tddmemo = $('#' + lineID + " .colReference").text();
                                    let tdcompany = $('#' + lineID + " .lineCompany").val();
                                    let tdamount = $('#' + lineID + " .colAmount").val();
                                    let erpLineID = $('#' + lineID + " .lineAccountName").attr('lineid');

                                    if (tdaccount !== "") {
                                        lineItemObjForm = {
                                            type: "TBankDepositLines",
                                            fields:
                                            {
                                                ID: parseInt(erpLineID) || 0,
                                                AccountName: tdaccount || '',
                                                Amount: parseFloat(tdamount.replace(/[^0-9.-]+/g, "")) || 0,
                                                FromDeposited: true,
                                                ReferenceNo: tddmemo || txaNotes,
                                                CompanyName: tdcompany || '',
                                                Contact: false,
                                                Customer: true,
                                                Deleted: false,
                                                Deposited: false,
                                                PaymentMethod: tdpaymentmethod || "Cash",
                                                TransClassName: "Default",
                                                TrnsType: "Deposit Entry"
                                            }
                                        };
                                        lineItemsForm.push(lineItemObjForm);
                                        splashLineArray.push(lineItemObjForm);
                                    }
                                });
                                currentDeposit = parseInt(currentDeposit);
                                objDetails = {
                                    type: "TVS1BankDeposit",
                                    fields: {
                                        ID: currentDeposit,
                                        AccountName: account || '',
                                        Deleted: false,
                                        Deposit: parseFloat(depositTotalLine.replace(/[^0-9.-]+/g, "")) || 0,
                                        DepositClassName: "Default",
                                        Lines: splashLineArray,
                                        DepositDate: transDate,
                                        Notes: txaNotes
                                    }
                                };
                            } else {
                                $('#tblDepositEntryLine > tbody > tr').each(function () {
                                    var lineID = this.id;
                                    let tdaccount = $('#' + lineID + " .lineAccountName").val() || $('#sltAccountName').val();
                                    let tdpaymentmethod = $('#' + lineID + " .linePaymentMethod").val();
                                    let tddmemo = $('#' + lineID + " .colReference").text();
                                    let tdcompany = $('#' + lineID + " .lineCompany").val();
                                    let tdamount = $('#' + lineID + " .colAmount").val();
                                    let erpLineID = $('#' + lineID + " .lineAccountName").attr('lineid');

                                    if (tdaccount !== "") {
                                        lineItemObjForm = {
                                            type: "TBankDepositLines",
                                            fields:
                                            {

                                                AccountName: tdaccount || '',
                                                Amount: parseFloat(tdamount.replace(/[^0-9.-]+/g, "")) || 0,
                                                FromDeposited: true,
                                                ReferenceNo: tddmemo || txaNotes,
                                                CompanyName: tdcompany || '',
                                                Contact: false,
                                                Customer: true,
                                                Deleted: false,
                                                Deposited: false,
                                                PaymentMethod: tdpaymentmethod || "Cash",
                                                TransClassName: "Default",
                                                TrnsType: "Deposit Entry"
                                            }
                                        };
                                        lineItemsForm.push(lineItemObjForm);
                                        splashLineArray.push(lineItemObjForm);
                                    }
                                });
                                objDetails = {
                                    type: "TVS1BankDeposit",
                                    fields: {
                                        AccountName: account || '',
                                        Deleted: false,
                                        Deposit: parseFloat(depositTotalLine.replace(/[^0-9.-]+/g, "")) || 0,
                                        DepositClassName: "Default",
                                        Lines: splashLineArray,
                                        DepositDate: transDate,
                                        Notes: txaNotes
                                    }
                                };
                            }

                            if (splashLineArray.length > 0) {

                            } else {
                                swal('From account has not been selected!', '', 'warning');
                                $('.fullScreenSpin').css('display', 'none');
                                event.preventDefault();
                                return false;
                            };

                            purchaseService.saveBankDeposit(objDetails).then(function (objDetails) {
                                if (localStorage.getItem("enteredURL") != null) {
                                    FlowRouter.go(localStorage.getItem("enteredURL"));
                                    localStorage.removeItem("enteredURL");
                                    return;
                                }

                                FlowRouter.go('/depositlist?success=true');
                                $('.modal-backdrop').css('display', 'none');


                            }).catch(function (err) {
                                swal({
                                    title: 'Oooops...',
                                    text: err,
                                    type: 'error',
                                    showCancelButton: false,
                                    confirmButtonText: 'Try Again'
                                }).then((result) => {
                                    if (result.value) { if (err === checkResponseError) { window.open('/', '_self'); } }
                                    else if (result.dismiss === 'cancel') {

                                    }
                                });

                                $('.fullScreenSpin').css('display', 'none');
                            });
                        } else if (result.dismiss === 'cancel') {
                            $('.fullScreenSpin').css('display', 'none');
                        }
                    });

                } else {
                    $('.fullScreenSpin').css('display', 'inline-block');
                    var splashLineArray = new Array();
                    let lineItemsForm = [];
                    let lineItemObjForm = {};
                    let tdtaxCode = "";

                    var transdateTime = new Date($("#dtTransDate").datepicker("getDate"));
                    let transDate = transdateTime.getFullYear() + "-" + (transdateTime.getMonth() + 1) + "-" + transdateTime.getDate();
                    let entryNo = $('#edtEnrtyNo').val();

                    var url = FlowRouter.current().path;
                    var getso_id = url.split('?id=');
                    var currentDeposit = getso_id[getso_id.length - 1];

                    var objDetails = '';
                    if (getso_id[1]) {
                        $('#tblDepositEntryLine > tbody > tr').each(function () {
                            var lineID = this.id;
                            let tdaccount = $('#' + lineID + " .lineAccountName").val() || $('#sltAccountName').val();
                            let tdpaymentmethod = $('#' + lineID + " .linePaymentMethod").val();
                            let tddmemo = $('#' + lineID + " .colReference").text();
                            let tdcompany = $('#' + lineID + " .lineCompany").val();
                            let tdamount = $('#' + lineID + " .colAmount").val();
                            let erpLineID = $('#' + lineID + " .lineAccountName").attr('lineid');

                            if (tdaccount != "") {
                                lineItemObjForm = {
                                    type: "TBankDepositLines",
                                    fields:
                                    {
                                        ID: parseInt(erpLineID) || 0,
                                        AccountName: tdaccount || '',
                                        Amount: parseFloat(tdamount.replace(/[^0-9.-]+/g, "")) || 0,
                                        FromDeposited: true,
                                        ReferenceNo: tddmemo || txaNotes,
                                        CompanyName: tdcompany || '',
                                        Contact: false,
                                        Customer: true,
                                        Deleted: false,
                                        Deposited: false,
                                        PaymentMethod: tdpaymentmethod || "Cash",
                                        TransClassName: "Default",
                                        TrnsType: "Deposit Entry"
                                    }
                                };
                                lineItemsForm.push(lineItemObjForm);
                                splashLineArray.push(lineItemObjForm);
                            }
                        });
                        currentDeposit = parseInt(currentDeposit);
                        objDetails = {
                            type: "TVS1BankDeposit",
                            fields: {
                                ID: currentDeposit,
                                AccountName: account || '',
                                Deleted: false,
                                Deposit: parseFloat(depositTotalLine.replace(/[^0-9.-]+/g, "")) || 0,
                                DepositClassName: "Default",
                                Lines: splashLineArray,
                                DepositDate: transDate,
                                Notes: txaNotes
                            }
                        };
                    } else {
                        $('#tblDepositEntryLine > tbody > tr').each(function () {
                            var lineID = this.id;
                            let tdaccount = $('#' + lineID + " .lineAccountName").val() || $('#sltAccountName').val();
                            let tdpaymentmethod = $('#' + lineID + " .linePaymentMethod").val();
                            let tddmemo = $('#' + lineID + " .colReference").text();
                            let tdcompany = $('#' + lineID + " .lineCompany").val();
                            let tdamount = $('#' + lineID + " .colAmount").val();
                            let erpLineID = $('#' + lineID + " .lineAccountName").attr('lineid');

                            if (tdaccount != "") {
                                lineItemObjForm = {
                                    type: "TBankDepositLines",
                                    fields:
                                    {

                                        AccountName: tdaccount || '',
                                        Amount: parseFloat(tdamount.replace(/[^0-9.-]+/g, "")) || 0,
                                        FromDeposited: true,
                                        ReferenceNo: tddmemo || txaNotes,
                                        CompanyName: tdcompany || '',
                                        Contact: false,
                                        Customer: true,
                                        Deleted: false,
                                        Deposited: false,
                                        PaymentMethod: tdpaymentmethod || "Cash",
                                        TransClassName: "Default",
                                        TrnsType: "Deposit Entry"
                                    }
                                };
                                lineItemsForm.push(lineItemObjForm);
                                splashLineArray.push(lineItemObjForm);
                            }
                        });
                        objDetails = {
                            type: "TVS1BankDeposit",
                            fields: {
                                AccountName: account || '',
                                Deleted: false,
                                Deposit: parseFloat(depositTotalLine.replace(/[^0-9.-]+/g, "")) || 0,
                                DepositClassName: "Default",
                                Lines: splashLineArray,
                                DepositDate: transDate,
                                Notes: txaNotes
                            }
                        };
                    }

                    if (splashLineArray.length > 0) {

                    } else {
                        swal('From account has not been selected!', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                        event.preventDefault();
                        return false;
                    };
                    purchaseService.saveBankDeposit(objDetails).then(function (objDetails) {
                        FlowRouter.go('/depositlist?success=true');
                        $('.modal-backdrop').css('display', 'none');


                    }).catch(function (err) {
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) { if (err === checkResponseError) { window.open('/', '_self'); } }
                            else if (result.dismiss === 'cancel') {

                            }
                        });

                        $('.fullScreenSpin').css('display', 'none');
                    });
                }


            }
        }, delayTimeAfterSound);

    }

});
Template.depositcard_temp.helpers({
    oneExAPIName: function () {
        let purchaseBoardService = new PurchaseBoardService();
        return purchaseBoardService.getOneDepositEnrtyData;
    },

    service: () => {
        let purchaseBoardService = new PurchaseBoardService();
        return purchaseBoardService;
    },

    listapiservice: function () {
        return sideBarService
    },

    listapifunction: function () {
        return sideBarService.getAllTBankDepositListData
    },

    setTransData: () => {
        let templateObject = Template.instance();
        return function (data) {
            let dataReturn = templateObject.setOneDepositData(data)
            return dataReturn;
        }
    },

    initialRecords: () => {
        let templateObject = Template.instance();
        return function (data) {
            let dataReturn = templateObject.initialRecords(data)
            return dataReturn
        }
    },

    headerfields: () => {
        return Template.instance().headerfields.get()
    },

    headerbuttons: () => {
        return Template.instance().headerbuttons.get()
    },

    gridfields: () => {
        return Template.instance().gridfields.get();
    },
    printOptions: () => {
        return Template.instance().printOptions.get()
    },

    footerFields: function () {
        return Template.instance().tranasctionfooterfields.get()
    },

    saveTransaction: function () {
        let templateObject = Template.instance();
        return function (data) {
            templateObject.saveDeposite(data)
        }
    },
    getTemplateList: function () {
        return template_list;
    },
    getTemplateNumber: function () {
        let template_numbers = ["1", "2", "3"];
        return template_numbers;
    },
    record: () => {
        return Template.instance().record.get();
    },

    customerRecord: () => {
        return Template.instance().customerRecord.get();
    },

    deptrecords: () => {
        return Template.instance().deptrecords.get().sort(function (a, b) {
            if (a.department == 'NA') {
                return 1;
            }
            else if (b.department == 'NA') {
                return -1;
            }
            return (a.department.toUpperCase() > b.department.toUpperCase()) ? 1 : -1;
        });
    },
    











    termrecords: () => {
        return Template.instance().termrecords.get().sort(function (a, b) {
            if (a.termsname == 'NA') {
                return 1;
            }
            else if (b.termsname == 'NA') {
                return -1;
            }
            return (a.termsname.toUpperCase() > b.termsname.toUpperCase()) ? 1 : -1;
        });
    },
    accountnamerecords: () => {
        return Template.instance().accountnamerecords.get().sort(function (a, b) {
            if (a.accountname == 'NA') {
                return 1;
            }
            else if (b.accountname == 'NA') {
                return -1;
            }
            return (a.accountname.toUpperCase() > b.accountname.toUpperCase()) ? 1 : -1;
        });
    },
    purchaseCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: localStorage.getItem('mycloudLogonID'), PrefName: 'depositcard' });
    },
    purchaseCloudGridPreferenceRec: () => {
        return CloudPreference.findOne({ userid: localStorage.getItem('mycloudLogonID'), PrefName: 'tblDepositEntryLine' });
    },
    uploadedFiles: () => {
        return Template.instance().uploadedFiles.get();
    },
    attachmentCount: () => {
        return Template.instance().attachmentCount.get();
    },
    uploadedFile: () => {
        return Template.instance().uploadedFile.get();
    },
    statusrecords: () => {
        return Template.instance().statusrecords.get().sort(function (a, b) {
            if (a.orderstatus == 'NA') {
                return 1;
            }
            else if (b.orderstatus == 'NA') {
                return -1;
            }
            return (a.orderstatus.toUpperCase() > b.orderstatus.toUpperCase()) ? 1 : -1;
        });
    },
    totalCredit: () => {
        return Template.instance().totalCredit.get();
    },
    totalDebit: () => {
        return Template.instance().totalDebit.get();
    },
    companyaddress1: () => {
        return localStorage.getItem('vs1companyaddress1');
    },
    companyaddress2: () => {
        return localStorage.getItem('vs1companyaddress2');
    },
    city: () => {
        return localStorage.getItem('vs1companyCity');
    },
    state: () => {
        return localStorage.getItem('companyState');
    },
    poBox: () => {
        return localStorage.getItem('vs1companyPOBox');
    },
    companyphone: () => {
        return localStorage.getItem('vs1companyPhone');
    },
    companyabn: () => {
        return localStorage.getItem('vs1companyABN');
    },
    organizationname: () => {
        return localStorage.getItem('vs1companyName');
    },
    organizationurl: () => {
        return localStorage.getItem('vs1companyURL');
    },
    isMobileDevices: () => {
        var isMobile = false;

        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
            isMobile = true;
        }

        return isMobile;
    },
    datatablepaymentlistrecords: () => {
        return Template.instance().datatablepaymentlistrecords.get().sort(function (a, b) {
            if (a.paymentmethodname == 'NA') {
                return 1;
            }
            else if (b.paymentmethodname == 'NA') {
                return -1;
            }
            return (a.paymentmethodname.toUpperCase() > b.paymentmethodname.toUpperCase()) ? 1 : -1;
        });
    },

    addString: function (arg1, arg2) {
        return `${arg1}${arg2}`
    }
});

Template.depositcard_temp.events({
    // 'click input.basedOnSettings': function (event) {
    //     if (event.target.id == "basedOnEvent") {
    //         const value = $(event.target).prop('checked');
    //         if (value) {
    //             $('#onEventSettings').css('display', 'block');
    //             $('#settingsOnEvents').prop('checked', true);
    //         } else {
    //             $('#onEventSettings').css('display', 'none');
    //             $('#settingsOnEvents').prop('checked', false);
    //             $('#settingsOnLogout').prop('checked', false);
    //         }
    //     } else if (event.target.id == 'basedOnFrequency') {
    //         const value = $(event.target).prop('checked');
    //         if(value) {
    //             $('#edtFrequencyDetail').css('display', 'flex');
    //             $('#basedOnSettingsTitle').css('border-top-width', '1px');
    //         }else {
    //             $('#edtFrequencyDetail').css('display', 'none');
    //             $('#basedOnSettingsTitle').css('border-top-width', '0px');
    //         }
    //     }
    //   },
    // 'click input[name="frequencyRadio"]': function (event) {
    //     if (event.target.id == "frequencyMonthly") {
    //         document.getElementById("monthlySettings").style.display = "block";
    //         document.getElementById("weeklySettings").style.display = "none";
    //         document.getElementById("dailySettings").style.display = "none";
    //         document.getElementById("oneTimeOnlySettings").style.display = "none";
    //     } else if (event.target.id == "frequencyWeekly") {
    //         document.getElementById("weeklySettings").style.display = "block";
    //         document.getElementById("monthlySettings").style.display = "none";
    //         document.getElementById("dailySettings").style.display = "none";
    //         document.getElementById("oneTimeOnlySettings").style.display = "none";
    //     } else if (event.target.id == "frequencyDaily") {
    //         document.getElementById("dailySettings").style.display = "block";
    //         document.getElementById("monthlySettings").style.display = "none";
    //         document.getElementById("weeklySettings").style.display = "none";
    //         document.getElementById("oneTimeOnlySettings").style.display = "none";
    //     } else if (event.target.id == "frequencyOnetimeonly") {
    //         document.getElementById("oneTimeOnlySettings").style.display = "block";
    //         document.getElementById("monthlySettings").style.display = "none";
    //         document.getElementById("weeklySettings").style.display = "none";
    //         document.getElementById("dailySettings").style.display = "none";
    //     } else {
    //         $("#copyFrequencyModal").modal('toggle');
    //     }
    // },
    // 'click input[name="settingsMonthlyRadio"]': function (event) {
    //     if (event.target.id == "settingsMonthlyEvery") {
    //         $('.settingsMonthlyEveryOccurence').attr('disabled', false);
    //         $('.settingsMonthlyDayOfWeek').attr('disabled', false);
    //         $('.settingsMonthlySpecDay').attr('disabled', true);
    //     } else if (event.target.id == "settingsMonthlyDay") {
    //         $('.settingsMonthlySpecDay').attr('disabled', false);
    //         $('.settingsMonthlyEveryOccurence').attr('disabled', true);
    //         $('.settingsMonthlyDayOfWeek').attr('disabled', true);
    //     } else {
    //         $("#frequencyModal").modal('toggle');
    //     }
    // },
    // 'click input[name="dailyRadio"]': function (event) {
    //     if (event.target.id == "dailyEveryDay") {
    //         $('.dailyEveryXDays').attr('disabled', true);
    //     } else if (event.target.id == "dailyWeekdays") {
    //         $('.dailyEveryXDays').attr('disabled', true);
    //     } else if (event.target.id == "dailyEvery") {
    //         $('.dailyEveryXDays').attr('disabled', false);
    //     } else {
    //         $("#frequencyModal").modal('toggle');
    //     }
    // },
    'click #copyDeposit': async function (event) {
        playCopyAudio();
        let templateObject = Template.instance();
        let purchaseService = new PurchaseBoardService();
        let i = 0;
        setTimeout(async function () {
            $("#basedOnFrequency").prop('checked', true);
            $('#edtFrequencyDetail').css('display', 'flex');
            $(".ofMonthList input[type=checkbox]").each(function () {
                $(this).prop('checked', false);
            });
            $(".selectDays input[type=checkbox]").each(function () {
                $(this).prop('checked', false);
            });
            // var url = FlowRouter.current().path;
            // var getso_id = url.split("?id=");
            // var currentInvoice = getso_id[getso_id.length - 1];
            // if (getso_id[1]) {
            //     currentInvoice = parseInt(currentInvoice);
            //     var depositEntryData = await purchaseService.getOneDepositEnrtyData(currentInvoice);
            //     var selectedType = depositEntryData.fields.TypeOfBasedOn;
            //     var frequencyVal = depositEntryData.fields.FrequenctyValues;
            //     var startDate = depositEntryData.fields.CopyStartDate;
            //     var finishDate = depositEntryData.fields.CopyFinishDate;
            //     var subStartDate = startDate.substring(0, 10);
            //     var subFinishDate = finishDate.substring(0, 10);
            //     var convertedStartDate = subStartDate ? subStartDate.split('-')[2] + '/' + subStartDate.split('-')[1] + '/' + subStartDate.split('-')[0] : '';
            //     var convertedFinishDate = subFinishDate ? subFinishDate.split('-')[2] + '/' + subFinishDate.split('-')[1] + '/' + subFinishDate.split('-')[0] : '';
            //     var arrFrequencyVal = frequencyVal.split("@");
            //     var radioFrequency = arrFrequencyVal[0];
            //     $("#" + radioFrequency).prop('checked', true);
            //     if (radioFrequency == "frequencyMonthly") {
            //     document.getElementById("monthlySettings").style.display = "block";
            //     document.getElementById("weeklySettings").style.display = "none";
            //     document.getElementById("dailySettings").style.display = "none";
            //     document.getElementById("oneTimeOnlySettings").style.display = "none";
            //     var monthDate = arrFrequencyVal[1];
            //     $("#sltDay").val('day' + monthDate);
            //     var ofMonths = arrFrequencyVal[2];
            //     var arrOfMonths = [];
            //     if (ofMonths != "" && ofMonths != undefined && ofMonths != null)
            //         arrOfMonths = ofMonths.split(",");
            //     for (i=0; i<arrOfMonths.length; i++) {
            //         $("#formCheck-" + arrOfMonths[i]).prop('checked', true);
            //     }
            //     $('#edtMonthlyStartDate').val(convertedStartDate);
            //     $('#edtMonthlyFinishDate').val(convertedFinishDate);
            //     } else if (radioFrequency == "frequencyWeekly") {
            //     document.getElementById("weeklySettings").style.display = "block";
            //     document.getElementById("monthlySettings").style.display = "none";
            //     document.getElementById("dailySettings").style.display = "none";
            //     document.getElementById("oneTimeOnlySettings").style.display = "none";
            //     var everyWeeks = arrFrequencyVal[1];
            //     $("#weeklyEveryXWeeks").val(everyWeeks);
            //     var selectDays = arrFrequencyVal[2];
            //     var arrSelectDays = selectDays.split(",");
            //     for (i=0; i<arrSelectDays.length; i++) {
            //         if (parseInt(arrSelectDays[i]) == 0)
            //         $("#formCheck-sunday").prop('checked', true);
            //         if (parseInt(arrSelectDays[i]) == 1)
            //         $("#formCheck-monday").prop('checked', true);
            //         if (parseInt(arrSelectDays[i]) == 2)
            //         $("#formCheck-tuesday").prop('checked', true);
            //         if (parseInt(arrSelectDays[i]) == 3)
            //         $("#formCheck-wednesday").prop('checked', true);
            //         if (parseInt(arrSelectDays[i]) == 4)
            //         $("#formCheck-thursday").prop('checked', true);
            //         if (parseInt(arrSelectDays[i]) == 5)
            //         $("#formCheck-friday").prop('checked', true);
            //         if (parseInt(arrSelectDays[i]) == 6)
            //         $("#formCheck-saturday").prop('checked', true);
            //     }
            //     $('#edtWeeklyStartDate').val(convertedStartDate);
            //     $('#edtWeeklyFinishDate').val(convertedFinishDate);
            //     } else if (radioFrequency == "frequencyDaily") {
            //     document.getElementById("dailySettings").style.display = "block";
            //     document.getElementById("monthlySettings").style.display = "none";
            //     document.getElementById("weeklySettings").style.display = "none";
            //     document.getElementById("oneTimeOnlySettings").style.display = "none";
            //     var dailyRadioOption = arrFrequencyVal[1];
            //     $("#" + dailyRadioOption).prop('checked', true);
            //     var everyDays = arrFrequencyVal[2];
            //     $("#dailyEveryXDays").val(everyDays);
            //     $('#edtDailyStartDate').val(convertedStartDate);
            //     $('#edtDailyFinishDate').val(convertedFinishDate);
            //     } else if (radioFrequency == "frequencyOnetimeonly") {
            //     document.getElementById("oneTimeOnlySettings").style.display = "block";
            //     document.getElementById("monthlySettings").style.display = "none";
            //     document.getElementById("weeklySettings").style.display = "none";
            //     document.getElementById("dailySettings").style.display = "none";
            //     $('#edtOneTimeOnlyDate').val(convertedStartDate);
            //     $('#edtOneTimeOnlyTimeError').css('display', 'none');
            //     $('#edtOneTimeOnlyDateError').css('display', 'none');
            //     }
            // }
            $("#copyFrequencyModal").modal("toggle");
        }, delayTimeAfterSound);
    },
    'click .btnSaveFrequency': async function () {
        playSaveAudio();
        let templateObject = Template.instance();
        let purchaseService = new PurchaseBoardService();
        // let selectedType = '';
        let selectedType = "basedOnFrequency";
        let frequencyVal = '';
        let startDate = '';
        let finishDate = '';
        let convertedStartDate = '';
        let convertedFinishDate = '';
        let sDate = '';
        let fDate = '';
        let monthDate = '';
        let ofMonths = '';
        let isFirst = true;
        let everyWeeks = '';
        let selectDays = '';
        let dailyRadioOption = '';
        let everyDays = '';

        // const basedOnTypes = $('#basedOnSettings input.basedOnSettings');
        let basedOnTypeTexts = '';
        // let basedOnTypeAttr = '';
        let basedOnTypeAttr = 'F,';
        var erpGet = erpDb();
        let sDate2 = '';
        let fDate2 = '';
        setTimeout(async function () {
            //   basedOnTypes.each(function () {
            //     if ($(this).prop('checked')) {
            //       selectedType = $(this).attr('id');
            //       if (selectedType === "basedOnFrequency") { basedOnTypeAttr += 'F,'}
            //       if (selectedType === "basedOnPrint") { basedOnTypeTexts += 'On Print, '; basedOnTypeAttr += 'P,'; }
            //       if (selectedType === "basedOnSave") { basedOnTypeTexts += 'On Save, '; basedOnTypeAttr += 'S,'; }
            //       if (selectedType === "basedOnTransactionDate") { basedOnTypeTexts += 'On Transaction Date, '; basedOnTypeAttr += 'T,'; }
            //       if (selectedType === "basedOnDueDate") { basedOnTypeTexts += 'On Due Date, '; basedOnTypeAttr += 'D,'; }
            //       if (selectedType === "basedOnOutstanding") { basedOnTypeTexts += 'If Outstanding, '; basedOnTypeAttr += 'O,'; }
            //       if (selectedType === "basedOnEvent") {
            //         if ($('#settingsOnEvents').prop('checked')) { basedOnTypeTexts += 'On Event(On Logon), '; basedOnTypeAttr += 'EN,'; }
            //         if ($('#settingsOnLogout').prop('checked')) { basedOnTypeTexts += 'On Event(On Logout), '; basedOnTypeAttr += 'EU,'; }
            //       }
            //     }
            //   });
            //   if (basedOnTypeTexts != '') basedOnTypeTexts = basedOnTypeTexts.slice(0, -2);
            //   if (basedOnTypeAttr != '') basedOnTypeAttr = basedOnTypeAttr.slice(0, -1);

            let formId = parseInt($("#formid").val());
            let radioFrequency = $('input[type=radio][name=frequencyRadio]:checked').attr('id');
            frequencyVal = radioFrequency + '@';
            const values = basedOnTypeAttr.split(',');
            if (values.includes('F')) {
                if (radioFrequency == "frequencyMonthly") {
                    isFirst = true;
                    monthDate = $("#sltDay").val().replace('day', '');
                    $(".ofMonthList input[type=checkbox]:checked").each(function () {
                        ofMonths += isFirst ? $(this).val() : ',' + $(this).val();
                        isFirst = false;
                    });
                    startDate = $('#edtMonthlyStartDate').val();
                    finishDate = $('#edtMonthlyFinishDate').val();
                    frequencyVal += monthDate + '@' + ofMonths;
                } else if (radioFrequency == "frequencyWeekly") {
                    isFirst = true;
                    everyWeeks = $("#weeklyEveryXWeeks").val();
                    let sDay = -1;
                    $(".selectDays input[type=checkbox]:checked").each(function () {
                        sDay = templateObject.getDayNumber($(this).val());
                        selectDays += isFirst ? sDay : ',' + sDay;
                        isFirst = false;
                    });
                    startDate = $('#edtWeeklyStartDate').val();
                    finishDate = $('#edtWeeklyFinishDate').val();
                    frequencyVal += everyWeeks + '@' + selectDays;
                } else if (radioFrequency == "frequencyDaily") {
                    dailyRadioOption = $('#dailySettings input[type=radio]:checked').attr('id');
                    everyDays = $("#dailyEveryXDays").val();
                    startDate = $('#edtDailyStartDate').val();
                    finishDate = $('#edtDailyFinishDate').val();
                    frequencyVal += dailyRadioOption + '@' + everyDays;
                } else if (radioFrequency == "frequencyOnetimeonly") {
                    startDate = $('#edtOneTimeOnlyDate').val();
                    finishDate = $('#edtOneTimeOnlyDate').val();
                    $('#edtOneTimeOnlyTimeError').css('display', 'none');
                    $('#edtOneTimeOnlyDateError').css('display', 'none');
                    frequencyVal = radioFrequency;
                }
            }
            $('#copyFrequencyModal').modal('toggle');
            convertedStartDate = startDate ? startDate.split('/')[2] + '-' + startDate.split('/')[1] + '-' + startDate.split('/')[0] : '';
            convertedFinishDate = finishDate ? finishDate.split('/')[2] + '-' + finishDate.split('/')[1] + '-' + finishDate.split('/')[0] : '';
            sDate = convertedStartDate ? moment(convertedStartDate + ' ' + copyStartTime).format("YYYY-MM-DD HH:mm") : moment().format("YYYY-MM-DD HH:mm");
            fDate = convertedFinishDate ? moment(convertedFinishDate + ' ' + copyStartTime).format("YYYY-MM-DD HH:mm") : moment().format("YYYY-MM-DD HH:mm");
            sDate2 = convertedStartDate ? moment(convertedStartDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
            fDate2 = convertedFinishDate ? moment(convertedFinishDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
            $(".fullScreenSpin").css("display", "inline-block");
            var url = FlowRouter.current().path;
            if (
                url.indexOf("?id=") > 0
            ) {
                var getso_id = url.split("?id=");
                var currentInvoice = getso_id[getso_id.length - 1];
                if (getso_id[1]) {
                    currentInvoice = parseInt(currentInvoice);
                    //   objDetails = {
                    //     type: "TVS1BankDeposit",
                    //     fields: {
                    //       ID: currentInvoice,
                    //       TypeOfBasedOn: selectedType,
                    //       FrequenctyValues: frequencyVal,
                    //       CopyStartDate: sDate2,
                    //       CopyFinishDate: fDate2,
                    //     }
                    //   };
                    //   var result = await purchaseService.saveBankDeposit(objDetails);
                    let period = ""; // 0
                    let days = [];
                    let i = 0;
                    let frequency2 = 0;
                    let weekdayObj = {
                        saturday: 0,
                        sunday: 0,
                        monday: 0,
                        tuesday: 0,
                        wednesday: 0,
                        thursday: 0,
                        friday: 0,
                    };
                    let repeatMonths = [];
                    let repeatDates = [];
                    if (radioFrequency == "frequencyDaily" || radioFrequency == "frequencyOnetimeonly") {
                        period = "Daily"; // 0
                        if (radioFrequency == "frequencyDaily") {
                            frequency2 = parseInt(everyDays);
                            if (dailyRadioOption == "dailyEveryDay") {
                                for (i = 0; i < 7; i++) {
                                    days.push(i);
                                }
                            }
                            if (dailyRadioOption == "dailyWeekdays") {
                                for (i = 1; i < 6; i++) {
                                    days.push(i);
                                }
                            }
                            if (dailyRadioOption == "dailyEvery") {

                            }
                        } else {
                            repeatDates.push({
                                "Dates": sDate2
                            })
                            frequency2 = 1;
                        }
                    }
                    if (radioFrequency == "frequencyWeekly") {
                        period = "Weekly"; // 1
                        frequency2 = parseInt(everyWeeks);
                        let arrSelectDays = selectDays.split(",");
                        for (i = 0; i < arrSelectDays.length; i++) {
                            days.push(arrSelectDays[i]);
                            if (parseInt(arrSelectDays[i]) == 0)
                                weekdayObj.sunday = 1;
                            if (parseInt(arrSelectDays[i]) == 1)
                                weekdayObj.monday = 1;
                            if (parseInt(arrSelectDays[i]) == 2)
                                weekdayObj.tuesday = 1;
                            if (parseInt(arrSelectDays[i]) == 3)
                                weekdayObj.wednesday = 1;
                            if (parseInt(arrSelectDays[i]) == 4)
                                weekdayObj.thursday = 1;
                            if (parseInt(arrSelectDays[i]) == 5)
                                weekdayObj.friday = 1;
                            if (parseInt(arrSelectDays[i]) == 6)
                                weekdayObj.saturday = 1;
                        }
                    }
                    if (radioFrequency == "frequencyMonthly") {
                        period = "Monthly"; // 0
                        repeatMonths = convertStrMonthToNum(ofMonths);
                        repeatDates = getRepeatDates(sDate2, fDate2, repeatMonths, monthDate);
                        frequency2 = parseInt(monthDate);
                    }
                    if (days.length > 0) {
                        for (let x = 0; x < days.length; x++) {
                            let dayObj = {
                                Name: "VS1_RepeatTrans",
                                Params: {
                                    CloudUserName: erpGet.ERPUsername,
                                    CloudPassword: erpGet.ERPPassword,
                                    TransID: currentInvoice,
                                    TransType: "Deposit",
                                    Repeat_Frequency: frequency2,
                                    Repeat_Period: period,
                                    Repeat_BaseDate: sDate2,
                                    Repeat_finalDateDate: fDate2,
                                    Repeat_Saturday: weekdayObj.saturday,
                                    Repeat_Sunday: weekdayObj.sunday,
                                    Repeat_Monday: weekdayObj.monday,
                                    Repeat_Tuesday: weekdayObj.tuesday,
                                    Repeat_Wednesday: weekdayObj.wednesday,
                                    Repeat_Thursday: weekdayObj.thursday,
                                    Repeat_Friday: weekdayObj.friday,
                                    Repeat_Holiday: 0,
                                    Repeat_Weekday: parseInt(days[x].toString()),
                                    Repeat_MonthOffset: 0,
                                },
                            };
                            var myString = '"JsonIn"' + ":" + JSON.stringify(dayObj);
                            var oPost = new XMLHttpRequest();
                            oPost.open(
                                "POST",
                                URLRequest +
                                erpGet.ERPIPAddress +
                                ":" +
                                erpGet.ERPPort +
                                "/" +
                                'erpapi/VS1_Cloud_Task/Method?Name="VS1_RepeatTrans"',
                                true
                            );
                            oPost.setRequestHeader("database", erpGet.ERPDatabase);
                            oPost.setRequestHeader("username", erpGet.ERPUsername);
                            oPost.setRequestHeader("password", erpGet.ERPPassword);
                            oPost.setRequestHeader("Accept", "application/json");
                            oPost.setRequestHeader("Accept", "application/html");
                            oPost.setRequestHeader("Content-type", "application/json");
                            oPost.send(myString);

                            oPost.onreadystatechange = function () {
                                if (oPost.readyState == 4 && oPost.status == 200) {
                                    var myArrResponse = JSON.parse(oPost.responseText);
                                    var success = myArrResponse.ProcessLog.ResponseStatus.includes("OK");
                                } else if (oPost.readyState == 4 && oPost.status == 403) {

                                } else if (oPost.readyState == 4 && oPost.status == 406) {

                                } else if (oPost.readyState == "") {

                                }
                                $(".fullScreenSpin").css("display", "none");
                            };
                        }
                    } else {
                        let dayObj = {};
                        if (radioFrequency == "frequencyOnetimeonly" || radioFrequency == "frequencyMonthly") {
                            dayObj = {
                                Name: "VS1_RepeatTrans",
                                Params: {
                                    CloudUserName: erpGet.ERPUsername,
                                    CloudPassword: erpGet.ERPPassword,
                                    TransID: currentInvoice,
                                    TransType: "Deposit",
                                    Repeat_Dates: repeatDates,
                                    Repeat_Frequency: frequency2,
                                    Repeat_Period: period,
                                    Repeat_BaseDate: sDate2,
                                    Repeat_finalDateDate: fDate2,
                                    Repeat_Saturday: weekdayObj.saturday,
                                    Repeat_Sunday: weekdayObj.sunday,
                                    Repeat_Monday: weekdayObj.monday,
                                    Repeat_Tuesday: weekdayObj.tuesday,
                                    Repeat_Wednesday: weekdayObj.wednesday,
                                    Repeat_Thursday: weekdayObj.thursday,
                                    Repeat_Friday: weekdayObj.friday,
                                    Repeat_Holiday: 0,
                                    Repeat_Weekday: 0,
                                    Repeat_MonthOffset: 0,
                                },
                            };
                        } else {
                            dayObj = {
                                Name: "VS1_RepeatTrans",
                                Params: {
                                    CloudUserName: erpGet.ERPUsername,
                                    CloudPassword: erpGet.ERPPassword,
                                    TransID: currentInvoice,
                                    TransType: "Deposit",
                                    Repeat_Frequency: frequency2,
                                    Repeat_Period: period,
                                    Repeat_BaseDate: sDate2,
                                    Repeat_finalDateDate: fDate2,
                                    Repeat_Saturday: weekdayObj.saturday,
                                    Repeat_Sunday: weekdayObj.sunday,
                                    Repeat_Monday: weekdayObj.monday,
                                    Repeat_Tuesday: weekdayObj.tuesday,
                                    Repeat_Wednesday: weekdayObj.wednesday,
                                    Repeat_Thursday: weekdayObj.thursday,
                                    Repeat_Friday: weekdayObj.friday,
                                    Repeat_Holiday: 0,
                                    Repeat_Weekday: 0,
                                    Repeat_MonthOffset: 0,
                                },
                            };
                        }
                        var myString = '"JsonIn"' + ":" + JSON.stringify(dayObj);
                        var oPost = new XMLHttpRequest();
                        oPost.open(
                            "POST",
                            URLRequest +
                            erpGet.ERPIPAddress +
                            ":" +
                            erpGet.ERPPort +
                            "/" +
                            'erpapi/VS1_Cloud_Task/Method?Name="VS1_RepeatTrans"',
                            true
                        );
                        oPost.setRequestHeader("database", erpGet.ERPDatabase);
                        oPost.setRequestHeader("username", erpGet.ERPUsername);
                        oPost.setRequestHeader("password", erpGet.ERPPassword);
                        oPost.setRequestHeader("Accept", "application/json");
                        oPost.setRequestHeader("Accept", "application/html");
                        oPost.setRequestHeader("Content-type", "application/json");
                        // let objDataSave = '"JsonIn"' + ':' + JSON.stringify(selectClient);
                        oPost.send(myString);

                        oPost.onreadystatechange = function () {
                            if (oPost.readyState == 4 && oPost.status == 200) {
                                var myArrResponse = JSON.parse(oPost.responseText);
                                var success = myArrResponse.ProcessLog.ResponseStatus.includes("OK");
                            } else if (oPost.readyState == 4 && oPost.status == 403) {

                            } else if (oPost.readyState == 4 && oPost.status == 406) {

                            } else if (oPost.readyState == "") {

                            }
                            $(".fullScreenSpin").css("display", "none");
                        };
                    }
                }
            } else {
                // window.open("/invoicecard", "_self");
            }
            FlowRouter.go('/depositlist?success=true');
            $('.modal-backdrop').css('display', 'none');
        }, delayTimeAfterSound);
    },
    // 'click #edtSupplierName': function (event) {
    //     $('#edtSupplierName').select();
    //     $('#edtSupplierName').editableSelect();
    // },
    'blur .lineCreditEx': function (event) {

        if (!isNaN($(event.target).val())) {
            let inputCreditEx = parseFloat($(event.target).val());
            $(event.target).val(Currency + '' + inputCreditEx.toLocaleString(undefined, { minimumFractionDigits: 2 }));
        } else {
            let inputCreditEx = Number($(event.target).val().replace(/[^0-9.-]+/g, ""));

            $(event.target).val(Currency + '' + inputCreditEx.toLocaleString(undefined, { minimumFractionDigits: 2 }) || Currency + '0');
        }
        let templateObject = Template.instance();
        let taxcodeList = templateObject.taxraterecords.get();
        let utilityService = new UtilityService();

        let inputCredit = parseFloat($(event.target).val()) || 0;
        if (!isNaN($(event.target).val())) {
            $(event.target).val(Currency + '' + inputCredit.toLocaleString(undefined, { minimumFractionDigits: 2 }) || Currency + '0');
        } else {
            let inputCredit = Number($(event.target).val().replace(/[^0-9.-]+/g, ""));

            $(event.target).val(Currency + '' + inputCredit.toLocaleString(undefined, { minimumFractionDigits: 2 }) || Currency + '0');
        }

        let $tblrows = $("#tblDepositEntryLine tbody tr");
        var targetID = $(event.target).closest('tr').attr('id');
        if ($(event.target).val().replace(/[^0-9.-]+/g, "") != 0) {
            $('#' + targetID + " .lineDebitEx").val(Currency + '0.00');
        }

        let lineAmount = 0;
        let subGrandCreditTotal = 0;
        let subGrandDebitTotal = 0;
        $tblrows.each(function (index) {
            var $tblrow = $(this);
            var credit = $tblrow.find(".lineCreditEx").val() || Currency + '0';
            var debit = $tblrow.find(".lineDebitEx").val() || Currency + '0';
            var subTotalCredit = Number(credit.replace(/[^0-9.-]+/g, "")) || Currency + '0';
            var subTotalDebit = Number(debit.replace(/[^0-9.-]+/g, "")) || Currency + '0';
            if (!isNaN(subTotalCredit)) {
                subGrandCreditTotal += isNaN(subTotalCredit) ? 0 : subTotalCredit;
            };
            if (!isNaN(subTotalDebit)) {
                subGrandDebitTotal += isNaN(subTotalDebit) ? 0 : subTotalDebit;
            };

        });
        templateObject.totalCredit.set(utilityService.modifynegativeCurrencyFormat(subGrandCreditTotal));
        templateObject.totalDebit.set(utilityService.modifynegativeCurrencyFormat(subGrandDebitTotal));

    },
    'click #btnCustomFileds': function (event) {
        var x = document.getElementById("divCustomFields");
        if (x.style.display === "none") {
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }
    },
    'click .lineAccountName, keydown .lineAccountName': function (event) {
        var $earch = $(event.currentTarget);
        var offset = $earch.offset();
        $('#edtAccountID').val('');
        $('#add-account-title').text('Add New Account');
        let suppliername = $('#edtSupplierName').val();
        let accountService = new AccountService();
        const accountTypeList = [];
        if (suppliername === '') {
            swal('Supplier has not been selected!', '', 'warning');
            event.preventDefault();
        }
    },
    'click #accountListModal #refreshpagelist': function () {
        Meteor._reload.reload();
    },
    // 'click .lineTaxRate': function (event) {
    //     $('#tblDepositEntryLine tbody tr .lineTaxRate').attr("data-toggle", "modal");
    //     $('#tblDepositEntryLine tbody tr .lineTaxRate').attr("data-target", "#taxRateListModal");
    //     var targetID = $(event.target).closest('tr').attr('id');
    //     $('#selectLineID').val(targetID);
    // },
    // 'click .lineTaxCode': function (event) {
    //     $('#tblDepositEntryLine tbody tr .lineTaxCode').attr("data-toggle", "modal");
    //     $('#tblDepositEntryLine tbody tr .lineTaxCode').attr("data-target", "#taxRateListModal");
    //     var targetID = $(event.target).closest('tr').attr('id');
    //     $('#selectLineID').val(targetID);
    // },
    // 'click #open_print_confirm': function (event) {
    //     playPrintAudio();
    //     setTimeout(function () {
    //         $('#templateselection').modal('toggle');
    //     }, delayTimeAfterSound);
    // },
    // 'click .printConfirm': async function (event) {
    //     playPrintAudio();
    //     setTimeout(async function () {
    //         var printTemplate = [];
    //         $('.fullScreenSpin').css('display', 'inline-block');
    //         $('#html-2-pdfwrapper').css('display', 'block');
    //         if ($('#print_deposit').is(':checked')) {
    //             printTemplate.push('Deposits');
    //         }

    //         if (printTemplate.length > 0) {
    //             for (var i = 0; i < printTemplate.length; i++) {
    //                 if (printTemplate[i] == 'Deposits') {
    //                     var template_number = $('input[name="Deposits"]:checked').val();
    //                 }
    //                 let result = await exportSalesToPdf1(printTemplate[i], template_number);
    //                 if (result == true) {

    //                 }
    //             }
    //         }
    //     }, delayTimeAfterSound);
    // },
    'keydown .lineAmount': function (event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||

            (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||

            (event.keyCode >= 35 && event.keyCode <= 40)) {

            return;
        }

        if (event.shiftKey == true) {
            event.preventDefault();
        }

        if ((event.keyCode >= 48 && event.keyCode <= 57) ||
            (event.keyCode >= 96 && event.keyCode <= 105) ||
            event.keyCode == 8 || event.keyCode == 9 ||
            event.keyCode == 37 || event.keyCode == 39 ||
            event.keyCode == 46 || event.keyCode == 190 || event.keyCode == 189 || event.keyCode == 109) {
        } else {
            event.preventDefault();
        }
    },
    // 'click .btnRemove': async function (event) {
    //     let templateObject = Template.instance();
    //     let taxcodeList = templateObject.taxraterecords.get();
    //     var targetID = $(event.target).closest('tr').attr('id');
    //     $('#selectDeleteLineID').val(targetID);

    //     if (targetID != undefined) {
    //         times++;
    //         if (times == 1) {
    //             $('#deleteLineModal').modal('toggle');
    //         } else {
    //             if ($('#tblDepositEntryLine tbody>tr').length > 1) {
    //                 this.click;
    //                 $(event.target).closest('tr').remove();
    //                 event.preventDefault();
    //                 let $tblrows = $("#tblDepositEntryLine tbody tr");

    //                 let lineAmount = 0;
    //                 let subGrandTotal = 0;
    //                 let taxGrandTotal = 0;

    //                 $tblrows.each(function (index) {
    //                     var $tblrow = $(this);
    //                     var amount = $tblrow.find(".colAmount").text() || 0;
    //                     var taxcode = $tblrow.find(".lineTaxCode").text() || 0;

    //                     var taxrateamount = 0;
    //                     if (taxcodeList) {
    //                         for (var i = 0; i < taxcodeList.length; i++) {
    //                             if (taxcodeList[i].codename == taxcode) {
    //                                 taxrateamount = taxcodeList[i].coderate;
    //                             }
    //                         }
    //                     }


    //                     var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
    //                     var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
    //                     if (!isNaN(subTotal)) {
    //                         subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
    //                         document.getElementById("subtotal_total").innerHTML = Currency + '' + subGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });
    //                     }

    //                     if (!isNaN(taxTotal)) {
    //                         taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
    //                         document.getElementById("subtotal_tax").innerHTML = Currency + '' + taxGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });
    //                     }

    //                     if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
    //                         let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
    //                         document.getElementById("grandTotal").innerHTML = Currency + '' + GrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });
    //                         document.getElementById("balanceDue").innerHTML = Currency + '' + GrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });
    //                         document.getElementById("totalBalanceDue").innerHTML = Currency + '' + GrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });

    //                     }
    //                 });
    //                 return false;

    //             } else {
    //                 $('#deleteLineModal').modal('toggle');
    //             }
    //         }
    //     } else {
    //         if (templateObject.hasFollow.get()) $("#footerDeleteModal2").modal("toggle");
    //         else $("#footerDeleteModal1").modal("toggle");
    //     }
    // },
    // 'click .btnDeleteFollowingDepositEntries': async function (event) {
    //     playDeleteAudio();
    //     var currentDate = new Date();
    //     let purchaseService = new PurchaseBoardService();
    //     let templateObject = Template.instance();
    //     setTimeout(async function () {

    //         swal({
    //             title: 'You are deleting ' + $("#following_cnt").val() + ' Deposit',
    //             text: "Do you wish to delete this transaction and all others associated with it moving forward?",
    //             type: 'question',
    //             showCancelButton: true,
    //             confirmButtonText: 'Yes',
    //             cancelButtonText: 'No'
    //         }).then(async (result) => {
    //             if (result.value) {
    //                 var url = FlowRouter.current().path;
    //                 var getso_id = url.split('?id=');
    //                 var currentInvoice = getso_id[getso_id.length - 1];
    //                 var objDetails = '';
    //                 if (getso_id[1]) {
    //                     $('.deleteloadingbar').css('width', ('0%')).attr('aria-valuenow', 0);
    //                     $("#deleteLineModal").modal('hide');
    //                     $("#deleteprogressbar").css('display', 'block');
    //                     $("#deleteprogressbar").modal('show');
    //                     currentInvoice = parseInt(currentInvoice);
    //                     var depositEntryData = await purchaseService.getOneDepositEnrtyData(currentInvoice);
    //                     var depositDate = depositEntryData.fields.DepositDate;
    //                     var fromDate = depositDate.substring(0, 10);
    //                     var toDate = currentDate.getFullYear() + '-' + ("0" + (currentDate.getMonth() + 1)).slice(-2) + '-' + ("0" + (currentDate.getDate())).slice(-2);
    //                     var followingDeposits = await sideBarService.getAllTBankDepositListData(
    //                         fromDate,
    //                         toDate,
    //                         false,
    //                         initialReportLoad,
    //                         0
    //                     );
    //                     var depositList = followingDeposits.tbankdepositlist;
    //                     var j = 0;
    //                     for (var i = 0; i < depositList.length; i++) {
    //                         var objDetails = {
    //                             type: "TVS1BankDeposit",
    //                             fields: {
    //                                 ID: depositList[i].DepositID,
    //                                 Deleted: true
    //                             }
    //                         };
    //                         j++;
    //                         document.getElementsByClassName("deleteprogressBarInner")[0].innerHTML = j + '';
    //                         $('.deleteloadingbar').css('width', ((100 / depositList.length * j)) + '%').attr('aria-valuenow', ((100 / depositList.length * j)));
    //                         var result = await purchaseService.saveBankDeposit(objDetails);
    //                     }
    //                 }
    //                 $("#deletecheckmarkwrapper").removeClass('hide');
    //                 $('.modal-backdrop').css('display', 'none');
    //                 $("#deleteprogressbar").modal('hide');
    //                 $("#btn_data").click();
    //             }
    //         });
    //     }, delayTimeAfterSound);
    // },
    // 'click .btnDelete': async function (event) {
    //     playDeleteAudio();
    //     let templateObject = Template.instance();
    //     let purchaseService = new PurchaseBoardService();
    //     setTimeout(function () {

    //         swal({
    //             title: 'Delete Deposit',
    //             text: "Are you sure you want to delete Deposit?",
    //             type: 'question',
    //             showCancelButton: true,
    //             confirmButtonText: 'Yes'
    //         }).then((result) => {
    //             if (result.value) {
    //                 $('.fullScreenSpin').css('display', 'inline-block');
    //                 var url = FlowRouter.current().path;
    //                 var getso_id = url.split('?id=');
    //                 var currentInvoice = getso_id[getso_id.length - 1];
    //                 var objDetails = '';
    //                 if (getso_id[1]) {
    //                     currentInvoice = parseInt(currentInvoice);
    //                     var objDetails = {
    //                         type: "TVS1BankDeposit",
    //                         fields: {
    //                             ID: currentInvoice,
    //                             Deleted: true

    //                         }
    //                     };

    //                     purchaseService.saveBankDeposit(objDetails).then(function (objDetails) {
    //                         FlowRouter.go('/depositlist?success=true');
    //                         $('.modal-backdrop').css('display', 'none');
    //                     }).catch(function (err) {
    //                         swal({
    //                             title: 'Oooops...',
    //                             text: err,
    //                             type: 'error',
    //                             showCancelButton: false,
    //                             confirmButtonText: 'Try Again'
    //                         }).then((result) => {
    //                             if (result.value) { if (err === checkResponseError) { window.open('/', '_self'); } }
    //                             else if (result.dismiss === 'cancel') {

    //                             }
    //                         });
    //                         $('.fullScreenSpin').css('display', 'none');
    //                     });
    //                 } else {
    //                     window.open('/depositlist', '_self');
    //                 }
    //                 //$('#deleteLineModal').modal('toggle');
    //             } else if (result.dismiss === 'cancel') {
    //                 //window.open('/depositlist', "_self");
    //             } else {

    //             }
    //         });
    //     }, delayTimeAfterSound);
    // },
    // 'click .btnDeleteNothing': function (event) {
    //     playDeleteAudio();
    //     let templateObject = Template.instance();
    //     let purchaseService = new PurchaseBoardService();
    //     setTimeout(function () {
    //         $('.fullScreenSpin').css('display', 'inline-block');

    //         var url = FlowRouter.current().path;
    //         var getso_id = url.split('?id=');
    //         var currentInvoice = getso_id[getso_id.length - 1];
    //         if (getso_id[1]) {
    //             currentInvoice = parseInt(currentInvoice);
    //             var objDetails = {
    //                 type: "TVS1BankDeposit",
    //                 fields: {
    //                     ID: currentInvoice,
    //                     Deleted: true
    //                 }
    //             };

    //             purchaseService.saveBankDeposit(objDetails).then(function (objDetails) {
    //                 FlowRouter.go('/depositlist?success=true');
    //                 $('.modal-backdrop').css('display', 'none');
    //             }).catch(function (err) {
    //                 swal({
    //                     title: 'Oooops...',
    //                     text: err,
    //                     type: 'error',
    //                     showCancelButton: false,
    //                     confirmButtonText: 'Try Again'
    //                 }).then((result) => {
    //                     if (result.value) { if (err === checkResponseError) { window.open('/', '_self'); } }
    //                     else if (result.dismiss === 'cancel') {

    //                     }
    //                 });
    //                 $('.fullScreenSpin').css('display', 'none');
    //             });
    //         } else {
    //             FlowRouter.go('/depositlist?success=true');
    //             $('.modal-backdrop').css('display', 'none');
    //         }
    //     }, delayTimeAfterSound);
    // },
    // 'click .btnDeleteLine': function (event) {
    //     playDeleteAudio();
    //     let templateObject = Template.instance();
    //     let utilityService = new UtilityService();
    //     setTimeout(function () {

    //         let taxcodeList = templateObject.taxraterecords.get();
    //         let selectLineID = $('#selectDeleteLineID').val();
    //         if ($('#tblDepositEntryLine tbody>tr').length > 1) {
    //             this.click;

    //             $('#' + selectLineID).closest('tr').remove();

    //             let $tblrows = $("#tblDepositEntryLine tbody tr");

    //             let lineAmount = 0;
    //             let subGrandTotal = 0;
    //             let taxGrandTotal = 0;

    //             let lineAmountTotal = 0;
    //             $tblrows.each(function (index) {
    //                 var $tblrow = $(this);
    //                 var lineAmount = Number($tblrow.find(".colAmount").val().replace(/[^0-9.-]+/g, "")) || 0;
    //                 lineAmountTotal += lineAmount;
    //             });

    //             document.getElementById("depositTotalLine").innerHTML = utilityService.modifynegativeCurrencyFormat(lineAmountTotal) || 0;



    //         } else {
    //             this.click;

    //             $('#' + selectLineID + " .lineAccountName").val('');
    //             $('#' + selectLineID + " .linePaymentMethod").val('');

    //             $('#' + selectLineID + " .colReference").text('');
    //             $('#' + selectLineID + " .lineCompany").val('');
    //             $('#' + selectLineID + " .colAmount").val('');



    //             $('#depositTotalLine').text(utilityService.modifynegativeCurrencyFormat('0.00'));

    //         }

    //         $('#deleteLineModal').modal('toggle');
    //     }, delayTimeAfterSound);
    // },
    // 'click .btnSaveSettings': function (event) {
    //     playSaveAudio();
    //     setTimeout(function () {
    //         $('#myModal4').modal('toggle');
    //     }, delayTimeAfterSound);
    // },
    // 'click .btnSave': function (event) {
    //     playSaveAudio();
    //     let templateObject = Template.instance();
    //     let purchaseService = new PurchaseBoardService();
    //     let uploadedItems = templateObject.uploadedFiles.get();
    //     setTimeout(function () {

    //         let account = $('#sltAccountName').val();
    //         let depositTotal = $('#depositTotal').val();
    //         let depositTotalLine = $('#depositTotalLine').text();
    //         let txaNotes = $('#txaNotes').val();

    //         if (account === '') {
    //             swal('Account has not been selected!', '', 'warning');
    //             e.preventDefault();
    //         } else {
    //             if ($('#depositTotal').val().replace(/[^0-9.-]+/g, "") !== $('#depositTotalLine').text().replace(/[^0-9.-]+/g, "")) {

    //                 swal({
    //                     title: 'Total Deposit does not equal Total Deposited!',
    //                     text: 'Do You Wish To Update Deposit Total?',
    //                     type: 'question',
    //                     showCancelButton: true,
    //                     confirmButtonText: 'Yes',
    //                     cancelButtonText: 'No'
    //                 }).then((result) => {
    //                     if (result.value) {
    //                         $('.fullScreenSpin').css('display', 'inline-block');
    //                         var splashLineArray = [];
    //                         let lineItemsForm = [];
    //                         let lineItemObjForm = {};
    //                         let tdtaxCode = "";

    //                         var transdateTime = new Date($("#dtTransDate").datepicker("getDate"));
    //                         let transDate = transdateTime.getFullYear() + "-" + (transdateTime.getMonth() + 1) + "-" + transdateTime.getDate();
    //                         let entryNo = $('#edtEnrtyNo').val();

    //                         var url = FlowRouter.current().path;
    //                         var getso_id = url.split('?id=');
    //                         var currentDeposit = getso_id[getso_id.length - 1];

    //                         var objDetails = '';
    //                         if (getso_id[1]) {
    //                             $('#tblDepositEntryLine > tbody > tr').each(function () {
    //                                 var lineID = this.id;
    //                                 let tdaccount = $('#' + lineID + " .lineAccountName").val() || $('#sltAccountName').val();
    //                                 let tdpaymentmethod = $('#' + lineID + " .linePaymentMethod").val();
    //                                 let tddmemo = $('#' + lineID + " .colReference").text();
    //                                 let tdcompany = $('#' + lineID + " .lineCompany").val();
    //                                 let tdamount = $('#' + lineID + " .colAmount").val();
    //                                 let erpLineID = $('#' + lineID + " .lineAccountName").attr('lineid');

    //                                 if (tdaccount !== "") {
    //                                     lineItemObjForm = {
    //                                         type: "TBankDepositLines",
    //                                         fields:
    //                                         {
    //                                             ID: parseInt(erpLineID) || 0,
    //                                             AccountName: tdaccount || '',
    //                                             Amount: parseFloat(tdamount.replace(/[^0-9.-]+/g, "")) || 0,
    //                                             FromDeposited: true,
    //                                             ReferenceNo: tddmemo || txaNotes,
    //                                             CompanyName: tdcompany || '',
    //                                             Contact: false,
    //                                             Customer: true,
    //                                             Deleted: false,
    //                                             Deposited: false,
    //                                             PaymentMethod: tdpaymentmethod || "Cash",
    //                                             TransClassName: "Default",
    //                                             TrnsType: "Deposit Entry"
    //                                         }
    //                                     };
    //                                     lineItemsForm.push(lineItemObjForm);
    //                                     splashLineArray.push(lineItemObjForm);
    //                                 }
    //                             });
    //                             currentDeposit = parseInt(currentDeposit);
    //                             objDetails = {
    //                                 type: "TVS1BankDeposit",
    //                                 fields: {
    //                                     ID: currentDeposit,
    //                                     AccountName: account || '',
    //                                     Deleted: false,
    //                                     Deposit: parseFloat(depositTotalLine.replace(/[^0-9.-]+/g, "")) || 0,
    //                                     DepositClassName: "Default",
    //                                     Lines: splashLineArray,
    //                                     DepositDate: transDate,
    //                                     Notes: txaNotes
    //                                 }
    //                             };
    //                         } else {
    //                             $('#tblDepositEntryLine > tbody > tr').each(function () {
    //                                 var lineID = this.id;
    //                                 let tdaccount = $('#' + lineID + " .lineAccountName").val() || $('#sltAccountName').val();
    //                                 let tdpaymentmethod = $('#' + lineID + " .linePaymentMethod").val();
    //                                 let tddmemo = $('#' + lineID + " .colReference").text();
    //                                 let tdcompany = $('#' + lineID + " .lineCompany").val();
    //                                 let tdamount = $('#' + lineID + " .colAmount").val();
    //                                 let erpLineID = $('#' + lineID + " .lineAccountName").attr('lineid');

    //                                 if (tdaccount !== "") {
    //                                     lineItemObjForm = {
    //                                         type: "TBankDepositLines",
    //                                         fields:
    //                                         {

    //                                             AccountName: tdaccount || '',
    //                                             Amount: parseFloat(tdamount.replace(/[^0-9.-]+/g, "")) || 0,
    //                                             FromDeposited: true,
    //                                             ReferenceNo: tddmemo || txaNotes,
    //                                             CompanyName: tdcompany || '',
    //                                             Contact: false,
    //                                             Customer: true,
    //                                             Deleted: false,
    //                                             Deposited: false,
    //                                             PaymentMethod: tdpaymentmethod || "Cash",
    //                                             TransClassName: "Default",
    //                                             TrnsType: "Deposit Entry"
    //                                         }
    //                                     };
    //                                     lineItemsForm.push(lineItemObjForm);
    //                                     splashLineArray.push(lineItemObjForm);
    //                                 }
    //                             });
    //                             objDetails = {
    //                                 type: "TVS1BankDeposit",
    //                                 fields: {
    //                                     AccountName: account || '',
    //                                     Deleted: false,
    //                                     Deposit: parseFloat(depositTotalLine.replace(/[^0-9.-]+/g, "")) || 0,
    //                                     DepositClassName: "Default",
    //                                     Lines: splashLineArray,
    //                                     DepositDate: transDate,
    //                                     Notes: txaNotes
    //                                 }
    //                             };
    //                         }

    //                         if (splashLineArray.length > 0) {

    //                         } else {
    //                             swal('From account has not been selected!', '', 'warning');
    //                             $('.fullScreenSpin').css('display', 'none');
    //                             event.preventDefault();
    //                             return false;
    //                         };

    //                         purchaseService.saveBankDeposit(objDetails).then(function (objDetails) {
    //                             if (localStorage.getItem("enteredURL") != null) {
    //                                 FlowRouter.go(localStorage.getItem("enteredURL"));
    //                                 localStorage.removeItem("enteredURL");
    //                                 return;
    //                             }

    //                             FlowRouter.go('/depositlist?success=true');
    //                             $('.modal-backdrop').css('display', 'none');


    //                         }).catch(function (err) {
    //                             swal({
    //                                 title: 'Oooops...',
    //                                 text: err,
    //                                 type: 'error',
    //                                 showCancelButton: false,
    //                                 confirmButtonText: 'Try Again'
    //                             }).then((result) => {
    //                                 if (result.value) { if (err === checkResponseError) { window.open('/', '_self'); } }
    //                                 else if (result.dismiss === 'cancel') {

    //                                 }
    //                             });

    //                             $('.fullScreenSpin').css('display', 'none');
    //                         });
    //                     } else if (result.dismiss === 'cancel') {
    //                         $('.fullScreenSpin').css('display', 'none');
    //                     }
    //                 });

    //             } else {
    //                 $('.fullScreenSpin').css('display', 'inline-block');
    //                 var splashLineArray = new Array();
    //                 let lineItemsForm = [];
    //                 let lineItemObjForm = {};
    //                 let tdtaxCode = "";

    //                 var transdateTime = new Date($("#dtTransDate").datepicker("getDate"));
    //                 let transDate = transdateTime.getFullYear() + "-" + (transdateTime.getMonth() + 1) + "-" + transdateTime.getDate();
    //                 let entryNo = $('#edtEnrtyNo').val();

    //                 var url = FlowRouter.current().path;
    //                 var getso_id = url.split('?id=');
    //                 var currentDeposit = getso_id[getso_id.length - 1];

    //                 var objDetails = '';
    //                 if (getso_id[1]) {
    //                     $('#tblDepositEntryLine > tbody > tr').each(function () {
    //                         var lineID = this.id;
    //                         let tdaccount = $('#' + lineID + " .lineAccountName").val() || $('#sltAccountName').val();
    //                         let tdpaymentmethod = $('#' + lineID + " .linePaymentMethod").val();
    //                         let tddmemo = $('#' + lineID + " .colReference").text();
    //                         let tdcompany = $('#' + lineID + " .lineCompany").val();
    //                         let tdamount = $('#' + lineID + " .colAmount").val();
    //                         let erpLineID = $('#' + lineID + " .lineAccountName").attr('lineid');

    //                         if (tdaccount != "") {
    //                             lineItemObjForm = {
    //                                 type: "TBankDepositLines",
    //                                 fields:
    //                                 {
    //                                     ID: parseInt(erpLineID) || 0,
    //                                     AccountName: tdaccount || '',
    //                                     Amount: parseFloat(tdamount.replace(/[^0-9.-]+/g, "")) || 0,
    //                                     FromDeposited: true,
    //                                     ReferenceNo: tddmemo || txaNotes,
    //                                     CompanyName: tdcompany || '',
    //                                     Contact: false,
    //                                     Customer: true,
    //                                     Deleted: false,
    //                                     Deposited: false,
    //                                     PaymentMethod: tdpaymentmethod || "Cash",
    //                                     TransClassName: "Default",
    //                                     TrnsType: "Deposit Entry"
    //                                 }
    //                             };
    //                             lineItemsForm.push(lineItemObjForm);
    //                             splashLineArray.push(lineItemObjForm);
    //                         }
    //                     });
    //                     currentDeposit = parseInt(currentDeposit);
    //                     objDetails = {
    //                         type: "TVS1BankDeposit",
    //                         fields: {
    //                             ID: currentDeposit,
    //                             AccountName: account || '',
    //                             Deleted: false,
    //                             Deposit: parseFloat(depositTotalLine.replace(/[^0-9.-]+/g, "")) || 0,
    //                             DepositClassName: "Default",
    //                             Lines: splashLineArray,
    //                             DepositDate: transDate,
    //                             Notes: txaNotes
    //                         }
    //                     };
    //                 } else {
    //                     $('#tblDepositEntryLine > tbody > tr').each(function () {
    //                         var lineID = this.id;
    //                         let tdaccount = $('#' + lineID + " .lineAccountName").val() || $('#sltAccountName').val();
    //                         let tdpaymentmethod = $('#' + lineID + " .linePaymentMethod").val();
    //                         let tddmemo = $('#' + lineID + " .colReference").text();
    //                         let tdcompany = $('#' + lineID + " .lineCompany").val();
    //                         let tdamount = $('#' + lineID + " .colAmount").val();
    //                         let erpLineID = $('#' + lineID + " .lineAccountName").attr('lineid');

    //                         if (tdaccount != "") {
    //                             lineItemObjForm = {
    //                                 type: "TBankDepositLines",
    //                                 fields:
    //                                 {

    //                                     AccountName: tdaccount || '',
    //                                     Amount: parseFloat(tdamount.replace(/[^0-9.-]+/g, "")) || 0,
    //                                     FromDeposited: true,
    //                                     ReferenceNo: tddmemo || txaNotes,
    //                                     CompanyName: tdcompany || '',
    //                                     Contact: false,
    //                                     Customer: true,
    //                                     Deleted: false,
    //                                     Deposited: false,
    //                                     PaymentMethod: tdpaymentmethod || "Cash",
    //                                     TransClassName: "Default",
    //                                     TrnsType: "Deposit Entry"
    //                                 }
    //                             };
    //                             lineItemsForm.push(lineItemObjForm);
    //                             splashLineArray.push(lineItemObjForm);
    //                         }
    //                     });
    //                     objDetails = {
    //                         type: "TVS1BankDeposit",
    //                         fields: {
    //                             AccountName: account || '',
    //                             Deleted: false,
    //                             Deposit: parseFloat(depositTotalLine.replace(/[^0-9.-]+/g, "")) || 0,
    //                             DepositClassName: "Default",
    //                             Lines: splashLineArray,
    //                             DepositDate: transDate,
    //                             Notes: txaNotes
    //                         }
    //                     };
    //                 }

    //                 if (splashLineArray.length > 0) {

    //                 } else {
    //                     swal('From account has not been selected!', '', 'warning');
    //                     $('.fullScreenSpin').css('display', 'none');
    //                     event.preventDefault();
    //                     return false;
    //                 };
    //                 purchaseService.saveBankDeposit(objDetails).then(function (objDetails) {
    //                     FlowRouter.go('/depositlist?success=true');
    //                     $('.modal-backdrop').css('display', 'none');


    //                 }).catch(function (err) {
    //                     swal({
    //                         title: 'Oooops...',
    //                         text: err,
    //                         type: 'error',
    //                         showCancelButton: false,
    //                         confirmButtonText: 'Try Again'
    //                     }).then((result) => {
    //                         if (result.value) { if (err === checkResponseError) { window.open('/', '_self'); } }
    //                         else if (result.dismiss === 'cancel') {

    //                         }
    //                     });

    //                     $('.fullScreenSpin').css('display', 'none');
    //                 });
    //             }


    //         }
    //     }, delayTimeAfterSound);
    // },
    
    // 'click .btnSaveGridSettings': function (event) {
    //     playSaveAudio();
    //     setTimeout(function () {
    //         let lineItems = [];

    //         $('.columnSettings').each(function (index) {
    //             var $tblrow = $(this);
    //             var colTitle = $tblrow.find(".divcolumn").text() || '';
    //             var colWidth = $tblrow.find(".custom-range").val() || 0;
    //             var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
    //             var colHidden = false;
    //             if ($tblrow.find(".custom-control-input").is(':checked')) {
    //                 colHidden = false;
    //             } else {
    //                 colHidden = true;
    //             }
    //             let lineItemObj = {
    //                 index: index,
    //                 label: colTitle,
    //                 hidden: colHidden,
    //                 width: colWidth,
    //                 thclass: colthClass
    //             }

    //             lineItems.push(lineItemObj);

    //         });

    //         var getcurrentCloudDetails = CloudUser.findOne({ _id: localStorage.getItem('mycloudLogonID'), clouddatabaseID: localStorage.getItem('mycloudLogonDBID') });
    //         if (getcurrentCloudDetails) {
    //             if (getcurrentCloudDetails._id.length > 0) {
    //                 var clientID = getcurrentCloudDetails._id;
    //                 var clientUsername = getcurrentCloudDetails.cloudUsername;
    //                 var clientEmail = getcurrentCloudDetails.cloudEmail;
    //                 var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblDepositEntryLine' });
    //                 if (checkPrefDetails) {
    //                     CloudPreference.update({ _id: checkPrefDetails._id }, {
    //                         $set: {
    //                             userid: clientID, username: clientUsername, useremail: clientEmail,
    //                             PrefGroup: 'purchaseform', PrefName: 'tblDepositEntryLine', published: true,
    //                             customFields: lineItems,
    //                             updatedAt: new Date()
    //                         }
    //                     }, function (err, idTag) {
    //                         if (err) {
    //                             $('#myModal2').modal('toggle');

    //                         } else {
    //                             $('#myModal2').modal('toggle');


    //                         }
    //                     });

    //                 } else {
    //                     CloudPreference.insert({
    //                         userid: clientID, username: clientUsername, useremail: clientEmail,
    //                         PrefGroup: 'purchaseform', PrefName: 'tblDepositEntryLine', published: true,
    //                         customFields: lineItems,
    //                         createdAt: new Date()
    //                     }, function (err, idTag) {
    //                         if (err) {
    //                             $('#myModal2').modal('toggle');

    //                         } else {
    //                             $('#myModal2').modal('toggle');


    //                         }
    //                     });

    //                 }
    //             }
    //         }
    //         $('#myModal2').modal('toggle');
    //     }, delayTimeAfterSound);
    // },
    // 'click .btnResetGridSettings': function (event) {
    //     var getcurrentCloudDetails = CloudUser.findOne({ _id: localStorage.getItem('mycloudLogonID'), clouddatabaseID: localStorage.getItem('mycloudLogonDBID') });
    //     if (getcurrentCloudDetails) {
    //         if (getcurrentCloudDetails._id.length > 0) {
    //             var clientID = getcurrentCloudDetails._id;
    //             var clientUsername = getcurrentCloudDetails.cloudUsername;
    //             var clientEmail = getcurrentCloudDetails.cloudEmail;
    //             var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblDepositEntryLine' });
    //             if (checkPrefDetails) {
    //                 CloudPreference.remove({ _id: checkPrefDetails._id }, function (err, idTag) {
    //                     if (err) {

    //                     } else {
    //                         Meteor._reload.reload();
    //                     }
    //                 });

    //             }
    //         }
    //     }
    // },
    // 'click .btnResetSettings': function (event) {
    //     var getcurrentCloudDetails = CloudUser.findOne({ _id: localStorage.getItem('mycloudLogonID'), clouddatabaseID: localStorage.getItem('mycloudLogonDBID') });
    //     if (getcurrentCloudDetails) {
    //         if (getcurrentCloudDetails._id.length > 0) {
    //             var clientID = getcurrentCloudDetails._id;
    //             var clientUsername = getcurrentCloudDetails.cloudUsername;
    //             var clientEmail = getcurrentCloudDetails.cloudEmail;
    //             var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'depositcard' });
    //             if (checkPrefDetails) {
    //                 CloudPreference.remove({ _id: checkPrefDetails._id }, function (err, idTag) {
    //                     if (err) {

    //                     } else {
    //                         Meteor._reload.reload();
    //                     }
    //                 });

    //             }
    //         }
    //     }
    // },
    // 'click .new_attachment_btn': function (event) {
    //     $('#attachment-upload').trigger('click');

    // },
    // 'change #attachment-upload': function (e) {
    //     let templateObj = Template.instance();
    //     let saveToTAttachment = false;
    //     let lineIDForAttachment = false;
    //     let uploadedFilesArray = templateObj.uploadedFiles.get();

    //     let myFiles = $('#attachment-upload')[0].files;
    //     let uploadData = utilityService.attachmentUpload(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment);
    //     templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
    //     templateObj.attachmentCount.set(uploadData.totalAttachments);
    // },
    // 'click .img_new_attachment_btn': function (event) {
    //     $('#img-attachment-upload').trigger('click');

    // },
    // 'change #img-attachment-upload': function (e) {
    //     let templateObj = Template.instance();
    //     let saveToTAttachment = false;
    //     let lineIDForAttachment = false;
    //     let uploadedFilesArray = templateObj.uploadedFiles.get();

    //     let myFiles = $('#img-attachment-upload')[0].files;
    //     let uploadData = utilityService.attachmentUpload(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment);
    //     templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
    //     templateObj.attachmentCount.set(uploadData.totalAttachments);
    // },
    // 'click .remove-attachment': function (event, ui) {
    //     let templateObject = Template.instance();
    //     let attachmentID = parseInt(event.target.id.split('remove-attachment-')[1]);
    //     if (templateObject.$("#confirm-action-" + attachmentID).length) {
    //         templateObject.$("#confirm-action-" + attachmentID).remove();
    //     } else {
    //         let actionElement = '<div class="confirm-action" id="confirm-action-' + attachmentID + '"><a class="confirm-delete-attachment btn btn-default" id="delete-attachment-' + attachmentID + '">'
    //             + 'Delete</a><button class="save-to-library btn btn-default">Remove & save to File Library</button></div>';
    //         templateObject.$('#attachment-name-' + attachmentID).append(actionElement);
    //     }
    //     templateObject.$("#new-attachment2-tooltip").show();

    // },
    // 'click .file-name': function (event) {
    //     let attachmentID = parseInt(event.currentTarget.parentNode.id.split('attachment-name-')[1]);
    //     let templateObj = Template.instance();
    //     let uploadedFiles = templateObj.uploadedFiles.get();

    //     $('#myModalAttachment').modal('hide');
    //     let previewFile = {};
    //     let input = uploadedFiles[attachmentID].fields.Description;
    //     previewFile.link = 'data:' + input + ';base64,' + uploadedFiles[attachmentID].fields.Attachment;
    //     previewFile.name = uploadedFiles[attachmentID].fields.AttachmentName;
    //     let type = uploadedFiles[attachmentID].fields.Description;
    //     if (type === 'application/pdf') {
    //         previewFile.class = 'pdf-class';
    //     } else if (type === 'application/msword' || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    //         previewFile.class = 'docx-class';
    //     }
    //     else if (type === 'application/vnd.ms-excel' || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    //         previewFile.class = 'excel-class';
    //     }
    //     else if (type === 'application/vnd.ms-powerpoint' || type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    //         previewFile.class = 'ppt-class';
    //     }
    //     else if (type === 'application/vnd.oasis.opendocument.formula' || type === 'text/csv' || type === 'text/plain' || type === 'text/rtf') {
    //         previewFile.class = 'txt-class';
    //     }
    //     else if (type === 'application/zip' || type === 'application/rar' || type === 'application/x-zip-compressed' || type === 'application/x-zip,application/x-7z-compressed') {
    //         previewFile.class = 'zip-class';
    //     }
    //     else {
    //         previewFile.class = 'default-class';
    //     }

    //     if (type.split('/')[0] === 'image') {
    //         previewFile.image = true
    //     } else {
    //         previewFile.image = false
    //     }
    //     templateObj.uploadedFile.set(previewFile);

    //     $('#files_view').modal('show');

    //     return;
    // },
    // 'click .confirm-delete-attachment': function (event, ui) {
    //     let templateObject = Template.instance();
    //     templateObject.$("#new-attachment2-tooltip").show();
    //     let attachmentID = parseInt(event.target.id.split('delete-attachment-')[1]);
    //     let uploadedArray = templateObject.uploadedFiles.get();
    //     let attachmentCount = templateObject.attachmentCount.get();
    //     $('#attachment-upload').val('');
    //     uploadedArray.splice(attachmentID, 1);
    //     templateObject.uploadedFiles.set(uploadedArray);
    //     attachmentCount--;
    //     if (attachmentCount === 0) {
    //         let elementToAdd = '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
    //         $('#file-display').html(elementToAdd);
    //     }
    //     templateObject.attachmentCount.set(attachmentCount);
    //     if (uploadedArray.length > 0) {
    //         let utilityService = new UtilityService();
    //         utilityService.showUploadedAttachment(uploadedArray);
    //     } else {
    //         $(".attchment-tooltip").show();
    //     }
    // },
    // 'click #btn_Attachment': function () {
    //     let templateInstance = Template.instance();
    //     let uploadedFileArray = templateInstance.uploadedFiles.get();
    //     if (uploadedFileArray.length > 0) {
    //         let utilityService = new UtilityService();
    //         utilityService.showUploadedAttachment(uploadedFileArray);
    //     } else {
    //         $(".attchment-tooltip").show();
    //     }
    // },
    // 'click .btnBack': function (event) {
    //     playCancelAudio();
    //     event.preventDefault();
    //     setTimeout(function () {
    //         history.back(1);
    //     }, delayTimeAfterSound);
    // },
    'change .colAmount': function (event) {
        let utilityService = new UtilityService();
        if (!isNaN($(event.target).val())) {
            let inputUnitPrice = parseFloat($(event.target).val()) || 0;
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));
        } else {
            let inputUnitPrice = Number($(event.target).val().replace(/[^0-9.-]+/g, "")) || 0;
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));
        }
        let $tblrows = $("#tblDepositEntryLine tbody tr");
        let lineAmountTotal = 0;
        $tblrows.each(function (index) {
            var $tblrow = $(this);
            var lineAmount = Number($tblrow.find(".colAmount").val().replace(/[^0-9.-]+/g, "")) || 0;
            lineAmountTotal += lineAmount;
        });

        document.getElementById("depositTotalLine").innerHTML = utilityService.modifynegativeCurrencyFormat(lineAmountTotal) || 0;

    },
    'change .depositTotal': function (event) {
        let utilityService = new UtilityService();
        if (!isNaN($(event.target).val())) {
            let inputUnitPrice = parseFloat($(event.target).val()) || 0;
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));
        } else {
            let inputUnitPrice = Number($(event.target).val().replace(/[^0-9.-]+/g, "")) || 0;
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));
        }
    },
    'keydown .colAmount, keydown .depositTotal, keydown .edtEnrtyNo': function (event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||

            (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||

            (event.keyCode >= 35 && event.keyCode <= 40)) {

            return;
        }

        if (event.shiftKey == true) {
            event.preventDefault();
        }

        if ((event.keyCode >= 48 && event.keyCode <= 57) ||
            (event.keyCode >= 96 && event.keyCode <= 105) ||
            event.keyCode == 8 || event.keyCode == 9 ||
            event.keyCode == 37 || event.keyCode == 39 ||
            event.keyCode == 46 || event.keyCode == 190 || event.keyCode == 189 || event.keyCode == 109) { } else {
            event.preventDefault();
        }
    }

});

Template.registerHelper('equals', function (a, b) {
    return a === b;
});
