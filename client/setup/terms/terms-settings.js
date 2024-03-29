// @ts-nocheck
import './terms-settings.html'
import { ReactiveVar } from "meteor/reactive-var";
import { Template } from 'meteor/templating';
import "../../lib/global/indexdbstorage.js";
import { SideBarService } from "../../js/sidebar-service";
import { TaxRateService } from "../../settings/settings-service.js";
import LoadingOverlay from "../../LoadingOverlay";
import moment from 'moment';
import XLSX from "xlsx";
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { UtilityService } from "../../utility-service";

const sideBarService = new SideBarService()
const taxRateService = new TaxRateService();
const utilityService = new UtilityService();

Template.wizard_terms.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);

  templateObject.deptrecords = new ReactiveVar();
  templateObject.include7Days = new ReactiveVar(false);
  templateObject.include30Days = new ReactiveVar(false);
  templateObject.includeCOD = new ReactiveVar(false);
  templateObject.includeEOM = new ReactiveVar(false);
  templateObject.includeEOMPlus = new ReactiveVar(false);
  templateObject.includeSalesDefault = new ReactiveVar(false);
  templateObject.includePurchaseDefault = new ReactiveVar(false);
  templateObject.selectedFile = new ReactiveVar();

  templateObject.getDataTableList = function(data) {
    let linestatus = '';
    if (data.Active == true) {
      linestatus = "";
    } else if (data.Active == false) {
      linestatus = "In-Active";
    };
    let tdEOM = '';
    let tdEOMPlus = '';
    let tdCustomerDef = ''; //isSalesdefault
    let tdSupplierDef = ''; //isPurchasedefault
    let tdProgressPayment = ''; //isProgressPayment
    let tdRequired = ''; //Required
    let tdPayOnSale = ''; //isPayOnSale

    //Check if EOM is checked
    if (data.IsEOM == true) {
      tdEOM = '<span style="display:none;">'+(data.IsEOM)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="iseom-' + data.TermsID + '" checked><label class="custom-control-label chkBox" for="iseom-' + data.TermsID + '"></label></div>';
    } else {
      tdEOM = '<span style="display:none;">'+(data.IsEOM)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="iseom-' + data.TermsID + '"><label class="custom-control-label chkBox" for="iseom-' + data.TermsID + '"></label></div>';
    }
    //Check if EOM Plus is checked
    if (data.IsEOMPlus == true) {
      tdEOMPlus = '<span style="display:none;">'+(data.IsEOMPlus)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="iseomplus-' + data.TermsID + '" checked><label class="custom-control-label chkBox" for="iseomplus-' + data.TermsID + '"></label></div>';
    } else {
      tdEOMPlus = '<span style="display:none;">'+(data.IsEOMPlus)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="iseomplus-' + data.TermsID + '"><label class="custom-control-label chkBox" for="iseomplus-' + data.TermsID + '"></label></div>';
    }
    //Check if Customer Default is checked // //isSalesdefault
    if (data.IsSalesDefault == true) {
      tdCustomerDef = '<span style="display:none;">'+(data.IsSalesDefault)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="isSalesdefault-' + data.TermsID + '" checked><label class="custom-control-label chkBox" for="isSalesdefault-' + data.TermsID + '"></label></div>';
    } else {
      tdCustomerDef = '<span style="display:none;">'+(data.IsSalesDefault)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="isSalesdefault-' + data.TermsID + '"><label class="custom-control-label chkBox" for="isSalesdefault-' + data.TermsID + '"></label></div>';
    }
    //Check if Supplier Default is checked // isPurchasedefault
    if (data.IsPurchaseDefault == true) {
      tdSupplierDef = '<span style="display:none;">'+(data.IsPurchaseDefault)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="isPurchasedefault-' + data.TermsID + '" checked><label class="custom-control-label chkBox" for="isPurchasedefault-' + data.TermsID + '"></label></div>';
    } else {
      tdSupplierDef = '<span style="display:none;">'+(data.IsPurchaseDefault)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="isPurchasedefault-' + data.TermsID + '"><label class="custom-control-label chkBox" for="isPurchasedefault-' + data.TermsID + '"></label></div>';
    }
    //Check if is progress payment is checked
    if (data.IsProgressPayment == true) {
      tdProgressPayment = '<span style="display:none;">'+(data.IsProgressPayment)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="IsProgressPayment-' + data.TermsID + '" checked><label class="custom-control-label chkBox" for="IsProgressPayment-' + data.TermsID + '"></label></div>';
    } else {
      tdProgressPayment = '<span style="display:none;">'+(data.IsProgressPayment)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="IsProgressPayment-' + data.TermsID + '"><label class="custom-control-label chkBox" for="IsProgressPayment-' + data.TermsID + '"></label></div>';
    }
    //Check if Required is checked
    if (data.Required == true) {
      tdRequired = '<span style="display:none;">'+(data.Required)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="Required-' + data.TermsID + '" checked><label class="custom-control-label chkBox" for="Required-' + data.TermsID + '"></label></div>';
    } else {
      tdRequired = '<span style="display:none;">'+(data.Required)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="Required-' + data.TermsID + '"><label class="custom-control-label chkBox" for="Required-' + data.TermsID + '"></label></div>';
    }
    // Check if ProgressPaymentfirstPayonSaleDate is checked
    if (data.ProgressPaymentfirstPayonSaleDate == true) {
      tdPayOnSale = '<span style="display:none;">'+(data.ProgressPaymentfirstPayonSaleDate)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="ProgressPaymentfirstPayonSaleDate-' + data.TermsID + '" checked><label class="custom-control-label chkBox" for="ProgressPaymentfirstPayonSaleDate-' + data.TermsID + '"></label></div>';
    } else {
      tdPayOnSale = '<span style="display:none;">'+(data.ProgressPaymentfirstPayonSaleDate)+'</span><div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="ProgressPaymentfirstPayonSaleDate-' + data.TermsID + '"><label class="custom-control-label chkBox" for="ProgressPaymentfirstPayonSaleDate-' + data.TermsID + '"></label></div>';
    };

    var dataList = [
      data.TermsID || "",
      data.Terms || "",
      data.TermsAmount || "",
      tdEOM,
      tdEOMPlus,
      data.Description || "",
      tdCustomerDef,
      tdSupplierDef,
      tdProgressPayment,
      tdRequired,
      data.EarlyPaymentDiscount || 0.00,
      data.EarlyPaymentDays || 0.00,
      data.ProgressPaymentType || "",
      data.ProgressPaymentDuration || 0.00,
      tdPayOnSale,
      linestatus,
    ];
    return dataList;
  }

  let headerStructure = [
    { index: 0, label: 'ID', class: 'colTermsID', active: false, display: true, width: "20" },
    { index: 1, label: 'Term Name', class: 'colName', active: true, display: true, width: "200" },
    { index: 2, label: 'Terms Amount', class: 'colTermsAmount', active: true, display: true, width: "120" },
    { index: 3, label: 'EOM', class: 'colIsEOM', active: true, display: true, width: "100" },
    { index: 4, label: 'EOM Plus', class: 'colIsEOMPlus', active: true, display: true, width: "100" },
    { index: 5, label: 'Description', class: 'colDescription', active: true, display: true, width: "500" },
    { index: 6, label: 'Customer Default', class: 'colCustomerDef', active: true, display: true, width: "160" },
    { index: 7, label: 'Supplier Default', class: 'colSupplierDef', active: true, display: true, width: "160" },
    { index: 8, label: 'Is Progress Payment', class: 'colIsProgressPayment', active: false, display: true, width: "180" },
    { index: 9, label: 'Required', class: 'colRequired', active: false, display: true, width: "80" },
    { index: 10, label: 'Early Payment Discount', class: 'colEarlyPayDiscount', active: false, display: true, width: "200" },
    { index: 11, label: 'Early Payment Days', class: 'colEarlyPay', active: false, display: true, width: "160" },
    { index: 12, label: 'Payment Type', class: 'colProgressPayType', active: false, display: true, width: "120" },
    { index: 13, label: 'Payment Duration', class: 'colProgressPayDuration', active: false, display: true, width: "160" },
    { index: 14, label: 'Pay On Sale Date', class: 'colPayOnSale', active: false, display: true, width: "160" },
    { index: 15, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
  ];
  templateObject.tableheaderrecords.set(headerStructure);
})

