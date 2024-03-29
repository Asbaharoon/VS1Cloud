import {PurchaseBoardService} from '../js/purchase-service';
import {ReactiveVar} from 'meteor/reactive-var';
import {AccountService} from "../accounts/account-service";
import {UtilityService} from "../utility-service";
import {SideBarService} from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import CachedHttp from '../lib/global/CachedHttp';
import erpObject from '../lib/global/erp-objects';
import LoadingOverlay from '../LoadingOverlay';
import GlobalFunctions from '../GlobalFunctions';
import TableHandler from '../js/Table/TableHandler';

import {Template} from 'meteor/templating';
import './bill_list.html';
import {FlowRouter} from 'meteor/ostrio:flow-router-extra';


let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.billlist.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.custfields = new ReactiveVar([]);
    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);

    templateObject.billResponse = new ReactiveVar();
    templateObject.bills = new ReactiveVar([]);

    templateObject.getDataTableList = function (data) {
        let orderstatus = data.OrderStatus || '';
        if (data.Deleted == true) {
            orderstatus = "Deleted";
        } else if (data.SupplierName == '') {
            orderstatus = "Deleted";
        }

        var dataList = [
            '<span style="display:none;">'+(data.OrderDate !=''? moment(data.OrderDate).format("YYYY/MM/DD"): data.OrderDate)+'</span>'+(data.OrderDate !=''? moment(data.OrderDate).format("DD/MM/YYYY"): data.OrderDate),
            data.PurchaseOrderID,
            data.SupplierName,
            GlobalFunctions.formatPrice(data.TotalAmount - data.TotalTax),
            GlobalFunctions.formatPrice(data.TotalTax),
            GlobalFunctions.formatPrice(data.TotalAmount),
            GlobalFunctions.formatPrice(data.Payment),
            GlobalFunctions.formatPrice(data.Balance),
            data.EmployeeName,
            data.Comments,
            orderstatus,
        ];
        return dataList;
    }

    let headerStructure = [
        {index: 0, label: "Order Date", class: "colOrderDate", active: true, display: true, width: "80"},
        {index: 1, label: "Bill No.", class: "colPurchaseNo", active: true, display: true, width: "100"},
        {index: 2, label: "Supplier", class: "colSupplier", active: true, display: true, width: "200"},
        {index: 3, label: "Amount (Ex)", class: "colAmountEx", active: true, display: true, width: "80"},
        {index: 4, label: "Tax", class: "colTax", active: true, display: true, width: "80"},
        {index: 5, label: "Amount", class: "colAmount", active: true, display: true, width: "80"},
        {index: 6, label: "Paid", class: "colPaid", active: true, display: true, width: "80"},
        {index: 7, label: "Outstanding", class: "colBalanceOutstanding", active: true, display: true, width: "80"},
        {index: 8, label: "Employee", class: "colEmployee", active: true, display: true, width: "200"},
        {index: 9, label: "Comments", class: "colComments", active: true, display: true, width: "300"},
        {index: 10, label: "Status", class: "colStatus", active: true, display: true, width: "120"},
    ];
    templateObject.tableheaderrecords.set(headerStructure);
});

Template.billlist.onRendered(function () {
    $("#tblbilllist tbody").on("click", "tr", function () {
        var listData = $(this).closest("tr").find(".colPurchaseNo").text();
        var checkDeleted =
            $(this).closest("tr").find(".colStatus").text() || "";
        if (listData) {
            if (checkDeleted == "Deleted") {
                swal(
                    "You Cannot View This Transaction",
                    "Because It Has Been Deleted",
                    "info"
                );
            } else {
                FlowRouter.go("/billcard?id=" + listData);
            }
        }
    });
});

