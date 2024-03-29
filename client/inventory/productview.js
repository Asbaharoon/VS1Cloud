import "./productview.html";
import { ProductService } from "../product/product-service";
import { ReactiveVar } from "meteor/reactive-var";
import { TaxRateService } from "../settings/settings-service";
import { CoreService } from "../js/core-service";
import { AccountService } from "../accounts/account-service";
import { PurchaseBoardService } from "../js/purchase-service";
import { UtilityService } from "../utility-service";
import { Random } from "meteor/random";
import { SideBarService } from "../js/sidebar-service";
import "../lib/global/indexdbstorage.js";
// import '../vs1_templates/recentTransactionTable/recentTransactionTable.js';
import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import { cloneDeep } from "lodash";
import { EditableService } from "../editable-service";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let productService = new ProductService();
let editableService = new EditableService();
let accSelected = "";
let uomSelected = "";
let taxSelected = "";
let defaultUOM = "Each";
let currentLineIndex
let customerLineIndex = 0
let DefaultBinNumber = 1;
const clickSalesAccount = editableService.clickSalesAccount;

const clickTaxCodeSales = editableService.clickTaxCodeSales;

const clickBinNumber = editableService.clickBinNumber;

const applyMarkup = (val) => {
  if ($('.baseEdtMarkup') && $('.baseEdtMarkup').val() && !isNaN(Number($('.baseEdtMarkup').val()))) {
    return val * (100 + Number($('.baseEdtMarkup').val())) / 100
  }
  return val
}

const toggleRecentTransaction = () => {
  $(".fullScreenSpin").css("display", "inline-block");
  let isShowRecentTrans = $(".product_recent_trans")[0].style.display;
  if (isShowRecentTrans == "none") {
    $(".product_recent_trans").show();
  } else {
    $(".product_recent_trans").hide();
  }
  $(".fullScreenSpin").css("display", "none");
}

Template.productview.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.bomProducts = new ReactiveVar([]);
    templateObject.records = new ReactiveVar();
    templateObject.taxraterecords = new ReactiveVar([]);
    templateObject.deptrecords = new ReactiveVar();
    templateObject.binrecords = new ReactiveVar();
    templateObject.bindept = new ReactiveVar();
    templateObject.bindeptid = new ReactiveVar();
    templateObject.binnumber = new ReactiveVar();
    templateObject.binlocation = new ReactiveVar();
    templateObject.tserialnumberList = new ReactiveVar();
    templateObject.tlotnumberList = new ReactiveVar();
    templateObject.recentTrasactions = new ReactiveVar([]);


  templateObject.coggsaccountrecords = new ReactiveVar();
  templateObject.salesaccountrecords = new ReactiveVar();
  templateObject.inventoryaccountrecords = new ReactiveVar();

  templateObject.productqtyrecords = new ReactiveVar();
  templateObject.productExtraSell = new ReactiveVar();
  templateObject.totaldeptquantity = new ReactiveVar();
  templateObject.isTrackChecked = new ReactiveVar();
  templateObject.isTrackChecked.set(false);
  templateObject.isSNTrackChecked = new ReactiveVar();
  templateObject.isSNTrackChecked.set(false);

  templateObject.isExtraSellChecked = new ReactiveVar();
  templateObject.isExtraSellChecked.set(false);

  templateObject.defaultpurchasetaxcode = new ReactiveVar();
  templateObject.defaultsaletaxcode = new ReactiveVar();

  templateObject.includeInventory = new ReactiveVar();
  templateObject.includeInventory.set(false);
  templateObject.clienttypeList = new ReactiveVar();
  templateObject.selectedProductField = new ReactiveVar();
  templateObject.selectedProcessField = new ReactiveVar();
  templateObject.selectedAttachedField = new ReactiveVar();
  templateObject.isMobileDevices = new ReactiveVar(false);
  templateObject.isManufactured = new ReactiveVar(false);
  templateObject.bomStructure = new ReactiveVar();
  templateObject.showSubButton = new ReactiveVar(true);
  templateObject.isShowBOMModal = new ReactiveVar(false);

  templateObject.productID = new ReactiveVar();
  templateObject.custfields = new ReactiveVar();
});