Template.wizard_terms.onRendered(() => {
  let templateObject = Template.instance();
  $("#tblSetupTermsList tbody").on("click", "tr", function (event) {
    var is7days = false;
    var is30days = false;
    var isEOM = false;
    var isEOMPlus = false;
    var isSalesDefault = false;
    var isPurchaseDefault = false;

    $("#termModalHeader").text("Edit Term Settings");
    let termsID = $(this).closest("tr").attr("id") || 0;
    let termsName = $(event.target).closest("tr").find(".colName").text() || "";
    let description =
      $(event.target).closest("tr").find(".colDescription").text() || "";
    let days = $(event.target).closest("tr").find(".colTermsAmount").text() || 0;
    let status = $(event.target).closest("tr").find(".colStatus").text();
    if (
      $(event.target).closest("tr").find(".colIsEOM input.chkBox").is(":checked")
    ) {
      isEOM = true;
    }
    if (
      $(event.target).closest("tr").find(".colIsEOMPlus input.chkBox").is(":checked")
    ) {
      isEOMPlus = true;
    }
    if (
      $(event.target)
        .closest("tr")
        .find(".colCustomerDef input.chkBox")
        .is(":checked")
    ) {
      isSalesDefault = true;
    }
    if (
      $(event.target)
        .closest("tr")
        .find(".colSupplierDef input.chkBox")
        .is(":checked")
    ) {
      isPurchaseDefault = true;
    }
    if (isEOM == true) {
      templateObject.includeEOM.set(true);
    } else {
      templateObject.includeEOM.set(false);
    }
    if (isEOMPlus == true) {
      templateObject.includeEOMPlus.set(true);
    } else {
      templateObject.includeEOMPlus.set(false);
    }
    if (isSalesDefault == true) {
      templateObject.includeSalesDefault.set(true);
    } else {
      templateObject.includeSalesDefault.set(false);
    }
    if (isPurchaseDefault == true) {
      templateObject.includePurchaseDefault.set(true);
    } else {
      templateObject.includePurchaseDefault.set(false);
    }

    $("#edtTermsID").val(termsID);
    $("#edtName").val(termsName);
    $("#edtName").prop("readonly", true);
    $("#edtDesc").val(description);
    $("#edtDays").val(days);
    $("#isEOM").prop("checked", isEOM);
    $("#isEOMPlus").prop("checked", isEOMPlus);
    $("#chkCustomerDef").prop('checked', isSalesDefault);
    $("#chkSupplierDef").prop('checked', isPurchaseDefault);
    $("#myModalTerms").modal("show");

    //Make btnDelete "Make Active or In-Active"
    // if (status == "In-Active") {
    //   $('.btnDeleteTerms').addClass('d-none')
    //   $('.btnActiveTerms').removeClass('d-none')
    // } else {
    //   $('.btnActiveTerms').addClass('d-none')
    //   $('.btnDeleteTerms').removeClass('d-none')
    // }
    if(status == "In-Active"){
      $('#view-in-active').html("<button class='btn btn-success btnActiveTerms vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make Active</button>");
    }else{
      $('#view-in-active').html("<button class='btn btn-danger btnDeleteTerms vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>");
    }
  });
})

