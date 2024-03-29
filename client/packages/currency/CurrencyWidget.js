import {TaxRateService} from "../../settings/settings-service";
import {ReactiveVar} from "meteor/reactive-var";
import {SideBarService} from "../../js/sidebar-service";
import "../../lib/global/indexdbstorage.js";
import {setCurrentCurrencySymbol} from "../../popUps/currnecypopup";
import LoadingOverlay from "../../LoadingOverlay";
import FxGlobalFunctions from "./FxGlobalFunctions";
import { Template } from 'meteor/templating';
import './CurrencyWidget.html';
import './CurrencyRate.js'
import './CurrencyConverter.js'
import './CurrencyGlobals.js'
import './FxCurrencyHistory.js'
import './FxGlobalFunctions.js'
import './FxRatesButton.js'
import './currencydropdown.js'
import './newcurrencypop.js'
import './modals/CountryModal.js';
import './modals/FxRateModal.js'

import { Random } from "meteor/random";

let sideBarService = new SideBarService();
let defaultCurrencyCode = CountryAbbr;


Template.CurrencyWidget.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.currencyData = new ReactiveVar();
});

Template.CurrencyWidget.onRendered(function () {
  const templateObject = Template.instance();

  /**
     * Lets load the default currency
     */
  templateObject.loadDefaultCurrency = async c => FxGlobalFunctions.loadDefaultCurrencyForReport(c);

  templateObject.loadDefaultCurrency(defaultCurrencyCode);
});

Template.CurrencyWidget.events({
  "click #sltCurrency": event => {
    $("#currencyModal").modal("show");
  },
  "click .tblCurrencyPopList tbody tr": e => {
    //const rateType = $(".currency-js").attr("type"); // String "buy" | "sell"
    const rateType = e.currentTarget.closest(".currency-js").attributes["type"].value; // String "buy" | "sell"

    const currencySymbol = $(e.currentTarget).find(".colSymbol").text() || "N/A";
    setCurrentCurrencySymbol(currencySymbol);
    const currencyCode = $(e.currentTarget).find(".colCode").text();
    const currencyRate = rateType == "buy"
      ? $(e.currentTarget).find(".colBuyRate").text()
      : $(e.currentTarget).find(".colSellRate").text();

    $("#sltCurrency").attr("currency-symbol", currencySymbol);
    $("#sltCurrency").val(currencyCode);
    $("#sltCurrency").trigger("change");
    $("#exchange_rate").val(currencyRate);
    $("#exchange_rate").trigger("change");
    $("#currencyModal").modal("hide");

    $("#tblCurrencyPopList_filter .form-control-sm").val("");

    setTimeout(function () {
      $(".btnRefreshCurrency").trigger("click");
      LoadingOverlay.hide();
    }, 1000);
  },

  "keyup #exchange_rate": e => onExhangeRateChanged(e),
  "change #exchange_rate": e => onExhangeRateChanged(e),
  "click .btnSave": (e, ui) => {
    playSaveAudio();
    setTimeout(function(){
    saveCurrencyHistory();
  }, delayTimeAfterSound);
  }
});

export const onExhangeRateChanged = e => {
  if (e.type == "keyup" || e.type == "change") {
    $(e.currentTarget).attr("hand-edited", true);
  } else {
    $(e.currentTarget).attr("hand-edited", false);
  }
};

Template.CurrencyWidget.helpers({
  isCurrencyEnable: () => isCurrencyEnable(),

  randomId: function() {
    let templateObject = Template.instance();
    let randomId =   Random.id();
    return randomId;
  }
});

export const isCurrencyEnable = () => FxGlobalFunctions.isCurrencyEnabled();


export const saveCurrencyHistory = async (date = null, custid = "") => {
  if($('#exchange_rate').attr('hand-edited') == true || $('#exchange_rate').attr('hand-edited') == "true" ) {
    let currencyId = "#sltCurrency" + (custid ? '_' + custid : "");
    //const type = $('.currency-js').attr('type');
    const type = $(currencyId).closest(".currency-js").attr("type")

     const currencyRate = parseFloat($('#exchange_rate').val());
    let currencyCode = $(currencyId).val();

     const _currencyObj = await FxGlobalFunctions.loadDefaultCurrency(currencyCode);

     const currencyObj = {
       type: "TCurrency",
       fields: {
         Active: true,
         ID: _currencyObj.CurrencyID,
         // Country: _currencyObj.Country,
         // Code: _currencyObj.Code,
         // CurrencySymbol: _currencyObj.CurrencySymbol,
         // Currency: _currencyObj.Currency,
         // CurrencyDesc: _currencyObj.CurrencyDesc,
         BuyRate: type == "buy" ? currencyRate : _currencyObj.BuyRate,
         SellRate: type == "sell" ? currencyRate : _currencyObj.SellRate,
       }
     };


     return await (new TaxRateService()).saveCurrency(currencyObj);
  }



}
