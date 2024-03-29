import { StockTransferService } from "../stockadjust-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../../js/core-service';
import { UtilityService } from "../../utility-service";
import { ProductService } from "../../product/product-service";
import '../../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import {AccountService} from "../../accounts/account-service";
import { Random } from 'meteor/random';
import { jsPDF } from 'jspdf';
import 'jQuery.print/jQuery.print.js';
import { autoTable } from 'jspdf-autotable';
import { SideBarService } from '../../js/sidebar-service';
import '../../lib/global/indexdbstorage.js';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './frm_stockAdjustment.html'

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
var times = 0;
var template_list = [
    "Stock Adjustment",
];
var noHasTotals = ["Customer Payment", "Customer Statement", "Supplier Payment", "Statement", "Delivery Docket", "Journal Entry", "Deposit"];
Template.stockadjustmentcard.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.hasFollow = new ReactiveVar(false);
    templateObject.records = new ReactiveVar();
    templateObject.originrecord = new ReactiveVar();
    templateObject.deptrecords = new ReactiveVar();
    templateObject.accountnamerecords = new ReactiveVar();
    templateObject.record = new ReactiveVar({});
    /* Attachments */
    templateObject.uploadedFile = new ReactiveVar();
    templateObject.uploadedFiles = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar();
    templateObject.record = new ReactiveVar({});

    templateObject.productquantityrecord = new ReactiveVar([]);
    templateObject.accountID = new ReactiveVar();
    templateObject.stripe_fee_method = new ReactiveVar();

    setTimeout(function () {

        var x = window.matchMedia("(max-width: 1024px)")

        function mediaQuery(x) {
            if (x.matches) {

                $("#colToAccount").removeClass("col-2");
                $("#colToAccount").addClass("col-4");
                $("#colDepartment").removeClass("col-2");
                $("#colDepartment").addClass("col-4");
                $("#colDate").removeClass("col-2");
                $("#colDate").addClass("col-4");
            }
        }
        mediaQuery(x)
        x.addListener(mediaQuery)
    }, 10);

    setTimeout(function () {

        var x = window.matchMedia("(max-width: 420px)")

        function mediaQuery(x) {
            if (x.matches) {

                $("#colToAccount").removeClass("col-2");
                $("#colToAccount").addClass("col-12");
                $("#colToAccount").addClass("marginright16");
                $("#colDepartment").removeClass("col-2");
                $("#colDepartment").addClass("col-12");
                $("#colDepartment").addClass("marginright16");
                $("#colDate").removeClass("col-2");
                $("#colDate").addClass("col-12");
                $("#colDate").addClass("marginright16");
            }
        }
        mediaQuery(x)
        x.addListener(mediaQuery)
    }, 10);

});
Template.stockadjustmentcard.onRendered(() => {
    const templateObject = Template.instance();
    templateObject.hasFollowings = async function() {
        let stockTransferService = new StockTransferService();
        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentInvoice = getso_id[getso_id.length - 1];
        if (getso_id[1]) {
            currentInvoice = parseInt(currentInvoice);
            var stockData = await stockTransferService.getOneStockAdjustData(currentInvoice);
            var followingStocks = await sideBarService.getAllStockAdjustEntry("All", stockData.fields.Recno);//initialDataLoad
            var stockList = followingStocks.tstockadjustentry;
            if(stockList.length > 1){
                templateObject.hasFollow.set(true);
            } else {
                templateObject.hasFollow.set(false);
            }
        }
    }
    templateObject.hasFollowings();
    let imageData = (localStorage.getItem("Image"));
    if (imageData) {
        $('.uploadedImage').attr('src', imageData);
    };




    const records = [];
    let stockTransferService = new StockTransferService();

    const deptrecords = [];
    const accountnamerecords = [];
    //dd M yy
    $("#date-input,#dtCreationDate,#dtDueDate").datepicker({
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
    });

    $('.fullScreenSpin').css('display', 'inline-block');

    templateObject.getDepartments = function () {
        getVS1Data('TDeptClass').then(function (dataObject) {
            if (dataObject.length == 0) {
                stockTransferService.getDepartment().then(function (data) {
                    for (let i in data.tdeptclass) {

                        let deptrecordObj = {
                            department: data.tdeptclass[i].DeptClassName || ' ',
                        };

                        deptrecords.push(deptrecordObj);
                        templateObject.deptrecords.set(deptrecords);

                    }
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tdeptclass;
                for (let i in useData) {

                    let deptrecordObj = {
                        department: useData[i].DeptClassName || ' ',
                    };

                    deptrecords.push(deptrecordObj);
                    templateObject.deptrecords.set(deptrecords);

                }
            }
        }).catch(function (err) {
            stockTransferService.getDepartment().then(function (data) {
                for (let i in data.tdeptclass) {

                    let deptrecordObj = {
                        department: data.tdeptclass[i].DeptClassName || ' ',
                    };

                    deptrecords.push(deptrecordObj);
                    templateObject.deptrecords.set(deptrecords);

                }
            });
        });

    }

    templateObject.getAccountNames = function () {
        getVS1Data('TAccountVS1').then(function (dataObject) {
            if (dataObject.length == 0) {
                stockTransferService.getAccountNameVS1().then(function (data) {
                    for (let i in data.taccountvs1) {

                        let accountnamerecordObj = {
                            accountname: data.taccountvs1[i].AccountName || ' '
                        };
                        accountnamerecords.push(accountnamerecordObj);
                        templateObject.accountnamerecords.set(accountnamerecords);

                    }
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.taccountvs1;
                for (let i in useData) {

                    let accountnamerecordObj = {
                        accountname: useData[i].fields.AccountName || ' '
                    };
                    accountnamerecords.push(accountnamerecordObj);
                    templateObject.accountnamerecords.set(accountnamerecords);

                }

            }
        }).catch(function (err) {
            stockTransferService.getAccountNameVS1().then(function (data) {
                for (let i in data.taccountvs1) {

                    let accountnamerecordObj = {
                        accountname: data.taccountvs1[i].AccountName || ' '
                    };
                    accountnamerecords.push(accountnamerecordObj);
                    templateObject.accountnamerecords.set(accountnamerecords);

                }
            });
        });

    }

    templateObject.getDepartments();
    templateObject.getAccountNames();
    stockTransferService.getProductClassQuantitys().then(function (dataProductQty) {
        templateObject.productquantityrecord.set(dataProductQty);
    });

    templateObject.getProductQty = function (id, productname, departmentData) {
        let totalAvailQty = 0;
        let totalInStockQty = 0;
        let deptName = departmentData;
        let dataValue = templateObject.productquantityrecord.get();
        if (dataValue.tproductclassquantity) {
            for (let i = 0; i < dataValue.tproductclassquantity.length; i++) {
                let dataObj = {};

                let prodQtyName = dataValue.tproductclassquantity[i].ProductName;
                let deptQtyName = dataValue.tproductclassquantity[i].DepartmentName;
                if (productname == prodQtyName && deptQtyName == deptName) {
                    //if(productname == prodQtyName){
                    let availQty = dataValue.tproductclassquantity[i].AvailableQty;
                    let inStockQty = dataValue.tproductclassquantity[i].InStockQty;

                    totalAvailQty += parseFloat(availQty);
                    totalInStockQty += parseFloat(inStockQty);
                }
            }

            $('#' + id + " .lineInStockQty").text(totalInStockQty);
            // $('#'+id+" .lineDescription").text(lineProductDesc);
            $('#' + id + " .lineFinalQty").val(totalInStockQty);
            $('#' + id + " .lineAdjustQty").val(0);
            $('.stock_print #' + id + " .lineInStockQtyPrint").text(totalInStockQty);
            $('.stock_print #' + id + " .lineFinalQtyPrint").text(totalInStockQty);
            $('.stock_print #' + id + " .lineAdjustQtyPrint").text(0);

        } else {
            stockTransferService.getProductClassQuantitys().then(function (data) {
                for (let i = 0; i < data.tproductclassquantity.length; i++) {
                    let dataObj = {};

                    let prodQtyName = data.tproductclassquantity[i].ProductName;
                    let deptQtyName = data.tproductclassquantity[i].DepartmentName;
                    if (productname == prodQtyName && deptQtyName == deptName) {
                        //if(productname == prodQtyName){
                        let availQty = data.tproductclassquantity[i].AvailableQty;
                        let inStockQty = data.tproductclassquantity[i].InStockQty;

                        totalAvailQty += parseFloat(availQty);
                        totalInStockQty += parseFloat(inStockQty);
                    }
                }

                $('#' + id + " .lineInStockQty").text(totalInStockQty);
                // $('#'+id+" .lineDescription").text(lineProductDesc);
                $('#' + id + " .lineFinalQty").val(totalInStockQty);
                $('#' + id + " .lineAdjustQty").val(0);
                $('.stock_print #' + id + " .lineInStockQtyPrint").text(totalInStockQty);
                $('.stock_print #' + id + " .lineFinalQtyPrint").text(totalInStockQty);
                $('.stock_print #' + id + " .lineAdjustQtyPrint").text(0);

            });
        }

    };

    var url = FlowRouter.current().path;
    var getso_id = url.split('?id=');
    var currentStockAdjust = getso_id[getso_id.length - 1];
    if (getso_id[1]) {
        currentStockAdjust = parseInt(currentStockAdjust);
        templateObject.getStockAdjustData = function () {
            //getOneQuotedata

            getVS1Data('TStockAdjustEntry').then(function (dataObject) {
                let productcost = 0;
                if (dataObject.length == 0) {
                    stockTransferService.getOneStockAdjustData(currentStockAdjust).then(function (data) {
                        $('.fullScreenSpin').css('display', 'none');
                        let lineItems = [];
                        let lineItemObj = {};
                        let lineItemsTable = [];
                        let lineItemTableObj = {};
                        if(data.fields.Lines != null){
                        if (data.fields.Lines.length) {
                            for (let i = 0; i < data.fields.Lines.length; i++) {
                                productcost = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].Amount).toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
                                lineItemObj = {
                                    lineID: Random.id(),
                                    id: data.fields.Lines[i].fields.ID || '',
                                    productname: data.fields.Lines[i].fields.ProductName || '',
                                    productid: data.fields.Lines[i].fields.ProductID || '',
                                    productcost: productcost,
                                    productbarcode: data.fields.Lines[i].fields.PartBarcode || '',
                                    description: data.fields.Lines[i].fields.Description || '',
                                    department: data.fields.Lines[i].fields.DeptName || defaultDept,
                                    qtyinstock: data.fields.Lines[i].fields.InStockQty || 0,
                                    finalqty: data.fields.Lines[i].fields.FinalUOMQty || 0,
                                    adjustqty: data.fields.Lines[i].fields.AdjustQty || 0,
                                    pqaseriallotdata: data.fields.Lines[i].fields.PQA || '',
                                };

                                lineItems.push(lineItemObj);
                            }
                        }
                        }

                        let record = {
                            id: data.fields.ID,
                            lid: 'Edit Stock Adjustment' + ' ' + data.fields.ID,
                            LineItems: lineItems,
                            accountname: data.fields.AccountName,
                            department: data.fields.Lines[0].fields.DeptName || defaultDept,
                            notes: data.fields.Notes,
                            balancedate: data.fields.AdjustmentDate ? moment(data.fields.AdjustmentDate).format('DD/MM/YYYY') : ""
                        };

                        let getDepartmentVal = data.fields.Lines[0].fields.DeptName || defaultDept;
                        setTimeout(function () {
                            // $('#sltDepartment').val(getDepartmentVal);
                            $('#sltAccountName').val(data.fields.AccountName);
                        }, 200);

                        if (data.fields.IsProcessed == true) {
                            $('.colProcessed').css('display', 'block');
                            $("#form :input").prop("disabled", true);
                            $(".btnDeleteStock").prop("disabled", false);
                            $(".btnDeleteStockAdjust").prop("disabled", false);
                            $(".printConfirm").prop("disabled", false);
                            $(".btnBack").prop("disabled", false);
                            $(".btnDeleteProduct").prop("disabled", false);
                        }

                        templateObject.record.set(record);

                        if (templateObject.record.get()) {

                            // $('#tblStockAdjustmentLine').colResizable({
                            //   liveDrag:true});
                            //$('#tblStockAdjustmentLine').removeClass('JColResizer');

                            Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblStockAdjustmentLine', function (error, result) {
                                if (error) {

                                    //Bert.alert('<strong>Error:</strong> user-not-found, no user found please try again!', 'danger');
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

                                                //$("."+columnClass+"").css('display','none');
                                                $("." + columnClass + "").addClass('hiddenColumn');
                                                $("." + columnClass + "").removeClass('showColumn');
                                            } else if (hiddenColumn == false) {
                                                $("." + columnClass + "").removeClass('hiddenColumn');
                                                $("." + columnClass + "").addClass('showColumn');
                                                //$("."+columnClass+"").css('display','table-cell');
                                                //$("."+columnClass+"").css('padding','.75rem');
                                                //$("."+columnClass+"").css('vertical-align','top');
                                            }

                                        }
                                    }

                                }
                            });
                        }
                        setTimeout(function () {
                            $(".btnRemove").prop("disabled", true);
                        }, 1000);
                    }).catch(function (err) {
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                Meteor._reload.reload();
                            } else if (result.dismiss === 'cancel') {}
                        });
                        $('.fullScreenSpin').css('display', 'none');
                        // Meteor._reload.reload();
                    });
                } else {
                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.tstockadjustentry;
                    var added = false;
                    for (let d = 0; d < useData.length; d++) {
                        if (parseInt(useData[d].fields.ID) === currentStockAdjust) {
                            added = true;
                            $('.fullScreenSpin').css('display', 'none');
                            let lineItems = [];
                            let lineItemObj = {};
                            let lineItemsOrigin = [];
                            let lineItemOriginObj = {};

                            if (useData[d].fields.Lines.length) {
                                let previousProductName = '';
                                for (let i = 0; i < useData[d].fields.Lines.length; i++) {
                                    lineItemOriginObj = {
                                         lineID: Random.id(),
                                        id: useData[d].fields.Lines[i].fields.ID || '',
                                        productname: useData[d].fields.Lines[i].fields.ProductName || '',
                                        productid: useData[d].fields.Lines[i].fields.ProductID || '',
                                        productcost: productcost,
                                        productbarcode: useData[d].fields.Lines[i].fields.PartBarcode || '',
                                        description: useData[d].fields.Lines[i].fields.Description || '',
                                        department: useData[d].fields.Lines[0].fields.DeptName || defaultDept,
                                        qtyinstock: useData[d].fields.Lines[i].fields.InStockQty || 0,
                                        finalqty: useData[d].fields.Lines[i].fields.FinalUOMQty || 0,
                                        adjustqty: useData[d].fields.Lines[i].fields.AdjustQty || 0,
                                        availableqty: useData[d].fields.Lines[i].fields.AvailableQty || 0,
                                        batchnumber: useData[d].fields.Lines[i].fields.BatchNo || '',
                                        expirydate: useData[d].fields.Lines[i].fields.ExpiryDate || '',
                                        serialnumber: useData[d].fields.Lines[i].fields.SerialNumber || '',
                                    };
                                    lineItemsOrigin.push(lineItemOriginObj);

                                    if (previousProductName !== useData[d].fields.Lines[i].fields.ProductName) {
                                        previousProductName = useData[d].fields.Lines[i].fields.ProductName;
                                        productcost = utilityService.modifynegativeCurrencyFormat(useData[d].fields.Lines[i].fields.Cost).toLocaleString(undefined, {
                                            minimumFractionDigits: 2
                                        });
                                        lineItemObj = {
                                            lineID: Random.id(),
                                            id: useData[d].fields.Lines[i].fields.ID || '',
                                            productname: useData[d].fields.Lines[i].fields.ProductName || '',
                                            productid: useData[d].fields.Lines[i].fields.ProductID || '',
                                            productcost: productcost,
                                            productbarcode: useData[d].fields.Lines[i].fields.PartBarcode || '',
                                            description: useData[d].fields.Lines[i].fields.Description || '',
                                            department: useData[d].fields.Lines[0].fields.DeptName || defaultDept,
                                            qtyinstock: useData[d].fields.Lines[i].fields.InStockQty || 0,
                                            finalqty: useData[d].fields.Lines[i].fields.FinalUOMQty || 0,
                                            adjustqty: useData[d].fields.Lines[i].fields.AdjustQty || 0,
                                            availableqty: useData[d].fields.Lines[i].fields.AvailableQty || 0,
                                            batchnumber: useData[d].fields.Lines[i].fields.BatchNo || '',
                                            expirydate: useData[d].fields.Lines[i].fields.ExpiryDate || '',
                                            serialnumber: useData[d].fields.Lines[i].fields.SerialNumber || '',

                                        };

                                        lineItems.push(lineItemObj);
                                    }
                               }
                            } else {
                                lineItemObj = {
                                    lineID: Random.id(),
                                    id: useData[d].fields.Lines.fields.ID || '',
                                    productname: useData[d].fields.Lines.fields.ProductName || '',
                                    productid: useData[d].fields.Lines.fields.ProductID || '',
                                    productcost: useData[d].fields.Lines.fields.Cost || 0,
                                    productbarcode: useData[d].fields.Lines.fields.PartBarcode || '',
                                    description: useData[d].fields.Lines.fields.Description || '',
                                    department: useData[d].fields.Lines.fields.DeptName || defaultDept,
                                    qtyinstock: useData[d].fields.Lines.fields.InStockQty || 0,
                                    finalqty: useData[d].fields.Lines.fields.FinalUOMQty || 0,
                                    adjustqty: useData[d].fields.Lines.fields.AdjustQty || 0,
                                    availableqty: useData[d].fields.Lines.fields.AvailableQty || 0,
                                    batchnumber: useData[d].fields.Lines.fields.BatchNo || '',
                                    expirydate: useData[d].fields.Lines.fields.ExpiryDate || '',
                                    serialnumber: useData[d].fields.Lines.fields.SerialNumber || '',
                                };

                                lineItems.push(lineItemObj);
                            }

                            let record = {
                                id: useData[d].fields.ID,
                                lid: 'Edit Stock Adjustment' + ' ' + useData[d].fields.ID,
                                LineItems: lineItems,
                                accountname: useData[d].fields.AccountName,
                                department: useData[d].fields.Lines[0].fields.DeptName || defaultDept,
                                notes: useData[d].fields.Notes,
                                balancedate: useData[d].fields.AdjustmentDate ? moment(useData[d].fields.AdjustmentDate).format('DD/MM/YYYY') : ""
                            };

                            templateObject.originrecord.set({
                                id: useData[d].fields.ID,
                                lid: 'Edit Stock Adjustment' + ' ' + useData[d].fields.ID,
                                LineItems: lineItemsOrigin,
                                accountname: useData[d].fields.AccountName,
                                department: useData[d].fields.Lines[0].fields.DeptName || defaultDept,
                                notes: useData[d].fields.Notes,
                                balancedate: useData[d].fields.AdjustmentDate ? moment(useData[d].fields.AdjustmentDate).format('DD/MM/YYYY') : ""
                            })

                            let getDepartmentVal = useData[d].fields.Lines[0].fields.DeptName || defaultDept;

                            setTimeout(function () {
                                // $('#sltDepartment').val(getDepartmentVal);
                                $('#sltAccountName').val(useData[d].fields.AccountName);
                                $("#dtCreationDate").datepicker('setDate',  new Date(useData[d].fields.CreationDate));
                            }, 200);

                            //
                            // $("#form :input").prop("disabled", true);
                            // $(".btnDeleteStock").prop("disabled", false);
                            // $(".btnDeleteStockAdjust").prop("disabled", false);
                            // $(".printConfirm").prop("disabled", false);
                            // $(".btnBack").prop("disabled", false);

                            if (useData[d].fields.IsProcessed == true) {
                                $('.colProcessed').css('display', 'block');
                                $("#form :input").prop("disabled", true);
                                $(".btnDeleteStock").prop("disabled", false);
                                $(".btnDeleteStockAdjust").prop("disabled", false);
                                $(".printConfirm").prop("disabled", false);
                                $(".btnBack").prop("disabled", false);
                                $(".btnDeleteProduct").prop("disabled", false);
                            }

                            templateObject.record.set(record);
                            $(".btnDeleteLine").prop("disabled", false);
                            $(".btnDeleteProduct").prop("disabled", false);
                            $(".close").prop("disabled", false);
                            if (templateObject.record.get()) {
                                Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblStockAdjustmentLine', function (error, result) {
                                    if (error) {}
                                    else {
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

                                                    //$("."+columnClass+"").css('display','none');
                                                    $("." + columnClass + "").addClass('hiddenColumn');
                                                    $("." + columnClass + "").removeClass('showColumn');
                                                } else if (hiddenColumn == false) {
                                                    $("." + columnClass + "").removeClass('hiddenColumn');
                                                    $("." + columnClass + "").addClass('showColumn');
                                                    //$("."+columnClass+"").css('display','table-cell');
                                                    //$("."+columnClass+"").css('padding','.75rem');
                                                    //$("."+columnClass+"").css('vertical-align','top');
                                                }

                                            }
                                        }

                                    }
                                });
                            }
                            setTimeout(function () {
                                $(".btnRemove").prop("disabled", true);
                            }, 1000);

                        }

                    }
                    if (!added) {}
                    //here
                }
            }).catch(function (err) {

                stockTransferService.getOneStockAdjustData(currentStockAdjust).then(function (data) {
                    $('.fullScreenSpin').css('display', 'none');
                    let lineItems = [];
                    let lineItemObj = {};
                    let lineItemsTable = [];
                    let lineItemTableObj = {};
                    if(data.fields.Lines != null){
                    if (data.fields.Lines.length) {
                        for (let i = 0; i < data.fields.Lines.length; i++) {
                            productcost = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].Amount).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                            });
                            lineItemObj = {
                                lineID: Random.id(),
                                id: data.fields.Lines[i].fields.ID || '',
                                productname: data.fields.Lines[i].fields.ProductName || '',
                                productid: data.fields.Lines[i].fields.ProductID || '',
                                productcost: productcost,
                                productbarcode: data.fields.Lines[i].fields.PartBarcode || '',
                                description: data.fields.Lines[i].fields.Description || '',
                                department: data.fields.Lines[i].fields.DeptName || defaultDept,
                                qtyinstock: data.fields.Lines[i].fields.InStockQty || 0,
                                finalqty: data.fields.Lines[i].fields.FinalUOMQty || 0,
                                adjustqty: data.fields.Lines[i].fields.AdjustQty || 0,
                                availableqty: data.fields.Lines[i].fields.AvailableQty || 0,
                                batchnumber: data.fields.Lines[i].fields.BatchNo || '',
                                expirydate: data.fields.Lines[i].fields.ExpiryDate || '',
                                serialnumber: data.fields.Lines[i].fields.SerialNumber || '',
                            };

                            lineItems.push(lineItemObj);
                        }
                    }
                  }
                    let record = {
                        id: data.fields.ID,
                        lid: 'Edit Stock Adjustment' + ' ' + data.fields.ID,
                        LineItems: lineItems,
                        accountname: data.fields.AccountName,
                        department: data.fields.Lines[0].fields.DeptName || defaultDept,
                        notes: data.fields.Notes,
                        balancedate: data.fields.AdjustmentDate ? moment(data.fields.AdjustmentDate).format('DD/MM/YYYY') : ""
                    };

                    let getDepartmentVal = data.fields.Lines[0].fields.DeptName || defaultDept;

                    setTimeout(function () {
                        // $('#sltDepartment').val(getDepartmentVal);
                        $('#sltAccountName').val(data.fields.AccountName);
                    }, 200);

                    if (data.fields.IsProcessed == true) {
                        $('.colProcessed').css('display', 'block');
                        $("#form :input").prop("disabled", true);
                        $(".btnDeleteStock").prop("disabled", false);
                        $(".btnDeleteStockAdjust").prop("disabled", false);
                        $(".printConfirm").prop("disabled", false);
                        $(".btnBack").prop("disabled", false);
                        $(".btnDeleteProduct").prop("disabled", false);
                    }

                    templateObject.record.set(record);

                    if (templateObject.record.get()) {

                        // $('#tblStockAdjustmentLine').colResizable({
                        //   liveDrag:true});
                        //$('#tblStockAdjustmentLine').removeClass('JColResizer');


                        Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblStockAdjustmentLine', function (error, result) {
                            if (error) {

                                //Bert.alert('<strong>Error:</strong> user-not-found, no user found please try again!', 'danger');
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

                                            //$("."+columnClass+"").css('display','none');
                                            $("." + columnClass + "").addClass('hiddenColumn');
                                            $("." + columnClass + "").removeClass('showColumn');
                                        } else if (hiddenColumn == false) {
                                            $("." + columnClass + "").removeClass('hiddenColumn');
                                            $("." + columnClass + "").addClass('showColumn');
                                            //$("."+columnClass+"").css('display','table-cell');
                                            //$("."+columnClass+"").css('padding','.75rem');
                                            //$("."+columnClass+"").css('vertical-align','top');
                                        }

                                    }
                                }

                            }
                        });
                    }
                }).catch(function (err) {
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                            Meteor._reload.reload();
                        } else if (result.dismiss === 'cancel') {}
                    });
                    $('.fullScreenSpin').css('display', 'none');
                    // Meteor._reload.reload();
                });
            });

        };

        templateObject.getStockAdjustData();
    } else {
        $('.fullScreenSpin').css('display', 'none');
        $('.colProcessed').css('display', 'none');
        $('#edtSupplierEmail').val(localStorage.getItem('mySession'));
        let lineItems = [];
        let lineItemsTable = [];
        let lineItemObj = {};
        let productcost = utilityService.modifynegativeCurrencyFormat(0).toLocaleString(undefined, {
                                    minimumFractionDigits: 2
                                });
        lineItemObj = {
            lineID: Random.id(),
            productname: '',
            productbarcode: '',
            productcost:productcost,
            description: '',
            department: defaultDept || '',
            qtyinstock: 0,
            finalqty: 0,
            adjustqty: 0,
            availableqty: 0,
            batchnumber: '',
            expirydate: '',
            serialnumber: '',
       };

        var dataListTable = [
            ' ' || '',
            ' ' || '',
            ' ' || '',
            0 || 0,
            0 || 0,
            0 || 0,
            '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 btnRemove"><i class="fa fa-remove"></i></button></span>'
        ];
        lineItemsTable.push(dataListTable);
        lineItems.push(lineItemObj);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");
        let record = {
            id: '',
            lid: 'New Stock Adjustment',
            accountname: 'Stock Adjustment',
            department: defaultDept,
            balancedate: begunDate,
            LineItems: lineItems,
            notes: ''
        };

        setTimeout(function () {
            // $('#sltDepartment').val(defaultDept);
            $('#sltAccountName').val('Stock Adjustment');
        }, 200);

        // $('#edtCustomerName').val('');

        templateObject.record.set(record);
        if (templateObject.record.get()) {
            // $('#tblStockAdjustmentLine').colResizable({liveDrag:true});
            Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblStockAdjustmentLine', function (error, result) {
                if (error) {

                    //Bert.alert('<strong>Error:</strong> user-not-found, no user found please try again!', 'danger');
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

    if (FlowRouter.current().queryParams.id) {
    } else {
        setTimeout(function() {
            $('#tblStockAdjustmentLine .lineProductName').trigger("click");
        }, 200);
    }

    $(document).on("click", ".templateItem .btnPreviewTemplate", function (e) {
        title = $(this).parent().attr("data-id");
        number = $(this).parent().attr("data-template-id");//e.getAttribute("data-template-id");
        templateObject.generateInvoiceData(title, number);

    });

    templateObject.generateInvoiceData = async function (template_title, number) {

        object_invoce = [];
        switch (template_title) {

            case "Stock Adjustment":
                showStockAdjustment(template_title, number, false);
                break;
        }

        await applyDisplaySettings(template_title, number);

    };

    function showStockAdjustment(template_title, number, bprint) {

        let invoice_data = templateObject.record.get();
        var array_data = [];
        object_invoce = [];
        let stripe_id = templateObject.accountID.get() || '';
        let stripe_fee_method = templateObject.stripe_fee_method.get();
        let lineItems = [];
        let total = $('#totalBalanceDue').html() || 0;
        let tax = $('#subtotal_tax').html() || 0;
        let customer = $('#edtCustomerName').val();
        let name = $('#firstname').val();
        let surname = $('#lastname').val();
        if (name == undefined)
            name = customer;
        if (surname == undefined)
            surname = "";
        let dept = $('#sltDepartment').val();
        if (dept == "Default" || dept == undefined)
            dept = "";
        var erpGet = erpDb();
        let fx = $('#sltCurrency').val();


        var txaNotes = $('#txaNotes').val();


        var customfield1 = $('#edtSaleCustField1').val() || '  ';
        var customfield2 = $('#edtSaleCustField2').val() || '  ';
        var customfield3 = $('#edtSaleCustField3').val() || '  ';

        var customfieldlabel1 = $('.lblCustomField1').first().text() || 'Custom Field 1';
        var customfieldlabel2 = $('.lblCustomField2').first().text() || 'Custom Field 2';
        var customfieldlabel3 = $('.lblCustomField3').first().text() || 'Custom Field 3';
        var ref_daa = $('#edtReference').val() || '-';
        var applied = $('.appliedAmount').text();

        if (ref_daa == " " || ref_daa == "") {
            ref_daa = "  ";
        }

        var dtCreationDate = $('#dtCreationDate').val() || '  ';


        $('#tblStockAdjustmentLine > tbody > tr').each(function () {
            var lineID = this.id;

            let lineProductName = $('#' + lineID + " .lineProductName").val();
            let lineDescription = $('#' + lineID + " .lineDescription").text();
            let lineInStockQty = $('#' + lineID + " .lineInStockQty").text();


            array_data.push([
                lineProductName,
                lineDescription,
                lineInStockQty

            ]);


        });
        let company = localStorage.getItem('vs1companyName');
        let vs1User = localStorage.getItem('mySession');
        let customerEmail = $('#edtSupplierEmail').val();
        let id = $('.printID').attr("id") || "new";
        let currencyname = (CountryAbbr).toLowerCase();
        stringQuery = "?";
        var customerID = $('#edtSupplierEmail').attr('customerid');
        for (let l = 0; l < lineItems.length; l++) {
            stringQuery = stringQuery + "product" + l + "=" + lineItems[l].description + "&price" + l + "=" + lineItems[l].unitPrice + "&qty" + l + "=" + lineItems[l].quantity + "&";
        }
        stringQuery = stringQuery + "tax=" + tax + "&total=" + total + "&customer=" + customer + "&name=" + name + "&surname=" + surname + "&quoteid=" + invoice_data.id + "&transid=" + stripe_id + "&feemethod=" + stripe_fee_method + "&company=" + company + "&vs1email=" + vs1User + "&customeremail=" + customerEmail + "&type=Invoice&url=" + window.location.href + "&server=" + erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase + "&port=" + erpGet.ERPPort + "&dept=" + dept + "&currency=" + currencyname;
        $(".linkText").attr("href", stripeGlobalURL + stringQuery);

        let item_payments = '';
        let supplier_addr= '';
        if (customer) {
            supplier_addr +=  customer + "\r\n";
        }
        if (surname) {
            supplier_addr +=  surname + "\r\n";
        }
        if (customerEmail) {
            supplier_addr +=  customerEmail + "\r\n";
        }
        if (dept) {
            supplier_addr +=  dept;
        }


        if (number == 1) {
            item_payments = {
                o_url: localStorage.getItem('vs1companyURL'),
                o_name: localStorage.getItem('vs1companyName'),
                o_address: localStorage.getItem('vs1companyaddress1'),
                o_city: localStorage.getItem('vs1companyCity'),
                o_state: localStorage.getItem('companyState') + ' ' + localStorage.getItem('vs1companyPOBox'),
                o_reg: Template.paymentcard.__helpers.get('companyReg').call(),
                o_abn: Template.paymentcard.__helpers.get('companyabn').call(),
                o_phone: Template.paymentcard.__helpers.get('companyphone').call(),
                title: "Stock Adjustment",
                value: invoice_data.id,
                date: dtCreationDate,
                invoicenumber: "",
                refnumber: ref_daa,
                pqnumber: '',
                duedate: '',
                paylink: "",
                supplier_type: "Customer",
                supplier_name: customer,
                supplier_addr: supplier_addr,
                fields: {
                    "Product_Name": ["30", "left", true],
                    "Description": ["30", "left", true],
                    "Qty": ["20", "left", true],
                },
                subtotal: "",
                gst: "",
                total: "",
                paid_amount: "",
                bal_due: "",
                bsb: '',
                account: '',
                swift: '',
                data: array_data,
                applied: applied,
                customfield1: 'NA',
                customfield2: 'NA',
                customfield3: 'NA',
                customfieldlabel1: 'NA',
                customfieldlabel2: 'NA',
                customfieldlabel3: 'NA',
                showFX: "",
                comment: txaNotes,

            };

        } else if (number == 2) {
            item_payments = {
                o_url: localStorage.getItem('vs1companyURL'),
                o_name: localStorage.getItem('vs1companyName'),
                o_address: localStorage.getItem('vs1companyaddress1'),
                o_city: localStorage.getItem('vs1companyCity'),
                o_state: localStorage.getItem('companyState') + ' ' + localStorage.getItem('vs1companyPOBox'),
                o_reg: Template.paymentcard.__helpers.get('companyReg').call(),
                o_abn: Template.paymentcard.__helpers.get('companyabn').call(),
                o_phone: Template.paymentcard.__helpers.get('companyphone').call(),
                title: "Stock Adjustment",
                value: invoice_data.lid,
                date: dtCreationDate,
                invoicenumber: "",
                refnumber: ref_daa,
                pqnumber: '',
                duedate: '',
                paylink: "",
                supplier_type: "Customer",
                supplier_name: customer,
                supplier_addr: customer + "\r\n" + name + " " + surname + "\r\n" + customerEmail + "\r\n" + dept,
                fields: {
                    "Product_Name": ["30", "left", true],
                    "Description": ["30", "left", true],
                    "Qty": ["20", "left", true],
                },
                subtotal: "",
                gst: "",
                total: "",
                paid_amount: "",
                bal_due: "",
                bsb: '',
                account: '',
                swift: '',
                data: array_data,
                applied: applied,
                customfield1: customfield1,
                customfield2: customfield2,
                customfield3: customfield3,
                customfieldlabel1: customfieldlabel1,
                customfieldlabel2: customfieldlabel2,
                customfieldlabel3: customfieldlabel3,
                showFX: "",
                comment: txaNotes,

            };

        } else {

            if (fx == '') {
                fx = '  ';
            }
            item_payments = {
                o_url: localStorage.getItem('vs1companyURL'),
                o_name: localStorage.getItem('vs1companyName'),
                o_address: localStorage.getItem('vs1companyaddress1'),
                o_city: localStorage.getItem('vs1companyCity'),
                o_state: localStorage.getItem('companyState') + ' ' + localStorage.getItem('vs1companyPOBox'),
                o_reg: Template.paymentcard.__helpers.get('companyReg').call(),
                o_abn: Template.paymentcard.__helpers.get('companyabn').call(),
                o_phone: Template.paymentcard.__helpers.get('companyphone').call(),
                title: "Stock Adjustment",
                value: invoice_data.lid,
                date: dtCreationDate,
                invoicenumber: "",
                refnumber: ref_daa,
                pqnumber: '',
                duedate: '',
                paylink: "",
                supplier_type: "Customer",
                supplier_name: customer,
                supplier_addr: customer + "\r\n" + name + " " + surname + "\r\n" + customerEmail + "\r\n" + dept,
                fields: {
                    "Product_Name": ["30", "left", true],
                    "Description": ["30", "left", true],
                    "Qty": ["20", "left", true],
                },
                subtotal: "",
                gst: "",
                total: "",
                paid_amount: "",
                bal_due: "",
                bsb: '',
                account: '',
                swift: '',
                data: array_data,
                applied: applied,
                customfield1: customfield1,
                customfield2: customfield2,
                customfield3: customfield3,
                customfieldlabel1: customfieldlabel1,
                customfieldlabel2: customfieldlabel2,
                customfieldlabel3: customfieldlabel3,
                showFX: fx,
                comment: txaNotes,

            };


        }


        object_invoce.push(item_payments);

        $("#templatePreviewModal .field_payment").show();
        $("#templatePreviewModal .field_amount").show();

        if (bprint == false) {
            $("#html-2-pdfwrapper").css("width", "90%");
            $("#html-2-pdfwrapper2").css("width", "90%");
            $("#html-2-pdfwrapper3").css("width", "90%");
        } else {
            $("#html-2-pdfwrapper").css("width", "210mm");
            $("#html-2-pdfwrapper2").css("width", "210mm");
            $("#html-2-pdfwrapper3").css("width", "210mm");
        }

        if (number == 1) {
            updateTemplate1(object_invoce, bprint);
        } else if (number == 2) {
            updateTemplate2(object_invoce, bprint);
        } else {
            updateTemplate3(object_invoce, bprint);
        }

        saveTemplateFields("fields" + template_title, object_invoce[0]["fields"])
    }

    function loadTemplateBody1(object_invoce) {
        // table content
        var tbl_content = $("#templatePreviewModal .tbl_content");
        tbl_content.empty();
        const data = object_invoce[0]["data"];
        const fieldKeys = Object.keys(object_invoce[0]["fields"]);
        var length = data.length;
        var i = 0;
        for (item of data) {
            var html = '';
            if (i == length - 1) {
                html += "<tr style=''>";
            } else {
                html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
            }

            var count = 0;
            for (item_temp of item) {
                if (count == 1) {
                    html = html + "<td class=\"" + fieldKeys[i] + "\" style='color:#00a3d3; padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                } else if (count > 2) {
                    html = html + "<td class=\"" + fieldKeys[i] + "\" style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                } else {
                    html = html + "<td class=\"" + fieldKeys[i] + "\" style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                }
                count++;
            }
            html += "</tr>";
            tbl_content.append(html);
            i++;

        }


        // total amount
        if (noHasTotals.includes(object_invoce[0]["title"])) {
            $("#templatePreviewModal .field_amount").hide();
            $("#templatePreviewModal .field_payment").css("borderRight", "0px solid black");
        } else {
            $("#templatePreviewModal .field_amount").show();
            $("#templatePreviewModal .field_payment").css("borderRight", "1px solid black");
        }

        $('#templatePreviewModal #subtotal_total').text("Sub total");
        $("#templatePreviewModal #subtotal_totalPrint").text(object_invoce[0]["subtotal"]);
        $('#templatePreviewModal #grandTotal').text("Grand total");
        $("#templatePreviewModal #grandTotalPrint").text(object_invoce[0]["total"]);
        $("#templatePreviewModal #totalBalanceDuePrint").text(object_invoce[0]["bal_due"]);
        $("#templatePreviewModal #paid_amount").text(object_invoce[0]["paid_amount"]);

    }

    function loadTemplateBody2(object_invoce) {
        // table content
        var tbl_content = $("#templatePreviewModal .tbl_content");
        tbl_content.empty();
        const data = object_invoce[0]["data"];
        const fieldKeys = Object.keys(object_invoce[0]["fields"]);
        var length = data.length;
        var i = 0;
        for (item of data) {
            var html = '';
            if (i == length - 1) {
                html += "<tr style=''>";
            } else {
                html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
            }

            var count = 0;
            for (item_temp of item) {
                if (count == 1) {
                    html = html + "<td class=\"" + fieldKeys[i] + "\" style='color:#00a3d3; padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                } else if (count > 2) {
                    html = html + "<td class=\"" + fieldKeys[i] + "\" style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                } else {
                    html = html + "<td class=\"" + fieldKeys[i] + "\" style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                }
                count++;
            }
            html += "</tr>";
            tbl_content.append(html);
            i++;

        }


        // total amount
        if (noHasTotals.includes(object_invoce[0]["title"])) {
            $(".subtotal2").hide();
        } else {
            $(".subtotal2").show();
        }

        $("#templatePreviewModal #subtotal_totalPrint2").text(
            object_invoce[0]["subtotal"]
        );
        $("#templatePreviewModal #grandTotalPrint2").text(
            object_invoce[0]["total"]
        );
        $("#templatePreviewModal #totalBalanceDuePrint2").text(
            object_invoce[0]["bal_due"]
        );
        $("#templatePreviewModal #paid_amount2").text(
            object_invoce[0]["paid_amount"]
        );

    }

    function loadTemplateBody3(object_invoce) {
        // table content
        var tbl_content = $("#templatePreviewModal .tbl_content");
        tbl_content.empty();
        const data = object_invoce[0]["data"];
        const fieldKeys = Object.keys(object_invoce[0]["fields"]);
        var length = data.length;
        var i = 0;
        for (item of data) {
            var html = '';
            if (i == length - 1) {
                html += "<tr style=''>";
            } else {
                html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
            }

            var count = 0;
            for (item_temp of item) {
                if (count == 1) {
                    html = html + "<td class=\"" + fieldKeys[i] + "\" style='color:#00a3d3; padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                } else if (count > 2) {
                    html = html + "<td class=\"" + fieldKeys[i] + "\" style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                } else {
                    html = html + "<td class=\"" + fieldKeys[i] + "\" style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                }
                count++;
            }
            html += "</tr>";
            tbl_content.append(html);
            i++;

        }

        // total amount
        if (noHasTotals.includes(object_invoce[0]["title"])) {
            $(".subtotal3").hide();
        } else {
            $(".subtotal3").show();
        }

        $("#templatePreviewModal #subtotal_totalPrint3").text(
            object_invoce[0]["subtotal"]
        );
        $("#templatePreviewModal #totalTax_totalPrint3").text(
            object_invoce[0]["gst"]
        );
        $("#templatePreviewModal #totalBalanceDuePrint3").text(
            object_invoce[0]["bal_due"]
        );

    }

    function updateTemplate1(object_invoce, bprint) {
        initTemplateHeaderFooter1();
        $("#html-2-pdfwrapper").show();
        $("#html-2-pdfwrapper2").hide();
        $("#html-2-pdfwrapper3").hide();
        if (bprint == false)
            $("#templatePreviewModal").modal("toggle");
        loadTemplateHeaderFooter1(object_invoce);
        loadTemplateBody1(object_invoce);
    }

    function updateTemplate2(object_invoce, bprint) {
        initTemplateHeaderFooter2();
        $("#html-2-pdfwrapper").hide();
        $("#html-2-pdfwrapper2").show();
        $("#html-2-pdfwrapper3").hide();
        if (bprint == false)
            $("#templatePreviewModal").modal("toggle");
        loadTemplateHeaderFooter2(object_invoce);
        loadTemplateBody2(object_invoce);
    }

    function updateTemplate3(object_invoce, bprint) {
        initTemplateHeaderFooter3();
        $("#html-2-pdfwrapper").hide();
        $("#html-2-pdfwrapper2").hide();
        $("#html-2-pdfwrapper3").show();
        if (bprint == false)
            $("#templatePreviewModal").modal("toggle");
        loadTemplateHeaderFooter3(object_invoce);
        loadTemplateBody3(object_invoce);
    }

    function saveTemplateFields(key, value) {
        localStorage.setItem(key, value)
    }

    exportSalesToPdf = function () {
        let margins = {
            top: 0,
            bottom: 0,
            left: 0,
            width: 100
        };
        let id = $('.printID').attr("id");
        var source = document.getElementById('html-2-pdfwrapper');
        let file = "Stock Adjustment.pdf";
        if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
            file = 'Stock Adjustment-' + id + '.pdf';
        }

        let height = $(source).find('.invoice_wrapper').height();
        let width = $(source).find('.invoice_wrapper').width();

        let heightCM = height / 35.35 + 1.6;
        let widthCM = width / 35.35 + 2.2;
        var opt = {
            margin: 1,
            filename: file,
            html2canvas: { dpi: 192, letterRendering: true },
            jsPDF: {
                unit: "cm",
                format: [widthCM, heightCM],
                orientation: "portrait",
            },
        };

        html2pdf().set(opt).from(source).save().then(function (dataObject) {
            $('.fullScreenSpin').css('display', 'none');
            $('#html-2-pdfwrapper').css('display', 'none');
        });

    };

    exportSalesToPdf1 = async function(template_title,number) {
        if(template_title == 'Stock Adjustment')
        {
            await showStockAdjustment(template_title, number, true);
        }

        let margins = {
            top: 0,
            bottom: 0,
            left: 0,
            width: 100
        };

        let invoice_data_info = templateObject.record.get();
        // document.getElementById('html-2-pdfwrapper_new').style.display="block";
        // var source = document.getElementById('html-2-pdfwrapper_new');
        var source;
        if (number == 1) {
            $("#html-2-pdfwrapper").show();
            $("#html-2-pdfwrapper2").hide();
            $("#html-2-pdfwrapper3").hide();
            source = document.getElementById("html-2-pdfwrapper");
        } else if (number == 2) {
            $("#html-2-pdfwrapper").hide();
            $("#html-2-pdfwrapper2").show();
            $("#html-2-pdfwrapper3").hide();
            source = document.getElementById("html-2-pdfwrapper2");
        } else {
            $("#html-2-pdfwrapper").hide();
            $("#html-2-pdfwrapper2").hide();
            $("#html-2-pdfwrapper3").show();
            source = document.getElementById("html-2-pdfwrapper3");
        }

        let file = "Stock Adjustment.pdf";
        if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
            if(template_title == 'Cheques')
            {
                file = 'Stock Adjustment-' + invoice_data_info.id + '.pdf';
            }
        }

        let height = $(source).find('.invoice_wrapper').height();
        let width = $(source).find('.invoice_wrapper').width();

        let heightCM = height / 35.35 + 1.6;
        let widthCM = width / 35.35 + 2.2;
        var opt = {
            margin: 1,
            filename: file,
            html2canvas: { dpi: 192, letterRendering: true },
            jsPDF: {
                unit: "cm",
                format: [widthCM, heightCM],
                orientation: "portrait",
            },
        };

        html2pdf().set(opt).from(source).toPdf().output('datauristring').then((data)=>{
            let attachment = [];
            let base64data = data.split(',')[1];
            let id  = FlowRouter.current().queryParams.id?FlowRouter.current().queryParams.id: '';

            pdfObject = {
                filename: 'Stock Adjustment-' + id + '.pdf',
                content: base64data,
                encoding: 'base64'
            };
            attachment.push(pdfObject);
            let values = [];
            let basedOnTypeStorages = Object.keys(localStorage);
            basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
                let employeeId = storage.split('_')[2];
                // return storage.includes('BasedOnType_') && employeeId == localStorage.getItem('mySessionEmployeeLoggedID')
                return storage.includes('BasedOnType_');
            });
            let j = basedOnTypeStorages.length;
            if (j > 0) {
                while (j--) {
                    values.push(localStorage.getItem(basedOnTypeStorages[j]));
                }
            }
            if(values.length > 0) {
                values.forEach(value => {
                    let reportData = JSON.parse(value);
                    let temp = {... reportData};

                    temp.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                    reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                    temp.attachments = attachment;
                    if (temp.BasedOnType.includes("P")) {
                        if (temp.FormID == 1) {
                            let formIds = temp.FormIDs.split(',');
                            if (formIds.includes("18")) {
                                temp.FormID = 18;
                                Meteor.call('sendNormalEmail', temp);
                            }
                        } else {
                            if (temp.FormID == 18)
                                Meteor.call('sendNormalEmail', temp);
                        }
                    }
                });
            }

        });

        html2pdf().set(opt).from(source).save().then(function (dataObject) {
            if ($('.printID').attr('id') == undefined || $('.printID').attr('id') == "") {
                // $(".btnSave").trigger("click");
            } else {

            }
            $('#html-2-pdfwrapper').css('display', 'none');
            $("#html-2-pdfwrapper").hide();
            $("#html-2-pdfwrapper2").hide();
            $("#html-2-pdfwrapper3").hide();
            $('.fullScreenSpin').css("display", "none");
        });
        return true;

    };

    let table;
    $(document).ready(function () {
        $('#tblEmployeelist tbody').on('click', 'tr', function (event) {
            $('#edtSupplierEmail').val($(event.target).closest("tr").find('.colEmail').text());
            $('#employeeList').modal('hide');
            $('#edtSupplierEmail').val($('#edtSupplierEmail').val().replace(/\s/g, ''));
            if ($('.chkEmailCopy').is(':checked')) {
                let checkEmailData = $('#edtSupplierEmail').val();
                if (checkEmailData.replace(/\s/g, '') === '') {
                    $('.chkEmailCopy').prop('checked', false);
                    swal('Employee Email cannot be blank!', '', 'warning');
                    event.preventDefault();
                } else {

                    function isEmailValid(mailTo) {
                        return /^[A-Z0-9'.1234z_%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(mailTo);
                    };
                    if (!isEmailValid(checkEmailData)) {
                        $('.chkEmailCopy').prop('checked', false);
                        swal('The email field must be a valid email address !', '', 'warning');

                        event.preventDefault();
                        return false;
                    } else {}
                }
            } else {}
        })

        $("#edtSupplierEmail").on('dblclick', function (e) {
            $('#employeeList').modal('show');
        });
        $('#addRow').on('click', function () {
            var rowData = $('#tblStockAdjustmentLine tbody>tr:last').clone(true);
            var rowData1 = $('.stock_print tbody>tr:last').clone(true);
            let tokenid = Random.id();
            $(".lineProductName", rowData).val("");
            $(".lineProductBarCode", rowData).text("");
            $(".lineDescription", rowData).text("");
            $(".lineInStockQty", rowData).text("");
            $(".lineFinalQty", rowData).val("");
            $(".lineAdjustQty", rowData).val("");
            // $(".lineAmt", rowData).text("");
            rowData.attr('id', tokenid);
            $("#tblStockAdjustmentLine tbody").append(rowData);

            //Print table
            $(".lineProductNamePrint", rowData1).text("");
            $(".lineProductBarCodePrint", rowData1).text("");
            $(".lineDescriptionPrint", rowData1).text("");
            $(".lineInStockQtyPrint", rowData1).text("");
            $(".lineFinalQtyPrint", rowData1).text("");
            $(".lineAdjustQtyPrint", rowData1).text("");
            $(".colSerialNo", rowData).removeAttr("data-lotnumbers");
            $(".colSerialNo", rowData).removeAttr("data-expirydates");
            $(".colSerialNo", rowData).removeAttr("data-serialnumbers");
            // $(".lineAmt", rowData).text("");
            rowData1.attr('id', tokenid);
            $(".stock_print tbody").append(rowData1);

            setTimeout(function () {
                $('#' + tokenid + " .lineProductName").trigger('click');
            }, 200);
        });

        $('#scanNewRowMobile').on('click', function () {
            var rowData = $('#tblStockAdjustmentLine tbody>tr:last').clone(true);
            var rowData1 = $('.stock_print tbody>tr:last').clone(true);
            let tokenid = Random.id();
            $(".lineProductName", rowData).val("");
            $(".lineProductBarCode", rowData).text("");
            $(".lineDescription", rowData).text("");
            $(".lineInStockQty", rowData).text("");
            $(".lineFinalQty", rowData).val("");
            $(".lineAdjustQty", rowData).val("");
            // $(".lineAmt", rowData).text("");
            rowData.attr('id', tokenid);
            $("#tblStockAdjustmentLine tbody").append(rowData);

            //Print table
            $(".lineProductNamePrint", rowData1).text("");
            $(".lineProductBarCodePrint", rowData1).text("");
            $(".lineDescriptionPrint", rowData1).text("");
            $(".lineInStockQtyPrint", rowData1).text("");
            $(".lineFinalQtyPrint", rowData1).text("");
            $(".lineAdjustQtyPrint", rowData1).text("");
            // $(".lineAmt", rowData).text("");
            rowData1.attr('id', tokenid);
            $(".stock_print tbody").append(rowData1);

            // setTimeout(function () {
            //     $('#' + tokenid + " .lineProductName").trigger('click');
            // }, 200);
        });


    });

    var isMobile = false;
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
        isMobile = true;
    }
    if (isMobile != true) {
        setTimeout(function() {
            document.getElementById("scanBarcodeModalHidden").style.display = "none";
        }, 500);
    }
    setTimeout(function() {
        var html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader", {
                fps: 10,
                qrbox: 250,
                rememberLastUsedCamera: true
            });
        html5QrcodeScanner.render(onScanSuccess);
    }, 500);

    function onScanSuccess(decodedText, decodedResult) {
        var barcodeScanner = decodedText.toUpperCase();
        $('#scanBarcode').modal('toggle');
        if (barcodeScanner != '') {

             setTimeout(function() {
                $('#tblSearchOverview_filter .form-control-sm').val(barcodeScanner);
            }, 200);
            templateObject.getAllGlobalSearch(barcodeScanner);
        }
    }

});
Template.stockadjustmentcard.helpers({
    getTemplateList: function () {
        return template_list;
    },

    getTemplateNumber: function () {
        let template_numbers = ["1", "2", "3"];
        return template_numbers;
    },
    isBatchSerialNoTracking: () => {
        return localStorage.getItem('CloudShowSerial') || false;
    },
    record: () => {
        return Template.instance().record.get();
    },
    deptrecords: () => {
        return Template.instance().deptrecords.get().sort(function (a, b) {
            if (a.department == 'NA') {
                return 1;
            } else if (b.department == 'NA') {
                return -1;
            }
            return (a.department.toUpperCase() > b.department.toUpperCase()) ? 1 : -1;
        });
    },
    accountnamerecords: () => {
        return Template.instance().accountnamerecords.get().sort(function (a, b) {
            if (a.accountname == 'NA') {
                return 1;
            } else if (b.accountname == 'NA') {
                return -1;
            }
            return (a.accountname.toUpperCase() > b.accountname.toUpperCase()) ? 1 : -1;
        });
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: localStorage.getItem('mycloudLogonID'),
            PrefName: 'stockadjustmentcard'
        });
    },
    salesCloudGridPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: localStorage.getItem('mycloudLogonID'),
            PrefName: 'tblStockAdjustmentLine'
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
    productcost: () => {
        return localStorage.getItem('CloudProductCost');
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
        var isMobile = false; //initiate as false
        // device detection
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
             || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
            isMobile = true;
        }

        return isMobile;
    },
    generateLineProductSelectId: (id, cost) => {
        let costRefined = cost.replace(/[^0-9.-]+/g, "");
        let ret = id + "-" + costRefined.replace(/\./g, "_");
        return ret;
    },
    getCostFromLineProductSelectId: (id) => {
        let tdproductCost = '';

        if(id.indexOf('-') >= 0) {
            let temp = id.split('-');
            tdproductCost = temp[1];
        }

        return tdproductCost.replace(/_/g, ".");
    },
    concat: (options) => {
        return Array.prototype.slice.call(options, 0, -1).join('');
    }
});