Template.wizard_terms.events({
  "click .table-remove-term"(event) {
    event.stopPropagation();
    var targetID = $(event.target).closest("tr").attr("id"); // table row ID
    $("#selectDeleteLineID").val(targetID);
    $("#deleteTermLineModal").modal("toggle");
  },
  "click .btnRefreshTerm": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    sideBarService
      .getTermsDataList()
      .then(function (dataTermsList) {
        addVS1Data("TTermsVS1List", JSON.stringify(dataTermsList))
          .then(function (datareturn) {
            sideBarService
              .getTermsVS1()
              .then(function (dataReload) {
                addVS1Data("TTermsVS1", JSON.stringify(dataReload))
                  .then(function (datareturn) {
                    location.reload(true)
                  })
                  .catch(function (err) {
                    location.reload(true)
                  });
              })
              .catch(function (err) {
                location.reload(true)
              });
          })
          .catch(function (err) {
            location.reload(true)
          });
      })
      .catch(function (err) {
        location.reload(true)
      });
  },
  "click .btnAddTerms": (e, templateObject) => {
    $("#add-terms-title").text("Add New Term ");
    $("#edtTermsID").val("");
    $("#edtName").val("");
    $("#edtName").prop("readonly", false);
    $("#edtDesc").val("");
    $("#edtDays").val("");
    $("#view-in-active").html(
      "<button class='btn btn-danger btnDeleteTerms vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>"
    );

    $('#addTermModal #isEOM').prop('checked', false);
    $('#addTermModal #isEOMPlus').prop('checked', false);

    $('#addTermModal #chkCustomerDef').prop('checked', false);
    $('#addTermModal #chkSupplierDef').prop('checked', false);

    templateObject.include7Days.set(false);
    templateObject.includeCOD.set(false);
    templateObject.include30Days.set(false);
    templateObject.includeEOM.set(false);
    templateObject.includeEOMPlus.set(false);
  },
  "click .btnActiveTerms": function () {
    $("#view-in-active").html(
      "<button class='btn btn-danger btnDeleteTerms vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>"
    );
  },
  "click .btnDeleteTerms": function () {
    $("#view-in-active").html(
      "<button class='btn btn-success btnActiveTerms vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make Active</button>"
    );
  },
  "click .chkTerms": function (event) {
    var $box = $(event.target);

    if ($box.is(":checked")) {
      var group = "input:checkbox[name='" + $box.attr("name") + "']";
      $(group).prop("checked", false);
      $box.prop("checked", true);
    } else {
      $box.prop("checked", false);
    }
  },
  "keydown #edtDays": function (event) {
    if (
      $.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
      // Allow: Ctrl+A, Command+A
      (event.keyCode === 65 &&
        (event.ctrlKey === true || event.metaKey === true)) ||
      // Allow: home, end, left, right, down, up
      (event.keyCode >= 35 && event.keyCode <= 40)
    ) {
      // let it happen, don't do anything
      return;
    }

    if (event.shiftKey == true) {
      event.preventDefault();
    }

    if (
      (event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 96 && event.keyCode <= 105) ||
      event.keyCode == 8 ||
      event.keyCode == 9 ||
      event.keyCode == 37 ||
      event.keyCode == 39 ||
      event.keyCode == 46 ||
      event.keyCode == 190
    ) {
    } else {
      event.preventDefault();
    }
  },
  // Import here
  "click .templateDownload": function () {
    let utilityService = new UtilityService();
    let rows = [];
    const filename = "SampleTermsSetting" + ".csv";
    rows[0] = [
      "Term Name",
      "Days",
      "EOM",
      "EOM+",
      "Description",
      "Customer",
      "Supplier",
    ];
    rows[1] = ["ABC", "7", "false", "false", "description", "false", "false"];
    utilityService.exportToCsv(rows, filename, "csv");
  },
  "click .templateDownloadXLSX": function (e) {
    e.preventDefault(); //stop the browser from following
    window.location.href = "sample_imports/SampleTermsSetting.xlsx";
  },
  "click .btnUploadFile": function (event) {
    $("#attachment-upload").val("");
    $(".file-name").text("");
    //$(".btnImport").removeAttr("disabled");
    $("#attachment-upload").trigger("click");
  },
  "change #attachment-upload": function (e) {
    let templateObj = Template.instance();
    var filename = $("#attachment-upload")[0].files[0]["name"];
    var fileExtension = filename.split(".").pop().toLowerCase();
    var validExtensions = ["csv", "txt", "xlsx"];
    var validCSVExtensions = ["csv", "txt"];
    var validExcelExtensions = ["xlsx", "xls"];

    if (validExtensions.indexOf(fileExtension) == -1) {
      swal(
        "Invalid Format",
        "formats allowed are :" + validExtensions.join(", "),
        "error"
      );
      $(".file-name").text("");
      $(".btnImport").Attr("disabled");
    } else if (validCSVExtensions.indexOf(fileExtension) != -1) {
      $(".file-name").text(filename);
      let selectedFile = event.target.files[0];

      templateObj.selectedFile.set(selectedFile);
      if ($(".file-name").text() != "") {
        $(".btnImport").removeAttr("disabled");
      } else {
        $(".btnImport").Attr("disabled");
      }
    } else if (fileExtension == "xlsx") {
      $(".file-name").text(filename);
      let selectedFile = event.target.files[0];
      var oFileIn;
      var oFile = selectedFile;
      var sFilename = oFile.name;
      // Create A File Reader HTML5
      var reader = new FileReader();

      // Ready The Event For When A File Gets Selected
      reader.onload = function (e) {
        var data = e.target.result;
        data = new Uint8Array(data);
        var workbook = XLSX.read(data, { type: "array" });

        var result = {};
        workbook.SheetNames.forEach(function (sheetName) {
          var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
            header: 1,
          });
          var sCSV = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
          templateObj.selectedFile.set(sCSV);

          if (roa.length) result[sheetName] = roa;
        });
        // see the result, caution: it works after reader event is done.
      };
      reader.readAsArrayBuffer(oFile);

      if ($(".file-name").text() != "") {
        $(".btnImport").removeAttr("disabled");
      } else {
        $(".btnImport").Attr("disabled");
      }
    }
  },
  "click .btnImport": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    let templateObject = Template.instance();
    let taxRateService = new TaxRateService();
    let objDetails;

    Papa.parse(templateObject.selectedFile.get(), {
      complete: function (results) {
        if (results.data.length > 0) {
          if (
            results.data[0][0] == "Term Name" &&
            results.data[0][4] == "Description"
          ) {
            let dataLength = results.data.length * 500;
            setTimeout(function () {
              sideBarService.getTermsVS1().then(function(dataReload) {
                addVS1Data('TTermsVS1', JSON.stringify(dataReload)).then(function(datareturn) {
                  location.reload(true);
                }).catch(function(err) {
                  location.reload(true);
                });
              }).catch(function(err) {
                location.reload(true);
              });
            }, parseInt(dataLength));

            for (let i = 0; i < results.data.length - 1; i++) {
              objDetails = {
                type: "TTerms",
                fields: {
                  TermsName: results.data[i + 1][0] || "",
                  Days: results.data[i + 1][1] || 0,
                  IsEOM: results.data[i + 1][2] == "FALSE" ? false : true,
                  IsEOMPlus: results.data[i + 1][3] == "FALSE" ? false : true,
                  Description: results.data[i + 1][4] || "",
                  IsPurchaseDefault: results.data[i + 1][5] == "FALSE" ? false : true,
                  IsSalesDefault: results.data[i + 1][6] == "FALSE" ? false : true,
                  Active: true,
                  PublishOnVS1: true
                },
              };
              if (results.data[i + 1][1]) {
                if (results.data[i + 1][1] !== "") {
                  taxRateService
                    .saveTerms(objDetails)
                    .then(function (data) {})
                    .catch(function (err) {
                      swal({
                        title: "Oooops...",
                        text: err,
                        type: "error",
                        showCancelButton: false,
                        confirmButtonText: "Try Again",
                      }).then((result) => {
                        if (result.value) {
                          location.reload(true)
                        } else if (result.dismiss === "cancel") {}
                      });
                    });
                }
              }
            }
          } else {
            $(".fullScreenSpin").css("display", "none");
            swal(
              "Invalid Data Mapping fields ",
              "Please check that you are importing the correct file with the correct column headers.",
              "error"
            );
          }
        } else {
          $(".fullScreenSpin").css("display", "none");
          swal(
            "Invalid Data Mapping fields ",
            "Please check that you are importing the correct file with the correct column headers.",
            "error"
          );
        }
      },
    });
  },
})