Template.billlist.events({
    'click #btnNewBill': function (event) {
        FlowRouter.go('/billcard');
    },
    'click .btnRefreshBillList': function (event) {
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let tableProductList;
        const dataTableList = [];
        var splashArrayInvoiceList = new Array();
        const lineExtaSellItems = [];
        $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('#tblbilllist_filter input').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getNewBillByNameOrID(dataSearchName).then(function (data) {
                let lineItems = [];
                let lineItemObj = {};
                addVS1Data('TBillEx', JSON.stringify(data));
                for (let i = 0; i < data.tbillex.length; i++) {
                    let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tbillex[i].fields.TotalAmount) || 0.00;
                    let totalTax = utilityService.modifynegativeCurrencyFormat(data.tbillex[i].fields.TotalTax) || 0.00;
                    let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tbillex[i].fields.TotalAmountInc) || 0.00;
                    let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tbillex[i].fields.TotalPaid) || 0.00;
                    let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tbillex[i].fields.TotalBalance) || 0.00;
                    let orderstatus = data.tbillex[i].fields.OrderStatus || '';
                    if (data.tbillex[i].fields.Deleted == true) {
                        orderstatus = "Deleted";
                    } else if (data.tbillex[i].fields.CustomerName == '') {
                        orderstatus = "Deleted";
                    }
                    ;
                    var dataList = {
                        id: data.tbillex[i].fields.ID || '',
                        employee: data.tbillex[i].fields.EmployeeName || '',
                        accountname: data.tbillex[i].fields.AccountName || '',
                        sortdate: data.tbillex[i].fields.OrderDate != '' ? moment(data.tbillex[i].fields.OrderDate).format("YYYY/MM/DD") : data.tbillex[i].fields.OrderDate,
                        orderdate: data.tbillex[i].fields.OrderDate != '' ? moment(data.tbillex[i].fields.OrderDate).format("DD/MM/YYYY") : data.tbillex[i].fields.OrderDate,
                        suppliername: data.tbillex[i].fields.SupplierName || '',
                        totalamountex: totalAmountEx || 0.00,
                        totaltax: totalTax || 0.00,
                        totalamount: totalAmount || 0.00,
                        totalpaid: totalPaid || 0.00,
                        totaloustanding: totalOutstanding || 0.00,
                        orderstatus: orderstatus || '',
                        custfield1: '' || '',
                        custfield2: '' || '',
                        comments: data.tbillex[i].fields.Comments || '',
                    };
                    dataTableList.push(dataList);


                }
                templateObject.datatablerecords.set(dataTableList);
                let item = templateObject.datatablerecords.get();
                $('.fullScreenSpin').css('display', 'none');
                if (dataTableList) {
                    var datatable = $('#tblbilllist').DataTable();
                    $("#tblbilllist > tbody").empty();
                    for (let x = 0; x < item.length; x++) {
                        $("#tblbilllist > tbody").append(
                            ' <tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
                            '<td contenteditable="false" class="colSortDate hiddenColumn">' + item[x].sortdate + '</td>' +
                            '<td contenteditable="false" class="colOrderDate" ><span style="display:none;">' + item[x].sortdate + '</span>' + item[x].orderdate + '</td>' +
                            '<td contenteditable="false" class="colPurchaseNo">' + item[x].id + '</td>' +
                            '<td contenteditable="false" class="colSupplier" >' + item[x].suppliername + '</td>' +
                            '<td contenteditable="false" class="colAmountEx" style="text-align: right!important;">' + item[x].totalamountex + '</td>' +
                            '<td contenteditable="false" class="colTax" style="text-align: right!important;">' + item[x].totaltax + '</td>' +
                            '<td contenteditable="false" class="colAmount" style="text-align: right!important;">' + item[x].totalamount + '</td>' +
                            '<td contenteditable="false" class="colPaid" style="text-align: right!important;">' + item[x].totalpaid + '</td>' +
                            '<td contenteditable="false" class="colBalanceOutstanding" style="text-align: right!important;">' + item[x].totaloustanding + '</td>' +
                            '<td contenteditable="false" class="colStatus">' + item[x].orderstatus + '</td>' +
                            '<td contenteditable="false" class="colSaleCustField1 hiddenColumn">' + item[x].custfield1 + '</td>' +
                            '<td contenteditable="false" class="colSaleCustField2 hiddenColumn">' + item[x].custfield2 + '</td>' +
                            '<td contenteditable="false" class="colEmployee hiddenColumn">' + item[x].employee + '</td>' +
                            '<td contenteditable="false" class="colComments">' + item[x].comments + '</td>' +
                            '</tr>');

                    }
                    $('.dataTables_info').html('Showing 1 to ' + data.tbillex.length + ' of ' + data.tbillex.length + ' entries');
                    setTimeout(function () {
                        makeNegativeGlobal();
                    }, 100);
                } else {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Question',
                        text: "Bill does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            FlowRouter.go('/billcard');
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
    'click .resetTable': function (event) {
        let templateObject = Template.instance();
        let reset_data = templateObject.reset_data.get();
        reset_data = reset_data.filter(redata => redata.display);

        $(".displaySettings").each(function (index) {
            let $tblrow = $(this);
            $tblrow.find(".divcolumn").text(reset_data[index].label);
            $tblrow.find(".custom-control-input").prop("checked", reset_data[index].active);

            let title = $("#tblbilllist").find("th").eq(index + 1);
            $(title).html(reset_data[index].label);

            if (reset_data[index].active) {
                $('.col' + reset_data[index].class).addClass('showColumn');
                $('.col' + reset_data[index].class).removeClass('hiddenColumn');
            } else {
                $('.col' + reset_data[index].class).addClass('hiddenColumn');
                $('.col' + reset_data[index].class).removeClass('showColumn');
            }
            $(".rngRange" + reset_data[index].class).val('');
        });
    },

    'click .saveTable': async function (event) {
        let lineItems = [];
        $(".fullScreenSpin").css("display", "inline-block");

        $(".displaySettings").each(function (index) {
            var $tblrow = $(this);
            var fieldID = $tblrow.attr("custid") || 0;
            var colTitle = $tblrow.find(".divcolumn").text() || "";
            var colWidth = $tblrow.find(".custom-range").val() || 0;
            var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || "";
            var colHidden = false;
            if ($tblrow.find(".custom-control-input").is(":checked")) {
                colHidden = true;
            } else {
                colHidden = false;
            }
            let lineItemObj = {
                index: parseInt(fieldID),
                label: colTitle,
                active: colHidden,
                width: parseInt(colWidth),
                class: colthClass,
                display: true
            };

            lineItems.push(lineItemObj);
        });

        let templateObject = Template.instance();
        let reset_data = templateObject.reset_data.get();
        reset_data = reset_data.filter(redata => redata.display == false);
        lineItems.push(...reset_data);
        lineItems.sort((a, b) => a.index - b.index);

        try {
            let erpGet = erpDb();
            let tableName = "tblbilllist";
            let employeeId = parseInt(localStorage.getItem('mySessionEmployeeLoggedID')) || 0;
            let added = await sideBarService.saveNewCustomFields(erpGet, tableName, employeeId, lineItems);
            $(".fullScreenSpin").css("display", "none");
            if (added) {
                sideBarService.getNewCustomFieldsWithQuery(parseInt(localStorage.getItem('mySessionEmployeeLoggedID')), '').then(function (dataCustomize) {
                    addVS1Data('VS1_Customize', JSON.stringify(dataCustomize));
                });
                swal({
                    title: 'SUCCESS',
                    text: "Display settings is updated!",
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.value) {
                        $('#myModal2').modal('hide');
                    }
                });
            } else {
                swal("Something went wrong!", "", "error");
            }
        } catch (error) {
            $(".fullScreenSpin").css("display", "none");
            swal("Something went wrong!", "", "error");
        }
    },
    'click .chkSaleDate': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colSaleDate').addClass('showColumn');
            $('.colSaleDate').removeClass('hiddenColumn');
        } else {
            $('.colSaleDate').addClass('hiddenColumn');
            $('.colSaleDate').removeClass('showColumn');
        }
    },
    'click .chkSalesNo': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colSalesNo').addClass('showColumn');
            $('.colSalesNo').removeClass('hiddenColumn');
        } else {
            $('.colSalesNo').addClass('hiddenColumn');
            $('.colSalesNo').removeClass('showColumn');
        }
    },
    'click .chkDueDate': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colDueDate').addClass('showColumn');
            $('.colDueDate').removeClass('hiddenColumn');
        } else {
            $('.colDueDate').addClass('hiddenColumn');
            $('.colDueDate').removeClass('showColumn');
        }
    },
    'click .chkCustomer': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colCustomer').addClass('showColumn');
            $('.colCustomer').removeClass('hiddenColumn');
        } else {
            $('.colCustomer').addClass('hiddenColumn');
            $('.colCustomer').removeClass('showColumn');
        }
    },
    'click .chkAmountEx': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colAmountEx').addClass('showColumn');
            $('.colAmountEx').removeClass('hiddenColumn');
        } else {
            $('.colAmountEx').addClass('hiddenColumn');
            $('.colAmountEx').removeClass('showColumn');
        }
    },
    'click .chkTax': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colTax').addClass('showColumn');
            $('.colTax').removeClass('hiddenColumn');
        } else {
            $('.colTax').addClass('hiddenColumn');
            $('.colTax').removeClass('showColumn');
        }
    },
    // displaysettings
    'click .chkAmount': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colAmount').addClass('showColumn');
            $('.colAmount').removeClass('hiddenColumn');
        } else {
            $('.colAmount').addClass('hiddenColumn');
            $('.colAmount').removeClass('showColumn');
        }
    },
    'click .chkPaid': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colPaid').addClass('showColumn');
            $('.colPaid').removeClass('hiddenColumn');
        } else {
            $('.colPaid').addClass('hiddenColumn');
            $('.colPaid').removeClass('showColumn');
        }
    },

    'click .chkBalanceOutstanding': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colBalanceOutstanding').addClass('showColumn');
            $('.colBalanceOutstanding').removeClass('hiddenColumn');
        } else {
            $('.colBalanceOutstanding').addClass('hiddenColumn');
            $('.colBalanceOutstanding').removeClass('showColumn');
        }
    },
    'click .chkStatus': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colStatus').addClass('showColumn');
            $('.colStatus').removeClass('hiddenColumn');
        } else {
            $('.colStatus').addClass('hiddenColumn');
            $('.colStatus').removeClass('showColumn');
        }
    },
    'click .chkEmployee': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colEmployee').addClass('showColumn');
            $('.colEmployee').removeClass('hiddenColumn');
        } else {
            $('.colEmployee').addClass('hiddenColumn');
            $('.colEmployee').removeClass('showColumn');
        }
    },
    'click .chkComments': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colComments').addClass('showColumn');
            $('.colComments').removeClass('hiddenColumn');
        } else {
            $('.colComments').addClass('hiddenColumn');
            $('.colComments').removeClass('showColumn');
        }
    },
    'click .chkPONumber': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colPONumber').addClass('showColumn');
            $('.colPONumber').removeClass('hiddenColumn');
        } else {
            $('.colPONumber').addClass('hiddenColumn');
            $('.colPONumber').removeClass('showColumn');
        }
    },
    'click .chkReference': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colReference').addClass('showColumn');
            $('.colReference').removeClass('hiddenColumn');
        } else {
            $('.colReference').addClass('hiddenColumn');
            $('.colReference').removeClass('showColumn');
        }
    },
    'click .chkConverted': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colConverted').addClass('showColumn');
            $('.colConverted').removeClass('hiddenColumn');
        } else {
            $('.colConverted').addClass('hiddenColumn');
            $('.colConverted').removeClass('showColumn');
        }
    },


    'click .chkOrderDate': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colOrderDate').addClass('showColumn');
            $('.colOrderDate').removeClass('hiddenColumn');
        } else {
            $('.colOrderDate').addClass('hiddenColumn');
            $('.colOrderDate').removeClass('showColumn');
        }
    },

    'click .chkPurchaseNo': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colPurchaseNo').addClass('showColumn');
            $('.colPurchaseNo').removeClass('hiddenColumn');
        } else {
            $('.colPurchaseNo').addClass('hiddenColumn');
            $('.colPurchaseNo').removeClass('showColumn');
        }
    },

    'click .chkSupplier': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colSupplier').addClass('showColumn');
            $('.colSupplier').removeClass('hiddenColumn');
        } else {
            $('.colSupplier').addClass('hiddenColumn');
            $('.colSupplier').removeClass('showColumn');
        }
    },
    // display settings


    'change .rngRangeSaleDate': function (event) {
        let range = $(event.target).val();
        $('.colSaleDate').css('width', range);
    },
    'change .rngRangeSalesNo': function (event) {
        let range = $(event.target).val();
        $('.colSalesNo').css('width', range);
    },
    'change .rngRangeDueDate': function (event) {
        let range = $(event.target).val();
        $('.colDueDate').css('width', range);
    },
    'change .rngRangeUnitPriceInc': function (event) {
        let range = $(event.target).val();
        $('.colUnitPriceInc').css('width', range);
    },
    'change .rngRangeUnitPriceEx': function (event) {
        let range = $(event.target).val();
        $('.colUnitPriceEx').css('width', range);
    },
    'change .rngRangeTax': function (event) {
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
    'change .rngRangeCustomer': function (event) {
        let range = $(event.target).val();
        $('.colCustomer').css('width', range);
    },
    'change .rngRangeEmployee': function (event) {
        let range = $(event.target).val();
        $('.colEmployee').css('width', range);
    },
    'change .rngRangeComments': function (event) {
        let range = $(event.target).val();
        $('.colComments').css('width', range);
    },
    'change .rngRangePONumber': function (event) {
        let range = $(event.target).val();
        $('.colPONumber').css('width', range);
    },
    'change .rngRangeReference': function (event) {
        let range = $(event.target).val();
        $('.colReference').css('width', range);
    },
    'change .rngRangeConverted': function (event) {
        let range = $(event.target).val();
        $('.colConverted').css('width', range);
    },
    "blur .divcolumn": function (event) {
        let columData = $(event.target).html();
        let columHeaderUpdate = $(event.target).attr("valueupdate");
        $("th.col" + columHeaderUpdate + "").html(columData);
    },

});

Template.billlist.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function (a, b) {
            if (a.orderdate == 'NA') {
                return 1;
            } else if (b.orderdate == 'NA') {
                return -1;
            }
            return (a.orderdate.toUpperCase() > b.orderdate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    custfields: () => {
        return Template.instance().custfields.get();
    },

    // custom fields displaysettings
    displayfields: () => {
        return Template.instance().displayfields.get();
    },
    bills: () => {
        return Template.instance().bills.get();
    },
    formatDate: (date) => GlobalFunctions.formatDate(date),
    formatPrice: (price) => GlobalFunctions.formatPrice(price),

    apiFunction: function () {
        let sideBarService = new SideBarService();
        return sideBarService.getAllBillListData;
    },

    searchAPI: function () {
        return sideBarService.getTBillListDataByName;
    },

    service: () => {
        let sideBarService = new SideBarService();
        return sideBarService;

    },

    datahandler: function () {
        let templateObject = Template.instance();
        return function (data) {
            let dataReturn = templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    exDataHandler: function () {
        let templateObject = Template.instance();
        return function (data) {
            let dataReturn = templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    apiParams: function () {
        return ["dateFrom", "dateTo", "ignoredate", "limitCount", "limitFrom", "deleteFilter"];
    },

});