Template.stockadjustmentcard.events({
    'change #sltDepartment': function (event) {
        let templateObject = Template.instance();
        let totalAvailQty = 0;
        let totalInStockQty = 0;
        let deptName = $('#sltDepartment').val();
        //let dataValue = templateObject.productquantityrecord.get();
        let $tblrows = $("#tblStockAdjustmentLine tbody tr");
        $tblrows.each(function (index) {
            var $tblrow = $(this);
            let productname = $tblrow.find(".colProductName").text() || '';
            let selectLineID = $tblrow.closest('tr').attr('id');
            templateObject.getProductQty(selectLineID, productname);

        });
    },
    'change .lineProductCost': function (event) {
        let inputProductCost = 0;
        if (!isNaN($(event.target).val())) {
            inputProductCost = parseFloat($(event.target).val()) || 0;
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputProductCost));
        } else {
            inputProductCost = Number($(event.target).val().replace(/[^0-9.-]+/g, "")) || 0;
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputProductCost));

        }
    },
    'blur .lineQty': function (event) {
        let templateObject = Template.instance();
        let taxcodeList = templateObject.taxraterecords.get();
        let utilityService = new UtilityService();
        let $tblrows = $("#tblStockAdjustmentLine tbody tr");
        //if(selectLineID){
        let lineAmount = 0;
        let subGrandTotal = 0;
        let taxGrandTotal = 0;

        $tblrows.each(function (index) {
            var $tblrow = $(this);
            var qty = $tblrow.find(".lineQty").text() || 0;
            var price = $tblrow.find(".lineUnitPrice").text() || 0;
            var taxcode = $tblrow.find(".lineTaxRate").text() || 0;

            var taxrateamount = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == taxcode) {
                        taxrateamount = taxcodeList[i].coderate;
                    }
                }
            }

            var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
            var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
            if (!isNaN(subTotal)) {
                $tblrow.find('.lineAmt').text(Currency + '' + subTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    }));
                subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                document.getElementById("subtotal_total").innerHTML = Currency + '' + subGrandTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
            }

            if (!isNaN(taxTotal)) {
                taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
                document.getElementById("subtotal_tax").innerHTML = Currency + '' + taxGrandTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
            }

            if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                document.getElementById("grandTotal").innerHTML = Currency + '' + GrandTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                document.getElementById("balanceDue").innerHTML = Currency + '' + GrandTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                document.getElementById("totalBalanceDue").innerHTML = Currency + '' + GrandTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });

            }
        });
        //}
    },
    'blur .lineUnitPrice': function (event) {

        let utilityService = new UtilityService();
        if (!isNaN($('.lineUnitPrice').text())) {
            let inputUnitPrice = parseFloat($(event.target).text());
            $(event.target).text(Currency + '' + inputUnitPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                }));
        } else {
            let inputUnitPrice = Number($(event.target).text().replace(/[^0-9.-]+/g, ""));
            //parseFloat(parseFloat($.trim($(event.target).text().substring(Currency.length).replace(",", ""))) || 0);
            $(event.target).text(Currency + '' + inputUnitPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                }));
            //$('.lineUnitPrice').text();

        }
        let templateObject = Template.instance();
        let taxcodeList = templateObject.taxraterecords.get();
        // let utilityService = new UtilityService();
        let $tblrows = $("#tblStockAdjustmentLine tbody tr");
        //if(selectLineID){
        let lineAmount = 0;
        let subGrandTotal = 0;
        let taxGrandTotal = 0;

        $tblrows.each(function (index) {
            var $tblrow = $(this);
            var qty = $tblrow.find(".lineQty").text() || 0;
            var price = $tblrow.find(".lineUnitPrice").text() || 0;
            var taxcode = $tblrow.find(".lineTaxRate").text() || 0;

            var taxrateamount = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == taxcode) {
                        taxrateamount = taxcodeList[i].coderate;
                    }
                }
            }

            var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
            var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
            if (!isNaN(subTotal)) {
                $tblrow.find('.lineAmt').text(Currency + '' + subTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    }));
                subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                document.getElementById("subtotal_total").innerHTML = Currency + '' + subGrandTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
            }

            if (!isNaN(taxTotal)) {
                taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
                document.getElementById("subtotal_tax").innerHTML = Currency + '' + taxGrandTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
            }

            if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                document.getElementById("grandTotal").innerHTML = Currency + '' + GrandTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                document.getElementById("balanceDue").innerHTML = Currency + '' + GrandTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });
                document.getElementById("totalBalanceDue").innerHTML = Currency + '' + GrandTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2
                });

            }
        });
    },
    'click #btnCustomFileds': function (event) {
        var x = document.getElementById("divCustomFields");
        if (x.style.display === "none") {
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }
    },
    'click #productListModal #refreshpagelist': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        localStorage.setItem('VS1SalesProductList', '');
        let templateObject = Template.instance();
        Meteor._reload.reload();
        templateObject.getAllProducts();

    },
    'click .lineTaxRate': function (event) {
        $('#tblStockAdjustmentLine tbody tr .lineTaxRate').attr("data-toggle", "modal");
        $('#tblStockAdjustmentLine tbody tr .lineTaxRate').attr("data-target", "#taxRateListModal");
        var targetID = $(event.target).closest('tr').attr('id'); // table row ID
        $('#selectLineID').val(targetID);
    },
    'click .lineTaxCode': function (event) {
        $('#tblStockAdjustmentLine tbody tr .lineTaxCode').attr("data-toggle", "modal");
        $('#tblStockAdjustmentLine tbody tr .lineTaxCode').attr("data-target", "#taxRateListModal");
        var targetID = $(event.target).closest('tr').attr('id'); // table row ID
        $('#selectLineID').val(targetID);
    },
    'click .printConfirm': function (event) {
        playPrintAudio();
        setTimeout(function(){
        $('#html-2-pdfwrapper').css('display', 'block');
        $('.pdfCustomerName').html($('#sltAccountName').val());
        $('.pdfCustomerAddress').html($('#txabillingAddress').val());
        $('#printcomment').html($('#txaNotes').val().replace(/[\r\n]/g, "<br />"));
        exportSalesToPdf();
    }, delayTimeAfterSound);
    },
    'click #printModal .btn-check-template': async function (event) {
        const template = $(event.target).data('template');
        playPrintAudio();
        setTimeout(async function(){
            $('.fullScreenSpin').css('display', 'inline-block');
            $('#html-2-pdfwrapper').css('display', 'block');
            var template_number = $('input[name="Stock Adjustment"]:checked').val();
            let result = await exportSalesToPdf1(template,template_number);
            if(result == true)
            {

            }
        }, delayTimeAfterSound);
    },
    'keydown .lineQty, keydown .lineUnitPrice': function (event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
            // Allow: Ctrl+A, Command+A
            (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||
            // Allow: home, end, left, right, down, up
            (event.keyCode >= 35 && event.keyCode <= 40)) {
            // let it happen, don't do anything
            return;
        }

        if (event.shiftKey == true) {
            event.preventDefault();
        }

        if ((event.keyCode >= 48 && event.keyCode <= 57) ||
            (event.keyCode >= 96 && event.keyCode <= 105) ||
            event.keyCode == 8 || event.keyCode == 9 ||
            event.keyCode == 37 || event.keyCode == 39 ||
            event.keyCode == 46 || event.keyCode == 190 || event.keyCode == 189 || event.keyCode == 109) {}
        else {
            event.preventDefault();
        }
    },
    'click .btnRemove': async function (event) {
        let templateObject = Template.instance();
        var targetID = $(event.target).closest('tr').attr('id'); // table row ID
        $('#selectDeleteLineID').val(targetID);
        if(targetID != undefined) {
            times++;
            if (times == 1) {
                $('#deleteLineModal').modal('toggle');
            } else {
                if ($('#tblStockAdjustmentLine tbody>tr').length > 1) {
                    this.click;
                    $(event.target).closest('tr').remove();
                    event.preventDefault();
                    let $tblrows = $("#tblStockAdjustmentLine tbody tr");
                    //if(selectLineID){
                    let lineAmount = 0;
                    let subGrandTotal = 0;
                    let taxGrandTotal = 0;

                    return false;

                } else {
                    $('#deleteLineModal').modal('toggle');
                }
            }
        } else {
            if(templateObject.hasFollow.get()) $("#footerDeleteModal2").modal("toggle");
            else $("#footerDeleteModal1").modal("toggle");
        }
    },
    'click .btnDeleteFollowingStocks': async function (event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        let stockTransferService = new StockTransferService();
        setTimeout(async function(){
        var currentDate = new Date();

        swal({
            title: 'You are deleting ' + $("#following_cnt").val() + ' Stock Adjustment',
            text: "Do you wish to delete this transaction and all others associated with it moving forward?",
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then(async (result) => {
            if (result.value) {
                var url = FlowRouter.current().path;
                var getso_id = url.split('?id=');
                var currentInvoice = getso_id[getso_id.length - 1];
                var objDetails = '';
                if (getso_id[1]) {
                    $('.deleteloadingbar').css('width', ('0%')).attr('aria-valuenow', 0);
                    $("#deleteLineModal").modal('hide');
                    $("#deleteprogressbar").css('display', 'block');
                    $("#deleteprogressbar").modal('show');
                    currentInvoice = parseInt(currentInvoice);
                    var stockData = await stockTransferService.getOneStockAdjustData(currentInvoice);
                    var adjustmentDate = stockData.fields.AdjustmentDate;
                    var fromDate = adjustmentDate.substring(0, 10);
                    var toDate = currentDate.getFullYear() + '-' + ("0" + (currentDate.getMonth() + 1)).slice(-2) + '-' + ("0" + (currentDate.getDate())).slice(-2);
                    var followingStocks = await sideBarService.getAllStockAdjustEntry("All", stockData.fields.Recno);//initialDataLoad
                    var stockList = followingStocks.tstockadjustentry;
                    var j = 0;
                    for (var i=0; i < stockList.length; i++) {
                        var objDetails = {
                            type: "TStockadjustentry",
                            fields: {
                                ID: stockList[i].fields.ID,
                                Deleted: true
                            }
                        };
                        j ++;
                        document.getElementsByClassName("deleteprogressBarInner")[0].innerHTML = j + '';
                        $('.deleteloadingbar').css('width', ((100/stockList.length*j)) + '%').attr('aria-valuenow', ((100/stockList.length*j)));
                        var result = await stockTransferService.saveStockAdjustment(objDetails);
                    }
                }
                $("#deletecheckmarkwrapper").removeClass('hide');
                $('.modal-backdrop').css('display', 'none');
                $("#deleteprogressbar").modal('hide');
                $("#btn_data").click();
                // FlowRouter.go('/stockadjustmentoverview?success=true');
                // $('.modal-backdrop').css('display', 'none');
                // $('#deleteLineModal').modal('toggle');
            }
        });
    }, delayTimeAfterSound);
    },
    'click .btnDeleteStock': function (event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        let stockTransferService = new StockTransferService();
        setTimeout(function(){
        $('.fullScreenSpin').css('display', 'inline-block');
        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentInvoice = getso_id[getso_id.length - 1];
        var objDetails = '';
        if (getso_id[1]) {
            currentInvoice = parseInt(currentInvoice);
            var objDetails = {
                type: "TStockadjustentry",
                fields: {
                    ID: currentInvoice,
                    Deleted: true
                }
            };

            stockTransferService.saveStockAdjustment(objDetails).then(function (objDetails) {
                FlowRouter.go('/stockadjustmentoverview?success=true');
                $('.modal-backdrop').css('display', 'none');
            }).catch(function (err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {}
                });
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            FlowRouter.go('/stockadjustmentoverview?success=true');
            $('.modal-backdrop').css('display', 'none');
        }
        $('#deleteLineModal').modal('toggle');
        $('.modal-backdrop').css('display', 'none');
    }, delayTimeAfterSound);
    },
    'click .btnDeleteStockAdjust': function (event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        let stockTransferService = new StockTransferService();
        setTimeout(function(){
        swal({
            title: 'Delete Stock Adjustment',
            text: "Are you sure you want to Delete Stock Adjustment?",
            type: 'info',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then((result) => {
            if (result.value) {
                $('.fullScreenSpin').css('display', 'inline-block');
                var url = FlowRouter.current().path;
                var getso_id = url.split('?id=');
                var currentInvoice = getso_id[getso_id.length - 1];
                var objDetails = '';
                if (getso_id[1]) {
                    currentInvoice = parseInt(currentInvoice);
                    var objDetails = {
                        type: "TStockadjustentry",
                        fields: {
                            ID: currentInvoice,
                            Deleted: true
                        }
                    };

                    stockTransferService.saveStockAdjustment(objDetails).then(function (objDetails) {
                        FlowRouter.go('/stockadjustmentoverview?success=true');
                        $('.modal-backdrop').css('display', 'none');

                    }).catch(function (err) {
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                Meteor._reload.reload();
                            } else if (result.dismiss === 'cancel') {}
                        });
                        $('.fullScreenSpin').css('display', 'none');
                    });
                } else {
                    FlowRouter.go('/stockadjustmentoverview?success=true');
                    $('.modal-backdrop').css('display', 'none');
                }
                //$('#deleteLineModal').modal('toggle');
            } else {}
        });
    }, delayTimeAfterSound);
    },
    'click .btnDeleteLine': function (event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        setTimeout(function(){

        let selectLineID = $('#selectDeleteLineID').val();
        if ($('#tblStockAdjustmentLine tbody>tr').length > 1) {
            this.click;

            $('#' + selectLineID).closest('tr').remove();
            //event.preventDefault();
            let $tblrows = $("#tblStockAdjustmentLine tbody tr");
            //if(selectLineID){
            let lineAmount = 0;
            let subGrandTotal = 0;
            let taxGrandTotal = 0;
            //return false;

        } else {
            this.click;
            // $(event.target).closest('tr').remove();
            $('#' + selectLineID + " .lineProductName").val('');
            $('#' + selectLineID + " .lineDescription").text('');
            $('#' + selectLineID + " .lineProductBarCode").text('');
            $('#' + selectLineID + " .lineInStockQty").text('');
            $('#' + selectLineID + " .lineFinalQty").val('');
            $('#' + selectLineID + " .lineAdjustQty").val('');
            $('#' + selectLineID + " .lineCostPrice").text('');
            $('#' + selectLineID + " .lineSalesLinesCustField1").text('');
            $('#' + selectLineID + " .lineTaxRate").text('');
            $('#' + selectLineID + " .lineTaxCode").text('');
            $('#' + selectLineID + " .lineAmt").text('');

            //event.preventDefault();

        }

        $('#deleteLineModal').modal('toggle');
    }, delayTimeAfterSound);
    },
    'click .btnSaveSettings': function (event) {
        playSaveAudio();
        setTimeout(function(){
        $('#myModal4').modal('toggle');
        }, delayTimeAfterSound);
    },
    'click .btnProcess': function (event) {
        //let testDate = $("#dtSODate").datepicker({dateFormat: 'dd-mm-yy' });
        $('#html-2-pdfwrapper').css('display', 'block');
        let templateObject = Template.instance();
        let accountname = $('#sltAccountName');
        // let department = $('#sltDepartment').val();
        let stockTransferService = new StockTransferService();
        if (accountname.val() === '') {
            swal('Account has not been selected!', '', 'warning');
            e.preventDefault();
        } else {
            //$('.loginSpinner').css('display','inline-block');
            $('.fullScreenSpin').css('display', 'inline-block');
            var splashLineArray = new Array();
            let lineItemsForm = [];
            let lineItemObjForm = {};
            $('#tblStockAdjustmentLine > tbody > tr').each(function () {
                var lineID = this.id;
                let tdproduct = $('#' + lineID + " .lineProductName").val();

                let tdproductID = $('#' + lineID + " .lineProductName").attr('id');
                let tdproductCost = templateObject.getCostFromLineProductSelectId(tdproductID);

                let tdbarcode = $('#' + lineID + " .lineProductBarCode").html();
                let tddescription = $('#' + lineID + " .lineDescription").html();
                let tdinstockqty = $('#' + lineID + " .lineInStockQty").text();
                let tdfinalqty = $('#' + lineID + " .lineFinalQty").val();
                let tdadjustqty = $('#' + lineID + " .lineAdjustQty").val();
                let tdDepartment = $('#' + lineID + " .lineDepartment").val();
                let tdSerialNumber = $('#' + lineID + " .colSerialNo").attr('data-serialnumbers');
                let tdLotNumber = $('#' + lineID + " .colSerialNo").attr('data-lotnumbers');
                let tdLotExpiryDate = $('#' + lineID + " .colSerialNo").attr('data-expirydates');

                if (tdproduct != "") {
                    // Feature/ser-lot number tracking: Save Serial Numbers
                    if (tdSerialNumber) {
                        const serialNumbers = tdSerialNumber.split(',');
                        for (let i = 0; i < serialNumbers.length; i++) {
                            lineItemObjForm = {
                                type: "TSAELinesFlat",
                                fields: {
                                    ProductName: tdproduct || '',
                                    //AccountName: accountname.val() || '',
                                    //ProductID: tdproductID || '',
                                    Cost: parseFloat(tdproductCost.replace(/[^0-9.-]+/g, "")) || 0,
                                    AdjustQty: parseFloat(tdadjustqty) || 0,
                                    AdjustUOMQty: parseFloat(tdadjustqty) || 0,
                                    Qty: parseFloat(tdadjustqty) || 0,
                                    UOMQty: parseFloat(tdadjustqty) || 0,
                                    FinalQty: parseFloat(tdfinalqty) || 0,
                                    FinalUOMQty: parseFloat(tdfinalqty) || 0,
                                    InStockUOMQty: parseFloat(tdinstockqty) || 0,
                                    DeptName: tdDepartment || defaultDept,
                                    ProductPrintName: tdproduct || '',
                                    PartBarcode: tdbarcode || '',
                                    Description: tddescription || '',
                                   SerialNumber: serialNumbers[i],
                                }
                            };
                            splashLineArray.push(lineItemObjForm);
                        }
                    } else if (tdLotNumber) {
                        const lotNumbers = tdLotNumber.split(',');
                        const expiryDates = tdLotExpiryDate.split(',');
                        for (let i = 0; i < lotNumbers.length; i++) {
                            const expiryDate = expiryDates[i].split('/');
                            lineItemObjForm = {
                                type: "TSAELinesFlat",
                                fields: {
                                    ProductName: tdproduct || '',
                                    //AccountName: accountname.val() || '',
                                    //ProductID: tdproductID || '',
                                    Cost: parseFloat(tdproductCost.replace(/[^0-9.-]+/g, "")) || 0,
                                    AdjustQty: parseFloat(tdadjustqty) || 0,
                                    AdjustUOMQty: parseFloat(tdadjustqty) || 0,
                                    Qty: parseFloat(tdadjustqty) || 0,
                                    UOMQty: parseFloat(tdadjustqty) || 0,
                                    FinalQty: parseFloat(tdfinalqty) || 0,
                                    FinalUOMQty: parseFloat(tdfinalqty) || 0,
                                    InStockUOMQty: parseFloat(tdinstockqty) || 0,
                                    DeptName: tdDepartment || defaultDept,
                                    ProductPrintName: tdproduct || '',
                                    PartBarcode: tdbarcode || '',
                                    Description: tddescription || '',
                                    BatchNo: lotNumbers[i],
                                    ExpiryDate: new Date(parseInt(expiryDate[2]), parseInt(expiryDate[1]) - 1, parseInt(expiryDate[0])).toISOString(),
                               }
                            };
                            splashLineArray.push(lineItemObjForm);
                        }
                    } else {
                        lineItemObjForm = {
                            type: "TSAELinesFlat",
                            fields: {
                                ProductName: tdproduct || '',
                                //AccountName: accountname.val() || '',
                                //ProductID: tdproductID || '',
                                Cost: parseFloat(tdproductCost.replace(/[^0-9.-]+/g, "")) || 0,
                                AdjustQty: parseFloat(tdadjustqty) || 0,
                                AdjustUOMQty: parseFloat(tdadjustqty) || 0,
                                Qty: parseFloat(tdadjustqty) || 0,
                                UOMQty: parseFloat(tdadjustqty) || 0,
                                FinalQty: parseFloat(tdfinalqty) || 0,
                                FinalUOMQty: parseFloat(tdfinalqty) || 0,
                                InStockUOMQty: parseFloat(tdinstockqty) || 0,
                                DeptName: tdDepartment || defaultDept,
                                ProductPrintName: tdproduct || '',
                                PartBarcode: tdbarcode || '',
                                Description: tddescription || ''
                            }
                        };
                        splashLineArray.push(lineItemObjForm);
                    }
                }
            });

            let selectAccount = $('#sltAccountName').val();

            let notes = $('#txaNotes').val();
            var creationdateTime = new Date($("#dtCreationDate").datepicker("getDate"));
            let creationDate = creationdateTime.getFullYear() + "-" + (creationdateTime.getMonth() + 1) + "-" + creationdateTime.getDate();

            var url = FlowRouter.current().path;
            var getso_id = url.split('?id=');
            var currentStock = getso_id[getso_id.length - 1];
            let uploadedItems = templateObject.uploadedFiles.get();
            var objDetails = '';

            if (getso_id[1]) {
                currentStock = parseInt(currentStock);
                objDetails = {
                    type: "TStockadjustentry",
                    fields: {
                        ID: currentStock,
                        AccountName: selectAccount,
                        AdjustmentDate: creationDate,
                        AdjustmentOnInStock: true,
                        AdjustType: "Gen",
                        Approved: false,
                        CreationDate: creationDate,
                        Deleted: false,
                        Employee: localStorage.getItem('mySessionEmployee'),
                        EnforceUOM: false,
                        //ISEmpty:false,
                        //IsStockTake:false,
                        Lines: splashLineArray,
                        DoProcessonSave: true,
                        Notes: notes

                    }
                };
            } else {
                objDetails = {
                    type: "TStockadjustentry",
                    fields: {
                        AccountName: selectAccount,
                        AdjustmentDate: creationDate,
                        AdjustmentOnInStock: true,
                        AdjustType: "Gen",
                        Approved: false,
                        CreationDate: creationDate,
                        Deleted: false,
                        Employee: localStorage.getItem('mySessionEmployee'),
                        EnforceUOM: false,
                        //ISEmpty:false,
                        //IsStockTake:false,
                        Lines: splashLineArray,
                        DoProcessonSave: true,
                        Notes: notes
                    }
                };
            }

            stockTransferService.saveStockAdjustment(objDetails).then(function (objDetails) {

                if (localStorage.getItem("enteredURL") != null) {
                    FlowRouter.go(localStorage.getItem("enteredURL"));
                    localStorage.removeItem("enteredURL");
                    return;
                }

                // FlowRouter.go('/stockadjustmentoverview?success=true');
                function generatePdfForMail(invoiceId) {
                    let file = "Invoice-" + invoiceId + ".pdf"
                        return new Promise((resolve, reject) => {
                        let templateObject = Template.instance();
                        let completeTabRecord;
                        let doc = new jsPDF('p', 'pt', 'a4');
                        var source = document.getElementById('html-2-pdfwrapper');
                        var opt = {
                            margin: 0,
                            filename: file,
                            image: {
                                type: 'jpeg',
                                quality: 0.98
                            },
                            html2canvas: {
                                scale: 2
                            },
                            jsPDF: {
                                unit: 'in',
                                format: 'a4',
                                orientation: 'portrait'
                            }
                        }
                        resolve(html2pdf().set(opt).from(source).toPdf().output('datauristring'));

                    });
                }

                async function addAttachment() {
                    let attachment = [];
                    let templateObject = Template.instance();

                    let invoiceId = objDetails.fields.ID;
                    await JsBarcode('#stockAdjustmentBarCode', 'SA-' + invoiceId);
                    let encodedPdf = await generatePdfForMail(invoiceId);
                    // var base64data = reader.result;
                    let base64data = encodedPdf.split(',')[1];
                    pdfObject = {
                        filename: 'Stock Adjustment-' + invoiceId + '.pdf',
                        content: base64data,
                        encoding: 'base64'
                    };
                    attachment.push(pdfObject);
                    let erpInvoiceId = objDetails.fields.ID;

                    let mailFromName = localStorage.getItem('vs1companyName');
                    let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
                    //let customerEmailName = $('#edtCustomerName').val();
                    let checkEmailData = $('#edtSupplierEmail').val();
                    // let grandtotal = $('#grandTotal').html();
                    // let amountDueEmail = $('#totalBalanceDue').html();
                    // let emailDueDate = $("#dtDueDate").val();
                    // let customerBillingAddress = $('#txabillingAddress').val();
                    // let customerTerms = $('#sltTerms').val();

                    // let customerSubtotal = $('#subtotal_total').html();
                    // let customerTax = $('#subtotal_tax').html();
                    // let customerNett = $('#subtotal_nett').html();
                    // let customerTotal = $('#grandTotal').html();
                    let mailSubject = 'Stock Adjustment ' + erpInvoiceId + ' from ' + mailFromName;
                    let mailBody = "Hi " + ",\n\n Here's Stock Adjustment " + erpInvoiceId + " from  " + mailFromName;

                    var htmlmailBody = '    <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate;mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">' +
                        '        <tr>' +
                        '            <td class="container" style="display: block; margin: 0 auto !important; max-width: 650px; padding: 10px; width: 650px;">' +
                        '                <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 650px; padding: 10px;">' +
                        '                    <table class="main">' +
                        '                        <tr>' +
                        '                            <td class="wrapper">' +
                        '                                <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">' +
                        '                                    <tr>' +
                        '                                        <td class="content-block" style="text-align: center; letter-spacing: 2px;">' +
                        '                                            <span class="doc-details" style="color: #999999; font-size: 12px; text-align: center; margin: 0 auto; text-transform: uppercase;">Stock Adjustment No. ' + erpInvoiceId + ' Details</span>' +
                        '                                        </td>' +
                        '                                    </tr>' +
                        '                                    <tr style="height: 16px;"></tr>' +
                        '                                    <tr>' +
                        '                                        <td>' +
                        '                                            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" style="border: none; -ms-interpolation-mode: bicubic; max-width: 100%;" />' +
                        '                                        </td>' +
                        '                                    </tr>' +
                        '                                    <tr style="height: 48px;"></tr>' +
                        '                                    <tr>' +
                        '                                        <td class="content-block" style="padding: 16px 32px;">' +
                        '                                            <p style="font-size: 18px;">Hi </p>' +
                        '                                            <p style="font-size: 18px; margin: 34px 0px;">Please find the Stock Adjustment attached to this email.</p>' +
                        '                                            <p style="font-size: 18px; margin-bottom: 8px;">Thanks you</p>' +
                        '                                            <p style="font-size: 18px;">' + mailFromName + '</p>' +
                        '                                    <tr>' +
                        '                                        <td class="content-block" style="padding: 16px 32px;">' +
                        '                                            <p style="font-size: 15px; color: #666666;">If you receive an email that seems fraudulent, please check with the business owner before paying.</p>' +
                        '                                        </td>' +
                        '                                    </tr>' +
                        '                                    <tr>' +
                        '                                        <td>' +
                        '                                            <table border="0" cellpadding="0" cellspacing="0" style="box-sizing: border-box; width: 100%;">' +
                        '                                                <tbody>' +
                        '                                                    <tr>' +
                        '                                                        <td align="center">' +
                        '                                                            <table border="0" cellpadding="0" cellspacing="0" style="width: auto;">' +
                        '                                                                <tbody>' +
                        '                                                                    <tr>' +
                        '                                                                        <td> <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" style="border: none; -ms-interpolation-mode: bicubic; max-width: 100%; width: 20%; margin: 0; padding: 12px 25px; display: inline-block;" /> </td>' +
                        '                                                                    </tr>' +
                        '                                                                </tbody>' +
                        '                                                            </table>' +
                        '                                                        </td>' +
                        '                                                    </tr>' +
                        '                                                </tbody>' +
                        '                                            </table>' +
                        '                                        </td>' +
                        '                                    </tr>' +
                        '                                </table>' +
                        '                            </td>' +
                        '                        </tr>' +
                        '                    </table>' +
                        '                    <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">' +
                        '                        <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">' +
                        '                            <tr>' +
                        '                                <td class="content-block" style="color: #999999; font-size: 12px; text-align: center;">' +
                        '                                    <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">Company Inc, 3 Abbey Road, San Francisco CA 90210</span>' +
                        '                                    <br>' +
                        '                                    <a href="#" style="color: #999999; font-size: 12px; text-align: center;">Privacy</a>' +
                        '                                    <a href="#" style="color: #999999; font-size: 12px; text-align: center;">Security</a>' +
                        '                                    <a href="#" style="color: #999999; font-size: 12px; text-align: center;">Terms of Service</a>' +
                        '                                </td>' +
                        '                            </tr>' +
                        '                        </table>' +
                        '                    </div>' +
                        '                </div>' +
                        '            </td>' +
                        '        </tr>' +
                        '    </table>';

                    if (($('.chkEmailCopy').is(':checked'))) {
                        $('#html-2-pdfwrapper').css('display', 'none');
                        Meteor.call('sendEmail', {
                            from: "" + mailFromName + " <" + mailFrom + ">",
                            to: checkEmailData,
                            subject: mailSubject,
                            text: '',
                            html: htmlmailBody,
                            attachments: attachment
                        }, function (error, result) {
                            if (error && error.error === "error") {
                                FlowRouter.go('/stockadjustmentoverview?success=true');

                            } else {
                                swal({
                                    title: 'SUCCESS',
                                    text: "Email Sent To Employee: " + checkEmailData + " ",
                                    type: 'success',
                                    showCancelButton: false,
                                    confirmButtonText: 'OK'
                                }).then((result) => {
                                    if (result.value) {
                                        FlowRouter.go('/stockadjustmentoverview?success=true');
                                    } else if (result.dismiss === 'cancel') {}
                                });

                                $('.fullScreenSpin').css('display', 'none');
                            }
                        });

                    } else {
                        FlowRouter.go('/stockadjustmentoverview?success=true');
                    };

                }
                addAttachment();
                $('.modal-backdrop').css('display', 'none');

            }).catch(function (err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {}
                });
                //$('.loginSpinner').css('display','none');
                $('.fullScreenSpin').css('display', 'none');
            });
        }

    },
    'click .btnHold': function (event) {
        $('#html-2-pdfwrapper').css('display', 'block');
        let templateObject = Template.instance();
        let accountname = $('#sltAccountName');
        // let department = $('#sltDepartment').val();
        let stockTransferService = new StockTransferService();
        if (accountname.val() === '') {
            swal('Account has not been selected!', '', 'warning');
            e.preventDefault();
        } else {
            //$('.loginSpinner').css('display','inline-block');
            $('.fullScreenSpin').css('display', 'inline-block');
            var splashLineArray = new Array();
            let lineItemsForm = [];
            let lineItemObjForm = {};

            $('#tblStockAdjustmentLine > tbody > tr').each(function () {
                var lineID = this.id;
                let tdproduct = $('#' + lineID + " .lineProductName").val();

                let tdproductID = $('#' + lineID + " .lineProductName").attr('id');
                let tdproductCost = templateObject.getCostFromLineProductSelectId(tdproductID);

                let tdbarcode = $('#' + lineID + " .lineProductBarCode").html();
                let tddescription = $('#' + lineID + " .lineDescription").html() || '';
                let tdinstockqty = $('#' + lineID + " .lineInStockQty").text();
                let tdfinalqty = $('#' + lineID + " .lineFinalQty").val();
                let tdadjustqty = $('#' + lineID + " .lineAdjustQty").val();
                let tdDepartment = $('#' + lineID + " .lineDepartment").val();
                let tdSerialNumber = $('#' + lineID + " .colSerialNo").attr('data-serialnumbers');
                let tdLotNumber = $('#' + lineID + " .colSerialNo").attr('data-lotnumbers');
                let tdLotExpiryDate = $('#' + lineID + " .colSerialNo").attr('data-expirydates');
                if (tdproduct != "") {
                    // Feature/ser-lot number tracking: Save Serial Numbers
                    if (tdSerialNumber) {
                        const serialNumbers = tdSerialNumber.split(',');
                        for (let i = 0; i < serialNumbers.length; i++) {
                            lineItemObjForm = {
                                type: "TSAELinesFlat",
                                fields: {
                                    ProductName: tdproduct || '',
                                    //AccountName: accountname.val() || '',
                                    //ProductID: tdproductID || '',
                                    Cost: parseFloat(tdproductCost.replace(/[^0-9.-]+/g, "")) || 0,
                                    AdjustQty: parseFloat(tdadjustqty) || 0,
                                    AdjustUOMQty: parseFloat(tdadjustqty) || 0,
                                    Qty: parseFloat(tdadjustqty) || 0,
                                    UOMQty: parseFloat(tdadjustqty) || 0,
                                    FinalQty: parseFloat(tdfinalqty) || 0,
                                    FinalUOMQty: parseFloat(tdfinalqty) || 0,
                                    InStockUOMQty: parseFloat(tdinstockqty) || 0,
                                    DeptName: tdDepartment || defaultDept,
                                    ProductPrintName: tdproduct || '',
                                    PartBarcode: tdbarcode || '',
                                    Description: tddescription || '',
                                    SerialNumber: serialNumbers[i],
                                }
                            };
                            splashLineArray.push(lineItemObjForm);
                        }
                    } else if (tdLotNumber) {
                        const lotNumbers = tdLotNumber.split(',');
                        const expiryDates = tdLotExpiryDate.split(',');
                        for (let i = 0; i < lotNumbers.length; i++) {
                            const expiryDate = expiryDates[i].split('/');
                            lineItemObjForm = {
                                type: "TSAELinesFlat",
                                fields: {
                                    ProductName: tdproduct || '',
                                    //AccountName: accountname.val() || '',
                                    //ProductID: tdproductID || '',
                                    Cost: parseFloat(tdproductCost.replace(/[^0-9.-]+/g, "")) || 0,
                                    AdjustQty: parseFloat(tdadjustqty) || 0,
                                    AdjustUOMQty: parseFloat(tdadjustqty) || 0,
                                    Qty: parseFloat(tdadjustqty) || 0,
                                    UOMQty: parseFloat(tdadjustqty) || 0,
                                    FinalQty: parseFloat(tdfinalqty) || 0,
                                    FinalUOMQty: parseFloat(tdfinalqty) || 0,
                                    InStockUOMQty: parseFloat(tdinstockqty) || 0,
                                    DeptName: tdDepartment || defaultDept,
                                    ProductPrintName: tdproduct || '',
                                    PartBarcode: tdbarcode || '',
                                    Description: tddescription || '',
                                    BatchNo: lotNumbers[i],
                                    ExpiryDate: new Date(parseInt(expiryDate[2]), parseInt(expiryDate[1]) - 1, parseInt(expiryDate[0])).toISOString(),
                               }
                            };
                            splashLineArray.push(lineItemObjForm);
                        }
                    } else {
                        lineItemObjForm = {
                            type: "TSAELinesFlat",
                            fields: {
                                ProductName: tdproduct || '',
                                //AccountName: accountname.val() || '',
                                //ProductID: tdproductID || '',
                                Cost: parseFloat(tdproductCost.replace(/[^0-9.-]+/g, "")) || 0,
                                AdjustQty: parseFloat(tdadjustqty) || 0,
                                AdjustUOMQty: parseFloat(tdadjustqty) || 0,
                                Qty: parseFloat(tdadjustqty) || 0,
                                UOMQty: parseFloat(tdadjustqty) || 0,
                                FinalQty: parseFloat(tdfinalqty) || 0,
                                FinalUOMQty: parseFloat(tdfinalqty) || 0,
                                InStockUOMQty: parseFloat(tdinstockqty) || 0,
                                DeptName: tdDepartment || defaultDept,
                                ProductPrintName: tdproduct || '',
                                PartBarcode: tdbarcode || '',
                                Description: tddescription || ''
                            }
                        };
                        splashLineArray.push(lineItemObjForm);
                    }
               }
            });

            let selectAccount = $('#sltAccountName').val();

            let notes = $('#txaNotes').val();
            var creationdateTime = new Date($("#dtCreationDate").datepicker("getDate"));
            let creationDate = creationdateTime.getFullYear() + "-" + (creationdateTime.getMonth() + 1) + "-" + creationdateTime.getDate();
            var url = FlowRouter.current().path;
            var getso_id = url.split('?id=');
            var currentStock = getso_id[getso_id.length - 1];
            let uploadedItems = templateObject.uploadedFiles.get();
            var objDetails = '';
            if (getso_id[1]) {
                currentStock = parseInt(currentStock);
                objDetails = {
                    type: "TStockadjustentry",
                    fields: {
                        ID: currentStock,
                        AccountName: selectAccount,
                        AdjustmentDate: creationDate,
                        AdjustmentOnInStock: true,
                        AdjustType: "Gen",
                        Approved: false,
                        CreationDate: creationDate,
                        Deleted: false,
                        Employee: localStorage.getItem('mySessionEmployee'),
                        EnforceUOM: false,
                        //ISEmpty:false,
                        //IsStockTake:false,
                        Lines: splashLineArray,
                        DoProcessonSave: false,
                        Notes: notes

                    }
                };
            } else {
                objDetails = {
                    type: "TStockadjustentry",
                    fields: {
                        AccountName: selectAccount,
                        AdjustmentDate: creationDate,
                        AdjustmentOnInStock: true,
                        AdjustType: "Gen",
                        Approved: false,
                        CreationDate: creationDate,
                        Deleted: false,
                        Employee: localStorage.getItem('mySessionEmployee'),
                        EnforceUOM: false,
                        //ISEmpty:false,
                        //IsStockTake:false,
                        Lines: splashLineArray,
                        DoProcessonSave: false,
                        Notes: notes
                    }
                };
            }

            stockTransferService.saveStockAdjustment(objDetails).then(function (objDetails) {
                function generatePdfForMail(invoiceId) {
                    let file = "Invoice-" + invoiceId + ".pdf"
                        return new Promise((resolve, reject) => {
                        let templateObject = Template.instance();
                        let completeTabRecord;
                        let doc = new jsPDF('p', 'pt', 'a4');
                        var source = document.getElementById('html-2-pdfwrapper');
                        var opt = {
                            margin: 0,
                            filename: file,
                            image: {
                                type: 'jpeg',
                                quality: 0.98
                            },
                            html2canvas: {
                                scale: 2
                            },
                            jsPDF: {
                                unit: 'in',
                                format: 'a4',
                                orientation: 'portrait'
                            }
                        }
                        resolve(html2pdf().set(opt).from(source).toPdf().output('datauristring'));

                    });
                }

                async function addAttachment() {
                    let attachment = [];
                    let templateObject = Template.instance();

                    let invoiceId = objDetails.fields.ID;
                    let encodedPdf = await generatePdfForMail(invoiceId);
                    // var base64data = reader.result;
                    let base64data = encodedPdf.split(',')[1];
                    pdfObject = {
                        filename: 'Stock Adjustment-' + invoiceId + '.pdf',
                        content: base64data,
                        encoding: 'base64'
                    };
                    attachment.push(pdfObject);
                    let erpInvoiceId = objDetails.fields.ID;

                    let mailFromName = localStorage.getItem('vs1companyName');
                    let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
                    //let customerEmailName = $('#edtCustomerName').val();
                    let checkEmailData = $('#edtSupplierEmail').val();
                    // let grandtotal = $('#grandTotal').html();
                    // let amountDueEmail = $('#totalBalanceDue').html();
                    // let emailDueDate = $("#dtDueDate").val();
                    // let customerBillingAddress = $('#txabillingAddress').val();
                    // let customerTerms = $('#sltTerms').val();

                    // let customerSubtotal = $('#subtotal_total').html();
                    // let customerTax = $('#subtotal_tax').html();
                    // let customerNett = $('#subtotal_nett').html();
                    // let customerTotal = $('#grandTotal').html();
                    let mailSubject = 'Stock Adjustment ' + erpInvoiceId + ' from ' + mailFromName;
                    let mailBody = "Hi " + ",\n\n Here's Stock Adjustment " + erpInvoiceId + " from  " + mailFromName;

                    var htmlmailBody = '    <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate;mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">' +
                        '        <tr>' +
                        '            <td class="container" style="display: block; margin: 0 auto !important; max-width: 650px; padding: 10px; width: 650px;">' +
                        '                <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 650px; padding: 10px;">' +
                        '                    <table class="main">' +
                        '                        <tr>' +
                        '                            <td class="wrapper">' +
                        '                                <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">' +
                        '                                    <tr>' +
                        '                                        <td class="content-block" style="text-align: center; letter-spacing: 2px;">' +
                        '                                            <span class="doc-details" style="color: #999999; font-size: 12px; text-align: center; margin: 0 auto; text-transform: uppercase;">Stock Adjustment No. ' + erpInvoiceId + ' Details</span>' +
                        '                                        </td>' +
                        '                                    </tr>' +
                        '                                    <tr style="height: 16px;"></tr>' +
                        '                                    <tr>' +
                        '                                        <td>' +
                        '                                            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" style="border: none; -ms-interpolation-mode: bicubic; max-width: 100%;" />' +
                        '                                        </td>' +
                        '                                    </tr>' +
                        '                                    <tr style="height: 48px;"></tr>' +
                        '                                    <tr>' +
                        '                                        <td class="content-block" style="padding: 16px 32px;">' +
                        '                                            <p style="font-size: 18px;">Hi </p>' +
                        '                                            <p style="font-size: 18px; margin: 34px 0px;">Please find the Stock Adjustment attached to this email.</p>' +
                        '                                            <p style="font-size: 18px; margin-bottom: 8px;">Thank you</p>' +
                        '                                            <p style="font-size: 18px;">' + mailFromName + '</p>' +
                        '                                    <tr>' +
                        '                                        <td class="content-block" style="padding: 16px 32px;">' +
                        '                                            <p style="font-size: 15px; color: #666666;">If you receive an email that seems fraudulent, please check with the business owner before paying.</p>' +
                        '                                        </td>' +
                        '                                    </tr>' +
                        '                                    <tr>' +
                        '                                        <td>' +
                        '                                            <table border="0" cellpadding="0" cellspacing="0" style="box-sizing: border-box; width: 100%;">' +
                        '                                                <tbody>' +
                        '                                                    <tr>' +
                        '                                                        <td align="center">' +
                        '                                                            <table border="0" cellpadding="0" cellspacing="0" style="width: auto;">' +
                        '                                                                <tbody>' +
                        '                                                                    <tr>' +
                        '                                                                        <td> <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" style="border: none; -ms-interpolation-mode: bicubic; max-width: 100%; width: 20%; margin: 0; padding: 12px 25px; display: inline-block;" /> </td>' +
                        '                                                                    </tr>' +
                        '                                                                </tbody>' +
                        '                                                            </table>' +
                        '                                                        </td>' +
                        '                                                    </tr>' +
                        '                                                </tbody>' +
                        '                                            </table>' +
                        '                                        </td>' +
                        '                                    </tr>' +
                        '                                </table>' +
                        '                            </td>' +
                        '                        </tr>' +
                        '                    </table>' +
                        '                    <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">' +
                        '                        <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">' +
                        '                            <tr>' +
                        '                                <td class="content-block" style="color: #999999; font-size: 12px; text-align: center;">' +
                        '                                    <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">Company Inc, 3 Abbey Road, San Francisco CA 90210</span>' +
                        '                                    <br>' +
                        '                                    <a href="#" style="color: #999999; font-size: 12px; text-align: center;">Privacy</a>' +
                        '                                    <a href="#" style="color: #999999; font-size: 12px; text-align: center;">Security</a>' +
                        '                                    <a href="#" style="color: #999999; font-size: 12px; text-align: center;">Terms of Service</a>' +
                        '                                </td>' +
                        '                            </tr>' +
                        '                        </table>' +
                        '                    </div>' +
                        '                </div>' +
                        '            </td>' +
                        '        </tr>' +
                        '    </table>';

                    if (($('.chkEmailCopy').is(':checked'))) {
                        $('#html-2-pdfwrapper').css('display', 'none');
                        Meteor.call('sendEmail', {
                            from: "" + mailFromName + " <" + mailFrom + ">",
                            to: checkEmailData,
                            subject: mailSubject,
                            text: '',
                            html: htmlmailBody,
                            attachments: attachment
                        }, function (error, result) {
                            if (error && error.error === "error") {
                                FlowRouter.go('/stockadjustmentoverview?success=true');

                            } else {
                                swal({
                                    title: 'SUCCESS',
                                    text: "Email Sent To Employee: " + checkEmailData + " ",
                                    type: 'success',
                                    showCancelButton: false,
                                    confirmButtonText: 'OK'
                                }).then((result) => {
                                    if (result.value) {
                                        FlowRouter.go('/stockadjustmentoverview?success=true');
                                    } else if (result.dismiss === 'cancel') {}
                                });

                                $('.fullScreenSpin').css('display', 'none');
                            }
                        });

                    } else {
                        FlowRouter.go('/stockadjustmentoverview?success=true');
                    };

                }
                addAttachment();
                $('.modal-backdrop').css('display', 'none');

            }).catch(function (err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {}
                });
                //$('.loginSpinner').css('display','none');
                $('.fullScreenSpin').css('display', 'none');
            });
        }

    },
    'click .chkProductName': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colProductName').css('display', 'table-cell');
            $('.colProductName').css('padding', '.75rem');
            $('.colProductName').css('vertical-align', 'top');

        } else {
            $('.colProductName').css('display', 'none');
        }
    },
    'click .chkDescription': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colDescription').css('display', 'table-cell');
            $('.colDescription').css('padding', '.75rem');
            $('.colDescription').css('vertical-align', 'top');
        } else {
            $('.colDescription').css('display', 'none');
        }
    },
    'click .chkProductBarCode': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colProductBarCode').css('display', 'table-cell');
            $('.colProductBarCode').css('padding', '.75rem');
            $('.colProductBarCode').css('vertical-align', 'top');
        } else {
            $('.colProductBarCode').css('display', 'none');
        }
    },
    'click .chkProductCost': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colProductCost').css('display', 'table-cell');
            $('.colProductCost').css('padding', '.75rem');
            $('.colProductCost').css('vertical-align', 'top');
        } else {
            $('.colProductCost').css('display', 'none');
        }
    },
    'click .chkInStockQty': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colInStockQty').css('display', 'table-cell');
            $('.colInStockQty').css('padding', '.75rem');
            $('.colInStockQty').css('vertical-align', 'top');
        } else {
            $('.colInStockQty').css('display', 'none');
        }
    },

    'click .chkFinalQty': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colFinalQty').css('display', 'table-cell');
            $('.colFinalQty').css('padding', '.75rem');
            $('.colFinalQty').css('vertical-align', 'top');
        } else {
            $('.colFinalQty').css('display', 'none');
        }
    },
    'click .chkAdjustQty': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colAdjustQty').css('display', 'table-cell');
            $('.colAdjustQty').css('padding', '.75rem');
            $('.colAdjustQty').css('vertical-align', 'top');
        } else {
            $('.colAdjustQty').css('display', 'none');
        }
    },
    'click .chkQty': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colQty').css('display', 'table-cell');
            $('.colQty').css('padding', '.75rem');
            $('.colQty').css('vertical-align', 'top');
        } else {
            $('.colQty').css('display', 'none');
        }
    },
    'click .chkUnitPrice': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colUnitPrice').css('display', 'table-cell');
            $('.colUnitPrice').css('padding', '.75rem');
            $('.colUnitPrice').css('vertical-align', 'top');
        } else {
            $('.colUnitPrice').css('display', 'none');
        }
    },
    'click .chkCostPrice': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colCostPrice').css('display', 'table-cell');
            $('.colCostPrice').css('padding', '.75rem');
            $('.colCostPrice').css('vertical-align', 'top');
        } else {
            $('.colCostPrice').css('display', 'none');
        }
    },
    'click .chkSalesLinesCustField1': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colSalesLinesCustField1').css('display', 'table-cell');
            $('.colSalesLinesCustField1').css('padding', '.75rem');
            $('.colSalesLinesCustField1').css('vertical-align', 'top');
            $('.colSalesLinesCustField1').css('width', '80px');
        } else {
            $('.colSalesLinesCustField1').css('display', 'none');
        }
    },
    'click .chkTaxRate': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colTaxRate').css('display', 'table-cell');
            $('.colTaxRate').css('padding', '.75rem');
            $('.colTaxRate').css('vertical-align', 'top');
        } else {
            $('.colTaxRate').css('display', 'none');
        }
    },
    'click .chkAmount': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colAmount').css('display', 'table-cell');
            $('.colAmount').css('padding', '.75rem');
            $('.colAmount').css('vertical-align', 'top');
        } else {
            $('.colAmount').css('display', 'none');
        }
    },
    'change .rngRangeProductName': function (event) {

        let range = $(event.target).val();
        $(".spWidthProductName").html(range + '%');
        $('.colProductName').css('width', range + '%');

    },
    'change .rngRangeDescription': function (event) {

        let range = $(event.target).val();
        $(".spWidthDescription").html(range + '%');
        $('.colDescription').css('width', range + '%');

    },
    'change .rngRangeQty': function (event) {

        let range = $(event.target).val();
        $(".spWidthQty").html(range + '%');
        $('.colQty').css('width', range + '%');

    },
    'change .rngRangeUnitPrice': function (event) {

        let range = $(event.target).val();
        $(".spWidthUnitPrice").html(range + '%');
        $('.colUnitPrice').css('width', range + '%');

    },
    'change .rngRangeTaxRate': function (event) {

        let range = $(event.target).val();
        $(".spWidthTaxRate").html(range + '%');
        $('.colTaxRate').css('width', range + '%');

    },
    'change .rngRangeAmount': function (event) {

        let range = $(event.target).val();
        $(".spWidthAmount").html(range + '%');
        $('.colAmount').css('width', range + '%');

    },
    'change .rngRangeCostPrice': function (event) {

        let range = $(event.target).val();
        $(".spWidthCostPrice").html(range + '%');
        $('.colCostPrice').css('width', range + '%');

    },
    'change .rngRangeSalesLinesCustField1': function (event) {

        let range = $(event.target).val();
        $(".spWidthSalesLinesCustField1").html(range + '%');
        $('.colSalesLinesCustField1').css('width', range + '%');

    },
    'blur .divcolumn': function (event) {
        let columData = $(event.target).html();
        let columHeaderUpdate = $(event.target).attr("valueupdate");
        $("" + columHeaderUpdate + "").html(columData);

    },
    'click .btnSaveGridSettings': function (event) {
        playSaveAudio();
        setTimeout(function(){
        let lineItems = [];
        //let lineItemObj = {};
        $('.columnSettings').each(function (index) {
            var $tblrow = $(this);
            var colTitle = $tblrow.find(".divcolumn").text() || '';
            var colWidth = $tblrow.find(".custom-range").val() || 0;
            var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
            var colHidden = false;
            if ($tblrow.find(".custom-control-input").is(':checked')) {
                colHidden = false;
            } else {
                colHidden = true;
            }
            let lineItemObj = {
                index: index,
                label: colTitle,
                hidden: colHidden,
                width: colWidth,
                thclass: colthClass
            }

            lineItems.push(lineItemObj);
            // var price = $tblrow.find(".lineUnitPrice").text()||0;
            // var taxcode = $tblrow.find(".lineTaxRate").text()||0;

        });

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
                    PrefName: 'tblStockAdjustmentLine'
                });
                if (checkPrefDetails) {
                    CloudPreference.update({
                        _id: checkPrefDetails._id
                    }, {
                        $set: {
                            userid: clientID,
                            username: clientUsername,
                            useremail: clientEmail,
                            PrefGroup: 'salesform',
                            PrefName: 'tblStockAdjustmentLine',
                            published: true,
                            customFields: lineItems,
                            updatedAt: new Date()
                        }
                    }, function (err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                            //window.open('/stockadjustmentoverview','_self');
                        } else {
                            $('#myModal2').modal('toggle');
                            //window.open('/stockadjustmentoverview','_self');

                        }
                    });

                } else {
                    CloudPreference.insert({
                        userid: clientID,
                        username: clientUsername,
                        useremail: clientEmail,
                        PrefGroup: 'salesform',
                        PrefName: 'tblStockAdjustmentLine',
                        published: true,
                        customFields: lineItems,
                        createdAt: new Date()
                    }, function (err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                            //window.open('/stockadjustmentoverview','_self');
                        } else {
                            $('#myModal2').modal('toggle');
                            //window.open('/stockadjustmentoverview','_self');

                        }
                    });

                }
            }
        }
        }, delayTimeAfterSound);
    },
    'click .btnResetGridSettings': function (event) {
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
                    PrefName: 'tblStockAdjustmentLine'
                });
                if (checkPrefDetails) {
                    CloudPreference.remove({
                        _id: checkPrefDetails._id
                    }, function (err, idTag) {
                        if (err) {}
                        else {
                            Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .btnResetSettings': function (event) {
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
                    PrefName: 'stockadjustmentcard'
                });
                if (checkPrefDetails) {
                    CloudPreference.remove({
                        _id: checkPrefDetails._id
                    }, function (err, idTag) {
                        if (err) {}
                        else {
                            Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .new_attachment_btn': function (event) {
        $('#attachment-upload').trigger('click');

    },
    'change #attachment-upload': function (e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArray = templateObj.uploadedFiles.get();

        let myFiles = $('#attachment-upload')[0].files;
        let uploadData = utilityService.attachmentUpload(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment);
        templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCount.set(uploadData.totalAttachments);
    },
    'click .img_new_attachment_btn': function (event) {
        $('#img-attachment-upload').trigger('click');

    },
    'change #img-attachment-upload': function (e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArray = templateObj.uploadedFiles.get();

        let myFiles = $('#img-attachment-upload')[0].files;
        let uploadData = utilityService.attachmentUpload(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment);
        templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCount.set(uploadData.totalAttachments);
    },
    'click .remove-attachment': function (event, ui) {
        let tempObj = Template.instance();
        let attachmentID = parseInt(event.target.id.split('remove-attachment-')[1]);
        if (tempObj.$("#confirm-action-" + attachmentID).length) {
            tempObj.$("#confirm-action-" + attachmentID).remove();
        } else {
            let actionElement = '<div class="confirm-action" id="confirm-action-' + attachmentID + '"><a class="confirm-delete-attachment btn btn-default" id="delete-attachment-' + attachmentID + '">'
                 + 'Delete</a><button class="save-to-library btn btn-default">Remove & save to File Library</button></div>';
            tempObj.$('#attachment-name-' + attachmentID).append(actionElement);
        }
        tempObj.$("#new-attachment2-tooltip").show();

    },
    'click .file-name': function (event) {
        let attachmentID = parseInt(event.currentTarget.parentNode.id.split('attachment-name-')[1]);
        let templateObj = Template.instance();
        let uploadedFiles = templateObj.uploadedFiles.get();

        $('#myModalAttachment').modal('hide');
        let previewFile = {};
        let input = uploadedFiles[attachmentID].fields.Description;
        previewFile.link = 'data:' + input + ';base64,' + uploadedFiles[attachmentID].fields.Attachment;
        previewFile.name = uploadedFiles[attachmentID].fields.AttachmentName;
        let type = uploadedFiles[attachmentID].fields.Description;
        if (type === 'application/pdf') {
            previewFile.class = 'pdf-class';
        } else if (type === 'application/msword' || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            previewFile.class = 'docx-class';
        } else if (type === 'application/vnd.ms-excel' || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            previewFile.class = 'excel-class';
        } else if (type === 'application/vnd.ms-powerpoint' || type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            previewFile.class = 'ppt-class';
        } else if (type === 'application/vnd.oasis.opendocument.formula' || type === 'text/csv' || type === 'text/plain' || type === 'text/rtf') {
            previewFile.class = 'txt-class';
        } else if (type === 'application/zip' || type === 'application/rar' || type === 'application/x-zip-compressed' || type === 'application/x-zip,application/x-7z-compressed') {
            previewFile.class = 'zip-class';
        } else {
            previewFile.class = 'default-class';
        }

        if (type.split('/')[0] === 'image') {
            previewFile.image = true
        } else {
            previewFile.image = false
        }
        templateObj.uploadedFile.set(previewFile);

        $('#files_view').modal('show');

        return;
    },
    'click .confirm-delete-attachment': function (event, ui) {
        let tempObj = Template.instance();
        tempObj.$("#new-attachment2-tooltip").show();
        let attachmentID = parseInt(event.target.id.split('delete-attachment-')[1]);
        let uploadedArray = tempObj.uploadedFiles.get();
        let attachmentCount = tempObj.attachmentCount.get();
        $('#attachment-upload').val('');
        uploadedArray.splice(attachmentID, 1);
        tempObj.uploadedFiles.set(uploadedArray);
        attachmentCount--;
        if (attachmentCount === 0) {
            let elementToAdd = '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
            $('#file-display').html(elementToAdd);
        }
        tempObj.attachmentCount.set(attachmentCount);
        if (uploadedArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachment(uploadedArray);
        } else {
            $(".attchment-tooltip").show();
        }
    },
    'click #btn_Attachment': function () {
        let templateInstance = Template.instance();
        let uploadedFileArray = templateInstance.uploadedFiles.get();
        if (uploadedFileArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachment(uploadedFileArray);
        } else {
            $(".attchment-tooltip").show();
        }
    },
    'click .btnBack': function (event) {
        playCancelAudio();
        event.preventDefault();
        setTimeout(function(){
            history.back(1);
        }, delayTimeAfterSound);
    },
    'keyup .lineAdjustQty': function (event) {
        //if (event.which >= 48 && event.which <= 57) {
        let tempObj = Template.instance();
        var targetID = $(event.target).closest('tr').attr('id'); // table row ID
        let finalTotal = "";
        let inStockQty = $('#' + targetID + " .lineInStockQty").text() || 0;
        let finalQty = $('#' + targetID + " .lineFinalQty").val() || 0;
        let adjustQty = $('#' + targetID + " .lineAdjustQty").val() || 0;
        finalTotal = parseFloat(inStockQty) + parseFloat(adjustQty);
        $('#' + targetID + " .lineFinalQty").val(finalTotal);
        $('.stock_print #' + targetID + " .lineAdjustQtyPrint").text($('#' + targetID + " .lineAdjustQtyPrint").val());
        $('.stock_print #' + targetID + " .lineFinalQtyPrint").text(finalTotal);
        //}
    },
    'keyup .lineFinalQty': function (event) {
        //if (event.which >= 48 && event.which <= 57) {
        let tempObj = Template.instance();
        var targetID = $(event.target).closest('tr').attr('id'); // table row ID
        let adjustTotal = "";
        let inStockQty = $('#' + targetID + " .lineInStockQty").text() || 0;
        let finalQty = $('#' + targetID + " .lineFinalQty").val() || 0;
        let adjustQty = $('#' + targetID + " .lineAdjustQty").val() || 0;
        adjustTotal = parseFloat(finalQty) - parseFloat(inStockQty);
        $('#' + targetID + " .lineAdjustQty").val(adjustTotal);
        $('.stock_print #' + targetID + " .lineAdjustQtyPrint").text(adjustTotal);
        $('.stock_print #' + targetID + " .lineFinalQtyPrint").text($('#' + targetID + " .lineFinalQty").val());
        //}
    },
    'keydown .lineFinalQty, keydown .lineAdjustQty': function (event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
            // Allow: Ctrl+A, Command+A
            (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||
            // Allow: home, end, left, right, down, up
            (event.keyCode >= 35 && event.keyCode <= 40)) {
            // let it happen, don't do anything
            return;
        }

        if (event.shiftKey == true) {
            event.preventDefault();
        }

        if ((event.keyCode >= 48 && event.keyCode <= 57) ||
            (event.keyCode >= 96 && event.keyCode <= 105) ||
            event.keyCode == 8 || event.keyCode == 9 ||
            event.keyCode == 37 || event.keyCode == 39 ||
            event.keyCode == 46 || event.keyCode == 190 || event.keyCode == 189) {}
        else {
            event.preventDefault();
        }
    },
    'click .chkEmailCopy': function (event) {
        if ($(event.target).is(':checked')) {
            $('#employeeList').modal('show');
        }
    },
    'click #tdBarcodeScannerMobile': function(event) {
        setTimeout(function() {
            document.getElementById("scanBarcodeModalInput").focus();
        }, 500);
    },
    'click #scanNewRowMobile': function(event) {
        setTimeout(function() {
            document.getElementById("scanBarcodeModalInput").focus();
        }, 500);
    },
    "focusout .lineAdjustQty": function (event) {
        // $(".fullScreenSpin").css("display", "inline-block");
        var target = event.target;
        let selectedunit = $(target).closest("tr").find(".colAdjustQty").val();
        localStorage.setItem("productItem", selectedunit);
        let selectedProductName = $(target).closest("tr").find(".lineProductName").val();
        localStorage.setItem("selectedProductName", selectedProductName);

        let productService = new ProductService();
        const templateObject = Template.instance();
        let existProduct = false;
        if(parseInt($(target).val()) != 0 && parseInt($(target).val()) != ""){
            if (selectedProductName == "") {
                swal("You have to select Product.", "", "info");
                event.preventDefault();
                return false;
            } else {
                getVS1Data("TProductQtyList").then(function (dataObject) {
                if (dataObject.length == 0) {
                    productService.getProductStatus(selectedProductName).then(async function (data) {
                    if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == false) {
                        return false;
                    } else if (data.tproductvs1[0].Batch == true && data.tproductvs1[0].SNTracking == false) {
                        let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                        if(selectedLot != undefined && selectedLot != ""){
                          shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                        }
                        else{
                          shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                        }
                        setTimeout(function () {
                        var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                        $("#availableLotNumberModal").attr("data-row", row + 1);
                        $("#availableLotNumberModal").modal("show");
                        }, 200);
                    } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
                        let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                        if(selectedSN != undefined && selectedSN != ""){
                          shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                        }
                        else{
                          shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                        }
                        setTimeout(function () {
                        var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                        $("#availableSerialNumberModal").attr("data-row", row + 1);
                        $('#availableSerialNumberModal').modal('show');
                        if(data.tproductvs1[0].CUSTFLD13 == 'true'){
                            $("#availableSerialNumberModal .btnSNCreate").show();
                        }
                        else{
                            $("#availableSerialNumberModal .btnSNCreate").hide();
                        }
                        }, 200);
                    }
                    });
                }
                else{
                    let data = JSON.parse(dataObject[0].data);
                    let existProductInfo = false;
                    for (let i = 0; i < data.tproductqtylist.length; i++) {
                        if(data.tproductqtylist[i].ProductName == selectedProductName){
                            existProductInfo = true;
                            if (data.tproductqtylist[i].batch == false && data.tproductqtylist[i].SNTracking == false) {
                            return false;
                            } else if (data.tproductqtylist[i].batch == true && data.tproductqtylist[i].SNTracking == false) {
                            let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                            if(selectedLot != undefined && selectedLot != ""){
                                shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                            }
                            else{
                                shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                            }
                            setTimeout(function () {
                                var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                                $("#availableLotNumberModal").attr("data-row", row + 1);
                                $("#availableLotNumberModal").modal("show");
                            }, 200);
                            } else if (data.tproductqtylist[i].batch == false && data.tproductqtylist[i].SNTracking == true) {
                            let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                            if(selectedSN != undefined && selectedSN != ""){
                                shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                            }
                            else{
                                shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                            }
                            setTimeout(function () {
                                var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                                $("#availableSerialNumberModal").attr("data-row", row + 1);
                                $('#availableSerialNumberModal').modal('show');
                                if(data.tproductqtylist[i].CUSTFLD13 == 'true'){
                                $("#availableSerialNumberModal .btnSNCreate").show();
                                }
                                else{
                                $("#availableSerialNumberModal .btnSNCreate").hide();
                                }
                            }, 200);
                            }
                        }
                    }

                    if (!existProductInfo) {
                        productService.getProductStatus(selectedProductName).then(async function (data) {
                        if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == false) {
                            return false;
                        } else if (data.tproductvs1[0].Batch == true && data.tproductvs1[0].SNTracking == false) {
                            let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                            if(selectedLot != undefined && selectedLot != ""){
                              shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                            }
                            else{
                              shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                            }
                            setTimeout(function () {
                            var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                            $("#availableLotNumberModal").attr("data-row", row + 1);
                            $("#availableLotNumberModal").modal("show");
                            }, 200);
                        } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
                            let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                            if(selectedSN != undefined && selectedSN != ""){
                              shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                            }
                            else{
                              shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                            }
                            setTimeout(function () {
                            var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                            $("#availableSerialNumberModal").attr("data-row", row + 1);
                            $('#availableSerialNumberModal').modal('show');
                            if(data.tproductvs1[0].CUSTFLD13 == 'true'){
                                $("#availableSerialNumberModal .btnSNCreate").show();
                            }
                            else{
                                $("#availableSerialNumberModal .btnSNCreate").hide();
                            }
                            }, 200);
                        }
                        });
                    }
                }
                }).catch(function (err) {
                productService.getProductStatus(selectedProductName).then(async function (data) {
                    if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == false) {
                      return false;
                    } else if (data.tproductvs1[0].Batch == true && data.tproductvs1[0].SNTracking == false) {
                      let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                      if(selectedLot != undefined && selectedLot != ""){
                          shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                      }
                      else{
                          shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                      }
                      setTimeout(function () {
                          var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                          $("#availableLotNumberModal").attr("data-row", row + 1);
                          $("#availableLotNumberModal").modal("show");
                      }, 200);
                    } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
                      let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                      if(selectedSN != undefined && selectedSN != ""){
                          shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                      }
                      else{
                          shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                      }
                      setTimeout(function () {
                          var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                          $("#availableSerialNumberModal").attr("data-row", row + 1);
                          $('#availableSerialNumberModal').modal('show');
                          if(data.tproductvs1[0].CUSTFLD13 == 'true'){
                          $("#availableSerialNumberModal .btnSNCreate").show();
                          }
                          else{
                          $("#availableSerialNumberModal .btnSNCreate").hide();
                          }
                      }, 200);
                    }
                });
                });
            }
        }
    },
    'click .btnSnLotmodal': function(event) {
        // LoadingOverlay.show();
        const target = event.target;
        let selectedProductName = $(target).closest('tr').find('.lineProductName').val();
        let selectedunit = $(target).closest('tr').find('.colAdjustQty').val();
        localStorage.setItem('productItem', selectedunit);
        let productService = new ProductService();

        const templateObject = Template.instance();
        if(parseInt(selectedunit) != 0 && parseInt(selectedunit) != ""){
            if (selectedProductName == "") {
                swal("You have to select Product.", "", "info");
                event.preventDefault();
                return false;
            } else {
                $(".fullScreenSpin").css("display", "inline-block");
                getVS1Data("TProductQtyList").then(function (dataObject) {
                    if (dataObject.length == 0) {
                        productService.getProductStatus(selectedProductName).then(async function (data) {
                            $(".fullScreenSpin").css("display", "none");
                            if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == false) {
                            var buttons = $("<div>")
                            .append($('<button id="trackSN" class="swal2-styled" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214);">Track Serial Number</button>'))
                            .append($('<button id="trackLN" class="swal2-styled" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214);">Track Lot Number</button>'))
                            .append($('<button id="trackCancel" class="swal2-styled" style="background-color: rgb(170, 170, 170);">No</button>'));
                            swal({
                                title: 'This Product "' + selectedProductName + '" does not currently track Serial Numbers, Lot Numbers or Bin Locations, Do You Wish To Add that Ability.',
                                type: "warning",
                                showCancelButton: false,
                                showConfirmButton: false,
                                html: buttons,
                                onOpen: function (dObj) {
                                $('#trackSN').on('click',function () {
                                    objDetails = {
                                    type: "TProductVS1",
                                    fields: {
                                        ID: parseInt(data.tproductqtylist[i].PARTSID),
                                        Active: true,
                                        SNTracking: "true",
                                        Batch: "false",
                                    },
                                    };

                                    productService.saveProductVS1(objDetails)
                                    .then(async function (objDetails) {
                                    sideBarService.getProductListVS1("All", 0)
                                        .then(async function (dataReload) {
                                            await addVS1Data("TProductQtyList", JSON.stringify(dataReload));
                                            swal.close();
                                            $(target).click();
                                        })
                                        .catch(function (err) {
                                        });
                                    })
                                    .catch(function (err) {
                                    swal({
                                        title: "Oooops...",
                                        text: err,
                                        type: "error",
                                        showCancelButton: false,
                                        confirmButtonText: "Try Again",
                                    }).then((result) => {
                                        if (result.value) {
                                        // Meteor._reload.reload();
                                        } else if (result.dismiss === "cancel") {
                                        }
                                    });
                                    });
                                });
                                $('#trackLN').on('click',function () {
                                    swal.close();
                                    objDetails = {
                                    type: "TProductVS1",
                                    fields: {
                                        ID: parseInt(data.tproductqtylist[i].PARTSID),
                                        Active: true,
                                        SNTracking: "false",
                                        Batch: "true",
                                    },
                                    };

                                    productService.saveProductVS1(objDetails)
                                    .then(async function (objDetails) {
                                    sideBarService.getProductListVS1("All", 0)
                                        .then(async function (dataReload) {
                                            await addVS1Data("TProductQtyList", JSON.stringify(dataReload));
                                            swal.close();
                                            $(target).click();
                                        })
                                        .catch(function (err) {
                                        });
                                    })
                                    .catch(function (err) {
                                    swal({
                                        title: "Oooops...",
                                        text: err,
                                        type: "error",
                                        showCancelButton: false,
                                        confirmButtonText: "Try Again",
                                    }).then((result) => {
                                        if (result.value) {
                                        // Meteor._reload.reload();
                                        } else if (result.dismiss === "cancel") {
                                        }
                                    });
                                    });
                                });
                                $('#trackCancel').on('click',function () {
                                    swal.close();
                                });
                                }
                            });
                            } else if (data.tproductvs1[0].Batch == true && data.tproductvs1[0].SNTracking == false) {
                            let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                            if(selectedLot != undefined && selectedLot != ""){
                                shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                            }
                            else{
                                shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                            }
                            setTimeout(function () {
                                var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                                $("#availableLotNumberModal").attr("data-row", row + 1);
                                $("#availableLotNumberModal").modal("show");
                            }, 200);
                            } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
                            let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                            if(selectedSN != undefined && selectedSN != ""){
                                shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                            }
                            else{
                                shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                            }
                            setTimeout(function () {
                                var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                                $("#availableSerialNumberModal").attr("data-row", row + 1);
                                $('#availableSerialNumberModal').modal('show');
                                if(data.tproductvs1[0].CUSTFLD13 == 'true'){
                                    $("#availableSerialNumberModal .btnSNCreate").show();
                                }
                                else{
                                    $("#availableSerialNumberModal .btnSNCreate").hide();
                                }
                            }, 200);
                            }
                        });
                    }
                    else{
                        let data = JSON.parse(dataObject[0].data);
                        let existProductInfo = false;
                        for (let i = 0; i < data.tproductqtylist.length; i++) {
                            if(data.tproductqtylist[i].ProductName == selectedProductName){
                                $(".fullScreenSpin").css("display", "none");
                                existProductInfo = true;
                                if (data.tproductqtylist[i].batch == false && data.tproductqtylist[i].SNTracking == false) {
                                    var buttons = $("<div>")
                                    .append($('<button id="trackSN" class="swal2-styled" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214);">Track Serial Number</button>'))
                                    .append($('<button id="trackLN" class="swal2-styled" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214);">Track Lot Number</button>'))
                                    .append($('<button id="trackCancel" class="swal2-styled" style="background-color: rgb(170, 170, 170);">No</button>'));
                                    swal({
                                        title: 'This Product "' + selectedProductName + '" does not currently track Serial Numbers, Lot Numbers or Bin Locations, Do You Wish To Add that Ability.',
                                        type: "warning",
                                        showCancelButton: false,
                                        showConfirmButton: false,
                                        html: buttons,
                                        onOpen: function (dObj) {
                                            $('#trackSN').on('click',function () {
                                            objDetails = {
                                                type: "TProductVS1",
                                                fields: {
                                                    ID: parseInt(data.tproductqtylist[i].PARTSID),
                                                    Active: true,
                                                    SNTracking: "true",
                                                    Batch: "false",
                                                },
                                            };

                                            productService.saveProductVS1(objDetails)
                                            .then(async function (objDetails) {
                                                sideBarService.getProductListVS1("All", 0)
                                                .then(async function (dataReload) {
                                                    await addVS1Data("TProductQtyList", JSON.stringify(dataReload));
                                                    swal.close();
                                                    $(target).click();
                                                })
                                                .catch(function (err) {
                                                });
                                            })
                                            .catch(function (err) {
                                                swal({
                                                    title: "Oooops...",
                                                    text: err,
                                                    type: "error",
                                                    showCancelButton: false,
                                                    confirmButtonText: "Try Again",
                                                }).then((result) => {
                                                if (result.value) {
                                                    // Meteor._reload.reload();
                                                } else if (result.dismiss === "cancel") {
                                                }
                                                });
                                            });
                                            });
                                            $('#trackLN').on('click',function () {
                                            swal.close();
                                            objDetails = {
                                                type: "TProductVS1",
                                                fields: {
                                                    ID: parseInt(data.tproductqtylist[i].PARTSID),
                                                    Active: true,
                                                    SNTracking: "false",
                                                    Batch: "true",
                                                },
                                            };

                                            productService.saveProductVS1(objDetails)
                                            .then(async function (objDetails) {
                                                sideBarService.getProductListVS1("All", 0)
                                                .then(async function (dataReload) {
                                                    await addVS1Data("TProductQtyList", JSON.stringify(dataReload));
                                                    swal.close();
                                                    $(target).click();
                                                })
                                                .catch(function (err) {
                                                });
                                            })
                                            .catch(function (err) {
                                                swal({
                                                    title: "Oooops...",
                                                    text: err,
                                                    type: "error",
                                                    showCancelButton: false,
                                                    confirmButtonText: "Try Again",
                                                }).then((result) => {
                                                if (result.value) {
                                                    // Meteor._reload.reload();
                                                } else if (result.dismiss === "cancel") {
                                                }
                                                });
                                            });
                                            });
                                            $('#trackCancel').on('click',function () {
                                                swal.close();
                                            });
                                        }
                                    });
                                } else if (data.tproductqtylist[i].batch == true && data.tproductqtylist[i].SNTracking == false) {
                                    let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                                    if(selectedLot != undefined && selectedLot != ""){
                                    shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                                    }
                                    else{
                                    shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                                    }
                                    setTimeout(function () {
                                    var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                                    $("#availableLotNumberModal").attr("data-row", row + 1);
                                    $("#availableLotNumberModal").modal("show");
                                    }, 200);
                                } else if (data.tproductqtylist[i].batch == false && data.tproductqtylist[i].SNTracking == true) {
                                    let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                                    if(selectedSN != undefined && selectedSN != ""){
                                    shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                                    }
                                    else{
                                    shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                                    }
                                    setTimeout(function () {
                                    var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                                    $("#availableSerialNumberModal").attr("data-row", row + 1);
                                    $('#availableSerialNumberModal').modal('show');
                                    if(data.tproductqtylist[i].CUSTFLD13 == 'true'){
                                        $("#availableSerialNumberModal .btnSNCreate").show();
                                    }
                                    else{
                                        $("#availableSerialNumberModal .btnSNCreate").hide();
                                    }
                                    }, 200);
                                }
                            }
                        }
                        if (!existProductInfo) {
                            productService.getProductStatus(selectedProductName).then(async function (data) {
                                $(".fullScreenSpin").css("display", "none");
                                if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == false) {
                                var buttons = $("<div>")
                                .append($('<button id="trackSN" class="swal2-styled" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214);">Track Serial Number</button>'))
                                .append($('<button id="trackLN" class="swal2-styled" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214);">Track Lot Number</button>'))
                                .append($('<button id="trackCancel" class="swal2-styled" style="background-color: rgb(170, 170, 170);">No</button>'));
                                swal({
                                    title: 'This Product "' + selectedProductName + '" does not currently track Serial Numbers, Lot Numbers or Bin Locations, Do You Wish To Add that Ability.',
                                    type: "warning",
                                    showCancelButton: false,
                                    showConfirmButton: false,
                                    html: buttons,
                                    onOpen: function (dObj) {
                                    $('#trackSN').on('click',function () {
                                        objDetails = {
                                        type: "TProductVS1",
                                        fields: {
                                            ID: parseInt(data.tproductqtylist[i].PARTSID),
                                            Active: true,
                                            SNTracking: "true",
                                            Batch: "false",
                                        },
                                        };
    
                                        productService.saveProductVS1(objDetails)
                                        .then(async function (objDetails) {
                                        sideBarService.getProductListVS1("All", 0)
                                            .then(async function (dataReload) {
                                                await addVS1Data("TProductQtyList", JSON.stringify(dataReload));
                                                swal.close();
                                                $(target).click();
                                            })
                                            .catch(function (err) {
                                            });
                                        })
                                        .catch(function (err) {
                                        swal({
                                            title: "Oooops...",
                                            text: err,
                                            type: "error",
                                            showCancelButton: false,
                                            confirmButtonText: "Try Again",
                                        }).then((result) => {
                                            if (result.value) {
                                            // Meteor._reload.reload();
                                            } else if (result.dismiss === "cancel") {
                                            }
                                        });
                                        });
                                    });
                                    $('#trackLN').on('click',function () {
                                        swal.close();
                                        objDetails = {
                                        type: "TProductVS1",
                                        fields: {
                                            ID: parseInt(data.tproductqtylist[i].PARTSID),
                                            Active: true,
                                            SNTracking: "false",
                                            Batch: "true",
                                        },
                                        };
    
                                        productService.saveProductVS1(objDetails)
                                        .then(async function (objDetails) {
                                        sideBarService.getProductListVS1("All", 0)
                                            .then(async function (dataReload) {
                                                await addVS1Data("TProductQtyList", JSON.stringify(dataReload));
                                                swal.close();
                                                $(target).click();
                                            })
                                            .catch(function (err) {
                                            });
                                        })
                                        .catch(function (err) {
                                        swal({
                                            title: "Oooops...",
                                            text: err,
                                            type: "error",
                                            showCancelButton: false,
                                            confirmButtonText: "Try Again",
                                        }).then((result) => {
                                            if (result.value) {
                                            // Meteor._reload.reload();
                                            } else if (result.dismiss === "cancel") {
                                            }
                                        });
                                        });
                                    });
                                    $('#trackCancel').on('click',function () {
                                        swal.close();
                                    });
                                    }
                                });
                                } else if (data.tproductvs1[0].Batch == true && data.tproductvs1[0].SNTracking == false) {
                                let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                                if(selectedLot != undefined && selectedLot != ""){
                                    shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                                }
                                else{
                                    shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                                }
                                setTimeout(function () {
                                    var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                                    $("#availableLotNumberModal").attr("data-row", row + 1);
                                    $("#availableLotNumberModal").modal("show");
                                }, 200);
                                } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
                                let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                                if(selectedSN != undefined && selectedSN != ""){
                                    shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                                }
                                else{
                                    shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                                }
                                setTimeout(function () {
                                    var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                                    $("#availableSerialNumberModal").attr("data-row", row + 1);
                                    $('#availableSerialNumberModal').modal('show');
                                    if(data.tproductvs1[0].CUSTFLD13 == 'true'){
                                        $("#availableSerialNumberModal .btnSNCreate").show();
                                    }
                                    else{
                                        $("#availableSerialNumberModal .btnSNCreate").hide();
                                    }
                                }, 200);
                                }
                            });
                        }
                    }
                }).catch(function (err) {
                    productService.getProductStatus(selectedProductName).then(async function (data) {
                        $(".fullScreenSpin").css("display", "none");
                        if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == false) {
                            var buttons = $("<div>")
                            .append($('<button id="trackSN" class="swal2-styled" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214);">Track Serial Number</button>'))
                            .append($('<button id="trackLN" class="swal2-styled" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214);">Track Lot Number</button>'))
                            .append($('<button id="trackCancel" class="swal2-styled" style="background-color: rgb(170, 170, 170);">No</button>'));
                            swal({
                            title: 'This Product "' + selectedProductName + '" does not currently track Serial Numbers, Lot Numbers or Bin Locations, Do You Wish To Add that Ability.',
                            type: "warning",
                            showCancelButton: false,
                            showConfirmButton: false,
                            html: buttons,
                            onOpen: function (dObj) {
                                $('#trackSN').on('click',function () {
                                objDetails = {
                                    type: "TProductVS1",
                                    fields: {
                                    ID: parseInt(data.tproductqtylist[i].PARTSID),
                                    Active: true,
                                    SNTracking: "true",
                                    Batch: "false",
                                    },
                                };

                                productService.saveProductVS1(objDetails)
                                .then(async function (objDetails) {
                                    sideBarService.getProductListVS1("All", 0)
                                    .then(async function (dataReload) {
                                        await addVS1Data("TProductQtyList", JSON.stringify(dataReload));
                                        swal.close();
                                        $(target).click();
                                    })
                                    .catch(function (err) {
                                    });
                                })
                                .catch(function (err) {
                                    swal({
                                    title: "Oooops...",
                                    text: err,
                                    type: "error",
                                    showCancelButton: false,
                                    confirmButtonText: "Try Again",
                                    }).then((result) => {
                                    if (result.value) {
                                        // Meteor._reload.reload();
                                    } else if (result.dismiss === "cancel") {
                                    }
                                    });
                                });
                                });
                                $('#trackLN').on('click',function () {
                                swal.close();
                                objDetails = {
                                    type: "TProductVS1",
                                    fields: {
                                    ID: parseInt(data.tproductqtylist[i].PARTSID),
                                    Active: true,
                                    SNTracking: "false",
                                    Batch: "true",
                                    },
                                };

                                productService.saveProductVS1(objDetails)
                                .then(async function (objDetails) {
                                    sideBarService.getProductListVS1("All", 0)
                                    .then(async function (dataReload) {
                                        await addVS1Data("TProductQtyList", JSON.stringify(dataReload));
                                        swal.close();
                                        $(target).click();
                                    })
                                    .catch(function (err) {
                                    });
                                })
                                .catch(function (err) {
                                    swal({
                                    title: "Oooops...",
                                    text: err,
                                    type: "error",
                                    showCancelButton: false,
                                    confirmButtonText: "Try Again",
                                    }).then((result) => {
                                    if (result.value) {
                                        // Meteor._reload.reload();
                                    } else if (result.dismiss === "cancel") {
                                    }
                                    });
                                });
                                });
                                $('#trackCancel').on('click',function () {
                                    swal.close();
                                });
                            }
                            });
                        } else if (data.tproductvs1[0].Batch == true && data.tproductvs1[0].SNTracking == false) {
                            let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                            if(selectedLot != undefined && selectedLot != ""){
                            shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                            }
                            else{
                            shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                            }
                            setTimeout(function () {
                            var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                            $("#availableLotNumberModal").attr("data-row", row + 1);
                            $("#availableLotNumberModal").modal("show");
                            }, 200);
                        } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
                            let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                            if(selectedSN != undefined && selectedSN != ""){
                            shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                            }
                            else{
                            shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                            }
                            setTimeout(function () {
                            var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                            $("#availableSerialNumberModal").attr("data-row", row + 1);
                            $('#availableSerialNumberModal').modal('show');
                            if(data.tproductvs1[0].CUSTFLD13 == 'true'){
                                $("#availableSerialNumberModal .btnSNCreate").show();
                            }
                            else{
                                $("#availableSerialNumberModal .btnSNCreate").hide();
                            }
                            }, 200);
                        }
                    });
                });
            }
        }
    },
    "click .btnSNCreate": function (event) {
        // $("#availableSerialNumberModal").modal("hide");
        // $("#serialNumberModal").modal("show");

        let tokenid = "random";
        var rowData = `<tr class="dnd-moved checkRowSelected" id="${tokenid}">
                <td class="colChkBox pointer" style="width:10%!important;">
                    <div class="custom-control custom-switch chkBox pointer chkServiceCard" style="width:15px;">
                        <input name="pointer" class="custom-control-input chkBox pointer chkServiceCard" type="checkbox" id="formCheck-${tokenid}" checked>
                        <label class="custom-control-label chkBox pointer" for="formCheck-${tokenid}"></label>
                    </div>
                </td>
                <td class="colID hiddenColumn dtr-control" tabindex="0">
                    ${tokenid}
                </td>
                <td class="colSN" contenteditable="true">Random</td>
            </tr>`;

        $("#tblAvailableSNCheckbox tbody").prepend(rowData);
    },

});

Template.registerHelper('equals', function (a, b) {
    return a === b;
});