Template.wizard_terms.helpers({
  datatablerecords: () => {
    return Template.instance()
      .datatablerecords.get()
      .sort(function (a, b) {
        if (a.termname == "NA") {
          return 1;
        } else if (b.termname == "NA") {
          return -1;
        }
        return a.termname.toUpperCase() > b.termname.toUpperCase() ? 1 : -1;
      });
  },
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: localStorage.getItem("mycloudLogonID"),
      PrefName: "tblSetupTermsList",
    });
  },
  deptrecords: () => {
    return Template.instance()
      .deptrecords.get()
      .sort(function (a, b) {
        if (a.department == "NA") {
          return 1;
        } else if (b.department == "NA") {
          return -1;
        }
        return a.department.toUpperCase() > b.department.toUpperCase() ? 1 : -1;
      });
  },
  include7Days: () => {
    return Template.instance().include7Days.get();
  },
  include30Days: () => {
    return Template.instance().include30Days.get();
  },
  includeCOD: () => {
    return Template.instance().includeCOD.get();
  },
  includeEOM: () => {
    return Template.instance().includeEOM.get();
  },
  includeEOMPlus: () => {
    return Template.instance().includeEOMPlus.get();
  },
  includeSalesDefault: () => {
    return Template.instance().includeSalesDefault.get();
  },
  includePurchaseDefault: () => {
    return Template.instance().includePurchaseDefault.get();
  },
  loggedCompany: () => {
    return localStorage.getItem("mySession") || "";
  },

  apiFunction:function() {
    let sideBarService = new SideBarService();
    return sideBarService.getTermsDataList;
  },

  searchAPI: function() {
    return sideBarService.getOneTermsByTermName;
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
    return ['limitCount', 'limitFrom', 'deleteFilter'];
  },
})

Template.registerHelper("equals", function (a, b) {
  return a === b;
});
