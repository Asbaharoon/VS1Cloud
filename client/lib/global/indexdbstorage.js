const { get } = require("jquery");
const { default: erpObject } = require("./erp-objects");

openDb1 = function (dbName) {
  return new Promise((resolve, reject) => {
    let dbReq = indexedDB.open(dbName, 1);
    //localStorage.setItem("vs1Db", dbName)

    dbReq.onsuccess = () => resolve(dbReq.result);

    dbReq.onupgradeneeded = function (event) {
      let db = event.target.result;
    };

    dbReq.onerror = (event) => reject(new Error("Failed to open DB"));
  });
};

openDb2 = function () {
  return new Promise((resolve, reject) => {
    let dbReq = indexedDB.open("TDatabase", 1);
    dbReq.onsuccess = () => resolve(dbReq.result);

    dbReq.onupgradeneeded = function (event) {
      let db = event.target.result;
      db.createObjectStore("TDatabases", { keyPath: "EmployeeEmail" });
    };
  });
};

openDb = function (dbName) {
  return new Promise((resolve, reject) => {
    let dbReq = indexedDB.open(dbName, 1);

    dbReq.onsuccess = () => resolve(dbReq.result);

    dbReq.onupgradeneeded = function (event) {
      let db = event.target.result;
      db.createObjectStore("vscloudlogininfo", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProductVS1", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProductQtyList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCustomerVS1", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCustomerVS1List", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TSupplierProduct", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TSupplierVS1", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TSupplierVS1List", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TAccountVS1", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TAccountVS1List", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TTaxcodeVS1", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TTaxcodeVS1List", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TSubTaxVS1", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TTermsVS1", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TTermsVS1List", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TDeptClass", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TDeptClassList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TDepartment", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCostTypes", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCurrency", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCurrencyList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TLeadStatusType", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TLeadStatusTypeList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TShippingMethod", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TShippingMethodList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TAccountType", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TERPCombinedContactsVS1", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TJournalEntryLines", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TBankAccountReport", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TInvoiceEx", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TInvoiceNonBackOrder", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("BackOrderSalesList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TInvoiceBackOrder", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPurchaseOrderEx", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TReconciliation", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCheque", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProductStocknSalePeriodReport", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TAppUser", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TJobVS1", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TJobVS1List", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TStockAdjustEntry", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TsalesOrderNonBackOrder", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TbillReport", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TBill", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCredit", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TpurchaseOrderNonBackOrder", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TpurchaseOrderBackOrder", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TSalesList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPurchasesList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TEmployee", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TEmployeeList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TQuote", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProductClassQuantity", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TAppointment", { keyPath: "EmployeeEmail" });
      db.createObjectStore("ARList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TBankCode", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCashSale", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TClientType", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TClientTypeList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TChequeEx", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCompanyType", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TContact", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCountries", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCountrylist", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCustomerEx", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCustomerPayment", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TEmployeeEx", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TemployeeAttachment", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TemployeePicture", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TBillEx", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TWeightUnit", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TVolumeUnit", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TLeads", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TLeaveAccruals", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TManufacture", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TMarketingContact", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TModel", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TOtherContact", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPaymentMethod", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPaymentMethodList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TpaySplit", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPhoneSupportLog", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPhoneSupportType", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPhoneSupportVersion", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TPosKeypad", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPosTill", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProductJPGPicture", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProductWeb", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProspectEx", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProspectList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TRepairs", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TRefundSale", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TRegionalOptions", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TRepObjStatementList", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TSalesOrderEx", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TSalesCategory", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TServices", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TShippingAddress", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TSmartOrder", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TStockTransferEntry", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TStockTransferEntryList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TTasks", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TTimeSheet", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TTimeSheetEntry", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TToDo", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TUser", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TExpenseClaim", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TFixedAssets", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TFixedAssetsList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProductSalesDetailsReport", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("BalanceSheetReport", { keyPath: "EmployeeEmail" });
      db.createObjectStore("ProfitLossReport", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCompanyInfo", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TFixedAssetType", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TAttachment", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TBillLines", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TSupplierPayment", { keyPath: "EmployeeEmail" });
      db.createObjectStore("SaleGroup", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TExpenseClaimReport", { keyPath: "EmployeeEmail" });
      db.createObjectStore("APList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TDashboardAccountSummaryReport", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TTrialBalanceReport", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TAccountRunningBalanceReport", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TProfitAndLossPeriodCompareReport", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TTaxSummaryReport", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TSummarySheetReport", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TGeneralLedgerReport", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TUnitOfMeasure", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TUnitOfMeasureList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProductBarcode", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProductPicture", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProductBin", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProductMovementList", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TERPForm", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TEmployeeFormAccess", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TEmployeeFormAccessDetail", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TSaleClientSignature", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TChequeStatus", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCreditStatus", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TBillStatus", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TReturnAuthorityStatus", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TCustomerReturnStatusStatus", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TARReport", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TAPReport", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TStatementList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TStatementForCustomer", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TJobEx", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TJobSalesSummary", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TJobProfitability", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TERPCombinedContacts", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TPaymentList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TOtherContactVS1", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProspectVS1", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProspectVS1List", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TcompLogo", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TEmployeePicture", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TContractorPaymentSummary", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TProfitAndLossPeriodReport", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TToBeReconciledWithDrawal", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TToBeReconciledDeposit", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TTimesheetEntryDetails", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("T_VS1_Report_Productmovement", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TGlobalSearchReport", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProductLocationQty", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TAppointmentPreferences", {
        keyPath: "EmployeeEmail",
      });
      //New
      db.createObjectStore("TTransactionListReport", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TVS1BankDeposit", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TAreaCode", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TStSStrain", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TERPPreference", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TERPPreferenceExtra", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TAwaitingSupplierPayment", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TAwaitingCustomerPayment", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TCustomFieldList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCustomFieldListDropDown", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TReportSchedules", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPayRun", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TAllowance", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPayRate", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TEmployeepaysettings", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TBankAccounts", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TBankAccountsVS1", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TBankAccountsVS1List", { keyPath: "EmployeeEmail" });
      db.createObjectStore("Tsuperannuation", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TTerminationSimple", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TDeduction", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TLeavRequest", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPayHistory", { keyPath: "EmployeeEmail" });
      db.createObjectStore("Tvs1dashboardpreferences", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TVs1TabGroups", { keyPath: "EmployeeEmail" });
      db.createObjectStore("Tvs1charts", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TBankDepositList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TReconciliationList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCustomerPaymentList", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TSupplierPaymentList", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TPurchaseOrderList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TBillList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TChequeList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TQuoteList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TSalesOrderList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TInvoiceList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TRefundSaleList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TSalesBackOrderReport", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TCustomerSummaryReport", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TCreditList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TAppointmentList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TJournalEntryList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPurchasesBackOrderReport", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TOverdueAwaitingCustomerPayment", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TOverdueAwaitingSupplierPayment", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TAssignLeaveType", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TAssignLeaveTypeList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("Tvs1CardPreference", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TQuoteFilterList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TSalesOrderFilterList", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TPayNotes", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TOpeningBalances", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCurrencyFrequencySettings", {
        keyPath: "EmployeeEmail",
      });

      db.createObjectStore("TSerialNumberListCurrentReport", {
        keyPath: "EmployeeEmail",
      });

      db.createObjectStore("TPayrollCalendars", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPayrollHolidays", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPaidLeave", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TUnpaidLeave", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TReimbursement", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TSuperType", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPayrollorganization", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TPayRatetype", { keyPath: "EmployeeEmail" });
      //Earnings
      db.createObjectStore("TOrdinaryTimeEarnings", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("Tovertimeearnings", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TLumpSumE", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TEarningsBonusesCommissions", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TLumpSumW", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TDirectorsFees", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TEarnings", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCRMProjectList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCRMTaskList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCRMLabelList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCRMLeadBarChart", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCRMLeadPieChart", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TTemplateSettings", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPrintTemplateDetail", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProfitLossEditLayout", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TemplateSettings", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TVS1Superannuation", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPayrollHolidayGroup", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TLeave", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPaySlips", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPayTemplateEarningLine", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TPayTemplateDeductionLine", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TPayTemplateSuperannuationLine", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TPayTemplateReiumbursementLine", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TPayrollOrganization", {
        keyPath: "EmployeeEmail",
      });

      db.createObjectStore("TCurrencyRateHistory", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TXeCurrencySettings", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TTripGroup", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TReportsAccountantsCategory", {
        keyPath: "EmployeeEmail",
      });

      db.createObjectStore("TltSalesOverview", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltSalesOrderList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltSaleslines", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltInvoiceList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltInvoiceLines", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltQuoteList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltQuoteLines", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltRefundList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltRefundLines", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltPurchaseOverview", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltPurchaseOrderList", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TltPurchaseLines", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltBillList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltBillLines", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltCreditList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltCreditLines", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltChequeList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltChequeLines", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltDepositList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltDepositLines", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltContactOverview", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltCustomerList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltCustomerLines", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltSupplierList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltSupplierLines", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltEmployeeList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltEmployeeLines", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltInventoryOverview", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TltProductList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TltProductLines", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCorrespendenceList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCampaignList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TReceiptCategory", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCorrespondence", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TEftOptions", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TBASReturn", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TVATReturn", { keyPath: "EmployeeEmail" });
      db.createObjectStore("VS1_Customize", { keyPath: "EmployeeEmail" });
      db.createObjectStore("VS1_Dashboard", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPayrollSettingOvertimes", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TRateTypes", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TTimeSheetDetails", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TServiceLog", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TServiceLogList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPayRunHistory", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProcessStep", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProjectTasks", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProjectTasksList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TBasedOnType", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProcTree", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TABADescriptiveRecord", {
        keyPath: "EmployeeEmail",
      });
      db.createObjectStore("TABADetailRecord", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProductionPlanData", { keyPath: "EmployeeEmail" });
      db.createObjectStore("VS1_BankRule", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TVS1Workorder", {keyPath: "EmployeeEmail" });

      db.createObjectStore("TVS1ProcessClockList", {keyPath: "EmployeeEmail" }); //Danila add
      db.createObjectStore("TVS1ClockOnReport", {keyPath: "EmployeeEmail" });
      db.createObjectStore("TVS1EmployeeClockStatus", {keyPath: "EmployeeEmail" });
      db.createObjectStore("TVS1BuildCostReport", {keyPath: "EmployeeEmail" });
      db.createObjectStore("TClockOnStatus", {keyPath: "EmployeeEmail" });
      db.createObjectStore("VS1_ClosingDates", {keyPath: "EmployeeEmail" });



      db.createObjectStore("TVS1DashboardStatus", {keyPath: "EmployeeEmail" });
      db.createObjectStore("TVS1DashboardOptions", {keyPath: "EmployeeEmail" });
      db.createObjectStore("TVS1Image", {keyPath: "EmployeeEmail"});

      db.createObjectStore("TVS1Sales_Report", {keyPath: "EmployeeEmail"});

      db.createObjectStore("PLMonthlyReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("PLQuarterlyReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("PLYearlyReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("PLYTDReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("JobSalesSummaryReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("AgedReceivablesReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("AgedReceivablesSummaryReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("ProductSalesReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("SalesReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("JobProfitReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("SupplierDetailsReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("SupplierProductReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("CustomerDetailsReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("CustomerSummaryReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("LotReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("StockValueReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("StockQuantityReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("StockMovementReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("ClockedHourReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("PayrollHistoryReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("ForeignExchangeHistoryListReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("ForeignExchangeListReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("SalesSummaryReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("GeneralLedgerReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("TaxSummaryReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("TrialBalanceReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("TimeSheetSummaryReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("PayrollLeaveAccruedReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("PayrollLeaveTakenReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("SerialNumberReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("1099TransactionReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("AccountsListsReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("BinLocationsReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("TransactionJournalReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("UnpaidBillsReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("UnpaidPOReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("BackOrderedPOReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("SalesOrderConvertedReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("SalesOrderUnconvertedReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("PaymentMethodsListReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("BackOrderedInvoicesReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("QuotesConvertedReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("QuotesUnconvertedReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("InvoicesPaidReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("InvoicesUnpaidReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("TimeSheetDetailsReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("ChequeListReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("StockAdjustmentListReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("JournalEntryListReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("AgedPayablesReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("AgedPayablesSummaryReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("PurchaseReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("PurchaseSummaryReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("TFavReportBankingReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("PrintStatementReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("ExecutiveSummaryReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("CashReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("ProfitabilityReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("PerformanceReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("BalanceSheetReports", {keyPath: "EmployeeEmail"});
      db.createObjectStore("IncomeReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("PositionReport", {keyPath: "EmployeeEmail"});
      db.createObjectStore("TInventorySettings", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProductBatches", { keyPath: "EmployeeEmail" });
      db.createObjectStore("VS1ProfitandLossCompare", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCustomerDetailsReport", { keyPath: "EmployeeEmail" });
      db.createObjectStore("VS1SupplierSummary_Report", { keyPath: "EmployeeEmail" });
      db.createObjectStore("VS1StockQuantityLocation_Report", { keyPath: "EmployeeEmail" });
      db.createObjectStore("VS1StockValue_Report", { keyPath: "EmployeeEmail" });
      db.createObjectStore("VS1AgedReceivables_Report", { keyPath: "EmployeeEmail" });
      db.createObjectStore("VS1AgedReceivableSummary_Report", { keyPath: "EmployeeEmail" });
      db.createObjectStore("VS1ProfitandLoss_Report", { keyPath: "EmployeeEmail" });
      db.createObjectStore("PrintDisplaySettings", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPNLLayout", { keyPath: "EmployeeEmail" });
      db.createObjectStore("ManufacturingSettings", { keyPath: "EmployeeEmail"});
      db.createObjectStore("TDashboardExecData1", { keyPath: "EmployeeEmail"});
      db.createObjectStore("TDashboardSalesData1", { keyPath: "EmployeeEmail"});
      db.createObjectStore("TDashboardSalesData2", { keyPath: "EmployeeEmail"});
      db.createObjectStore("TDashboardSalesData3", { keyPath: "EmployeeEmail"});
      db.createObjectStore("TDashboardMyData1", { keyPath: "EmployeeEmail"});
      db.createObjectStore("TDashboardMyData2", { keyPath: "EmployeeEmail"});
      db.createObjectStore("TDashboardMyData3", { keyPath: "EmployeeEmail"});
      db.createObjectStore("BuildProfitabilityReport", { keyPath: "EmployeeEmail"});
      db.createObjectStore("ProductionWorksheetReport", { keyPath: "EmployeeEmail"});
      db.createObjectStore("WorkOrderReport", { keyPath: "EmployeeEmail"});
      db.createObjectStore("TBankNameList", { keyPath: "EmployeeEmail"});
      db.createObjectStore("TCRMLeadChart", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TTitleList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TDashbaordOptions", {keyPath: "EmployeeEmail"});
      db.createObjectStore("TTransactionDescription", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TTransactionCode", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TRepServices", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TNewAppointment", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TAppointmentsTimeLog", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TNewLeaveRequest", { keyPath: "EmployeeEmail" });


      // For accountant favorite reports state
      db.createObjectStore('TFavReportCompany', {keyPath: 'EmployeeEmail'});
      db.createObjectStore('TFavReportTrustee', {keyPath: 'EmployeeEmail'});
      db.createObjectStore('TFavReportFinancialStatement', {keyPath: 'EmployeeEmail'});
      db.createObjectStore('TFavReportIndividual', {keyPath: 'EmployeeEmail'});
      db.createObjectStore('TFavReportPartnershipNonTrading', {keyPath: 'EmployeeEmail'});
      db.createObjectStore('TFavReportTrustNonTrading', {keyPath: 'EmployeeEmail'});
      db.createObjectStore('TFavReportSelfManagedSuperfund', {keyPath: 'EmployeeEmail'});
      db.createObjectStore('TFavReportSingleDirector', {keyPath: 'EmployeeEmail'});
      db.createObjectStore('TFavReportSoleTraderNonTrading', {keyPath: 'EmployeeEmail'});
      db.createObjectStore('TFavReportTrust', {keyPath: 'EmployeeEmail'});

      db.createObjectStore('TFavSupplierList', {keyPath: 'EmployeeEmail'});
      db.createObjectStore('TFavSupplierSummaryReport', {keyPath: 'EmployeeEmail'});

      db.createObjectStore("TReconciliationBankAccountsList", { keyPath: "EmployeeEmail" });

      db.createObjectStore("TEftFilesCreated", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TEftBankRuleList", { keyPath: "EmployeeEmail" });

      db.createObjectStore("CloudAppointmentStartStopAccessLevel", { keyPath: "EmployeeEmail" });
      db.createObjectStore("CloudAppointmentAllocationLaunch", { keyPath: "EmployeeEmail" });
      db.createObjectStore("CloudAppointmentCreateAppointment", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TFavoriteReport", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCRMLeadTaskList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TProjectListReport", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TFields", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCRMCustomerTaskList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCRMEmployeeTaskList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCRMSupplierTaskList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TDashboardOptions", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TPayPeriods", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TAutomatedEmail", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TBankRuleList", { keyPath: "EmployeeEmail" });
      db.createObjectStore("TCustomFieldDropdownOptions", {keyPath: "EmployeeEmail"});
      db.createObjectStore("TExpenseClaimList", {keyPath: "EmployeeEmail"});
      db.createObjectStore("TAgedPayableSummary", {keyPath: "EmployeeEmail"});
      db.createObjectStore("TAgedReceivableSummary", {keyPath: "EmployeeEmail"});
      db.createObjectStore("TSalesSummary", {keyPath: "EmployeeEmail"});
      db.createObjectStore("Tdeliverychart", {keyPath: "EmployeeEmail"});
    };
    dbReq.onerror = (event) => reject(new Error("Failed to open DB"));
  });
};

storeExists = function (objectStore, Email) {
  var promise = new Promise((resolve, reject) => {
    var exists = false;
    var objectStoreRequest = objectStore.get(Email);
    objectStoreRequest.onsuccess = function () {
      if (objectStoreRequest.result) {
        if (Email == objectStoreRequest.result.EmployeeEmail) {
          localStorage.setItem("vs1Db", objectStoreRequest.result.data);
          exists = true;
          resolve(exists);
        }
      } else {
        exists = false;
        resolve(exists);
      }
    };
  });
  return promise;
};

addLoginData = async function (loginData) {
  const db = await openDb(loginData.ProcessLog.DatabaseName);
  const db1 = await openDb2();
  let transaction1 = await db1.transaction(["TDatabases"], "readwrite");
  let transaction = await db.transaction(["vscloudlogininfo"], "readwrite");
  localStorage.setItem("vs1Db", loginData.ProcessLog.DatabaseName);

  transaction.oncomplete = function (event) {};

  transaction1.oncomplete = function (event) {};
  localStorage.setItem(
    "vs1EmployeeName",
    loginData.ProcessLog.VS1UserName || loginData.ProcessLog.VS1AdminUserName
  );
  let loginInfo = {
    EmployeeEmail:
      loginData.ProcessLog.VS1UserName || loginData.ProcessLog.VS1AdminUserName,
    data: loginData,
  };

  let dbInfo = {
    EmployeeEmail:
      loginData.ProcessLog.VS1UserName || loginData.ProcessLog.VS1AdminUserName,
    data: loginData.ProcessLog.DatabaseName,
  };

  let dbObjectStore = transaction1.objectStore("TDatabases");
  let objectStore = transaction.objectStore("vscloudlogininfo");

  dbObjectStore.add(dbInfo);
  objectStore.put(loginInfo);
};

addVS1Data = async function (objectName, vs1Data) {
  const db = await openDb(localStorage.getItem("vs1Db"));
  //const db1 = await openDb2();
  //let transaction1 = await db1.transaction(["TDatabases"], "readwrite")
  let transaction = await db.transaction([objectName], "readwrite");

  transaction.oncomplete = function (event) {};
  let currentDate = new Date();
  let hours = currentDate.getHours(); //returns 0-23
  let minutes = currentDate.getMinutes(); //returns 0-59
  let seconds = currentDate.getSeconds(); //returns 0-59
  let month = currentDate.getMonth() + 1;
  let days = currentDate.getDate();

  if (currentDate.getMonth() + 1 < 10) {
    month = "0" + (currentDate.getMonth() + 1);
  }

  if (currentDate.getDate() < 10) {
    days = "0" + currentDate.getDate();
  }

  if (currentDate.getHours() < 10) {
    hours = "0" + currentDate.getHours();
  }

  if (currentDate.getMinutes() < 10) {
    minutes = "0" + currentDate.getMinutes();
  }
  if (currentDate.getSeconds() < 10) {
    seconds = "0" + currentDate.getSeconds();
  }
  let currenctUpdateDate =
    currentDate.getFullYear() +
    "-" +
    month +
    "-" +
    days +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;
  let loginInfo = {
    EmployeeEmail: localStorage.getItem("vs1EmployeeName"),
    data: vs1Data,
    timestamp: currenctUpdateDate,
  };
  let objectStore = transaction.objectStore(objectName);
  objectStore.put(loginInfo);
};

clearData = async function (objectName) {
  // open a read/write db transaction, ready for clearing the data
  const db = await openDb(localStorage.getItem("vs1Db"));
  const transaction = await db.transaction([objectName], "readwrite");

  // report on the success of the transaction completing, when everything is done
  transaction.oncomplete = function (event) {};

  transaction.onerror = function (event) {};

  // create an object store on the transaction
  const objectStore = transaction.objectStore(objectName);

  // Make a request to clear all the data out of the object store
  const objectStoreRequest = objectStore.clear();

  objectStoreRequest.onsuccess = function (event) {
    // report the success of our request
  };
};

queryLoginDataObject = function (objectStore, VS1AdminUserName) {
  var promise = new Promise((resolve, reject) => {
    let results = objectStore.openCursor();
    let data = [];
    results.onerror = () => reject();
    results.onsuccess = (event) => {
      let cursor = event.target.result;
      if (cursor) {
        if (VS1AdminUserName == cursor.key) {
          data.push(cursor.value);
          // if(!data){
          //     reject('');
          // }
        }
        cursor.continue();
      } else {
        if (data) {
          resolve(data);
        }
      }
    };
  });
  return promise;
};

getLoginData = async function (email) {
  const db = await openDb(localStorage.getItem("vs1Db"));
  const transaction = await db.transaction(["vscloudlogininfo"]);
  const objectStore = await transaction.objectStore("vscloudlogininfo");
  return await queryLoginDataObject(objectStore, email);
};

queryVS1DataObject = function (objectStore, VS1AdminUserName) {
  var promise = new Promise((resolve, reject) => {
    let results = objectStore.openCursor();
    let data = [];

    results.onerror = () => reject();
    results.onsuccess = (event) => {
      let cursor = event.target.result;
      if (cursor) {
        if (VS1AdminUserName === cursor.key) {
          data.push(cursor.value);
        }
        cursor.continue();
      } else {
        if (data) {
          resolve(data);
        }
      }
    };
  });
  return promise;
};

getVS1Data = async function (objectData) {
  const db = await openDb(localStorage.getItem("vs1Db"));

  const transaction = await db.transaction([objectData]);
  const objectStore = await transaction.objectStore(objectData);
  return await queryVS1DataObject(
    objectStore,
    localStorage.getItem("vs1EmployeeName")
  );
};

storeExists1 = async function (email) {
  const db = await openDb2("TDatabase");
  const transaction = await db.transaction(["TDatabases"]);
  const objectStore = await transaction.objectStore("TDatabases");
  return await storeExists(objectStore, email);
};

deleteStoreExists = function (objectStore, Email) {
  var promise = new Promise((resolve, reject) => {
    var exists = false;
    var objectStoreRequest = objectStore.get(Email);
    objectStoreRequest.onsuccess = function () {
      if (objectStoreRequest.result) {
        if (Email === objectStoreRequest.result.EmployeeEmail) {
          let databaseName = objectStoreRequest.result.data;
          var req = indexedDB.deleteDatabase(databaseName);
          // var req2Deltransaction = objectStore.transaction(["TDatabases"], "readwrite");
          var req2Del = objectStore.delete(Email);
          req.onsuccess = function () {
            req2Del.onsuccess = function () {
              exists = true;
              resolve(exists);
            };
          };
          req.onerror = function () {
            exists = false;
            resolve(exists);
          };
          req.onblocked = function () {
            exists = false;
            resolve(exists);
          };
        }
      } else {
        exists = false;
        resolve(exists);
      }
    };
  });
  return promise;
};

deleteStoreDatabase = async function (databaseName) {
  var req = window.indexedDB
    .databases()
    .then((r) => {
      for (var i = 0; i < r.length; i++) {
        window.indexedDB.deleteDatabase(r[i].name);
      }
    })
    .then(() => {});
  return await req;
};

getStoreToDelete = async function (email) {
  const db = await openDb2("TDatabase");
  const transaction = await db.transaction(["TDatabases"], "readwrite");
  const objectStore = await transaction.objectStore("TDatabases");
  return await deleteStoreExists(objectStore, email);
};

openDbCheckVersion = async function () {
  var promiseversion = new Promise((resolve, reject) => {
    var versionExists = false;
    let dbReqVersion = indexedDB.open("TDatabaseVersion", 266);
    dbReqVersion.onsuccess = function () {
      resolve(versionExists);
    };
    dbReqVersion.onupgradeneeded = function (event) {
      let dbVersion = event.target.result;
      if (event.oldVersion != 0) {
        if (event.oldVersion != event.newVersion) {
          versionExists = true;
          resolve(versionExists);
        } else {
          versionExists = false;
          resolve(versionExists);
        }
      } else {
        versionExists = true;
        resolve(versionExists);
      }
      //dbReqVersion.createObjectStore("TDatabaseVersion", { keyPath: "EmployeeEmail" });
    };
  });
  return promiseversion;
};