Template.productview.onRendered(function () {
  $(".fullScreenSpin").css("display", "inline-block");
  document.getElementById("newProcessModal").removeChild(document.getElementById("newProcessModal").children[1]);
  // $('.newProcessModal')[0].removeChild($('.newProcessModal')[0].children[1]);
  let templateObject = Template.instance();

    let purchaseService = new PurchaseBoardService();
    let taxRateService = new TaxRateService();
    const records = [];
    const taxCodesList = [];
    const deptrecords = [];
    const binrecords = [];
    const bindept = 'Default';

  const coggsaccountrecords = [];
  const salesaccountrecords = [];
  const inventoryaccountrecords = [];
  var splashArrayProductList = new Array();
  var splashArrayTaxRateList = new Array();
  var splashArrayAccountList = new Array();
  let clientType = [];
  let cloudPackage = localStorage.getItem("vs1cloudlicenselevel");
  if (cloudPackage == "PLUS") {
    templateObject.isSNTrackChecked.set(true);
  } else {
    templateObject.isSNTrackChecked.set(false);
  }

  if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
      navigator.userAgent
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      navigator.userAgent.substr(0, 4)
    )
  ) {
    templateObject.isMobileDevices.set(true);
  }

  const updateBinNumberSelect = () => {
    setTimeout(() => {
      $(".bin-number").editableSelect();
      $(".bin-number").editableSelect().on("click.editable-select", clickBinNumber);
    }, 100);
  };

  templateObject.setEditableSelect = async function (data) {
    // $(document).ready(function () {
      $("#slttaxcodepurchase").editableSelect();
      $("#slttaxcodesales").editableSelect();
      $("#sltcogsaccount").editableSelect();
      $("#sltsalesacount").editableSelect();
      $("#sltUomSales").editableSelect();
      $("#sltUomPurchases").editableSelect();
      $("#sltinventoryacount").editableSelect();
      $("#sltCustomerType").editableSelect();
      $("#sltdepartment").editableSelect();
      $("#newProcessModal #edtCOGS").editableSelect();
      $("#newProcessModal #edtExpenseAccount").editableSelect();
      $("#newProcessModal #edtOverheadCOGS").editableSelect();
      $("#newProcessModal #edtOverheadExpenseAccount").editableSelect();
      $("#newProcessModal #edtWastage").editableSelect();

      $("#sltCustomerType").editableSelect().on("click.editable-select", editableService.clickCustomerType);

      $("#slttaxcodepurchase").editableSelect().on("click.editable-select", editableService.clickTaxCodePurchase);

      $("#sltinventoryacount").editableSelect().on("click.editable-select", editableService.clickInventoryAccount);

      $("#sltcogsaccount").editableSelect().on("click.editable-select", editableService.clickCogsAccount);

      $("#sltsalesacount").editableSelect().on("click.editable-select", editableService.clickSalesAccount);

      $("#sltUomSales").editableSelect().on("click.editable-select", editableService.clickUomSales);

      $("#slttaxcodesales").editableSelect().on("click.editable-select", editableService.clickTaxCodeSales);

      $("#newProcessModal #edtCOGS").editableSelect().on("click.editable-select", editableService.clickEdtCogsAccount);

      $("#sltUomPurchases").editableSelect().on("click.editable-select", editableService.clickUomPurchase)

      $("#sltdepartment").editableSelect().on("click.editable-select", editableService.clickDepartment)

      $("#newProcessModal #edtExpenseAccount")
        .editableSelect()
        .on("click.editable-select", editableService.clickEdtExpenseAccount);

      $("#newProcessModal #edtOverheadCOGS")
        .editableSelect()
        .on("click.editable-select", editableService.clickEdtOverheadCogsAccount);

      $("#newProcessModal #edtOverheadExpenseAccount")
        .editableSelect()
        .on("click.editable-select", editableService.clickEdtOverheadExpenseAccount);

      $("#newProcessModal #edtWastage")
        .editableSelect()
        .on("click.editable-select", editableService.clickEdtWastageAccount);

      //On Click Account List
      $(document).on("click", "#tblTaxRate tbody tr", function (e) {
        var table = $(this);
        let lineTaxCode = table.find(".taxName").text();
        taxSelected = $("#taxSelected").val();
        if (taxSelected == "sales") {
          $("#slttaxcodesales").val(lineTaxCode);

          let utilityService = new UtilityService();
          let taxcodeList = templateObject.taxraterecords.get();
          var taxRate = lineTaxCode;
          var taxrateamount = 0;
          if (taxcodeList) {
            for (var i = 0; i < taxcodeList.length; i++) {
              if (taxcodeList[i].codename == taxRate) {
                taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100 || 0;
              }
            }
          }

          let sellPrice = $("#edtsellqty1price").val() || 0;
          let sellPriceInc = 0;

          if (!isNaN(sellPrice)) {
            $("#edtsellqty1price").val(utilityService.modifynegativeCurrencyFormat(sellPrice));
          } else {
            sellPrice = parseFloat(sellPrice.replace(/[^0-9.-]+/g, ""));
            $("#edtsellqty1price").val(utilityService.modifynegativeCurrencyFormat(sellPrice));
          }

          var taxTotal = parseFloat(sellPrice) * parseFloat(taxrateamount);
          if (taxrateamount != 0) {
            sellPriceInc = parseFloat(sellPrice) + taxTotal;
          } else {
            sellPriceInc = parseFloat(sellPrice);
          }
          if (!isNaN(sellPriceInc)) {
            $("#edtsellqty1priceInc").val(utilityService.modifynegativeCurrencyFormat(sellPriceInc));
          }

          $(".itemExtraSellRow").each(function () {
            var lineID = this.id;
            let tdclientType = $("#" + lineID + " .customerTypeSelect").val();
            if (tdclientType == "Default") {
              $("#" + lineID + " .edtDiscount").val(0);
              $("#" + lineID + " .edtPriceEx").val(utilityService.modifynegativeCurrencyFormat(sellPrice));
            }
          });
        } else if (taxSelected == "purchase") {
          $("#slttaxcodepurchase").val(lineTaxCode);
          let utilityService = new UtilityService();
          let costPrice = $("#edtbuyqty1cost").val() || 0;
          let taxcodeList = templateObject.taxraterecords.get();
          var taxRate = lineTaxCode;
          var taxrateamount = 0;
          if (taxcodeList) {
            for (var i = 0; i < taxcodeList.length; i++) {
              if (taxcodeList[i].codename == taxRate) {
                taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100;
              }
            }
          }

          let costPriceInc = 0;

          if (!isNaN(costPrice)) {
            $("#edtbuyqty1cost").val(utilityService.modifynegativeCurrencyFormat(costPrice));
          } else {
            costPrice =
              parseFloat(
                $("#edtbuyqty1cost")
                  .val()
                  .replace(/[^0-9.-]+/g, "")
              ) || 0;
            $("#edtbuyqty1cost").val(utilityService.modifynegativeCurrencyFormat(costPrice));
          }
          var taxTotal = parseFloat(costPrice) * parseFloat(taxrateamount);
          costPriceInc = parseFloat(costPrice) + taxTotal;
          if (!isNaN(costPriceInc)) {
            $("#edtbuyqty1costInc").val(utilityService.modifynegativeCurrencyFormat(costPriceInc));
          }
        }
        $("#taxRateListModal").modal("toggle");
      });

      $(document).on("click", ".tblAccountListPop tbody tr", function (e) {
        var table = $(this);
        let accountsName = table.find(".colAccountName").text();
        accSelected = $("#accSelected").val();
        if (accSelected == "cogs") {
          $("#sltcogsaccount").val(accountsName);
        } else if (accSelected == "sales") {
          $("#sltsalesacount").val(accountsName);
        } else if (accSelected == "inventory") {
          $("#sltinventoryacount").val(accountsName);
        } else if (accSelected == "bom-all") {
          $("#newProcessModal #edtCOGS").val(accountsName);
        } else if (accSelected == "bom-expense") {
          $("#newProcessModal #edtExpenseAccount").val(accountsName);
        } else if (accSelected == "bom-overhead-all") {
          $("#newProcessModal #edtOverheadCOGS").val(accountsName);
        } else if (accSelected == "bom-overhead-expense") {
          $("#newProcessModal #edtOverheadExpenseAccount").val(accountsName);
        } else if (accSelected == "bom-inventory") {
          $("#newProcessModal #edtWastage").val(accountsName);
        }
        $("#accountListModal").modal("toggle");
      });

      $(document).on("click", "#tblClienttypeList tbody tr", function (e) {
        var table = $(this);
        let custTypeName = table.find(".colTypeName").text();
        $($(".sltCustomerType")[customerLineIndex]).val(custTypeName);
        $("#customerTypeListModal").modal("toggle");
      });

      $(document).on("click", "#tblUOMList tbody tr", function (e) {
        let table = $(this);
        let uomName = table.find(".colUOMName").text();
        $($(".saleRowWrapper")[currentLineIndex]).find('input.sltUomSales').val(uomName)
        $($(".purchaseRowWrapper")[currentLineIndex]).find('input.sltUomPurchases').val(uomName)
        $("#UOMListModal").modal("toggle");
      });

      $(document).on("click", "#tblWeightUnit tbody tr", function (e) {
        let table = $(this);
        let unit = table.find(".colWeightUnit").text();
        $($(".coldelivery")[1]).find('input.sltWeightUnit').val(unit)
        $("#weightUnitsModal").modal("toggle");
      });

      $(document).on("click", "#tblVolumeUnit tbody tr", function (e) {
        let table = $(this);
        let unit = table.find(".colVolumeUnit").text();
        $($(".coldelivery")[3]).find('input.sltVolumeUnit').val(unit)
        $("#volumeUnitsModal").modal("toggle");
      });

      $(document).on("click", "#tblDepartmentCheckbox tbody tr", function (e) {
        let table = $(this);
        let deptName = table.find(".colDeptName").text();
        templateObject.bindept.set(deptName);
        $('#sltdepartment').val(deptName);
        $("#myModalDepartment").modal("hide");
      });

      $(document).on('click', 'div.saleRowWrapper', function() {
        currentLineIndex = $('div.saleRowWrapper').index(this)
      })

      $(document).on('click', 'div.purchaseRowWrapper', function() {
        currentLineIndex = $('div.purchaseRowWrapper').index(this)
      })

      $(document).on('click', 'div.itemExtraSellRow', function() {
        customerLineIndex = $('div.itemExtraSellRow').index(this)
      })
      $('#sltbinlocation').on('change', function (e) {
        var location = $("#sltbinlocation option:selected").val();
        templateObject.binlocation.set(location);
      });
  };

  templateObject.getAllBOMProducts = function () {
    getVS1Data("TProcTree")
      .then(function (dataObject) {
        if (dataObject.length == 0) {
          productService.getAllBOMProducts(initialBaseDataLoad, 0).then(function (data) {
            templateObject.bomProducts.set(data.tproctree);
            addVS1Data("TProcTree", JSON.stringify(data)).then(function () {});
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          templateObject.bomProducts.set(data.tproctree);
        }
      })
      .catch(function (e) {
        productService.getAllBOMProducts(initialBaseDataLoad, 0).then(function (data) {
          templateObject.bomProducts.set(data.tproctree);
          addVS1Data("TProcTree", JSON.stringify(data)).then(function () {});
        });
      });
  };

  templateObject.getAllBOMProducts();

  templateObject.getAllLastInvDatas = function () {
    productService
      .getAllProductList1()
      .then(function (data) {
        let salestaxcode = "";
        let purchasetaxcode = "";

        if (data.tproduct.length > 0) {
          let lastProduct = data.tproduct[data.tproduct.length - 1];
          salestaxcode = lastProduct.TaxCodeSales;
          purchasetaxcode = lastProduct.TaxCodePurchase;
          setTimeout(function () {
            $("#slttaxcodesales").val(loggedTaxCodeSalesInc);
            $("#slttaxcodepurchase").val(loggedTaxCodePurchaseInc);
          }, 500);
        }
      })
      .catch(function (err) {});
  };

  // tempObj.getAllAccountss();

  templateObject.getAccountNames = function () {
    getVS1Data("TAccountVS1")
      .then(function (dataObject) {
        if (dataObject.length == 0) {
          productService.getAccountName().then(function (data) {
            let productData = templateObject.records.get();
            for (let i in data.taccountvs1) {
              let accountnamerecordObj = {
                accountname: data.taccountvs1[i].AccountName || " ",
              };
              if (data.taccountvs1[i].AccountTypeName == "COGS") {
                coggsaccountrecords.push(accountnamerecordObj);
                templateObject.coggsaccountrecords.set(coggsaccountrecords);
              }

              if (data.taccountvs1[i].AccountTypeName == "INC") {
                salesaccountrecords.push(accountnamerecordObj);
                templateObject.salesaccountrecords.set(salesaccountrecords);
              }

              if (data.taccountvs1[i].AccountTypeName == "OCASSET") {
                inventoryaccountrecords.push(accountnamerecordObj);
                templateObject.inventoryaccountrecords.set(inventoryaccountrecords);
              }
            }
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.taccountvs1;
          let productData = templateObject.records.get();
          for (let i in useData) {
            let accountnamerecordObj = {
              accountname: useData[i].fields.AccountName || " ",
            };
            if (useData[i].fields.AccountTypeName == "COGS") {
              coggsaccountrecords.push(accountnamerecordObj);
              templateObject.coggsaccountrecords.set(coggsaccountrecords);
            }

            if (useData[i].fields.AccountTypeName == "INC") {
              salesaccountrecords.push(accountnamerecordObj);
              templateObject.salesaccountrecords.set(salesaccountrecords);
            }
            if (useData[i].fields.AccountTypeName == "OCASSET") {
              inventoryaccountrecords.push(accountnamerecordObj);
              templateObject.inventoryaccountrecords.set(inventoryaccountrecords);
            }
          }
        }
      })
      .catch(function (err) {
        productService.getAccountName().then(function (data) {
          let productData = templateObject.records.get();
          for (let i in data.taccountvs1) {
            let accountnamerecordObj = {
              accountname: data.taccountvs1[i].AccountName || " ",
            };
            if (data.taccountvs1[i].AccountTypeName == "COGS") {
              coggsaccountrecords.push(accountnamerecordObj);
              templateObject.coggsaccountrecords.set(coggsaccountrecords);
            }

            if (data.taccountvs1[i].AccountTypeName == "INC") {
              salesaccountrecords.push(accountnamerecordObj);
              templateObject.salesaccountrecords.set(salesaccountrecords);
            }

            if (data.taccountvs1[i].AccountTypeName == "OCASSET") {
              inventoryaccountrecords.push(accountnamerecordObj);
              templateObject.inventoryaccountrecords.set(inventoryaccountrecords);
            }
          }
        });
      });
  };

  templateObject.getAllTaxCodes = function () {
    getVS1Data("TTaxcodeVS1")
      .then(function (dataObject) {
        if (dataObject.length == 0) {
          productService.getTaxCodesVS1().then(function (data) {
            for (let i = 0; i < data.ttaxcodevs1.length; i++) {
              let taxcoderecordObj = {
                codename: data.ttaxcodevs1[i].CodeName || " ",
                coderate: data.ttaxcodevs1[i].Rate || 0,
              };

              taxCodesList.push(taxcoderecordObj);
            }
            templateObject.taxraterecords.set(taxCodesList);
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.ttaxcodevs1;
          for (let i = 0; i < useData.length; i++) {
            let taxcoderecordObj = {
              codename: useData[i].CodeName || " ",
              coderate: useData[i].Rate || 0,
            };

            taxCodesList.push(taxcoderecordObj);
          }
          templateObject.taxraterecords.set(taxCodesList);
        }
      })
      .catch(function (err) {
        productService.getTaxCodesVS1().then(function (data) {
          for (let i = 0; i < data.ttaxcodevs1.length; i++) {
            let taxcoderecordObj = {
              codename: data.ttaxcodevs1[i].CodeName || " ",
              coderate: data.ttaxcodevs1[i].Rate || 0,
            };

            taxCodesList.push(taxcoderecordObj);
          }
          templateObject.taxraterecords.set(taxCodesList);
        });
      });
  };

  templateObject.getAllTaxCodes = function () {
    getVS1Data("TTaxcodeVS1")
      .then(function (dataObject) {
        if (dataObject.length == 0) {
          productService.getTaxCodesVS1().then(function (data) {
            let records = [];
            let inventoryData = [];
            for (let i = 0; i < data.ttaxcodevs1.length; i++) {
              let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
              var dataList = [
                data.ttaxcodevs1[i].Id || "",
                data.ttaxcodevs1[i].CodeName || "",
                data.ttaxcodevs1[i].Description || "-",
                taxRate || 0,
              ];

              let taxcoderecordObj = {
                codename: data.ttaxcodevs1[i].CodeName || " ",
                coderate: taxRate || " ",
              };

              taxCodesList.push(taxcoderecordObj);

              splashArrayTaxRateList.push(dataList);
            }
            templateObject.taxraterecords.set(taxCodesList);

            if (splashArrayTaxRateList) {
              $("#tblTaxRate").DataTable({
                data: splashArrayTaxRateList,
                sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                columnDefs: [
                  {
                    orderable: false,
                    targets: 0,
                  },
                  {
                    className: "taxName",
                    targets: [1],
                  },
                  {
                    className: "taxDesc",
                    targets: [2],
                  },
                  {
                    className: "taxRate text-right",
                    targets: [3],
                  },
                ],
                select: true,
                destroy: true,
                colReorder: true,

                pageLength: initialDatatableLoad,
                lengthMenu: [
                  [initialDatatableLoad, -1],
                  [initialDatatableLoad, "All"],
                ],
                info: true,
                responsive: true,
                fnDrawCallback: function (oSettings) {
                  // $('.dataTables_paginate').css('display', 'none');
                },
                language: { search: "", searchPlaceholder: "Search List..." },
                fnInitComplete: function () {
                  $(
                    "<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
                  ).insertAfter("#tblTaxRate_filter");
                  $(
                    "<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                  ).insertAfter("#tblTaxRate_filter");
                },
              });
            }
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.ttaxcodevs1;
          let records = [];
          let inventoryData = [];
          for (let i = 0; i < useData.length; i++) {
            let taxRate = (useData[i].Rate * 100).toFixed(2);
            var dataList = [
              useData[i].Id || "",
              useData[i].CodeName || "",
              useData[i].Description || "-",
              taxRate || 0,
            ];

            let taxcoderecordObj = {
              codename: useData[i].CodeName || " ",
              coderate: taxRate || " ",
            };

            taxCodesList.push(taxcoderecordObj);

            splashArrayTaxRateList.push(dataList);
          }
          templateObject.taxraterecords.set(taxCodesList);
          if (splashArrayTaxRateList) {
            $("#tblTaxRate").DataTable({
              data: splashArrayTaxRateList,
              sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",

              columnDefs: [
                {
                  orderable: false,
                  targets: 0,
                },
                {
                  className: "taxName",
                  targets: [1],
                },
                {
                  className: "taxDesc",
                  targets: [2],
                },
                {
                  className: "taxRate text-right",
                  targets: [3],
                },
              ],
              select: true,
              destroy: true,
              colReorder: true,

              pageLength: initialDatatableLoad,
              lengthMenu: [
                [initialDatatableLoad, -1],
                [initialDatatableLoad, "All"],
              ],
              info: true,
              responsive: true,
              fnDrawCallback: function (oSettings) {
                // $('.dataTables_paginate').css('display', 'none');
              },
              language: { search: "", searchPlaceholder: "Search List..." },
              fnInitComplete: function () {
                $(
                  "<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
                ).insertAfter("#tblTaxRate_filter");
                $(
                  "<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                ).insertAfter("#tblTaxRate_filter");
              },
            });
          }
        }
      })
      .catch(function (err) {
        productService.getTaxCodesVS1().then(function (data) {
          let records = [];
          let inventoryData = [];
          for (let i = 0; i < data.ttaxcodevs1.length; i++) {
            let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
            var dataList = [
              data.ttaxcodevs1[i].Id || "",
              data.ttaxcodevs1[i].CodeName || "",
              data.ttaxcodevs1[i].Description || "-",
              taxRate || 0,
            ];

            let taxcoderecordObj = {
              codename: data.ttaxcodevs1[i].CodeName || " ",
              coderate: taxRate || " ",
            };

            taxCodesList.push(taxcoderecordObj);

            splashArrayTaxRateList.push(dataList);
          }
          templateObject.taxraterecords.set(taxCodesList);

          if (splashArrayTaxRateList) {
            $("#tblTaxRate").DataTable({
              data: splashArrayTaxRateList,
              sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",

              columnDefs: [
                {
                  orderable: false,
                  targets: 0,
                },
                {
                  className: "taxName",
                  targets: [1],
                },
                {
                  className: "taxDesc",
                  targets: [2],
                },
                {
                  className: "taxRate text-right",
                  targets: [3],
                },
              ],
              select: true,
              destroy: true,
              colReorder: true,

              pageLength: initialDatatableLoad,
              lengthMenu: [
                [initialDatatableLoad, -1],
                [initialDatatableLoad, "All"],
              ],
              info: true,
              responsive: true,
              fnDrawCallback: function (oSettings) {
                // $('.dataTables_paginate').css('display', 'none');
              },
              language: { search: "", searchPlaceholder: "Search List..." },
              fnInitComplete: function () {
                $(
                  "<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
                ).insertAfter("#tblTaxRate_filter");
                $(
                  "<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                ).insertAfter("#tblTaxRate_filter");
              },
            });
          }
        });
      });
  };

  templateObject.getDepartments = function () {
    getVS1Data("TDeptClass")
      .then(function (dataObject) {
        if (dataObject.length == 0) {
          productService.getDepartment().then(function (data) {
            for (let i in data.tdeptclass) {
              let deptrecordObj = {
                department: data.tdeptclass[i].DeptClassName || " ",
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
              department: useData[i].DeptClassName || " ",
            };

            deptrecords.push(deptrecordObj);
            templateObject.deptrecords.set(deptrecords);
          }
        }
      })
      .catch(function (err) {
        productService.getDepartment().then(function (data) {
          for (let i in data.tdeptclass) {
            let deptrecordObj = {
              department: data.tdeptclass[i].DeptClassName || " ",
            };

            deptrecords.push(deptrecordObj);
            templateObject.deptrecords.set(deptrecords);
          }
        });
      });
  };

  templateObject.getBinLocations = function() {
        getVS1Data('TProductBin').then(function(dataObject) {
            if (dataObject.length == 0) {
                productService.getBins().then(function(data) {
                    for (let i in data.tproductbin) {

                        let binrecordObj = {
                            binnumber: data.tproductbin[i].BinNumber || ' ',
                            binlocation: data.tproductbin[i].BinLocation || '',
                            binclass: data.tproductbin[i].BinClassName || ' ',
                        };

                        binrecords.push(binrecordObj);
                        templateObject.binrecords.set(binrecords);

                    }
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tproductbin;
                for (let i in useData) {

                    let binrecordObj = {
                        binnumber: useData[i].BinNumber || ' ',
                        binlocation: useData[i].BinLocation || '',
                        binclass: useData[i].BinClassName || ' ',
                    };

                    binrecords.push(binrecordObj);
                    templateObject.binrecords.set(binrecords);
                }


            }
        }).catch(function(err) {
            productService.getBins().then(function(data) {
                for (let i in data.tproductbins) {

                    let binrecordObj = {
                        binnumber: data.tproductbins[i].BinNumber || ' ',
                        binlocation: data.tproductbins[i].BinLocation || '',
                        binclass: data.tproductbins[i].BinClassName || ' ',
                    };

                    binrecords.push(binrecordObj);
                    templateObject.binrecords.set(binrecords);

                }
            });
        });

  };

  templateObject.getClientTypeData = function() {
        getVS1Data('TClientType').then(function(dataObject) {
            if (dataObject.length == 0) {
                productService.getClientTypeData().then((data) => {

                    for (let i = 0; i < data.tclienttype.length; i++) {
                        clientType.push(data.tclienttype[i].fields.TypeName);
                    }
                    //clientType = _.sortBy(clientType);
                    templateObject.clienttypeList.set(clientType);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tclienttype;
                for (let i = 0; i < useData.length; i++) {
                    clientType.push(useData[i].fields.TypeName)
                }
                //clientType = _.sortBy(clientType);
                templateObject.clienttypeList.set(clientType);
                //$('.customerTypeSelect option:first').prop('selected', false);
                $(".customerTypeSelect").attr('selectedIndex', 0);

            }
        }).catch(function(err) {
            productService.getClientTypeData().then((data) => {

                for (let i = 0; i < data.tclienttype.length; i++) {

                    clientType.push(data.tclienttype[i].fields.TypeName)
                }
                //clientType = _.sortBy(clientType);
                templateObject.clienttypeList.set(clientType);
            });
        });

  };

  templateObject.getCustomfields = function () {
    let custFields = [];
    let listType = 'ltProduct';

    let customFieldCount = 3; // customfield tempcode
    let customData = {};

    getVS1Data("TCustomFieldList").then(function (dataObject) {
      if (dataObject.length == 0) {
        sideBarService.getAllCustomFields().then(function (data) {
          for (let x = 0; x < data.tcustomfieldlist.length; x++) {
            if (data.tcustomfieldlist[x].fields.ListType == listType) {

                let customData = setCustomfields(data.tcustomerfieldlist[x].fields)
                custFields.push(customData);
            }
          }
          if(custFields.length > customFieldCount) {
            custFields.splice(0, custFields.length-3);
          }
          if (custFields.length < customFieldCount) {
            custFields = setCustFieldsForReminder(custFields, customFieldCount)
          }

          custFields.map((item, index)=> {
            item.fieldIndex = index+1
          })
          templateObject.custfields.set(custFields);

        });
      }else{
        let data = JSON.parse(dataObject[0].data);
          for (let x = 0; x < data.tcustomfieldlist.length; x++) {
            if (data.tcustomfieldlist[x].fields.ListType == listType) {

              customData = setCustomfields(data.tcustomfieldlist[x].fields)
              custFields.push(customData);
            }
          }
          if(custFields.length > customFieldCount) {
            custFields.splice(0, custFields.length-3);
          }
          if (custFields.length < customFieldCount) {
            custFields = setCustFieldsForReminder(custFields, customFieldCount)
          }
          custFields.map((item, index)=> {
            item.fieldIndex = index+1
          })
          templateObject.custfields.set(custFields);
      }
    }).catch(function(err) {
        sideBarService.getAllCustomFields().then(function (data) {
            for (let x = 0; x < data.tcustomfieldlist.length; x++) {
              if (data.tcustomfieldlist[x].fields.ListType == listType) {

                  let customData = setCustomfields(data.tcustomerfieldlist[x].fields)
                  custFields.push(customData);
              }
            }
            if(custFields.length > customFieldCount) {
              custFields.splice(0, custFields.length-3);
            }
            if (custFields.length < customFieldCount) {
              custFields = setCustFieldsForReminder(custFields, customFieldCount)
            }

            custFields.map((item, index)=> {
              item.fieldIndex = index+1
            })
            templateObject.custfields.set(custFields);

          });
    })

    function setCustomfields(data) {
        let customData = {
            active: data.Active || false,
            id: parseInt(data.ID) || 0,
            custfieldlabel: data.Description || "",
            datatype: data.DataType || "",
            isempty: data.ISEmpty || false,
            iscombo: data.IsCombo || false,
            dropdown: data.Dropdown || null,
            displayType: data.DataType=='ftDateTime'?'Date': data.IsCombo? 'Dropdown': 'Text'
        }

        return customData
    }

    function setCustFieldsForReminder  (custFields, customFieldCount) {
        let remainder = customFieldCount - custFields.length;
        let getRemCustomFields = parseInt(custFields.length);
        let cloneCustFields = cloneDeep(custFields)
        // count = count + remainder;
        for (let r = 0; r < remainder; r++) {
          getRemCustomFields++;
          let customData = {
            active: false,
            id: "",
            custfieldlabel: "Custom Field " + getRemCustomFields,
            datatype: "",
            isempty: true,
            iscombo: false,
          };
          // count++;
          cloneCustFields.push(customData);
        }
        return cloneCustFields
    }

}

  setTimeout(function() {
    templateObject.getAccountNames();
    templateObject.getAllTaxCodes();
    templateObject.getDepartments();
    templateObject.getBinLocations();
    templateObject.bindept.set('Default');
    templateObject.bindeptid.set('1');



    templateObject.getCustomfields();


      //templateObject.getClientTypeData();
  }, 1000);

  let isInventory = localStorage.getItem("CloudInventoryModule");
  if (isInventory) {
    templateObject.includeInventory.set(true);
  }

  var url = FlowRouter.current().path;
  var getprod_id = url.split("?id=");
  var getprod_name = url.split("?prodname=");
  var currentProductID = FlowRouter.current().queryParams.id || templateObject.data.id;
  templateObject.productID.set(currentProductID);
  var currentProductName = FlowRouter.current().queryParams.prodname;
  let lineExtaSellItems = [];
  let lineExtaSellObj = {};

  if (FlowRouter.current().queryParams.id || templateObject.data.id) {
    currentProductID = parseInt(currentProductID);

    templateObject.getProductData = function () {
      getVS1Data("TProductVS1").then(function (dataObject) {
          if (dataObject.length == 0) {
            productService.getOneProductdata(currentProductID).then(function (data) {
                $(".fullScreenSpin").css("display", "none");

                // add to custom field
                // tempcode
                // setTimeout(function () {
                //   $('#edtSaleCustField1').val(data.CUSTFLD1);
                //   $('#edtSaleCustField2').val(data.CUSTFLD2);
                //   $('#edtSaleCustField3').val(data.CUSTFLD3);
                // }, 5500);

                let isBOMProduct = false;
                let bomProducts = templateObject.bomProducts.get();
                let bomIndex = bomProducts.findIndex((product) => {
                  return data.fields.ProductName == product.fields.Caption;
                });

                if (bomIndex > -1) {
                  isBOMProduct = true;
                  templateObject.bomStructure.set(bomProducts[bomIndex]);
                } else {
                  productService.getOneBOMProductByName(data.fields.ProductName).then(function (data) {
                    if (data.tproctree.length > -1) {
                      isBOMProduct = true;
                      templateObject.bomStructure.set(data.tproctree[0])
                    }
                  });
                }

                let lineItems = [];
                let lineItemObj = {};
                let currencySymbol = Currency;
                let totalquantity = 0;
                let productrecord = {
                  id: data.fields.ID,
                  productname: data.fields.ProductName,
                  lib: data.fields.ProductName,
                  productcode: data.fields.PRODUCTCODE,
                  productprintName: data.fields.ProductPrintName,
                  assetaccount: data.fields.AssetAccount,
                  buyqty1cost: utilityService.modifynegativeCurrencyFormat(data.fields.BuyQty1Cost),
                  buyqty1costinc: utilityService.modifynegativeCurrencyFormat(data.fields.BuyQty1CostInc),
                  cogsaccount: data.fields.CogsAccount,
                  taxcodepurchase: data.fields.TaxCodePurchase,
                  purchasedescription: data.fields.PurchaseDescription,
                  sellqty1price: utilityService.modifynegativeCurrencyFormat(data.fields.SellQty1Price),
                  sellqty1priceinc: utilityService.modifynegativeCurrencyFormat(data.fields.SellQty1PriceInc),
                  incomeaccount: data.fields.IncomeAccount,
                  taxcodesales: data.fields.TaxCodeSales,
                  salesdescription: data.fields.SalesDescription,
                  active: data.fields.Active,
                  lockextrasell: data.fields.LockExtraSell,
                  customfield1: data.fields.CUSTFLD1,
                  customfield2: data.fields.CUSTFLD2,
                  totalqtyinstock: data.fields.TotalQtyInStock,
                  barcode: data.fields.BARCODE,
                  // data.TotalQtyInStock,
                  totalqtyonorder: data.fields.TotalQtyOnOrder,
                  productclass :data.ProductClass[0].fields,
                  isManufactured: isBOMProduct,
                };

                templateObject.isManufactured.set(productrecord.isManufactured);

                setTimeout(async function () {
                  await templateObject.setEditableSelect();
                  $("#sltsalesacount").val(data.fields.IncomeAccount);
                  $("#sltcogsaccount").val(data.fields.CogsAccount);
                  $("#sltinventoryacount").val(data.fields.AssetAccount);
                  $("#sltUomSales").val(defaultUOM);
                  $("#slttaxcodesales").val(data.fields.TaxCodeSales);
                  $("#slttaxcodepurchase").val(data.fields.TaxCodePurchase);

                  // Feature/ser-lot-tracking: Initializing serial/lot number settings
                  if (data.fields.SNTracking) $("#chkSNTrack").prop("checked", true);
                  if (data.fields.Batch) $("#chkLotTrack").prop("checked", true);
                  if (data.fields.CUSTFLD13 === "true") $("#chkAddSN").prop("checked", true);

                  if (data.fields.CUSTFLD14 == "true") {
                    $(".lblPriceEx").addClass("hiddenColumn");
                    $(".lblPriceEx").removeClass("showColumn");

                    $(".lblPriceInc").addClass("showColumn");
                    $(".lblPriceInc").removeClass("hiddenColumn");

                    $("#edtsellqty1priceInc").removeClass("hiddenColumn");
                    $("#edtsellqty1priceInc").addClass("showColumn");

                    $("#edtsellqty1price").addClass("hiddenColumn");
                    $("#edtsellqty1price").removeClass("showColumn");
                    $(".lblPriceCheckStatus").val("true");
                  } else if (data.fields.CUSTFLD14 == "false") {
                    $(".lblPriceInc").addClass("hiddenColumn");
                    $(".lblPriceInc").removeClass("showColumn");

                    $(".lblPriceEx").addClass("showColumn");
                    $(".lblPriceEx").removeClass("hiddenColumn");

                    $("#edtsellqty1priceInc").addClass("hiddenColumn");
                    $("#edtsellqty1priceInc").removeClass("showColumn");

                    $("#edtsellqty1price").removeClass("hiddenColumn");
                    $("#edtsellqty1price").addClass("showColumn");
                    $(".lblPriceCheckStatus").val("false");
                  }
                  if (data.fields.CUSTFLD15 == "true") {
                    $(".lblCostEx").addClass("hiddenColumn");
                    $(".lblCostEx").removeClass("showColumn");

                    $(".lblCostInc").addClass("showColumn");
                    $(".lblCostInc").removeClass("hiddenColumn");

                    $("#edtbuyqty1costInc").removeClass("hiddenColumn");
                    $("#edtbuyqty1costInc").addClass("showColumn");

                    $("#edtbuyqty1cost").addClass("hiddenColumn");
                    $("#edtbuyqty1cost").removeClass("showColumn");

                    $(".lblCostCheckStatus").val("true");
                  } else if (data.fields.CUSTFLD15 == "false") {
                    $(".lblCostInc").addClass("hiddenColumn");
                    $(".lblCostInc").removeClass("showColumn");

                    $(".lblCostEx").addClass("showColumn");
                    $(".lblCostEx").removeClass("hiddenColumn");

                    $("#edtbuyqty1costInc").addClass("hiddenColumn");
                    $("#edtbuyqty1costInc").removeClass("showColumn");

                    $("#edtbuyqty1cost").removeClass("hiddenColumn");
                    $("#edtbuyqty1cost").addClass("showColumn");
                    $(".lblCostCheckStatus").val("false");
                  }
                }, 1000);

                if (data.fields.ExtraSellPrice == null) {
                  lineExtaSellObj = {
                    lineID: Random.id(),
                    clienttype: "",
                    discount: "",
                    datefrom: "",
                    dateto: "",
                    price: 0,
                  };
                  lineExtaSellItems.push(lineExtaSellObj);
                  templateObject.productExtraSell.set(lineExtaSellItems);
                } else {
                  templateObject.isExtraSellChecked.set(true);
                  for (let e = 0; e < data.ExtraSellPrice.length; e++) {
                    lineExtaSellObj = {
                      lineID: Random.id(),
                      clienttype: data.ExtraSellPrice[e].fields.ClientTypeName || "",
                      discount: data.ExtraSellPrice[e].fields.QtyPercent1 || 0,
                      datefrom: data.ExtraSellPrice[e].fields.DateFrom || "",
                      dateto: data.ExtraSellPrice[e].fields.DateTo || "",
                      price:
                        utilityService.modifynegativeCurrencyFormat(data.ExtraSellPrice[e].fields.Price1) || 0,
                    };
                    lineExtaSellItems.push(lineExtaSellObj);
                  }
                  templateObject.productExtraSell.set(lineExtaSellItems);
                }

                let itrackItem = data.LockExtraSell;
                if (itrackItem == true) {
                  templateObject.isTrackChecked.set(true);
                } else {
                  templateObject.isTrackChecked.set(false);
                }
                if (data.ProductType == "INV") {
                  templateObject.isTrackChecked.set(true);
                } else {
                  templateObject.isTrackChecked.set(false);
                }
                $("#sltsalesacount").val(data.IncomeAccount);
                $("#sltcogsaccount").val(data.CogsAccount);

                templateObject.records.set(productrecord);
              })
              .catch(function (err) {
                $(".fullScreenSpin").css("display", "none");
              });
          } else {
            let data = JSON.parse(dataObject[0].data);
            let useData = data.tproductvs1;
            var added = false;

            for (let i = 0; i < useData.length; i++) {
              if (parseInt(useData[i].fields.ID) === currentProductID) {
                // add to custom field
                // tempcode
                // setTimeout(function () {
                //   $('#edtSaleCustField1').val(useData[i].fields.CUSTFLD1);
                //   $('#edtSaleCustField2').val(useData[i].fields.CUSTFLD2);
                //   $('#edtSaleCustField3').val(useData[i].fields.CUSTFLD3);
                // }, 5500);

                added = true;
                $(".fullScreenSpin").css("display", "none");
                let lineItems = [];
                let lineItemObj = {};
                let currencySymbol = Currency;
                let totalquantity = 0;

                let isBOMProduct = false;
                let bomProducts = templateObject.bomProducts.get();
                let bomIndex = bomProducts.findIndex((product) => {
                  return useData[i].fields.ProductName == product.Caption;
                });

                if (bomIndex > -1) {
                  isBOMProduct = true;
                  templateObject.bomStructure.set(bomProducts[bomIndex])
                } else {
                  productService.getOneBOMProductByName(useData[i].fields.ProductName).then(function (data) {
                    if (data.tproctree.length > -1) {
                      isBOMProduct = true;
                      templateObject.bomStructure.set(data.tproctree[0])
                    }
                  });
                }

                let productrecord = {
                  id: useData[i].fields.ID,
                  productname: useData[i].fields.ProductName,
                  lib: useData[i].fields.ProductName,
                //  productcode: useData[i].PRODUCTCODE,
                  productcode: useData[i].fields.ProductName,
                  productprintName: useData[i].fields.ProductPrintName,
                  assetaccount:  useData[i].fields.AssetAccount,
                  buyqty1cost: utilityService.modifynegativeCurrencyFormat(useData[i].fields.BuyQty1Cost),
                  buyqty1costinc: utilityService.modifynegativeCurrencyFormat(useData[i].fields.BuyQty1CostInc),
                  cogsaccount: useData[i].fields.CogsAccount,
                  taxcodepurchase: useData[i].fields.TaxCodePurchase || "",
                  purchasedescription: useData[i].fields.PurchaseDescription || "",
                  sellqty1price: utilityService.modifynegativeCurrencyFormat(useData[i].fields.SellQty1Price),
                  sellqty1priceinc: utilityService.modifynegativeCurrencyFormat(useData[i].fields.SellQty1PriceInc),
                  incomeaccount: useData[i].fields.IncomeAccount,
                  taxcodesales: useData[i].fields.TaxCodeSales || "",
                  salesdescription: useData[i].fields.SalesDescription || "",
                  active: useData[i].fields.Active || false,
                  lockextrasell: useData[i].fields.LockExtraSell,
                  customfield1: useData[i].fields.CUSTFLD1 || "",
                  customfield2: useData[i].fields.CUSTFLD2 || "",
                  totalqtyinstock: useData[i].fields.TotalQtyInStock || "",
                  barcode: useData[i].fields.BARCODE || "",
                  // useData[i].fields.TotalQtyInStock,
                  totalqtyonorder: useData[i].fields.TotalStockQty || "",
                  //productclass :lineItems,
                  productclass : "",
                 // isManufactured: useData[i].fields.IsManufactured,
                  isManufactured: isBOMProduct,

                };

                templateObject.isManufactured.set(productrecord.isManufactured);

                setTimeout(async function () {
                  await templateObject.setEditableSelect();
                  $("#sltsalesacount").val(useData[i].IncomeAccount);
                  $("#sltcogsaccount").val(useData[i].CogsAccount);
                  $("#sltinventoryacount").val(useData[i].AssetAccount);
                  $("#sltUomSales").val(defaultUOM);
                  $("#slttaxcodesales").val(useData[i].TaxCodeSales);
                  $("#slttaxcodepurchase").val(useData[i].TaxCodePurchase);
                  $("#sltdepartment").val(useData[i].ProductClass[0].fields.DeptName);
                  $("#sltbinnumber").val(useData[i].ProductClass[0].fields.DefaultbinNumber);
                  $("#sltbinlocation").val(useData[i].ProductClass[0].fields.DefaultbinLocation);

                  templateObject.bindept.set(useData[i].ProductClass[0].fields.DeptName);
                  templateObject.binnumber.set(useData[i].ProductClass[0].fields.DefaultbinNumber);
                  templateObject.binlocation.set(useData[i].ProductClass[0].fields.DefaultbinLocation);

                  DefaultBinNumber = useData[i].ProductClass[0].fields.DefaultbinNumber;

                  // $(#sltbinnumber).val(useData[i].fields.ProductClass[0].fields.DefaultBinNumber);
                  // // Feature/ser-lot-tracking: Initializing serial/lot number settings

                  if (useData[i].fields.SNTracking) $("#chkSNTrack").prop("checked", true);
                  if (useData[i].fields.Batch) $("#chkLotTrack").prop("checked", true);
                  if (useData[i].fields.CUSTFLD13 === "true") $("#chkAddSN").prop("checked", true);

                  if (useData[i].fields.CUSTFLD14 == "true") {
                    $(".lblPriceEx").addClass("hiddenColumn");
                    $(".lblPriceEx").removeClass("showColumn");

                    $(".lblPriceInc").addClass("showColumn");
                    $(".lblPriceInc").removeClass("hiddenColumn");

                    $("#edtsellqty1priceInc").removeClass("hiddenColumn");
                    $("#edtsellqty1priceInc").addClass("showColumn");

                    $("#edtsellqty1price").addClass("hiddenColumn");
                    $("#edtsellqty1price").removeClass("showColumn");
                    $(".lblPriceCheckStatus").val("true");
                  } else if (useData[i].fields.CUSTFLD14 == "false") {
                    $(".lblPriceInc").addClass("hiddenColumn");
                    $(".lblPriceInc").removeClass("showColumn");

                    $(".lblPriceEx").addClass("showColumn");
                    $(".lblPriceEx").removeClass("hiddenColumn");

                    $("#edtsellqty1priceInc").addClass("hiddenColumn");
                    $("#edtsellqty1priceInc").removeClass("showColumn");

                    $("#edtsellqty1price").removeClass("hiddenColumn");
                    $("#edtsellqty1price").addClass("showColumn");
                    $(".lblPriceCheckStatus").val("false");
                  }
                  if (useData[i].fields.CUSTFLD15 == "true") {
                    $(".lblCostEx").addClass("hiddenColumn");
                    $(".lblCostEx").removeClass("showColumn");

                    $(".lblCostInc").addClass("showColumn");
                    $(".lblCostInc").removeClass("hiddenColumn");

                    $("#edtbuyqty1costInc").removeClass("hiddenColumn");
                    $("#edtbuyqty1costInc").addClass("showColumn");

                    $("#edtbuyqty1cost").addClass("hiddenColumn");
                    $("#edtbuyqty1cost").removeClass("showColumn");

                    $(".lblCostCheckStatus").val("true");
                  } else if (useData[i].fields.CUSTFLD15 == "false") {
                    $(".lblCostInc").addClass("hiddenColumn");
                    $(".lblCostInc").removeClass("showColumn");

                    $(".lblCostEx").addClass("showColumn");
                    $(".lblCostEx").removeClass("hiddenColumn");

                    $("#edtbuyqty1costInc").addClass("hiddenColumn");
                    $("#edtbuyqty1costInc").removeClass("showColumn");

                    $("#edtbuyqty1cost").removeClass("hiddenColumn");
                    $("#edtbuyqty1cost").addClass("showColumn");
                    $(".lblCostCheckStatus").val("false");
                  }
                }, 1000);
                // if (useData[i].ExtraSellPrice == null) {
                //   lineExtaSellObj = {
                //     lineID: Random.id(),
                //     clienttype: "",
                //     discount: "",
                //     datefrom: "",
                //     dateto: "",
                //     price: 0,
                //   };
                //   lineExtaSellItems.push(lineExtaSellObj);
                //   templateObject.productExtraSell.set(lineExtaSellItems);
                // } else {
                //   templateObject.isExtraSellChecked.set(true);
                //   for (let e = 0; e < useData[i].ExtraSellPrice.length; e++) {
                //     lineExtaSellObj = {
                //       lineID: Random.id(),
                //       clienttype: useData[i].ExtraSellPrice[e].fields.ClientTypeName || "",
                //       discount: useData[i].ExtraSellPrice[e].fields.QtyPercent1 || 0,
                //       datefrom: useData[i].ExtraSellPrice[e].fields.DateFrom || "",
                //       dateto: useData[i].ExtraSellPrice[e].fields.DateTo || "",
                //       price:
                //         utilityService.modifynegativeCurrencyFormat(
                //           useData[i].ExtraSellPrice[e].fields.Price1
                //         ) || 0,
                //     };
                //     lineExtaSellItems.push(lineExtaSellObj);
                //   }
                //   templateObject.productExtraSell.set(lineExtaSellItems);
                // }
                // let itrackItem = useData[i].fields.LockExtraSell;
                // if (itrackItem == true) {
                //   templateObject.isTrackChecked.set(true);
                // } else {
                //   templateObject.isTrackChecked.set(false);
                // }

                if (useData[i].fields.ProductType == "INV") {
                  templateObject.isTrackChecked.set(true);
                } else {
                  templateObject.isTrackChecked.set(false);
                }
                // $("#sltsalesacount").val(useData[i].IncomeAccount);
                // $("#sltcogsaccount").val(useData[i].CogsAccount);

                templateObject.records.set(productrecord);
                templateObject.isShowBOMModal.set(true);
              }
            }
            if (!added) {
              productService
                .getOneProductdata(currentProductID)
                .then(function (data) {

                  $(".fullScreenSpin").css("display", "none");
                  let lineItems = [];
                  let lineItemObj = {};
                  let currencySymbol = Currency;
                  let totalquantity = 0;

                  let isBOMProduct = false;
                  let bomProducts = templateObject.bomProducts.get();
                  let bomIndex = bomProducts.findIndex((product) => {
                    return data.fields.ProductName == product.Caption;
                  });

                  if (bomIndex > -1) {
                    isBOMProduct = true;
                    templateObject.bomStructure.set(bomProducts[bomIndex])
                  } else {
                    productService.getOneBOMProductByName(data.fields.ProductName).then(function (data) {
                      if (data.tproctree.length > -1) {
                        isBOMProduct = true;
                        templateObject.bomStructure.set(data.tproctree[0])
                      }
                    });
                  }

                  let productrecord = {
                    id: data.fields.ID,
                    productname: data.fields.ProductName,
                    lib: data.fields.ProductName,
                  //  productcode: data.PRODUCTCODE,
                    productcode: data.fields.ProductName,
                    productprintName: data.fields.ProductPrintName,
                    assetaccount:  data.fields.AssetAccount,
                    buyqty1cost: utilityService.modifynegativeCurrencyFormat(data.fields.BuyQty1Cost),
                    buyqty1costinc: utilityService.modifynegativeCurrencyFormat(data.fields.BuyQty1CostInc),
                    cogsaccount: data.fields.CogsAccount,
                    taxcodepurchase: data.fields.TaxCodePurchase || "",
                    purchasedescription: data.fields.PurchaseDescription || "",
                    sellqty1price: utilityService.modifynegativeCurrencyFormat(data.fields.SellQty1Price),
                    sellqty1priceinc: utilityService.modifynegativeCurrencyFormat(data.fields.SellQty1PriceInc),
                    incomeaccount: data.fields.IncomeAccount,
                    taxcodesales: data.fields.TaxCodeSales || "",
                    salesdescription: data.fields.SalesDescription || "",
                    active: data.fields.Active || false,
                    lockextrasell: data.fields.LockExtraSell,
                    customfield1: data.fields.CUSTFLD1 || "",
                    customfield2: data.fields.CUSTFLD2 || "",
                    totalqtyinstock: data.fields.TotalQtyInStock || "",
                    barcode: data.fields.BARCODE || "",
                    // data.fields.TotalQtyInStock,
                    totalqtyonorder: data.fields.TotalStockQty || "",
                    //productclass :lineItems,
                    productclass : "",
                   // isManufactured: data.fields.IsManufactured,
                    isManufactured: isBOMProduct,

                  };

                  templateObject.isManufactured.set(productrecord.isManufactured);

                  setTimeout(async function () {
                    await templateObject.setEditableSelect();
                    $("#sltsalesacount").val(data.fields.IncomeAccount);
                    $("#sltcogsaccount").val(data.fields.CogsAccount);
                    $("#sltinventoryacount").val(data.fields.AssetAccount);
                    $("#sltUomSales").val(defaultUOM);
                    $("#slttaxcodesales").val(data.fields.TaxCodeSales);
                    $("#slttaxcodepurchase").val(data.fields.TaxCodePurchase);

                    // Feature/ser-lot-tracking: Initializing serial/lot number settings
                    if (data.fields.SNTracking) $("#chkSNTrack").prop("checked", true);
                    if (data.fields.Batch) $("#chkLotTrack").prop("checked", true);
                    if (data.fields.CUSTFLD13 === "true") $("#chkAddSN").prop("checked", true);

                    if (data.fields.CUSTFLD14 == "true") {
                      $(".lblPriceEx").addClass("hiddenColumn");
                      $(".lblPriceEx").removeClass("showColumn");

                      $(".lblPriceInc").addClass("showColumn");
                      $(".lblPriceInc").removeClass("hiddenColumn");

                      $("#edtsellqty1priceInc").removeClass("hiddenColumn");
                      $("#edtsellqty1priceInc").addClass("showColumn");

                      $("#edtsellqty1price").addClass("hiddenColumn");
                      $("#edtsellqty1price").removeClass("showColumn");
                      $(".lblPriceCheckStatus").val("true");
                    } else if (data.fields.CUSTFLD14 == "false") {
                      $(".lblPriceInc").addClass("hiddenColumn");
                      $(".lblPriceInc").removeClass("showColumn");

                      $(".lblPriceEx").addClass("showColumn");
                      $(".lblPriceEx").removeClass("hiddenColumn");

                      $("#edtsellqty1priceInc").addClass("hiddenColumn");
                      $("#edtsellqty1priceInc").removeClass("showColumn");

                      $("#edtsellqty1price").removeClass("hiddenColumn");
                      $("#edtsellqty1price").addClass("showColumn");
                      $(".lblPriceCheckStatus").val("false");
                    }
                    if (data.fields.CUSTFLD15 == "true") {
                      $(".lblCostEx").addClass("hiddenColumn");
                      $(".lblCostEx").removeClass("showColumn");

                      $(".lblCostInc").addClass("showColumn");
                      $(".lblCostInc").removeClass("hiddenColumn");

                      $("#edtbuyqty1costInc").removeClass("hiddenColumn");
                      $("#edtbuyqty1costInc").addClass("showColumn");

                      $("#edtbuyqty1cost").addClass("hiddenColumn");
                      $("#edtbuyqty1cost").removeClass("showColumn");

                      $(".lblCostCheckStatus").val("true");
                    } else if (data.fields.CUSTFLD15 == "false") {
                      $(".lblCostInc").addClass("hiddenColumn");
                      $(".lblCostInc").removeClass("showColumn");

                      $(".lblCostEx").addClass("showColumn");
                      $(".lblCostEx").removeClass("hiddenColumn");

                      $("#edtbuyqty1costInc").addClass("hiddenColumn");
                      $("#edtbuyqty1costInc").removeClass("showColumn");

                      $("#edtbuyqty1cost").removeClass("hiddenColumn");
                      $("#edtbuyqty1cost").addClass("showColumn");
                      $(".lblCostCheckStatus").val("false");
                    }
                  }, 1000);

                  if (data.fields.ExtraSellPrice == null) {
                    lineExtaSellObj = {
                      lineID: Random.id(),
                      clienttype: "",
                      discount: "",
                      datefrom: "",
                      dateto: "",
                      price: 0,
                    };
                    lineExtaSellItems.push(lineExtaSellObj);
                    templateObject.productExtraSell.set(lineExtaSellItems);
                  } else {
                    templateObject.isExtraSellChecked.set(true);
                    for (let e = 0; e < data.fields.ExtraSellPrice.length; e++) {
                      lineExtaSellObj = {
                        lineID: Random.id(),
                        clienttype: data.fields.ExtraSellPrice[e].fields.ClientTypeName || "",
                        discount: data.fields.ExtraSellPrice[e].fields.QtyPercent1 || 0,
                        datefrom: data.fields.ExtraSellPrice[e].fields.DateFrom || "",
                        dateto: data.fields.ExtraSellPrice[e].fields.DateTo || "",
                        price:
                          utilityService.modifynegativeCurrencyFormat(data.fields.ExtraSellPrice[e].fields.Price1) || 0,
                      };
                      lineExtaSellItems.push(lineExtaSellObj);
                    }
                    templateObject.productExtraSell.set(lineExtaSellItems);
                  }
                  let itrackItem = data.fields.LockExtraSell;
                  if (itrackItem == true) {
                    templateObject.isTrackChecked.set(true);
                  } else {
                    templateObject.isTrackChecked.set(false);
                  }
                  if (data.ProductType == "INV") {
                    templateObject.isTrackChecked.set(true);
                  } else {
                    templateObject.isTrackChecked.set(false);
                  }
                  $("#sltsalesacount").val(data.fields.IncomeAccount);
                  $("#sltcogsaccount").val(data.fields.CogsAccount);

                  templateObject.records.set(productrecord);
                  templateObject.isShowBOMModal.set(true);
                })
                .catch(function (err) {
                  $(".fullScreenSpin").css("display", "none");
                });
            }
          }
        }).catch(function (err) {
          productService.getOneProductdata(currentProductID).then(function (data) {
              $(".fullScreenSpin").css("display", "none");
              let lineItems = [];
              let lineItemObj = {};
              let currencySymbol = Currency;
              let totalquantity = 0;

              let isBOMProduct = false;
              let bomProducts = templateObject.bomProducts.get();
              let bomIndex = bomProducts.findIndex((product) => {
                return data.ProductName == product.fields.Caption;
              });

              if (bomIndex > -1) {
                isBOMProduct = true;
                templateObject.bomStructure.set(bomProducts[bomIndex])
              } else {
                productService.getOneBOMProductByName(data.ProductName).then(function (data) {
                  if (data.tproctree.length > -1) {
                    isBOMProduct = true;
                    templateObject.bomStructure.set(data.tproctree[0])
                  }
                });
              }

              let productrecord = {
                id: useData[i].fields.ID,
                productname: useData[i].fields.ProductName,
                lib: useData[i].fields.ProductName,
              //  productcode: useData[i].PRODUCTCODE,
                productcode: useData[i].fields.ProductName,
                productprintName: useData[i].fields.ProductPrintName,
                assetaccount:  useData[i].fields.AssetAccount,
                buyqty1cost: utilityService.modifynegativeCurrencyFormat(useData[i].fields.BuyQty1Cost),
                buyqty1costinc: utilityService.modifynegativeCurrencyFormat(useData[i].fields.BuyQty1CostInc),
                cogsaccount: useData[i].fields.CogsAccount,
                taxcodepurchase: useData[i].fields.TaxCodePurchase || "",
                purchasedescription: useData[i].fields.PurchaseDescription || "",
                sellqty1price: utilityService.modifynegativeCurrencyFormat(useData[i].fields.SellQty1Price),
                sellqty1priceinc: utilityService.modifynegativeCurrencyFormat(useData[i].fields.SellQty1PriceInc),
                incomeaccount: useData[i].fields.IncomeAccount,
                taxcodesales: useData[i].fields.TaxCodeSales || "",
                salesdescription: useData[i].fields.SalesDescription || "",
                active: useData[i].fields.Active || false,
                lockextrasell: useData[i].fields.LockExtraSell,
                customfield1: useData[i].fields.CUSTFLD1 || "",
                customfield2: useData[i].fields.CUSTFLD2 || "",
                totalqtyinstock: useData[i].fields.TotalQtyInStock || "",
                barcode: useData[i].fields.BARCODE || "",
                // useData[i].fields.TotalQtyInStock,
                totalqtyonorder: useData[i].fields.TotalStockQty || "",
                //productclass :lineItems,
                productclass : "",
               // isManufactured: useData[i].fields.IsManufactured,
                isManufactured: isBOMProduct,

              };

              templateObject.isManufactured.set(productrecord.isManufactured);

              setTimeout(async function () {
                await templateObject.setEditableSelect();
                $("#sltsalesacount").val(data.fields.IncomeAccount);
                $("#sltcogsaccount").val(data.fields.CogsAccount);
                $("#sltinventoryacount").val(data.fields.AssetAccount);
                $("#sltUomSales").val(defaultUOM);
                $("#slttaxcodesales").val(data.fields.TaxCodeSales);
                $("#slttaxcodepurchase").val(data.fields.TaxCodePurchase);

                // Feature/ser-lot-tracking: Initializing serial/lot number settings
                if (data.fields.SNTracking) $("#chkSNTrack").prop("checked", true);
                if (data.fields.Batch) $("#chkLotTrack").prop("checked", true);
                if (data.fields.CUSTFLD13 === "true") $("#chkAddSN").prop("checked", true);

                if (data.fields.CUSTFLD14 == "true") {
                  $(".lblPriceEx").addClass("hiddenColumn");
                  $(".lblPriceEx").removeClass("showColumn");

                  $(".lblPriceInc").addClass("showColumn");
                  $(".lblPriceInc").removeClass("hiddenColumn");

                  $("#edtsellqty1priceInc").removeClass("hiddenColumn");
                  $("#edtsellqty1priceInc").addClass("showColumn");

                  $("#edtsellqty1price").addClass("hiddenColumn");
                  $("#edtsellqty1price").removeClass("showColumn");
                  $(".lblPriceCheckStatus").val("true");
                } else if (data.fields.CUSTFLD14 == "false") {
                  $(".lblPriceInc").addClass("hiddenColumn");
                  $(".lblPriceInc").removeClass("showColumn");

                  $(".lblPriceEx").addClass("showColumn");
                  $(".lblPriceEx").removeClass("hiddenColumn");

                  $("#edtsellqty1priceInc").addClass("hiddenColumn");
                  $("#edtsellqty1priceInc").removeClass("showColumn");

                  $("#edtsellqty1price").removeClass("hiddenColumn");
                  $("#edtsellqty1price").addClass("showColumn");
                  $(".lblPriceCheckStatus").val("false");
                }
                if (data.fields.CUSTFLD15 == "true") {
                  $(".lblCostEx").addClass("hiddenColumn");
                  $(".lblCostEx").removeClass("showColumn");

                  $(".lblCostInc").addClass("showColumn");
                  $(".lblCostInc").removeClass("hiddenColumn");

                  $("#edtbuyqty1costInc").removeClass("hiddenColumn");
                  $("#edtbuyqty1costInc").addClass("showColumn");

                  $("#edtbuyqty1cost").addClass("hiddenColumn");
                  $("#edtbuyqty1cost").removeClass("showColumn");

                  $(".lblCostCheckStatus").val("true");
                } else if (data.fields.CUSTFLD15 == "false") {
                  $(".lblCostInc").addClass("hiddenColumn");
                  $(".lblCostInc").removeClass("showColumn");

                  $(".lblCostEx").addClass("showColumn");
                  $(".lblCostEx").removeClass("hiddenColumn");

                  $("#edtbuyqty1costInc").addClass("hiddenColumn");
                  $("#edtbuyqty1costInc").removeClass("showColumn");

                  $("#edtbuyqty1cost").removeClass("hiddenColumn");
                  $("#edtbuyqty1cost").addClass("showColumn");
                  $(".lblCostCheckStatus").val("false");
                }
              }, 1000);

              if (data.ExtraSellPrice == null) {
                lineExtaSellObj = {
                  lineID: Random.id(),
                  clienttype: "",
                  discount: "",
                  datefrom: "",
                  dateto: "",
                  price: 0,
                };
                lineExtaSellItems.push(lineExtaSellObj);
                templateObject.productExtraSell.set(lineExtaSellItems);
              } else {
                templateObject.isExtraSellChecked.set(true);
                for (let e = 0; e < data.ExtraSellPrice.length; e++) {
                  lineExtaSellObj = {
                    lineID: Random.id(),
                    clienttype: data.ExtraSellPrice[e].fields.ClientTypeName || "",
                    discount: data.ExtraSellPrice[e].fields.QtyPercent1 || 0,
                    datefrom: data.ExtraSellPrice[e].fields.DateFrom || "",
                    dateto: data.ExtraSellPrice[e].fields.DateTo || "",
                    price:
                      utilityService.modifynegativeCurrencyFormat(data.ExtraSellPrice[e].fields.Price1) || 0,
                  };
                  lineExtaSellItems.push(lineExtaSellObj);
                }
                templateObject.productExtraSell.set(lineExtaSellItems);
              }

              let itrackItem = data.fields.LockExtraSell;
              if (itrackItem == true) {
                templateObject.isTrackChecked.set(true);
              } else {
                templateObject.isTrackChecked.set(false);
              }
              if (data.ProductType == "INV") {
                templateObject.isTrackChecked.set(true);
              } else {
                templateObject.isTrackChecked.set(false);
              }
              $("#sltsalesacount").val(data.fields.IncomeAccount);
              $("#sltcogsaccount").val(data.fields.CogsAccount);

              templateObject.records.set(productrecord);
              templateObject.isShowBOMModal.set(true);
            })
            .catch(function (err) {
              $(".fullScreenSpin").css("display", "none");
            });
        });

      setTimeout(() => {
        //if(templateObject.records.get().isManufactured == true) {
        // let objectArray = JSON.parse(localStorage.getItem('TProcTree'))
        // let obj = objectArray.find(object => {
        //     return object.fields.productName == templateObject.records.get().productname;
        // });
        // $('#BOMSetupModal .edtProcessName').editableSelect();
        // // $('#BOMSetupModal .edtProcessNote').editableSelect();
        // $('#BOMSetupModal #edtProcess').val(obj.fields.process);
        // $('#BOMSetupModal .edtProcessNote').val(obj.fields.processNote || '');
        // $('#BOMSetupModal .edtQuantity').val(obj.fields.qty || '1');
        // if(obj.fields.subs.length >0) {
        //     let subs = obj.fields.subs;
        //     for(let i=0; i< subs.length; i++) {
        //         let html = '';
        //         html = html + "<div class='product-content'>"+
        //             "<div class='d-flex productRow'>"+
        //                 "<div class='colProduct form-group d-flex'><div style='width: 29%'></div>" +
        //                     "<select type='search' class='edtProductName edtRaw form-control es-input' style='width: 30%'></select>" ;
        //                     let bomIndex = objectArray.findIndex(object => {
        //                         return object.fields.productName == subs[i].product
        //                     })
        //                     if (bomIndex > -1) {
        //                         html +="<button type='button' class='btnShowSub btn btn-primary'>Show Sub</button>";
        //                     }
        //                 html += "</div>"+
        //                 "<div class='colQty form-group'>"+
        //                     "<input type='text' class='form-control edtQuantity w-100' value='1'>" +
        //                 "</div>";
        //                  if (bomIndex > -1) {
        //                         html += "<div class='colProcess form-group'>"+
        //                         "<input type='search' autocomplete='off' class='edtProcessName form-control w-100 es-input' ><ul class='es-list' style=''></ul></div>"+
        //                         "<div class='colNote form-group'>" +
        //                         "<input class='w-100 form-control edtProcessNote'  type='text'></div>" +
        //                         "<div class='colAttachment form-group'><a class='btn btn-primary btnAddAttachment' role='button' data-toggle='modal' href='#myModalAttachment-DealerDan' id='btn_Attachment' name='btn_Attachment'><i class='fa fa-paperclip' style='padding-right: 8px;'></i>Add Attachments</a><div class='d-none attachedFiles'></div></div>"
        //                 } else {
        //                     html += "<div class='colProcess form-group'></div>"+
        //                     "<div class='colNote form-group'></div>" +
        //                     "<div class='colAttachment form-group'></div>"
        //                 }
        //                 html += "<div class='colDelete d-flex align-items-center justify-content-center'><button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw'><i class='fa fa-remove'></i></button></div>" +
        //             "</div>"+
        //         "</div>"
        //         let productContents = $('#BOMSetupModal .product-content');
        //         $(html).insertAfter($(productContents[productContents.length-2]))
        //         productContents = $('#BOMSetupModal .product-content');
        //         let productContent = $(productContents[productContents.length-2])
        //         $(productContent).find('.edtProductName').editableSelect();
        //         $(productContent).find('.edtProcessName').editableSelect()
        //         $(productContent).find('.edtProductName').val(subs[i].product || subs[i].productName || '')
        //         $(productContent).find('.edtQuantity').val(subs[i].quantity || "1")
        //         $(productContent).find('.edtProcessName').val(objectArray[bomIndex].process || "")
        //         // $(productContent).find('.edtProcessName').val(subs[i].process || "")
        //         $(productContent).find('.edtProcessNote').val(subs[i].note || "")
        //     }
        // }
        //}
      }, 2000);

      setTimeout(function () {
        var begin_day_value = $("#event_begin_day").attr("value");
        $("#dtDateTo")
          .datepicker({
            showOn: "button",
            buttonText: "Show Date",
            buttonImageOnly: true,
            buttonImage: "/img/imgCal2.png",
            constrainInput: false,
            dateFormat: "d/mm/yy",
            showOtherMonths: true,
            selectOtherMonths: true,
            changeMonth: true,
            changeYear: true,
            yearRange: "-90:+10",
          })
          .keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
              $("#dtDateTo,#dtDateFrom").val("");
            }
          });

        $("#dtDateFrom")
          .datepicker({
            showOn: "button",
            buttonText: "Show Date",
            altField: "#dtDateFrom",
            buttonImageOnly: true,
            buttonImage: "/img/imgCal2.png",
            constrainInput: false,
            dateFormat: "d/mm/yy",
            showOtherMonths: true,
            selectOtherMonths: true,
            changeMonth: true,
            changeYear: true,
            yearRange: "-90:+10",
          })
          .keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
              $("#dtDateTo,#dtDateFrom").val("");
            }
          });

        $(".ui-datepicker .ui-state-hihglight").removeClass("ui-state-highlight");
        // var usedNames = {};
        // $("select[name='sltCustomerType'] > option").each(function () {
        //     if(usedNames[this.text]) {
        //         $(this).remove();
        //     } else {
        //         usedNames[this.text] = this.value;
        //     }
        // });

        // $('#sltCustomerType').append(' <option value="newCust"><span class="addType">+ Client Type</span></option>');
      }, 1000);
    };

    templateObject.setBOMModal = () => {};

    templateObject.getProductClassQtyData = async function () {

      let dataObject = await getVS1Data('TProductClassQuantity')||'';
      if (dataObject.length > 0){
        let data = JSON.parse(dataObject[0].data);
        if(data){
          templateObject.setProductClassQtyData(data);
        }
      }else{
        productService.getOneProductClassQtyData(currentProductID).then(function (data) {
          templateObject.setProductClassQtyData(data);
        });
      }


    };

    templateObject.setProductClassQtyData = async function (data) {
      let qtylineItems = [];
      let qtylineItemObj = {};
      let currencySymbol = Currency;
      let totaldeptquantity = 0;
      let backordeQty = 0;
      for (let j in data.tproductclassquantity) {
        if(data.tproductclassquantity[j].ProductID == parseInt(currentProductID)){
        backordeQty = data.tproductclassquantity[j].POBOQty + data.tproductclassquantity[j].SOBOQty;
        qtylineItemObj = {
          department: data.tproductclassquantity[j].DepartmentName || "",
          // quantity: data.tproductclassquantity[j].InStockQty || 0,
          availableqty:data.tproductclassquantity[j].InStockQty - backordeQty - data.tproductclassquantity[j].SOQty || 0,
          onsoqty: data.tproductclassquantity[j].SOQty || 0,
          onboqty: backordeQty || 0,
          instockqty: data.tproductclassquantity[j].InStockQty || 0,
          onorderqty: data.tproductclassquantity[j].OnOrderQty || 0,
        };
        totaldeptquantity += data.tproductclassquantity[j].InStockQty;
        qtylineItems.push(qtylineItemObj);
      }
      }
      // $('#edttotalqtyinstock').val(totaldeptquantity);
      templateObject.productqtyrecords.set(qtylineItems);
      updateBinNumberSelect();
      templateObject.totaldeptquantity.set(totaldeptquantity);
    };

    templateObject.getProductClassQtyData();
    templateObject.getProductData();

    templateObject.getSerialNumberList = function () {
      productService.getSerialNumberList(currentProductID).then(function (data) {
        serialnumberList = [];
        for (let i = 0; i < data.tserialnumberlistcurrentreport.length; i++) {
          let datet = new Date(data.tserialnumberlistcurrentreport[i].TransDate);
          let sdatet = `${datet.getDate()}/${datet.getMonth()}/${datet.getFullYear()}`;
          if (data.tserialnumberlistcurrentreport[i].AllocType == "Sold") {
            tclass = "text-sold";
          } else if (data.tserialnumberlistcurrentreport[i].AllocType == "In-Stock") {
            tclass = "text-instock";
          } else if (data.tserialnumberlistcurrentreport[i].AllocType == "Transferred (Not Available)") {
            tclass = "text-transfered";
          } else {
            tclass = "";
          }
          let serialnumberObject = {
            Productid: currentProductID,
            PP: data.ProductId,
            SerialNumber: data.tserialnumberlistcurrentreport[i].SerialNumber,
            Status: data.tserialnumberlistcurrentreport[i].AllocType,
            date: sdatet,
            department: data.tserialnumberlistcurrentreport[i].DepartmentName,
            cssclass: tclass,
          };
          serialnumberList.push(serialnumberObject);
        }

        templateObject.tserialnumberList.set(serialnumberList);
        setTimeout(function () {
          $("#serialnumberlist")
            .DataTable({
              sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
              select: true,
              destroy: true,
              colReorder: true,
              pageLength: initialDatatableLoad,
              lengthMenu: [
                [initialDatatableLoad, -1],
                [initialDatatableLoad, "All"],
              ],
              info: true,
              responsive: true,
              order: [
                [0, "desc"],
                [3, "desc"],
              ],
              action: function () {
                $("#serialnumberlist").DataTable().ajax.reload();
              },
              fnDrawCallback: function (oSettings) {
                $(".paginate_button.page-item").removeClass("disabled");
                $("#tblPaymentOverview_ellipsis").addClass("disabled");

                if (oSettings._iDisplayLength == -1) {
                  if (oSettings.fnRecordsDisplay() > 150) {
                    $(".paginate_button.page-item.previous").addClass("disabled");
                    $(".paginate_button.page-item.next").addClass("disabled");
                  }
                } else {
                }
                if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                  $(".paginate_button.page-item.next").addClass("disabled");
                }
                $(".paginate_button.next:not(.disabled)", this.api().table().container()).on("click", function () {
                  $(".fullScreenSpin").css("display", "inline-block");

                  var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                  var dateTo = new Date($("#dateTo").datepicker("getDate"));

                  let formatDateFrom =
                    dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                  let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                  if (data.Params.IgnoreDates == true) {
                    sideBarService
                      .getNewProductListVS1(
                        formatDateFrom,
                        formatDateTo,
                        true,
                        initialDatatableLoad,
                        oSettings.fnRecordsDisplay(),
                        viewdeleted
                      )
                      .then(function (dataObjectnew) {
                        addVS1Data("TProductVS1", JSON.stringify(dataReload))
                          .then(function (datareturn) {
                            if (dataObjectold.length == 0) {
                            } else {
                              let dataOld = JSON.parse(dataObjectold[0].data);
                              var thirdaryData = $.merge($.merge([], dataObjectnew.TProductVS1), dataOld.TProductVS1);
                              let objCombineData = {
                                Params: dataOld.Params,
                                TProductVS1: thirdaryData,
                              };

                              addVS1Data("TProductVS1", JSON.stringify(objCombineData))
                                .then(function (datareturn) {
                                  templateObject.resetData(objCombineData);
                                  $(".fullScreenSpin").css("display", "none");
                                })
                                .catch(function (err) {
                                  $(".fullScreenSpin").css("display", "none");
                                });
                            }
                          })
                          .catch(function (err) {});
                      })
                      .catch(function (err) {
                        $(".fullScreenSpin").css("display", "none");
                      });
                  } else {
                    sideBarService
                      .getNewProductListVS1(
                        formatDateFrom,
                        formatDateTo,
                        false,
                        initialDatatableLoad,
                        oSettings.fnRecordsDisplay(),
                        viewdeleted
                      )
                      .then(function (dataObjectnew) {
                        addVS1Data("TProductVS1", JSON.stringify(dataReload))
                          .then(function (datareturn) {
                            if (dataObjectold.length == 0) {
                            } else {
                              let dataOld = JSON.parse(dataObjectold[0].data);
                              var thirdaryData = $.merge($.merge([], dataObjectnew.TProductVS1), dataOld.TProductVS1);
                              let objCombineData = {
                                Params: dataOld.Params,
                                TProductVS1: thirdaryData,
                              };

                              addVS1Data("TProductVS1", JSON.stringify(objCombineData))
                                .then(function (datareturn) {
                                  templateObject.resetData(objCombineData);
                                  $(".fullScreenSpin").css("display", "none");
                                })
                                .catch(function (err) {
                                  $(".fullScreenSpin").css("display", "none");
                                });
                            }
                          })
                          .catch(function (err) {});
                      })
                      .catch(function (err) {
                        $(".fullScreenSpin").css("display", "none");
                      });
                  }
                });

                //}
                setTimeout(function () {
                  MakeNegative();
                }, 100);
              },
            })
            .on("page", function () {})
            .on("column-reorder", function () {});
          $("div.dataTables_filter input").addClass("form-control form-control-sm");
          $(".fullScreenSpin").css("display", "none");
          $("#SNTracklist").css({ display: "block" });
        }, 0);
      });
    };

    templateObject.getLotNumberList = function () {
      productService.getSerialNumberList(currentProductID).then(function (data) {
        lotnumberList = [];
        for (let i = 0; i < data.tserialnumberlistcurrentreport.length; i++) {
          let datet = new Date(data.tserialnumberlistcurrentreport[i].TransDate);
          let dateep = new Date(data.tserialnumberlistcurrentreport[i].BatchExpiryDate);
          let sdatet = `${datet.getDate()}/${datet.getMonth()}/${datet.getFullYear()}`;
          let sdateep = `${dateep.getDate()}/${dateep.getMonth()}/${dateep.getFullYear()}`;
          if (data.tserialnumberlistcurrentreport[i].AllocType == "Sold") {
            tclass = "text-sold";
          } else if (data.tserialnumberlistcurrentreport[i].AllocType == "In-Stock") {
            tclass = "text-instock";
          } else if (data.tserialnumberlistcurrentreport[i].AllocType == "Transferred (Not Available)") {
            tclass = "text-transfered";
          } else {
            tclass = "";
          }
          let lotnumberObject = {
            LotNumber: data.tserialnumberlistcurrentreport[i].BatchNumber,
            Status: data.tserialnumberlistcurrentreport[i].AllocType,
            date: sdatet,
            expriydate: sdateep,
            department: data.tserialnumberlistcurrentreport[i].DepartmentName,
            cssclass: tclass,
          };
          lotnumberList.push(lotnumberObject);
        }

        templateObject.tlotnumberList.set(lotnumberList);
        setTimeout(function () {
          $("#lotnumberlist")
            .DataTable({
              sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
              select: true,
              destroy: true,
              colReorder: true,
              pageLength: initialDatatableLoad,
              lengthMenu: [
                [initialDatatableLoad, -1],
                [initialDatatableLoad, "All"],
              ],
              info: true,
              responsive: true,
              order: [
                [0, "desc"],
                [3, "desc"],
              ],
              action: function () {
                $("#lotnumberlist").DataTable().ajax.reload();
              },
              fnDrawCallback: function (oSettings) {
                $(".paginate_button.page-item").removeClass("disabled");
                $("#tblPaymentOverview_ellipsis").addClass("disabled");

                if (oSettings._iDisplayLength == -1) {
                  if (oSettings.fnRecordsDisplay() > 150) {
                    $(".paginate_button.page-item.previous").addClass("disabled");
                    $(".paginate_button.page-item.next").addClass("disabled");
                  }
                } else {
                }
                if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                  $(".paginate_button.page-item.next").addClass("disabled");
                }
                $(".paginate_button.next:not(.disabled)", this.api().table().container()).on("click", function () {
                  $(".fullScreenSpin").css("display", "inline-block");

                  var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                  var dateTo = new Date($("#dateTo").datepicker("getDate"));

                  let formatDateFrom =
                    dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                  let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                  if (data.Params.IgnoreDates == true) {
                    sideBarService
                      .getNewProductListVS1(
                        formatDateFrom,
                        formatDateTo,
                        true,
                        initialDatatableLoad,
                        oSettings.fnRecordsDisplay(),
                        viewdeleted
                      )
                      .then(function (dataObjectnew) {
                        addVS1Data("TProductVS1", JSON.stringify(dataReload))
                          .then(function (datareturn) {
                            if (dataObjectold.length == 0) {
                            } else {
                              let dataOld = JSON.parse(dataObjectold[0].data);
                              var thirdaryData = $.merge($.merge([], dataObjectnew.TProductVS1), dataOld.TProductVS1);
                              let objCombineData = {
                                Params: dataOld.Params,
                                TProductVS1: thirdaryData,
                              };

                              addVS1Data("TProductVS1", JSON.stringify(objCombineData))
                                .then(function (datareturn) {
                                  templateObject.resetData(objCombineData);
                                  $(".fullScreenSpin").css("display", "none");
                                })
                                .catch(function (err) {
                                  $(".fullScreenSpin").css("display", "none");
                                });
                            }
                          })
                          .catch(function (err) {});
                      })
                      .catch(function (err) {
                        $(".fullScreenSpin").css("display", "none");
                      });
                  } else {
                    sideBarService
                      .getNewProductListVS1(
                        formatDateFrom,
                        formatDateTo,
                        false,
                        initialDatatableLoad,
                        oSettings.fnRecordsDisplay(),
                        viewdeleted
                      )
                      .then(function (dataObjectnew) {
                        addVS1Data("TProductVS1", JSON.stringify(dataReload))
                          .then(function (datareturn) {
                            if (dataObjectold.length == 0) {
                            } else {
                              let dataOld = JSON.parse(dataObjectold[0].data);
                              var thirdaryData = $.merge($.merge([], dataObjectnew.TProductVS1), dataOld.TProductVS1);
                              let objCombineData = {
                                Params: dataOld.Params,
                                TProductVS1: thirdaryData,
                              };

                              addVS1Data("TProductVS1", JSON.stringify(objCombineData))
                                .then(function (datareturn) {
                                  templateObject.resetData(objCombineData);
                                  $(".fullScreenSpin").css("display", "none");
                                })
                                .catch(function (err) {
                                  $(".fullScreenSpin").css("display", "none");
                                });
                            }
                          })
                          .catch(function (err) {});
                      })
                      .catch(function (err) {
                        $(".fullScreenSpin").css("display", "none");
                      });
                  }
                });

                //}
                setTimeout(function () {
                  MakeNegative();
                }, 100);
              },
            })
            .on("page", function () {})
            .on("column-reorder", function () {});
          $("div.dataTables_filter input").addClass("form-control form-control-sm");
          $(".fullScreenSpin").css("display", "none");
          $("#LotTracklist").css({ display: "block" });
        }, 0);
      });
    };

    templateObject.getAllProductRecentTransactions = function () {
      // productService.getProductRecentTransactionsAll(currentProductID).then(function(data) {
      //     recentTransList = [];
      //     for (let i = 0; i < data.t_vs1_report_productmovement.length; i++) {
      //         let recentTranObject = {
      //             date: data.t_vs1_report_productmovement[i].TransactionDate != '' ? moment(data.t_vs1_report_productmovement[i].TransactionDate).format("DD/MM/YYYY") : data.t_vs1_report_productmovement[i].TransactionDate,
      //             type: data.t_vs1_report_productmovement[i].TranstypeDesc,
      //             transactionno: data.t_vs1_report_productmovement[i].TransactionNo,
      //             reference: data.t_vs1_report_productmovement[i].TransactionNo,
      //             quantity: data.t_vs1_report_productmovement[i].Qty,
      //             unitPrice: utilityService.modifynegativeCurrencyFormat(data.t_vs1_report_productmovement[i].Price),
      //             total: utilityService.modifynegativeCurrencyFormat(data.t_vs1_report_productmovement[i].TotalPrice)
      //         };
      //         recentTransList.push(recentTranObject);
      //     }
      //     templateObject.recentTrasactions.set(recentTransList);
      //     setTimeout(function() {
      //         $('#productrecentlist').DataTable({
      //             "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
      //             select: true,
      //             destroy: true,
      //             colReorder: true,
      //             // bStateSave: true,
      //             // rowId: 0,
      //             pageLength: initialDatatableLoad,
      //             lengthMenu: [
      //                 [initialDatatableLoad, -1],
      //                 [initialDatatableLoad, "All"]
      //             ],
      //             info: true,
      //             responsive: true,
      //             "order": [[0, "desc"],[3, "desc"]],
      //             action: function() {
      //                 $('#productrecentlist').DataTable().ajax.reload();
      //             },
      //             "fnDrawCallback": function(oSettings) {
      //                 let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;
      //                 //if(checkurlIgnoreDate == 'true'){
      //                 //}else{
      //                 $('.paginate_button.page-item').removeClass('disabled');
      //                 $('#tblPaymentOverview_ellipsis').addClass('disabled');
      //                 if (oSettings._iDisplayLength == -1) {
      //                     if (oSettings.fnRecordsDisplay() > 150) {
      //                         $('.paginate_button.page-item.previous').addClass('disabled');
      //                         $('.paginate_button.page-item.next').addClass('disabled');
      //                     }
      //                 } else {}
      //                 if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
      //                     $('.paginate_button.page-item.next').addClass('disabled');
      //                 }
      //                 $('.paginate_button.next:not(.disabled)', this.api().table().container())
      //                     .on('click', function() {
      //                         $('.fullScreenSpin').css('display', 'inline-block');
      //                         let dataLenght = oSettings._iDisplayLength;
      //                         var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
      //                         var dateTo = new Date($("#dateTo").datepicker("getDate"));
      //                         let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
      //                         let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
      //                         if(data.Params.IgnoreDates == true){
      //                             sideBarService.getTPaymentList(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay(),viewdeleted).then(function(dataObjectnew) {
      //                                 getVS1Data('TPaymentList').then(function(dataObjectold) {
      //                                     if (dataObjectold.length == 0) {} else {
      //                                         let dataOld = JSON.parse(dataObjectold[0].data);
      //                                         var thirdaryData = $.merge($.merge([], dataObjectnew.tpaymentlist), dataOld.tpaymentlist);
      //                                         let objCombineData = {
      //                                             Params: dataOld.Params,
      //                                             tpaymentlist: thirdaryData
      //                                         }
      //                                         addVS1Data('TPaymentList', JSON.stringify(objCombineData)).then(function(datareturn) {
      //                                             templateObject.resetData(objCombineData);
      //                                             $('.fullScreenSpin').css('display', 'none');
      //                                         }).catch(function(err) {
      //                                             $('.fullScreenSpin').css('display', 'none');
      //                                         });
      //                                     }
      //                                 }).catch(function(err) {});
      //                             }).catch(function(err) {
      //                                 $('.fullScreenSpin').css('display', 'none');
      //                             });
      //                         } else {
      //                             sideBarService.getTPaymentList(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay(),viewdeleted).then(function(dataObjectnew) {
      //                                 getVS1Data('TPaymentList').then(function(dataObjectold) {
      //                                     if (dataObjectold.length == 0) {} else {
      //                                         let dataOld = JSON.parse(dataObjectold[0].data);
      //                                         var thirdaryData = $.merge($.merge([], dataObjectnew.tpaymentlist), dataOld.tpaymentlist);
      //                                         let objCombineData = {
      //                                             Params: dataOld.Params,
      //                                             tpaymentlist: thirdaryData
      //                                         }
      //                                         addVS1Data('TPaymentList', JSON.stringify(objCombineData)).then(function(datareturn) {
      //                                             templateObject.resetData(objCombineData);
      //                                             $('.fullScreenSpin').css('display', 'none');
      //                                         }).catch(function(err) {
      //                                             $('.fullScreenSpin').css('display', 'none');
      //                                         });
      //                                     }
      //                                 }).catch(function(err) {});
      //                             }).catch(function(err) {
      //                                 $('.fullScreenSpin').css('display', 'none');
      //                             });
      //                         }
      //                     });
      //                 //}
      //                 setTimeout(function() {
      //                     MakeNegative();
      //                 }, 100);
      //             },
      //         }).on('page', function() {}).on('column-reorder', function() {});
      //         $('div.dataTables_filter input').addClass('form-control form-control-sm');
      //         $('.fullScreenSpin').css('display', 'none');
      //     }, 0);
      //     $('#productrecentlist tbody').on('click', 'tr', function() {
      //         var listData = $(this).closest('tr').attr('id');
      //         var transactiontype = $(event.target).closest("tr").find(".transactiontype").text();
      //         if ((listData) && (transactiontype)) {
      //             if (transactiontype === 'Quote') {
      //                 window.open('/quotecard?id=' + listData, '_self');
      //             } else if (transactiontype === 'Sales Order') {
      //                 window.open('/salesordercard?id=' + listData, '_self');
      //             } else if (transactiontype === 'Invoice') {
      //                 window.open('/invoicecard?id=' + listData, '_self');
      //             } else if (transactiontype === 'Purchase Order') {
      //                 window.open('/purchaseordercard?id=' + listData, '_self');
      //             } else if (transactiontype === 'Bill') {
      //                 //window.open('/billcard?id=' + listData,'_self');
      //             } else if (transactiontype === 'Credit') {
      //                 //window.open('/creditcard?id=' + listData,'_self');
      //             }
      //         }
      //     });
      //     $('.product_recent_trans').css('display', 'block');
      //     $([document.documentElement, document.body]).animate({
      //         scrollTop: $(".product_recent_trans").offset().top
      //     }, 2000);
      //     $('.fullScreenSpin').css('display', 'none');
      // }).catch(function(err) {
      //     $('.fullScreenSpin').css('display', 'none');
      //     $('.product_recent_trans').css('display', 'block');
      //     $([document.documentElement, document.body]).animate({
      //         scrollTop: $(".product_recent_trans").offset().top
      //     }, 2000);
      //     //Bert.alert('<strong>' + err + '</strong>!', 'deleting products failed');
      // });
    };
  } else if (FlowRouter.current().queryParams.prodname) {
    currentProductName = currentProductName.replace(/%20/g, " ");
    templateObject.getProductData = function () {
      getVS1Data("TProductVS1")
        .then(function (dataObject) {
          if (dataObject.length == 0) {
            productService
              .getOneProductdatavs1byname(currentProductName)
              .then(function (data) {
                $(".fullScreenSpin").css("display", "none");
                let lineItems = [];
                let lineItemObj = {};
                let currencySymbol = Currency;
                let totalquantity = 0;
                currentProductID = data.tproduct[0].fields.ID;
                templateObject.productID.set(currentProductID);
                templateObject.getProductClassQtyData();
                let productrecord = {
                  id: data.tproduct[0].fields.ID,
                  productname: data.tproduct[0].fields.ProductName,
                  lib: data.tproduct[0].fields.ProductName,
                  productcode: data.tproduct[0].fields.PRODUCTCODE,
                  productprintName: data.tproduct[0].fields.ProductPrintName,
                  assetaccount: data.tproduct[0].fields.AssetAccount,
                  buyqty1cost: utilityService.modifynegativeCurrencyFormat(data.tproduct[0].fields.BuyQty1Cost),
                  buyqty1costinc: utilityService.modifynegativeCurrencyFormat(data.BuyQty1CostInc),
                  cogsaccount: data.tproduct[0].fields.CogsAccount,
                  taxcodepurchase: data.tproduct[0].fields.TaxCodePurchase,
                  purchasedescription: data.tproduct[0].fields.PurchaseDescription,
                  sellqty1price: utilityService.modifynegativeCurrencyFormat(data.tproduct[0].fields.SellQty1Price),
                  sellqty1priceinc: utilityService.modifynegativeCurrencyFormat(data.SellQty1PriceInc),
                  incomeaccount: data.tproduct[0].fields.IncomeAccount,
                  taxcodesales: data.tproduct[0].fields.TaxCodeSales,
                  salesdescription: data.tproduct[0].fields.SalesDescription,
                  active: data.tproduct[0].fields.Active,
                  lockextrasell: data.tproduct[0].fields.LockExtraSell,
                  customfield1: data.tproduct[0].fields.CUSTFLD1,
                  customfield2: data.tproduct[0].fields.CUSTFLD2,
                  //totalqtyinstock : totalquantity,
                  barcode: data.tproduct[0].fields.BARCODE,
                  // data.TotalQtyInStock,
                  totalqtyonorder: data.tproduct[0].fields.TotalQtyOnOrder,
                  //productclass :lineItems
                };

                setTimeout(async function () {
                  await templateObject.setEditableSelect();
                  $("#sltsalesacount").val(data.IncomeAccount);
                  $("#sltcogsaccount").val(data.CogsAccount);
                  $("#sltinventoryacount").val(data.AssetAccount);
                  $("#sltUomSales").val(defaultUOM);
                  $("#slttaxcodesales").val(data.TaxCodeSales);
                  $("#slttaxcodepurchase").val(data.TaxCodePurchase);
                  if (data.CUSTFLD14 == "true") {
                    $(".lblPriceEx").addClass("hiddenColumn");
                    $(".lblPriceEx").removeClass("showColumn");

                    $(".lblPriceInc").addClass("showColumn");
                    $(".lblPriceInc").removeClass("hiddenColumn");

                    $("#edtsellqty1priceInc").removeClass("hiddenColumn");
                    $("#edtsellqty1priceInc").addClass("showColumn");

                    $("#edtsellqty1price").addClass("hiddenColumn");
                    $("#edtsellqty1price").removeClass("showColumn");
                    $(".lblPriceCheckStatus").val("true");
                  } else if (data.CUSTFLD14 == "false") {
                    $(".lblPriceInc").addClass("hiddenColumn");
                    $(".lblPriceInc").removeClass("showColumn");

                    $(".lblPriceEx").addClass("showColumn");
                    $(".lblPriceEx").removeClass("hiddenColumn");

                    $("#edtsellqty1priceInc").addClass("hiddenColumn");
                    $("#edtsellqty1priceInc").removeClass("showColumn");

                    $("#edtsellqty1price").removeClass("hiddenColumn");
                    $("#edtsellqty1price").addClass("showColumn");
                    $(".lblPriceCheckStatus").val("false");
                  }
                  if (data.CUSTFLD15 == "true") {
                    $(".lblCostEx").addClass("hiddenColumn");
                    $(".lblCostEx").removeClass("showColumn");

                    $(".lblCostInc").addClass("showColumn");
                    $(".lblCostInc").removeClass("hiddenColumn");

                    $("#edtbuyqty1costInc").removeClass("hiddenColumn");
                    $("#edtbuyqty1costInc").addClass("showColumn");

                    $("#edtbuyqty1cost").addClass("hiddenColumn");
                    $("#edtbuyqty1cost").removeClass("showColumn");

                    $(".lblCostCheckStatus").val("true");
                  } else if (data.CUSTFLD15 == "false") {
                    $(".lblCostInc").addClass("hiddenColumn");
                    $(".lblCostInc").removeClass("showColumn");

                    $(".lblCostEx").addClass("showColumn");
                    $(".lblCostEx").removeClass("hiddenColumn");

                    $("#edtbuyqty1costInc").addClass("hiddenColumn");
                    $("#edtbuyqty1costInc").removeClass("showColumn");

                    $("#edtbuyqty1cost").removeClass("hiddenColumn");
                    $("#edtbuyqty1cost").addClass("showColumn");
                    $(".lblCostCheckStatus").val("false");
                  }
                }, 1000);

                if (data.tproduct[0].fields.ExtraSellPrice == null) {
                  lineExtaSellObj = {
                    lineID: Random.id(),
                    clienttype: "",
                    discount: "",
                    datefrom: "",
                    dateto: "",
                    price: 0,
                  };
                  lineExtaSellItems.push(lineExtaSellObj);
                  templateObject.productExtraSell.set(lineExtaSellItems);
                } else {
                  templateObject.isExtraSellChecked.set(true);
                  for (let e = 0; e < data.tproduct[0].fields.ExtraSellPrice.length; e++) {
                    lineExtaSellObj = {
                      lineID: Random.id(),
                      clienttype: data.tproduct[0].fields.ExtraSellPrice[e].fields.ClientTypeName || "",
                      discount: data.tproduct[0].fields.ExtraSellPrice[e].fields.QtyPercent1 || 0,
                      datefrom: data.tproduct[0].fields.ExtraSellPrice[e].fields.DateFrom || "",
                      dateto: data.tproduct[0].fields.ExtraSellPrice[e].fields.DateTo || "",
                      price:
                        utilityService.modifynegativeCurrencyFormat(
                          data.tproduct[0].fields.ExtraSellPrice[e].fields.Price1
                        ) || 0,
                    };
                    lineExtaSellItems.push(lineExtaSellObj);
                  }
                  templateObject.productExtraSell.set(lineExtaSellItems);
                }
                let itrackItem = data.tproduct[0].fields.LockExtraSell;
                if (itrackItem == true) {
                  templateObject.isTrackChecked.set(true);
                } else {
                  templateObject.isTrackChecked.set(false);
                }
                if (data.tproduct[0].fields.ProductType == "INV") {
                  templateObject.isTrackChecked.set(true);
                } else {
                  templateObject.isTrackChecked.set(false);
                }
                $("#sltsalesacount").val(data.tproduct[0].fields.IncomeAccount);
                $("#sltcogsaccount").val(data.tproduct[0].fields.CogsAccount);

                templateObject.records.set(productrecord);
              })
              .catch(function (err) {
                $(".fullScreenSpin").css("display", "none");
              });
          } else {
            let data = JSON.parse(dataObject[0].data);
            let useData = data.tproductvs1;
            var added = false;

            for (let i = 0; i < useData.length; i++) {
              if (useData[i].fields.ProductName === currentProductName) {
                added = true;
                $(".fullScreenSpin").css("display", "none");
                let lineItems = [];
                let lineItemObj = {};
                let currencySymbol = Currency;
                let totalquantity = 0;
                currentProductID = useData[i].fields.ID;
                templateObject.productID.set(currentProductID);
                templateObject.getProductClassQtyData();
                let productrecord = {
                  id: useData[i].fields.ID,
                  productname: useData[i].fields.ProductName,
                  lib: useData[i].fields.ProductName,
                  productcode: useData[i].fields.PRODUCTCODE,
                  productprintName: useData[i].fields.ProductPrintName,
                  assetaccount: useData[i].fields.AssetAccount,
                  buyqty1cost: utilityService.modifynegativeCurrencyFormat(useData[i].fields.BuyQty1Cost),
                  buyqty1costinc: utilityService.modifynegativeCurrencyFormat(data.BuyQty1CostInc),
                  cogsaccount: useData[i].fields.CogsAccount,
                  taxcodepurchase: useData[i].fields.TaxCodePurchase,
                  purchasedescription: useData[i].fields.PurchaseDescription,
                  sellqty1price: utilityService.modifynegativeCurrencyFormat(useData[i].fields.SellQty1Price),
                  sellqty1priceinc: utilityService.modifynegativeCurrencyFormat(data.SellQty1PriceInc),
                  incomeaccount: useData[i].fields.IncomeAccount,
                  taxcodesales: useData[i].fields.TaxCodeSales,
                  salesdescription: useData[i].fields.SalesDescription,
                  active: useData[i].fields.Active,
                  lockextrasell: useData[i].fields.LockExtraSell,
                  customfield1: useData[i].fields.CUSTFLD1,
                  customfield2: useData[i].fields.CUSTFLD2,
                  //totalqtyinstock : totalquantity,
                  barcode: useData[i].fields.BARCODE,
                  // useData[i].fields.TotalQtyInStock,
                  totalqtyinstock: useData[i].fields.TotalQtyInStock,
                  totalqtyonorder: useData[i].fields.TotalQtyOnOrder,
                  //productclass :lineItems
                };

                setTimeout(async function () {
                  await templateObject.setEditableSelect();
                  $("#sltsalesacount").val(useData[i].fields.IncomeAccount);
                  $("#sltcogsaccount").val(useData[i].fields.CogsAccount);
                  $("#sltinventoryacount").val(useData[i].fields.AssetAccount);
                  $("#sltUomSales").val(defaultUOM);
                  $("#slttaxcodesales").val(useData[i].fields.TaxCodeSales);
                  $("#slttaxcodepurchase").val(useData[i].fields.TaxCodePurchase);
                  if (useData[i].fields.CUSTFLD14 == "true") {
                    $(".lblPriceEx").addClass("hiddenColumn");
                    $(".lblPriceEx").removeClass("showColumn");

                    $(".lblPriceInc").addClass("showColumn");
                    $(".lblPriceInc").removeClass("hiddenColumn");

                    $("#edtsellqty1priceInc").removeClass("hiddenColumn");
                    $("#edtsellqty1priceInc").addClass("showColumn");

                    $("#edtsellqty1price").addClass("hiddenColumn");
                    $("#edtsellqty1price").removeClass("showColumn");
                    $(".lblPriceCheckStatus").val("true");
                  } else if (useData[i].fields.CUSTFLD14 == "false") {
                    $(".lblPriceInc").addClass("hiddenColumn");
                    $(".lblPriceInc").removeClass("showColumn");

                    $(".lblPriceEx").addClass("showColumn");
                    $(".lblPriceEx").removeClass("hiddenColumn");

                    $("#edtsellqty1priceInc").addClass("hiddenColumn");
                    $("#edtsellqty1priceInc").removeClass("showColumn");

                    $("#edtsellqty1price").removeClass("hiddenColumn");
                    $("#edtsellqty1price").addClass("showColumn");
                    $(".lblPriceCheckStatus").val("false");
                  }
                  if (useData[i].fields.CUSTFLD15 == "true") {
                    $(".lblCostEx").addClass("hiddenColumn");
                    $(".lblCostEx").removeClass("showColumn");

                    $(".lblCostInc").addClass("showColumn");
                    $(".lblCostInc").removeClass("hiddenColumn");

                    $("#edtbuyqty1costInc").removeClass("hiddenColumn");
                    $("#edtbuyqty1costInc").addClass("showColumn");

                    $("#edtbuyqty1cost").addClass("hiddenColumn");
                    $("#edtbuyqty1cost").removeClass("showColumn");

                    $(".lblCostCheckStatus").val("true");
                  } else if (useData[i].fields.CUSTFLD15 == "false") {
                    $(".lblCostInc").addClass("hiddenColumn");
                    $(".lblCostInc").removeClass("showColumn");

                    $(".lblCostEx").addClass("showColumn");
                    $(".lblCostEx").removeClass("hiddenColumn");

                    $("#edtbuyqty1costInc").addClass("hiddenColumn");
                    $("#edtbuyqty1costInc").removeClass("showColumn");

                    $("#edtbuyqty1cost").removeClass("hiddenColumn");
                    $("#edtbuyqty1cost").addClass("showColumn");
                    $(".lblCostCheckStatus").val("false");
                  }
                }, 1000);

                if (useData[i].fields.ExtraSellPrice == null) {
                  lineExtaSellObj = {
                    lineID: Random.id(),
                    clienttype: "",
                    discount: "",
                    datefrom: "",
                    dateto: "",
                    price: 0,
                  };
                  lineExtaSellItems.push(lineExtaSellObj);
                  templateObject.productExtraSell.set(lineExtaSellItems);
                } else {
                  templateObject.isExtraSellChecked.set(true);
                  for (let e = 0; e < useData[i].fields.ExtraSellPrice.length; e++) {
                    lineExtaSellObj = {
                      lineID: Random.id(),
                      clienttype: useData[i].fields.ExtraSellPrice[e].fields.ClientTypeName || "",
                      discount: useData[i].fields.ExtraSellPrice[e].fields.QtyPercent1 || 0,
                      datefrom: useData[i].fields.ExtraSellPrice[e].fields.DateFrom || "",
                      dateto: useData[i].fields.ExtraSellPrice[e].fields.DateTo || "",
                      price:
                        utilityService.modifynegativeCurrencyFormat(
                          useData[i].fields.ExtraSellPrice[e].fields.Price1
                        ) || 0,
                    };
                    lineExtaSellItems.push(lineExtaSellObj);
                  }
                  templateObject.productExtraSell.set(lineExtaSellItems);
                }
                let itrackItem = useData[i].fields.LockExtraSell;
                if (itrackItem == true) {
                  templateObject.isTrackChecked.set(true);
                } else {
                  templateObject.isTrackChecked.set(false);
                }

                if (useData[i].fields.ProductType == "INV") {
                  templateObject.isTrackChecked.set(true);
                } else {
                  templateObject.isTrackChecked.set(false);
                }
                $("#sltsalesacount").val(useData[i].fields.IncomeAccount);
                $("#sltcogsaccount").val(useData[i].fields.CogsAccount);

                templateObject.records.set(productrecord);
              }
            }
            if (!added) {
              productService
                .getOneProductdatavs1byname(currentProductName)
                .then(function (data) {
                  $(".fullScreenSpin").css("display", "none");
                  let lineItems = [];
                  let lineItemObj = {};
                  let currencySymbol = Currency;
                  let totalquantity = 0;
                  currentProductID = data.tproduct[0].fields.ID;
                  templateObject.productID.set(currentProductID);
                  templateObject.getProductClassQtyData();
                  let productrecord = {
                    id: data.tproduct[0].fields.ID,
                    productname: data.tproduct[0].fields.ProductName,
                    lib: data.tproduct[0].fields.ProductName,
                    productcode: data.tproduct[0].fields.PRODUCTCODE,
                    productprintName: data.tproduct[0].fields.ProductPrintName,
                    assetaccount: data.tproduct[0].fields.AssetAccount,
                    buyqty1cost: utilityService.modifynegativeCurrencyFormat(data.tproduct[0].fields.BuyQty1Cost),
                    buyqty1costinc: utilityService.modifynegativeCurrencyFormat(data.BuyQty1CostInc),
                    cogsaccount: data.tproduct[0].fields.CogsAccount,
                    taxcodepurchase: data.tproduct[0].fields.TaxCodePurchase,
                    purchasedescription: data.tproduct[0].fields.PurchaseDescription,
                    sellqty1price: utilityService.modifynegativeCurrencyFormat(data.tproduct[0].fields.SellQty1Price),
                    sellqty1priceinc: utilityService.modifynegativeCurrencyFormat(data.SellQty1PriceInc),
                    incomeaccount: data.tproduct[0].fields.IncomeAccount,
                    taxcodesales: data.tproduct[0].fields.TaxCodeSales,
                    salesdescription: data.tproduct[0].fields.SalesDescription,
                    active: data.tproduct[0].fields.Active,
                    lockextrasell: data.tproduct[0].fields.LockExtraSell,
                    customfield1: data.tproduct[0].fields.CUSTFLD1,
                    customfield2: data.tproduct[0].fields.CUSTFLD2,
                    //totalqtyinstock : totalquantity,
                    barcode: data.tproduct[0].fields.BARCODE,
                    // data.TotalQtyInStock,
                    totalqtyinstock: data.tproduct[0].fields.TotalQtyInStock,
                    totalqtyonorder: data.tproduct[0].fields.TotalQtyOnOrder,
                    //productclass :lineItems
                  };

                  setTimeout(async function () {
                    await templateObject.setEditableSelect();
                    $("#sltsalesacount").val(data.tproduct[0].fields.IncomeAccount);
                    $("#sltcogsaccount").val(data.tproduct[0].fields.CogsAccount);
                    $("#sltinventoryacount").val(data.tproduct[0].fields.AssetAccount);
                    $("#sltUomSales").val(defaultUOM);
                    $("#slttaxcodesales").val(data.tproduct[0].fields.TaxCodeSales);
                    $("#slttaxcodepurchase").val(data.tproduct[0].fields.TaxCodePurchase);
                    if (data.tproduct[0].fields.CUSTFLD14 == "true") {
                      $(".lblPriceEx").addClass("hiddenColumn");
                      $(".lblPriceEx").removeClass("showColumn");

                      $(".lblPriceInc").addClass("showColumn");
                      $(".lblPriceInc").removeClass("hiddenColumn");

                      $("#edtsellqty1priceInc").removeClass("hiddenColumn");
                      $("#edtsellqty1priceInc").addClass("showColumn");

                      $("#edtsellqty1price").addClass("hiddenColumn");
                      $("#edtsellqty1price").removeClass("showColumn");
                      $(".lblPriceCheckStatus").val("true");
                    } else if (data.tproduct[0].fields.CUSTFLD14 == "false") {
                      $(".lblPriceInc").addClass("hiddenColumn");
                      $(".lblPriceInc").removeClass("showColumn");

                      $(".lblPriceEx").addClass("showColumn");
                      $(".lblPriceEx").removeClass("hiddenColumn");

                      $("#edtsellqty1priceInc").addClass("hiddenColumn");
                      $("#edtsellqty1priceInc").removeClass("showColumn");

                      $("#edtsellqty1price").removeClass("hiddenColumn");
                      $("#edtsellqty1price").addClass("showColumn");
                      $(".lblPriceCheckStatus").val("false");
                    }
                    if (data.tproduct[0].fields.CUSTFLD15 == "true") {
                      $(".lblCostEx").addClass("hiddenColumn");
                      $(".lblCostEx").removeClass("showColumn");

                      $(".lblCostInc").addClass("showColumn");
                      $(".lblCostInc").removeClass("hiddenColumn");

                      $("#edtbuyqty1costInc").removeClass("hiddenColumn");
                      $("#edtbuyqty1costInc").addClass("showColumn");

                      $("#edtbuyqty1cost").addClass("hiddenColumn");
                      $("#edtbuyqty1cost").removeClass("showColumn");

                      $(".lblCostCheckStatus").val("true");
                    } else if (data.tproduct[0].fields.CUSTFLD15 == "false") {
                      $(".lblCostInc").addClass("hiddenColumn");
                      $(".lblCostInc").removeClass("showColumn");

                      $(".lblCostEx").addClass("showColumn");
                      $(".lblCostEx").removeClass("hiddenColumn");

                      $("#edtbuyqty1costInc").addClass("hiddenColumn");
                      $("#edtbuyqty1costInc").removeClass("showColumn");

                      $("#edtbuyqty1cost").removeClass("hiddenColumn");
                      $("#edtbuyqty1cost").addClass("showColumn");
                      $(".lblCostCheckStatus").val("false");
                    }
                  }, 1000);

                  if (data.tproduct[0].fields.ExtraSellPrice == null) {
                    lineExtaSellObj = {
                      lineID: Random.id(),
                      clienttype: "",
                      discount: "",
                      datefrom: "",
                      dateto: "",
                      price: 0,
                    };
                    lineExtaSellItems.push(lineExtaSellObj);
                    templateObject.productExtraSell.set(lineExtaSellItems);
                  } else {
                    templateObject.isExtraSellChecked.set(true);
                    for (let e = 0; e < data.tproduct[0].fields.ExtraSellPrice.length; e++) {
                      lineExtaSellObj = {
                        lineID: Random.id(),
                        clienttype: data.tproduct[0].fields.ExtraSellPrice[e].fields.ClientTypeName || "",
                        discount: data.tproduct[0].fields.ExtraSellPrice[e].fields.QtyPercent1 || 0,
                        datefrom: data.tproduct[0].fields.ExtraSellPrice[e].fields.DateFrom || "",
                        dateto: data.tproduct[0].fields.ExtraSellPrice[e].fields.DateTo || "",
                        price:
                          utilityService.modifynegativeCurrencyFormat(
                            data.tproduct[0].fields.ExtraSellPrice[e].fields.Price1
                          ) || 0,
                      };
                      lineExtaSellItems.push(lineExtaSellObj);
                    }
                    templateObject.productExtraSell.set(lineExtaSellItems);
                  }
                  let itrackItem = data.tproduct[0].fields.LockExtraSell;
                  if (itrackItem == true) {
                    templateObject.isTrackChecked.set(true);
                  } else {
                    templateObject.isTrackChecked.set(false);
                  }
                  if (data.tproduct[0].fields.ProductType == "INV") {
                    templateObject.isTrackChecked.set(true);
                  } else {
                    templateObject.isTrackChecked.set(false);
                  }
                  $("#sltsalesacount").val(data.tproduct[0].fields.IncomeAccount);
                  $("#sltcogsaccount").val(data.tproduct[0].fields.CogsAccount);

                  templateObject.records.set(productrecord);
                })
                .catch(function (err) {
                  $(".fullScreenSpin").css("display", "none");
                });
            }
          }
          //templateObject.getProductClassQtyData();
        })
        .catch(function (err) {
          productService
            .getOneProductdatavs1byname(currentProductName)
            .then(function (data) {
              $(".fullScreenSpin").css("display", "none");
              let lineItems = [];
              let lineItemObj = {};
              let currencySymbol = Currency;
              let totalquantity = 0;
              currentProductID = data.tproduct[0].fields.ID;
              templateObject.productID.set(currentProductID);
              templateObject.getProductClassQtyData();
              let productrecord = {
                id: data.tproduct[0].fields.ID,
                productname: data.tproduct[0].fields.ProductName,
                lib: data.tproduct[0].fields.ProductName,
                productcode: data.tproduct[0].fields.PRODUCTCODE,
                productprintName: data.tproduct[0].fields.ProductPrintName,
                assetaccount: data.tproduct[0].fields.AssetAccount,
                buyqty1cost: utilityService.modifynegativeCurrencyFormat(data.tproduct[0].fields.BuyQty1Cost),
                buyqty1costinc: utilityService.modifynegativeCurrencyFormat(data.BuyQty1CostInc),
                cogsaccount: data.tproduct[0].fields.CogsAccount,
                taxcodepurchase: data.tproduct[0].fields.TaxCodePurchase,
                purchasedescription: data.tproduct[0].fields.PurchaseDescription,
                sellqty1price: utilityService.modifynegativeCurrencyFormat(data.tproduct[0].fields.SellQty1Price),
                sellqty1priceinc: utilityService.modifynegativeCurrencyFormat(data.SellQty1PriceInc),
                incomeaccount: data.tproduct[0].fields.IncomeAccount,
                taxcodesales: data.tproduct[0].fields.TaxCodeSales,
                salesdescription: data.tproduct[0].fields.SalesDescription,
                active: data.tproduct[0].fields.Active,
                lockextrasell: data.tproduct[0].fields.LockExtraSell,
                customfield1: data.tproduct[0].fields.CUSTFLD1,
                customfield2: data.tproduct[0].fields.CUSTFLD2,
                //totalqtyinstock : totalquantity,
                barcode: data.tproduct[0].fields.BARCODE,
                // data.TotalQtyInStock,
                totalqtyonorder: data.tproduct[0].fields.TotalQtyOnOrder,
                totalqtyinstock: data.tproduct[0].fields.TotalQtyInStock,
                //productclass :lineItems
              };
              setTimeout(async function () {
                await templateObject.setEditableSelect();
                $("#sltsalesacount").val(data.tproduct[0].fields.IncomeAccount);
                $("#sltcogsaccount").val(data.tproduct[0].fields.CogsAccount);
                $("#sltinventoryacount").val(data.tproduct[0].fields.AssetAccount);
                $("#sltUomSales").val(defaultUOM);
                $("#slttaxcodesales").val(data.tproduct[0].fields.TaxCodeSales);
                $("#slttaxcodepurchase").val(data.tproduct[0].fields.TaxCodePurchase);
                if (data.tproduct[0].fields.CUSTFLD14 == "true") {
                  $(".lblPriceEx").addClass("hiddenColumn");
                  $(".lblPriceEx").removeClass("showColumn");

                  $(".lblPriceInc").addClass("showColumn");
                  $(".lblPriceInc").removeClass("hiddenColumn");

                  $("#edtsellqty1priceInc").removeClass("hiddenColumn");
                  $("#edtsellqty1priceInc").addClass("showColumn");

                  $("#edtsellqty1price").addClass("hiddenColumn");
                  $("#edtsellqty1price").removeClass("showColumn");
                  $(".lblPriceCheckStatus").val("true");
                } else if (data.tproduct[0].fields.CUSTFLD14 == "false") {
                  $(".lblPriceInc").addClass("hiddenColumn");
                  $(".lblPriceInc").removeClass("showColumn");

                  $(".lblPriceEx").addClass("showColumn");
                  $(".lblPriceEx").removeClass("hiddenColumn");

                  $("#edtsellqty1priceInc").addClass("hiddenColumn");
                  $("#edtsellqty1priceInc").removeClass("showColumn");

                  $("#edtsellqty1price").removeClass("hiddenColumn");
                  $("#edtsellqty1price").addClass("showColumn");
                  $(".lblPriceCheckStatus").val("false");
                }
                if (data.tproduct[0].fields.CUSTFLD15 == "true") {
                  $(".lblCostEx").addClass("hiddenColumn");
                  $(".lblCostEx").removeClass("showColumn");

                  $(".lblCostInc").addClass("showColumn");
                  $(".lblCostInc").removeClass("hiddenColumn");

                  $("#edtbuyqty1costInc").removeClass("hiddenColumn");
                  $("#edtbuyqty1costInc").addClass("showColumn");

                  $("#edtbuyqty1cost").addClass("hiddenColumn");
                  $("#edtbuyqty1cost").removeClass("showColumn");

                  $(".lblCostCheckStatus").val("true");
                } else if (data.tproduct[0].fields.CUSTFLD15 == "false") {
                  $(".lblCostInc").addClass("hiddenColumn");
                  $(".lblCostInc").removeClass("showColumn");

                  $(".lblCostEx").addClass("showColumn");
                  $(".lblCostEx").removeClass("hiddenColumn");

                  $("#edtbuyqty1costInc").addClass("hiddenColumn");
                  $("#edtbuyqty1costInc").removeClass("showColumn");

                  $("#edtbuyqty1cost").removeClass("hiddenColumn");
                  $("#edtbuyqty1cost").addClass("showColumn");
                  $(".lblCostCheckStatus").val("false");
                }
              }, 1000);
              if (data.tproduct[0].fields.ExtraSellPrice == null) {
                lineExtaSellObj = {
                  lineID: Random.id(),
                  clienttype: "",
                  discount: "",
                  datefrom: "",
                  dateto: "",
                  price: 0,
                };
                lineExtaSellItems.push(lineExtaSellObj);
                templateObject.productExtraSell.set(lineExtaSellItems);
              } else {
                templateObject.isExtraSellChecked.set(true);
                for (let e = 0; e < data.tproduct[0].fields.ExtraSellPrice.length; e++) {
                  lineExtaSellObj = {
                    lineID: Random.id(),
                    clienttype: data.tproduct[0].fields.ExtraSellPrice[e].fields.ClientTypeName || "",
                    discount: data.tproduct[0].fields.ExtraSellPrice[e].fields.QtyPercent1 || 0,
                    datefrom: data.tproduct[0].fields.ExtraSellPrice[e].fields.DateFrom || "",
                    dateto: data.tproduct[0].fields.ExtraSellPrice[e].fields.DateTo || "",
                    price:
                      utilityService.modifynegativeCurrencyFormat(
                        data.tproduct[0].fields.ExtraSellPrice[e].fields.Price1
                      ) || 0,
                  };
                  lineExtaSellItems.push(lineExtaSellObj);
                }
                templateObject.productExtraSell.set(lineExtaSellItems);
              }
              let itrackItem = data.tproduct[0].fields.LockExtraSell;
              if (itrackItem == true) {
                templateObject.isTrackChecked.set(true);
              } else {
                templateObject.isTrackChecked.set(false);
              }
              if (data.tproduct[0].fields.ProductType == "INV") {
                templateObject.isTrackChecked.set(true);
              } else {
                templateObject.isTrackChecked.set(false);
              }
              $("#sltsalesacount").val(data.tproduct[0].fields.IncomeAccount);
              $("#sltcogsaccount").val(data.tproduct[0].fields.CogsAccount);

              templateObject.records.set(productrecord);
            })
            .catch(function (err) {
              $(".fullScreenSpin").css("display", "none");
            });
        });

      setTimeout(function () {
        var begin_day_value = $("#event_begin_day").attr("value");
        $("#dtDateTo")
          .datepicker({
            showOn: "button",
            buttonText: "Show Date",
            buttonImageOnly: true,
            buttonImage: "/img/imgCal2.png",
            constrainInput: false,
            dateFormat: "d/mm/yy",
            showOtherMonths: true,
            selectOtherMonths: true,
            changeMonth: true,
            changeYear: true,
            yearRange: "-90:+10",
          })
          .keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
              $("#dtDateTo,#dtDateFrom").val("");
            }
          });

        $("#dtDateFrom")
          .datepicker({
            showOn: "button",
            buttonText: "Show Date",
            altField: "#dtDateFrom",
            buttonImageOnly: true,
            buttonImage: "/img/imgCal2.png",
            constrainInput: false,
            dateFormat: "d/mm/yy",
            showOtherMonths: true,
            selectOtherMonths: true,
            changeMonth: true,
            changeYear: true,
            yearRange: "-90:+10",
          })
          .keyup(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) {
              $("#dtDateTo,#dtDateFrom").val("");
            }
          });

        $(".ui-datepicker .ui-state-hihglight").removeClass("ui-state-highlight");
        // var usedNames = {};
        // $("select[name='sltCustomerType'] > option").each(function () {
        //     if(usedNames[this.text]) {
        //         $(this).remove();
        //     } else {
        //         usedNames[this.text] = this.value;
        //     }
        // });

        // $('#sltCustomerType').append(' <option value="newCust"><span class="addType">+ Client Type</span></option>');
      }, 1000);
    };

    templateObject.getProductClassQtyData = function () {
      productService.getOneProductClassQtyData(currentProductID).then(function (data) {
          $(".fullScreenSpin").css("display", "none");
          let qtylineItems = [];
          let qtylineItemObj = {};
          let currencySymbol = Currency;
          let totaldeptquantity = 0;

          for (let j in data.tproductclassquantity) {
            qtylineItemObj = {
              department: data.tproductclassquantity[j].DepartmentName || "",
              quantity: data.tproductclassquantity[j].InStockQty || 0,
            };
            totaldeptquantity += data.tproductclassquantity[j].InStockQty;
            qtylineItems.push(qtylineItemObj);
          }
          // $('#edttotalqtyinstock').val(totaldeptquantity);
          templateObject.productqtyrecords.set(qtylineItems);
          updateBinNumberSelect();
          templateObject.totaldeptquantity.set(totaldeptquantity);
        })
        .catch(function (err) {
          $(".fullScreenSpin").css("display", "none");
        });
    };

    //templateObject.getProductClassQtyData();
    templateObject.getProductData();

    templateObject.getAllProductRecentTransactions = function () {
      // productService.getProductRecentTransactionsAll(currentProductID).then(function(data) {
      //     recentTransList = [];
      //     for (let i = 0; i < data.t_vs1_report_productmovement.length; i++) {
      //         let recentTranObject = {
      //             date: data.t_vs1_report_productmovement[i].TransactionDate != '' ? moment(data.t_vs1_report_productmovement[i].TransactionDate).format("DD/MM/YYYY") : data.t_vs1_report_productmovement[i].TransactionDate,
      //             type: data.t_vs1_report_productmovement[i].TranstypeDesc,
      //             transactionno: data.t_vs1_report_productmovement[i].TransactionNo,
      //             reference: data.t_vs1_report_productmovement[i].TransactionNo,
      //             quantity: data.t_vs1_report_productmovement[i].Qty,
      //             unitPrice: utilityService.modifynegativeCurrencyFormat(data.t_vs1_report_productmovement[i].Price),
      //             total: utilityService.modifynegativeCurrencyFormat(data.t_vs1_report_productmovement[i].TotalPrice)
      //         };
      //         recentTransList.push(recentTranObject);
      //     }
      //     templateObject.recentTrasactions.set(recentTransList);
      //     setTimeout(function() {
      //         $('#productrecentlist').DataTable({
      //             "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
      //             select: true,
      //             destroy: true,
      //             colReorder: true,
      //             // bStateSave: true,
      //             // rowId: 0,
      //             pageLength: initialDatatableLoad,
      //             lengthMenu: [
      //                 [initialDatatableLoad, -1],
      //                 [initialDatatableLoad, "All"]
      //             ],
      //             info: true,
      //             responsive: true,
      //             "order": [[0, "desc"],[3, "desc"]],
      //             action: function() {
      //                 $('#productrecentlist').DataTable().ajax.reload();
      //             },
      //             "fnDrawCallback": function(oSettings) {
      //                 $('.paginate_button.page-item').removeClass('disabled');
      //                 $('#tblPaymentOverview_ellipsis').addClass('disabled');
      //                 if (oSettings._iDisplayLength == -1) {
      //                     if (oSettings.fnRecordsDisplay() > 150) {
      //                         $('.paginate_button.page-item.previous').addClass('disabled');
      //                         $('.paginate_button.page-item.next').addClass('disabled');
      //                     }
      //                 } else {}
      //                 if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
      //                     $('.paginate_button.page-item.next').addClass('disabled');
      //                 }
      //                 $('.paginate_button.next:not(.disabled)', this.api().table().container())
      //                     .on('click', function() {
      //                         $('.fullScreenSpin').css('display', 'inline-block');
      //                         var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
      //                         var dateTo = new Date($("#dateTo").datepicker("getDate"));
      //                         let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
      //                         let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
      //                         if(data.Params.IgnoreDates == true){
      //                             sideBarService.getNewProductListVS1(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay(),viewdeleted).then(function(dataObjectnew) {
      //                                 addVS1Data('TProductVS1', JSON.stringify(dataReload)).then(function(datareturn) {
      //                                     if (dataObjectold.length == 0) {} else {
      //                                         let dataOld = JSON.parse(dataObjectold[0].data);
      //                                         var thirdaryData = $.merge($.merge([], dataObjectnew.TProductVS1), dataOld.TProductVS1);
      //                                         let objCombineData = {
      //                                             Params: dataOld.Params,
      //                                             TProductVS1: thirdaryData
      //                                         }
      //                                         addVS1Data('TProductVS1', JSON.stringify(objCombineData)).then(function(datareturn) {
      //                                             templateObject.resetData(objCombineData);
      //                                             $('.fullScreenSpin').css('display', 'none');
      //                                         }).catch(function(err) {
      //                                             $('.fullScreenSpin').css('display', 'none');
      //                                         });
      //                                     }
      //                                 }).catch(function(err) {});
      //                             }).catch(function(err) {
      //                                 $('.fullScreenSpin').css('display', 'none');
      //                             });
      //                         } else {
      //                             sideBarService.getNewProductListVS1(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay(),viewdeleted).then(function(dataObjectnew) {
      //                                 addVS1Data('TProductVS1', JSON.stringify(dataReload)).then(function(datareturn) {
      //                                     if (dataObjectold.length == 0) {} else {
      //                                         let dataOld = JSON.parse(dataObjectold[0].data);
      //                                         var thirdaryData = $.merge($.merge([], dataObjectnew.TProductVS1), dataOld.TProductVS1);
      //                                         let objCombineData = {
      //                                             Params: dataOld.Params,
      //                                             TProductVS1: thirdaryData
      //                                         }
      //                                         addVS1Data('TProductVS1', JSON.stringify(objCombineData)).then(function(datareturn) {
      //                                             templateObject.resetData(objCombineData);
      //                                             $('.fullScreenSpin').css('display', 'none');
      //                                         }).catch(function(err) {
      //                                             $('.fullScreenSpin').css('display', 'none');
      //                                         });
      //                                     }
      //                                 }).catch(function(err) {});
      //                             }).catch(function(err) {
      //                                 $('.fullScreenSpin').css('display', 'none');
      //                             });
      //                         }
      //                     });
      //                 //}
      //                 setTimeout(function() {
      //                     MakeNegative();
      //                 }, 100);
      //             },
      //         }).on('page', function() {}).on('column-reorder', function() {});
      //         $('div.dataTables_filter input').addClass('form-control form-control-sm');
      //         $('.fullScreenSpin').css('display', 'none');
      //     }, 0);
      //     $('#productrecentlist tbody').on('click', 'tr', function() {
      //         var listData = $(this).closest('tr').attr('id');
      //         var transactiontype = $(event.target).closest("tr").find(".transactiontype").text();
      //         if ((listData) && (transactiontype)) {
      //             if (transactiontype === 'Quote') {
      //                 window.open('/quotecard?id=' + listData, '_self');
      //             } else if (transactiontype === 'Sales Order') {
      //                 window.open('/salesordercard?id=' + listData, '_self');
      //             } else if (transactiontype === 'Invoice') {
      //                 window.open('/invoicecard?id=' + listData, '_self');
      //             } else if (transactiontype === 'Purchase Order') {
      //                 window.open('/purchaseordercard?id=' + listData, '_self');
      //             } else if (transactiontype === 'Bill') {
      //                 //window.open('/billcard?id=' + listData,'_self');
      //             } else if (transactiontype === 'Credit') {
      //                 //window.open('/creditcard?id=' + listData,'_self');
      //             }
      //         }
      //     });
      //     $('.product_recent_trans').css('display', 'block');
      //     $('.fullScreenSpin').css('display', 'none');
      //     $([document.documentElement, document.body]).animate({
      //         scrollTop: $(".product_recent_trans").offset().top
      //     }, 2000);
      // }).catch(function(err) {
      //     $('.fullScreenSpin').css('display', 'none');
      //     $('.product_recent_trans').css('display', 'block');
      //     $([document.documentElement, document.body]).animate({
      //         scrollTop: $(".product_recent_trans").offset().top
      //     }, 2000);
      //     //Bert.alert('<strong>' + err + '</strong>!', 'deleting products failed');
      // });
    };
  } else {
    let purchasetaxcode = "";
    let salestaxcode = "";
    let productrecord = "";
    setTimeout(async function () {
      await templateObject.setEditableSelect();
      $(".colSalesAccount:first").find("#sltsalesacount").val("Sales");
      $(".colCOGSaccount").find("#sltcogsaccount").val("Cost of Goods Sold");
      $("#trackdiv").find("#sltinventoryacount").val("Inventory Asset");
      $("#sltCustomerType").val("Default");
      $("#sltUomSales").val(defaultUOM);
      $("#slttaxcodesales").val("GST");
      $("#slttaxcodepurchase").val("NCG");
    }, 1000);
    productrecord = {
      id: "",
      productname: "",
      lib: "New Product",
      productcode: "",
      productprintName: "",
      assetaccount: "Inventory Asset",
      buyqty1cost: 0,
      buyqty1costinc: 0,
      cogsaccount: "Cost of Goods Sold",
      taxcodepurchase: "",
      purchasedescription: "",
      sellqty1price: 0,
      sellqty1priceinc: 0,
      incomeaccount: "Sales",
      taxcodesales: "",
      salesdescription: "",
      active: "",
      lockextrasell: "",
      customfield1: "",
      customfield2: "",
      //totalqtyinstock : totalquantity,
      barcode: "",
      // data.TotalQtyInStock,
      totalqtyonorder: 0,
      totalqtynstock: 0,
      //productclass :lineItems
    };

    templateObject.records.set(productrecord);
    templateObject.isShowBOMModal.set(true);
    lineExtaSellObj = {
      lineID: Random.id(),
      clienttype: "Default",
      discount: "",
      datefrom: "",
      dateto: "",
      price: 0,
    };
    lineExtaSellItems.push(lineExtaSellObj);
    templateObject.productExtraSell.set(lineExtaSellItems);
    //setTimeout(function () {
    Meteor.call("readPrefMethod", localStorage.getItem("mycloudLogonID"), "defaulttax", function (error, result) {
      if (error) {
        purchasetaxcode = loggedTaxCodePurchaseInc;
        salestaxcode = loggedTaxCodeSalesInc;
        productrecord = {
          id: "",
          productname: "",
          lib: "New Product",
          productcode: "",
          productprintName: "",
          assetaccount: "Inventory Asset" || "",
          buyqty1cost: 0,
          buyqty1costinc: 0,
          cogsaccount: "Cost of Goods Sold" || "",
          taxcodepurchase: purchasetaxcode || "",
          purchasedescription: "",
          sellqty1price: 0,
          sellqty1priceinc: 0,
          incomeaccount: "Sales" || "",
          taxcodesales: salestaxcode || "",
          salesdescription: "",
          active: "",
          lockextrasell: "",
          barcode: "",
          totalqtyonorder: 0,
          totalqtyinstock: 0,
        };

        templateObject.records.set(productrecord);
        templateObject.isShowBOMModal.set(true);
      } else {
        if (result) {
          purchasetaxcode = result.customFields[0].taxvalue || loggedTaxCodePurchaseInc;
          salestaxcode = result.customFields[1].taxvalue || loggedTaxCodeSalesInc;
          productrecord = {
            id: "",
            productname: "",
            lib: "New Product",
            productcode: "",
            productprintName: "",
            assetaccount: "Inventory Asset" || "",
            buyqty1cost: 0,
            buyqty1costinc: 0,
            cogsaccount: "Cost of Goods Sold" || "",
            taxcodepurchase: purchasetaxcode || "",
            purchasedescription: "",
            sellqty1price: 0,
            sellqty1priceinc: 0,
            incomeaccount: "Sales" || "",
            taxcodesales: salestaxcode || "",
            salesdescription: "",
            active: "",
            lockextrasell: "",
            barcode: "",
            totalqtyonorder: 0,
            totalqtyinstock: 0,
          };

          templateObject.records.set(productrecord);
          templateObject.isShowBOMModal.set(true);
        }
      }
    });
    //}, 500);

    $(".fullScreenSpin").css("display", "none");
    // templateObject.getAllLastInvDatas();
    setTimeout(function () {
      $(".recenttrasaction").css("display", "none");
    }, 500);
  }

  if (FlowRouter.current().queryParams.instock) {
    templateObject.getAllProductRecentTransactions();
  }

  $(document).ready(function () {
    $(".edtProductName").editableSelect();
    $("#edtProcess").editableSelect();
  });

  // $(document).on('click', '.new_attachment_btn', function(event) {
  //     let inputEle = $(event.target).closest('.modal-footer').find('.attachment-upload');
  //     $(inputEle).trigger('click');
  // })

  // $(document).on('change', '.attachment-upload', async function(event) {
  //     let myFiles = $(event.target)[0].files;
  //     let saveToTAttachment = false;
  //     let lineIDForAttachment = false;
  //     let modalId = $(event.target).closest('.modal').attr('id');
  //     let existingArray = JSON.parse($(templateObject.selectedAttachedField.get()).text()!=''?$(templateObject.selectedAttachedField.get()).text() : '[]').uploadedFilesArray || []
  //     let uploadData = await utilityService.customAttachmentUpload(existingArray, myFiles, saveToTAttachment, lineIDForAttachment, modalId);
  //     templateObject.selectedAttachedField.get().html(JSON.stringify(uploadData))
  //     let attachmentButton = $(templateObject.selectedAttachedField.get()).closest('.colAttachment').find('.btnAddAttachment');
  //     let attachCount = uploadData.totalAttachments;
  //     attachmentButton.html(attachCount + "     <i class='fa fa-paperclip' style='padding-right: 8px;'></i>Add Attachments")
  // })

  // $(document).on('click', '.remove-attachment', function(event) {
  //     let className = $(event.target).attr('class')
  //     let attachmentID = parseInt(className.split('remove-attachment-')[1]);
  //     let modalId = $(event.target).closest('.modal').attr("id");

  //     if ($("#"+modalId+" .confirm-action-" + attachmentID).length) {
  //         $("#"+modalId+" .confirm-action-" + attachmentID).remove();
  //     } else {
  //         let actionElement = '<div class="confirm-action confirm-action-' + attachmentID + '"><a class="confirm-delete-attachment btn btn-default delete-attachment-' + attachmentID + '">' +
  //             'Delete</a><button class="save-to-library btn btn-default">Remove & save to File Library</button></div>';
  //         $('#'+modalId + ' .attachment-name-' + attachmentID).append(actionElement);
  //     }
  //     $("#new-attachment2-tooltip").show();
  // })

  // $(document).on('click', '.confirm-delete-attachment', function(event) {
  //     templateObject.$("#new-attachment2-tooltip").show();
  //     let className = $(event.target).attr('class')
  //     let attachmentID = parseInt(className.split('delete-attachment-')[1]);
  //     let uploadedElement = templateObject.selectedAttachedField.get();
  //     let uploadedArray = JSON.parse(uploadedElement.text()).uploadedFilesArray;
  //     // let uploadedArray = templateObject.uploadedFiles.get();
  //     // let attachmentCount = templateObject.attachmentCount.get();
  //     let modalId = $(event.target).closest('.modal').attr('id');
  //     $('#'+modalId+' .attachment-upload').val('');
  //     uploadedArray.splice(attachmentID, 1);
  //     let newObject = {
  //         totalAttachments: uploadedArray.length,
  //        uploadedFilesArray: uploadedArray
  //     }
  //     $(templateObject.selectedAttachedField.get()).text(JSON.stringify(newObject))

  //     let attachmentButton = $(templateObject.selectedAttachedField.get()).closest('.colAttachment').find('.btnAddAttachment');
  //     let attachCount = uploadedArray.length;
  //     attachmentButton.html(attachCount + "     <i class='fa fa-paperclip' style='padding-right: 8px;'></i>Add Attachments")

  //     if(uploadedArray.length === 0) {
  //         attachmentButton.html("<i class='fa fa-paperclip' style='padding-right: 8px;'></i>Add Attachments")
  //         let elementToAdd = '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
  //             $('#'+modalId + ' .file-display').html(elementToAdd);
  //             $(".attchment-tooltip").show();
  //     }else {
  //         utilityService.customShowUploadedAttachment(uploadedArray, modalId)
  //     }

  //     // templateObject.uploadedFiles.set(uploadedArray);
  //     // attachmentCount--;
  //     // if (attachmentCount === 0) {
  //     //     let elementToAdd = '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
  //     //     $('#file-display').html(elementToAdd);
  //     // }
  //     // templateObject.attachmentCount.set(attachmentCount);
  //     // if (uploadedArray.length > 0) {
  //     //     let utilityService = new UtilityService();
  //     //     utilityService.showUploadedAttachment(uploadedArray);
  //     // } else {
  //     //     $(".attchment-tooltip").show();
  //     // }
  // })
});

Template.productview.helpers({

    productrecord: () => {
        return Template.instance().records.get();
    },
    taxraterecords: () => {
        return Template.instance().taxraterecords.get();
    },
    binnumber: () => {
      return Template.instance().binnumber.get();
    },
    binlocation: () => {
      return Template.instance().binlocation.get();
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
    binrecords: () => {
        return Template.instance().binrecords.get().sort(function(a, b) {
            if (a.binnumber == 'NA') {
                return 1;
            } else if (b.binnumber == 'NA') {
                return -1;
            }
            return (a.binnumber.toUpperCase() > b.binnumber.toUpperCase()) ? 1 : -1;
        });
    },
    binarray: () =>{

      let binData = Template.instance().binrecords.get().sort(function(a, b) {
        if (a.binnumber == 'NA') {
          return 1;
        } else if (b.binnumber == 'NA') {
          return -1;
        }
        return (a.binnumber.toUpperCase() > b.binnumber.toUpperCase()) ? 1 : -1;
      });
      let sortFunction = function(a, b) {
        if (a.binnumber === b.binnumber) {
          return 0;
        } else {
          return (a.binnumber - 0 < b.binnumber - 0) ? -1 : 1;
        }
      }
      return binData.sort(sortFunction);
    },
    binlocationarray: () =>{

      let binData = Template.instance().binrecords.get();
      let usedData = {};
      let locationarray = [];
      binData.forEach(item =>{
        if(usedData[item.binlocation + item.binclass] == undefined)
          locationarray.push(item), usedData[item.binlocation + item.binclass] = true;
      });
      let sortFunction = function(a, b) {
        if (a.binlocation === b.binlocation) {
          return 0;
        } else {
          return (a.binlocation < b.binlocation) ? -1 : 1;
        }
      }
      return locationarray.sort(sortFunction);
    },
    bindept: () => {
      return Template.instance().bindept.get();
    },
    tserialnumberList: () => {
        return Template.instance().tserialnumberList.get();
    },
    tlotnumberList: () => {
        return Template.instance().tlotnumberList.get();
    },
    recentTrasactions: () => {
        return Template.instance().recentTrasactions.get();
    },
    coggsaccountrecords: () => {
        return Template.instance().coggsaccountrecords.get().sort(function(a, b) {
            if (a.accountname == 'NA') {
                return 1;
            } else if (b.accountname == 'NA') {
                return -1;
            }
            return (a.accountname.toUpperCase() > b.accountname.toUpperCase()) ? 1 : -1;
        });
    },
    salesaccountrecords: () => {
        return Template.instance().salesaccountrecords.get().sort(function(a, b) {
            if (a.accountname == 'NA') {
                return 1;
            } else if (b.accountname == 'NA') {
                return -1;
            }
            return (a.accountname.toUpperCase() > b.accountname.toUpperCase()) ? 1 : -1;
        });
    },
    inventoryaccountrecords: () => {
        return Template.instance().inventoryaccountrecords.get()
            .sort(function(a, b) {
                if (a.accountname == 'NA') {
                    return 1;
                } else if (b.accountname == 'NA') {
                    return -1;
                }
                return (a.accountname.toUpperCase() > b.accountname.toUpperCase()) ? 1 : -1;
            });
    },
    productqtyrecords: () => {
        return Template.instance().productqtyrecords.get().sort(function(a, b) {
            if (a.department == 'NA') {
                return 1;
            } else if (b.department == 'NA') {
                return -1;
            }
            return (a.department.toUpperCase() > b.department.toUpperCase()) ? 1 : -1;
        });
    },
    productExtraSell: () => {
        return Template.instance().productExtraSell.get().sort(function(a, b) {
            if (a.clienttype == 'NA') {
                return 1;
            } else if (b.clienttype == 'NA') {
                return -1;
            }
            return (a.clienttype.toUpperCase() > b.clienttype.toUpperCase()) ? 1 : -1;
        });
    },
    totaldeptquantity: () => {
        return Template.instance().totaldeptquantity.get();
    },
    productsCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: localStorage.getItem('mycloudLogonID'),
            PrefName: 'productview'
        });
    },
    isSNTrackChecked: () => {
        let templateObj = Template.instance();
        return templateObj.isSNTrackChecked.get();
    },
    isTrackChecked: () => {
        let templateObj = Template.instance();
        return templateObj.isTrackChecked.get();
    },
    isExtraSellChecked: () => {
        let templateObj = Template.instance();
        return templateObj.isExtraSellChecked.get();
    },
    includeInventory: () => {
        return Template.instance().includeInventory.get();
    },
    clienttypeList: () => {
        return Template.instance().clienttypeList.get().sort(function(a, b) {
            if (a == 'NA') {
                return 1;
            } else if (b == 'NA') {
                return -1;
            }
            return (a.toUpperCase() > b.toUpperCase()) ? 1 : -1;
        });
    },
    isMobileDevices:()=>{
        return Template.instance().isMobileDevices.get()
    },
    isManufactured:() =>{
        return Template.instance().isManufactured.get();
    },
    showBomModal: ()=>{
        return Template.instance().isShowBOMModal.get();
    },
    productID: () => {
        return Template.instance().productID.get();
    },

    custfields:()=>{
      return Template.instance().custfields.get();
    }
});

