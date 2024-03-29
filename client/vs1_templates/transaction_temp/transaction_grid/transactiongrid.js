// @ts-nocheck
import {Session} from 'meteor/session';
import '../../../lib/global/indexdbstorage.js';
import { ReactiveVar } from 'meteor/reactive-var';
import { SideBarService } from '../../../js/sidebar-service';
import FxGlobalFunctions from '../../../packages/currency/FxGlobalFunctions';
import TransactionFields from '../transaction_line_setting.js';
import { Template } from 'meteor/templating';
import { Random } from "meteor/random";
import './transactiongrid.html';
import { UtilityService } from '../../../utility-service.js';
import { cloneDeep } from 'lodash';

let sideBarService = new SideBarService();
export const foreignCols = ["UnitPriceEx", "UnitPriceInc","TaxAmount", "AmountEx", "AmountInc",  "CostPrice"];
Template.transactiongrid.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.isForeignEnabled = new ReactiveVar(false);
    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
    templateObject.initialTableWidth = new ReactiveVar('');
});
Template.transactiongrid.onRendered(function() {
    let templateObject = Template.instance();
    
    
    let currenttranstablename = templateObject.data.tablename||"";
    let isBatchSerialNoTracking = templateObject.data.isBatchSerialNoTracking.toString() === "true";
    let includeBOnShippedQty = templateObject.data.includeBOnShippedQty.toString() === "true";
    let canShowUOM = templateObject.data.canShowUOM.toString() === "true";
    let canShowBackOrder = templateObject.data.canShowBackOrder.toString() === "true";
    let allowedExRateTables = ['tblPOLine', 'tblInvoiceLine'];
    let isFixedAssets = localStorage.getItem('CloudFixedAssetsModule');
    
    templateObject.init_reset_data = async function() {
        let reset_data = [];
        
        reset_data = [
            { index: 0,  label: "Product Name",       class: "ProductName",   width: "300",       active: true,   display: true },
            { index: 1,  label: "Description",        class: "Description",   width: "",          active: true,   display: true },
            { index: 2,  label: "Account Name",       class: "AccountName",   width: "300",       active: true,   display: true },
            { index: 3,  label: "Memo",               class: "Memo",          width: "",          active: true,   display: true },
            { index: 4,  label: "Qty",                class: "Qty",           width: "50",        active: true,   display: true },
            { index: 5,  label: "Ordered",            class: "Ordered",       width: "75",        active: true,   display: true },
            { index: 6,  label: "Shipped",            class: "Shipped",       width: "75",        active: true,   display: true },
            { index: 7,  label: "BO",                 class: "BackOrder",     width: "75",        active: true,   display: true },
            { index: 8,  label: "Units",              class: "Units",         width: "95",        active: false,   display: true },
            { index: 9,  label: "Serial/Lot No",      class: "SerialNo",      width: "110",       active: false,   display: true },
            { index: 10, label: "Fixed Asset",        class: "FixedAsset",    width: "100",       active: false,   display: true },
            { index: 11, label: "Customer/Job",       class: "CustomerJob",   width: "110",       active: true,   display: true },
            { index: 12, label: "Cost",               class: "CostPrice",     width: "110",       active: false,   display: true },
            { index: 13, label: "Disc %",             class: "Discount",      width: "75",        active: true,   display: true },
            { index: 14, label: "CustField1",         class: "SalesLinesCustField1", width: "110",active: true,   display: true },
            { index: 15, label: "Tax Code",           class: "TaxCode",       width: "95",        active: true,   display: true },
            { index: 16, label: "Tax Rate",           class: "TaxRate",       width: "95",        active: false,   display: true },
            { index: 17, label: "Price (Ex)",         class: "UnitPriceEx",   width: "110",       active: true,   display: true },
            { index: 18, label: "Price (Inc)",        class: "UnitPriceInc",  width: "110",       active: false,  display: true },
            { index: 19, label: "Tax Amt",            class: "TaxAmount",     width: "95",        active: true,   display: true },
            { index: 20, label: "Shipping Totals",    class: "ShippingTotals",     width: "95",        active: false,   display: true },
            { index: 21, label: "Amount (Ex)",        class: "AmountEx",      width: "120",       active: true,   display: true },
            { index: 22, label: "Amount (Inc)",       class: "AmountInc",     width: "120",       active: false,  display: true },
            { index: 23, label: "Custom Field 1",     class: "CustomField1",  width: "95",       active: false,  display: true },
            { index: 24, label: "Custom Field 2",     class: "CustomField2",  width: "95",       active: false,  display: true },
        ];

        // if(templateObject.data.transCategory == 'Accounting') {
        //     reset_data = templateObject.data.gridfields;
        // }
        let default_display = [];
        switch(currenttranstablename) {
            case 'tblPOLine':
                default_display = TransactionFields.initPurchaseOrderLine;
                break;
            case 'tblBillLine':
                default_display = TransactionFields.initBillLine;
                break;
            case 'tblCreditLine':
                default_display = TransactionFields.initCreditLine;
                break;
            case 'tblQuoteLine':
                default_display = TransactionFields.initQuoteLine;
                break;
            case 'tblSalesOrderLine':
                default_display = TransactionFields.initSalesOrderLine;
                break;
            case 'tblInvoiceLine':
                default_display = TransactionFields.initInvoiceLine;
                break;
            case 'tblRefundLine':
                default_display = TransactionFields.initRefundLine;
                break;
            case 'tblChequeLine':
                default_display = TransactionFields.initChequeLine;
        }
        reset_data = await TransactionFields.insertData(reset_data, default_display);

        let findItem = null;
        // canShowBackOrder
        if(allowedExRateTables.includes(currenttranstablename)){
            findItem = reset_data.find(item => item.class === "Ordered"); if(findItem != undefined) findItem.display = findItem.active = (canShowBackOrder && includeBOnShippedQty);
            findItem = reset_data.find(item => item.class === "Shipped"); if(findItem != undefined) findItem.display = findItem.active = (canShowBackOrder && includeBOnShippedQty);
            findItem = reset_data.find(item => item.class === "BackOrder"); if(findItem != undefined) findItem.display = findItem.active = (canShowBackOrder && includeBOnShippedQty);
            findItem = reset_data.find(item => item.class === "Qty"); if(findItem != undefined) findItem.display = findItem.active = !(canShowBackOrder && includeBOnShippedQty);
        }
        // canShowUOM
        findItem = reset_data.find(item => item.class === "Units"); if(findItem != undefined) findItem.display = canShowUOM; findItem.active = false
        // isBatchSerialNoTracking
        // findItem = reset_data.find(item => item.class === "SerialNo"); if(findItem != undefined) findItem.display = findItem.active = isBatchSerialNoTracking;

        //Fixed Asset
        // findItem = reset_data.find(item => item.class === "FixedAsset"); if(findItem != undefined) findItem.display = findItem.active = isFixedAssets;
        
        await templateObject.reset_data.set(reset_data);
        templateObject.initCustomFieldDisplaySettings("", currenttranstablename);
    }
    templateObject.init_reset_data();
    templateObject.initCustomFieldDisplaySettings = function(data, listType) {
        let reset_data = templateObject.reset_data.get();
        // Fixet Asset
        templateObject.showCustomFieldDisplaySettings(reset_data);
        getVS1Data("VS1_Customize").then(function(dataObject){
            if(dataObject.length == 0) {
                // Import VS1_Customize from API
                employeeId = parseInt(localStorage.getItem('mySessionEmployeeLoggedID'));
                sideBarService.getNewCustomFieldsWithQuery(employeeId, listType).then(function(data) {
                    reset_data = data.ProcessLog.Obj.CustomLayout[0].Columns;
                    temp_reset_data = templateObject.reset_data.get();
                    reset_data = TransactionFields.insertData(temp_reset_data, reset_data);
                    let findItem = null;
                    // canShowBackOrder
                    if(allowedExRateTables.includes(listType)){
                        findItem = reset_data.find(item => item.class === "Ordered"); if(findItem != undefined) findItem.display = findItem.active = (canShowBackOrder && includeBOnShippedQty);
                        findItem = reset_data.find(item => item.class === "Shipped"); if(findItem != undefined) findItem.display = findItem.active = (canShowBackOrder && includeBOnShippedQty);
                        findItem = reset_data.find(item => item.class === "BackOrder"); if(findItem != undefined) findItem.display = findItem.active = (canShowBackOrder && includeBOnShippedQty);
                        findItem = reset_data.find(item => item.class === "Qty"); if(findItem != undefined) findItem.display = findItem.active = !(canShowBackOrder && includeBOnShippedQty);
                    }
                    // canShowUOM
                    findItem = reset_data.find(item => item.class === "Units"); if(findItem != undefined) findItem.display = findItem.active = canShowUOM;
                    // isBatchSerialNoTracking
                    findItem = reset_data.find(item => item.class === "SerialNo"); if(findItem != undefined) findItem.display = findItem.active = isBatchSerialNoTracking;
                    //Fixed Asset
                    findItem = reset_data.find(item => item.class === "FixedAsset"); if(findItem != undefined) findItem.display = findItem.active = isFixedAssets;
                    templateObject.showCustomFieldDisplaySettings(reset_data);
                }).catch( function(err) {});
            } else {
                // Import VS1_Customize from IndexDB
                let data = JSON.parse(dataObject[0].data);
                if (data.ProcessLog.Obj?.CustomLayout.length > 0) {
                    for (let i = 0; i < data.ProcessLog.Obj.CustomLayout.length; i++) {
                        if (data.ProcessLog.Obj.CustomLayout[i].TableName == listType) {
                            reset_data = data.ProcessLog.Obj.CustomLayout[i].Columns;
                            temp_reset_data = templateObject.reset_data.get();
                            reset_data = TransactionFields.insertData(temp_reset_data, reset_data);
                            let findItem = null;
                            // canShowBackOrder
                            if(allowedExRateTables.includes(listType)){
                                findItem = reset_data.find(item => item.class === "Ordered"); if(findItem != undefined) findItem.display = findItem.active = (canShowBackOrder && includeBOnShippedQty);
                                findItem = reset_data.find(item => item.class === "Shipped"); if(findItem != undefined) findItem.display = findItem.active = (canShowBackOrder && includeBOnShippedQty);
                                findItem = reset_data.find(item => item.class === "BackOrder"); if(findItem != undefined) findItem.display = findItem.active = (canShowBackOrder && includeBOnShippedQty);
                                findItem = reset_data.find(item => item.class === "Qty"); if(findItem != undefined) findItem.display = findItem.active = !(canShowBackOrder && includeBOnShippedQty);
                            }
                            // canShowUOM
                            findItem = reset_data.find(item => item.class === "Units"); if(findItem != undefined) findItem.display = findItem.active = canShowUOM;
                            // isBatchSerialNoTracking
                            findItem = reset_data.find(item => item.class === "SerialNo"); if(findItem != undefined) findItem.display = findItem.active = isBatchSerialNoTracking;
                            //Fixed Asset
                            findItem = reset_data.find(item => item.class === "FixedAsset"); if(findItem != undefined) findItem.display = findItem.active = isFixedAssets;
                        }
                    }
                    templateObject.showCustomFieldDisplaySettings(reset_data);
                }
            }
        });
    }
    templateObject.showCustomFieldDisplaySettings = async function(raw_reset_data) {
        let custFields = [];
        let customData = {};
        let boIndex = raw_reset_data.findIndex(x => x.class === "BackOrder");
        let unitIndex = raw_reset_data.findIndex(x => x.class === "Units");
        let reset_data = [];
        if (boIndex !== undefined && unitIndex !== undefined && !templateObject.data.transCateogry) {
            for (let index = 0; index < raw_reset_data.length; index++) {
                if (boIndex > unitIndex) {
                    if (index < unitIdnex) reset_data.push({...raw_reset_data[index], index: index})
                    if (index === unitIndex) continue
                    if (index > unitIndex && index <= boIndex) reset_data.push({...raw_reset_data[index], index: index - 1})
                    if (index === boIndex) reset_data.push({...raw_reset_data[unitIndex], index: index, label: "Unit Type"})
                    if (index > boIndex) reset_data.push({...raw_reset_data[index], index: index})
                } else {
                    if (index <= boIndex) reset_data.push({...raw_reset_data[index], index: index})
                    if (index === boIndex) reset_data.push({...raw_reset_data[unitIndex], index: index + 1, label: "Unit Type"})
                    if (index > boIndex && index < unitIndex) reset_data.push({...raw_reset_data[index], index: index + 1})
                    if (index === unitIndex) continue
                    if (index > unitIndex) reset_data.push({...raw_reset_data[index], index: index})
                }
            }
        }
        let customFieldCount = reset_data.length;
        
        for (let r = 0; r < customFieldCount; r++) {
            customData = {
                id: reset_data[r].index,
                active: reset_data[r].active,
                display: reset_data[r].display,
                label: reset_data[r].label,
                class: reset_data[r].class,
                width: reset_data[r].width ? reset_data[r].width : '',
                custfieldlabel: reset_data[r].label,
            };
            
            if(reset_data[r].active == true){
              $('#'+currenttranstablename+' .'+reset_data[r].class).removeClass('hiddenColumn');
            }else if(reset_data[r].active == false){
              $('#'+currenttranstablename+' .'+reset_data[r].class).addClass('hiddenColumn');
            };
            custFields.push(customData);
        }
        await templateObject.displayfields.set(custFields);
        if(templateObject.data.customGrid == true) {
            templateObject.displayfields.set(templateObject.data.gridfields)
        }
        $('.dataTable').resizable();
    }


    $('#'+templateObject.data.tablename).on('column-resize', function(e, settings, column) {
      
        $("#"+templateObject.data.tablename+".JColResizer.JCLRFlex").attr("style", "width: auto !important")
  });
//   LoadingOverlay.hide();

});
Template.transactiongrid.events({

    "blur .lineProductDesc": function (event) { // can be moved to transactiongrid I think
        var targetID = $(event.target).closest("tr").attr("id");
        $("#" + targetID + " #lineProductDesc").text(
          $("#" + targetID + " .lineProductDesc").text()
        );
    },
    "click .btnOpenTranSettings": async function (event, template) {
        let templateObject = Template.instance();
        let currenttranstablename = templateObject.data.tablename||"";
        $(`#${currenttranstablename} thead tr th`).each(function (index) {
          var $tblrow = $(this);
          var colWidth = $tblrow.width() || 0;
          var colthClass = $tblrow.attr('data-class') || "";
          $('.rngRange' + colthClass).val(colWidth);
        });
       $('.'+currenttranstablename+'_Modal').modal('toggle');
    },
    "click .btnResetGridSettings": function(event) {
        let templateObject = Template.instance();
        let currenttranstablename = templateObject.data.tablename||"";
        if(templateObject.data.custid) {
            currenttablename = currenttablename + "_" + templateObject.data.custid
        }
        let loggedEmpID = localStorage.getItem('mySessionEmployeeLoggedID')||0;
        //let reset_data = await templateObject.reset_data.get();
        //reset_data = reset_data.filter(redata => redata.display);
        $('.fullScreenSpin').css('display', 'inline-block');
        //Rasheed Add Reset Function (API)
        var erpGet = erpDb();
        let objResetData = {
            Name:"VS1_Customize",
            Params:
            {
                EmployeeID:parseInt(loggedEmpID)||0,
                TableName:currenttranstablename,
                Columns:[
                   {
                     "Width":"0"
                 }
                ],
                Reset:true
            }
        }

        var oPost = new XMLHttpRequest();
        oPost.open("POST", URLRequest + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + 'erpapi/VS1_Cloud_Task/Method?Name="VS1_Customize"', true);
        oPost.setRequestHeader("database", erpGet.ERPDatabase);
        oPost.setRequestHeader("username", erpGet.ERPUsername);
        oPost.setRequestHeader("password", erpGet.ERPPassword);
        oPost.setRequestHeader("Accept", "application/json");
        oPost.setRequestHeader("Accept", "application/html");
        oPost.setRequestHeader("Content-type", "application/json");
        var myString = JSON.stringify(objResetData);

         oPost.send(myString);

        oPost.onreadystatechange = function() {
        if(oPost.readyState == 4 && oPost.status == 200) {

              var myArrResponse = JSON.parse(oPost.responseText);
              if(myArrResponse.ProcessLog.Error){
                $('.fullScreenSpin').css('display','none');
                swal('Oooops...', myArrResponse.ProcessLog.Error, 'error');
              }else{
                sideBarService.getNewCustomFieldsWithQuery(parseInt(localStorage.getItem('mySessionEmployeeLoggedID')), '').then(async function(dataCustomize) {
                    await addVS1Data('VS1_Customize', JSON.stringify(dataCustomize));
                    templateObject.init_reset_data();
                    templateObject.initCustomFieldDisplaySettings("", currenttranstablename);
                    $('#myModal2').modal('hide');
                    $('.modal-backdrop').css('display','none');
                    $('.fullScreenSpin').css('display','none');
                    swal({
                        title: 'SUCCESS',
                        text: "Display settings is updated!",
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'OK'
                    }).then((result) => {
                        location.reload();
                    });
                }).catch(function (err) {
                  $('.fullScreenSpin').css('display','none');
                });


              }

          }else if(oPost.readyState == 4 && oPost.status == 403){
              $('.fullScreenSpin').css('display','none');
              swal({
              title: 'Oooops...',
              text: oPost.getResponseHeader('errormessage'),
              type: 'error',
              showCancelButton: false,
              confirmButtonText: 'Try Again'
              }).then((result) => {
              if (result.value) {

              } else if (result.dismiss === 'cancel') {

              }
              });
          }else if(oPost.readyState == 4 && oPost.status == 406){
            $('.fullScreenSpin').css('display','none');
            var ErrorResponse = oPost.getResponseHeader('errormessage');
            var segError = ErrorResponse.split(':');

          if((segError[1]) == ' "Unable to lock object'){

            swal('WARNING', oPost.getResponseHeader('errormessage')+'Please try again!', 'error');
          }else{

            swal('WARNING', oPost.getResponseHeader('errormessage')+'Please try again!', 'error');
          }

          }else if(oPost.readyState == '') {
            $('.fullScreenSpin').css('display','none');
            swal('Connection Failed', oPost.getResponseHeader('errormessage') +' Please try again!', 'error');
          }
        }

        /*
        $(`.${currenttranstablename}_Modal .displaySettings`).each(function(index) {
            let $tblrow = $(this);
            $tblrow.find(".divcolumn").text(reset_data[index].label);
            $tblrow.find(".custom-control-input").prop("checked", reset_data[index].active);
            let title = $(`#${currenttranstablename}`).find("th").eq(index);
            if (reset_data[index].class === 'AmountEx' || reset_data[index].class === 'UnitPriceEx') {
                $(title).html(reset_data[index].label + `<i class="fas fa-random fa-trans"></i>`);
            } else if (reset_data[index].class === 'AmountInc' || reset_data[index].class === 'UnitPriceInc') {
                $(title).html(reset_data[index].label + `<i class="fas fa-random"></i>`);
            } else {
                $(title).html(reset_data[index].label);
            }
            if (reset_data[index].active) {
                $('.col' + reset_data[index].class).addClass('showColumn');
                $('.col' + reset_data[index].class).removeClass('hiddenColumn');
            } else {
                $('.col' + reset_data[index].class).addClass('hiddenColumn');
                $('.col' + reset_data[index].class).removeClass('showColumn');
            }
            $(".rngRange" + reset_data[index].class).val(reset_data[index].width);
            $(".col" + reset_data[index].class).css('width', reset_data[index].width);
        });
        */

    },
    "click .btnSaveGridSettings" : async function(event) {
        playSaveAudio();
        let templateObject = Template.instance();
        let currenttranstablename = Template.instance().data.tablename||"";
        setTimeout(async function(){
            let lineItems = [];
            $(".fullScreenSpin").css("display", "inline-block");
            $(`.${currenttranstablename}_Modal .displaySettings`).each(function (index) {
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
                    width: parseInt(colWidth),
                    label: colTitle,
                    active: colHidden,
                    class: colthClass,
                    display: true
                };
                lineItems.push(lineItemObj);
            });
            let reset_data = templateObject.reset_data.get();
            reset_data = reset_data.filter(redata => redata.display == false);
            lineItems.push(...reset_data);
            lineItems.sort((a,b) => a.index - b.index);
            try {
                let erpGet = erpDb();
                let tableName = templateObject.data.tablename||"";
                let employeeId = parseInt(localStorage.getItem('mySessionEmployeeLoggedID'))||0;
                let added = await sideBarService.saveNewCustomFields(erpGet, tableName, employeeId, lineItems);
                $(".fullScreenSpin").css("display", "none");
                if(added) {
                    sideBarService.getNewCustomFieldsWithQuery(employeeId,'').then(function (dataCustomize) {
                    addVS1Data('VS1_Customize', JSON.stringify(dataCustomize)); // save VS1_Customize to IndexDB
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
                            $('.modal-backdrop').css('display','none');
                        }
                    });
                } else {
                    swal("Something went wrong!", "", "error");
                }
            } catch {
                $(".fullScreenSpin").css("display", "none");
                swal("Something went wrong!", "", "error");
            }
        }, delayTimeAfterSound);
    },

    'click th.colUnitPriceEx': function(event) {
        let templateObject = Template.instance();
        let displaysettings = cloneDeep(templateObject.displayfields.get());
        let recordIndex = displaysettings.findIndex(row=>{return row.class=='UnitPriceEx'});
        if(recordIndex > -1) {
            displaysettings[recordIndex].active  = false
        }
        let incIndex = displaysettings.findIndex(row=>{return row.class=='UnitPriceInc'});
        if(incIndex > -1) {
            displaysettings[incIndex].active  = true
        }
        templateObject.displayfields.set(displaysettings)
    },

    'click th.colUnitPriceInc': function(event) {
        let templateObject = Template.instance();
        let displaysettings = cloneDeep(templateObject.displayfields.get());
        let recordIndex = displaysettings.findIndex(row=>{return row.class=='UnitPriceEx'});
        if(recordIndex > -1) {
            displaysettings[recordIndex].active  = true
        }
        let incIndex = displaysettings.findIndex(row=>{return row.class=='UnitPriceInc'});
        if(incIndex > -1) {
            displaysettings[incIndex].active  = false
        }
        templateObject.displayfields.set(displaysettings)
    },

    'click th.colAmountEx': function(event) {
        let templateObject = Template.instance();
        let displaysettings = cloneDeep(templateObject.displayfields.get());
        let recordIndex = displaysettings.findIndex(row=>{return row.class=='AmountEx'});
        if(recordIndex > -1) {
            displaysettings[recordIndex].active  = false
        }
        let incIndex = displaysettings.findIndex(row=>{return row.class=='AmountInc'});
        if(incIndex > -1) {
            displaysettings[incIndex].active  = true
        }
        templateObject.displayfields.set(displaysettings)
    },

    'click th.colAmountInc': function(event) {
        let templateObject = Template.instance();
        let displaysettings = cloneDeep(templateObject.displayfields.get());
        let recordIndex = displaysettings.findIndex(row=>{return row.class=='AmountEx'});
        if(recordIndex > -1) {
            displaysettings[recordIndex].active  = true
        }
        let incIndex = displaysettings.findIndex(row=>{return row.class=='AmountInc'});
        if(incIndex > -1) {
            displaysettings[incIndex].active  = false
        }
        templateObject.displayfields.set(displaysettings)
    },

    'change .chkLineGrid': async function (event) {
        event.preventDefault();
        // event.stopImmediatePropagation();
        event.stopImmediatePropagation();
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").attr('valueupdate');
        if ($(event.target).is(':checked')) {
            $('.col' + columnDataValue).addClass('showColumn');
            $('.col' + columnDataValue).removeClass('hiddenColumn');

            if($(event.target).hasClass('chkUnitPriceEx') == true) {
                $('.chkUnitPriceInc').prop('checked', false)
                $('.colUnitPriceInc').removeClass('showColumn')
                $('.colUnitPriceInc').addClass('hiddenColumn')
            }
            if($(event.target).hasClass('chkUnitPriceInc') == true) {
                $('.chkUnitPriceEx').prop('checked', false)
                $('.colUnitPriceEx').removeClass('showColumn')
                $('.colUnitPriceEx').addClass('hiddenColumn')
            }
            if($(event.target).hasClass('chkAmountInc') == true) {
                $('.chkAmountEx').prop('checked', false)
                $('.colAmountEx').removeClass('showColumn')
                $('.colAmountEx').addClass('hiddenColumn')
            }
            if($(event.target).hasClass('chkAmountEx') == true) {
                $('.chkAmountInc').prop('checked', false)
                $('.colAmountInc').removeClass('showColumn')
                $('.colAmountInc').addClass('hiddenColumn')
            }
            
        } else {
            $('.col' + columnDataValue).addClass('hiddenColumn');
            $('.col' + columnDataValue).removeClass('showColumn');
        }

        let range = $(event.target).closest("div").next().find(".custom-range").val();
        await $('.' + columnDataValue).css('width', range);
        // $('.dataTable').resizable();

        // setTimeout(() => {
        //     window.dispatchEvent(new Event('resize'));
        // }, 500);
    },

    'change .custom-range': async function (event) {
        let range = $(event.target).val() || 100;
        let colClassName = $(event.target).attr("valueclass");
        await $('.' + colClassName).css('width', range);
        // $('.dataTable').resizable();
    },


    'click .tblTaxRate tbody tr': function (event) {
        let taxRate = $(event.target).closest('tr').find('.colRate').text();
        let modal = $(event.target).closest('div.vs1_dropdown_modal');
        let parent = $(modal).parent();
        let colTaxRate = $(parent).closest('tr').find('td.colTaxRate');
        $(colTaxRate).text(taxRate)
    },

});
Template.transactiongrid.helpers({
    // isForeignEnabled: () => {
    //     let isFxCurrencyLicence = localStorage.getItem('CloudUseForeignLicenceModule') ? true : false;
    //     // return isFxCurrencyLicence;
    //     return false;
    // },
    recordLineItems: () => {
        return Template.instance().data.recordLineItems;
    },
    isForeignEnabled: () => {
        return Template.instance().data.isForeignEnabled
    },
    displayfields: () => {
      return Template.instance().displayfields.get();
    },
    displayFieldColspan: (displayfield, isForeignEnabled) => {
        if (foreignCols.includes(displayfield.class)) {
            if (isForeignEnabled == true) {
                return 2
            }
            return 1;
        }
        return 1;
    },
    displayFieldRowspan: (displayfield, isForeignEnabled) => {
      if(isForeignEnabled == true) {
          if (foreignCols.includes(displayfield.class)) {
              return 1;
          }
          return 2;
      }
      return 1;
    },
    subHeaderForeign: (displayfield) => {
        if (foreignCols.includes(displayfield.class)) {
            return true;
        }
        return false;
    },
    convertToForeignAmount: (amount) => {
        return FxGlobalFunctions.convertToForeignAmount(amount, $('#exchange_rate').val(), FxGlobalFunctions.getCurrentCurrencySymbol());
    },

    randomId: ()=>{
        return Random.id()
    }
});

Template.registerHelper("equals", function (a, b) {
    return a === b;
});
