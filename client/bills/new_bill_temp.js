import { SalesBoardService } from '../js/sales-service';
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
import 'jquery-editable-select';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import { ContactService } from "../contacts/contact-service";
import { TaxRateService } from "../settings/settings-service";
import LoadingOverlay from '../LoadingOverlay';
import { saveCurrencyHistory } from '../packages/currency/CurrencyWidget';
import { getCurrentCurrencySymbol } from '../popUps/currnecypopup';
import { convertToForeignAmount } from '../payments/paymentcard/supplierPaymentcard';
import FxGlobalFunctions from '../packages/currency/FxGlobalFunctions';
// import { object } from 'underscore';


import { Template } from 'meteor/templating';
import '../bills/frmbill_card_temp.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

var template_list = [
    "Bills",
];
var noHasTotals = ["Customer Payment", "Customer Statement", "Supplier Payment", "Statement", "Delivery Docket", "Journal Entry", "Deposit"];

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let purchaseService = new PurchaseBoardService();
let clientsService = new PurchaseBoardService();
let productsService = new PurchaseBoardService();
const contactService = new ContactService();

var times = 0;
let purchaseDefaultTerms = "";

let defaultCurrencyCode = CountryAbbr;

function generateHtmlMailBody() {
    let erpInvoiceId = objDetails.fields.ID;
    let mailFromName = localStorage.getItem('vs1companyName');
    let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
    let customerEmailName = $('#edtSupplierName').val();
    let grandtotal = $('#grandTotal').html();
    let amountDueEmail = $('#totalBalanceDue').html();
    let emailDueDate = $("#dtDueDate").val();
    let html = '<table align="center" border="0" cellpadding="0" cellspacing="0" width="600">' +
        '    <tr>' +
        '        <td align="center" bgcolor="#54c7e2" style="padding: 40px 0 30px 0;">' +
        '        <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" alt="VS1 Cloud" width="250px" style="display: block;" />' +
        '        </td>' +
        '    </tr>' +
        '    <tr>' +
        '        <td style="padding: 40px 30px 40px 30px;">' +
        '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
        '                <tr>' +
        '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 20px 0;">' +
        '                        Hello there <span>' + customerEmailName + '</span>,' +
        '                    </td>' +
        '                </tr>' +
        '                <tr>' +
        '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
        '                        Please find bill <span>' + erpInvoiceId + '</span> attached below.' +
        '                    </td>' +
        '                </tr>' +
        '                <tr>' +
        '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
        '                        The amount outstanding of <span>' + amountDueEmail + '</span> is due on <span>' + emailDueDate + '</span>' +
        '                    </td>' +
        '                </tr>' +
        '                <tr>' +
        '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 30px 0;">' +
        '                        Kind regards,' +
        '                        <br>' +
        '                        ' + mailFromName + '' +
        '                    </td>' +
        '                </tr>' +
        '            </table>' +
        '        </td>' +
        '    </tr>' +
        '    <tr>' +
        '        <td bgcolor="#00a3d3" style="padding: 30px 30px 30px 30px;">' +
        '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
        '                <tr>' +
        '                    <td width="50%" style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">' +
        '                        If you have any question, please do not hesitate to contact us.' +
        '                    </td>' +
        '                    <td align="right">' +
        '                        <a style="border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; background-color: #4CAF50;" href="mailto:' + mailFrom + '">Contact Us</a>' +
        '                    </td>' +
        '                </tr>' +
        '            </table>' +
        '        </td>' +
        '    </tr>' +
        '</table>';

    return html;
}

Template.billcard_temp.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.isForeignEnabled = new ReactiveVar(false);

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
    templateObject.billrecord = new ReactiveVar({});
    templateObject.taxrateobj = new ReactiveVar();
    templateObject.Accounts = new ReactiveVar([]);
    templateObject.BillId = new ReactiveVar();
    templateObject.selectedCurrency = new ReactiveVar([]);
    templateObject.inputSelectedCurrency = new ReactiveVar([]);
    templateObject.currencySymbol = new ReactiveVar([]);
    // templateObject.deptrecords = new ReactiveVar();
    templateObject.viarecords = new ReactiveVar();
    templateObject.termrecords = new ReactiveVar();
    templateObject.clientrecords = new ReactiveVar([]);
    templateObject.taxraterecords = new ReactiveVar([]);
    templateObject.taxcodes = new ReactiveVar([]);
    templateObject.datatablerecords = new ReactiveVar([]);

    templateObject.selectedsupplierpayrecords = new ReactiveVar([]);

    templateObject.uploadedFile = new ReactiveVar();
    templateObject.uploadedFiles = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar();

    templateObject.address = new ReactiveVar();
    templateObject.abn = new ReactiveVar();
    templateObject.referenceNumber = new ReactiveVar();
    templateObject.accountID = new ReactiveVar();
    templateObject.stripe_fee_method = new ReactiveVar();
    // templateObject.statusrecords = new ReactiveVar([]);
    templateObject.subtaxcodes = new ReactiveVar([]);

    templateObject.hasFollow = new ReactiveVar(false);

    templateObject.supplierRecord = new ReactiveVar();
    templateObject.currencyData = new ReactiveVar();

    templateObject.headerfields = new ReactiveVar();
    templateObject.headerbuttons = new ReactiveVar();
    templateObject.tranasctionfooterfields = new ReactiveVar();
    templateObject.printOptions = new ReactiveVar();

    let options = [{ title: 'Purchase Orders', number: 1, nameFieldID: 'Purchase_orders_1' }, { title: 'Purchase_Orders', number: 2, nameFieldID: 'Purchase_Orders_2' }, { title: 'Purchase_Orders', number: 3, nameFieldID: 'Purchase_Orders_3' },
    { title: 'Email', number: 1, nameFieldID: 'Email_1' }, { title: 'Email', number: 2, nameFieldID: 'Email_2' }, { title: 'Email', number: 3, nameFieldID: 'Email_3' },
    { title: 'SMS', number: 1, nameFieldID: 'SMS_1' }, { title: 'SMS', number: 2, nameFieldID: 'SMS_2' }, { title: 'SMS', number: 3, nameFieldID: 'SMS_3' },
    { title: 'Preview', number: 1, nameFieldID: 'Preview_1' }, { title: 'Preview', number: 2, nameFieldID: 'Preview_2' }, { title: 'Preview', number: 3, nameFieldID: 'Preview_3' },
    ]

    templateObject.printOptions.set(options)

    // Methods

    let transactionheaderfields = [
        { label: "Order Date", type: "date", readonly: false, value: formatDate(new Date()), divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader", },
        { label: "Invoice Number", type: 'default', id: 'ponumber', value: '', readonly: false, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
        { label: 'Via', type: 'search', id: 'sltShipVia', listModalId: 'shipVia_modal', listModalTemp: 'shipviapop', colName: 'colShipName', editModalId: 'newShipVia_modal', editModalTemp: 'newshipvia', editable: true, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
        { label: 'Terms', type: 'search', id: 'sltTerms', listModalId: 'termsList_modal', listModalTemp: 'termlistpop', colName: 'colName', editModalId: 'newTerms_modal', editModalTemp: 'newtermspop', editable: true, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
        { label: 'Status', type: 'search', id: 'sltStatus', listModalId: 'statusPop_modal', listModalTemp: 'statuspop', colName: 'colStatusName', editModalId: 'newStatusPop_modal', editModalTemp: 'newstatuspop', editable: true, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
        { label: 'Reference', type: 'default', id: 'edtRef', value: '', readonly: false, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
        { label: 'Department', type: 'search', id: 'sltDept', listModalId: 'department_modal', listModalTemp: 'departmentpop', colName: 'colDeptName', editModalId: 'newDepartment_modal', editModalTemp: 'newdepartmentpop', editable: true, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
    ]
    templateObject.headerfields.set(transactionheaderfields);

    let transactionheaderbuttons = [
        { label: "Pay Now", class: 'btnTransaction payNow', id: 'btnPayNow', bsColor: 'success', icon: 'dollar-sign' },
        { label: "Payment", class: 'btnTransaction btnMakePayment', id: 'btnPayment', bsColor: 'primary' },
        { label: "Copy Bill", class: 'btnTransaction copyPO', id: 'btnCopyInvoice', bsColor: 'primary' }
    ]
    templateObject.headerbuttons.set(transactionheaderbuttons)

    let transactionfooterfields = [
        { label: 'Comments', id: "txaComment", name: "txaComment", row: 6 },
        { label: 'Picking Instructions', id: "txapickmemo", name: "txapickmemo", row: 6 },
    ];

    templateObject.tranasctionfooterfields.set(transactionfooterfields);
});

Template.billcard_temp.onRendered(() => {
    let templateObject = Template.instance();
    let tempObj = Template.instance();
    let utilityService = new UtilityService();
    let productService = new ProductService();
    let accountService = new AccountService();
    let purchaseService = new PurchaseBoardService();
    const taxRateService = new TaxRateService();
    let tableProductList;
    var splashArrayProductList = new Array();
    var splashArrayTaxRateList = new Array();
    const taxCodesList = [];
    let taxCodes = new Array();

    templateObject.getCurrencies = async function () {
        let currencyData = [];
        let dataObject = await getVS1Data("TCurrencyList");
        if (dataObject.length == 0) {
            taxRateService.getCurrencies().then(function (data) {
                for (let i in data.tcurrencylist) {
                    let currencyObj = {
                        id: data.tcurrencylist[i].CurrencyID || "",
                        currency: data.tcurrencylist[i].Currency || "",
                        currencySellRate: data.tcurrencylist[i].SellRate || "",
                        currencyBuyRate: data.tcurrencylist[i].BuyRate || "",
                        currencyCode: data.tcurrencylist[i].Code || "",
                    };

                    currencyData.push(currencyObj);
                }
                templateObject.currencyData.set(currencyData);
            });
        } else {
            let data = JSON.parse(dataObject[0].data);
            let useData = data.tcurrencylist;
            for (let i in useData) {
                let currencyObj = {
                    id: data.tcurrencylist[i].CurrencyID || "",
                    currency: data.tcurrencylist[i].Currency || "",
                    currencySellRate: data.tcurrencylist[i].SellRate || "",
                    currencyBuyRate: data.tcurrencylist[i].BuyRate || "",
                    currencyCode: data.tcurrencylist[i].Code || "",
                };

                currencyData.push(currencyObj)
            }
            templateObject.currencyData.set(currencyData);
        }
    }
    templateObject.getCurrencies();
    templateObject.getCurrencyRate = (currency, type) => {
        let currencyData = templateObject.currencyData.get();
        for (let i = 0; i < currencyData.length; i++) {
            if (currencyData[i].currencyCode == currency || currencyData[i].currency == currency) {
                if (type == 0) return currencyData[i].currencySellRate;
                else return currencyData[i].currencyBuyRate;
            }
        };
    };


    templateObject.setSupplierInfo = () => {
        if (!FlowRouter.current().queryParams.supplierid) {
            // $('#supplierListModal').modal('toggle');
        }
        let utilityService = new UtilityService();
        let taxcodeList = templateObject.taxraterecords.get();
        let $tblrows = $("#tblBillLine tbody tr");
        let lineAmount = 0;
        let subGrandTotal = 0;
        let taxGrandTotal = 0;
        let taxGrandTotalPrint = 0;
        $tblrows.each(function (index) {
            let taxTotal;
            const $tblrow = $(this);
            const amount = $tblrow.find(".colAmountExChange").val() || 0;
            const taxcode = $tblrow.find(".lineTaxCode").val() || '';
            if ($tblrow.find(".lineAccountName").val() === '') {
                $tblrow.find(".colAccountName").addClass('boldtablealertsborder');
            }
            let taxrateamount = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename === taxcode) {
                        taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                    }
                }
            }
            const subTotal = parseFloat(amount) || 0;
            if ((taxrateamount === '') || (taxrateamount === ' ')) {
                taxTotal = 0;
            } else {
                taxTotal = parseFloat(amount) * parseFloat(taxrateamount);
            }
            $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
            if (!isNaN(subTotal)) {
                $tblrow.find('.colAmountExChange').val(utilityService.modifynegativeCurrencyFormat(subTotal.toFixed(2)));
                let totalAmountInc = (parseFloat(subTotal)) + (parseFloat(taxTotal)) || 0;
                $tblrow.find('.colAmountIncChange').val(utilityService.modifynegativeCurrencyFormat(totalAmountInc.toFixed(2)));
                subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal.toFixed(2));
            }
            if (!isNaN(taxTotal)) {
                taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
                document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal.toFixed(2));
            }
            if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
            }
        });
        $('#tblSupplierlist_filter .form-control-sm').val('');
        setTimeout(function () {
            $('.btnRefreshSupplier').trigger('click');
            LoadingOverlay.hide();
        }, 1000);
    }

    templateObject.setSupplierByID = (data) => {
        $('#edtSupplierName').val(data.fields.ClientName);
        $('#edtSupplierName').attr("suppid", data.fields.ID);
        $('#edtSupplierEmail').val(data.fields.Email);
        $('#edtSupplierEmail').attr('customerid', data.fields.ID);
        $('#edtSupplierName').attr('suppid', data.fields.ID);

        let postalAddress = data.fields.Companyname + '\n' + data.fields.Street + '\n' + data.fields.Street2 + ' ' + data.fields.State + ' ' + data.fields.Postcode + '\n' + data.fields.Country;
        $('#txabillingAddress').val(postalAddress);
        $('#pdfSupplierAddress').html(postalAddress);
        $('.pdfSupplierAddress').text(postalAddress);
        $('#txaShipingInfo').val(postalAddress);
        $('#sltTerms').val(data.fields.TermsName || purchaseDefaultTerms);
        templateObject.setSupplierInfo();
    }

    templateObject.getSupplierData = async (supplierID) => {
        getVS1Data('TSupplierVS1').then(function (dataObject) {
            if (dataObject.length === 0) {
                contactService.getOneSupplierDataEx(supplierID).then(function (data) {
                    templateObject.setSupplierByID(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tsuppliervs1;
                let added = false;
                for (let i = 0; i < useData.length; i++) {
                    if (parseInt(useData[i].fields.ID) === parseInt(supplierID)) {
                        added = true;
                        templateObject.setSupplierByID(useData[i]);
                    }
                }
                if (!added) {
                    contactService.getOneSupplierDataEx(supplierID).then(function (data) {
                        templateObject.setSupplierByID(data);
                    });
                }
            }
        }).catch(function (err) {
            contactService.getOneSupplierDataEx(supplierID).then(function (data) {
                LoadingOverlay.hide();
                templateObject.setSupplierByID(data);
            });
        });
    }

    // Functions for send email
    // templateObject.generatePdfForMail = async (invoiceId) => {
    //     let file = "Bill-" + invoiceId + ".pdf"
    //     return new Promise((resolve, reject) => {
    //         let completeTabRecord;
    //         let doc = new jsPDF('p', 'pt', 'a4');
    //         var source = document.getElementById('html-2-pdfwrapper');
    //         var opt = {
    //             margin: 0,
    //             filename: file,
    //             image: {
    //                 type: 'jpeg',
    //                 quality: 0.98
    //             },
    //             html2canvas: {
    //                 scale: 2
    //             },
    //             jsPDF: {
    //                 unit: 'in',
    //                 format: 'a4',
    //                 orientation: 'portrait'
    //             }
    //         }
    //         resolve(html2pdf().set(opt).from(source).toPdf().output('datauristring'));

    //     });
    // }
    // templateObject.addAttachment = async (objDetails) => {
    //     let attachment = [];
    //     let invoiceId = objDetails.fields.ID;
    //     let encodedPdf = await templateObject.generatePdfForMail(invoiceId);
    //     let pdfObject = "";

    //     let base64data = encodedPdf.split(',')[1];
    //     pdfObject = {
    //         filename: 'Bill-' + invoiceId + '.pdf',
    //         content: base64data,
    //         encoding: 'base64'
    //     };
    //     attachment.push(pdfObject);
    //     let erpInvoiceId = objDetails.fields.ID;
    //     let mailFromName = localStorage.getItem('vs1companyName');
    //     let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
    //     let customerEmailName = $('#edtSupplierName').val();
    //     let checkEmailData = $('#edtSupplierEmail').val();
    //     // let grandtotal = $('#grandTotal').html();
    //     // let amountDueEmail = $('#totalBalanceDue').html();
    //     // let emailDueDate = $("#dtDueDate").val();
    //     let mailSubject = 'Bill ' + erpInvoiceId + ' from ' + mailFromName + ' for ' + customerEmailName;
    //     var htmlmailBody = generateHtmlMailBody(erpInvoiceId);

    //     if (($('.chkEmailCopy').is(':checked')) && ($('.chkEmailRep').is(':checked'))) {
    //         Meteor.call('sendEmail', {
    //             from: "" + mailFromName + " <" + mailFrom + ">",
    //             to: checkEmailData,
    //             subject: mailSubject,
    //             text: '',
    //             html: htmlmailBody,
    //             attachments: attachment
    //         }, function (error, result) {
    //         });

    //         Meteor.call('sendEmail', {
    //             from: "" + mailFromName + " <" + mailFrom + ">",
    //             to: mailFrom,
    //             subject: mailSubject,
    //             text: '',
    //             html: htmlmailBody,
    //             attachments: attachment
    //         }, function (error, result) {
    //             if (error && error.error === "error") {
    //             } else {
    //                 $('#html-2-pdfwrapper').css('display', 'none');
    //                 swal({
    //                     title: 'SUCCESS',
    //                     text: "Email Sent To Supplier: " + checkEmailData + " and User: " + mailFrom + "",
    //                     type: 'success',
    //                     showCancelButton: false,
    //                     confirmButtonText: 'OK'
    //                 })
    //                 LoadingOverlay.hide();
    //             }
    //         });
    //     } else if (($('.chkEmailCopy').is(':checked'))) {

    //         Meteor.call('sendEmail', {
    //             from: "" + mailFromName + " <" + mailFrom + ">",
    //             to: checkEmailData,
    //             subject: mailSubject,
    //             text: '',
    //             html: htmlmailBody,
    //             attachments: attachment
    //         }, function (error, result) {
    //             if (error && error.error === "error") {
    //             } else {
    //                 $('#html-2-pdfwrapper').css('display', 'none');
    //                 swal({
    //                     title: 'SUCCESS',
    //                     text: "Email Sent To Supplier: " + checkEmailData + " ",
    //                     type: 'success',
    //                     showCancelButton: false,
    //                     confirmButtonText: 'OK'
    //                 })
    //                 LoadingOverlay.hide();
    //             }
    //         });
    //     } else if (($('.chkEmailRep').is(':checked'))) {

    //         Meteor.call('sendEmail', {
    //             from: "" + mailFromName + " <" + mailFrom + ">",
    //             to: mailFrom,
    //             subject: mailSubject,
    //             text: '',
    //             html: htmlmailBody,
    //             attachments: attachment
    //         }, function (error, result) {
    //             if (error && error.error === "error") {
    //             } else {
    //                 $('#html-2-pdfwrapper').css('display', 'none');
    //                 swal({
    //                     title: 'SUCCESS',
    //                     text: "Email Sent To User: " + mailFrom + " ",
    //                     type: 'success',
    //                     showCancelButton: false,
    //                     confirmButtonText: 'OK'
    //                 })
    //                 LoadingOverlay.hide();
    //             }
    //         });
    //     }
    // }

    // templateObject.sendEmailWithAttachment = async () => {
    //     let uploadedItems = templateObject.uploadedFiles.get();
    //     saveCurrencyHistory();

    //     let suppliername = $('#edtSupplierName');

    //     let termname = $('#sltTerms').val() || '';
    //     if (termname === '') {
    //         swal({
    //             title: "Terms has not been selected!",
    //             text: '',
    //             type: 'warning',
    //         }).then((result) => {
    //             if (result.value) {
    //                 $('#sltTerms').focus();
    //             } else if (result.dismiss == 'cancel') {

    //             }
    //         });
    //         event.preventDefault();
    //         return false;
    //     }
    //     if (suppliername.val() === '') {
    //         swal({
    //             title: "Supplier has not been selected!",
    //             text: '',
    //             type: 'warning',
    //         }).then((result) => {
    //             if (result.value) {
    //                 $('#edtSupplierName').focus();
    //             } else if (result.dismiss == 'cancel') {

    //             }
    //         });
    //         e.preventDefault();
    //         return false;
    //     }
    //     $('.fullScreenSpin').css('display', 'inline-block');
    //     var splashLineArray = new Array();
    //     let lineItemsForm = [];
    //     let lineItemObjForm = {};
    //     $('#tblBillLine > tbody > tr').each(function () {
    //         var lineID = this.id;
    //         let tdaccount = $('#' + lineID + " .lineAccountName").val();
    //         let tddmemo = $('#' + lineID + " .lineMemo").text();
    //         let tdamount = $('#' + lineID + " .lineAmount").val();
    //         let tdCustomerJob = $('#' + lineID + " .lineCustomerJob").val();
    //         let tdtaxrate = $('#' + lineID + " .lineTaxRate").text();
    //         let tdtaxCode = $('#' + lineID + " .lineTaxCode").val() || "NT";

    //         if (tdaccount != "") {

    //             lineItemObjForm = {
    //                 type: "TBillLine",
    //                 fields: {
    //                     AccountName: tdaccount || '',
    //                     ProductDescription: tddmemo || '',
    //                     CustomerJob: tdCustomerJob || '',
    //                     LineCost: Number(tdamount.replace(/[^0-9.-]+/g, "")) || 0,
    //                     LineTaxCode: tdtaxCode || '',
    //                     LineClassName: $('#sltDept').val() || defaultDept
    //                 }
    //             };
    //             lineItemsForm.push(lineItemObjForm);
    //             splashLineArray.push(lineItemObjForm);
    //         }
    //     });
    //     let getchkcustomField1 = true;
    //     let getchkcustomField2 = true;
    //     let getcustomField1 = $('.customField1Text').html();
    //     let getcustomField2 = $('.customField2Text').html();
    //     if ($('#formCheck-one').is(':checked')) {
    //         getchkcustomField1 = false;
    //     }
    //     if ($('#formCheck-two').is(':checked')) {
    //         getchkcustomField2 = false;
    //     }

    //     let supplier = $('#edtSupplierName').val();
    //     let supplierEmail = $('#edtSupplierEmail').val();
    //     let billingAddress = $('#txabillingAddress').val();

    //     var saledateTime = new Date($("#dtSODate").datepicker("getDate"));
    //     var duedateTime = new Date($("#dtDueDate").datepicker("getDate"));

    //     let saleDate = saledateTime.getFullYear() + "-" + (saledateTime.getMonth() + 1) + "-" + saledateTime.getDate();
    //     let dueDate = duedateTime.getFullYear() + "-" + (duedateTime.getMonth() + 1) + "-" + duedateTime.getDate();

    //     let poNumber = $('#ponumber').val();
    //     let reference = $('#edtRef').val();

    //     let departement = $('#sltVia').val();
    //     let shippingAddress = $('#txaShipingInfo').val();
    //     let comments = $('#txaComment').val();
    //     let pickingInfrmation = $('#txapickmemo').val();

    //     let saleCustField1 = $('#edtSaleCustField1').val();
    //     let saleCustField2 = $('#edtSaleCustField2').val();
    //     let orderStatus = $('#edtStatus').val();
    //     let billTotal = $('#grandTotal').text();

    //     var url = FlowRouter.current().path;
    //     var getso_id = url.split('?id=');
    //     var currentBill = getso_id[getso_id.length - 1];

    //     var currencyCode = $(".sltCurrency").val() || CountryAbbr;
    //     let ForeignExchangeRate = $('#exchange_rate').val() || 0;
    //     let foreignCurrencyFields = {}
    //     if (FxGlobalFunctions.isCurrencyEnabled()) {
    //         foreignCurrencyFields = {
    //             ForeignExchangeCode: currencyCode,
    //             ForeignExchangeRate: parseFloat(ForeignExchangeRate),
    //         }
    //     }

    //     var objDetails = '';
    //     if ($('#sltDept').val() === '') {
    //         swal({
    //             title: "Department has not been selected!",
    //             text: '',
    //             type: 'warning',
    //         }).then((result) => {
    //             if (result.value) {
    //                 $('#sltDept').focus();
    //             } else if (result.dismiss == 'cancel') {

    //             }
    //         });
    //         LoadingOverlay.hide();
    //         event.preventDefault();
    //         return false;
    //     }
    //     if (getso_id[1]) {
    //         currentBill = parseInt(currentBill);
    //         objDetails = {
    //             type: "TBillEx",
    //             fields: {
    //                 ID: currentBill,
    //                 SupplierName: supplier,
    //                 ...foreignCurrencyFields,
    //                 Lines: splashLineArray,
    //                 OrderTo: billingAddress,
    //                 Deleted: false,
    //                 OrderDate: saleDate,
    //                 SupplierInvoiceNumber: poNumber,
    //                 ConNote: reference,
    //                 TermsName: termname,
    //                 Shipping: departement,
    //                 ShipTo: shippingAddress,
    //                 Comments: comments,
    //                 SalesComments: pickingInfrmation,
    //                 Attachments: uploadedItems,
    //                 OrderStatus: $('#sltStatus').val(),
    //                 BillTotal: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0,
    //                 TotalAmountInc: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0
    //             }
    //         };
    //     } else {
    //         objDetails = {
    //             type: "TBillEx",
    //             fields: {
    //                 SupplierName: supplier,
    //                 ...foreignCurrencyFields,
    //                 Lines: splashLineArray,
    //                 OrderTo: billingAddress,
    //                 OrderDate: saleDate,
    //                 Deleted: false,
    //                 SupplierInvoiceNumber: poNumber,
    //                 ConNote: reference,
    //                 TermsName: termname,
    //                 Shipping: departement,
    //                 ShipTo: shippingAddress,
    //                 Comments: comments,
    //                 SalesComments: pickingInfrmation,
    //                 Attachments: uploadedItems,
    //                 OrderStatus: $('#sltStatus').val(),
    //                 BillTotal: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0,
    //                 TotalAmountInc: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0
    //             }
    //         };
    //     }

    //     var htmlmailBody = generateHtmlMailBody(objDetails.fields.ID || '') 
    //     await  addAttachment("Bill", "Customer", objDetails.fields.ID || '', htmlmailBody, 'billlist', 12,  'html-2-pdfwrapper', '', true)
        
    // }

    // templateObject.hasFollowings = async function () {
    //     var currentDate = new Date();
    //     let purchaseService = new PurchaseBoardService();
    //     var url = FlowRouter.current().path;
    //     var getso_id = url.split("?id=");
    //     var currentInvoice = getso_id[getso_id.length - 1];
    //     if (getso_id[1]) {
    //         currentInvoice = parseInt(currentInvoice);
    //         var billData = await purchaseService.getOneBilldataEx(currentInvoice);
    //         var isRepeated = billData.fields.RepeatedFrom;
    //         templateObject.hasFollow.set(isRepeated);
    //     }
    // }
    // templateObject.hasFollowings();
    $('#edtFrequencyDetail').css('display', 'none');
    $("#date-input,#edtWeeklyStartDate,#edtWeeklyFinishDate,#dtDueDate,#customdateone,#edtMonthlyStartDate,#edtMonthlyFinishDate,#edtDailyStartDate,#edtDailyFinishDate,#edtOneTimeOnlyDate").datepicker({
        showOn: 'button',
        buttonText: 'Show Date',
        buttonImageOnly: true,
        buttonImage: '/img/imgCal2.png',
        constrainInput: false,
        dateFormat: 'd/mm/yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: "-90:+10",
    });

    // templateObject.getDayNumber = function (day) {
    //     day = day.toLowerCase();
    //     if (day == "") {
    //         return;
    //     }
    //     if (day == "monday") {
    //         return 1;
    //     }
    //     if (day == "tuesday") {
    //         return 2;
    //     }
    //     if (day == "wednesday") {
    //         return 3;
    //     }
    //     if (day == "thursday") {
    //         return 4;
    //     }
    //     if (day == "friday") {
    //         return 5;
    //     }
    //     if (day == "saturday") {
    //         return 6;
    //     }
    //     if (day == "sunday") {
    //         return 0;
    //     }
    // }
    templateObject.getMonths = function (startDate, endDate) {
        let dateone = "";
        let datetwo = "";
        if (startDate != "") {
            dateone = moment(startDate).format('M');
        }
        if (endDate != "") {
            datetwo = parseInt(moment(endDate).format('M')) + 1;
        }
        if (dateone != "" && datetwo != "") {
            for (let x = dateone; x < datetwo; x++) {
                if (x == 1) {
                    $("#formCheck-january").prop('checked', true);
                }
                if (x == 2) {
                    $("#formCheck-february").prop('checked', true);
                }
                if (x == 3) {
                    $("#formCheck-march").prop('checked', true);
                }
                if (x == 4) {
                    $("#formCheck-april").prop('checked', true);
                }
                if (x == 5) {
                    $("#formCheck-may").prop('checked', true);
                }
                if (x == 6) {
                    $("#formCheck-june").prop('checked', true);
                }
                if (x == 7) {
                    $("#formCheck-july").prop('checked', true);
                }
                if (x == 8) {
                    $("#formCheck-august").prop('checked', true);
                }
                if (x == 9) {
                    $("#formCheck-september").prop('checked', true);
                }
                if (x == 10) {
                    $("#formCheck-october").prop('checked', true);
                }
                if (x == 11) {
                    $("#formCheck-november").prop('checked', true);
                }
                if (x == 12) {
                    $("#formCheck-december").prop('checked', true);
                }
            }
        }
        if (dateone == "") {
            $("#formCheck-january").prop('checked', true);
        }
    }

    // $('#choosetemplate').attr('checked', true);


    // templateObject.getOrganisationDetails = function () {
    //     let account_id = localStorage.getItem('vs1companyStripeID') || '';
    //     let stripe_fee = localStorage.getItem('vs1companyStripeFeeMethod') || 'apply';
    //     templateObject.accountID.set(account_id);
    //     templateObject.stripe_fee_method.set(stripe_fee);
    // };
    // templateObject.getOrganisationDetails();

    templateObject.getLastBillData = async function () {
        let lastBankAccount = "Bank";
        let lastDepartment = defaultDept || "";
        purchaseService.getLastBillID().then(function (data) {
            let latestBillId;
            if (data.tbill.length > 0) {
                lastBill = data.tbill[data.tbill.length - 1]
                latestBillId = (lastBill.Id);
            } else {
                latestBillId = 0;
            }
            newBillId = (latestBillId + 1);
            setTimeout(function () {
                $('#sltDept').val(lastDepartment);
                if (FlowRouter.current().queryParams.id) {

                } else {
                    // $(".heading").html("New Bill " +newBillId +'<a role="button" class="btn btn-success" data-toggle="modal" href="#supportModal" style="margin-left: 12px;">Help <i class="fa fa-question-circle-o" style="font-size: 20px;"></i></a>');
                };
            }, 50);
        }).catch(function (err) {
            $('#sltDept').val(lastDepartment);
        });
    };

    const dataListTable = [
        ' ' || '',
        ' ' || '',
        0 || 0,
        0.00 || 0.00,
        ' ' || '',
        0.00 || 0.00,
        '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 btnRemove"><i class="fa fa-remove"></i></button></span>'
    ];
    $(window).on('load', function () {
        var win = $(this); //this = window
        if (win.width() <= 1024 && win.width() >= 450) {
            $("#colBalanceDue").addClass("order-12");
        }
        if (win.width() <= 926) {
            $("#totalSection").addClass("offset-md-6");
        }



    });

    // $(document).on("click", ".templateItem .btnPreviewTemplate", function (e) {

    //     title = $(this).parent().attr("data-id");
    //     number = $(this).parent().attr("data-template-id");//e.getAttribute("data-template-id");
    //     templateObject.generateInvoiceData(title, number);

    // });


    // function showBillData1(template_title, number, bprint) {
    //     var array_data = [];
    //     let lineItems = [];
    //     let taxItems = {};
    //     object_invoce = [];
    //     let item_invoices = '';

    //     let invoice_data = templateObject.billrecord.get();
    //     let stripe_id = templateObject.accountID.get() || '';
    //     let stripe_fee_method = templateObject.stripe_fee_method.get();
    //     var erpGet = erpDb();

    //     var customfield1 = $('#edtSaleCustField1').val() || '  ';
    //     var customfield2 = $('#edtSaleCustField2').val() || '  ';
    //     var customfield3 = $('#edtSaleCustField3').val() || '  ';

    //     var customfieldlabel1 = $('.lblCustomField1').first().text() || 'Custom Field 1';
    //     var customfieldlabel2 = $('.lblCustomField2').first().text() || 'Custom Field 2';
    //     var customfieldlabel3 = $('.lblCustomField3').first().text() || 'Custom Field 3';
    //     let balancedue = $('#totalBalanceDue').html() || 0;
    //     let tax = $('#subtotal_tax').html() || 0;
    //     let customer = $('#edtCustomerName').val();
    //     let name = $('#firstname').val();
    //     let surname = $('#lastname').val();
    //     let dept = $('#sltDept').val();
    //     let fx = $('.sltCurrency').val();
    //     var comment = $('#txaComment').val();
    //     var parking_instruction = $('#txapickmemo').val();
    //     var subtotal_tax = $('#subtotal_tax').html() || '$' + 0;
    //     var total_paid = $('#totalPaidAmt').html() || '$' + 0;
    //     var ref = $('#edtRef').val() || '-';
    //     var txabillingAddress = $('#txabillingAddress').val() || '';
    //     var dtSODate = $('#dtSODate').val();
    //     var subtotal_total = $('#subtotal_total').text() || '$' + 0;
    //     var grandTotal = $('#grandTotal').text() || '$' + 0;
    //     var duedate = $('#dtDueDate').val();
    //     var po = $('#ponumber').val() || '.';


    //     $('#tblBillLine > tbody > tr').each(function () {

    //         var lineID = this.id;
    //         let accountName = $('#' + lineID + " .es-input").val();
    //         let colMemo = $('#' + lineID + " .colMemo").text();
    //         let colTaxAmount = $('#' + lineID + " .colTaxAmount").first().text();

    //         let colAmount = $('#' + lineID + " .colAmount").first().text();

    //         let targetRow = $('#' + lineID);
    //         let targetTaxCode = targetRow.find('.lineTaxCode').val();
    //         let qty = targetRow.find(".lineQty").val() || 0
    //         let price = targetRow.find('.colUnitPriceExChange').val() || '';
    //         const taxDetail = templateObject.taxcodes.get().find((v) => v.CodeName === targetTaxCode);

    //         if (taxDetail) {
    //             let priceTotal = utilityService.convertSubstringParseFloat(colAmount);
    //             let taxTotal = priceTotal * parseFloat(taxDetail.Rate);
    //             if (taxDetail.Lines) {
    //                 taxDetail.Lines.map((line) => {
    //                     let taxCode = line.SubTaxCode;
    //                     let amount = priceTotal * line.Percentage / 100;
    //                     if (taxItems[taxCode]) {
    //                         taxItems[taxCode] += amount;
    //                     }
    //                     else {
    //                         taxItems[taxCode] = amount;
    //                     }
    //                 });
    //             }
    //             else {
    //                 // taxItems[targetTaxCode] = taxTotal;
    //             }
    //         }

    //         array_data.push([
    //             accountName,
    //             colMemo,
    //             colTaxAmount,
    //             colAmount,

    //         ]);


    //     });

    //     let company = localStorage.getItem('vs1companyName');
    //     let vs1User = localStorage.getItem('mySession');
    //     let customerEmail = $('#edtCustomerEmail').val();
    //     let id = $('.printID').attr("id") || "new";
    //     let currencyname = (CountryAbbr).toLowerCase();
    //     stringQuery = "?";
    //     var customerID = $('#edtCustomerEmail').attr('customerid');
    //     for (let l = 0; l < lineItems.length; l++) {
    //         stringQuery = stringQuery + "product" + l + "=" + lineItems[l].description + "&price" + l + "=" + lineItems[l].unitPrice + "&qty" + l + "=" + lineItems[l].quantity + "&";
    //     }
    //     stringQuery = stringQuery + "tax=" + tax + "&total=" + grandTotal + "&customer=" + customer + "&name=" + name + "&surname=" + surname + "&quoteid=" + invoice_data.id + "&transid=" + stripe_id + "&feemethod=" + stripe_fee_method + "&company=" + company + "&vs1email=" + vs1User + "&customeremail=" + customerEmail + "&type=Invoice&url=" + window.location.href + "&server=" + erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase + "&port=" + erpGet.ERPPort + "&dept=" + dept + "&currency=" + currencyname;
    //     $(".linkText").attr("href", stripeGlobalURL + stringQuery);



    //     if (number == 1) {
    //         item_invoices = {

    //             o_url: localStorage.getItem('vs1companyURL'),
    //             o_name: localStorage.getItem('vs1companyName'),
    //             o_address: localStorage.getItem('vs1companyaddress1'),
    //             o_city: localStorage.getItem('vs1companyCity'),
    //             o_state: localStorage.getItem('companyState') + ' ' + localStorage.getItem('vs1companyPOBox'),
    //             o_reg: Template.new_invoice.__helpers.get('companyReg').call(),
    //             o_abn: Template.new_invoice.__helpers.get('companyabn').call(),
    //             o_phone: Template.new_invoice.__helpers.get('companyphone').call(),
    //             title: 'Bill',
    //             value: invoice_data.id,
    //             date: dtSODate,
    //             invoicenumber: invoice_data.id,
    //             refnumber: "",
    //             pqnumber: "",
    //             duedate: "",
    //             paylink: "",
    //             supplier_type: "Supplier",
    //             supplier_name: customer,
    //             supplier_addr: txabillingAddress,
    //             fields: {
    //                 "Account Name": ["30", "left"],
    //                 "Description": ["40", "left"],
    //                 "Tax": ["15", "right"],
    //                 "Amount": ["15", "right"]
    //             },
    //             subtotal: subtotal_total,
    //             gst: subtotal_tax,
    //             total: grandTotal,
    //             paid_amount: total_paid,
    //             bal_due: balancedue,
    //             bsb: Template.new_invoice.__helpers.get("vs1companyBankBSB").call(),
    //             account: Template.new_invoice.__helpers
    //                 .get("vs1companyBankAccountNo")
    //                 .call(),
    //             swift: Template.new_invoice.__helpers
    //                 .get("vs1companyBankSwiftCode")
    //                 .call(),
    //             data: array_data,
    //             customfield1: 'NA',
    //             customfield2: 'NA',
    //             customfield3: 'NA',
    //             customfieldlabel1: 'NA',
    //             customfieldlabel2: 'NA',
    //             customfieldlabel3: 'NA',
    //             applied: "",
    //             showFX: "",
    //             comment: comment,
    //         };

    //     }
    //     else if (number == 2) {
    //         item_invoices = {
    //             o_url: localStorage.getItem('vs1companyURL'),
    //             o_name: localStorage.getItem('vs1companyName'),
    //             o_address: localStorage.getItem('vs1companyaddress1'),
    //             o_city: localStorage.getItem('vs1companyCity'),
    //             o_state: localStorage.getItem('companyState') + ' ' + localStorage.getItem('vs1companyPOBox'),
    //             o_reg: Template.new_invoice.__helpers.get('companyReg').call(),
    //             o_abn: Template.new_invoice.__helpers.get('companyabn').call(),
    //             o_phone: Template.new_invoice.__helpers.get('companyphone').call(),
    //             title: 'Bill',
    //             value: invoice_data.id,
    //             date: dtSODate,
    //             invoicenumber: invoice_data.id,
    //             refnumber: "",
    //             pqnumber: "",
    //             duedate: "",
    //             paylink: "",
    //             supplier_type: "Supplier",
    //             supplier_name: customer,
    //             supplier_addr: txabillingAddress,
    //             fields: {
    //                 "Account Name": ["30", "left"],
    //                 "Description": ["40", "left"],
    //                 "Tax": ["15", "right"],
    //                 "Amount": ["15", "right"]
    //             },
    //             subtotal: subtotal_total,
    //             gst: subtotal_tax,
    //             total: grandTotal,
    //             paid_amount: total_paid,
    //             bal_due: balancedue,
    //             bsb: Template.new_invoice.__helpers.get("vs1companyBankBSB").call(),
    //             account: Template.new_invoice.__helpers
    //                 .get("vs1companyBankAccountNo")
    //                 .call(),
    //             swift: Template.new_invoice.__helpers
    //                 .get("vs1companyBankSwiftCode")
    //                 .call(),
    //             data: array_data,
    //             customfield1: customfield1,
    //             customfield2: customfield2,
    //             customfield3: customfield3,
    //             customfieldlabel1: customfieldlabel1,
    //             customfieldlabel2: customfieldlabel2,
    //             customfieldlabel3: customfieldlabel3,
    //             applied: "",
    //             showFX: "",
    //             comment: comment,
    //         };

    //     }
    //     else {
    //         item_invoices = {
    //             o_url: localStorage.getItem('vs1companyURL'),
    //             o_name: localStorage.getItem('vs1companyName'),
    //             o_address: localStorage.getItem('vs1companyaddress1'),
    //             o_city: localStorage.getItem('vs1companyCity'),
    //             o_state: localStorage.getItem('companyState') + ' ' + localStorage.getItem('vs1companyPOBox'),
    //             o_reg: Template.new_invoice.__helpers.get('companyReg').call(),
    //             o_abn: Template.new_invoice.__helpers.get('companyabn').call(),
    //             o_phone: Template.new_invoice.__helpers.get('companyphone').call(),
    //             title: 'Bill',
    //             value: invoice_data.id,
    //             date: dtSODate,
    //             invoicenumber: invoice_data.id,
    //             refnumber: "",
    //             pqnumber: "",
    //             duedate: "",
    //             paylink: "",
    //             supplier_type: "Supplier",
    //             supplier_name: customer,
    //             supplier_addr: txabillingAddress,
    //             fields: {
    //                 "Account Name": ["30", "left"],
    //                 "Description": ["40", "left"],
    //                 "Tax": ["15", "right"],
    //                 "Amount": ["15", "right"]
    //             },
    //             subtotal: subtotal_total,
    //             gst: subtotal_tax,
    //             total: grandTotal,
    //             paid_amount: total_paid,
    //             bal_due: balancedue,
    //             bsb: Template.new_invoice.__helpers.get("vs1companyBankBSB").call(),
    //             account: Template.new_invoice.__helpers
    //                 .get("vs1companyBankAccountNo")
    //                 .call(),
    //             swift: Template.new_invoice.__helpers
    //                 .get("vs1companyBankSwiftCode")
    //                 .call(),
    //             data: array_data,
    //             customfield1: customfield1,
    //             customfield2: customfield2,
    //             customfield3: customfield3,
    //             customfieldlabel1: customfieldlabel1,
    //             customfieldlabel2: customfieldlabel2,
    //             customfieldlabel3: customfieldlabel3,
    //             applied: "",
    //             showFX: fx,
    //             comment: comment,
    //         };

    //     }

    //     item_invoices.taxItems = taxItems;

    //     object_invoce.push(item_invoices);

    //     $("#templatePreviewModal .field_payment").show();
    //     $("#templatePreviewModal .field_amount").show();

    //     if (bprint == false) {
    //         $("#html-2-pdfwrapper_quotes").css("width", "90%");
    //         $("#html-2-pdfwrapper_quotes2").css("width", "90%");
    //         $("#html-2-pdfwrapper_quotes3").css("width", "90%");
    //     } else {
    //         $("#html-2-pdfwrapper_quotes").css("width", "210mm");
    //         $("#html-2-pdfwrapper_quotes2").css("width", "210mm");
    //         $("#html-2-pdfwrapper_quotes3").css("width", "210mm");
    //     }

    //     if (number == 1) {
    //         updateTemplate1(object_invoce, bprint);
    //     } else if (number == 2) {
    //         updateTemplate2(object_invoce, bprint);
    //     } else {
    //         updateTemplate3(object_invoce, bprint);
    //     }

    //     saveTemplateFields("fields" + template_title, object_invoce[0]["fields"]);


    // }

    // function showBillData(template_title, number) {
    //     var array_data = [];
    //     let lineItems = [];
    //     let taxItems = {};
    //     object_invoce = [];
    //     let item_invoices = '';

    //     let invoice_data = templateObject.billrecord.get();
    //     let stripe_id = templateObject.accountID.get() || '';
    //     let stripe_fee_method = templateObject.stripe_fee_method.get();
    //     var erpGet = erpDb();

    //     var customfield1 = $('#edtSaleCustField1').val() || '  ';
    //     var customfield2 = $('#edtSaleCustField2').val() || '  ';
    //     var customfield3 = $('#edtSaleCustField3').val() || '  ';

    //     var customfieldlabel1 = $('.lblCustomField1').first().text() || 'Custom Field 1';
    //     var customfieldlabel2 = $('.lblCustomField2').first().text() || 'Custom Field 2';
    //     var customfieldlabel3 = $('.lblCustomField3').first().text() || 'Custom Field 3';
    //     let balancedue = $('#totalBalanceDue').html() || 0;
    //     let tax = $('#subtotal_tax').html() || 0;
    //     let customer = $('#edtCustomerName').val();
    //     let name = $('#firstname').val();
    //     let surname = $('#lastname').val();
    //     let dept = $('#sltDept').val();
    //     let fx = $('.sltCurrency').val();
    //     var comment = $('#txaComment').val();
    //     var parking_instruction = $('#txapickmemo').val();
    //     var subtotal_tax = $('#subtotal_tax').html() || '$' + 0;
    //     var total_paid = $('#totalPaidAmt').html() || '$' + 0;
    //     var ref = $('#edtRef').val() || '';
    //     var txabillingAddress = $('#txabillingAddress').val() || '';
    //     var dtSODate = $('#dtSODate').val();
    //     var subtotal_total = $('#subtotal_total').text() || '$' + 0;
    //     var grandTotal = $('#grandTotal').text() || '$' + 0;
    //     var duedate = $('#dtDueDate').val();
    //     var po = $('#ponumber').val() || '';


    //     $('#tblBillLine > tbody > tr').each(function () {

    //         var lineID = this.id;
    //         let accountName = $('#' + lineID + " .es-input").val();
    //         let colMemo = $('#' + lineID + " .colMemo").text();
    //         let colTaxAmount = $('#' + lineID + " .colTaxAmount").text();

    //         let colAmount = $('#' + lineID + " .colAmount").val();

    //         let targetRow = $('#' + lineID);
    //         let targetTaxCode = targetRow.find('.lineTaxCode').val();
    //         let price = targetRow.find('.colAmount').val() || '';
    //         const taxDetail = templateObject.taxcodes.get().find((v) => v.CodeName === targetTaxCode);

    //         if (taxDetail) {
    //             let priceTotal = utilityService.convertSubstringParseFloat(colAmount);
    //             let taxTotal = priceTotal * parseFloat(taxDetail.Rate);
    //             if (taxDetail.Lines) {
    //                 taxDetail.Lines.map((line) => {
    //                     let taxCode = line.SubTaxCode;
    //                     let amount = priceTotal * line.Percentage / 100;
    //                     if (taxItems[taxCode]) {
    //                         taxItems[taxCode] += amount;
    //                     }
    //                     else {
    //                         taxItems[taxCode] = amount;
    //                     }
    //                 });
    //             }
    //             else {
    //                 // taxItems[targetTaxCode] = taxTotal;
    //             }
    //         }


    //         array_data.push([
    //             accountName,
    //             colMemo,
    //             colTaxAmount,
    //             colAmount,

    //         ]);


    //     });

    //     let company = localStorage.getItem('vs1companyName');
    //     let vs1User = localStorage.getItem('mySession');
    //     let customerEmail = $('#edtCustomerEmail').val();
    //     let id = $('.printID').attr("id") || "new";
    //     let currencyname = (CountryAbbr).toLowerCase();
    //     stringQuery = "?";
    //     var customerID = $('#edtCustomerEmail').attr('customerid');
    //     for (let l = 0; l < lineItems.length; l++) {
    //         stringQuery = stringQuery + "product" + l + "=" + lineItems[l].description + "&price" + l + "=" + lineItems[l].unitPrice + "&qty" + l + "=" + lineItems[l].quantity + "&";
    //     }
    //     stringQuery = stringQuery + "tax=" + tax + "&total=" + grandTotal + "&customer=" + customer + "&name=" + name + "&surname=" + surname + "&quoteid=" + invoice_data.id + "&transid=" + stripe_id + "&feemethod=" + stripe_fee_method + "&company=" + company + "&vs1email=" + vs1User + "&customeremail=" + customerEmail + "&type=Invoice&url=" + window.location.href + "&server=" + erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase + "&port=" + erpGet.ERPPort + "&dept=" + dept + "&currency=" + currencyname;
    //     $(".linkText").attr("href", stripeGlobalURL + stringQuery);



    //     if (number == 1) {
    //         item_invoices = {

    //             o_url: localStorage.getItem('vs1companyURL'),
    //             o_name: localStorage.getItem('vs1companyName'),
    //             o_address: localStorage.getItem('vs1companyaddress1'),
    //             o_city: localStorage.getItem('vs1companyCity'),
    //             o_state: localStorage.getItem('companyState') + ' ' + localStorage.getItem('vs1companyPOBox'),
    //             o_reg: Template.new_invoice.__helpers.get('companyReg').call(),
    //             o_abn: Template.new_invoice.__helpers.get('companyabn').call(),
    //             o_phone: Template.new_invoice.__helpers.get('companyphone').call(),
    //             title: 'Bill',
    //             value: invoice_data.id,
    //             date: dtSODate,
    //             invoicenumber: invoice_data.id,
    //             refnumber: "",
    //             pqnumber: "",
    //             duedate: "",
    //             paylink: "",
    //             supplier_type: "Supplier",
    //             supplier_name: customer,
    //             supplier_addr: txabillingAddress,
    //             fields: { "Account Name": "30", "Memo": "30", "Tax": "20", "Amount": "20" },
    //             subtotal: subtotal_total,
    //             gst: subtotal_tax,
    //             total: grandTotal,
    //             paid_amount: total_paid,
    //             bal_due: balancedue,
    //             bsb: '',
    //             account: '',
    //             swift: '',
    //             data: array_data,
    //             customfield1: 'NA',
    //             customfield2: 'NA',
    //             customfield3: 'NA',
    //             customfieldlabel1: 'NA',
    //             customfieldlabel2: 'NA',
    //             customfieldlabel3: 'NA',
    //             applied: "",
    //             showFX: "",
    //             comment: comment,
    //         };

    //     }
    //     else if (number == 2) {
    //         item_invoices = {
    //             o_url: localStorage.getItem('vs1companyURL'),
    //             o_name: localStorage.getItem('vs1companyName'),
    //             o_address: localStorage.getItem('vs1companyaddress1'),
    //             o_city: localStorage.getItem('vs1companyCity'),
    //             o_state: localStorage.getItem('companyState') + ' ' + localStorage.getItem('vs1companyPOBox'),
    //             o_reg: Template.new_invoice.__helpers.get('companyReg').call(),
    //             o_abn: Template.new_invoice.__helpers.get('companyabn').call(),
    //             o_phone: Template.new_invoice.__helpers.get('companyphone').call(),
    //             title: 'Bill',
    //             value: invoice_data.id,
    //             date: dtSODate,
    //             invoicenumber: invoice_data.id,
    //             refnumber: "",
    //             pqnumber: "",
    //             duedate: "",
    //             paylink: "",
    //             supplier_type: "Supplier",
    //             supplier_name: customer,
    //             supplier_addr: txabillingAddress,
    //             fields: { "Account Name": "30", "Memo": "30", "Tax": "20", "Amount": "20" },
    //             subtotal: subtotal_total,
    //             gst: subtotal_tax,
    //             total: grandTotal,
    //             paid_amount: total_paid,
    //             bal_due: balancedue,
    //             bsb: '',
    //             account: '',
    //             swift: '',
    //             data: array_data,
    //             customfield1: customfield1,
    //             customfield2: customfield2,
    //             customfield3: customfield3,
    //             customfieldlabel1: customfieldlabel1,
    //             customfieldlabel2: customfieldlabel2,
    //             customfieldlabel3: customfieldlabel3,
    //             applied: "",
    //             showFX: "",
    //             comment: comment,
    //         };

    //     }
    //     else {
    //         item_invoices = {
    //             o_url: localStorage.getItem('vs1companyURL'),
    //             o_name: localStorage.getItem('vs1companyName'),
    //             o_address: localStorage.getItem('vs1companyaddress1'),
    //             o_city: localStorage.getItem('vs1companyCity'),
    //             o_state: localStorage.getItem('companyState') + ' ' + localStorage.getItem('vs1companyPOBox'),
    //             o_reg: Template.new_invoice.__helpers.get('companyReg').call(),
    //             o_abn: Template.new_invoice.__helpers.get('companyabn').call(),
    //             o_phone: Template.new_invoice.__helpers.get('companyphone').call(),
    //             title: 'Bill',
    //             value: invoice_data.id,
    //             date: dtSODate,
    //             invoicenumber: invoice_data.id,
    //             refnumber: "",
    //             pqnumber: "",
    //             duedate: "",
    //             paylink: "",
    //             supplier_type: "Supplier",
    //             supplier_name: customer,
    //             supplier_addr: txabillingAddress,
    //             fields: { "Account Name": "30", "Memo": "30", "Tax": "20", "Amount": "20" },
    //             subtotal: subtotal_total,
    //             gst: subtotal_tax,
    //             total: grandTotal,
    //             paid_amount: total_paid,
    //             bal_due: balancedue,
    //             bsb: '',
    //             account: '',
    //             swift: '',
    //             data: array_data,
    //             customfield1: customfield1,
    //             customfield2: customfield2,
    //             customfield3: customfield3,
    //             customfieldlabel1: customfieldlabel1,
    //             customfieldlabel2: customfieldlabel2,
    //             customfieldlabel3: customfieldlabel3,
    //             applied: "",
    //             showFX: fx,
    //             comment: comment,
    //         };

    //     }

    //     item_invoices.taxItems = taxItems;

    //     object_invoce.push(item_invoices);
    //     $("#templatePreviewModal .field_payment").show();
    //     $("#templatePreviewModal .field_amount").show();
    //     updateTemplate(object_invoce);

    //     saveTemplateFields("fields" + template_title, object_invoce[0]["fields"]);

    // }

    // templateObject.generateInvoiceData = async function (template_title, number) {

    //     object_invoce = [];
    //     switch (template_title) {

    //         case "Bills":
    //             showBillData1(template_title, number, false);
    //             break;
    //     }

    //     let printSettings = await getPrintSettings(template_title, number);
    //     for (key in printSettings) {
    //         $('.' + key).css('display', printSettings[key][2] ? 'revert' : 'none');
    //     }

    // };
    let imageData = (localStorage.getItem("Image"));
    if (imageData) {
        $('.uploadedImage').attr('src', imageData);
    }
    const records = [];


    const clientList = [];
    const productsList = [];
    const accountsList = [];
    // const deptrecords = [];
    const viarecords = [];
    const termrecords = [];
    const statusList = [];
    const dataTableList = [];

    // $("#date-input,#dtSODate,#dtDueDate").datepicker({
    //     showOn: 'button',
    //     buttonText: 'Show Date',
    //     buttonImageOnly: true,
    //     buttonImage: '/img/imgCal2.png',
    //     dateFormat: 'dd/mm/yy',
    //     showOtherMonths: true,
    //     selectOtherMonths: true,
    //     changeMonth: true,
    //     changeYear: true,
    //     yearRange: "-90:+10",
    // });
    $(document).ready(function () {

        $('#formCheck-one').click(function () {

            if ($(event.target).is(':checked')) {
                $('.checkbox1div').css('display', 'block');
            } else {
                $('.checkbox1div').css('display', 'none');
            }
        });
        $('#formCheck-two').click(function () {

            if ($(event.target).is(':checked')) {
                $('.checkbox2div').css('display', 'block');
            } else {
                $('.checkbox2div').css('display', 'none');
            }
        });

        $('.customField1Text').blur(function () {
            var inputValue1 = $('.customField1Text').text();
            $('.lblCustomField1').text(inputValue1);
        });

        $('.customField2Text').blur(function () {
            var inputValue2 = $('.customField2Text').text();
            $('.lblCustomField2').text(inputValue2);
        });


    });
    $('.fullScreenSpin').css('display', 'inline-block');

    // templateObject.getAllClients = function () {
    //     getVS1Data('TSupplierVS1').then(function (dataObject) {
    //         if (dataObject.length === 0) {
    //             clientsService.getSupplierVS1().then(function (data) {
    //                 setClientVS1(data);
    //             });
    //         } else {
    //             let data = JSON.parse(dataObject[0].data);
    //             setClientVS1(data);
    //         }
    //     }).catch(function (err) {
    //         clientsService.getSupplierVS1().then(function (data) {
    //             setClientVS1(data);
    //         });
    //     });
    // };
    // function setClientVS1(data) {
    //     for (let i in data.tsuppliervs1) {
    //         if (data.tsuppliervs1.hasOwnProperty(i)) {
    //             let supplierrecordObj = {
    //                 supplierid: data.tsuppliervs1[i].Id || ' ',
    //                 suppliername: data.tsuppliervs1[i].ClientName || ' ',
    //                 supplieremail: data.tsuppliervs1[i].Email || ' ',
    //                 street: data.tsuppliervs1[i].Street || ' ',
    //                 street2: data.tsuppliervs1[i].Street2 || ' ',
    //                 street3: data.tsuppliervs1[i].Street3 || ' ',
    //                 suburb: data.tsuppliervs1[i].Suburb || ' ',
    //                 statecode: data.tsuppliervs1[i].State + ' ' + data.tsuppliervs1[i].Postcode || ' ',
    //                 country: data.tsuppliervs1[i].Country || ' ',
    //                 termsName: data.tsuppliervs1[i].TermsName || ''
    //             };
    //             clientList.push(supplierrecordObj);
    //         }
    //     }
    //     templateObject.clientrecords.set(clientList);

    //     for (let i = 0; i < clientList.length; i++) {
    //         //$('#edtSupplierName').editableSelect('add', clientList[i].customername);
    //     }
    //     if (FlowRouter.current().queryParams.id || FlowRouter.current().queryParams.supplierid) {

    //     } else {
    //         setTimeout(function () {
    //             $('#edtSupplierName').trigger("click");
    //         }, 200);
    //     }
    // }
    // templateObject.getAllClients();

    // templateObject.getAllLeadStatuss = function () {
    //     getVS1Data('TLeadStatusType').then(function (dataObject) {
    //         if (dataObject.length == 0) {
    //             clientsService.getAllLeadStatus().then(function (data) {
    //                 for (let i in data.tleadstatustype) {
    //                     let leadrecordObj = {
    //                         orderstatus: data.tleadstatustype[i].TypeName || ' '

    //                     };

    //                     statusList.push(leadrecordObj);
    //                 }
    //                 templateObject.statusrecords.set(statusList);


    //             });
    //         } else {
    //             let data = JSON.parse(dataObject[0].data);
    //             let useData = data.tleadstatustype;
    //             for (let i in useData) {
    //                 let leadrecordObj = {
    //                     orderstatus: useData[i].TypeName || ' '

    //                 };

    //                 statusList.push(leadrecordObj);
    //             }
    //             templateObject.statusrecords.set(statusList);

    //         }
    //         setTimeout(function () {
    //             $('#sltStatus').append('<option value="newstatus">New Lead Status</option>');
    //         }, 1500)
    //     }).catch(function (err) {
    //         clientsService.getAllLeadStatus().then(function (data) {
    //             for (let i in data.tleadstatustype) {
    //                 let leadrecordObj = {
    //                     orderstatus: data.tleadstatustype[i].TypeName || ' '

    //                 };

    //                 statusList.push(leadrecordObj);
    //             }
    //             templateObject.statusrecords.set(statusList);


    //         });
    //     });
    // };
    // templateObject.getAllLeadStatuss();

    templateObject.getAllSelectPaymentData = function () {
        let supplierNamer = $('#edtSupplierName').val() || '';
        purchaseService.getCheckPaymentDetailsByName(supplierNamer).then(function (data) {
            let lineItems = [];
            let lineItemObj = {};
            for (let i = 0; i < data.tsupplierpayment.length; i++) {
                let amount = utilityService.modifynegativeCurrencyFormat(data.tsupplierpayment[i].fields.Amount) || 0.00;
                let applied = utilityService.modifynegativeCurrencyFormat(data.tsupplierpayment[i].fields.Applied) || 0.00;
                // Currency+''+data.tsupplierpayment[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                let balance = utilityService.modifynegativeCurrencyFormat(data.tsupplierpayment[i].fields.Balance) || 0.00;
                let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tsupplierpayment[i].fields.TotalPaid) || 0.00;
                let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tsupplierpayment[i].fields.TotalBalance) || 0.00;
                var dataList = {
                    id: data.tsupplierpayment[i].fields.ID || '',
                    sortdate: data.tsupplierpayment[i].fields.PaymentDate != '' ? moment(data.tsupplierpayment[i].fields.PaymentDate).format("YYYY/MM/DD") : data.tsupplierpayment[i].fields.PaymentDate,
                    paymentdate: data.tsupplierpayment[i].fields.PaymentDate != '' ? moment(data.tsupplierpayment[i].fields.PaymentDate).format("DD/MM/YYYY") : data.tsupplierpayment[i].fields.PaymentDate,
                    customername: data.tsupplierpayment[i].fields.CompanyName || '',
                    paymentamount: amount || 0.00,
                    applied: applied || 0.00,
                    balance: balance || 0.00,
                    lines: data.tsupplierpayment[i].fields.Lines,
                    bankaccount: data.tsupplierpayment[i].fields.AccountName || '',
                    department: data.tsupplierpayment[i].fields.DeptClassName || '',
                    refno: data.tsupplierpayment[i].fields.ReferenceNo || '',
                    paymentmethod: data.tsupplierpayment[i].fields.PaymentMethodName || '',
                    notes: data.tsupplierpayment[i].fields.Notes || ''
                };

                if (data.tsupplierpayment[i].fields.Lines != null) {
                    if (data.tsupplierpayment[i].fields.Lines.length) {
                        dataTableList.push(dataList);
                    }
                }
            }
            templateObject.selectedsupplierpayrecords.set(dataTableList);
        }).catch(function (err) {

        });

    };



    // const url = FlowRouter.current().path;
    // if (url.indexOf('?id=') > 0) {
    //     const getso_id = url.split('?id=');
    //     let currentBill = getso_id[getso_id.length - 1];
    //     if (getso_id[1]) {
    //         currentBill = parseInt(currentBill);
    //         $('.printID').attr("id", currentBill);
    //         templateObject.getBillData = function () {
    //             getVS1Data('TBillEx').then(function (dataObject) {
    //                 if (dataObject.length == 0) {
    //                     purchaseService.getOneBillData(currentBill).then(function (data) {
    //                         LoadingOverlay.hide();
    //                         let lineItems = [];
    //                         let lineItemObj = {};
    //                         let lineItemsTable = [];
    //                         let lineItemTableObj = {};
    //                         let exchangeCode = data.fields.ForeignExchangeCode;
    //                         let currencySymbol = Currency;
    //                         let total = currencySymbol + '' + data.fields.TotalAmount.toFixed(2);
    //                         let totalInc = currencySymbol + '' + data.fields.TotalAmountInc.toFixed(2);
    //                         let subTotal = currencySymbol + '' + data.fields.TotalAmount.toFixed(2);
    //                         let totalTax = currencySymbol + '' + data.fields.TotalTax.toFixed(2);
    //                         let totalBalance = currencySymbol + '' + data.fields.TotalBalance.toFixed(2);
    //                         let totalPaidAmount = currencySymbol + '' + data.fields.TotalPaid.toFixed(2);
    //                         let department = '';
    //                         if (data.fields.Lines != null) {
    //                             department = data.fields.Lines[0].fields.LineClassName;
    //                             if (data.fields.Lines.length) {
    //                                 for (let i = 0; i < data.fields.Lines.length; i++) {
    //                                     let AmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toFixed(2);
    //                                     let currencyAmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toFixed(2);
    //                                     let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineTaxTotal);
    //                                     let TaxRateGbp = (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);
    //                                     lineItemObj = {
    //                                         lineID: Random.id(),
    //                                         id: data.fields.Lines[i].fields.ID || '',
    //                                         accountname: data.fields.Lines[i].fields.AccountName || '',
    //                                         memo: data.fields.Lines[i].fields.ProductDescription || '',
    //                                         item: data.fields.Lines[i].fields.ProductName || '',
    //                                         description: data.fields.Lines[i].fields.ProductDescription || '',
    //                                         quantity: data.fields.Lines[i].fields.UOMOrderQty || 0,
    //                                         unitPrice: currencySymbol + '' + data.fields.Lines[i].fields.LineCost.toFixed(2) || 0,
    //                                         unitPriceInc: currencySymbol + '' + data.fields.Lines[i].fields.LineCostInc.toFixed(2) || 0,
    //                                         lineCost: currencySymbol + '' + data.fields.Lines[i].fields.LineCost.toFixed(2) || 0,
    //                                         taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
    //                                         taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
    //                                         TotalAmt: AmountGbp || 0,
    //                                         curTotalAmt: currencyAmountGbp || currencySymbol + '0',
    //                                         TaxTotal: TaxTotalGbp || 0,
    //                                         TaxRate: TaxRateGbp || 0,

    //                                     };

    //                                     lineItemsTable.push(dataListTable);
    //                                     lineItems.push(lineItemObj);
    //                                 }
    //                             } else {
    //                                 let AmountGbp = data.fields.Lines.fields.TotalLineAmountInc.toFixed(2);
    //                                 let currencyAmountGbp = currencySymbol + '' + data.fields.Lines.fields.TotalLineAmount.toFixed(2);
    //                                 let TaxTotalGbp = currencySymbol + '' + data.fields.Lines.fields.LineTaxTotal;
    //                                 let TaxRateGbp = currencySymbol + '' + data.fields.Lines.fields.LineTaxRate;
    //                                 lineItemObj = {
    //                                     lineID: Random.id(),
    //                                     id: data.fields.Lines.fields.ID || '',
    //                                     accountname: data.fields.Lines.fields.AccountName || '',
    //                                     memo: data.fields.Lines.fields.ProductDescription || '',
    //                                     description: data.fields.Lines.fields.ProductDescription || '',
    //                                     quantity: data.fields.Lines.fields.UOMOrderQty || 0,
    //                                     unitPrice: data.fields.Lines[i].fields.LineCost.toFixed(2) || 0,
    //                                     unitPriceInc: data.fields.Lines[i].fields.LineCostInc.toFixed(2) || 0,
    //                                     lineCost: data.fields.Lines[i].fields.LineCost.toFixed(2) || 0,
    //                                     taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
    //                                     taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
    //                                     TotalAmt: AmountGbp || 0,
    //                                     customerJob: data.fields.Lines[i].fields.CustomerJob || '',
    //                                     curTotalAmt: currencyAmountGbp || currencySymbol + '0',
    //                                     TaxTotal: TaxTotalGbp || 0,
    //                                     TaxRate: TaxRateGbp || 0
    //                                 };
    //                                 lineItems.push(lineItemObj);
    //                             }
    //                         } else {
    //                             var dataListTable = [
    //                                 ' ' || '',
    //                                 ' ' || '',
    //                                 0 || 0,
    //                                 0.00 || 0.00,
    //                                 ' ' || '',
    //                                 0.00 || 0.00,
    //                                 '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 btnRemove"><i class="fa fa-remove"></i></button></span>'
    //                             ];
    //                             lineItemsTable.push(dataListTable);
    //                             lineItems.push(lineItemObj);
    //                         }

    //                         let isPartialPaid = false;
    //                         if (data.fields.TotalPaid > 0) {
    //                             isPartialPaid = true;
    //                         }

    //                         let billrecord = {
    //                             id: data.fields.ID,
    //                             lid: 'Edit Bill' + ' ' + data.fields.ID,
    //                             sosupplier: data.fields.SupplierName,
    //                             billto: data.fields.OrderTo,
    //                             shipto: data.fields.ShipTo,
    //                             shipping: data.fields.Shipping,
    //                             docnumber: data.fields.DocNumber,
    //                             custPONumber: data.fields.CustPONumber,
    //                             saledate: data.fields.OrderDate ? moment(data.fields.OrderDate).format('DD/MM/YYYY') : "",
    //                             duedate: data.fields.DueDate ? moment(data.fields.DueDate).format('DD/MM/YYYY') : "",
    //                             employeename: data.fields.EmployeeName,
    //                             status: data.fields.OrderStatus,
    //                             invoicenumber: data.fields.SupplierInvoiceNumber,
    //                             comments: data.fields.Comments,
    //                             pickmemo: data.fields.SalesComments,
    //                             ponumber: data.fields.CustPONumber,
    //                             via: data.fields.Shipping,
    //                             connote: data.fields.ConNote,
    //                             reference: data.fields.CustPONumber,
    //                             currency: data.fields.ForeignExchangeCode,
    //                             branding: data.fields.MedType,
    //                             invoiceToDesc: data.fields.OrderTo,
    //                             shipToDesc: data.fields.ShipTo,
    //                             termsName: data.fields.TermsName,
    //                             Total: totalInc,
    //                             LineItems: lineItems,
    //                             TotalTax: totalTax,
    //                             SubTotal: subTotal,
    //                             balanceDue: totalBalance,
    //                             saleCustField1: data.fields.SaleLineRef,
    //                             saleCustField2: data.fields.SalesComments,
    //                             totalPaid: totalPaidAmount,
    //                             ispaid: data.fields.IsPaid,
    //                             isPartialPaid: isPartialPaid,
    //                             department: department || defaultDept,
    //                             CustomerID: data.fields.SupplierId
    //                         };
    //                         templateObject.getSupplierData(data.fields.SupplierId)

    //                         let getDepartmentVal = department || defaultDept;

    //                         $('#edtSupplierName').val(data.fields.SupplierName);
    //                         templateObject.CleintName.set(data.fields.SupplierName);
    //                         $('#sltTerms').val(data.fields.TermsName);
    //                         $('#sltDept').val(getDepartmentVal);
    //                         $('#sltStatus').val(data.fields.OrderStatus);
    //                         $('#shipvia').val(data.fields.Shipping);
    //                         $('.sltCurrency').val(data.fields.ForeignExchangeCode);
    //                         //$('#exchange_rate').val(data.fields.ForeignExchangeRate);
    //                         let currencyRate = templateObject.getCurrencyRate(data.fields.ForeignExchangeCode, 0);
    //                         $('#exchange_rate').val(currencyRate);

    //                         FxGlobalFunctions.handleChangedCurrency(data.fields.ForeignExchangeCode, defaultCurrencyCode);

    //                         templateObject.attachmentCount.set(0);
    //                         if (data.fields.Attachments) {
    //                             if (data.fields.Attachments.length) {
    //                                 templateObject.attachmentCount.set(data.fields.Attachments.length);
    //                                 templateObject.uploadedFiles.set(data.fields.Attachments);
    //                             }
    //                         }
    //                         setTimeout(function () {
    //                             if (clientList) {
    //                                 for (var i = 0; i < clientList.length; i++) {
    //                                     if (clientList[i].suppliername == data.fields.SupplierName) {
    //                                         $('#edtSupplierEmail').val(clientList[i].supplieremail);
    //                                         $('#edtSupplierEmail').attr('supplierid', clientList[i].supplierid);
    //                                     }
    //                                 }
    //                             }

    //                             if (data.fields.IsPaid === true) {
    //                                 $('#edtSupplierName').attr('readonly', true);
    //                                 $('#btnViewPayment').removeAttr('disabled', 'disabled');
    //                                 $('#addRow').attr('disabled', 'disabled');
    //                                 $('#edtSupplierName').css('background-color', '#eaecf4');
    //                                 $('.btnSave').attr('disabled', 'disabled');
    //                                 $('#btnBack').removeAttr('disabled', 'disabled');
    //                                 $('.printConfirm').removeAttr('disabled', 'disabled');
    //                                 $('.tblBillLine tbody tr').each(function () {
    //                                     var $tblrow = $(this);
    //                                     $tblrow.find("td").attr('contenteditable', false);
    //                                     //$tblrow.find("td").removeClass("lineProductName");
    //                                     $tblrow.find("td").removeClass("lineTaxAmount");
    //                                     $tblrow.find("td").removeClass("lineTaxCode");

    //                                     $tblrow.find("td").attr('readonly', true);
    //                                     $tblrow.find("td").attr('disabled', 'disabled');
    //                                     $tblrow.find("td").css('background-color', '#eaecf4');
    //                                     $tblrow.find("td .table-remove").removeClass("btnRemove");
    //                                 });
    //                             }
    //                         }, 100);


    //                         templateObject.billrecord.set(billrecord);
    //                         templateObject.selectedCurrency.set(billrecord.currency);
    //                         templateObject.inputSelectedCurrency.set(billrecord.currency);
    //                         if (templateObject.billrecord.get()) {

    //                             Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblBillLine', function (error, result) {
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
    //                                             if (columnWidth != 0) {
    //                                                 $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
    //                                             }

    //                                             if (hiddenColumn == true) {

    //                                                 $("." + columnClass + "").addClass('hiddenColumn');
    //                                                 $("." + columnClass + "").removeClass('showColumn');
    //                                             } else if (hiddenColumn == false) {
    //                                                 $("." + columnClass + "").removeClass('hiddenColumn');
    //                                                 $("." + columnClass + "").addClass('showColumn');

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
    //                         LoadingOverlay.hide();

    //                     });
    //                 } else {
    //                     let data = JSON.parse(dataObject[0].data);
    //                     let useData = data.tbillex;
    //                     var added = false;
    //                     for (let d = 0; d < useData.length; d++) {
    //                         if (parseInt(useData[d].fields.ID) === currentBill) {
    //                             added = true;
    //                             LoadingOverlay.hide();
    //                             let lineItems = [];
    //                             let lineItemObj = {};
    //                             let lineItemsTable = [];
    //                             let lineItemTableObj = {};
    //                             let exchangeCode = useData[d].fields.ForeignExchangeCode;
    //                             let currencySymbol = Currency;
    //                             let total = currencySymbol + '' + useData[d].fields.TotalAmount.toFixed(2);
    //                             let totalInc = currencySymbol + '' + useData[d].fields.TotalAmountInc.toFixed(2);
    //                             let subTotal = currencySymbol + '' + useData[d].fields.TotalAmount.toFixed(2);
    //                             let totalTax = currencySymbol + '' + useData[d].fields.TotalTax.toFixed(2);
    //                             let totalBalance = currencySymbol + '' + useData[d].fields.TotalBalance.toFixed(2);
    //                             let totalPaidAmount = currencySymbol + '' + useData[d].fields.TotalPaid.toFixed(2);
    //                             if (useData[d].fields.Lines.length) {
    //                                 for (let i = 0; i < useData[d].fields.Lines.length; i++) {
    //                                     let AmountGbp = currencySymbol + '' + useData[d].fields.Lines[i].fields.TotalLineAmount.toFixed(2);
    //                                     let currencyAmountGbp = currencySymbol + '' + useData[d].fields.Lines[i].fields.TotalLineAmount.toFixed(2);
    //                                     let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.LineTaxTotal);
    //                                     let TaxRateGbp = (useData[d].fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);
    //                                     lineItemObj = {
    //                                         lineID: Random.id(),
    //                                         id: useData[d].fields.Lines[i].fields.ID || '',
    //                                         accountname: useData[d].fields.Lines[i].fields.AccountName || '',
    //                                         memo: useData[d].fields.Lines[i].fields.ProductDescription || '',
    //                                         item: useData[d].fields.Lines[i].fields.ProductName || '',
    //                                         description: useData[d].fields.Lines[i].fields.ProductDescription || '',
    //                                         quantity: useData[d].fields.Lines[i].fields.UOMOrderQty || 0,
    //                                         unitPrice: currencySymbol + '' + useData[d].fields.Lines[i].fields.LineCost.toFixed(2) || 0,
    //                                         unitPriceInc: currencySymbol + '' + useData[d].fields.Lines[i].fields.LineCostInc.toFixed(2) || 0,
    //                                         lineCost: currencySymbol + '' + useData[d].fields.Lines[i].fields.LineCost.toFixed(2) || 0,
    //                                         taxRate: (useData[d].fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
    //                                         taxCode: useData[d].fields.Lines[i].fields.LineTaxCode || '',
    //                                         TotalAmt: AmountGbp || 0,
    //                                         customerJob: useData[d].fields.Lines[i].fields.CustomerJob || '',
    //                                         curTotalAmt: currencyAmountGbp || currencySymbol + '0',
    //                                         TaxTotal: TaxTotalGbp || 0,
    //                                         TaxRate: TaxRateGbp || 0,

    //                                     };

    //                                     lineItemsTable.push(dataListTable);
    //                                     lineItems.push(lineItemObj);
    //                                 }
    //                             } else {
    //                                 let AmountGbp = useData[d].fields.Lines.fields.TotalLineAmountInc.toFixed(2);
    //                                 let currencyAmountGbp = currencySymbol + '' + useData[d].fields.Lines.fields.TotalLineAmount.toFixed(2);
    //                                 let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines.fields.LineTaxTotal);
    //                                 let TaxRateGbp = currencySymbol + '' + useData[d].fields.Lines.fields.LineTaxRate;
    //                                 lineItemObj = {
    //                                     lineID: Random.id(),
    //                                     id: useData[d].fields.Lines.fields.ID || '',
    //                                     accountname: useData[d].fields.Lines.fields.AccountName || '',
    //                                     memo: useData[d].fields.Lines.fields.ProductDescription || '',
    //                                     description: useData[d].fields.Lines.fields.ProductDescription || '',
    //                                     quantity: useData[d].fields.Lines.fields.UOMOrderQty || 0,
    //                                     unitPrice: useData[d].fields.Lines[i].fields.LineCost.toFixed(2) || 0,
    //                                     unitPriceInc: useData[d].fields.Lines[i].fields.LineCostInc.toFixed(2) || 0,
    //                                     lineCost: useData[d].fields.Lines[i].fields.LineCost.toFixed(2) || 0,
    //                                     taxRate: (useData[d].fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
    //                                     taxCode: useData[d].fields.Lines[i].fields.LineTaxCode || '',
    //                                     TotalAmt: AmountGbp || 0,
    //                                     customerJob: data.fields.Lines[i].fields.CustomerJob || '',
    //                                     curTotalAmt: currencyAmountGbp || currencySymbol + '0',
    //                                     TaxTotal: TaxTotalGbp || 0,
    //                                     TaxRate: TaxRateGbp || 0
    //                                 };
    //                                 lineItems.push(lineItemObj);
    //                             }

    //                             let isPartialPaid = false;
    //                             if (useData[d].fields.TotalPaid > 0) {
    //                                 isPartialPaid = true;
    //                             }

    //                             let billrecord = {
    //                                 id: useData[d].fields.ID,
    //                                 lid: 'Edit Bill' + ' ' + useData[d].fields.ID,
    //                                 sosupplier: useData[d].fields.SupplierName,
    //                                 billto: useData[d].fields.OrderTo,
    //                                 shipto: useData[d].fields.ShipTo,
    //                                 shipping: useData[d].fields.Shipping,
    //                                 docnumber: useData[d].fields.DocNumber,
    //                                 custPONumber: useData[d].fields.CustPONumber,
    //                                 saledate: useData[d].fields.OrderDate ? moment(useData[d].fields.OrderDate).format('DD/MM/YYYY') : "",
    //                                 duedate: useData[d].fields.DueDate ? moment(useData[d].fields.DueDate).format('DD/MM/YYYY') : "",
    //                                 employeename: useData[d].fields.EmployeeName,
    //                                 status: useData[d].fields.OrderStatus,
    //                                 invoicenumber: useData[d].fields.SupplierInvoiceNumber,
    //                                 comments: useData[d].fields.Comments,
    //                                 pickmemo: useData[d].fields.SalesComments,
    //                                 ponumber: useData[d].fields.CustPONumber,
    //                                 via: useData[d].fields.Shipping,
    //                                 connote: useData[d].fields.ConNote,
    //                                 reference: useData[d].fields.CustPONumber,
    //                                 currency: useData[d].fields.ForeignExchangeCode,
    //                                 branding: useData[d].fields.MedType,
    //                                 invoiceToDesc: useData[d].fields.OrderTo,
    //                                 shipToDesc: useData[d].fields.ShipTo,
    //                                 termsName: useData[d].fields.TermsName,
    //                                 Total: totalInc,
    //                                 LineItems: lineItems,
    //                                 TotalTax: totalTax,
    //                                 SubTotal: subTotal,
    //                                 balanceDue: totalBalance,
    //                                 saleCustField1: useData[d].fields.SaleLineRef,
    //                                 saleCustField2: useData[d].fields.SalesComments,
    //                                 totalPaid: totalPaidAmount,
    //                                 ispaid: useData[d].fields.IsPaid,
    //                                 isPartialPaid: isPartialPaid,
    //                                 department: useData[d].fields.Lines[0].fields.LineClassName || defaultDept,
    //                                 CustomerID: useData[d].fields.SupplierId
    //                             };
    //                             templateObject.getSupplierData(useData[d].fields.SupplierId)

    //                             $('#edtSupplierName').val(useData[d].fields.SupplierName);
    //                             $('#sltTerms').val(useData[d].fields.TermsName);
    //                             $('#sltDept').val(useData[d].fields.Lines[0].fields.LineClassName);
    //                             $('#sltStatus').val(useData[d].fields.OrderStatus);
    //                             templateObject.CleintName.set(useData[d].fields.SupplierName);
    //                             $('#shipvia').val(useData[d].fields.Shipping);
    //                             $('.sltCurrency').val(useData[d].fields.ForeignExchangeCode);
    //                             //$('#exchange_rate').val(useData[d].fields.ForeignExchangeRate);
    //                             //let currencyRate = templateObject.getCurrencyRate(useData[d].fields.ForeignExchangeCode, 0);
    //                             $('#exchange_rate').val(templateObject.getCurrencyRate(useData[d].fields.ForeignExchangeCode, 0));
    //                             FxGlobalFunctions.handleChangedCurrency(useData[d].fields.ForeignExchangeCode, defaultCurrencyCode);

    //                             templateObject.attachmentCount.set(0);
    //                             if (useData[d].fields.Attachments) {
    //                                 if (useData[d].fields.Attachments.length) {
    //                                     templateObject.attachmentCount.set(useData[d].fields.Attachments.length);
    //                                     templateObject.uploadedFiles.set(useData[d].fields.Attachments);
    //                                 }
    //                             }

    //                             setTimeout(function () {
    //                                 if (clientList) {
    //                                     for (var i = 0; i < clientList.length; i++) {
    //                                         if (clientList[i].suppliername == useData[d].fields.SupplierName) {
    //                                             $('#edtSupplierEmail').val(clientList[i].supplieremail);
    //                                             $('#edtSupplierEmail').attr('supplierid', clientList[i].supplierid);
    //                                         }
    //                                     }
    //                                 }


    //                                 if (useData[d].fields.IsPaid === true) {
    //                                     $('#edtSupplierName').attr('readonly', true);
    //                                     $('#btnViewPayment').removeAttr('disabled', 'disabled');
    //                                     $('#addRow').attr('disabled', 'disabled');
    //                                     $('#edtSupplierName').css('background-color', '#eaecf4');
    //                                     $('.btnSave').attr('disabled', 'disabled');
    //                                     $('#btnBack').removeAttr('disabled', 'disabled');
    //                                     $('.printConfirm').removeAttr('disabled', 'disabled');
    //                                     $('.tblBillLine tbody tr').each(function () {
    //                                         var $tblrow = $(this);
    //                                         $tblrow.find("td").attr('contenteditable', false);
    //                                         //$tblrow.find("td").removeClass("lineProductName");
    //                                         $tblrow.find("td").removeClass("lineTaxAmount");
    //                                         $tblrow.find("td").removeClass("lineTaxCode");

    //                                         $tblrow.find("td").attr('readonly', true);
    //                                         $tblrow.find("td").attr('disabled', 'disabled');
    //                                         $tblrow.find("td").css('background-color', '#eaecf4');
    //                                         $tblrow.find("td .table-remove").removeClass("btnRemove");
    //                                     });
    //                                 }

    //                             }, 100);



    //                             templateObject.billrecord.set(billrecord);

    //                             templateObject.selectedCurrency.set(billrecord.currency);
    //                             templateObject.inputSelectedCurrency.set(billrecord.currency);
    //                             if (templateObject.billrecord.get()) {


    //                                 Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblBillLine', function (error, result) {
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
    //                                                 if (columnWidth != 0) {
    //                                                     $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
    //                                                 }

    //                                                 if (hiddenColumn == true) {

    //                                                     $("." + columnClass + "").addClass('hiddenColumn');
    //                                                     $("." + columnClass + "").removeClass('showColumn');
    //                                                 } else if (hiddenColumn == false) {
    //                                                     $("." + columnClass + "").removeClass('hiddenColumn');
    //                                                     $("." + columnClass + "").addClass('showColumn');

    //                                                 }

    //                                             }
    //                                         }

    //                                     }
    //                                 });
    //                             }
    //                         }
    //                     }

    //                     if (!added) {
    //                         purchaseService.getOneBillData(currentBill).then(function (data) {
    //                             LoadingOverlay.hide();
    //                             let lineItems = [];
    //                             let lineItemObj = {};
    //                             let lineItemsTable = [];
    //                             let lineItemTableObj = {};
    //                             let exchangeCode = data.fields.ForeignExchangeCode;
    //                             let currencySymbol = Currency;
    //                             let total = currencySymbol + '' + data.fields.TotalAmount.toFixed(2);
    //                             let totalInc = currencySymbol + '' + data.fields.TotalAmountInc.toFixed(2);
    //                             let subTotal = currencySymbol + '' + data.fields.TotalAmount.toFixed(2);
    //                             let totalTax = currencySymbol + '' + data.fields.TotalTax.toFixed(2);
    //                             let totalBalance = currencySymbol + '' + data.fields.TotalBalance.toFixed(2);
    //                             let totalPaidAmount = currencySymbol + '' + data.fields.TotalPaid.toFixed(2);
    //                             let department = '';
    //                             if (data.fields.Lines != null) {
    //                                 department = data.fields.Lines[0].fields.LineClassName;
    //                                 if (data.fields.Lines.length) {
    //                                     for (let i = 0; i < data.fields.Lines.length; i++) {
    //                                         let AmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toFixed(2);
    //                                         let currencyAmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toFixed(2);
    //                                         let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineTaxTotal);
    //                                         let TaxRateGbp = (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);
    //                                         lineItemObj = {
    //                                             lineID: Random.id(),
    //                                             id: data.fields.Lines[i].fields.ID || '',
    //                                             accountname: data.fields.Lines[i].fields.AccountName || '',
    //                                             memo: data.fields.Lines[i].fields.ProductDescription || '',
    //                                             item: data.fields.Lines[i].fields.ProductName || '',
    //                                             description: data.fields.Lines[i].fields.ProductDescription || '',
    //                                             quantity: data.fields.Lines[i].fields.UOMOrderQty || 0,
    //                                             unitPrice: currencySymbol + '' + data.fields.Lines[i].fields.LineCost.toFixed(2) || 0,
    //                                             unitPriceInc: currencySymbol + '' + data.fields.Lines[i].fields.LineCostInc.toFixed(2) || 0,
    //                                             lineCost: currencySymbol + '' + data.fields.Lines[i].fields.LineCost.toFixed(2) || 0,
    //                                             taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
    //                                             taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
    //                                             TotalAmt: AmountGbp || 0,
    //                                             curTotalAmt: currencyAmountGbp || currencySymbol + '0',
    //                                             TaxTotal: TaxTotalGbp || 0,
    //                                             TaxRate: TaxRateGbp || 0,

    //                                         };

    //                                         lineItemsTable.push(dataListTable);
    //                                         lineItems.push(lineItemObj);
    //                                     }
    //                                 } else {
    //                                     let AmountGbp = data.fields.Lines.fields.TotalLineAmountInc.toFixed(2);
    //                                     let currencyAmountGbp = currencySymbol + '' + data.fields.Lines.fields.TotalLineAmount.toFixed(2);
    //                                     let TaxTotalGbp = currencySymbol + '' + data.fields.Lines.fields.LineTaxTotal;
    //                                     let TaxRateGbp = currencySymbol + '' + data.fields.Lines.fields.LineTaxRate;
    //                                     lineItemObj = {
    //                                         lineID: Random.id(),
    //                                         id: data.fields.Lines.fields.ID || '',
    //                                         accountname: data.fields.Lines.fields.AccountName || '',
    //                                         memo: data.fields.Lines.fields.ProductDescription || '',
    //                                         description: data.fields.Lines.fields.ProductDescription || '',
    //                                         quantity: data.fields.Lines.fields.UOMOrderQty || 0,
    //                                         unitPrice: data.fields.Lines[i].fields.LineCost.toFixed(2) || 0,
    //                                         unitPriceInc: data.fields.Lines[i].fields.LineCostInc.toFixed(2) || 0,
    //                                         lineCost: data.fields.Lines[i].fields.LineCost.toFixed(2) || 0,
    //                                         taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
    //                                         taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
    //                                         TotalAmt: AmountGbp || 0,
    //                                         customerJob: data.fields.Lines[i].fields.CustomerJob || '',
    //                                         curTotalAmt: currencyAmountGbp || currencySymbol + '0',
    //                                         TaxTotal: TaxTotalGbp || 0,
    //                                         TaxRate: TaxRateGbp || 0
    //                                     };
    //                                     lineItems.push(lineItemObj);
    //                                 }
    //                             } else {
    //                                 var dataListTable = [
    //                                     ' ' || '',
    //                                     ' ' || '',
    //                                     0 || 0,
    //                                     0.00 || 0.00,
    //                                     ' ' || '',
    //                                     0.00 || 0.00,
    //                                     '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 btnRemove"><i class="fa fa-remove"></i></button></span>'
    //                                 ];
    //                                 lineItemsTable.push(dataListTable);
    //                                 lineItems.push(lineItemObj);
    //                             }

    //                             let isPartialPaid = false;
    //                             if (data.fields.TotalPaid > 0) {
    //                                 isPartialPaid = true;
    //                             }

    //                             let billrecord = {
    //                                 id: data.fields.ID,
    //                                 lid: 'Edit Bill' + ' ' + data.fields.ID,
    //                                 sosupplier: data.fields.SupplierName,
    //                                 billto: data.fields.OrderTo,
    //                                 shipto: data.fields.ShipTo,
    //                                 shipping: data.fields.Shipping,
    //                                 docnumber: data.fields.DocNumber,
    //                                 custPONumber: data.fields.CustPONumber,
    //                                 saledate: data.fields.OrderDate ? moment(data.fields.OrderDate).format('DD/MM/YYYY') : "",
    //                                 duedate: data.fields.DueDate ? moment(data.fields.DueDate).format('DD/MM/YYYY') : "",
    //                                 employeename: data.fields.EmployeeName,
    //                                 status: data.fields.OrderStatus,
    //                                 invoicenumber: data.fields.SupplierInvoiceNumber,
    //                                 comments: data.fields.Comments,
    //                                 pickmemo: data.fields.SalesComments,
    //                                 ponumber: data.fields.CustPONumber,
    //                                 via: data.fields.Shipping,
    //                                 connote: data.fields.ConNote,
    //                                 reference: data.fields.CustPONumber,
    //                                 currency: data.fields.ForeignExchangeCode,
    //                                 branding: data.fields.MedType,
    //                                 invoiceToDesc: data.fields.OrderTo,
    //                                 shipToDesc: data.fields.ShipTo,
    //                                 termsName: data.fields.TermsName,
    //                                 Total: totalInc,
    //                                 LineItems: lineItems,
    //                                 TotalTax: totalTax,
    //                                 SubTotal: subTotal,
    //                                 balanceDue: totalBalance,
    //                                 saleCustField1: data.fields.SaleLineRef,
    //                                 saleCustField2: data.fields.SalesComments,
    //                                 totalPaid: totalPaidAmount,
    //                                 ispaid: data.fields.IsPaid,
    //                                 isPartialPaid: isPartialPaid,
    //                                 department: department || defaultDept,
    //                                 CustomerID: data.fields.SupplierId
    //                             };
    //                             templateObject.getSupplierData(data.fields.SupplierId)

    //                             let getDepartmentVal = department || defaultDept;

    //                             $('#edtSupplierName').val(data.fields.SupplierName);
    //                             templateObject.CleintName.set(data.fields.SupplierName);
    //                             $('#sltTerms').val(data.fields.TermsName);
    //                             $('#sltDept').val(getDepartmentVal);
    //                             $('#sltStatus').val(data.fields.OrderStatus);
    //                             $('#shipvia').val(data.fields.Shipping);
    //                             $('.sltCurrency').val(data.fields.ForeignExchangeCode);
    //                             //$('#exchange_rate').val(data.fields.ForeignExchangeRate);
    //                             $('#exchange_rate').val(templateObject.getCurrencyRate(data.fields.ForeignExchangeCode, 0));
    //                             FxGlobalFunctions.handleChangedCurrency(data.fields.ForeignExchangeCode, defaultCurrencyCode);

    //                             templateObject.attachmentCount.set(0);
    //                             if (data.fields.Attachments) {
    //                                 if (data.fields.Attachments.length) {
    //                                     templateObject.attachmentCount.set(data.fields.Attachments.length);
    //                                     templateObject.uploadedFiles.set(data.fields.Attachments);
    //                                 }
    //                             }

    //                             setTimeout(function () {
    //                                 if (clientList) {
    //                                     for (var i = 0; i < clientList.length; i++) {
    //                                         if (clientList[i].suppliername == data.fields.SupplierName) {
    //                                             $('#edtSupplierEmail').val(clientList[i].supplieremail);
    //                                             $('#edtSupplierEmail').attr('supplierid', clientList[i].supplierid);
    //                                         }
    //                                     }
    //                                 }
    //                             }, 100);



    //                             templateObject.billrecord.set(billrecord);

    //                             templateObject.selectedCurrency.set(billrecord.currency);
    //                             templateObject.inputSelectedCurrency.set(billrecord.currency);
    //                             if (templateObject.billrecord.get()) {



    //                                 Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblBillLine', function (error, result) {
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
    //                                                 if (columnWidth != 0) {
    //                                                     $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
    //                                                 }

    //                                                 if (hiddenColumn == true) {


    //                                                     $("." + columnClass + "").addClass('hiddenColumn');
    //                                                     $("." + columnClass + "").removeClass('showColumn');
    //                                                 } else if (hiddenColumn == false) {
    //                                                     $("." + columnClass + "").removeClass('hiddenColumn');
    //                                                     $("." + columnClass + "").addClass('showColumn');

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
    //                             LoadingOverlay.hide();

    //                         });
    //                     }
    //                 }

    //             }).catch(function (err) {
    //                 purchaseService.getOneBillData(currentBill).then(function (data) {
    //                     LoadingOverlay.hide();
    //                     let lineItems = [];
    //                     let lineItemObj = {};
    //                     let lineItemsTable = [];
    //                     let lineItemTableObj = {};
    //                     let exchangeCode = data.fields.ForeignExchangeCode;
    //                     let currencySymbol = Currency;
    //                     let total = currencySymbol + '' + data.fields.TotalAmount.toFixed(2);
    //                     let totalInc = currencySymbol + '' + data.fields.TotalAmountInc.toFixed(2);
    //                     let subTotal = currencySymbol + '' + data.fields.TotalAmount.toFixed(2);
    //                     let totalTax = currencySymbol + '' + data.fields.TotalTax.toFixed(2);
    //                     let totalBalance = currencySymbol + '' + data.fields.TotalBalance.toFixed(2);
    //                     let totalPaidAmount = currencySymbol + '' + data.fields.TotalPaid.toFixed(2);
    //                     let department = '';
    //                     if (data.fields.Lines != null) {
    //                         department = data.fields.Lines[0].fields.LineClassName;
    //                         if (data.fields.Lines.length) {
    //                             for (let i = 0; i < data.fields.Lines.length; i++) {
    //                                 let AmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toFixed(2);
    //                                 let currencyAmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toFixed(2);
    //                                 let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineTaxTotal);
    //                                 let TaxRateGbp = (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);
    //                                 lineItemObj = {
    //                                     lineID: Random.id(),
    //                                     id: data.fields.Lines[i].fields.ID || '',
    //                                     accountname: data.fields.Lines[i].fields.AccountName || '',
    //                                     memo: data.fields.Lines[i].fields.ProductDescription || '',
    //                                     item: data.fields.Lines[i].fields.ProductName || '',
    //                                     description: data.fields.Lines[i].fields.ProductDescription || '',
    //                                     quantity: data.fields.Lines[i].fields.UOMOrderQty || 0,
    //                                     unitPrice: currencySymbol + '' + data.fields.Lines[i].fields.LineCost.toFixed(2) || 0,
    //                                     unitPriceInc: currencySymbol + '' + data.fields.Lines[i].fields.LineCostInc.toFixed(2) || 0,
    //                                     lineCost: currencySymbol + '' + data.fields.Lines[i].fields.LineCost.toFixed(2) || 0,
    //                                     taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
    //                                     taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
    //                                     TotalAmt: AmountGbp || 0,
    //                                     curTotalAmt: currencyAmountGbp || currencySymbol + '0',
    //                                     TaxTotal: TaxTotalGbp || 0,
    //                                     TaxRate: TaxRateGbp || 0,

    //                                 };

    //                                 lineItemsTable.push(dataListTable);
    //                                 lineItems.push(lineItemObj);
    //                             }
    //                         } else {
    //                             let AmountGbp = data.fields.Lines.fields.TotalLineAmountInc.toFixed(2);
    //                             let currencyAmountGbp = currencySymbol + '' + data.fields.Lines.fields.TotalLineAmount.toFixed(2);
    //                             let TaxTotalGbp = currencySymbol + '' + data.fields.Lines.fields.LineTaxTotal;
    //                             let TaxRateGbp = currencySymbol + '' + data.fields.Lines.fields.LineTaxRate;
    //                             lineItemObj = {
    //                                 lineID: Random.id(),
    //                                 id: data.fields.Lines.fields.ID || '',
    //                                 accountname: data.fields.Lines.fields.AccountName || '',
    //                                 memo: data.fields.Lines.fields.ProductDescription || '',
    //                                 description: data.fields.Lines.fields.ProductDescription || '',
    //                                 quantity: data.fields.Lines.fields.UOMOrderQty || 0,
    //                                 unitPrice: data.fields.Lines[i].fields.LineCost.toFixed(2) || 0,
    //                                 lineCost: data.fields.Lines[i].fields.LineCost.toFixed(2) || 0,
    //                                 unitPriceInc: data.fields.Lines[i].fields.LineCostInc.toFixed(2) || 0,
    //                                 taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
    //                                 taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
    //                                 TotalAmt: AmountGbp || 0,
    //                                 customerJob: data.fields.Lines[i].fields.CustomerJob || '',
    //                                 curTotalAmt: currencyAmountGbp || currencySymbol + '0',
    //                                 TaxTotal: TaxTotalGbp || 0,
    //                                 TaxRate: TaxRateGbp || 0
    //                             };
    //                             lineItems.push(lineItemObj);
    //                         }
    //                     } else {
    //                         var dataListTable = [
    //                             ' ' || '',
    //                             ' ' || '',
    //                             0 || 0,
    //                             0.00 || 0.00,
    //                             ' ' || '',
    //                             0.00 || 0.00,
    //                             '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 btnRemove"><i class="fa fa-remove"></i></button></span>'
    //                         ];
    //                         lineItemsTable.push(dataListTable);
    //                         lineItems.push(lineItemObj);
    //                     }

    //                     let isPartialPaid = false;
    //                     if (data.fields.TotalPaid > 0) {
    //                         isPartialPaid = true;
    //                     }

    //                     let billrecord = {
    //                         id: data.fields.ID,
    //                         lid: 'Edit Bill' + ' ' + data.fields.ID,
    //                         sosupplier: data.fields.SupplierName,
    //                         billto: data.fields.OrderTo,
    //                         shipto: data.fields.ShipTo,
    //                         shipping: data.fields.Shipping,
    //                         docnumber: data.fields.DocNumber,
    //                         custPONumber: data.fields.CustPONumber,
    //                         saledate: data.fields.OrderDate ? moment(data.fields.OrderDate).format('DD/MM/YYYY') : "",
    //                         duedate: data.fields.DueDate ? moment(data.fields.DueDate).format('DD/MM/YYYY') : "",
    //                         employeename: data.fields.EmployeeName,
    //                         status: data.fields.OrderStatus,
    //                         invoicenumber: data.fields.SupplierInvoiceNumber,
    //                         comments: data.fields.Comments,
    //                         pickmemo: data.fields.SalesComments,
    //                         ponumber: data.fields.CustPONumber,
    //                         via: data.fields.Shipping,
    //                         connote: data.fields.ConNote,
    //                         reference: data.fields.CustPONumber,
    //                         currency: data.fields.ForeignExchangeCode,
    //                         branding: data.fields.MedType,
    //                         invoiceToDesc: data.fields.OrderTo,
    //                         shipToDesc: data.fields.ShipTo,
    //                         termsName: data.fields.TermsName,
    //                         Total: totalInc,
    //                         LineItems: lineItems,
    //                         TotalTax: totalTax,
    //                         SubTotal: subTotal,
    //                         balanceDue: totalBalance,
    //                         saleCustField1: data.fields.SaleLineRef,
    //                         saleCustField2: data.fields.SalesComments,
    //                         totalPaid: totalPaidAmount,
    //                         ispaid: data.fields.IsPaid,
    //                         isPartialPaid: isPartialPaid,
    //                         department: department || defaultDept,
    //                         CustomerID: data.fields.SupplierId
    //                     };
    //                     templateObject.getSupplierData(data.fields.SupplierId)
    //                     let getDepartmentVal = department || defaultDept;

    //                     $('#edtSupplierName').val(data.fields.SupplierName);
    //                     templateObject.CleintName.set(data.fields.SupplierName);
    //                     $('#sltTerms').val(data.fields.TermsName);
    //                     $('#sltDept').val(getDepartmentVal);
    //                     $('#sltStatus').val(data.fields.OrderStatus);
    //                     $('#shipvia').val(data.fields.Shipping);
    //                     $('.sltCurrency').val(data.fields.ForeignExchangeCode);
    //                     //$('#exchange_rate').val(data.fields.ForeignExchangeRate);
    //                     $('#exchange_rate').val(templateObject.getCurrencyRate(data.fields.ForeignExchangeCode, 0));
    //                     FxGlobalFunctions.handleChangedCurrency(data.fields.ForeignExchangeCode, defaultCurrencyCode);

    //                     templateObject.attachmentCount.set(0);
    //                     if (data.fields.Attachments) {
    //                         if (data.fields.Attachments.length) {
    //                             templateObject.attachmentCount.set(data.fields.Attachments.length);
    //                             templateObject.uploadedFiles.set(data.fields.Attachments);
    //                         }
    //                     }

    //                     setTimeout(function () {
    //                         if (clientList) {
    //                             for (var i = 0; i < clientList.length; i++) {
    //                                 if (clientList[i].suppliername == data.fields.SupplierName) {
    //                                     $('#edtSupplierEmail').val(clientList[i].supplieremail);
    //                                     $('#edtSupplierEmail').attr('supplierid', clientList[i].supplierid);
    //                                 }
    //                             }
    //                         }

    //                         if (data.fields.IsPaid === true) {
    //                             $('#edtSupplierName').attr('readonly', true);
    //                             $('#btnViewPayment').removeAttr('disabled', 'disabled');
    //                             $('#addRow').attr('disabled', 'disabled');
    //                             $('#edtSupplierName').css('background-color', '#eaecf4');
    //                             $('.btnSave').attr('disabled', 'disabled');
    //                             $('#btnBack').removeAttr('disabled', 'disabled');
    //                             $('.printConfirm').removeAttr('disabled', 'disabled');
    //                             $('.tblBillLine tbody tr').each(function () {
    //                                 var $tblrow = $(this);
    //                                 $tblrow.find("td").attr('contenteditable', false);
    //                                 //$tblrow.find("td").removeClass("lineProductName");
    //                                 $tblrow.find("td").removeClass("lineTaxAmount");
    //                                 $tblrow.find("td").removeClass("lineTaxCode");

    //                                 $tblrow.find("td").attr('readonly', true);
    //                                 $tblrow.find("td").attr('disabled', 'disabled');
    //                                 $tblrow.find("td").css('background-color', '#eaecf4');
    //                                 $tblrow.find("td .table-remove").removeClass("btnRemove");
    //                             });
    //                         }
    //                     }, 100);

    //                     templateObject.billrecord.set(billrecord);

    //                     templateObject.selectedCurrency.set(billrecord.currency);
    //                     templateObject.inputSelectedCurrency.set(billrecord.currency);
    //                     if (templateObject.billrecord.get()) {


    //                         Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblBillLine', function (error, result) {
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
    //                                         if (columnWidth != 0) {
    //                                             $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
    //                                         }

    //                                         if (hiddenColumn == true) {

    //                                             $("." + columnClass + "").addClass('hiddenColumn');
    //                                             $("." + columnClass + "").removeClass('showColumn');
    //                                         } else if (hiddenColumn == false) {
    //                                             $("." + columnClass + "").removeClass('hiddenColumn');
    //                                             $("." + columnClass + "").addClass('showColumn');

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
    //                     LoadingOverlay.hide();

    //                 });
    //             });

    //         };
    //         templateObject.getBillData();
    //     }
    // } else {
    //     LoadingOverlay.hide();
    //     let lineItems = [];
    //     let lineItemsTable = [];
    //     let lineItemObj = {};
    //     lineItemObj = {
    //         lineID: Random.id(),
    //         item: '',
    //         accountname: '',
    //         memo: '',
    //         description: '',
    //         quantity: '',
    //         unitPrice: 0,
    //         unitPriceInc: 0,
    //         taxRate: 0,
    //         taxCode: '',
    //         TotalAmt: 0,
    //         curTotalAmt: 0,
    //         TaxTotal: 0,
    //         TaxRate: 0,

    //     };
    //     lineItemsTable.push(dataListTable);
    //     lineItems.push(lineItemObj);
    //     const currentDate = new Date();
    //     const begunDate = moment(currentDate).format("DD/MM/YYYY");
    //     let billrecord = {
    //         id: '',
    //         lid: 'New Bill',
    //         accountname: '',
    //         memo: '',
    //         sosupplier: '',
    //         billto: '',
    //         shipto: '',
    //         shipping: '',
    //         docnumber: '',
    //         custPONumber: '',
    //         saledate: begunDate,
    //         duedate: '',
    //         employeename: '',
    //         status: '',
    //         invoicenumber: '',
    //         category: '',
    //         comments: '',
    //         pickmemo: '',
    //         ponumber: '',
    //         via: '',
    //         connote: '',
    //         reference: '',
    //         currency: '',
    //         branding: '',
    //         invoiceToDesc: '',
    //         shipToDesc: '',
    //         termsName: '',
    //         Total: Currency + '' + 0.00,
    //         LineItems: lineItems,
    //         TotalTax: Currency + '' + 0.00,
    //         SubTotal: Currency + '' + 0.00,
    //         balanceDue: Currency + '' + 0.00,
    //         saleCustField1: '',
    //         saleCustField2: '',
    //         totalPaid: Currency + '' + 0.00,
    //         ispaid: false,
    //         isPartialPaid: false,
    //         CustomerID: 0
    //     };
    //     if (FlowRouter.current().queryParams.supplierid) {
    //         templateObject.getSupplierData(FlowRouter.current().queryParams.supplierid);
    //     } else {
    //         $('#edtSupplierName').val('');
    //     }
    //     setTimeout(function () {
    //         $('#sltDept').val(defaultDept);
    //         templateObject.getLastBillData();
    //     }, 200);
    //     templateObject.billrecord.set(billrecord);
    //     if (templateObject.billrecord.get()) {
    //         Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblBillLine', function (error, result) {
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
    //                         if (columnWidth != 0) {
    //                             $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
    //                         }
    //                         if (hiddenColumn == true) {
    //                             $("." + columnClass + "").addClass('hiddenColumn');
    //                             $("." + columnClass + "").removeClass('showColumn');
    //                         } else if (hiddenColumn == false) {
    //                             $("." + columnClass + "").removeClass('hiddenColumn');
    //                             $("." + columnClass + "").addClass('showColumn');
    //                         }

    //                     }
    //                 }

    //             }
    //         });
    //     }
    // }

    // function loadTemplateBody1(object_invoce) {
    //     if (object_invoce[0]["taxItems"]) {
    //         let taxItems = object_invoce[0]["taxItems"];
    //         if (taxItems && Object.keys(taxItems).length > 0) {
    //             $("#templatePreviewModal #tax_list_print").html("");
    //             Object.keys(taxItems).map((code) => {
    //                 let html = `
    //                     <div style="width: 100%; display: flex;">
    //                         <div style="padding-right: 16px; width: 50%;">
    //                             <p style="font-weight: 600; text-align: left; margin-bottom: 8px; color: rgb(0 0 0);">
    //                                 ${code}</p>
    //                         </div>
    //                         <div style="padding-left: 16px; width: 50%;">
    //                             <p style="font-weight: 600; text-align: right; margin-bottom: 8px; color: rgb(0 0 0);">
    //                                 $${taxItems[code].toFixed(3)}</p>
    //                         </div>
    //                     </div>
    //                 `;
    //                 $("#templatePreviewModal #tax_list_print").append(html);
    //             });
    //         } else {
    //             $("#templatePreviewModal #tax_list_print").remove();
    //         }
    //     }


    //     // table content
    //     var tbl_content = $("#templatePreviewModal .tbl_content");
    //     tbl_content.empty();
    //     const data = object_invoce[0]["data"];
    //     let idx = 0;
    //     for (item of data) {
    //         idx = 0;
    //         var html = '';
    //         html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
    //         for (item_temp of item) {
    //             if (idx > 1)
    //                 html = html + "<td style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
    //             else
    //                 html = html + "<td style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
    //             idx++;
    //         }

    //         html += "</tr>";
    //         tbl_content.append(html);
    //     }
    //     // total amount
    //     if (noHasTotals.includes(object_invoce[0]["title"])) {
    //         $("#templatePreviewModal .field_amount").hide();
    //         $("#templatePreviewModal .field_payment").css("borderRight", "0px solid black");
    //     } else {
    //         $("#templatePreviewModal .field_amount").show();
    //         $("#templatePreviewModal .field_payment").css("borderRight", "1px solid black");
    //     }

    //     $('#templatePreviewModal #subtotal_total').text("Sub total");
    //     $("#templatePreviewModal #subtotal_totalPrint").text(object_invoce[0]["subtotal"]);

    //     $('#templatePreviewModal #grandTotal').text("Grand total");
    //     $("#templatePreviewModal #totalTax_totalPrint").text(object_invoce[0]["gst"]);

    //     $("#templatePreviewModal #grandTotalPrint").text(object_invoce[0]["total"]);

    //     $("#templatePreviewModal #totalBalanceDuePrint").text(object_invoce[0]["bal_due"]);

    //     $("#templatePreviewModal #paid_amount").text(object_invoce[0]["paid_amount"]);
    // }

    // function loadTemplateBody2(object_invoce) {
    //     if (object_invoce[0]["taxItems"]) {
    //         let taxItems = object_invoce[0]["taxItems"];
    //         if (taxItems && Object.keys(taxItems).length > 0) {
    //             $("#templatePreviewModal #tax_list_print").html("");
    //             Object.keys(taxItems).map((code) => {
    //                 let html = `
    //                     <div style="width: 100%; display: flex;">
    //                         <div style="padding-right: 16px; width: 50%;">
    //                             <p style="font-weight: 600; text-align: left; margin-bottom: 8px; color: rgb(0 0 0);">
    //                                 ${code}</p>
    //                         </div>
    //                         <div style="padding-left: 16px; width: 50%;">
    //                             <p style="font-weight: 600; text-align: right; margin-bottom: 8px; color: rgb(0 0 0);">
    //                                 $${taxItems[code].toFixed(3)}</p>
    //                         </div>
    //                     </div>
    //                 `;
    //                 $("#templatePreviewModal #tax_list_print").append(html);
    //             });
    //         } else {
    //             $("#templatePreviewModal #tax_list_print").remove();
    //         }
    //     }


    //     // table content
    //     var tbl_content = $("#templatePreviewModal .tbl_content");
    //     tbl_content.empty();
    //     const data = object_invoce[0]["data"];
    //     let idx = 0;
    //     for (item of data) {
    //         idx = 0;
    //         var html = '';
    //         html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
    //         for (item_temp of item) {
    //             if (idx > 1)
    //                 html = html + "<td style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
    //             else
    //                 html = html + "<td style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
    //             idx++;
    //         }

    //         html += "</tr>";
    //         tbl_content.append(html);
    //     }

    //     // total amount
    //     if (noHasTotals.includes(object_invoce[0]["title"])) {
    //         $(".subtotal2").hide();
    //     } else {
    //         $(".subtotal2").show();
    //     }

    //     $("#templatePreviewModal #subtotal_totalPrint2").text(
    //         object_invoce[0]["subtotal"]
    //     );
    //     $("#templatePreviewModal #grandTotalPrint2").text(
    //         object_invoce[0]["total"]
    //     );
    //     $("#templatePreviewModal #totalBalanceDuePrint2").text(
    //         object_invoce[0]["bal_due"]
    //     );
    //     $("#templatePreviewModal #paid_amount2").text(
    //         object_invoce[0]["paid_amount"]
    //     );
    // }

    // function loadTemplateBody3(object_invoce) {
    //     if (object_invoce[0]["taxItems"]) {
    //         let taxItems = object_invoce[0]["taxItems"];
    //         if (taxItems && Object.keys(taxItems).length > 0) {
    //             $("#templatePreviewModal #tax_list_print").html("");
    //             Object.keys(taxItems).map((code) => {
    //                 let html = `
    //                     <div style="width: 100%; display: flex;">
    //                         <div style="padding-right: 16px; width: 50%;">
    //                             <p style="font-weight: 600; text-align: left; margin-bottom: 8px; color: rgb(0 0 0);">
    //                                 ${code}</p>
    //                         </div>
    //                         <div style="padding-left: 16px; width: 50%;">
    //                             <p style="font-weight: 600; text-align: right; margin-bottom: 8px; color: rgb(0 0 0);">
    //                                 $${taxItems[code].toFixed(3)}</p>
    //                         </div>
    //                     </div>
    //                 `;
    //                 $("#templatePreviewModal #tax_list_print").append(html);
    //             });
    //         } else {
    //             $("#templatePreviewModal #tax_list_print").remove();
    //         }
    //     }


    //     // table content
    //     var tbl_content = $("#templatePreviewModal .tbl_content");
    //     tbl_content.empty();
    //     const data = object_invoce[0]["data"];
    //     let idx = 0;
    //     for (item of data) {
    //         idx = 0;
    //         var html = '';
    //         html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
    //         for (item_temp of item) {
    //             if (idx > 1)
    //                 html = html + "<td style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
    //             else
    //                 html = html + "<td style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
    //             idx++;
    //         }

    //         html += "</tr>";
    //         tbl_content.append(html);
    //     }

    //     // total amount
    //     if (noHasTotals.includes(object_invoce[0]["title"])) {
    //         $(".subtotal3").hide();
    //     } else {
    //         $(".subtotal3").show();
    //     }

    //     $("#templatePreviewModal #subtotal_totalPrint3").text(
    //         object_invoce[0]["subtotal"]
    //     );
    //     $("#templatePreviewModal #totalTax_totalPrint3").text(
    //         object_invoce[0]["gst"]
    //     );
    //     $("#templatePreviewModal #totalBalanceDuePrint3").text(
    //         object_invoce[0]["bal_due"]
    //     );
    // }

    // function updateTemplate1(object_invoce, bprint) {
    //     initTemplateHeaderFooter1();
    //     $("#html-2-pdfwrapper_quotes").show();
    //     $("#html-2-pdfwrapper_quotes2").hide();
    //     $("#html-2-pdfwrapper_quotes3").hide();
    //     if (bprint == false)
    //         $("#templatePreviewModal").modal("toggle");
    //     loadTemplateHeaderFooter1(object_invoce);
    //     loadTemplateBody1(object_invoce);
    // }

    // function updateTemplate2(object_invoce, bprint) {
    //     initTemplateHeaderFooter2();
    //     $("#html-2-pdfwrapper_quotes").hide();
    //     $("#html-2-pdfwrapper_quotes2").show();
    //     $("#html-2-pdfwrapper_quotes3").hide();
    //     if (bprint == false)
    //         $("#templatePreviewModal").modal("toggle");
    //     loadTemplateHeaderFooter2(object_invoce);
    //     loadTemplateBody2(object_invoce);
    // }

    // function updateTemplate3(object_invoce, bprint) {
    //     initTemplateHeaderFooter3();
    //     $("#html-2-pdfwrapper_quotes").hide();
    //     $("#html-2-pdfwrapper_quotes2").hide();
    //     $("#html-2-pdfwrapper_quotes3").show();
    //     if (bprint == false)
    //         $("#templatePreviewModal").modal("toggle");
    //     loadTemplateHeaderFooter3(object_invoce);
    //     loadTemplateBody3(object_invoce);
    // }

    // function updateTemplate(object_invoce) {

    //     if (object_invoce.length > 0) {

    //         $('#html-2-pdfwrapper_new #printcomment').text(object_invoce[0]["comment"]);
    //         $("#html-2-pdfwrapper_new .o_url").text(object_invoce[0]["o_url"]);
    //         $("#html-2-pdfwrapper_new .o_name").text(object_invoce[0]["o_name"]);
    //         $("#html-2-pdfwrapper_new .o_address1").text(
    //             object_invoce[0]["o_address"]
    //         );
    //         $("#html-2-pdfwrapper_new .o_city").text(object_invoce[0]["o_city"]);
    //         $("#html-2-pdfwrapper_new .o_state").text(object_invoce[0]["o_state"]);
    //         $("#html-2-pdfwrapper_new .o_reg").text(object_invoce[0]["o_reg"]);
    //         $("#html-2-pdfwrapper_new .o_abn").text(object_invoce[0]["o_abn"]);
    //         $("#html-2-pdfwrapper_new .o_phone").text(object_invoce[0]["o_phone"]);

    //         if (object_invoce[0]["applied"] == "") {
    //             $("#html-2-pdfwrapper_new .applied").hide()
    //             $("#html-2-pdfwrapper_new .applied").text(object_invoce[0]["applied"]);
    //         } else {
    //             $("#html-2-pdfwrapper_new .applied").show()
    //             $("#html-2-pdfwrapper_new .applied").text("Applied : " + object_invoce[0]["applied"]);
    //         }



    //         if (object_invoce[0]["supplier_type"] == "") {
    //             $("#html-2-pdfwrapper_new .customer").hide()
    //         } else {
    //             $("#html-2-pdfwrapper_new .customer").show()
    //         }
    //         $("#html-2-pdfwrapper_new .customer").empty();
    //         $("#html-2-pdfwrapper_new .customer").append(object_invoce[0]["supplier_type"]);

    //         if (object_invoce[0]["supplier_name"] == "") {
    //             $("#html-2-pdfwrapper_new .pdfCustomerName").hide()
    //         } else {
    //             $("#html-2-pdfwrapper_new .pdfCustomerName").show()
    //         }
    //         $("#html-2-pdfwrapper_new .pdfCustomerName").empty();
    //         $("#html-2-pdfwrapper_new .pdfCustomerName").append(object_invoce[0]["supplier_name"]);

    //         if (object_invoce[0]["supplier_addr"] == "") {
    //             $("#html-2-pdfwrapper_new .pdfCustomerAddress").hide()
    //         } else {
    //             $("#html-2-pdfwrapper_new .pdfCustomerAddress").show()
    //         }
    //         $("#html-2-pdfwrapper_new .pdfCustomerAddress").empty();
    //         $("#html-2-pdfwrapper_new .pdfCustomerAddress").append(object_invoce[0]["supplier_addr"]);


    //         // $("#html-2-pdfwrapper_new .print-header").text(object_invoce[0]["title"]);

    //         $("#templatePreviewModal .modal-title").text(
    //             object_invoce[0]["title"] + " " + object_invoce[0]["value"] + " template"
    //         );

    //         if (object_invoce[0]["value"] == "") {
    //             $('.print-header').text();
    //         }
    //         else {
    //             $('.print-header').text(object_invoce[0]["value"]);
    //         }


    //         if (object_invoce[0]["bsb"] == "") {
    //             $('#html-2-pdfwrapper_new .field_payment').hide();

    //         }
    //         else {

    //             $('#html-2-pdfwrapper_new .field_payment').show();
    //         }

    //         $("#html-2-pdfwrapper_new .bsb").text("BSB (Branch Number) : " + object_invoce[0]["bsb"]);
    //         $("#html-2-pdfwrapper_new .account_number").text("Account Number : " + object_invoce[0]["account"]);
    //         $("#html-2-pdfwrapper_new .swift").text("Swift Code : " + object_invoce[0]["swift"]);


    //         if (object_invoce[0]["date"] == "") {
    //             $("#html-2-pdfwrapper_new .dateNumber").hide();
    //         } else {
    //             $("#html-2-pdfwrapper_new .dateNumber").show();
    //         }

    //         if (object_invoce[0]["showFX"] == "") {
    //             $("#html-2-pdfwrapper_new .showFx").hide();
    //             $("#html-2-pdfwrapper_new .showFxValue").hide();
    //         } else {
    //             $("#html-2-pdfwrapper_new .showFx").show();
    //             $("#html-2-pdfwrapper_new .showFxValue").show();
    //             $("#html-2-pdfwrapper_new .showFxValue").text(object_invoce[0]["showFX"]);
    //         }

    //         $("#html-2-pdfwrapper_new .date").text(object_invoce[0]["date"]);

    //         if (object_invoce[0]["pqnumber"] == "") {
    //             $("#html-2-pdfwrapper_new .pdfPONumber").hide();
    //         } else {
    //             $("#html-2-pdfwrapper_new .pdfPONumber").show();
    //         }

    //         if (object_invoce[0]["customfield1"] == "NA") {
    //             $('#customfieldtablenew').css('display', 'none');
    //             $('#customdatatablenew').css('display', 'none');
    //             $('#html-2-pdfwrapper_new .customfield1').text('');
    //             $('#html-2-pdfwrapper_new .customfield2').text('');
    //             $('#html-2-pdfwrapper_new .customfield3').text('');


    //             $('#html-2-pdfwrapper_new .customfield1data').text('');
    //             $('#html-2-pdfwrapper_new .customfield2data').text('');
    //             $('#html-2-pdfwrapper_new .customfield3data').text('');

    //         }
    //         else {
    //             $('#customfieldtablenew').css('display', 'block');
    //             $('#customdatatablenew').css('display', 'block');

    //             $('#html-2-pdfwrapper_new .customfield1').text(object_invoce[0]["customfieldlabel1"]);
    //             $('#html-2-pdfwrapper_new .customfield2').text(object_invoce[0]["customfieldlabel2"]);
    //             $('#html-2-pdfwrapper_new .customfield3').text(object_invoce[0]["customfieldlabel3"]);

    //             if (object_invoce[0]["customfield1"] == '' || object_invoce[0]["customfield1"] == 0) {
    //                 $('#html-2-pdfwrapper_new .customfield1data').text('');
    //             }
    //             else {
    //                 $('#html-2-pdfwrapper_new .customfield1data').text(object_invoce[0]["customfield1"]);
    //             }

    //             if (object_invoce[0]["customfield2"] == '' || object_invoce[0]["customfield2"] == 0) {
    //                 $('#html-2-pdfwrapper_new .customfield2data').text('');
    //             }
    //             else {
    //                 $('#html-2-pdfwrapper_new .customfield2data').text(object_invoce[0]["customfield2"]);
    //             }

    //             if (object_invoce[0]["customfield3"] == '' || object_invoce[0]["customfield3"] == 0) {
    //                 $('#html-2-pdfwrapper_new .customfield3data').text('');
    //             }
    //             else {
    //                 $('#html-2-pdfwrapper_new .customfield3data').text(object_invoce[0]["customfield3"]);
    //             }



    //         }



    //         $("#html-2-pdfwrapper_new .po").text(object_invoce[0]["pqnumber"]);

    //         if (object_invoce[0]["invoicenumber"] == "") {
    //             $("#html-2-pdfwrapper_new .invoiceNumber").hide();
    //         } else {
    //             $("#html-2-pdfwrapper_new .invoiceNumber").show();
    //         }

    //         $("#html-2-pdfwrapper_new .io").text(object_invoce[0]["invoicenumber"]);

    //         if (object_invoce[0]["refnumber"] == "") {
    //             $("#html-2-pdfwrapper_new .refNumber").hide();
    //         } else {
    //             $("#html-2-pdfwrapper_new .refNumber").show();
    //         }
    //         $("#html-2-pdfwrapper_new .ro").text(object_invoce[0]["refnumber"]);

    //         if (object_invoce[0]["duedate"] == "") {
    //             $("#html-2-pdfwrapper_new .pdfTerms").hide();
    //         } else {
    //             $("#html-2-pdfwrapper_new .pdfTerms").show();
    //         }
    //         $("#html-2-pdfwrapper_new .due").text(object_invoce[0]["duedate"]);

    //         if (object_invoce[0]["paylink"] == "") {
    //             $("#html-2-pdfwrapper_new .link").hide();
    //             $("#html-2-pdfwrapper_new .linkText").hide();
    //         } else {
    //             $("#html-2-pdfwrapper_new .link").show();
    //             $("#html-2-pdfwrapper_new .linkText").show();
    //         }

    //         if (object_invoce[0]["customfield1"] == "") {
    //             $('#customfieldlable').css('display', 'none');
    //             $('#customfieldlabledata').css('display', 'none');

    //         }
    //         else {
    //             $('#customfieldlable').css('display', 'block');
    //             $('#customfieldlabledata').css('display', 'block');
    //         }

    //         //   table header
    //         var tbl_header = $("#html-2-pdfwrapper_new .tbl_header")
    //         tbl_header.empty()
    //         var count = 0;
    //         for (const [key, value] of Object.entries(object_invoce[0]["fields"])) {

    //             if (count == 0) {
    //                 tbl_header.append("<th style='width: 200px;background:white;color: rgb(0 0 0);width:" + value + "%';>" + key + "</th>")
    //             }
    //             else if (count == 1) {
    //                 tbl_header.append("<th style='width: 250px;background:white;color: rgb(0 0 0);width:" + value + "%';>" + key + "</th>")
    //             }
    //             else if (count == 2) {
    //                 tbl_header.append("<th style='text-align: right; width: 77px;background:white;color: rgb(0 0 0);width:" + value + "%';>" + key + "</th>")
    //             }
    //             else {
    //                 tbl_header.append("<th style='text-align: right; width: 100px;background:white;color: rgb(0 0 0);width:" + value + "%';>" + key + "</th>")
    //             }

    //             count++;
    //         }

    //         if (object_invoce[0]["taxItems"]) {
    //             let taxItems = object_invoce[0]["taxItems"];
    //             if (taxItems && Object.keys(taxItems).length > 0) {
    //                 $("#html-2-pdfwrapper_new #tax_list_print").html("");
    //                 Object.keys(taxItems).map((code) => {
    //                     let html = `
    //                         <div style="width: 100%; display: flex;">
    //                             <div style="padding-right: 16px; width: 50%;">
    //                                 <p style="font-weight: 600; text-align: left; margin-bottom: 8px; color: rgb(0 0 0);">
    //                                     ${code}</p>
    //                             </div>
    //                             <div style="padding-left: 16px; width: 50%;">
    //                                 <p style="font-weight: 600; text-align: right; margin-bottom: 8px; color: rgb(0 0 0);">
    //                                     $${taxItems[code].toFixed(3)}</p>
    //                             </div>
    //                         </div>
    //                     `;
    //                     $("#html-2-pdfwrapper_new #tax_list_print").append(html);
    //                 });
    //             } else {
    //                 $("#html-2-pdfwrapper_new #tax_list_print").remove();
    //             }
    //         }

    //     }

    //     var tbl_content = $("#html-2-pdfwrapper_new .tbl_content")
    //     tbl_content.empty()
    //     const data = object_invoce[0]["data"]

    //     for (item of data) {

    //         var html = '';
    //         html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
    //         var count = 0;

    //         for (item_temp of item) {

    //             if (count == 0) {
    //                 html = html + "<td>" + item_temp + "</td>";
    //             }
    //             else if (count == 1) {
    //                 html = html + "<td>" + item_temp + "</td>";
    //             }
    //             else if (count == 2) {
    //                 html = html + "<td style='text-align: right;'>" + item_temp + "</td>";
    //             }
    //             else {
    //                 html = html + "<td style='text-align: right;'>" + item_temp + "</td>";
    //             }
    //             count++;
    //         }

    //         html += "</tr>";
    //         tbl_content.append(html);

    //     }
    //     // total amount

    //     if (object_invoce[0]["subtotal"] == "") {
    //         $("#html-2-pdfwrapper_new .field_amount").hide();
    //     }
    //     else {
    //         $("#html-2-pdfwrapper_new .field_amount").show();

    //         if (object_invoce[0]["subtotal"] != "") {
    //             $('#html-2-pdfwrapper_new #subtotal_total').text("Sub total");
    //             $("#html-2-pdfwrapper_new #subtotal_totalPrint").text(object_invoce[0]["subtotal"]);
    //         }

    //         if (object_invoce[0]["gst"] != "") {
    //             $('#html-2-pdfwrapper_new #grandTotal').text("Grand total");
    //             $("#html-2-pdfwrapper_new #totalTax_totalPrint").text(object_invoce[0]["gst"]);
    //         }


    //         if (object_invoce[0]["total"] != "") {
    //             $("#html-2-pdfwrapper_new #grandTotalPrint").text(object_invoce[0]["total"]);
    //         }

    //         if (object_invoce[0]["bal_due"] != "") {
    //             $("#html-2-pdfwrapper_new #totalBalanceDuePrint").text(object_invoce[0]["bal_due"]);
    //         }

    //         if (object_invoce[0]["paid_amount"] != "") {
    //             $("#html-2-pdfwrapper_new #paid_amount").text(object_invoce[0]["paid_amount"]);
    //         }

    //     }

    // }

    // function saveTemplateFields(key, value) {
    //     localStorage.setItem(key, value)
    // }


    templateObject.getShpVias = function () {
        getVS1Data('TShippingMethod').then(function (dataObject) {
            if (dataObject.length == 0) {
                purchaseService.getShpVia().then(function (data) {
                    for (let i in data.tshippingmethod) {

                        let viarecordObj = {
                            shippingmethod: data.tshippingmethod[i].ShippingMethod || ' ',
                        };

                        viarecords.push(viarecordObj);
                        templateObject.viarecords.set(viarecords);

                    }
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tshippingmethod;
                for (let i in useData) {

                    let viarecordObj = {
                        shippingmethod: useData[i].ShippingMethod || ' ',
                    };

                    viarecords.push(viarecordObj);
                    templateObject.viarecords.set(viarecords);

                }

            }
        }).catch(function (err) {
            purchaseService.getShpVia().then(function (data) {
                for (let i in data.tshippingmethod) {

                    let viarecordObj = {
                        shippingmethod: data.tshippingmethod[i].ShippingMethod || ' ',
                    };

                    viarecords.push(viarecordObj);
                    templateObject.viarecords.set(viarecords);

                }
            });
        });

    };

    // templateObject.getDepartments = function () {
    //     getVS1Data('TDeptClass').then(function (dataObject) {
    //         if (dataObject.length == 0) {
    //             purchaseService.getDepartment().then(function (data) {
    //                 for (let i in data.tdeptclass) {

    //                     let deptrecordObj = {
    //                         department: data.tdeptclass[i].DeptClassName || ' ',
    //                     };

    //                     deptrecords.push(deptrecordObj);
    //                     templateObject.deptrecords.set(deptrecords);

    //                 }
    //             });
    //         } else {
    //             let data = JSON.parse(dataObject[0].data);
    //             let useData = data.tdeptclass;
    //             for (let i in useData) {

    //                 let deptrecordObj = {
    //                     department: useData[i].DeptClassName || ' ',
    //                 };

    //                 deptrecords.push(deptrecordObj);
    //                 templateObject.deptrecords.set(deptrecords);

    //             }

    //         }
    //     }).catch(function (err) {
    //         purchaseService.getDepartment().then(function (data) {
    //             for (let i in data.tdeptclass) {

    //                 let deptrecordObj = {
    //                     department: data.tdeptclass[i].DeptClassName || ' ',
    //                 };

    //                 deptrecords.push(deptrecordObj);
    //                 templateObject.deptrecords.set(deptrecords);

    //             }
    //         });
    //     });

    // };

    // templateObject.getTerms = function () {
    //     getVS1Data('TTermsVS1').then(function (dataObject) {
    //         if (dataObject.length == 0) {
    //             purchaseService.getTermVS1().then(function (data) {
    //                 for (let i in data.ttermsvs1) {

    //                     let termrecordObj = {
    //                         termsname: data.ttermsvs1[i].TermsName || ' ',
    //                     };

    //                     if (data.ttermsvs1[i].isPurchasedefault == true) {
    //                         localStorage.setItem('ERPTermsPurchase', data.ttermsvs1[i].TermsName || "COD");
    //                         purchaseDefaultTerms = data.ttermsvs1[i].TermsName || ' ';
    //                     }

    //                     termrecords.push(termrecordObj);
    //                     templateObject.termrecords.set(termrecords);

    //                 }
    //             });
    //         } else {
    //             let data = JSON.parse(dataObject[0].data);
    //             let useData = data.ttermsvs1;
    //             for (let i in useData) {

    //                 let termrecordObj = {
    //                     termsname: useData[i].TermsName || ' ',
    //                 };

    //                 if (useData[i].isPurchasedefault == true) {
    //                     purchaseDefaultTerms = useData[i].TermsName || ' ';
    //                 }

    //                 termrecords.push(termrecordObj);
    //                 templateObject.termrecords.set(termrecords);

    //             }

    //         }
    //     }).catch(function (err) {
    //         purchaseService.getTermVS1().then(function (data) {
    //             for (let i in data.ttermsvs1) {

    //                 let termrecordObj = {
    //                     termsname: data.ttermsvs1[i].TermsName || ' ',
    //                 };

    //                 if (data.ttermsvs1[i].isPurchasedefault == true) {
    //                     localStorage.setItem('ERPTermsPurchase', data.ttermsvs1[i].TermsName || "COD");
    //                     purchaseDefaultTerms = data.ttermsvs1[i].TermsName || ' ';
    //                 }

    //                 termrecords.push(termrecordObj);
    //                 templateObject.termrecords.set(termrecords);

    //             }
    //         });
    //     });

    // };
    templateObject.getShpVias();
    //templateObject.getTerms();
    // templateObject.getDepartments();


    let table;
    $(document).ready(function () {
        $('#edtSupplierName').editableSelect();
        $('#edtSupplierName').val('');
        $('.sltCurrency').editableSelect();
        $('#sltTerms').editableSelect();
        $('#sltDept').editableSelect();
        $('#sltStatus').editableSelect();
        $('#shipvia').editableSelect();

        // $('#addRow').on('click', function () {
        //     var getTableFields = [$('#tblBillLine tbody tr .lineAccountName')];
        //     var checkEmptyFields;
        //     for (var i = 0; i < getTableFields.length; i++) {
        //         checkEmptyFields = getTableFields[i].filter(function (i, element) {
        //             return $.trim($(this).val()) === '';
        //         });
        //     };
        //     if (!checkEmptyFields.length) {
        //         var rowData = $('#tblBillLine tbody>tr:last').clone(true);
        //         let tokenid = Random.id();
        //         $(".lineAccountName", rowData).val("");
        //         $(".lineMemo", rowData).text("");
        //         $(".lineQty", rowData).val("");
        //         $(".lineAmount", rowData).val("");
        //         $(".lineTaxRate", rowData).text("");
        //         $(".lineTaxCode", rowData).val("");
        //         $(".lineTaxAmount", rowData).text("");
        //         $(".lineAmt", rowData).text("");
        //         rowData.attr('id', tokenid);
        //         $("#tblBillLine tbody").append(rowData);

        //         if ($('#printID').val() != "") {
        //             var rowData1 = $('.bill_print tbody>tr:last').clone(true);
        //             $("#lineAccountName", rowData1).text("");
        //             $("#lineMemo", rowData1).text("");
        //             $("#lineQty", rowData1).text("");
        //             $("#lineAmount", rowData1).text("");
        //             $("#lineTaxRate", rowData).text("");
        //             $("#lineTaxCode", rowData1).text("");
        //             $("#lineAmt", rowData1).text("");
        //             rowData1.attr('id', tokenid);
        //             $(".bill_print tbody").append(rowData1);
        //         }

        //         setTimeout(function () {
        //             $('#' + tokenid + " .lineAccountName").trigger('click');
        //         }, 200);
        //     } else {
        //         $("#tblBillLine tbody tr").each(function (index) {
        //             var $tblrow = $(this);
        //             if ($tblrow.find(".lineAccountName").val() == '') {
        //                 $tblrow.find(".colAccountName").addClass('boldtablealertsborder');
        //             }
        //         });
        //     }
        // });
    });



    // $(document).on("click", "#tblShipViaPopList tbody tr", function (e) {
    //     $('#shipvia').val($(this).find(".colShipName ").text());
    //     $('#shipViaModal').modal('toggle');

    //     $('#tblShipViaPopList_filter .form-control-sm').val('');
    //     setTimeout(function () {
    //         $('.btnRefreshVia').trigger('click');
    //         LoadingOverlay.hide();
    //     }, 1000);
    // });
    // $(document).on("click", ".tblAccountListPop tbody tr", function (e) {
    //     $(".colAccountName").removeClass('boldtablealertsborder');
    //     let selectLineID = $('#selectLineID').val();
    //     let taxcodeList = templateObject.taxraterecords.get();
    //     var table = $(this);
    //     let utilityService = new UtilityService();
    //     let $tblrows = $("#tblBillLine tbody tr");
    //     let $printrows = $(".bill_print tbody tr");

    //     if (selectLineID) {
    //         let lineProductName = table.find(".colAccountName").text();
    //         let lineProductDesc = table.find(".colDescription").text();

    //         let lineUnitPrice = "0.00";
    //         let lineTaxRate = table.find(".taxrate").text();
    //         let lineAmount = 0;
    //         let subGrandTotal = 0;
    //         let taxGrandTotal = 0;
    //         let taxGrandTotalPrint = 0;
    //         $('#' + selectLineID + " .lineTaxRate").text(0);
    //         if (taxcodeList) {
    //             for (var i = 0; i < taxcodeList.length; i++) {
    //                 if (taxcodeList[i].codename == lineTaxRate) {
    //                     $('#' + selectLineID + " .lineTaxRate").text(taxcodeList[i].coderate || 0);
    //                 }
    //             }
    //         }
    //         $('#' + selectLineID + " .lineAccountName").val(lineProductName);
    //         $('#' + selectLineID + " .lineMemo").text(lineProductDesc);
    //         $('#' + selectLineID + " .colAmountExChange").val(lineUnitPrice);
    //         $('#' + selectLineID + " .lineTaxCode").val(lineTaxRate);

    //         if ($('.printID').val() == "") {
    //             $('#' + selectLineID + " #lineAccountName").text(lineProductName);
    //             $('#' + selectLineID + " #lineMemo").text(lineProductDesc);
    //             $('#' + selectLineID + " #colAmount").text(lineUnitPrice);
    //             $('#' + selectLineID + " #lineTaxCode").text(lineTaxRate);
    //         }

    //         $('#accountListModal').modal('toggle');
    //         $tblrows.each(function (index) {
    //             var $tblrow = $(this);
    //             var amount = $tblrow.find(".colAmountExChange").val() || "0";
    //             var taxcode = $tblrow.find(".lineTaxCode").val() || 0;

    //             var taxrateamount = 0;
    //             if (taxcodeList) {
    //                 for (var i = 0; i < taxcodeList.length; i++) {
    //                     if (taxcodeList[i].codename == taxcode) {
    //                         taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100 || 0;
    //                     }
    //                 }
    //             }


    //             var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
    //             var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
    //             $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
    //             if (!isNaN(subTotal)) {
    //                 $tblrow.find('.colAmountExChange').val(utilityService.modifynegativeCurrencyFormat(subTotal.toFixed(2)));
    //                 let totalAmountInc = (parseFloat(subTotal)) + (parseFloat(taxTotal)) || 0;
    //                 $tblrow.find('.colAmountIncChange').val(utilityService.modifynegativeCurrencyFormat(totalAmountInc.toFixed(2)));
    //                 subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
    //                 document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal.toFixed(2));
    //             }

    //             if (!isNaN(taxTotal)) {
    //                 taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
    //                 document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal.toFixed(2));
    //             }

    //             if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
    //                 let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
    //                 document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
    //                 document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
    //                 document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));

    //             }
    //         });

    //         if ($(".printID").val() == "") {
    //             $printrows.each(function (index) {
    //                 var $printrows = $(this);
    //                 var amount = $printrows.find("#lineAmount").text() || "0";
    //                 var taxcode = $printrows.find("#lineTaxCode").text() || 0;

    //                 var taxrateamount = 0;
    //                 if (taxcodeList) {
    //                     for (var i = 0; i < taxcodeList.length; i++) {
    //                         if (taxcodeList[i].codename == taxcode) {
    //                             taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100 || 0;
    //                         }
    //                     }
    //                 }


    //                 var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
    //                 var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
    //                 $printrows.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal))

    //                 if (!isNaN(subTotal)) {
    //                     $printrows.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
    //                     subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
    //                     document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
    //                 }

    //                 if (!isNaN(taxTotal)) {
    //                     taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
    //                 }
    //                 if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
    //                     let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
    //                     document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
    //                     //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //                     document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

    //                 }
    //             });
    //         }
    //     } else {
    //         let lineProductName = table.find(".colAccountName").text();
    //         let lineProductDesc = table.find(".colDescription").text();

    //         let lineUnitPrice = "0.00";
    //         let lineTaxRate = table.find(".taxrate").text();
    //         let lineAmount = 0;
    //         let subGrandTotal = 0;
    //         let taxGrandTotal = 0;
    //         let taxGrandTotalPrint = 0;
    //         $("#tblBillLine tbody>tr:first .lineTaxRate").text(0);
    //         $("#tblBillLine tbody>tr:first .lineAccountName").val(lineProductName);
    //         $("#tblBillLine tbody>tr:first .lineMemo").text(lineProductDesc);
    //         $("#tblBillLine tbody>tr:first .colAmountExChange").val(lineUnitPrice);
    //         $("#tblBillLine tbody>tr:first .lineTaxCode").val(lineTaxRate);
    //         $('#accountListModal').modal('toggle');
    //         if (taxcodeList) {
    //             for (var i = 0; i < taxcodeList.length; i++) {
    //                 if (taxcodeList[i].codename == lineTaxRate) {
    //                     $(".lineTaxRate").text(taxcodeList[i].coderate || 0);
    //                 }
    //             }
    //         };

    //         $tblrows.each(function (index) {
    //             var $tblrow = $(this);
    //             var amount = $tblrow.find(".colAmountExChange").val() || "0";
    //             var taxcode = $tblrow.find(".lineTaxCode").val() || 0;

    //             var taxrateamount = 0;
    //             if (taxcodeList) {
    //                 for (var i = 0; i < taxcodeList.length; i++) {
    //                     if (taxcodeList[i].codename == taxcode) {
    //                         taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100 || 0;
    //                     }
    //                 }
    //             }


    //             var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
    //             var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
    //             $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
    //             if (!isNaN(subTotal)) {
    //                 $tblrow.find('.colAmountExChange').val(utilityService.modifynegativeCurrencyFormat(subTotal.toFixed(2)));
    //                 let totalAmountInc = (parseFloat(subTotal)) + (parseFloat(taxTotal)) || 0;
    //                 $tblrow.find('.colAmountIncChange').val(utilityService.modifynegativeCurrencyFormat(totalAmountInc.toFixed(2)));
    //                 subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
    //                 document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal.toFixed(2));
    //             }

    //             if (!isNaN(taxTotal)) {
    //                 taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
    //                 document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal.toFixed(2));
    //             }

    //             if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
    //                 let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
    //                 document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
    //                 document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
    //                 document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));

    //             }
    //         });

    //     }

    //     $('#tblAccount_filter .form-control-sm').val('');
    //     setTimeout(function () {
    //         $('.btnRefreshAccount').trigger('click');
    //         LoadingOverlay.hide();
    //     }, 1000);
    // });
    // $(document).on("click", "#tblTaxRate tbody tr", function (e) {
    //     let selectLineID = $('#selectLineID').val();
    //     let taxcodeList = templateObject.taxraterecords.get();
    //     var table = $(this);
    //     let utilityService = new UtilityService();
    //     let $tblrows = $("#tblBillLine tbody tr");
    //     if (selectLineID) {
    //         let lineTaxCode = table.find(".taxName").text();
    //         let lineTaxRate = table.find(".taxRate").text();
    //         let lineAmount = 0;
    //         let subGrandTotal = 0;
    //         let taxGrandTotal = 0;
    //         let taxGrandTotalPrint = 0;


    //         $('#' + selectLineID + " .lineTaxRate").text(lineTaxRate || 0);
    //         $('#' + selectLineID + " .lineTaxCode").val(lineTaxCode);
    //         let $printrows = $(".bill_print tbody tr");
    //         if ($('.printID').val() == "") {
    //             $('#' + selectLineID + " #lineAmount").text($('#' + selectLineID + " .colAmountExChange").val());
    //             $('#' + selectLineID + " #lineTaxCode").text(lineTaxCode);

    //         }

    //         $('#taxRateListModal').modal('toggle');
    //         $tblrows.each(function (index) {
    //             var $tblrow = $(this);
    //             var amount = $tblrow.find(".colAmountExChange").val() || 0;
    //             var taxcode = $tblrow.find(".lineTaxCode").val() || '';

    //             var taxrateamount = 0;
    //             if (taxcodeList) {
    //                 for (var i = 0; i < taxcodeList.length; i++) {
    //                     if (taxcodeList[i].codename == taxcode) {

    //                         taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;

    //                     }
    //                 }
    //             }


    //             var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
    //             if ((taxrateamount == '') || (taxrateamount == ' ')) {
    //                 var taxTotal = 0;
    //             } else {
    //                 var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
    //             }
    //             $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
    //             if (!isNaN(subTotal)) {
    //                 $tblrow.find('.colAmountExChange').val(utilityService.modifynegativeCurrencyFormat(subTotal.toFixed(2)));
    //                 let totalAmountInc = (parseFloat(subTotal)) + (parseFloat(taxTotal)) || 0;
    //                 $tblrow.find('.colAmountIncChange').val(utilityService.modifynegativeCurrencyFormat(totalAmountInc.toFixed(2)));
    //                 subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
    //                 document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal.toFixed(2));
    //             }

    //             if (!isNaN(taxTotal)) {
    //                 taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
    //                 document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal.toFixed(2));
    //             }

    //             if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
    //                 let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
    //                 document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
    //                 document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
    //                 document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));

    //             }
    //         });

    //         if ($(".printID").val() == "") {
    //             $printrows.each(function (index) {
    //                 var $printrow = $(this);
    //                 var amount = $printrow.find("#lineAmount").text() || "0";
    //                 var taxcode = $printrow.find("#lineTaxCode").text() || "E";

    //                 var taxrateamount = 0;
    //                 if (taxcodeList) {
    //                     for (var i = 0; i < taxcodeList.length; i++) {
    //                         if (taxcodeList[i].codename == taxcode) {
    //                             taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100 || 0;
    //                         }
    //                     }
    //                 }

    //                 var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
    //                 var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
    //                 $printrow.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
    //                 if (!isNaN(subTotal)) {
    //                     $printrow.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
    //                     subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
    //                     document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
    //                 }

    //                 if (!isNaN(taxTotal)) {
    //                     taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
    //                 }
    //                 if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
    //                     let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
    //                     document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
    //                     //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //                     document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

    //                 }
    //             });
    //         }
    //     }
    // });
    // $(document).on("click", "#tblCustomerlist tbody tr", function (e) {
    //     let selectLineID = $('#customerSelectLineID').val();
    //     const table = $(this);
    //     let utilityService = new UtilityService();
    //     let $tblrows = $("#tblBillLine tbody tr");
    //     if (selectLineID) {
    //         let companyName = table.find(".colCompany").text();
    //         let jobName = table.find(".colCompany").text();
    //         if (jobName.replace(/\s/g, '') != '') {
    //             $('#' + selectLineID + " .lineCustomerJob").val(jobName || '');
    //         } else {
    //             $('#' + selectLineID + " .lineCustomerJob").val(companyName || '');
    //         }
    //         $('#customerListModal').modal('toggle');
    //     }
    // });


    // $(document).on("click", "#tblCurrencyPopList tbody tr", function(e) {
    //     $('.sltCurrency').val($(this).find(".colCode").text());
    //     $('#currencyModal').modal('toggle');

    //     $('#tblCurrencyPopList_filter .form-control-sm').val('');
    //     setTimeout(function () {
    //         $('.btnRefreshCurrency').trigger('click');
    //         LoadingOverlay.hide();
    //     }, 1000);
    // });

    // $(document).on("click", "#departmentList tbody tr", function (e) {
    //     $('#sltDept').val($(this).find(".colDeptName").text());
    //     $('#departmentModal').modal('toggle');
    // });
    // $(document).on("click", "#termsList tbody tr", function (e) {
    //     $('#sltTerms').val($(this).find(".colName").text());
    //     $('#termsListModal').modal('hide');
    // });
    // $(document).on("click", "#tblStatusPopList tbody tr", function (e) {
    //     $('#sltStatus').val($(this).find(".colStatusName").text());
    //     $('#statusPopModal').modal('toggle');

    //     $('#tblStatusPopList_filter .form-control-sm').val('');
    //     setTimeout(function () {
    //         $('.btnRefreshStatus').trigger('click');
    //         LoadingOverlay.hide();
    //     }, 1000);
    // });
    $(document).ready(function () {
        // $('#sltTerms').editableSelect()
        //     .on('click.editable-select', function (e, li) {
        //         var $earch = $(this);
        //         var offset = $earch.offset();
        //         var termsDataName = e.target.value || '';
        //         $('#edtTermsID').val('');
        //         if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
        //             $('#termsListModal').modal('toggle');
        //         } else {
        //             if (termsDataName.replace(/\s/g, '') != '') {
        //                 $('#termModalHeader').text('Edit Terms');
        //                 getVS1Data('TTermsVS1').then(function (dataObject) { //edit to test indexdb
        //                     if (dataObject.length == 0) {
        //                         $('.fullScreenSpin').css('display', 'inline-block');
        //                         sideBarService.getTermsVS1().then(function (data) {
        //                             for (let i in data.ttermsvs1) {
        //                                 if (data.ttermsvs1[i].TermsName === termsDataName) {
        //                                     $('#edtTermsID').val(data.ttermsvs1[i].Id);
        //                                     $('#edtDays').val(data.ttermsvs1[i].Days);
        //                                     $('#edtName').val(data.ttermsvs1[i].TermsName);
        //                                     $('#edtDesc').val(data.ttermsvs1[i].Description);
        //                                     if (data.ttermsvs1[i].IsEOM === true) {
        //                                         $('#isEOM').prop('checked', true);
        //                                     } else {
        //                                         $('#isEOM').prop('checked', false);
        //                                     }
        //                                     if (data.ttermsvs1[i].IsEOMPlus === true) {
        //                                         $('#isEOMPlus').prop('checked', true);
        //                                     } else {
        //                                         $('#isEOMPlus').prop('checked', false);
        //                                     }
        //                                     if (data.ttermsvs1[i].isSalesdefault === true) {
        //                                         $('#chkCustomerDef').prop('checked', true);
        //                                     } else {
        //                                         $('#chkCustomerDef').prop('checked', false);
        //                                     }
        //                                     if (data.ttermsvs1[i].isPurchasedefault === true) {
        //                                         $('#chkSupplierDef').prop('checked', true);
        //                                     } else {
        //                                         $('#chkSupplierDef').prop('checked', false);
        //                                     }
        //                                 }
        //                             }
        //                             setTimeout(function () {
        //                                 LoadingOverlay.hide();
        //                                 $('#newTermsModal').modal('toggle');
        //                             }, 200);
        //                         });
        //                     } else {
        //                         let data = JSON.parse(dataObject[0].data);
        //                         let useData = data.ttermsvs1;
        //                         for (let i in useData) {
        //                             if (useData[i].TermsName === termsDataName) {
        //                                 $('#edtTermsID').val(useData[i].Id);
        //                                 $('#edtDays').val(useData[i].Days);
        //                                 $('#edtName').val(useData[i].TermsName);
        //                                 $('#edtDesc').val(useData[i].Description);
        //                                 if (useData[i].IsEOM === true) {
        //                                     $('#isEOM').prop('checked', true);
        //                                 } else {
        //                                     $('#isEOM').prop('checked', false);
        //                                 }
        //                                 if (useData[i].IsEOMPlus === true) {
        //                                     $('#isEOMPlus').prop('checked', true);
        //                                 } else {
        //                                     $('#isEOMPlus').prop('checked', false);
        //                                 }
        //                                 if (useData[i].isSalesdefault === true) {
        //                                     $('#chkCustomerDef').prop('checked', true);
        //                                 } else {
        //                                     $('#chkCustomerDef').prop('checked', false);
        //                                 }
        //                                 if (useData[i].isPurchasedefault === true) {
        //                                     $('#chkSupplierDef').prop('checked', true);
        //                                 } else {
        //                                     $('#chkSupplierDef').prop('checked', false);
        //                                 }
        //                             }
        //                         }
        //                         setTimeout(function () {
        //                             LoadingOverlay.hide();
        //                             $('#newTermsModal').modal('toggle');
        //                         }, 200);
        //                     }
        //                 }).catch(function (err) {
        //                     $('.fullScreenSpin').css('display', 'inline-block');
        //                     sideBarService.getTermsVS1().then(function (data) {
        //                         for (let i in data.ttermsvs1) {
        //                             if (data.ttermsvs1[i].TermsName === termsDataName) {
        //                                 $('#edtTermsID').val(data.ttermsvs1[i].Id);
        //                                 $('#edtDays').val(data.ttermsvs1[i].Days);
        //                                 $('#edtName').val(data.ttermsvs1[i].TermsName);
        //                                 $('#edtDesc').val(data.ttermsvs1[i].Description);
        //                                 if (data.ttermsvs1[i].IsEOM === true) {
        //                                     $('#isEOM').prop('checked', true);
        //                                 } else {
        //                                     $('#isEOM').prop('checked', false);
        //                                 }
        //                                 if (data.ttermsvs1[i].IsEOMPlus === true) {
        //                                     $('#isEOMPlus').prop('checked', true);
        //                                 } else {
        //                                     $('#isEOMPlus').prop('checked', false);
        //                                 }
        //                                 if (data.ttermsvs1[i].isSalesdefault === true) {
        //                                     $('#chkCustomerDef').prop('checked', true);
        //                                 } else {
        //                                     $('#chkCustomerDef').prop('checked', false);
        //                                 }
        //                                 if (data.ttermsvs1[i].isPurchasedefault === true) {
        //                                     $('#chkSupplierDef').prop('checked', true);
        //                                 } else {
        //                                     $('#chkSupplierDef').prop('checked', false);
        //                                 }
        //                             }
        //                         }
        //                         setTimeout(function () {
        //                             LoadingOverlay.hide();
        //                             $('#newTermsModal').modal('toggle');
        //                         }, 200);
        //                     });
        //                 });
        //             } else {
        //                 $('#termsListModal').modal();
        //                 setTimeout(function () {
        //                     $('#termsList_filter .form-control-sm').focus();
        //                     $('#termsList_filter .form-control-sm').val('');
        //                     $('#termsList_filter .form-control-sm').trigger("input");
        //                     var datatable = $('#termsList').DataTable();
        //                     datatable.draw();
        //                     $('#termsList_filter .form-control-sm').trigger("input");
        //                 }, 500);
        //             }
        //         }
        //     });

        // $('#sltStatus').editableSelect()
        //     .on('click.editable-select', function (e, li) {
        //         var $earch = $(this);
        //         var offset = $earch.offset();
        //         $('#statusId').val('');
        //         var statusDataName = e.target.value || '';
        //         if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
        //             $('#statusPopModal').modal('toggle');
        //         } else {
        //             if (statusDataName.replace(/\s/g, '') != '') {
        //                 $('#newStatusHeader').text('Edit Status');
        //                 $('#newStatus').val(statusDataName);

        //                 getVS1Data('TLeadStatusType').then(function (dataObject) {
        //                     if (dataObject.length == 0) {
        //                         $('.fullScreenSpin').css('display', 'inline-block');
        //                         sideBarService.getAllLeadStatus().then(function (data) {
        //                             for (let i in data.tleadstatustype) {
        //                                 if (data.tleadstatustype[i].TypeName === statusDataName) {
        //                                     $('#statusId').val(data.tleadstatustype[i].Id);
        //                                 }
        //                             }
        //                             setTimeout(function () {
        //                                 LoadingOverlay.hide();
        //                                 $('#newStatusPopModal').modal('toggle');
        //                             }, 200);
        //                         });
        //                     } else {
        //                         let data = JSON.parse(dataObject[0].data);
        //                         let useData = data.tleadstatustype;
        //                         for (let i in useData) {
        //                             if (useData[i].TypeName === statusDataName) {
        //                                 $('#statusId').val(useData[i].Id);

        //                             }
        //                         }
        //                         setTimeout(function () {
        //                             LoadingOverlay.hide();
        //                             $('#newStatusPopModal').modal('toggle');
        //                         }, 200);
        //                     }
        //                 }).catch(function (err) {
        //                     $('.fullScreenSpin').css('display', 'inline-block');
        //                     sideBarService.getAllLeadStatus().then(function (data) {
        //                         for (let i in data.tleadstatustype) {
        //                             if (data.tleadstatustype[i].TypeName === statusDataName) {
        //                                 $('#statusId').val(data.tleadstatustype[i].Id);
        //                             }
        //                         }
        //                         setTimeout(function () {
        //                             LoadingOverlay.hide();
        //                             $('#newStatusPopModal').modal('toggle');
        //                         }, 200);
        //                     });
        //                 });
        //                 setTimeout(function () {
        //                     LoadingOverlay.hide();
        //                     $('#newStatusPopModal').modal('toggle');
        //                 }, 200);

        //             } else {
        //                 $('#statusPopModal').modal();
        //                 setTimeout(function () {
        //                     $('#tblStatusPopList_filter .form-control-sm').focus();
        //                     $('#tblStatusPopList_filter .form-control-sm').val('');
        //                     $('#tblStatusPopList_filter .form-control-sm').trigger("input");
        //                     var datatable = $('#tblStatusPopList').DataTable();

        //                     datatable.draw();
        //                     $('#tblStatusPopList_filter .form-control-sm').trigger("input");

        //                 }, 500);
        //             }
        //         }
        //     });

        // $('#shipvia').editableSelect()
        //     .on('click.editable-select', function (e, li) {
        //         var $earch = $(this);
        //         var offset = $earch.offset();
        //         var shipvianame = e.target.value || '';
        //         $('#edtShipViaID').val('');
        //         $('#newShipViaMethodName').text('Add Ship Via');
        //         $('#edtShipVia').attr('readonly', false);
        //         if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
        //             $('#shipViaModal').modal('toggle');
        //             setTimeout(function () {
        //                 $('#tblShipViaPopList_filter .form-control-sm').focus();
        //                 $('#tblShipViaPopList_filter .form-control-sm').val('');
        //                 $('#tblShipViaPopList_filter .form-control-sm').trigger("input");
        //                 var datatable = $('#tblShipViaPopList').DataTable();
        //                 datatable.draw();
        //                 $('#tblShipViaPopList_filter .form-control-sm').trigger("input");
        //             }, 500);
        //         } else {
        //             if (shipvianame.replace(/\s/g, '') != '') {
        //                 $('#newShipViaMethodName').text('Edit Ship Via');
        //                 setTimeout(function () {
        //                     // $('#edtShipVia').attr('readonly', true);
        //                 }, 100);

        //                 getVS1Data('TShippingMethod').then(function (dataObject) {
        //                     if (dataObject.length == 0) {
        //                         $('.fullScreenSpin').css('display', 'inline-block');
        //                         sideBarService.getShippingMethodData().then(function (data) {
        //                             for (let i = 0; i < data.tshippingmethod.length; i++) {
        //                                 if (data.tshippingmethod[i].ShippingMethod === shipvianame) {
        //                                     $('#edtShipViaID').val(data.tshippingmethod[i].Id);
        //                                     $('#edtShipVia').val(data.tshippingmethod[i].ShippingMethod);
        //                                 }
        //                             }
        //                             setTimeout(function () {
        //                                 LoadingOverlay.hide();
        //                                 $('#newShipViaModal').modal('toggle');
        //                             }, 200);
        //                         }).catch(function (err) {
        //                             LoadingOverlay.hide();
        //                         });
        //                     } else {
        //                         let data = JSON.parse(dataObject[0].data);
        //                         let useData = data.tshippingmethod;
        //                         for (let i = 0; i < data.tshippingmethod.length; i++) {
        //                             if (useData[i].ShippingMethod === shipvianame) {
        //                                 $('#edtShipViaID').val(useData[i].Id);
        //                                 $('#edtShipVia').val(useData[i].ShippingMethod);
        //                             }
        //                         }
        //                         setTimeout(function () {
        //                             LoadingOverlay.hide();
        //                             $('#newShipViaModal').modal('toggle');
        //                         }, 200);
        //                     }
        //                 }).catch(function (err) {
        //                     $('.fullScreenSpin').css('display', 'inline-block');
        //                     sideBarService.getShippingMethodData().then(function (data) {
        //                         for (let i = 0; i < data.tshippingmethod.length; i++) {
        //                             if (data.tshippingmethod[i].ShippingMethod === shipvianame) {
        //                                 $('#edtShipViaID').val(data.tshippingmethod[i].Id);
        //                                 $('#edtShipVia').val(data.tshippingmethod[i].ShippingMethod);
        //                             }
        //                         }
        //                         setTimeout(function () {
        //                             LoadingOverlay.hide();
        //                             $('#edtShipVia').attr('readonly', false);
        //                             $('#newShipViaModal').modal('toggle');
        //                         }, 200);
        //                     }).catch(function (err) {
        //                         LoadingOverlay.hide();
        //                     });
        //                 });
        //             } else {
        //                 $('#shipViaModal').modal();
        //                 setTimeout(function () {
        //                     $('#tblShipViaPopList_filter .form-control-sm').focus();
        //                     $('#tblShipViaPopList_filter .form-control-sm').val('');
        //                     $('#tblShipViaPopList_filter .form-control-sm').trigger("input");
        //                     var datatable = $('#tblShipViaPopList').DataTable();
        //                     datatable.draw();
        //                     $('#tblShipViaPopList_filter .form-control-sm').trigger("input");
        //                 }, 500);
        //             }
        //         }
        //     });

        // $('#sltDept').editableSelect()
        //     .on('click.editable-select', function (e, li) {
        //         var $earch = $(this);
        //         var offset = $earch.offset();
        //         var deptDataName = e.target.value || '';
        //         $('#edtDepartmentID').val('');
        //         if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
        //             $('#departmentModal').modal('toggle');
        //         } else {
        //             if (deptDataName.replace(/\s/g, '') != '') {
        //                 $('#newDeptHeader').text('Edit Department');

        //                 getVS1Data('TDeptClass').then(function (dataObject) {
        //                     if (dataObject.length == 0) {
        //                         $('.fullScreenSpin').css('display', 'inline-block');
        //                         sideBarService.getDepartment().then(function (data) {
        //                             for (let i = 0; i < data.tdeptclass.length; i++) {
        //                                 if (data.tdeptclass[i].DeptClassName === deptDataName) {
        //                                     $('#edtDepartmentID').val(data.tdeptclass[i].Id);
        //                                     $('#edtNewDeptName').val(data.tdeptclass[i].DeptClassName);
        //                                     $('#edtSiteCode').val(data.tdeptclass[i].SiteCode);
        //                                     $('#edtDeptDesc').val(data.tdeptclass[i].Description);
        //                                 }
        //                             }
        //                             setTimeout(function () {
        //                                 LoadingOverlay.hide();
        //                                 $('#newDepartmentModal').modal('toggle');
        //                             }, 200);
        //                         });
        //                     } else {
        //                         let data = JSON.parse(dataObject[0].data);
        //                         let useData = data.tdeptclass;
        //                         for (let i = 0; i < data.tdeptclass.length; i++) {
        //                             if (data.tdeptclass[i].DeptClassName === deptDataName) {
        //                                 $('#edtDepartmentID').val(data.tdeptclass[i].Id);
        //                                 $('#edtNewDeptName').val(data.tdeptclass[i].DeptClassName);
        //                                 $('#edtSiteCode').val(data.tdeptclass[i].SiteCode);
        //                                 $('#edtDeptDesc').val(data.tdeptclass[i].Description);
        //                             }
        //                         }
        //                         setTimeout(function () {
        //                             LoadingOverlay.hide();
        //                             $('#newDepartmentModal').modal('toggle');
        //                         }, 200);
        //                     }
        //                 }).catch(function (err) {
        //                     $('.fullScreenSpin').css('display', 'inline-block');
        //                     sideBarService.getDepartment().then(function (data) {
        //                         for (let i = 0; i < data.tdeptclass.length; i++) {
        //                             if (data.tdeptclass[i].DeptClassName === deptDataName) {
        //                                 $('#edtDepartmentID').val(data.tdeptclass[i].Id);
        //                                 $('#edtNewDeptName').val(data.tdeptclass[i].DeptClassName);
        //                                 $('#edtSiteCode').val(data.tdeptclass[i].SiteCode);
        //                                 $('#edtDeptDesc').val(data.tdeptclass[i].Description);
        //                             }
        //                         }
        //                         setTimeout(function () {
        //                             LoadingOverlay.hide();
        //                             $('#newDepartmentModal').modal('toggle');
        //                         }, 200);
        //                     });
        //                 });
        //             } else {
        //                 $('#departmentModal').modal();
        //                 setTimeout(function () {
        //                     $('#departmentList_filter .form-control-sm').focus();
        //                     $('#departmentList_filter .form-control-sm').val('');
        //                     $('#departmentList_filter .form-control-sm').trigger("input");
        //                     var datatable = $('#departmentList').DataTable();
        //                     datatable.draw();
        //                     $('#departmentList_filter .form-control-sm').trigger("input");
        //                 }, 500);
        //             }
        //         }
        //     });

    });
    // $('.sltCurrency').editableSelect()
    //     .on('click.editable-select', function(e, li) {
    //         var $earch = $(this);
    //         var offset = $earch.offset();
    //         var currencyDataName = e.target.value || '';
    //         $('#edtCurrencyID').val('');
    //         if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
    //             $('#currencyModal').modal('toggle');
    //         } else {
    //             if (currencyDataName.replace(/\s/g, '') != '') {
    //                 $('#add-currency-title').text('Edit Currency');
    //                 $('#sedtCountry').prop('readonly', true);
    //                 getVS1Data('TCurrency').then(function(dataObject) {
    //                     if (dataObject.length == 0) {
    //                         $('.fullScreenSpin').css('display', 'inline-block');
    //                         sideBarService.getCurrencies().then(function(data) {
    //                             for (let i in data.tcurrency) {
    //                                 if (data.tcurrency[i].Code === currencyDataName) {
    //                                     $('#edtCurrencyID').val(data.tcurrency[i].Id);
    //                                     setTimeout(function() {
    //                                         $('#sedtCountry').val(data.tcurrency[i].Country);
    //                                     }, 200);
    //                                     //$('#sedtCountry').val(data.tcurrency[i].Country);
    //                                     $('#currencyCode').val(currencyDataName);
    //                                     $('#currencySymbol').val(data.tcurrency[i].CurrencySymbol);
    //                                     $('#edtCurrencyName').val(data.tcurrency[i].Currency);
    //                                     $('#edtCurrencyDesc').val(data.tcurrency[i].CurrencyDesc);
    //                                     $('#edtBuyRate').val(data.tcurrency[i].BuyRate);
    //                                     $('#edtSellRate').val(data.tcurrency[i].SellRate);
    //                                 }
    //                             }
    //                             setTimeout(function() {
    //                                 LoadingOverlay.hide();
    //                                 $('#newCurrencyModal').modal('toggle');
    //                                 $('#sedtCountry').attr('readonly', true);
    //                             }, 200);
    //                         });
    //                     } else {
    //                         let data = JSON.parse(dataObject[0].data);
    //                         let useData = data.tcurrency;
    //                         for (let i = 0; i < data.tcurrency.length; i++) {
    //                             if (data.tcurrency[i].Code === currencyDataName) {
    //                                 $('#edtCurrencyID').val(data.tcurrency[i].Id);
    //                                 $('#sedtCountry').val(data.tcurrency[i].Country);
    //                                 $('#currencyCode').val(currencyDataName);
    //                                 $('#currencySymbol').val(data.tcurrency[i].CurrencySymbol);
    //                                 $('#edtCurrencyName').val(data.tcurrency[i].Currency);
    //                                 $('#edtCurrencyDesc').val(data.tcurrency[i].CurrencyDesc);
    //                                 $('#edtBuyRate').val(data.tcurrency[i].BuyRate);
    //                                 $('#edtSellRate').val(data.tcurrency[i].SellRate);
    //                             }
    //                         }
    //                         setTimeout(function() {
    //                             LoadingOverlay.hide();
    //                             $('#newCurrencyModal').modal('toggle');
    //                         }, 200);
    //                     }

    //                 }).catch(function(err) {
    //                     $('.fullScreenSpin').css('display', 'inline-block');
    //                     sideBarService.getCurrencies().then(function(data) {
    //                         for (let i in data.tcurrency) {
    //                             if (data.tcurrency[i].Code === currencyDataName) {
    //                                 $('#edtCurrencyID').val(data.tcurrency[i].Id);
    //                                 setTimeout(function() {
    //                                     $('#sedtCountry').val(data.tcurrency[i].Country);
    //                                 }, 200);
    //                                 //$('#sedtCountry').val(data.tcurrency[i].Country);
    //                                 $('#currencyCode').val(currencyDataName);
    //                                 $('#currencySymbol').val(data.tcurrency[i].CurrencySymbol);
    //                                 $('#edtCurrencyName').val(data.tcurrency[i].Currency);
    //                                 $('#edtCurrencyDesc').val(data.tcurrency[i].CurrencyDesc);
    //                                 $('#edtBuyRate').val(data.tcurrency[i].BuyRate);
    //                                 $('#edtSellRate').val(data.tcurrency[i].SellRate);
    //                             }
    //                         }
    //                         setTimeout(function() {
    //                             LoadingOverlay.hide();
    //                             $('#newCurrencyModal').modal('toggle');
    //                             $('#sedtCountry').attr('readonly', true);
    //                         }, 200);
    //                     });
    //                 });

    //             } else {
    //                 $('#currencyModal').modal();
    //                 setTimeout(function() {
    //                     $('#tblCurrencyPopList_filter .form-control-sm').focus();
    //                     $('#tblCurrencyPopList_filter .form-control-sm').val('');
    //                     $('#tblCurrencyPopList_filter .form-control-sm').trigger("input");
    //                     var datatable = $('#tblCurrencyPopList').DataTable();
    //                     datatable.draw();
    //                     $('#tblCurrencyPopList_filter .form-control-sm').trigger("input");
    //                 }, 500);
    //             }
    //         }
    //     });



    // $('#edtSupplierName').editableSelect().on('click.editable-select', function(e, li) {
    //     var $earch = $(this);
    //     var offset = $earch.offset();
    //     $('#edtSupplierPOPID').val('');
    //     var supplierDataName = e.target.value || '';
    //     var supplierDataID = $('#edtSupplierName').attr('suppid').replace(/\s/g, '') || '';
    //     if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
    //         $('#supplierListModal').modal();
    //         setTimeout(function() {
    //             $('#tblSupplierlist_filter .form-control-sm').focus();
    //             $('#tblSupplierlist_filter .form-control-sm').val('');
    //             $('#tblSupplierlist_filter .form-control-sm').trigger("input");
    //             var datatable = $('#tblSupplierlist').DataTable();
    //             datatable.draw();
    //             $('#tblSupplierlist_filter .form-control-sm').trigger("input");
    //         }, 500);
    //     } else {
    //         if (supplierDataName.replace(/\s/g, '') != '') {
    //             getVS1Data('TSupplierVS1').then(function(dataObject) {
    //                 if (dataObject.length == 0) {
    //                     $('.fullScreenSpin').css('display', 'inline-block');
    //                     sideBarService.getOneSupplierDataExByName(supplierDataName).then(function(data) {
    //                         LoadingOverlay.hide();
    //                         let lineItems = [];

    //                         $('#add-supplier-title').text('Edit Supplier');
    //                         let popSupplierID = data.tsupplier[0].fields.ID || '';
    //                         let popSupplierName = data.tsupplier[0].fields.ClientName || '';
    //                         let popSupplierEmail = data.tsupplier[0].fields.Email || '';
    //                         let popSupplierTitle = data.tsupplier[0].fields.Title || '';
    //                         let popSupplierFirstName = data.tsupplier[0].fields.FirstName || '';
    //                         let popSupplierMiddleName = data.tsupplier[0].fields.CUSTFLD10 || '';
    //                         let popSupplierLastName = data.tsupplier[0].fields.LastName || '';
    //                         let popSuppliertfn = '' || '';
    //                         let popSupplierPhone = data.tsupplier[0].fields.Phone || '';
    //                         let popSupplierMobile = data.tsupplier[0].fields.Mobile || '';
    //                         let popSupplierFaxnumber = data.tsupplier[0].fields.Faxnumber || '';
    //                         let popSupplierSkypeName = data.tsupplier[0].fields.SkypeName || '';
    //                         let popSupplierURL = data.tsupplier[0].fields.URL || '';
    //                         let popSupplierStreet = data.tsupplier[0].fields.Street || '';
    //                         let popSupplierStreet2 = data.tsupplier[0].fields.Street2 || '';
    //                         let popSupplierState = data.tsupplier[0].fields.State || '';
    //                         let popSupplierPostcode = data.tsupplier[0].fields.Postcode || '';
    //                         let popSupplierCountry = data.tsupplier[0].fields.Country || LoggedCountry;
    //                         let popSupplierbillingaddress = data.tsupplier[0].fields.BillStreet || '';
    //                         let popSupplierbcity = data.tsupplier[0].fields.BillStreet2 || '';
    //                         let popSupplierbstate = data.tsupplier[0].fields.BillState || '';
    //                         let popSupplierbpostalcode = data.tsupplier[0].fields.BillPostcode || '';
    //                         let popSupplierbcountry = data.tsupplier[0].fields.Billcountry || LoggedCountry;
    //                         let popSuppliercustfield1 = data.tsupplier[0].fields.CUSTFLD1 || '';
    //                         let popSuppliercustfield2 = data.tsupplier[0].fields.CUSTFLD2 || '';
    //                         let popSuppliercustfield3 = data.tsupplier[0].fields.CUSTFLD3 || '';
    //                         let popSuppliercustfield4 = data.tsupplier[0].fields.CUSTFLD4 || '';
    //                         let popSuppliernotes = data.tsupplier[0].fields.Notes || '';
    //                         let popSupplierpreferedpayment = data.tsupplier[0].fields.PaymentMethodName || '';
    //                         let popSupplierterms = data.tsupplier[0].fields.TermsName || '';
    //                         let popSupplierdeliverymethod = data.tsupplier[0].fields.ShippingMethodName || '';
    //                         let popSupplieraccountnumber = data.tsupplier[0].fields.ClientNo || '';
    //                         let popSupplierisContractor = data.tsupplier[0].fields.Contractor || false;
    //                         let popSupplierissupplier = data.tsupplier[0].fields.IsSupplier || false;
    //                         let popSupplieriscustomer = data.tsupplier[0].fields.IsCustomer || false;

    //                         $('#edtSupplierCompany').val(popSupplierName);
    //                         $('#edtSupplierPOPID').val(popSupplierID);
    //                         $('#edtSupplierCompanyEmail').val(popSupplierEmail);
    //                         $('#edtSupplierTitle').val(popSupplierTitle);
    //                         $('#edtSupplierFirstName').val(popSupplierFirstName);
    //                         $('#edtSupplierMiddleName').val(popSupplierMiddleName);
    //                         $('#edtSupplierLastName').val(popSupplierLastName);
    //                         $('#edtSupplierPhone').val(popSupplierPhone);
    //                         $('#edtSupplierMobile').val(popSupplierMobile);
    //                         $('#edtSupplierFax').val(popSupplierFaxnumber);
    //                         $('#edtSupplierSkypeID').val(popSupplierSkypeName);
    //                         $('#edtSupplierWebsite').val(popSupplierURL);
    //                         $('#edtSupplierShippingAddress').val(popSupplierStreet);
    //                         $('#edtSupplierShippingCity').val(popSupplierStreet2);
    //                         $('#edtSupplierShippingState').val(popSupplierState);
    //                         $('#edtSupplierShippingZIP').val(popSupplierPostcode);
    //                         $('#sedtCountry').val(popSupplierCountry);
    //                         $('#txaNotes').val(popSuppliernotes);
    //                         $('#sltPreferedPayment').val(popSupplierpreferedpayment);
    //                         $('#sltTerms').val(popSupplierterms);
    //                         $('#suppAccountNo').val(popSupplieraccountnumber);
    //                         $('#edtCustomeField1').val(popSuppliercustfield1);
    //                         $('#edtCustomeField2').val(popSuppliercustfield2);
    //                         $('#edtCustomeField3').val(popSuppliercustfield3);
    //                         $('#edtCustomeField4').val(popSuppliercustfield4);

    //                         if ((data.tsupplier[0].fields.Street == data.tsupplier[0].fields.BillStreet) && (data.tsupplier[0].fields.Street2 == data.tsupplier[0].fields.BillStreet2) &&
    //                             (data.tsupplier[0].fields.State == data.tsupplier[0].fields.BillState) && (data.tsupplier[0].fields.Postcode == data.tsupplier[0].fields.Postcode) &&
    //                             (data.tsupplier[0].fields.Country == data.tsupplier[0].fields.Billcountry)) {
    //                             //templateObject.isSameAddress.set(true);
    //                             $('#chkSameAsShipping').attr("checked", "checked");
    //                         }
    //                         if (data.tsupplier[0].fields.Contractor == true) {
    //                             // $('#isformcontractor')
    //                             $('#isformcontractor').attr("checked", "checked");
    //                         } else {
    //                             $('#isformcontractor').removeAttr("checked");
    //                         }
    //                         let supplierRecord = {
    //                             id: popSupplierID,
    //                             company: popSupplierName,
    //                             email: popSupplierEmail,
    //                             title: popSupplierTitle,
    //                             firstname: popSupplierFirstName,
    //                             middlename: popSupplierMiddleName,
    //                             lastname: popSupplierLastName,
    //                             tfn: '' || '',
    //                             phone: popSupplierPhone,
    //                             mobile: popSupplierMobile,
    //                             fax: popSupplierFaxnumber,
    //                             skype: popSupplierSkypeName,
    //                             website: popSupplierURL,
    //                             shippingaddress: popSupplierStreet,
    //                             scity: popSupplierStreet2,
    //                             sstate: popSupplierState,
    //                             spostalcode: popSupplierPostcode,
    //                             scountry: popSupplierCountry,
    //                             billingaddress: popSupplierbillingaddress,
    //                             bcity: popSupplierbcity,
    //                             bstate: popSupplierbstate,
    //                             bpostalcode: popSupplierbpostalcode,
    //                             bcountry: popSupplierbcountry,
    //                             custfield1: popSuppliercustfield1,
    //                             custfield2: popSuppliercustfield2,
    //                             custfield3: popSuppliercustfield3,
    //                             custfield4: popSuppliercustfield4,
    //                             notes: popSuppliernotes,
    //                             preferedpayment: popSupplierpreferedpayment,
    //                             terms: popSupplierterms,
    //                             deliverymethod: popSupplierdeliverymethod,
    //                             accountnumber: popSupplieraccountnumber,
    //                             isContractor: popSupplierisContractor,
    //                             issupplier: popSupplierissupplier,
    //                             iscustomer: popSupplieriscustomer,
    //                             bankName: data.tsuppliervs1[0].fields.BankName || '',
    //                             swiftCode: data.tsuppliervs1[0].fields.SwiftCode || '',
    //                             routingNumber: data.tsuppliervs1[0].fields.RoutingNumber || '',
    //                             bankAccountName: data.tsuppliervs1[0].fields.BankAccountName || '',
    //                             bankAccountBSB: data.tsuppliervs1[0].fields.BankAccountBSB || '',
    //                             bankAccountNo: data.tsuppliervs1[0].fields.BankAccountNo || '',
    //                             foreignExchangeCode:data.tsuppliervs1[0].fields.ForeignExchangeCode || CountryAbbr,
    //                             // openingbalancedate: data.tsuppliervs1[0].fields.RewardPointsOpeningDate ? moment(data.tsuppliervs1[0].fields.RewardPointsOpeningDate).format('DD/MM/YYYY') : "",
    //                             // taxcode:data.tsuppliervs1[0].fields.TaxCodeName || templateObject.defaultsaletaxcode.get()
    //                         };
    //                         templateObject.supplierRecord.set(supplierRecord);
    //                         setTimeout(function() {
    //                             $('#addSupplierModal').modal('show');
    //                         }, 200);



    //                     }).catch(function(err) {

    //                         LoadingOverlay.hide();
    //                     });
    //                 } else {
    //                     let data = JSON.parse(dataObject[0].data);
    //                     let useData = data.tsuppliervs1;
    //                     var added = false;
    //                     for (let i = 0; i < data.tsuppliervs1.length; i++) {
    //                         if ((data.tsuppliervs1[i].fields.ClientName) === supplierDataName) {
    //                             added = true;
    //                             LoadingOverlay.hide();
    //                             let lineItems = [];
    //                             $('#add-supplier-title').text('Edit Supplier');
    //                             let popSupplierID = data.tsuppliervs1[i].fields.ID || '';
    //                             let popSupplierName = data.tsuppliervs1[i].fields.ClientName || '';
    //                             let popSupplierEmail = data.tsuppliervs1[i].fields.Email || '';
    //                             let popSupplierTitle = data.tsuppliervs1[i].fields.Title || '';
    //                             let popSupplierFirstName = data.tsuppliervs1[i].fields.FirstName || '';
    //                             let popSupplierMiddleName = data.tsuppliervs1[i].fields.CUSTFLD10 || '';
    //                             let popSupplierLastName = data.tsuppliervs1[i].fields.LastName || '';
    //                             let popSuppliertfn = '' || '';
    //                             let popSupplierPhone = data.tsuppliervs1[i].fields.Phone || '';
    //                             let popSupplierMobile = data.tsuppliervs1[i].fields.Mobile || '';
    //                             let popSupplierFaxnumber = data.tsuppliervs1[i].fields.Faxnumber || '';
    //                             let popSupplierSkypeName = data.tsuppliervs1[i].fields.SkypeName || '';
    //                             let popSupplierURL = data.tsuppliervs1[i].fields.URL || '';
    //                             let popSupplierStreet = data.tsuppliervs1[i].fields.Street || '';
    //                             let popSupplierStreet2 = data.tsuppliervs1[i].fields.Street2 || '';
    //                             let popSupplierState = data.tsuppliervs1[i].fields.State || '';
    //                             let popSupplierPostcode = data.tsuppliervs1[i].fields.Postcode || '';
    //                             let popSupplierCountry = data.tsuppliervs1[i].fields.Country || LoggedCountry;
    //                             let popSupplierbillingaddress = data.tsuppliervs1[i].fields.BillStreet || '';
    //                             let popSupplierbcity = data.tsuppliervs1[i].fields.BillStreet2 || '';
    //                             let popSupplierbstate = data.tsuppliervs1[i].fields.BillState || '';
    //                             let popSupplierbpostalcode = data.tsuppliervs1[i].fields.BillPostcode || '';
    //                             let popSupplierbcountry = data.tsuppliervs1[i].fields.Billcountry || LoggedCountry;
    //                             let popSuppliercustfield1 = data.tsuppliervs1[i].fields.CUSTFLD1 || '';
    //                             let popSuppliercustfield2 = data.tsuppliervs1[i].fields.CUSTFLD2 || '';
    //                             let popSuppliercustfield3 = data.tsuppliervs1[i].fields.CUSTFLD3 || '';
    //                             let popSuppliercustfield4 = data.tsuppliervs1[i].fields.CUSTFLD4 || '';
    //                             let popSuppliernotes = data.tsuppliervs1[i].fields.Notes || '';
    //                             let popSupplierpreferedpayment = data.tsuppliervs1[i].fields.PaymentMethodName || '';
    //                             let popSupplierterms = data.tsuppliervs1[i].fields.TermsName || '';
    //                             let popSupplierdeliverymethod = data.tsuppliervs1[i].fields.ShippingMethodName || '';
    //                             let popSupplieraccountnumber = data.tsuppliervs1[i].fields.ClientNo || '';
    //                             let popSupplierisContractor = data.tsuppliervs1[i].fields.Contractor || false;
    //                             let popSupplierissupplier = data.tsuppliervs1[i].fields.IsSupplier || false;
    //                             let popSupplieriscustomer = data.tsuppliervs1[i].fields.IsCustomer || false;

    //                             $('#edtSupplierCompany').val(popSupplierName);
    //                             $('#edtSupplierPOPID').val(popSupplierID);
    //                             $('#edtSupplierCompanyEmail').val(popSupplierEmail);
    //                             $('#edtSupplierTitle').val(popSupplierTitle);
    //                             $('#edtSupplierFirstName').val(popSupplierFirstName);
    //                             $('#edtSupplierMiddleName').val(popSupplierMiddleName);
    //                             $('#edtSupplierLastName').val(popSupplierLastName);
    //                             $('#edtSupplierPhone').val(popSupplierPhone);
    //                             $('#edtSupplierMobile').val(popSupplierMobile);
    //                             $('#edtSupplierFax').val(popSupplierFaxnumber);
    //                             $('#edtSupplierSkypeID').val(popSupplierSkypeName);
    //                             $('#edtSupplierWebsite').val(popSupplierURL);
    //                             $('#edtSupplierShippingAddress').val(popSupplierStreet);
    //                             $('#edtSupplierShippingCity').val(popSupplierStreet2);
    //                             $('#edtSupplierShippingState').val(popSupplierState);
    //                             $('#edtSupplierShippingZIP').val(popSupplierPostcode);
    //                             $('#sedtCountry').val(popSupplierCountry);
    //                             $('#txaNotes').val(popSuppliernotes);
    //                             $('#sltPreferedPayment').val(popSupplierpreferedpayment);
    //                             $('#sltTerms').val(popSupplierterms);
    //                             $('#suppAccountNo').val(popSupplieraccountnumber);
    //                             $('#edtCustomeField1').val(popSuppliercustfield1);
    //                             $('#edtCustomeField2').val(popSuppliercustfield2);
    //                             $('#edtCustomeField3').val(popSuppliercustfield3);
    //                             $('#edtCustomeField4').val(popSuppliercustfield4);

    //                             if ((data.tsuppliervs1[i].fields.Street == data.tsuppliervs1[i].fields.BillStreet) && (data.tsuppliervs1[i].fields.Street2 == data.tsuppliervs1[i].fields.BillStreet2) &&
    //                                 (data.tsuppliervs1[i].fields.State == data.tsuppliervs1[i].fields.BillState) && (data.tsuppliervs1[i].fields.Postcode == data.tsuppliervs1[i].fields.Postcode) &&
    //                                 (data.tsuppliervs1[i].fields.Country == data.tsuppliervs1[i].fields.Billcountry)) {
    //                                 //templateObject.isSameAddress.set(true);
    //                                 $('#chkSameAsShipping').attr("checked", "checked");
    //                             }
    //                             if (data.tsuppliervs1[i].fields.Contractor == true) {
    //                                 // $('#isformcontractor')
    //                                 $('#isformcontractor').attr("checked", "checked");
    //                             } else {
    //                                 $('#isformcontractor').removeAttr("checked");
    //                             }

    //                             setTimeout(function() {
    //                                 let supplierRecord = {
    //                                     id: popSupplierID,
    //                                     company: popSupplierName,
    //                                     email: popSupplierEmail,
    //                                     title: popSupplierTitle,
    //                                     firstname: popSupplierFirstName,
    //                                     middlename: popSupplierMiddleName,
    //                                     lastname: popSupplierLastName,
    //                                     tfn: '' || '',
    //                                     phone: popSupplierPhone,
    //                                     mobile: popSupplierMobile,
    //                                     fax: popSupplierFaxnumber,
    //                                     skype: popSupplierSkypeName,
    //                                     website: popSupplierURL,
    //                                     shippingaddress: popSupplierStreet,
    //                                     scity: popSupplierStreet2,
    //                                     sstate: popSupplierState,
    //                                     spostalcode: popSupplierPostcode,
    //                                     scountry: popSupplierCountry,
    //                                     billingaddress: popSupplierbillingaddress,
    //                                     bcity: popSupplierbcity,
    //                                     bstate: popSupplierbstate,
    //                                     bpostalcode: popSupplierbpostalcode,
    //                                     bcountry: popSupplierbcountry,
    //                                     custfield1: popSuppliercustfield1,
    //                                     custfield2: popSuppliercustfield2,
    //                                     custfield3: popSuppliercustfield3,
    //                                     custfield4: popSuppliercustfield4,
    //                                     notes: popSuppliernotes,
    //                                     preferedpayment: popSupplierpreferedpayment,
    //                                     terms: popSupplierterms,
    //                                     deliverymethod: popSupplierdeliverymethod,
    //                                     accountnumber: popSupplieraccountnumber,
    //                                     isContractor: popSupplierisContractor,
    //                                     issupplier: popSupplierissupplier,
    //                                     iscustomer: popSupplieriscustomer,
    //                                     bankName: data.tsuppliervs1[i].fields.BankName || '',
    //                                     swiftCode: data.tsuppliervs1[i].fields.SwiftCode || '',
    //                                     routingNumber: data.tsuppliervs1[i].fields.RoutingNumber || '',
    //                                     bankAccountName: data.tsuppliervs1[i].fields.BankAccountName || '',
    //                                     bankAccountBSB: data.tsuppliervs1[i].fields.BankAccountBSB || '',
    //                                     bankAccountNo: data.tsuppliervs1[i].fields.BankAccountNo || '',
    //                                     foreignExchangeCode:data.tsuppliervs1[i].fields.ForeignExchangeCode || CountryAbbr,
    //                                     // openingbalancedate: data.tsuppliervs1[i].fields.RewardPointsOpeningDate ? moment(data.tsuppliervs1[i].fields.RewardPointsOpeningDate).format('DD/MM/YYYY') : "",
    //                                     // taxcode:data.tsuppliervs1[i].fields.TaxCodeName || templateObject.defaultsaletaxcode.get()
    //                                 };
    //                                 templateObject.supplierRecord.set(supplierRecord);
    //                                 $('#addSupplierModal').modal('show');
    //                             }, 200);
    //                         }
    //                     }

    //                     if (!added) {
    //                         $('.fullScreenSpin').css('display', 'inline-block');
    //                         sideBarService.getOneSupplierDataExByName(supplierDataName).then(function(data) {
    //                             LoadingOverlay.hide();
    //                             let lineItems = [];

    //                             $('#add-supplier-title').text('Edit Supplier');
    //                             let popSupplierID = data.tsupplier[0].fields.ID || '';
    //                             let popSupplierName = data.tsupplier[0].fields.ClientName || '';
    //                             let popSupplierEmail = data.tsupplier[0].fields.Email || '';
    //                             let popSupplierTitle = data.tsupplier[0].fields.Title || '';
    //                             let popSupplierFirstName = data.tsupplier[0].fields.FirstName || '';
    //                             let popSupplierMiddleName = data.tsupplier[0].fields.CUSTFLD10 || '';
    //                             let popSupplierLastName = data.tsupplier[0].fields.LastName || '';
    //                             let popSuppliertfn = '' || '';
    //                             let popSupplierPhone = data.tsupplier[0].fields.Phone || '';
    //                             let popSupplierMobile = data.tsupplier[0].fields.Mobile || '';
    //                             let popSupplierFaxnumber = data.tsupplier[0].fields.Faxnumber || '';
    //                             let popSupplierSkypeName = data.tsupplier[0].fields.SkypeName || '';
    //                             let popSupplierURL = data.tsupplier[0].fields.URL || '';
    //                             let popSupplierStreet = data.tsupplier[0].fields.Street || '';
    //                             let popSupplierStreet2 = data.tsupplier[0].fields.Street2 || '';
    //                             let popSupplierState = data.tsupplier[0].fields.State || '';
    //                             let popSupplierPostcode = data.tsupplier[0].fields.Postcode || '';
    //                             let popSupplierCountry = data.tsupplier[0].fields.Country || LoggedCountry;
    //                             let popSupplierbillingaddress = data.tsupplier[0].fields.BillStreet || '';
    //                             let popSupplierbcity = data.tsupplier[0].fields.BillStreet2 || '';
    //                             let popSupplierbstate = data.tsupplier[0].fields.BillState || '';
    //                             let popSupplierbpostalcode = data.tsupplier[0].fields.BillPostcode || '';
    //                             let popSupplierbcountry = data.tsupplier[0].fields.Billcountry || LoggedCountry;
    //                             let popSuppliercustfield1 = data.tsupplier[0].fields.CUSTFLD1 || '';
    //                             let popSuppliercustfield2 = data.tsupplier[0].fields.CUSTFLD2 || '';
    //                             let popSuppliercustfield3 = data.tsupplier[0].fields.CUSTFLD3 || '';
    //                             let popSuppliercustfield4 = data.tsupplier[0].fields.CUSTFLD4 || '';
    //                             let popSuppliernotes = data.tsupplier[0].fields.Notes || '';
    //                             let popSupplierpreferedpayment = data.tsupplier[0].fields.PaymentMethodName || '';
    //                             let popSupplierterms = data.tsupplier[0].fields.TermsName || '';
    //                             let popSupplierdeliverymethod = data.tsupplier[0].fields.ShippingMethodName || '';
    //                             let popSupplieraccountnumber = data.tsupplier[0].fields.ClientNo || '';
    //                             let popSupplierisContractor = data.tsupplier[0].fields.Contractor || false;
    //                             let popSupplierissupplier = data.tsupplier[0].fields.IsSupplier || false;
    //                             let popSupplieriscustomer = data.tsupplier[0].fields.IsCustomer || false;

    //                             $('#edtSupplierCompany').val(popSupplierName);
    //                             $('#edtSupplierPOPID').val(popSupplierID);
    //                             $('#edtSupplierCompanyEmail').val(popSupplierEmail);
    //                             $('#edtSupplierTitle').val(popSupplierTitle);
    //                             $('#edtSupplierFirstName').val(popSupplierFirstName);
    //                             $('#edtSupplierMiddleName').val(popSupplierMiddleName);
    //                             $('#edtSupplierLastName').val(popSupplierLastName);
    //                             $('#edtSupplierPhone').val(popSupplierPhone);
    //                             $('#edtSupplierMobile').val(popSupplierMobile);
    //                             $('#edtSupplierFax').val(popSupplierFaxnumber);
    //                             $('#edtSupplierSkypeID').val(popSupplierSkypeName);
    //                             $('#edtSupplierWebsite').val(popSupplierURL);
    //                             $('#edtSupplierShippingAddress').val(popSupplierStreet);
    //                             $('#edtSupplierShippingCity').val(popSupplierStreet2);
    //                             $('#edtSupplierShippingState').val(popSupplierState);
    //                             $('#edtSupplierShippingZIP').val(popSupplierPostcode);
    //                             $('#sedtCountry').val(popSupplierCountry);
    //                             $('#txaNotes').val(popSuppliernotes);
    //                             $('#sltPreferedPayment').val(popSupplierpreferedpayment);
    //                             $('#sltTerms').val(popSupplierterms);
    //                             $('#suppAccountNo').val(popSupplieraccountnumber);
    //                             $('#edtCustomeField1').val(popSuppliercustfield1);
    //                             $('#edtCustomeField2').val(popSuppliercustfield2);
    //                             $('#edtCustomeField3').val(popSuppliercustfield3);
    //                             $('#edtCustomeField4').val(popSuppliercustfield4);

    //                             if ((data.tsupplier[0].fields.Street == data.tsupplier[0].fields.BillStreet) && (data.tsupplier[0].fields.Street2 == data.tsupplier[0].fields.BillStreet2) &&
    //                                 (data.tsupplier[0].fields.State == data.tsupplier[0].fields.BillState) && (data.tsupplier[0].fields.Postcode == data.tsupplier[0].fields.Postcode) &&
    //                                 (data.tsupplier[0].fields.Country == data.tsupplier[0].fields.Billcountry)) {
    //                                 //templateObject.isSameAddress.set(true);
    //                                 $('#chkSameAsShipping').attr("checked", "checked");
    //                             }
    //                             if (data.tsupplier[0].fields.Contractor == true) {
    //                                 // $('#isformcontractor')
    //                                 $('#isformcontractor').attr("checked", "checked");
    //                             } else {
    //                                 $('#isformcontractor').removeAttr("checked");
    //                             }

    //                             setTimeout(function() {
    //                                 $('#addSupplierModal').modal('show');
    //                             }, 200);
    //                         }).catch(function(err) {

    //                             LoadingOverlay.hide();
    //                         });
    //                     }
    //                 }
    //             }).catch(function(err) {

    //                 sideBarService.getOneSupplierDataExByName(supplierDataName).then(function(data) {
    //                     LoadingOverlay.hide();
    //                     let lineItems = [];

    //                     $('#add-supplier-title').text('Edit Supplier');
    //                     let popSupplierID = data.tsupplier[0].fields.ID || '';
    //                     let popSupplierName = data.tsupplier[0].fields.ClientName || '';
    //                     let popSupplierEmail = data.tsupplier[0].fields.Email || '';
    //                     let popSupplierTitle = data.tsupplier[0].fields.Title || '';
    //                     let popSupplierFirstName = data.tsupplier[0].fields.FirstName || '';
    //                     let popSupplierMiddleName = data.tsupplier[0].fields.CUSTFLD10 || '';
    //                     let popSupplierLastName = data.tsupplier[0].fields.LastName || '';
    //                     let popSuppliertfn = '' || '';
    //                     let popSupplierPhone = data.tsupplier[0].fields.Phone || '';
    //                     let popSupplierMobile = data.tsupplier[0].fields.Mobile || '';
    //                     let popSupplierFaxnumber = data.tsupplier[0].fields.Faxnumber || '';
    //                     let popSupplierSkypeName = data.tsupplier[0].fields.SkypeName || '';
    //                     let popSupplierURL = data.tsupplier[0].fields.URL || '';
    //                     let popSupplierStreet = data.tsupplier[0].fields.Street || '';
    //                     let popSupplierStreet2 = data.tsupplier[0].fields.Street2 || '';
    //                     let popSupplierState = data.tsupplier[0].fields.State || '';
    //                     let popSupplierPostcode = data.tsupplier[0].fields.Postcode || '';
    //                     let popSupplierCountry = data.tsupplier[0].fields.Country || LoggedCountry;
    //                     let popSupplierbillingaddress = data.tsupplier[0].fields.BillStreet || '';
    //                     let popSupplierbcity = data.tsupplier[0].fields.BillStreet2 || '';
    //                     let popSupplierbstate = data.tsupplier[0].fields.BillState || '';
    //                     let popSupplierbpostalcode = data.tsupplier[0].fields.BillPostcode || '';
    //                     let popSupplierbcountry = data.tsupplier[0].fields.Billcountry || LoggedCountry;
    //                     let popSuppliercustfield1 = data.tsupplier[0].fields.CUSTFLD1 || '';
    //                     let popSuppliercustfield2 = data.tsupplier[0].fields.CUSTFLD2 || '';
    //                     let popSuppliercustfield3 = data.tsupplier[0].fields.CUSTFLD3 || '';
    //                     let popSuppliercustfield4 = data.tsupplier[0].fields.CUSTFLD4 || '';
    //                     let popSuppliernotes = data.tsupplier[0].fields.Notes || '';
    //                     let popSupplierpreferedpayment = data.tsupplier[0].fields.PaymentMethodName || '';
    //                     let popSupplierterms = data.tsupplier[0].fields.TermsName || '';
    //                     let popSupplierdeliverymethod = data.tsupplier[0].fields.ShippingMethodName || '';
    //                     let popSupplieraccountnumber = data.tsupplier[0].fields.ClientNo || '';
    //                     let popSupplierisContractor = data.tsupplier[0].fields.Contractor || false;
    //                     let popSupplierissupplier = data.tsupplier[0].fields.IsSupplier || false;
    //                     let popSupplieriscustomer = data.tsupplier[0].fields.IsCustomer || false;

    //                     $('#edtSupplierCompany').val(popSupplierName);
    //                     $('#edtSupplierPOPID').val(popSupplierID);
    //                     $('#edtSupplierCompanyEmail').val(popSupplierEmail);
    //                     $('#edtSupplierTitle').val(popSupplierTitle);
    //                     $('#edtSupplierFirstName').val(popSupplierFirstName);
    //                     $('#edtSupplierMiddleName').val(popSupplierMiddleName);
    //                     $('#edtSupplierLastName').val(popSupplierLastName);
    //                     $('#edtSupplierPhone').val(popSupplierPhone);
    //                     $('#edtSupplierMobile').val(popSupplierMobile);
    //                     $('#edtSupplierFax').val(popSupplierFaxnumber);
    //                     $('#edtSupplierSkypeID').val(popSupplierSkypeName);
    //                     $('#edtSupplierWebsite').val(popSupplierURL);
    //                     $('#edtSupplierShippingAddress').val(popSupplierStreet);
    //                     $('#edtSupplierShippingCity').val(popSupplierStreet2);
    //                     $('#edtSupplierShippingState').val(popSupplierState);
    //                     $('#edtSupplierShippingZIP').val(popSupplierPostcode);
    //                     $('#sedtCountry').val(popSupplierCountry);
    //                     $('#txaNotes').val(popSuppliernotes);
    //                     $('#sltPreferedPayment').val(popSupplierpreferedpayment);
    //                     $('#sltTerms').val(popSupplierterms);
    //                     $('#suppAccountNo').val(popSupplieraccountnumber);
    //                     $('#edtCustomeField1').val(popSuppliercustfield1);
    //                     $('#edtCustomeField2').val(popSuppliercustfield2);
    //                     $('#edtCustomeField3').val(popSuppliercustfield3);
    //                     $('#edtCustomeField4').val(popSuppliercustfield4);

    //                     if ((data.tsupplier[0].fields.Street == data.tsupplier[0].fields.BillStreet) && (data.tsupplier[0].fields.Street2 == data.tsupplier[0].fields.BillStreet2) &&
    //                         (data.tsupplier[0].fields.State == data.tsupplier[0].fields.BillState) && (data.tsupplier[0].fields.Postcode == data.tsupplier[0].fields.Postcode) &&
    //                         (data.tsupplier[0].fields.Country == data.tsupplier[0].fields.Billcountry)) {
    //                         //templateObject.isSameAddress.set(true);
    //                         $('#chkSameAsShipping').attr("checked", "checked");
    //                     }
    //                     if (data.tsupplier[0].fields.Contractor == true) {
    //                         // $('#isformcontractor')
    //                         $('#isformcontractor').attr("checked", "checked");
    //                     } else {
    //                         $('#isformcontractor').removeAttr("checked");
    //                     }

    //                     setTimeout(function() {
    //                         $('#addSupplierModal').modal('show');
    //                     }, 200);


    //                 }).catch(function(err) {

    //                     LoadingOverlay.hide();
    //                 });
    //             });
    //             //FlowRouter.go('/supplierscard?name=' + e.target.value);
    //         } else {
    //             $('#supplierListModal').modal();
    //             setTimeout(function() {
    //                 $('#tblSupplierlist_filter .form-control-sm').focus();
    //                 $('#tblSupplierlist_filter .form-control-sm').val('');
    //                 $('#tblSupplierlist_filter .form-control-sm').trigger("input");
    //                 var datatable = $('#tblSupplierlist').DataTable();
    //                 datatable.draw();
    //                 $('#tblSupplierlist_filter .form-control-sm').trigger("input");
    //             }, 500);
    //         }
    //     }


    // });

    $(document).on('click', '#edtSupplierName', function (e, li) {
        var $earch = $(this);
        var offset = $earch.offset();
        $('#edtSupplierPOPID').val('');
        var supplierDataName = e.target.value || '';
        var supplierDataID = $('#edtSupplierName').attr('suppid').replace(/\s/g, '') || '';
        if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#supplierListModal').modal();
            setTimeout(function () {
                $('#tblSupplierlist_filter .form-control-sm').focus();
                $('#tblSupplierlist_filter .form-control-sm').val('');
                $('#tblSupplierlist_filter .form-control-sm').trigger("input");
                var datatable = $('#tblSupplierlist').DataTable();
                datatable.draw();
                $('#tblSupplierlist_filter .form-control-sm').trigger("input");
            }, 500);
        } else {
            if (supplierDataName.replace(/\s/g, '') != '') {
                getVS1Data('TSupplierVS1').then(function (dataObject) {
                    if (dataObject.length == 0) {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        sideBarService.getOneSupplierDataExByName(supplierDataName).then(function (data) {
                            LoadingOverlay.hide();
                            let lineItems = [];

                            $('#add-supplier-title').text('Edit Supplier');
                            let popSupplierID = data.tsupplier[0].fields.ID || '';
                            let popSupplierName = data.tsupplier[0].fields.ClientName || '';
                            let popSupplierEmail = data.tsupplier[0].fields.Email || '';
                            let popSupplierTitle = data.tsupplier[0].fields.Title || '';
                            let popSupplierFirstName = data.tsupplier[0].fields.FirstName || '';
                            let popSupplierMiddleName = data.tsupplier[0].fields.CUSTFLD10 || '';
                            let popSupplierLastName = data.tsupplier[0].fields.LastName || '';
                            let popSuppliertfn = '' || '';
                            let popSupplierPhone = data.tsupplier[0].fields.Phone || '';
                            let popSupplierMobile = data.tsupplier[0].fields.Mobile || '';
                            let popSupplierFaxnumber = data.tsupplier[0].fields.Faxnumber || '';
                            let popSupplierSkypeName = data.tsupplier[0].fields.SkypeName || '';
                            let popSupplierURL = data.tsupplier[0].fields.URL || '';
                            let popSupplierStreet = data.tsupplier[0].fields.Street || '';
                            let popSupplierStreet2 = data.tsupplier[0].fields.Street2 || '';
                            let popSupplierState = data.tsupplier[0].fields.State || '';
                            let popSupplierPostcode = data.tsupplier[0].fields.Postcode || '';
                            let popSupplierCountry = data.tsupplier[0].fields.Country || LoggedCountry;
                            let popSupplierbillingaddress = data.tsupplier[0].fields.BillStreet || '';
                            let popSupplierbcity = data.tsupplier[0].fields.BillStreet2 || '';
                            let popSupplierbstate = data.tsupplier[0].fields.BillState || '';
                            let popSupplierbpostalcode = data.tsupplier[0].fields.BillPostcode || '';
                            let popSupplierbcountry = data.tsupplier[0].fields.Billcountry || LoggedCountry;
                            let popSuppliercustfield1 = data.tsupplier[0].fields.CUSTFLD1 || '';
                            let popSuppliercustfield2 = data.tsupplier[0].fields.CUSTFLD2 || '';
                            let popSuppliercustfield3 = data.tsupplier[0].fields.CUSTFLD3 || '';
                            let popSuppliercustfield4 = data.tsupplier[0].fields.CUSTFLD4 || '';
                            let popSuppliernotes = data.tsupplier[0].fields.Notes || '';
                            let popSupplierpreferedpayment = data.tsupplier[0].fields.PaymentMethodName || '';
                            let popSupplierterms = data.tsupplier[0].fields.TermsName || '';
                            let popSupplierdeliverymethod = data.tsupplier[0].fields.ShippingMethodName || '';
                            let popSupplieraccountnumber = data.tsupplier[0].fields.ClientNo || '';
                            let popSupplierisContractor = data.tsupplier[0].fields.Contractor || false;
                            let popSupplierissupplier = data.tsupplier[0].fields.IsSupplier || false;
                            let popSupplieriscustomer = data.tsupplier[0].fields.IsCustomer || false;

                            $('#edtSupplierCompany').val(popSupplierName);
                            $('#edtSupplierPOPID').val(popSupplierID);
                            $('#edtSupplierCompanyEmail').val(popSupplierEmail);
                            $('#edtSupplierTitle').val(popSupplierTitle);
                            $('#edtSupplierFirstName').val(popSupplierFirstName);
                            $('#edtSupplierMiddleName').val(popSupplierMiddleName);
                            $('#edtSupplierLastName').val(popSupplierLastName);
                            $('#edtSupplierPhone').val(popSupplierPhone);
                            $('#edtSupplierMobile').val(popSupplierMobile);
                            $('#edtSupplierFax').val(popSupplierFaxnumber);
                            $('#edtSupplierSkypeID').val(popSupplierSkypeName);
                            $('#edtSupplierWebsite').val(popSupplierURL);
                            $('#edtSupplierShippingAddress').val(popSupplierStreet);
                            $('#edtSupplierShippingCity').val(popSupplierStreet2);
                            $('#edtSupplierShippingState').val(popSupplierState);
                            $('#edtSupplierShippingZIP').val(popSupplierPostcode);
                            $('#sedtCountry').val(popSupplierCountry);
                            $('#txaNotes').val(popSuppliernotes);
                            $('#sltPreferedPayment').val(popSupplierpreferedpayment);
                            $('#sltTerms').val(popSupplierterms);
                            $('#suppAccountNo').val(popSupplieraccountnumber);
                            $('#edtCustomeField1').val(popSuppliercustfield1);
                            $('#edtCustomeField2').val(popSuppliercustfield2);
                            $('#edtCustomeField3').val(popSuppliercustfield3);
                            $('#edtCustomeField4').val(popSuppliercustfield4);

                            if ((data.tsupplier[0].fields.Street == data.tsupplier[0].fields.BillStreet) && (data.tsupplier[0].fields.Street2 == data.tsupplier[0].fields.BillStreet2) &&
                                (data.tsupplier[0].fields.State == data.tsupplier[0].fields.BillState) && (data.tsupplier[0].fields.Postcode == data.tsupplier[0].fields.Postcode) &&
                                (data.tsupplier[0].fields.Country == data.tsupplier[0].fields.Billcountry)) {
                                //templateObject.isSameAddress.set(true);
                                $('#chkSameAsShipping').attr("checked", "checked");
                            }
                            if (data.tsupplier[0].fields.Contractor == true) {
                                // $('#isformcontractor')
                                $('#isformcontractor').attr("checked", "checked");
                            } else {
                                $('#isformcontractor').removeAttr("checked");
                            }
                            let supplierRecord = {
                                id: popSupplierID,
                                company: popSupplierName,
                                email: popSupplierEmail,
                                title: popSupplierTitle,
                                firstname: popSupplierFirstName,
                                middlename: popSupplierMiddleName,
                                lastname: popSupplierLastName,
                                tfn: '' || '',
                                phone: popSupplierPhone,
                                mobile: popSupplierMobile,
                                fax: popSupplierFaxnumber,
                                skype: popSupplierSkypeName,
                                website: popSupplierURL,
                                shippingaddress: popSupplierStreet,
                                scity: popSupplierStreet2,
                                sstate: popSupplierState,
                                spostalcode: popSupplierPostcode,
                                scountry: popSupplierCountry,
                                billingaddress: popSupplierbillingaddress,
                                bcity: popSupplierbcity,
                                bstate: popSupplierbstate,
                                bpostalcode: popSupplierbpostalcode,
                                bcountry: popSupplierbcountry,
                                custfield1: popSuppliercustfield1,
                                custfield2: popSuppliercustfield2,
                                custfield3: popSuppliercustfield3,
                                custfield4: popSuppliercustfield4,
                                notes: popSuppliernotes,
                                preferedpayment: popSupplierpreferedpayment,
                                terms: popSupplierterms,
                                deliverymethod: popSupplierdeliverymethod,
                                accountnumber: popSupplieraccountnumber,
                                isContractor: popSupplierisContractor,
                                issupplier: popSupplierissupplier,
                                iscustomer: popSupplieriscustomer,
                                bankName: data.tsuppliervs1[0].fields.BankName || '',
                                swiftCode: data.tsuppliervs1[0].fields.SwiftCode || '',
                                routingNumber: data.tsuppliervs1[0].fields.RoutingNumber || '',
                                bankAccountName: data.tsuppliervs1[0].fields.BankAccountName || '',
                                bankAccountBSB: data.tsuppliervs1[0].fields.BankAccountBSB || '',
                                bankAccountNo: data.tsuppliervs1[0].fields.BankAccountNo || '',
                                foreignExchangeCode: data.tsuppliervs1[0].fields.ForeignExchangeCode || CountryAbbr,
                                // openingbalancedate: data.tsuppliervs1[0].fields.RewardPointsOpeningDate ? moment(data.tsuppliervs1[0].fields.RewardPointsOpeningDate).format('DD/MM/YYYY') : "",
                                // taxcode:data.tsuppliervs1[0].fields.TaxCodeName || templateObject.defaultsaletaxcode.get()
                            };
                            templateObject.supplierRecord.set(supplierRecord);
                            setTimeout(function () {
                                $('#addSupplierModal').modal('show');
                            }, 200);



                        }).catch(function (err) {

                            LoadingOverlay.hide();
                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tsuppliervs1;
                        var added = false;
                        for (let i = 0; i < data.tsuppliervs1.length; i++) {
                            if ((data.tsuppliervs1[i].fields.ClientName) === supplierDataName) {
                                added = true;
                                LoadingOverlay.hide();
                                let lineItems = [];
                                $('#add-supplier-title').text('Edit Supplier');
                                let popSupplierID = data.tsuppliervs1[i].fields.ID || '';
                                let popSupplierName = data.tsuppliervs1[i].fields.ClientName || '';
                                let popSupplierEmail = data.tsuppliervs1[i].fields.Email || '';
                                let popSupplierTitle = data.tsuppliervs1[i].fields.Title || '';
                                let popSupplierFirstName = data.tsuppliervs1[i].fields.FirstName || '';
                                let popSupplierMiddleName = data.tsuppliervs1[i].fields.CUSTFLD10 || '';
                                let popSupplierLastName = data.tsuppliervs1[i].fields.LastName || '';
                                let popSuppliertfn = '' || '';
                                let popSupplierPhone = data.tsuppliervs1[i].fields.Phone || '';
                                let popSupplierMobile = data.tsuppliervs1[i].fields.Mobile || '';
                                let popSupplierFaxnumber = data.tsuppliervs1[i].fields.Faxnumber || '';
                                let popSupplierSkypeName = data.tsuppliervs1[i].fields.SkypeName || '';
                                let popSupplierURL = data.tsuppliervs1[i].fields.URL || '';
                                let popSupplierStreet = data.tsuppliervs1[i].fields.Street || '';
                                let popSupplierStreet2 = data.tsuppliervs1[i].fields.Street2 || '';
                                let popSupplierState = data.tsuppliervs1[i].fields.State || '';
                                let popSupplierPostcode = data.tsuppliervs1[i].fields.Postcode || '';
                                let popSupplierCountry = data.tsuppliervs1[i].fields.Country || LoggedCountry;
                                let popSupplierbillingaddress = data.tsuppliervs1[i].fields.BillStreet || '';
                                let popSupplierbcity = data.tsuppliervs1[i].fields.BillStreet2 || '';
                                let popSupplierbstate = data.tsuppliervs1[i].fields.BillState || '';
                                let popSupplierbpostalcode = data.tsuppliervs1[i].fields.BillPostcode || '';
                                let popSupplierbcountry = data.tsuppliervs1[i].fields.Billcountry || LoggedCountry;
                                let popSuppliercustfield1 = data.tsuppliervs1[i].fields.CUSTFLD1 || '';
                                let popSuppliercustfield2 = data.tsuppliervs1[i].fields.CUSTFLD2 || '';
                                let popSuppliercustfield3 = data.tsuppliervs1[i].fields.CUSTFLD3 || '';
                                let popSuppliercustfield4 = data.tsuppliervs1[i].fields.CUSTFLD4 || '';
                                let popSuppliernotes = data.tsuppliervs1[i].fields.Notes || '';
                                let popSupplierpreferedpayment = data.tsuppliervs1[i].fields.PaymentMethodName || '';
                                let popSupplierterms = data.tsuppliervs1[i].fields.TermsName || '';
                                let popSupplierdeliverymethod = data.tsuppliervs1[i].fields.ShippingMethodName || '';
                                let popSupplieraccountnumber = data.tsuppliervs1[i].fields.ClientNo || '';
                                let popSupplierisContractor = data.tsuppliervs1[i].fields.Contractor || false;
                                let popSupplierissupplier = data.tsuppliervs1[i].fields.IsSupplier || false;
                                let popSupplieriscustomer = data.tsuppliervs1[i].fields.IsCustomer || false;

                                $('#edtSupplierCompany').val(popSupplierName);
                                $('#edtSupplierPOPID').val(popSupplierID);
                                $('#edtSupplierCompanyEmail').val(popSupplierEmail);
                                $('#edtSupplierTitle').val(popSupplierTitle);
                                $('#edtSupplierFirstName').val(popSupplierFirstName);
                                $('#edtSupplierMiddleName').val(popSupplierMiddleName);
                                $('#edtSupplierLastName').val(popSupplierLastName);
                                $('#edtSupplierPhone').val(popSupplierPhone);
                                $('#edtSupplierMobile').val(popSupplierMobile);
                                $('#edtSupplierFax').val(popSupplierFaxnumber);
                                $('#edtSupplierSkypeID').val(popSupplierSkypeName);
                                $('#edtSupplierWebsite').val(popSupplierURL);
                                $('#edtSupplierShippingAddress').val(popSupplierStreet);
                                $('#edtSupplierShippingCity').val(popSupplierStreet2);
                                $('#edtSupplierShippingState').val(popSupplierState);
                                $('#edtSupplierShippingZIP').val(popSupplierPostcode);
                                $('#sedtCountry').val(popSupplierCountry);
                                $('#txaNotes').val(popSuppliernotes);
                                $('#sltPreferedPayment').val(popSupplierpreferedpayment);
                                $('#sltTerms').val(popSupplierterms);
                                $('#suppAccountNo').val(popSupplieraccountnumber);
                                $('#edtCustomeField1').val(popSuppliercustfield1);
                                $('#edtCustomeField2').val(popSuppliercustfield2);
                                $('#edtCustomeField3').val(popSuppliercustfield3);
                                $('#edtCustomeField4').val(popSuppliercustfield4);

                                if ((data.tsuppliervs1[i].fields.Street == data.tsuppliervs1[i].fields.BillStreet) && (data.tsuppliervs1[i].fields.Street2 == data.tsuppliervs1[i].fields.BillStreet2) &&
                                    (data.tsuppliervs1[i].fields.State == data.tsuppliervs1[i].fields.BillState) && (data.tsuppliervs1[i].fields.Postcode == data.tsuppliervs1[i].fields.Postcode) &&
                                    (data.tsuppliervs1[i].fields.Country == data.tsuppliervs1[i].fields.Billcountry)) {
                                    //templateObject.isSameAddress.set(true);
                                    $('#chkSameAsShipping').attr("checked", "checked");
                                }
                                if (data.tsuppliervs1[i].fields.Contractor == true) {
                                    // $('#isformcontractor')
                                    $('#isformcontractor').attr("checked", "checked");
                                } else {
                                    $('#isformcontractor').removeAttr("checked");
                                }
                                let supplierRecord = {
                                    id: popSupplierID,
                                    company: popSupplierName,
                                    email: popSupplierEmail,
                                    title: popSupplierTitle,
                                    firstname: popSupplierFirstName,
                                    middlename: popSupplierMiddleName,
                                    lastname: popSupplierLastName,
                                    tfn: '' || '',
                                    phone: popSupplierPhone,
                                    mobile: popSupplierMobile,
                                    fax: popSupplierFaxnumber,
                                    skype: popSupplierSkypeName,
                                    website: popSupplierURL,
                                    shippingaddress: popSupplierStreet,
                                    scity: popSupplierStreet2,
                                    sstate: popSupplierState,
                                    spostalcode: popSupplierPostcode,
                                    scountry: popSupplierCountry,
                                    billingaddress: popSupplierbillingaddress,
                                    bcity: popSupplierbcity,
                                    bstate: popSupplierbstate,
                                    bpostalcode: popSupplierbpostalcode,
                                    bcountry: popSupplierbcountry,
                                    custfield1: popSuppliercustfield1,
                                    custfield2: popSuppliercustfield2,
                                    custfield3: popSuppliercustfield3,
                                    custfield4: popSuppliercustfield4,
                                    notes: popSuppliernotes,
                                    preferedpayment: popSupplierpreferedpayment,
                                    terms: popSupplierterms,
                                    deliverymethod: popSupplierdeliverymethod,
                                    accountnumber: popSupplieraccountnumber,
                                    isContractor: popSupplierisContractor,
                                    issupplier: popSupplierissupplier,
                                    iscustomer: popSupplieriscustomer,
                                    bankName: data.tsuppliervs1[i].fields.BankName || '',
                                    swiftCode: data.tsuppliervs1[i].fields.SwiftCode || '',
                                    routingNumber: data.tsuppliervs1[i].fields.RoutingNumber || '',
                                    bankAccountName: data.tsuppliervs1[i].fields.BankAccountName || '',
                                    bankAccountBSB: data.tsuppliervs1[i].fields.BankAccountBSB || '',
                                    bankAccountNo: data.tsuppliervs1[i].fields.BankAccountNo || '',
                                    foreignExchangeCode: data.tsuppliervs1[i].fields.ForeignExchangeCode || CountryAbbr,
                                    // openingbalancedate: data.tsuppliervs1[i].fields.RewardPointsOpeningDate ? moment(data.tsuppliervs1[i].fields.RewardPointsOpeningDate).format('DD/MM/YYYY') : "",
                                    // taxcode:data.tsuppliervs1[i].fields.TaxCodeName || templateObject.defaultsaletaxcode.get()
                                };
                                templateObject.supplierRecord.set(supplierRecord);
                                setTimeout(function () {
                                    $('#addSupplierModal').modal('show');
                                }, 200);
                            }
                        }

                        if (!added) {
                            $('.fullScreenSpin').css('display', 'inline-block');
                            sideBarService.getOneSupplierDataExByName(supplierDataName).then(function (data) {
                                LoadingOverlay.hide();
                                let lineItems = [];

                                $('#add-supplier-title').text('Edit Supplier');
                                let popSupplierID = data.tsupplier[0].fields.ID || '';
                                let popSupplierName = data.tsupplier[0].fields.ClientName || '';
                                let popSupplierEmail = data.tsupplier[0].fields.Email || '';
                                let popSupplierTitle = data.tsupplier[0].fields.Title || '';
                                let popSupplierFirstName = data.tsupplier[0].fields.FirstName || '';
                                let popSupplierMiddleName = data.tsupplier[0].fields.CUSTFLD10 || '';
                                let popSupplierLastName = data.tsupplier[0].fields.LastName || '';
                                let popSuppliertfn = '' || '';
                                let popSupplierPhone = data.tsupplier[0].fields.Phone || '';
                                let popSupplierMobile = data.tsupplier[0].fields.Mobile || '';
                                let popSupplierFaxnumber = data.tsupplier[0].fields.Faxnumber || '';
                                let popSupplierSkypeName = data.tsupplier[0].fields.SkypeName || '';
                                let popSupplierURL = data.tsupplier[0].fields.URL || '';
                                let popSupplierStreet = data.tsupplier[0].fields.Street || '';
                                let popSupplierStreet2 = data.tsupplier[0].fields.Street2 || '';
                                let popSupplierState = data.tsupplier[0].fields.State || '';
                                let popSupplierPostcode = data.tsupplier[0].fields.Postcode || '';
                                let popSupplierCountry = data.tsupplier[0].fields.Country || LoggedCountry;
                                let popSupplierbillingaddress = data.tsupplier[0].fields.BillStreet || '';
                                let popSupplierbcity = data.tsupplier[0].fields.BillStreet2 || '';
                                let popSupplierbstate = data.tsupplier[0].fields.BillState || '';
                                let popSupplierbpostalcode = data.tsupplier[0].fields.BillPostcode || '';
                                let popSupplierbcountry = data.tsupplier[0].fields.Billcountry || LoggedCountry;
                                let popSuppliercustfield1 = data.tsupplier[0].fields.CUSTFLD1 || '';
                                let popSuppliercustfield2 = data.tsupplier[0].fields.CUSTFLD2 || '';
                                let popSuppliercustfield3 = data.tsupplier[0].fields.CUSTFLD3 || '';
                                let popSuppliercustfield4 = data.tsupplier[0].fields.CUSTFLD4 || '';
                                let popSuppliernotes = data.tsupplier[0].fields.Notes || '';
                                let popSupplierpreferedpayment = data.tsupplier[0].fields.PaymentMethodName || '';
                                let popSupplierterms = data.tsupplier[0].fields.TermsName || '';
                                let popSupplierdeliverymethod = data.tsupplier[0].fields.ShippingMethodName || '';
                                let popSupplieraccountnumber = data.tsupplier[0].fields.ClientNo || '';
                                let popSupplierisContractor = data.tsupplier[0].fields.Contractor || false;
                                let popSupplierissupplier = data.tsupplier[0].fields.IsSupplier || false;
                                let popSupplieriscustomer = data.tsupplier[0].fields.IsCustomer || false;

                                $('#edtSupplierCompany').val(popSupplierName);
                                $('#edtSupplierPOPID').val(popSupplierID);
                                $('#edtSupplierCompanyEmail').val(popSupplierEmail);
                                $('#edtSupplierTitle').val(popSupplierTitle);
                                $('#edtSupplierFirstName').val(popSupplierFirstName);
                                $('#edtSupplierMiddleName').val(popSupplierMiddleName);
                                $('#edtSupplierLastName').val(popSupplierLastName);
                                $('#edtSupplierPhone').val(popSupplierPhone);
                                $('#edtSupplierMobile').val(popSupplierMobile);
                                $('#edtSupplierFax').val(popSupplierFaxnumber);
                                $('#edtSupplierSkypeID').val(popSupplierSkypeName);
                                $('#edtSupplierWebsite').val(popSupplierURL);
                                $('#edtSupplierShippingAddress').val(popSupplierStreet);
                                $('#edtSupplierShippingCity').val(popSupplierStreet2);
                                $('#edtSupplierShippingState').val(popSupplierState);
                                $('#edtSupplierShippingZIP').val(popSupplierPostcode);
                                $('#sedtCountry').val(popSupplierCountry);
                                $('#txaNotes').val(popSuppliernotes);
                                $('#sltPreferedPayment').val(popSupplierpreferedpayment);
                                $('#sltTerms').val(popSupplierterms);
                                $('#suppAccountNo').val(popSupplieraccountnumber);
                                $('#edtCustomeField1').val(popSuppliercustfield1);
                                $('#edtCustomeField2').val(popSuppliercustfield2);
                                $('#edtCustomeField3').val(popSuppliercustfield3);
                                $('#edtCustomeField4').val(popSuppliercustfield4);

                                if ((data.tsupplier[0].fields.Street == data.tsupplier[0].fields.BillStreet) && (data.tsupplier[0].fields.Street2 == data.tsupplier[0].fields.BillStreet2) &&
                                    (data.tsupplier[0].fields.State == data.tsupplier[0].fields.BillState) && (data.tsupplier[0].fields.Postcode == data.tsupplier[0].fields.Postcode) &&
                                    (data.tsupplier[0].fields.Country == data.tsupplier[0].fields.Billcountry)) {
                                    //templateObject.isSameAddress.set(true);
                                    $('#chkSameAsShipping').attr("checked", "checked");
                                }
                                if (data.tsupplier[0].fields.Contractor == true) {
                                    // $('#isformcontractor')
                                    $('#isformcontractor').attr("checked", "checked");
                                } else {
                                    $('#isformcontractor').removeAttr("checked");
                                }
                                let supplierRecord = {
                                    id: popSupplierID,
                                    company: popSupplierName,
                                    email: popSupplierEmail,
                                    title: popSupplierTitle,
                                    firstname: popSupplierFirstName,
                                    middlename: popSupplierMiddleName,
                                    lastname: popSupplierLastName,
                                    tfn: '' || '',
                                    phone: popSupplierPhone,
                                    mobile: popSupplierMobile,
                                    fax: popSupplierFaxnumber,
                                    skype: popSupplierSkypeName,
                                    website: popSupplierURL,
                                    shippingaddress: popSupplierStreet,
                                    scity: popSupplierStreet2,
                                    sstate: popSupplierState,
                                    spostalcode: popSupplierPostcode,
                                    scountry: popSupplierCountry,
                                    billingaddress: popSupplierbillingaddress,
                                    bcity: popSupplierbcity,
                                    bstate: popSupplierbstate,
                                    bpostalcode: popSupplierbpostalcode,
                                    bcountry: popSupplierbcountry,
                                    custfield1: popSuppliercustfield1,
                                    custfield2: popSuppliercustfield2,
                                    custfield3: popSuppliercustfield3,
                                    custfield4: popSuppliercustfield4,
                                    notes: popSuppliernotes,
                                    preferedpayment: popSupplierpreferedpayment,
                                    terms: popSupplierterms,
                                    deliverymethod: popSupplierdeliverymethod,
                                    accountnumber: popSupplieraccountnumber,
                                    isContractor: popSupplierisContractor,
                                    issupplier: popSupplierissupplier,
                                    iscustomer: popSupplieriscustomer,
                                    bankName: data.tsuppliervs1[0].fields.BankName || '',
                                    swiftCode: data.tsuppliervs1[0].fields.SwiftCode || '',
                                    routingNumber: data.tsuppliervs1[0].fields.RoutingNumber || '',
                                    bankAccountName: data.tsuppliervs1[0].fields.BankAccountName || '',
                                    bankAccountBSB: data.tsuppliervs1[0].fields.BankAccountBSB || '',
                                    bankAccountNo: data.tsuppliervs1[0].fields.BankAccountNo || '',
                                    foreignExchangeCode: data.tsuppliervs1[0].fields.ForeignExchangeCode || CountryAbbr,
                                    // openingbalancedate: data.tsuppliervs1[0].fields.RewardPointsOpeningDate ? moment(data.tsuppliervs1[0].fields.RewardPointsOpeningDate).format('DD/MM/YYYY') : "",
                                    // taxcode:data.tsuppliervs1[0].fields.TaxCodeName || templateObject.defaultsaletaxcode.get()
                                };
                                templateObject.supplierRecord.set(supplierRecord);
                                setTimeout(function () {
                                    $('#addSupplierModal').modal('show');
                                }, 200);
                            }).catch(function (err) {

                                LoadingOverlay.hide();
                            });
                        }
                    }
                }).catch(function (err) {

                    sideBarService.getOneSupplierDataExByName(supplierDataName).then(function (data) {
                        LoadingOverlay.hide();
                        let lineItems = [];

                        $('#add-supplier-title').text('Edit Supplier');
                        let popSupplierID = data.tsupplier[0].fields.ID || '';
                        let popSupplierName = data.tsupplier[0].fields.ClientName || '';
                        let popSupplierEmail = data.tsupplier[0].fields.Email || '';
                        let popSupplierTitle = data.tsupplier[0].fields.Title || '';
                        let popSupplierFirstName = data.tsupplier[0].fields.FirstName || '';
                        let popSupplierMiddleName = data.tsupplier[0].fields.CUSTFLD10 || '';
                        let popSupplierLastName = data.tsupplier[0].fields.LastName || '';
                        let popSuppliertfn = '' || '';
                        let popSupplierPhone = data.tsupplier[0].fields.Phone || '';
                        let popSupplierMobile = data.tsupplier[0].fields.Mobile || '';
                        let popSupplierFaxnumber = data.tsupplier[0].fields.Faxnumber || '';
                        let popSupplierSkypeName = data.tsupplier[0].fields.SkypeName || '';
                        let popSupplierURL = data.tsupplier[0].fields.URL || '';
                        let popSupplierStreet = data.tsupplier[0].fields.Street || '';
                        let popSupplierStreet2 = data.tsupplier[0].fields.Street2 || '';
                        let popSupplierState = data.tsupplier[0].fields.State || '';
                        let popSupplierPostcode = data.tsupplier[0].fields.Postcode || '';
                        let popSupplierCountry = data.tsupplier[0].fields.Country || LoggedCountry;
                        let popSupplierbillingaddress = data.tsupplier[0].fields.BillStreet || '';
                        let popSupplierbcity = data.tsupplier[0].fields.BillStreet2 || '';
                        let popSupplierbstate = data.tsupplier[0].fields.BillState || '';
                        let popSupplierbpostalcode = data.tsupplier[0].fields.BillPostcode || '';
                        let popSupplierbcountry = data.tsupplier[0].fields.Billcountry || LoggedCountry;
                        let popSuppliercustfield1 = data.tsupplier[0].fields.CUSTFLD1 || '';
                        let popSuppliercustfield2 = data.tsupplier[0].fields.CUSTFLD2 || '';
                        let popSuppliercustfield3 = data.tsupplier[0].fields.CUSTFLD3 || '';
                        let popSuppliercustfield4 = data.tsupplier[0].fields.CUSTFLD4 || '';
                        let popSuppliernotes = data.tsupplier[0].fields.Notes || '';
                        let popSupplierpreferedpayment = data.tsupplier[0].fields.PaymentMethodName || '';
                        let popSupplierterms = data.tsupplier[0].fields.TermsName || '';
                        let popSupplierdeliverymethod = data.tsupplier[0].fields.ShippingMethodName || '';
                        let popSupplieraccountnumber = data.tsupplier[0].fields.ClientNo || '';
                        let popSupplierisContractor = data.tsupplier[0].fields.Contractor || false;
                        let popSupplierissupplier = data.tsupplier[0].fields.IsSupplier || false;
                        let popSupplieriscustomer = data.tsupplier[0].fields.IsCustomer || false;

                        $('#edtSupplierCompany').val(popSupplierName);
                        $('#edtSupplierPOPID').val(popSupplierID);
                        $('#edtSupplierCompanyEmail').val(popSupplierEmail);
                        $('#edtSupplierTitle').val(popSupplierTitle);
                        $('#edtSupplierFirstName').val(popSupplierFirstName);
                        $('#edtSupplierMiddleName').val(popSupplierMiddleName);
                        $('#edtSupplierLastName').val(popSupplierLastName);
                        $('#edtSupplierPhone').val(popSupplierPhone);
                        $('#edtSupplierMobile').val(popSupplierMobile);
                        $('#edtSupplierFax').val(popSupplierFaxnumber);
                        $('#edtSupplierSkypeID').val(popSupplierSkypeName);
                        $('#edtSupplierWebsite').val(popSupplierURL);
                        $('#edtSupplierShippingAddress').val(popSupplierStreet);
                        $('#edtSupplierShippingCity').val(popSupplierStreet2);
                        $('#edtSupplierShippingState').val(popSupplierState);
                        $('#edtSupplierShippingZIP').val(popSupplierPostcode);
                        $('#sedtCountry').val(popSupplierCountry);
                        $('#txaNotes').val(popSuppliernotes);
                        $('#sltPreferedPayment').val(popSupplierpreferedpayment);
                        $('#sltTerms').val(popSupplierterms);
                        $('#suppAccountNo').val(popSupplieraccountnumber);
                        $('#edtCustomeField1').val(popSuppliercustfield1);
                        $('#edtCustomeField2').val(popSuppliercustfield2);
                        $('#edtCustomeField3').val(popSuppliercustfield3);
                        $('#edtCustomeField4').val(popSuppliercustfield4);

                        if ((data.tsupplier[0].fields.Street == data.tsupplier[0].fields.BillStreet) && (data.tsupplier[0].fields.Street2 == data.tsupplier[0].fields.BillStreet2) &&
                            (data.tsupplier[0].fields.State == data.tsupplier[0].fields.BillState) && (data.tsupplier[0].fields.Postcode == data.tsupplier[0].fields.Postcode) &&
                            (data.tsupplier[0].fields.Country == data.tsupplier[0].fields.Billcountry)) {
                            //templateObject.isSameAddress.set(true);
                            $('#chkSameAsShipping').attr("checked", "checked");
                        }
                        if (data.tsupplier[0].fields.Contractor == true) {
                            // $('#isformcontractor')
                            $('#isformcontractor').attr("checked", "checked");
                        } else {
                            $('#isformcontractor').removeAttr("checked");
                        }
                        let supplierRecord = {
                            id: popSupplierID,
                            company: popSupplierName,
                            email: popSupplierEmail,
                            title: popSupplierTitle,
                            firstname: popSupplierFirstName,
                            middlename: popSupplierMiddleName,
                            lastname: popSupplierLastName,
                            tfn: '' || '',
                            phone: popSupplierPhone,
                            mobile: popSupplierMobile,
                            fax: popSupplierFaxnumber,
                            skype: popSupplierSkypeName,
                            website: popSupplierURL,
                            shippingaddress: popSupplierStreet,
                            scity: popSupplierStreet2,
                            sstate: popSupplierState,
                            spostalcode: popSupplierPostcode,
                            scountry: popSupplierCountry,
                            billingaddress: popSupplierbillingaddress,
                            bcity: popSupplierbcity,
                            bstate: popSupplierbstate,
                            bpostalcode: popSupplierbpostalcode,
                            bcountry: popSupplierbcountry,
                            custfield1: popSuppliercustfield1,
                            custfield2: popSuppliercustfield2,
                            custfield3: popSuppliercustfield3,
                            custfield4: popSuppliercustfield4,
                            notes: popSuppliernotes,
                            preferedpayment: popSupplierpreferedpayment,
                            terms: popSupplierterms,
                            deliverymethod: popSupplierdeliverymethod,
                            accountnumber: popSupplieraccountnumber,
                            isContractor: popSupplierisContractor,
                            issupplier: popSupplierissupplier,
                            iscustomer: popSupplieriscustomer,
                            bankName: data.tsuppliervs1[0].fields.BankName || '',
                            swiftCode: data.tsuppliervs1[0].fields.SwiftCode || '',
                            routingNumber: data.tsuppliervs1[0].fields.RoutingNumber || '',
                            bankAccountName: data.tsuppliervs1[0].fields.BankAccountName || '',
                            bankAccountBSB: data.tsuppliervs1[0].fields.BankAccountBSB || '',
                            bankAccountNo: data.tsuppliervs1[0].fields.BankAccountNo || '',
                            foreignExchangeCode: data.tsuppliervs1[0].fields.ForeignExchangeCode || CountryAbbr,
                            // openingbalancedate: data.tsuppliervs1[0].fields.RewardPointsOpeningDate ? moment(data.tsuppliervs1[0].fields.RewardPointsOpeningDate).format('DD/MM/YYYY') : "",
                            // taxcode:data.tsuppliervs1[0].fields.TaxCodeName || templateObject.defaultsaletaxcode.get()
                        };
                        templateObject.supplierRecord.set(supplierRecord);
                        setTimeout(function () {
                            $('#addSupplierModal').modal('show');
                        }, 200);


                    }).catch(function (err) {

                        LoadingOverlay.hide();
                    });
                });
                //FlowRouter.go('/supplierscard?name=' + e.target.value);
            } else {
                $('#supplierListModal').modal();
                setTimeout(function () {
                    $('#tblSupplierlist_filter .form-control-sm').focus();
                    $('#tblSupplierlist_filter .form-control-sm').val('');
                    $('#tblSupplierlist_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblSupplierlist').DataTable();
                    datatable.draw();
                    $('#tblSupplierlist_filter .form-control-sm').trigger("input");
                }, 500);
            }
        }
    })


    $(document).on("click", "#tblSupplierlist tbody tr", function (e) {
        const tableSupplier = $(this);
        $('#edtSupplierName').val(tableSupplier.find(".colCompany").text());
        $('#edtSupplierName').attr("suppid", tableSupplier.find(".colID").text());
        $('#edtSupplierEmail').val(tableSupplier.find(".colEmail").text());
        $('#edtSupplierEmail').attr('customerid', tableSupplier.find(".colID").text());
        $('#edtSupplierName').attr('suppid', tableSupplier.find(".colID").text());

        let postalAddress = tableSupplier.find(".colCompany").text() + '\n' + tableSupplier.find(".colStreetAddress").text() + '\n' + tableSupplier.find(".colCity").text() + ' ' + tableSupplier.find(".colState").text() + ' ' + tableSupplier.find(".colZipCode").text() + '\n' + tableSupplier.find(".colCountry").text();
        $('#txabillingAddress').val(postalAddress);
        $('#pdfSupplierAddress').html(postalAddress);
        $('.pdfSupplierAddress').text(postalAddress);
        $('#txaShipingInfo').val(postalAddress);
        $('#sltTerms').val(tableSupplier.find(".colSupplierTermName").text() || purchaseDefaultTerms);
        templateObject.setSupplierInfo();
        $('#supplierListModal').modal('hide');
    });



    // exportSalesToPdf = async function (template_title, number) {
    //     if (template_title == 'Bills') {
    //         await showBillData1(template_title, number, true);
    //     }

    //     let margins = {
    //         top: 0,
    //         bottom: 0,
    //         left: 0,
    //         width: 100
    //     };

    //     let invoice_data_info = templateObject.billrecord.get();
    //     // document.getElementById('html-2-pdfwrapper_new').style.display="block";
    //     // var source = document.getElementById('html-2-pdfwrapper_new');
    //     var source;
    //     if (number == 1) {
    //         $("#html-2-pdfwrapper_quotes").show();
    //         $("#html-2-pdfwrapper_quotes2").hide();
    //         $("#html-2-pdfwrapper_quotes3").hide();
    //         source = document.getElementById("html-2-pdfwrapper_quotes");
    //     } else if (number == 2) {
    //         $("#html-2-pdfwrapper_quotes").hide();
    //         $("#html-2-pdfwrapper_quotes2").show();
    //         $("#html-2-pdfwrapper_quotes3").hide();
    //         source = document.getElementById("html-2-pdfwrapper_quotes2");
    //     } else {
    //         $("#html-2-pdfwrapper_quotes").hide();
    //         $("#html-2-pdfwrapper_quotes2").hide();
    //         $("#html-2-pdfwrapper_quotes3").show();
    //         source = document.getElementById("html-2-pdfwrapper_quotes3");
    //     }

    //     let file = "Bills.pdf";
    //     if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
    //         if (template_title == 'Bills') {
    //             file = 'Bill-' + invoice_data_info.id + '.pdf';
    //         }

    //     }
    //     var opt = {
    //         margin: 0,
    //         filename: file,
    //         image: {
    //             type: 'jpeg',
    //             quality: 0.98
    //         },
    //         html2canvas: {
    //             scale: 2
    //         },
    //         jsPDF: {
    //             unit: 'in',
    //             format: 'a4',
    //             orientation: 'portrait'
    //         }
    //     };

    //     html2pdf().set(opt).from(source).save().then(function (dataObject) {
    //         if ($('.printID').attr('id') == undefined || $('.printID').attr('id') == "") {
    //             // $(".btnSave").trigger("click");
    //         } else {

    //         }
    //         $('#html-2-pdfwrapper').css('display', 'none');
    //         $('#html-2-pdfwrapper_new').css('display', 'none');
    //         $("#html-2-pdfwrapper_quotes").hide();
    //         $("#html-2-pdfwrapper_quotes2").hide();
    //         $("#html-2-pdfwrapper_quotes3").hide();
    //         $('.fullScreenSpin').css("display", "none");
    //     });
    //     return true;

    // };

    // exportSalesToPdf1 = function () {

    //     let margins = {
    //         top: 0,
    //         bottom: 0,
    //         left: 0,
    //         width: 100
    //     };

    //     let id = $('.printID').attr("id");

    //     let subtotal = $('#subtotal_total').text();
    //     let net = $('#subtotal_nett').text();
    //     let subtotal_discount = $('#subtotal_discount').text();
    //     let grandTotal = $('#grandTotal').text();
    //     let totalPaidAmt = $('#totalPaidAmt').text();
    //     let totalBalanceDue = $('#totalBalanceDue').text();
    //     let total_new_tax = $('#subtotal_tax').text();



    //     document.getElementById('html-2-pdfwrapper').style.display = "block";

    //     let taxItems = {};
    //     $('#tblBillLine > tbody > tr').each(function () {
    //         var lineID = this.id;
    //         let targetRow = $('#' + lineID);
    //         let targetTaxCode = targetRow.find('.lineTaxCode').val();
    //         let qty = targetRow.find(".lineQty").val() || 0
    //         let price = targetRow.find('.colUnitPriceExChange').val() || '';
    //         let colAmount = $('#' + lineID + " .colAmount").val();
    //         const taxDetail = templateObject.taxcodes.get().find((v) => v.CodeName === targetTaxCode);

    //         if (taxDetail) {
    //             let priceTotal = utilityService.convertSubstringParseFloat(colAmount);
    //             let taxTotal = priceTotal * parseFloat(taxDetail.Rate);
    //             if (taxDetail.Lines) {
    //                 taxDetail.Lines.map((line) => {
    //                     let taxCode = line.SubTaxCode;
    //                     let amount = priceTotal * line.Percentage / 100;
    //                     if (taxItems[taxCode]) {
    //                         taxItems[taxCode] += amount;
    //                     }
    //                     else {
    //                         taxItems[taxCode] = amount;
    //                     }
    //                 });
    //             }
    //             else {
    //                 // taxItems[targetTaxCode] = taxTotal;
    //             }
    //         }
    //     });
    //     if (taxItems && Object.keys(taxItems).length > 0) {
    //         $("#html-2-pdfwrapper #tax_list_print").html("");
    //         Object.keys(taxItems).map((code) => {
    //             let html = `
    //                 <div style="width: 100%; display: flex;">
    //                     <div style="padding-right: 16px; width: 50%;">
    //                         <p style="font-weight: 600; text-align: left; margin-bottom: 8px; color: rgb(0 0 0);">
    //                             ${code}</p>
    //                     </div>
    //                     <div style="padding-left: 16px; width: 50%;">
    //                         <p style="font-weight: 600; text-align: right; margin-bottom: 8px; color: rgb(0 0 0);">
    //                             $${taxItems[code].toFixed(3)}</p>
    //                     </div>
    //                 </div>
    //             `;
    //             $("#html-2-pdfwrapper #tax_list_print").append(html);
    //         });
    //     } else {
    //         $("#html-2-pdfwrapper #tax_list_print").remove();
    //     }


    //     $("#html-2-pdfwrapper #subtotal_totalPrint").html(subtotal);
    //     $("#html-2-pdfwrapper #grandTotalPrint").html(grandTotal);
    //     $("#html-2-pdfwrapper #totalpaidamount").html(totalPaidAmt);
    //     $("#html-2-pdfwrapper #totalBalanceDuePrint").html(totalBalanceDue);
    //     $("#html-2-pdfwrapper #total_tax_new").html(total_new_tax);

    //     var source = document.getElementById('html-2-pdfwrapper');
    //     let file = "Bill.pdf";
    //     if ($('.printID').attr('id') != undefined || $('.printID').attr('id') == "") {
    //         file = 'Bill-' + id + '.pdf';
    //     }
    //     var opt = {
    //         margin: 0,
    //         filename: file,
    //         image: {
    //             type: 'jpeg',
    //             quality: 0.98
    //         },
    //         html2canvas: {
    //             scale: 2
    //         },
    //         jsPDF: {
    //             unit: 'in',
    //             format: 'a4',
    //             orientation: 'portrait'
    //         }
    //     };

    //     html2pdf().set(opt).from(source).save().then(function (dataObject) {
    //         $('#html-2-pdfwrapper').css('display', 'none');
    //         LoadingOverlay.hide();
    //     });


    // };

    setTimeout(function () {

        var x = window.matchMedia("(max-width: 1024px)")

        function mediaQuery(x) {
            if (x.matches) {

                $("#colInvnoReference").removeClass("col-auto");
                $("#colInvnoReference").addClass("col-4");

                $("#colTermsVia").removeClass("col-auto");
                $("#colTermsVia").addClass("col-4");

                $("#colStatusDepartment").removeClass("col-auto");
                $("#colStatusDepartment").addClass("col-4");

                $("#colBillingAddress").removeClass("col-auto");
                $("#colBillingAddress").addClass("col-6");

                $("#colOrderDue").removeClass("col-auto");
                $("#colOrderDue").addClass("col-6");

                $("#fieldwidth").removeClass("billaddressfield");
                $("#fieldwidth").addClass("billaddressfield2");

            }
        }
        mediaQuery(x)
        x.addListener(mediaQuery)
    }, 10);
    setTimeout(function () {

        var x = window.matchMedia("(max-width: 420px)")

        function mediaQuery(x) {
            if (x.matches) {

                $("#colInvnoReference").removeClass("col-auto");
                $("#colInvnoReference").addClass("col-12");

                $("#colTermsVia").removeClass("col-auto");
                $("#colTermsVia").addClass("col-12");

                $("#colStatusDepartment").removeClass("col-auto");
                $("#colStatusDepartment").addClass("col-12");

                $("#colBillingAddress").removeClass("col-auto");
                $("#colBillingAddress").addClass("col-12");

                $("#colOrderDue").removeClass("col-auto");
                $("#colOrderDue").addClass("col-12");

                $("#colSupplierName").removeClass("col-auto");
                $("#colSupplierName").addClass("col-12");

                $("#colSupplierEmail").removeClass("col-auto");
                $("#colSupplierEmail").addClass("col-12");

                $("#fieldwidth").removeClass("billaddressfield");
                $("#fieldwidth").addClass("billaddressfield2");

            }
        }
        mediaQuery(x)
        x.addListener(mediaQuery)
    }, 10);

    // tempObj.getAllTaxCodes = function () {
    //     getVS1Data('TTaxcodeVS1').then(function (dataObject) {
    //         if (dataObject.length == 0) {
    //             purchaseService.getTaxCodesDetailVS1().then(function (data) {
    //
    //                 let records = [];
    //                 let inventoryData = [];
    //                 taxCodes = data.ttaxcodevs1;
    //                 tempObj.taxcodes.set(taxCodes);
    //                 for (let i = 0; i < data.ttaxcodevs1.length; i++) {
    //                     let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
    //                     var dataList = [
    //                         data.ttaxcodevs1[i].Id || '',
    //                         data.ttaxcodevs1[i].CodeName || '',
    //                         data.ttaxcodevs1[i].Description || '-',
    //                         taxRate || 0,
    //                     ];
    //
    //                     let taxcoderecordObj = {
    //                         codename: data.ttaxcodevs1[i].CodeName || ' ',
    //                         coderate: taxRate || ' ',
    //                     };
    //
    //                     taxCodesList.push(taxcoderecordObj);
    //
    //                     splashArrayTaxRateList.push(dataList);
    //                 }
    //                 tempObj.taxraterecords.set(taxCodesList);
    //
    //                 if (splashArrayTaxRateList) {
    //
    //                     $('#tblTaxRate').DataTable({
    //                         data: splashArrayTaxRateList,
    //                         "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //                         paging: true,
    //                         "aaSorting": [],
    //                         "orderMulti": true,
    //                         columnDefs: [{
    //                             orderable: false,
    //                             targets: 0
    //                         },
    //                         {
    //                             className: "taxName",
    //                             "targets": [1]
    //                         },
    //                         {
    //                             className: "taxDesc",
    //                             "targets": [2]
    //                         },
    //                         {
    //                             className: "taxRate text-right",
    //                             "targets": [3]
    //                         }
    //                         ],
    //                         select: true,
    //                         destroy: true,
    //                         colReorder: true,
    //
    //                         bStateSave: true,
    //
    //                         pageLength: initialDatatableLoad,
    //                         lengthMenu: [
    //                             [initialDatatableLoad, -1],
    //                             [initialDatatableLoad, "All"]
    //                         ],
    //                         info: true,
    //                         responsive: true,
    //                         language: { search: "", searchPlaceholder: "Search List..." },
    //                         "fnInitComplete": function () {
    //                             $("<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblTaxRate_filter");
    //                             $("<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblTaxRate_filter");
    //                         }
    //
    //                     });
    //
    //                 }
    //             })
    //         } else {
    //             let data = JSON.parse(dataObject[0].data);
    //             let useData = data.ttaxcodevs1;
    //             let records = [];
    //             let inventoryData = [];
    //             taxCodes = data.ttaxcodevs1;
    //             tempObj.taxcodes.set(taxCodes);
    //             for (let i = 0; i < useData.length; i++) {
    //                 let taxRate = (useData[i].Rate * 100).toFixed(2);
    //                 var dataList = [
    //                     useData[i].Id || '',
    //                     useData[i].CodeName || '',
    //                     useData[i].Description || '-',
    //                     taxRate || 0,
    //                 ];
    //
    //                 let taxcoderecordObj = {
    //                     codename: useData[i].CodeName || ' ',
    //                     coderate: taxRate || ' ',
    //                 };
    //
    //                 taxCodesList.push(taxcoderecordObj);
    //
    //                 splashArrayTaxRateList.push(dataList);
    //             }
    //             tempObj.taxraterecords.set(taxCodesList);
    //
    //
    //             if (splashArrayTaxRateList) {
    //
    //                 $('#tblTaxRate').DataTable({
    //                     data: splashArrayTaxRateList,
    //                     "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //                     paging: true,
    //                     "aaSorting": [],
    //                     "orderMulti": true,
    //                     columnDefs: [{
    //                         orderable: false,
    //                         targets: 0
    //                     },
    //                     {
    //                         className: "taxName",
    //                         "targets": [1]
    //                     },
    //                     {
    //                         className: "taxDesc",
    //                         "targets": [2]
    //                     },
    //                     {
    //                         className: "taxRate text-right",
    //                         "targets": [3]
    //                     }
    //                     ],
    //                     select: true,
    //                     destroy: true,
    //                     colReorder: true,
    //
    //
    //
    //                     bStateSave: true,
    //
    //
    //                     pageLength: initialDatatableLoad,
    //                     lengthMenu: [
    //                         [initialDatatableLoad, -1],
    //                         [initialDatatableLoad, "All"]
    //                     ],
    //                     info: true,
    //                     responsive: true,
    //                     language: { search: "", searchPlaceholder: "Search List..." },
    //                     "fnInitComplete": function () {
    //                         $("<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblTaxRate_filter");
    //                         $("<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblTaxRate_filter");
    //                     }
    //
    //                 });
    //
    //
    //
    //
    //
    //
    //             }
    //
    //         }
    //     }).catch(function (err) {
    //         purchaseService.getTaxCodesDetailVS1().then(function (data) {
    //
    //             let records = [];
    //             let inventoryData = [];
    //             taxCodes = data.ttaxcodevs1;
    //             tempObj.taxcodes.set(taxCodes);
    //             for (let i = 0; i < data.ttaxcodevs1.length; i++) {
    //                 let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
    //                 var dataList = [
    //                     data.ttaxcodevs1[i].Id || '',
    //                     data.ttaxcodevs1[i].CodeName || '',
    //                     data.ttaxcodevs1[i].Description || '-',
    //                     taxRate || 0,
    //                 ];
    //
    //                 let taxcoderecordObj = {
    //                     codename: data.ttaxcodevs1[i].CodeName || ' ',
    //                     coderate: taxRate || ' ',
    //                 };
    //
    //                 taxCodesList.push(taxcoderecordObj);
    //
    //                 splashArrayTaxRateList.push(dataList);
    //             }
    //             tempObj.taxraterecords.set(taxCodesList);
    //
    //
    //             if (splashArrayTaxRateList) {
    //
    //                 $('#tblTaxRate').DataTable({
    //                     data: splashArrayTaxRateList,
    //                     "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //                     paging: true,
    //                     "aaSorting": [],
    //                     "orderMulti": true,
    //                     columnDefs: [{
    //                         orderable: false,
    //                         targets: 0
    //                     },
    //                     {
    //                         className: "taxName",
    //                         "targets": [1]
    //                     },
    //                     {
    //                         className: "taxDesc",
    //                         "targets": [2]
    //                     },
    //                     {
    //                         className: "taxRate text-right",
    //                         "targets": [3]
    //                     }
    //                     ],
    //                     select: true,
    //                     destroy: true,
    //                     colReorder: true,
    //
    //
    //
    //                     bStateSave: true,
    //
    //
    //                     pageLength: initialDatatableLoad,
    //                     lengthMenu: [
    //                         [initialDatatableLoad, -1],
    //                         [initialDatatableLoad, "All"]
    //                     ],
    //                     info: true,
    //                     responsive: true,
    //                     language: { search: "", searchPlaceholder: "Search List..." },
    //                     "fnInitComplete": function () {
    //                         $("<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblTaxRate_filter");
    //                         $("<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblTaxRate_filter");
    //                     }
    //
    //                 });
    //
    //
    //
    //
    //
    //
    //             }
    //         })
    //     });
    // };
    // tempObj.getAllTaxCodes();

    // tempObj.getSubTaxCodes = function () {
    //     let subTaxTableList = [];

    //     getVS1Data("TSubTaxVS1")
    //         .then(function (dataObject) {
    //             if (dataObject.length == 0) {
    //                 taxRateService.getSubTaxCode().then(function (data) {
    //                     for (let i = 0; i < data.tsubtaxcode.length; i++) {
    //                         var dataList = {
    //                             id: data.tsubtaxcode[i].Id || "",
    //                             codename: data.tsubtaxcode[i].Code || "-",
    //                             description: data.tsubtaxcode[i].Description || "-",
    //                             category: data.tsubtaxcode[i].Category || "-",
    //                         };

    //                         subTaxTableList.push(dataList);
    //                     }

    //                     tempObj.subtaxcodes.set(subTaxTableList);
    //                 });
    //             } else {
    //                 let data = JSON.parse(dataObject[0].data);
    //                 let useData = data.tsubtaxcode;
    //                 for (let i = 0; i < useData.length; i++) {
    //                     var dataList = {
    //                         id: useData[i].Id || "",
    //                         codename: useData[i].Code || "-",
    //                         description: useData[i].Description || "-",
    //                         category: useData[i].Category || "-",
    //                     };

    //                     subTaxTableList.push(dataList);
    //                 }

    //                 tempObj.subtaxcodes.set(subTaxTableList);
    //             }
    //         })
    //         .catch(function (err) {
    //             taxRateService.getSubTaxCode().then(function (data) {
    //                 for (let i = 0; i < data.tsubtaxcode.length; i++) {
    //                     var dataList = {
    //                         id: data.tsubtaxcode[i].Id || "",
    //                         codename: data.tsubtaxcode[i].Code || "-",
    //                         description: data.tsubtaxcode[i].Description || "-",
    //                         category: data.tsubtaxcode[i].Category || "-",
    //                     };

    //                     subTaxTableList.push(dataList);
    //                 }

    //                 tempObj.subtaxcodes.set(subTaxTableList);
    //             });
    //         });
    // };

    // tempObj.getSubTaxCodes();

    templateObject.setOneBillData = (data) => {
        LoadingOverlay.hide();
        let lineItems = [];
        let lineItemObj = {};
        let lineItemsTable = [];
        let lineItemTableObj = {};
        let exchangeCode = useData[d].fields.ForeignExchangeCode;
        let currencySymbol = Currency;
        let total = currencySymbol + '' + useData[d].fields.TotalAmount.toFixed(2);
        let totalInc = currencySymbol + '' + useData[d].fields.TotalAmountInc.toFixed(2);
        let subTotal = currencySymbol + '' + useData[d].fields.TotalAmount.toFixed(2);
        let totalTax = currencySymbol + '' + useData[d].fields.TotalTax.toFixed(2);
        let totalBalance = currencySymbol + '' + useData[d].fields.TotalBalance.toFixed(2);
        let totalPaidAmount = currencySymbol + '' + useData[d].fields.TotalPaid.toFixed(2);
        if (useData[d].fields.Lines.length) {
            for (let i = 0; i < useData[d].fields.Lines.length; i++) {
                let AmountGbp = currencySymbol + '' + useData[d].fields.Lines[i].fields.TotalLineAmount.toFixed(2);
                let currencyAmountGbp = currencySymbol + '' + useData[d].fields.Lines[i].fields.TotalLineAmount.toFixed(2);
                let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.LineTaxTotal);
                let TaxRateGbp = (useData[d].fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);
                lineItemObj = {
                    lineID: Random.id(),
                    id: useData[d].fields.Lines[i].fields.ID || '',
                    accountname: useData[d].fields.Lines[i].fields.AccountName || '',
                    memo: useData[d].fields.Lines[i].fields.ProductDescription || '',
                    item: useData[d].fields.Lines[i].fields.ProductName || '',
                    description: useData[d].fields.Lines[i].fields.ProductDescription || '',
                    quantity: useData[d].fields.Lines[i].fields.UOMOrderQty || 0,
                    unitPrice: currencySymbol + '' + useData[d].fields.Lines[i].fields.LineCost.toFixed(2) || 0,
                    unitPriceInc: currencySymbol + '' + useData[d].fields.Lines[i].fields.LineCostInc.toFixed(2) || 0,
                    lineCost: currencySymbol + '' + useData[d].fields.Lines[i].fields.LineCost.toFixed(2) || 0,
                    taxRate: (useData[d].fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                    taxCode: useData[d].fields.Lines[i].fields.LineTaxCode || '',
                    TotalAmt: AmountGbp || 0,
                    customerJob: useData[d].fields.Lines[i].fields.CustomerJob || '',
                    curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                    TaxTotal: TaxTotalGbp || 0,
                    TaxRate: TaxRateGbp || 0,

                };

                lineItemsTable.push(dataListTable);
                lineItems.push(lineItemObj);
            }
        } else {
            let AmountGbp = useData[d].fields.Lines.fields.TotalLineAmountInc.toFixed(2);
            let currencyAmountGbp = currencySymbol + '' + useData[d].fields.Lines.fields.TotalLineAmount.toFixed(2);
            let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines.fields.LineTaxTotal);
            let TaxRateGbp = currencySymbol + '' + useData[d].fields.Lines.fields.LineTaxRate;
            lineItemObj = {
                lineID: Random.id(),
                id: useData[d].fields.Lines.fields.ID || '',
                accountname: useData[d].fields.Lines.fields.AccountName || '',
                memo: useData[d].fields.Lines.fields.ProductDescription || '',
                description: useData[d].fields.Lines.fields.ProductDescription || '',
                quantity: useData[d].fields.Lines.fields.UOMOrderQty || 0,
                unitPrice: useData[d].fields.Lines[i].fields.LineCost.toFixed(2) || 0,
                unitPriceInc: useData[d].fields.Lines[i].fields.LineCostInc.toFixed(2) || 0,
                lineCost: useData[d].fields.Lines[i].fields.LineCost.toFixed(2) || 0,
                taxRate: (useData[d].fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                taxCode: useData[d].fields.Lines[i].fields.LineTaxCode || '',
                TotalAmt: AmountGbp || 0,
                customerJob: data.fields.Lines[i].fields.CustomerJob || '',
                curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                TaxTotal: TaxTotalGbp || 0,
                TaxRate: TaxRateGbp || 0
            };
            lineItems.push(lineItemObj);
        }

        let isPartialPaid = false;
        if (useData[d].fields.TotalPaid > 0) {
            isPartialPaid = true;
        }

        let billrecord = {
            id: useData[d].fields.ID,
            lid: 'Edit Bill' + ' ' + useData[d].fields.ID,
            sosupplier: useData[d].fields.SupplierName,
            billto: useData[d].fields.OrderTo,
            shipto: useData[d].fields.ShipTo,
            shipping: useData[d].fields.Shipping,
            docnumber: useData[d].fields.DocNumber,
            custPONumber: useData[d].fields.CustPONumber,
            saledate: useData[d].fields.OrderDate ? moment(useData[d].fields.OrderDate).format('DD/MM/YYYY') : "",
            duedate: useData[d].fields.DueDate ? moment(useData[d].fields.DueDate).format('DD/MM/YYYY') : "",
            employeename: useData[d].fields.EmployeeName,
            status: useData[d].fields.OrderStatus,
            invoicenumber: useData[d].fields.SupplierInvoiceNumber,
            comments: useData[d].fields.Comments,
            pickmemo: useData[d].fields.SalesComments,
            ponumber: useData[d].fields.CustPONumber,
            via: useData[d].fields.Shipping,
            connote: useData[d].fields.ConNote,
            reference: useData[d].fields.CustPONumber,
            currency: useData[d].fields.ForeignExchangeCode,
            branding: useData[d].fields.MedType,
            invoiceToDesc: useData[d].fields.OrderTo,
            shipToDesc: useData[d].fields.ShipTo,
            termsName: useData[d].fields.TermsName,
            Total: totalInc,
            LineItems: lineItems,
            TotalTax: totalTax,
            SubTotal: subTotal,
            balanceDue: totalBalance,
            saleCustField1: useData[d].fields.SaleLineRef,
            saleCustField2: useData[d].fields.SalesComments,
            totalPaid: totalPaidAmount,
            ispaid: useData[d].fields.IsPaid,
            isPartialPaid: isPartialPaid,
            department: useData[d].fields.Lines[0].fields.LineClassName || defaultDept,
            CustomerID: useData[d].fields.SupplierId
        };
        templateObject.getSupplierData(useData[d].fields.SupplierId)

        $('#edtSupplierName').val(useData[d].fields.SupplierName);
        $('#sltTerms').val(useData[d].fields.TermsName);
        $('#sltDept').val(useData[d].fields.Lines[0].fields.LineClassName);
        $('#sltStatus').val(useData[d].fields.OrderStatus);
        templateObject.CleintName.set(useData[d].fields.SupplierName);
        $('#shipvia').val(useData[d].fields.Shipping);
        $('.sltCurrency').val(useData[d].fields.ForeignExchangeCode);
        //$('#exchange_rate').val(useData[d].fields.ForeignExchangeRate);
        //let currencyRate = templateObject.getCurrencyRate(useData[d].fields.ForeignExchangeCode, 0);
        $('#exchange_rate').val(templateObject.getCurrencyRate(useData[d].fields.ForeignExchangeCode, 0));
        FxGlobalFunctions.handleChangedCurrency(useData[d].fields.ForeignExchangeCode, defaultCurrencyCode);

        templateObject.attachmentCount.set(0);
        if (useData[d].fields.Attachments) {
            if (useData[d].fields.Attachments.length) {
                templateObject.attachmentCount.set(useData[d].fields.Attachments.length);
                templateObject.uploadedFiles.set(useData[d].fields.Attachments);
            }
        }

        setTimeout(function () {
            if (clientList) {
                for (var i = 0; i < clientList.length; i++) {
                    if (clientList[i].suppliername == useData[d].fields.SupplierName) {
                        $('#edtSupplierEmail').val(clientList[i].supplieremail);
                        $('#edtSupplierEmail').attr('supplierid', clientList[i].supplierid);
                    }
                }
            }


            if (useData[d].fields.IsPaid === true) {
                $('#edtSupplierName').attr('readonly', true);
                $('#btnViewPayment').removeAttr('disabled', 'disabled');
                $('#addRow').attr('disabled', 'disabled');
                $('#edtSupplierName').css('background-color', '#eaecf4');
                $('.btnSave').attr('disabled', 'disabled');
                $('#btnBack').removeAttr('disabled', 'disabled');
                $('.printConfirm').removeAttr('disabled', 'disabled');
                $('.tblBillLine tbody tr').each(function () {
                    var $tblrow = $(this);
                    $tblrow.find("td").attr('contenteditable', false);
                    //$tblrow.find("td").removeClass("lineProductName");
                    $tblrow.find("td").removeClass("lineTaxAmount");
                    $tblrow.find("td").removeClass("lineTaxCode");

                    $tblrow.find("td").attr('readonly', true);
                    $tblrow.find("td").attr('disabled', 'disabled');
                    $tblrow.find("td").css('background-color', '#eaecf4');
                    $tblrow.find("td .table-remove").removeClass("btnRemove");
                });
            }

        }, 100);



        templateObject.billrecord.set(billrecord);

        templateObject.selectedCurrency.set(billrecord.currency);
        templateObject.inputSelectedCurrency.set(billrecord.currency);
        if (templateObject.billrecord.get()) {


            Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblBillLine', function (error, result) {
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
                            if (columnWidth != 0) {
                                $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
                            }

                            if (hiddenColumn == true) {

                                $("." + columnClass + "").addClass('hiddenColumn');
                                $("." + columnClass + "").removeClass('showColumn');
                            } else if (hiddenColumn == false) {
                                $("." + columnClass + "").removeClass('hiddenColumn');
                                $("." + columnClass + "").addClass('showColumn');

                            }

                        }
                    }

                }
            });
        }
    }

    templateObject.initialRecords = (data) => {

        LoadingOverlay.hide();
        let lineItems = [];
        let lineItemsTable = [];
        let lineItemObj = {};
        lineItemObj = {
            lineID: Random.id(),
            item: '',
            accountname: '',
            memo: '',
            description: '',
            quantity: '',
            unitPrice: 0,
            unitPriceInc: 0,
            taxRate: 0,
            taxCode: '',
            TotalAmt: 0,
            curTotalAmt: 0,
            TaxTotal: 0,
            TaxRate: 0,

        };
        lineItemsTable.push(dataListTable);
        lineItems.push(lineItemObj);
        const currentDate = new Date();
        const begunDate = moment(currentDate).format("DD/MM/YYYY");
        let billrecord = {
            id: '',
            lid: 'New Bill',
            accountname: '',
            memo: '',
            sosupplier: '',
            billto: '',
            shipto: '',
            shipping: '',
            docnumber: '',
            custPONumber: '',
            saledate: begunDate,
            duedate: '',
            employeename: '',
            status: '',
            invoicenumber: '',
            category: '',
            comments: '',
            pickmemo: '',
            ponumber: '',
            via: '',
            connote: '',
            reference: '',
            currency: '',
            branding: '',
            invoiceToDesc: '',
            shipToDesc: '',
            termsName: '',
            Total: Currency + '' + 0.00,
            LineItems: lineItems,
            TotalTax: Currency + '' + 0.00,
            SubTotal: Currency + '' + 0.00,
            balanceDue: Currency + '' + 0.00,
            saleCustField1: '',
            saleCustField2: '',
            totalPaid: Currency + '' + 0.00,
            ispaid: false,
            isPartialPaid: false,
            CustomerID: 0
        };
        if (FlowRouter.current().queryParams.supplierid) {
            templateObject.getSupplierData(FlowRouter.current().queryParams.supplierid);
        } else {
            $('#edtSupplierName').val('');
        }
        setTimeout(function () {
            $('#sltDept').val(defaultDept);
            templateObject.getLastBillData();
        }, 200);
        templateObject.billrecord.set(billrecord);
        if (templateObject.billrecord.get()) {
            Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblBillLine', function (error, result) {
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
                            if (columnWidth != 0) {
                                $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
                            }
                            if (hiddenColumn == true) {
                                $("." + columnClass + "").addClass('hiddenColumn');
                                $("." + columnClass + "").removeClass('showColumn');
                            } else if (hiddenColumn == false) {
                                $("." + columnClass + "").removeClass('hiddenColumn');
                                $("." + columnClass + "").addClass('showColumn');
                            }

                        }
                    }

                }
            });
        }

    }

    templateObject.saveBills = (data) => {
        playSaveAudio();
        let uploadedItems = templateObject.uploadedFiles.get();
        setTimeout(function () {
            saveCurrencyHistory();

            let suppliername = $('#edtSupplierName');

            let termname = $('#sltTerms').val() || '';
            if (termname === '') {
                swal({
                    title: "Terms has not been selected!",
                    text: '',
                    type: 'warning',
                }).then((result) => {
                    if (result.value) {
                        $('#sltTerms').focus();
                    } else if (result.dismiss == 'cancel') {

                    }
                });
                event.preventDefault();
                return false;
            }
            if (suppliername.val() === '') {
                swal({
                    title: "Supplier has not been selected!",
                    text: '',
                    type: 'warning',
                }).then((result) => {
                    if (result.value) {
                        $('#edtSupplierName').focus();
                    } else if (result.dismiss == 'cancel') {

                    }
                });
                e.preventDefault();
            } else {
                $('.fullScreenSpin').css('display', 'inline-block');
                var splashLineArray = new Array();
                let lineItemsForm = [];
                let lineItemObjForm = {};
                $('#tblBillLine > tbody > tr').each(function () {
                    var lineID = this.id;
                    let tdaccount = $('#' + lineID + " .lineAccountName").val();
                    let tddmemo = $('#' + lineID + " .lineMemo").text();
                    let tdamount = $('#' + lineID + " .lineAmount").val();
                    let tdCustomerJob = $('#' + lineID + " .lineCustomerJob").val();
                    let tdtaxrate = $('#' + lineID + " .lineTaxRate").text();
                    let tdtaxCode = $('#' + lineID + " .lineTaxCode").val() || "NT";

                    if (tdaccount != "") {

                        lineItemObjForm = {
                            type: "TBillLine",
                            fields: {
                                AccountName: tdaccount || '',
                                ProductDescription: tddmemo || '',
                                CustomerJob: tdCustomerJob || '',
                                LineCost: Number(tdamount.replace(/[^0-9.-]+/g, "")) || 0,
                                LineTaxCode: tdtaxCode || '',
                                LineClassName: $('#sltDept').val() || defaultDept
                            }
                        };
                        lineItemsForm.push(lineItemObjForm);
                        splashLineArray.push(lineItemObjForm);
                    }
                });
                let getchkcustomField1 = true;
                let getchkcustomField2 = true;
                let getcustomField1 = $('.customField1Text').html();
                let getcustomField2 = $('.customField2Text').html();
                if ($('#formCheck-one').is(':checked')) {
                    getchkcustomField1 = false;
                }
                if ($('#formCheck-two').is(':checked')) {
                    getchkcustomField2 = false;
                }

                let supplier = $('#edtSupplierName').val();
                let supplierEmail = $('#edtSupplierEmail').val();
                let billingAddress = $('#txabillingAddress').val();

                var saledateTime = new Date($("#dtSODate").datepicker("getDate"));
                var duedateTime = new Date($("#dtDueDate").datepicker("getDate"));

                let saleDate = saledateTime.getFullYear() + "-" + (saledateTime.getMonth() + 1) + "-" + saledateTime.getDate();
                let dueDate = duedateTime.getFullYear() + "-" + (duedateTime.getMonth() + 1) + "-" + duedateTime.getDate();

                let poNumber = $('#ponumber').val();
                let reference = $('#edtRef').val();

                let departement = $('#sltVia').val();
                let shippingAddress = $('#txaShipingInfo').val();
                let comments = $('#txaComment').val();
                let pickingInfrmation = $('#txapickmemo').val();

                let saleCustField1 = $('#edtSaleCustField1').val();
                let saleCustField2 = $('#edtSaleCustField2').val();
                let orderStatus = $('#edtStatus').val();
                let billTotal = $('#grandTotal').text();

                var url = FlowRouter.current().path;
                var getso_id = url.split('?id=');
                var currentBill = getso_id[getso_id.length - 1];

                var currencyCode = $(".sltCurrency").val() || CountryAbbr;
                let ForeignExchangeRate = $('#exchange_rate').val() || 0;
                let foreignCurrencyFields = {}
                if (FxGlobalFunctions.isCurrencyEnabled()) {
                    foreignCurrencyFields = {
                        ForeignExchangeCode: currencyCode,
                        ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                    }
                }

                var objDetails = '';
                if ($('#sltDept').val() === '') {
                    swal({
                        title: "Department has not been selected!",
                        text: '',
                        type: 'warning',
                    }).then((result) => {
                        if (result.value) {
                            $('#sltDept').focus();
                        } else if (result.dismiss == 'cancel') {

                        }
                    });
                    LoadingOverlay.hide();
                    event.preventDefault();
                    return false;
                }
                if (getso_id[1]) {
                    currentBill = parseInt(currentBill);
                    objDetails = {
                        type: "TBillEx",
                        fields: {
                            ID: currentBill,
                            SupplierName: supplier,
                            // ForeignExchangeCode: currencyCode,
                            // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                            ...foreignCurrencyFields,
                            Lines: splashLineArray,
                            OrderTo: billingAddress,
                            Deleted: false,

                            OrderDate: saleDate,

                            SupplierInvoiceNumber: poNumber,
                            ConNote: reference,
                            TermsName: termname,
                            Shipping: departement,
                            ShipTo: shippingAddress,
                            Comments: comments,


                            SalesComments: pickingInfrmation,
                            Attachments: uploadedItems,
                            OrderStatus: $('#sltStatus').val(),
                            BillTotal: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0,
                            TotalAmountInc: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0
                        }
                    };
                } else {
                    objDetails = {
                        type: "TBillEx",
                        fields: {
                            SupplierName: supplier,
                            // ForeignExchangeCode: currencyCode,
                            // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                            ...foreignCurrencyFields,
                            Lines: splashLineArray,
                            OrderTo: billingAddress,
                            OrderDate: saleDate,
                            Deleted: false,

                            SupplierInvoiceNumber: poNumber,
                            ConNote: reference,
                            TermsName: termname,
                            Shipping: departement,
                            ShipTo: shippingAddress,
                            Comments: comments,


                            SalesComments: pickingInfrmation,
                            Attachments: uploadedItems,
                            OrderStatus: $('#sltStatus').val(),
                            BillTotal: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0,
                            TotalAmountInc: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0
                        }
                    };
                }
                if (splashLineArray.length > 0) {

                } else {
                    // swal('Account name has not been selected!', '', 'warning');
                    // LoadingOverlay.hide();
                    // event.preventDefault();
                    // return false;
                };
                purchaseService.saveBillEx(objDetails).then(function (objDetails) {
                    if (localStorage.getItem("enteredURL") != null) {
                        FlowRouter.go(localStorage.getItem("enteredURL"));
                        localStorage.removeItem("enteredURL");
                        return;
                    }

                    var supplierID = $('#edtSupplierEmail').attr('supplierid');


                    $('#html-2-pdfwrapper').css('display', 'block');
                    $('.pdfCustomerName').html($('#edtSupplierEmail').val());
                    $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));
                    var ponumber = $('#ponumber').val() || '.';
                    $('.po').text(ponumber);
                    // async function addAttachment() {
                    //     let attachment = [];
                    //     let invoiceId = objDetails.fields.ID;
                    //     FlowRouter.go('/billlist?success=true');
                    //     let encodedPdf = await generatePdfForMail(invoiceId);
                    //     let pdfObject = "";

                    //     let base64data = encodedPdf.split(',')[1];
                    //     pdfObject = {
                    //         filename: 'Bill-' + invoiceId + '.pdf',
                    //         content: base64data,
                    //         encoding: 'base64'
                    //     };
                    //     attachment.push(pdfObject);
                    //     let erpInvoiceId = objDetails.fields.ID;
                    //     let mailFromName = localStorage.getItem('vs1companyName');
                    //     let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
                    //     let customerEmailName = $('#edtSupplierName').val();
                    //     let checkEmailData = $('#edtSupplierEmail').val();
                    //     // let grandtotal = $('#grandTotal').html();
                    //     // let amountDueEmail = $('#totalBalanceDue').html();
                    //     // let emailDueDate = $("#dtDueDate").val();
                    //     let mailSubject = 'Bill ' + erpInvoiceId + ' from ' + mailFromName + ' for ' + customerEmailName;
                    //     // let mailBody = "Hi " + customerEmailName + ",\n\n Here's bill " + erpInvoiceId + " for  " + grandtotal + "." +
                    //     //     "\n\nThe amount outstanding of " + amountDueEmail + " is due on " + emailDueDate + "." +
                    //     //     "\n\nIf you have any questions, please let us know : " + mailFrom + ".\n\nThanks,\n" + mailFromName;
                    //     var htmlmailBody = generateHtmlMailBody(erpInvoiceId);

                    //     if (($('.chkEmailCopy').is(':checked')) && ($('.chkEmailRep').is(':checked'))) {
                    //         Meteor.call('sendEmail', {
                    //             from: "" + mailFromName + " <" + mailFrom + ">",
                    //             to: checkEmailData,
                    //             subject: mailSubject,
                    //             text: '',
                    //             html: htmlmailBody,
                    //             attachments: attachment
                    //         }, function (error, result) {
                    //             if (error && error.error === "error") {


                    //             } else {

                    //             }
                    //         });

                    //         Meteor.call('sendEmail', {
                    //             from: "" + mailFromName + " <" + mailFrom + ">",
                    //             to: mailFrom,
                    //             subject: mailSubject,
                    //             text: '',
                    //             html: htmlmailBody,
                    //             attachments: attachment
                    //         }, function (error, result) {
                    //             if (error && error.error === "error") {
                    //                 if (FlowRouter.current().queryParams.trans) {
                    //                     FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans);
                    //                 } else {
                    //                     FlowRouter.go('/billlist?success=true');
                    //                 };
                    //             } else {
                    //                 $('#html-2-pdfwrapper').css('display', 'none');
                    //                 swal({
                    //                     title: 'SUCCESS',
                    //                     text: "Email Sent To Supplier: " + checkEmailData + " and User: " + mailFrom + "",
                    //                     type: 'success',
                    //                     showCancelButton: false,
                    //                     confirmButtonText: 'OK'
                    //                 }).then((result) => {
                    //                     if (result.value) {
                    //                         if (FlowRouter.current().queryParams.trans) {
                    //                             FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans);
                    //                         } else {
                    //                             FlowRouter.go('/billlist?success=true');
                    //                         };
                    //                     } else if (result.dismiss === 'cancel') {

                    //                     }
                    //                 });

                    //                 LoadingOverlay.hide();
                    //             }
                    //         });

                    //         let values = [];
                    //         let basedOnTypeStorages = Object.keys(localStorage);
                    //         basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
                    //             let employeeId = storage.split('_')[2];
                    //             // return storage.includes('BasedOnType_') && employeeId == localStorage.getItem('mySessionEmployeeLoggedID')
                    //             return storage.includes('BasedOnType_');
                    //         });
                    //         let i = basedOnTypeStorages.length;
                    //         if (i > 0) {
                    //             while (i--) {
                    //                 values.push(localStorage.getItem(basedOnTypeStorages[i]));
                    //             }
                    //         }
                    //         values.forEach(value => {
                    //             let reportData = JSON.parse(value);
                    //             let temp = { ...reportData };

                    //             temp.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                    //             reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                    //             temp.attachments = attachment;
                    //             if (temp.BasedOnType.includes("S")) {
                    //                 if (temp.FormID == 1) {
                    //                     let formIds = temp.FormIDs.split(',');
                    //                     if (formIds.includes("12")) {
                    //                         temp.FormID = 12;
                    //                         Meteor.call('sendNormalEmail', temp);
                    //                     }
                    //                 } else {
                    //                     if (temp.FormID == 12)
                    //                         Meteor.call('sendNormalEmail', temp);
                    //                 }
                    //             }
                    //         });

                    //     } else if (($('.chkEmailCopy').is(':checked'))) {
                    //         Meteor.call('sendEmail', {
                    //             from: "" + mailFromName + " <" + mailFrom + ">",
                    //             to: checkEmailData,
                    //             subject: mailSubject,
                    //             text: '',
                    //             html: htmlmailBody,
                    //             attachments: attachment
                    //         }, function (error, result) {
                    //             if (error && error.error === "error") {
                    //                 FlowRouter.go('/billlist?success=true');
                    //             } else {
                    //                 $('#html-2-pdfwrapper').css('display', 'none');
                    //                 swal({
                    //                     title: 'SUCCESS',
                    //                     text: "Email Sent To Supplier: " + checkEmailData + " ",
                    //                     type: 'success',
                    //                     showCancelButton: false,
                    //                     confirmButtonText: 'OK'
                    //                 }).then((result) => {
                    //                     if (result.value) {
                    //                         if (FlowRouter.current().queryParams.trans) {
                    //                             FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                    //                         } else {
                    //                             FlowRouter.go('/billlist?success=true');
                    //                         };
                    //                     } else if (result.dismiss === 'cancel') {

                    //                     }
                    //                 });

                    //                 LoadingOverlay.hide();
                    //             }
                    //         });

                    //         let values = [];
                    //         let basedOnTypeStorages = Object.keys(localStorage);
                    //         basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
                    //             let employeeId = storage.split('_')[2];
                    //             // return storage.includes('BasedOnType_') && employeeId == localStorage.getItem('mySessionEmployeeLoggedID')
                    //             return storage.includes('BasedOnType_')
                    //         });
                    //         let i = basedOnTypeStorages.length;
                    //         if (i > 0) {
                    //             while (i--) {
                    //                 values.push(localStorage.getItem(basedOnTypeStorages[i]));
                    //             }
                    //         }
                    //         values.forEach(value => {
                    //             let reportData = JSON.parse(value);
                    //             reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                    //             reportData.attachments = attachment;
                    //             if (reportData.BasedOnType.includes("S")) {
                    //                 if (reportData.FormID == 1) {
                    //                     let formIds = reportData.FormIDs.split(',');
                    //                     if (formIds.includes("12")) {
                    //                         reportData.FormID = 12;
                    //                         Meteor.call('sendNormalEmail', reportData);
                    //                     }
                    //                 } else {
                    //                     if (reportData.FormID == 12)
                    //                         Meteor.call('sendNormalEmail', reportData);
                    //                 }
                    //             }
                    //         });

                    //     } else if (($('.chkEmailRep').is(':checked'))) {
                    //         Meteor.call('sendEmail', {
                    //             from: "" + mailFromName + " <" + mailFrom + ">",
                    //             to: mailFrom,
                    //             subject: mailSubject,
                    //             text: '',
                    //             html: htmlmailBody,
                    //             attachments: attachment
                    //         }, function (error, result) {
                    //             if (error && error.error === "error") {
                    //                 FlowRouter.go('/billlist?success=true');
                    //             } else {
                    //                 $('#html-2-pdfwrapper').css('display', 'none');
                    //                 swal({
                    //                     title: 'SUCCESS',
                    //                     text: "Email Sent To User: " + mailFrom + " ",
                    //                     type: 'success',
                    //                     showCancelButton: false,
                    //                     confirmButtonText: 'OK'
                    //                 }).then((result) => {
                    //                     if (result.value) {
                    //                         if (FlowRouter.current().queryParams.trans) {
                    //                             FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                    //                         } else {
                    //                             FlowRouter.go('/billlist?success=true');
                    //                         };
                    //                     } else if (result.dismiss === 'cancel') {

                    //                     }
                    //                 });

                    //                 LoadingOverlay.hide();
                    //             }
                    //         });

                    //         let values = [];
                    //         let basedOnTypeStorages = Object.keys(localStorage);
                    //         basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
                    //             let employeeId = storage.split('_')[2];
                    //             return storage.includes('BasedOnType_');
                    //             // return storage.includes('BasedOnType_') && employeeId == localStorage.getItem('mySessionEmployeeLoggedID')
                    //         });
                    //         let i = basedOnTypeStorages.length;
                    //         if (i > 0) {
                    //             while (i--) {
                    //                 values.push(localStorage.getItem(basedOnTypeStorages[i]));
                    //             }
                    //         }
                    //         values.forEach(value => {
                    //             let reportData = JSON.parse(value);
                    //             reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                    //             reportData.attachments = attachment;
                    //             if (reportData.BasedOnType.includes("S")) {
                    //                 if (reportData.FormID == 1) {
                    //                     let formIds = reportData.FormIDs.split(',');
                    //                     if (formIds.includes("12")) {
                    //                         reportData.FormID = 12;
                    //                         Meteor.call('sendNormalEmail', reportData);
                    //                     }
                    //                 } else {
                    //                     if (reportData.FormID == 12)
                    //                         Meteor.call('sendNormalEmail', reportData);
                    //                 }
                    //             }
                    //         });

                    //     } else {


                    //         let values = [];
                    //         let basedOnTypeStorages = Object.keys(localStorage);
                    //         basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
                    //             let employeeId = storage.split('_')[2];
                    //             return storage.includes('BasedOnType_');
                    //             // return storage.includes('BasedOnType_') && employeeId == localStorage.getItem('mySessionEmployeeLoggedID')
                    //         });
                    //         let i = basedOnTypeStorages.length;
                    //         if (i > 0) {
                    //             while (i--) {
                    //                 values.push(localStorage.getItem(basedOnTypeStorages[i]));
                    //             }
                    //         }
                    //         values.forEach(value => {
                    //             let reportData = JSON.parse(value);
                    //             reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                    //             reportData.attachments = attachment;
                    //             if (reportData.BasedOnType.includes("S")) {
                    //                 if (reportData.FormID == 1) {
                    //                     let formIds = reportData.FormIDs.split(',');
                    //                     if (formIds.includes("12")) {
                    //                         reportData.FormID = 12;
                    //                         Meteor.call('sendNormalEmail', reportData);
                    //                     }
                    //                 } else {
                    //                     if (reportData.FormID == 12)
                    //                         Meteor.call('sendNormalEmail', reportData);
                    //                 }
                    //             }
                    //         });
                    //         if (FlowRouter.current().queryParams.trans) {
                    //             FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                    //         } else {
                    //             FlowRouter.go('/billlist?success=true');
                    //         };
                    //     };

                    // }
                    // addAttachment();
                    var htmlmailBody = generateHtmlMailBody(objDetails.fields.ID || '') 
                    addAttachment("Bill", "Customer", objDetails.fields.ID || '', htmlmailBody, 'billlist', 12,  'html-2-pdfwrapper', '', true)

                    // function generatePdfForMail(invoiceId) {
                    //     let file = "Bill-" + invoiceId + ".pdf"
                    //     return new Promise((resolve, reject) => {
                    //         let completeTabRecord;
                    //         let doc = new jsPDF('p', 'pt', 'a4');
                    //         var source = document.getElementById('html-2-pdfwrapper');
                    //         var opt = {
                    //             margin: 0,
                    //             filename: file,
                    //             image: {
                    //                 type: 'jpeg',
                    //                 quality: 0.98
                    //             },
                    //             html2canvas: {
                    //                 scale: 2
                    //             },
                    //             jsPDF: {
                    //                 unit: 'in',
                    //                 format: 'a4',
                    //                 orientation: 'portrait'
                    //             }
                    //         }
                    //         resolve(html2pdf().set(opt).from(source).toPdf().output('datauristring'));

                    //     });
                    // }
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
                    LoadingOverlay.hide();
                });
            }
        }, delayTimeAfterSound);

    }
});

Template.billcard_temp.helpers({
    oneExAPIName: function () {
        let purchaseBoardService = new PurchaseBoardService();
        return purchaseBoardService.getOneBilldataEx;
    },

    service: () => {
        let purchaseBoardService = new PurchaseBoardService();
        return purchaseBoardService;
    },

    listapiservice: function () {
        return sideBarService
    },

    listapifunction: function () {
        return sideBarService.getAllBillListData
    },

    setTransData: () => {
        let templateObject = Template.instance();
        return function (data) {
            let dataReturn = templateObject.setOneBillData(data)
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

    printOptions: () => {
        return Template.instance().printOptions.get()
    },

    footerFields: function () {
        return Template.instance().tranasctionfooterfields.get()
    },

    saveTransaction: function () {
        let templateObject = Template.instance();
        return function (data) {
            templateObject.saveBills(data)
        }
    },

    getTemplateList: function () {
        return template_list;
    },
    getTemplateNumber: function () {
        let template_numbers = ["1", "2", "3"];
        return template_numbers;
    },
    billrecord: () => {
        return Template.instance().billrecord.get();
    },

    supplierRecord: () => {
        return Template.instance().supplierRecord.get();
    },

    // deptrecords: () => {
    //     return Template.instance().deptrecords.get().sort(function (a, b) {
    //         if (a.department == 'NA') {
    //             return 1;
    //         } else if (b.department == 'NA') {
    //             return -1;
    //         }
    //         return (a.department.toUpperCase() > b.department.toUpperCase()) ? 1 : -1;
    //     });
    // },
    viarecords: () => {
        return Template.instance().viarecords.get().sort(function (a, b) {
            if (a.shippingmethod == 'NA') {
                return 1;
            } else if (b.shippingmethod == 'NA') {
                return -1;
            }
            return (a.shippingmethod.toUpperCase() > b.shippingmethod.toUpperCase()) ? 1 : -1;
        });
    },
    termrecords: () => {
        return Template.instance().termrecords.get().sort(function (a, b) {
            if (a.termsname == 'NA') {
                return 1;
            } else if (b.termsname == 'NA') {
                return -1;
            }
            return (a.termsname.toUpperCase() > b.termsname.toUpperCase()) ? 1 : -1;
        });
    },
    clientrecords: () => {
        return Template.instance().clientrecords.get().sort(function (a, b) {
            if (a.suppliername == 'NA') {
                return 1;
            } else if (b.suppliername == 'NA') {
                return -1;
            }
            return (a.suppliername.toUpperCase() > b.suppliername.toUpperCase()) ? 1 : -1;
        });
    },
    purchaseCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: localStorage.getItem('mycloudLogonID'),
            PrefName: 'billcard'
        });
    },
    purchaseCloudGridPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: localStorage.getItem('mycloudLogonID'),
            PrefName: 'tblBillLine'
        });
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
    // statusrecords: () => {
    //     return Template.instance().statusrecords.get().sort(function (a, b) {
    //         if (a.orderstatus == 'NA') {
    //             return 1;
    //         } else if (b.orderstatus == 'NA') {
    //             return -1;
    //         }
    //         return (a.orderstatus.toUpperCase() > b.orderstatus.toUpperCase()) ? 1 : -1;
    //     });
    // },
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
        return "Phone: " + localStorage.getItem('vs1companyPhone');
    },
    companyabn: () => { //Update Company ABN
        let countryABNValue = localStorage.getItem("vs1companyABN");
        // if (LoggedCountry == "South Africa") {
        //     countryABNValue = "Vat No: " + localStorage.getItem("vs1companyABN");
        // }
        return countryABNValue;
    },
    companyReg: () => { //Add Company Reg
        let countryRegValue = '';
        if (LoggedCountry == "South Africa") {
            countryRegValue = "Reg No: " + localStorage.getItem('vs1companyReg');
        }

        return countryRegValue;
    },
    organizationname: () => {
        return localStorage.getItem('vs1companyName');
    },
    organizationurl: () => {
        return localStorage.getItem('vs1companyURL');
    },
    isMobileDevices: () => {
        var isMobile = false;

        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
            isMobile = true;
        }

        return isMobile;
    },

    // custom field displaysettings


    isForeignEnabled: () => {
        return Template.instance().isForeignEnabled.get();
    },
    getDefaultCurrency: () => {
        return defaultCurrencyCode;
    },

    isCurrencyEnable: () => FxGlobalFunctions.isCurrencyEnabled()
});

Template.billcard_temp.events({
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
    'click #btnCopyInvoice': function () {
        playCopyAudio();
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
            //     var billData = await purchaseService.getOneBilldataEx(currentInvoice);
            //     var selectedType = billData.fields.TypeOfBasedOn;
            //     var frequencyVal = billData.fields.FrequenctyValues;
            //     var startDate = billData.fields.CopyStartDate;
            //     var finishDate = billData.fields.CopyFinishDate;
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
    // 'click .btnSaveFrequency': async function () {
    //     playSaveAudio();
    //     // let selectedType = '';
    //     let selectedType = "basedOnFrequency";
    //     let frequencyVal = '';
    //     let startDate = '';
    //     let finishDate = '';
    //     let convertedStartDate = '';
    //     let convertedFinishDate = '';
    //     let sDate = '';
    //     let fDate = '';
    //     let monthDate = '';
    //     let ofMonths = '';
    //     let isFirst = true;
    //     let everyWeeks = '';
    //     let selectDays = '';
    //     let dailyRadioOption = '';
    //     let everyDays = '';

    //     // const basedOnTypes = $('#basedOnSettings input.basedOnSettings');
    //     let basedOnTypeTexts = '';
    //     // let basedOnTypeAttr = '';
    //     let basedOnTypeAttr = 'F,';
    //     var erpGet = erpDb();
    //     let sDate2 = '';
    //     let fDate2 = '';
    //     setTimeout(async function () {
    //         //   basedOnTypes.each(function () {
    //         //     if ($(this).prop('checked')) {
    //         //       selectedType = $(this).attr('id');
    //         //       if (selectedType === "basedOnFrequency") { basedOnTypeAttr += 'F,'}
    //         //       if (selectedType === "basedOnPrint") { basedOnTypeTexts += 'On Print, '; basedOnTypeAttr += 'P,'; }
    //         //       if (selectedType === "basedOnSave") { basedOnTypeTexts += 'On Save, '; basedOnTypeAttr += 'S,'; }
    //         //       if (selectedType === "basedOnTransactionDate") { basedOnTypeTexts += 'On Transaction Date, '; basedOnTypeAttr += 'T,'; }
    //         //       if (selectedType === "basedOnDueDate") { basedOnTypeTexts += 'On Due Date, '; basedOnTypeAttr += 'D,'; }
    //         //       if (selectedType === "basedOnOutstanding") { basedOnTypeTexts += 'If Outstanding, '; basedOnTypeAttr += 'O,'; }
    //         //       if (selectedType === "basedOnEvent") {
    //         //         if ($('#settingsOnEvents').prop('checked')) { basedOnTypeTexts += 'On Event(On Logon), '; basedOnTypeAttr += 'EN,'; }
    //         //         if ($('#settingsOnLogout').prop('checked')) { basedOnTypeTexts += 'On Event(On Logout), '; basedOnTypeAttr += 'EU,'; }
    //         //       }
    //         //     }
    //         //   });
    //         //   if (basedOnTypeTexts != '') basedOnTypeTexts = basedOnTypeTexts.slice(0, -2);
    //         //   if (basedOnTypeAttr != '') basedOnTypeAttr = basedOnTypeAttr.slice(0, -1);

    //         let formId = parseInt($("#formid").val());
    //         let radioFrequency = $('input[type=radio][name=frequencyRadio]:checked').attr('id');
    //         frequencyVal = radioFrequency + '@';
    //         const values = basedOnTypeAttr.split(',');
    //         if (values.includes('F')) {
    //             if (radioFrequency == "frequencyMonthly") {
    //                 isFirst = true;
    //                 monthDate = $("#sltDay").val().replace('day', '');
    //                 $(".ofMonthList input[type=checkbox]:checked").each(function () {
    //                     ofMonths += isFirst ? $(this).val() : ',' + $(this).val();
    //                     isFirst = false;
    //                 });
    //                 startDate = $('#edtMonthlyStartDate').val();
    //                 finishDate = $('#edtMonthlyFinishDate').val();
    //                 frequencyVal += monthDate + '@' + ofMonths;
    //             } else if (radioFrequency == "frequencyWeekly") {
    //                 isFirst = true;
    //                 everyWeeks = $("#weeklyEveryXWeeks").val();
    //                 let sDay = -1;
    //                 $(".selectDays input[type=checkbox]:checked").each(function () {
    //                     sDay = templateObject.getDayNumber($(this).val());
    //                     selectDays += isFirst ? sDay : ',' + sDay;
    //                     isFirst = false;
    //                 });
    //                 startDate = $('#edtWeeklyStartDate').val();
    //                 finishDate = $('#edtWeeklyFinishDate').val();
    //                 frequencyVal += everyWeeks + '@' + selectDays;
    //             } else if (radioFrequency == "frequencyDaily") {
    //                 dailyRadioOption = $('#dailySettings input[type=radio]:checked').attr('id');
    //                 everyDays = $("#dailyEveryXDays").val();
    //                 startDate = $('#edtDailyStartDate').val();
    //                 finishDate = $('#edtDailyFinishDate').val();
    //                 frequencyVal += dailyRadioOption + '@' + everyDays;
    //             } else if (radioFrequency == "frequencyOnetimeonly") {
    //                 startDate = $('#edtOneTimeOnlyDate').val();
    //                 finishDate = $('#edtOneTimeOnlyDate').val();
    //                 $('#edtOneTimeOnlyTimeError').css('display', 'none');
    //                 $('#edtOneTimeOnlyDateError').css('display', 'none');
    //                 frequencyVal = radioFrequency;
    //             }
    //         }
    //         $('#copyFrequencyModal').modal('toggle');
    //         convertedStartDate = startDate ? startDate.split('/')[2] + '-' + startDate.split('/')[1] + '-' + startDate.split('/')[0] : '';
    //         convertedFinishDate = finishDate ? finishDate.split('/')[2] + '-' + finishDate.split('/')[1] + '-' + finishDate.split('/')[0] : '';
    //         sDate = convertedStartDate ? moment(convertedStartDate + ' ' + copyStartTime).format("YYYY-MM-DD HH:mm") : moment().format("YYYY-MM-DD HH:mm");
    //         fDate = convertedFinishDate ? moment(convertedFinishDate + ' ' + copyStartTime).format("YYYY-MM-DD HH:mm") : moment().format("YYYY-MM-DD HH:mm");
    //         sDate2 = convertedStartDate ? moment(convertedStartDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
    //         fDate2 = convertedFinishDate ? moment(convertedFinishDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
    //         $(".fullScreenSpin").css("display", "inline-block");
    //         var url = FlowRouter.current().path;
    //         if (
    //             url.indexOf("?id=")
    //         ) {
    //             var getso_id = url.split("?id=");
    //             var currentInvoice = getso_id[getso_id.length - 1];
    //             if (getso_id[1]) {
    //                 currentInvoice = parseInt(currentInvoice);
    //                 //   objDetails = {
    //                 //     type: "TBillEx",
    //                 //     fields: {
    //                 //       ID: currentInvoice,
    //                 //       TypeOfBasedOn: selectedType,
    //                 //       FrequenctyValues: frequencyVal,
    //                 //       CopyStartDate: sDate2,
    //                 //       CopyFinishDate: fDate2,
    //                 //     }
    //                 //   };
    //                 //   var result = await purchaseService.saveBillEx(objDetails);
    //                 let period = ""; // 0
    //                 let days = [];
    //                 let i = 0;
    //                 let frequency2 = 0;
    //                 let weekdayObj = {
    //                     saturday: 0,
    //                     sunday: 0,
    //                     monday: 0,
    //                     tuesday: 0,
    //                     wednesday: 0,
    //                     thursday: 0,
    //                     friday: 0,
    //                 };
    //                 let repeatMonths = [];
    //                 let repeatDates = [];
    //                 if (radioFrequency == "frequencyDaily" || radioFrequency == "frequencyOnetimeonly") {
    //                     period = "Daily"; // 0
    //                     if (radioFrequency == "frequencyDaily") {
    //                         frequency2 = parseInt(everyDays);
    //                         if (dailyRadioOption == "dailyEveryDay") {
    //                             for (i = 0; i < 7; i++) {
    //                                 days.push(i);
    //                             }
    //                         }
    //                         if (dailyRadioOption == "dailyWeekdays") {
    //                             for (i = 1; i < 6; i++) {
    //                                 days.push(i);
    //                             }
    //                         }
    //                         if (dailyRadioOption == "dailyEvery") {

    //                         }
    //                     } else {
    //                         repeatDates.push({
    //                             "Dates": sDate2
    //                         })
    //                         frequency2 = 1;
    //                     }
    //                 }
    //                 if (radioFrequency == "frequencyWeekly") {
    //                     period = "Weekly"; // 1
    //                     frequency2 = parseInt(everyWeeks);
    //                     let arrSelectDays = selectDays.split(",");
    //                     for (i = 0; i < arrSelectDays.length; i++) {
    //                         days.push(arrSelectDays[i]);
    //                         if (parseInt(arrSelectDays[i]) == 0)
    //                             weekdayObj.sunday = 1;
    //                         if (parseInt(arrSelectDays[i]) == 1)
    //                             weekdayObj.monday = 1;
    //                         if (parseInt(arrSelectDays[i]) == 2)
    //                             weekdayObj.tuesday = 1;
    //                         if (parseInt(arrSelectDays[i]) == 3)
    //                             weekdayObj.wednesday = 1;
    //                         if (parseInt(arrSelectDays[i]) == 4)
    //                             weekdayObj.thursday = 1;
    //                         if (parseInt(arrSelectDays[i]) == 5)
    //                             weekdayObj.friday = 1;
    //                         if (parseInt(arrSelectDays[i]) == 6)
    //                             weekdayObj.saturday = 1;
    //                     }
    //                 }
    //                 if (radioFrequency == "frequencyMonthly") {
    //                     period = "Monthly"; // 0
    //                     repeatMonths = convertStrMonthToNum(ofMonths);
    //                     repeatDates = getRepeatDates(sDate2, fDate2, repeatMonths, monthDate);
    //                     frequency2 = parseInt(monthDate);
    //                 }
    //                 if (days.length > 0) {
    //                     for (let x = 0; x < days.length; x++) {
    //                         let dayObj = {
    //                             Name: "VS1_RepeatTrans",
    //                             Params: {
    //                                 CloudUserName: erpGet.ERPUsername,
    //                                 CloudPassword: erpGet.ERPPassword,
    //                                 TransID: currentInvoice,
    //                                 TransType: "Bill",
    //                                 Repeat_Frequency: frequency2,
    //                                 Repeat_Period: period,
    //                                 Repeat_BaseDate: sDate2,
    //                                 Repeat_finalDateDate: fDate2,
    //                                 Repeat_Saturday: weekdayObj.saturday,
    //                                 Repeat_Sunday: weekdayObj.sunday,
    //                                 Repeat_Monday: weekdayObj.monday,
    //                                 Repeat_Tuesday: weekdayObj.tuesday,
    //                                 Repeat_Wednesday: weekdayObj.wednesday,
    //                                 Repeat_Thursday: weekdayObj.thursday,
    //                                 Repeat_Friday: weekdayObj.friday,
    //                                 Repeat_Holiday: 0,
    //                                 Repeat_Weekday: parseInt(days[x].toString()),
    //                                 Repeat_MonthOffset: 0,
    //                             },
    //                         };
    //                         var myString = '"JsonIn"' + ":" + JSON.stringify(dayObj);
    //                         var oPost = new XMLHttpRequest();
    //                         oPost.open(
    //                             "POST",
    //                             URLRequest +
    //                             erpGet.ERPIPAddress +
    //                             ":" +
    //                             erpGet.ERPPort +
    //                             "/" +
    //                             'erpapi/VS1_Cloud_Task/Method?Name="VS1_RepeatTrans"',
    //                             true
    //                         );
    //                         oPost.setRequestHeader("database", erpGet.ERPDatabase);
    //                         oPost.setRequestHeader("username", erpGet.ERPUsername);
    //                         oPost.setRequestHeader("password", erpGet.ERPPassword);
    //                         oPost.setRequestHeader("Accept", "application/json");
    //                         oPost.setRequestHeader("Accept", "application/html");
    //                         oPost.setRequestHeader("Content-type", "application/json");
    //                         oPost.send(myString);

    //                         oPost.onreadystatechange = function () {
    //                             if (oPost.readyState == 4 && oPost.status == 200) {
    //                                 var myArrResponse = JSON.parse(oPost.responseText);
    //                                 var success = myArrResponse.ProcessLog.ResponseStatus.includes("OK");
    //                             } else if (oPost.readyState == 4 && oPost.status == 403) {

    //                             } else if (oPost.readyState == 4 && oPost.status == 406) {

    //                             } else if (oPost.readyState == "") {

    //                             }
    //                             $(".fullScreenSpin").css("display", "none");
    //                         };
    //                     }
    //                 } else {
    //                     let dayObj = {};
    //                     if (radioFrequency == "frequencyOnetimeonly" || radioFrequency == "frequencyMonthly") {
    //                         dayObj = {
    //                             Name: "VS1_RepeatTrans",
    //                             Params: {
    //                                 CloudUserName: erpGet.ERPUsername,
    //                                 CloudPassword: erpGet.ERPPassword,
    //                                 TransID: currentInvoice,
    //                                 TransType: "Bill",
    //                                 Repeat_Dates: repeatDates,
    //                                 Repeat_Frequency: frequency2,
    //                                 Repeat_Period: period,
    //                                 Repeat_BaseDate: sDate2,
    //                                 Repeat_finalDateDate: fDate2,
    //                                 Repeat_Saturday: weekdayObj.saturday,
    //                                 Repeat_Sunday: weekdayObj.sunday,
    //                                 Repeat_Monday: weekdayObj.monday,
    //                                 Repeat_Tuesday: weekdayObj.tuesday,
    //                                 Repeat_Wednesday: weekdayObj.wednesday,
    //                                 Repeat_Thursday: weekdayObj.thursday,
    //                                 Repeat_Friday: weekdayObj.friday,
    //                                 Repeat_Holiday: 0,
    //                                 Repeat_Weekday: 0,
    //                                 Repeat_MonthOffset: 0,
    //                             },
    //                         };
    //                     } else {
    //                         dayObj = {
    //                             Name: "VS1_RepeatTrans",
    //                             Params: {
    //                                 CloudUserName: erpGet.ERPUsername,
    //                                 CloudPassword: erpGet.ERPPassword,
    //                                 TransID: currentInvoice,
    //                                 TransType: "Bill",
    //                                 Repeat_Frequency: frequency2,
    //                                 Repeat_Period: period,
    //                                 Repeat_BaseDate: sDate2,
    //                                 Repeat_finalDateDate: fDate2,
    //                                 Repeat_Saturday: weekdayObj.saturday,
    //                                 Repeat_Sunday: weekdayObj.sunday,
    //                                 Repeat_Monday: weekdayObj.monday,
    //                                 Repeat_Tuesday: weekdayObj.tuesday,
    //                                 Repeat_Wednesday: weekdayObj.wednesday,
    //                                 Repeat_Thursday: weekdayObj.thursday,
    //                                 Repeat_Friday: weekdayObj.friday,
    //                                 Repeat_Holiday: 0,
    //                                 Repeat_Weekday: 0,
    //                                 Repeat_MonthOffset: 0,
    //                             },
    //                         };
    //                     }
    //                     var myString = '"JsonIn"' + ":" + JSON.stringify(dayObj);
    //                     var oPost = new XMLHttpRequest();
    //                     oPost.open(
    //                         "POST",
    //                         URLRequest +
    //                         erpGet.ERPIPAddress +
    //                         ":" +
    //                         erpGet.ERPPort +
    //                         "/" +
    //                         'erpapi/VS1_Cloud_Task/Method?Name="VS1_RepeatTrans"',
    //                         true
    //                     );
    //                     oPost.setRequestHeader("database", erpGet.ERPDatabase);
    //                     oPost.setRequestHeader("username", erpGet.ERPUsername);
    //                     oPost.setRequestHeader("password", erpGet.ERPPassword);
    //                     oPost.setRequestHeader("Accept", "application/json");
    //                     oPost.setRequestHeader("Accept", "application/html");
    //                     oPost.setRequestHeader("Content-type", "application/json");
    //                     // let objDataSave = '"JsonIn"' + ':' + JSON.stringify(selectClient);
    //                     oPost.send(myString);

    //                     oPost.onreadystatechange = function () {
    //                         if (oPost.readyState == 4 && oPost.status == 200) {
    //                             var myArrResponse = JSON.parse(oPost.responseText);
    //                             var success = myArrResponse.ProcessLog.ResponseStatus.includes("OK");
    //                         } else if (oPost.readyState == 4 && oPost.status == 403) {

    //                         } else if (oPost.readyState == 4 && oPost.status == 406) {

    //                         } else if (oPost.readyState == "") {

    //                         }
    //                         $(".fullScreenSpin").css("display", "none");
    //                     };
    //                 }
    //             }
    //         } else {
    //             // window.open("/invoicecard", "_self");
    //         }
    //         FlowRouter.go('/billlist?success=true');
    //         $('.modal-backdrop').css('display', 'none');
    //     }, delayTimeAfterSound);
    // },
    // 'click #sltTerms': function(event) {
    //     $('#termsListModal').modal('toggle');
    // },
    // 'click .sltCurrency': function(event) {
    //     $('#currencyModal').modal('toggle');
    // },
    // 'click #sltDept': function(event) {
    //     $('#departmentModal').modal('toggle');
    // },
    // 'click #sltStatus': function(event) {
    //     $('#statusPopModal').modal('toggle');
    // },
    'click #edtSupplierName': function (event) {
        $('#edtSupplierName').select();
        $('#edtSupplierName').editableSelect();
    },
    // 'click .th.colAmountEx': function (event) {
    //     $('.colAmountEx').addClass('hiddenColumn');
    //     $('.colAmountEx').removeClass('showColumn');

    //     $('.colAmountInc').addClass('showColumn');
    //     $('.colAmountInc').removeClass('hiddenColumn');

    //     $('.chkAmountEx').prop("checked", false);
    //     $('.chkAmountInc').prop("checked", true);
    // },
    // 'click .th.colAmountInc': function (event) {
    //     $('.colAmountInc').addClass('hiddenColumn');
    //     $('.colAmountInc').removeClass('showColumn');

    //     $('.colAmountEx').addClass('showColumn');
    //     $('.colAmountEx').removeClass('hiddenColumn');

    //     $('.chkAmountEx').prop("checked", true);
    //     $('.chkAmountInc').prop("checked", false);
    // },
    'change #sltStatus': function () {
        let status = $('#sltStatus').find(":selected").val();
        if (status == "newstatus") {
            $('#statusModal').modal();
        }
    },
    'blur .lineMemo': function (event) {
        var targetID = $(event.target).closest('tr').attr('id');
        $('#' + targetID + " #lineMemo").text($('#' + targetID + " .lineMemo").text());
    },
    'blur .colAmountExChange': function (event) {
        let taxcodeList = templateObject.taxraterecords.get();
        let utilityService = new UtilityService();
        var targetID = $(event.target).closest('tr').attr('id');
        if (!isNaN($(event.target).val())) {
            let inputUnitPrice = parseFloat($(event.target).val()) || 0;
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));
        } else {
            let inputUnitPrice = Number($(event.target).val().replace(/[^0-9.-]+/g, "")) || 0;

            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));


        }
        let $tblrows = $("#tblBillLine tbody tr");
        let $printrows = $(".bill_print tbody tr");

        if ($('.printID').val() == "") {
            $('#' + targetID + " #lineAmount").text($('#' + targetID + " .colAmountExChange").val());
            $('#' + targetID + " #lineTaxCode").text($('#' + targetID + " .lineTaxCode").val());

        }

        let lineAmount = 0;
        let subGrandTotal = 0;
        let taxGrandTotal = 0;
        let taxGrandTotalPrint = 0;

        $tblrows.each(function (index) {
            var $tblrow = $(this);
            var amount = $tblrow.find(".colAmountExChange").val() || "0";
            var taxcode = $tblrow.find(".lineTaxCode").val() || 0;
            var taxrateamount = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == taxcode) {
                        taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                    }
                }
            }


            var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
            var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount) || 0;
            $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
            if (!isNaN(subTotal)) {
                $tblrow.find('.colAmountExChange').val(utilityService.modifynegativeCurrencyFormat(subTotal.toFixed(2)));
                let totalAmountInc = (parseFloat(subTotal)) + (parseFloat(taxTotal)) || 0;
                $tblrow.find('.colAmountIncChange').val(utilityService.modifynegativeCurrencyFormat(totalAmountInc.toFixed(2)));
                subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal.toFixed(2));
            }

            if (!isNaN(taxTotal)) {
                taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
                document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal.toFixed(2));
            }


            if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));

            }
        });

        if ($(".printID").val() == "") {
            $printrows.each(function (index) {
                var $printrow = $(this);
                var amount = $printrow.find("#lineAmount").text() || "0";
                var taxcode = $printrow.find("#lineTaxCode").text() || "E";

                var taxrateamount = 0;
                if (taxcodeList) {
                    for (var i = 0; i < taxcodeList.length; i++) {
                        if (taxcodeList[i].codename == taxcode) {
                            taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100 || 0;
                        }
                    }
                }
                var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
                var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                $printrow.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
                if (!isNaN(subTotal)) {
                    $printrow.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                    subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                    document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
                }

                if (!isNaN(taxTotal)) {
                    taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
                }
                if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                    let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                    document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
                    //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                    document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

                }
            });
        }



    },
    'blur .colAmountIncChange': function (event) {
        let taxcodeList = templateObject.taxraterecords.get();
        let utilityService = new UtilityService();
        var targetID = $(event.target).closest('tr').attr('id');
        if (!isNaN($(event.target).val())) {
            let inputUnitPrice = parseFloat($(event.target).val()) || 0;
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));
        } else {
            let inputUnitPrice = Number($(event.target).val().replace(/[^0-9.-]+/g, "")) || 0;

            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));


        }
        let $tblrows = $("#tblBillLine tbody tr");
        let $printrows = $(".bill_print tbody tr");

        let lineAmount = 0;
        let subGrandTotal = 0;
        let taxGrandTotal = 0;
        let taxGrandTotalPrint = 0;

        $tblrows.each(function (index) {
            var $tblrow = $(this);
            var amount = $tblrow.find(".colAmountIncChange").val() || "0";
            var taxcode = $tblrow.find(".lineTaxCode").val() || 0;
            var taxrateamount = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == taxcode) {
                        taxrateamount = taxcodeList[i].coderate.replace('%', "");
                    }
                }
            }

            let taxRateAmountCalc = (parseFloat(taxrateamount) + 100) / 100;
            var subTotal = (parseFloat(amount.replace(/[^0-9.-]+/g, "")) / (taxRateAmountCalc)) || 0;
            var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) - parseFloat(subTotal) || 0;
            $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
            if (!isNaN(subTotal)) {
                $tblrow.find('.colAmountExChange').val(utilityService.modifynegativeCurrencyFormat(subTotal.toFixed(2)));
                let totalAmountInc = (parseFloat(subTotal)) + (parseFloat(taxTotal)) || 0;
                $tblrow.find('.colAmountIncChange').val(utilityService.modifynegativeCurrencyFormat(totalAmountInc.toFixed(2)));
                subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal.toFixed(2));
            }

            if (!isNaN(taxTotal)) {
                taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
                document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal.toFixed(2));
            }


            if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));

            }
        });

        if ($(".printID").val() == "") {
            $printrows.each(function (index) {
                var $printrow = $(this);
                var amount = $printrow.find("#lineAmount").text() || "0";
                var taxcode = $printrow.find("#lineTaxCode").text() || "E";

                var taxrateamount = 0;
                if (taxcodeList) {
                    for (var i = 0; i < taxcodeList.length; i++) {
                        if (taxcodeList[i].codename == taxcode) {
                            taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100 || 0;
                        }
                    }
                }
                var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
                var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                $printrow.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
                if (!isNaN(subTotal)) {
                    $printrow.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                    subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                    document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
                }

                if (!isNaN(taxTotal)) {
                    taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
                }
                if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                    let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                    document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
                    //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                    document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

                }
            });
        }



    },
    // 'click #btnCustomFileds': function (event) {
    //     var x = document.getElementById("divCustomFields");
    //     if (x.style.display === "none") {
    //         x.style.display = "block";
    //     } else {
    //         x.style.display = "none";
    //     }
    // },
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
        } else {
            var accountDataName = $(event.target).val() || '';
            if (event.pageX > offset.left + $earch.width() - 10) { // X button 16px wide?
                $('#accountListModal').modal('toggle');
                var targetID = $(event.target).closest('tr').attr('id');
                $('#selectLineID').val(targetID);
                setTimeout(function () {
                    $('#tblAccount_filter .form-control-sm').focus();
                    $('#tblAccount_filter .form-control-sm').val('');
                    $('#tblAccount_filter .form-control-sm').trigger("input");

                    var datatable = $('#tblInventory').DataTable();
                    datatable.draw();
                    $('#tblAccount_filter .form-control-sm').trigger("input");

                }, 500);
            } else {
                if (accountDataName.replace(/\s/g, '') != '') {
                    //$('#edtAccountID').val($(event.target).text());

                    getVS1Data('TAccountVS1').then(function (dataObject) {
                        if (dataObject.length == 0) {
                            accountService.getOneAccountByName(accountDataName).then(function (data) {
                                let lineItems = [];
                                let lineItemObj = {};
                                let fullAccountTypeName = '';
                                let accBalance = '';
                                $('#add-account-title').text('Edit Account Details');
                                $('#edtAccountName').attr('readonly', true);
                                $('#sltAccountType').attr('readonly', true);
                                $('#sltAccountType').attr('disabled', 'disabled');
                                if (accountTypeList) {
                                    for (var h = 0; h < accountTypeList.length; h++) {

                                        if (data.taccountvs1[0].fields.AccountTypeName === accountTypeList[h].accounttypename) {

                                            fullAccountTypeName = accountTypeList[h].description || '';

                                        }
                                    }

                                }

                                $('#add-account-title').text('Edit Account Details');
                                $('#edtAccountName').attr('readonly', true);
                                $('#sltAccountType').attr('readonly', true);
                                $('#sltAccountType').attr('disabled', 'disabled');

                                var accountid = data.taccountvs1[0].fields.ID || '';
                                var accounttype = fullAccountTypeName || data.taccountvs1[0].fields.AccountTypeName;
                                var accountname = data.taccountvs1[0].fields.AccountName || '';
                                var accountno = data.taccountvs1[0].fields.AccountNumber || '';
                                var taxcode = data.taccountvs1[0].fields.TaxCode || '';
                                var accountdesc = data.taccountvs1[0].fields.Description || '';
                                var bankaccountname = data.taccountvs1[0].fields.BankAccountName || '';
                                var bankbsb = data.taccountvs1[0].fields.BSB || '';
                                var bankacountno = data.taccountvs1[0].fields.BankAccountNumber || '';

                                var swiftCode = data.taccountvs1[0].fields.Extra || '';
                                var routingNo = data.taccountvs1[0].fields.BankCode || '';

                                var showTrans = data.taccountvs1[0].fields.IsHeader || false;

                                var cardnumber = data.taccountvs1[0].fields.CarNumber || '';
                                var cardcvc = data.taccountvs1[0].fields.CVC || '';
                                var cardexpiry = data.taccountvs1[0].fields.ExpiryDate || '';

                                if ((accounttype === "BANK")) {
                                    $('.isBankAccount').removeClass('isNotBankAccount');
                                    $('.isCreditAccount').addClass('isNotCreditAccount');
                                } else if ((accounttype === "CCARD")) {
                                    $('.isCreditAccount').removeClass('isNotCreditAccount');
                                    $('.isBankAccount').addClass('isNotBankAccount');
                                } else {
                                    $('.isBankAccount').addClass('isNotBankAccount');
                                    $('.isCreditAccount').addClass('isNotCreditAccount');
                                }

                                $('#edtAccountID').val(accountid);
                                $('#sltAccountType').val(accounttype);
                                $('#sltAccountType').append('<option value="' + accounttype + '" selected="selected">' + accounttype + '</option>');
                                $('#edtAccountName').val(accountname);
                                $('#edtAccountNo').val(accountno);
                                $('#sltTaxCode').val(taxcode);
                                $('#txaAccountDescription').val(accountdesc);
                                $('#edtBankAccountName').val(bankaccountname);
                                $('#edtBSB').val(bankbsb);
                                $('#edtBankAccountNo').val(bankacountno);
                                $('#swiftCode').val(swiftCode);
                                $('#routingNo').val(routingNo);
                                $('#edtBankName').val(localStorage.getItem('vs1companyBankName') || '');

                                $('#edtCardNumber').val(cardnumber);
                                $('#edtExpiryDate').val(cardexpiry ? moment(cardexpiry).format('DD/MM/YYYY') : "");
                                $('#edtCvc').val(cardcvc);

                                if (showTrans == 'true') {
                                    $('.showOnTransactions').prop('checked', true);
                                } else {
                                    $('.showOnTransactions').prop('checked', false);
                                }

                                setTimeout(function () {
                                    $('#addNewAccount').modal('show');
                                }, 500);

                            }).catch(function (err) {
                                LoadingOverlay.hide();
                            });
                        } else {
                            let data = JSON.parse(dataObject[0].data);
                            let useData = data.taccountvs1;
                            var added = false;
                            let lineItems = [];
                            let lineItemObj = {};
                            let fullAccountTypeName = '';
                            let accBalance = '';
                            $('#add-account-title').text('Edit Account Details');
                            $('#edtAccountName').attr('readonly', true);
                            $('#sltAccountType').attr('readonly', true);
                            $('#sltAccountType').attr('disabled', 'disabled');
                            for (let a = 0; a < data.taccountvs1.length; a++) {

                                if ((data.taccountvs1[a].fields.AccountName) === accountDataName) {
                                    added = true;
                                    if (accountTypeList) {
                                        for (var h = 0; h < accountTypeList.length; h++) {

                                            if (data.taccountvs1[a].fields.AccountTypeName === accountTypeList[h].accounttypename) {

                                                fullAccountTypeName = accountTypeList[h].description || '';

                                            }
                                        }

                                    }



                                    var accountid = data.taccountvs1[a].fields.ID || '';
                                    var accounttype = fullAccountTypeName || data.taccountvs1[a].fields.AccountTypeName;
                                    var accountname = data.taccountvs1[a].fields.AccountName || '';
                                    var accountno = data.taccountvs1[a].fields.AccountNumber || '';
                                    var taxcode = data.taccountvs1[a].fields.TaxCode || '';
                                    var accountdesc = data.taccountvs1[a].fields.Description || '';
                                    var bankaccountname = data.taccountvs1[a].fields.BankAccountName || '';
                                    var bankbsb = data.taccountvs1[a].fields.BSB || '';
                                    var bankacountno = data.taccountvs1[a].fields.BankAccountNumber || '';

                                    var swiftCode = data.taccountvs1[a].fields.Extra || '';
                                    var routingNo = data.taccountvs1[a].BankCode || '';

                                    var showTrans = data.taccountvs1[a].fields.IsHeader || false;

                                    var cardnumber = data.taccountvs1[a].fields.CarNumber || '';
                                    var cardcvc = data.taccountvs1[a].fields.CVC || '';
                                    var cardexpiry = data.taccountvs1[a].fields.ExpiryDate || '';

                                    if ((accounttype === "BANK")) {
                                        $('.isBankAccount').removeClass('isNotBankAccount');
                                        $('.isCreditAccount').addClass('isNotCreditAccount');
                                    } else if ((accounttype === "CCARD")) {
                                        $('.isCreditAccount').removeClass('isNotCreditAccount');
                                        $('.isBankAccount').addClass('isNotBankAccount');
                                    } else {
                                        $('.isBankAccount').addClass('isNotBankAccount');
                                        $('.isCreditAccount').addClass('isNotCreditAccount');
                                    }

                                    $('#edtAccountID').val(accountid);
                                    $('#sltAccountType').val(accounttype);
                                    $('#sltAccountType').append('<option value="' + accounttype + '" selected="selected">' + accounttype + '</option>');
                                    $('#edtAccountName').val(accountname);
                                    $('#edtAccountNo').val(accountno);
                                    $('#sltTaxCode').val(taxcode);
                                    $('#txaAccountDescription').val(accountdesc);
                                    $('#edtBankAccountName').val(bankaccountname);
                                    $('#edtBSB').val(bankbsb);
                                    $('#edtBankAccountNo').val(bankacountno);
                                    $('#swiftCode').val(swiftCode);
                                    $('#routingNo').val(routingNo);
                                    $('#edtBankName').val(localStorage.getItem('vs1companyBankName') || '');

                                    $('#edtCardNumber').val(cardnumber);
                                    $('#edtExpiryDate').val(cardexpiry ? moment(cardexpiry).format('DD/MM/YYYY') : "");
                                    $('#edtCvc').val(cardcvc);

                                    if (showTrans == 'true') {
                                        $('.showOnTransactions').prop('checked', true);
                                    } else {
                                        $('.showOnTransactions').prop('checked', false);
                                    }

                                    setTimeout(function () {
                                        $('#addNewAccount').modal('show');
                                    }, 500);

                                }
                            }
                            if (!added) {
                                accountService.getOneAccountByName(accountDataName).then(function (data) {
                                    let lineItems = [];
                                    let lineItemObj = {};
                                    let fullAccountTypeName = '';
                                    let accBalance = '';
                                    $('#add-account-title').text('Edit Account Details');
                                    $('#edtAccountName').attr('readonly', true);
                                    $('#sltAccountType').attr('readonly', true);
                                    $('#sltAccountType').attr('disabled', 'disabled');
                                    if (accountTypeList) {
                                        for (var h = 0; h < accountTypeList.length; h++) {

                                            if (data.taccountvs1[0].fields.AccountTypeName === accountTypeList[h].accounttypename) {

                                                fullAccountTypeName = accountTypeList[h].description || '';

                                            }
                                        }

                                    }

                                    var accountid = data.taccountvs1[0].fields.ID || '';
                                    var accounttype = fullAccountTypeName || data.taccountvs1[0].fields.AccountTypeName;
                                    var accountname = data.taccountvs1[0].fields.AccountName || '';
                                    var accountno = data.taccountvs1[0].fields.AccountNumber || '';
                                    var taxcode = data.taccountvs1[0].fields.TaxCode || '';
                                    var accountdesc = data.taccountvs1[0].fields.Description || '';
                                    var bankaccountname = data.taccountvs1[0].fields.BankAccountName || '';
                                    var bankbsb = data.taccountvs1[0].fields.BSB || '';
                                    var bankacountno = data.taccountvs1[0].fields.BankAccountNumber || '';

                                    var swiftCode = data.taccountvs1[0].fields.Extra || '';
                                    var routingNo = data.taccountvs1[0].fields.BankCode || '';

                                    var showTrans = data.taccountvs1[0].fields.IsHeader || false;

                                    var cardnumber = data.taccountvs1[0].fields.CarNumber || '';
                                    var cardcvc = data.taccountvs1[0].fields.CVC || '';
                                    var cardexpiry = data.taccountvs1[0].fields.ExpiryDate || '';

                                    if ((accounttype === "BANK")) {
                                        $('.isBankAccount').removeClass('isNotBankAccount');
                                        $('.isCreditAccount').addClass('isNotCreditAccount');
                                    } else if ((accounttype === "CCARD")) {
                                        $('.isCreditAccount').removeClass('isNotCreditAccount');
                                        $('.isBankAccount').addClass('isNotBankAccount');
                                    } else {
                                        $('.isBankAccount').addClass('isNotBankAccount');
                                        $('.isCreditAccount').addClass('isNotCreditAccount');
                                    }

                                    $('#edtAccountID').val(accountid);
                                    $('#sltAccountType').val(accounttype);
                                    $('#sltAccountType').append('<option value="' + accounttype + '" selected="selected">' + accounttype + '</option>');
                                    $('#edtAccountName').val(accountname);
                                    $('#edtAccountNo').val(accountno);
                                    $('#sltTaxCode').val(taxcode);
                                    $('#txaAccountDescription').val(accountdesc);
                                    $('#edtBankAccountName').val(bankaccountname);
                                    $('#edtBSB').val(bankbsb);
                                    $('#edtBankAccountNo').val(bankacountno);
                                    $('#swiftCode').val(swiftCode);
                                    $('#routingNo').val(routingNo);
                                    $('#edtBankName').val(localStorage.getItem('vs1companyBankName') || '');

                                    $('#edtCardNumber').val(cardnumber);
                                    $('#edtExpiryDate').val(cardexpiry ? moment(cardexpiry).format('DD/MM/YYYY') : "");
                                    $('#edtCvc').val(cardcvc);

                                    if (showTrans == 'true') {
                                        $('.showOnTransactions').prop('checked', true);
                                    } else {
                                        $('.showOnTransactions').prop('checked', false);
                                    }

                                    setTimeout(function () {
                                        $('#addNewAccount').modal('show');
                                    }, 500);

                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });
                            }

                        }
                    }).catch(function (err) {
                        accountService.getOneAccountByName(accountDataName).then(function (data) {
                            let lineItems = [];
                            let lineItemObj = {};
                            let fullAccountTypeName = '';
                            let accBalance = '';
                            $('#add-account-title').text('Edit Account Details');
                            $('#edtAccountName').attr('readonly', true);
                            $('#sltAccountType').attr('readonly', true);
                            $('#sltAccountType').attr('disabled', 'disabled');
                            if (accountTypeList) {
                                for (var h = 0; h < accountTypeList.length; h++) {

                                    if (data.taccountvs1[0].fields.AccountTypeName === accountTypeList[h].accounttypename) {

                                        fullAccountTypeName = accountTypeList[h].description || '';

                                    }
                                }

                            }

                            $('#add-account-title').text('Edit Account Details');
                            $('#edtAccountName').attr('readonly', true);
                            $('#sltAccountType').attr('readonly', true);
                            $('#sltAccountType').attr('disabled', 'disabled');

                            var accountid = data.taccountvs1[0].fields.ID || '';
                            var accounttype = fullAccountTypeName || data.taccountvs1[0].fields.AccountTypeName;
                            var accountname = data.taccountvs1[0].fields.AccountName || '';
                            var accountno = data.taccountvs1[0].fields.AccountNumber || '';
                            var taxcode = data.taccountvs1[0].fields.TaxCode || '';
                            var accountdesc = data.taccountvs1[0].fields.Description || '';
                            var bankaccountname = data.taccountvs1[0].fields.BankAccountName || '';
                            var bankbsb = data.taccountvs1[0].fields.BSB || '';
                            var bankacountno = data.taccountvs1[0].fields.BankAccountNumber || '';

                            var swiftCode = data.taccountvs1[0].fields.Extra || '';
                            var routingNo = data.taccountvs1[0].fields.BankCode || '';

                            var showTrans = data.taccountvs1[0].fields.IsHeader || false;

                            var cardnumber = data.taccountvs1[0].fields.CarNumber || '';
                            var cardcvc = data.taccountvs1[0].fields.CVC || '';
                            var cardexpiry = data.taccountvs1[0].fields.ExpiryDate || '';

                            if ((accounttype === "BANK")) {
                                $('.isBankAccount').removeClass('isNotBankAccount');
                                $('.isCreditAccount').addClass('isNotCreditAccount');
                            } else if ((accounttype === "CCARD")) {
                                $('.isCreditAccount').removeClass('isNotCreditAccount');
                                $('.isBankAccount').addClass('isNotBankAccount');
                            } else {
                                $('.isBankAccount').addClass('isNotBankAccount');
                                $('.isCreditAccount').addClass('isNotCreditAccount');
                            }

                            $('#edtAccountID').val(accountid);
                            $('#sltAccountType').val(accounttype);
                            $('#sltAccountType').append('<option value="' + accounttype + '" selected="selected">' + accounttype + '</option>');
                            $('#edtAccountName').val(accountname);
                            $('#edtAccountNo').val(accountno);
                            $('#sltTaxCode').val(taxcode);
                            $('#txaAccountDescription').val(accountdesc);
                            $('#edtBankAccountName').val(bankaccountname);
                            $('#edtBSB').val(bankbsb);
                            $('#edtBankAccountNo').val(bankacountno);
                            $('#swiftCode').val(swiftCode);
                            $('#routingNo').val(routingNo);
                            $('#edtBankName').val(localStorage.getItem('vs1companyBankName') || '');

                            $('#edtCardNumber').val(cardnumber);
                            $('#edtExpiryDate').val(cardexpiry ? moment(cardexpiry).format('DD/MM/YYYY') : "");
                            $('#edtCvc').val(cardcvc);

                            if (showTrans == 'true') {
                                $('.showOnTransactions').prop('checked', true);
                            } else {
                                $('.showOnTransactions').prop('checked', false);
                            }

                            setTimeout(function () {
                                $('#addNewAccount').modal('show');
                            }, 500);

                        }).catch(function (err) {
                            LoadingOverlay.hide();
                        });

                    });
                    $('#addAccountModal').modal('toggle');

                } else {
                    $('#accountListModal').modal('toggle');
                    var targetID = $(event.target).closest('tr').attr('id');
                    $('#selectLineID').val(targetID);
                    setTimeout(function () {
                        $('#tblAccount_filter .form-control-sm').focus();
                        $('#tblAccount_filter .form-control-sm').val('');
                        $('#tblAccount_filter .form-control-sm').trigger("input");

                        var datatable = $('#tblInventory').DataTable();
                        datatable.draw();
                        $('#tblAccount_filter .form-control-sm').trigger("input");

                    }, 500);
                }

            }
        }
    },
    'click #accountListModal #refreshpagelist': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        localStorage.setItem('VS1PurchaseAccountList', '');
        Meteor._reload.reload();
        //templateObject.getAllProducts();
    },
    // 'click .lineTaxRate': function (event) {
    //     $('#tblBillLine tbody tr .lineTaxRate').attr("data-toggle", "modal");
    //     $('#tblBillLine tbody tr .lineTaxRate').attr("data-target", "#taxRateListModal");
    //     var targetID = $(event.target).closest('tr').attr('id');
    //     $('#selectLineID').val(targetID);
    // },
    // 'click .lineTaxAmount': function (event) {
    //     let targetRow = $(event.target).closest('tr');
    //     let targetID = targetRow.attr('id');
    //     let targetTaxCode = targetRow.find('.lineTaxCode').val();
    //     let price = targetRow.find('.colAmountExChange').val() || '';
    //     const tmpObj = Template.instance();
    //     const taxDetail = tmpObj.taxcodes.get().find((v) => v.CodeName === targetTaxCode);
    //     const subTaxCodes = tmpObj.subtaxcodes.get();

    //     if (!taxDetail) {
    //         return;
    //     }

    //     let priceTotal = Number(price.replace(/[^0-9.-]+/g, ""));
    //     let taxTotal = priceTotal * parseFloat(taxDetail.Rate);

    //     let taxDetailTableData = [];
    //     taxDetailTableData.push([
    //         taxDetail.Description,
    //         taxDetail.Id,
    //         taxDetail.CodeName,
    //         `${taxDetail.Rate * 100}%`,
    //         "Selling Price",
    //         `$${priceTotal.toFixed(3)}`,
    //         `$${taxTotal.toFixed(3)}`,
    //         `$${(priceTotal + taxTotal).toFixed(3)}`,
    //     ]);
    //     if (taxDetail.Lines) {
    //         taxDetail.Lines.map((line) => {
    //             let lineDescription = "";
    //             if (line.Description) {
    //                 lineDescription = line.Description;
    //             } else {
    //                 lineDescription = subTaxCodes.find((v) => v.codename === line.SubTaxCode);
    //                 lineDescription = lineDescription.description;
    //             }

    //             taxDetailTableData.push([
    //                 "",
    //                 line.Id,
    //                 line.SubTaxCode,
    //                 `${line.Percentage}%`,
    //                 line.PercentageOn,
    //                 "",
    //                 `$${(priceTotal * line.Percentage / 100).toFixed(3)}`,
    //                 ""
    //             ]);
    //         });
    //     }

    //     if (taxDetailTableData) {

    //         if (!$.fn.DataTable.isDataTable('#tblTaxDetail')) {
    //             $('#tblTaxDetail').DataTable({
    //                 data: [],
    //                 order: [[0, 'desc']],
    //                 "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //                 columnDefs: [{
    //                     orderable: true,
    //                     targets: [0]
    //                 }, {
    //                     className: "taxId",
    //                     "targets": [1]
    //                 }, {
    //                     className: "taxCode",
    //                     "targets": [2]
    //                 }, {
    //                     className: "taxRate text-right",
    //                     "targets": [3]
    //                 }, {
    //                     className: "taxRateOn",
    //                     "targets": [4]
    //                 }, {
    //                     className: "amountEx text-right",
    //                     "targets": [5]
    //                 }, {
    //                     className: "tax text-right",
    //                     "targets": [6]
    //                 }, {
    //                     className: "amountInc text-right",
    //                     "targets": [7]
    //                 }
    //                 ],
    //                 colReorder: true,
    //                 pageLength: initialDatatableLoad,
    //                 lengthMenu: [[initialDatatableLoad, -1], [initialDatatableLoad, "All"]],
    //                 info: true,
    //                 responsive: true,
    //                 "fnDrawCallback": function (oSettings) {

    //                 },
    //                 language: { search: "", searchPlaceholder: "Search List..." },
    //                 "fnInitComplete": function () {
    //                     $("<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblTaxDetail_filter");
    //                     $("<button class='btn btn-primary btnRefreshTaxDetail' type='button' id='btnRefreshTaxDetail' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblTaxDetail_filter");
    //                 }
    //             });
    //         }

    //         let datatable = $('#tblTaxDetail').DataTable();
    //         datatable.clear();
    //         datatable.rows.add(taxDetailTableData);
    //         datatable.draw(false);
    //     }

    //     $('#tblBillLine tbody tr .lineTaxAmount').attr("data-toggle", "modal");
    //     $('#tblBillLine tbody tr .lineTaxAmount').attr("data-target", "#taxDetailModal");
    // },
    // 'click .lineTaxCode, keydown .lineTaxCode': function (event) {
    //     var $earch = $(event.currentTarget);
    //     var offset = $earch.offset();
    //     $('#edtTaxID').val('');
    //     $('.taxcodepopheader').text('New Tax Rate');
    //     $('#edtTaxID').val('');
    //     $('#edtTaxNamePop').val('');
    //     $('#edtTaxRatePop').val('');
    //     $('#edtTaxDescPop').val('');
    //     $('#edtTaxNamePop').attr('readonly', false);
    //     let purchaseService = new PurchaseBoardService();
    //     var taxRateDataName = $(event.target).val() || '';
    //     if (event.pageX > offset.left + $earch.width() - 10) { // X button 16px wide?
    //         $('#taxRateListModal').modal('toggle');
    //         var targetID = $(event.target).closest('tr').attr('id');
    //         $('#selectLineID').val(targetID);
    //         setTimeout(function () {
    //             $('#tblTaxRate_filter .form-control-sm').focus();
    //             $('#tblTaxRate_filter .form-control-sm').val('');
    //             $('#tblTaxRate_filter .form-control-sm').trigger("input");

    //             var datatable = $('#tblTaxRate').DataTable();
    //             datatable.draw();
    //             $('#tblTaxRate_filter .form-control-sm').trigger("input");

    //         }, 500);
    //     } else {
    //         if (taxRateDataName.replace(/\s/g, '') != '') {

    //             getVS1Data('TTaxcodeVS1').then(function (dataObject) {
    //                 if (dataObject.length == 0) {
    //                     purchaseService.getTaxCodesVS1().then(function (data) {
    //                         let lineItems = [];
    //                         let lineItemObj = {};
    //                         for (let i = 0; i < data.ttaxcodevs1.length; i++) {
    //                             if ((data.ttaxcodevs1[i].CodeName) === taxRateDataName) {
    //                                 $('#edtTaxNamePop').attr('readonly', true);
    //                                 let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
    //                                 var taxRateID = data.ttaxcodevs1[i].Id || '';
    //                                 var taxRateName = data.ttaxcodevs1[i].CodeName || '';
    //                                 var taxRateDesc = data.ttaxcodevs1[i].Description || '';
    //                                 $('#edtTaxID').val(taxRateID);
    //                                 $('#edtTaxNamePop').val(taxRateName);
    //                                 $('#edtTaxRatePop').val(taxRate);
    //                                 $('#edtTaxDescPop').val(taxRateDesc);
    //                                 setTimeout(function () {
    //                                     $('#newTaxRateModal').modal('toggle');
    //                                 }, 100);
    //                             }
    //                         }

    //                     }).catch(function (err) {
    //                         // Bert.alert('<strong>' + err + '</strong>!', 'danger');
    //                         LoadingOverlay.hide();
    //                         // Meteor._reload.reload();
    //                     });
    //                 } else {
    //                     let data = JSON.parse(dataObject[0].data);
    //                     let useData = data.ttaxcodevs1;
    //                     let lineItems = [];
    //                     let lineItemObj = {};
    //                     $('.taxcodepopheader').text('Edit Tax Rate');
    //                     for (let i = 0; i < useData.length; i++) {

    //                         if ((useData[i].CodeName) === taxRateDataName) {
    //                             $('#edtTaxNamePop').attr('readonly', true);
    //                             let taxRate = (useData[i].Rate * 100).toFixed(2);
    //                             var taxRateID = useData[i].Id || '';
    //                             var taxRateName = useData[i].CodeName || '';
    //                             var taxRateDesc = useData[i].Description || '';
    //                             $('#edtTaxID').val(taxRateID);
    //                             $('#edtTaxNamePop').val(taxRateName);
    //                             $('#edtTaxRatePop').val(taxRate);
    //                             $('#edtTaxDescPop').val(taxRateDesc);
    //                             //setTimeout(function() {
    //                             $('#newTaxRateModal').modal('toggle');
    //                             //}, 500);
    //                         }
    //                     }
    //                 }
    //             }).catch(function (err) {
    //                 purchaseService.getTaxCodesVS1().then(function (data) {
    //                     let lineItems = [];
    //                     let lineItemObj = {};
    //                     for (let i = 0; i < data.ttaxcodevs1.length; i++) {
    //                         if ((data.ttaxcodevs1[i].CodeName) === taxRateDataName) {
    //                             $('#edtTaxNamePop').attr('readonly', true);
    //                             let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
    //                             var taxRateID = data.ttaxcodevs1[i].Id || '';
    //                             var taxRateName = data.ttaxcodevs1[i].CodeName || '';
    //                             var taxRateDesc = data.ttaxcodevs1[i].Description || '';
    //                             $('#edtTaxID').val(taxRateID);
    //                             $('#edtTaxNamePop').val(taxRateName);
    //                             $('#edtTaxRatePop').val(taxRate);
    //                             $('#edtTaxDescPop').val(taxRateDesc);
    //                             setTimeout(function () {
    //                                 $('#newTaxRateModal').modal('toggle');
    //                             }, 100);

    //                         }
    //                     }

    //                 }).catch(function (err) {
    //                     // Bert.alert('<strong>' + err + '</strong>!', 'danger');
    //                     LoadingOverlay.hide();
    //                     // Meteor._reload.reload();
    //                 });
    //             });

    //         } else {
    //             $('#taxRateListModal').modal('toggle');
    //             var targetID = $(event.target).closest('tr').attr('id');
    //             $('#selectLineID').val(targetID);
    //             setTimeout(function () {
    //                 $('#tblTaxRate_filter .form-control-sm').focus();
    //                 $('#tblTaxRate_filter .form-control-sm').val('');
    //                 $('#tblTaxRate_filter .form-control-sm').trigger("input");

    //                 var datatable = $('#tblTaxRate').DataTable();
    //                 datatable.draw();
    //                 $('#tblTaxRate_filter .form-control-sm').trigger("input");

    //             }, 500);
    //         }

    //     }

    // },
    'click .lineCustomerJob, keydown .lineCustomerJob': function (event) {
        var $earch = $(event.currentTarget);
        var offset = $earch.offset();
        var targetID = $(event.target).closest('tr').attr('id');
        $('#customerSelectLineID').val(targetID);
        $('#edtCustomerPOPID').val('');
        $('#add-customer-title').text('Add New Customer');
        var customerDataName = $(event.target).val() || '';
        if (event.pageX > offset.left + $earch.width() - 10) { // X button 16px wide?
            $('#customerListModal').modal('toggle');
            var targetID = $(event.target).closest('tr').attr('id');
            $('#customerSelectLineID').val(targetID);
            setTimeout(function () {
                $('#tblCustomerlist_filter .form-control-sm').focus();
                $('#tblCustomerlist_filter .form-control-sm').val('');
                $('#tblCustomerlist_filter .form-control-sm').trigger("input");

                var datatable = $('#tblCustomerlist').DataTable();
                datatable.draw();
                $('#tblCustomerlist_filter .form-control-sm').trigger("input");

            }, 500);
        } else {
            if (customerDataName.replace(/\s/g, '') != '') {

                $('#edtCustomerPOPID').val('');
                getVS1Data('TCustomerVS1').then(function (dataObject) {
                    if (dataObject.length == 0) {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        sideBarService.getOneCustomerDataExByName(customerDataName).then(function (data) {
                            LoadingOverlay.hide();
                            let lineItems = [];
                            $('#add-customer-title').text('Edit Customer');
                            let popCustomerID = data.tcustomer[0].fields.ID || '';
                            let popCustomerName = data.tcustomer[0].fields.ClientName || '';
                            let popCustomerEmail = data.tcustomer[0].fields.Email || '';
                            let popCustomerTitle = data.tcustomer[0].fields.Title || '';
                            let popCustomerFirstName = data.tcustomer[0].fields.FirstName || '';
                            let popCustomerMiddleName = data.tcustomer[0].fields.CUSTFLD10 || '';
                            let popCustomerLastName = data.tcustomer[0].fields.LastName || '';
                            let popCustomertfn = '' || '';
                            let popCustomerPhone = data.tcustomer[0].fields.Phone || '';
                            let popCustomerMobile = data.tcustomer[0].fields.Mobile || '';
                            let popCustomerFaxnumber = data.tcustomer[0].fields.Faxnumber || '';
                            let popCustomerSkypeName = data.tcustomer[0].fields.SkypeName || '';
                            let popCustomerURL = data.tcustomer[0].fields.URL || '';
                            let popCustomerStreet = data.tcustomer[0].fields.Street || '';
                            let popCustomerStreet2 = data.tcustomer[0].fields.Street2 || '';
                            let popCustomerState = data.tcustomer[0].fields.State || '';
                            let popCustomerPostcode = data.tcustomer[0].fields.Postcode || '';
                            let popCustomerCountry = data.tcustomer[0].fields.Country || LoggedCountry;
                            let popCustomerbillingaddress = data.tcustomer[0].fields.BillStreet || '';
                            let popCustomerbcity = data.tcustomer[0].fields.BillStreet2 || '';
                            let popCustomerbstate = data.tcustomer[0].fields.BillState || '';
                            let popCustomerbpostalcode = data.tcustomer[0].fields.BillPostcode || '';
                            let popCustomerbcountry = data.tcustomer[0].fields.Billcountry || LoggedCountry;
                            let popCustomercustfield1 = data.tcustomer[0].fields.CUSTFLD1 || '';
                            let popCustomercustfield2 = data.tcustomer[0].fields.CUSTFLD2 || '';
                            let popCustomercustfield3 = data.tcustomer[0].fields.CUSTFLD3 || '';
                            let popCustomercustfield4 = data.tcustomer[0].fields.CUSTFLD4 || '';
                            let popCustomernotes = data.tcustomer[0].fields.Notes || '';
                            let popCustomerpreferedpayment = data.tcustomer[0].fields.PaymentMethodName || '';
                            let popCustomerterms = data.tcustomer[0].fields.TermsName || '';
                            let popCustomerdeliverymethod = data.tcustomer[0].fields.ShippingMethodName || '';
                            let popCustomeraccountnumber = data.tcustomer[0].fields.ClientNo || '';
                            let popCustomerisContractor = data.tcustomer[0].fields.Contractor || false;
                            let popCustomerissupplier = data.tcustomer[0].fields.IsSupplier || false;
                            let popCustomeriscustomer = data.tcustomer[0].fields.IsCustomer || false;
                            let popCustomerTaxCode = data.tcustomer[0].fields.TaxCodeName || '';
                            let popCustomerDiscount = data.tcustomer[0].fields.Discount || 0;
                            let popCustomerType = data.tcustomer[0].fields.ClientTypeName || '';
                            //$('#edtCustomerCompany').attr('readonly', true);
                            $('#edtCustomerCompany').val(popCustomerName);
                            $('#edtCustomerPOPID').val(popCustomerID);
                            $('#edtCustomerPOPEmail').val(popCustomerEmail);
                            $('#edtTitle').val(popCustomerTitle);
                            $('#edtFirstName').val(popCustomerFirstName);
                            $('#edtMiddleName').val(popCustomerMiddleName);
                            $('#edtLastName').val(popCustomerLastName);
                            $('#edtCustomerPhone').val(popCustomerPhone);
                            $('#edtCustomerMobile').val(popCustomerMobile);
                            $('#edtCustomerFax').val(popCustomerFaxnumber);
                            $('#edtCustomerSkypeID').val(popCustomerSkypeName);
                            $('#edtCustomerWebsite').val(popCustomerURL);
                            $('#edtCustomerShippingAddress').val(popCustomerStreet);
                            $('#edtCustomerShippingCity').val(popCustomerStreet2);
                            $('#edtCustomerShippingState').val(popCustomerState);
                            $('#edtCustomerShippingZIP').val(popCustomerPostcode);
                            $('#sedtCountry').val(popCustomerCountry);
                            $('#txaNotes').val(popCustomernotes);
                            $('#sltPreferedPayment').val(popCustomerpreferedpayment);
                            $('#sltTermsPOP').val(popCustomerterms);
                            $('#sltCustomerType').val(popCustomerType);
                            $('#edtCustomerCardDiscount').val(popCustomerDiscount);
                            $('#edtCustomeField1').val(popCustomercustfield1);
                            $('#edtCustomeField2').val(popCustomercustfield2);
                            $('#edtCustomeField3').val(popCustomercustfield3);
                            $('#edtCustomeField4').val(popCustomercustfield4);

                            $('#sltTaxCode').val(popCustomerTaxCode);

                            if ((data.tcustomer[0].fields.Street == data.tcustomer[0].fields.BillStreet) && (data.tcustomer[0].fields.Street2 == data.tcustomer[0].fields.BillStreet2) &&
                                (data.tcustomer[0].fields.State == data.tcustomer[0].fields.BillState) && (data.tcustomer[0].fields.Postcode == data.tcustomer[0].fields.BillPostcode) &&
                                (data.tcustomer[0].fields.Country == data.tcustomer[0].fields.Billcountry)) {
                                $('#chkSameAsShipping2').attr("checked", "checked");
                            }

                            if (data.tcustomer[0].fields.IsSupplier == true) {
                                // $('#isformcontractor')
                                $('#chkSameAsSupplier').attr("checked", "checked");
                            } else {
                                $('#chkSameAsSupplier').removeAttr("checked");
                            }

                            setTimeout(function () {
                                $('#addCustomerModal').modal('show');
                            }, 200);
                        }).catch(function (err) {
                            LoadingOverlay.hide();
                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tcustomervs1;

                        var added = false;
                        for (let i = 0; i < data.tcustomervs1.length; i++) {
                            if (data.tcustomervs1[i].fields.ClientName === customerDataName) {
                                let lineItems = [];
                                added = true;
                                LoadingOverlay.hide();
                                $('#add-customer-title').text('Edit Customer');
                                let popCustomerID = data.tcustomervs1[i].fields.ID || '';
                                let popCustomerName = data.tcustomervs1[i].fields.ClientName || '';
                                let popCustomerEmail = data.tcustomervs1[i].fields.Email || '';
                                let popCustomerTitle = data.tcustomervs1[i].fields.Title || '';
                                let popCustomerFirstName = data.tcustomervs1[i].fields.FirstName || '';
                                let popCustomerMiddleName = data.tcustomervs1[i].fields.CUSTFLD10 || '';
                                let popCustomerLastName = data.tcustomervs1[i].fields.LastName || '';
                                let popCustomertfn = '' || '';
                                let popCustomerPhone = data.tcustomervs1[i].fields.Phone || '';
                                let popCustomerMobile = data.tcustomervs1[i].fields.Mobile || '';
                                let popCustomerFaxnumber = data.tcustomervs1[i].fields.Faxnumber || '';
                                let popCustomerSkypeName = data.tcustomervs1[i].fields.SkypeName || '';
                                let popCustomerURL = data.tcustomervs1[i].fields.URL || '';
                                let popCustomerStreet = data.tcustomervs1[i].fields.Street || '';
                                let popCustomerStreet2 = data.tcustomervs1[i].fields.Street2 || '';
                                let popCustomerState = data.tcustomervs1[i].fields.State || '';
                                let popCustomerPostcode = data.tcustomervs1[i].fields.Postcode || '';
                                let popCustomerCountry = data.tcustomervs1[i].fields.Country || LoggedCountry;
                                let popCustomerbillingaddress = data.tcustomervs1[i].fields.BillStreet || '';
                                let popCustomerbcity = data.tcustomervs1[i].fields.BillStreet2 || '';
                                let popCustomerbstate = data.tcustomervs1[i].fields.BillState || '';
                                let popCustomerbpostalcode = data.tcustomervs1[i].fields.BillPostcode || '';
                                let popCustomerbcountry = data.tcustomervs1[i].fields.Billcountry || LoggedCountry;
                                let popCustomercustfield1 = data.tcustomervs1[i].fields.CUSTFLD1 || '';
                                let popCustomercustfield2 = data.tcustomervs1[i].fields.CUSTFLD2 || '';
                                let popCustomercustfield3 = data.tcustomervs1[i].fields.CUSTFLD3 || '';
                                let popCustomercustfield4 = data.tcustomervs1[i].fields.CUSTFLD4 || '';
                                let popCustomernotes = data.tcustomervs1[i].fields.Notes || '';
                                let popCustomerpreferedpayment = data.tcustomervs1[i].fields.PaymentMethodName || '';
                                let popCustomerterms = data.tcustomervs1[i].fields.TermsName || '';
                                let popCustomerdeliverymethod = data.tcustomervs1[i].fields.ShippingMethodName || '';
                                let popCustomeraccountnumber = data.tcustomervs1[i].fields.ClientNo || '';
                                let popCustomerisContractor = data.tcustomervs1[i].fields.Contractor || false;
                                let popCustomerissupplier = data.tcustomervs1[i].fields.IsSupplier || false;
                                let popCustomeriscustomer = data.tcustomervs1[i].fields.IsCustomer || false;
                                let popCustomerTaxCode = data.tcustomervs1[i].fields.TaxCodeName || '';
                                let popCustomerDiscount = data.tcustomervs1[i].fields.Discount || 0;
                                let popCustomerType = data.tcustomervs1[i].fields.ClientTypeName || '';
                                //$('#edtCustomerCompany').attr('readonly', true);
                                $('#edtCustomerCompany').val(popCustomerName);
                                $('#edtCustomerPOPID').val(popCustomerID);
                                $('#edtCustomerPOPEmail').val(popCustomerEmail);
                                $('#edtTitle').val(popCustomerTitle);
                                $('#edtFirstName').val(popCustomerFirstName);
                                $('#edtMiddleName').val(popCustomerMiddleName);
                                $('#edtLastName').val(popCustomerLastName);
                                $('#edtCustomerPhone').val(popCustomerPhone);
                                $('#edtCustomerMobile').val(popCustomerMobile);
                                $('#edtCustomerFax').val(popCustomerFaxnumber);
                                $('#edtCustomerSkypeID').val(popCustomerSkypeName);
                                $('#edtCustomerWebsite').val(popCustomerURL);
                                $('#edtCustomerShippingAddress').val(popCustomerStreet);
                                $('#edtCustomerShippingCity').val(popCustomerStreet2);
                                $('#edtCustomerShippingState').val(popCustomerState);
                                $('#edtCustomerShippingZIP').val(popCustomerPostcode);
                                $('#sedtCountry').val(popCustomerCountry);
                                $('#txaNotes').val(popCustomernotes);
                                $('#sltPreferedPayment').val(popCustomerpreferedpayment);
                                $('#sltTermsPOP').val(popCustomerterms);
                                $('#sltCustomerType').val(popCustomerType);
                                $('#edtCustomerCardDiscount').val(popCustomerDiscount);
                                $('#edtCustomeField1').val(popCustomercustfield1);
                                $('#edtCustomeField2').val(popCustomercustfield2);
                                $('#edtCustomeField3').val(popCustomercustfield3);
                                $('#edtCustomeField4').val(popCustomercustfield4);

                                $('#sltTaxCode').val(popCustomerTaxCode);

                                if ((data.tcustomervs1[i].fields.Street == data.tcustomervs1[i].fields.BillStreet) && (data.tcustomervs1[i].fields.Street2 == data.tcustomervs1[i].fields.BillStreet2) &&
                                    (data.tcustomervs1[i].fields.State == data.tcustomervs1[i].fields.BillState) && (data.tcustomervs1[i].fields.Postcode == data.tcustomervs1[i].fields.BillPostcode) &&
                                    (data.tcustomervs1[i].fields.Country == data.tcustomervs1[i].fields.Billcountry)) {
                                    $('#chkSameAsShipping2').attr("checked", "checked");
                                }

                                if (data.tcustomervs1[i].fields.IsSupplier == true) {
                                    // $('#isformcontractor')
                                    $('#chkSameAsSupplier').attr("checked", "checked");
                                } else {
                                    $('#chkSameAsSupplier').removeAttr("checked");
                                }

                                setTimeout(function () {
                                    $('#addCustomerModal').modal('show');
                                }, 200);

                            }
                        }
                        if (!added) {
                            $('.fullScreenSpin').css('display', 'inline-block');
                            sideBarService.getOneCustomerDataExByName(customerDataName).then(function (data) {
                                LoadingOverlay.hide();
                                let lineItems = [];
                                $('#add-customer-title').text('Edit Customer');
                                let popCustomerID = data.tcustomer[0].fields.ID || '';
                                let popCustomerName = data.tcustomer[0].fields.ClientName || '';
                                let popCustomerEmail = data.tcustomer[0].fields.Email || '';
                                let popCustomerTitle = data.tcustomer[0].fields.Title || '';
                                let popCustomerFirstName = data.tcustomer[0].fields.FirstName || '';
                                let popCustomerMiddleName = data.tcustomer[0].fields.CUSTFLD10 || '';
                                let popCustomerLastName = data.tcustomer[0].fields.LastName || '';
                                let popCustomertfn = '' || '';
                                let popCustomerPhone = data.tcustomer[0].fields.Phone || '';
                                let popCustomerMobile = data.tcustomer[0].fields.Mobile || '';
                                let popCustomerFaxnumber = data.tcustomer[0].fields.Faxnumber || '';
                                let popCustomerSkypeName = data.tcustomer[0].fields.SkypeName || '';
                                let popCustomerURL = data.tcustomer[0].fields.URL || '';
                                let popCustomerStreet = data.tcustomer[0].fields.Street || '';
                                let popCustomerStreet2 = data.tcustomer[0].fields.Street2 || '';
                                let popCustomerState = data.tcustomer[0].fields.State || '';
                                let popCustomerPostcode = data.tcustomer[0].fields.Postcode || '';
                                let popCustomerCountry = data.tcustomer[0].fields.Country || LoggedCountry;
                                let popCustomerbillingaddress = data.tcustomer[0].fields.BillStreet || '';
                                let popCustomerbcity = data.tcustomer[0].fields.BillStreet2 || '';
                                let popCustomerbstate = data.tcustomer[0].fields.BillState || '';
                                let popCustomerbpostalcode = data.tcustomer[0].fields.BillPostcode || '';
                                let popCustomerbcountry = data.tcustomer[0].fields.Billcountry || LoggedCountry;
                                let popCustomercustfield1 = data.tcustomer[0].fields.CUSTFLD1 || '';
                                let popCustomercustfield2 = data.tcustomer[0].fields.CUSTFLD2 || '';
                                let popCustomercustfield3 = data.tcustomer[0].fields.CUSTFLD3 || '';
                                let popCustomercustfield4 = data.tcustomer[0].fields.CUSTFLD4 || '';
                                let popCustomernotes = data.tcustomer[0].fields.Notes || '';
                                let popCustomerpreferedpayment = data.tcustomer[0].fields.PaymentMethodName || '';
                                let popCustomerterms = data.tcustomer[0].fields.TermsName || '';
                                let popCustomerdeliverymethod = data.tcustomer[0].fields.ShippingMethodName || '';
                                let popCustomeraccountnumber = data.tcustomer[0].fields.ClientNo || '';
                                let popCustomerisContractor = data.tcustomer[0].fields.Contractor || false;
                                let popCustomerissupplier = data.tcustomer[0].fields.IsSupplier || false;
                                let popCustomeriscustomer = data.tcustomer[0].fields.IsCustomer || false;
                                let popCustomerTaxCode = data.tcustomer[0].fields.TaxCodeName || '';
                                let popCustomerDiscount = data.tcustomer[0].fields.Discount || 0;
                                let popCustomerType = data.tcustomer[0].fields.ClientTypeName || '';
                                //$('#edtCustomerCompany').attr('readonly', true);
                                $('#edtCustomerCompany').val(popCustomerName);
                                $('#edtCustomerPOPID').val(popCustomerID);
                                $('#edtCustomerPOPEmail').val(popCustomerEmail);
                                $('#edtTitle').val(popCustomerTitle);
                                $('#edtFirstName').val(popCustomerFirstName);
                                $('#edtMiddleName').val(popCustomerMiddleName);
                                $('#edtLastName').val(popCustomerLastName);
                                $('#edtCustomerPhone').val(popCustomerPhone);
                                $('#edtCustomerMobile').val(popCustomerMobile);
                                $('#edtCustomerFax').val(popCustomerFaxnumber);
                                $('#edtCustomerSkypeID').val(popCustomerSkypeName);
                                $('#edtCustomerWebsite').val(popCustomerURL);
                                $('#edtCustomerShippingAddress').val(popCustomerStreet);
                                $('#edtCustomerShippingCity').val(popCustomerStreet2);
                                $('#edtCustomerShippingState').val(popCustomerState);
                                $('#edtCustomerShippingZIP').val(popCustomerPostcode);
                                $('#sedtCountry').val(popCustomerCountry);
                                $('#txaNotes').val(popCustomernotes);
                                $('#sltPreferedPayment').val(popCustomerpreferedpayment);
                                $('#sltTermsPOP').val(popCustomerterms);
                                $('#sltCustomerType').val(popCustomerType);
                                $('#edtCustomerCardDiscount').val(popCustomerDiscount);
                                $('#edtCustomeField1').val(popCustomercustfield1);
                                $('#edtCustomeField2').val(popCustomercustfield2);
                                $('#edtCustomeField3').val(popCustomercustfield3);
                                $('#edtCustomeField4').val(popCustomercustfield4);

                                $('#sltTaxCode').val(popCustomerTaxCode);

                                if ((data.tcustomer[0].fields.Street == data.tcustomer[0].fields.BillStreet) && (data.tcustomer[0].fields.Street2 == data.tcustomer[0].fields.BillStreet2) &&
                                    (data.tcustomer[0].fields.State == data.tcustomer[0].fields.BillState) && (data.tcustomer[0].fields.Postcode == data.tcustomer[0].fields.BillPostcode) &&
                                    (data.tcustomer[0].fields.Country == data.tcustomer[0].fields.Billcountry)) {
                                    $('#chkSameAsShipping2').attr("checked", "checked");
                                }

                                if (data.tcustomer[0].fields.IsSupplier == true) {
                                    // $('#isformcontractor')
                                    $('#chkSameAsSupplier').attr("checked", "checked");
                                } else {
                                    $('#chkSameAsSupplier').removeAttr("checked");
                                }

                                setTimeout(function () {
                                    $('#addCustomerModal').modal('show');
                                }, 200);
                            }).catch(function (err) {
                                LoadingOverlay.hide();
                            });
                        }
                    }
                }).catch(function (err) {
                    sideBarService.getOneCustomerDataExByName(customerDataName).then(function (data) {
                        LoadingOverlay.hide();
                        let lineItems = [];
                        $('#add-customer-title').text('Edit Customer');
                        let popCustomerID = data.tcustomer[0].fields.ID || '';
                        let popCustomerName = data.tcustomer[0].fields.ClientName || '';
                        let popCustomerEmail = data.tcustomer[0].fields.Email || '';
                        let popCustomerTitle = data.tcustomer[0].fields.Title || '';
                        let popCustomerFirstName = data.tcustomer[0].fields.FirstName || '';
                        let popCustomerMiddleName = data.tcustomer[0].fields.CUSTFLD10 || '';
                        let popCustomerLastName = data.tcustomer[0].fields.LastName || '';
                        let popCustomertfn = '' || '';
                        let popCustomerPhone = data.tcustomer[0].fields.Phone || '';
                        let popCustomerMobile = data.tcustomer[0].fields.Mobile || '';
                        let popCustomerFaxnumber = data.tcustomer[0].fields.Faxnumber || '';
                        let popCustomerSkypeName = data.tcustomer[0].fields.SkypeName || '';
                        let popCustomerURL = data.tcustomer[0].fields.URL || '';
                        let popCustomerStreet = data.tcustomer[0].fields.Street || '';
                        let popCustomerStreet2 = data.tcustomer[0].fields.Street2 || '';
                        let popCustomerState = data.tcustomer[0].fields.State || '';
                        let popCustomerPostcode = data.tcustomer[0].fields.Postcode || '';
                        let popCustomerCountry = data.tcustomer[0].fields.Country || LoggedCountry;
                        let popCustomerbillingaddress = data.tcustomer[0].fields.BillStreet || '';
                        let popCustomerbcity = data.tcustomer[0].fields.BillStreet2 || '';
                        let popCustomerbstate = data.tcustomer[0].fields.BillState || '';
                        let popCustomerbpostalcode = data.tcustomer[0].fields.BillPostcode || '';
                        let popCustomerbcountry = data.tcustomer[0].fields.Billcountry || LoggedCountry;
                        let popCustomercustfield1 = data.tcustomer[0].fields.CUSTFLD1 || '';
                        let popCustomercustfield2 = data.tcustomer[0].fields.CUSTFLD2 || '';
                        let popCustomercustfield3 = data.tcustomer[0].fields.CUSTFLD3 || '';
                        let popCustomercustfield4 = data.tcustomer[0].fields.CUSTFLD4 || '';
                        let popCustomernotes = data.tcustomer[0].fields.Notes || '';
                        let popCustomerpreferedpayment = data.tcustomer[0].fields.PaymentMethodName || '';
                        let popCustomerterms = data.tcustomer[0].fields.TermsName || '';
                        let popCustomerdeliverymethod = data.tcustomer[0].fields.ShippingMethodName || '';
                        let popCustomeraccountnumber = data.tcustomer[0].fields.ClientNo || '';
                        let popCustomerisContractor = data.tcustomer[0].fields.Contractor || false;
                        let popCustomerissupplier = data.tcustomer[0].fields.IsSupplier || false;
                        let popCustomeriscustomer = data.tcustomer[0].fields.IsCustomer || false;
                        let popCustomerTaxCode = data.tcustomer[0].fields.TaxCodeName || '';
                        let popCustomerDiscount = data.tcustomer[0].fields.Discount || 0;
                        let popCustomerType = data.tcustomer[0].fields.ClientTypeName || '';
                        //$('#edtCustomerCompany').attr('readonly', true);
                        $('#edtCustomerCompany').val(popCustomerName);
                        $('#edtCustomerPOPID').val(popCustomerID);
                        $('#edtCustomerPOPEmail').val(popCustomerEmail);
                        $('#edtTitle').val(popCustomerTitle);
                        $('#edtFirstName').val(popCustomerFirstName);
                        $('#edtMiddleName').val(popCustomerMiddleName);
                        $('#edtLastName').val(popCustomerLastName);
                        $('#edtCustomerPhone').val(popCustomerPhone);
                        $('#edtCustomerMobile').val(popCustomerMobile);
                        $('#edtCustomerFax').val(popCustomerFaxnumber);
                        $('#edtCustomerSkypeID').val(popCustomerSkypeName);
                        $('#edtCustomerWebsite').val(popCustomerURL);
                        $('#edtCustomerShippingAddress').val(popCustomerStreet);
                        $('#edtCustomerShippingCity').val(popCustomerStreet2);
                        $('#edtCustomerShippingState').val(popCustomerState);
                        $('#edtCustomerShippingZIP').val(popCustomerPostcode);
                        $('#sedtCountry').val(popCustomerCountry);
                        $('#txaNotes').val(popCustomernotes);
                        $('#sltPreferedPayment').val(popCustomerpreferedpayment);
                        $('#sltTermsPOP').val(popCustomerterms);
                        $('#sltCustomerType').val(popCustomerType);
                        $('#edtCustomerCardDiscount').val(popCustomerDiscount);
                        $('#edtCustomeField1').val(popCustomercustfield1);
                        $('#edtCustomeField2').val(popCustomercustfield2);
                        $('#edtCustomeField3').val(popCustomercustfield3);
                        $('#edtCustomeField4').val(popCustomercustfield4);

                        $('#sltTaxCode').val(popCustomerTaxCode);

                        if ((data.tcustomer[0].fields.Street == data.tcustomer[0].fields.BillStreet) && (data.tcustomer[0].fields.Street2 == data.tcustomer[0].fields.BillStreet2) &&
                            (data.tcustomer[0].fields.State == data.tcustomer[0].fields.BillState) && (data.tcustomer[0].fields.Postcode == data.tcustomer[0].fields.BillPostcode) &&
                            (data.tcustomer[0].fields.Country == data.tcustomer[0].fields.Billcountry)) {
                            $('#chkSameAsShipping2').attr("checked", "checked");
                        }

                        if (data.tcustomer[0].fields.IsSupplier == true) {
                            // $('#isformcontractor')
                            $('#chkSameAsSupplier').attr("checked", "checked");
                        } else {
                            $('#chkSameAsSupplier').removeAttr("checked");
                        }

                        setTimeout(function () {
                            $('#addCustomerModal').modal('show');
                        }, 200);
                    }).catch(function (err) {
                        LoadingOverlay.hide();
                    });
                });

            } else {
                $('#customerListModal').modal('toggle');
                var targetID = $(event.target).closest('tr').attr('id');
                $('#customerSelectLineID').val(targetID);
                setTimeout(function () {
                    $('#tblCustomerlist_filtertblCustomerlist_filter .form-control-sm').focus();
                    $('#tblCustomerlist_filter .form-control-sm').val('');
                    $('#tblCustomerlist_filter .form-control-sm').trigger("input");

                    var datatable = $('#tblTaxRate').DataTable();
                    datatable.draw();
                    $('#tblCustomerlist_filter .form-control-sm').trigger("input");

                }, 500);
            }

        }
    },

    // 'click .printConfirm': async function (event) {
    //     playPrintAudio();
    //     setTimeout(async function () {
    //         var printTemplate = [];
    //         $('.fullScreenSpin').css('display', 'inline-block');
    //         $('#html-2-pdfwrapper').css('display', 'block');

    //         let emid = localStorage.getItem('mySessionEmployeeLoggedID');
    //         var bill = $('input[name="Bills"]:checked').val();
    //         sideBarService.getTemplateNameandEmployeId("bill", emid, 1).then(function (data) {
    //             templateid = data.ttemplatesettings;
    //             var id = templateid[0].fields.ID;
    //             objDetails = {
    //                 type: "TTemplateSettings",
    //                 fields: {
    //                     ID: parseInt(id),
    //                     EmployeeID: localStorage.getItem('mySessionEmployeeLoggedID'),
    //                     SettingName: "bill",
    //                     GlobalRef: "bill",
    //                     Description: $('input[name="Bills_1"]').val(),
    //                     Template: "1",
    //                     Active: bill == 1 ? true : false,
    //                 }
    //             }

    //             sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    //                 sideBarService.getTemplateInformation(initialBaseDataLoad, 0)
    //                     .then(function (data) {
    //                         addVS1Data('TTemplateSettings', JSON.stringify(data));
    //                     });
    //             })

    //         }).catch(function (err) {
    //             objDetails = {
    //                 type: "TTemplateSettings",
    //                 fields: {
    //                     EmployeeID: localStorage.getItem('mySessionEmployeeLoggedID'),
    //                     SettingName: "bill",
    //                     Description: $('input[name="Bills_1"]').val(),
    //                     Template: "1",
    //                     Active: bill == 1 ? true : false,
    //                 }
    //             }

    //             sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    //                 sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
    //                     addVS1Data('TTemplateSettings', JSON.stringify(data));
    //                 });
    //             })

    //         });

    //         sideBarService.getTemplateNameandEmployeId("bill", emid, 2).then(function (data) {
    //             templateid = data.ttemplatesettings;
    //             var id = templateid[0].fields.ID;
    //             objDetails = {
    //                 type: "TTemplateSettings",
    //                 fields: {
    //                     ID: parseInt(id),
    //                     EmployeeID: localStorage.getItem('mySessionEmployeeLoggedID'),
    //                     SettingName: "bill",
    //                     GlobalRef: "bill",
    //                     Description: $('input[name="Bills_2"]').val(),
    //                     Template: "2",
    //                     Active: bill == 2 ? true : false,
    //                 }
    //             }

    //             sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    //                 sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
    //                     addVS1Data('TTemplateSettings', JSON.stringify(data));

    //                 });


    //             }).catch(function (err) { });

    //         }).catch(function (err) {
    //             objDetails = {
    //                 type: "TTemplateSettings",
    //                 fields: {
    //                     EmployeeID: localStorage.getItem('mySessionEmployeeLoggedID'),
    //                     SettingName: "bill",
    //                     Description: $('input[name="Bills_2"]').val(),
    //                     Template: "2",
    //                     Active: bill == 2 ? true : false,
    //                 }
    //             }

    //             sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

    //                 sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
    //                     addVS1Data('TTemplateSettings', JSON.stringify(data));

    //                 });

    //             }).catch(function (err) { });

    //         });
    //         sideBarService.getTemplateNameandEmployeId("bill", emid, 3).then(function (data) {
    //             templateid = data.ttemplatesettings;
    //             var id = templateid[0].fields.ID;
    //             objDetails = {
    //                 type: "TTemplateSettings",
    //                 fields: {
    //                     ID: parseInt(id),
    //                     EmployeeID: localStorage.getItem('mySessionEmployeeLoggedID'),
    //                     SettingName: "bill",
    //                     GlobalRef: "bill",
    //                     Description: $('input[name="Bills_3"]').val(),
    //                     Template: "3",
    //                     Active: bill == 3 ? true : false,
    //                 }
    //             }

    //             sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    //                 sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
    //                     addVS1Data('TTemplateSettings', JSON.stringify(data));
    //                 });
    //             })

    //         }).catch(function (err) {
    //             objDetails = {
    //                 type: "TTemplateSettings",
    //                 fields: {
    //                     EmployeeID: localStorage.getItem('mySessionEmployeeLoggedID'),
    //                     SettingName: "bill",
    //                     Description: $('input[name="Bills_3"]').val(),
    //                     Template: "3",
    //                     Active: bill == 3 ? true : false,
    //                 }
    //             }

    //             sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    //                 sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
    //                     addVS1Data('TTemplateSettings', JSON.stringify(data));
    //                 });
    //             })
    //         });

    //         if ($('#print_bill').is(':checked')) {
    //             printTemplate.push('Bills');
    //         }

    //         if (printTemplate.length > 0) {
    //             for (var i = 0; i < printTemplate.length; i++) {
    //                 if (printTemplate[i] == 'Bills') {
    //                     var template_number = $('input[name="Bills"]:checked').val();
    //                 }
    //                 let result = await exportSalesToPdf(printTemplate[i], template_number);
    //             }
    //         }
    //         const isEmailChecked = $("#emailSend").is(":checked");
    //         if (isEmailChecked) {
    //             await templateObject.sendEmailWithAttachment()
    //         }


    //     }, delayTimeAfterSound);
    // },

    // 'click #choosetemplate': function (event) {
    //     if ($('#choosetemplate').is(':checked')) {
    //         $('#templateselection').modal('show');
    //     }
    //     else {
    //         $('#templateselection').modal('hide');
    //     }
    // },

    'keydown .lineQty, keydown .lineUnitPrice, keydown .lineAmount': function (event) {
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
    },
    'click .btnRemove': async function (event) {
        let taxcodeList = templateObject.taxraterecords.get();
        let utilityService = new UtilityService();
        var targetID = $(event.target).closest('tr').attr('id');
        $('#selectDeleteLineID').val(targetID);
        if (targetID != undefined) {
            times++;
            if (times == 1) {
                $('#deleteLineModal').modal('toggle');
            } else {
                if ($('#tblBillLine tbody>tr').length > 1) {
                    this.click;
                    $(event.target).closest('tr').remove();
                    $(".bill_print #" + targetID).remove();
                    event.preventDefault();
                    let $tblrows = $("#tblBillLine tbody tr");
                    let $printrows = $(".bill_print tbody tr");


                    let lineAmount = 0;
                    let subGrandTotal = 0;
                    let taxGrandTotal = 0;
                    let taxGrandTotalPrint = 0;

                    $tblrows.each(function (index) {
                        var $tblrow = $(this);
                        var amount = $tblrow.find(".colAmountExChange").val() || 0;
                        var taxcode = $tblrow.find(".lineTaxCode").val() || 0;

                        var taxrateamount = 0;
                        if (taxcodeList) {
                            for (var i = 0; i < taxcodeList.length; i++) {
                                if (taxcodeList[i].codename == taxcode) {
                                    taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                                }
                            }
                        }


                        var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
                        var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                        $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
                        if (!isNaN(subTotal)) {
                            subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                            document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal.toFixed(2));
                        }

                        if (!isNaN(taxTotal)) {
                            taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
                            document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal.toFixed(2));
                        }

                        if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                            let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                            document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                            document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                            document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));

                        }
                    });

                    if ($(".printID").val() == "") {
                        $printrows.each(function (index) {
                            var $printrows = $(this);
                            var amount = $printrows.find("#lineAmount").text() || "0";
                            var taxcode = $printrows.find("#lineTaxCode").text() || 0;

                            var taxrateamount = 0;
                            if (taxcodeList) {
                                for (var i = 0; i < taxcodeList.length; i++) {
                                    if (taxcodeList[i].codename == taxcode) {
                                        taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100 || 0;
                                    }
                                }
                            }


                            var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
                            var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                            $printrows.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal))

                            if (!isNaN(subTotal)) {
                                $printrows.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                                subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                                document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
                            }

                            if (!isNaN(taxTotal)) {
                                taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
                            }
                            if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                                let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                                document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
                                //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                                document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

                            }
                        });
                    }
                    return false;

                } else {
                    $('#deleteLineModal').modal('toggle');
                }
            }
        } else {
            if (templateObject.hasFollow.get()) $("#footerDeleteModal2").modal("toggle");
            else $("#footerDeleteModal1").modal("toggle");
        }
    },
    // 'click .btnDeleteFollowingBills': async function (event) {
    //     playDeleteAudio();
    //     var currentDate = new Date();
    //     let purchaseService = new PurchaseBoardService();
    //     setTimeout(async function () {

    //         swal({
    //             title: 'You are deleting ' + $("#following_cnt").val() + ' Bill',
    //             text: "Do you wish to delete this transaction and all others associated with it moving forward?",
    //             type: 'question',
    //             showCancelButton: true,
    //             confirmButtonText: 'Yes',
    //             cancelButtonText: 'No'
    //         }).then(async (result) => {
    //             if (result.value) {
    //                 var url = FlowRouter.current().path;
    //                 var getso_id = url.split("?id=");
    //                 var currentInvoice = getso_id[getso_id.length - 1];
    //                 let billTotal = $('#grandTotal').text();
    //                 var objDetails = "";
    //                 if (getso_id[1]) {
    //                     $('.deleteloadingbar').css('width', ('0%')).attr('aria-valuenow', 0);
    //                     $("#deleteLineModal").modal('hide');
    //                     $("#deleteprogressbar").css('display', 'block');
    //                     $("#deleteprogressbar").modal('show');
    //                     currentInvoice = parseInt(currentInvoice);
    //                     var billData = await purchaseService.getOneBilldataEx(currentInvoice);
    //                     var orderDate = billData.fields.OrderDate;
    //                     var fromDate = orderDate.substring(0, 10);
    //                     var toDate = currentDate.getFullYear() + '-' + ("0" + (currentDate.getMonth() + 1)).slice(-2) + '-' + ("0" + (currentDate.getDate())).slice(-2);
    //                     var followingBills = await sideBarService.getAllBillListData(
    //                         fromDate,
    //                         toDate,
    //                         false,
    //                         initialReportLoad,
    //                         0
    //                     );
    //                     var billList = followingBills.tbilllist;
    //                     var j = 0;
    //                     for (var i = 0; i < billList.length; i++) {
    //                         var objDetails = {
    //                             type: "TBillEx",
    //                             fields: {
    //                                 ID: billList[i].PurchaseOrderID,
    //                                 Deleted: true,
    //                                 // OrderStatus: "Deleted",
    //                                 SupplierName: $('#edtSupplierName').val() || '',
    //                                 BillTotal: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0,
    //                                 TotalAmountInc: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0
    //                             }
    //                         };
    //                         j++;
    //                         document.getElementsByClassName("deleteprogressBarInner")[0].innerHTML = j + '';
    //                         $('.deleteloadingbar').css('width', ((100 / billList.length * j)) + '%').attr('aria-valuenow', ((100 / billList.length * j)));
    //                         var result = await purchaseService.saveBillEx(objDetails);
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
    // 'click .btnDeleteBill2': function (event) {
    //     playDeleteAudio();
    //     let purchaseService = new PurchaseBoardService();
    //     setTimeout(function () {
    //         $('.fullScreenSpin').css('display', 'inline-block');

    //         var url = FlowRouter.current().path;
    //         var getso_id = url.split('?id=');
    //         var currentInvoice = getso_id[getso_id.length - 1];
    //         let billTotal = $('#grandTotal').text();
    //         var objDetails = '';
    //         if (getso_id[1]) {
    //             currentInvoice = parseInt(currentInvoice);
    //             var objDetails = {
    //                 type: "TBillEx",
    //                 fields: {
    //                     ID: currentInvoice,
    //                     Deleted: true,
    //                     // OrderStatus: "Deleted",
    //                     SupplierName: $('#edtSupplierName').val() || '',
    //                     BillTotal: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0,
    //                     TotalAmountInc: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0
    //                 }
    //             };

    //             purchaseService.saveBillEx(objDetails).then(function (objDetails) {

    //                 if (FlowRouter.current().queryParams.trans) {
    //                     FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans);
    //                 } else {
    //                     FlowRouter.go('/billlist?success=true');
    //                 };

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
    //                 LoadingOverlay.hide();
    //             });
    //         } else {
    //             if (FlowRouter.current().queryParams.trans) {
    //                 FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans);
    //             } else {
    //                 FlowRouter.go('/billlist?success=true');
    //             };
    //         }
    //     }, delayTimeAfterSound);
    // },
    // 'click .btnDeleteBill': function (event) {
    //     playDeleteAudio();
    //     let purchaseService = new PurchaseBoardService();
    //     setTimeout(function () {
    //         $('.fullScreenSpin').css('display', 'inline-block');

    //         var url = FlowRouter.current().path;
    //         var getso_id = url.split('?id=');
    //         var currentInvoice = getso_id[getso_id.length - 1];
    //         let billTotal = $('#grandTotal').text();
    //         var objDetails = '';
    //         if (getso_id[1]) {
    //             currentInvoice = parseInt(currentInvoice);
    //             var objDetails = {
    //                 type: "TBillEx",
    //                 fields: {
    //                     ID: currentInvoice,
    //                     Deleted: true,
    //                     // OrderStatus: "Deleted",
    //                     SupplierName: $('#edtSupplierName').val() || '',
    //                     BillTotal: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0,
    //                     TotalAmountInc: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0
    //                 }
    //             };

    //             purchaseService.saveBillEx(objDetails).then(function (objDetails) {

    //                 if (FlowRouter.current().queryParams.trans) {
    //                     FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans);
    //                 } else {
    //                     FlowRouter.go('/billlist?success=true');
    //                 };

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
    //                 LoadingOverlay.hide();
    //             });
    //         } else {
    //             if (FlowRouter.current().queryParams.trans) {
    //                 FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans);
    //             } else {
    //                 FlowRouter.go('/billlist?success=true');
    //             };
    //         }
    //         $('#deleteLineModal').modal('toggle');
    //         $('.modal-backdrop').css('display', 'none');
    //     }, delayTimeAfterSound);
    // },
    // 'click .btnDeleteLine': function (event) {
    //     playDeleteAudio();
    //     let utilityService = new UtilityService();
    //     setTimeout(function () {
    //         let taxcodeList = templateObject.taxraterecords.get();
    //         let selectLineID = $('#selectDeleteLineID').val();
    //         if ($('#tblBillLine tbody>tr').length > 1) {
    //             this.click;

    //             $('#' + selectLineID).closest('tr').remove();
    //             $('.bill_print #' + selectLineID).remove();
    //             let $tblrows = $("#tblBillLine tbody tr");
    //             let $printrows = $(".bill tbody tr");

    //             let lineAmount = 0;
    //             let subGrandTotal = 0;
    //             let taxGrandTotal = 0;
    //             let taxGrandTotalPrint = 0;


    //             $tblrows.each(function (index) {
    //                 var $tblrow = $(this);
    //                 var amount = $tblrow.find(".colAmountExChange").val() || "0";
    //                 var taxcode = $tblrow.find(".lineTaxCode").val() || 0;
    //                 var taxrateamount = 0;
    //                 if (taxcodeList) {
    //                     for (var i = 0; i < taxcodeList.length; i++) {
    //                         if (taxcodeList[i].codename == taxcode) {
    //                             taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
    //                         }
    //                     }
    //                 }


    //                 var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
    //                 var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
    //                 $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
    //                 if (!isNaN(subTotal)) {
    //                     $tblrow.find('.colAmountEx').val(utilityService.modifynegativeCurrencyFormat(subTotal.toFixed(2)));
    //                     subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
    //                     document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal.toFixed(2));
    //                 }

    //                 if (!isNaN(taxTotal)) {
    //                     taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
    //                     document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal.toFixed(2));
    //                 }

    //                 if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
    //                     let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
    //                     document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
    //                     document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
    //                     document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));

    //                 }
    //             });

    //             if ($(".printID").val() == "") {
    //                 $printrows.each(function (index) {
    //                     var $printrows = $(this);
    //                     var amount = $printrows.find("#lineAmount").text() || "0";
    //                     var taxcode = $printrows.find("#lineTaxCode").text() || 0;

    //                     var taxrateamount = 0;
    //                     if (taxcodeList) {
    //                         for (var i = 0; i < taxcodeList.length; i++) {
    //                             if (taxcodeList[i].codename == taxcode) {
    //                                 taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100 || 0;
    //                             }
    //                         }
    //                     }


    //                     var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
    //                     var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
    //                     $printrows.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal))

    //                     if (!isNaN(subTotal)) {
    //                         $printrows.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
    //                         subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
    //                         document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
    //                     }

    //                     if (!isNaN(taxTotal)) {
    //                         taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
    //                     }
    //                     if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
    //                         let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
    //                         document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
    //                         //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //                         document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

    //                     }
    //                 });
    //             }


    //         } else {
    //             this.click;

    //             $('#' + selectLineID + " .lineAccountName").val('');
    //             $('#' + selectLineID + " .lineMemo").text('');
    //             $('#' + selectLineID + " .lineOrdered").val('');
    //             $('#' + selectLineID + " .lineQty").val('');
    //             $('#' + selectLineID + " .lineBo").val('');
    //             $('#' + selectLineID + " .lineCustomField1").text('');
    //             $('#' + selectLineID + " .lineCostPrice").text('');
    //             $('#' + selectLineID + " .lineCustomField2").text('');
    //             $('#' + selectLineID + " .lineTaxRate").text('');
    //             $('#' + selectLineID + " .lineTaxCode").val('');
    //             $('#' + selectLineID + " .lineAmount").val('');
    //             $('#' + selectLineID + " .lineTaxAmount").text('');

    //             document.getElementById("subtotal_tax").innerHTML = Currency + '0.00';
    //             document.getElementById("subtotal_total").innerHTML = Currency + '0.00';
    //             document.getElementById("grandTotal").innerHTML = Currency + '0.00';
    //             document.getElementById("balanceDue").innerHTML = Currency + '0.00';
    //             document.getElementById("totalBalanceDue").innerHTML = Currency + '0.00';



    //         }

    //         $('#deleteLineModal').modal('toggle');
    //     }, delayTimeAfterSound);
    // },
    'click .btnSaveSettings': function (event) {
        playSaveAudio();
        setTimeout(function () {
            $('#myModal4').modal('toggle');
        }, delayTimeAfterSound);
    },
    // 'click .btnSave': (event, templateObject) => {
    //     playSaveAudio();
    //     let uploadedItems = templateObject.uploadedFiles.get();
    //     setTimeout(function () {
    //         saveCurrencyHistory();

    //         let suppliername = $('#edtSupplierName');

    //         let termname = $('#sltTerms').val() || '';
    //         if (termname === '') {
    //             swal({
    //                 title: "Terms has not been selected!",
    //                 text: '',
    //                 type: 'warning',
    //             }).then((result) => {
    //                 if (result.value) {
    //                     $('#sltTerms').focus();
    //                 } else if (result.dismiss == 'cancel') {

    //                 }
    //             });
    //             event.preventDefault();
    //             return false;
    //         }
    //         if (suppliername.val() === '') {
    //             swal({
    //                 title: "Supplier has not been selected!",
    //                 text: '',
    //                 type: 'warning',
    //             }).then((result) => {
    //                 if (result.value) {
    //                     $('#edtSupplierName').focus();
    //                 } else if (result.dismiss == 'cancel') {

    //                 }
    //             });
    //             e.preventDefault();
    //         } else {
    //             $('.fullScreenSpin').css('display', 'inline-block');
    //             var splashLineArray = new Array();
    //             let lineItemsForm = [];
    //             let lineItemObjForm = {};
    //             $('#tblBillLine > tbody > tr').each(function () {
    //                 var lineID = this.id;
    //                 let tdaccount = $('#' + lineID + " .lineAccountName").val();
    //                 let tddmemo = $('#' + lineID + " .lineMemo").text();
    //                 let tdamount = $('#' + lineID + " .lineAmount").val();
    //                 let tdCustomerJob = $('#' + lineID + " .lineCustomerJob").val();
    //                 let tdtaxrate = $('#' + lineID + " .lineTaxRate").text();
    //                 let tdtaxCode = $('#' + lineID + " .lineTaxCode").val() || "NT";

    //                 if (tdaccount != "") {

    //                     lineItemObjForm = {
    //                         type: "TBillLine",
    //                         fields: {
    //                             AccountName: tdaccount || '',
    //                             ProductDescription: tddmemo || '',
    //                             CustomerJob: tdCustomerJob || '',
    //                             LineCost: Number(tdamount.replace(/[^0-9.-]+/g, "")) || 0,
    //                             LineTaxCode: tdtaxCode || '',
    //                             LineClassName: $('#sltDept').val() || defaultDept
    //                         }
    //                     };
    //                     lineItemsForm.push(lineItemObjForm);
    //                     splashLineArray.push(lineItemObjForm);
    //                 }
    //             });
    //             let getchkcustomField1 = true;
    //             let getchkcustomField2 = true;
    //             let getcustomField1 = $('.customField1Text').html();
    //             let getcustomField2 = $('.customField2Text').html();
    //             if ($('#formCheck-one').is(':checked')) {
    //                 getchkcustomField1 = false;
    //             }
    //             if ($('#formCheck-two').is(':checked')) {
    //                 getchkcustomField2 = false;
    //             }

    //             let supplier = $('#edtSupplierName').val();
    //             let supplierEmail = $('#edtSupplierEmail').val();
    //             let billingAddress = $('#txabillingAddress').val();

    //             var saledateTime = new Date($("#dtSODate").datepicker("getDate"));
    //             var duedateTime = new Date($("#dtDueDate").datepicker("getDate"));

    //             let saleDate = saledateTime.getFullYear() + "-" + (saledateTime.getMonth() + 1) + "-" + saledateTime.getDate();
    //             let dueDate = duedateTime.getFullYear() + "-" + (duedateTime.getMonth() + 1) + "-" + duedateTime.getDate();

    //             let poNumber = $('#ponumber').val();
    //             let reference = $('#edtRef').val();

    //             let departement = $('#sltVia').val();
    //             let shippingAddress = $('#txaShipingInfo').val();
    //             let comments = $('#txaComment').val();
    //             let pickingInfrmation = $('#txapickmemo').val();

    //             let saleCustField1 = $('#edtSaleCustField1').val();
    //             let saleCustField2 = $('#edtSaleCustField2').val();
    //             let orderStatus = $('#edtStatus').val();
    //             let billTotal = $('#grandTotal').text();

    //             var url = FlowRouter.current().path;
    //             var getso_id = url.split('?id=');
    //             var currentBill = getso_id[getso_id.length - 1];

    //             var currencyCode = $(".sltCurrency").val() || CountryAbbr;
    //             let ForeignExchangeRate = $('#exchange_rate').val() || 0;
    //             let foreignCurrencyFields = {}
    //             if (FxGlobalFunctions.isCurrencyEnabled()) {
    //                 foreignCurrencyFields = {
    //                     ForeignExchangeCode: currencyCode,
    //                     ForeignExchangeRate: parseFloat(ForeignExchangeRate),
    //                 }
    //             }

    //             var objDetails = '';
    //             if ($('#sltDept').val() === '') {
    //                 swal({
    //                     title: "Department has not been selected!",
    //                     text: '',
    //                     type: 'warning',
    //                 }).then((result) => {
    //                     if (result.value) {
    //                         $('#sltDept').focus();
    //                     } else if (result.dismiss == 'cancel') {

    //                     }
    //                 });
    //                 LoadingOverlay.hide();
    //                 event.preventDefault();
    //                 return false;
    //             }
    //             if (getso_id[1]) {
    //                 currentBill = parseInt(currentBill);
    //                 objDetails = {
    //                     type: "TBillEx",
    //                     fields: {
    //                         ID: currentBill,
    //                         SupplierName: supplier,
    //                         // ForeignExchangeCode: currencyCode,
    //                         // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
    //                         ...foreignCurrencyFields,
    //                         Lines: splashLineArray,
    //                         OrderTo: billingAddress,
    //                         Deleted: false,

    //                         OrderDate: saleDate,

    //                         SupplierInvoiceNumber: poNumber,
    //                         ConNote: reference,
    //                         TermsName: termname,
    //                         Shipping: departement,
    //                         ShipTo: shippingAddress,
    //                         Comments: comments,


    //                         SalesComments: pickingInfrmation,
    //                         Attachments: uploadedItems,
    //                         OrderStatus: $('#sltStatus').val(),
    //                         BillTotal: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0,
    //                         TotalAmountInc: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0
    //                     }
    //                 };
    //             } else {
    //                 objDetails = {
    //                     type: "TBillEx",
    //                     fields: {
    //                         SupplierName: supplier,
    //                         // ForeignExchangeCode: currencyCode,
    //                         // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
    //                         ...foreignCurrencyFields,
    //                         Lines: splashLineArray,
    //                         OrderTo: billingAddress,
    //                         OrderDate: saleDate,
    //                         Deleted: false,

    //                         SupplierInvoiceNumber: poNumber,
    //                         ConNote: reference,
    //                         TermsName: termname,
    //                         Shipping: departement,
    //                         ShipTo: shippingAddress,
    //                         Comments: comments,


    //                         SalesComments: pickingInfrmation,
    //                         Attachments: uploadedItems,
    //                         OrderStatus: $('#sltStatus').val(),
    //                         BillTotal: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0,
    //                         TotalAmountInc: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0
    //                     }
    //                 };
    //             }
    //             if (splashLineArray.length > 0) {

    //             } else {
    //                 // swal('Account name has not been selected!', '', 'warning');
    //                 // LoadingOverlay.hide();
    //                 // event.preventDefault();
    //                 // return false;
    //             };
    //             purchaseService.saveBillEx(objDetails).then(function (objDetails) {
    //                 if (localStorage.getItem("enteredURL") != null) {
    //                     FlowRouter.go(localStorage.getItem("enteredURL"));
    //                     localStorage.removeItem("enteredURL");
    //                     return;
    //                 }

    //                 var supplierID = $('#edtSupplierEmail').attr('supplierid');


    //                 $('#html-2-pdfwrapper').css('display', 'block');
    //                 $('.pdfCustomerName').html($('#edtSupplierEmail').val());
    //                 $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));
    //                 var ponumber = $('#ponumber').val() || '.';
    //                 $('.po').text(ponumber);
    //                 async function addAttachment() {
    //                     let attachment = [];
    //                     let invoiceId = objDetails.fields.ID;
    //                     FlowRouter.go('/billlist?success=true');
    //                     let encodedPdf = await generatePdfForMail(invoiceId);
    //                     let pdfObject = "";

    //                     let base64data = encodedPdf.split(',')[1];
    //                     pdfObject = {
    //                         filename: 'Bill-' + invoiceId + '.pdf',
    //                         content: base64data,
    //                         encoding: 'base64'
    //                     };
    //                     attachment.push(pdfObject);
    //                     let erpInvoiceId = objDetails.fields.ID;
    //                     let mailFromName = localStorage.getItem('vs1companyName');
    //                     let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
    //                     let customerEmailName = $('#edtSupplierName').val();
    //                     let checkEmailData = $('#edtSupplierEmail').val();
    //                     let grandtotal = $('#grandTotal').html();
    //                     let amountDueEmail = $('#totalBalanceDue').html();
    //                     let emailDueDate = $("#dtDueDate").val();
    //                     let mailSubject = 'Bill ' + erpInvoiceId + ' from ' + mailFromName + ' for ' + customerEmailName;
    //                     let mailBody = "Hi " + customerEmailName + ",\n\n Here's bill " + erpInvoiceId + " for  " + grandtotal + "." +
    //                         "\n\nThe amount outstanding of " + amountDueEmail + " is due on " + emailDueDate + "." +
    //                         "\n\nIf you have any questions, please let us know : " + mailFrom + ".\n\nThanks,\n" + mailFromName;
    //                     var htmlmailBody = '<table align="center" border="0" cellpadding="0" cellspacing="0" width="600">' +
    //                         '    <tr>' +
    //                         '        <td align="center" bgcolor="#54c7e2" style="padding: 40px 0 30px 0;">' +
    //                         '        <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" alt="VS1 Cloud" width="250px" style="display: block;" />' +
    //                         '        </td>' +
    //                         '    </tr>' +
    //                         '    <tr>' +
    //                         '        <td style="padding: 40px 30px 40px 30px;">' +
    //                         '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
    //                         '                <tr>' +
    //                         '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 20px 0;">' +
    //                         '                        Hello there <span>' + customerEmailName + '</span>,' +
    //                         '                    </td>' +
    //                         '                </tr>' +
    //                         '                <tr>' +
    //                         '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
    //                         '                        Please find bill <span>' + erpInvoiceId + '</span> attached below.' +
    //                         '                    </td>' +
    //                         '                </tr>' +
    //                         '                <tr>' +
    //                         '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
    //                         '                        The amount outstanding of <span>' + amountDueEmail + '</span> is due on <span>' + emailDueDate + '</span>' +
    //                         '                    </td>' +
    //                         '                </tr>' +
    //                         '                <tr>' +
    //                         '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 30px 0;">' +
    //                         '                        Kind regards,' +
    //                         '                        <br>' +
    //                         '                        ' + mailFromName + '' +
    //                         '                    </td>' +
    //                         '                </tr>' +
    //                         '            </table>' +
    //                         '        </td>' +
    //                         '    </tr>' +
    //                         '    <tr>' +
    //                         '        <td bgcolor="#00a3d3" style="padding: 30px 30px 30px 30px;">' +
    //                         '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
    //                         '                <tr>' +
    //                         '                    <td width="50%" style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">' +
    //                         '                        If you have any question, please do not hesitate to contact us.' +
    //                         '                    </td>' +
    //                         '                    <td align="right">' +
    //                         '                        <a style="border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; background-color: #4CAF50;" href="mailto:' + mailFrom + '">Contact Us</a>' +
    //                         '                    </td>' +
    //                         '                </tr>' +
    //                         '            </table>' +
    //                         '        </td>' +
    //                         '    </tr>' +
    //                         '</table>';

    //                     if (($('.chkEmailCopy').is(':checked')) && ($('.chkEmailRep').is(':checked'))) {
    //                         Meteor.call('sendEmail', {
    //                             from: "" + mailFromName + " <" + mailFrom + ">",
    //                             to: checkEmailData,
    //                             subject: mailSubject,
    //                             text: '',
    //                             html: htmlmailBody,
    //                             attachments: attachment
    //                         }, function (error, result) {
    //                             if (error && error.error === "error") {


    //                             } else {

    //                             }
    //                         });

    //                         Meteor.call('sendEmail', {
    //                             from: "" + mailFromName + " <" + mailFrom + ">",
    //                             to: mailFrom,
    //                             subject: mailSubject,
    //                             text: '',
    //                             html: htmlmailBody,
    //                             attachments: attachment
    //                         }, function (error, result) {
    //                             if (error && error.error === "error") {
    //                                 if (FlowRouter.current().queryParams.trans) {
    //                                     FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans);
    //                                 } else {
    //                                     FlowRouter.go('/billlist?success=true');
    //                                 };
    //                             } else {
    //                                 $('#html-2-pdfwrapper').css('display', 'none');
    //                                 swal({
    //                                     title: 'SUCCESS',
    //                                     text: "Email Sent To Supplier: " + checkEmailData + " and User: " + mailFrom + "",
    //                                     type: 'success',
    //                                     showCancelButton: false,
    //                                     confirmButtonText: 'OK'
    //                                 }).then((result) => {
    //                                     if (result.value) {
    //                                         if (FlowRouter.current().queryParams.trans) {
    //                                             FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans);
    //                                         } else {
    //                                             FlowRouter.go('/billlist?success=true');
    //                                         };
    //                                     } else if (result.dismiss === 'cancel') {

    //                                     }
    //                                 });

    //                                 LoadingOverlay.hide();
    //                             }
    //                         });

    //                         let values = [];
    //                         let basedOnTypeStorages = Object.keys(localStorage);
    //                         basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
    //                             let employeeId = storage.split('_')[2];
    //                             // return storage.includes('BasedOnType_') && employeeId == localStorage.getItem('mySessionEmployeeLoggedID')
    //                             return storage.includes('BasedOnType_');
    //                         });
    //                         let i = basedOnTypeStorages.length;
    //                         if (i > 0) {
    //                             while (i--) {
    //                                 values.push(localStorage.getItem(basedOnTypeStorages[i]));
    //                             }
    //                         }
    //                         values.forEach(value => {
    //                             let reportData = JSON.parse(value);
    //                             let temp = { ...reportData };

    //                             temp.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
    //                             reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
    //                             temp.attachments = attachment;
    //                             if (temp.BasedOnType.includes("S")) {
    //                                 if (temp.FormID == 1) {
    //                                     let formIds = temp.FormIDs.split(',');
    //                                     if (formIds.includes("12")) {
    //                                         temp.FormID = 12;
    //                                         Meteor.call('sendNormalEmail', temp);
    //                                     }
    //                                 } else {
    //                                     if (temp.FormID == 12)
    //                                         Meteor.call('sendNormalEmail', temp);
    //                                 }
    //                             }
    //                         });

    //                     } else if (($('.chkEmailCopy').is(':checked'))) {
    //                         Meteor.call('sendEmail', {
    //                             from: "" + mailFromName + " <" + mailFrom + ">",
    //                             to: checkEmailData,
    //                             subject: mailSubject,
    //                             text: '',
    //                             html: htmlmailBody,
    //                             attachments: attachment
    //                         }, function (error, result) {
    //                             if (error && error.error === "error") {
    //                                 FlowRouter.go('/billlist?success=true');
    //                             } else {
    //                                 $('#html-2-pdfwrapper').css('display', 'none');
    //                                 swal({
    //                                     title: 'SUCCESS',
    //                                     text: "Email Sent To Supplier: " + checkEmailData + " ",
    //                                     type: 'success',
    //                                     showCancelButton: false,
    //                                     confirmButtonText: 'OK'
    //                                 }).then((result) => {
    //                                     if (result.value) {
    //                                         if (FlowRouter.current().queryParams.trans) {
    //                                             FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
    //                                         } else {
    //                                             FlowRouter.go('/billlist?success=true');
    //                                         };
    //                                     } else if (result.dismiss === 'cancel') {

    //                                     }
    //                                 });

    //                                 LoadingOverlay.hide();
    //                             }
    //                         });

    //                         let values = [];
    //                         let basedOnTypeStorages = Object.keys(localStorage);
    //                         basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
    //                             let employeeId = storage.split('_')[2];
    //                             // return storage.includes('BasedOnType_') && employeeId == localStorage.getItem('mySessionEmployeeLoggedID')
    //                             return storage.includes('BasedOnType_')
    //                         });
    //                         let i = basedOnTypeStorages.length;
    //                         if (i > 0) {
    //                             while (i--) {
    //                                 values.push(localStorage.getItem(basedOnTypeStorages[i]));
    //                             }
    //                         }
    //                         values.forEach(value => {
    //                             let reportData = JSON.parse(value);
    //                             reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
    //                             reportData.attachments = attachment;
    //                             if (reportData.BasedOnType.includes("S")) {
    //                                 if (reportData.FormID == 1) {
    //                                     let formIds = reportData.FormIDs.split(',');
    //                                     if (formIds.includes("12")) {
    //                                         reportData.FormID = 12;
    //                                         Meteor.call('sendNormalEmail', reportData);
    //                                     }
    //                                 } else {
    //                                     if (reportData.FormID == 12)
    //                                         Meteor.call('sendNormalEmail', reportData);
    //                                 }
    //                             }
    //                         });

    //                     } else if (($('.chkEmailRep').is(':checked'))) {
    //                         Meteor.call('sendEmail', {
    //                             from: "" + mailFromName + " <" + mailFrom + ">",
    //                             to: mailFrom,
    //                             subject: mailSubject,
    //                             text: '',
    //                             html: htmlmailBody,
    //                             attachments: attachment
    //                         }, function (error, result) {
    //                             if (error && error.error === "error") {
    //                                 FlowRouter.go('/billlist?success=true');
    //                             } else {
    //                                 $('#html-2-pdfwrapper').css('display', 'none');
    //                                 swal({
    //                                     title: 'SUCCESS',
    //                                     text: "Email Sent To User: " + mailFrom + " ",
    //                                     type: 'success',
    //                                     showCancelButton: false,
    //                                     confirmButtonText: 'OK'
    //                                 }).then((result) => {
    //                                     if (result.value) {
    //                                         if (FlowRouter.current().queryParams.trans) {
    //                                             FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
    //                                         } else {
    //                                             FlowRouter.go('/billlist?success=true');
    //                                         };
    //                                     } else if (result.dismiss === 'cancel') {

    //                                     }
    //                                 });

    //                                 LoadingOverlay.hide();
    //                             }
    //                         });

    //                         let values = [];
    //                         let basedOnTypeStorages = Object.keys(localStorage);
    //                         basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
    //                             let employeeId = storage.split('_')[2];
    //                             return storage.includes('BasedOnType_');
    //                             // return storage.includes('BasedOnType_') && employeeId == localStorage.getItem('mySessionEmployeeLoggedID')
    //                         });
    //                         let i = basedOnTypeStorages.length;
    //                         if (i > 0) {
    //                             while (i--) {
    //                                 values.push(localStorage.getItem(basedOnTypeStorages[i]));
    //                             }
    //                         }
    //                         values.forEach(value => {
    //                             let reportData = JSON.parse(value);
    //                             reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
    //                             reportData.attachments = attachment;
    //                             if (reportData.BasedOnType.includes("S")) {
    //                                 if (reportData.FormID == 1) {
    //                                     let formIds = reportData.FormIDs.split(',');
    //                                     if (formIds.includes("12")) {
    //                                         reportData.FormID = 12;
    //                                         Meteor.call('sendNormalEmail', reportData);
    //                                     }
    //                                 } else {
    //                                     if (reportData.FormID == 12)
    //                                         Meteor.call('sendNormalEmail', reportData);
    //                                 }
    //                             }
    //                         });

    //                     } else {


    //                         let values = [];
    //                         let basedOnTypeStorages = Object.keys(localStorage);
    //                         basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
    //                             let employeeId = storage.split('_')[2];
    //                             return storage.includes('BasedOnType_');
    //                             // return storage.includes('BasedOnType_') && employeeId == localStorage.getItem('mySessionEmployeeLoggedID')
    //                         });
    //                         let i = basedOnTypeStorages.length;
    //                         if (i > 0) {
    //                             while (i--) {
    //                                 values.push(localStorage.getItem(basedOnTypeStorages[i]));
    //                             }
    //                         }
    //                         values.forEach(value => {
    //                             let reportData = JSON.parse(value);
    //                             reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
    //                             reportData.attachments = attachment;
    //                             if (reportData.BasedOnType.includes("S")) {
    //                                 if (reportData.FormID == 1) {
    //                                     let formIds = reportData.FormIDs.split(',');
    //                                     if (formIds.includes("12")) {
    //                                         reportData.FormID = 12;
    //                                         Meteor.call('sendNormalEmail', reportData);
    //                                     }
    //                                 } else {
    //                                     if (reportData.FormID == 12)
    //                                         Meteor.call('sendNormalEmail', reportData);
    //                                 }
    //                             }
    //                         });
    //                         if (FlowRouter.current().queryParams.trans) {
    //                             FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
    //                         } else {
    //                             FlowRouter.go('/billlist?success=true');
    //                         };
    //                     };

    //                 }
    //                 addAttachment();

    //                 function generatePdfForMail(invoiceId) {
    //                     let file = "Bill-" + invoiceId + ".pdf"
    //                     return new Promise((resolve, reject) => {
    //                         let completeTabRecord;
    //                         let doc = new jsPDF('p', 'pt', 'a4');
    //                         var source = document.getElementById('html-2-pdfwrapper');
    //                         var opt = {
    //                             margin: 0,
    //                             filename: file,
    //                             image: {
    //                                 type: 'jpeg',
    //                                 quality: 0.98
    //                             },
    //                             html2canvas: {
    //                                 scale: 2
    //                             },
    //                             jsPDF: {
    //                                 unit: 'in',
    //                                 format: 'a4',
    //                                 orientation: 'portrait'
    //                             }
    //                         }
    //                         resolve(html2pdf().set(opt).from(source).toPdf().output('datauristring'));

    //                     });
    //                 }
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
    //                 LoadingOverlay.hide();
    //             });
    //         }
    //     }, delayTimeAfterSound);
    // },
    'click .chkAccountName': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colAccountName').addClass('showColumn');
            $('.colAccountName').removeClass('hiddenColumn');
        } else {
            $('.colAccountName').addClass('hiddenColumn');
            $('.colAccountName').removeClass('showColumn');
        }
    },
    'click .chkMemo': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colMemo').addClass('showColumn');
            $('.colMemo').removeClass('hiddenColumn');
        } else {
            $('.colMemo').addClass('hiddenColumn');
            $('.colMemo').removeClass('showColumn');
        }
    },
    'click .chkCustomerJob': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colCustomerJob').addClass('showColumn');
            $('.colCustomerJob').removeClass('hiddenColumn');
        } else {
            $('.colCustomerJob').addClass('hiddenColumn');
            $('.colCustomerJob').removeClass('showColumn');
        }
    },
    'click .chkCustomField1': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colCustomField1').addClass('showColumn');
            $('.colCustomField1').removeClass('hiddenColumn');
        } else {
            $('.colCustomField1').addClass('hiddenColumn');
            $('.colCustomField1').removeClass('showColumn');
        }
    },
    'click .chkCustomField2': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colCustomField2').addClass('showColumn');
            $('.colCustomField2').removeClass('hiddenColumn');
        } else {
            $('.colCustomField2').addClass('hiddenColumn');
            $('.colCustomField2').removeClass('showColumn');
        }
    },
    // 'click .chkTaxRate': function (event) {
    //     if ($(event.target).is(':checked')) {
    //         $('.colTaxRate').addClass('showColumn');
    //         $('.colTaxRate').removeClass('hiddenColumn');
    //     } else {
    //         $('.colTaxRate').addClass('hiddenColumn');
    //         $('.colTaxRate').removeClass('showColumn');
    //     }
    // },
    // // displaysettings
    // 'click .chkTaxCode': function (event) {
    //     if ($(event.target).is(':checked')) {
    //         $('.colTaxCode').addClass('showColumn');
    //         $('.colTaxCode').removeClass('hiddenColumn');
    //     } else {
    //         $('.colTaxCode').addClass('hiddenColumn');
    //         $('.colTaxCode').removeClass('showColumn');
    //     }
    // },
    // 'click .chkTaxAmount': function (event) {
    //     if ($(event.target).is(':checked')) {
    //         $('.colTaxAmount').addClass('showColumn');
    //         $('.colTaxAmount').removeClass('hiddenColumn');
    //     } else {
    //         $('.colTaxAmount').addClass('hiddenColumn');
    //         $('.colTaxAmount').removeClass('showColumn');
    //     }
    // },

    // 'click .chkAmountEx': function (event) {
    //     if ($(event.target).is(':checked')) {
    //         $('.chkAmountInc').prop("checked", false);

    //         $('.colAmountInc').addClass('hiddenColumn');
    //         $('.colAmountInc').removeClass('showColumn');

    //         $('.colAmountEx').addClass('showColumn');
    //         $('.colAmountEx').removeClass('hiddenColumn');
    //     } else {
    //         $('.chkAmountInc').prop("checked", true);

    //         $('.colAmountEx').addClass('hiddenColumn');
    //         $('.colAmountEx').removeClass('showColumn');

    //         $('.colAmountInc').addClass('showColumn');
    //         $('.colAmountInc').removeClass('hiddenColumn');
    //     }
    // },
    // 'click .chkAmountInc': function (event) {
    //     if ($(event.target).is(':checked')) {
    //         $('.chkAmountEx').prop("checked", false);

    //         $('.colAmountEx').addClass('hiddenColumn');
    //         $('.colAmountEx').removeClass('showColumn');

    //         $('.colAmountInc').addClass('showColumn');
    //         $('.colAmountInc').removeClass('hiddenColumn');
    //     } else {
    //         $('.chkAmountEx').prop("checked", true);

    //         $('.colAmountInc').addClass('hiddenColumn');
    //         $('.colAmountInc').removeClass('showColumn');

    //         $('.colAmountEx').addClass('showColumn');
    //         $('.colAmountEx').removeClass('hiddenColumn');
    //     }
    // },
    // "click .chkFixedAsset": function (event) {
    //     if ($(event.target).is(':checked')) {
    //         $('.colFixedAsset').addClass('showColumn');
    //         $('.colFixedAsset').removeClass('hiddenColumn');
    //     } else {
    //         $('.colFixedAsset').addClass('hiddenColumn');
    //         $('.colFixedAsset').removeClass('showColumn');
    //     }
    // },

    // display settings
    // 'change .rngRangeFixedAsset': function (event) {
    //     let range = $(event.target).val();
    //     $('.colFixedAsset').css('width', range);
    // },
    'change .rngRangeAccountName': function (event) {

        let range = $(event.target).val();
        $(".spWidthAccountName").html(range);
        $('.colAccountName').css('width', range);

    },
    'change .rngRangeMemo': function (event) {

        let range = $(event.target).val();
        $(".spWidthMemo").html(range);
        $('.colMemo').css('width', range);

    },
    // 'change .rngRangeAmount': function(event) {

    //     let range = $(event.target).val();
    //     $(".spWidthAmount").html(range);
    //     $('.colAmount').css('width', range);

    // },
    // 'change .rngRangeAmountInc': function (event) {
    //     let range = $(event.target).val();
    //     //$(".spWidthAmount").html(range);
    //     $('.colAmountInc').css('width', range);
    // },
    // 'change .rngRangeAmountEx': function (event) {
    //     let range = $(event.target).val();
    //     //$(".spWidthAmount").html(range);
    //     $('.colAmountEx').css('width', range);
    // },
    // 'change .rngRangeTaxRate': function (event) {

    //     let range = $(event.target).val();
    //     $(".spWidthTaxRate").html(range);
    //     $('.colTaxRate').css('width', range);

    // },
    // 'change .rngRangeTaxCode': function (event) {

    //     let range = $(event.target).val();
    //     $(".spWidthTaxCode").html(range);
    //     $('.colTaxCode').css('width', range);

    // },
    'change .rngRangeCustomField1': function (event) {

        let range = $(event.target).val();
        $(".spWidthCustomField1").html(range);
        $('.colCustomField1').css('width', range);

    },
    'change .rngRangeCustomField2': function (event) {

        let range = $(event.target).val();
        $(".spWidthCustomField2").html(range);
        $('.colCustomField2').css('width', range);

    },
    'change .rngRangeCustomerJob': function (event) {

        let range = $(event.target).val();
        $(".spWidthCustomerJob").html(range);
        $('.colCustomerJob').css('width', range);

    },
    // 'blur .divcolumn': function (event) {
    //     let columData = $(event.target).html();
    //     let columHeaderUpdate = $(event.target).attr("valueupdate");
    //     // $("" + columHeaderUpdate + "").html(columData);
    //     $("th.col" + columHeaderUpdate + "").html(columData);

    // },
    // 'click .btnResetSettings': function (event) {
    //     var getcurrentCloudDetails = CloudUser.findOne({
    //         _id: localStorage.getItem('mycloudLogonID'),
    //         clouddatabaseID: localStorage.getItem('mycloudLogonDBID')
    //     });
    //     if (getcurrentCloudDetails) {
    //         if (getcurrentCloudDetails._id.length > 0) {
    //             var clientID = getcurrentCloudDetails._id;
    //             var clientUsername = getcurrentCloudDetails.cloudUsername;
    //             var clientEmail = getcurrentCloudDetails.cloudEmail;
    //             var checkPrefDetails = CloudPreference.findOne({
    //                 userid: clientID,
    //                 PrefName: 'billcard'
    //             });
    //             if (checkPrefDetails) {
    //                 CloudPreference.remove({
    //                     _id: checkPrefDetails._id
    //                 }, function (err, idTag) {
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
    //     let tempObj = Template.instance();
    //     let attachmentID = parseInt(event.target.id.split('remove-attachment-')[1]);
    //     if (tempObj.$("#confirm-action-" + attachmentID).length) {
    //         tempObj.$("#confirm-action-" + attachmentID).remove();
    //     } else {
    //         let actionElement = '<div class="confirm-action" id="confirm-action-' + attachmentID + '"><a class="confirm-delete-attachment btn btn-default" id="delete-attachment-' + attachmentID + '">' +
    //             'Delete</a><button class="save-to-library btn btn-default">Remove & save to File Library</button></div>';
    //         tempObj.$('#attachment-name-' + attachmentID).append(actionElement);
    //     }
    //     tempObj.$("#new-attachment2-tooltip").show();

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
    //     } else if (type === 'application/vnd.ms-excel' || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    //         previewFile.class = 'excel-class';
    //     } else if (type === 'application/vnd.ms-powerpoint' || type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    //         previewFile.class = 'ppt-class';
    //     } else if (type === 'application/vnd.oasis.opendocument.formula' || type === 'text/csv' || type === 'text/plain' || type === 'text/rtf') {
    //         previewFile.class = 'txt-class';
    //     } else if (type === 'application/zip' || type === 'application/rar' || type === 'application/x-zip-compressed' || type === 'application/x-zip,application/x-7z-compressed') {
    //         previewFile.class = 'zip-class';
    //     } else {
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
    //     let tempObj = Template.instance();
    //     tempObj.$("#new-attachment2-tooltip").show();
    //     let attachmentID = parseInt(event.target.id.split('delete-attachment-')[1]);
    //     let uploadedArray = tempObj.uploadedFiles.get();
    //     let attachmentCount = tempObj.attachmentCount.get();
    //     $('#attachment-upload').val('');
    //     uploadedArray.splice(attachmentID, 1);
    //     tempObj.uploadedFiles.set(uploadedArray);
    //     attachmentCount--;
    //     if (attachmentCount === 0) {
    //         let elementToAdd = '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
    //         $('#file-display').html(elementToAdd);
    //     }
    //     tempObj.attachmentCount.set(attachmentCount);
    //     if (uploadedArray.length > 0) {
    //         let utilityService = new UtilityService();
    //         utilityService.showUploadedAttachment(uploadedArray);
    //     } else {
    //         $(".attchment-tooltip").show();
    //     }
    // },
    // 'click .save-to-library': function (event, ui) {
    //     $('.confirm-delete-attachment').trigger('click');
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
    'click #btnPayment': function () {
        var currenturl = window.location.href;
        var getcurrent_id = currenturl.split('?id=');
        var currentId = getcurrent_id[getcurrent_id.length - 1];

        if (getcurrent_id[1]) {
            window.open('/supplierpaymentcard?billid=' + currentId, '_self');
        } else {
            let suppliername = $('#edtSupplierName');
            let purchaseService = new PurchaseBoardService();
            let termname = $('#sltTerms').val() || '';
            if (termname === '') {
                swal('Terms has not been selected!', '', 'warning');
                event.preventDefault();
                return false;
            }
            if (suppliername.val() === '') {
                swal('Supplier has not been selected!', '', 'warning');
                e.preventDefault();
            } else {

                $('.fullScreenSpin').css('display', 'inline-block');
                var splashLineArray = new Array();
                let lineItemsForm = [];
                let lineItemObjForm = {};
                $('#tblBillLine > tbody > tr').each(function () {
                    var lineID = this.id;
                    let tdaccount = $('#' + lineID + " .lineAccountName").val();
                    let tddmemo = $('#' + lineID + " .lineMemo").text();
                    let tdamount = $('#' + lineID + " .lineAmount").val();
                    let tdCustomerJob = $('#' + lineID + " .lineCustomerJob").val();
                    let tdtaxrate = $('#' + lineID + " .lineTaxRate").text();
                    let tdtaxCode = $('#' + lineID + " .lineTaxCode").val() || "NT";

                    if (tdaccount != "") {

                        lineItemObjForm = {
                            type: "TBillLine",
                            fields: {
                                AccountName: tdaccount || '',
                                ProductDescription: tddmemo || '',
                                CustomerJob: tdCustomerJob || '',


                                LineCost: Number(tdamount.replace(/[^0-9.-]+/g, "")) || 0,
                                LineTaxCode: tdtaxCode || '',
                                LineClassName: $('#sltDept').val() || defaultDept
                            }
                        };
                        lineItemsForm.push(lineItemObjForm);
                        splashLineArray.push(lineItemObjForm);
                    }
                });
                let getchkcustomField1 = true;
                let getchkcustomField2 = true;
                let getcustomField1 = $('.customField1Text').html();
                let getcustomField2 = $('.customField2Text').html();
                if ($('#formCheck-one').is(':checked')) {
                    getchkcustomField1 = false;
                }
                if ($('#formCheck-two').is(':checked')) {
                    getchkcustomField2 = false;
                }

                let supplier = $('#edtSupplierName').val();
                let supplierEmail = $('#edtSupplierEmail').val();
                let billingAddress = $('#txabillingAddress').val();


                var saledateTime = new Date($("#dtSODate").datepicker("getDate"));
                var duedateTime = new Date($("#dtDueDate").datepicker("getDate"));

                let saleDate = saledateTime.getFullYear() + "-" + (saledateTime.getMonth() + 1) + "-" + saledateTime.getDate();
                let dueDate = duedateTime.getFullYear() + "-" + (duedateTime.getMonth() + 1) + "-" + duedateTime.getDate();

                let poNumber = $('#ponumber').val();
                let reference = $('#edtRef').val();

                let departement = $('#sltVia').val();
                let shippingAddress = $('#txaShipingInfo').val();
                let comments = $('#txaComment').val();
                let pickingInfrmation = $('#txapickmemo').val();
                let billTotal = $('#grandTotal').text();

                let saleCustField1 = $('#edtSaleCustField1').val();
                let saleCustField2 = $('#edtSaleCustField2').val();
                var url = FlowRouter.current().path;
                var getso_id = url.split('?id=');
                var currentBill = getso_id[getso_id.length - 1];
                let uploadedItems = templateObject.uploadedFiles.get();
                var currencyCode = $(".sltCurrency").val() || CountryAbbr;
                let ForeignExchangeRate = $('#exchange_rate').val() || 0;
                var objDetails = '';
                if (getso_id[1]) {
                    currentBill = parseInt(currentBill);
                    objDetails = {
                        type: "TBillEx",
                        fields: {
                            ID: currentBill,
                            SupplierName: supplier,
                            // ForeignExchangeCode: currencyCode,
                            // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                            ...foreignCurrencyFields,
                            Lines: splashLineArray,
                            OrderTo: billingAddress,
                            OrderDate: saleDate,
                            DueDate: dueDate,
                            SupplierInvoiceNumber: poNumber,
                            ConNote: reference,
                            TermsName: termname,
                            Shipping: departement,
                            ShipTo: shippingAddress,
                            Comments: comments,
                            Deleted: false,


                            SalesComments: pickingInfrmation,
                            Attachments: uploadedItems,
                            OrderStatus: $('#sltStatus').val(),
                            BillTotal: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0,
                            TotalAmountInc: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0
                        }
                    };
                } else {
                    objDetails = {
                        type: "TBillEx",
                        fields: {
                            SupplierName: supplier,
                            // ForeignExchangeCode: currencyCode,
                            // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                            ...foreignCurrencyFields,
                            Lines: splashLineArray,
                            OrderTo: billingAddress,
                            OrderDate: saleDate,
                            Deleted: false,

                            SupplierInvoiceNumber: poNumber,
                            ConNote: reference,
                            TermsName: termname,
                            Shipping: departement,
                            ShipTo: shippingAddress,
                            Comments: comments,


                            SalesComments: pickingInfrmation,
                            Attachments: uploadedItems,
                            OrderStatus: $('#sltStatus').val(),
                            BillTotal: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0,
                            TotalAmountInc: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0
                        }
                    };
                }

                if (splashLineArray.length > 0) {

                } else {
                    // swal('Account name has not been selected!', '', 'warning');
                    // LoadingOverlay.hide();
                    // event.preventDefault();
                    // return false;
                }

                purchaseService.saveBillEx(objDetails).then(function (objDetails) {
                    var supplierID = $('#edtSupplierEmail').attr('supplierid');
                    if (supplierID !== " ") {
                        let supplierEmailData = {
                            type: "TSupplier",
                            fields: {
                                ID: supplierID,
                                Email: supplierEmail
                            }
                        }
                        purchaseService.saveSupplierEmail(supplierEmailData).then(function (supplierEmailData) {

                        });
                    };
                    let linesave = objDetails.fields.ID;

                    var getcurrentCloudDetails = CloudUser.findOne({
                        _id: localStorage.getItem('mycloudLogonID'),
                        clouddatabaseID: localStorage.getItem('mycloudLogonDBID')
                    });
                    if (getcurrentCloudDetails) {
                        if (getcurrentCloudDetails._id.length > 0) {
                            var clientID = getcurrentCloudDetails._id;
                            var clientUsername = getcurrentCloudDetails.cloudUsername;
                            var clientEmail = getcurrentCloudDetails.cloudEmail;
                            var checkPrefDetails = CloudPreference.findOne({
                                userid: clientID,
                                PrefName: 'billcard'
                            });
                            if (checkPrefDetails) {
                                CloudPreference.update({
                                    _id: checkPrefDetails._id
                                }, {
                                    $set: {
                                        username: clientUsername,
                                        useremail: clientEmail,
                                        PrefGroup: 'purchaseform',
                                        PrefName: 'billcard',
                                        published: true,
                                        customFields: [{
                                            index: '1',
                                            label: getcustomField1,
                                            hidden: getchkcustomField1
                                        }, {
                                            index: '2',
                                            label: getcustomField2,
                                            hidden: getchkcustomField2
                                        }],
                                        updatedAt: new Date()
                                    }
                                }, function (err, idTag) {
                                    if (err) {

                                    } else {


                                    }
                                });
                            } else {
                                CloudPreference.insert({
                                    userid: clientID,
                                    username: clientUsername,
                                    useremail: clientEmail,
                                    PrefGroup: 'purchaseform',
                                    PrefName: 'billcard',
                                    published: true,
                                    customFields: [{
                                        index: '1',
                                        label: getcustomField1,
                                        hidden: getchkcustomField1
                                    }, {
                                        index: '2',
                                        label: getcustomField2,
                                        hidden: getchkcustomField2
                                    }],
                                    createdAt: new Date()
                                }, function (err, idTag) {
                                    if (err) {

                                    } else {


                                    }
                                });
                            }
                        }
                    }

                    sideBarService.getAllBillExList(initialDataLoad, 0).then(function (dataUpdate) {
                        addVS1Data('TBillEx', JSON.stringify(dataUpdate)).then(function (datareturn) {
                            window.open('/supplierpaymentcard?billid=' + linesave, '_self');
                        }).catch(function (err) {
                            window.open('/supplierpaymentcard?billid=' + linesave, '_self');
                        });
                    }).catch(function (err) {
                        window.open('/supplierpaymentcard?billid=' + linesave, '_self');
                    });
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

                    LoadingOverlay.hide();
                });
            }


        }

    },
    // 'click .btnBack': function (event) {
    //     playCancelAudio();
    //     event.preventDefault();
    //     setTimeout(function () {
    //         if (FlowRouter.current().queryParams.trans) {
    //             FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
    //         } else {
    //             history.back(1);
    //         };
    //     }, delayTimeAfterSound);
    // },
    'click #btnViewPayment': async function () {
        let purchaseService = new PurchaseBoardService();
        $('.fullScreenSpin').css('display', 'inline-block');
        let paymentID = "";
        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentBill = getso_id[getso_id.length - 1];
        let paymentData = await purchaseService.getCheckPaymentLineByTransID(currentBill) || '';

        if (paymentData) {
            for (let x = 0; x < paymentData.tsupplierpaymentline.length; x++) {
                if (paymentData.tsupplierpaymentline.length > 1) {
                    paymentID = paymentData.tsupplierpaymentline[x].fields.Payment_ID;
                    window.open('/supplierpaymentcard?id=' + paymentID, '_self');
                } else {
                    paymentID = paymentData.tsupplierpaymentline[0].fields.Payment_ID;
                    window.open('/supplierpaymentcard?id=' + paymentID, '_self');
                }
            }

        } else {
            LoadingOverlay.hide();
        }

    },
    'click .btnTransactionPaid': async function () {
        let purchaseService = new PurchaseBoardService();
        $('.fullScreenSpin').css('display', 'inline-block');
        let selectedSupplierPaymentID = [];
        let paymentID = "";
        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentBill = getso_id[getso_id.length - 1];
        let suppliername = $('#edtSupplierName').val() || '';
        let paymentData = await purchaseService.getCheckPaymentLineByTransID(currentBill) || '';
        if (paymentData) {
            for (let x = 0; x < paymentData.tsupplierpaymentline.length; x++) {
                if (paymentData.tsupplierpaymentline.length > 1) {
                    paymentID = paymentData.tsupplierpaymentline[x].fields.Payment_ID;
                    selectedSupplierPaymentID.push(paymentID);
                } else {
                    paymentID = paymentData.tsupplierpaymentline[0].fields.Payment_ID;
                    window.open('/supplierpaymentcard?id=' + paymentID, '_self');
                }
            }

            setTimeout(function () {
                let selectPayID = selectedSupplierPaymentID;
                window.open('/supplierpayment?payment=' + selectPayID + '&name=' + suppliername, '_self');
            }, 500);
        } else {
            LoadingOverlay.hide();
        }
    },
    // 'click .chkEmailCopy': function (event) {
    //     $('#edtSupplierEmail').val($('#edtSupplierEmail').val().replace(/\s/g, ''));
    //     if ($(event.target).is(':checked')) {
    //         let checkEmailData = $('#edtSupplierEmail').val();
    //         if (checkEmailData.replace(/\s/g, '') === '') {
    //             swal('Supplier Email cannot be blank!', '', 'warning');
    //             event.preventDefault();
    //         } else {

    //             function isEmailValid(mailTo) {
    //                 return /^[A-Z0-9'.1234z_%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(mailTo);
    //             };
    //             if (!isEmailValid(checkEmailData)) {
    //                 swal('The email field must be a valid email address !', '', 'warning');

    //                 event.preventDefault();
    //                 return false;
    //             } else {


    //             }
    //         }
    //     } else {

    //     }
    // },

    // add to custom field
    // "click #edtSaleCustField1": function (e) {
    //     $("#clickedControl").val("one");
    // },

    // // add to custom field
    // "click #edtSaleCustField2": function (e) {
    //     $("#clickedControl").val("two");
    // },

    // // add to custom field
    // "click #edtSaleCustField3": function (e) {
    //     $("#clickedControl").val("three");
    // },

    // 'change .sltCurrency': (e, ui) => {
    //     if ($(".sltCurrency").val() && $(".sltCurrency").val() != defaultCurrencyCode) {
    //         $(".foreign-currency-js").css("display", "block");
    //         ui.isForeignEnabled.set(true);
    //         FxGlobalFunctions.toggleVisbilityOfValuesToConvert(true);
    //     } else {
    //         $(".foreign-currency-js").css("display", "none");
    //         ui.isForeignEnabled.set(false);
    //         FxGlobalFunctions.toggleVisbilityOfValuesToConvert(false);
    //     }
    // },
    // 'change .exchange-rate-js, change input.colAmount': (e, ui) => {
    //     FxGlobalFunctions.convertToForeignEveryFieldsInTableId("#tblBillLine");
    // },

    // 'change .exchange-rate-js, change input.colAmount': (e, ui) => {


    //     setTimeout(() => {

    //         $('#tblBillLine tbody').find('tr').each((index, tr) => {
    //             const toConvert = $(tr).find('.convert-to-foreign:not(.hiddenColumn)');
    //             const rate = $("#exchange_rate").val();

    //             toConvert.each((index, element) => {
    //                 const mainClass = element.classList[0]; // we get the class of the non foreign html
    //                 const mainElement = $(tr).find(`td.${mainClass}:not(.convert-to-foreign):not(.hiddenColumn)`); //document.querySelector(`#tblBillLine tbody td.${mainClass}:not(.convert-to-foreign):not(.hiddenColumn)`);

    //                 const targetElement = $(tr).find(`td.${mainClass}.convert-to-foreign:not(.hiddenColumn)`);


    //                 let value = $(mainElement).children().length > 0 ?
    //                     $(mainElement).find('input').val() :
    //                     $(mainElement).text();

    //                 value = convertToForeignAmount(value, rate, getCurrentCurrencySymbol());

    //                 if(targetElement.children().length > 0) {
    //                     $(targetElement).find("input").val(value);
    //                 } else {
    //                     $(targetElement).text(value);
    //                 }

    //             })
    //         })


    //     }, 500);

    // }

});

Template.registerHelper('equals', function (a, b) {
    return a === b;
});