Template.productview.events({
  "click .trackProdQty": function (event) {
    $(".fullScreenSpin").css("display", "inline-block");
    let templateObject = Template.instance();
    templateObject.getAllProductRecentTransactions();
  },
  "click #sltCustomerType": (e) => {
    setTimeout(() => {
      $('#tblClienttypeList_filter .form-control-sm').get(0).focus()
    }, 500)
  },
  "click .lblPriceEx": function (event) {
    $(event.target).removeClass("showColumn");
    $(event.target).addClass("hiddenColumn");
    // $('.lblPriceEx').addClass('hiddenColumn');
    // $('.lblPriceEx').removeClass('showColumn');
    formGroup = $(event.target).closest(".form-group");
    formGroup.find(".lblPriceInc").addClass("showColumn");
    formGroup.find(".lblPriceInc").removeClass("removeColumn");
    // $(event.target).closest('.lblPriceInc').addClass('showColumn');
    // $(event.target).closest('.lblPriceInc').removeClass('hiddenColumn');

    $(event.target).closest("#edtsellqty1priceInc").removeClass("hiddenColumn");
    $(event.target).closest("#edtsellqty1priceInc").addClass("showColumn");

    $(event.target).closest("#edtsellqty1price").addClass("hiddenColumn");
    $(event.target).closest("#edtsellqty1price").removeClass("showColumn");
    $(event.target).closest(".lblPriceCheckStatus").val("true");
  },
  "click .lblPriceInc": function (event) {
    $(event.target).closest(".lblPriceInc").addClass("hiddenColumn");
    $(event.target).closest(".lblPriceInc").removeClass("showColumn");
    formGroup = $(event.target).closest(".form-group");
    formGroup.find(".lblPriceEx").addClass("showColumn");
    formGroup.find(".lblPriceEx").removeClass("removeColumn");
    // $(event.target).closest('.lblPriceEx').addClass('showColumn');
    // $(event.target).closest('.lblPriceEx').removeClass('hiddenColumn');

    $(event.target).closest("#edtsellqty1priceInc").addClass("hiddenColumn");
    $(event.target).closest("#edtsellqty1priceInc").removeClass("showColumn");

    $(event.target).closest("#edtsellqty1price").removeClass("hiddenColumn");
    $(event.target).closest("#edtsellqty1price").addClass("showColumn");
    $(event.target).closest(".lblPriceCheckStatus").val("false");
  },
  "click .lblCostEx": function (event) {
    // $(event.target).addClass("hiddenColmn");
    // $(event.target).removeClass("showColumn");
    $(event.target).closest(".lblCostEx").addClass("hiddenColumn");
    $(event.target).closest(".lblCostEx").removeClass("showColumn");
    formGroup = $(event.target).closest(".form-group");
    formGroup.find(".lblCostInc").addClass("showColumn");
    formGroup.find(".lblCostInc").removeClass("hiddenColumn");

    $(event.target).closest("#edtbuyqty1costInc").removeClass("hiddenColumn");
    $(event.target).closest("#edtbuyqty1costInc").addClass("showColumn");

    $(event.target).closest("#edtbuyqty1cost").addClass("hiddenColumn");
    $(event.target).closest("#edtbuyqty1cost").removeClass("showColumn");

    $(event.target).closest(".lblCostCheckStatus").val("true");
  },
  "click .lblCostInc": function (event) {
    $(event.target).closest(".lblCostInc").addClass("hiddenColumn");
    $(event.target).closest(".lblCostInc").removeClass("showColumn");
    formGroup = $(event.target).closest(".form-group");
    formGroup.find(".lblCostEx").addClass("showColumn");
    formGroup.find(".lblCostEx").removeClass("hiddenColumn");

    $(event.target).closest("#edtbuyqty1costInc").addClass("hiddenColumn");
    $(event.target).closest("#edtbuyqty1costInc").removeClass("showColumn");

    $(event.target).closest("#edtbuyqty1cost").removeClass("hiddenColumn");
    $(event.target).closest("#edtbuyqty1cost").addClass("showColumn");
    $(event.target).closest(".lblCostCheckStatus").val("false");
  },
  "click #sltsalesacount": function (event) {
    // $('#edtassetaccount').select();
    // $('#edtassetaccount').editableSelect();
  },
  "click .inventorynottracking": function (event) {
    swal("Please enable this feature in Access Setting!", "", "info");
  },
  "click .inventorytrackingTest": function (event) {
    if ($(event.target).is(":checked")) {
      swal("Info", "If Inventory tracking is turned on it cannot be disabled in the future.", "info");
    }
  },
  "click #loadrecenttransaction": function (event) {
    toggleRecentTransaction();
  },
  'click #chkDelivery':function(){
    Session.setDefault('is_creating_new_topic', false);
    if(Session.get('is_creating_new_topic')) {
      Session.set('is_creating_new_topic', false);
    }else{
      Session.set('is_creating_new_topic', true);
    }
  },
  "click #btnSave": async function () {
    playSaveAudio();
    let templateObject = Template.instance();
    let checkBOM = $("#chkBOM").prop("checked") ? true : false;  // check BOM

   // let getIsManufactured = (await templateObject.isManufactured.get()) || false;
    let getIsManufactured = checkBOM;

    setTimeout(async function () {
      let productCode = $("#edtproductcode").val();
      let productName = $("#edtproductname").val();
      var objDetails = "";
      let lineExtaSellItems = [];
      let lineExtaSellObj = {};

      let lastPriceSetting = $(".lblPriceCheckStatus").val() || "true";
      let lastCostSetting = $(".lblCostCheckStatus").val() || "true";
      $(".fullScreenSpin").css("display", "inline-block");

      let itrackThisItem = false;
      if ($('input[name="chkTrack"]').is(":checked")) {
        itrackThisItem = true;
      } else {
        itrackThisItem = false;
      }

      if (productName == "") {
        swal("Please provide the product name !", "", "warning");
        $(".fullScreenSpin").css("display", "none");
        e.preventDefault();
        return false;
      }

      let TaxCodePurchase = $("#slttaxcodepurchase").val() || "P";
      let TaxCodeSales = $("#slttaxcodesales").val() || "S";
      if (TaxCodePurchase == "" || TaxCodeSales == "") {
        swal("Please fill Tax rate !", "", "warning");
        $(".fullScreenSpin").css("display", "none");
        e.preventDefault();
        return false;
      }

      let getchkcustomField1 = true;
      let getchkcustomField2 = true;
      // let getcustomField1 = $('.customField1Text').html();
      // let getcustomField2 = $('.customField2Text').html();
      // let getcustomField3 = $('.customField3Text').html();

      if ($("#formCheck-one").is(":checked")) {
        getchkcustomField1 = false;
      }
      if ($("#formCheck-two").is(":checked")) {
        getchkcustomField2 = false;
      }

      // let customField1 = $("#txtCustomField1").val();
      // let customField2 = $("#txtCustomField2").val();

      // add to custom field
      let customField1 = $("#edtSaleCustField1").val() || "";
      let customField2 = $("#edtSaleCustField2").val() || "";
      let customField3 = $("#edtSaleCustField3").val() || "";

      // Feature/ser-lot-tracking: Check if serial and lot number checkboxes and save them
      let trackSerialNumber = $("#chkSNTrack").prop("checked") ? "true" : "false";
      let trackLotNumber = $("#chkLotTrack").prop("checked") ? "true" : "false";
      let allowAddSerialNumber = $("#chkAddSN").prop("checked") ? "true" : "false";

      var url = FlowRouter.current().path;
      var getso_id = url.split("?id=") ;
      var currentID = FlowRouter.current().queryParams.id || templateObject.data.id || 0;

      if ($("#chkSellPrice").is(":checked")) {
        $(".itemExtraSellRow").each(function () {
          var lineID = this.id;
          let tdclientType = $("#" + lineID + " .sltCustomerType").val();
          let tdDiscount = $("#" + lineID + " .edtDiscount").val();

          lineExtaSellObj = {
            type: "TProductExtraSellPrice",
            fields: {
              AllClients: false,
              ClientTypeName: tdclientType || "",
              QtyPercent1: parseFloat(tdDiscount) || 0,
              ProductName: productName || "",
            },
          };

          lineExtaSellItems.push(lineExtaSellObj);
        });
      }

      if (getso_id[1] || templateObject.data.id) {
        if (itrackThisItem == true && $("#sltinventoryacount").val() != "") {
          objDetails = {
            type: "TProductVS1",
            fields: {
              ID: parseInt(currentID),
              Active: true,
              ProductType: "INV",
              PRODUCTCODE: productCode,
              Batch: trackLotNumber,
              SNTracking: trackSerialNumber,
              CUSTFLD1: customField1,
              CUSTFLD2: customField2,
              CUSTFLD3: customField3,
              CUSTFLD13: allowAddSerialNumber,
              CUSTFLD14: lastPriceSetting,
              CUSTFLD15: lastCostSetting,
              ProductPrintName: productName,
              ProductName: productName,
              PurchaseDescription: $("#txapurchasedescription").val(),
              SalesDescription: $("#txasalesdescription").val(),
              AssetAccount: $("#sltinventoryacount").val(),
              CogsAccount: $("#sltcogsaccount").val(),
              IncomeAccount: $("#sltsalesacount").val(),
              BuyQty1Cost:
                parseFloat(
                  $("#edtbuyqty1cost")
                    .val()
                    .replace(/[^0-9.-]+/g, "")
                ) || 0,
              BuyQty1CostInc:
                parseFloat(
                  $("#edtbuyqty1costInc")
                    .val()
                    .replace(/[^0-9.-]+/g, "")
                ) || 0,
              SellQty1Price:
                parseFloat(
                  $("#edtsellqty1price")
                    .val()
                    .replace(/[^0-9.-]+/g, "")
                ) || 0,
              SellQty1PriceInc:
                parseFloat(
                  $("#edtsellqty1priceInc")
                    .val()
                    .replace(/[^0-9.-]+/g, "")
                ) || 0,
              TaxCodePurchase: $("#slttaxcodepurchase").val(),
              TaxCodeSales: $("#slttaxcodesales").val(),
              UOMPurchases: defaultUOM,
              UOMSales: defaultUOM,
              Barcode: $("#edtbarcode").val(),
              LockExtraSell: itrackThisItem,
              ExtraSellPrice: lineExtaSellItems || null,
              PublishOnVS1: true,
              isManufactured: getIsManufactured,
            },
          };
        } else {
          objDetails = {
            type: "TProductVS1",
            fields: {
              ID: parseInt(currentID),
              Active: true,
              ProductType: "NONINV",
              PRODUCTCODE: productCode,
              Batch: trackLotNumber,
              SNTracking: trackSerialNumber,
              CUSTFLD1: customField1,
              CUSTFLD2: customField2,
              CUSTFLD3: customField3,
              CUSTFLD13: allowAddSerialNumber,
              CUSTFLD14: lastPriceSetting,
              CUSTFLD15: lastCostSetting,
              ProductPrintName: productName,
              ProductName: productName,
              PurchaseDescription: $("#txapurchasedescription").val(),
              SalesDescription: $("#txasalesdescription").val(),
              CogsAccount: $("#sltcogsaccount").val(),
              IncomeAccount: $("#sltsalesacount").val(),
              BuyQty1Cost:
                parseFloat(
                  $("#edtbuyqty1cost")
                    .val()
                    .replace(/[^0-9.-]+/g, "")
                ) || 0,
              BuyQty1CostInc:
                parseFloat(
                  $("#edtbuyqty1costInc")
                    .val()
                    .replace(/[^0-9.-]+/g, "")
                ) || 0,
              SellQty1Price:
                parseFloat(
                  $("#edtsellqty1price")
                    .val()
                    .replace(/[^0-9.-]+/g, "")
                ) || 0,
              SellQty1PriceInc:
                parseFloat(
                  $("#edtsellqty1priceInc")
                    .val()
                    .replace(/[^0-9.-]+/g, "")
                ) || 0,
              TaxCodePurchase: $("#slttaxcodepurchase").val(),
              TaxCodeSales: $("#slttaxcodesales").val(),
              UOMPurchases: defaultUOM,
              UOMSales: defaultUOM,
              Barcode: $("#edtbarcode").val(),
              LockExtraSell: itrackThisItem,
              ExtraSellPrice: lineExtaSellItems || null,
              PublishOnVS1: true,
              isManufactured: getIsManufactured,
            },
          };
        }
        let productClassObj;
        let checkTracked = templateObject.isTrackChecked.get();
        if(checkTracked == true){
          // let productClassData = templateObject.records.get();
          // let productBinNumber =  $(".slt-bin").val();
          // let productBinLocation =  $(".slt-bin option:selected").data('location');
          // let ProductDept = $(".slt_department option:selected").data('tag');
          // let ProductDeptName = $(".slt_department").val();
          let productClassData = templateObject.records.get();
          let productBinNumber =  $("#sltbinnumber option:selected").val();
          let productBinLocation =  $("#sltbinlocation option:selected").val();
          let ProductDept = templateObject.bindeptid.get();
          let ProductDeptName = $("#sltdepartment").val();

          productClassObj = {
              type: "TProductClass",
              fields: {
                ID: productClassData.productclass.ID,
                DefaultbinLocation: productBinLocation,
                DefaultbinNumber: productBinNumber,
                ProductID: parseInt(currentID),
                DeptID: ProductDept,
                DeptName: ProductDeptName
              }
          };
          productService.saveProductClassData(productClassObj).then(function(data){

          });
        }

       // saveBOMStructure();
        productService
          .saveProductVS1(objDetails)
          .then(function (objDetails) {
            if (itrackThisItem == false) {
              let objServiceDetails = {
                type: "TServices",
                fields: {
                  ProductId: parseInt(currentID),
                  ServiceDesc: productName,
                  StandardRate:
                    parseFloat(
                      $("#edtbuyqty1cost")
                        .val()
                        .replace(/[^0-9.-]+/g, "")
                    ) || 0,
                },
              };
              productService.saveProductService(objServiceDetails).then(function (objServiceDetails) {});
            }
            $(".fullScreenSpin").css("display", "none");
            swal('Success', 'Saved Successfully!', 'success').then(function(){
              getVS1Data('TProductVS1').then(function(dataObject){
                var currentProductID = FlowRouter.current().queryParams.id;
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tproductvs1;
                for (let i = 0; i < useData.length; i++) {
                  if (parseInt(useData[i].fields.ID) == currentProductID) {
                    useData[i].fields.ProductClass[0] = productClassObj;
                    break;
                  }
                }
                data.tproductvs1 = useData;
                clearData('TProductVS1').then(function(){
                  addVS1Data('TProductVS1', JSON.stringify(data)).then(function(){
                    FlowRouter.go("/productlist");
                  })
                })

              }).catch(function(err){
              })
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
            //$('.loginSpinner').css('display','none');
            $(".fullScreenSpin").css("display", "none");
          });
      } else {
        productService
          .getCheckProductData(productName)
          .then(function (data) {
            if (data.tproduct[0].Id != "") {
              let productID = data.tproduct[0].Id;
              currentID = parseInt(productID);
              if (itrackThisItem == true && $("#sltinventoryacount").val() != "") {
                objDetails = {
                  type: "TProductVS1",
                  fields: {
                    ID: currentID,
                    Active: true,
                    ProductType: "INV",
                    PRODUCTCODE: productCode,
                    Batch: trackLotNumber,
                    SNTracking: trackSerialNumber,
                    CUSTFLD1: customField1,
                    CUSTFLD2: customField2,
                    CUSTFLD3: customField3,
                    CUSTFLD13: allowAddSerialNumber,
                    CUSTFLD14: lastPriceSetting,
                    CUSTFLD15: lastCostSetting,
                    ProductPrintName: productName,
                    ProductName: productName,
                    PurchaseDescription: $("#txapurchasedescription").val(),
                    SalesDescription: $("#txasalesdescription").val(),
                    AssetAccount: $("#sltinventoryacount").val(),
                    CogsAccount: $("#sltcogsaccount").val(),
                    IncomeAccount: $("#sltsalesacount").val(),
                    BuyQty1Cost:
                      parseFloat(
                        $("#edtbuyqty1cost")
                          .val()
                          .replace(/[^0-9.-]+/g, "")
                      ) || 0,
                    BuyQty1CostInc:
                      parseFloat(
                        $("#edtbuyqty1costInc")
                          .val()
                          .replace(/[^0-9.-]+/g, "")
                      ) || 0,
                    SellQty1Price:
                      parseFloat(
                        $("#edtsellqty1price")
                          .val()
                          .replace(/[^0-9.-]+/g, "")
                      ) || 0,
                    SellQty1PriceInc:
                      parseFloat(
                        $("#edtsellqty1priceInc")
                          .val()
                          .replace(/[^0-9.-]+/g, "")
                      ) || 0,
                    TaxCodePurchase: $("#slttaxcodepurchase").val(),
                    TaxCodeSales: $("#slttaxcodesales").val(),
                    UOMPurchases: defaultUOM,
                    UOMSales: defaultUOM,
                    Barcode: $("#edtbarcode").val(),
                    LockExtraSell: itrackThisItem,
                    ExtraSellPrice: lineExtaSellItems || null,
                    PublishOnVS1: true,
                    isManufactured: getIsManufactured,
                  },
                };
              } else {
                objDetails = {
                  type: "TProductVS1",
                  fields: {
                    ID: currentID,
                    Active: true,
                    ProductType: "NONINV",
                    PRODUCTCODE: productCode,
                    Batch: trackLotNumber,
                    SNTracking: trackSerialNumber,
                    CUSTFLD1: customField1,
                    CUSTFLD2: customField2,
                    CUSTFLD3: customField3,
                    CUSTFLD13: allowAddSerialNumber,
                    CUSTFLD14: lastPriceSetting,
                    CUSTFLD15: lastCostSetting,
                    ProductPrintName: productName,
                    ProductName: productName,
                    PurchaseDescription: $("#txapurchasedescription").val(),
                    SalesDescription: $("#txasalesdescription").val(),
                    CogsAccount: $("#sltcogsaccount").val(),
                    IncomeAccount: $("#sltsalesacount").val(),
                    BuyQty1Cost:
                      parseFloat(
                        $("#edtbuyqty1cost")
                          .val()
                          .replace(/[^0-9.-]+/g, "")
                      ) || 0,
                    BuyQty1CostInc:
                      parseFloat(
                        $("#edtbuyqty1costInc")
                          .val()
                          .replace(/[^0-9.-]+/g, "")
                      ) || 0,
                    SellQty1Price:
                      parseFloat(
                        $("#edtsellqty1price")
                          .val()
                          .replace(/[^0-9.-]+/g, "")
                      ) || 0,
                    SellQty1PriceInc:
                      parseFloat(
                        $("#edtsellqty1priceInc")
                          .val()
                          .replace(/[^0-9.-]+/g, "")
                      ) || 0,
                    TaxCodePurchase: $("#slttaxcodepurchase").val(),
                    TaxCodeSales: $("#slttaxcodesales").val(),
                    UOMPurchases: defaultUOM,
                    UOMSales: defaultUOM,
                    Barcode: $("#edtbarcode").val(),
                    LockExtraSell: itrackThisItem,
                    ExtraSellPrice: lineExtaSellItems || null,
                    PublishOnVS1: true,
                    isManufactured: getIsManufactured,
                  },
                };
              }

              productService
                .saveProductVS1(objDetails)
                .then(function (objDetails) {
                  let linesave = objDetails.fields.ID;
                  if (itrackThisItem == false) {
                    let objServiceDetails = {
                      type: "TServices",
                      fields: {
                        ProductId: parseInt(linesave),
                        ServiceDesc: productName,
                        StandardRate:
                          parseFloat(
                            $("#edtbuyqty1cost")
                              .val()
                              .replace(/[^0-9.-]+/g, "")
                          ) || 0,
                      },
                    };
                    productService.saveProductService(objServiceDetails).then(function (objServiceDetails) {});
                  }
                //  saveBOMStructure();
                  sideBarService
                    .getNewProductListVS1(initialBaseDataLoad, 0)
                    .then(function (dataReload) {
                      addVS1Data("TProductVS1", JSON.stringify(dataReload))
                        .then(function (datareturn) {
                          FlowRouter.go("/inventorylist?success=true");
                        })
                        .catch(function (err) {
                          FlowRouter.go("/inventorylist?success=true");
                        });
                    })
                    .catch(function (err) {
                      FlowRouter.go("/inventorylist?success=true");
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
                  //$('.loginSpinner').css('display','none');
                  $(".fullScreenSpin").css("display", "none");
                });
            } else {
              if (itrackThisItem == true && $("#sltinventoryacount").val() != "") {
                objDetails = {
                  type: "TProductVS1",
                  fields: {
                    ID: currentID,
                    Active: true,
                    ProductType: "INV",
                    PRODUCTCODE: productCode,
                    CUSTFLD1: customField1,
                    CUSTFLD2: customField2,
                    CUSTFLD3: customField3,
                    Batch: trackLotNumber,
                    SNTracking: trackSerialNumber,
                    CUSTFLD13: allowAddSerialNumber,
                    CUSTFLD14: lastPriceSetting,
                    CUSTFLD15: lastCostSetting,
                    ProductPrintName: productName,
                    ProductName: productName,
                    PurchaseDescription: $("#txapurchasedescription").val(),
                    SalesDescription: $("#txasalesdescription").val(),
                    AssetAccount: $("#sltinventoryacount").val(),
                    CogsAccount: $("#sltcogsaccount").val(),
                    IncomeAccount: $("#sltsalesacount").val(),
                    BuyQty1: parseFloat($("#edttotalqtyinstock1").val()) || 1,
                    BuyQty1Cost:
                      parseFloat(
                        $("#edtbuyqty1cost")
                          .val()
                          .replace(/[^0-9.-]+/g, "")
                      ) || 0,
                    BuyQty1CostInc:
                      parseFloat(
                        $("#edtbuyqty1costInc")
                          .val()
                          .replace(/[^0-9.-]+/g, "")
                      ) || 0,
                    SellQty1: parseFloat($("#edttotalqtyinstock1").val()) || 1,
                    SellQty1Price:
                      parseFloat(
                        $("#edtsellqty1price")
                          .val()
                          .replace(/[^0-9.-]+/g, "")
                      ) || 0,
                    SellQty1PriceInc:
                      parseFloat(
                        $("#edtsellqty1priceInc")
                          .val()
                          .replace(/[^0-9.-]+/g, "")
                      ) || 0,
                    TaxCodePurchase: $("#slttaxcodepurchase").val(),
                    TaxCodeSales: $("#slttaxcodesales").val(),
                    UOMPurchases: defaultUOM,
                    UOMSales: defaultUOM,
                    Barcode: $("#edtbarcode").val(),
                    LockExtraSell: itrackThisItem,
                    ExtraSellPrice: lineExtaSellItems || null,
                    PublishOnVS1: true,
                    isManufactured: getIsManufactured,
                  },
                };
              } else {
                objDetails = {
                  type: "TProductVS1",
                  fields: {
                    ID: currentID,
                    Active: true,
                    ProductType: "NONINV",
                    PRODUCTCODE: productCode,
                    CUSTFLD1: customField1,
                    CUSTFLD2: customField2,
                    CUSTFLD3: customField3,
                    Batch: trackLotNumber,
                    SNTracking: trackSerialNumber,
                    CUSTFLD13: allowAddSerialNumber,
                    CUSTFLD14: lastPriceSetting,
                    CUSTFLD15: lastCostSetting,
                    ProductPrintName: productName,
                    ProductName: productName,
                    PurchaseDescription: $("#txapurchasedescription").val(),
                    SalesDescription: $("#txasalesdescription").val(),
                    // AssetAccount:$("#sltinventoryacount").val(),
                    CogsAccount: $("#sltcogsaccount").val(),
                    IncomeAccount: $("#sltsalesacount").val(),
                    BuyQty1: parseFloat($("#edttotalqtyinstock1").val()) || 1,
                    BuyQty1Cost:
                      parseFloat(
                        $("#edtbuyqty1cost")
                          .val()
                          .replace(/[^0-9.-]+/g, "")
                      ) || 0,
                    BuyQty1CostInc:
                      parseFloat(
                        $("#edtbuyqty1costInc")
                          .val()
                          .replace(/[^0-9.-]+/g, "")
                      ) || 0,
                    SellQty1: parseFloat($("#edttotalqtyinstock1").val()) || 1,
                    SellQty1Price:
                      parseFloat(
                        $("#edtsellqty1price")
                          .val()
                          .replace(/[^0-9.-]+/g, "")
                      ) || 0,
                    SellQty1PriceInc:
                      parseFloat(
                        $("#edtsellqty1priceInc")
                          .val()
                          .replace(/[^0-9.-]+/g, "")
                      ) || 0,
                    TaxCodePurchase: $("#slttaxcodepurchase").val(),
                    TaxCodeSales: $("#slttaxcodesales").val(),
                    UOMPurchases: defaultUOM,
                    UOMSales: defaultUOM,
                    Barcode: $("#edtbarcode").val(),
                    LockExtraSell: itrackThisItem,
                    ExtraSellPrice: lineExtaSellItems || null,
                    PublishOnVS1: true,
                    isManufactured: getIsManufactured,
                  },
                };
              }
              productService
                .saveProductVS1(objDetails)
                .then(function (objDetails) {
                  let linesave = objDetails.fields.ID;
                  if (itrackThisItem == false) {
                    let objServiceDetails = {
                      type: "TServices",
                      fields: {
                        ProductId: parseInt(linesave),
                        ServiceDesc: productName,
                        StandardRate:
                          parseFloat(
                            $("#edtbuyqty1cost")
                              .val()
                              .replace(/[^0-9.-]+/g, "")
                          ) || 0,
                      },
                    };
                    productService.saveProductService(objServiceDetails).then(function (objServiceDetails) {});
                  }
                 // saveBOMStructure();
                  sideBarService
                    .getNewProductListVS1(initialBaseDataLoad, 0)
                    .then(function (dataReload) {
                      addVS1Data("TProductVS1", JSON.stringify(dataReload))
                        .then(function (datareturn) {
                          FlowRouter.go("/inventorylist?success=true");
                        })
                        .catch(function (err) {
                          FlowRouter.go("/inventorylist?success=true");
                        });
                    })
                    .catch(function (err) {
                      FlowRouter.go("/inventorylist?success=true");
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
                      //Meteor._reload.reload();
                    } else if (result.dismiss === "cancel") {
                    }
                  });
                  //$('.loginSpinner').css('display','none');
                  $(".fullScreenSpin").css("display", "none");
                });
            }
          })
          .catch(function (err) {
            if (itrackThisItem == true && $("#sltinventoryacount").val() != "") {
              objDetails = {
                type: "TProductVS1",
                fields: {
                  ID: currentID,
                  Active: true,
                  ProductType: "INV",
                  PRODUCTCODE: productCode,
                  CUSTFLD1: customField1,
                  CUSTFLD2: customField2,
                  CUSTFLD3: customField3,
                  Batch: trackLotNumber,
                  SNTracking: trackSerialNumber,
                  CUSTFLD13: allowAddSerialNumber,
                  CUSTFLD14: lastPriceSetting,
                  CUSTFLD15: lastCostSetting,
                  ProductPrintName: productName,
                  ProductName: productName,
                  PurchaseDescription: $("#txapurchasedescription").val(),
                  SalesDescription: $("#txasalesdescription").val(),
                  AssetAccount: $("#sltinventoryacount").val(),
                  CogsAccount: $("#sltcogsaccount").val(),
                  IncomeAccount: $("#sltsalesacount").val(),
                  BuyQty1: parseFloat($("#edttotalqtyinstock1").val()) || 1,
                  BuyQty1Cost:
                    parseFloat(
                      $("#edtbuyqty1cost")
                        .val()
                        .replace(/[^0-9.-]+/g, "")
                    ) || 0,
                  BuyQty1CostInc:
                    parseFloat(
                      $("#edtbuyqty1costInc")
                        .val()
                        .replace(/[^0-9.-]+/g, "")
                    ) || 0,
                  SellQty1: parseFloat($("#edttotalqtyinstock1").val()) || 1,
                  SellQty1Price:
                    parseFloat(
                      $("#edtsellqty1price")
                        .val()
                        .replace(/[^0-9.-]+/g, "")
                    ) || 0,
                  SellQty1PriceInc:
                    parseFloat(
                      $("#edtsellqty1priceInc")
                        .val()
                        .replace(/[^0-9.-]+/g, "")
                    ) || 0,
                  TaxCodePurchase: $("#slttaxcodepurchase").val(),
                  TaxCodeSales: $("#slttaxcodesales").val(),
                  UOMPurchases: defaultUOM,
                  UOMSales: defaultUOM,
                  Barcode: $("#edtbarcode").val(),
                  LockExtraSell: itrackThisItem,
                  ExtraSellPrice: lineExtaSellItems || null,
                  PublishOnVS1: true,
                  isManufactured: getIsManufactured,
                },
              };
            } else {
              objDetails = {
                type: "TProductVS1",
                fields: {
                  ID: currentID,
                  Active: true,
                  ProductType: "NONINV",
                  PRODUCTCODE: productCode,
                  CUSTFLD1: customField1,
                  CUSTFLD2: customField2,
                  CUSTFLD3: customField3,
                  Batch: trackLotNumber,
                  SNTracking: trackSerialNumber,
                  CUSTFLD13: allowAddSerialNumber,
                  CUSTFLD14: lastPriceSetting,
                  CUSTFLD15: lastCostSetting,
                  ProductPrintName: productName,
                  ProductName: productName,
                  PurchaseDescription: $("#txapurchasedescription").val(),
                  SalesDescription: $("#txasalesdescription").val(),
                  // AssetAccount:$("#sltinventoryacount").val(),
                  CogsAccount: $("#sltcogsaccount").val(),
                  IncomeAccount: $("#sltsalesacount").val(),
                  BuyQty1: parseFloat($("#edttotalqtyinstock1").val()) || 1,
                  BuyQty1Cost:
                    parseFloat(
                      $("#edtbuyqty1cost")
                        .val()
                        .replace(/[^0-9.-]+/g, "")
                    ) || 0,
                  BuyQty1CostInc:
                    parseFloat(
                      $("#edtbuyqty1costInc")
                        .val()
                        .replace(/[^0-9.-]+/g, "")
                    ) || 0,
                  SellQty1: parseFloat($("#edttotalqtyinstock1").val()) || 1,
                  SellQty1Price:
                    parseFloat(
                      $("#edtsellqty1price")
                        .val()
                        .replace(/[^0-9.-]+/g, "")
                    ) || 0,
                  SellQty1PriceInc:
                    parseFloat(
                      $("#edtsellqty1priceInc")
                        .val()
                        .replace(/[^0-9.-]+/g, "")
                    ) || 0,
                  TaxCodePurchase: $("#slttaxcodepurchase").val(),
                  TaxCodeSales: $("#slttaxcodesales").val(),
                  UOMPurchases: defaultUOM,
                  UOMSales: defaultUOM,
                  Barcode: $("#edtbarcode").val(),
                  LockExtraSell: itrackThisItem,
                  ExtraSellPrice: lineExtaSellItems || null,
                  PublishOnVS1: true,
                  isManufactured: getIsManufactured,
                },
              };
            }

            productService
              .saveProductVS1(objDetails)
              .then(function (objDetails) {
                let linesave = objDetails.fields.ID;
                if (itrackThisItem == false) {
                  let objServiceDetails = {
                    type: "TServices",
                    fields: {
                      ProductId: parseInt(linesave),
                      ServiceDesc: productName,
                      StandardRate:
                        parseFloat(
                          $("#edtbuyqty1cost")
                            .val()
                            .replace(/[^0-9.-]+/g, "")
                        ) || 0,
                    },
                  };
                  productService.saveProductService(objServiceDetails).then(function (objServiceDetails) {});
                }

               // saveBOMStructure();

                sideBarService
                  .getNewProductListVS1(initialBaseDataLoad, 0)
                  .then(function (dataReload) {
                    addVS1Data("TProductVS1", JSON.stringify(dataReload))
                      .then(function (datareturn) {
                        FlowRouter.go("/inventorylist?success=true");
                      })
                      .catch(function (err) {
                        FlowRouter.go("/inventorylist?success=true");
                      });
                  })
                  .catch(function (err) {
                    FlowRouter.go("/inventorylist?success=true");
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
                    //Meteor._reload.reload();
                  } else if (result.dismiss === "cancel") {
                  }
                });
                //$('.loginSpinner').css('display','none');
                $(".fullScreenSpin").css("display", "none");
              });
          });
      }

      async function saveBOMStructure() {
        let bomObject = templateObject.bomStructure.get();

        let bomProducts = templateObject.bomProducts.get() || [];

        let existID = -1;
        let existIndex = bomProducts.findIndex((product) => {
          return product.Caption == bomObject.Caption;
        });

        if (existIndex == -1) {
          await productService.getOneBOMProductByName(bomObject.fields.Caption).then(function (data) {
            if (data.tproctree.length > 0) {
              existID = data.tproctree[0].fields.ID;
            }
          });
        } else {
          existID = bomProducts[existIndex].fields.ID;
        }

        let temp = cloneDeep(bomObject);
        temp.fields.Description = templateObject.records.get().salesdescription;
        temp.fields.TotalQtyOriginal = templateObject.records.get().totalqtyinstock;

        if (templateObject.isManufactured.get() == true) {
          if (existID != -1) {
            temp.fields.ID = existID;
          }
          productService.saveBOMProduct(temp).then(function () {
            productService.getAllBOMProducts(initialDatatableLoad, 0).then(function (data) {
              addVS1Data("TProcTree", JSON.stringify(data)).then(function () {});
            });
          });
        } else {
          if (existID != -1) {
            temp.fields.ID = existID;
            temp.fields.ProcStepItemRef = "deleted";
            productService.saveBOMProduct(temp).then(function () {
              productService.getAllBOMProducts(initialDatatableLoad, 0).then(function (data) {
                addVS1Data("TProcTree", JSON.stringify(data)).then(function () {});
              });
            });
          }
        }
      }
    }, delayTimeAfterSound);
  },
  "click .btnBack": function (event) {
    playCancelAudio();
    event.preventDefault();
    setTimeout(function () {
      history.back(1);
    }, delayTimeAfterSound);
  },
  "click #chkTrack": function (event) {
    const templateObject = Template.instance();
    let cloudPackage = localStorage.getItem("vs1cloudlicenselevel");
    if (cloudPackage == "Simple Start") {
      $("#upgradeModal").modal("toggle");
      templateObject.isTrackChecked.set(false);
      event.preventDefault();
      return false;
    } else {
      let checkTracked = templateObject.isTrackChecked.get();
      if (checkTracked == true) {
        swal("You cannot turn off tracking.", "", "info");
        event.preventDefault();
        return false;
      } else {
        if ($(event.target).is(":checked")) {
          swal({
            title: "PLEASE NOTE",
            text: "If Inventory tracking is turned on it cannot be disabled in the future.",
            type: "info",
            showCancelButton: true,
            confirmButtonText: "OK",
          }).then((result) => {
            if (result.value) {
              templateObject.isTrackChecked.set(true);
            } else if (result.dismiss === "cancel") {
              $("#chkTrack").prop("checked", false);
              templateObject.isTrackChecked.set(false);
            }
          });
          // swal('PLEASE NOTE', 'If Inventory Tracking is turned on, it cannot be turned off for this product in the future.', 'info');
        }
      }
    }
    //

    // if($(event.target).is(':checked')){
    //   templateObject.isTrackChecked.set(true);
    //   $('.trackItem').css('display','block');
    //   $('.trackItemvisible').css('visibility','visible');
    //
    //   // swal('PLEASE NOTE', 'If Inventory Tracking is turned on it cannot be turned off for this product in the future.', 'info');
    // }else{
    //   templateObject.isTrackChecked.set(false);
    //   $('.trackItem').css('display','none');
    //   $('.trackItemvisible').css('visibility','hidden');
    // }
  },
  "click #chkSNTrack": function (event) {
    $("#chkSNTrack").attr("checked");
    $("#chkLotTrack").removeAttr("checked");
  },
  "click #chkLotTrack": function (event) {
    $("#chkSNTrack").removeAttr("checked");
    $("#chkLotTrack").attr("checked");
  },

  "click #btnShowBOMExtra": function (event) {
    $("#BOMSetupModal").modal("toggle");
  },

  "click #btnSNTrack": function (event) {
    const isCheckedSNTrack = $("#chkSNTrack").prop("checked");
    if (FlowRouter.current().queryParams.id) {
      if (isCheckedSNTrack) {
        // $(".fullScreenSpin").css("display", "inline-block");
        // let templateObject = Template.instance();
        // templateObject.getSerialNumberList();
        $("#SerialNumberModal").modal("show");
      } else {
        swal("You are not Tracking Serial numbers for this product.", "", "info");
        event.preventDefault();
        return false;
      }
    }
  },
  "click #btnLotTrack": function (event) {
    const isCheckedLotTrack = $("#chkLotTrack").prop("checked");
    if (FlowRouter.current().queryParams.id) {
      if (isCheckedLotTrack) {
        // $(".fullScreenSpin").css("display", "inline-block");
        // let templateObject = Template.instance();
        // templateObject.getLotNumberList();
        $("#LotNumberModal").modal("show");
      } else {
        swal("You are not Tracking Lot Numbers for this product.", "", "info");
        event.preventDefault();
        return false;
      }
    }
  },
  "click #chkSellPrice": function (event) {
    if ($(event.target).is(":checked")) {
      $(".trackCustomerTypeDisc").css("display", "flex");
      $("#customerTypeListModal").modal("toggle");
      setTimeout(() => {
        $('#tblClienttypeList_filter .form-control-sm').get(0).focus()
      }, 500)
    } else {
      $(".trackCustomerTypeDisc").css("display", "none");
    }
  },
  "click #formCheck-one": function (event) {
    if ($(event.target).is(":checked")) {
      $(".checkbox1div").css("display", "block");
    } else {
      $(".checkbox1div").css("display", "none");
    }
  },
  "click #formCheck-two": function (event) {
    if ($(event.target).is(":checked")) {
      $(".checkbox2div").css("display", "block");
    } else {
      $(".checkbox2div").css("display", "none");
    }
  },
  "blur .customField1Text": function (event) {
    var inputValue1 = $(".customField1Text").text();
    $(".lblCustomField1").text(inputValue1);
  },
  "blur .customField2Text": function (event) {
    var inputValue2 = $(".customField2Text").text();
    $(".lblCustomField2").text(inputValue2);
  },
  "click .btnSaveSettings": function (event) {
    playSaveAudio();
    setTimeout(function () {
      $("#myModal2").modal("toggle");
    }, delayTimeAfterSound);
  },
  "click .btnResetSettings": function (event) {
    var getcurrentCloudDetails = CloudUser.findOne({
      _id: localStorage.getItem("mycloudLogonID"),
      clouddatabaseID: localStorage.getItem("mycloudLogonDBID"),
    });
    if (getcurrentCloudDetails) {
      if (getcurrentCloudDetails._id.length > 0) {
        var clientID = getcurrentCloudDetails._id;
        var clientUsername = getcurrentCloudDetails.cloudUsername;
        var clientEmail = getcurrentCloudDetails.cloudEmail;
        var checkPrefDetails = CloudPreference.findOne({
          userid: clientID,
          PrefName: "productview",
        });
        if (checkPrefDetails) {
          CloudPreference.remove(
            {
              _id: checkPrefDetails._id,
            },
            function (err, idTag) {
              if (err) {
              } else {
                Meteor._reload.reload();
              }
            }
          );
        }
      }
    }
  },
  "keydown #edtbuyqty1cost, keydown #edtsellqty1price, keydown #edttotalqtyinstock, keydown #edtsellqty1priceInc, keydown #edtbuyqty1costInc, keydown .edtPriceEx, keydown .edtDiscount, keydown .edtDiscountModal":
    function (event) {
      if (
        $.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
        // Allow: Ctrl+A, Command+A
        (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||
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
  "blur #edtbuyqty1cost": function () {
    let templateObject = Template.instance();
    let utilityService = new UtilityService();
    let costPrice = $("#edtbuyqty1cost").val() || 0;
    let taxcodeList = templateObject.taxraterecords.get();
    var taxRate = $("#slttaxcodepurchase").val();

    var taxrateamount = 0;
    if (taxcodeList) {
      for (var i = 0; i < taxcodeList.length; i++) {
        if (taxcodeList[i].codename == taxRate) {
          taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100 || 0;
        }
      }
    }

    let costPriceInc = 0;

    if (!isNaN(costPrice)) {
      $("#edtbuyqty1cost").val(utilityService.modifynegativeCurrencyFormat(costPrice));
    } else {
      costPrice =
        parseFloat(
          $(event.target)
            .val()
            .replace(/[^0-9.-]+/g, "")
        ) || 0;
      $("#edtbuyqty1cost").val(utilityService.modifynegativeCurrencyFormat(costPrice));
    }

    var taxTotal = parseFloat(costPrice.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
    costPriceInc = parseFloat(costPrice.replace(/[^0-9.-]+/g, "")) + taxTotal || 0;
    $("#edtbuyqty1costInc").val(utilityService.modifynegativeCurrencyFormat(costPriceInc));
  },
  "blur #edtbuyqty1costInc": function () {
    let templateObject = Template.instance();
    let utilityService = new UtilityService();
    let costPriceInc = $("#edtbuyqty1costInc").val() || 0;
    let taxcodeList = templateObject.taxraterecords.get();
    var taxRate = $("#slttaxcodepurchase").val();

    var taxrateamount = 0;
    if (taxcodeList) {
      for (var i = 0; i < taxcodeList.length; i++) {
        if (taxcodeList[i].codename == taxRate) {
          taxrateamount = taxcodeList[i].coderate * 100 || 0;
        }
      }
    }

    let costPrice = 0;

    if (!isNaN(costPriceInc)) {
      $("#edtbuyqty1costInc").val(utilityService.modifynegativeCurrencyFormat(costPriceInc));
    } else {
      costPriceInc =
        parseFloat(
          $(event.target)
            .val()
            .replace(/[^0-9.-]+/g, "")
        ) || 0;
      $("#edtbuyqty1costInc").val(utilityService.modifynegativeCurrencyFormat(costPriceInc));
    }
    let costPriceTotal = 0;
    if (taxrateamount != 0) {
      let taxRateAmountCalc = (parseFloat(taxrateamount) + 100) / 100;
      costPrice = parseFloat(costPriceInc) / taxRateAmountCalc || 0;
      costPriceTotal = costPriceInc - costPrice || 0;
    } else {
      costPriceTotal = costPriceInc;
    }
    $("#edtbuyqty1cost").val(utilityService.modifynegativeCurrencyFormat(costPriceTotal));
  },
  "change #slttaxcodepurchase": function () {
    let templateObject = Template.instance();
    let utilityService = new UtilityService();
    let costPrice = $("#edtbuyqty1cost").val() || 0;
    let taxcodeList = templateObject.taxraterecords.get();
    var taxRate = $(event.target).val();
    var taxrateamount = 0;
    if (taxcodeList) {
      for (var i = 0; i < taxcodeList.length; i++) {
        if (taxcodeList[i].codename == taxRate) {
          taxrateamount = taxcodeList[i].coderate || 0;
        }
      }
    }

    let costPriceInc = 0;

    if (!isNaN(costPrice)) {
      $("#edtbuyqty1cost").val(utilityService.modifynegativeCurrencyFormat(costPrice));
    } else {
      costPrice =
        parseFloat(
          $("#edtbuyqty1cost")
            .val()
            .replace(/[^0-9.-]+/g, "")
        ) || 0;
      $("#edtbuyqty1cost").val(utilityService.modifynegativeCurrencyFormat(costPrice));
    }
    var taxTotal = parseFloat(costPrice) * parseFloat(taxrateamount) || 0;
    costPriceInc = parseFloat(costPrice) + taxTotal || 0;
    if (!isNaN(costPriceInc)) {
      $("#edtbuyqty1costInc").val(utilityService.modifynegativeCurrencyFormat(costPriceInc));
    }
  },
  "blur #edtsellqty1price": function () {
    let templateObject = Template.instance();
    let utilityService = new UtilityService();
    let taxcodeList = templateObject.taxraterecords.get();
    var taxRate = $("#slttaxcodesales").val();
    var taxrateamount = 0;
    if (taxcodeList) {
      for (var i = 0; i < taxcodeList.length; i++) {
        if (taxcodeList[i].codename == taxRate) {
          taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100 || 0;
        }
      }
    }

    let sellPrice = $("#edtsellqty1price").val() || 0;
    let sellPriceInc = 0;

    if (!isNaN(sellPrice)) {
      $("#edtsellqty1price").val(utilityService.modifynegativeCurrencyFormat(sellPrice));
    } else {
      sellPrice =
        Number(
          $(event.target)
            .val()
            .replace(/[^0-9.-]+/g, "")
        ) || 0;
      $("#edtsellqty1price").val(utilityService.modifynegativeCurrencyFormat(sellPrice));
    }

    var taxTotal = Number(sellPrice) * parseFloat(taxrateamount) || 0;
    sellPriceInc = Number(sellPrice) + taxTotal || 0;
    $("#edtsellqty1priceInc").val(utilityService.modifynegativeCurrencyFormat(sellPriceInc));

    $(".itemExtraSellRow").each(function () {
      var lineID = this.id;
      let tdclientType = $("#" + lineID + " .customerTypeSelect").val();
      //let tdDiscount = $('#' + lineID + " .edtDiscount").val();
      if (tdclientType == "Default") {
        $("#" + lineID + " .edtDiscount").val(0);
        $("#" + lineID + " .edtPriceEx").val(utilityService.modifynegativeCurrencyFormat(sellPrice));
      }
    });
  },
  "blur #edtsellqty1priceInc": function () {
    let templateObject = Template.instance();
    let utilityService = new UtilityService();
    let taxcodeList = templateObject.taxraterecords.get();
    var taxRate = $("#slttaxcodesales").val();
    var taxrateamount = 0;
    if (taxcodeList) {
      for (var i = 0; i < taxcodeList.length; i++) {
        if (taxcodeList[i].codename == taxRate) {
          taxrateamount = taxcodeList[i].coderate * 100 || 0;
        }
      }
    }

    let sellPriceInc = $("#edtsellqty1priceInc").val() || 0;
    let sellPrice = 0;

    if (!isNaN(sellPriceInc)) {
      $("#edtsellqty1priceInc").val(utilityService.modifynegativeCurrencyFormat(sellPriceInc));
    } else {
      sellPriceInc =
        Number(
          $(event.target)
            .val()
            .replace(/[^0-9.-]+/g, "")
        ) || 0;
      $("#edtsellqty1priceInc").val(utilityService.modifynegativeCurrencyFormat(sellPriceInc));
    }
    let sellPriceTotal = 0;
    if (taxrateamount != 0) {
      let taxRateAmountCalc = (parseFloat(taxrateamount) + 100) / 100 || 0;
      sellPrice = parseFloat(sellPriceInc) / taxRateAmountCalc || 0;
      sellPriceTotal = sellPriceInc - sellPrice || 0;
    } else {
      sellPriceTotal = sellPriceInc;
    }
    $("#edtsellqty1price").val(utilityService.modifynegativeCurrencyFormat(sellPriceTotal));

    $(".itemExtraSellRow").each(function () {
      var lineID = this.id;
      let tdclientType = $("#" + lineID + " .customerTypeSelect").val();
      //let tdDiscount = $('#' + lineID + " .edtDiscount").val();
      if (tdclientType == "Default") {
        $("#" + lineID + " .edtDiscount").val(0);
        $("#" + lineID + " .edtPriceEx").val(utilityService.modifynegativeCurrencyFormat(sellPrice));
      }
    });
  },
  "change #slttaxcodesales": function () {
    let templateObject = Template.instance();
    let utilityService = new UtilityService();
    let taxcodeList = templateObject.taxraterecords.get();
    var taxRate = $(event.target).val();
    var taxrateamount = 0;
    if (taxcodeList) {
      for (var i = 0; i < taxcodeList.length; i++) {
        if (taxcodeList[i].codename == taxRate) {
          taxrateamount = taxcodeList[i].coderate || 0;
        }
      }
    }

    let sellPrice = $("#edtsellqty1price").val() || 0;
    let sellPriceInc = 0;

    if (!isNaN(sellPrice)) {
      $("#edtsellqty1price").val(utilityService.modifynegativeCurrencyFormat(sellPrice));
    } else {
      sellPrice = parseFloat(sellPrice.replace(/[^0-9.-]+/g, "")) || 0;
      $("#edtsellqty1price").val(utilityService.modifynegativeCurrencyFormat(sellPrice));
    }

    var taxTotal = parseFloat(sellPrice) * parseFloat(taxrateamount) || 0;
    sellPriceInc = parseFloat(sellPrice) + taxTotal || 0;
    sellPriceInc = applyMarkup(sellPriceInc)
    if (!isNaN(sellPriceInc)) {
      $("#edtsellqty1priceInc").val(utilityService.modifynegativeCurrencyFormat(sellPriceInc));
    }

    $(".itemExtraSellRow").each(function () {
      var lineID = this.id;
      let tdclientType = $("#" + lineID + " .customerTypeSelect").val();
      //let tdDiscount = $('#' + lineID + " .edtDiscount").val();
      if (tdclientType == "Default") {
        $("#" + lineID + " .edtDiscount").val(0);
        $("#" + lineID + " .edtPriceEx").val(utilityService.modifynegativeCurrencyFormat(sellPrice));
      }
    });
  },
  "click .btnDeleteInv": function (event) {
    playDeleteAudio();
    let templateObject = Template.instance();
    swal({
      title: "Delete Product",
      text: "Do you want to delete this Product?",
      type: "question",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.value) {
        $(".fullScreenSpin").css("display", "inline-block");
        var url = FlowRouter.current().path;
        var getso_id = url.split("?id=");
        var currentProduct = FlowRouter.current().queryParams.id || templateObject.data.id || "";
        var objDetails = "";
        if (getso_id[1] || templateObject.data.id) {
          currentProduct = parseInt(currentProduct);
          var objDetails = {
            type: "TProduct",
            fields: {
              ID: currentProduct,
              Active: "True",
              PublishOnVS1: false,
            },
          };

          productService
            .saveProduct(objDetails)
            .then(function (objDetails) {
              FlowRouter.go("/inventorylist?success=true");
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
                  Meteor._reload.reload();
                } else if (result.dismiss === "cancel") {
                }
              });
              $(".fullScreenSpin").css("display", "none");
            });
        } else {
          FlowRouter.go("/inventorylist?success=true");
        }
      } else if (result.dismiss === "cancel") {
        window.open("/inventorylist", "_self");
      } else {
      }
    });
  },
  "click .btnUpgradeToEssentials": function (event) {
    window.open("/companyappsettings", "_self");
  },
  "click .addClientType": function (event) {
    $("#myModalClientType").modal();
  },
  "click .btnSaveDept": function () {
    playSaveAudio();
    let contactService = new ProductService();
    setTimeout(function () {
      $(".fullScreenSpin").css("display", "inline-block");

      //let headerDept = $('#sltDepartment').val();
      let custType = $("#edtDeptName").val();
      let typeDesc = $("#txaDescription").val() || "";
      if (custType === "") {
        swal("Client Type name cannot be blank!", "", "warning");
        $(".fullScreenSpin").css("display", "none");
        e.preventDefault();
      } else {
        let objDetails = {
          type: "TClientType",
          fields: {
            TypeName: custType,
            TypeDescription: typeDesc,
          },
        };
        contactService
          .saveClientTypeData(objDetails)
          .then(function (objDetails) {
            sideBarService
              .getClientTypeData()
              .then(function (dataReload) {
                addVS1Data("TClientType", JSON.stringify(dataReload))
                  .then(function (datareturn) {
                    Meteor._reload.reload();
                  })
                  .catch(function (err) {
                    Meteor._reload.reload();
                  });
              })
              .catch(function (err) {
                Meteor._reload.reload();
              });
            // Meteor._reload.reload();
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
            $(".fullScreenSpin").css("display", "none");
          });
      }
    }, delayTimeAfterSound);
  },
  "click .addRowLine": function () {
    var itemDataClone = $(".itemExtraSellRow:first");
    var itemDataCloneLast = $(".itemExtraSellRow:last");
    let tokenid = Random.id();
    var itemClineID = itemDataClone.clone().prop("id", tokenid);
    itemClineID.find('input[type="text"]').val("");
    itemClineID.find('select[name^="sltCustomerType"]').val("");
    itemClineID.find('.sltCustomerType').editableSelect();
    itemClineID.find('.sltCustomerType').editableSelect().on("click.editable-select", editableService.clickCustomerType);
    customerLineIndex = $(".itemExtraSellRow").length
    itemClineID.insertAfter(".itemExtraSellRow:last");
    $("#customerTypeListModal").modal("toggle");
    // $('.itemExtraSellRow:first').clone().insertAfter(".itemExtraSellRow:last");
  },
  "click .btnRemove": function (event) {
    let templateObject = Template.instance();
    var targetID = $(event.target).closest(".itemExtraSellRow").attr("id");
    if ($(".itemExtraSellRow").length > 1) {
      $("#" + targetID).remove();
    }
  },
  "blur .edtDiscount": function (event) {
    let utilityService = new UtilityService();
    let templateObject = Template.instance();
    var targetID = $(event.target).closest(".itemExtraSellRow").attr("id");
    let itemSellPrice =
      parseFloat(
        $("#edtsellqty1price")
          .val()
          .replace(/[^0-9.-]+/g, "")
      ) || 0;
    let discountPrice = parseFloat($(event.target).val()) || 0;
    $(event.target).val(discountPrice);
    let getDiscountPrice = itemSellPrice - (itemSellPrice * discountPrice) / 100;
    $("#" + targetID + " .edtPriceEx").val(utilityService.modifynegativeCurrencyFormat(getDiscountPrice) || 0);
  },
  "blur .edtDiscountModal": function (event) {
    let utilityService = new UtilityService();
    let templateObject = Template.instance();
    //var targetID = $(event.target).closest('.itemExtraSellRow').attr('id');
    let itemSellPrice =
      parseFloat(
        $("#edtsellqty1price")
          .val()
          .replace(/[^0-9.-]+/g, "")
      ) || 0;
    let discountPrice = parseFloat($(event.target).val()) || 0;
    $(event.target).val(discountPrice);
    let getDiscountPrice = itemSellPrice - (itemSellPrice * discountPrice) / 100;
    $(".edtPriceExModal").val(utilityService.modifynegativeCurrencyFormat(getDiscountPrice) || 0);
  },
  "blur .edtPriceEx": function (event) {
    let utilityService = new UtilityService();
    if (!isNaN($(event.target).val())) {
      let inputUnitPrice = parseFloat($(event.target).val()) || 0;
      $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));
    } else {
      let inputUnitPrice =
        Number(
          $(event.target)
            .val()
            .replace(/[^0-9.-]+/g, "")
        ) || 0;
      $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));
    }
    let templateObject = Template.instance();
    var targetID = $(event.target).closest(".itemExtraSellRow").attr("id");
    let itemSellPrice =
      parseFloat(
        $("#edtsellqty1price")
          .val()
          .replace(/[^0-9.-]+/g, "")
      ) || 0;
    let discountPrice =
      parseFloat(
        $(event.target)
          .val()
          .replace(/[^0-9.-]+/g, "")
      ) || 0;
    let getDiscountRate = 100 - (discountPrice * 100) / itemSellPrice;
    $("#" + targetID + " .edtDiscount").val(getDiscountRate || 0);
  },

  "click #showBOMBtn": function (event) {
    // let templateObject = Template.instance()
    // let objectArray = JSON.parse(localStorage.getItem('TProcTree')?localStorage.getItem('TProcTree'): [])
    // let obj = objectArray.find(object => {
    //     return object.fields.productName == templateObject.records.get().productname;
    // });

    // $('#BOMSetupModal .edtProcessName').editableSelect();
    // // $('#BOMSetupModal .edtProcessNote').editableSelect();
    // $('#BOMSetupModal #edtProcess').val(obj.fields.process);
    // $('#BOMSetupModal .edtProcessNote').val(obj.fields.processNote || '');
    // $('#BOMSetupModal .edtQuantity').val(obj.fields.qty || '1');

    // if(obj.fields.subs.length >0) {
    //     let subs = obj.fields.subs;
    //     for(let i=0; i< subs.length; i++) {
    //         let html = '';
    //         html = html + "<div class='product-content'>"+
    //             "<div class='d-flex productRow'>"+
    //                 "<div class='colProduct form-group d-flex'><div style='width: 29%'></div>" ;
    //                     // let bomIndex = objectArray.findIndex(object => {
    //                     //     return object.fields.productName == subs[i].product
    //                     // })

    //                     let isBOM = false;
    //                     let bomProductIndex = objectArray.findIndex(object => {
    //                         return object.fields.productName == subs[i].productName;
    //                     })
    //                     if(bomProductIndex > -1) {
    //                         isBOM = true
    //                     }

    //                     if(isBOM == true) {
    //                         html +="<select type='search' class='edtProductName edtRaw form-control es-input' style='width: 40%'></select><button type='button' class='btnShowSub btn btn-primary'>Show Sub</button>";
    //                     } else {
    //                         html +="<select type='search' class='edtProductName edtRaw form-control es-input' style='width: 70%'></select>"
    //                     }
    //                     // getVS1Data('TProductVS1').then(function(dataObject){
    //                     //     if(dataObject.length == 0) {
    //                     //         productService.getOneProductdatavs1byname(subs[i].product).then(function(data){

    //                     //             if(data.tproduct[0].fields.IsManufactured == true) {
    //                     //                 html +="<button type='button' class='btnShowSub btn btn-primary'>Show Sub</button>";
    //                     //             }
    //                     //         })
    //                     //     } else {
    //                     //         let data = JSON.parse(dataObject[0].data);
    //                     //         let useData = data.tproductvs1;
    //                     //         for(let i = 0; i< useData.length ; i++) {
    //                     //             if(useData[i].fields.ProductName == subs[i].product) {
    //                     //                 if(useData[i].fields.IsManufactured == true) {
    //                     //                     html +="<button type='button' class='btnShowSub btn btn-primary'>Show Sub</button>";
    //                     //                 }
    //                     //             }
    //                     //         }
    //                     //     }
    //                     // }).catch(function(err) {
    //                     //     productService.getOneProductdatavs1byname(subs[i].product).then(function(data){
    //                     //         if(data.tproduct[0].fields.IsManufactured == true) {
    //                     //             html +="<button type='button' class='btnShowSub btn btn-primary'>Show Sub</button>";
    //                     //         }
    //                     //     })
    //                     // })

    //                 html += "</div>"+
    //                 "<div class='colQty form-group'>"+
    //                     "<input type='text' class='form-control edtQuantity w-100' type='number' step='.00001' value='"+ subs[i].qty +"'>" +
    //                 "</div>";

    //                 //  if (bomIndex > -1) {

    //                         html += "<div class='colProcess form-group'>"+
    //                         "<input type='search' autocomplete='off' class='edtProcessName form-control w-100 es-input' value = '"+ subs[i].process +"' /></div>"+
    //                         "<div class='colNote form-group'>" +
    //                         "<input class='w-100 form-control edtProcessNote'  type='text' value='"+subs[i].processNote+"'></div>" +
    //                         "<div class='colAttachment form-group'><a class='btn btn-primary btnAddAttachment' role='button' data-toggle='modal' href='#myModalAttachment-"+subs[i].productName.replace(/[|&;$%@"<>()+," "]/g, '')+"' id='btn_Attachment' name='btn_Attachment'><i class='fa fa-paperclip' style='padding-right: 8px;'></i>Add Attachments</a><div class='d-none attachedFiles'></div></div>"
    //                 // } else {
    //                 //     html += "<div class='colProcess form-group'></div>"+
    //                 //     "<div class='colNote form-group'></div>" +
    //                 //     "<div class='colAttachment form-group'></div>"
    //                 // }

    //                 html += "<div class='colDelete d-flex align-items-center justify-content-center'><button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw'><i class='fa fa-remove'></i></button></div>" +
    //             "</div>"+
    //         "</div>"

    //         let productContents = $('#BOMSetupModal .product-content');
    //         $(html).insertAfter($(productContents[productContents.length-2]))
    //         productContents = $('#BOMSetupModal .product-content');
    //         let productContent = $(productContents[productContents.length-2])
    //         $(productContent).find('.edtProductName').editableSelect();
    //         $(productContent).find('.edtProcessName').editableSelect()
    //         $(productContent).find('.edtProductName').val(subs[i].productName || '')
    //         $(productContent).find('.edtQuantity').val(subs[i].qty || 1)
    //         $(productContent).find('.edtProcessName').val(subs[i].process || "")
    //         // $(productContent).find('.edtProcessName').val(subs[i].process || "")
    //         $(productContent).find('.edtProcessNote').val(subs[i].processNote || "")

    //     }
    // }
    $("#BOMSetupModal").modal("toggle");
  },

  "change .sltdepartment": function (event) {
    let templateObject = Template.instance();
    let dept_name = $(event.target).val();
    templateObject.bindept.set(dept_name);
  },

  "change #chkBOM": function (event) {
    let templateObject = Template.instance();
    if ($("#chkBOM").is(":checked")) {
      if ($("#edtproductname").val() == "") {
        swal("Please provide the product name !", "", "warning");
        $("#chkBOM").prop("checked", false);
        return false;
      }
      $("#BOMSetupModal").modal("toggle");
      let record = templateObject.records.get();

      $("#edtMainProductName").val($("#edtproductname").val());
      // if(templateObject.isManufactured.get() == false) {
      //   $(".edtProcessNote").val($("#txasalesdescription").val());
      // }

      templateObject.isManufactured.set(true);

      if (record == undefined || record.productname == undefined || record.productname == "") {
        $("#edtMainProductName").val($("#edtproductname").val());
      }
      setTimeout(() => {
        if (!FlowRouter.current().queryParams.id || $("#edtProcess").val() == "") {
          $("#edtProcess").trigger("click");
        }
      }, 1000);
    } else {
      templateObject.isManufactured.set(false);
    }
  },

  "click .btnAddAttachment": function (event) {
    let tempObject = Template.instance();
    let row = $(event.target).closest(".productRow");
    let targetField = $(row).find(".attachedFiles");
    tempObject.selectedAttachedField.set(targetField);
  },

  "click .btn-save-bom": function (event) {
    const templateObject = Template.instance();
    playSaveAudio();
    setTimeout(function () {
      $(".fullScreenSpin").css("display", "none");
      let mainProductName = $("#edtMainProductName").val();
      let mainProcessName = $("#edtProcess").val();
      // let bomProducts = localStorage.getItem('TProcTree')? JSON.parse(localStorage.getItem('TProcTree')) : []
      let bomProducts = templateObject.bomProducts.get();
      if (mainProductName == "") {
        swal("Please provide the product name !", "", "warning");
        $(".fullScreenSpin").css("display", "none");
        return false;
      }
      if (mainProcessName == "") {
        swal("Please provide the process !", "", "warning");
        $(".fullScreenSpin").css("display", "none");
        return false;
      }

      if ($(".edtDuration").val() == "") {
        swal("Please set duration for process !", "", "warning");
        $(".fullScreenSpin").css("display", "none");
        return false;
      }

      let products = $(".product-content");
      if (products.length < 3) {
        swal("Must have sub builds or raws !", "", "warning");
        $(".fullScreenSpin").css("display", "none");
        return false;
      }

       let main_productRows = products[0].querySelectorAll(".productRow");
       let attachment_main = JSON.parse($(main_productRows[0]).find(".attachedFiles").text() != "" ? $(main_productRows[0]).find(".attachedFiles").text() : "[]").uploadedFilesArray || [];


        let main_attachmentName = [];
        let main_attach_json ;

        for(let i =0 ; i < attachment_main.length ; i++) {
            main_attach_json ={ attachmentName:  attachment_main[i].fields.AttachmentName};
            main_attachmentName.push(main_attach_json);
      }

      let objDetails = {
        Caption: mainProductName,
        Info: mainProcessName,
        CustomInputClass: $(products[0]).find(".edtProcessNote").val() || "",
        Description: "",
        Details: "",
        TotalQtyOriginal: 0,
        QtyVariation: parseFloat($(".edtDuration").val()) || 1,
        Value: JSON.stringify(main_attachmentName),
        ProcStepItemRef: "vs1BOM",
      };
      let subBOMs = [];
      for (let i = 1; i < products.length - 1; i++) {
        let productRows = products[i].querySelectorAll(".productRow");
        let objectDetail;
        let _name = $(productRows[0]).find(".edtProductName").val();
        let _qty = $(productRows[0]).find(".edtQuantity").val();
        let _process = $(productRows[0]).find(".edtProcessName").val();
        let _note = $(productRows[0]).find(".edtProcessNote").val();
        let _attachments = JSON.parse($(productRows[0]).find(".attachedFiles").text() != "" ? $(productRows[0]).find(".attachedFiles").text() : "[]") || [];
        let _productDuration = $(productRows[0]).find(".edtDuration").val();


        objectDetail = {
          productName: _name,
          qty: _qty,
          process: _process,
          processNote: _note,
        //attachments: _attachments,
          attachments: [],
          duration: _productDuration,
          subs: [],
        };
        if (productRows.length > 1) {
          for (let j = 1; j < productRows.length; j++) {
            let _productName = $(productRows[j]).find(".edtProductName").val();
            let _productQty = $(productRows[j]).find(".edtQuantity").val();
            let _rawProcess = $(productRows[j]).find(".edtProcessName").val();
            let _productDuration = $(productRows[j]).find(".edtDuration").val();
            if (_productName != "" && _productQty != "") {
              objectDetail.subs.push({
                productName: _productName,
                qty: _productQty,
                process: _rawProcess,
                duration: _productDuration,
              });
            }
          }
        } else {
          let bomProductIndex = bomProducts.findIndex((product) => {
            return product.Caption == _name;
          });
          if (bomProductIndex > -1) {
            let subProduct = bomProducts[bomProductIndex];
            if (subProduct && subProduct.fields.subs && subProduct.fields.subs.length > 0) {
              for (let j = 0; j < subProduct.fields.subs.length; j++) {
                let sub = subProduct.fields.subs[j];
                objectDetail.subs.push({
                  productName: sub.productName,
                  qty: sub.qty,
                  process: sub.process,
                  duration: sub.duration,
                });
              }
            }
          }
        }
        // }
        // objDetails.subs.push(objectDetail);
        subBOMs.push(objectDetail);
      }


      objDetails.Details = JSON.stringify(subBOMs) || "";

      let object = {
        type: "TProcTree",
        fields: objDetails,
      };
      templateObject.bomStructure.set(object);


      let bomObject = object;

      let existID = -1;
      let existIndex = bomProducts.findIndex((product) => {
          return product.Caption == bomObject.fields.Caption;
      });

      if (existIndex == -1) {
        // productService.getOneBOMProductByName(bomObject.fields.Caption).then(function (data) {
        //   if (data.tproctree.length > 0) {
        //     existID = data.tproctree[0].ID;
        //   }
        // });

      } else {
          existID = bomProducts[existIndex].Id;
      }

      let temp = cloneDeep(bomObject);

      if(existID != -1) {
        temp.fields.ID = existID;
      }

      temp.fields.Description = templateObject.records.get().salesdescription;

      // if(typeof templateObject.records.get().totalqtyinstock == "undefined" ) {
      //   temp.fields.TotalQtyOriginal = 0;
      // } else {
      //   temp.fields.TotalQtyOriginal = templateObject.records.get().totalqtyinstock;
      // }


      productService.saveBOMProduct(temp).then(function () {
        productService.getAllBOMProducts(initialDatatableLoad, 0).then(function (data) {
          addVS1Data("TProcTree", JSON.stringify(data)).then(function () {});
        });
      });

      swal("BOM Settings Successfully Saved", "", "success");

      // let productContents = $("#BOMSetupModal").find(".product-content");
      // for (let l = 1; l < productContents.length - 1; l++) {
      //   $(productContents[l]).remove();
      // }
      $("#BOMSetupModal").modal("toggle");

    }, delayTimeAfterSound);
  },

  "click .btn-print-bom": function (event) {
    playPrintAudio();
    setTimeout(function () {
      document.title = "Product BOM Setup";
      $("#BOMSetupModal .modal-body").print({
        // title   :  document.title +" | Product Sales Report | "+loggedCompany,
        noPrintSelector: ".btnAddProduct",
        noPrintSelector: ".btnAddSubProduct",
        noPrintSelector: ".btn-remove-raw",
        noPrintSelector: ".btnAddAttachment",
      });
    }, delayTimeAfterSound);
  },

  "click .btn-cancel-bom": function (event) {
    let templateObject = Template.instance();
    let productContents = $("#BOMSetupModal").find(".product-content");
    // for (let l = 1; l < productContents.length - 1; l++) {
    //   $(productContents[l]).remove();
    // }
    $("#BOMSetupModal").modal("toggle");
    //check if this is already saved BOM and remove show bom button
    let bomProducts = templateObject.bomProducts.get();
    let index = bomProducts.findIndex((product) => {
      return product.Caption == $("#edtMainProductName").val();
    });
    if (index == -1) {
      productService.getOneBOMProductByName($("#edtMainProductName").val()).then(function (data) {
        if (data.tproctree.length == 0) {
          $("#chkBOM").attr("checked", false);
          templateObject.isManufactured.set(false);
        } else {
          $("#chkBOM").attr("checked", true);
          templateObject.isManufactured.set(true);
        }
      });
    }
  },

  "click #closeBOMSetupModal": function (event) {
    $(".btn-cancel-bom").trigger("click");
  },

  "click #accountListModal table tr": function (event) {},

  "click #addNewUOM": function (event) {
    var UOMRowClone = $(".uomRow:first");
    let tokenid = Random.id();
    var NewUOMRow = UOMRowClone.clone().prop("id", "UOM" + tokenid);
    NewUOMRow.addClass('saleRowWrapper')
    NewUOMRow[0].style.display = "flex";
    NewUOMRow.find("#sltsalesacount").editableSelect();
    NewUOMRow.find("#sltsalesacount").val("Sales");
    NewUOMRow.find("#sltsalesacount").editableSelect().on("click.editable-select", editableService.clickSalesAccount);
    NewUOMRow.find("#slttaxcodesales").editableSelect();
    NewUOMRow.find("#slttaxcodesales").val(loggedTaxCodeSalesInc);
    NewUOMRow.find("#slttaxcodesales").editableSelect().on("click.editable-select", editableService.clickTaxCodeSales);

    NewUOMRow.find("#sltUomSales").editableSelect();
    NewUOMRow.find("#sltUomSales").val(defaultUOM);
    NewUOMRow.find("#sltUomSales").editableSelect().on("click.editable-select", editableService.clickUomSales);
    NewUOMRow.insertAfter(".uomRow:last");

    var COGSRowClone = $(".COGSRow:first");
    var NewCOGSRow = COGSRowClone.clone().prop("id", "COGS" + tokenid);
    NewCOGSRow.addClass('purchaseRowWrapper')
    NewCOGSRow[0].style.display = "flex";
    NewCOGSRow.find("#sltcogsaccount").editableSelect();
    NewCOGSRow.find("#sltcogsaccount").val("Cost of Good Sold");
    NewCOGSRow.find("#sltcogsaccount").editableSelect().on("click.editable-select", editableService.clickCogsAccount);
    NewCOGSRow.find("#slttaxcodesales").editableSelect();
    NewCOGSRow.find("#slttaxcodesales")
      .editableSelect()
      .on("click.editable-select", editableService.clickTaxCodeSales);

    NewCOGSRow.find("#sltUomPurchases").editableSelect();
    NewCOGSRow.find("#sltUomPurchases").val(defaultUOM);
    NewCOGSRow.find("#sltUomPurchases").editableSelect().on("click.editable-select", editableService.clickUomPurchase);

    NewCOGSRow.find("#slttaxcodepurchase").editableSelect();
    NewCOGSRow.find("#slttaxcodepurchase").val(loggedTaxCodeSalesInc);
    NewCOGSRow.find("#slttaxcodepurchase").editableSelect().on("click.editable-select", editableService.clickTaxCodePurchase);
    NewCOGSRow.insertAfter(".COGSRow:last");
    // itemClineID.find('input[type="text"]').val('');
    // itemClineID.find('select[name^="sltCustomerType"]').val('');
  },

  "click #sltUomPurchases": function (event) {
    setTimeout(async function () {
      await $('div.dataTables_filter input').addClass('form-control form-control-sm');
      $('#tblUOMListPop_filter .form-control-sm').get(0).focus();
      $('#tblUOMListPop_filter .form-control-sm').trigger("input");
    }, 500);
  },

  "click #sltUomSales": function (event) {
    setTimeout(async function () {
      await $('div.dataTables_filter input').addClass('form-control form-control-sm');
      $('#tblUOMListPop_filter .form-control-sm').get(0).focus();
      $('#tblUOMListPop_filter .form-control-sm').trigger("input");
    }, 500);
  },

  "click .btnRemoveUOM": function (event) {
    var targetID = $(event.target).closest(".uomRow").attr("id");
    if ($(".uomRow").length > 1) {
      $("#" + targetID).remove();
    }
    if ($(".COGSRow").length > 1) {
      $("#COGS" + targetID.replace("UOM", "")).remove();
    }
  },

  "click .btnRemoveCOGS": function (event) {
    var targetID = $(event.target).closest(".COGSRow").attr("id");
    if ($(".COGSRow").length > 1) {
      $("#" + targetID).remove();
    }
    if ($(".uomRow").length > 1) {
      $("#UOM" + targetID.replace("COGS", "")).remove();
    }
  },
  // 'click .new_attachment_btn': function(event) {
  //     let inputEle = $(event.target).closest('.modal-footer').find('.attachment-upload');
  //     $(inputEle).trigger('click');
  // },

  // 'change .attachment-upload': function(event) {
  //     let myFiles = $(event.target)[0].files;
  //     let saveToTAttachment = false;
  //     let lineIDForAttachment = false;
  //     let uploadData = utilityService.attachmentUpload([], myFiles, saveToTAttachment, lineIDForAttachment);
  // },

  // 'click .remove-attachment': function (event, ui) {
  //     let tempObj = Template.instance();
  //     // let attachmentID = parseInt(event.target.id.split('remove-attachment-')[1]);
  //     // if (tempObj.$("#confirm-action-" + attachmentID).length) {
  //     //     tempObj.$("#confirm-action-" + attachmentID).remove();
  //     // } else {
  //     //     let actionElement = '<div class="confirm-action" id="confirm-action-' + attachmentID + '"><a class="confirm-delete-attachment btn btn-default" id="delete-attachment-' + attachmentID + '">' +
  //     //         'Delete</a><button class="save-to-library btn btn-default">Remove & save to File Library</button></div>';
  //     //     tempObj.$('#attachment-name-' + attachmentID).append(actionElement);
  //     // }
  //     // tempObj.$("#new-attachment2-tooltip").show();

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

  // add to custom field
  "click #edtSaleCustField1": function (e) {
    $("#clickedControl").val("one");
  },

  // add to custom field
  "click #edtSaleCustField2": function (e) {
    $("#clickedControl").val("two");
  },

  // add to custom field
  "click #edtSaleCustField3": function (e) {
    $("#clickedControl").val("three");
  },

  "change #txasalesdescription": function (e) {
    $("#txapurchasedescription").val($("#txasalesdescription").val());
  },

  "click input.OnBO": function (event) {
    toggleRecentTransaction()
  },
  "click input.InStock": function (event) {
    toggleRecentTransaction()
  },
  "click input.Available": function (event) {
    toggleRecentTransaction()
  },

  "click input.OnSO": function (event) {
    toggleRecentTransaction()
  },

  "click input.OnOrder": function (event) {
    toggleRecentTransaction()
  },

  // "change .slttaxcodepurchase": function (e) {
  //   $(".slttaxcodesales").val($(".slttaxcodepurchase").val());
  // },
});

Template.registerHelper("equals", function (a, b) {
  return a === b;
});

Template.productview.creatingNewTopic = function(){
  if(Session.get('is_creating_new_topic')){
    return true;
  }else{
    return false;
  }
};
