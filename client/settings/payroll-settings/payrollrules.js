import {TaxRateService} from "../settings-service";
import {ReactiveVar} from 'meteor/reactive-var';
import {CountryService} from '../../js/country-service';
import {SideBarService} from '../../js/sidebar-service';
import { UtilityService } from "../../utility-service";
import { AccountService } from "../../accounts/account-service";
import { RateTypeService } from '../../js/ratetype_service';
import { OrganisationService } from "../../js/organisation-service";
import '../../lib/global/indexdbstorage.js';
import 'jquery-editable-select';
import { Random } from 'meteor/random';
import { Session } from 'meteor/session';
import f from "jspdf";
import { over, template } from "lodash";
import CachedHttp from "../../lib/global/CachedHttp";
import erpObject from "../../lib/global/erp-objects";
import LoadingOverlay from "../../LoadingOverlay";
import PayrollSettingsOvertimes from "../../js/Api/Model/PayrollSettingsOvertimes";
import GlobalFunctions from "../../GlobalFunctions";
import TableHandler from "../../js/Table/TableHandler";
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import './payrollrules.html';
import './fundtype.html';
import './grouptypelist.html';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let taxRateService = new TaxRateService();


Template.payrollrules.onCreated(function() {

    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.tableheaderrecords2 = new ReactiveVar([]);
    templateObject.tableheaderrecords3 = new ReactiveVar([]);
    templateObject.tableheaderrecords4 = new ReactiveVar([]);
    templateObject.tableheaderrecords5 = new ReactiveVar([]);
    templateObject.tableheaderrecords6 = new ReactiveVar([]);
    templateObject.tableheaderrecords7 = new ReactiveVar([]);
    templateObject.tableheaderrecords8 = new ReactiveVar([]);
    templateObject.tableheaderrecords9 = new ReactiveVar([]);
    templateObject.datatableallowancerecords = new ReactiveVar([]);
    templateObject.tableGrouplistheaderrecord = new ReactiveVar([]);
    templateObject.countryData = new ReactiveVar();
    templateObject.imageFileData=new ReactiveVar();
    templateObject.Accounts = new ReactiveVar([]);
    templateObject.overtimes = new ReactiveVar([]);
    templateObject.rateTypes = new ReactiveVar([]);
    templateObject.earnings = new ReactiveVar([]);
    templateObject.customerrecords = new ReactiveVar([]);

    templateObject.getDataTableList = function(data){
        let dataList = [
            data.fields.ID || "",
            data.fields.PayrollCalendarName || "",
            data.fields.PayrollCalendarPayPeriod || "",
            moment(data.fields.PayrollCalendarStartDate).format('DD/MM/YYYY') || "",
            moment(data.fields.PayrollCalendarFirstPaymentDate).format('DD/MM/YYYY') || "",
            data.fields.PayrollCalendarActive == true ? '' : 'In-Active',
        ];
        return dataList;
    }
    let headerStructure  = [
        { index: 0, label: 'ID', class: 'colCalenderID', active: false, display: true, width: "" },
        { index: 1, label: 'Name', class: 'colPayCalendarName', active: true, display: true, width: "250" },
        { index: 2, label: 'Pay Period', class: 'colPayPeriod', active: true, display: true, width: "150" },
        { index: 3, label: 'Next Pay Period', class: 'colNextPayPeriod', active: true, display: true, width: "200" },
        { index: 4, label: 'Next Payment Date', class: 'colNextPaymentDate', active: true, display: true, width: "300" },
        { index: 5, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
    ];
    templateObject.tableheaderrecords.set(headerStructure);

    templateObject.getDataTableList1 = function (data)  {
        let dataList = [
            data.files.ID || '',
            data.files.Groupdesc || ''
        ];
        return dataList;
    }

    let GroupListHeaderStructure = [
        { index: 0, label: 'ID', class: 'colCalenderID', active: false, display: true, width: "10" },
        { index: 1, label: 'Name', class: 'thgroupDescription', active: true, display: true, width: "300" },
        { index: 2, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" }
    ];
    templateObject.tableGrouplistheaderrecord.set(GroupListHeaderStructure);

    templateObject.getDataTableList2 = function(data){
        let dataList = [
            data.fields.ID || "",
            data.fields.PayrollHolidaysName || "",
            moment(data.fields.PayrollHolidaysDate).format("DD/MM/YYYY") || "",
            data.fields.PayrollHolidaysGroupName || "",
            data.fields.PayrollHolidaysActive == true ? '' : 'In-Active',
        ];
        return dataList;
    }
    let headerStructure2  = [
        { index: 0, label: 'ID', class: 'colHolidayID', active: false, display: true, width: "" },
        { index: 1, label: 'Holiday Name', class: 'colHolidayName', active: true, display: true, width: "300" },
        { index: 2, label: 'Holiday Date', class: 'colHolidayDate', active: true, display: true, width: "250" },
        { index: 3, label: 'Holdiday group', class: 'colHolidaygroup', active: false, display: true, width: "" },
        { index: 4, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" }
    ];
    templateObject.tableheaderrecords2.set(headerStructure2);

    templateObject.getDataTableList3 = function(data){
        let allowanceAmount = utilityService.modifynegativeCurrencyFormat(data.fields.Amount) || 0.00;
        let dataList = [
            data.fields.ID || 0,
            data.fields.Description || '-',
            data.fields.AllowanceType || '',
            data.fields.DisplayName || '',
            allowanceAmount || 0.00,
            data.fields.Accountname || '',
            data.fields.Accountid || 0,
            data.fields.Payrolltaxexempt || false,
            data.fields.Superinc || false,
            data.fields.Workcoverexempt || false,
            data.fields.Active == true ? '' : 'In-Active',
        ];
        return dataList;
    }
    let headerStructure3  = [
        { index: 0, label: 'ID', class: 'colAlowancesID', active: false, display: true, width: "" },
        { index: 1, label: 'Allowance Name', class: 'colAlowancesNames', active: true, display: true, width: "200" },
        { index: 2, label: 'Allowance Type', class: 'colAllowancesType', active: true, display: true, width: "80" },
        { index: 3, label: 'Display Name', class: 'colAllowancesDisplayName', active: true, display: true, width: "200" },
        { index: 4, label: 'Amount', class: 'colAllowancesAmount', active: true, display: true, width: "100" },
        { index: 5, label: 'Account', class: 'colAllowancesAccounts', active: true, display: true, width: "100" },
        { index: 6, label: 'Account ID', class: 'colAllowancesAccountsID', active: false, display: true, width: "" },
        { index: 7, label: 'PAYG withholding', class: 'colAllowancesPAYG', active: false, display: true, width: "" },
        { index: 8, label: 'Superannuation Guarantee Contribution', class: 'colAllowancesSuperannuation', active: false, display: true, width: "" },
        { index: 9, label: 'Reportable as W1', class: 'colAllowancesReportableasW1', active: false, display: true, width: "" },
        { index: 10, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
    ];
    templateObject.tableheaderrecords3.set(headerStructure3);

    templateObject.getDataTableList4 = function(data){
        let dataList = [
            data.fields.ID || 0,
            data.fields.EarningsName || '',
            data.fields.EarningType || '',
            data.fields.EarningsDisplayName || '',
            data.fields.EarningsRateType || '',
            '$' + '100',
            data.fields.ExpenseAccount || '',
            data.fields.ExpenseAccount || '',
            data.fields.EarningsExemptPaygWithholding || '',
            data.fields.EarningsExemptSuperannuationGuaranteeCont || '',
            data.fields.EarningsReportableW1onActivityStatement || '',
            data.fields.Active == true ? '' : 'In-Active',
        ];
        return dataList;
    }
    let headerStructure4  = [
        { index: 0, label: 'ID', class: 'colEarningsID', active: false, display: true, width: "" },
        { index: 1, label: 'Earnings Name', class: 'colEarningsNames', active: true, display: true, width: "200" },
        { index: 2, label: 'Earnings Type', class: 'colEarningsType', active: true, display: true, width: "80" },
        { index: 3, label: 'Display Name', class: 'colEarningsDisplayName', active: true, display: true, width: "200" },
        { index: 4, label: 'Rate Type', class: 'colEarningsratetype', active: true, display: true, width: "100" },
        { index: 5, label: 'Amount', class: 'colEarningsAmount', active: true, display: true, width: "100" },
        { index: 6, label: 'Account', class: 'colEarningsAccounts', active: true, display: true, width: "100" },
        { index: 7, label: 'Account ID', class: 'colEarningsAccountsID', active: false, display: true, width: "" },
        { index: 8, label: 'PAYG withholding', class: 'colEarningsPAYG', active: false, display: true, width: "" },
        { index: 9, label: 'Superannuation Guarantee Contribution', class: 'colEarningsSuperannuation', active: false, display: true, width: "" },
        { index: 10, label: 'Reportable as W1', class: 'colEarningsReportableasW1', active: false, display: true, width: "" },
        { index: 11, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
    ];
    templateObject.tableheaderrecords4.set(headerStructure4);

    templateObject.getDataTableList5 = function(data){
        let deductionAmount = utilityService.modifynegativeCurrencyFormat(data.fields.Amount) || 0.00;
        let dataList = [
            data.fields.ID || 0,
            data.fields.Description || '-',
            data.fields.DeductionType || '',
            data.fields.Displayin || '',
            deductionAmount,
            data.fields.Accountname || '',
            data.fields.Accountid || 0,
            data.fields.Taxexempt || false,
            data.fields.SuperInc || false,
            data.fields.WorkCoverExempt || false,
            data.fields.Active == true ? '' : 'In-Active',
        ];

        return dataList;
    }
    let headerStructure5  = [
        { index: 0, label: 'ID', class: 'colDeductionsID', active: false, display: true, width: "" },
        { index: 1, label: 'Deduction Name', class: 'colDeductionsNames', active: true, display: true, width: "200" },
        { index: 2, label: 'Deduction Type', class: 'colDeductionsType', active: true, display: true, width: "80" },
        { index: 3, label: 'Display Name', class: 'colDeductionsDisplayName', active: true, display: true, width: "200" },
        { index: 4, label: 'Amount', class: 'colDeductionsAmount', active: true, display: true, width: "100" },
        { index: 5, label: 'Account', class: 'colDeductionsAccounts', active: true, display: true, width: "100" },
        { index: 6, label: 'Account ID', class: 'colDeductionsAccountsID', active: false, display: true, width: ""  },
        { index: 7, label: 'Reduces PAYG Withholding', class: 'colDeductionsPAYG', active: false, display: true, width: ""  },
        { index: 8, label: 'Reduces Superannuation Guarantee Contribution', class: 'colDeductionsSuperannuation', active: false, display: true, width: ""  },
        { index: 9, label: 'Excluded from W1 on Activity Statement', class: 'colDeductionsReportableasW1', active: false, display: true, width: ""  },
        { index: 10, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
    ];
    templateObject.tableheaderrecords5.set(headerStructure5);

    templateObject.getDataTableList6 = function(data){
        let dataList = [
            data.fields.ID || '',
            data.fields.ReimbursementName || 0,
            data.fields.ReimbursementAccount || 0,
            data.fields.ReimbursementActive == true ? '' : 'In-Active',
        ];
        return dataList;
    }
    let headerStructure6  = [
        { index: 0, label: 'ID', class: 'colReimbursementID', active: false, display: true, width: "" },
        { index: 1, label: 'Reimbursement Name', class: 'colReimbursementName', active: true, display: true, width: "200" },
        { index: 2, label: 'Account', class: 'colReimbursementAccount', active: true, display: true, width: "100" },
        { index: 3, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
    ];
    templateObject.tableheaderrecords6.set(headerStructure6);

    templateObject.getDataTableList7 = function(data){
        let dataList = [
            data.fields.ID || '',
            data.fields.LeavePaidName || '',
            data.fields.LeavePaidUnits || '',
            data.fields.LeavePaidNormalEntitlement || '',
            data.fields.LeavePaidLeaveLoadingRate || '',
            'Paid Leave',
            data.fields.LeavePaidShowBalanceOnPayslip == true ? 'show': 'hide',
            data.fields.LeavePaidActive == true ? '' : 'In-Active',
        ];
        return dataList;
    }
    let headerStructure7  = [
        { index: 0, label: 'ID', class: 'colLeaveID', active: false, display: true, width: "" },
        { index: 1, label: 'Leave Name', class: 'colLeaveName', active: true, display: true, width: "200" },
        { index: 2, label: 'Units', class: 'colLeaveUnits', active: true, display: true, width: "80" },
        { index: 3, label: 'Normal Entitlement', class: 'colLeaveNormalEntitlement', active: true, display: true, width: "100" },
        { index: 4, label: 'Leave Loading Rate', class: 'colLeaveLeaveLoadingRate', active: true, display: true, width: "100" },
        { index: 5, label: 'Leave Type', class: 'colLeavePaidLeave', active: true, display: true, width: "100" },
        { index: 6, label: 'Shown On Payslip', class: 'colLeaveShownOnPayslip', active: true, display: true, width: "100" },
        { index: 7, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
    ];
    templateObject.tableheaderrecords7.set(headerStructure7);

    templateObject.getDataTableList8 = function(data){
        let dataList = [
            data.fields.ID || '',
            data.fields.Superfund || '',
            data.fields.Area || '',
            data.fields.Employeeid || '',
            data.fields.ABN || '',
            data.fields.ElectronicsServiceAddressAlias || '',
            data.fields.BSB || '',
            data.fields.Accountno || '',
            data.fields.AccountName || '',
            data.fields.Supertypeid || '',
            data.fields.Active == true ? '' : 'In-Active',
        ];
        return dataList;
    }
    let headerStructure8  = [
        { index: 0, label: 'ID', class: 'colSuperannuationID', active: false, display: true, width: "" },
        { index: 1, label: 'Name', class: 'colSuperannuationName', active: true, display: true, width: "150" },
        { index: 2, label: 'Type', class: 'colSuperannuationType', active: true, display: true, width: "130" },
        { index: 3, label: 'Employer Number', class: 'colEmployerNum', active: true, display: true, width: "100" },
        { index: 4, label: 'ABN', class: 'colabn', active: false, display: true, width: "" },
        { index: 5, label: 'Electronics Service Address Alias', class: 'colservicealias', active: false, display: true, width: "" },
        { index: 6, label: 'BSB', class: 'colbsb', active: true, display: true, width: "100" },
        { index: 7, label: 'Account Number', class: 'colaccountnumber', active: false, display: true, width: "" },
        { index: 8, label: 'Account Name', class: 'colaccountname', active: true, display: true, width: "100" },
        { index: 9, label: 'fundid', class: 'colSuperannuationTypeid', active: false, display: true, width: "" },
        { index: 10, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
    ];
    templateObject.tableheaderrecords8.set(headerStructure8);

    templateObject.getDataTableList9 = function (data) {
        let dataList = [
            data[i].id || "",
            data[i].rate || "",
            data[i].rule || "",
            data[i].hourlyMultiplier || "",
            data[i].active == true ? '' : 'In-Active',
        ]
        return dataList;
    }
    let headerStructure9 = [
        { index: 0, label: "#ID", class: "colOverTimeSheetID", active: false, display: true, width: "10" },
        { index: 1, label: "Rate", class: "colRate", active: true, display: true, width: "500" },
        { index: 2, label: "Rule", class: "colRateRule", active: true, display: true, width: "500" },
        { index: 3, label: "hourly Multiplier", class: "colHourlyAmount", active: true, display: true, width: "500" },
        { index: 4, label: "Status", class: "colStatus", active: true, display: true, width: "120" },
    ]
    templateObject.tableheaderrecords9.set(headerStructure9);

    templateObject.getCustomersList = function () {
        getVS1Data('TCustomerVS1').then(function (dataObject) {
            if (dataObject.length == 0) {
                contactService.getAllCustomerSideDataVS1().then(function (data) {
                    templateObject.setAllCustomerSideDataVS1(data);
                }).catch(function (err) {
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                templateObject.setAllCustomerSideDataVS1(data);
            }
        }).catch(function (err) {
            contactService.getAllCustomerSideDataVS1().then(function (data) {
                templateObject.setAllCustomerSideDataVS1(data);
            }).catch(function (err) {
            });
        });
    };

    templateObject.setAllCustomerSideDataVS1 = function (data) {
        const _lineItems = [];
        let currentId = FlowRouter.current().queryParams;
        for (let i = 0; i < data.tcustomervs1.length; i++) {
            let classname = '';
            if (!isNaN(currentId.id)) {
                if (data.tcustomervs1[i].fields.ID == parseInt(currentId.id)) {
                    classname = 'currentSelect';
                }
            }
            if (!isNaN(currentId.jobid)) {
                if (data.tcustomervs1[i].fields.ID == parseInt(currentId.jobid)) {
                    classname = 'currentSelect';
                }
            }
            const dataList = {
                id: data.tcustomervs1[i].fields.ID || '',
                company: data.tcustomervs1[i].fields.ClientName || '',
                isslectJob: data.tcustomervs1[i].fields.IsJob || false,
                classname: classname
            };
            _lineItems.push(dataList);
        }
        templateObject.customerrecords.set(_lineItems);
    }

    templateObject.getCustomersList();
});

Template.payrollrules.onRendered(function() {
    let templateObject = Template.instance();
    let taxRateService = new TaxRateService();
    let accountService = new AccountService();
    let organisationService = new OrganisationService();
    const dataTableList = [];
    const tableHeaderList = [];
    var splashArrayAllowanceList = new Array();
    var splashArrayDeductionList = new Array();
    var splashArrayLeaveList = new Array();
    var splashArrayUnLeaveList = new Array();
    var splashArrayCalenderList = new Array();
    var splashArrayReisument = new Array();
    var splashArraySuperannuationList = new Array();
    var splashArrayHolidayList = new Array();
    var splashArrayEarningList = new Array();
    var leavetypearraylist = [];
    var uleavetypearraylist = [];
    var countryService = new CountryService();
    let countries = [];
    let loggedEmpID = localStorage.getItem('mySessionEmployeeLoggedID');

    let tabid = FlowRouter.current().queryParams.active_key;

    setTimeout(() => {

        if(tabid == "calender")
        {
            document.getElementById("cal-tab").click();
        }
        else if(tabid == "super"){
            document.getElementById("sup-tab").click();
        }
        else if(tabid == "holiday"){
            document.getElementById("hol-tab").click();
        }
        else if(tabid == "payitem"){
            let itemtype = FlowRouter.current().queryParams.itemtype;
    
            document.getElementById("pay-tab").click();
    
            if(itemtype === 'deduction')
            {
                $('#deductions').css('display', 'block');
                $('#earnings').css('display', 'none');
                $('#allowances').css('display', 'none');
                $('#reimbursements').css('display', 'none');
                $('#leave').css('display', 'none');
    
            }
            else if(itemtype === 'resimu')
            {
                $('#deductions').css('display', 'none');
                $('#earnings').css('display', 'none');
                $('#allowances').css('display', 'none');
                $('#reimbursements').css('display', 'block');
                $('#leave').css('display', 'none');
    
            }
            else if(itemtype === 'earning')
            {
                $('#deductions').css('display', 'none');
                $('#earnings').css('display', 'block');
                $('#allowances').css('display', 'none');
                $('#reimbursements').css('display', 'none');
                $('#leave').css('display', 'none');
    
            }
            else if(itemtype === 'paidleave')
            {
                $('#deductions').css('display', 'none');
                $('#earnings').css('display', 'none');
                $('#allowances').css('display', 'none');
                $('#reimbursements').css('display', 'none');
                $('#leave').css('display', 'block');
    
            }
            else
            {
                $('#deductions').css('display', 'none');
                $('#earnings').css('display', 'none');
                $('#allowances').css('display', 'block');
                $('#reimbursements').css('display', 'none');
                $('#leave').css('display', 'none');
    
            }
        }
        else
        {
            document.getElementById("org-tab").click();
        }
    }, 1000);

    $("#date-input,#edtStartDate,#edtFirstPaymentDate,#edtHolidayDate").datepicker({
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

    function MakeNegative() {
        $('td').each(function() {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
    };

    templateObject.resetData = function (dataVal) {
        location.reload();
    }

    // This has been improved
    templateObject.getPayrollOrgainzations = async (refresh = false) => {
        let data = await CachedHttp.get(erpObject.TPayrollOrganization, async () => {
            return await sideBarService.getPayrollinformation(initialBaseDataLoad, 0);
        }, {
            useIndexDb: true,
            useLocalStorage: false,
            forceOverride: refresh,
            validate: (cachedResponse) => {
                return true;
            }
        });
        data = data.response;
        for (let i = 0; i < data.tpayrollorganization.length; i++) {
            // $('.fullScreenSpin').css('display', 'inline-block');
            $("#editbankaccount").val(data.tpayrollorganization[i].fields.bankaccount);
            $("#editpaygbankaccount").val(data.tpayrollorganization[i].fields.paygaacount);
            $("#editwagesexpbankaccount").val(data.tpayrollorganization[i].fields.Wagesexpenseaccount);
            $("#editwagespaybankaccount").val(data.tpayrollorganization[i].fields.wagespayablesaccount);
            $("#editsuperliabbankaccount").val(data.tpayrollorganization[i].fields.Superlibaccount);
            $("#editsuperexpbankaccount").val(data.tpayrollorganization[i].fields.Supperexpaccount);
            $("#employegroup").val(data.tpayrollorganization[i].fields.EmployeeGroup);
            $("#timesheetcat").val(data.tpayrollorganization[i].fields.TimeSheetCategory);
            $("#payorgnization_id").val(data.tpayrollorganization[i].fields.ID);

            if (data.tpayrollorganization[i].fields.showannualsalary == true) {
                $("#swtShowAnnualSalary").attr("checked", "checked");
            } else {
                $("#swtShowAnnualSalary").removeAttr("checked");
            }
            if (data.tpayrollorganization[i].fields.showemployeebases == true) {
                $("#swtShowEmploymentBasis").attr("checked", "checked");
            } else {
                $("#swtShowEmploymentBasis").removeAttr("checked");
            }

            let src = "data:image/jpeg;base64," + data.tpayrollorganization[i].fields.attachment;
            $("#uploadedImage").attr("src", src);
            $("#uploadedImage").attr("width", "100%");
            $("#uploadedImage").attr("height", "100%");
            $("#removeLogo").show();
            $("#changeLogo").show();
        }
    }

    templateObject.getAllAllowance = function() {
        getVS1Data('TAllowance').then(function(dataObject) {
            if (dataObject.length == 0) {
            sideBarService.getAllowance(initialBaseDataLoad, 0).then(function (data) {
                addVS1Data('TAllowance', JSON.stringify(data));
                let lineItems = [];
                let lineItemObj = {};
                for (let i = 0; i < data.tallowance.length; i++) {
                    let allowanceAmount = utilityService.modifynegativeCurrencyFormat(data.tallowance[i].fields.Amount) || 0.00;

                    var dataListAllowance = [
                        data.tallowance[i].fields.ID || 0,
                        data.tallowance[i].fields.Description || '-',
                        data.tallowance[i].fields.AllowanceType || '',
                        data.tallowance[i].fields.DisplayName || '',
                        allowanceAmount || 0.00,
                        data.tallowance[i].fields.Accountname || '',
                        data.tallowance[i].fields.Accountid || 0,
                        data.tallowance[i].fields.Payrolltaxexempt || false,
                        data.tallowance[i].fields.Superinc || false,
                        data.tallowance[i].fields.Workcoverexempt || false,
                        data.tallowance[i].fields.active == true ? '' : 'In-Active',
                        // '<td contenteditable="false" class="colDeleteAllowances"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                    ];

                    splashArrayAllowanceList.push(dataListAllowance);
                }

                function MakeNegative() {
                    $('td').each(function () {
                        if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
                    });
                };


                setTimeout(function () {
                    MakeNegative();
                }, 100);
                setTimeout(function () {
                    $('#tblAlowances').DataTable({

                        data: splashArrayAllowanceList,
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        columnDefs: [
                            {
                                className: "colAlowancesID hiddenColumn",
                                "targets": [0]
                            },
                            {
                                className: "colAllowancesNames",
                                "targets": [1]
                            },  {
                                className: "colAllowancesType",
                                "targets": [2]
                            }, {
                                className: "colAllowancesDisplayName",
                                "targets": [3]
                            }, {
                                className: "colAllowancesAmount  text-right",
                                "targets": [4]
                            }, {
                                className: "colAllowancesAccounts",
                                "targets": [5]
                            }, {
                                className: "colAllowancesAccountsID hiddenColumn",
                                "targets": [6]
                            }, {
                                className: "colAllowancesPAYG hiddenColumn",
                                "targets": [7]
                            }, {
                                className: "colAllowancesSuperannuation hiddenColumn",
                                "targets": [8]
                            }, {
                                className: "colAllowancesReportableasW1 hiddenColumn",
                                "targets": [9]
                            }, {
                                className: "colState",
                                "targets": [10]
                            }, {
                                className: "colDeleteAllowances",
                                "orderable": false,
                                "targets": -1
                            }
                        ],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        pageLength: initialDatatableLoad,
                        lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[0, "asc"]],
                        action: function () {
                            $('#tblAlowances').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                            $('.paginate_button.page-item').removeClass('disabled');
                            $('#tblAlowances_ellipsis').addClass('disabled');
                            if (oSettings._iDisplayLength == -1) {
                                if (oSettings.fnRecordsDisplay() > 150) {

                                }
                            } else {

                            }
                            if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                $('.paginate_button.page-item.next').addClass('disabled');
                            }

                            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                                .on('click', function () {
                                    var splashArrayAllowanceListDupp = new Array();
                                    let dataLenght = oSettings._iDisplayLength;
                                    let customerSearch = $('#tblAlowances_filter input').val();

                                    sideBarService.getAllowance(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {

                                                for (let j = 0; j < dataObjectnew.tallowance.length; j++) {

                                                    let allowanceAmount = utilityService.modifynegativeCurrencyFormat(dataObjectnew.tallowance[j].fields.Amount) || 0.00;

                                                    var dataListCustomerDupp = [
                                                        dataObjectnewdataObjectnew.tallowance[i].fields.ID || 0,
                                                        dataObjectnew.tallowance[i].fields.Description || '-',
                                                        dataObjectnew.tallowance[i].fields.AllowanceType || '',
                                                        dataObjectnew.tallowance[i].fields.DisplayName || '',
                                                        allowanceAmount || 0.00,
                                                        dataObjectnew.tallowance[i].fields.Accountname || '',
                                                        dataObjectnew.tallowance[i].fields.Accountid || 0,
                                                        dataObjectnew.tallowance[i].fields.Payrolltaxexempt || false,
                                                        dataObjectnewdataObjectnew.tallowance[i].fields.Superinc || false,
                                                        dataObjectnew.tallowance[i].fields.Workcoverexempt || false,
                                                        dataObjectnew.tallowance[i].fields.active == true ? '' : 'In-Active',
                                                        // '<td contenteditable="false" class="colDeleteAllowances"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                                                    ];
                                                    splashArrayAllowanceList.push(dataListCustomerDupp);
                                                }

                                                let uniqueChars = [...new Set(splashArrayAllowanceList)];
                                                var datatable = $('#tblAlowances').DataTable();
                                                datatable.clear();
                                                datatable.rows.add(uniqueChars);
                                                datatable.draw(false);

                                                setTimeout(function () {
                                                    $("#tblAlowances").dataTable().fnPageChange('last');
                                                }, 400);

                                                LoadingOverlay.hide();
                                    }).catch(function (err) {
                                        LoadingOverlay.hide();
                                    });
                                });
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },
                        "fnInitComplete": function () {
                            $("<button class='btn btn-primary btnAddNewAllowance' data-dismiss='modal' data-toggle='modal' data-target='#allowanceModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblAlowances_filter");
                            $("<button class='btn btn-primary btnRefreshAllowance' type='button' id='btnRefreshAllowance' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblAlowances_filter");
                        }
                    }).on('page', function () {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    }).on('column-reorder', function () {
                    }).on('length.dt', function (e, settings, len) {
                        let dataLenght = settings._iDisplayLength;
                        splashArrayAllowanceList = [];
                        if (dataLenght == -1) {
                            LoadingOverlay.hide();
                        } else {
                            if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                                LoadingOverlay.hide();
                            } else {
                                sideBarService.getAllowance(dataLenght, 0).then(function (dataNonBo) {
                                    addVS1Data('TAllowance', JSON.stringify(dataNonBo)).then(function (datareturn) {
                                        templateObject.resetData(dataNonBo);
                                        LoadingOverlay.hide();
                                    }).catch(function (err) {
                                        LoadingOverlay.hide();
                                    });
                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });
                            }
                        }
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    });
                }, 0);
                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                LoadingOverlay.hide();
            }).catch(function (err) {
                LoadingOverlay.hide();
            });
            }else{

            let data = JSON.parse(dataObject[0].data);
            let useData = data;
            let lineItems = [];
            let lineItemObj = {};

            for (let i = 0; i < data.tallowance.length; i++) {
                let allowanceAmount = utilityService.modifynegativeCurrencyFormat(data.tallowance[i].fields.Amount) || 0.00;
                var dataListAllowance = [
                    data.tallowance[i].fields.ID || 0,
                    data.tallowance[i].fields.Description || '-',
                    data.tallowance[i].fields.AllowanceType || '',
                    data.tallowance[i].fields.DisplayName || '',
                    allowanceAmount || 0.00,
                    data.tallowance[i].fields.Accountname || '',
                    data.tallowance[i].fields.Accountid || 0,
                    data.tallowance[i].fields.Payrolltaxexempt || false,
                    data.tallowance[i].fields.Superinc || false,
                    data.tallowance[i].fields.Workcoverexempt || false,
                    // '<td contenteditable="false" class="colDeleteAllowances"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                ];
                splashArrayAllowanceList.push(dataListAllowance);
            }

            function MakeNegative() {
                $('td').each(function () {
                    if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
                });
            };

            setTimeout(function () {
                MakeNegative();
            }, 100);
            setTimeout(function () {
                $('#tblAlowances').DataTable({
                    data: splashArrayAllowanceList,
                    "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                    columnDefs: [
                        {
                            className: "colAlowancesID hiddenColumn",
                            "targets": [0]
                        },
                        {
                            className: "colAllowancesNames",
                            "targets": [1]
                        },  {
                            className: "colAllowancesType",
                            "targets": [2]
                        }, {
                            className: "colAllowancesDisplayName",
                            "targets": [3]
                        }, {
                            className: "colAllowancesAmount  text-right",
                            "targets": [4]
                        }, {
                            className: "colAllowancesAccounts",
                            "targets": [5]
                        }, {
                            className: "colAllowancesAccountsID hiddenColumn",
                            "targets": [6]
                        }, {
                            className: "colAllowancesPAYG hiddenColumn",
                            "targets": [7]
                        }, {
                            className: "colAllowancesSuperannuation hiddenColumn",
                            "targets": [8]
                        }, {
                            className: "colAllowancesReportableasW1 hiddenColumn",
                            "targets": [9]
                        }, {
                            className: "colState",
                            "targets": [10]
                        }, {
                            className: "colDeleteAllowances",
                            "orderable": false,
                            "targets": -1
                        }
                    ],
                    select: true,
                    destroy: true,
                    colReorder: true,
                    pageLength: initialDatatableLoad,
                    lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                    info: true,
                    responsive: true,
                    "order": [[0, "asc"]],
                    action: function () {
                        $('#tblAlowances').DataTable().ajax.reload();
                    },
                    "fnDrawCallback": function (oSettings) {
                        $('.paginate_button.page-item').removeClass('disabled');
                        $('#tblAlowances_ellipsis').addClass('disabled');
                        if (oSettings._iDisplayLength == -1) {
                            if (oSettings.fnRecordsDisplay() > 150) {

                            }
                        } else {

                        }
                        if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                            $('.paginate_button.page-item.next').addClass('disabled');
                        }

                        $('.paginate_button.next:not(.disabled)', this.api().table().container())
                            .on('click', function () {
                                // $('.fullScreenSpin').css('display', 'inline-block');
                                var splashArrayAllowanceListDupp = new Array();
                                let dataLenght = oSettings._iDisplayLength;
                                let customerSearch = $('#tblAlowances_filter input').val();

                                sideBarService.getAllowance(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {

                                            for (let j = 0; j < dataObjectnew.tallowance.length; j++) {

                                                let allowanceAmount = utilityService.modifynegativeCurrencyFormat(dataObjectnew.tallowance[j].fields.Amount) || 0.00;

                                                var dataListCustomerDupp = [
                                                    dataObjectnewdataObjectnew.tallowance[i].fields.ID || 0,
                                                    dataObjectnew.tallowance[i].fields.Description || '-',
                                                    dataObjectnew.tallowance[i].fields.AllowanceType || '',
                                                    dataObjectnew.tallowance[i].fields.DisplayName || '',
                                                    allowanceAmount || 0.00,
                                                    dataObjectnew.tallowance[i].fields.Accountname || '',
                                                    dataObjectnew.tallowance[i].fields.Accountid || 0,
                                                    dataObjectnew.tallowance[i].fields.Payrolltaxexempt || false,
                                                    dataObjectnewdataObjectnew.tallowance[i].fields.Superinc || false,
                                                    dataObjectnew.tallowance[i].fields.Workcoverexempt || false,
                                                    dataObjectnew.tallowance[i].fields.active == true ? '' : 'In-Active',
                                                    // '<td contenteditable="false" class="colDeleteAllowances"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                                                    ''
                                                ];

                                                splashArrayAllowanceList.push(dataListCustomerDupp);
                                                //}
                                            }

                                            let uniqueChars = [...new Set(splashArrayAllowanceList)];
                                            var datatable = $('#tblAlowances').DataTable();
                                            datatable.clear();
                                            datatable.rows.add(uniqueChars);
                                            datatable.draw(false);
                                            setTimeout(function () {
                                                $("#tblAlowances").dataTable().fnPageChange('last');
                                            }, 400);

                                            LoadingOverlay.hide();


                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });

                            });
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    },
                    "fnInitComplete": function () {
                        $("<button class='btn btn-primary btnAddNewAllowance' data-dismiss='modal' data-toggle='modal' data-target='#allowanceModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblAlowances_filter");
                        $("<button class='btn btn-primary btnRefreshAllowance' type='button' id='btnRefreshAllowance' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblAlowances_filter");

                    }

                }).on('page', function () {
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);

                }).on('column-reorder', function () {

                }).on('length.dt', function (e, settings, len) {
                    //// $('.fullScreenSpin').css('display', 'inline-block');
                    let dataLenght = settings._iDisplayLength;
                    splashArrayAllowanceList = [];
                    if (dataLenght == -1) {
                    LoadingOverlay.hide();

                    } else {
                        if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                            LoadingOverlay.hide();
                        } else {
                            sideBarService.getAllowance(dataLenght, 0).then(function (dataNonBo) {

                                addVS1Data('TAllowance', JSON.stringify(dataNonBo)).then(function (datareturn) {
                                    templateObject.resetData(dataNonBo);
                                    LoadingOverlay.hide();
                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });
                            }).catch(function (err) {
                                LoadingOverlay.hide();
                            });
                        }
                    }
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                });


            }, 0);

            $('div.dataTables_filter input').addClass('form-control form-control-sm');
            LoadingOverlay.hide();

            }
        }).catch(function(err) {
        sideBarService.getAllowance(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TAllowance', JSON.stringify(data));
            let lineItems = [];
            let lineItemObj = {};
            for (let i = 0; i < data.tallowance.length; i++) {
                let allowanceAmount = utilityService.modifynegativeCurrencyFormat(data.tallowance[i].fields.Amount) || 0.00;

                var dataListAllowance = [
                    data.tallowance[i].fields.ID || 0,
                    data.tallowance[i].fields.Description || '-',
                    data.tallowance[i].fields.AllowanceType || '',
                    data.tallowance[i].fields.DisplayName || '',
                    allowanceAmount || 0.00,
                    data.tallowance[i].fields.Accountname || '',
                    data.tallowance[i].fields.Accountid || 0,
                    data.tallowance[i].fields.Payrolltaxexempt || false,
                    data.tallowance[i].fields.Superinc || false,
                    data.tallowance[i].fields.Workcoverexempt || false,
                    data.tallowance[i].fields.active == true ? '' : 'In-Active',
                    // '<td contenteditable="false" class="colDeleteAllowances"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                    ''
                ];

                splashArrayAllowanceList.push(dataListAllowance);
            }

            function MakeNegative() {
                $('td').each(function () {
                    if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
                });
            };


            setTimeout(function () {
                MakeNegative();
            }, 100);
            setTimeout(function () {
                $('#tblAlowances').DataTable({

                    data: splashArrayAllowanceList,
                    "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                    columnDefs: [
                        {
                            className: "colAlowancesID hiddenColumn",
                            "targets": [0]
                        },
                        {
                            className: "colAllowancesNames",
                            "targets": [1]
                        },  {
                            className: "colAllowancesType",
                            "targets": [2]
                        }, {
                            className: "colAllowancesDisplayName",
                            "targets": [3]
                        }, {
                            className: "colAllowancesAmount  text-right",
                            "targets": [4]
                        }, {
                            className: "colAllowancesAccounts",
                            "targets": [5]
                        }, {
                            className: "colAllowancesAccountsID hiddenColumn",
                            "targets": [6]
                        }, {
                            className: "colAllowancesPAYG hiddenColumn",
                            "targets": [7]
                        }, {
                            className: "colAllowancesSuperannuation hiddenColumn",
                            "targets": [8]
                        }, {
                            className: "colAllowancesReportableasW1 hiddenColumn",
                            "targets": [9]
                        }, {
                            className: "colState",
                            "targets": [10]
                        }, {
                            className: "colDeleteAllowances",
                            "orderable": false,
                            "targets": -1
                        }
                    ],
                    select: true,
                    destroy: true,
                    colReorder: true,
                    pageLength: initialDatatableLoad,
                    lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                    info: true,
                    responsive: true,
                    "order": [[0, "asc"]],
                    action: function () {
                        $('#tblAlowances').DataTable().ajax.reload();
                    },
                    "fnDrawCallback": function (oSettings) {
                        $('.paginate_button.page-item').removeClass('disabled');
                        $('#tblAlowances_ellipsis').addClass('disabled');
                        if (oSettings._iDisplayLength == -1) {
                            if (oSettings.fnRecordsDisplay() > 150) {

                            }
                        } else {

                        }
                        if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                            $('.paginate_button.page-item.next').addClass('disabled');
                        }

                        $('.paginate_button.next:not(.disabled)', this.api().table().container())
                            .on('click', function () {
                                // $('.fullScreenSpin').css('display', 'inline-block');
                                var splashArrayAllowanceListDupp = new Array();
                                let dataLenght = oSettings._iDisplayLength;
                                let customerSearch = $('#tblAlowances_filter input').val();

                                sideBarService.getAllowance(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {

                                            for (let j = 0; j < dataObjectnew.tallowance.length; j++) {

                                                let allowanceAmount = utilityService.modifynegativeCurrencyFormat(dataObjectnew.tallowance[j].fields.Amount) || 0.00;

                                                var dataListCustomerDupp = [
                                                    dataObjectnewdataObjectnew.tallowance[i].fields.ID || 0,
                                                    dataObjectnew.tallowance[i].fields.Description || '-',
                                                    dataObjectnew.tallowance[i].fields.AllowanceType || '',
                                                    dataObjectnew.tallowance[i].fields.DisplayName || '',
                                                    allowanceAmount || 0.00,
                                                    dataObjectnew.tallowance[i].fields.Accountname || '',
                                                    dataObjectnew.tallowance[i].fields.Accountid || 0,
                                                    dataObjectnew.tallowance[i].fields.Payrolltaxexempt || false,
                                                    dataObjectnewdataObjectnew.tallowance[i].fields.Superinc || false,
                                                    dataObjectnew.tallowance[i].fields.Workcoverexempt || false,
                                                    dataObjectnew.tallowance[i].fields.active == true ? '' : 'In-Active',
                                                    // '<td contenteditable="false" class="colDeleteAllowances"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                                                    ''
                                                ];

                                                splashArrayAllowanceList.push(dataListCustomerDupp);
                                                //}
                                            }

                                            let uniqueChars = [...new Set(splashArrayAllowanceList)];
                                            var datatable = $('#tblAlowances').DataTable();
                                            datatable.clear();
                                            datatable.rows.add(uniqueChars);
                                            datatable.draw(false);
                                            setTimeout(function () {
                                                $("#tblAlowances").dataTable().fnPageChange('last');
                                            }, 400);

                                            LoadingOverlay.hide();


                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });

                            });
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    },
                    "fnInitComplete": function () {
                        $("<button class='btn btn-primary btnAddNewAllowance' data-dismiss='modal' data-toggle='modal' data-target='#allowanceModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblAlowances_filter");
                        $("<button class='btn btn-primary btnRefreshAllowance' type='button' id='btnRefreshAllowance' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblAlowances_filter");

                    }

                }).on('page', function () {
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);

                }).on('column-reorder', function () {

                }).on('length.dt', function (e, settings, len) {
                    //// $('.fullScreenSpin').css('display', 'inline-block');
                    let dataLenght = settings._iDisplayLength;
                    splashArrayAllowanceList = [];
                    if (dataLenght == -1) {
                    LoadingOverlay.hide();

                    } else {
                        if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                            LoadingOverlay.hide();
                        } else {
                            sideBarService.getAllowance(dataLenght, 0).then(function (dataNonBo) {

                                addVS1Data('TAllowance', JSON.stringify(dataNonBo)).then(function (datareturn) {
                                    templateObject.resetData(dataNonBo);
                                    LoadingOverlay.hide();
                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });
                            }).catch(function (err) {
                                LoadingOverlay.hide();
                            });
                        }
                    }
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                });


            }, 0);

            $('div.dataTables_filter input').addClass('form-control form-control-sm');

            LoadingOverlay.hide();
        }).catch(function (err) {
            LoadingOverlay.hide();
        });
        });
    };

    templateObject.getAllDeductions = function() {
        getVS1Data('TDeduction').then(function(dataObject) {
            if (dataObject.length == 0) {
            sideBarService.getDeduction(initialBaseDataLoad, 0).then(function (data) {
                addVS1Data('TDeduction', JSON.stringify(data));
                let lineItems = [];
                let lineItemObj = {};
                let deductionTypeVal = 'None';
                for (let i = 0; i < data.tdeduction.length; i++) {
                    let deductionAmount = utilityService.modifynegativeCurrencyFormat(data.tdeduction[i].fields.Amount) || 0.00;
                    if(data.tdeduction[i].fields.Taxexempt == true){
                        deductionTypeVal = 'None';
                    }else{
                        if(data.tdeduction[i].fields.IsWorkPlacegiving == true){
                        deductionTypeVal = 'Workplace Giving';
                        }

                        if(data.tdeduction[i].fields.Unionfees == true){
                        deductionTypeVal = 'Union / Association Fees';
                        }
                    }
                    var dataListDeduction = [
                        data.tdeduction[i].fields.ID || 0,
                        data.tdeduction[i].fields.Description || '-',
                        data.tdeduction[i].fields.DeductionType,
                        data.tdeduction[i].fields.Displayin || '',
                        deductionAmount || 0.00,
                        data.tdeduction[i].fields.Accountname || '',
                        data.tdeduction[i].fields.Accountid || 0,
                        data.tdeduction[i].fields.Taxexempt || false,
                        data.tdeduction[i].fields.SuperInc || false,
                        data.tdeduction[i].fields.WorkCoverExempt || false,
                        data.tdeduction[i].fields.Active == true ? '' : 'In-Active',
                    ];

                    splashArrayDeductionList.push(dataListDeduction);
                }

                function MakeNegative() {
                    $('td').each(function () {
                        if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
                    });
                };


                setTimeout(function () {
                    MakeNegative();
                }, 100);
                setTimeout(function () {
                    $('#tblDeductions').DataTable({

                        data: splashArrayDeductionList,
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        columnDefs: [
                            {
                                className: "colDeductionsID hiddenColumn",
                                "targets": [0]
                            },
                            {
                                className: "colDeductionsNames",
                                "targets": [1]
                            },  {
                                className: "colDeductionsType",
                                "targets": [2]
                            }, {
                                className: "colDeductionsDisplayName",
                                "targets": [3]
                            }, {
                                className: "colDeductionsAmount  text-right",
                                "targets": [4]
                            }, {
                                className: "colDeductionsAccounts",
                                "targets": [5]
                            }, {
                                className: "colDeductionsAccountsID hiddenColumn",
                                "targets": [6]
                            }, {
                                className: "colDeductionsPAYG hiddenColumn",
                                "targets": [7]
                            }, {
                                className: "colDeductionsSuperannuation hiddenColumn",
                                "targets": [8]
                            }, {
                                className: "colDeductionsReportableasW1 hiddenColumn",
                                "targets": [9]
                            }, {
                                className: "colStatus",
                                "targets": [10]
                            }
                        ],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        pageLength: initialDatatableLoad,
                        lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[0, "asc"]],
                        action: function () {
                            $('#tblDeductions').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                            $('.paginate_button.page-item').removeClass('disabled');
                            $('#tblDeductions_ellipsis').addClass('disabled');
                            if (oSettings._iDisplayLength == -1) {
                                if (oSettings.fnRecordsDisplay() > 150) {

                                }
                            } else {

                            }
                            if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                $('.paginate_button.page-item.next').addClass('disabled');
                            }

                            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                                .on('click', function () {
                                    // $('.fullScreenSpin').css('display', 'inline-block');
                                    var splashArrayDeductionListDupp = new Array();
                                    let dataLenght = oSettings._iDisplayLength;
                                    let customerSearch = $('#tblDeductions_filter input').val();

                                    sideBarService.getDeduction(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {

                                                for (let j = 0; j < dataObjectnew.tdeduction.length; j++) {

                                                    let deductionAmount = utilityService.modifynegativeCurrencyFormat(dataObjectnew.tdeduction[j].fields.Amount) || 0.00;

                                                    var dataListDeduction = [
                                                        data.tdeduction[i].fields.ID || 0,
                                                        data.tdeduction[i].fields.Description || '-',
                                                        data.tdeduction[i].fields.DeductionType,
                                                        data.tdeduction[i].fields.Displayin || '',
                                                        deductionAmount || 0.00,
                                                        data.tdeduction[i].fields.Accountname || '',
                                                        data.tdeduction[i].fields.Accountid || 0,
                                                        data.tdeduction[i].fields.Taxexempt || false,
                                                        data.tdeduction[i].fields.SuperInc || false,
                                                        data.tdeduction[i].fields.WorkCoverExempt || false,
                                                        data.tdeduction[i].fields.Active == true ? '' : 'In-Active',
                                                    ];

                                                    splashArrayDeductionList.push(dataListCustomerDupp);
                                                    //}
                                                }

                                                let uniqueChars = [...new Set(splashArrayDeductionList)];
                                                var datatable = $('#tblDeductions').DataTable();
                                                datatable.clear();
                                                datatable.rows.add(uniqueChars);
                                                datatable.draw(false);
                                                setTimeout(function () {
                                                    $("#tblDeductions").dataTable().fnPageChange('last');
                                                }, 400);

                                                LoadingOverlay.hide();


                                    }).catch(function (err) {
                                        LoadingOverlay.hide();
                                    });

                                });
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },
                        "fnInitComplete": function () {
                            $("<button class='btn btn-primary btnAddNewDeduction' data-dismiss='modal' data-toggle='modal'  type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblDeductions_filter");
                            $("<button class='btn btn-primary btnRefreshDeduction' type='button' id='btnRefreshDeduction' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblDeductions_filter");

                        }

                    }).on('page', function () {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);

                    }).on('column-reorder', function () {

                    }).on('length.dt', function (e, settings, len) {
                        //// $('.fullScreenSpin').css('display', 'inline-block');
                        let dataLenght = settings._iDisplayLength;
                        splashArrayDeductionList = [];
                        if (dataLenght == -1) {
                        LoadingOverlay.hide();

                        } else {
                            if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                                LoadingOverlay.hide();
                            } else {
                                sideBarService.getDeduction(dataLenght, 0).then(function (dataNonBo) {

                                    addVS1Data('TDeduction', JSON.stringify(dataNonBo)).then(function (datareturn) {
                                        templateObject.resetData(dataNonBo);
                                        LoadingOverlay.hide();
                                    }).catch(function (err) {
                                        LoadingOverlay.hide();
                                    });
                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });
                            }
                        }
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    });


                }, 0);

                $('div.dataTables_filter input').addClass('form-control form-control-sm');

                LoadingOverlay.hide();
            }).catch(function (err) {
                LoadingOverlay.hide();
            });
            }else{

            let data = JSON.parse(dataObject[0].data);

            let useData = data;
            let lineItems = [];
            let lineItemObj = {};
            let deductionTypeVal = 'None';
            for (let i = 0; i < data.tdeduction.length; i++) {
                let deductionAmount = utilityService.modifynegativeCurrencyFormat(data.tdeduction[i].fields.Amount) || 0.00;
                if(data.tdeduction[i].fields.Taxexempt == true){
                    deductionTypeVal = 'None';
                }else{
                    if(data.tdeduction[i].fields.IsWorkPlacegiving == true){
                    deductionTypeVal = 'Workplace Giving';
                    }

                    if(data.tdeduction[i].fields.Unionfees == true){
                    deductionTypeVal = 'Union / Association Fees';
                    }
                }
                var dataListDeduction = [
                    data.tdeduction[i].fields.ID || 0,
                    data.tdeduction[i].fields.Description || '-',
                    data.tdeduction[i].fields.DeductionType,
                    data.tdeduction[i].fields.Displayin || '',
                    deductionAmount || 0.00,
                    data.tdeduction[i].fields.Accountname || '',
                    data.tdeduction[i].fields.Accountid || 0,
                    data.tdeduction[i].fields.Taxexempt || false,
                    data.tdeduction[i].fields.SuperInc || false,
                    data.tdeduction[i].fields.WorkCoverExempt || false,
                    data.tdeduction[i].fields.Active == true ? '' : 'In-Active',
                ];

                splashArrayDeductionList.push(dataListDeduction);
            }

            function MakeNegative() {
                $('td').each(function () {
                    if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
                });
            };


            setTimeout(function () {
                MakeNegative();
            }, 100);
            setTimeout(function () {
                $('#tblDeductions').DataTable({

                    data: splashArrayDeductionList,
                    "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                    columnDefs: [
                        {
                            className: "colDeductionsID hiddenColumn",
                            "targets": [0]
                        },
                        {
                            className: "colDeductionsNames",
                            "targets": [1]
                        },  {
                            className: "colDeductionsType",
                            "targets": [2]
                        }, {
                            className: "colDeductionsDisplayName",
                            "targets": [3]
                        }, {
                            className: "colDeductionsAmount  text-right",
                            "targets": [4]
                        }, {
                            className: "colDeductionsAccounts",
                            "targets": [5]
                        }, {
                            className: "colDeductionsAccountsID hiddenColumn",
                            "targets": [6]
                        }, {
                            className: "colDeductionsPAYG hiddenColumn",
                            "targets": [7]
                        }, {
                            className: "colDeductionsSuperannuation hiddenColumn",
                            "targets": [8]
                        }, {
                            className: "colDeductionsReportableasW1 hiddenColumn",
                            "targets": [9]
                        }, {
                            className: "colStatus",
                            "targets": [10]
                        }
                    ],
                    select: true,
                    destroy: true,
                    colReorder: true,
                    pageLength: initialDatatableLoad,
                    lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                    info: true,
                    responsive: true,
                    "order": [[0, "asc"]],
                    action: function () {
                        $('#tblDeductions').DataTable().ajax.reload();
                    },
                    "fnDrawCallback": function (oSettings) {
                        $('.paginate_button.page-item').removeClass('disabled');
                        $('#tblDeductions_ellipsis').addClass('disabled');
                        if (oSettings._iDisplayLength == -1) {
                            if (oSettings.fnRecordsDisplay() > 150) {

                            }
                        } else {

                        }
                        if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                            $('.paginate_button.page-item.next').addClass('disabled');
                        }

                        $('.paginate_button.next:not(.disabled)', this.api().table().container())
                            .on('click', function () {
                                // $('.fullScreenSpin').css('display', 'inline-block');
                                var splashArrayDeductionListDupp = new Array();
                                let dataLenght = oSettings._iDisplayLength;
                                let customerSearch = $('#tblDeductions_filter input').val();

                                sideBarService.getDeduction(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {

                                            for (let j = 0; j < dataObjectnew.tdeduction.length; j++) {

                                                let deductionAmount = utilityService.modifynegativeCurrencyFormat(dataObjectnew.tdeduction[j].fields.Amount) || 0.00;

                                                var dataListDeduction = [
                                                    data.tdeduction[i].fields.ID || 0,
                                                    data.tdeduction[i].fields.Description || '-',
                                                    data.tdeduction[i].fields.DeductionType,
                                                    data.tdeduction[i].fields.Displayin || '',
                                                    deductionAmount || 0.00,
                                                    data.tdeduction[i].fields.Accountname || '',
                                                    data.tdeduction[i].fields.Accountid || 0,
                                                    data.tdeduction[i].fields.Taxexempt || false,
                                                    data.tdeduction[i].fields.SuperInc || false,
                                                    data.tdeduction[i].fields.WorkCoverExempt || false,
                                                    data.tdeduction[i].fields.Active == true ? '' : 'In-Active',
                                                ];
                                                splashArrayDeductionList.push(dataListCustomerDupp);
                                            }

                                            let uniqueChars = [...new Set(splashArrayDeductionList)];
                                            var datatable = $('#tblDeductions').DataTable();
                                            datatable.clear();
                                            datatable.rows.add(uniqueChars);
                                            datatable.draw(false);
                                            setTimeout(function () {
                                                $("#tblDeductions").dataTable().fnPageChange('last');
                                            }, 400);

                                            LoadingOverlay.hide();


                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });

                            });
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    },
                    "fnInitComplete": function () {
                        $("<button class='btn btn-primary btnAddNewDeduction' data-dismiss='modal' data-toggle='modal'  type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblDeductions_filter");
                        $("<button class='btn btn-primary btnRefreshDeduction' type='button' id='btnRefreshDeduction' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblDeductions_filter");

                    }

                }).on('page', function () {
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);

                }).on('column-reorder', function () {

                }).on('length.dt', function (e, settings, len) {
                    //// $('.fullScreenSpin').css('display', 'inline-block');
                    let dataLenght = settings._iDisplayLength;
                    splashArrayDeductionList = [];
                    if (dataLenght == -1) {
                    LoadingOverlay.hide();

                    } else {
                        if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                            LoadingOverlay.hide();
                        } else {
                            sideBarService.getDeduction(dataLenght, 0).then(function (dataNonBo) {

                                addVS1Data('TDeduction', JSON.stringify(dataNonBo)).then(function (datareturn) {
                                    templateObject.resetData(dataNonBo);
                                    LoadingOverlay.hide();
                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });
                            }).catch(function (err) {
                                LoadingOverlay.hide();
                            });
                        }
                    }
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                });


            }, 0);
            $('div.dataTables_filter input').addClass('form-control form-control-sm');
            LoadingOverlay.hide();

            }
        }).catch(function(err) {
        sideBarService.getDeduction(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TDeduction', JSON.stringify(data));
            let lineItems = [];
            let lineItemObj = {};
            let deductionTypeVal = 'None';
            for (let i = 0; i < data.tdeduction.length; i++) {
                let deductionAmount = utilityService.modifynegativeCurrencyFormat(data.tdeduction[i].fields.Amount) || 0.00;
                if(data.tdeduction[i].fields.Taxexempt == true){
                    deductionTypeVal = 'None';
                }else{
                    if(data.tdeduction[i].fields.IsWorkPlacegiving == true){
                    deductionTypeVal = 'Workplace Giving';
                    }

                    if(data.tdeduction[i].fields.Unionfees == true){
                    deductionTypeVal = 'Union / Association Fees';
                    }
                }
                var dataListDeduction = [
                    data.tdeduction[i].fields.ID || 0,
                    data.tdeduction[i].fields.Description || '-',
                    data.tdeduction[i].fields.DeductionType,
                    data.tdeduction[i].fields.Displayin || '',
                    deductionAmount || 0.00,
                    data.tdeduction[i].fields.Accountname || '',
                    data.tdeduction[i].fields.Accountid || 0,
                    data.tdeduction[i].fields.Taxexempt || false,
                    data.tdeduction[i].fields.SuperInc || false,
                    data.tdeduction[i].fields.WorkCoverExempt || false,
                    data.tdeduction[i].fields.Active == true ? '' : 'In-Active',
                ];

                splashArrayDeductionList.push(dataListDeduction);
            }

            function MakeNegative() {
                $('td').each(function () {
                    if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
                });
            };


            setTimeout(function () {
                MakeNegative();
            }, 100);





            setTimeout(function () {
                $('#tblDeductions').DataTable({

                    data: splashArrayDeductionList,
                    "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                    columnDefs: [
                        {
                            className: "colDeductionsID hiddenColumn",
                            "targets": [0]
                        },
                        {
                            className: "colDeductionsNames",
                            "targets": [1]
                        },  {
                            className: "colDeductionsType",
                            "targets": [2]
                        }, {
                            className: "colDeductionsDisplayName",
                            "targets": [3]
                        }, {
                            className: "colDeductionsAmount  text-right",
                            "targets": [4]
                        }, {
                            className: "colDeductionsAccounts",
                            "targets": [5]
                        }, {
                            className: "colDeductionsAccountsID hiddenColumn",
                            "targets": [6]
                        }, {
                            className: "colDeductionsPAYG hiddenColumn",
                            "targets": [7]
                        }, {
                            className: "colDeductionsSuperannuation hiddenColumn",
                            "targets": [8]
                        }, {
                            className: "colDeductionsReportableasW1 hiddenColumn",
                            "targets": [9]
                        }, {
                            className: "colStatus",
                            "targets": [10]
                        }
                    ],
                    select: true,
                    destroy: true,
                    colReorder: true,
                    pageLength: initialDatatableLoad,
                    lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                    info: true,
                    responsive: true,
                    "order": [[0, "asc"]],
                    action: function () {
                        $('#tblDeductions').DataTable().ajax.reload();
                    },
                    "fnDrawCallback": function (oSettings) {
                        $('.paginate_button.page-item').removeClass('disabled');
                        $('#tblDeductions_ellipsis').addClass('disabled');
                        if (oSettings._iDisplayLength == -1) {
                            if (oSettings.fnRecordsDisplay() > 150) {

                            }
                        } else {

                        }
                        if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                            $('.paginate_button.page-item.next').addClass('disabled');
                        }

                        $('.paginate_button.next:not(.disabled)', this.api().table().container())
                            .on('click', function () {
                                // $('.fullScreenSpin').css('display', 'inline-block');
                                var splashArrayDeductionListDupp = new Array();
                                let dataLenght = oSettings._iDisplayLength;
                                let customerSearch = $('#tblDeductions_filter input').val();

                                sideBarService.getDeduction(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {

                                            for (let j = 0; j < dataObjectnew.tdeduction.length; j++) {

                                                let allowanceAmount = utilityService.modifynegativeCurrencyFormat(dataObjectnew.tdeduction[j].fields.Amount) || 0.00;

                                                var dataListCustomerDupp = [
                                                    dataObjectnewdataObjectnew.tdeduction[i].fields.ID || 0,
                                                    dataObjectnew.tdeduction[i].fields.Description || '-',
                                                    dataObjectnew.tdeduction[i].fields.DeductionType || '',
                                                    dataObjectnew.tdeduction[i].fields.DisplayIn || '',
                                                    allowanceAmount || 0.00,
                                                    dataObjectnew.tdeduction[i].fields.Accountname || '',
                                                    dataObjectnew.tdeduction[i].fields.Accountid || 0,
                                                    dataObjectnew.tdeduction[i].fields.Payrolltaxexempt || false,
                                                    dataObjectnewdataObjectnew.tdeduction[i].fields.Superinc || false,
                                                    dataObjectnew.tdeduction[i].fields.Workcoverexempt || false,
                                                    ''
                                                ];

                                                splashArrayDeductionList.push(dataListCustomerDupp);
                                                //}
                                            }

                                            let uniqueChars = [...new Set(splashArrayDeductionList)];
                                            var datatable = $('#tblDeductions').DataTable();
                                            datatable.clear();
                                            datatable.rows.add(uniqueChars);
                                            datatable.draw(false);
                                            setTimeout(function () {
                                                $("#tblDeductions").dataTable().fnPageChange('last');
                                            }, 400);

                                            LoadingOverlay.hide();


                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });

                            });
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    },
                    "fnInitComplete": function () {
                        $("<button class='btn btn-primary btnAddNewDeduction' data-dismiss='modal' data-toggle='modal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblDeductions_filter");
                        $("<button class='btn btn-primary btnRefreshDeduction' type='button' id='btnRefreshDeduction' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblDeductions_filter");

                    }

                }).on('page', function () {
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);

                }).on('column-reorder', function () {

                }).on('length.dt', function (e, settings, len) {
                    //// $('.fullScreenSpin').css('display', 'inline-block');
                    let dataLenght = settings._iDisplayLength;
                    splashArrayDeductionList = [];
                    if (dataLenght == -1) {
                    LoadingOverlay.hide();

                    } else {
                        if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                            LoadingOverlay.hide();
                        } else {
                            sideBarService.getDeduction(dataLenght, 0).then(function (dataNonBo) {

                                addVS1Data('TDeduction', JSON.stringify(dataNonBo)).then(function (datareturn) {
                                    templateObject.resetData(dataNonBo);
                                    LoadingOverlay.hide();
                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });
                            }).catch(function (err) {
                                LoadingOverlay.hide();
                            });
                        }
                    }
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                });


            }, 0);

            $('div.dataTables_filter input').addClass('form-control form-control-sm');

            LoadingOverlay.hide();
        }).catch(function (err) {
            LoadingOverlay.hide();
        });
        });
    };


    // This has been improved
    templateObject.getHolidayData = async (refresh = false) => {
        let data = await CachedHttp.get(erpObject.TPayrollHolidays, async () =>{
            return await  sideBarService.getHolidayData(initialBaseDataLoad, 0);
        }, {
            forceOverride: refresh,
        });

        data = data.response;

        for (let i = 0; i < data.tpayrollholidays.length; i++) {
            var dataListAllowance = [
                    data.tpayrollholidays[i].fields.ID || "",
                    data.tpayrollholidays[i].fields.PayrollHolidaysName || "",
                    moment(data.tpayrollholidays[i].fields.PayrollHolidaysDate).format("DD/MM/YYYY") || "",
                    data.tpayrollholidays[i].fields.PayrollHolidaysGroupName || "",
                    data.fields.PayrollHolidaysActive == true ? '' : 'In-Active',
                    // '<td contenteditable="false" class="colHolidayDelete"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                ];
            splashArrayHolidayList.push(dataListAllowance);
        }

        setTimeout(function () {
            MakeNegative();
        }, 100);

        setTimeout(function () {
            $("#tblHolidays").DataTable({
                data: splashArrayHolidayList,
                sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                columnDefs: [
                {
                    className: "colHolidayID hiddenColumn",
                    targets: [0]
                }, {
                    className: "colHolidayName",
                    targets: [1]
                }, {
                    className: "colHolidayDate",
                    targets: [2]
                }, {
                    className: "colHolidaygroup hiddenColumn",
                    targets: [3]
                }, {
                    className: "colHolidayDelete",
                    orderable: false,
                    targets: -1
                }
                ],
                select: true,
                destroy: true,
                colReorder: true,
                pageLength: initialDatatableLoad,
                lengthMenu: [[
                    initialDatatableLoad, -1
                    ], [
                    initialDatatableLoad, "All"
                    ]
                ],
                info: true,
                responsive: true,
                order: [
                    [0, "asc"]
                ],
                action: function () {
                    $("#tblHolidays").DataTable().ajax.reload();
                },
                fnDrawCallback: function (oSettings) {
                    $(".paginate_button.page-item").removeClass("disabled");
                    $("#tblHolidays_ellipsis").addClass("disabled");
                    if (oSettings._iDisplayLength == -1) {
                        if (oSettings.fnRecordsDisplay() > 150) {}
                    } else {}
                    if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                        $(".paginate_button.page-item.next").addClass("disabled");
                    }

                    $(".paginate_button.next:not(.disabled)", this.api().table().container()).on("click", function () {
                        // $('.fullScreenSpin').css('display', 'inline-block');
                        var splashArrayHolidayList = new Array();
                        let dataLenght = oSettings._iDisplayLength;
                        let customerSearch = $("#tblHolidays_filter input").val();

                        sideBarService.getHolidayData(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (data) {
                        for (let i = 0; i < data.tpayrollholidays.length; i++) {
                            var dataListAllowance = [
                            data.tpayrollholidays[i].fields.ID || "",
                            data.tpayrollholidays[i].fields.PayrollHolidaysName || "",
                            moment(data.tpayrollholidays[i].fields.PayrollHolidaysDate).format("DD/MM/YYYY") || "",
                            data.tpayrollholidays[i].fields.PayrollHolidaysGroupName || "",
                            data.fields.PayrollHolidaysActive == true ? '' : 'In-Active',
                            // '<td contenteditable="false" class="colHolidayDelete"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                            ];

                            splashArrayHolidayList.push(dataListAllowance);
                        }

                        let uniqueChars = [...new Set(splashArrayHolidayList)];
                        var datatable = $("#tblHolidays").DataTable();
                        datatable.clear();
                        datatable.rows.add(uniqueChars);
                        datatable.draw(false);
                        setTimeout(function () {
                            $("#tblHolidays").dataTable().fnPageChange("last");
                        }, 400);

                        LoadingOverlay.hide();
                        }).catch(function (err) {
                        LoadingOverlay.hide();
                        });
                    });
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                },
                fnInitComplete: function () {
                    $("<button class='btn btn-primary btnAddNewHoliday' data-dismiss='modal' data-toggle='modal' data-target='#newHolidayModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblHolidays_filter");
                    $("<button class='btn btn-primary btnRefreshHoliday' type='button' id='btnRefreshHoliday' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblHolidays_filter");
                }
            }).on("page", function () {
                setTimeout(function () {
                MakeNegative();
                }, 100);
            }).on("column-reorder", function () {}).on("length.dt", function (e, settings, len) {
                //// $('.fullScreenSpin').css('display', 'inline-block');
                let dataLenght = settings._iDisplayLength;
                splashArrayHolidayList = [];
                if (dataLenght == -1) {
                    LoadingOverlay.hide();
                } else {
                    if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                        LoadingOverlay.hide();
                    } else {
                        sideBarService.getHolidayData(dataLenght, 0).then(function (dataNonBo) {
                        addVS1Data("TPayrollHolidays", JSON.stringify(dataNonBo)).then(function (datareturn) {
                            templateObject.resetData(dataNonBo);
                            LoadingOverlay.hide();
                        }).catch(function (err) {
                            LoadingOverlay.hide();
                        });
                        }).catch(function (err) {
                        LoadingOverlay.hide();
                        });
                    }
                }
                setTimeout(function () {
                    MakeNegative();
                }, 100);
            });
        }, 0);

        $("div.dataTables_filter input").addClass("form-control form-control-sm");
    };

    templateObject.loadEarnings = async (refresh = false) => {
        const resp = await getVS1Data(erpObject.TEarnings);
        let data = resp.length > 0 ? JSON.parse(resp[0].data) : [];
        const response  = data;

        let earnings = response.map(e => e.fields != undefined ? e.fields : e);

        await templateObject.earnings.set(earnings);

        setTimeout(function () {
            $('#tblEarnings').DataTable({
                ...TableHandler.getDefaultTableConfiguration("tblEarnings"),
                "order": [[0, "asc"]],
                action: function () {
                    $('#tblEarnings').DataTable().ajax.reload();
                },

            }).on('page', function () {
                setTimeout(function () {
                    MakeNegative();
                }, 100);

            }).on('column-reorder', function () {

            }).on('length.dt', function (e, settings, len) {
              //// $('.fullScreenSpin').css('display', 'inline-block');
              let dataLenght = settings._iDisplayLength;
              splashArrayEarningList = [];
              if (dataLenght == -1) {
                LoadingOverlay.hide();

              } else {
                  if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                      LoadingOverlay.hide();
                  } else {

                  }
              }
                setTimeout(function () {
                    MakeNegative();
                }, 100);
            });


        }, 300);

        $('div.dataTables_filter input').addClass('form-control form-control-sm');

    };


    templateObject.geTEarnings = function(){
        getVS1Data(erpObject.TEarnings).then(function(dataObject) {

            if(dataObject.length == 0)
            {

                var dataListAllowance = [
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                 ];

                splashArrayEarningList.push(dataListAllowance);

                setTimeout(function () {
                    MakeNegative();
                }, 100);
                setTimeout(function () {
                    $('#tblEarnings').DataTable({
                        ...TableHandler.getDefaultTableConfiguration("tblEarnings"),

                        data: splashArrayEarningList,
                        //"sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        columnDefs: [
                            {
                             className: "colEarningsID hiddenColumn",
                             "targets": [0]
                           },
                           {
                              className: "colEarningsNames",
                              "targets": [1]
                           },
                           {
                              className: "colEarningsType",
                              "targets": [2]
                           },
                           {
                            className: "colEarningsDisplayName",
                            "targets": [3]
                           },
                           {
                              className: "colEarningsratetype",
                              "targets": [4]
                            },
                           {
                            className: "colEarningsAmount",
                            "targets": [5]
                           },
                           {
                            className: "colEarningsAccounts",
                            "targets": [6]
                           },
                           {
                            className: "colEarningsAccountsID hiddenColumn",
                            "targets": [7]
                           },
                           {
                            className: "colEarningsPAYG hiddenColumn"  ,
                            "targets": [8]
                           },
                           {
                            className: "colEarningsSuperannuation hiddenColumn",
                            "targets": [9]
                           },
                           {
                            className: "colEarningsReportableasW1 hiddenColumn",
                            "targets": [10]
                           },
                           {
                            className: "colStatus",
                            "targets": [11]
                           }
                        ],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        pageLength: initialDatatableLoad,
                        lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[0, "asc"]],
                        action: function () {
                            $('#tblEarnings').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                            $('.paginate_button.page-item').removeClass('disabled');
                            $('#tblEarnings_ellipsis').addClass('disabled');
                            if (oSettings._iDisplayLength == -1) {
                                if (oSettings.fnRecordsDisplay() > 150) {

                                }
                            } else {

                            }
                            if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                $('.paginate_button.page-item.next').addClass('disabled');
                            }

                            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                                .on('click', function () {
                                    // $('.fullScreenSpin').css('display', 'inline-block');
                                    var splashArrayEarningListDupp = new Array();
                                    let dataLenght = oSettings._iDisplayLength;
                                    let customerSearch = $('#tblEarnings_filter input').val();



                                });
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },
                        "fnInitComplete": function () {
                          $("<button class='btn btn-primary btnAddordinaryTimeEarnings' data-dismiss='modal' data-toggle='modal' data-target='#addEarningsRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblEarnings_filter");
                          $("<button class='btn btn-primary btnRefreshEarnings' type='button' id='btnRefreshEarnings' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblEarnings_filter");

                        }

                    }).on('page', function () {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);

                    }).on('column-reorder', function () {

                    }).on('length.dt', function (e, settings, len) {
                      //// $('.fullScreenSpin').css('display', 'inline-block');
                      let dataLenght = settings._iDisplayLength;
                      splashArrayEarningList = [];
                      if (dataLenght == -1) {
                        LoadingOverlay.hide();

                      } else {
                          if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                              LoadingOverlay.hide();
                          } else {

                          }
                      }
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    });


                }, 0);

                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                LoadingOverlay.hide();

            }
            else
            { 
                  let data = JSON.parse(dataObject[0].data);
                let useData = data;
                let lineItems = [];
                let lineItemObj = {};
                for (let i = 0; i < data.length; i++) {
                  var dataListAllowance = [
                      '',
                      data[i].fields.EarningName || '',
                      data[i].fields.EarningType || '',
                      data[i].fields.EarningDisplayName || '',
                      data[i].fields.EarningRateType || '',
                      '100',
                      data[i].fields.EarningExpanceAccount || '',
                      data[i].fields.EarningExpanceAccount || '',
                      data[i].fields.Earningpaygholding || '',
                      data[i].fields.Earningsuperannuation || '',
                      data[i].fields.Earningactivitystatement || '',
                   ];

                  splashArrayEarningList.push(dataListAllowance);
                }
                setTimeout(function () {
                    MakeNegative();
                }, 100);
                setTimeout(function () {
                    $('#tblEarnings').DataTable({
                        ...TableHandler.getDefaultTableConfiguration("tblEarnings"),
                        data: splashArrayEarningList,
                        // "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        columnDefs: [

                          {
                             className: "colEarningsID hiddenColumn",
                             "targets": [0]
                           },
                           {
                              className: "colEarningsNames",
                              "targets": [1]
                           },
                           {
                              className: "colEarningsType",
                              "targets": [2]
                           },
                           {
                            className: "colEarningsDisplayName",
                            "targets": [3]
                           },
                           {
                              className: "colEarningsratetype",
                              "targets": [4]
                            },
                           {
                            className: "colEarningsAmount",
                            "targets": [5]
                           },
                           {
                            className: "colEarningsAccounts",
                            "targets": [6]
                           },
                           {
                            className: "colEarningsAccountsID hiddenColumn",
                            "targets": [7]
                           },
                           {
                            className: "colEarningsPAYG hiddenColumn"  ,
                            "targets": [8]
                           },
                           {
                            className: "colEarningsSuperannuation hiddenColumn",
                            "targets": [9]
                           },
                           {
                            className: "colStatus",
                            "targets": [10]
                           },
                        ],
                        // select: true,
                        // destroy: true,
                        // colReorder: true,
                        // pageLength: initialDatatableLoad,
                        // lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                        // info: true,
                        // responsive: true,
                        "order": [[0, "asc"]],
                        action: function () {
                            $('#tblEarnings').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                            $('.paginate_button.page-item').removeClass('disabled');
                            $('#tblEarnings_ellipsis').addClass('disabled');
                            if (oSettings._iDisplayLength == -1) {
                                if (oSettings.fnRecordsDisplay() > 150) {

                                }
                            } else {

                            }
                            if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                $('.paginate_button.page-item.next').addClass('disabled');
                            }

                            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                                .on('click', function () {
                                    // $('.fullScreenSpin').css('display', 'inline-block');
                                    var splashArrayEarningListDupp = new Array();
                                    let dataLenght = oSettings._iDisplayLength;
                                    let customerSearch = $('#tblEarnings_filter input').val();



                                });
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },
                        // "fnInitComplete": function () {
                        //   $("<button class='btn btn-primary btnAddordinaryTimeEarnings' data-dismiss='modal' data-toggle='modal' data-target='#addEarningsRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblEarnings_filter");
                        //   $("<button class='btn btn-primary btnRefreshEarnings' type='button' id='btnRefreshEarnings' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblEarnings_filter");

                        // }

                    }).on('page', function () {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);

                    }).on('column-reorder', function () {

                    }).on('length.dt', function (e, settings, len) {
                      //// $('.fullScreenSpin').css('display', 'inline-block');
                      let dataLenght = settings._iDisplayLength;
                      splashArrayEarningList = [];
                      if (dataLenght == -1) {
                        LoadingOverlay.hide();

                      } else {
                          if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                              LoadingOverlay.hide();
                          } else {

                          }
                      }
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    });


                }, 0);

                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                LoadingOverlay.hide();
            }
        });
    };

    templateObject.getLeaveTypeData = function(){
        getVS1Data('TLeave').then(function(dataObject) {
            if(dataObject.length == 0)
            {
                // var dataListAllowance = [
                //     '',
                //     '',
                //     '',
                //    '',
                //    '',
                //     '',
                //     '',
                //    '<td contenteditable="false" class="colDeletepaidrem"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                //    ''
                //    ];

                // splashArrayLeaveList.push(dataListAllowance);
                // leavetypearraylist.push(dataListAllowance);
                setTimeout(function () {
                    MakeNegative();
                }, 100);
                setTimeout(function () {
                    $('#tblLeave').DataTable({

                        data: splashArrayLeaveList,
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        columnDefs: [

                          {
                               className: "colLeaveID hiddenColumn",
                               "targets": [0]
                             },
                             {
                                className: "colLeaveName",
                                "targets": [1]
                             },
                             {
                                className: "colLeaveUnits",
                                "targets": [2]
                             },
                             {
                              className: "colLeaveNormalEntitlement",
                              "targets": [3]
                             },
                             {
                              className: "colLeaveLeaveLoadingRate",
                              "targets": [4]
                             },
                             {
                              className: "colLeavePaidLeave",
                              "targets": [5]
                             },
                             {
                              className: "colLeaveShownOnPayslip",
                              "targets": [6]
                             },
                             {
                                className: "colDeletepaidrem",
                                "orderable": false,
                                "targets": -1
                             }
                        ],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        pageLength: initialDatatableLoad,
                        lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[0, "asc"]],
                        action: function () {
                            $('#tblLeave').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                            $('.paginate_button.page-item').removeClass('disabled');
                            $('#tblLeave_ellipsis').addClass('disabled');
                            if (oSettings._iDisplayLength == -1) {
                                if (oSettings.fnRecordsDisplay() > 150) {

                                }
                            } else {

                            }
                            if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                $('.paginate_button.page-item.next').addClass('disabled');
                            }

                            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                                .on('click', function () {
                                    // $('.fullScreenSpin').css('display', 'inline-block');
                                    var splashArrayLeaveListDupp = new Array();
                                    let dataLenght = oSettings._iDisplayLength;
                                    let customerSearch = $('#tblLeave_filter input').val();



                                });
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },
                        "fnInitComplete": function () {
                          $("<button class='btn btn-primary btnAddNewPaidLeave' data-dismiss='modal' data-toggle='modal' data-target='#paidLeaveModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblLeave_filter");
                          $("<button class='btn btn-primary btnRefreshPaidLeave' type='button' id='btnRefreshPaidLeave' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblLeave_filter");

                        }

                    }).on('page', function () {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);

                    }).on('column-reorder', function () {

                    }).on('length.dt', function (e, settings, len) {
                      //// $('.fullScreenSpin').css('display', 'inline-block');
                      let dataLenght = settings._iDisplayLength;
                      splashArrayLeaveList = [];
                      if (dataLenght == -1) {
                        LoadingOverlay.hide();

                      } else {
                          if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                              LoadingOverlay.hide();
                          } else {

                          }
                      }
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    });


                }, 0);

                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                LoadingOverlay.hide();

            }
            else
            {

                let data = JSON.parse(dataObject[0].data);
                let useData = data;
                let lineItems = [];
                let lineItemObj = {};
                for (let i = 0; i < data.length; i++) {

                  var dataListAllowance = [
                      data[i].fields.ID || '',
                      data[i].fields.LeaveName || '',
                      data[i].fields.LeaveUnits || '',
                      data[i].fields.LeaveNormalEntitlement || '',
                      data[i].fields.LeaveLeaveLoadingRate || '',
                      data[i].fields.LeaveType || '',
                      data[i].fields.LeaveShowBalanceOnPayslip == true ? 'show': 'hide',
                    //  '<td contenteditable="false" class="colDeletepaidrem"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                    ''
                     ];

                  splashArrayLeaveList.push(dataListAllowance);
                  leavetypearraylist.push(dataListAllowance);

                }

                setTimeout(function () {
                    MakeNegative();
                }, 100);
                setTimeout(function () {
                    $('#tblLeave').DataTable({

                        data: splashArrayLeaveList,
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        columnDefs: [

                          {
                               className: "colLeaveID hiddenColumn",
                               "targets": [0]
                             },
                             {
                                className: "colLeaveName",
                                "targets": [1]
                             },
                             {
                                className: "colLeaveUnits",
                                "targets": [2]
                             },
                             {
                              className: "colLeaveNormalEntitlement",
                              "targets": [3]
                             },
                             {
                              className: "colLeaveLeaveLoadingRate",
                              "targets": [4]
                             },
                             {
                              className: "colLeavePaidLeave",
                              "targets": [5]
                             },
                             {
                              className: "colLeaveShownOnPayslip",
                              "targets": [6]
                             },
                             {
                                className: "colDeletepaidrem",
                                "orderable": false,
                                "targets": -1
                             }
                        ],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        pageLength: initialDatatableLoad,
                        lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[0, "asc"]],
                        action: function () {
                            $('#tblLeave').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                            $('.paginate_button.page-item').removeClass('disabled');
                            $('#tblLeave_ellipsis').addClass('disabled');
                            if (oSettings._iDisplayLength == -1) {
                                if (oSettings.fnRecordsDisplay() > 150) {

                                }
                            } else {

                            }
                            if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                $('.paginate_button.page-item.next').addClass('disabled');
                            }

                            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                                .on('click', function () {
                                    // $('.fullScreenSpin').css('display', 'inline-block');
                                    var splashArrayLeaveListDupp = new Array();
                                    let dataLenght = oSettings._iDisplayLength;
                                    let customerSearch = $('#tblLeave_filter input').val();



                                });
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },
                        "fnInitComplete": function () {
                          $("<button class='btn btn-primary btnAddNewPaidLeave' data-dismiss='modal' data-toggle='modal' data-target='#paidLeaveModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblLeave_filter");
                          $("<button class='btn btn-primary btnRefreshPaidLeave' type='button' id='btnRefreshPaidLeave' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblLeave_filter");

                        }

                    }).on('page', function () {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);

                    }).on('column-reorder', function () {

                    }).on('length.dt', function (e, settings, len) {
                      //// $('.fullScreenSpin').css('display', 'inline-block');
                      let dataLenght = settings._iDisplayLength;
                      splashArrayLeaveList = [];
                      if (dataLenght == -1) {
                        LoadingOverlay.hide();

                      } else {
                          if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                              LoadingOverlay.hide();
                          } else {

                          }
                      }
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    });


                }, 0);

                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                LoadingOverlay.hide();


            }



        });

    };

    templateObject.getunpaidleavedata = function(){
              getVS1Data('TUnpaidLeave').then(function(dataObject) {
            if (dataObject.length == 0) {
                 sideBarService.getUnPaidLeave(initialBaseDataLoad, 0).then(function (data) {
                  addVS1Data('TUnpaidLeave', JSON.stringify(data));
                  let lineItems = [];
                  let lineItemObj = {};
                  for (let i = 0; i < data.tunpaidleave.length; i++) {

                    var dataListAllowance = [
                        data.tunpaidleave[i].fields.ID || '',
                        data.tunpaidleave[i].fields.LeaveUnpaidName || '',
                        data.tunpaidleave[i].fields.LeaveUnpaidUnits || '',
                        data.tunpaidleave[i].fields.LeaveUnpaidNormalEntitlement || '',
                        data.tunpaidleave[i].fields.LeaveUnpaidLeaveLoadingRate || '',
                        'unpaid',
                        data.tunpaidleave[i].fields.LeaveUnpaidShowBalanceOnPayslip == true ? 'show': 'hide',
                        // '<td contenteditable="false" class="colDeletepaidrem"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                        ''
                    ];

                     splashArrayLeaveList.push(dataListAllowance);
                 }


                  setTimeout(function () {
                      MakeNegative();
                  }, 100);
                  setTimeout(function () {
                      $('#tblLeave').DataTable({

                          data: splashArrayLeaveList,
                          "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                          columnDefs: [

                            {
                                 className: "colLeaveID hiddenColumn",
                                 "targets": [0]
                               },
                               {
                                  className: "colLeaveName",
                                  "targets": [1]
                               },
                               {
                                  className: "colLeaveUnits",
                                  "targets": [2]
                               },
                               {
                                className: "colLeaveNormalEntitlement",
                                "targets": [3]
                               },
                               {
                                className: "colLeaveLeaveLoadingRate",
                                "targets": [4]
                               },
                               {
                                className: "colLeavePaidLeave",
                                "targets": [5]
                               },
                               {
                                className: "colLeaveShownOnPayslip",
                                "targets": [6]
                               },
                               {
                                  className: "colDeletepaidrem",
                                  "orderable": false,
                                  "targets": -1
                               }
                          ],
                          select: true,
                          destroy: true,
                          colReorder: true,
                          pageLength: initialDatatableLoad,
                          lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                          info: true,
                          responsive: true,
                          "order": [[0, "asc"]],
                          action: function () {
                              $('#tblLeave').DataTable().ajax.reload();
                          },
                          "fnDrawCallback": function (oSettings) {
                              $('.paginate_button.page-item').removeClass('disabled');
                              $('#tblLeave_ellipsis').addClass('disabled');
                              if (oSettings._iDisplayLength == -1) {
                                  if (oSettings.fnRecordsDisplay() > 150) {

                                  }
                              } else {

                              }
                              if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                  $('.paginate_button.page-item.next').addClass('disabled');
                              }

                              $('.paginate_button.next:not(.disabled)', this.api().table().container())
                                  .on('click', function () {
                                      // $('.fullScreenSpin').css('display', 'inline-block');
                                      var splashArrayLeaveListDupp = new Array();
                                      let dataLenght = oSettings._iDisplayLength;
                                      let customerSearch = $('#tblLeave_filter input').val();

                                      sideBarService.getUnPaidLeave(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (data) {

                                        for (let i = 0; i < data.tunpaidleave.length; i++) {

                                            var dataListAllowance = [
                                                data.tunpaidleave[i].fields.ID || '',
                                                data.tunpaidleave[i].fields.LeaveUnpaidName || '',
                                                data.tunpaidleave[i].fields.LeaveUnpaidUnits || '',
                                                data.tunpaidleave[i].fields.LeaveUnpaidNormalEntitlement || '',
                                                data.tunpaidleave[i].fields.LeaveUnpaidLeaveLoadingRate || '',
                                                'unpaid',
                                                data.tunpaidleave[i].fields.LeaveUnpaidShowBalanceOnPayslip == true ? 'show': 'hide',
                                                // '<td contenteditable="false" class="colDeletepaidrem"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                                                ''
                                            ];

                                             splashArrayLeaveList.push(dataListAllowance);
                                         }


                                        let uniqueChars = [...new Set(splashArrayLeaveList)];
                                        var datatable = $('#tblLeave').DataTable();
                                        datatable.clear();
                                        datatable.rows.add(uniqueChars);
                                        datatable.draw(false);
                                        setTimeout(function () {
                                        $("#tblLeave").dataTable().fnPageChange('last');
                                        }, 400);
                                        LoadingOverlay.hide();


                                      }).catch(function (err) {
                                          LoadingOverlay.hide();
                                      });

                                  });
                              setTimeout(function () {
                                  MakeNegative();
                              }, 100);
                          },
                          "fnInitComplete": function () {
                              $("<button class='btn btn-primary btnAddNewPaidLeave' data-dismiss='modal' data-toggle='modal' data-target='#paidLeaveModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblLeave_filter");
                              $("<button class='btn btn-primary btnRefreshPaidLeave' type='button' id='btnRefreshPaidLeave' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblLeave_filter");

                          }

                      }).on('page', function () {
                          setTimeout(function () {
                              MakeNegative();
                          }, 100);

                      }).on('column-reorder', function () {

                      }).on('length.dt', function (e, settings, len) {
                        //// $('.fullScreenSpin').css('display', 'inline-block');
                        let dataLenght = settings._iDisplayLength;
                        splashArrayLeaveList = [];
                        if (dataLenght == -1) {
                          LoadingOverlay.hide();

                        } else {
                            if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                                LoadingOverlay.hide();
                            } else {
                                sideBarService.getUnPaidLeave(dataLenght, 0).then(function (dataNonBo) {

                                    addVS1Data('TUnpaidLeave', JSON.stringify(dataNonBo)).then(function (datareturn) {
                                        templateObject.resetData(dataNonBo);
                                        LoadingOverlay.hide();
                                    }).catch(function (err) {
                                        LoadingOverlay.hide();
                                    });
                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });
                            }
                        }
                          setTimeout(function () {
                              MakeNegative();
                          }, 100);
                      });


                  }, 0);

                  $('div.dataTables_filter input').addClass('form-control form-control-sm');

                  LoadingOverlay.hide();
              }).catch(function (err) {
                LoadingOverlay.hide();
              });
            }else{

              let data = JSON.parse(dataObject[0].data);

              let useData = data;
              let lineItems = [];
              let lineItemObj = {};
              for (let i = 0; i < data.tunpaidleave.length; i++) {

                var dataListAllowance = [
                    data.tunpaidleave[i].fields.ID || '',
                    data.tunpaidleave[i].fields.LeaveUnpaidName || '',
                    data.tunpaidleave[i].fields.LeaveUnpaidUnits || '',
                    data.tunpaidleave[i].fields.LeaveUnpaidNormalEntitlement || '',
                    data.tunpaidleave[i].fields.LeaveUnpaidLeaveLoadingRate || '',
                    'unpaid',
                    data.tunpaidleave[i].fields.LeaveUnpaidShowBalanceOnPayslip == true ? 'show': 'hide',
                    // '<td contenteditable="false" class="colDeletepaidrem"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                    ''
                ];

                 splashArrayLeaveList.push(dataListAllowance);
              }


              setTimeout(function () {
                  MakeNegative();
              }, 100);
              setTimeout(function () {
                  $('#tblLeave').DataTable({

                      data: splashArrayLeaveList,
                      "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                      columnDefs: [

                        {
                             className: "colLeaveID hiddenColumn",
                             "targets": [0]
                           },
                           {
                              className: "colLeaveName",
                              "targets": [1]
                           },
                           {
                              className: "colLeaveUnits",
                              "targets": [2]
                           },
                           {
                            className: "colLeaveNormalEntitlement",
                            "targets": [3]
                           },
                           {
                            className: "colLeaveLeaveLoadingRate",
                            "targets": [4]
                           },
                           {
                            className: "colLeavePaidLeave",
                            "targets": [5]
                           },
                           {
                            className: "colLeaveShownOnPayslip",
                            "targets": [6]
                           },
                           {
                              className: "colDeletepaidrem",
                              "orderable": false,
                              "targets": -1
                           }
                      ],
                      select: true,
                      destroy: true,
                      colReorder: true,
                      pageLength: initialDatatableLoad,
                      lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                      info: true,
                      responsive: true,
                      "order": [[0, "asc"]],
                      action: function () {
                          $('#tblLeave').DataTable().ajax.reload();
                      },
                      "fnDrawCallback": function (oSettings) {
                          $('.paginate_button.page-item').removeClass('disabled');
                          $('#tblLeave_ellipsis').addClass('disabled');
                          if (oSettings._iDisplayLength == -1) {
                              if (oSettings.fnRecordsDisplay() > 150) {

                              }
                          } else {

                          }
                          if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                              $('.paginate_button.page-item.next').addClass('disabled');
                          }

                          $('.paginate_button.next:not(.disabled)', this.api().table().container())
                              .on('click', function () {
                                  // $('.fullScreenSpin').css('display', 'inline-block');
                                  var splashArrayLeaveListDupp = new Array();
                                  let dataLenght = oSettings._iDisplayLength;
                                  let customerSearch = $('#tblLeave_filter input').val();

                                  sideBarService.getPaidLeave(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (data) {

                                    for (let i = 0; i < data.tunpaidleave.length; i++) {

                                        var dataListAllowance = [
                                            data.tunpaidleave[i].fields.ID || '',
                                            data.tunpaidleave[i].fields.LeaveUnpaidName || '',
                                            data.tunpaidleave[i].fields.LeaveUnpaidUnits || '',
                                            data.tunpaidleave[i].fields.LeaveUnpaidNormalEntitlement || '',
                                            data.tunpaidleave[i].fields.LeaveUnpaidLeaveLoadingRate || '',
                                            'unpaid',
                                            data.tunpaidleave[i].fields.LeaveUnpaidShowBalanceOnPayslip == true ? 'show': 'hide',
                                            // '<td contenteditable="false" class="colDeletepaidrem"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                                            ''
                                        ];

                                         splashArrayLeaveList.push(dataListAllowance);
                                     }


                                              let uniqueChars = [...new Set(splashArrayLeaveList)];
                                              var datatable = $('#tblLeave').DataTable();
                                              datatable.clear();
                                              datatable.rows.add(uniqueChars);
                                              datatable.draw(false);
                                              setTimeout(function () {
                                                $("#tblLeave").dataTable().fnPageChange('last');
                                              }, 400);

                                              LoadingOverlay.hide();


                                  }).catch(function (err) {
                                      LoadingOverlay.hide();
                                  });

                              });
                          setTimeout(function () {
                              MakeNegative();
                          }, 100);
                      },
                      "fnInitComplete": function () {
                        $("<button class='btn btn-primary btnAddNewPaidLeave' data-dismiss='modal' data-toggle='modal' data-target='#paidLeaveModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblLeave_filter");
                        $("<button class='btn btn-primary btnRefreshPaidLeave' type='button' id='btnRefreshPaidLeave' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblLeave_filter");

                      }

                  }).on('page', function () {
                      setTimeout(function () {
                          MakeNegative();
                      }, 100);

                  }).on('column-reorder', function () {

                  }).on('length.dt', function (e, settings, len) {
                    //// $('.fullScreenSpin').css('display', 'inline-block');
                    let dataLenght = settings._iDisplayLength;
                    splashArrayLeaveList = [];
                    if (dataLenght == -1) {
                      LoadingOverlay.hide();

                    } else {
                        if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                            LoadingOverlay.hide();
                        } else {
                            sideBarService.getUnPaidLeave(dataLenght, 0).then(function (dataNonBo) {

                                addVS1Data('TUnpaidLeave', JSON.stringify(dataNonBo)).then(function (datareturn) {
                                    templateObject.resetData(dataNonBo);
                                    LoadingOverlay.hide();
                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });
                            }).catch(function (err) {
                                LoadingOverlay.hide();
                            });
                        }
                    }
                      setTimeout(function () {
                          MakeNegative();
                      }, 100);
                  });


              }, 0);

              $('div.dataTables_filter input').addClass('form-control form-control-sm');
              LoadingOverlay.hide();

            }
        }).catch(function(err) {

          sideBarService.getUnPaidLeave(initialBaseDataLoad, 0).then(function (data) {
              addVS1Data('TUnpaidLeave', JSON.stringify(data));

              let lineItems = [];
              let lineItemObj = {};
              for (let i = 0; i < data.tunpaidleave.length; i++) {

                var dataListAllowance = [
                    data.tunpaidleave[i].fields.ID || '',
                    data.tunpaidleave[i].fields.LeaveUnpaidName || '',
                    data.tunpaidleave[i].fields.LeaveUnpaidUnits || '',
                    data.tunpaidleave[i].fields.LeaveUnpaidNormalEntitlement || '',
                    data.tunpaidleave[i].fields.LeaveUnpaidLeaveLoadingRate || '',
                    'unpaid',
                    data.tunpaidleave[i].fields.LeaveUnpaidShowBalanceOnPayslip == true ? 'show': 'hide',
                    // '<td contenteditable="false" class="colDeletepaidrem"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                    ''
                ];

                 splashArrayLeaveList.push(dataListAllowance);
             }

              setTimeout(function () {
                  MakeNegative();
              }, 100);
              setTimeout(function () {
                  $('#tblLeave').DataTable({

                      data: splashArrayLeaveList,
                      "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                      columnDefs: [

                        {
                             className: "colLeaveID hiddenColumn",
                             "targets": [0]
                           },
                           {
                              className: "colLeaveName",
                              "targets": [1]
                           },
                           {
                              className: "colLeaveUnits",
                              "targets": [2]
                           },
                           {
                            className: "colLeaveNormalEntitlement",
                            "targets": [3]
                           },
                           {
                            className: "colLeaveLeaveLoadingRate",
                            "targets": [4]
                           },
                           {
                            className: "colLeavePaidLeave",
                            "targets": [5]
                           },
                           {
                            className: "colLeaveShownOnPayslip",
                            "targets": [6]
                           },
                           {
                              className: "colDeletepaidrem",
                              "orderable": false,
                              "targets": -1
                           }
                      ],
                      select: true,
                      destroy: true,
                      colReorder: true,
                      pageLength: initialDatatableLoad,
                      lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                      info: true,
                      responsive: true,
                      "order": [[0, "asc"]],
                      action: function () {
                          $('#tblLeave').DataTable().ajax.reload();
                      },
                      "fnDrawCallback": function (oSettings) {
                          $('.paginate_button.page-item').removeClass('disabled');
                          $('#tblLeave_ellipsis').addClass('disabled');
                          if (oSettings._iDisplayLength == -1) {
                              if (oSettings.fnRecordsDisplay() > 150) {

                              }
                          } else {

                          }
                          if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                              $('.paginate_button.page-item.next').addClass('disabled');
                          }

                          $('.paginate_button.next:not(.disabled)', this.api().table().container())
                              .on('click', function () {
                                  // $('.fullScreenSpin').css('display', 'inline-block');
                                  var splashArrayLeaveListDupp = new Array();
                                  let dataLenght = oSettings._iDisplayLength;
                                  let customerSearch = $('#tblLeave_filter input').val();

                                  sideBarService.getUnPaidLeave(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (data) {

                                    for (let i = 0; i < data.tunpaidleave.length; i++) {

                                        var dataListAllowance = [
                                            data.tunpaidleave[i].fields.ID || '',
                                            data.tunpaidleave[i].fields.LeaveUnpaidName || '',
                                            data.tunpaidleave[i].fields.LeaveUnpaidUnits || '',
                                            data.tunpaidleave[i].fields.LeaveUnpaidNormalEntitlement || '',
                                            data.tunpaidleave[i].fields.LeaveUnpaidLeaveLoadingRate || '',
                                            'unpaid',
                                            data.tunpaidleave[i].fields.LeaveUnpaidShowBalanceOnPayslip == true ? 'show': 'hide',
                                            // '<td contenteditable="false" class="colDeletepaidrem"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                                            ''
                                        ];

                                         splashArrayLeaveList.push(dataListAllowance);
                                     }


                                         let uniqueChars = [...new Set(splashArrayLeaveList)];
                                         var datatable = $('#tblLeave').DataTable();
                                              datatable.clear();
                                              datatable.rows.add(uniqueChars);
                                              datatable.draw(false);
                                              setTimeout(function () {
                                                $("#tblLeave").dataTable().fnPageChange('last');
                                              }, 400);

                                              LoadingOverlay.hide();


                                  }).catch(function (err) {
                                      LoadingOverlay.hide();
                                  });

                              });
                          setTimeout(function () {
                              MakeNegative();
                          }, 100);
                      },
                      "fnInitComplete": function () {
                        $("<button class='btn btn-primary btnAddNewPaidLeave' data-dismiss='modal' data-toggle='modal' data-target='#paidLeaveModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblLeave_filter");
                        $("<button class='btn btn-primary btnRefreshPaidLeave' type='button' id='btnRefreshPaidLeave' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblLeave_filter");

                      }

                  }).on('page', function () {
                      setTimeout(function () {
                          MakeNegative();
                      }, 100);

                  }).on('column-reorder', function () {

                  }).on('length.dt', function (e, settings, len) {
                    //// $('.fullScreenSpin').css('display', 'inline-block');
                    let dataLenght = settings._iDisplayLength;
                    splashArrayLeaveList = [];
                    if (dataLenght == -1) {
                      LoadingOverlay.hide();

                    } else {
                        if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                            LoadingOverlay.hide();
                        } else {
                            sideBarService.getUnPaidLeave(dataLenght, 0).then(function (dataNonBo) {

                                addVS1Data('TUnpaidLeave', JSON.stringify(dataNonBo)).then(function (datareturn) {
                                    templateObject.resetData(dataNonBo);
                                    LoadingOverlay.hide();
                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });
                            }).catch(function (err) {
                                LoadingOverlay.hide();
                            });
                        }
                    }
                      setTimeout(function () {
                          MakeNegative();
                      }, 100);
                  });


              }, 0);

              $('div.dataTables_filter input').addClass('form-control form-control-sm');

              LoadingOverlay.hide();
          }).catch(function (err) {
            LoadingOverlay.hide();
          });
        });

    };

    templateObject.getReimbursement = function(){

        getVS1Data('TReimbursement').then(function(dataObject) {
            if (dataObject.length == 0) {
                 sideBarService.getReimbursement(initialBaseDataLoad, 0).then(function (data) {
                  addVS1Data('TReimbursement', JSON.stringify(data));
                  let lineItems = [];
                  let lineItemObj = {};
                  for (let i = 0; i < data.treimbursement.length; i++) {

                      var dataListAllowance = [
                          data.treimbursement[i].fields.ID || '',
                          data.treimbursement[i].fields.ReimbursementName || 0,
                          data.treimbursement[i].fields.ReimbursementAccount || 0,
                        //  '<td contenteditable="false" class="colDeleterei"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                        ''
                      ];

                      splashArrayReisument.push(dataListAllowance);
                  }




                  setTimeout(function () {
                      MakeNegative();
                  }, 100);
                  setTimeout(function () {
                      $('#tblReimbursements').DataTable({

                          data: splashArrayReisument,
                          "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                          columnDefs: [

                            {
                                 className: "colReimbursementID hiddenColumn",
                                 "targets": [0]
                               },
                               {
                                  className: "colReimbursementName",
                                  "targets": [1]
                               },
                               {
                                  className: "colReimbursementAccount",
                                  "targets": [2]
                               },
                               {
                                  className: "colDeleterei",
                                  "orderable": false,
                                  "targets": -1
                               }
                          ],
                          select: true,
                          destroy: true,
                          colReorder: true,
                          pageLength: initialDatatableLoad,
                          lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                          info: true,
                          responsive: true,
                          "order": [[0, "asc"]],
                          action: function () {
                              $('#tblReimbursements').DataTable().ajax.reload();
                          },
                          "fnDrawCallback": function (oSettings) {
                              $('.paginate_button.page-item').removeClass('disabled');
                              $('#tblReimbursements_ellipsis').addClass('disabled');
                              if (oSettings._iDisplayLength == -1) {
                                  if (oSettings.fnRecordsDisplay() > 150) {

                                  }
                              } else {

                              }
                              if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                  $('.paginate_button.page-item.next').addClass('disabled');
                              }

                              $('.paginate_button.next:not(.disabled)', this.api().table().container())
                                  .on('click', function () {
                                      // $('.fullScreenSpin').css('display', 'inline-block');
                                      var splashArrayReisumentDupp = new Array();
                                      let dataLenght = oSettings._iDisplayLength;
                                      let customerSearch = $('#tblReimbursements_filter input').val();

                                      sideBarService.getReimbursement(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (data) {

                                        for (let i = 0; i < data.treimbursement.length; i++) {

                                            var dataListAllowance = [
                                                data.treimbursement[i].fields.ID || '',
                                                data.treimbursement[i].fields.ReimbursementName || 0,
                                                data.treimbursement[i].fields.ReimbursementAccount || 0,
                                            //    '<td contenteditable="false" class="colDeleterei"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                                            ''
                                            ];

                                            splashArrayReisument.push(dataListAllowance);
                                        }

                                                  let uniqueChars = [...new Set(splashArrayReisument)];
                                                  var datatable = $('#tblReimbursements').DataTable();
                                                  datatable.clear();
                                                  datatable.rows.add(uniqueChars);
                                                  datatable.draw(false);
                                                  setTimeout(function () {
                                                    $("#tblReimbursements").dataTable().fnPageChange('last');
                                                  }, 400);

                                                  LoadingOverlay.hide();


                                      }).catch(function (err) {
                                          LoadingOverlay.hide();
                                      });

                                  });
                              setTimeout(function () {
                                  MakeNegative();
                              }, 100);
                          },
                          "fnInitComplete": function () {
                              $("<button class='btn btn-primary btnAddNewReimbursements' data-dismiss='modal' data-toggle='modal' data-target='#newReimbursementModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblReimbursements_filter");
                              $("<button class='btn btn-primary btnRefreshReimbursements' type='button' id='btnRefreshReimbursements' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblReimbursements_filter");

                          }

                      }).on('page', function () {
                          setTimeout(function () {
                              MakeNegative();
                          }, 100);

                      }).on('column-reorder', function () {

                      }).on('length.dt', function (e, settings, len) {
                        //// $('.fullScreenSpin').css('display', 'inline-block');
                        let dataLenght = settings._iDisplayLength;
                        splashArrayReisument = [];
                        if (dataLenght == -1) {
                          LoadingOverlay.hide();

                        } else {
                            if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                                LoadingOverlay.hide();
                            } else {
                                sideBarService.getReimbursement(dataLenght, 0).then(function (dataNonBo) {

                                    addVS1Data('tblReimbursements', JSON.stringify(dataNonBo)).then(function (datareturn) {
                                        templateObject.resetData(dataNonBo);
                                        LoadingOverlay.hide();
                                    }).catch(function (err) {
                                        LoadingOverlay.hide();
                                    });
                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });
                            }
                        }
                          setTimeout(function () {
                              MakeNegative();
                          }, 100);
                      });


                  }, 0);

                  $('div.dataTables_filter input').addClass('form-control form-control-sm');

                  LoadingOverlay.hide();
              }).catch(function (err) {
                LoadingOverlay.hide();
              });
            }else{

              let data = JSON.parse(dataObject[0].data);

              let useData = data;
              let lineItems = [];
              let lineItemObj = {};
              for (let i = 0; i < data.treimbursement.length; i++) {

                var dataListAllowance = [
                    data.treimbursement[i].fields.ID || '',
                    data.treimbursement[i].fields.ReimbursementName || 0,
                    data.treimbursement[i].fields.ReimbursementAccount || 0,
                //    '<td contenteditable="false" class="colDeleterei"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                ''
                ];

                splashArrayReisument.push(dataListAllowance);
            }



              setTimeout(function () {
                  MakeNegative();
              }, 100);
              setTimeout(function () {
                  $('#tblReimbursements').DataTable({

                      data: splashArrayReisument,
                      "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                      columnDefs: [

                        {
                             className: "colReimbursementID hiddenColumn",
                             "targets": [0]
                           },
                           {
                              className: "colReimbursementName",
                              "targets": [1]
                           },
                           {
                              className: "colReimbursementAccount",
                              "targets": [2]
                           },
                           {
                              className: "colDeleterei",
                              "orderable": false,
                              "targets": -1
                           }
                      ],
                      select: true,
                      destroy: true,
                      colReorder: true,
                      pageLength: initialDatatableLoad,
                      lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                      info: true,
                      responsive: true,
                      "order": [[0, "asc"]],
                      action: function () {
                          $('#tblReimbursements').DataTable().ajax.reload();
                      },
                      "fnDrawCallback": function (oSettings) {
                          $('.paginate_button.page-item').removeClass('disabled');
                          $('#tblReimbursements_ellipsis').addClass('disabled');
                          if (oSettings._iDisplayLength == -1) {
                              if (oSettings.fnRecordsDisplay() > 150) {

                              }
                          } else {

                          }
                          if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                              $('.paginate_button.page-item.next').addClass('disabled');
                          }

                          $('.paginate_button.next:not(.disabled)', this.api().table().container())
                              .on('click', function () {
                                  // $('.fullScreenSpin').css('display', 'inline-block');
                                  var splashArrayReisumentDuppDupp = new Array();
                                  let dataLenght = oSettings._iDisplayLength;
                                  let customerSearch = $('#tblReimbursements_filter input').val();

                                  sideBarService.getReimbursement(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (data) {

                                    for (let i = 0; i < data.treimbursement.length; i++) {

                                        var dataListAllowance = [
                                            data.treimbursement[i].fields.ID || '',
                                            data.treimbursement[i].fields.ReimbursementName || 0,
                                            data.treimbursement[i].fields.ReimbursementAccount || 0,
                                        //    '<td contenteditable="false" class="colDeleterei"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                                        ''
                                        ];

                                        splashArrayReisument.push(dataListAllowance);
                                      }

                                              let uniqueChars = [...new Set(splashArrayReisument)];
                                              var datatable = $('#tblReimbursements').DataTable();
                                              datatable.clear();
                                              datatable.rows.add(uniqueChars);
                                              datatable.draw(false);
                                              setTimeout(function () {
                                                $("#tblReimbursements").dataTable().fnPageChange('last');
                                              }, 400);

                                              LoadingOverlay.hide();


                                  }).catch(function (err) {
                                      LoadingOverlay.hide();
                                  });

                              });
                          setTimeout(function () {
                              MakeNegative();
                          }, 100);
                      },
                      "fnInitComplete": function () {
                        $("<button class='btn btn-primary btnAddNewReimbursements' data-dismiss='modal' data-toggle='modal' data-target='#newReimbursementModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblReimbursements_filter");
                        $("<button class='btn btn-primary btnRefreshReimbursements' type='button' id='btnRefreshReimbursements' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblReimbursements_filter");

                      }

                  }).on('page', function () {
                      setTimeout(function () {
                          MakeNegative();
                      }, 100);

                  }).on('column-reorder', function () {

                  }).on('length.dt', function (e, settings, len) {
                    //// $('.fullScreenSpin').css('display', 'inline-block');
                    let dataLenght = settings._iDisplayLength;
                    splashArrayCalenderList = [];
                    if (dataLenght == -1) {
                      LoadingOverlay.hide();

                    } else {
                        if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                            LoadingOverlay.hide();
                        } else {
                            sideBarService.getReimbursement(dataLenght, 0).then(function (dataNonBo) {

                                addVS1Data('TReimbursement', JSON.stringify(dataNonBo)).then(function (datareturn) {
                                    templateObject.resetData(dataNonBo);
                                    LoadingOverlay.hide();
                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });
                            }).catch(function (err) {
                                LoadingOverlay.hide();
                            });
                        }
                    }
                      setTimeout(function () {
                          MakeNegative();
                      }, 100);
                  });


              }, 0);

              $('div.dataTables_filter input').addClass('form-control form-control-sm');
              LoadingOverlay.hide();

            }
        }).catch(function(err) {
          sideBarService.getReimbursement(initialBaseDataLoad, 0).then(function (data) {
              addVS1Data('TReimbursement', JSON.stringify(data));
              let lineItems = [];
              let lineItemObj = {};
              for (let i = 0; i < data.treimbursement.length; i++) {

                var dataListAllowance = [
                    data.treimbursement[i].fields.ID || '',
                    data.treimbursement[i].fields.ReimbursementName || 0,
                    data.treimbursement[i].fields.ReimbursementAccount || 0,
                //    '<td contenteditable="false" class="colDeleterei"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                ''
                ];

                splashArrayReisument.push(dataListAllowance);
            }


              setTimeout(function () {
                  MakeNegative();
              }, 100);
              setTimeout(function () {
                  $('#tblReimbursements').DataTable({

                      data: splashArrayReisument,
                      "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                      columnDefs: [

                        {
                             className: "colReimbursementID hiddenColumn",
                             "targets": [0]
                           },
                           {
                              className: "colReimbursementName",
                              "targets": [1]
                           },
                           {
                              className: "colReimbursementAccount",
                              "targets": [2]
                           },
                           {
                              className: "colDeleterei",
                              "orderable": false,
                              "targets": -1
                           }
                      ],
                      select: true,
                      destroy: true,
                      colReorder: true,
                      pageLength: initialDatatableLoad,
                      lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                      info: true,
                      responsive: true,
                      "order": [[0, "asc"]],
                      action: function () {
                          $('#tblReimbursements').DataTable().ajax.reload();
                      },
                      "fnDrawCallback": function (oSettings) {
                          $('.paginate_button.page-item').removeClass('disabled');
                          $('#tblReimbursements_ellipsis').addClass('disabled');
                          if (oSettings._iDisplayLength == -1) {
                              if (oSettings.fnRecordsDisplay() > 150) {

                              }
                          } else {

                          }
                          if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                              $('.paginate_button.page-item.next').addClass('disabled');
                          }

                          $('.paginate_button.next:not(.disabled)', this.api().table().container())
                              .on('click', function () {
                                  // $('.fullScreenSpin').css('display', 'inline-block');
                                  var splashArrayReisumentDupp = new Array();
                                  let dataLenght = oSettings._iDisplayLength;
                                  let customerSearch = $('#tblReimbursements_filter input').val();

                                  sideBarService.getReimbursement(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (data) {

                                    for (let i = 0; i < data.treimbursement.length; i++) {

                                        var dataListAllowance = [
                                            data.treimbursement[i].fields.ID || '',
                                            data.treimbursement[i].fields.ReimbursementName || 0,
                                            data.treimbursement[i].fields.ReimbursementAccount || 0,
                                        //    '<td contenteditable="false" class="colDeleterei"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                                        ''
                                        ];

                                        splashArrayReisument.push(dataListAllowance);
                                    }

                                         let uniqueChars = [...new Set(splashArrayReisument)];
                                         var datatable = $('#tblReimbursements').DataTable();
                                              datatable.clear();
                                              datatable.rows.add(uniqueChars);
                                              datatable.draw(false);
                                              setTimeout(function () {
                                                $("#tblReimbursements").dataTable().fnPageChange('last');
                                              }, 400);

                                              LoadingOverlay.hide();


                                  }).catch(function (err) {
                                      LoadingOverlay.hide();
                                  });

                              });
                          setTimeout(function () {
                              MakeNegative();
                          }, 100);
                      },
                      "fnInitComplete": function () {
                        $("<button class='btn btn-primary btnAddNewReimbursements' data-dismiss='modal' data-toggle='modal' data-target='#newReimbursementModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblReimbursements_filter");
                        $("<button class='btn btn-primary btnRefreshReimbursements' type='button' id='btnRefreshReimbursements' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblReimbursements_filter");

                      }

                  }).on('page', function () {
                      setTimeout(function () {
                          MakeNegative();
                      }, 100);

                  }).on('column-reorder', function () {

                  }).on('length.dt', function (e, settings, len) {
                    //// $('.fullScreenSpin').css('display', 'inline-block');
                    let dataLenght = settings._iDisplayLength;
                    splashArrayReisument = [];
                    if (dataLenght == -1) {
                      LoadingOverlay.hide();

                    } else {
                        if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                            LoadingOverlay.hide();
                        } else {
                            sideBarService.getReimbursement(dataLenght, 0).then(function (dataNonBo) {

                                addVS1Data('TReimbursement', JSON.stringify(dataNonBo)).then(function (datareturn) {
                                    templateObject.resetData(dataNonBo);
                                    LoadingOverlay.hide();
                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });
                            }).catch(function (err) {
                                LoadingOverlay.hide();
                            });
                        }
                    }
                      setTimeout(function () {
                          MakeNegative();
                      }, 100);
                  });


              }, 0);

              $('div.dataTables_filter input').addClass('form-control form-control-sm');

              LoadingOverlay.hide();
          }).catch(function (err) {
            LoadingOverlay.hide();
          });
        });

    };

    templateObject.getSuperannuationData = function(){
        getVS1Data('Tsuperannuation').then(function(dataObject) {
            if (dataObject.length == 0) {
                 sideBarService.getSuperannuation(initialBaseDataLoad, 0).then(function (data) {
                  addVS1Data('Tsuperannuation', JSON.stringify(data));
                  let lineItems = [];
                  let lineItemObj = {};
                  for (let i = 0; i < data.tsuperannuation.length; i++) {

                    var dataListAllowance = [
                        data.tsuperannuation[i].fields.ID || '',
                        data.tsuperannuation[i].fields.Superfund || '',
                        data.tsuperannuation[i].fields.Area || '',
                        data.tsuperannuation[i].fields.Employeeid || '',
                        data.tsuperannuation[i].fields.ABN || '',
                        data.tsuperannuation[i].fields.ElectronicsServiceAddressAlias || '',
                        data.tsuperannuation[i].fields.BSB || '',
                        data.tsuperannuation[i].fields.Accountno || '',
                        data.tsuperannuation[i].fields.AccountName || '',
                        data.tsuperannuation[i].fields.Supertypeid || '',
                        // '<td contenteditable="false" class="colDeletesup"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                        ''
                     ];
                      splashArraySuperannuationList.push(dataListAllowance);
                  }

                  setTimeout(function () {
                      MakeNegative();
                  }, 100);
                  setTimeout(function () {
                      $('#tblSuperannuation').DataTable({

                          data: splashArraySuperannuationList,
                          "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                          columnDefs: [
                            {
                              className: "colSuperannuationID hiddenColumn",
                              "targets": [0]
                            },
                            {
                               className: "colSuperannuationName",
                               "targets": [1]
                            },
                            {
                               className: "colSuperannuationType",
                               "targets": [2]
                            },
                            {
                             className: "colEmployerNum",
                             "targets": [3]
                            },
                            {
                             className: "colabn",
                             "targets": [4]
                            },
                            {
                             className: "colservicealias",
                             "targets": [5]
                            },
                            {
                             className: "colbsb",
                             "targets": [6]
                            },
                            {
                             className: "colaccountnumber",
                             "targets": [7]
                            },
                            {
                             className: "colaccountname",
                             "targets": [8]
                            },
                            {
                                className: "colSuperannuationTypeid hiddenColumn",
                                "targets": [9]
                            },
                            {
                               className: "colDeletesup",
                               "orderable": false,
                               "targets": -1
                            }
                          ],
                          select: true,
                          destroy: true,
                          colReorder: true,
                          pageLength: initialDatatableLoad,
                          lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                          info: true,
                          responsive: true,
                          "order": [[0, "asc"]],
                          action: function () {
                              $('#tblSuperannuation').DataTable().ajax.reload();
                          },
                          "fnDrawCallback": function (oSettings) {
                              $('.paginate_button.page-item').removeClass('disabled');
                              $('#tblSuperannuation_ellipsis').addClass('disabled');
                              if (oSettings._iDisplayLength == -1) {
                                  if (oSettings.fnRecordsDisplay() > 150) {

                                  }
                              } else {

                              }
                              if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                  $('.paginate_button.page-item.next').addClass('disabled');
                              }

                              $('.paginate_button.next:not(.disabled)', this.api().table().container())
                                  .on('click', function () {
                                      // $('.fullScreenSpin').css('display', 'inline-block');
                                      var splashArraySuperannuationListDupp = new Array();
                                      let dataLenght = oSettings._iDisplayLength;
                                      let customerSearch = $('#tblLeave_filter input').val();

                                      sideBarService.getSuperannuation(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (data) {

                                        for (let i = 0; i < data.tsuperannuation.length; i++) {

                                            var dataListAllowance = [
                                                data.tsuperannuation[i].fields.ID || '',
                                                data.tsuperannuation[i].fields.Superfund || '',
                                                data.tsuperannuation[i].fields.Area || '',
                                                data.tsuperannuation[i].fields.Employeeid || '',
                                                data.tsuperannuation[i].fields.ABN || '',
                                                data.tsuperannuation[i].fields.ElectronicsServiceAddressAlias || '',
                                                data.tsuperannuation[i].fields.BSB || '',
                                                data.tsuperannuation[i].fields.Accountno || '',
                                                data.tsuperannuation[i].fields.AccountName || '',
                                                data.tsuperannuation[i].fields.Supertypeid || '',
                                                // '<td contenteditable="false" class="colDeletesup"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                                                ''
                                             ];

                                              splashArraySuperannuationList.push(dataListAllowance);
                                          }

                                                  let uniqueChars = [...new Set(splashArraySuperannuationList)];
                                                  var datatable = $('#tblSuperannuation').DataTable();
                                                  datatable.clear();
                                                  datatable.rows.add(uniqueChars);
                                                  datatable.draw(false);
                                                  setTimeout(function () {
                                                    $("#tblSuperannuation").dataTable().fnPageChange('last');
                                                  }, 400);

                                                  LoadingOverlay.hide();


                                      }).catch(function (err) {
                                          LoadingOverlay.hide();
                                      });

                                  });
                              setTimeout(function () {
                                  MakeNegative();
                              }, 100);
                            },
                            "fnInitComplete": function () {
                                $("<button class='btn btn-primary btnAddNewSuperannuation' data-dismiss='modal' data-toggle='modal' data-target='#newSuperannuationFundModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblSuperannuation_filter");
                                if(templateObject.data.viewConvertedButton == true){
                                    $("<button class='btn btn-primary btnViewConverted' type='button' id='btnViewConverted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;background-color: #1cc88a !important;border-color: #1cc88a!important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Converted</button>").insertAfter('#' + currenttablename + '_filter');
                                };
                                if(templateObject.data.hideConvertedButton == true){
                                    $("<button class='btn btn-danger btnHideConverted' type='button' id='btnHideConverted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;background-color: #f6c23e !important;border-color: #f6c23e!important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Converted</button>").insertAfter('#' + currenttablename + '_filter');
                                };
                                $("<button class='btn btn-primary btnRefreshSuperannuation' type='button' id='btnRefreshSuperannuation' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblSuperannuation_filter");

                          }

                      }).on('page', function () {
                          setTimeout(function () {
                              MakeNegative();
                          }, 100);

                      }).on('column-reorder', function () {

                      }).on('length.dt', function (e, settings, len) {
                        //// $('.fullScreenSpin').css('display', 'inline-block');
                        let dataLenght = settings._iDisplayLength;
                        splashArraySuperannuationList = [];
                        if (dataLenght == -1) {
                          LoadingOverlay.hide();

                        } else {
                            if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                                LoadingOverlay.hide();
                            } else {
                                sideBarService.getSuperannuation(dataLenght, 0).then(function (dataNonBo) {

                                    addVS1Data('Tsuperannuation', JSON.stringify(dataNonBo)).then(function (datareturn) {
                                        templateObject.resetData(dataNonBo);
                                        LoadingOverlay.hide();
                                    }).catch(function (err) {
                                        LoadingOverlay.hide();
                                    });
                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });
                            }
                        }
                          setTimeout(function () {
                              MakeNegative();
                          }, 100);
                      });


                  }, 0);

                  $('div.dataTables_filter input').addClass('form-control form-control-sm');

                  LoadingOverlay.hide();
              }).catch(function (err) {
                LoadingOverlay.hide();
              });
            }else{
              let data = JSON.parse(dataObject[0].data);
              let useData = data;
              let lineItems = [];
              let lineItemObj = {};
              for (let i = 0; i < data.tsuperannuation.length; i++) {

                var dataListAllowance = [
                    data.tsuperannuation[i].fields.ID || '',
                    data.tsuperannuation[i].fields.Superfund || '',
                    data.tsuperannuation[i].fields.Area || '',
                    data.tsuperannuation[i].fields.Employeeid || '',
                    data.tsuperannuation[i].fields.ABN || '',
                    data.tsuperannuation[i].fields.ElectronicsServiceAddressAlias || '',
                    data.tsuperannuation[i].fields.BSB || '',
                    data.tsuperannuation[i].fields.Accountno || '',
                    data.tsuperannuation[i].fields.AccountName || '',
                    data.tsuperannuation[i].fields.Supertypeid || '',
                    // '<td contenteditable="false" class="colDeletesup"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                    ''
                 ];

                  splashArraySuperannuationList.push(dataListAllowance);
              }

              setTimeout(function () {
                  MakeNegative();
              }, 100);
              setTimeout(function () {
                  $('#tblSuperannuation').DataTable({

                      data: splashArraySuperannuationList,
                      "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                      columnDefs: [

                        {
                          className: "colSuperannuationID hiddenColumn",
                          "targets": [0]
                        },
                        {
                           className: "colSuperannuationName",
                           "targets": [1]
                        },
                        {
                           className: "colSuperannuationType",
                           "targets": [2]
                        },
                        {
                         className: "colEmployerNum",
                         "targets": [3]
                        },
                        {
                         className: "colabn",
                         "targets": [4]
                        },
                        {
                         className: "colservicealias",
                         "targets": [5]
                        },
                        {
                         className: "colbsb",
                         "targets": [6]
                        },
                        {
                         className: "colaccountnumber",
                         "targets": [7]
                        },
                        {
                         className: "colaccountname",
                         "targets": [8]
                        },
                        {
                            className: "colSuperannuationTypeid hiddenColumn",
                            "targets": [9]
                         },

                        {
                           className: "colDeletesup",
                           "orderable": false,
                           "targets": -1
                        }
                      ],
                      select: true,
                      destroy: true,
                      colReorder: true,
                      pageLength: initialDatatableLoad,
                      lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                      info: true,
                      responsive: true,
                      "order": [[0, "asc"]],
                      action: function () {
                          $('#tblSuperannuation').DataTable().ajax.reload();
                      },
                      "fnDrawCallback": function (oSettings) {
                          $('.paginate_button.page-item').removeClass('disabled');
                          $('#tblSuperannuation_ellipsis').addClass('disabled');
                          if (oSettings._iDisplayLength == -1) {
                              if (oSettings.fnRecordsDisplay() > 150) {

                              }
                          } else {

                          }
                          if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                              $('.paginate_button.page-item.next').addClass('disabled');
                          }

                          $('.paginate_button.next:not(.disabled)', this.api().table().container())
                              .on('click', function () {
                                  // $('.fullScreenSpin').css('display', 'inline-block');
                                  var splashArraySuperannuationListDupp = new Array();
                                  let dataLenght = oSettings._iDisplayLength;
                                  let customerSearch = $('#tblSuperannuation_filter input').val();

                                  sideBarService.getSuperannuation(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (data) {

                                     for (let i = 0; i < data.tsuperannuation.length; i++) {

                                        var dataListAllowance = [
                                            data.tsuperannuation[i].fields.ID || '',
                                            data.tsuperannuation[i].fields.Superfund || '',
                                            data.tsuperannuation[i].fields.Area || '',
                                            data.tsuperannuation[i].fields.Employeeid || '',
                                            data.tsuperannuation[i].fields.ABN || '',
                                            data.tsuperannuation[i].fields.ElectronicsServiceAddressAlias || '',
                                            data.tsuperannuation[i].fields.BSB || '',
                                            data.tsuperannuation[i].fields.Accountno || '',
                                            data.tsuperannuation[i].fields.AccountName || '',
                                            data.tsuperannuation[i].fields.Supertypeid || '',
                                            // '<td contenteditable="false" class="colDeletesup"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                                            ''
                                         ];

                                          splashArraySuperannuationList.push(dataListAllowance);
                                      }

                                       let uniqueChars = [...new Set(splashArraySuperannuationList)];
                                       var datatable = $('#tblSuperannuation').DataTable();
                                       datatable.clear();
                                       datatable.rows.add(uniqueChars);
                                       datatable.draw(false);
                                       setTimeout(function () {
                                                $("#tblSuperannuation").dataTable().fnPageChange('last');
                                       }, 400);

                                       LoadingOverlay.hide();


                                  }).catch(function (err) {
                                      LoadingOverlay.hide();
                                  });

                              });
                          setTimeout(function () {
                              MakeNegative();
                          }, 100);
                      },
                      "fnInitComplete": function () {
                        $("<button class='btn btn-primary btnAddNewSuperannuation' data-dismiss='modal' data-toggle='modal' data-target='#newSuperannuationFundModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblSuperannuation_filter");
                        $("<button class='btn btn-primary btnRefreshSuperannuation' type='button' id='btnRefreshSuperannuation' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblSuperannuation_filter");

                      }

                  }).on('page', function () {
                      setTimeout(function () {
                          MakeNegative();
                      }, 100);

                  }).on('column-reorder', function () {

                  }).on('length.dt', function (e, settings, len) {
                    //// $('.fullScreenSpin').css('display', 'inline-block');
                    let dataLenght = settings._iDisplayLength;
                    splashArraySuperannuationList = [];
                    if (dataLenght == -1) {
                      LoadingOverlay.hide();

                    } else {
                        if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                            LoadingOverlay.hide();
                        } else {
                            sideBarService.getSuperannuation(dataLenght, 0).then(function (dataNonBo) {

                                addVS1Data('Tsuperannuation', JSON.stringify(dataNonBo)).then(function (datareturn) {
                                    templateObject.resetData(dataNonBo);
                                    LoadingOverlay.hide();
                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });
                            }).catch(function (err) {
                                LoadingOverlay.hide();
                            });
                        }
                    }
                      setTimeout(function () {
                          MakeNegative();
                      }, 100);
                  });


              }, 0);

              $('div.dataTables_filter input').addClass('form-control form-control-sm');
              LoadingOverlay.hide();

            }
        }).catch(function(err) {
              sideBarService.getSuperannuation(initialBaseDataLoad, 0).then(function (data) {
              addVS1Data('Tsuperannuation', JSON.stringify(data));
              let lineItems = [];
              let lineItemObj = {};


              for (let i = 0; i < data.tsuperannuation.length; i++) {

                var dataListAllowance = [
                    data.tsuperannuation[i].fields.ID || '',
                    data.tsuperannuation[i].fields.Superfund || '',
                    data.tsuperannuation[i].fields.Area || '',
                    data.tsuperannuation[i].fields.Employeeid || '',
                    data.tsuperannuation[i].fields.ABN || '',
                    data.tsuperannuation[i].fields.ElectronicsServiceAddressAlias || '',
                    data.tsuperannuation[i].fields.BSB || '',
                    data.tsuperannuation[i].fields.Accountno || '',
                    data.tsuperannuation[i].fields.AccountName || '',
                    data.tsuperannuation[i].fields.Supertypeid || '',
                    // '<td contenteditable="false" class="colDeletesup"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                 ];

                  splashArraySuperannuationList.push(dataListAllowance);
              }

              setTimeout(function () {
                  MakeNegative();
              }, 100);
              setTimeout(function () {
                  $('#tblSuperannuation').DataTable({

                      data: splashArraySuperannuationList,
                      "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                      columnDefs: [

                        {
                          className: "colSuperannuationID hiddenColumn",
                          "targets": [0]
                        },
                        {
                           className: "colSuperannuationName",
                           "targets": [1]
                        },
                        {
                           className: "colSuperannuationType",
                           "targets": [2]
                        },
                        {
                         className: "colEmployerNum",
                         "targets": [3]
                        },
                        {
                         className: "colabn",
                         "targets": [4]
                        },
                        {
                         className: "colservicealias",
                         "targets": [5]
                        },
                        {
                         className: "colbsb",
                         "targets": [6]
                        },
                        {
                         className: "colaccountnumber",
                         "targets": [7]
                        },
                        {
                         className: "colaccountname",
                         "targets": [8]
                        },

                        {
                            className: "colSuperannuationTypeid hiddenColumn",
                            "targets": [9]
                         },

                        {
                           className: "colDeletesup",
                           "orderable": false,
                           "targets": -1
                        }
                      ],
                      select: true,
                      destroy: true,
                      colReorder: true,
                      pageLength: initialDatatableLoad,
                      lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                      info: true,
                      responsive: true,
                      "order": [[0, "asc"]],
                      action: function () {
                          $('#tblSuperannuation').DataTable().ajax.reload();
                      },
                      "fnDrawCallback": function (oSettings) {
                          $('.paginate_button.page-item').removeClass('disabled');
                          $('#tblSuperannuation_ellipsis').addClass('disabled');
                          if (oSettings._iDisplayLength == -1) {
                              if (oSettings.fnRecordsDisplay() > 150) {

                              }
                          } else {

                          }
                          if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                              $('.paginate_button.page-item.next').addClass('disabled');
                          }

                          $('.paginate_button.next:not(.disabled)', this.api().table().container())
                              .on('click', function () {
                                  // $('.fullScreenSpin').css('display', 'inline-block');
                                  var splashArraySuperannuationListDupp = new Array();
                                  let dataLenght = oSettings._iDisplayLength;
                                  let customerSearch = $('#tblSuperannuation_filter input').val();

                                  sideBarService.getSuperannuation(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (data) {

                                    for (let i = 0; i < data.tsuperannuation.length; i++) {

                                        var dataListAllowance = [
                                            data.tsuperannuation[i].fields.ID || '',
                                            data.tsuperannuation[i].fields.Superfund || '',
                                            data.tsuperannuation[i].fields.Area || '',
                                            data.tsuperannuation[i].fields.Employeeid || '',
                                            data.tsuperannuation[i].fields.ABN || '',
                                            data.tsuperannuation[i].fields.ElectronicsServiceAddressAlias || '',
                                            data.tsuperannuation[i].fields.BSB || '',
                                            data.tsuperannuation[i].fields.Accountno || '',
                                            data.tsuperannuation[i].fields.AccountName || '',
                                            data.tsuperannuation[i].fields.Supertypeid || '',
                                            // '<td contenteditable="false" class="colDeletesup"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                                            ''
                                         ];

                                          splashArraySuperannuationList.push(dataListAllowance);
                                      }
                                         let uniqueChars = [...new Set(splashArraySuperannuationList)];
                                         var datatable = $('#tblSuperannuation').DataTable();
                                              datatable.clear();
                                              datatable.rows.add(uniqueChars);
                                              datatable.draw(false);
                                              setTimeout(function () {
                                                $("#tblSuperannuation").dataTable().fnPageChange('last');
                                              }, 400);

                                              LoadingOverlay.hide();


                                  }).catch(function (err) {
                                      LoadingOverlay.hide();
                                  });

                              });
                          setTimeout(function () {
                              MakeNegative();
                          }, 100);
                      },
                      "fnInitComplete": function () {
                        $("<button class='btn btn-primary btnAddNewSuperannuation' data-dismiss='modal' data-toggle='modal' data-target='#newSuperannuationFundModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblSuperannuation_filter");
                        $("<button class='btn btn-primary btnRefreshSuperannuation' type='button' id='btnRefreshSuperannuation' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblSuperannuation_filter");

                      }

                  }).on('page', function () {
                      setTimeout(function () {
                          MakeNegative();
                      }, 100);

                  }).on('column-reorder', function () {

                  }).on('length.dt', function (e, settings, len) {
                    //// $('.fullScreenSpin').css('display', 'inline-block');
                    let dataLenght = settings._iDisplayLength;
                    splashArraySuperannuationList = [];
                    if (dataLenght == -1) {
                      LoadingOverlay.hide();

                    } else {
                        if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                            LoadingOverlay.hide();
                        } else {
                            sideBarService.getSuperannuation(dataLenght, 0).then(function (dataNonBo) {

                                addVS1Data('Tsuperannuation', JSON.stringify(dataNonBo)).then(function (datareturn) {
                                    templateObject.resetData(dataNonBo);
                                    LoadingOverlay.hide();
                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });
                            }).catch(function (err) {
                                LoadingOverlay.hide();
                            });
                        }
                    }
                      setTimeout(function () {
                          MakeNegative();
                      }, 100);
                  });


              }, 0);

              $('div.dataTables_filter input').addClass('form-control form-control-sm');

              LoadingOverlay.hide();
          }).catch(function (err) {
            LoadingOverlay.hide();
          });
        });

    };

    templateObject.getOvertimes = async () => {
        let rateTypes = await templateObject.rateTypes.get();
        let overtimes =  await getOvertimes();
        // let data = await getVS1Data("TTOvertime");

        overtimes.forEach((overtime) => {
            overtime.rateType = rateTypes.find(rate => rate.ID == overtime.rateTypeId);
        });
        await templateObject.overtimes.set(overtimes);
        // await templateObject.setupOvertimeTable();
    }

    templateObject.saveOvertimes = async () => {
        LoadingOverlay.show();
        let overtimes = await templateObject.overtimes.get();

        try {
            await saveOvertimes(overtimes);
            LoadingOverlay.hide(0);

        } catch (e) {
            LoadingOverlay.hide(0);

            const result = await swal({
                title: `Overtimes couldn't be saved`,
                type: "error",
                showCancelButton: true,
                confirmButtonText: "Retry"
            });

            if (result.value) {
                templateObject.saveOvertimes();
            } else if (result.dismiss === "cancel") {}
        }
    }

    templateObject.loadDefaultOvertimes = async () => {
        let overtimes = PayrollSettingsOvertimes.getDefaults();
        await templateObject.overtimes.set(overtimes);
    }

    templateObject.addOverTime= async () => {
        if($('#newOvertimeModal').attr('overtime-id')) {
            const overtimeIdToupdate = $('#newOvertimeModal').attr('overtime-id');
            return templateObject.updateOvertime(overtimeIdToupdate);
        }
        $('#newOvertimeModal .modal-title').text('Add new Overtime');

        LoadingOverlay.show();

        const rateTypes = await templateObject.rateTypes.get();

        const hours = $('#overtimeHours').val();
        const rateType = rateTypes.find(rate => rate.ID == $('#overtimeRateType').attr('rate-type-id'));
        const hourlyMultiplier = $('#overtimeHourlyMultiplier').val();
        const weekEndDay = $('#OvertimeWeekEndDay').val();
        const rate = $('#rateList').val();

        const object = new PayrollSettingsOvertimes({
            hours: hours,
            rateTypeId: rateType.ID,
            rate: rate,
            hourlyMultiplier: hourlyMultiplier,
            // rate,
            rule: rate == "Weekend"? `${weekEndDay}` : `Greater than ${hours} hours`,
            day: rate == "Weekend" ? weekEndDay: null

        });
        // object.setRateType(rateType);


        // Add to the list of overtimes
        let overtimes = await templateObject.overtimes.get();
        overtimes.push(object);
        // This code has to be removed once we save on remote database
        overtimes = overtimes.map((overtime, index) => {
            return {
                id: index,
                ...overtime
            }
        });

        await templateObject.overtimes.set(overtimes);
        // await templateObject.setupOvertimeTable();
        await templateObject.resetOvertimeModal();

        $('#newOvertimeModal').modal('hide');
        LoadingOverlay.hide();

    }

    templateObject.updateOvertime = async (overtimeId = null) => {
        if(overtimeId != null) {
            // update the overtime
            let overtimes = await templateObject.overtimes.get();
            let rateTypes = await templateObject.rateTypes.get();

            overtimes = overtimes.map(overtime => {
                if(overtime.id == overtimeId) {
                    const hours = $('#overtimeHours').val();
                    const rateType = $('#overtimeRateType').val();
                    const rateTypeId =  $('#overtimeRateType').attr('rate-type-id');
                    const hourlyMultiplier = $('#overtimeHourlyMultiplier').val();
                    const weekEndDay = $('#OvertimeWeekEndDay').val();
                    const rate = $('#rateList').val();

                    const newOvertime = {
                        ...overtime,
                        hours: parseFloat(hours),
                        rateTypeId: parseInt(rateTypeId),
                        hourlyMultiplier: parseFloat(hourlyMultiplier),
                        rate,
                        rule: rate == "Weekend"? `${weekEndDay}` : `Greater than ${hours} hours`,
                        day: rate == "Weekend" ? weekEndDay: null

                    };

                    return newOvertime;
                }
                return overtime;
            });

            await templateObject.overtimes.set(overtimes);
            $('#newOvertimeModal').removeAttr('overtime-id');
            $('#newOvertimeModal').modal('hide');
            $('#newOvertimeModal .modal-title').text('Add new Overtime');
            return false;
        }

    }

    templateObject.openAddOvertimeEditor = async (overtimeId = null)  => {
        $('#newOvertimeModal').modal('show');
        $('#newOvertimeModal .modal-title').text('Add Overtime');
        $('#overtimeRateType').attr('rate-type-id', 1);
    }

    templateObject.openOvertimeEditor = async (overtimeId = null)  => {
        $('#newOvertimeModal').modal('show');
        $('#newOvertimeModal .modal-title').text('Edit Overtime');

        $('#newOvertimeModal').attr('overtime-id', overtimeId);
        let overtimes = await templateObject.overtimes.get();
        let overtime = overtimes.find(overtime => overtime.id == overtimeId);
        if(overtime.rate == "Weekend"){
            $('.weekendDiv').css('display', 'block');
            $('.greaterThanDiv').css('display', 'none');
            $('#OvertimeWeekEndDay').val(overtime.day);
        }else{
            $('#overtimeHours').val(overtime.hours);
        }
        $('#rateList').val(overtime.rate);
        let rateTypes = await templateObject.rateTypes.get();
        const rateType = rateTypes.find(rate => rate.ID == overtime.rateTypeId);
        $('#overtimeRateType').val(rateType.Description);
        $('#overtimeRateType').attr('rate-type-id', overtime.rateTypeId);
        $('#overtimeHourlyMultiplier').val(overtime.hourlyMultiplier);
    }

    templateObject.resetOvertimeModal = async () => {
        $('#overtimeHours').val('');
        $('#overtimeRateType').val('');
        $('#overtimeRateType').attr('rate-type-id', '');
        $('#overtimeHourlyMultiplier').val(0);
        $('#OvertimeWeekEndDay').val('');
    }

    templateObject.loadRateTypes = async (refresh = false) => {
        let rates  = await getRateTypes(refresh);
        if(rates) {
            // rates = rates.length > 0 ? rates.tpayratetype.map(rate => rate.fields) : [];
            await templateObject.rateTypes.set(rates);
        }

    //    setTimeout(() => {
    //         $("#tblratetypes").DataTable({
    //             destroy: true
    //         });
    //    }, 300);

    //   setTimeout(() => {
    //     $("#tblRateTypeList").DataTable({
    //         ...TableHandler.getDefaultTableConfiguration("tblRateTypeList"),
    //         fnInitComplete: function () {
    //             $("<button class='btn btn-primary btnAddRateType' data-dismiss='modal' data-toggle='modal' data-target='#addRateModel' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblratetypelist_filter");
    //             $("<button class='btn btn-primary btnRefreshRateType' type='button' id='btnRefreshRateType' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblratetypelist_filter");
    //         }
    //     });
    //     $("div.dataTables_filter input").addClass("form-control form-control-sm");
    //   }, 300)
    }

    templateObject.initData  = async (refresh = false) => {
        LoadingOverlay.show();
        await templateObject.loadDefaultOvertimes();

        await templateObject.getPayrollOrgainzations(refresh);
        // await templateObject.getAllAllowance(refresh);
        // await templateObject.getAllDeductions(refresh);
        // await templateObject.getCalenders(refresh);
        // await templateObject.getHolidayData(refresh);

        // await templateObject.geTEarnings(refresh);
        // await templateObject.loadEarnings(refresh);

        // await templateObject.getLeaveTypeData(refresh);
        // await templateObject.getunpaidleavedata(refresh);
        // await templateObject.getReimbursement(refresh);
        // await templateObject.getSuperannuationData(refresh);

        await templateObject.loadRateTypes(refresh);
        // await templateObject.getOvertimes(refresh);
        LoadingOverlay.hide();
    }

    templateObject.initData();


    $('#tblAlowances tbody').on('click', 'td:not(.colDeleteAllowances)', function () {
        var listData = $(this).closest('tr').attr('id');
        if (listData) {
            let allowanceType = $(this).closest('tr').find('.colAllowancesType').text()||'';
            let earningName = $(this).closest('tr').find('.colAlowancesNames').text()||'';
            let earningDisplayName = $(this).closest('tr').find('.colAllowancesDisplayName').text()||'';
            let earningAmount = $(this).closest('tr').find('.colAllowancesAmount').text()||'0.00';
            let earningExpenseAccount = $(this).closest('tr').find('.colAllowancesAccounts').text()||'';
            let earningExpenseAccountID = $(this).closest('tr').find('.colAllowancesAccountsID').text()||'';
            let exemptPAYG = $(this).closest('tr').find('.colAllowancesPAYG').text()||'false';
            let exemptSupernation = $(this).closest('tr').find('.colAllowancesSuperannuation').text()||'false';
            let exemptActivityStatement = $(this).closest('tr').find('.colAllowancesReportableasW1').text()||'false';
            let status = $(this).closest('tr').find('.colStatus').text();

            if(status != "") {
                $('.updateAlowanceActive').removeClass('d-none');
                $('.updateAlowanceActive').show();
                $('.updateAlowanceInActive').addClass('d-none');
                $('.updateAlowanceInActive').hide();
            } else {
                $('.updateAlowanceInActive').removeClass('d-none');
                $('.updateAlowanceInActive').show();
                $('.updateAlowanceActive').addClass('d-none');
                $('.updateAlowanceActive').hide();
            }

            $('.edtAllowanceID').val(listData);
            $('#edtAllowanceType').val(allowanceType);
            $('.edtEarningsNameAllowance').val(earningName);
            $('.edtDisplayNameAllowance').val(earningDisplayName);
            $('.edtAllowanceAmount').val(earningAmount);
            $('#edtExpenseAccountAllowance').val(earningExpenseAccount);

            $('#editbankaccount').val(earningExpenseAccount);
            $('#edtReimbursementAccount').val(earningExpenseAccount);
            $('#editpaygbankaccount').val(earningExpenseAccount);
            $('#editwagesexpbankaccount').val(earningExpenseAccount);
            $('#editwagespaybankaccount').val(earningExpenseAccount);
            $('#editsuperliabbankaccount').val(earningExpenseAccount);
            $('#editsuperexpbankaccount').val(earningExpenseAccount);

            $('#edtExpenseAccountDirectorsFees').val(earningExpenseAccount);
            $('#edtExpenseAccountTermnination').val(earningExpenseAccount);
            $('#edtExpenseAccount').val(earningExpenseAccount);
            $('#edtExpenseAccountOvertime').val(earningExpenseAccount);
            $('#edtExpenseAccountLumpSumE').val(earningExpenseAccount);
            $('#edtExpenseAccountBonusesCommissions').val(earningExpenseAccount);
            $('#edtExpenseAccountLumpSumW').val(earningExpenseAccount);
            $('.edtExpenseAccountID').val(earningExpenseAccountID);

            if(exemptPAYG == 'true'){
                $('#formCheck-ExemptPAYGAllowance').prop('checked', true);
            } else {
                $('#formCheck-ExemptPAYGAllowance').prop('checked', false);
            }

            if(exemptSupernation == 'true'){
                $('#formCheck-ExemptSuperannuationAllowance').prop('checked', true);
            } else {
                $('#formCheck-ExemptSuperannuationAllowance').prop('checked', false);
            }

            if(exemptActivityStatement == 'true'){
                $('#formCheck-ExemptReportableAllowance').prop('checked', true);
            } else {
                $('#formCheck-ExemptReportableAllowance').prop('checked', false);
            }

            $('#allowanceModal').modal('toggle');
        }
    });

    $('#tblDeductions tbody').on( 'click', 'td:not(.colDeleteDeductions)', function () {
        var listData = $(this).closest('tr').attr('id');
        if(listData){
            let deductionType = $(this).closest('tr').find('.colDeductionsType').text()||'';
            let deductionName = $(this).closest('tr').find('.colDeductionsNames').text()||'';
            let deductionDisplayName = $(this).closest('tr').find('.colDeductionsDisplayName').text()||'';
            let deductionAmount = $(this).closest('tr').find('.colDeductionsAmount').text()||'0.00';
            let deductionAccount = $(this).closest('tr').find('.colDeductionsAccounts').text()||'';
            let deductionAccountID = $(this).closest('tr').find('.colDeductionsAccountsID').text()||'';
            let deductionexemptPAYG = $(this).closest('tr').find('.colDeductionsPAYG').text()||'false';
            let deductionexemptSupernation = $(this).closest('tr').find('.colDeductionsSuperannuation').text()||'false';
            let deductionexemptActivityStatement = $(this).closest('tr').find('.colDeductionsReportableasW1').text()||'false';
            let status = $(this).closest('tr').find('.colStatus').text();

            if(status != "") {
                $('.updateDeductionActive').removeClass('d-none');
                $('.updateDeductionActive').show();
                $('.updateDeductionInActive').addClass('d-none');
                $('.updateDeductionInActive').hide();
            } else {
                $('.updateDeductionInActive').removeClass('d-none');
                $('.updateDeductionInActive').show();
                $('.updateDeductionActive').addClass('d-none');
                $('.updateDeductionActive').hide();
            }

            $('#edtDeductionID').val(listData);
            $('.edtDeductionName').val(deductionName);
            $("#edtDeductionType").val(deductionType);
            $('.edtDeductionAmount').val(deductionAmount);
            $('#edtDeductionAccount').val(deductionAccount);
            $('#edtDeductionAccountID').val(deductionAccountID);

            if(deductionType == 'None'){
                $('#noneLabels').html('Edit Deduction');
                $('#edtDeductionTitle').val('None');
            }

            if(deductionType == 'Workplace Giving'){
                $('#noneLabels').html('Edit Deduction');
                $('#edtDeductionTitle').val('WorkplaceGiving');
            }

            if(deductionType == 'Union / Association Fees'){
                $('#noneLabels').html('Edit Deduction');
                $('#edtDeductionTitle').val('UnionAssociationFees');
            }

            if(deductionexemptPAYG === "true") {
                $('#formCheck-ReducesPAYGDeduction').prop('checked', true);
            }

            if(deductionexemptSupernation === "true") {
                $('#formCheck-ReducesSuperannuationDeduction').prop('checked', true);
            }

            if(deductionexemptActivityStatement === "true") {
                $('#formCheck-ExcludedDeduction').prop('checked', true);
            }

            $('#deductionModal').modal('toggle');
        }
    });


    $(document).on('click', '.colDeleteAllowances', function() {
        event.stopPropagation();
        var targetID = $(event.target).closest('tr').find('.colAlowancesID').text()||0; // table row ID
        $('#selectDeleteLineID').val(targetID);
        $('#deleteAllowanceLineModal').modal('toggle');
    });
    // $(document).on('change', '#overtimeRateType', function(e) {
    //     let evalue = $('#overtimeRateType').val();

    //     switch(evalue) {
    //         case 'Time & Half':
    //             $('.greaterThanDiv').css('display', 'block');
    //             $('.weekendDiv').css('display', 'none');
    //         break;
    //         case 'Double Time':
    //             $('.greaterThanDiv').css('display', 'block');
    //             $('.weekendDiv').css('display', 'none');
    //         break;
    //         case 'Weekend':
    //             $('.weekendDiv').css('display', 'block');
    //             $('.greaterThanDiv').css('display', 'none');
    //         break;
    //         default:
    //             $('.greaterThanDiv').css('display', 'block');
    //             $('.weekendDiv').css('display', 'none');
    //     }
    // });


    $(document).on('click', '.colRemove', function(event) {
        event.stopPropagation();
        let targetId = $(event.target).closest('tr').find('.colCalenderID').text() || 0;
        
        $('#selectColDeleteLineID').val(targetId);
        $('#selectCalenderName').val(targetId);
        $('#deleteCalenderLineModal').modal('toggle');
    });

    $(document).on('click', '.colActive', function (event) {
        event.stopPropagation();
        LoadingOverlay.show();
        let targetId = $(event.target).closest('tr').find('.colCalenderID').text() || 0;
        let payperiod = $(event.target).closest('tr').find('.colPayPeriod').text() || 0;
        let calender_name = $(event.target).closest('tr').find('.colPayCalendarName').text() || 0;
        let startdate = $(event.target).closest('tr').find('.colNextPayPeriod').text() || 0;
        let FirstPaymentDate = $(event.target).closest('tr').find('.colNextPaymentDate').text() || 0;

        objDetails = {
            type: "TPayrollCalendars",
            fields: {
                ID: parseInt(targetId),
                PayrollCalendarPayPeriod: payperiod,
                PayrollCalendarName: calender_name,
                PayrollCalendarStartDate: moment(startdate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                PayrollCalendarFirstPaymentDate: moment(FirstPaymentDate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                PayrollCalendarActive : true,
            }
        };

        taxRateService.saveCalender(objDetails).then(function (objDetails) {
            LoadingOverlay.hide();
            swal({
                title: 'Success',
                text: 'Pay Calendar Active successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'

            }).then((result) => {
                if (result.value) {
                    sideBarService.getCalender(initialBaseDataLoad, 0).then(function (dataReload) {
                        addVS1Data("TPayrollCalendars", JSON.stringify(dataReload)).then(function (datareturn) {
                            $('#closemodel').trigger('click');
                            LoadingOverlay.show();
                             window.open('/payrollrules?active_key=calender','_self');
                        }).catch(function (err) {
                            $('#closemodel').trigger('click');
                            LoadingOverlay.show();

                            window.open('/payrollrules?active_key=calender','_self');
                        });
                      }).catch(function (err) {
                          $('#closemodel').trigger('click');
                          LoadingOverlay.show();

                          window.open('/payrollrules?active_key=calender','_self');
                      });
                }else if (result.dismiss === 'cancel') {

                }
            });

        }).catch(function (err) {

            LoadingOverlay.hide();
            swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'ok'
                }).then((result) => {
                if (result.value) {
                } else if (result.dismiss === 'cancel') {
                }
            });


        });
    });
    
    $(document).on('click', '.colIn-Active', function (event) {

        event.stopPropagation();
        LoadingOverlay.show();
        let targetId = $(event.target).closest('tr').find('.colCalenderID').text() || 0;
        let payperiod = $(event.target).closest('tr').find('.colPayPeriod').text() || 0;
        let calender_name = $(event.target).closest('tr').find('.colPayCalendarName').text() || 0;
        let startdate = $(event.target).closest('tr').find('.colNextPayPeriod').text() || 0;
        let FirstPaymentDate = $(event.target).closest('tr').find('.colNextPaymentDate').text() || 0;

        objDetails = {
            type: "TPayrollCalendars",
            fields: {
                ID: parseInt(targetId),
                PayrollCalendarPayPeriod: payperiod,
                PayrollCalendarName: calender_name,
                PayrollCalendarStartDate: moment(startdate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                PayrollCalendarFirstPaymentDate: moment(FirstPaymentDate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                PayrollCalendarActive : false,
            }
        };

        taxRateService.saveCalender(objDetails).then(function (objDetails) {
            LoadingOverlay.hide();
            swal({
                title: 'Success',
                text: 'Pay Calendar In Active successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'

            }).then((result) => {
                if (result.value) {
                    sideBarService.getCalender(initialBaseDataLoad, 0).then(function (dataReload) {
                        addVS1Data("TPayrollCalendars", JSON.stringify(dataReload)).then(function (datareturn) {
                            $('#closemodel').trigger('click');
                            LoadingOverlay.show();
                             window.open('/payrollrules?active_key=calender','_self');
                        }).catch(function (err) {
                            $('#closemodel').trigger('click');
                            LoadingOverlay.show();

                            window.open('/payrollrules?active_key=calender','_self');
                        });
                      }).catch(function (err) {
                          $('#closemodel').trigger('click');
                          LoadingOverlay.show();

                          window.open('/payrollrules?active_key=calender','_self');
                      });
                }else if (result.dismiss === 'cancel') {

                }
            });

        }).catch(function (err) {

            LoadingOverlay.hide();
            swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'ok'
                }).then((result) => {
                if (result.value) {
                } else if (result.dismiss === 'cancel') {
                }
            });


        });
    });

    $(document).on('click', '.colDeleteDeductions', function() {
        event.stopPropagation();
        var listData = $(this).closest('tr').find('.colDeductionsID').text();
        var targetID = $(event.target).closest('tr').find('.colDeleteDeductions').text()||0; // table row ID
        var listData = $(this).closest('tr').find('.colDeductionsID').text();
        let deductionType = $(this).closest('tr').find('.colDeductionsType').text()||'';
        let deductionName = $(this).closest('tr').find('.colDeductionsNames').text()||'';
        let deductionDisplayName = $(this).closest('tr').find('.colDeductionsDisplayName').text()||'';
        let deductionAmount = $(this).closest('tr').find('.colDeductionsAmount').text()||'0.00';
        let deductionAccount = $(this).closest('tr').find('.colDeductionsAccounts').text()||'';
        let deductionAccountID = $(this).closest('tr').find('.colDeductionsAccountsID').text()||'';
        let deductionexemptPAYG = $(this).closest('tr').find('.colDeductionsPAYG').text()||'false';
        let deductionexemptSupernation = $(this).closest('tr').find('.colDeductionsSuperannuation').text()||'false';
        let deductionexemptActivityStatement = $(this).closest('tr').find('.colDeductionsReportableasW1').text()||'false';

        $('#selectDeleteLineID').val(listData);
        $('#selectAccountid').val(deductionAccountID);
        $('#selectAccountname').val(deductionAccount);
        $('#selectdeductionAmount').val(deductionAmount);
        $('#selectideductionName').val(deductionName);
        $('#selectdisplayName').val(deductionDisplayName);
        $('#deleteDeductionLineModal').modal('toggle');
    });

    $(document).on('click', '.colDeleterei', function() {
        event.stopPropagation();

        var targetID = $(event.target).closest('tr').find('.colReimbursementID').text()||0; // table row ID

        $('#seleclReiName').val(targetID);
        $('#selectColReiDeleteLineID').val(targetID);

        $('#deletebReiumbursementLineModal').modal('toggle');
    });

    $(document).on('click', '.colDeletepaidrem', function() {
        event.stopPropagation();

        var targetID = $(event.target).closest('tr').find('.colLeaveID').text()||0; // table row ID
        var Type = $(event.target).closest('tr').find('.colLeavePaidLeave').text() || '';

        $('#selectLeaveName').val(targetID);
        $('#selectLeaveDeleteLineID').val(targetID);

        if(Type == 'paid')
        {
             $('#leave_type').val('paid');
        }
        else{
            $('#leave_type').val('unpaid');
        }
        $('#deleteLeaveLineModal').modal('toggle');
    });

    $(document).on('click', '.colDeletesup', function() {
        event.stopPropagation();

        var targetID = $(event.target).closest('tr').find('.colSuperannuationID').text()||0; // table row ID
        var Name = $(event.target).closest('tr').find('.colSuperannuationName').text()||0;

        $('#selectSuperannuationDeleteLineID').val(targetID);
        $('#selectSuperannuationName').val(targetID);

        $('#deleteSuperannuationLineModal').modal('toggle');
    });



    $(document).on('click', '.colHolidayDelete', function() {
        event.stopPropagation();

        var targetID = $(event.target).closest('tr').find('.colHolidayID').text()||0; // table row ID
        var Name = $(event.target).closest('tr').find('.colPayCalendarName').text()||0;

        $('#selectholidayDeleteLineID').val(targetID);
        $('#selectholidayName').val(targetID);

        $('#deleteHolidayLineModal').modal('toggle');

    });

    $(document).on('click', '.colDeleteEarnings', function() {

        event.stopPropagation();

        var targetID = $(event.target).closest('tr').find('.colEarningsID').text()||0; // table row ID
        var Name = $(event.target).closest('tr').find('.colEarningsNames').text()||0;
        var type = $(event.target).closest('tr').find('.colEarningsType').text()|| '';
        let earningtype = '';

        if(type === 'Ordinary Time Earning')
        {
            earningtype = 'Ordinary Time Earning';
        }
        else if(type === 'OverTime Earning')
        {
            earningtype = 'OverTime Earning';
        }
        else if(type === 'Employee Termnination')
        {
            earningtype = 'Employee Termnination';
        }
        else if(type === 'Lump Sum E Earning')
        {
            earningtype = 'Lump Sum E Earning';
        }
        else if(type === 'Bonuese Commission')
        {
            earningtype = 'Bonuese Commission';
        }
        else if(type === 'Lump Sumw')
        {
            earningtype = 'Lump Sumw';
        }
        else
        {
            earningtype = 'Directors fees';
        }


        $('#selectDeleteLineID').val(targetID);
        $('#earningdeletename').val(targetID);
        $('#earningdeletetype').val(earningtype);
        $('#deleteEarningsLineModal').modal('toggle');

    });

    $(function() {

      $('#edtAllowanceType').editableSelect();
      $('#edtAllowanceType').editableSelect('add','Car');
      $('#edtAllowanceType').editableSelect('add','JobKeeper');
      $('#edtAllowanceType').editableSelect('add','Laundry');
      $('#edtAllowanceType').editableSelect('add','Meals');
      $('#edtAllowanceType').editableSelect('add','Qualifications');
      $('#edtAllowanceType').editableSelect('add','Tasks');
      $('#edtAllowanceType').editableSelect('add','Tools');
      $('#edtAllowanceType').editableSelect('add','Transport');
      $('#edtAllowanceType').editableSelect('add','Travel');
      $('#edtAllowanceType').editableSelect('add','Other');

      $('#employegroup').editableSelect('add','None');
      $('#employegroup').editableSelect('add','Region');
      $('#timesheetcat').editableSelect('add','None');
      $('#timesheetcat').editableSelect('add','Region');

      $('#edtDeductionType').editableSelect('add','None');
      $('#edtDeductionType').editableSelect('add','Workplace Giving');
      $('#edtDeductionType').editableSelect('add','Union / Association Fees');

      $('#edtEarningType').editableSelect('add','Ordinary Time Earnings');
      $('#edtEarningType').editableSelect('add','Overtime Earnings');
      $('#edtEarningType').editableSelect('add','Employment Termnination Payments');
      $('#edtEarningType').editableSelect('add','Lump Sum E');
      $('#edtEarningType').editableSelect('add','Bonuses & Commissions');
      $('#edtEarningType').editableSelect('add','Lump Sum W');
      $('#edtEarningType').editableSelect('add','Directors Fees');

      $('#edtLeaveType').editableSelect('add','Paid Leave');
      $('#edtLeaveType').editableSelect('add','Unpaid Leave');

      $('#payperiod').editableSelect('add', 'How often will you pay your employees?');
      $('#payperiod').editableSelect('add', 'Weekly');
      $('#payperiod').editableSelect('add', 'Fortnightly');
      $('#payperiod').editableSelect('add', 'Twice Monthly');
      $('#payperiod').editableSelect('add', 'Four Weekly');
      $('#payperiod').editableSelect('add', 'Monthly');
      $('#payperiod').editableSelect('add', 'Quarterly');

      $('#edtTypeOfUnits').editableSelect('add','Hours');
      $('#edtTypeOfUnits').editableSelect('add','Days');
      $('#edtTypeOfUnits').editableSelect('add','Weeks');
      $('#edtTypeOfUnits').editableSelect('add','Monthly');
      $('#edtUnpaidTypeOfUnits').editableSelect('add','Hours');
      $('#edtUnpaidTypeOfUnits').editableSelect('add','Days');
      $('#edtUnpaidTypeOfUnits').editableSelect('add','Weeks');
      $('#edtUnpaidTypeOfUnits').editableSelect('add','Monthly');
      $('#edtExpenseAccountAllowance').editableSelect();
      $('#editbankaccount').editableSelect();
      $('#editpaygbankaccount').editableSelect();
      $('#edtReimbursementAccount').editableSelect();
      $('#editwagesexpbankaccount').editableSelect();
      $('#editwagespaybankaccount').editableSelect();
      $('#editsuperliabbankaccount').editableSelect();
      $('#editsuperexpbankaccount').editableSelect();
      $('#edtExpenseAccountDirectorsFees').editableSelect();
      $('#edtExpenseAccountTermnination').editableSelect();
      $('#edtExpenseAccount').editableSelect();
      $('#edtExpenseAccountOvertime').editableSelect();
      $('#edtExpenseAccountLumpSumE').editableSelect();
      $('#edtExpenseAccountBonusesCommissions').editableSelect();
      $('#edtExpenseAccountLumpSumW').editableSelect();
      $('#edtDeductionAccount').editableSelect();
      $('#edtRateTypeOvertime').editableSelect();
      $('#edtRateType').editableSelect();
      $('#edtRateTypeTermnination').editableSelect();
      $('#edtRateTypeLumpSumE').editableSelect();
      $('#edtRateTypeBonusesCommissions').editableSelect();
      $('#edtRateTypeDirectorsFees').editableSelect();
      $('#edtRateTypeLumpSumW').editableSelect();
      $('#edtFundType').editableSelect();
      $('#holidaygroup').editableSelect();
      $('#holidaygroup2').editableSelect();
      $('#addexistgroup').editableSelect();
      $('#rateList').editableSelect();
      $('#overtimeRateType').editableSelect();

      $('#payperiod').on('change', function () {
        if($(this).val() != '' && $(this).val() != 'How often will you pay your employees?') {
            $('.calender_name').val($(this).val());
            $('.body-panel').removeClass('d-none');
        }
      });

      $('#edtFirstPaymentDate').on('change', function () {
        var startDate = $('#edtStartDate').val();
        if(startDate > $(this).val()) {
            $(this).val(startDate);
        }
        if(startDate != "" && $('#payperiod').val() != "") {
            $('.footer-label').html("<p>Your pay calendar will run <strong>" + $('#payperiod').val() + "</strong>. It will start on <strong>" + startDate + "</strong> and employees will be paid on <strong>" + $(this).val() + "</strong></p>");
        }
      });

      $('#edtStartDate').on('change', function () {
        var firstPayDate = $('#edtFirstPaymentDate').val();
        if(firstPayDate != "" && $('#payperiod').val() != "") {
            $('.footer-label').html("<p>Your pay calendar will run <strong>" + $('#payperiod').val() + "</strong>. It will start on <strong>" + $(this).val() + "</strong> and employees will be paid on <strong>" + firstPayDate + "</strong></p>");
        }
      });

      $('#editbankaccount').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();
            var $earch = $(this);
            var offset = $earch.offset();
            let accountService = new AccountService();
            const accountTypeList = [];
            var accountDataName = e.target.value ||'';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#selectLineID').val('editbankaccount');
                $('#accountListModal').modal("toggle");
                setTimeout(function () {
                    $('#tblAccount_filter .form-control-sm').focus();
                    $('#tblAccount_filter .form-control-sm').val('BANK');
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblAccountlist').DataTable();
                    datatable.draw();
                    $('#tblAccountlist_filter .form-control-sm').trigger("input");
                }, 500);
            } else {
                $('#selectLineID').val('editbankaccount');
                $('#accountListModal').modal('toggle');
                setTimeout(function () {
                    $('#tblAccount_filter .form-control-sm').focus();
                    $('#tblAccount_filter .form-control-sm').val('BANK');
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                        var datatable = $('#tblSupplierlist').DataTable();
                        datatable.draw();
                        $('#tblAccount_filter .form-control-sm').trigger("input");
                    }, 500);
                // }
            }
        });

        $('#editpaygbankaccount').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();
            var $earch = $(this);
            var offset = $earch.offset();
            let accountService = new AccountService();
            const accountTypeList = [];
            var accountDataName = e.target.value ||'';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#selectLineID').val('editpaygbankaccount');
                $('#accountListModal').modal("toggle");
                setTimeout(function () {
                    $('#tblAccount_filter .form-control-sm').focus();
                    $('#tblAccount_filter .form-control-sm').val('LTLIAB');
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblAccountlist').DataTable();
                    datatable.draw();
                    $('#tblAccountlist_filter .form-control-sm').trigger("input");
                }, 500);
            }else{
                $('#selectLineID').val('editpaygbankaccount');
                $('#accountListModal').modal('toggle');
                setTimeout(function () {
                $('#tblAccount_filter .form-control-sm').focus();
                $('#tblAccount_filter .form-control-sm').val('LTLIAB');
                $('#tblAccount_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblSupplierlist').DataTable();
                    datatable.draw();
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                }, 500);
            // }
            }
        });

        $('#edtReimbursementAccount').editableSelect().on('click.editable-select', function (e, li) {
            $('#selectLineID').val('edtReimbursementAccount');
            $('#accountListModal').modal('toggle');
        });

        $('#btnNewGroup').on('click', function () {
            $('#newGroupModal').modal('toggle');
        });

        $('#editwagesexpbankaccount').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();
            var $earch = $(this);
            var offset = $earch.offset();
            let accountService = new AccountService();
            const accountTypeList = [];
            var accountDataName = e.target.value ||'';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#selectLineID').val('editwagesexpbankaccount');
            $('#accountListModal').modal('toggle');
            setTimeout(function () {
                $('#tblAccount_filter .form-control-sm').focus();
                $('#tblAccount_filter .form-control-sm').val('EXP');
                $('#tblAccount_filter .form-control-sm').trigger("input");
                var datatable = $('#tblAccountlist').DataTable();
                datatable.draw();
                $('#tblAccountlist_filter .form-control-sm').trigger("input");
            }, 500);
            }else{
                $('#selectLineID').val('editwagesexpbankaccount');
                $('#accountListModal').modal('toggle');
                setTimeout(function () {
                    $('#tblAccount_filter .form-control-sm').focus();
                    $('#tblAccount_filter .form-control-sm').val('EXP');
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblSupplierlist').DataTable();
                    datatable.draw();
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                }, 500);
            }
        });

        $('#editwagespaybankaccount').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();
            var $earch = $(this);
            var offset = $earch.offset();
            let accountService = new AccountService();
            const accountTypeList = [];
            var accountDataName = e.target.value ||'';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#selectLineID').val('editwagespaybankaccount');
                $('#accountListModal').modal('toggle');
                setTimeout(function () {
                    $('#tblAccount_filter .form-control-sm').focus();
                    $('#tblAccount_filter .form-control-sm').val('AP');
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblAccountlist').DataTable();
                    datatable.draw();
                    $('#tblAccountlist_filter .form-control-sm').trigger("input");
                }, 500);
            }else{
                $('#selectLineID').val('editwagespaybankaccount');
                $('#accountListModal').modal('toggle');
                setTimeout(function () {
                    $('#tblAccount_filter .form-control-sm').focus();
                    $('#tblAccount_filter .form-control-sm').val('AP');
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblSupplierlist').DataTable();
                    datatable.draw();
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                }, 500);
            }
        });

        $('#editsuperliabbankaccount').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();
            var $earch = $(this);
            var offset = $earch.offset();
            let accountService = new AccountService();
            const accountTypeList = [];
            var accountDataName = e.target.value ||'';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#selectLineID').val('editsuperliabbankaccount');
            $('#accountListModal').modal('toggle');
            setTimeout(function () {
                $('#tblAccount_filter .form-control-sm').focus();
                $('#tblAccount_filter .form-control-sm').val('OCLIAB');
                $('#tblAccount_filter .form-control-sm').trigger("input");
                var datatable = $('#tblAccountlist').DataTable();
                datatable.draw();
                $('#tblAccountlist_filter .form-control-sm').trigger("input");
            }, 500);
            }else{
                $('#selectLineID').val('editsuperliabbankaccount');
                $('#accountListModal').modal('toggle');
                setTimeout(function () {
                    $('#tblAccount_filter .form-control-sm').focus();
                    $('#tblAccount_filter .form-control-sm').val('OCLIAB');
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblSupplierlist').DataTable();
                    datatable.draw();
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                }, 500);
            }
        });

        $('#editsuperexpbankaccount').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();
            var $earch = $(this);
            var offset = $earch.offset();
            let accountService = new AccountService();
            const accountTypeList = [];
            var accountDataName = e.target.value ||'';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#selectLineID').val('editsuperexpbankaccount');
                $('#accountListModal').modal("toggle");
                setTimeout(function () {
                    $('#tblAccount_filter .form-control-sm').focus();
                    $('#tblAccount_filter .form-control-sm').val('EXP');
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblAccountlist').DataTable();
                    datatable.draw();
                    $('#tblAccountlist_filter .form-control-sm').trigger("input");
                }, 500);
            }else{
                $('#selectLineID').val('editsuperexpbankaccount');
                $('#accountListModal').modal('toggle');
                setTimeout(function () {
                    $('#tblAccount_filter .form-control-sm').focus();
                    $('#tblAccount_filter .form-control-sm').val('EXP');
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblSupplierlist').DataTable();
                    datatable.draw();
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                }, 500);
            }
        });

        $('#edtExpenseAccountAllowance').editableSelect().on('click.editable-select', function (e, li) {
            $('#selectLineID').val('edtExpenseAccountAllowance');
            $('#accountListModal').modal("toggle");
        });

        $('#edtExpenseAccountDirectorsFees').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();
            var $earch = $(this);
            var offset = $earch.offset();
            let accountService = new AccountService();
            const accountTypeList = [];
            var accountDataName = e.target.value ||'';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#selectLineID').val('edtExpenseAccountDirectorsFees');
                $('#accountListModal').modal('toggle');
            setTimeout(function () {
                $('#tblAccount_filter .form-control-sm').focus();
                $('#tblAccount_filter .form-control-sm').val('EXP');
                $('#tblAccount_filter .form-control-sm').trigger("input");
                var datatable = $('#tblAccountlist').DataTable();
                datatable.draw();
                $('#tblAccountlist_filter .form-control-sm').trigger("input");
            }, 500);
            }else{
                $('#selectLineID').val('edtExpenseAccountDirectorsFees');
                $('#accountListModal').modal('toggle');
                setTimeout(function () {
                    $('#tblAccount_filter .form-control-sm').focus();
                    $('#tblAccount_filter .form-control-sm').val('EXP');
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblSupplierlist').DataTable();
                    datatable.draw();
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                }, 500);
            }
        });

        $('#edtExpenseAccountTermnination').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();
            var $earch = $(this);
            var offset = $earch.offset();
            let accountService = new AccountService();
            const accountTypeList = [];
            var accountDataName = e.target.value ||'';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#selectLineID').val('edtExpenseAccountTermnination');
                $('#accountListModal').modal('toggle');
            setTimeout(function () {
                $('#tblAccount_filter .form-control-sm').focus();
                $('#tblAccount_filter .form-control-sm').val('EXP');
                $('#tblAccount_filter .form-control-sm').trigger("input");
                var datatable = $('#tblAccountlist').DataTable();
                datatable.draw();
                $('#tblAccountlist_filter .form-control-sm').trigger("input");
            }, 500);
            }else{
                $('#selectLineID').val('edtExpenseAccountTermnination');
                $('#accountListModal').modal('toggle');
                setTimeout(function () {
                $('#tblAccount_filter .form-control-sm').focus();
                $('#tblAccount_filter .form-control-sm').val('EXP');
                $('#tblAccount_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblSupplierlist').DataTable();
                    datatable.draw();
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                }, 500);
            }
        });

        $('#edtExpenseAccount').editableSelect().on('click.editable-select', function (e, li) {
            var $earch = $(this);
            var offset = $earch.offset();

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#selectLineID').val('edtExpenseAccount');
            $('#accountListModal').modal('toggle');
            setTimeout(function () {
                $('#tblAccount_filter .form-control-sm').focus();
                $('#tblAccount_filter .form-control-sm').val('EXP');
                $('#tblAccount_filter .form-control-sm').trigger("input");
                var datatable = $('#tblAccountlist').DataTable();
                datatable.draw();
            }, 500);
            }else{
                $('#selectLineID').val('edtExpenseAccount');
                $('#accountListModal').modal('toggle');
                setTimeout(function () {
                    $('#tblAccount_filter .form-control-sm').focus();
                    $('#tblAccount_filter .form-control-sm').val('EXP');
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblSupplierlist').DataTable();
                    datatable.draw();
                }, 500);
            }
        });

        $('#edtExpenseAccountOvertime').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();
            var $earch = $(this);
            var offset = $earch.offset();
            let accountService = new AccountService();
            const accountTypeList = [];
            var accountDataName = e.target.value ||'';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#selectLineID').val('edtExpenseAccountOvertime');
            $('#accountListModal').modal('toggle');
            setTimeout(function () {
                $('#tblAccount_filter .form-control-sm').focus();
                $('#tblAccount_filter .form-control-sm').val('EXP');
                $('#tblAccount_filter .form-control-sm').trigger("input");
                var datatable = $('#tblAccountlist').DataTable();
                datatable.draw();
                $('#tblAccountlist_filter .form-control-sm').trigger("input");
            }, 500);
            }else{
            if(accountDataName.replace(/\s/g, '') != ''){
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
                        }else if ((accounttype === "CCARD")) {
                            $('.isCreditAccount').removeClass('isNotCreditAccount');
                            $('.isBankAccount').addClass('isNotBankAccount');
                        } else {
                            $('.isBankAccount').addClass('isNotBankAccount');
                            $('.isCreditAccount').addClass('isNotCreditAccount');
                        }

                        $('#edtAccountID').val(accountid);
                        $('#sltAccountType').val(accounttype);
                        $('#sltAccountType').append('<option value="'+accounttype+'" selected="selected">'+accounttype+'</option>');
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

                        if(showTrans == 'true'){
                            $('.showOnTransactions').prop('checked', true);
                        }else{
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
                        var added=false;
                        let lineItems = [];
                        let lineItemObj = {};
                        let fullAccountTypeName = '';
                        let accBalance = '';
                        $('#add-account-title').text('Edit Account Details');
                        $('#edtAccountName').attr('readonly', true);
                        $('#sltAccountType').attr('readonly', true);
                        $('#sltAccountType').attr('disabled', 'disabled');
                        for (let a = 0; a < data.taccountvs1.length; a++) {

                        if((data.taccountvs1[a].fields.AccountName) === accountDataName){
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
                    }else if ((accounttype === "CCARD")) {
                        $('.isCreditAccount').removeClass('isNotCreditAccount');
                        $('.isBankAccount').addClass('isNotBankAccount');
                    } else {
                        $('.isBankAccount').addClass('isNotBankAccount');
                        $('.isCreditAccount').addClass('isNotCreditAccount');
                    }

                    $('#edtAccountID').val(accountid);
                    $('#sltAccountType').val(accounttype);
                    $('#sltAccountType').append('<option value="'+accounttype+'" selected="selected">'+accounttype+'</option>');
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

                    if(showTrans == 'true'){
                        $('.showOnTransactions').prop('checked', true);
                    }else{
                        $('.showOnTransactions').prop('checked', false);
                    }

                    setTimeout(function () {
                        $('#addNewAccount').modal('show');
                    }, 500);

                        }
                        }
                        if(!added) {
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
                            }else if ((accounttype === "CCARD")) {
                                $('.isCreditAccount').removeClass('isNotCreditAccount');
                                $('.isBankAccount').addClass('isNotBankAccount');
                            } else {
                                $('.isBankAccount').addClass('isNotBankAccount');
                                $('.isCreditAccount').addClass('isNotCreditAccount');
                            }

                            $('#edtAccountID').val(accountid);
                            $('#sltAccountType').val(accounttype);
                            $('#sltAccountType').append('<option value="'+accounttype+'" selected="selected">'+accounttype+'</option>');
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

                            if(showTrans == 'true'){
                                $('.showOnTransactions').prop('checked', true);
                            }else{
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
                    }else if ((accounttype === "CCARD")) {
                        $('.isCreditAccount').removeClass('isNotCreditAccount');
                        $('.isBankAccount').addClass('isNotBankAccount');
                    } else {
                        $('.isBankAccount').addClass('isNotBankAccount');
                        $('.isCreditAccount').addClass('isNotCreditAccount');
                    }

                    $('#edtAccountID').val(accountid);
                    $('#sltAccountType').val(accounttype);
                    $('#sltAccountType').append('<option value="'+accounttype+'" selected="selected">'+accounttype+'</option>');
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

                    if(showTrans == 'true'){
                        $('.showOnTransactions').prop('checked', true);
                    }else{
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
            }else{
                $('#selectLineID').val('edtExpenseAccountOvertime');
                $('#accountListModal').modal('toggle');
                setTimeout(function () {
                $('#tblAccount_filter .form-control-sm').focus();
                $('#tblAccount_filter .form-control-sm').val('EXP');
                $('#tblAccount_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblSupplierlist').DataTable();
                    datatable.draw();
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                }, 500);
            }
            }
        });

        $('#edtExpenseAccountLumpSumE').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();
            var $earch = $(this);
            var offset = $earch.offset();
            let accountService = new AccountService();
            const accountTypeList = [];
            var accountDataName = e.target.value ||'';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#selectLineID').val('edtExpenseAccountLumpSumE');
            $('#accountListModal').modal('toggle');
            setTimeout(function () {
                $('#tblAccount_filter .form-control-sm').focus();
                $('#tblAccount_filter .form-control-sm').val('EXP');
                $('#tblAccount_filter .form-control-sm').trigger("input");
                var datatable = $('#tblAccountlist').DataTable();
                datatable.draw();
                $('#tblAccountlist_filter .form-control-sm').trigger("input");
            }, 500);
            }else{
            if(accountDataName.replace(/\s/g, '') != ''){
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
                        }else if ((accounttype === "CCARD")) {
                            $('.isCreditAccount').removeClass('isNotCreditAccount');
                            $('.isBankAccount').addClass('isNotBankAccount');
                        } else {
                            $('.isBankAccount').addClass('isNotBankAccount');
                            $('.isCreditAccount').addClass('isNotCreditAccount');
                        }

                        $('#edtAccountID').val(accountid);
                        $('#sltAccountType').val(accounttype);
                        $('#sltAccountType').append('<option value="'+accounttype+'" selected="selected">'+accounttype+'</option>');
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

                        if(showTrans == 'true'){
                            $('.showOnTransactions').prop('checked', true);
                        }else{
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
                        var added=false;
                        let lineItems = [];
                        let lineItemObj = {};
                        let fullAccountTypeName = '';
                        let accBalance = '';
                        $('#add-account-title').text('Edit Account Details');
                        $('#edtAccountName').attr('readonly', true);
                        $('#sltAccountType').attr('readonly', true);
                        $('#sltAccountType').attr('disabled', 'disabled');
                        for (let a = 0; a < data.taccountvs1.length; a++) {

                        if((data.taccountvs1[a].fields.AccountName) === accountDataName){
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
                    }else if ((accounttype === "CCARD")) {
                        $('.isCreditAccount').removeClass('isNotCreditAccount');
                        $('.isBankAccount').addClass('isNotBankAccount');
                    } else {
                        $('.isBankAccount').addClass('isNotBankAccount');
                        $('.isCreditAccount').addClass('isNotCreditAccount');
                    }

                    $('#edtAccountID').val(accountid);
                    $('#sltAccountType').val(accounttype);
                    $('#sltAccountType').append('<option value="'+accounttype+'" selected="selected">'+accounttype+'</option>');
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

                    if(showTrans == 'true'){
                        $('.showOnTransactions').prop('checked', true);
                    }else{
                        $('.showOnTransactions').prop('checked', false);
                    }

                    setTimeout(function () {
                        $('#addNewAccount').modal('show');
                    }, 500);

                        }
                        }
                        if(!added) {
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
                            }else if ((accounttype === "CCARD")) {
                                $('.isCreditAccount').removeClass('isNotCreditAccount');
                                $('.isBankAccount').addClass('isNotBankAccount');
                            } else {
                                $('.isBankAccount').addClass('isNotBankAccount');
                                $('.isCreditAccount').addClass('isNotCreditAccount');
                            }

                            $('#edtAccountID').val(accountid);
                            $('#sltAccountType').val(accounttype);
                            $('#sltAccountType').append('<option value="'+accounttype+'" selected="selected">'+accounttype+'</option>');
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

                            if(showTrans == 'true'){
                                $('.showOnTransactions').prop('checked', true);
                            }else{
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
                    }else if ((accounttype === "CCARD")) {
                        $('.isCreditAccount').removeClass('isNotCreditAccount');
                        $('.isBankAccount').addClass('isNotBankAccount');
                    } else {
                        $('.isBankAccount').addClass('isNotBankAccount');
                        $('.isCreditAccount').addClass('isNotCreditAccount');
                    }

                    $('#edtAccountID').val(accountid);
                    $('#sltAccountType').val(accounttype);
                    $('#sltAccountType').append('<option value="'+accounttype+'" selected="selected">'+accounttype+'</option>');
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

                    if(showTrans == 'true'){
                        $('.showOnTransactions').prop('checked', true);
                    }else{
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
            }else{
                $('#selectLineID').val('edtReimbursementAccount');
                $('#accountListModal').modal('toggle');
                setTimeout(function () {
                $('#tblAccount_filter .form-control-sm').focus();
                $('#tblAccount_filter .form-control-sm').val('LTLIAB');
                $('#tblAccount_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblSupplierlist').DataTable();
                    datatable.draw();
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                }, 500);
            }
            }


        });

        $('#edtExpenseAccountBonusesCommissions').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();
            var $earch = $(this);
            var offset = $earch.offset();
            let accountService = new AccountService();
            const accountTypeList = [];
            var accountDataName = e.target.value ||'';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#selectLineID').val('edtExpenseAccountBonusesCommissions');
            $('#accountListModal').modal('toggle');
            setTimeout(function () {
                $('#tblAccount_filter .form-control-sm').focus();
                $('#tblAccount_filter .form-control-sm').val('EXP');
                $('#tblAccount_filter .form-control-sm').trigger("input");
                var datatable = $('#tblAccountlist').DataTable();
                datatable.draw();
                $('#tblAccountlist_filter .form-control-sm').trigger("input");
            }, 500);
            }else{
                $('#selectLineID').val('editwagesexpbankaccount');
                $('#accountListModal').modal('toggle');
                setTimeout(function () {
                $('#tblAccount_filter .form-control-sm').focus();
                $('#tblAccount_filter .form-control-sm').val('EXP');
                $('#tblAccount_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblSupplierlist').DataTable();
                    datatable.draw();
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                }, 500);
            }
        });

        $('#edtExpenseAccountLumpSumW').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();
            var $earch = $(this);
            var offset = $earch.offset();
            let accountService = new AccountService();
            const accountTypeList = [];
            var   accountDataName = e.target.value ||'';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#selectLineID').val('edtExpenseAccountLumpSumW');
            $('#accountListModal').modal('toggle');
            setTimeout(function () {
                $('#tblAccount_filter .form-control-sm').focus();
                $('#tblAccount_filter .form-control-sm').val('EXP');
                $('#tblAccount_filter .form-control-sm').trigger("input");
                var datatable = $('#tblAccountlist').DataTable();
                datatable.draw();
                $('#tblAccountlist_filter .form-control-sm').trigger("input");
            }, 500);
            }else{
            if(accountDataName.replace(/\s/g, '') != ''){
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
                        }else if ((accounttype === "CCARD")) {
                            $('.isCreditAccount').removeClass('isNotCreditAccount');
                            $('.isBankAccount').addClass('isNotBankAccount');
                        } else {
                            $('.isBankAccount').addClass('isNotBankAccount');
                            $('.isCreditAccount').addClass('isNotCreditAccount');
                        }

                        $('#edtAccountID').val(accountid);
                        $('#sltAccountType').val(accounttype);
                        $('#sltAccountType').append('<option value="'+accounttype+'" selected="selected">'+accounttype+'</option>');
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

                        if(showTrans == 'true'){
                            $('.showOnTransactions').prop('checked', true);
                        }else{
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
                        var added=false;
                        let lineItems = [];
                        let lineItemObj = {};
                        let fullAccountTypeName = '';
                        let accBalance = '';
                        $('#add-account-title').text('Edit Account Details');
                        $('#edtAccountName').attr('readonly', true);
                        $('#sltAccountType').attr('readonly', true);
                        $('#sltAccountType').attr('disabled', 'disabled');
                        for (let a = 0; a < data.taccountvs1.length; a++) {

                        if((data.taccountvs1[a].fields.AccountName) === accountDataName){
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
                    }else if ((accounttype === "CCARD")) {
                        $('.isCreditAccount').removeClass('isNotCreditAccount');
                        $('.isBankAccount').addClass('isNotBankAccount');
                    } else {
                        $('.isBankAccount').addClass('isNotBankAccount');
                        $('.isCreditAccount').addClass('isNotCreditAccount');
                    }

                    $('#edtAccountID').val(accountid);
                    $('#sltAccountType').val(accounttype);
                    $('#sltAccountType').append('<option value="'+accounttype+'" selected="selected">'+accounttype+'</option>');
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

                    if(showTrans == 'true'){
                        $('.showOnTransactions').prop('checked', true);
                    }else{
                        $('.showOnTransactions').prop('checked', false);
                    }

                    setTimeout(function () {
                        $('#addNewAccount').modal('show');
                    }, 500);

                        }
                        }
                        if(!added) {
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
                            }else if ((accounttype === "CCARD")) {
                                $('.isCreditAccount').removeClass('isNotCreditAccount');
                                $('.isBankAccount').addClass('isNotBankAccount');
                            } else {
                                $('.isBankAccount').addClass('isNotBankAccount');
                                $('.isCreditAccount').addClass('isNotCreditAccount');
                            }

                            $('#edtAccountID').val(accountid);
                            $('#sltAccountType').val(accounttype);
                            $('#sltAccountType').append('<option value="'+accounttype+'" selected="selected">'+accounttype+'</option>');
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

                            if(showTrans == 'true'){
                                $('.showOnTransactions').prop('checked', true);
                            }else{
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
                    }else if ((accounttype === "CCARD")) {
                        $('.isCreditAccount').removeClass('isNotCreditAccount');
                        $('.isBankAccount').addClass('isNotBankAccount');
                    } else {
                        $('.isBankAccount').addClass('isNotBankAccount');
                        $('.isCreditAccount').addClass('isNotCreditAccount');
                    }

                    $('#edtAccountID').val(accountid);
                    $('#sltAccountType').val(accounttype);
                    $('#sltAccountType').append('<option value="'+accounttype+'" selected="selected">'+accounttype+'</option>');
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

                    if(showTrans == 'true'){
                        $('.showOnTransactions').prop('checked', true);
                    }else{
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
            }else{
                $('#selectLineID').val('edtExpenseAccountLumpSumW');
                $('#accountListModal').modal('toggle');
                setTimeout(function () {
                $('#tblAccount_filter .form-control-sm').focus();
                $('#tblAccount_filter .form-control-sm').val('EXP');
                $('#tblAccount_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblSupplierlist').DataTable();
                    datatable.draw();
                    $('#tblAccount_filter .form-control-sm').trigger("input");
                }, 500);
            }
            }
        });

        $('#edtDeductionAccount').editableSelect().on('click.editable-select', function (e, li) {
            var $earch = $(this);
            var offset = $earch.offset();

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#selectLineID').val('edtDeductionAccount');
                $('#accountListModal').modal("toggle");
                setTimeout(function () {
                    var datatable = $('#tblAccountlist').DataTable();
                    datatable.draw();
                }, 500);
            } else {
                $('#selectLineID').val('edtDeductionAccount');
                $('#accountListModal').modal('toggle');
                setTimeout(function () {
                    var datatable = $('#tblSupplierlist').DataTable();
                    datatable.draw();
                }, 500);
            }
        });

        $('#edtRateTypeOvertime').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();
            var $earch = $(this);
            var offset = $earch.offset();
            let ratetypeService = new RateTypeService();
            const ratetypelist = [];
            var  Description = e.target.value ||'';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#selectRateLineID').val('edtRateTypeOvertime');
            $('#rateTypeListModel').modal('toggle');
            $('#tblratetypelist_filter .form-control-sm').focus();
            $('#tblratetypelist_filter .form-control-sm').val();
            $('#tblratetypelist_filter .form-control-sm').trigger("input");
            setTimeout(function () {
                var datatable = $('#tblRateTypeList').DataTable();
                datatable.draw();
                $('#tblratetypelist_filter .form-control-sm').trigger("input");
            }, 500);
            }else{
            if(Description.replace(/\s/g, '') != ''){
                getVS1Data('TRateTypes').then(function (dataObject) {
                if (dataObject.length == 0) {
                        ratetypeService.getOneRateTypeByName(Description).then(function (data) {
                        let lineItems = [];
                        let lineItemObj = {};
                        let fullDescriptionname = '';
                        $('#add-rateype-title').text('Edit Rate Type Details');

                        if (ratetypelist) {
                            for (var h = 0; h < ratetypelist.length; h++) {

                                if (data.tpayratetype[0].fields.Description === ratetypelist[h].description) {

                                    fullDescriptionname = ratetypelist[h].description || '';

                                }
                            }

                        }

                        var ratetypeid = data.tpayratetype[0].fields.ID || '';
                        var description = fullDescriptionname || data.tpayratetype[0].fields.Description;


                        $('#edtRateID').val(ratetypeid);
                        $('#edtRateDescription').val(description);


                        setTimeout(function () {
                            $('#addRateModel').modal('show');
                        }, 500);

                    }).catch(function (err) {
                        LoadingOverlay.hide();
                    });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tpayratetype;
                        var added=false;
                        let lineItems = [];
                        let lineItemObj = {};
                        let fullDescriptionname = '';

                        $('#add-rateype-title').text('Edit Rate Type Details');
                        $('#edtRateID').attr('readonly', true);
                        $('#edtRateDescription').attr('readonly', true);

                        for (let a = 0; a < data.tpayratetype.length; a++) {

                        if((data.tpayratetype[a].fields.Description) === Description){
                            added = true;
                            if (ratetypelist) {
                                for (var h = 0; h < ratetypelist.length; h++) {

                                    if (data.tpayratetype[a].fields.Description === ratetypelist[h].Description) {

                                        fullDescriptionname = ratetypelist[h].Description || '';

                                    }
                                }

                            }



                    var ratetypeid = data.tpayratetype[a].fields.ID || '';
                    var ratetypedescription = fullDescriptionname || data.tpayratetype[a].fields.Description;

                    $('#edtRateID').val(ratetypeid);
                    $('#edtRateDescription').val(ratetypedescription);

                    setTimeout(function () {
                        $('#addRateModel').modal('show');
                        }, 500); } }

                        if(!added) {
                            ratetypeService.getOneRateTypeByName(Description).then(function (data) {
                            let lineItems = [];
                            let lineItemObj = {};
                            let fullAccountTypeName = '';

                            $('#add-rateype-title').text('Edit Rate Type Details');
                            $('#edtRateID').attr('readonly', true);
                            $('#edtRateDescription').attr('readonly', true);
                            if (ratetypelist) {
                                for (var h = 0; h < ratetypelist.length; h++) {

                                    if (data.tpayratetype[0].fields.Description === ratetypelist[h].Description) {

                                        fullAccountTypeName = ratetypelist[h].description || '';

                                    }
                                }

                            }

                            var ratetypeid = data.tpayratetype[0].fields.ID || '';
                            var ratetypedescription = fullAccountTypeName || data.tpayratetype[0].fields.Description;

                            $('#edtRateID').val(ratetypeid);
                            $('#edtRateDescription').val(ratetypedescription);

                            setTimeout(function () {
                                $('#addRateModel').modal('show');
                            }, 500);

                        }).catch(function (err) {
                            LoadingOverlay.hide();
                        });
                        }

                    }
                }).catch(function (err) {
                    ratetypeService.getOneRateTypeByName(Description).then(function (data) {
                    let lineItems = [];
                    let lineItemObj = {};
                    let fullAccountTypeName = '';

                    $('#add-rateype-title').text('Edit Rate Type Details');
                    $('#edtRateID').attr('readonly', true);
                    $('#edtRateDescription').attr('readonly', true);

                    if (ratetypelist) {
                        for (var h = 0; h < ratetypelist.length; h++) {

                            if (data.tpayratetype[a].fields.Description === ratetypelist[h].Description) {
                                fullDescriptionname = ratetypelist[h].Description || '';
                            }
                        }

                    }

                    var ratetypeid = data.tpayratetype[0].fields.ID || '';
                    var ratetypedescription = fullAccountTypeName || data.tpayratetype[0].fields.Description;

                            $('#edtRateID').val(ratetypeid);
                            $('#edtRateDescription').val(ratetypedescription);

                            setTimeout(function () {
                                $('#addRateModel').modal('show');
                            }, 500);


                }).catch(function (err) {
                    LoadingOverlay.hide();
                });

                });
                $('#addRateModel').modal('toggle');
            }else{
                $('#selectRateLineID').val('edtRateTypeOvertime');
                $('#rateTypeListModel').modal('toggle');
                setTimeout(function () {
                    var datatable = $('#tblRateTypeList').DataTable();
                    datatable.draw();

                }, 500);
            }
            }
        });

        $('#holidaygroup').editableSelect().on('click.editable-select', function (e, li) {
            $('#groupTypeListModel').modal('toggle');
            $('#tblgrouptypelist').DataTable().draw();
        });

        $('#addexistgroup').editableSelect().on('click.editable-select', function (e, li) {
            $('#groupTypeListModel').modal('toggle');
            $('#tblgrouptypelist').DataTable().draw();
        });

        $('#holidaygroup2').editableSelect().on('click.editable-select', function (e, li) {
            var $earch = $(this);
            var offset = $earch.offset();

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#selectLineID').val('editholidayaccount');
                $('#groupTypeListModel').modal("toggle");
                setTimeout(function () {
                    var datatable = $('#tblgrouptypelist').DataTable();
                    datatable.draw();
                }, 500);
            } else {
                $('#selectLineID').val('editholidayaccount');
                $('#groupTypeListModel').modal('toggle');
                setTimeout(function () {
                    var datatable = $('#tblgrouptypelist').DataTable();
                    datatable.draw();
                }, 500);
            }
        });

        $('#edtFundType').editableSelect().on('click.editable-select', function (e, li) {
            var $earch = $(this);
            var offset = $earch.offset();

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#selectFundLineID').val('edtFundType');
            $('#fundTypeListModel').modal('toggle');
            $('#tblfundtypelist_filter .form-control-sm').focus();
            $('#tblfundtypelist_filter .form-control-sm').val();
            $('#tblfundtypelist_filter .form-control-sm').trigger("input");
            setTimeout(function () {
                var datatable = $('#tblfundtypelist').DataTable();
                datatable.draw();
                $('#tblfundtypelist_filter .form-control-sm').trigger("input");
            }, 500);
            }else{
                $('#selectFundLineID').val('edtFundType');
                $('#fundTypeListModel').modal('toggle');
                setTimeout(function () {
                    var datatable = $('#tblfundtypelist').DataTable();
                    datatable.draw();

                }, 500);
            }
        });

        $('#edtRateTypeTermnination').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();

            var $earch = $(this);
            var offset = $earch.offset();
            let ratetypeService = new RateTypeService();
            const ratetypelist = [];
            var  Description = e.target.value ||'';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#selectRateLineID').val('edtRateTypeTermnination');
            $('#rateTypeListModel').modal('toggle');
            $('#tblratetypelist_filter .form-control-sm').focus();
            $('#tblratetypelist_filter .form-control-sm').val();
            $('#tblratetypelist_filter .form-control-sm').trigger("input");
            setTimeout(function () {
                var datatable = $('#tblRateTypeList').DataTable();
                datatable.draw();
                $('#tblratetypelist_filter .form-control-sm').trigger("input");
            }, 500);
            }else{
            if(Description.replace(/\s/g, '') != ''){
                getVS1Data('TRateTypes').then(function (dataObject) {
                if (dataObject.length == 0) {
                        ratetypeService.getOneRateTypeByName(Description).then(function (data) {
                        let lineItems = [];
                        let lineItemObj = {};
                        let fullDescriptionname = '';
                        $('#add-rateype-title').text('Edit Rate Type Details');

                        if (ratetypelist) {
                            for (var h = 0; h < ratetypelist.length; h++) {

                                if (data.tpayratetype[0].fields.Description === ratetypelist[h].description) {

                                    fullDescriptionname = ratetypelist[h].description || '';

                                }
                            }

                        }

                        var ratetypeid = data.tpayratetype[0].fields.ID || '';
                        var description = fullDescriptionname || data.tpayratetype[0].fields.Description;


                        $('#edtRateID').val(ratetypeid);
                        $('#edtRateDescription').val(description);


                        setTimeout(function () {
                            $('#addRateModel').modal('show');
                        }, 500);

                    }).catch(function (err) {
                        LoadingOverlay.hide();
                    });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tpayratetype;
                        var added=false;
                        let lineItems = [];
                        let lineItemObj = {};
                        let fullDescriptionname = '';

                        $('#add-rateype-title').text('Edit Rate Type Details');
                        $('#edtRateID').attr('readonly', true);
                        $('#edtRateDescription').attr('readonly', true);

                        for (let a = 0; a < data.tpayratetype.length; a++) {

                        if((data.tpayratetype[a].fields.Description) === Description){
                            added = true;
                            if (ratetypelist) {
                                for (var h = 0; h < ratetypelist.length; h++) {

                                    if (data.tpayratetype[a].fields.Description === ratetypelist[h].Description) {

                                        fullDescriptionname = ratetypelist[h].Description || '';

                                    }
                                }

                            }



                    var ratetypeid = data.tpayratetype[a].fields.ID || '';
                    var ratetypedescription = fullDescriptionname || data.tpayratetype[a].fields.Description;

                    $('#edtRateID').val(ratetypeid);
                    $('#edtRateDescription').val(ratetypedescription);

                    setTimeout(function () {
                        $('#addRateModel').modal('show');
                        }, 500); } }

                        if(!added) {
                            ratetypeService.getOneRateTypeByName(Description).then(function (data) {
                            let lineItems = [];
                            let lineItemObj = {};
                            let fullAccountTypeName = '';

                            $('#add-rateype-title').text('Edit Rate Type Details');
                            $('#edtRateID').attr('readonly', true);
                            $('#edtRateDescription').attr('readonly', true);
                            if (ratetypelist) {
                                for (var h = 0; h < ratetypelist.length; h++) {

                                    if (data.tpayratetype[0].fields.Description === ratetypelist[h].Description) {

                                        fullAccountTypeName = ratetypelist[h].description || '';

                                    }
                                }

                            }

                            var ratetypeid = data.tpayratetype[0].fields.ID || '';
                            var ratetypedescription = fullAccountTypeName || data.tpayratetype[0].fields.Description;

                            $('#edtRateID').val(ratetypeid);
                            $('#edtRateDescription').val(ratetypedescription);

                            setTimeout(function () {
                                $('#addRateModel').modal('show');
                            }, 500);

                        }).catch(function (err) {
                            LoadingOverlay.hide();
                        });
                        }

                    }
                }).catch(function (err) {
                    ratetypeService.getOneRateTypeByName(Description).then(function (data) {
                    let lineItems = [];
                    let lineItemObj = {};
                    let fullAccountTypeName = '';

                    $('#add-rateype-title').text('Edit Rate Type Details');
                    $('#edtRateID').attr('readonly', true);
                    $('#edtRateDescription').attr('readonly', true);

                    if (ratetypelist) {
                        for (var h = 0; h < ratetypelist.length; h++) {

                            if (data.tpayratetype[a].fields.Description === ratetypelist[h].Description) {
                                fullDescriptionname = ratetypelist[h].Description || '';
                            }
                        }

                    }

                    var ratetypeid = data.tpayratetype[0].fields.ID || '';
                    var ratetypedescription = fullAccountTypeName || data.tpayratetype[0].fields.Description;

                            $('#edtRateID').val(ratetypeid);
                            $('#edtRateDescription').val(ratetypedescription);

                            setTimeout(function () {
                                $('#addRateModel').modal('show');
                            }, 500);


                }).catch(function (err) {
                    LoadingOverlay.hide();
                });

                });
                $('#addRateModel').modal('toggle');
            }else{
                $('#selectRateLineID').val('edtRateTypeTermnination');
                $('#rateTypeListModel').modal('toggle');
                setTimeout(function () {
                    var datatable = $('#tblRateTypeList').DataTable();
                    datatable.draw();

                }, 500);
            }
            }
        });

        $('#edtRateTypeLumpSumE').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();

            var $earch = $(this);
            var offset = $earch.offset();
            let ratetypeService = new RateTypeService();
            const ratetypelist = [];
            var  Description = e.target.value ||'';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#selectRateLineID').val('edtRateTypeLumpSumE');
            $('#rateTypeListModel').modal('toggle');
            $('#tblratetypelist_filter .form-control-sm').focus();
            $('#tblratetypelist_filter .form-control-sm').val();
            $('#tblratetypelist_filter .form-control-sm').trigger("input");
            setTimeout(function () {
                var datatable = $('#tblRateTypeList').DataTable();
                datatable.draw();
                $('#tblratetypelist_filter .form-control-sm').trigger("input");
            }, 500);
            }else{
            if(Description.replace(/\s/g, '') != ''){
                getVS1Data('TRateTypes').then(function (dataObject) {
                if (dataObject.length == 0) {
                        ratetypeService.getOneRateTypeByName(Description).then(function (data) {
                        let lineItems = [];
                        let lineItemObj = {};
                        let fullDescriptionname = '';
                        $('#add-rateype-title').text('Edit Rate Type Details');

                        if (ratetypelist) {
                            for (var h = 0; h < ratetypelist.length; h++) {

                                if (data.tpayratetype[0].fields.Description === ratetypelist[h].description) {

                                    fullDescriptionname = ratetypelist[h].description || '';

                                }
                            }

                        }

                        var ratetypeid = data.tpayratetype[0].fields.ID || '';
                        var description = fullDescriptionname || data.tpayratetype[0].fields.Description;


                        $('#edtRateID').val(ratetypeid);
                        $('#edtRateDescription').val(description);


                        setTimeout(function () {
                            $('#addRateModel').modal('show');
                        }, 500);

                    }).catch(function (err) {
                        LoadingOverlay.hide();
                    });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tpayratetype;
                        var added=false;
                        let lineItems = [];
                        let lineItemObj = {};
                        let fullDescriptionname = '';

                        $('#add-rateype-title').text('Edit Rate Type Details');
                        $('#edtRateID').attr('readonly', true);
                        $('#edtRateDescription').attr('readonly', true);

                        for (let a = 0; a < data.tpayratetype.length; a++) {

                        if((data.tpayratetype[a].fields.Description) === Description){
                            added = true;
                            if (ratetypelist) {
                                for (var h = 0; h < ratetypelist.length; h++) {

                                    if (data.tpayratetype[a].fields.Description === ratetypelist[h].Description) {

                                        fullDescriptionname = ratetypelist[h].Description || '';


                                    }
                                }

                            }



                    var ratetypeid = data.tpayratetype[a].fields.ID || '';
                    var ratetypedescription = fullDescriptionname || data.tpayratetype[a].fields.Description;

                    $('#edtRateID').val(ratetypeid);
                    $('#edtRateDescription').val(ratetypedescription);

                    setTimeout(function () {
                        $('#addRateModel').modal('show');
                        }, 500); } }

                        if(!added) {
                            ratetypeService.getOneRateTypeByName(Description).then(function (data) {
                            let lineItems = [];
                            let lineItemObj = {};
                            let fullAccountTypeName = '';

                            $('#add-rateype-title').text('Edit Rate Type Details');
                            $('#edtRateID').attr('readonly', true);
                            $('#edtRateDescription').attr('readonly', true);
                            if (ratetypelist) {
                                for (var h = 0; h < ratetypelist.length; h++) {

                                    if (data.tpayratetype[0].fields.Description === ratetypelist[h].Description) {

                                        fullAccountTypeName = ratetypelist[h].description || '';

                                    }
                                }

                            }

                            var ratetypeid = data.tpayratetype[0].fields.ID || '';
                            var ratetypedescription = fullAccountTypeName || data.tpayratetype[0].fields.Description;

                            $('#edtRateID').val(ratetypeid);
                            $('#edtRateDescription').val(ratetypedescription);

                            setTimeout(function () {
                                $('#addRateModel').modal('show');
                            }, 500);

                        }).catch(function (err) {
                            LoadingOverlay.hide();
                        });
                        }

                    }
                }).catch(function (err) {
                    ratetypeService.getOneRateTypeByName(Description).then(function (data) {
                    let lineItems = [];
                    let lineItemObj = {};
                    let fullAccountTypeName = '';

                    $('#add-rateype-title').text('Edit Rate Type Details');
                    $('#edtRateID').attr('readonly', true);
                    $('#edtRateDescription').attr('readonly', true);

                    if (ratetypelist) {
                        for (var h = 0; h < ratetypelist.length; h++) {

                            if (data.tpayratetype[a].fields.Description === ratetypelist[h].Description) {
                                fullDescriptionname = ratetypelist[h].Description || '';
                            }
                        }

                    }

                    var ratetypeid = data.tpayratetype[0].fields.ID || '';
                    var ratetypedescription = fullAccountTypeName || data.tpayratetype[0].fields.Description;

                            $('#edtRateID').val(ratetypeid);
                            $('#edtRateDescription').val(ratetypedescription);

                            setTimeout(function () {
                                $('#addRateModel').modal('show');
                            }, 500);


                }).catch(function (err) {
                    LoadingOverlay.hide();
                });

                });
                $('#addRateModel').modal('toggle');
            }else{
                $('#selectRateLineID').val('edtRateTypeLumpSumE');
                $('#rateTypeListModel').modal('toggle');
                setTimeout(function () {
                    var datatable = $('#tblRateTypeList').DataTable();
                    datatable.draw();

                }, 500);
            }
            }
        });

        $('#edtRateTypeBonusesCommissions').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();

            var $earch = $(this);
            var offset = $earch.offset();
            let ratetypeService = new RateTypeService();
            const ratetypelist = [];
            var  Description = e.target.value ||'';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#selectRateLineID').val('edtRateTypeBonusesCommissions');
            $('#rateTypeListModel').modal('toggle');
            $('#tblratetypelist_filter .form-control-sm').focus();
            $('#tblratetypelist_filter .form-control-sm').val();
            $('#tblratetypelist_filter .form-control-sm').trigger("input");
            setTimeout(function () {
                var datatable = $('#tblRateTypeList').DataTable();
                datatable.draw();
                $('#tblratetypelist_filter .form-control-sm').trigger("input");
            }, 500);
            }else{
            if(Description.replace(/\s/g, '') != ''){
                getVS1Data('TRateTypes').then(function (dataObject) {
                if (dataObject.length == 0) {
                        ratetypeService.getOneRateTypeByName(Description).then(function (data) {
                        let lineItems = [];
                        let lineItemObj = {};
                        let fullDescriptionname = '';
                        $('#add-rateype-title').text('Edit Rate Type Details');

                        if (ratetypelist) {
                            for (var h = 0; h < ratetypelist.length; h++) {

                                if (data.tpayratetype[0].fields.Description === ratetypelist[h].description) {

                                    fullDescriptionname = ratetypelist[h].description || '';

                                }
                            }

                        }

                        var ratetypeid = data.tpayratetype[0].fields.ID || '';
                        var description = fullDescriptionname || data.tpayratetype[0].fields.Description;


                        $('#edtRateID').val(ratetypeid);
                        $('#edtRateDescription').val(description);


                        setTimeout(function () {
                            $('#addRateModel').modal('show');
                        }, 500);

                    }).catch(function (err) {
                        LoadingOverlay.hide();
                    });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tpayratetype;
                        var added=false;
                        let lineItems = [];
                        let lineItemObj = {};
                        let fullDescriptionname = '';

                        $('#add-rateype-title').text('Edit Rate Type Details');
                        $('#edtRateID').attr('readonly', true);
                        $('#edtRateDescription').attr('readonly', true);

                        for (let a = 0; a < data.tpayratetype.length; a++) {

                        if((data.tpayratetype[a].fields.Description) === Description){
                            added = true;
                            if (ratetypelist) {
                                for (var h = 0; h < ratetypelist.length; h++) {

                                    if (data.tpayratetype[a].fields.Description === ratetypelist[h].Description) {

                                        fullDescriptionname = ratetypelist[h].Description || '';


                                    }
                                }

                            }



                    var ratetypeid = data.tpayratetype[a].fields.ID || '';
                    var ratetypedescription = fullDescriptionname || data.tpayratetype[a].fields.Description;

                    $('#edtRateID').val(ratetypeid);
                    $('#edtRateDescription').val(ratetypedescription);

                    setTimeout(function () {
                        $('#addRateModel').modal('show');
                        }, 500); } }

                        if(!added) {
                            ratetypeService.getOneRateTypeByName(Description).then(function (data) {
                            let lineItems = [];
                            let lineItemObj = {};
                            let fullAccountTypeName = '';

                            $('#add-rateype-title').text('Edit Rate Type Details');
                            $('#edtRateID').attr('readonly', true);
                            $('#edtRateDescription').attr('readonly', true);
                            if (ratetypelist) {
                                for (var h = 0; h < ratetypelist.length; h++) {

                                    if (data.tpayratetype[0].fields.Description === ratetypelist[h].Description) {

                                        fullAccountTypeName = ratetypelist[h].description || '';

                                    }
                                }

                            }

                            var ratetypeid = data.tpayratetype[0].fields.ID || '';
                            var ratetypedescription = fullAccountTypeName || data.tpayratetype[0].fields.Description;

                            $('#edtRateID').val(ratetypeid);
                            $('#edtRateDescription').val(ratetypedescription);

                            setTimeout(function () {
                                $('#addRateModel').modal('show');
                            }, 500);

                        }).catch(function (err) {
                            LoadingOverlay.hide();
                        });
                        }

                    }
                }).catch(function (err) {
                    ratetypeService.getOneRateTypeByName(Description).then(function (data) {
                    let lineItems = [];
                    let lineItemObj = {};
                    let fullAccountTypeName = '';

                    $('#add-rateype-title').text('Edit Rate Type Details');
                    $('#edtRateID').attr('readonly', true);
                    $('#edtRateDescription').attr('readonly', true);

                    if (ratetypelist) {
                        for (var h = 0; h < ratetypelist.length; h++) {

                            if (data.tpayratetype[a].fields.Description === ratetypelist[h].Description) {
                                fullDescriptionname = ratetypelist[h].Description || '';
                            }
                        }

                    }

                    var ratetypeid = data.tpayratetype[0].fields.ID || '';
                    var ratetypedescription = fullAccountTypeName || data.tpayratetype[0].fields.Description;

                            $('#edtRateID').val(ratetypeid);
                            $('#edtRateDescription').val(ratetypedescription);

                            setTimeout(function () {
                                $('#addRateModel').modal('show');
                            }, 500);


                }).catch(function (err) {
                    LoadingOverlay.hide();
                });

                });
                $('#addRateModel').modal('toggle');
            }else{
                $('#selectRateLineID').val('edtRateTypeBonusesCommissions');
                $('#rateTypeListModel').modal('toggle');
                setTimeout(function () {
                    var datatable = $('#tblRateTypeList').DataTable();
                    datatable.draw();

                }, 500);
            }
            }
        });

        $('#edtRateTypeDirectorsFees').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();

            var $earch = $(this);
            var offset = $earch.offset();
            let ratetypeService = new RateTypeService();
            const ratetypelist = [];
            var  Description = e.target.value ||'';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#selectRateLineID').val('edtRateTypeDirectorsFees');
            $('#rateTypeListModel').modal('toggle');
            $('#tblratetypelist_filter .form-control-sm').focus();
            $('#tblratetypelist_filter .form-control-sm').val();
            $('#tblratetypelist_filter .form-control-sm').trigger("input");
            setTimeout(function () {
                var datatable = $('#tblRateTypeList').DataTable();
                datatable.draw();
                $('#tblratetypelist_filter .form-control-sm').trigger("input");
            }, 500);
            }else{
            if(Description.replace(/\s/g, '') != ''){
                getVS1Data('TRateTypes').then(function (dataObject) {
                if (dataObject.length == 0) {
                        ratetypeService.getOneRateTypeByName(Description).then(function (data) {
                        let lineItems = [];
                        let lineItemObj = {};
                        let fullDescriptionname = '';
                        $('#add-rateype-title').text('Edit Rate Type Details');

                        if (ratetypelist) {
                            for (var h = 0; h < ratetypelist.length; h++) {

                                if (data.tpayratetype[0].fields.Description === ratetypelist[h].description) {

                                    fullDescriptionname = ratetypelist[h].description || '';

                                }
                            }

                        }

                        var ratetypeid = data.tpayratetype[0].fields.ID || '';
                        var description = fullDescriptionname || data.tpayratetype[0].fields.Description;


                        $('#edtRateID').val(ratetypeid);
                        $('#edtRateDescription').val(description);


                        setTimeout(function () {
                            $('#addRateModel').modal('show');
                        }, 500);

                    }).catch(function (err) {
                        LoadingOverlay.hide();
                    });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tpayratetype;
                        var added=false;
                        let lineItems = [];
                        let lineItemObj = {};
                        let fullDescriptionname = '';

                        $('#add-rateype-title').text('Edit Rate Type Details');
                        $('#edtRateID').attr('readonly', true);
                        $('#edtRateDescription').attr('readonly', true);

                        for (let a = 0; a < data.tpayratetype.length; a++) {

                        if((data.tpayratetype[a].fields.Description) === Description){
                            added = true;
                            if (ratetypelist) {
                                for (var h = 0; h < ratetypelist.length; h++) {

                                    if (data.tpayratetype[a].fields.Description === ratetypelist[h].Description) {

                                        fullDescriptionname = ratetypelist[h].Description || '';


                                    }
                                }

                            }



                    var ratetypeid = data.tpayratetype[a].fields.ID || '';
                    var ratetypedescription = fullDescriptionname || data.tpayratetype[a].fields.Description;

                    $('#edtRateID').val(ratetypeid);
                    $('#edtRateDescription').val(ratetypedescription);

                    setTimeout(function () {
                        $('#addRateModel').modal('show');
                        }, 500); } }

                        if(!added) {
                            ratetypeService.getOneRateTypeByName(Description).then(function (data) {
                            let lineItems = [];
                            let lineItemObj = {};
                            let fullAccountTypeName = '';

                            $('#add-rateype-title').text('Edit Rate Type Details');
                            $('#edtRateID').attr('readonly', true);
                            $('#edtRateDescription').attr('readonly', true);
                            if (ratetypelist) {
                                for (var h = 0; h < ratetypelist.length; h++) {

                                    if (data.tpayratetype[0].fields.Description === ratetypelist[h].Description) {

                                        fullAccountTypeName = ratetypelist[h].description || '';

                                    }
                                }

                            }

                            var ratetypeid = data.tpayratetype[0].fields.ID || '';
                            var ratetypedescription = fullAccountTypeName || data.tpayratetype[0].fields.Description;

                            $('#edtRateID').val(ratetypeid);
                            $('#edtRateDescription').val(ratetypedescription);

                            setTimeout(function () {
                                $('#addRateModel').modal('show');
                            }, 500);

                        }).catch(function (err) {
                            LoadingOverlay.hide();
                        });
                        }

                    }
                }).catch(function (err) {
                    ratetypeService.getOneRateTypeByName(Description).then(function (data) {
                    let lineItems = [];
                    let lineItemObj = {};
                    let fullAccountTypeName = '';

                    $('#add-rateype-title').text('Edit Rate Type Details');
                    $('#edtRateID').attr('readonly', true);
                    $('#edtRateDescription').attr('readonly', true);

                    if (ratetypelist) {
                        for (var h = 0; h < ratetypelist.length; h++) {

                            if (data.tpayratetype[a].fields.Description === ratetypelist[h].Description) {
                                fullDescriptionname = ratetypelist[h].Description || '';
                            }
                        }

                    }

                    var ratetypeid = data.tpayratetype[0].fields.ID || '';
                    var ratetypedescription = fullAccountTypeName || data.tpayratetype[0].fields.Description;

                            $('#edtRateID').val(ratetypeid);
                            $('#edtRateDescription').val(ratetypedescription);

                            setTimeout(function () {
                                $('#addRateModel').modal('show');
                            }, 500);


                }).catch(function (err) {
                    LoadingOverlay.hide();
                });

                });
                $('#addRateModel').modal('toggle');
            }else{
                $('#selectRateLineID').val('edtRateTypeDirectorsFees');
                $('#rateTypeListModel').modal('toggle');
                setTimeout(function () {
                    var datatable = $('#tblRateTypeList').DataTable();
                    datatable.draw();

                }, 500);
            }
            }
        });

        $('#edtRateTypeLumpSumW').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();

            var $earch = $(this);
            var offset = $earch.offset();
            let ratetypeService = new RateTypeService();
            const ratetypelist = [];
            var  Description = e.target.value ||'';

            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#selectRateLineID').val('edtRateTypeLumpSumW');
            $('#rateTypeListModel').modal('toggle');
            $('#tblratetypelist_filter .form-control-sm').focus();
            $('#tblratetypelist_filter .form-control-sm').val();
            $('#tblratetypelist_filter .form-control-sm').trigger("input");
            setTimeout(function () {
                var datatable = $('#tblRateTypeList').DataTable();
                datatable.draw();
                $('#tblratetypelist_filter .form-control-sm').trigger("input");
            }, 500);
            }else{
            if(Description.replace(/\s/g, '') != ''){
                getVS1Data('TRateTypes').then(function (dataObject) {
                if (dataObject.length == 0) {
                        ratetypeService.getOneRateTypeByName(Description).then(function (data) {
                        let lineItems = [];
                        let lineItemObj = {};
                        let fullDescriptionname = '';
                        $('#add-rateype-title').text('Edit Rate Type Details');

                        if (ratetypelist) {
                            for (var h = 0; h < ratetypelist.length; h++) {

                                if (data.tpayratetype[0].fields.Description === ratetypelist[h].description) {

                                    fullDescriptionname = ratetypelist[h].description || '';

                                }
                            }

                        }

                        var ratetypeid = data.tpayratetype[0].fields.ID || '';
                        var description = fullDescriptionname || data.tpayratetype[0].fields.Description;


                        $('#edtRateID').val(ratetypeid);
                        $('#edtRateDescription').val(description);


                        setTimeout(function () {
                            $('#addRateModel').modal('show');
                        }, 500);

                    }).catch(function (err) {
                        LoadingOverlay.hide();
                    });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tpayratetype;
                        var added=false;
                        let lineItems = [];
                        let lineItemObj = {};
                        let fullDescriptionname = '';

                        $('#add-rateype-title').text('Edit Rate Type Details');
                        $('#edtRateID').attr('readonly', true);
                        $('#edtRateDescription').attr('readonly', true);

                        for (let a = 0; a < data.tpayratetype.length; a++) {

                        if((data.tpayratetype[a].fields.Description) === Description){
                            added = true;
                            if (ratetypelist) {
                                for (var h = 0; h < ratetypelist.length; h++) {

                                    if (data.tpayratetype[a].fields.Description === ratetypelist[h].Description) {

                                        fullDescriptionname = ratetypelist[h].Description || '';


                                    }
                                }

                            }



                    var ratetypeid = data.tpayratetype[a].fields.ID || '';
                    var ratetypedescription = fullDescriptionname || data.tpayratetype[a].fields.Description;

                    $('#edtRateID').val(ratetypeid);
                    $('#edtRateDescription').val(ratetypedescription);

                    setTimeout(function () {
                        $('#addRateModel').modal('show');
                        }, 500); } }

                        if(!added) {
                            ratetypeService.getOneRateTypeByName(Description).then(function (data) {
                            let lineItems = [];
                            let lineItemObj = {};
                            let fullAccountTypeName = '';

                            $('#add-rateype-title').text('Edit Rate Type Details');
                            $('#edtRateID').attr('readonly', true);
                            $('#edtRateDescription').attr('readonly', true);
                            if (ratetypelist) {
                                for (var h = 0; h < ratetypelist.length; h++) {

                                    if (data.tpayratetype[0].fields.Description === ratetypelist[h].Description) {

                                        fullAccountTypeName = ratetypelist[h].description || '';

                                    }
                                }

                            }

                            var ratetypeid = data.tpayratetype[0].fields.ID || '';
                            var ratetypedescription = fullAccountTypeName || data.tpayratetype[0].fields.Description;

                            $('#edtRateID').val(ratetypeid);
                            $('#edtRateDescription').val(ratetypedescription);

                            setTimeout(function () {
                                $('#addRateModel').modal('show');
                            }, 500);

                        }).catch(function (err) {
                            LoadingOverlay.hide();
                        });
                        }

                    }
                }).catch(function (err) {
                    ratetypeService.getOneRateTypeByName(Description).then(function (data) {
                    let lineItems = [];
                    let lineItemObj = {};
                    let fullAccountTypeName = '';

                    $('#add-rateype-title').text('Edit Rate Type Details');
                    $('#edtRateID').attr('readonly', true);
                    $('#edtRateDescription').attr('readonly', true);

                    if (ratetypelist) {
                        for (var h = 0; h < ratetypelist.length; h++) {

                            if (data.tpayratetype[a].fields.Description === ratetypelist[h].Description) {
                                fullDescriptionname = ratetypelist[h].Description || '';
                            }
                        }

                    }

                    var ratetypeid = data.tpayratetype[0].fields.ID || '';
                    var ratetypedescription = fullAccountTypeName || data.tpayratetype[0].fields.Description;

                            $('#edtRateID').val(ratetypeid);
                            $('#edtRateDescription').val(ratetypedescription);

                            setTimeout(function () {
                                $('#addRateModel').modal('show');
                            }, 500);


                }).catch(function (err) {
                    LoadingOverlay.hide();
                });

                });
                $('#addRateModel').modal('toggle');
            }else{
                $('#selectRateLineID').val('edtRateTypeLumpSumW');
                $('#rateTypeListModel').modal('toggle');
                setTimeout(function () {
                    var datatable = $('#tblRateTypeList').DataTable();
                    datatable.draw();

                }, 500);
            }
            }
        });

        $('#rateList').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();
            const $earch = $(this);
            const offset = $earch.offset();
            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#ratePopModal').modal('toggle');
            } else {
                $('#ratePopModal').modal('toggle');
            }
        });

        $('#overtimeRateType').editableSelect().on('click.editable-select', function (e, li) {
            e.preventDefault();
            e.stopPropagation();
            const $earch = $(this);
            const offset = $earch.offset();
            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $(e.currentTarget).addClass('paste-rate');
                $('#select-rate-type-modal').modal('show');
            } else {
                $(e.currentTarget).addClass('paste-rate');
                $('#select-rate-type-modal').modal('show');
            }
        });
    });

    $(document).on("click", "#tblRateTypeList tbody tr", function(e) {

        let selectLineID = $('#selectRateLineID').val();

        var table = $(this);
        let description = table.find(".colDescription").text();
        $('#overtimeRateType').val(description)
        let ratetypeid = table.find(".thRateID").text()||0;
        $('#rateTypeListModel').modal('toggle');

          if(selectLineID == 'edtRateTypeOvertime'){
           $('#edtRateDescription').val(description);
           $('#edtRateID').val(ratetypeid);
           $('#edtRateTypeOvertime').val(description);
           $('#add-rateype-title').text('Edit Rate Type Details');

          }
          else if(selectLineID == 'edtRateType'){
            $('#edtRateDescription').val(description);
            $('#edtRateID').val(ratetypeid);
            $('#edtRateType').val(description);
            $('#add-rateype-title').text('Edit Rate Type Details');

           }

          else if(selectLineID == 'edtRateTypeTermnination'){
            $('#edtRateDescription').val(description);
            $('#edtRateID').val(ratetypeid);
            $('#edtRateTypeTermnination').val(description);
            $('#add-rateype-title').text('Edit Rate Type Details');

           }

           else if(selectLineID == 'edtRateTypeLumpSumE'){
            $('#edtRateDescription').val(description);
            $('#edtRateID').val(ratetypeid);
            $('#edtRateTypeLumpSumE').val(description);
            $('#add-rateype-title').text('Edit Rate Type Details');

           }

          else  if(selectLineID == 'edtRateTypeBonusesCommissions'){
            $('#edtRateDescription').val(description);
            $('#edtRateID').val(ratetypeid);
            $('#edtRateTypeBonusesCommissions').val(description);
            $('#add-rateype-title').text('Edit Rate Type Details');

           }

           else if(selectLineID == 'edtRateTypeLumpSumW'){
            $('#edtRateDescription').val(description);
            $('#edtRateID').val(ratetypeid);
            $('#edtRateTypeLumpSumW').val(description);
            $('#add-rateype-title').text('Edit Rate Type Details');

           }

          else if(selectLineID == 'edtRateTypeDirectorsFees'){
            $('#edtRateDescription').val(description);
            $('#edtRateID').val(ratetypeid);
            $('#edtRateTypeDirectorsFees').val(description);
            $('#add-rateype-title').text('Edit Rate Type Details');

           }
           else
           {

           }


          $('#tblratetypelist_filter .form-control-sm').val('');
             setTimeout(function () {
                    $('.btnRefreshRateType').trigger('click');
                    LoadingOverlay.hide();
           }, 1000);
    });

    $(document).on("click", "#tblgrouptypelist tbody tr", function(e) {

        let selectLineID = $('#selectGroupLineID').val()||'edtGroupType';

        var table = $(this);
        let description = table.find(".colgroupDescription").text();
        let ratetypeid = table.find(".colgroupID").text()||0;
        $('#groupTypeListModel').modal('toggle');

          if(selectLineID == 'edtGroupType'){
        //    $('#edtGroupDescription').val(description);

           $('.edtGroupID').val(ratetypeid);
           $('#holidaygroup').val(description);
           $('#holidaygroup2').val(description);
           $('#addexistgroup').val(description);

           $('#add-grouptype-title').text('Edit Group Type Details');

          }

        $('#ttblgrouptypelist_filter .form-control-sm').val('');
        setTimeout(function () {
            $('.btnRefreshGroupType').trigger('click');
            LoadingOverlay.hide();
        }, 1000);
    });

    $(document).on("click", "#tblgrouptypelist1 tbody tr", function(e) {

        let selectLineID = $('#selectGroupLineID1').val()||'edtGroupType';

        var table = $(this);
        let description = table.find(".thgroupDescription").text();
        let ratetypeid = table.find(".thgroupID").text()||0;
        $('#groupTypeListModel1').modal('toggle');

          if(selectLineID == 'edtGroupType'){
        //    $('#edtGroupDescription').val(description);

           $('.edtGroupID').val(ratetypeid);
           $('#holidaygroup').val(description);
           $('#holidaygroup2').val(description);
           $('#addexistgroup').val(description);

           $('#add-grouptype-title').text('Edit Group Type Details');

          }

        $('#ttblgrouptypelist_filter .form-control-sm').val('');
        setTimeout(function () {
            $('.btnRefreshGroupType').trigger('click');
            LoadingOverlay.hide();
        }, 1000);
    });

    $(document).on("click", "#tblgrouptypelist2 tbody tr", function(e) {

        let selectLineID = $('#selectGroupLineID2').val()||'edtGroupType';

        var table = $(this);
        let description = table.find(".thgroupDescription").text();
        let ratetypeid = table.find(".thgroupID").text()||0;
        $('#groupTypeListModel2').modal('toggle');

          if(selectLineID == 'edtGroupType'){
        //    $('#edtGroupDescription').val(description);

           $('.edtGroupID').val(ratetypeid);
           $('#holidaygroup').val(description);
           $('#holidaygroup2').val(description);
           $('#addexistgroup').val(description);

           $('#add-grouptype-title').text('Edit Group Type Details');

          }

        $('#ttblgrouptypelist_filter .form-control-sm').val('');
        setTimeout(function () {
            $('.btnRefreshGroupType').trigger('click');
            LoadingOverlay.hide();
        }, 1000);
    });

    $(document).on("click", "#tblfundtypelist tbody tr", function(e) {

        let selectLineID = $('#selectFundLineID').val()||'edtFundType';

        var table = $(this);
        let description = table.find(".colfundDescription").text();
        let fundid = table.find(".colfundID").text()||0;
        $('#fundtypeid').val(fundid);
        $('#fundTypeListModel').modal('toggle');

          if(selectLineID == 'edtFundType') {
           $('.edtFundDescription').val(description);
           $('#edtfundID').val(fundid);
           $('#edtFundType').val(description);
           $('#add-fundype-title').text('Edit Fund Type Details');

          }

        //   if(description == "Self-Managed Superannuation Fund") {
            if(description == "Employee Optional") {
              $('#acountabmandelectronic').css('display','block');
              $('#edtabn').css('display','block');
              $('#accountbsb').css('display','block');
              $('#account_name').css('display','block');
          } else {
              $('#acountabmandelectronic').css('display','none');
              $('#edtabn').css('display','none');
              $('#accountbsb').css('display','none');
              $('#account_name').css('display','none');
          }

        $('#tblfundtypelist_filter .form-control-sm').val('');
        setTimeout(function () {
            $('.btnRefreshFundType').trigger('click');
            LoadingOverlay.hide();
        }, 1000);
    });

    $(document).on("click", "#tblPayCalendars tbody tr td:not(.colAction) ", function(e) {

        let status = $(this).closest('tr').find(".colStatus").text();
        if(status == '') {
            status = 0;
        } else {
            status = 1;
        }
        let calender_id =   $(this).closest('tr').attr('id');
        let calenderName =  $(this).closest('tr').find(".colPayCalendarName").text()||'';
        let payperiod =     $(this).closest('tr').find(".colPayPeriod").text()||'';
        let NextPayPeriod = $(this).closest('tr').find(".colNextPayPeriod").text()||'';
        let NextPaymentdate = $(this).closest('tr').find(".colNextPaymentDate").text()||'';

        $('#newPayCalendarLabel').text('Edit Calender Details');
        $('#paycalendarId').val(calender_id);
        $('.calender_name').val(calenderName);
        $('#calender_name').val(calenderName);
        $('#payperiod').val(payperiod);
        $('#edtStartDate').val(NextPayPeriod);
        $('#edtFirstPaymentDate').val(NextPaymentdate);
        $('.updateCalendarInActive').addClass('d-none');
        $('.updateCalendarActive').addClass('d-none');

        if(status == 1) {
            $('.updateCalendarActive').removeClass('d-none');
            $('.updateCalendarActive').show();
            $('.updateCalendarInActive').addClass('d-none');
            $('.updateCalendarInActive').hide();
        } else {
            $('.updateCalendarInActive').removeClass('d-none');
            $('.updateCalendarInActive').show();
            $('.updateCalendarActive').addClass('d-none');
            $('.updateCalendarActive').hide();
        }

        $('#newPayCalendarModal').modal('toggle');
        $('.body-panel').removeClass('d-none');

    });

    $(document).on("click", "#tblHolidays tbody tr td:not(.colHolidayDelete) ", function(e) {


        let holiday_id = $(this).closest('tr').attr('id');
        let holidayName = $(this).closest('tr').find(".colHolidayName").text()||'';
        let holiday_date = $(this).closest('tr').find(".colHolidayDate").text()||'';
        let holidaygroup = $(this).closest('tr').find(".colHolidaygroup").text() || '';
        let status = $(this).closest('tr').find('.colStatus').text();

        if(status != "") {
            $('.updateHolidayActive').removeClass('d-none');
            $('.updateHolidayActive').show();
            $('.updateHolidayInActive').addClass('d-none');
            $('.updateHolidayInActive').hide();
        } else {
            $('.updateHolidayInActive').removeClass('d-none');
            $('.updateHolidayInActive').show();
            $('.updateHolidayActive').addClass('d-none');
            $('.updateHolidayActive').hide();
        }

        $('#newHolidayLabel').text('Edit Holiday Details');
        $('#holidayid').val(holiday_id);
        $('.holidayname').val(holidayName);
        $('#edtHolidayDate').val(holiday_date);
        $('#holidaygroup').val(holidaygroup);
        $('.holiday-group').addClass(' d-none');
        $('#newHolidayModal').modal('toggle');

    });

    $(document).on("click", "#tblSuperannuation tbody tr td:not(.colDeletesup)", function(e) {
        let status = 0;
            status = $(this).closest('tr').find(".colStatus").text() == "" ? 1 : 0;

        var table = $(this);
        let super_id = $(this).closest('tr').attr('id');
        let super_name = $(this).closest('tr').find(".colSuperannuationName").text()||'';
        let super_type = $(this).closest('tr').find(".colSuperannuationType").text()||'';
        let super_employe_num = $(this).closest('tr').find(".colEmployerNum").text() || '';
        let super_abn = $(this).closest('tr').find(".colabn").text();
        let super_service = $(this).closest('tr').find(".colservicealias").text()||'';
        let super_bsb = $(this).closest('tr').find(".colbsb").text()||'';
        let super_account_number = $(this).closest('tr').find(".colaccountnumber").text() || '';
        let super_account_name = $(this).closest('tr').find(".colaccountname").text()||'';
        let fund_id = $(this).closest('tr').find(".colSuperannuationTypeid").text() || '';


        if(super_type == 'Self-Managed Superannuation Fund')
        {
            $('#acountabmandelectronic').css('display','block');
            $('#accountbsb').css('display','block');
            $('#account_name').css('display','block');
        }
        else
        {   $('#acountabmandelectronic').css('display','none');
            $('#accountbsb').css('display','none');
            $('#account_name').css('display','none');
        }
        $('#superannuationactive').css('display','none');

        if(status == 0) {
            $('.updateSuperannuationActive').removeClass('d-none');
            $('.updateSuperannuationActive').show();
            $('.updateSuperannuationInActive').addClass('d-none');
            $('.updateSuperannuationInActive').hide();
        } else {
            $('.updateSuperannuationInActive').removeClass('d-none');
            $('.updateSuperannuationInActive').show();
            $('.updateSuperannuationActive').addClass('d-none');
            $('.updateSuperannuationActive').hide();
        }

        $('#superannuationactive').val(status);
        $('#newSuperannuationFundLabel').text('Edit Superannuation Details');
        $('#newSuperannuationFundId').val(super_id);
        $('.edtFundName').val(super_name);
        $('#edtFundType').val(super_type);
        $('#edtabn').val(super_abn);
        $('#edtelectronicsalias').val(super_service);
        $('.edtEmployerNumber').val(super_employe_num);
        $('#edtaccountnumber').val(super_account_number);
        $('#edtbsb').val(super_bsb);
        $('#edtaccountname').val(super_account_name);
        $('#newSuperannuationFundModal').modal('toggle');
        $('#fundtypeid').val(fund_id);
    });

    $(document).on("click", "#tblReimbursements tbody tr td:not(.colDeleterei)", function(e) {

        var table = $(this);
        let id = $(this).closest('tr').find(".colReimbursementID").text() || 0;
        let name = $(this).closest('tr').find(".colReimbursementName").text()||'';
        let account = $(this).closest('tr').find(".colReimbursementAccount").text()||'';
        let status = $(this).closest('tr').find(".colStatus").text();

        if(status != "") {
            $('.updateReimbursementActive').removeClass('d-none');
            $('.updateReimbursementActive').show();
            $('.updateReimbursementInActive').addClass('d-none');
            $('.updateReimbursementInActive').hide();
        } else {
            $('.updateReimbursementInActive').removeClass('d-none');
            $('.updateReimbursementInActive').show();
            $('.updateReimbursementActive').addClass('d-none');
            $('.updateReimbursementActive').hide();
        }

        $('#newReimbursementLabel').text('Edit Reimbursement Details');
        $('#res_id').val(id);
        $('.edtReimbursementName').val(name);
        $('#edtReimbursementAccount').val(account);
        $('#newReimbursementModal').modal('toggle');

    });

    $(document).on("click", "#tblLeave tbody tr td:not(.colDeletepaidrem)", function(e) {
        var table = $(this);
        let id = $(this).closest('tr').find(".colLeaveID").text() || 0;
        let colLeaveName = $(this).closest('tr').find(".colLeaveName").text()||'';
        let colLeaveUnits = $(this).closest('tr').find(".colLeaveUnits").text()||'';
        let colLeaveNormalEntitlement = $(this).closest('tr').find(".colLeaveNormalEntitlement").text() || 0;
        let colLeaveLeaveLoadingRate = $(this).closest('tr').find(".colLeaveLeaveLoadingRate").text()||'';
        let colLeavePaidLeave = $(this).closest('tr').find(".colLeavePaidLeave").text()|| '';
        let colLeaveShownOnPayslip = $(this).closest('tr').find(".colLeaveShownOnPayslip").text()|| 'hide';
        let status = $(this).closest('tr').find('.colStatus').text();

        if(status != "") {
            $('.updateLeaveActive').removeClass('d-none');
            $('.updateLeaveActive').show();
            $('.updateLeaveInActive').addClass('d-none');
            $('.updateLeaveInActive').hide();
        } else {
            $('.updateLeaveInActive').removeClass('d-none');
            $('.updateLeaveInActive').show();
            $('.updateLeaveActive').addClass('d-none');
            $('.updateLeaveActive').hide();
        }

        if(colLeavePaidLeave === 'paid') {
            $('#paidLeaveLabel').text('Edit Paid Leave Details');
        } else{
            $('#unpaidLeaveLabel').text('Edit UnPaid Leave Details');
        }

        $('#paidleaveid').val(id);
        $('.edtLeaveName').val(colLeaveName);
        $('#edtLeaveType').val(colLeavePaidLeave);
        $('#edtTypeOfUnits').val(colLeaveUnits);
        $('.edtLeaveLoadingRate').val(colLeaveLeaveLoadingRate);
        $('.edtNormalEntitlement').val(colLeaveNormalEntitlement);
        if(colLeaveShownOnPayslip == 'show') {
            $('#formCheck-ShowBalance').attr('checked', 'checked');
        } else {
            $('#formCheck-ShowBalance').removeAttr('checked');;
        }
        $('#paidLeaveModal').modal('toggle');
    });

    $(document).on("click", "#tblEarnings tbody tr td:not(.colDeleteEarnings)", function(e) {
        var table = $(this);
        let id = $(this).closest('tr').find(".colEarningsID").text() || 0;
        let colEarningsNames = $(this).closest('tr').find(".colEarningsNames").text()||'';
        let colEarningsType = $(this).closest('tr').find(".colEarningsType").text()||'';
        let colEarningsDisplayName = $(this).closest('tr').find(".colEarningsDisplayName").text() || '';
        let colEarningsAmount = $(this).closest('tr').find(".colEarningsAmount").text()||'';
        let colEarningsAccounts = $(this).closest('tr').find(".colEarningsAccounts").text()|| '';
        let colEarningsratetype = $(this).closest('tr').find(".colEarningsratetype").text()|| '';
        let colEarningsAccountsID = $(this).closest('tr').find(".colEarningsAccountsID").text()|| '';
        let colEarningsPAYG = $(this).closest('tr').find(".colEarningsPAYG").text()|| false;
        let colEarningsSuperannuation = $(this).closest('tr').find(".colEarningsSuperannuation").text()|| false;
        let colEarningsReportableasW1 = $(this).closest('tr').find(".colEarningsReportableasW1").text()|| false;

        if(colEarningsType === 'Ordinary Time Earning')
        {
            $('#ordinaryTimeEarningsLabel').text('Edit Ordinary Time Earnings Details');
            $('#ordinaryTimeEarningsid').val(id);
            $('#edtEarningsName').val(colEarningsNames);
            $('#edtDisplayName').val(colEarningsDisplayName);
            $('#edtRateType').val(colEarningsratetype);
            $('#edtExpenseAccount').val(colEarningsAccounts);
            if(colEarningsPAYG == true)
            {
                $('#formCheck-ShowBalance').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ShowBalance').removeAttr('checked');
            }
            if(colEarningsSuperannuation == true)
            {
                $('#formCheck-ExemptSuperannuation').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptSuperannuation').removeAttr('checked');
            }
            if(colEarningsReportableasW1 == true)
            {
                $('#formCheck-ExemptReportable').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptReportable').removeAttr('checked');
            }
            $('#ordinaryTimeEarningsModal').modal('toggle');
        }
        else if(colEarningsType === 'OverTime Earning'){
            $('#overtimeEarningsLabel').text('Edit Over Time Earnings Details');
            $('#edtEarningsNameOvertimeid').val(id);
            $('#edtEarningsNameOvertime').val(colEarningsNames);
            $('#edtDisplayNameOvertime').val(colEarningsDisplayName);
            $('#edtRateTypeOvertime').val(colEarningsratetype);
            $('#edtExpenseAccountOvertime').val(colEarningsAccounts);
            if(colEarningsPAYG == true)
            {
                $('#formCheck-ExemptPAYGOvertime').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptPAYGOvertime').removeAttr('checked');
            }
            if(colEarningsSuperannuation == true)
            {
                $('#formCheck-ExemptSuperannuationOvertime').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptSuperannuationOvertime').removeAttr('checked');
            }
            if(colEarningsReportableasW1 == true)
            {
                $('#formCheck-ExemptReportableOvertime').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptReportableOvertime').removeAttr('checked');
            }
            $('#add-overtimeEarningsModal').modal('toggle');
        }
        else if(colEarningsType === 'Employee Termnination'){
            $('#employmentTermninationPaymentsLabel').text('Edit Employment Termnination Payments Details');
            $('#edtemploymentTermninationid').val(id);
            $('#edtEarningsNameTermnination').val(colEarningsNames);
            $('#edtDisplayNameTermnination').val(colEarningsDisplayName);
            $('#edtRateTypeTermnination').val(colEarningsratetype);
            $('#edtExpenseAccountTermnination').val(colEarningsAccounts);
            if(colEarningsPAYG == true)
            {
                $('#formCheck-ExemptPAYGTermnination').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptPAYGTermnination').removeAttr('checked');
            }
            if(colEarningsSuperannuation == true)
            {
                $('#formCheck-ExemptSuperannuationTermnination').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptSuperannuationTermnination').removeAttr('checked');
            }
            if(colEarningsReportableasW1 == true)
            {
                $('#formCheck-ExemptReportableTermnination').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptReportableTermnination').removeAttr('checked');
            }
            $('#employmentTermninationPaymentsModal').modal('toggle');
        }
        else if(colEarningsType === 'Lump Sum E Earning'){
            $('#lumpSumELabel').text('Edit Lump Sum E Details');
            $('#edtLumpSumid').val(id);
            $('#edtEarningsNameLumpSumE').val(colEarningsNames);
            $('#edtDisplayNameLumpSumE').val(colEarningsDisplayName);
            $('#edtRateTypeLumpSumE').val(colEarningsratetype);
            $('#edtExpenseAccountLumpSumE').val(colEarningsAccounts);
            if(colEarningsPAYG == true)
            {
                $('#formCheck-ExemptPAYGLumpSumE').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptPAYGLumpSumE').removeAttr('checked');;
            }
            if(colEarningsSuperannuation == true)
            {
                $('#formCheck-ExemptSuperannuationLumpSumE').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptSuperannuationLumpSumE').removeAttr('checked');
            }
            if(colEarningsReportableasW1 == true)
            {
                $('#formCheck-ExemptReportableLumpSumE').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptReportableLumpSumE').removeAttr('checked');
            }
            $('#lumpSumEModal').modal('toggle');
        }
        else if(colEarningsType === 'Bonuese Commission'){
            $('#bonusesCommissionsLabel').text('Edit Bonuses & Commissions Details');
            $('#edtEarningsNameBonusesCommissionid').val(id);
            $('#edtEarningsNameBonusesCommissions').val(colEarningsNames);
            $('#edtDisplayNameBonusesCommissions').val(colEarningsDisplayName);
            $('#edtRateTypeBonusesCommissions').val(colEarningsratetype);
            $('#edtExpenseAccountBonusesCommissions').val(colEarningsAccounts);
            if(colEarningsPAYG == true)
            {
                $('#formCheck-ExemptPAYGBonusesCommissions').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptPAYGBonusesCommissions').removeAttr('checked');
            }
            if(colEarningsSuperannuation == true)
            {
                $('#formCheck-ExemptSuperannuationBonusesCommissions').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptSuperannuationBonusesCommissions').removeAttr('checked');
            }
            if(colEarningsReportableasW1 == true)
            {
                $('#formCheck-ExemptReportableBonusesCommissions').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptReportableBonusesCommissions').removeAttr('checked');
            }
            $('#bonusesCommissionsModal').modal('toggle');
        }
        else if(colEarningsType === 'Lump Sumw'){
            $('#lumpSumWLabel').text('Edit Lump Sum W Details');
            $('#edtEarningsNameLumpSumWid').val(id);
            $('#edtEarningsNameLumpSumW').val(colEarningsNames);
            $('#edtDisplayNameLumpSumW').val(colEarningsDisplayName);
            $('#edtRateTypeLumpSumW').val(colEarningsratetype);
            $('#edtExpenseAccountLumpSumW').val(colEarningsAccounts);
            if(colEarningsPAYG == true)
            {
                $('#formCheck-ExemptPAYGLumpSumW').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptPAYGLumpSumW').removeAttr('checked');
            }
            if(colEarningsSuperannuation == true)
            {
                $('#formCheck-ExemptSuperannuationLumpSumW').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptSuperannuationLumpSumW').removeAttr('checked');
            }
            if(colEarningsReportableasW1 == true)
            {
                $('#formCheck-ExemptReportableLumpSumW').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptReportableLumpSumW').removeAttr('checked');
            }
            $('#lumpSumWModal').modal('toggle');
        }
        else{
            $('#directorsFeesLabel').text('Edit Directors Fees Details');
            $('#edtEarningsDirectorsFeesid').val(id);
            $('#edtEarningsNameDirectorsFees').val(colEarningsNames);
            $('#edtDisplayNameDirectorsFees').val(colEarningsDisplayName);
            $('#edtRateTypeDirectorsFees').val(colEarningsratetype);
            $('#edtExpenseAccountDirectorsFees').val(colEarningsAccounts);
            if(colEarningsPAYG == true)
            {
                $('#formCheck-ExemptPAYGDirectorsFees').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptPAYGDirectorsFees').removeAttr('checked');
            }
            if(colEarningsSuperannuation == true)
            {
                $('#formCheck-ExemptSuperannuationDirectorsFees').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptSuperannuationDirectorsFees').removeAttr('checked');
            }
            if(colEarningsReportableasW1 == true)
            {
                $('#formCheck-ExemptReportableDirectorsFees').attr('checked', 'checked');
            }
            else
            {
                $('#formCheck-ExemptReportableDirectorsFees').removeAttr('checked');
            }
            $('#directorsFeesModal').modal('toggle');
        }
    });

    $(document).on("click", "#tblAccountListPop tbody tr", function(e) {
        let selectLineID = $('#selectLineID').val();
        var tr = $(this);
          let accountname = tr.find(".colAccountName").text();
          let accountID = tr.children(".colAccountId").text() || 0;
          $('#accountListModal').modal('toggle');

          if(selectLineID == 'edtExpenseAccountAllowance'){
            $('#edtExpenseAccountAllowance').val(accountname);
            $('#edtExpenseAccountID').val(accountID);
          }
          else if(selectLineID == 'edtDeductionAccount'){
            $('#edtDeductionAccount').val(accountname);
            $('#edtDeductionAccountID').val(accountID);
          }
          else if(selectLineID == 'edtExpenseAccountTermnination'){
                  $('#edtExpenseAccountTermnination').val(accountname);
                  $('#edtExpenseAccountID').val(accountID);
          }
          else if(selectLineID == 'edtExpenseAccountDirectorsFees'){
                   $('#edtExpenseAccountDirectorsFees').val(accountname);
                   $('#edtExpenseAccountID').val(accountID);
          }
          else if(selectLineID == 'edtExpenseAccount'){
                  $('#edtExpenseAccount').val(accountname);
                  $('#edtExpenseAccountID').val(accountID);
          }
          else if(selectLineID == 'edtExpenseAccountOvertime'){
                  $('#edtExpenseAccountOvertime').val(accountname);
                  $('#edtExpenseAccountID').val(accountID);
          }
          else if(selectLineID == 'edtExpenseAccountLumpSumE'){
                  $('#edtExpenseAccountLumpSumE').val(accountname);
                  $('#edtExpenseAccountID').val(accountID);
          }
          else if(selectLineID == 'edtExpenseAccountBonusesCommissions'){
                  $('#edtExpenseAccountBonusesCommissions').val(accountname);
                  $('#edtExpenseAccountID').val(accountID);
          }
          else if(selectLineID == 'edtExpenseAccountLumpSumW'){
                  $('#edtExpenseAccountLumpSumW').val(accountname);
                  $('#edtExpenseAccountID').val(accountID);
          }
          else if(selectLineID == 'editbankaccount'){
                  $('#editbankaccount').val(accountname);
                  $('#edtExpenseAccountID').val(accountID);
          }
          else if(selectLineID == 'editpaygbankaccount'){
                  $('#editpaygbankaccount').val(accountname);
                  $('#edtExpenseAccountID').val(accountID);
          }
          else if(selectLineID == 'edtReimbursementAccount'){
                  $('#edtReimbursementAccount').val(accountname);
                  $('#edtExpenseAccountID').val(accountID);
          }
          else if(selectLineID == 'editwagesexpbankaccount'){
                  $('#editwagesexpbankaccount').val(accountname);
                  $('#edtExpenseAccountID').val(accountID);
          }
          else if(selectLineID == 'editwagespaybankaccount'){
                  $('#editwagespaybankaccount').val(accountname);
                  $('#edtExpenseAccountID').val(accountID);
          }
          else if(selectLineID == 'editsuperliabbankaccount'){
                  $('#editsuperliabbankaccount').val(accountname);
                  $('#edtExpenseAccountID').val(accountID);
          }
          else if (selectLineID == 'editsuperexpbankaccount'){
                  $('#editsuperexpbankaccount').val(accountname);
                  $('#edtExpenseAccountID').val(accountID);
          }
          else
          {

          }


        $('#tblAccount_filter .form-control-sm').val('');
        setTimeout(function () {
            $('.btnRefreshAccount').trigger('click');
            LoadingOverlay.hide();
        }, 1000);
    });

    $(document).on("click", "#tblRatePopList tbody tr", function(e) {
        let updatedValue = $(this).find(".colRateName").text();
        $('#rateList').val(updatedValue);
        switch(updatedValue) {
            case 'Normal':
                $('.greaterThanDiv').css('display', 'block');
                $('.weekendDiv').css('display', 'none');
            break;
            case 'Time & Half':
                $('.greaterThanDiv').css('display', 'block');
                $('.weekendDiv').css('display', 'none');
            break;
            case 'Double Time':
                $('.greaterThanDiv').css('display', 'block');
                $('.weekendDiv').css('display', 'none');
            break;
            case 'Weekend':
                $('.weekendDiv').css('display', 'block');
                $('.greaterThanDiv').css('display', 'none');
            break;
            default:
                $('.greaterThanDiv').css('display', 'block');
                $('.weekendDiv').css('display', 'none');
        }
        $('#ratePopModal').modal('toggle');
    });
    $("#tblOverTimeSheet tbody").on("click", "tr", function() {
        var id = $(this).closest("tr").attr("id");
        templateObject.openOvertimeEditor(id);
    })
});

Template.payrollrules.events({
    'click .btnAddNewPayCalender':function(){
        if( !$(".updateCalendarInActive").hasClass("d-none") || !$('.updateCalendarActive').hasClass('d-none')) {
            if(!$(".updateCalendarInActive").hasClass("d-none"))
                $(".updateCalendarInActive").addClass('d-none');
            else 
                $(".updateCalendarActive").addClass('d-none');
        }
        // if(!$('.body-panel').hasClass('d-none')) {
        //     $('.body-panel').addClass('d-none');
        // }
        let id = $('#paycalendarId').val();
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = dd+'/'+mm+'/'+ yyyy;
        $('#edtStartDate').val(today);
        $('#paycalendarId').val(0);
        $('#calender_name').val('');
        $('#newPayCalendarLabel').text('Add New Pay Calender');
        $('#payperiod').val('');
        $('.footer-label').html('');
        $('#edtFirstPaymentDate').val('');
    },

    'click .btnAddNewAllowance':function(){
        if( !$(".updateAllowanceInActive").hasClass("d-none") || !$('.updateAllowanceActive').hasClass('d-none')) {
            if(!$(".updateAllowanceInActive").hasClass("d-none"))
                $(".updateAllowanceInActive").addClass('d-none');
            else 
                $(".updateAllowanceActive").addClass('d-none');
        }

        $('#edtAllowanceID').val(0);
        $('#edtAllowanceType').val('');
        $('#edtEarningsNameAllowance').val('');
        $('#edtDisplayNameAllowance').val('');
        $('#edtAllowanceAmount').val('');
        $('#edtExpenseAccountAllowance').val('');
        $('#formCheck-ExemptPAYGAllowance').removeAttr('checked');
        $('#formCheck-ExemptSuperannuationAllowance').removeAttr('checked');
        $('#formCheck-ExemptReportableAllowance').removeAttr('checked');
    },

    'click .btnAddNewHoliday':function(){
        if( !$(".updateHolidayInActive").hasClass("d-none") || !$('.updateHolidayActive').hasClass('d-none')) {
            if(!$(".updateHolidayInActive").hasClass("d-none"))
                $(".updateHolidayInActive").addClass('d-none');
            else 
                $(".updateHolidayActive").addClass('d-none');
        }

        let id = $('#holidayid').val();
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        $('.holiday-group').removeClass(' d-none');

        // today = yyyy+'-'+mm+'-'+dd;
        today = dd+'/'+mm+'/'+yyyy;

        $('#edtHolidayDate').val(today);
        $('#holidayname').val('');
        $('#holidayid').val(0);
        $('#holidaygroup').val('');
        $('#newHolidayLabel').text('Add New Holiday');
    },
    
    'click .updateHolidayActive': function () {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        let taxRateService = new TaxRateService();
        let holidayname = $('.holidayname').val() || '';
        let edtHolidayDate = $('#edtHolidayDate').val() || '';
        let holidaygroup = $('#holidaygroup').val() || '';
        let oldholiday = $('#holidayid').val() || 0 ;
        
        if (holidayname === '') {
            LoadingOverlay.hide();
            swal('Holiday name has not been selected!', '', 'warning');
            e.preventDefault();
        } else if(edtHolidayDate === '') {
            LoadingOverlay.hide();
            swal('Holiday Date has not been selected!', '', 'warning');
            e.preventDefault();
        } else {
            LoadingOverlay.show();
            objDetails = {
                        type: "Tpayrollholidays",
                        fields: {
                            ID: parseInt(oldholiday),
                            PayrollHolidaysName:holidayname,
                            PayrollHolidaysGroupName:holidaygroup,
                            PayrollHolidaysDate:moment(edtHolidayDate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                            PayrollHolidaysActive: true
                        }
            };
            taxRateService.saveHoliday(objDetails).then(function (objDetails) {
                LoadingOverlay.hide();
                swal({
                    title: 'Success',
                    text: 'Holiday Active successfully.',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'
                }).then((result) => {
                    if (result.value) {
                        sideBarService.getHolidayData(initialBaseDataLoad, 0).then(function (dataReload) {
                            addVS1Data("TPayrollHolidays", JSON.stringify(dataReload)).then(function (datareturn) {
                                $('#addholdayhide').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=holiday','_self');
                            }).catch(function (err) {
                                $('#addholdayhide').trigger('click');
                            LoadingOverlay.show();
                                window.open('/payrollrules?active_key=holiday','_self');
                            });
                        }).catch(function (err) {
                            $('#addholdayhide').trigger('click');
                            LoadingOverlay.show();
                            window.open('/payrollrules?active_key=holiday','_self');
                        });
                    }else if (result.dismiss === 'cancel') {
                    }
                });
            }).catch(function (err) {
                LoadingOverlay.hide();
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: true,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                    }else if (result.dismiss === 'cancel') {
                    }
                });
            });
        }
    },

    'click .updateHolidayInActive':function () {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        let taxRateService = new TaxRateService();
        let holidayname = $('.holidayname').val() || '';
        let edtHolidayDate = $('#edtHolidayDate').val() || '';
        let holidaygroup = $('#holidaygroup').val() || '';
        let oldholiday = $('#holidayid').val() || 0 ;
        
        if (holidayname === '') {
            LoadingOverlay.hide();
            swal('Holiday name has not been selected!', '', 'warning');
            e.preventDefault();
        } else if(edtHolidayDate === '') {
            LoadingOverlay.hide();
            swal('Holiday Date has not been selected!', '', 'warning');
            e.preventDefault();
        } else {
            LoadingOverlay.show();
            objDetails = {
                        type: "Tpayrollholidays",
                        fields: {
                            ID: parseInt(oldholiday),
                            PayrollHolidaysName:holidayname,
                            PayrollHolidaysGroupName:holidaygroup,
                            PayrollHolidaysDate:moment(edtHolidayDate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                            PayrollHolidaysActive: false
                        }
            };
            taxRateService.saveHoliday(objDetails).then(function (objDetails) {
                LoadingOverlay.hide();
                swal({
                    title: 'Success',
                    text: 'Holiday In Active successfully.',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'
                }).then((result) => {
                    if (result.value) {
                        sideBarService.getHolidayData(initialBaseDataLoad, 0).then(function (dataReload) {
                            addVS1Data("TPayrollHolidays", JSON.stringify(dataReload)).then(function (datareturn) {
                                $('#addholdayhide').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=holiday','_self');
                            }).catch(function (err) {
                                $('#addholdayhide').trigger('click');
                            LoadingOverlay.show();
                                window.open('/payrollrules?active_key=holiday','_self');
                            });
                        }).catch(function (err) {
                            $('#addholdayhide').trigger('click');
                            LoadingOverlay.show();
                            window.open('/payrollrules?active_key=holiday','_self');
                        });
                    }else if (result.dismiss === 'cancel') {
                    }
                });
            }).catch(function (err) {
                LoadingOverlay.hide();
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: true,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                    }else if (result.dismiss === 'cancel') {
                    }
                });
            });
        }
    },

    'click #btnEarnings': function() {
        document.getElementById("allowances").style.display = "none";
        document.getElementById("earnings").style.display = "block";
        document.getElementById("deductions").style.display = "none";
        document.getElementById("reimbursements").style.display = "none";
        document.getElementById("leave").style.display = "none";
    },

    'click #btnAllowances': function() {
        document.getElementById("allowances").style.display = "block";
        document.getElementById("earnings").style.display = "none";
        document.getElementById("deductions").style.display = "none";
        document.getElementById("reimbursements").style.display = "none";
        document.getElementById("leave").style.display = "none";
    },
    'click #btnDeductions': function() {
        document.getElementById("allowances").style.display = "none";
        document.getElementById("earnings").style.display = "none";
        document.getElementById("deductions").style.display = "block";
        document.getElementById("reimbursements").style.display = "none";
        document.getElementById("leave").style.display = "none";
    },
    'click #btnReiumbursement': function() {
        document.getElementById("allowances").style.display = "none";
        document.getElementById("earnings").style.display = "none";
        document.getElementById("deductions").style.display = "none";
        document.getElementById("reimbursements").style.display = "block";
        document.getElementById("leave").style.display = "none";
    },
    'click #btnLeave': function() {
        document.getElementById("allowances").style.display = "none";
        document.getElementById("earnings").style.display = "none";
        document.getElementById("deductions").style.display = "none";
        document.getElementById("reimbursements").style.display = "none";
        document.getElementById("leave").style.display = "block";
    },
    'click .btnRefresh': function() {
        // $('.fullScreenSpin').css('display', 'inline-block');
        location.reload(true);
    },
    'change #ruleModifierInitial': function(event) {
        var optionSelected = $(event.target).val();

        if (optionSelected == "greaterthan") {
            document.getElementById("ruleModifierTimeDiv").style.display = "inline-flex";
            document.getElementById("ruleModifierDayDiv").style.display = "none";
            $("#ruleModifierInitial").addClass("noradiusright");
        } else if (optionSelected == "lessthan") {
            document.getElementById("ruleModifierTimeDiv").style.display = "inline-flex";
            document.getElementById("ruleModifierDayDiv").style.display = "none";
            $("#ruleModifierInitial").addClass("noradiusright");
        } else if (optionSelected == "dayoftheweek") {
            document.getElementById("ruleModifierTimeDiv").style.display = "none";
            document.getElementById("ruleModifierDayDiv").style.display = "inline-flex";
            $("#ruleModifierInitial").addClass("noradiusright");
        } else {
            document.getElementById("ruleModifierTimeDiv").style.display = "none";
            document.getElementById("ruleModifierDayDiv").style.display = "none";
            $("#ruleModifierInitial").removeClass("noradiusright");

        }


    },
    'click #ruleLessThan': function() {
        document.getElementById("ruleConstructOne").value = "Less Than";
        document.getElementById("ruleModifierTimeDiv").style.display = "inline-flex";
        document.getElementById("ruleModifierDay").style.display = "none";
    },
    'click #ruleSpecificDay': function() {
        document.getElementById("ruleConstructOne").value = "Specific Day";
        document.getElementById("ruleModifierTime").style.display = "none";
        document.getElementById("ruleModifierDay").style.display = "inline-flex";
    },

    'click .addholiday':function(){
        let templateObject = Template.instance();
        LoadingOverlay.show();
        let taxRateService = new TaxRateService();
        let holidayname = $('.holidayname').val() || '';
        let edtHolidayDate = $('#edtHolidayDate').val() || '';
        let holidaygroup = $('#holidaygroup').val() || '';
        let oldholiday = $('#holidayid').val() || 0 ;
        
        if (holidayname === '') {
            LoadingOverlay.hide();
            swal('Holiday name has not been selected!', '', 'warning');
            e.preventDefault();
        } else if(edtHolidayDate === '') {
            LoadingOverlay.hide();
            swal('Holiday Date has not been selected!', '', 'warning');
            e.preventDefault();
        } else {
            if(oldholiday != 0)
            {
                LoadingOverlay.show();
                objDetails = {
                        type: "Tpayrollholidays",
                        fields: {
                            ID: parseInt(oldholiday),
                            PayrollHolidaysName:holidayname,
                            PayrollHolidaysGroupName:holidaygroup,
                            PayrollHolidaysDate:moment(edtHolidayDate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                            PayrollHolidaysActive:true
                        }
                };
                taxRateService.saveHoliday(objDetails).then(function (objDetails) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Success',
                            text: 'Holiday saved successfully.',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'
                        }).then((result) => {
                            if (result.value) {
                                sideBarService.getHolidayData(initialBaseDataLoad, 0).then(function (dataReload) {
                                    addVS1Data("TPayrollHolidays", JSON.stringify(dataReload)).then(function (datareturn) {
                                        $('#addholdayhide').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=holiday','_self');
                                    }).catch(function (err) {
                                        $('#addholdayhide').trigger('click');
                                    LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=holiday','_self');
                                    });
                                }).catch(function (err) {
                                    $('#addholdayhide').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=holiday','_self');
                                });
                            }else if (result.dismiss === 'cancel') {

                            }
                            });

                }).catch(function (err) {

                        LoadingOverlay.hide();
                        swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: true,
                        confirmButtonText: 'Try Again'
                        }).then((result) => {
                        if (result.value) {

                        }else if (result.dismiss === 'cancel') {

                        }
                        });

                });
            } else
                    {
                        LoadingOverlay.show();
                        taxRateService.checkHolidaybyName(holidayname).then(function (data) {
                            holidayid = data.tpayrollholidays;
                            var tpayholidadata = holidayid[0].fields.ID;

                            objDetails = {
                                type: "Tpayrollholidays",
                                fields: {
                                    ID: parseInt(tpayholidadata),
                                    PayrollHolidaysName:holidayname,
                                    PayrollHolidaysGroupName:holidaygroup,
                                    PayrollHolidaysDate:moment(edtHolidayDate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                                    PayrollHolidaysActive:true
                                }
                            };

                        taxRateService.saveHoliday(objDetails).then(function (objDetails) {

                            LoadingOverlay.hide();
                            swal({
                                title: 'Success',
                                text: 'Holiday saved successfully.',
                                type: 'success',
                                showCancelButton: false,
                                confirmButtonText: 'Done'

                            }).then((result) => {
                                if (result.value) {
                                    sideBarService.getHolidayData(initialBaseDataLoad, 0).then(function (dataReload) {
                                        addVS1Data("TPayrollHolidays", JSON.stringify(dataReload)).then(function (datareturn) {
                                            $('#addholdayhide').trigger('click');
                                            LoadingOverlay.show();
                                            window.open('/payrollrules?active_key=holiday','_self');
                                        }).catch(function (err) {
                                            $('#addholdayhide').trigger('click');
                                            LoadingOverlay.show();
                                            window.open('/payrollrules?active_key=holiday','_self');
                                        });
                                    }).catch(function (err) {
                                        $('#addholdayhide').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=holiday','_self');
                                    });
                                }else if (result.dismiss === 'cancel') {

                                }
                            });

                        }).catch(function (err) {

                                LoadingOverlay.hide();
                                swal({
                                title: 'Oooops...',
                                text: err,
                                type: 'error',
                                showCancelButton: false,
                                confirmButtonText: 'Try Again'
                                }).then((result) => {
                                if (result.value) {
                                } else if (result.dismiss === 'cancel') {
                                }
                                });
                        });

                        }).catch(function (err) {
                                objDetails = {
                                    type: "Tpayrollholidays",
                                    fields: {
                                        PayrollHolidaysName:holidayname,
                                        PayrollHolidaysGroupName:holidaygroup,
                                        PayrollHolidaysDate:moment(edtHolidayDate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                                        PayrollHolidaysActive:true
                                    }
                                };

                                taxRateService.saveHoliday(objDetails).then(function (objDetails) {
                                    LoadingOverlay.hide();
                                    swal({
                                        title: 'Success',
                                        text: 'Holiday saved successfully.',
                                        type: 'success',
                                        showCancelButton: false,
                                        confirmButtonText: 'Done'

                                    }).then((result) => {
                                        if (result.value) {
                                            sideBarService.getHolidayData(initialBaseDataLoad, 0).then(function (dataReload) {
                                                addVS1Data("TPayrollHolidays", JSON.stringify(dataReload)).then(function (datareturn) {
                                                    $('#addholdayhide').trigger('click');
                                                    LoadingOverlay.show();

                                                    window.open('/payrollrules?active_key=holiday','_self');
                                                }).catch(function (err) {

                                                    $('#addholdayhide').trigger('click');
                                                    LoadingOverlay.show();
                                                    window.open('/payrollrules?active_key=holiday','_self');
                                                });
                                            }).catch(function (err) {

                                                $('#addholdayhide').trigger('click');
                                                LoadingOverlay.show();
                                                    window.open('/payrollrules?active_key=holiday','_self');
                                            });
                                        }else if (result.dismiss === 'cancel') {

                                        }
                                    });

                                }).catch(function (err) {

                                        LoadingOverlay.hide();
                                        swal({
                                        title: 'Oooops...',
                                        text: err,
                                        type: 'error',
                                        showCancelButton: false,
                                        confirmButtonText: 'Try Again'
                                        }).then((result) => {
                                        if (result.value) {

                                        } else if (result.dismiss === 'cancel') {

                                        }
                                        });

                                });

                        });
            }
        }
     },

   'click .btnSaveAllowance':function(){
        playSaveAudio();
        let templateObject = Template.instance();
        let taxRateService = new TaxRateService();
        setTimeout(function(){
            LoadingOverlay.show();
            let allowanceID = $('.edtAllowanceID').val()|| 0;
            let allowanceType = $('.edtAllowanceType').val()||'';
            let edtEarningsNameAllowance = $('.edtEarningsNameAllowance').val() || '';
            let displayName = $('.edtDisplayNameAllowance').val();
            let expensesAccount = $('.edtExpenseAccountAllowance').val();
            let amount = $('.edtAllowanceAmount').val();
            let exemptFromPAYG = false;
            let exemptFromSupernation = false;
            let reportableW1ActivityStatement = false;
            let expensesAccountID = $('.edtExpenseAccountID').val()||0;

            if($('#formCheck-ExemptPAYGAllowance').is(':checked')){
                exemptFromPAYG = true;
            }else{
                exemptFromPAYG = false;
            }

            if($('#edtDisplayNameAllowance').val() == '')
            {
                displayName = $('#edtEarningsNameAllowance').val() || '';
            }

            if($('#formCheck-ExemptSuperannuationAllowance').is(':checked')){
                exemptFromSupernation = true;
            } else {
                exemptFromSupernation = false;
            }

            if($('#formCheck-ExemptReportableAllowance').is(':checked')){
                reportableW1ActivityStatement = true;
            } else {
                reportableW1ActivityStatement = false;
            }

            if (edtEarningsNameAllowance === '') {
                LoadingOverlay.hide();
                swal('Allowance Name has not been selected!', '', 'warning');
                e.preventDefault();
            } else if(allowanceType === '') {
                LoadingOverlay.hide();
                swal('Allowance Type has not been selected!', '', 'warning');
                e.preventDefault();
            } else if(expensesAccount === '') {
                LoadingOverlay.hide();
                swal('Expenses Account has not been selected!', '', 'warning');
                e.preventDefault();
            } else if(amount === '') {
                LoadingOverlay.hide();
                swal('Please fill Amount !', '', 'warning');
                e.preventDefault();
            } else {
                if(allowanceID != 0 ) {
                    objDetails = {
                        type: "TAllowance",
                        fields: {
                            ID: parseInt(allowanceID),
                            Active: true,
                            Accountid: expensesAccountID,
                            Accountname: expensesAccount,
                            Amount:Number(amount.replace(/[^0-9.-]+/g, "")) || 0,
                            Basedonid:1,
                            AllowanceType: allowanceType,
                            Description: edtEarningsNameAllowance,
                            DisplayName: displayName,
                            Superinc: exemptFromSupernation,
                            Workcoverexempt: reportableW1ActivityStatement,
                            Payrolltaxexempt: exemptFromPAYG,
                            Displayin:"ok"
                        }
                    };

                    taxRateService.saveAllowance(objDetails).then(function (objDetails) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Success',
                            text: 'Allowance saved Successfully',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'

                        }).then((result) => {
                            if (result.value) {
                                sideBarService.getAllowance(initialBaseDataLoad, 0).then(function (dataReload) {
                                    addVS1Data("TAllowance", JSON.stringify(dataReload)).then(function (datareturn) {
                                        $('#addallowhide').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem','_self');
                                    }).catch(function (err) {
                                        $('#addallowhide').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem','_self');
                                    });
                                }).catch(function (err) {
                                    $('#addallowhide').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=payitem','_self');
                                });
                            }else if (result.dismiss === 'cancel') {

                            }
                        });
                    }).catch(function (err) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'ok'
                        }).then((result) => {
                            if (result.value) {
                            } else if (result.dismiss === 'cancel') {
                            }
                        });
                    });
                } else
                {


                    taxRateService.checkAllowanceByName(edtEarningsNameAllowance).then(function (data) {

                        var  allowancedata = data.tallowance[0];
                        objDetails = {
                            type: "TAllowance",
                            fields: {
                                ID: parseInt(allowancedata.fields.ID),
                                Active: true,
                                Accountid: expensesAccountID,
                                Accountname: expensesAccount,
                                Amount:Number(amount.replace(/[^0-9.-]+/g, "")) || 0,
                                Basedonid:1,
                                AllowanceType: allowanceType,
                                Description: edtEarningsNameAllowance,
                                DisplayName: displayName,
                                Superinc: exemptFromSupernation,
                                Workcoverexempt: reportableW1ActivityStatement,
                                Payrolltaxexempt: exemptFromPAYG,
                                Displayin:"ok"
                            }
                        };



                        taxRateService.saveAllowance(objDetails).then(function (objDetails) {
                            LoadingOverlay.hide();
                            swal({
                                title: 'Success',
                                text: 'Allowance saved Successfully',
                                type: 'success',
                                showCancelButton: false,
                                confirmButtonText: 'Done'

                            }).then((result) => {
                                if (result.value) {
                                    sideBarService.getAllowance(initialBaseDataLoad, 0).then(function (dataReload) {
                                        addVS1Data("TAllowance", JSON.stringify(dataReload)).then(function (datareturn) {
                                            $('#addallowhide').trigger('click');
                                            LoadingOverlay.show();
                                            window.open('/payrollrules?active_key=payitem','_self');
                                        }).catch(function (err) {
                                            $('#addallowhide').trigger('click');
                                            LoadingOverlay.show();
                                            window.open('/payrollrules?active_key=payitem','_self');
                                        });
                                    }).catch(function (err) {
                                        $('#addallowhide').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem','_self');
                                    });
                                }else if (result.dismiss === 'cancel') {

                                }
                            });


                        }).catch(function (err) {
                            LoadingOverlay.hide();
                            swal({
                                title: 'Oooops...',
                                text: err,
                                type: 'error',
                                showCancelButton: false,
                                confirmButtonText: 'ok'
                                }).then((result) => {
                                if (result.value) {
                                } else if (result.dismiss === 'cancel') {
                                }
                                });

                        });
                    }).catch(function (err) {
                        objDetails = {
                            type: "TAllowance",
                            fields: {

                                Active: true,
                                Accountid: expensesAccountID,
                                Accountname: expensesAccount,
                                Amount:Number(amount.replace(/[^0-9.-]+/g, "")) || 0,
                                Basedonid:1,
                                AllowanceType: allowanceType,
                                Description: edtEarningsNameAllowance,
                                DisplayName: displayName,
                                Superinc: exemptFromSupernation,
                                Workcoverexempt: reportableW1ActivityStatement,
                                Payrolltaxexempt: exemptFromPAYG
                            }
                        };

                        taxRateService.saveAllowance(objDetails).then(function (objDetails) {

                            LoadingOverlay.hide();
                            swal({
                                title: 'Success',
                                text: 'Allowance saved Successfully',
                                type: 'success',
                                showCancelButton: false,
                                confirmButtonText: 'Done'

                            }).then((result) => {
                                if (result.value) {
                                    sideBarService.getAllowance(initialBaseDataLoad, 0).then(function (dataReload) {
                                        addVS1Data("TAllowance", JSON.stringify(dataReload)).then(function (datareturn) {
                                            $('#addallowhide').trigger('click');
                                            LoadingOverlay.show();
                                            window.open('/payrollrules?active_key=payitem','_self');
                                        }).catch(function (err) {
                                            $('#addallowhide').trigger('click');
                                            LoadingOverlay.show();
                                            window.open('/payrollrules?active_key=payitem','_self');
                                        });
                                    }).catch(function (err) {
                                        $('#addallowhide').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem','_self');
                                    });
                                }else if (result.dismiss === 'cancel') {

                                }
                            });



                        }).catch(function (err) {
                            LoadingOverlay.hide();
                            swal({
                                title: 'Oooops...',
                                text: err,
                                type: 'error',
                                showCancelButton: false,
                                confirmButtonText: 'ok'
                                }).then((result) => {
                                if (result.value) {
                                } else if (result.dismiss === 'cancel') {
                                }
                                });


                        });
                    });
                }
            }
        }, delayTimeAfterSound);
    },

    'click .updateAlowanceActive': function () {
        playSaveAudio();
        let templateObject = Template.instance();
        let taxRateService = new TaxRateService();
        setTimeout(function(){
            LoadingOverlay.show();
            let allowanceID = $('.edtAllowanceID').val()|| 0;
            let allowanceType = $('.edtAllowanceType').val()||'';
            let edtEarningsNameAllowance = $('.edtEarningsNameAllowance').val() || '';
            let displayName = $('.edtDisplayNameAllowance').val();
            let expensesAccount = $('.edtExpenseAccountAllowance').val();
            let amount = $('.edtAllowanceAmount').val();
            let exemptFromPAYG = false;
            let exemptFromSupernation = false;
            let reportableW1ActivityStatement = false;
            let expensesAccountID = $('.edtExpenseAccountID').val() || 1;

            if($('#formCheck-ExemptPAYGAllowance').is(':checked')){
                exemptFromPAYG = true;
            }else{
                exemptFromPAYG = false;
            }

            if($('#edtDisplayNameAllowance').val() == '')
            {
                displayName = $('#edtEarningsNameAllowance').val() || '';
            }

            if($('#formCheck-ExemptSuperannuationAllowance').is(':checked')){
                exemptFromSupernation = true;
            } else {
                exemptFromSupernation = false;
            }

            if($('#formCheck-ExemptReportableAllowance').is(':checked')){
                reportableW1ActivityStatement = true;
            } else {
                reportableW1ActivityStatement = false;
            }

            if (edtEarningsNameAllowance === '') {
                LoadingOverlay.hide();
                swal('Allowance Name has not been selected!', '', 'warning');
                e.preventDefault();
            } else if(allowanceType === '') {
                LoadingOverlay.hide();
                swal('Allowance Type has not been selected!', '', 'warning');
                e.preventDefault();
            } else if(expensesAccount === '') {
                LoadingOverlay.hide();
                swal('Expenses Account has not been selected!', '', 'warning');
                e.preventDefault();
            } else if(amount === '') {
                LoadingOverlay.hide();
                swal('Please fill Amount !', '', 'warning');
                e.preventDefault();
            } else {
                objDetails = {
                    type: "TAllowance",
                    fields: {
                        ID: parseInt(allowanceID),
                        Active: true,
                        Accountid: expensesAccountID,
                        Accountname: expensesAccount,
                        Amount:Number(amount.replace(/[^0-9.-]+/g, "")) || 0,
                        Basedonid:1,
                        AllowanceType: allowanceType,
                        Description: edtEarningsNameAllowance,
                        DisplayName: displayName,
                        Superinc: exemptFromSupernation,
                        Workcoverexempt: reportableW1ActivityStatement,
                        Payrolltaxexempt: exemptFromPAYG,
                        Displayin:"ok"
                    }
                };

                taxRateService.saveAllowance(objDetails).then(function (objDetails) {
                    LoadingOverlay.hide();
                    swal({
                        title: 'Success',
                        text: 'Allowance Active Successfully',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'

                    }).then((result) => {
                        if (result.value) {
                            sideBarService.getAllowance(initialBaseDataLoad, 0).then(function (dataReload) {
                                addVS1Data("TAllowance", JSON.stringify(dataReload)).then(function (datareturn) {
                                    $('#addallowhide').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=payitem','_self');
                                }).catch(function (err) {
                                    $('#addallowhide').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=payitem','_self');
                                });
                            }).catch(function (err) {
                                $('#addallowhide').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem','_self');
                            });
                        }else if (result.dismiss === 'cancel') {

                        }
                    });
                }).catch(function (err) {
                    LoadingOverlay.hide();
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'ok'
                    }).then((result) => {
                        if (result.value) {
                        } else if (result.dismiss === 'cancel') {
                        }
                    });
                });
            }
        }, delayTimeAfterSound);
    },

    'click .updateAlowanceInActive': function() {
        playSaveAudio();
        let templateObject = Template.instance();
        let taxRateService = new TaxRateService();
        setTimeout(function(){
            LoadingOverlay.show();
            let allowanceID = $('.edtAllowanceID').val()|| 0;
            let allowanceType = $('.edtAllowanceType').val()||'';
            let edtEarningsNameAllowance = $('.edtEarningsNameAllowance').val() || '';
            let displayName = $('.edtDisplayNameAllowance').val();
            let expensesAccount = $('.edtExpenseAccountAllowance').val();
            let amount = $('.edtAllowanceAmount').val();
            let exemptFromPAYG = false;
            let exemptFromSupernation = false;
            let reportableW1ActivityStatement = false;
            let expensesAccountID = $('.edtExpenseAccountID').val() || 1;

            if($('#formCheck-ExemptPAYGAllowance').is(':checked')){
                exemptFromPAYG = true;
            }else{
                exemptFromPAYG = false;
            }

            if($('#edtDisplayNameAllowance').val() == '')
            {
                displayName = $('#edtEarningsNameAllowance').val() || '';
            }

            if($('#formCheck-ExemptSuperannuationAllowance').is(':checked')){
                exemptFromSupernation = true;
            } else {
                exemptFromSupernation = false;
            }

            if($('#formCheck-ExemptReportableAllowance').is(':checked')){
                reportableW1ActivityStatement = true;
            } else {
                reportableW1ActivityStatement = false;
            }

            if (edtEarningsNameAllowance === '') {
                LoadingOverlay.hide();
                swal('Allowance Name has not been selected!', '', 'warning');
                e.preventDefault();
            } else if(allowanceType === '') {
                LoadingOverlay.hide();
                swal('Allowance Type has not been selected!', '', 'warning');
                e.preventDefault();
            } else if(expensesAccount === '') {
                LoadingOverlay.hide();
                swal('Expenses Account has not been selected!', '', 'warning');
                e.preventDefault();
            } else if(amount === '') {
                LoadingOverlay.hide();
                swal('Please fill Amount !', '', 'warning');
                e.preventDefault();
            } else {
                objDetails = {
                    type: "TAllowance",
                    fields: {
                        ID: parseInt(allowanceID),
                        Active: false,
                        Accountid: expensesAccountID,
                        Accountname: expensesAccount,
                        Amount:Number(amount.replace(/[^0-9.-]+/g, "")) || 0,
                        Basedonid:1,
                        AllowanceType: allowanceType,
                        Description: edtEarningsNameAllowance,
                        DisplayName: displayName,
                        Superinc: exemptFromSupernation,
                        Workcoverexempt: reportableW1ActivityStatement,
                        Payrolltaxexempt: exemptFromPAYG,
                        Displayin:"ok"
                    }
                };

                taxRateService.saveAllowance(objDetails).then(function (objDetails) {
                    LoadingOverlay.hide();
                    swal({
                        title: 'Success',
                        text: 'Allowance In Active Successfully',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'

                    }).then((result) => {
                        if (result.value) {
                            sideBarService.getAllowance(initialBaseDataLoad, 0).then(function (dataReload) {
                                addVS1Data("TAllowance", JSON.stringify(dataReload)).then(function (datareturn) {
                                    $('#addallowhide').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=payitem','_self');
                                }).catch(function (err) {
                                    $('#addallowhide').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=payitem','_self');
                                });
                            }).catch(function (err) {
                                $('#addallowhide').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem','_self');
                            });
                        }else if (result.dismiss === 'cancel') {

                        }
                    });
                }).catch(function (err) {
                    LoadingOverlay.hide();
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'ok'
                    }).then((result) => {
                        if (result.value) {
                        } else if (result.dismiss === 'cancel') {
                        }
                    });
                });
            }
        }, delayTimeAfterSound);
    },

    'click .btnSaveRatePOP': (e, templateObject) => {
        playSaveAudio();
        let taxRateService = new TaxRateService();
        setTimeout(function(){
        LoadingOverlay.show();


        let rateTypeId = $('#edtRateID').val()|| 0;
        let ratetypedescription = $('#edtRateDescription').val()||'';

        if (ratetypedescription === '') {
            LoadingOverlay.hide();
            swal('Rate type description can not be blank !', '', 'warning');
            e.preventDefault();
        } else {
            LoadingOverlay.show();
            if(rateTypeId == ""){

                taxRateService.checkRateTypeByName(ratetypedescription).then(function (data) {
                rateTypeId = data.tpayratetype[0].Id;
                objDetails = {
                    type: erpObject.TPayRateType,
                    fields: {
                        ID: parseInt(rateTypeId),
                        Description: ratetypedescription,

                    }
                };

                taxRateService.saveRateType(objDetails).then(function (objDetails) {
                    LoadingOverlay.hide();
                    swal({
                        title: 'Success',
                        text: 'New Rate Type saved Successfully',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'

                    }).then((result) => {
                        if (result.value) {
                            sideBarService.getRateTypes(initialBaseDataLoad, 0).then(function (dataReload) {
                                addVS1Data(erpObject.TPayRateType, JSON.stringify(dataReload)).then(function (datareturn) {
                                    window.open('/payrollrules?active_key=payitem','_self');
                                }).catch(function (err) {
                                    window.open('/payrollrules?active_key=payitem','_self');
                                });
                            }).catch(function (err) {
                                window.open('/payrollrules?active_key=payitem','_self');
                            });
                        }else if (result.dismiss === 'cancel') {

                        }
                    });
                }).catch(function (err) {
                    LoadingOverlay.hide();
                    swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                    }).then((result) => {
                    if (result.value) {
                    } else if (result.dismiss === 'cancel') {

                    }
                    });

                });
                }).catch(function (err) {
                    objDetails = {
                        type: erpObject.TPayRateType,
                        fields: {
                            ID: parseInt(rateTypeId),
                            Description: ratetypedescription,
                        }

                    };

                taxRateService.saveRateType(objDetails).then(function (objDetails) {

                    LoadingOverlay.hide();
                    swal({
                        title: 'Success',
                        text: 'New Rate Type saved Successfully',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'

                    }).then((result) => {
                        if (result.value) {
                            sideBarService.getRateTypes(initialBaseDataLoad, 0).then(function (dataReload) {
                                addVS1Data(erpObject.TPayRateType, JSON.stringify(dataReload)).then(function (datareturn) {
                                    window.open('/payrollrules?active_key=payitem','_self');
                                }).catch(function (err) {
                                    window.open('/payrollrules?active_key=payitem','_self');
                                });
                            }).catch(function (err) {
                                window.open('/payrollrules?active_key=payitem','_self');
                            });
                        }else if (result.dismiss === 'cancel') {

                        }
                    });

                }).catch(function (err) {
                    LoadingOverlay.hide();
                    swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                    }).then((result) => {
                    if (result.value) {
                    } else if (result.dismiss === 'cancel') {

                    }
                    });

                });
                });

            }else{
                objDetails = {
                    type: erpObject.TPayRateType,
                    fields: {
                        ID: parseInt(rateTypeId),
                        Description: ratetypedescription,
                    }

                    };

            taxRateService.saveRateType(objDetails).then(function (objDetails) {

                    LoadingOverlay.hide();
                    swal({
                        title: 'Success',
                        text: 'New Rate Type saved Successfully',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'

                    }).then((result) => {
                        if (result.value) {
                            sideBarService.getRateTypes(initialBaseDataLoad, 0).then(function (dataReload) {
                                addVS1Data(erpObject.TPayRateType, JSON.stringify(dataReload)).then(function (datareturn) {
                                    window.open('/payrollrules?active_key=payitem','_self');
                                }).catch(function (err) {
                                    window.open('/payrollrules?active_key=payitem','_self');
                                });
                            }).catch(function (err) {
                                window.open('/payrollrules?active_key=payitem','_self');
                            });
                        }else if (result.dismiss === 'cancel') {

                        }
                    });

            }).catch(function (err) {
                LoadingOverlay.hide();
                swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
                }).then((result) => {
                if (result.value) {
                } else if (result.dismiss === 'cancel') {

                }
                });

            });
            }


        }
    }, delayTimeAfterSound);
    },

    'click .btnSaveGroup':function(){
        playSaveAudio();
        let templateObject = Template.instance();
        let taxRateService = new TaxRateService();
        setTimeout(function(){
        LoadingOverlay.show();
        let rateTypeId = $('.edtgroupID').val() || 0;
        let ratetypedescription = $('.edtGroupName').val()||'';

        if (ratetypedescription == '') {
            LoadingOverlay.hide(); 
            swal('Group description can not be blank !', '', 'warning');
        }
        else {
            LoadingOverlay.show();
            if(rateTypeId == ""){
                taxRateService.checkGroupByName(ratetypedescription).then(function (data) {
                rateTypeId = data.tpayrollholidaygroup[0].Id || 0;
                objDetails = {
                    type: "TPayrollHolidayGroup",
                    fields: {
                        ID: parseInt(rateTypeId),
                        Groupdesc: ratetypedescription,
                        Groupname: "samplse",
                    }
                };

                taxRateService.saveGroupType(objDetails).then(function (objDetails) {                                                                                      
                    LoadingOverlay.hide();
                    swal({
                        title: 'Success',
                        text: 'New Group saved Successfully',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'

                    }).then((result) => {
                        if (result.value) {
                            sideBarService.getNewGroupListVS1(initialBaseDataLoad, 0).then(function (dataReload) {
                                LoadingOverlay.show();
                                addVS1Data("TPayrollHolidayGroup", JSON.stringify(dataReload)).then(function (datareturn) {
                                    window.open('/payrollrules?active_key=holiday','_self');
                                }).catch(function (err) {
                                    window.open('/payrollrules?active_key=holiday','_self');
                                });
                            }).catch(function (err) {
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=holiday','_self');
                            });
                        }else if (result.dismiss === 'cancel') {

                        }
                    });
                    }).catch(function (err) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                            } else if (result.dismiss === 'cancel') {

                            }
                        });

                    });
                }).catch(function (err) {
                    objDetails = {
                        type: "TPayrollHolidayGroup",
                        fields: {
                            ID: parseInt(rateTypeId),
                            Groupdesc: ratetypedescription,
                            Groupname:ratetypedescription,

                        }
                    };

                taxRateService.saveGroupType(objDetails).then(function (objDetails) {

                    LoadingOverlay.hide();
                    swal({
                        title: 'Success',
                        text: 'New Group saved Successfully',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'

                    }).then((result) => {
                        if (result.value) {
                            sideBarService.getNewGroupListVS1(initialBaseDataLoad, 0).then(function (dataReload) {
                                LoadingOverlay.show();
                                addVS1Data("TPayrollHolidayGroup", JSON.stringify(dataReload)).then(function (datareturn) {
                                    window.open('/payrollrules?active_key=holiday','_self');
                                }).catch(function (err) {
                                    window.open('/payrollrules?active_key=holiday','_self');
                                });
                            }).catch(function (err) {
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=holiday','_self');
                            });
                        }else if (result.dismiss === 'cancel') {

                        }
                    });

                }).catch(function (err) {
                    LoadingOverlay.hide();
                    swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                    }).then((result) => {
                    if (result.value) {
                    } else if (result.dismiss === 'cancel') {

                    }
                    });

                });
                });
            }else{
                objDetails = {
                    type: "TPayrollHolidayGroup",
                    fields: {
                        ID: parseInt(rateTypeId),
                        Groupdesc: ratetypedescription,
                        Groupname: ratetypedescription,
                    }
                };

                taxRateService.saveGroupType(objDetails).then(function (objDetails) {
                    LoadingOverlay.hide();
                    swal({
                        title: 'Success',
                        text: 'New Group saved Successfully',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'

                    }).then((result) => {
                        if (result.value) {
                            sideBarService.saveGroupType(initialBaseDataLoad, 0).then(function (dataReload) {
                                LoadingOverlay.show();
                                addVS1Data("TPayrollHolidayGroup", JSON.stringify(dataReload)).then(function (datareturn) {
                                    window.open('/payrollrules?active_key=holiday','_self');
                                }).catch(function (err) {
                                    window.open('/payrollrules?active_key=holiday','_self');
                                });
                            }).catch(function (err) {
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=holiday','_self');
                            });
                        }else if (result.dismiss === 'cancel') {

                        }
                    });
                }).catch(function (err) {
                    LoadingOverlay.hide();
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                        } else if (result.dismiss === 'cancel') {
                        }
                    });
                });
            }
        }
    }, delayTimeAfterSound);
    },

    'click .btnSavefund':function(){
        playSaveAudio();
        let templateObject = Template.instance();
        let taxRateService = new TaxRateService();
        setTimeout(function(){
        LoadingOverlay.show();
        let fundTypeId = $('#edtfundID').val()|| 0;
        let fundtypedescription = $('#edtFundDescription').val()||'';

        if (fundtypedescription === '') {
            LoadingOverlay.hide();
            swal('Fund type description can not be blank !', '', 'warning');
            e.preventDefault();
        } else {
          LoadingOverlay.show();
          if(fundTypeId == ""){

            taxRateService.checkfundTypeByName(fundtypedescription).then(function (data) {
                fundTypeId = data.tsupertype[0].Id;
                 objDetails = {
                 type: "TSuperType",
                 fields: {
                     ID: parseInt(fundTypeId),
                     Description: fundtypedescription,

                 }
             };

             taxRateService.saveSuperType(objDetails).then(function (objDetails) {

                LoadingOverlay.hide();
                swal({
                    title: 'Success',
                    text: 'New Super Fund Type saved Successfully',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'

                }).then((result) => {
                    if (result.value) {
                        sideBarService.getAllFundType(initialBaseDataLoad, 0).then(function (dataReload) {
                            addVS1Data("TSuperType", JSON.stringify(dataReload)).then(function (datareturn) {
                                window.open('/payrollrules?active_key=super','_self');
                            }).catch(function (err) {
                                window.open('/payrollrules?active_key=super','_self');
                            });
                          }).catch(function (err) {
                                window.open('/payrollrules?active_key=super','_self');
                          });
                    }else if (result.dismiss === 'cancel') {

                    }
                });

             }).catch(function (err) {
               LoadingOverlay.hide();
               swal({
               title: 'Oooops...',
               text: err,
               type: 'error',
               showCancelButton: false,
               confirmButtonText: 'Try Again'
               }).then((result) => {
               if (result.value) {
               } else if (result.dismiss === 'cancel') {

               }
               });

             });
            }).catch(function (err) {
                objDetails = {
                    type: "TSuperType",
                    fields: {
                        ID: parseInt(fundTypeId),
                        Description: fundtypedescription,
                      }

                    };

             taxRateService.saveSuperType(objDetails).then(function (objDetails) {

                LoadingOverlay.hide();
                swal({
                    title: 'Success',
                    text: 'New Super Fund Type saved Successfully',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'

                }).then((result) => {
                    if (result.value) {
                        sideBarService.getAllFundType(initialBaseDataLoad, 0).then(function (dataReload) {
                            addVS1Data("TSuperType", JSON.stringify(dataReload)).then(function (datareturn) {
                                window.open('/payrollrules?active_key=super','_self');
                            }).catch(function (err) {
                                window.open('/payrollrules?active_key=super','_self');
                            });
                          }).catch(function (err) {
                                window.open('/payrollrules?active_key=super','_self');
                          });
                    }else if (result.dismiss === 'cancel') {

                    }
                });

             }).catch(function (err) {
                    LoadingOverlay.hide();
                    swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                    }).then((result) => {
                    if (result.value) {

                    } else if (result.dismiss === 'cancel') {

                    }
                    });

             });
            });

         }else{
            objDetails = {
                type: "TSuperType",
                fields: {
                    ID: parseInt(fundTypeId),
                    Description: fundtypedescription,
                  }

                };

          taxRateService.saveSuperType(objDetails).then(function (objDetails) {

            LoadingOverlay.hide();
            swal({
                title: 'Success',
                text: 'New Super Fund Type saved Successfully',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'

            }).then((result) => {
                if (result.value) {
                    sideBarService.getAllFundType(initialBaseDataLoad, 0).then(function (dataReload) {
                        addVS1Data("TSuperType", JSON.stringify(dataReload)).then(function (datareturn) {
                            window.open('/payrollrules?active_key=super','_self');
                        }).catch(function (err) {
                            window.open('/payrollrules?active_key=super','_self');
                        });
                      }).catch(function (err) {
                           window.open('/payrollrules?active_key=super','_self');
                      });
                }else if (result.dismiss === 'cancel') {

                }
            });

          }).catch(function (err) {
            LoadingOverlay.hide();
            swal({
            title: 'Oooops...',
            text: err,
            type: 'error',
            showCancelButton: false,
            confirmButtonText: 'Try Again'
            }).then((result) => {
            if (result.value) {

            } else if (result.dismiss === 'cancel') {

            }
            });

          });
         }


        }
    }, delayTimeAfterSound);
    },

    'click .btnSaveDeduction': function(){
        playSaveAudio();
        let templateObject = Template.instance();
        let taxRateService = new TaxRateService();
        setTimeout(function(){
        LoadingOverlay.show();
        let deductionName = $('.edtDeductionName').val()||'';
        let deductionID = $('#edtDeductionID').val()||'';

        if($('#edtdeductionIO').val() || '') {

        }

        let deductionType = $('#edtDeductionType').val();
        let isTaxexempt = false;
        let isIsWorkPlacegiving = false;
        let isUnionfees = false;
        if(deductionType == 'None'){
          isTaxexempt = true;
        }else if(deductionType == 'Workplace Giving'){
          isIsWorkPlacegiving = true;
        }else if(deductionType == 'Union / Association Fees'){
          isUnionfees = true;
        }
        let displayName = 'Deductions';
        let deductionAccount = $('.edtDeductionAccount').val();
        let deductionAccountID = $('#edtDeductionAccountID').val()||0;

        let deductionAmount = $('.edtDeductionAmount').val()|| '';

        let exemptFromPAYG = false;
        let exemptFromSupernation = false;
        let reportableW1ActivityStatement = false;

        if($('#formCheck-ReducesPAYGDeduction').is(':checked')){
          exemptFromPAYG = true;
        }else{
          exemptFromPAYG = false;
        }

        if($('#formCheck-ReducesSuperannuationDeduction').is(':checked')){
          exemptFromSupernation = true;
        }else{
          exemptFromSupernation = false;
        }

        if($('#formCheck-ExcludedDeduction').is(':checked')){
          reportableW1ActivityStatement = true;
        }else{
          reportableW1ActivityStatement = false;
        }


        if (deductionName === '') {
            LoadingOverlay.hide();
            swal('Deduction Name can not blank!', '', 'warning');
            e.preventDefault();
        }
        else if (deductionType === '') {
            LoadingOverlay.hide();
            swal('Deduction Type has not been selected!', '', 'warning');
            e.preventDefault();
        }
        else if (deductionAmount === '') {
            LoadingOverlay.hide();
            swal('Deduction Amount can not blank !', '', 'warning');
            e.preventDefault();
        }
        else if (deductionAccount === '') {
            LoadingOverlay.hide();
            swal('Deduction Account has not been selected!', '', 'warning');
            e.preventDefault();
        }


        else {
          LoadingOverlay.show();

           if(deductionID == ""){
            taxRateService.checkDeductionByName(deductionName).then(function (data) {
              deductionID = data.tdeduction[0].Id;
              objDetails = {
                 type: "TDeduction",
                 fields: {
                     ID: parseInt(deductionID),
                     Active: true,
                     Accountid: deductionAccountID,
                     Accountname: deductionAccount,
                     IsWorkPlacegiving:isIsWorkPlacegiving,
                     Taxexempt:isTaxexempt,
                     Unionfees:isUnionfees,
                     Amount:Number(deductionAmount.replace(/[^0-9.-]+/g, "")) || 0,
                     Basedonid:1,
                     Description: deductionName,
                     DisplayIn: displayName,
                     SuperInc: exemptFromSupernation,
                     WorkCoverExempt: reportableW1ActivityStatement,
                     Taxexempt: exemptFromPAYG,
                     DeductionType:deductionType
                 }
             };

            taxRateService.saveDeduction(objDetails).then(function (objDetails) {

                LoadingOverlay.hide();
                swal({
                    title: 'Success',
                    text: 'New Deduction saved Successfully',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'

                }).then((result) => {
                    if (result.value) {
                        sideBarService.getDeduction(initialBaseDataLoad, 0).then(function (dataReload) {
                            addVS1Data("TDeduction", JSON.stringify(dataReload)).then(function (datareturn) {
                                $('#addductionmodelhide').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                            }).catch(function (err) {
                                $('#addductionmodelhide').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                            });
                          }).catch(function (err) {
                            $('#addductionmodelhide').trigger('click');
                            LoadingOverlay.show();
                            window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                          });
                    }else if (result.dismiss === 'cancel') {

                    }
                });

             }).catch(function (err) {
                LoadingOverlay.hide();
                swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
                }).then((result) => {
                if (result.value) {
                } else if (result.dismiss === 'cancel') {

                }
                });

             });
            }).catch(function (err) {
              objDetails = {
                 type: "TDeduction",
                 fields: {
                     Active: true,
                     Active: true,
                     Accountid: deductionAccountID,
                     Accountname: deductionAccount,
                     IsWorkPlacegiving:isIsWorkPlacegiving,
                     Taxexempt:isTaxexempt,
                     Unionfees:isUnionfees,
                     Amount:Number(deductionAmount.replace(/[^0-9.-]+/g, "")) || 0,
                     Basedonid:1,
                     Description: deductionName,
                     DisplayIn: displayName,
                     SuperInc: exemptFromSupernation,
                     WorkCoverExempt: reportableW1ActivityStatement,
                     Taxexempt: exemptFromPAYG,
                     DeductionType:deductionType
                 }
             };

             taxRateService.saveDeduction(objDetails).then(function (objDetails) {
                LoadingOverlay.hide();
                swal({
                    title: 'Success',
                    text: 'New Dedution saved Successfully',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'

                }).then((result) => {
                    if (result.value) {
                        sideBarService.getDeduction(initialBaseDataLoad, 0).then(function (dataReload) {
                            addVS1Data("TDeduction", JSON.stringify(dataReload)).then(function (datareturn) {
                                $('#addductionmodelhide').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                            }).catch(function (err) {
                                $('#addductionmodelhide').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                            });
                          }).catch(function (err) {
                            $('#addductionmodelhide').trigger('click');
                            LoadingOverlay.show();
                            window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                          });
                    }else if (result.dismiss === 'cancel') {

                    }
                });

             }).catch(function (err) {
                    LoadingOverlay.hide();
                    swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                    }).then((result) => {
                    if (result.value) {

                    } else if (result.dismiss === 'cancel') {

                    }
                    });

             });
            });

           }else{
           objDetails = {
              type: "TDeduction",
              fields: {
                  ID: parseInt(deductionID),
                  Active: true,
                  Accountid: deductionAccountID,
                  Accountname: deductionAccount,
                  IsWorkPlacegiving:isIsWorkPlacegiving,
                  Taxexempt:isTaxexempt,
                  Unionfees:isUnionfees,
                  Amount:Number(deductionAmount.replace(/[^0-9.-]+/g, "")) || 0,
                  Basedonid:1,
                  Description: deductionName,
                  DisplayIn: displayName,
                  SuperInc: exemptFromSupernation,
                  WorkCoverExempt: reportableW1ActivityStatement,
                  Taxexempt: exemptFromPAYG,
                  DeductionType:deductionType
              }
           };

          taxRateService.saveDeduction(objDetails).then(function (objDetails) {

            LoadingOverlay.hide();
            swal({
                title: 'Success',
                text: 'New Dedution saved Successfully',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'

            }).then((result) => {
                if (result.value) {
                    sideBarService.getDeduction(initialBaseDataLoad, 0).then(function (dataReload) {
                        addVS1Data("TDeduction", JSON.stringify(dataReload)).then(function (datareturn) {
                            $('#addductionmodelhide').trigger('click');
                            LoadingOverlay.show();
                            window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                        }).catch(function (err) {
                            $('#addductionmodelhide').trigger('click');
                            LoadingOverlay.show();
                            window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                        });
                      }).catch(function (err) {
                        $('#addductionmodelhide').trigger('click');
                        LoadingOverlay.show();
                        window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                      });
                }else if (result.dismiss === 'cancel') {

                }
            });

          }).catch(function (err) {
                    LoadingOverlay.hide();
                    swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                    }).then((result) => {
                    if (result.value) {

                    } else if (result.dismiss === 'cancel') {

                    }
                    });

          });
         }


        }
    }, delayTimeAfterSound);
    },

    'click .updateDeductionActive': function () {
        playSaveAudio();
        let templateObject = Template.instance();
        let taxRateService = new TaxRateService();

        setTimeout(function(){
            LoadingOverlay.show();
            let deductionName = $('.edtDeductionName').val()||'';
            let deductionID = $('#edtDeductionID').val()||'';
            let deductionType = $('#edtDeductionType').val();
            let isTaxexempt = false;
            let isIsWorkPlacegiving = false;
            let isUnionfees = false;

            if(deductionType == 'None'){
                isTaxexempt = true;
            }else if(deductionType == 'Workplace Giving'){
                isIsWorkPlacegiving = true;
            }else if(deductionType == 'Union / Association Fees'){
                isUnionfees = true;
            }
            
            let displayName = 'Deductions';
            let deductionAccount = $('.edtDeductionAccount').val();
            let deductionAccountID = $('#edtDeductionAccountID').val()||0;
            let deductionAmount = $('.edtDeductionAmount').val()|| '';
            let exemptFromPAYG = false;
            let exemptFromSupernation = false;
            let reportableW1ActivityStatement = false;

            if ($('#formCheck-ReducesPAYGDeduction').is(':checked')) {
                exemptFromPAYG = true;
            } else {
                exemptFromPAYG = false;
            }

            if ($('#formCheck-ReducesSuperannuationDeduction').is(':checked')) {
                exemptFromSupernation = true;
            } else {
                exemptFromSupernation = false;
            }

            if ($('#formCheck-ExcludedDeduction').is(':checked')) {
                reportableW1ActivityStatement = true;
            } else {
                reportableW1ActivityStatement = false;
            }

            if (deductionName === '') {
                LoadingOverlay.hide();
                swal('Deduction Name can not blank!', '', 'warning');
                e.preventDefault();
            } else if (deductionType === '') {
                LoadingOverlay.hide();
                swal('Deduction Type has not been selected!', '', 'warning');
                e.preventDefault();
            } else if (deductionAmount === '') {
                LoadingOverlay.hide();
                swal('Deduction Amount can not blank !', '', 'warning');
                e.preventDefault();
            } else if (deductionAccount === '') {
                LoadingOverlay.hide();
                swal('Deduction Account has not been selected!', '', 'warning');
                e.preventDefault();
            } else {
                LoadingOverlay.show();
                taxRateService.checkDeductionByName(deductionName).then(function (data) {
                    deductionID = data.tdeduction[0].Id;
                    objDetails = {
                        type: "TDeduction",
                        fields: {
                            ID: parseInt(deductionID),
                            Active: true,
                            Accountid: deductionAccountID,
                            Accountname: deductionAccount,
                            IsWorkPlacegiving:isIsWorkPlacegiving,
                            Taxexempt:isTaxexempt,
                            Unionfees:isUnionfees,
                            Amount:Number(deductionAmount.replace(/[^0-9.-]+/g, "")) || 0,
                            Basedonid:1,
                            Description: deductionName,
                            DisplayIn: displayName,
                            SuperInc: exemptFromSupernation,
                            WorkCoverExempt: reportableW1ActivityStatement,
                            Taxexempt: exemptFromPAYG,
                            DeductionType:deductionType
                        }
                    };

                    taxRateService.saveDeduction(objDetails).then(function (objDetails) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Success',
                            text: 'New Deduction Active Successfully',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'
                        }).then((result) => {
                            if (result.value) {
                                sideBarService.getDeduction(initialBaseDataLoad, 0).then(function (dataReload) {
                                    addVS1Data("TDeduction", JSON.stringify(dataReload)).then(function (datareturn) {
                                        $('#addductionmodelhide').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                                    }).catch(function (err) {
                                        $('#addductionmodelhide').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                                    });
                                }).catch(function (err) {
                                    $('#addductionmodelhide').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                                });
                            }else if (result.dismiss === 'cancel') {
                            }
                            });
                    }).catch(function (err) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                            } else if (result.dismiss === 'cancel') {
                            }
                        });
                    });
                }).catch(function (err) {
                    objDetails = {
                        type: "TDeduction",
                        fields: {
                            Active: true,
                            Accountid: deductionAccountID,
                            Accountname: deductionAccount,
                            IsWorkPlacegiving:isIsWorkPlacegiving,
                            Taxexempt:isTaxexempt,
                            Unionfees:isUnionfees,
                            Amount:Number(deductionAmount.replace(/[^0-9.-]+/g, "")) || 0,
                            Basedonid:1,
                            Description: deductionName,
                            DisplayIn: displayName,
                            SuperInc: exemptFromSupernation,
                            WorkCoverExempt: reportableW1ActivityStatement,
                            Taxexempt: exemptFromPAYG,
                            DeductionType:deductionType
                        }
                    };
                    taxRateService.saveDeduction(objDetails).then(function (objDetails) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Success',
                            text: 'New Dedution Active Successfully',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'

                        }).then((result) => {
                            if (result.value) {
                                sideBarService.getDeduction(initialBaseDataLoad, 0).then(function (dataReload) {
                                    addVS1Data("TDeduction", JSON.stringify(dataReload)).then(function (datareturn) {
                                        $('#addductionmodelhide').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                                    }).catch(function (err) {
                                        $('#addductionmodelhide').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                                    });
                                }).catch(function (err) {
                                    $('#addductionmodelhide').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                                });
                            }else if (result.dismiss === 'cancel') {

                            }
                        });
                    }).catch(function (err) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                            } else if (result.dismiss === 'cancel') {
                            }
                        });
                    });
                });
            }
        }, delayTimeAfterSound);
    },

    'click .updateDeductionInActive': function () {
        playSaveAudio();
        let templateObject = Template.instance();
        let taxRateService = new TaxRateService();

        setTimeout(function(){
            LoadingOverlay.show();
            let deductionName = $('.edtDeductionName').val()||'';
            let deductionID = $('#edtDeductionID').val()||'';
            let deductionType = $('#edtDeductionType').val();
            let isTaxexempt = false;
            let isIsWorkPlacegiving = false;
            let isUnionfees = false;

            if(deductionType == 'None'){
                isTaxexempt = true;
            }else if(deductionType == 'Workplace Giving'){
                isIsWorkPlacegiving = true;
            }else if(deductionType == 'Union / Association Fees'){
                isUnionfees = true;
            }
            
            let displayName = 'Deductions';
            let deductionAccount = $('.edtDeductionAccount').val();
            let deductionAccountID = $('#edtDeductionAccountID').val()||0;
            let deductionAmount = $('.edtDeductionAmount').val()|| '';
            let exemptFromPAYG = false;
            let exemptFromSupernation = false;
            let reportableW1ActivityStatement = false;

            if ($('#formCheck-ReducesPAYGDeduction').is(':checked')) {
                exemptFromPAYG = true;
            } else {
                exemptFromPAYG = false;
            }

            if ($('#formCheck-ReducesSuperannuationDeduction').is(':checked')) {
                exemptFromSupernation = true;
            } else {
                exemptFromSupernation = false;
            }

            if ($('#formCheck-ExcludedDeduction').is(':checked')) {
                reportableW1ActivityStatement = true;
            } else {
                reportableW1ActivityStatement = false;
            }

            if (deductionName === '') {
                LoadingOverlay.hide();
                swal('Deduction Name can not blank!', '', 'warning');
                e.preventDefault();
            } else if (deductionType === '') {
                LoadingOverlay.hide();
                swal('Deduction Type has not been selected!', '', 'warning');
                e.preventDefault();
            } else if (deductionAmount === '') {
                LoadingOverlay.hide();
                swal('Deduction Amount can not blank !', '', 'warning');
                e.preventDefault();
            } else if (deductionAccount === '') {
                LoadingOverlay.hide();
                swal('Deduction Account has not been selected!', '', 'warning');
                e.preventDefault();
            } else {
                LoadingOverlay.show();
                taxRateService.checkDeductionByName(deductionName).then(function (data) {
                    deductionID = data.tdeduction[0].Id;
                    objDetails = {
                        type: "TDeduction",
                        fields: {
                            ID: parseInt(deductionID),
                            Active: false,
                            Accountid: deductionAccountID,
                            Accountname: deductionAccount,
                            IsWorkPlacegiving:isIsWorkPlacegiving,
                            Taxexempt:isTaxexempt,
                            Unionfees:isUnionfees,
                            Amount:Number(deductionAmount.replace(/[^0-9.-]+/g, "")) || 0,
                            Basedonid:1,
                            Description: deductionName,
                            DisplayIn: displayName,
                            SuperInc: exemptFromSupernation,
                            WorkCoverExempt: reportableW1ActivityStatement,
                            Taxexempt: exemptFromPAYG,
                            DeductionType:deductionType
                        }
                    };

                    taxRateService.saveDeduction(objDetails).then(function (objDetails) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Success',
                            text: 'New Deduction In Active Successfully',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'
                        }).then((result) => {
                            if (result.value) {
                                sideBarService.getDeduction(initialBaseDataLoad, 0).then(function (dataReload) {
                                    addVS1Data("TDeduction", JSON.stringify(dataReload)).then(function (datareturn) {
                                        $('#addductionmodelhide').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                                    }).catch(function (err) {
                                        $('#addductionmodelhide').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                                    });
                                }).catch(function (err) {
                                    $('#addductionmodelhide').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                                });
                            }else if (result.dismiss === 'cancel') {
                            }
                            });
                    }).catch(function (err) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                            } else if (result.dismiss === 'cancel') {
                            }
                        });
                    });
                }).catch(function (err) {
                    objDetails = {
                        type: "TDeduction",
                        fields: {
                            Active: false,
                            Accountid: deductionAccountID,
                            Accountname: deductionAccount,
                            IsWorkPlacegiving:isIsWorkPlacegiving,
                            Taxexempt:isTaxexempt,
                            Unionfees:isUnionfees,
                            Amount:Number(deductionAmount.replace(/[^0-9.-]+/g, "")) || 0,
                            Basedonid:1,
                            Description: deductionName,
                            DisplayIn: displayName,
                            SuperInc: exemptFromSupernation,
                            WorkCoverExempt: reportableW1ActivityStatement,
                            Taxexempt: exemptFromPAYG,
                            DeductionType:deductionType
                        }
                    };
                    taxRateService.saveDeduction(objDetails).then(function (objDetails) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Success',
                            text: 'New Dedution In Active Successfully',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'

                        }).then((result) => {
                            if (result.value) {
                                sideBarService.getDeduction(initialBaseDataLoad, 0).then(function (dataReload) {
                                    addVS1Data("TDeduction", JSON.stringify(dataReload)).then(function (datareturn) {
                                        $('#addductionmodelhide').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                                    }).catch(function (err) {
                                        $('#addductionmodelhide').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                                    });
                                }).catch(function (err) {
                                    $('#addductionmodelhide').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                                });
                            }else if (result.dismiss === 'cancel') {

                            }
                        });
                    }).catch(function (err) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                            } else if (result.dismiss === 'cancel') {
                            }
                        });
                    });
                });
            }
        }, delayTimeAfterSound);
    },

    'click .updateCalendarInActive': function () {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        let taxRateService = new TaxRateService();
        let oldpaycalenderid  = $('#paycalendarId').val() || 0;
        let payperiod = $('#payperiod').val() || '';
        let calender_name = $('.calender_name').val() || '';
        let startdate = $('#edtStartDate').val() || '';
        let FirstPaymentDate = $('#edtFirstPaymentDate').val() || '';

         if (payperiod === '') {
            LoadingOverlay.hide();
            swal('Pay period has not been selected!', '', 'warning');
            e.preventDefault();
         }
         else if(calender_name === '')
         {
             LoadingOverlay.hide();
             swal('Calender Name Can not blank!', '', 'warning');
             e.preventDefault();

         }
         else if(startdate === '')
         {
             LoadingOverlay.hide();
             swal('Start Date Has not been selected!', '', 'warning');
             e.preventDefault();

         }
         else if(FirstPaymentDate === '')
         {
             LoadingOverlay.hide();
             swal('First Payment Date Has not been selected!', '', 'warning');
             e.preventDefault();

         }
         else
         {
                LoadingOverlay.show();
                objDetails = {
                    type: "TPayrollCalendars",
                    fields: {
                        ID: parseInt(oldpaycalenderid),
                        PayrollCalendarPayPeriod:payperiod,
                        PayrollCalendarName:calender_name,
                        PayrollCalendarStartDate:moment(startdate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                        PayrollCalendarFirstPaymentDate:moment(FirstPaymentDate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                        PayrollCalendarActive : false,
                    }
                };

                taxRateService.saveCalender(objDetails).then(function (objDetails) {
                    LoadingOverlay.hide();
                    swal({
                        title: 'Success',
                        text: 'Pay Calendar In Active successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'

                    }).then((result) => {
                        if (result.value) {
                            sideBarService.getCalender(initialBaseDataLoad, 0).then(function (dataReload) {
                                addVS1Data("TPayrollCalendars", JSON.stringify(dataReload)).then(function (datareturn) {
                                    $('#closemodel').trigger('click');
                                    LoadingOverlay.show();
                                     window.open('/payrollrules?active_key=calender','_self');
                                }).catch(function (err) {
                                    $('#closemodel').trigger('click');
                                    LoadingOverlay.show();

                                    window.open('/payrollrules?active_key=calender','_self');
                                });
                              }).catch(function (err) {
                                  $('#closemodel').trigger('click');
                                  LoadingOverlay.show();

                                  window.open('/payrollrules?active_key=calender','_self');
                              });
                        }else if (result.dismiss === 'cancel') {

                        }
                    });

                }).catch(function (err) {

                    LoadingOverlay.hide();
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'ok'
                        }).then((result) => {
                        if (result.value) {
                        } else if (result.dismiss === 'cancel') {
                        }
                    });


                });
            }
    },

    'click .updateCalendarActive': function () {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        let taxRateService = new TaxRateService();
        let oldpaycalenderid  = $('#paycalendarId').val() || 0;
        let payperiod = $('#payperiod').val() || '';
        let calender_name = $('.calender_name').val() || '';
        let startdate = $('#edtStartDate').val() || '';
        let FirstPaymentDate = $('#edtFirstPaymentDate').val() || '';

         if (payperiod === '') {
            LoadingOverlay.hide();
            swal('Pay period has not been selected!', '', 'warning');
            e.preventDefault();
         }
         else if(calender_name === '')
         {
             LoadingOverlay.hide();
             swal('Calender Name Can not blank!', '', 'warning');
             e.preventDefault();

         }
         else if(startdate === '')
         {
             LoadingOverlay.hide();
             swal('Start Date Has not been selected!', '', 'warning');
             e.preventDefault();

         }
         else if(FirstPaymentDate === '')
         {
             LoadingOverlay.hide();
             swal('First Payment Date Has not been selected!', '', 'warning');
             e.preventDefault();

         }
         else
         {
                LoadingOverlay.show();
                objDetails = {
                    type: "TPayrollCalendars",
                    fields: {
                        ID: parseInt(oldpaycalenderid),
                        PayrollCalendarPayPeriod:payperiod,
                        PayrollCalendarName:calender_name,
                        PayrollCalendarStartDate:moment(startdate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                        PayrollCalendarFirstPaymentDate:moment(FirstPaymentDate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                        PayrollCalendarActive : true,
                    }
                };

                taxRateService.saveCalender(objDetails).then(function (objDetails) {
                    LoadingOverlay.hide();
                    swal({
                        title: 'Success',
                        text: 'Pay Calendar Active successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'

                    }).then((result) => {
                        if (result.value) {
                            sideBarService.getCalender(initialBaseDataLoad, 0).then(function (dataReload) {
                                addVS1Data("TPayrollCalendars", JSON.stringify(dataReload)).then(function (datareturn) {
                                    $('#closemodel').trigger('click');
                                    LoadingOverlay.show();
                                     window.open('/payrollrules?active_key=calender','_self');
                                }).catch(function (err) {
                                    $('#closemodel').trigger('click');
                                    LoadingOverlay.show();

                                    window.open('/payrollrules?active_key=calender','_self');
                                });
                              }).catch(function (err) {
                                  $('#closemodel').trigger('click');
                                  LoadingOverlay.show();

                                  window.open('/payrollrules?active_key=calender','_self');
                              });
                        }else if (result.dismiss === 'cancel') {

                        }
                    });

                }).catch(function (err) {

                    LoadingOverlay.hide();
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'ok'
                        }).then((result) => {
                        if (result.value) {
                        } else if (result.dismiss === 'cancel') {
                        }
                    });


                });
            }
    },

   'click .savenewcalender': function() {

        let templateObject = Template.instance();
        LoadingOverlay.show();
        let taxRateService = new TaxRateService();
        let oldpaycalenderid  = $('#paycalendarId').val() || 0;
        let payperiod = $('#payperiod').val() || '';
        let calender_name = $('.calender_name').val() || '';
        let startdate = $('#edtStartDate').val() || '';
        let FirstPaymentDate = $('#edtFirstPaymentDate').val() || '';

         if (payperiod === '') {
            LoadingOverlay.hide();
            swal('Pay period has not been selected!', '', 'warning');
            e.preventDefault();
         }
         else if(calender_name === '')
         {
             LoadingOverlay.hide();
             swal('Calender Name Can not blank!', '', 'warning');
             e.preventDefault();

         }
         else if(startdate === '')
         {
             LoadingOverlay.hide();
             swal('Start Date Has not been selected!', '', 'warning');
             e.preventDefault();

         }
         else if(FirstPaymentDate === '')
         {
             LoadingOverlay.hide();
             swal('First Payment Date Has not been selected!', '', 'warning');
             e.preventDefault();

         }
         else
         {
            if(oldpaycalenderid != 0 )
            {
                LoadingOverlay.show();
                objDetails = {
                    type: "TPayrollCalendars",
                    fields: {
                        ID: parseInt(oldpaycalenderid),
                        PayrollCalendarPayPeriod:payperiod,
                        PayrollCalendarName:calender_name,
                        PayrollCalendarStartDate:moment(startdate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                        PayrollCalendarFirstPaymentDate:moment(FirstPaymentDate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                        PayrollCalendarActive :true,
                    }
                };

                taxRateService.saveCalender(objDetails).then(function (objDetails) {
                    LoadingOverlay.hide();
                    swal({
                        title: 'Success',
                        text: 'Pay Calendar saved successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'

                    }).then((result) => {
                        if (result.value) {
                            sideBarService.getCalender(initialBaseDataLoad, 0).then(function (dataReload) {
                                addVS1Data("TPayrollCalendars", JSON.stringify(dataReload)).then(function (datareturn) {
                                    $('#closemodel').trigger('click');
                                    LoadingOverlay.show();
                                     window.open('/payrollrules?active_key=calender','_self');
                                }).catch(function (err) {
                                    $('#closemodel').trigger('click');
                                    LoadingOverlay.show();

                                    window.open('/payrollrules?active_key=calender','_self');
                                });
                              }).catch(function (err) {
                                  $('#closemodel').trigger('click');
                                  LoadingOverlay.show();

                                  window.open('/payrollrules?active_key=calender','_self');
                              });
                        }else if (result.dismiss === 'cancel') {

                        }
                    });

                }).catch(function (err) {

                    LoadingOverlay.hide();
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'ok'
                        }).then((result) => {
                        if (result.value) {
                        } else if (result.dismiss === 'cancel') {
                        }
                    });


                });


            }
            else
            {
                LoadingOverlay.show();

                taxRateService.checkCalenderName(calender_name).then(function (data) {

                    calenderID = data.tpayrollcalendars;
                    var calender_id = calenderID[0];

                    objDetails = {
                        type: "TPayrollCalendars",
                        fields: {
                           ID: parseInt(calender_id.Id),
                           PayrollCalendarPayPeriod:payperiod,
                           PayrollCalendarName:calender_name,
                           PayrollCalendarStartDate:moment(startdate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                           PayrollCalendarFirstPaymentDate:moment(FirstPaymentDate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                           PayrollCalendarActive :true,
                        }
                    };

                    taxRateService.saveCalender(objDetails).then(function (objDetails) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Success',
                            text: 'Pay Calendar saved successfully.',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'

                            }).then((result) => {
                            if (result.value) {
                                sideBarService.getCalender(initialBaseDataLoad, 0).then(function (dataReload) {
                                    addVS1Data("TPayrollCalendars", JSON.stringify(dataReload)).then(function (datareturn) {
                                        $('#closemodel').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=calender','_self');
                                    }).catch(function (err) {
                                        $('#closemodel').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=calender','_self');
                                    });
                                  }).catch(function (err) {
                                        $('#closemodel').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=calender','_self');
                                  });
                            }else if (result.dismiss === 'cancel') {

                            }
                            });


                    }).catch(function (err) {
                           LoadingOverlay.hide();
                           swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'ok'
                            }).then((result) => {
                            if (result.value) {
                            } else if (result.dismiss === 'cancel') {
                            }
                            });

                    });
                 }).catch(function (err) {
                        objDetails = {
                        type: "TPayrollCalendars",
                        fields: {
                            PayrollCalendarPayPeriod:payperiod,
                            PayrollCalendarName:calender_name,
                            PayrollCalendarStartDate:moment(startdate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                            PayrollCalendarFirstPaymentDate:moment(FirstPaymentDate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                            PayrollCalendarActive :true,
                       }
                       };

                      taxRateService.saveCalender(objDetails).then(function (objDetails) {

                        LoadingOverlay.hide();
                        swal({
                            title: 'Success',
                            text: 'Pay Calendar saved successfully.',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'

                        }).then((result) => {
                        if (result.value) {
                            sideBarService.getCalender(initialBaseDataLoad, 0).then(function (dataReload) {
                                addVS1Data("TPayrollCalendars", JSON.stringify(dataReload)).then(function (datareturn) {
                                    $('#closemodel').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=calender','_self');
                                }).catch(function (err) {
                                    $('#closemodel').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=calender','_self');
                                });
                              }).catch(function (err) {
                                    $('#closemodel').trigger('click');
                                    LoadingOverlay.show();
                                   window.open('/payrollrules?active_key=calender','_self');
                              });
                        }else if (result.dismiss === 'cancel') {

                        }
                        });



                      }).catch(function (err) {
                           LoadingOverlay.hide();
                           swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'ok'
                            }).then((result) => {
                            if (result.value) {
                            } else if (result.dismiss === 'cancel') {
                            }
                            });


                      });
                 });
            }


         }




    },

   'click .btnSaveDefaultTax': (e, templateObject) => {
        playSaveAudio();
        LoadingOverlay.show();
        setTimeout(function(){
        templateObject.saveOvertimes();
        let editbankaccount = $('#editbankaccount').val() || '';
        let editpaygbankaccount = $('#editpaygbankaccount').val() || '';
        let editwagesexpbankaccount = $('#editwagesexpbankaccount').val() || '';
        let editwagespaybankaccount = $('#editwagespaybankaccount').val() || '';
        let editsuperliabbankaccount = $('#editsuperliabbankaccount').val() || '';
        let editsuperexpbankaccount = $('#editsuperexpbankaccount').val() || '';
        let employegroup = $('#employegroup').val() || '';
        let timesheetcat = $('#timesheetcat').val() || '';
        let swtShowAnnualSalary = false;
        let swtShowEmploymentBasis = false;
        let uploadedImage = $('#uploadedImage').attr('src');
        let ID = $('#payorgnization_id').val() || '';

        let imagearray =  uploadedImage.split(',');

        let payrollsettingor = $('#payrollsettingor').val() || 0;

        if($('#swtShowAnnualSalary').is(':checked')){
            swtShowAnnualSalary = true;
        }else{
            swtShowAnnualSalary = false;
        }

        if($('#payrollsettingor').val() == '')
        {
            payrollsettingor = 0;
        }

        if($('#swtShowEmploymentBasis').is(':checked')){
            swtShowEmploymentBasis = true;
        }else{
            swtShowEmploymentBasis = false;
        }


         if (editbankaccount === '') {
            LoadingOverlay.hide();
            swal('Bank account has not been selected!', '', 'warning');
            e.preventDefault();
         }
         else if(editpaygbankaccount === '')
         {
             LoadingOverlay.hide();
             swal('PAYG Liability Account has not been selected!', '', 'warning');
             e.preventDefault();

         }
         else if(editwagesexpbankaccount === '')
         {
             LoadingOverlay.hide();
             swal('Wages Expense Account has not been selected!', '', 'warning');
             e.preventDefault();

         }
         else if(editwagespaybankaccount === '')
         {
             LoadingOverlay.hide();
             swal('Wages Payable Account has not been selected!', '', 'warning');
             e.preventDefault();

         }
         else if(editsuperliabbankaccount === '')
         {
             LoadingOverlay.hide();
             swal('Superannuation Liability Account has not been selected!', '', 'warning');
             e.preventDefault();

         }
         else if(editsuperexpbankaccount === '')
         {
             LoadingOverlay.hide();
             swal('Superannuation Expense Account has not been selected!', '', 'warning');
             e.preventDefault();

         }
         else
         {
            LoadingOverlay.show();

            objDetails = {
                type: "Tpayrollorganization",
                fields: {
                    ID: parseInt(ID),
                    bankaccount:editbankaccount,
                    paygaacount:editpaygbankaccount,
                    Wagesexpenseaccount:editwagesexpbankaccount,
                    wagespayablesaccount:editwagespaybankaccount,
                    Superlibaccount:editsuperliabbankaccount,
                    Supperexpaccount:editsuperexpbankaccount,
                    attachment:imagearray[1],
                    showannualsalary:swtShowAnnualSalary,
                    showemployeebases:swtShowEmploymentBasis,
                    TimeSheetCategory:timesheetcat,
                    EmployeeGroup:employegroup,
                    KeyStringFieldName:localStorage.getItem('mySessionEmployeeLoggedID'),
                }
            };

            taxRateService.savePayOrganization(objDetails).then(function (objDetails){



                swal({
                    title: 'Success',
                    text: 'Organization Payroll Settings saved successfully.',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'

                }).then((result) => {
                if (result.value) {

                    sideBarService.getPayrollinformation(initialBaseDataLoad, 0).then(function (dataReload) {
                        addVS1Data("TPayrollOrganization", JSON.stringify(dataReload)).then(function (datareturn) {
                            $('#closemodel').trigger('click');
                            LoadingOverlay.show();
                            window.open('/payrollrules','_self');
                        }).catch(function (err) {
                            $('#closemodel').trigger('click');
                            LoadingOverlay.show();
                            window.open('/payrollrules','_self');
                        });
                      }).catch(function (err) {
                            $('#closemodel').trigger('click');
                            LoadingOverlay.show();
                           window.open('/payrollrules','_self');
                      });



                }else if (result.dismiss === 'cancel') {

                }
                });

                $('.fullScreenSpin').css('display','none')

            });




         }
        }, delayTimeAfterSound);
        },

    'click .updateSuperannuationActive' : function(e) {
        playSaveAudio();
        LoadingOverlay.show();
        let taxRateService = new TaxRateService();
        let templateObject = Template.instance();
        setTimeout(function(){
            let id  = $('#newSuperannuationFundId').val() || 0;
            let active = $('#superannuationactive').val() || 0;
            let fundType = $('#edtFundType').val() || '';
            let fundName = $('.edtFundName').val() || '';
            let abn  = $('#edtabn').val() || '';
            let edtelectronicsalias = $('#edtelectronicsalias').val() || '';
            let employeNumber = $('.edtEmployerNumber').val() || '';
        
        if(employeNumber == '' || employeNumber == null)
        {
            employeNumber = 0;
        }

            let edtbsb = $('#edtbsb').val() || '';
            let edtaccountnumber = $('#edtaccountnumber').val() || '';
            let edtaccountname = $('#edtaccountname').val() || '';
            let fundtypeid = $('#fundtypeid').val() || 0;
            if (fundName === '') {
                LoadingOverlay.hide();
                swal('Fund Name has not been Filled!', '', 'warning');
                e.preventDefault();
            } else if(fundType === '') {
                LoadingOverlay.hide();
                swal('Fund Type has not been Selected !', '', 'warning');
                e.preventDefault();
            } else {
                LoadingOverlay.show();
                objDetails = {
                    type: "Tsuperannuation",
                    fields: {
                        ID: parseInt(id),
                        Superfund:fundName,
                        Employeeid:employeNumber,
                        Area:fundType,
                        Supertypeid:fundtypeid,
                        ABN:abn,
                        AccountName:edtaccountname,
                        Accountno:edtaccountnumber,
                        ElectronicsServiceAddressAlias:edtelectronicsalias,
                        BSB:edtbsb,
                        Clientid:localStorage.getItem('mySessionEmployeeLoggedID'),
                        Amount:1,
                        Active: true,
                        DepartmentName:defaultDept,
                        Allclasses:true,
                    }
            };


            taxRateService.saveSuperannuation(objDetails).then(function (objDetails) {
                LoadingOverlay.hide();
                swal({
                    title: 'Success',
                    text: 'Superannuation Active Successfully',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'
                }).then((result) => {
                    if (result.value) {
                        sideBarService.getSuperannuation(initialBaseDataLoad, 0).then(function (dataReload) {
                            addVS1Data("Tsuperannuation", JSON.stringify(dataReload)).then(function (datareturn) {
                                $('#closeuperannution').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=super','_self');
                            }).catch(function (err) {
                                $('#closeuperannution').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=super','_self');
                            });
                            }).catch(function (err) {
                            $('#closeuperannution').trigger('click');
                            LoadingOverlay.show();
                                window.open('/payrollrules?active_key=super','_self');
                            });
                    }else if (result.dismiss === 'cancel') {

                    }
                });

            }).catch(function (err) {
                LoadingOverlay.hide();
                swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {

                    } else if (result.dismiss === 'cancel') {

                    }
                });


            });

            
         }
        }, delayTimeAfterSound);
    },

    'click .updateSuperannuationInActive' : function(e) {
        playSaveAudio();
        LoadingOverlay.show();
        let taxRateService = new TaxRateService();
        let templateObject = Template.instance();
        setTimeout(function(){
            let id  = $('#newSuperannuationFundId').val() || 0;
            let active = $('#superannuationactive').val() || 0;
            let fundType = $('#edtFundType').val() || '';
            let fundName = $('.edtFundName').val() || '';
            let abn  = $('#edtabn').val() || '';
            let edtelectronicsalias = $('#edtelectronicsalias').val() || '';
            let employeNumber = $('.edtEmployerNumber').val() || '';
        
        if(employeNumber == '' || employeNumber == null)
        {
            employeNumber = 0;
        }

            let edtbsb = $('#edtbsb').val() || '';
            let edtaccountnumber = $('#edtaccountnumber').val() || '';
            let edtaccountname = $('#edtaccountname').val() || '';
            let fundtypeid = $('#fundtypeid').val() || 0;
            if (fundName === '') {
                LoadingOverlay.hide();
                swal('Fund Name has not been Filled!', '', 'warning');
                e.preventDefault();
            } else if(fundType === '') {
                LoadingOverlay.hide();
                swal('Fund Type has not been Selected !', '', 'warning');
                e.preventDefault();
            } else {
                LoadingOverlay.show();
                objDetails = {
                    type: "Tsuperannuation",
                    fields: {
                        ID: parseInt(id),
                        Superfund:fundName,
                        Employeeid:employeNumber,
                        Area:fundType,
                        Supertypeid:fundtypeid,
                        ABN:abn,
                        AccountName:edtaccountname,
                        Accountno:edtaccountnumber,
                        ElectronicsServiceAddressAlias:edtelectronicsalias,
                        BSB:edtbsb,
                        Clientid:localStorage.getItem('mySessionEmployeeLoggedID'),
                        Amount:1,
                        Active: false,
                        DepartmentName:defaultDept,
                        Allclasses:true,
                    }
                };


                taxRateService.saveSuperannuation(objDetails).then(function (objDetails) {
                    LoadingOverlay.hide();
                    swal({
                        title: 'Success',
                        text: 'Superannuation Active Successfully',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    }).then((result) => {
                        if (result.value) {
                            sideBarService.getSuperannuation(initialBaseDataLoad, 0).then(function (dataReload) {
                                addVS1Data("Tsuperannuation", JSON.stringify(dataReload)).then(function (datareturn) {
                                    $('#closeuperannution').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=super','_self');
                                }).catch(function (err) {
                                    $('#closeuperannution').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=super','_self');
                                });
                                }).catch(function (err) {
                                $('#closeuperannution').trigger('click');
                                LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=super','_self');
                                });
                        }else if (result.dismiss === 'cancel') {

                        }
                    });

                }).catch(function (err) {
                    LoadingOverlay.hide();
                    swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {

                        } else if (result.dismiss === 'cancel') {

                        }
                    });
                });
            }
        }, delayTimeAfterSound);
    },

    'click .saveSuperannuation': function(e){
        playSaveAudio();
        let taxRateService = new TaxRateService();
        let templateObject = Template.instance();
        setTimeout(function(){
        LoadingOverlay.show();
        let id  = $('#newSuperannuationFundId').val() || 0;
        let active = $('#superannuationactive').val() || 0;
        let fundType = $('#edtFundType').val() || '';
        let fundName = $('.edtFundName').val() || '';
        let abn  = $('#edtabn').val() || '';
        let edtelectronicsalias = $('#edtelectronicsalias').val() || '';
        let employeNumber = $('.edtEmployerNumber').val() || '';
        
        if(employeNumber == '' || employeNumber == null)
        {
            employeNumber = 0;
        }

        let edtbsb = $('#edtbsb').val() || '';
        let edtaccountnumber = $('#edtaccountnumber').val() || '';
        let edtaccountname = $('#edtaccountname').val() || '';
        let fundtypeid = $('#fundtypeid').val();
        if (fundName === '') {
            LoadingOverlay.hide();
            swal('Fund Name has not been Filled!', '', 'warning');
            e.preventDefault();
         }
         else if(fundType === '')
         {
            LoadingOverlay.hide();
            swal('Fund Type has not been Selected !', '', 'warning');
            e.preventDefault();
         }
         else {
                LoadingOverlay.show();
                objDetails = {
                    type: "Tsuperannuation",
                    fields: {
                        ID: parseInt(id),
                        Superfund:fundName,
                        Employeeid:employeNumber,
                        Area:fundType,
                        Supertypeid:fundtypeid,
                        ABN:abn,
                        AccountName:edtaccountname,
                        Accountno:edtaccountnumber,
                        ElectronicsServiceAddressAlias:edtelectronicsalias,
                        BSB:edtbsb,
                        Clientid:localStorage.getItem('mySessionEmployeeLoggedID'),
                        Amount:1,
                        Active: true,
                        DepartmentName:defaultDept,
                        Allclasses:true,
                    }
                };


                taxRateService.saveSuperannuation(objDetails).then(function (objDetails) {
                    LoadingOverlay.hide();
                    swal({
                        title: 'Success',
                        text: 'New Superannuation saved Successfully',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    }).then((result) => {
                        if (result.value) {
                            sideBarService.getSuperannuation(initialBaseDataLoad, 0).then(function (dataReload) {
                                addVS1Data("Tsuperannuation", JSON.stringify(dataReload)).then(function (datareturn) {
                                    $('#closeuperannution').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=super','_self');
                                }).catch(function (err) {
                                    $('#closeuperannution').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=super','_self');
                                });
                            }).catch(function (err) {
                                $('#closeuperannution').trigger('click');
                                LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=super','_self');
                            });
                        }else if (result.dismiss === 'cancel') {

                        }
                    });
                }).catch(function (err) {
                    LoadingOverlay.hide();
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {

                        } else if (result.dismiss === 'cancel') {

                        }
                    });
                });
            }
        }, delayTimeAfterSound);
    },

   'click .btnSaveReimbursement': function(){
        LoadingOverlay.show();
        let templateObject = Template.instance();
        let taxRateService = new TaxRateService();
        let reimbursementname = $('.edtReimbursementName').val() || '';
        let account = $('#edtReimbursementAccount').val() || '';
        let oldres_id = $('#res_id').val() || 0 ;

        if (reimbursementname === '') {
            LoadingOverlay.hide();
            swal('Reimbursement Name has not been Filled!', '', 'warning');
            e.preventDefault();
        } else if(account === '') {
            LoadingOverlay.hide();
            swal('Account has not been Selected!', '', 'warning');
            e.preventDefault();
        } else {
            LoadingOverlay.show();
            if(oldres_id != 0) {
                objDetails = {
                    type: "TReimbursement",
                    fields: {
                        ID: parseInt(oldres_id),
                        ReimbursementName:reimbursementname,
                        ReimbursementAccount:account,
                        ReimbursementActive:true,
                    }
                };

                taxRateService.saveReimbursement(objDetails).then(function (objDetails) {
                    swal({
                        title: 'Success',
                        text: 'Reimbursement Saved Successfully',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                     }).then((result) => {
                        if (result.value) {
                            sideBarService.getReimbursement(initialBaseDataLoad, 0).then(function (dataReload) {
                                addVS1Data("TReimbursement", JSON.stringify(dataReload)).then(function (datareturn) {
                                    $('#closeresim').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=payitem&itemtype=resimu','_self');
                                }).catch(function (err) {
                                    $('#closeresim').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=payitem&itemtype=resimu','_self');
                                });
                              }).catch(function (err) {
                                $('#closeresim').trigger('click');
                                 LoadingOverlay.show();
                                 window.open('/payrollrules?active_key=payitem&itemtype=resimu','_self');
                              });
                        }else if (result.dismiss === 'cancel') {
                        }
                    });
                  LoadingOverlay.hide();
                });
            }
            else {
                LoadingOverlay.show();
                taxRateService.checkReimbursementByName(reimbursementname).then(function (data) {
                    TReimbursementid = data.treimbursement[0].Id;
                    objDetails = {
                       type: "TReimbursement",
                       fields: {
                           ID: parseInt(TReimbursementid),
                           ReimbursementName:reimbursementname,
                           ReimbursementAccount:account,
                           ReimbursementActive:true,
                       }
                    };
                    taxRateService.saveReimbursement(objDetails).then(function (objDetails) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Success',
                            text: 'New Reimbursement saved Successfully',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'
                        }).then((result) => {
                            if (result.value) {
                                sideBarService.getReimbursement(initialBaseDataLoad, 0).then(function (dataReload) {
                                    addVS1Data("TReimbursement", JSON.stringify(dataReload)).then(function (datareturn) {
                                        $('#closeresim').trigger('click');
                                        LoadingOverlay.show();

                                        window.open('/payrollrules?active_key=payitem&itemtype=resimu','_self');
                                    }).catch(function (err) {
                                        $('#closeresim').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem&itemtype=resimu','_self');
                                    });
                                  }).catch(function (err) {
                                    $('#closeresim').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=payitem&itemtype=resimu','_self');
                                  });
                            }else if (result.dismiss === 'cancel') {
                            }
                        });
                    }).catch(function (err) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                            } else if (result.dismiss === 'cancel') {
                            }
                        });
                    });
                }).catch(function (err) {
                    objDetails = {
                        type: "TReimbursement",
                        fields: {
                            ReimbursementName:reimbursementname,
                            ReimbursementAccount:account,
                            ReimbursementActive:true,
                        }
                    };
                    taxRateService.saveReimbursement(objDetails).then(function (objDetails) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Success',
                            text: 'New Reimbursement saved Successfully',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'
                        }).then((result) => {
                            if (result.value) {
                                sideBarService.getReimbursement(initialBaseDataLoad, 0).then(function (dataReload) {
                                    addVS1Data("TReimbursement", JSON.stringify(dataReload)).then(function (datareturn) {
                                        $('#closeresim').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem&itemtype=resimu','_self');
                                    }).catch(function (err) {
                                        $('#closeresim').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem&itemtype=resimu','_self');
                                    });
                                  }).catch(function (err) {
                                    $('#closeresim').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=payitem&itemtype=resimu','_self');
                                  });
                            }else if (result.dismiss === 'cancel') {
                            }
                        });
                    }).catch(function (err) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                            } else if (result.dismiss === 'cancel') {
                            }
                        });
                    });
                });
            }
        }
    },

    'click .updateReimbursementInActive': function () {
        LoadingOverlay.show();
        let templateObject = Template.instance();
        let taxRateService = new TaxRateService();
        let reimbursementname = $('.edtReimbursementName').val() || '';
        let account = $('#edtReimbursementAccount').val() || '';
        let oldres_id = $('#res_id').val() || 0 ;

        if (reimbursementname === '') {
            LoadingOverlay.hide();
            swal('Reimbursement Name has not been Filled!', '', 'warning');
            e.preventDefault();
        } else if(account === '') {
            LoadingOverlay.hide();
            swal('Account has not been Selected!', '', 'warning');
            e.preventDefault();
        } else {
            LoadingOverlay.show();
            objDetails = {
                type: "TReimbursement",
                fields: {
                    ID: parseInt(oldres_id),
                    ReimbursementName:reimbursementname,
                    ReimbursementAccount:account,
                    ReimbursementActive:false,
                }
            };

            taxRateService.saveReimbursement(objDetails).then(function (objDetails) {
                swal({
                    title: 'Success',
                    text: 'Reimbursement In Active Successfully',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'
                    }).then((result) => {
                    if (result.value) {
                        sideBarService.getReimbursement(initialBaseDataLoad, 0).then(function (dataReload) {
                            addVS1Data("TReimbursement", JSON.stringify(dataReload)).then(function (datareturn) {
                                $('#closeresim').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=resimu','_self');
                            }).catch(function (err) {
                                $('#closeresim').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=resimu','_self');
                            });
                            }).catch(function (err) {
                            $('#closeresim').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=resimu','_self');
                            });
                    }else if (result.dismiss === 'cancel') {
                    }
                });
                LoadingOverlay.hide();
            });
        }
    },

    'click .updateReimbursementActive': function() {
        LoadingOverlay.show();
        let templateObject = Template.instance();
        let taxRateService = new TaxRateService();
        let reimbursementname = $('.edtReimbursementName').val() || '';
        let account = $('#edtReimbursementAccount').val() || '';
        let oldres_id = $('#res_id').val() || 0 ;

        if (reimbursementname === '') {
            LoadingOverlay.hide();
            swal('Reimbursement Name has not been Filled!', '', 'warning');
            e.preventDefault();
        } else if(account === '') {
            LoadingOverlay.hide();
            swal('Account has not been Selected!', '', 'warning');
            e.preventDefault();
        } else {
            LoadingOverlay.show();
            objDetails = {
                type: "TReimbursement",
                fields: {
                    ID: parseInt(oldres_id),
                    ReimbursementName:reimbursementname,
                    ReimbursementAccount:account,
                    ReimbursementActive:true,
                }
            };

            taxRateService.saveReimbursement(objDetails).then(function (objDetails) {
                swal({
                    title: 'Success',
                    text: 'Reimbursement Active Successfully',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'
                    }).then((result) => {
                    if (result.value) {
                        sideBarService.getReimbursement(initialBaseDataLoad, 0).then(function (dataReload) {
                            addVS1Data("TReimbursement", JSON.stringify(dataReload)).then(function (datareturn) {
                                $('#closeresim').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=resimu','_self');
                            }).catch(function (err) {
                                $('#closeresim').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=resimu','_self');
                            });
                            }).catch(function (err) {
                            $('#closeresim').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=resimu','_self');
                            });
                    }else if (result.dismiss === 'cancel') {
                    }
                });
                LoadingOverlay.hide();
            });
        }
    },

   'click .savePaidLeave':function(){
        LoadingOverlay.show();
        let templateObject = Template.instance();
        let taxRateService = new TaxRateService();
        let Leavename = $('.edtLeaveName').val() || '';
        let Typeofunit = $('#edtTypeOfUnits').val() || '';
        let edtLeaveLoadingRate = $('.edtLeaveLoadingRate').val() || '';
        let edtNormalEntitlement = $('.edtNormalEntitlement').val() || '';
        let leavetype = $('#edtLeaveType').val() || '';
        let payonslip = false;
        let leaveid = $('#paidleaveid').val() || 0;

        if ($('#formCheck-ShowBalance').is(':checked')) {
            payonslip = true;
        } else {
            payonslip = false;
        }

        if (Leavename === '') {
            LoadingOverlay.hide();
            swal('Leave  Name has not been Filled!', '', 'warning');
            e.preventDefault();
        } else if (Typeofunit === '') {
            LoadingOverlay.hide();
            swal('Type of unit has not been selected!', '', 'warning');
            e.preventDefault();
        } else {
            LoadingOverlay.show();
            getVS1Data('TLeave').then(function(dataObject) {
                if(dataObject.length == 0) {
                    var golarray = [];
                    var  objDetails = {
                        type: "TLeave",
                        fields: {
                            LeaveName:Leavename,
                            LeaveUnits:Typeofunit,
                            LeaveType:leavetype,
                            LeaveLeaveLoadingRate:edtLeaveLoadingRate,
                            LeaveNormalEntitlement:edtNormalEntitlement,
                            LeaveShowBalanceOnPayslip:payonslip,
                            LeaveActive:true,
                        }
                    };
                    golarray.push(objDetails)
                    addVS1Data("TLeave", JSON.stringify(golarray)).then(function (datareturn) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Success',
                            text: 'Leave saved successfully.',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'
                        }).then((result) => {
                            if (result.value) {
                                window.open('/payrollrules?active_key=payitem&itemtype=paidleave','_self');
                            } else if (result.dismiss === 'cancel') {
                            }
                        });
                    }).catch(function (err) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Error',
                            text: 'Leave not saved .',
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Done'
                        }).then((result) => {
                            if (result.value) {
                            } else if (result.dismiss === 'cancel') {
                            }
                        });
                    });
                } else {
                    let data = JSON.parse(dataObject[0].data);
                    var golarray = [];

                    for(var i = 0;  i < data.length; i++) {
                       golarray.push(data[i]);
                    }
                    var objDetails = {
                        type: "TLeave",
                        fields: {
                            LeaveName:Leavename,
                            LeaveUnits:Typeofunit,
                            LeaveType:leavetype,
                            LeaveLeaveLoadingRate:edtLeaveLoadingRate,
                            LeaveNormalEntitlement:edtNormalEntitlement,
                            LeaveShowBalanceOnPayslip:payonslip,
                            LeaveActive:true,
                        }
                    };
                    golarray.push(objDetails)
                    addVS1Data("TLeave", JSON.stringify(golarray)).then(function (datareturn) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Success',
                            text: 'Leave saved successfully.',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'
                        }).then((result) => {
                            if (result.value) {
                                window.open('/payrollrules?active_key=payitem&itemtype=paidleave','_self');
                            } else if (result.dismiss === 'cancel') {
                            }
                        });
                    }).catch(function (err) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Error',
                            text: 'Leave not saved .',
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Done'
                        }).then((result) => {
                            if (result.value) {
                            } else if (result.dismiss === 'cancel') {
                            }
                        });
                    });
                }
            });
        }
    },

    'click .updateLeaveInActive': function () {
        LoadingOverlay.show();
        let templateObject = Template.instance();
        let taxRateService = new TaxRateService();
        let Leavename = $('.edtLeaveName').val() || '';
        let Typeofunit = $('#edtTypeOfUnits').val() || '';
        let edtLeaveLoadingRate = $('.edtLeaveLoadingRate').val() || '';
        let edtNormalEntitlement = $('.edtNormalEntitlement').val() || '';
        let leavetype = $('#edtLeaveType').val() || '';
        let payonslip = false;
        let leaveid = $('#paidleaveid').val() || 0;

        if ($('#formCheck-ShowBalance').is(':checked')) {
            payonslip = true;
        } else {
            payonslip = false;
        }

        if (Leavename === '') {
            LoadingOverlay.hide();
            swal('Leave  Name has not been Filled!', '', 'warning');
            e.preventDefault();
        } else if (Typeofunit === '') {
            LoadingOverlay.hide();
            swal('Type of unit has not been selected!', '', 'warning');
            e.preventDefault();
        } else {
            LoadingOverlay.show();
            getVS1Data('TLeave').then(function(dataObject) {
                if(dataObject.length == 0) {
                    var golarray = [];
                    var  objDetails = {
                        type: "TLeave",
                        fields: {
                            LeaveName:Leavename,
                            LeaveUnits:Typeofunit,
                            LeaveType:leavetype,
                            LeaveLeaveLoadingRate:edtLeaveLoadingRate,
                            LeaveNormalEntitlement:edtNormalEntitlement,
                            LeaveShowBalanceOnPayslip:payonslip,
                            LeaveActive:false,
                        }
                    };
                    golarray.push(objDetails)
                    addVS1Data("TLeave", JSON.stringify(golarray)).then(function (datareturn) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Success',
                            text: 'Leave saved successfully.',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'
                        }).then((result) => {
                            if (result.value) {
                                window.open('/payrollrules?active_key=payitem&itemtype=paidleave','_self');
                            } else if (result.dismiss === 'cancel') {
                            }
                        });
                    }).catch(function (err) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Error',
                            text: 'Leave not saved .',
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Done'
                        }).then((result) => {
                            if (result.value) {
                            } else if (result.dismiss === 'cancel') {
                            }
                        });
                    });
                }
            });
        }
    },

    'click .updateLeaveActive': function () {
        LoadingOverlay.show();
        let templateObject = Template.instance();
        let taxRateService = new TaxRateService();
        let Leavename = $('.edtLeaveName').val() || '';
        let Typeofunit = $('#edtTypeOfUnits').val() || '';
        let edtLeaveLoadingRate = $('.edtLeaveLoadingRate').val() || '';
        let edtNormalEntitlement = $('.edtNormalEntitlement').val() || '';
        let leavetype = $('#edtLeaveType').val() || '';
        let payonslip = false;
        let leaveid = $('#paidleaveid').val() || 0;

        if ($('#formCheck-ShowBalance').is(':checked')) {
            payonslip = true;
        } else {
            payonslip = false;
        }

        if (Leavename === '') {
            LoadingOverlay.hide();
            swal('Leave  Name has not been Filled!', '', 'warning');
            e.preventDefault();
        } else if (Typeofunit === '') {
            LoadingOverlay.hide();
            swal('Type of unit has not been selected!', '', 'warning');
            e.preventDefault();
        } else {
            LoadingOverlay.show();
            getVS1Data('TLeave').then(function(dataObject) {
                if(dataObject.length == 0) {
                    var golarray = [];
                    var  objDetails = {
                        type: "TLeave",
                        fields: {
                            LeaveName:Leavename,
                            LeaveUnits:Typeofunit,
                            LeaveType:leavetype,
                            LeaveLeaveLoadingRate:edtLeaveLoadingRate,
                            LeaveNormalEntitlement:edtNormalEntitlement,
                            LeaveShowBalanceOnPayslip:payonslip,
                            LeaveActive:true,
                        }
                    };
                    golarray.push(objDetails)
                    addVS1Data("TLeave", JSON.stringify(golarray)).then(function (datareturn) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Success',
                            text: 'Leave saved successfully.',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'
                        }).then((result) => {
                            if (result.value) {
                                window.open('/payrollrules?active_key=payitem&itemtype=paidleave','_self');
                            } else if (result.dismiss === 'cancel') {
                            }
                        });
                    }).catch(function (err) {
                        LoadingOverlay.hide();
                        swal({
                            title: 'Error',
                            text: 'Leave not saved .',
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Done'
                        }).then((result) => {
                            if (result.value) {
                            } else if (result.dismiss === 'cancel') {
                            }
                        });
                    });
                }
            });
        }
    },

   'click .saveExemptReportable':function(){
    LoadingOverlay.show();
    let templateObject = Template.instance();
    let taxRateService = new TaxRateService();
    let edtEarningsName = $('#edtEarningsName').val() || '';
    let edtDisplayName = $('#edtDisplayName').val() || '';
    let earningtype = $('#edtEarningType').val() || '';
    let edtRateType = $('#edtRateType').val() || '';
    let edtExpenseAccount = $('#edtExpenseAccount').val() || '';
    let ExemptPAYGp = false;
    let ExemptSuperannuation = false;
    let ExemptReportable = false;
    let oldid = $('#ordinaryTimeEarningsid').val() || 0;

    if($('#formCheck-ExemptPAYG').is(':checked')){
        ExemptPAYGp = true;
    }else{
        ExemptPAYGp = false;
    }

    if($('#formCheck-ExemptSuperannuation').is(':checked')){
        ExemptSuperannuation = true;
    }else{
        ExemptSuperannuation = false;
    }

    if($('#formCheck-ExemptReportable').is(':checked')){
        ExemptReportable = true;
    }else{
        ExemptReportable = false;
    }

    if (edtEarningsName === '') {
        LoadingOverlay.hide();
        swal('Earnings Name has not been Filled!', '', 'warning');
        e.preventDefault();
     }
     else if(edtRateType === '')
     {
        LoadingOverlay.hide();
        swal('Earnings Rate type has not been Selected!', '', 'warning');
        e.preventDefault();
     }
     else if(edtExpenseAccount === '')
     {
        LoadingOverlay.hide();
        swal('Expense Account has not been Selected!', '', 'warning');
        e.preventDefault();
     }
     else {
        LoadingOverlay.show();

        getVS1Data(erpObject.TEarnings).then(function(dataObject) {

            if(dataObject.length == 0)
            {

                var golarray = [];
                var objDetails = {
                    type: "TEarning",
                    fields: {
                        EarningName:edtEarningsName,
                        EarningType:earningtype,
                        EarningDisplayName:edtDisplayName,
                        EarningRateType:edtRateType,
                        EarningExpanceAccount:edtExpenseAccount,
                        Earningpaygholding:ExemptPAYGp,
                        Earningsuperannuation:ExemptSuperannuation,
                        Earningactivitystatement:ExemptReportable,
                    }
                };

                golarray.push(objDetails)


                addVS1Data("TEarnings", JSON.stringify(golarray)).then(function (datareturn) {
                    LoadingOverlay.hide();
                    swal({
                    title: 'Success',
                    text: 'Earning saved successfully.',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'

                    }).then((result) => {
                    if (result.value) {

                   window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                    }else if (result.dismiss === 'cancel') {

                    }
                    });



                }).catch(function (err) {


                    LoadingOverlay.hide();
                    swal({
                      title: 'Error',
                      text: 'Leave not saved .',
                      type: 'error',
                      showCancelButton: false,
                      confirmButtonText: 'Done'

                      }).then((result) => {
                      if (result.value) {

                      }else if (result.dismiss === 'cancel') {

                      }
                      });
                   });




            }
            else{

                let data = JSON.parse(dataObject[0].data);
                var golarray = [];
                for(var i = 0;  i < data.length; i++)
                {

                   golarray.push(data[i]);

                }


                 var  objDetails = {
                    type: "TEarning",
                    fields: {
                        EarningName:edtEarningsName,
                        EarningType:earningtype,
                        EarningDisplayName:edtDisplayName,
                        EarningRateType:edtRateType,
                        EarningExpanceAccount:edtExpenseAccount,
                        Earningpaygholding:ExemptPAYGp,
                        Earningsuperannuation:ExemptSuperannuation,
                        Earningactivitystatement:ExemptReportable,
                    }
                };

                golarray.push(objDetails)
                addVS1Data("TEarnings", JSON.stringify(golarray)).then(function (datareturn) {
                    LoadingOverlay.hide();
                    swal({
                    title: 'Success',
                    text: 'Earning saved successfully.',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'

                    }).then((result) => {
                    if (result.value) {

                   window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                    }else if (result.dismiss === 'cancel') {

                    }
                    });



                }).catch(function (err) {


                    LoadingOverlay.hide();
                    swal({
                      title: 'Error',
                      text: 'Leave not saved .',
                      type: 'error',
                      showCancelButton: false,
                      confirmButtonText: 'Done'

                      }).then((result) => {
                      if (result.value) {

                      }else if (result.dismiss === 'cancel') {

                      }
                      });
                   });


            }





        });


     }




    },
    'click .btnSaveAccountPOP':function()
    {
        playSaveAudio();
        let templateObject = Template.instance();
        let taxRateService = new TaxRateService();
        let accountService = new AccountService();
        let organisationService = new OrganisationService();
        setTimeout(function(){
        LoadingOverlay.show();
        let edtAccountId = $('#edtAccountID').val() || '';
        let accSelected = $('#accSelected').val() || '';
        let edtAccountName = $('#edtAccountName').val() || '';
        let edtAccountNo = $('#edtAccountNo').val() || '';
        let sltTaxCode = $('#sltTaxCode').val() || '';
        let txaAccountDescription = $('#txaAccountDescription').val() || '';
        let sltAccountType = $('#sltAccountType').val() || '';
        let edtBSB = $('#edtBSB').val() || '';
        let edtBankAccountNo = $('#edtBankAccountNo').val() || '';
        let swiftCode = $('#swiftCode').val() || '';
        let routingNo = $('#routingNo').val() || '';
        let showOnTransactions = false;
        let edtBankName = $('#edtBankName').val() || '';
        let edtBankAccountName = $('#edtBankAccountName').val() || '';
        let cardnumber = $('#edtCardNumber').val() || '';
        var expirydateTime = new Date($("#edtExpiryDate").datepicker("getDate"));
        let expiryDate =  expirydateTime.getFullYear() +  "-" +(expirydateTime.getMonth() + 1) +  "-" + expirydateTime.getDate();
        let expire = expiryDate;
        let edtCvc = $('#edtCvc').val() || '';

        if($('#showOnTransactions').is(':checked')){
            showOnTransactions = true;
        }else{
            showOnTransactions = false;
        }

        let companyID = 1;

        if (edtAccountName === '') {
            LoadingOverlay.hide();
            swal('Account Name has not been Filled!', '', 'warning');
            e.preventDefault();
         }
         else {

            if(edtAccountId != 0)
            {
                LoadingOverlay.show();
                data = {
                    type: "TAccount",
                    fields: {
                      ID: edtAccountId,
                      AccountName: edtAccountName || "",
                      AccountNumber: edtAccountNo || "",
                      Active: true,
                      BankAccountName: edtBankAccountName || "",
                      BankAccountNumber: edtBankAccountNo || "",
                      BSB: edtBSB || "",
                      Description: txaAccountDescription || "",
                      TaxCode: sltTaxCode || "",
                      Extra: swiftCode,
                      BankNumber: routingNo,
                      //Level4: bankname,
                      PublishOnVS1: true,
                      IsHeader: showOnTransactions,
                      CarNumber: cardnumber || "",
                      CVC: edtCvc || "",
                      ExpiryDate: expiryDate || "",
                    },
                  };

                  accountService.saveAccount(data)
                  .then(function (data) {
                    if ($("#showOnTransactions").is(":checked")) {
                      var objDetails = {
                        type: "TCompanyInfo",
                        fields: {
                          Id: companyID,
                          AccountNo: edtBankAccountNo,
                          BankBranch: swiftCode,
                          BankAccountName: edtBankAccountName,
                          BankName: edtBankName,
                          Bsb: edtBSB,
                          SiteCode: routingNo,
                          FileReference: edtAccountName,
                        },
                      };
                      organisationService
                        .saveOrganisationSetting(objDetails)
                        .then(function (data) {
                          var accNo = edtBankAccountNo || "";
                          var swiftCode1 = swiftCode || "";
                          var bankAccName = edtBankAccountName || "";
                          var accountName = edtAccountName || "";
                          var bsb = edtBSB || "";
                          var routingNo = routingNo || "";
                          localStorage.setItem("vs1companyBankName", bankname);
                          localStorage.setItem("vs1companyBankAccountName", bankAccName);
                          localStorage.setItem("vs1companyBankAccountNo", accNo);
                          localStorage.setItem("vs1companyBankBSB", bsb);
                          localStorage.setItem("vs1companyBankSwiftCode", swiftCode1);
                          localStorage.setItem("vs1companyBankRoutingNo", routingNo);
                          sideBarService
                            .getAccountListVS1()
                            .then(function (dataReload) {
                              addVS1Data("TAccountVS1", JSON.stringify(dataReload))
                                .then(function (datareturn) {
                                    window.open('/payrollrules?active_key=payitem','_self');
                                })
                                .catch(function (err) {
                                    window.open('/payrollrules?active_key=payitem','_self');
                                });
                            })
                            .catch(function (err) {
                                window.open('/payrollrules?active_key=payitem','_self');
                            });
                        })
                        .catch(function (err) {
                          sideBarService
                            .getAccountListVS1()
                            .then(function (dataReload) {
                              addVS1Data("TAccountVS1", JSON.stringify(dataReload))
                                .then(function (datareturn) {
                                    window.open('/payrollrules?active_key=payitem','_self');
                                })
                                .catch(function (err) {
                                    window.open('/payrollrules?active_key=payitem','_self');
                                });
                            })
                            .catch(function (err) {
                                window.open('/payrollrules?active_key=payitem','_self');
                            });
                        });
                    } else {
                      sideBarService
                        .getAccountListVS1()
                        .then(function (dataReload) {
                          addVS1Data("TAccountVS1", JSON.stringify(dataReload))
                            .then(function (datareturn) {
                                window.open('/payrollrules?active_key=payitem','_self');;
                            })
                            .catch(function (err) {
                                window.open('/payrollrules?active_key=payitem','_self');
                            });
                        })
                        .catch(function (err) {
                            window.open('/payrollrules?active_key=payitem','_self');
                        });
                    }
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
                        window.open('/payrollrules?active_key=payitem','_self');
                      } else if (result.dismiss === "cancel") {
                      }
                    });
                    $(".fullScreenSpin").css("display", "none");
                  });


            }
            else
            {
                swal('Account is not selected to edit!', '', 'warning');
                e.preventDefault();
            }
         }
        }, delayTimeAfterSound);
        },

    'change #edtFundType':function(){

        let fundType = $('#edtFundType').val();
        if(fundType == 'selfmanged')
        {
            $('#acountabmandelectronic').css('display','block');
            $('#accountbsb').css('display','block');
            $('#account_name').css('display','block');
        }
        else{
            $('#acountabmandelectronic').css('display','none');
            $('#accountbsb').css('display','none');
            $('#account_name').css('display','none');
        }

    },

    'change #edtAllowanceAmount, change #edtDeductionAmount': function(event) {

        let utilityService = new UtilityService();
        if (!isNaN($(event.target).val())) {
            let inputUnitPrice = parseFloat($(event.target).val()) || 0;
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));
        } else {
            let inputUnitPrice = Number($(event.target).val().replace(/[^0-9.-]+/g, "")) || 0;

            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));


        }

    },
    'keydown #edtAllowanceAmount, keydown #edtDeductionAmount': function(event) {
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
            event.keyCode == 46 || event.keyCode == 190 || event.keyCode == 189 || event.keyCode == 109) {} else {
            event.preventDefault();
        }
    },
    'click .btnDeleteAllowance': function () {
      playDeleteAudio();
      let taxRateService = new TaxRateService();
      setTimeout(function(){
      let allowanceId = $('#selectDeleteLineID').val()||0;
      LoadingOverlay.show();

      let objDetails = {
          type: "TAllowance",
          fields: {
              Id: parseInt(allowanceId),
              Active: false,
              DisplayName: "Allowances",
              Displayin:"ok"
          }
      };

      taxRateService.saveAllowance(objDetails).then(function (objDetails) {

         LoadingOverlay.hide();
         swal({
            title: 'Success',
            text: 'Allowance Removed Successfully',
            type: 'success',
            showCancelButton: false,
            confirmButtonText: 'Done'

         }).then((result) => {
            if (result.value) {

              sideBarService.getAllowance(initialBaseDataLoad, 0).then(function (dataReload) {
               addVS1Data("TAllowance", JSON.stringify(dataReload)).then(function (datareturn) {
                $('#delallow').trigger('click');
                LoadingOverlay.show();
                  window.open('/payrollrules?active_key=payitem','_self');
              }).catch(function (err) {
                $('#delallow').trigger('click');
                LoadingOverlay.show();
                  window.open('/payrollrules?active_key=payitem','_self');
                });
                }).catch(function (err) {
                    $('#delallow').trigger('click');
                    LoadingOverlay.show();
                  window.open('/payrollrules?active_key=payitem','_self');
                });

            }else if (result.dismiss === 'cancel') {

            }
         });

      }).catch(function (err) {
            LoadingOverlay.hide();
            swal({
            title: 'Oooops...',
            text: err,
            type: 'error',
            showCancelButton: false,
            confirmButtonText: 'Try Again'
            }).then((result) => {
            if (result.value) {

            } else if (result.dismiss === 'cancel') {

            }
            });

      });
    }, delayTimeAfterSound);
    },

    'click .btnDeleteCalender': function () {
        playDeleteAudio();
        let taxRateService = new TaxRateService();
        setTimeout(function(){

        let calenderid = $('#selectColDeleteLineID').val()||0;
        let calendername = $('#selectCalenderName').val()||0;
        LoadingOverlay.show();

        let objDetails = {
            type: "TPayrollCalendars",
            fields: {
                Id: calendername,
                PayrollCalendarActive: false,
            }
        };

        if(calendername != 0)
        {
              taxRateService.saveCalender(objDetails).then(function (objDetails) {
                LoadingOverlay.hide();

                swal({
                    title: 'Success',
                    text: 'Calender Removed Successfully',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'

                 }).then((result) => {
                    if (result.value) {
                        sideBarService.getCalender(initialBaseDataLoad, 0).then(function (dataReload) {
                            addVS1Data("TPayrollCalendars", JSON.stringify(dataReload)).then(function (datareturn) {
                                $('#hidedeleteca').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=calender','_self');
                           }).catch(function (err) {
                                $('#hidedeleteca').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=calender','_self');
                             });
                             }).catch(function (err) {
                                $('#hidedeleteca').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=calender','_self');
                             });
                    }else if (result.dismiss === 'cancel') {

                    }
                });

              }).catch(function (err) {
                swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'ok'
                }).then((result) => {
                if (result.value) {

                } else if (result.dismiss === 'cancel') {

                }
                });
                  LoadingOverlay.hide();
              });

        }
        else{
                LoadingOverlay.hide();
                swal({
                title: 'Oooops...',
                text: 'Calender ID missing',
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
                }).then((result) => {
                if (result.value) {

                } else if (result.dismiss === 'cancel') {

                }
                });


        }
    }, delayTimeAfterSound);
    },

    'click .btnDeleteLeave': function () {
        playDeleteAudio();
        let taxRateService = new TaxRateService();
        setTimeout(function(){

        let LeaveId = $('#selectLeaveDeleteLineID').val()||0;
        let LeaveName = $('#selectLeaveName').val()||0;
        let Type = $('#leave_type').val()|| '';
        if(Type == 'paid'){

            LoadingOverlay.show();
            let objDetails = {
                type: "TPaidLeave",
                fields: {
                    Id: LeaveName,
                    LeavePaidActive: false,
                }
            };
            if(LeaveName != 0)
             {
                       taxRateService.savePaidLeave(objDetails).then(function (objDetails) {
                       LoadingOverlay.hide();
                       swal({
                        title: 'Success',
                        text: 'Paid Leave removed Successfully',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'

                        }).then((result) => {
                            if (result.value) {
                                sideBarService.getPaidLeave(initialBaseDataLoad, 0).then(function (dataReload) {
                                    addVS1Data("TPaidLeave", JSON.stringify(dataReload)).then(function (datareturn) {
                                        $('#delleave').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem&itemtype=paidleave','_self');
                                    }).catch(function (err) {
                                        $('#delleave').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem&itemtype=paidleave','_self');
                                    });
                                  }).catch(function (err) {
                                    $('#delleave').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=payitem&itemtype=paidleave','_self');
                                  });

                            }else if (result.dismiss === 'cancel') {

                            }
                        });


                       }).catch(function (err) {
                        swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                        }).then((result) => {
                        if (result.value) {

                        } else if (result.dismiss === 'cancel') {

                        }
                        });

                    });

            }
            else{

                LoadingOverlay.show();
                swal({
                    title: 'Oooops...',
                    text: 'Please Select Leave to remove',
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'ok'
                    }).then((result) => {
                    if (result.value) {
                    } else if (result.dismiss === 'cancel') {
                    }
                });
            }


        }
        else{

            LoadingOverlay.show();
            let objDetails = {
                type: "TUnPaidLeave",
                fields: {
                    Id: LeaveId,
                    LeaveUnPaidActive: false,
                }
            };
            if(LeaveName != 0)
             {
                      taxRateService.saveUnPaidLeave(objDetails).then(function (objDetails) {
                       LoadingOverlay.hide();
                       swal({
                        title: 'Success',
                        text: 'Unpaid removed Successfully',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'

                        }).then((result) => {
                            if (result.value) {
                                sideBarService.getUnPaidLeave(initialBaseDataLoad, 0).then(function (dataReload) {
                                    addVS1Data("TUnpaidLeave", JSON.stringify(dataReload)).then(function (datareturn) {
                                        $('#delleave').trigger('click');
                                         LoadingOverlay.show();
                                         window.open('/payrollrules?active_key=payitem&itemtype=paidleave','_self');
                                    }).catch(function (err) {
                                        $('#delleave').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem&itemtype=paidleave','_self');
                                    });
                                  }).catch(function (err) {
                                    $('#delleave').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=payitem&itemtype=paidleave','_self');
                                  });
                            }else if (result.dismiss === 'cancel') {

                            }
                        });



                       }).catch(function (err) {
                        LoadingOverlay.hide();
                        swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                        }).then((result) => {
                        if (result.value) {

                        } else if (result.dismiss === 'cancel') {

                        }
                        });
                        LoadingOverlay.hide();
                       });

            }
            else{
                    swal({
                        title: 'Oooops...',
                        text: 'Please Select Leave to remove',
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'ok'
                        }).then((result) => {
                        if (result.value) {
                        } else if (result.dismiss === 'cancel') {
                        }
                    });
            }


        }
    }, delayTimeAfterSound);
    },

    'click .btnDeleteHoliday': function () {
        playDeleteAudio();
        let taxRateService = new TaxRateService();
        setTimeout(function(){

        let holidayid = $('#selectholidayDeleteLineID').val()||0;
        let holidayname = $('#selectholidayName').val()||0;
        LoadingOverlay.show();

        let objDetails = {
            type: "TPayrollHolidays",
            fields: {
                Id: holidayname,
                PayrollHolidaysActive: false,
            }
        };

        if(holidayname != 0)
        {
            taxRateService.saveHoliday(objDetails).then(function (objDetails) {
                LoadingOverlay.hide();
                swal({
                    title: 'Success',
                    text: 'Holiday Removed Successfully',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'

                 }).then((result) => {
                    if (result.value) {
                         sideBarService.getHolidayData(initialBaseDataLoad, 0).then(function (dataReload) {
                            addVS1Data("TPayrollHolidays", JSON.stringify(dataReload)).then(function (datareturn) {
                                $('#delholidy').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=holiday','_self');
                            }).catch(function (err) {
                                $('#delholidy').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=holiday','_self');
                            });
                          }).catch(function (err) {
                                $('#delholidy').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=holiday','_self');
                          });
                    }else if (result.dismiss === 'cancel') {

                    }
                });


              }).catch(function (err) {

                LoadingOverlay.hide();
                swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'ok'
                }).then((result) => {
                if (result.value) {

                } else if (result.dismiss === 'cancel') {

                }
                });

              });

        }
        else{
            LoadingOverlay.hide();
            swal({
            title: 'Oooops...',
            text: 'Please Select Holiday to remove',
            type: 'error',
            showCancelButton: false,
            confirmButtonText: 'ok'
            }).then((result) => {
            if (result.value) {

            } else if (result.dismiss === 'cancel') {

            }
            });
        }
    }, delayTimeAfterSound);
    },

    'click .btnDeleteEarnings':function()
    {
        playDeleteAudio();
        let taxRateService = new TaxRateService();
        setTimeout(function(){
        let earningid = $('#earningdeletename').val() || 0;
        let type = $('#earningdeletetype').val() || 0;

        LoadingOverlay.show();

        if(type === 'Ordinary Time Earning')
        {
            objDetails = {
                type: "TOrdinaryTimeEarnings",
                fields: {
                    ID: parseInt(earningid),
                    OrdinaryTimeEarningsActive: false
                }
            };

            if(earningid != 0) {
                taxRateService.saveordinaryEarningByName(objDetails).then(function (objDetails) {
                LoadingOverlay.hide();

                swal({
                    title: 'Success',
                    text: 'Ordinary Time Earning Removed Successfully',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'
                }).then((result) => {
                    if (result.value) {
                        sideBarService.getOrdinarytimeEarning(initialBaseDataLoad, 0)
                        .then(function (dataReload) {
                            addVS1Data("TOrdinaryTimeEarnings", JSON.stringify(dataReload)).then(function (datareturn) {
                            $('#closeaddordintimemodel').trigger('click');
                            LoadingOverlay.show();
                            window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                        }).catch(function (err) {
                            $('#closeaddordintimemodel').trigger('click');
                            LoadingOverlay.show();
                            window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                        });
                        }).catch(function (err) {
                            $('#closeaddordintimemodel').trigger('click');
                            LoadingOverlay.show();
                            window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                        });


                    }else if (result.dismiss === 'cancel') {

                    }
                });

                }).catch(function (err) {
                    LoadingOverlay.hide();
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Ok'
                        }).then((result) => {
                            if (result.value) {

                            } else if (result.dismiss === 'cancel') {

                            }
                        });

                    });
            }
            else{
                    LoadingOverlay.hide();
                    swal({
                    title: 'Oooops...',
                    text: 'Please Select Ordinary earning to delete',
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'ok'
                    }).then((result) => {
                        if (result.value) {
                        } else if (result.dismiss === 'cancel') {
                        }
                    });
            }
        }
        else if(type === 'OverTime Earning')
        {
            objDetails = {
                type: "Tovertimeearnings",
                fields: {
                    ID: parseInt(earningid),
                    OverTimeEarningsActive:false
                }
            };

            if(earningid != 0)
            {
                    taxRateService.saveExemptReportableOvertime(objDetails).then(function (objDetails) {
                    LoadingOverlay.hide();

                    swal({
                        title: 'Success',
                        text: 'Ordinary Time Earning Removed Successfully',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'

                        }).then((result) => {
                        if (result.value) {
                            sideBarService.getExemptReportableOvertime(initialBaseDataLoad, 0).then(function (dataReload) {
                                addVS1Data("Tovertimeearnings", JSON.stringify(dataReload)).then(function (datareturn) {
                                    $('#addovertimeeringmodel').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                                }).catch(function (err) {
                                    $('#addovertimeeringmodel').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                                });
                              }).catch(function (err) {
                                $('#addovertimeeringmodel').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                              });

                         }else if (result.dismiss === 'cancel') {

                         }
                         });



                        }).catch(function (err) {
                            LoadingOverlay.hide();
                            swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Ok'
                            }).then((result) => {
                            if (result.value) {

                            } else if (result.dismiss === 'cancel') {

                            }
                            });

                        });

            }
            else{
                    LoadingOverlay.hide();
                    swal({
                    title: 'Oooops...',
                    text: 'Please Select Overtime earning to delete',
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'ok'
                    }).then((result) => {
                    if (result.value) {
                    } else if (result.dismiss === 'cancel') {
                    }
                });
            }


        }
        else if(type === 'Employee Termnination')
        {
            objDetails = {
                type: "TTerminationSimple",
                fields: {
                     ID: parseInt(earningid),
                     EmployeeTerminationPaymentsActive:false,

                }
            };

            if(earningid != 0)
            {
                    taxRateService.saveExemptReportableTermnination(objDetails).then(function (objDetails) {
                    LoadingOverlay.hide();

                    swal({
                        title: 'Success',
                        text: 'Termnination Earning Removed Successfully',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'

                        }).then((result) => {
                        if (result.value) {
                            sideBarService.getExemptReportableTermnination(initialBaseDataLoad, 0).then(function (dataReload) {
                                addVS1Data("TTerminationSimple", JSON.stringify(dataReload)).then(function (datareturn) {
                                    $('#addemployeterm').trigger('click');
                                    LoadingOverlay.show();

                                    window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                                }).catch(function (err) {
                                    $('#addemployeterm').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                                });
                              }).catch(function (err) {
                                $('#addemployeterm').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                              });

                         }else if (result.dismiss === 'cancel') {

                         }
                         });



                        }).catch(function (err) {
                            LoadingOverlay.hide();
                            swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Ok'
                            }).then((result) => {
                            if (result.value) {

                            } else if (result.dismiss === 'cancel') {

                            }
                            });

                        });

            }
            else{
                    LoadingOverlay.hide();
                    swal({
                    title: 'Oooops...',
                    text: 'Please Select Termination earning to delete',
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'ok'
                    }).then((result) => {
                    if (result.value) {
                    } else if (result.dismiss === 'cancel') {
                    }
                });
            }

        }
        else if(type === 'Bonuese Commission')
        {
            objDetails = {
                type: "Tearningsbonusescommissions",
                fields: {
                    ID: parseInt(earningid),
                    EarningBonusesCommisionsActive:false
                }
            };

            taxRateService.saveSuperannuationBonusesCommissions(objDetails).then(function (objDetails) {
                LoadingOverlay.hide();
                swal({
                    title: 'Success',
                    text: 'Bonuses Commission Removed Successfully',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'

                }).then((result) => {
                    if (result.value) {
                        sideBarService.getvs1superannuationBonusesCommissions(initialBaseDataLoad, 0).then(function (dataReload) {
                            addVS1Data("Tearningsbonusescommissions", JSON.stringify(dataReload)).then(function (datareturn) {
                                $('#bonusescloseid').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                            }).catch(function (err) {
                                $('#bonusescloseid').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                            });
                          }).catch(function (err) {
                            $('#bonusescloseid').trigger('click');
                            LoadingOverlay.show();
                            window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                          });
                    }else if (result.dismiss === 'cancel') {

                    }
                });

            }).catch(function (err) {
            LoadingOverlay.hide();
            swal({
            title: 'Oooops...',
            text: err,
            type: 'error',
            showCancelButton: false,
            confirmButtonText: 'Try Again'
            }).then((result) => {
            if (result.value) {
            } else if (result.dismiss === 'cancel') {

            }
            });

            });


        }
        else if(type === 'Lump Sum E Earning')
        {
            objDetails = {
                type: "Tlumpsume",
                fields: {
                     ID: parseInt(earningid),
                     LumpSumEActive:false
                }
            };

            taxRateService.saveExemptReportableLumpSumE(objDetails).then(function (objDetails) {
                LoadingOverlay.hide();
                swal({
                    title: 'Success',
                    text: 'Lump Sum E Earnings Removed Successfully',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'

                }).then((result) => {
                    if (result.value) {
                        sideBarService.getExemptReportableLumpSumE(initialBaseDataLoad, 0).then(function (dataReload) {
                            addVS1Data("Tlumpsume", JSON.stringify(dataReload)).then(function (datareturn) {

                                $('#addlumpsumlabelid').trigger('click');
                                LoadingOverlay.show();

                                window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                            }).catch(function (err) {

                                $('#addlumpsumlabelid').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                            });
                          }).catch(function (err) {

                                $('#addlumpsumlabelid').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                          });
                    }else if (result.dismiss === 'cancel') {

                    }
                });
               }).catch(function(err){
                    LoadingOverlay.hide();
                    swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                    }).then((result) => {
                    if (result.value) {

                    }else if (result.dismiss === 'cancel') {

                    }
                    });

            });


        }
        else if(type === 'Lump Sumw')
        {
            objDetails = {
                type: "TLumpSumW",
                fields: {
                    ID: parseInt(earningid),
                    LumpSumWActive:false
                }
            };

            taxRateService.saveLumpSumW(objDetails).then(function (objDetails) {
                LoadingOverlay.hide();
                swal({
                    title: 'Success',
                    text: 'Lump Sum W Removed Successfully',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'

                 }).then((result) => {
                    if (result.value) {
                        sideBarService.getLumpSumW(initialBaseDataLoad, 0).then(function (dataReload) {
                            addVS1Data("TLumpSumW", JSON.stringify(dataReload)).then(function (datareturn) {

                                $('#lumpSumWLabelclose').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                            }).catch(function (err) {
                                $('#lumpSumWLabelclose').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                            });
                          }).catch(function (err) {
                            $('#lumpSumWLabelclose').trigger('click');
                            LoadingOverlay.show();
                            window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                          });
                    }else if (result.dismiss === 'cancel') {

                    }
                });

            });

        }
        else
        {
            objDetails = {
                type: "Tdirectorsfees",
                fields: {
                    ID: parseInt(earningid),
                    DirectorsFeesActive:false
                }
            };

            taxRateService.saveDirectorFee(objDetails).then(function (objDetails) {
                LoadingOverlay.hide();
                swal({
                    title: 'Success',
                    text: 'Director fee earning removed Successfully',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'
                }).then((result) => {
                    if (result.value) {
                        sideBarService.getDirectorFee(initialBaseDataLoad, 0).then(function (dataReload) {
                            addVS1Data("Tdirectorsfees", JSON.stringify(dataReload)).then(function (datareturn) {
                                $('#closedirect').trigger('click');
                                LoadingOverlay.show();
                                window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                            }).catch(function (err) {
                                $('#closedirect').trigger('click');
                                 LoadingOverlay.show();
                                 window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                            });
                          }).catch(function (err) {
                            $('#closedirect').trigger('click');
                            LoadingOverlay.show();
                            window.open('/payrollrules?active_key=payitem&itemtype=earning','_self');
                          });
                    }else if (result.dismiss === 'cancel') {

                    }
                });

            }).catch(function (err) {
                LoadingOverlay.hide();
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                    } else if (result.dismiss === 'cancel') {
                    }
                });
              });


        }
    }, delayTimeAfterSound);
    },

    'click .colRemovesup': function () {
        playDeleteAudio();
        let taxRateService = new TaxRateService();
        setTimeout(function(){
        let superannutionid = $('#selectSuperannuationDeleteLineID').val()||0;
        let superannutionname = $('#selectSuperannuationName').val()||0;

        LoadingOverlay.show();
        let objDetails = {
            type: "Tsuperannuation",
            fields: {
                Id: parseInt(superannutionname),
                Allclasses: false,
            }
        };
        if(superannutionname != 0)
         {
                         taxRateService.saveSuperannuation(objDetails).then(function (objDetails) {
                          LoadingOverlay.hide();

                          swal({
                            title: 'Success',
                            text: 'Superannuation Removed Successfully',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'

                            }).then((result) => {
                            if (result.value) {
                                sideBarService.getSuperannuation(initialBaseDataLoad, 0).then(function (dataReload) {
                                    addVS1Data("Tsuperannuation", JSON.stringify(dataReload)).then(function (datareturn) {
                                        $('#delsup').trigger('click');
                                        LoadingOverlay.show();

                                        window.open('/payrollrules?active_key=super','_self');
                                    }).catch(function (err) {
                                        $('#delsup').trigger('click');
                                        LoadingOverlay.show();
                                        window.open('/payrollrules?active_key=super','_self');
                                    });
                                  }).catch(function (err) {
                                    $('#delsup').trigger('click');
                                    LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=super','_self');
                                  });


                            }else if (result.dismiss === 'cancel') {

                            }
                            });



                   }).catch(function (err) {
                    LoadingOverlay.hide();
                    swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Ok'
                    }).then((result) => {
                    if (result.value) {

                    } else if (result.dismiss === 'cancel') {

                    }
                    });

                   });

        }
        else{
                LoadingOverlay.hide();
                swal({
                title: 'Oooops...',
                text: 'Please Select Superannuation to delete',
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'ok'
                }).then((result) => {
                if (result.value) {
                } else if (result.dismiss === 'cancel') {
                }
               });
        }
    }, delayTimeAfterSound);
    },

    'click .btnDeleteReimsument': function () {
        playDeleteAudio();
        let taxRateService = new TaxRateService();
        setTimeout(function(){
        let reid = $('#selectColReiDeleteLineID').val()||0;
        let ReiName = $('#seleclReiName').val()||0;
        LoadingOverlay.show();

        let objDetails = {
            type: "TReimbursement",
            fields: {
                Id: ReiName,
                ReimbursementActive: false,
            }
        };

        if(ReiName != 0)
        {
               taxRateService.saveReimbursement(objDetails).then(function (objDetails) {
                LoadingOverlay.hide();
                swal({
                    title: 'Success',
                    text: 'Reimbursement Removed Successfully',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'

                }).then((result) => {
                if (result.value) {
                    sideBarService.getReimbursement(initialBaseDataLoad, 0).then(function (dataReload) {
                        addVS1Data("TReimbursement", JSON.stringify(dataReload)).then(function (datareturn) {
                            $('#delres').trigger('click');
                            LoadingOverlay.show();
                            window.open('/payrollrules?active_key=payitem&itemtype=resimu','_self');
                        }).catch(function (err) {
                            $('#delres').trigger('click');
                            LoadingOverlay.show();
                            window.open('/payrollrules?active_key=payitem&itemtype=resimu','_self');
                        });
                      }).catch(function (err) {
                        $('#delres').trigger('click');
                        LoadingOverlay.show();
                          window.open('/payrollrules?active_key=payitem&itemtype=resimu','_self');
                      });
                }else if (result.dismiss === 'cancel') {

                }
                });

              }).catch(function (err) {
                LoadingOverlay.hide();
                swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
                }).then((result) => {
                if (result.value) {

                } else if (result.dismiss === 'cancel') {

                }
                });

              });

        }
        else{

            swal({
                title: 'Oooops...',
                text: 'Please Select Reimbursement to delete',
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'ok'
                }).then((result) => {
                if (result.value) {
                } else if (result.dismiss === 'cancel') {
                }
            });
        }
    }, delayTimeAfterSound);
    },

    'click .btnDeleteDeduction': function () {
        playDeleteAudio();
        let taxRateService = new TaxRateService();
        setTimeout(function(){
        let deductionID = $('#selectDeleteLineID').val()||0;
        let deductionAccountID = $('#selectAccountid').val()||0;
        let deductionAccount = $('#selectAccountname').val()||0;
        let isIsWorkPlacegiving = $('#selectIsWorkPlacegiving').val()||0;
        let isTaxexempt = $('#selectisTaxexempt').val()||0;
        let isUnionfees = $('#selectisUnionfees').val()||0;
        let deductionAmount = $('#selectdeductionAmount').val()||0;
        let deductionName = $('#selectideductionName').val()||0;
        let displayName = $('#selectdisplayName').val()||0;



        LoadingOverlay.show();

        let objDetails = {
            type: "TDeduction",
            fields: {
                Id: parseInt(deductionID),
                Active: false,
                Amount:Number(deductionAmount.replace(/[^0-9.-]+/g, "")) || 0,
                Basedonid:1,
                Description: deductionName,
                DisplayIn: displayName,

            }
        };


        taxRateService.saveDeduction(objDetails).then(function (objDetails) {
          LoadingOverlay.hide();
            swal({
            title: 'Success',
            text: 'Deduction removed Successfully',
            type: 'success',
            showCancelButton: false,
            confirmButtonText: 'Done'

            }).then((result) => {
                if (result.value) {
                    sideBarService.getDeduction(initialBaseDataLoad, 0).then(function (dataReload) {
                        addVS1Data("TDeduction", JSON.stringify(dataReload)).then(function (datareturn) {
                            $('#deldeu').trigger('click');
                            LoadingOverlay.show();
                            window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                        }).catch(function (err) {
                            $('#deldeu').trigger('click');
                            LoadingOverlay.show();
                            window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                        });
                      }).catch(function (err) {
                        $('#deldeu').trigger('click');
                        LoadingOverlay.show();
                        window.open('/payrollrules?active_key=payitem&itemtype=deduction','_self');
                      });
                }else if (result.dismiss === 'cancel') {

                }
            });

         }).catch(function (err) {

            LoadingOverlay.hide();
            swal({
            title: 'Oooops...',
            text: err,
            type: 'error',
            showCancelButton: false,
            confirmButtonText: 'Try Again'
            }).then((result) => {
            if (result.value) {

            }else if (result.dismiss === 'cancel') {

            }
            });

         });
        }, delayTimeAfterSound);
        },


    'click .btnAddNewDeduction': function(event) {
        if( !$(".updateDeductionInActive").hasClass("d-none") || !$('.updateDeductionActive').hasClass('d-none')) {
            if(!$(".updateDeductionInActive").hasClass("d-none"))
                $(".updateDeductionInActive").addClass('d-none');
            else 
                $(".updateDeductionActive").addClass('d-none');
        }

        $('.btnAddNewDeduction').attr("data-toggle", "modal");
        $('.btnAddNewDeduction').attr("data-target", "#deductionModal");
        $('#edtDeductionID').val('');
        $('.edtDeductionName').val('');
        $('.edtDeductionAmount').val('');
        $('#edtDeductionAccount').val('');
        $('#edtDeductionAccountID').val('');
        $('#formCheck-ReducesPAYGDeduction').removeAttr('checked');
        $('#formCheck-ReducesSuperannuationDeduction').removeAttr('checked');
        $('#formCheck-ExcludedDeduction').removeAttr('checked');
        $('#noneLabels').html('Add New Deduction');
        $('#edtDeductionTitle').val('none');
        $('#edtDeductionType').val('');

    },
    'click .noneModal': function(event) {
        $('.noneModal').attr("data-toggle", "modal");
        $('.noneModal').attr("data-target", "#deductionModal");
        $('#edtDeductionID').val('');
        $('#edtDeductionName').val('');
        $('#edtDeductionAmount').val('');
        $('#edtDeductionAccount').val('');
        $('#edtDeductionAccountID').val('');
        $('#formCheck-ReducesPAYGDeduction').removeAttr('checked');
        $('#formCheck-ReducesSuperannuationDeduction').removeAttr('checked');
        $('#formCheck-ExcludedDeduction').removeAttr('checked');
        $('#noneLabel').html("None");
        $('#edtDeductionTitle').val("None");
     },
    'click .workplaceGivingModal': function(event) {
        $('.workplaceGivingModal').attr("data-toggle", "modal");
        $('.workplaceGivingModal').attr("data-target", "#deductionModal");
        $('#edtDeductionID').val('');
        $('#edtDeductionName').val('');
        $('#edtDeductionAmount').val('');
        $('#edtDeductionAccount').val('');
        $('#edtDeductionAccountID').val('');
        $('#formCheck-ReducesPAYGDeduction').removeAttr('checked');
        $('#formCheck-ReducesSuperannuationDeduction').removeAttr('checked');
        $('#formCheck-ExcludedDeduction').removeAttr('checked');
        $('#noneLabel').html("None");
        $('#noneLabel').html("Workplace Giving");
        $('#edtDeductionTitle').val("WorkplaceGiving");
     },
    'click .unionAssociationFeesModal': function(event) {
        $('.unionAssociationFeesModal').attr("data-toggle", "modal");
        $('.unionAssociationFeesModal').attr("data-target", "#deductionModal");
        $('#edtDeductionID').val('');
        $('#edtDeductionName').val('');
        $('#edtDeductionAmount').val('');
        $('#edtDeductionAccount').val('');
        $('#edtDeductionAccountID').val('');
        $('#formCheck-ReducesPAYGDeduction').removeAttr('checked');
        $('#formCheck-ReducesSuperannuationDeduction').removeAttr('checked');
        $('#formCheck-ExcludedDeduction').removeAttr('checked');
        $('#noneLabel').html("None");
        $('#noneLabel').html("Union / Association Fees");
        $('#edtDeductionTitle').val("UnionAssociationFees");
     },

    'click .addpaidleave':function(event){
        $('#paidLeaveLabel').text('Add New leave');
        $('#edtLeaveName').val('');
        $('#paidleaveid').val(0);
        $('#edtTypeOfUnits').val('');
        $('#edtLeaveLoadingRate').val('');
        $('#edtNormalEntitlement').val('');
        $('#formCheck-ShowBalance').removeAttr('checked');
    },

    'click .addunpaidleave':function(event){
        $('#paidLeaveLabel').text('Add Un Paid leave');
        $('#edtUnpaidLeaveName').val('');
        $('#edtUnpaidTypeOfUnits').val('');
        $('#edtUnpaidLeaveLoadingRate').val('');
        $('#edtUnpaidNormalEntitlement').val('');
        $('#formCheck-UnpaidShowBalance').removeAttr('checked');
        $('#unpaidleaveid').val(0);
    },

    'click .btnAddNewPaidLeave': function(event) {
        if( !$(".updateLeaveInActive").hasClass("d-none") || !$('.updateLeaveActive').hasClass('d-none')) {
            if(!$(".updateLeaveInActive").hasClass("d-none"))
                $(".updateLeaveInActive").addClass('d-none');
            else 
                $(".updateLeaveActive").addClass('d-none');
        }

        $('#paidLeaveLabel').text('Add leave');
        $('.edtLeaveName').val('');
        $('#paidleaveid').val(0);
        $('#edtTypeOfUnits').val('');
        $('.edtLeaveLoadingRate').val('');
        $('.edtNormalEntitlement').val('');
        $('#formCheck-ShowBalance').removeAttr('checked');
    },

    'click .btnAddNewReimbursements':function(event){
        if( !$(".updateReimbursementInActive").hasClass("d-none") || !$('.updateReimbursementActive').hasClass('d-none')) {
            if(!$(".updateReimbursementInActive").hasClass("d-none"))
                $(".updateReimbursementInActive").addClass('d-none');
            else 
                $(".updateReimbursementActive").addClass('d-none');
        }

        $('#newReimbursementLabel').text('Add New Reimbursement');
        $('.edtReimbursementName').val('');
        $('#edtReimbursementAccount').val('');
        $('#res_id').val(0);
    },
    'click .btnAddNewSuperannuation':function(event){ 
        if( !$(".updatesuperannuationInActive").hasClass("d-none")) {
            $(".updatesuperannuationInActive").addClass('d-none');
            $(".updatesuperannuationInActive").hide();
        }
        if( !$('.updatesuperannuationActive').hasClass('d-none') ) {
            $(".updatesuperannuationActive").addClass('d-none');
            $(".updatesuperannuationActive").hide();
        }
         $('#newSuperannuationFundLabel').text('Add New Superannuation');
         $('#newSuperannuationFundId').val(0);
         $('#edtFundType').val('');
         $('.edtFundName').val('');
         $('.edtabn').val('');
         $('.edtelectronicsalias').val('');
         $('.edtEmployerNumber').val('');
         $('.edtbsb').val();
         $('.edtaccountnumber').val();
         $('.edtaccountname').val('');
    },
    'click .btnAddordinaryTimeEarnings, click .add-tblEarnings': function(event){
        $('#ordinaryTimeEarningsLabel').text('Add New Earnings');
        $('#ordinaryTimeEarningsid').val(0);
        $('#edtEarningsName').val('');
        $('#edtDisplayName').val('');
        $('#edtRateType').val('');
        $('#edtExpenseAccount').val('');
        $('#formCheck-ShowBalance').removeAttr('checked');
        $('#formCheck-ExemptSuperannuation').removeAttr('checked');
        $('#formCheck-ExemptReportable').removeAttr('checked');
    },
    'click .add-tblEarnings':function(event){
       $('#overtimeEarningsLabel').text('Add New Over Time Earnings');
            $('#edtEarningsNameOvertimeid').val(0);
            $('#edtEarningsNameOvertime').val('');
            $('#edtDisplayNameOvertime').val('');
            $('#edtRateTypeOvertime').val('');
            $('#edtExpenseAccountOvertime').val('');
            $('#formCheck-ExemptPAYGOvertime').removeAttr('checked');
            $('#formCheck-ExemptSuperannuationOvertime').removeAttr('checked');
            $('#formCheck-ExemptReportableOvertime').removeAttr('checked');
    },

    'click .btnAddemploymentTermnination':function(event){
            $('#employmentTermninationPaymentsLabel').text('Add New Employment Termnination');
            $('#edtemploymentTermninationid').val(0);
            $('#edtEarningsNameTermnination').val('');
            $('#edtDisplayNameTermnination').val('');
            $('#edtRateTypeTermnination').val('');
            $('#edtExpenseAccountTermnination').val('');
            $('#formCheck-ExemptPAYGTermnination').removeAttr('checked');
            $('#formCheck-ExemptSuperannuationTermnination').removeAttr('checked');
            $('#formCheck-ExemptReportableTermnination').removeAttr('checked');
    },
    'click .btnAddolumpSumE':function(event){
        $('#lumpSumELabel').text('Add New Lump Sum E');
        $('#edtLumpSumid').val(0);
        $('#edtEarningsNameLumpSumE').val('');
        $('#edtDisplayNameLumpSumE').val('');
        $('#edtRateTypeLumpSumE').val('');
        $('#edtExpenseAccountLumpSumE').val('');
        $('#formCheck-ExemptPAYGLumpSumE').removeAttr('checked');
        $('#formCheck-ExemptSuperannuationLumpSumE').removeAttr('checked');
        $('#formCheck-ExemptReportableLumpSumE').removeAttr('checked');
    },

    'click .btnAddbonusesCommissions':function(event){
            $('#bonusesCommissionsLabel').text('Add New Bonuses & Commissions');
            $('#edtEarningsNameBonusesCommissionid').val(0);
            $('#edtEarningsNameBonusesCommissions').val('');
            $('#edtDisplayNameBonusesCommissions').val('');
            $('#edtRateTypeBonusesCommissions').val('');
            $('#edtExpenseAccountBonusesCommissions').val('');
            $('#formCheck-ExemptPAYGBonusesCommissions').removeAttr('checked');
            $('#formCheck-ExemptSuperannuationBonusesCommissions').removeAttr('checked');
            $('#formCheck-ExemptReportableBonusesCommissions').removeAttr('checked');
    },

    'click .btnAddlumpSumW':function(event){
            $('#lumpSumWLabel').text('Add New Lump Sum W');
            $('#edtEarningsNameLumpSumWid').val(0);
            $('#edtEarningsNameLumpSumW').val('');
            $('#edtDisplayNameLumpSumW').val('');
            $('#edtRateTypeLumpSumW').val('');
            $('#edtExpenseAccountLumpSumW').val('');
            $('#formCheck-ExemptPAYGLumpSumW').removeAttr('checked');
            $('#formCheck-ExemptSuperannuationLumpSumW').removeAttr('checked');
            $('#formCheck-ExemptReportableLumpSumW').removeAttr('checked');
    },
    'click .btnAdddirectorsFees':function(event){
        $('#directorsFeesLabel').text('Add New Directors Fees');
        $('#edtEarningsDirectorsFeesid').val(0);
        $('#edtEarningsNameDirectorsFees').val('');
        $('#edtDisplayNameDirectorsFees').val('');
        $('#edtRateTypeDirectorsFees').val('');
        $('#edtExpenseAccountDirectorsFees').val('');
        $('#formCheck-ExemptPAYGDirectorsFees').removeAttr('checked');
        $('#formCheck-ExemptSuperannuationDirectorsFees').removeAttr('checked');
        $('#formCheck-ExemptReportableDirectorsFees').removeAttr('checked');
    },
    'click #uploadImg':function (event) {
        //let imageData= (localStorage.getItem("Image"));
        let templateObject = Template.instance();
        let imageData=templateObject.imageFileData.get();
        if(imageData!=null && imageData!="")
        {
            addVS1Data("TVS1Image", imageData);
            localStorage.setItem("Image",imageData);
            $('#uploadedImage').attr('src', imageData);
            //$('#uploadedImage').attr('width','100%');
            $('#removeLogo').show();
            $('#changeLogo').show();
        }

    },

    'change #fileInput' :function (event) {
        let templateObject = Template.instance();
        let selectedFile = event.target.files[0];
        let reader = new FileReader();
        $(".Choose_file").text('');
        reader.onload = function(event) {

            $( "#uploadImg" ).prop( "disabled", false );
            $("#uploadImg").addClass("on-upload-logo");
            $(".Choose_file").text(selectedFile.name);
            //$("#uploadImg").css("background-color","yellow");
            templateObject.imageFileData.set(event.target.result);

            //localStorage.setItem("Image",event.target.result);
        };
        reader.readAsDataURL(selectedFile);
    },
    'click #removeLogo':function (event) {
        let templateObject = Template.instance();
        templateObject.imageFileData.set(null);
        localStorage.removeItem("Image");
        // location.reload();
        Meteor._reload.reload();

    },
    'click .btnBack':function(event){
      playCancelAudio();
      event.preventDefault();
      setTimeout(function(){
      history.back(1);
      }, delayTimeAfterSound);
    },

    'keyup #tblPayCalendars_filter input': function (event) {
        if($(event.target).val() != ''){
          $(".btnRefreshcalender").addClass('btnSearchAlert');
        }else{
          $(".btnRefreshcalender").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
           $(".btnRefreshCalender").trigger("click");
        }
    },
    'click .btnRefreshcalender':function(event){

        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let tableProductList;
        const dataTableList = [];
        var splashArrayInvoiceList = new Array();
        const lineExtaSellItems = [];
        // $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('#tblPayCalendars_filter input').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getNewCalenderByNameOrPayPeriod(dataSearchName).then(function (data) {
                $(".btnRefreshcalender").removeClass('btnSearchAlert');
                let lineItems = [];
                let lineItemObj = {};
                if (data.tpayrollcalendars.length > 0) {
                    for (let i = 0; i < data.tpayrollcalendars.length; i++) {

                        var dataTableList = {
                            id:data.tpayrollcalendars[i].fields.ID || '',
                            name:data.tpayrollcalendars[i].fields.PayrollCalendarName || '',
                            period:data.tpayrollcalendars[i].fields.PayrollCalendarPayPeriod || '',
                            startdate: moment(data.tpayrollcalendars[i].fields.PayrollCalendarStartDate).format('DD/MM/YYYY') || '',
                            enddate:moment(data.tpayrollcalendars[i].fields.PayrollCalendarFirstPaymentDate).format('DD/MM/YYYY') || ''
                        };

                        splashArrayInvoiceList.push(dataTableList);
                    }
                    templateObject.datatablerecords.set(splashArrayInvoiceList);

                    let item = templateObject.datatablerecords.get();
                    LoadingOverlay.hide();
                    if (splashArrayInvoiceList) {
                        var datatable = $('#tblPayCalendars').DataTable();
                        $("#tblPayCalendars > tbody").empty();
                        for (let x = 0; x < item.length; x++) {
                            $("#tblPayCalendars > tbody").append(
                                '<tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
                                '<td contenteditable="false" class="colCalenderID hiddenColumn">' + item[x].id + '</td>' +
                                '<td contenteditable="false" class="colPayCalendarName" ><span style="">' + item[x].name + '</span></td>' +
                                '<td contenteditable="false" class="colPayPeriod">' + item[x].period + '</td>' +
                                '<td contenteditable="false" class="colNextPayPeriod" >' + item[x].startdate + '</td>' +
                                '<td contenteditable="false" class="colNextPaymentDate">' + item[x].enddate + '</td>' +
                                '<td contenteditable="false" class="colAction"><div class="dropdown">' + 
                                '<button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown">' +
                                '</button><div class="dropdown-menu"><a class="dropdown-item" href="#">Link 1</a><a class="dropdown-item" href="#">Link 2</a>' + 
                                '</div></div></td>' + 
                                '</tr>');

                        }
                        $('.dataTables_info').html('Showing 1 to ' + data.tpayrollcalendars.length + ' of ' + data.tpayrollcalendars.length + ' entries');

                    }

                } else {
                    LoadingOverlay.hide();

                    swal({
                        title: 'Question',
                        text: "Pay Calender does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            FlowRouter.go('/payrollrules');
                        } else if (result.dismiss === 'cancel') {
                            //$('#productListModal').modal('toggle');
                        }
                    });
                }
            }).catch(function (err) {
                LoadingOverlay.hide();
            });
        } else {

            LoadingOverlay.hide();

            swal({
                title: 'Alert',
                text: "Please write something to search",
                type: 'error',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {

                } else if (result.dismiss === 'cancel') {

                }
            });
           //  $(".btnRefresh").trigger("click");
        }

    },

   'keyup #tblHolidays_filter input': function (event) {
        if($(event.target).val() != ''){
        $(".btnRefreshHoliday").addClass('btnSearchAlert');
        }else{
        $(".btnRefreshHoliday").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
        $(".btnRefreshHoliday").trigger("click");
        }
    },
    'click .btnRefreshHoliday':function(event){
        const dataTableList = [];
        const lineExtaSellItems = [];

        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let tableProductList;
        let dataSearchName = $('#tblHolidays_filter input').val();
        var splashArrayInvoiceList = new Array();
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getNewHolidayByGroupName(dataSearchName).then(function (data) {
                $(".btnRefreshHoliday").removeClass('btnSearchAlert');
                let lineItems = [];
                let lineItemObj = {};
                if (data.tpayrollholidays.length > 0) {
                    for (let i = 0; i < data.tpayrollholidays.length; i++) {

                        var dataTableList = {
                            id:data.tpayrollholidays[i].fields.ID || '',
                            name:data.tpayrollholidays[i].fields.PayrollHolidaysName || '',
                            group:data.tpayrollholidays[i].fields.PayrollHolidaysGroupName  || '',
                            date: moment(data.tpayrollholidays[i].fields.PayrollHolidaysDate).format('DD/MM/YYYY') || '',
                            deletedata:''
                        };

                        splashArrayInvoiceList.push(dataTableList);
                    }
                    templateObject.datatablerecords.set(splashArrayInvoiceList);

                    let item = templateObject.datatablerecords.get();
                    LoadingOverlay.hide();
                    if (splashArrayInvoiceList) {
                        var datatable = $('#tblHolidays').DataTable();
                        $("#tblHolidays > tbody").empty();
                        for (let x = 0; x < item.length; x++) {
                            $("#tblHolidays > tbody").append(
                                '<tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
                                '<td contenteditable="false" class="colHolidayID hiddenColumn">' + item[x].id + '</td>' +
                                '<td contenteditable="false" class="colHolidayName" ><span >' + item[x].name + '</span></td>' +
                                '<td contenteditable="false" class="colHolidayDate">' + item[x].date + '</td>' +
                                '<td contenteditable="false" class="colHolidaygroup hiddenColumn" >' + item[x].group + '</td>' +

                                item[x].deletedata +
                                '</tr>');

                        }
                        $('.dataTables_info').html('Showing 1 to ' + data.Tpayrollholidays.length + ' of ' + data.Tpayrollholidays.length + ' entries');

                    }

                } else {
                    LoadingOverlay.hide();

                    swal({
                        title: 'Question',
                        text: "Holiday does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            FlowRouter.go('/payrollrules');
                        } else if (result.dismiss === 'cancel') {
                            //$('#productListModal').modal('toggle');
                        }
                    });
                }
            }).catch(function (err) {
                LoadingOverlay.hide();
            });
        } else {


            LoadingOverlay.hide();

            swal({
                title: 'Alert',
                text: "Please write something to search",
                type: 'error',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {

                } else if (result.dismiss === 'cancel') {

                }
            });

            // $(".btnRefresh").trigger("click");
        }

    },

    'keyup #tblSuperannuation_filter input': function (event) {
    if($(event.target).val() != ''){
      $(".btnRefreshSuperannuation").addClass('btnSearchAlert');
    }else{
      $(".btnRefreshSuperannuation").removeClass('btnSearchAlert');
    }
    if (event.keyCode == 13) {
         $(".btnRefreshSuperannuation").trigger("click");
        }
    },

    'click .btnRefreshSuperannuation':function(event){
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let tableProductList;
        const dataTableList = [];
        var splashArrayInvoiceList = new Array();
        const lineExtaSellItems = [];
        // $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('#tblSuperannuation_filter input').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getSuperannuationByName(dataSearchName).then(function (data) {
                $(".btnRefreshSuperannuation").removeClass('btnSearchAlert');
                let lineItems = [];
                let lineItemObj = {};
                if (data.tsuperannuation.length > 0) {
                    for (let i = 0; i < data.tsuperannuation.length; i++) {

                        var dataListAllowance = [
                            data.tsuperannuation[i].fields.ID || '',
                            data.tsuperannuation[i].fields.Superfund || '',
                            data.tsuperannuation[i].fields.Area || '',
                            data.tsuperannuation[i].fields.Employeeid || '',
                            data.tsuperannuation[i].fields.ABN || '',
                            data.tsuperannuation[i].fields.ElectronicsServiceAddressAlias || '',
                            data.tsuperannuation[i].fields.BSB || '',
                            data.tsuperannuation[i].fields.Accountno || '',
                            data.tsuperannuation[i].fields.AccountName || '',
                            data.tsuperannuation[i].fields.Supertypeid || '',
                            // '<td contenteditable="false" class="colDeletesup"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
                            ''
                         ];

                        splashArrayInvoiceList.push(dataTableList);
                    }
                    templateObject.datatablerecords.set(splashArrayInvoiceList);

                    let item = templateObject.datatablerecords.get();
                    LoadingOverlay.hide();
                    if (splashArrayInvoiceList) {
                        var datatable = $('#tblSuperannuation').DataTable();
                        $("#tblSuperannuation > tbody").empty();
                        for (let x = 0; x < item.length; x++) {
                            $("#tblSuperannuation > tbody").append(
                                '<tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
                                '<td contenteditable="false" class="colSuperannuationID hiddenColumn">' + item[x].id + '</td>' +
                                '<td contenteditable="false" class="colSuperannuationName" ><span >' + item[x].name + '</span></td>' +
                                '<td contenteditable="false" class="colSuperannuationType">' + item[x].type + '</td>' +
                                '<td contenteditable="false" class="colEmployerNum" >' + item[x].employenum + '</td>' +
                                '<td contenteditable="false" class="colabn" ><span >' + item[x].abn + '</span></td>' +
                                '<td contenteditable="false" class="colservicealias">' + item[x].service + '</td>' +
                                '<td contenteditable="false" class="colbsb" >' + item[x].bsb + '</td>' +
                                '<td contenteditable="false" class="colaccountnumber" ><span >' + item[x].accountnumber + '</span></td>' +
                                '<td contenteditable="false" class="colaccountname">' + item[x].accountname + '</td>' +
                                '<td contenteditable="false" class="colSuperannuationTypeid hiddenColumn">' + item[x].accountname + '</td>' +
                                // item[x].deletedata +
                                '</tr>');
                        }
                        $('.dataTables_info').html('Showing 1 to ' + data.tvs1superannuation.length + ' of ' + data.tvs1superannuation.length + ' entries');

                    }

                } else {
                    LoadingOverlay.hide();

                    swal({
                        title: 'Question',
                        text: "Supperannuation does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            FlowRouter.go('/payrollrules');
                        } else if (result.dismiss === 'cancel') {
                            //$('#productListModal').modal('toggle');
                        }
                    });
                }
            }).catch(function (err) {
                LoadingOverlay.hide();
            });
        } else {
            LoadingOverlay.hide();

            swal({
                title: 'Alert',
                text: "Please write something to search",
                type: 'error',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {

                } else if (result.dismiss === 'cancel') {

                }
            });
          }

     },

    'click  .filterHoliday':function(event) {
        $(this).attr("disabled", "disabled");
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let tableProductList;
        const dataTableList = [];
        var splashArrayInvoiceList = new Array();
        const lineExtaSellItems = [];
        // $('.fullScreenSpin').css('display', 'inline-block');
        var dataSearchName = $('#holidaygroup2_dropdownholiday2').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getNewHolidayGroup(dataSearchName).then(function (data) {
                $(".btnRefreshHoliday").removeClass('btnSearchAlert');
                let lineItems = [];
                let lineItemObj = {};
                if (data.tpayrollholidays.length > 0) {
                    for (let i = 0; i < data.tpayrollholidays.length; i++) {
                        var dataTableList = {
                            id:data.tpayrollholidays[i].fields.ID || '',
                            name:data.tpayrollholidays[i].fields.PayrollHolidaysName || '',
                            group:data.tpayrollholidays[i].fields.PayrollHolidaysGroupName  || '',
                            date: moment(data.tpayrollholidays[i].fields.PayrollHolidaysDate).format('DD/MM/YYYY') || '',
                            deletedata:'<td class="text-center colHolidayDelete"><span><i class="fa fa-close"></i></span></td>'
                        };
                        splashArrayInvoiceList.push(dataTableList);
                    }
                    templateObject.datatablerecords.set(splashArrayInvoiceList);

                    let item = templateObject.datatablerecords.get();
                    LoadingOverlay.hide();
                    if (splashArrayInvoiceList) {
                        var datatable = $('#tblHolidays').DataTable();
                        $("#tblHolidays > tbody").empty();
                        for (let x = 0; x < item.length; x++) {
                            $("#tblHolidays > tbody").append(
                                '<tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
                                '<td contenteditable="false" class="colHolidayID hiddenColumn">' + item[x].id + '</td>' +
                                '<td contenteditable="false" class="colHolidayName" ><span >' + item[x].name + '</span></td>' +
                                '<td contenteditable="false" class="colHolidayDate">' + item[x].date + '</td>' +
                                '<td contenteditable="false" class="colHolidaygroup hiddenColumn" >' + item[x].group + '</td>' +
                                item[x].deletedata +
                                '</tr>');

                        }
                        $('.dataTables_info').html('Showing 1 to ' + data.Tpayrollholidays.length + ' of ' + data.Tpayrollholidays.length + ' entries');

                    }

                } else {
                    LoadingOverlay.hide();
                    swal({
                        title: 'Question',
                        text: "Holiday does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            FlowRouter.go('/payrollrules');
                        } else if (result.dismiss === 'cancel') {
                            //$('#productListModal').modal('toggle');
                        }
                    });
                }
            }).catch(function (err) {
                LoadingOverlay.hide();
            });
        } else {
            LoadingOverlay.hide();

            swal({
                title: 'Alert',
                text: "Please write something to search",
                type: 'error',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {

                } else if (result.dismiss === 'cancel') {

                }
            });
             // $(".btnRefresh").trigger("click");
        }
        $(this).removeAttr('disabled');
    },

   'keyup #tblAlowances_filter input': function (event) {
        if($(event.target).val() != ''){
          $(".btnRefreshAllowance").addClass('btnSearchAlert');
        }else{
          $(".btnRefreshAllowance").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
           $(".btnRefreshAllowance").trigger("click");
            }
    },
   'click .btnRefreshAllowance':function(event){
    let templateObject = Template.instance();
    let utilityService = new UtilityService();
    let tableProductList;
    const dataTableList = [];
    var splashArrayInvoiceList = new Array();
    const lineExtaSellItems = [];
    // $('.fullScreenSpin').css('display', 'inline-block');
    let dataSearchName = $('#tblAlowances_filter input').val();
    if (dataSearchName.replace(/\s/g, '') != '') {
        sideBarService.getAllowanceByName(dataSearchName).then(function (data) {
            $(".btnRefreshAllowance").removeClass('btnSearchAlert');

            let lineItems = [];
            let lineItemObj = {};
            if (data.tallowance.length > 0) {
                for (let i = 0; i < data.tallowance.length; i++) {
                    let allowanceAmount = utilityService.modifynegativeCurrencyFormat(data.tallowance[i].fields.Amount) || 0.00;

                    var dataTableList = {
                        id:data.tallowance[i].fields.ID || 0,
                        description:data.tallowance[i].fields.Description || '-',
                        type:data.tallowance[i].fields.AllowanceType || '',
                        displayname:data.tallowance[i].fields.DisplayName || '',
                        amount:allowanceAmount || 0.00,
                        accountname:data.tallowance[i].fields.Accountname || '',
                        accountid:data.tallowance[i].fields.Accountid || 0,
                        axempt:data.tallowance[i].fields.Payrolltaxexempt || false,
                        superince:data.tallowance[i].fields.Superinc || false,
                        workcover:data.tallowance[i].fields.Workcoverexempt || false,
                        deletedata:'',
                    };
                    splashArrayInvoiceList.push(dataTableList);
                }
                templateObject.datatablerecords.set(splashArrayInvoiceList);

                let item = templateObject.datatablerecords.get();
                LoadingOverlay.hide();


                if (splashArrayInvoiceList) {
                    var datatable = $('#tblAlowances').DataTable();
                    $("#tblAlowances > tbody").empty();
                    for (let x = 0; x < item.length; x++) {
                        $("#tblAlowances > tbody").append(

                            '<tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
                            '<td contenteditable="false" class="colAlowancesID hiddenColumn">' + item[x].id + '</td>' +
                            '<td contenteditable="false" class="colAllowancesNames" ><span >' + item[x].description + '</span></td>' +
                            '<td contenteditable="false" class="colAllowancesType">' + item[x].type + '</td>' +
                            '<td contenteditable="false" class="colAllowancesDisplayName" >' + item[x].displayname + '</td>' +
                            '<td contenteditable="false" class="colAllowancesAmount text-right" ><span >' + item[x].amount + '</span></td>' +
                            '<td contenteditable="false" class="colAllowancesAccounts">' + item[x].accountname + '</td>' +
                            '<td contenteditable="false" class="colAllowancesAccountsID hiddenColumn" >' + item[x].accountid + '</td>' +
                            '<td contenteditable="false" class="colAllowancesPAYG hiddenColumn" ><span >' + item[x].axempt + '</span></td>' +
                            '<td contenteditable="false" class="colAllowancesSuperannuation hiddenColumn">' + item[x].superince + '</td>' +
                            '<td contenteditable="false" class="colAllowancesReportableasW1 hiddenColumn" >' + item[x].workcover + '</td>' +
                            item[x].deletedata +
                            '</tr>');

                    }
                    $('.dataTables_info').html('Showing 1 to ' + data.tallowance.length + ' of ' + data.tallowance.length + ' entries');

                }

            } else {
                LoadingOverlay.hide();

                swal({
                    title: 'Question',
                    text: "Allowances does not exist, would you like to create it?",
                    type: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No'
                }).then((result) => {
                    if (result.value) {
                        FlowRouter.go('/payrollrules');
                    } else if (result.dismiss === 'cancel') {
                        //$('#productListModal').modal('toggle');
                    }
                });
            }
        }).catch(function (err) {
            LoadingOverlay.hide();
        });
    } else {
        LoadingOverlay.hide();

            swal({
                title: 'Alert',
                text: "Please write something to search",
                type: 'error',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {

                } else if (result.dismiss === 'cancel') {

                }
            });
    }





    },
   'keyup #tblDeductions_filter input': function (event) {
            if($(event.target).val() != ''){
              $(".btnRefreshDeduction").addClass('btnSearchAlert');
            }else{
              $(".btnRefreshDeduction").removeClass('btnSearchAlert');
            }
            if (event.keyCode == 13) {
               $(".btnRefreshDeduction").trigger("click");
                }
    },

    'click .btnRefreshDeduction':function(event){

        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let tableProductList;
        const dataTableList = [];
        var splashArrayInvoiceList = new Array();
        const lineExtaSellItems = [];
        // $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('#tblDeductions_filter input').val();

        if (dataSearchName.replace(/\s/g, '') != '') {
        sideBarService.getDeductionByName(dataSearchName).then(function (data) {
        $(".btnRefreshDeduction").removeClass('btnSearchAlert');
        let lineItems = [];
        let lineItemObj = {};
        if (data.tdeduction.length > 0) {
            for (let i = 0; i < data.tdeduction.length; i++) {

                let deductionAmount = utilityService.modifynegativeCurrencyFormat(data.tdeduction[i].fields.Amount) || 0.00;
                if(data.tdeduction[i].fields.Taxexempt == true){
                  deductionTypeVal = 'None';
                }else{
                  if(data.tdeduction[i].fields.IsWorkPlacegiving == true){
                    deductionTypeVal = 'Workplace Giving';
                  }

                  if(data.tdeduction[i].fields.Unionfees == true){
                    deductionTypeVal = 'Union / Association Fees';
                  }
                }

                var dataTableList = {
                    id:data.tdeduction[i].fields.ID || 0,
                    name:data.tdeduction[i].fields.Description || '-',
                    deductiontype:deductionTypeVal || 'None',
                    displayin:data.tdeduction[i].fields.Displayin || '',
                    amount:deductionAmount || 0.00,
                    accountname:data.tdeduction[i].fields.Accountname || '',
                    accountid:data.tdeduction[i].fields.Accountid || 0,
                    axempt:data.tdeduction[i].fields.Payrolltaxexempt || false,
                    superinc:data.tdeduction[i].fields.Superinc || false,
                    workcover:data.tdeduction[i].fields.Workcoverexempt || false,
                    active: data.tdeduction[i].fields.Active == true ? '' : 'In-Active',
                    deletedata:''
                };

                splashArrayInvoiceList.push(dataTableList);
            }
            templateObject.datatablerecords.set(splashArrayInvoiceList);

            let item = templateObject.datatablerecords.get();
            LoadingOverlay.hide();
            if (splashArrayInvoiceList) {
                var datatable = $('#tblDeductions').DataTable();
                $("#tblDeductions > tbody").empty();
                for (let x = 0; x < item.length; x++) {
                    $("#tblDeductions > tbody").append(
                        '<td contenteditable="false" class="colDeductionsID hiddenColumn">' + item[x].id + '</td>' +
                        '<td contenteditable="false" class="colDeductionsNames" ><span >' + item[x].name + '</span></td>' +
                        '<td contenteditable="false" class="colDeductionsType">' + item[x].deductiontype + '</td>' +
                        '<td contenteditable="false" class="colDeductionsDisplayName">' + item[x].displayin + '</td>' +
                        '<td contenteditable="false" class="colDeductionsAmount text-right" ><span >' + item[x].amount + '</span></td>' +
                        '<td contenteditable="false" class="colDeductionsAccounts">' + item[x].accountname + '</td>' +
                        '<td contenteditable="false" class="colDeductionsAccountsID hiddenColumn">' + item[x].accountid + '</td>' +
                        '<td contenteditable="false" class="colDeductionsPAYG hiddenColumn" ><span >' + item[x].axempt + '</span></td>' +
                        '<td contenteditable="false" class="colDeductionsSuperannuation hiddenColumn">' + item[x].superinc + '</td>' +
                        '<td contenteditable="false" class="colDeductionsReportableasW1 hiddenColumn">' + item[x].workcover + '</td>' +
                        // item[x].deletedata +
                        '</tr>');

                }
                $('.dataTables_info').html('Showing 1 to ' + data.tdeduction.length + ' of ' + data.tdeduction.length + ' entries');

            }

        } else {
            LoadingOverlay.hide();

            swal({
                title: 'Question',
                text: "Holiday does not exist, would you like to create it?",
                type: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    FlowRouter.go('/payrollrules');
                } else if (result.dismiss === 'cancel') {
                    //$('#productListModal').modal('toggle');
                }
            });
             }
            }).catch(function (err) {
                LoadingOverlay.hide();
            });
        } else {

            LoadingOverlay.hide();

            swal({
                title: 'Alert',
                text: "Please write something to search",
                type: 'error',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {

                } else if (result.dismiss === 'cancel') {

                }
            });
        }

    },
    'keyup #tblEarnings_filter input': function (event) {
        if($(event.target).val() != ''){
                  $(".refresh-tblEarnings").addClass('btnSearchAlert');
        }else{
                  $(".refresh-tblEarnings").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
         $(".refresh-tblEarnings").trigger("click");
        }
    },
    'click .refresh-tblEarnings':function(event){
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let tableProductList;
        const dataTableList = [];
        var splashArrayInvoiceList = new Array();
        const lineExtaSellItems = [];
        // $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('#tblEarnings_filter input').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getEarningByName(dataSearchName).then(function (data) {
                $(".refresh-tblEarnings").removeClass('btnSearchAlert');
                let lineItems = [];
                let lineItemObj = {};
                if (data.btnRefreshEarnings.length > 0) {
                    for (let i = 0; i < data.tordinarytimeearnings.length; i++) {

                        var dataTableList = {
                            id:data.tordinarytimeearnings[i].fields.ID || '',
                            name:data.tordinarytimeearnings[i].fields.OrdinaryTimeEarningsName || '',
                            type:'Ordinary Time Earning',
                            displayName:data.tordinarytimeearnings[i].fields.OrdinaryTimeEarningsDisplayName || '',
                            ratetype:data.tordinarytimeearnings[i].fields.OrdinaryTimeEarningsRateType||'',
                            amount: '$100',
                            expamount:data.tordinarytimeearnings[i].fields.OrdinaryTimeEarningsExpenseAccount || '',
                            holdingamount:data.tordinarytimeearnings[i].fields.OrdinaryTimeEarningsExemptPaygWithholding || '',
                            expenseAccount:data.tordinarytimeearnings[i].fields.OrdinaryTimeEarningsExpenseAccount || '',
                            connt:data.tordinarytimeearnings[i].fields.OrdinaryTimeEarningsExemptSuperannuationGuaranteeCont || '',
                            acvitiy: data.tordinarytimeearnings[i].fields.OrdinaryTimeEarningsReportableW1onActivityStatement || '',
                            deletedata:''
                        };

                        splashArrayInvoiceList.push(dataTableList);
                    }
                    templateObject.datatablerecords.set(splashArrayInvoiceList);

                    let item = templateObject.datatablerecords.get();
                    LoadingOverlay.hide();
                    if (splashArrayInvoiceList) {
                        // var datatable = $('#tblEarnings').DataTable();
                        // $("#tblEarnings > tbody").empty();
                        // for (let x = 0; x < item.length; x++) {
                        //     $("#tblEarnings > tbody").append(
                        //         '<tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
                        //         '<td contenteditable="false" class="colEarningsID hiddenColumn">' + item[x].id + '</td>' +
                        //         '<td contenteditable="false" class="colEarningsNames" ><span >' + item[x].name + '</span></td>' +
                        //         '<td contenteditable="false" class="colEarningsType">' + item[x].type + '</td>' +
                        //         '<td contenteditable="false" class="colEarningsDisplayName" >' + item[x].displayName + '</td>' +
                        //         '<td contenteditable="false" class="colEarningsratetype">' + item[x].ratetype + '</td>' +
                        //         '<td contenteditable="false" class="colEarningsAmount" ><span >' + item[x].amount + '</span></td>' +
                        //         '<td contenteditable="false" class="colEarningsAccounts">' + item[x].expamount + '</td>' +
                        //         '<td contenteditable="false" class="colEarningsAccountsID hiddenColumn" >' + item[x].holdingamount + '</td>' +
                        //         '<td contenteditable="false" class="colEarningsPAYG hiddenColumn">' + item[x].expenseAccount + '</td>' +
                        //         '<td contenteditable="false" class="colEarningsSuperannuation hiddenColumn" ><span >' + item[x].connt + '</span></td>' +
                        //         '<td contenteditable="false" class="colEarningsReportableasW1 hiddenColumn">' + item[x].acvitiy + '</td>' +
                        //         item[x].deletedata +
                        //         '</tr>');

                        // }
                        // $('.dataTables_info').html('Showing 1 to ' + data.tordinarytimeearnings.length + ' of ' + data.tordinarytimeearnings.length + ' entries');

                    }

                } else {
                    LoadingOverlay.hide();

                    swal({
                        title: 'Question',
                        text: "Earnings does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            FlowRouter.go('/payrollrules');
                        } else if (result.dismiss === 'cancel') {
                            //$('#productListModal').modal('toggle');
                        }
                    });
                }
            }).catch(function (err) {
                LoadingOverlay.hide();
            });
        } else {

            LoadingOverlay.hide();

            swal({
                title: 'Alert',
                text: "Please write something to search",
                type: 'error',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {

                } else if (result.dismiss === 'cancel') {

                }
            });
        }



     },
    'keyup #tblLeave_filter input': function (event) {
        if($(event.target).val() != ''){
        $(".btnRefreshPaidLeave").addClass('btnSearchAlert');
        }else{
         $(".btnRefreshPaidLeave").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
         $(".btnRefreshPaidLeave").trigger("click");
        }
    },
    'click .btnRefreshPaidLeave':function(event){
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let tableProductList;
        const dataTableList = [];
        var splashArrayInvoiceList = new Array();
        const lineExtaSellItems = [];
        // $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('#tblLeave_filter input').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
          sideBarService.getPaidLeaveByName(dataSearchName).then(function (data) {
          $(".btnRefreshPaidLeave").removeClass('btnSearchAlert');
          let lineItems = [];
          let lineItemObj = {};
          if (data.tpaidleave.length > 0) {
            for (let i = 0; i < data.tpaidleave.length; i++) {

                var dataTableList = {
                    id:data.tpaidleave[i].fields.ID || '',
                    name:data.tpaidleave[i].fields.LeavePaidName || '',
                    units:data.tpaidleave[i].fields.LeavePaidUnits || '',
                    edtNormalEntitlement:data.tpaidleave[i].fields.LeavePaidNormalEntitlement || '',
                    loadingrate:data.tpaidleave[i].fields.LeavePaidLeaveLoadingRate || '',
                    type:true,
                    payonslip:data.tpaidleave[i].fields.LeavePaidShowBalanceOnPayslip || false,
                    deletedata:''
                };

                splashArrayInvoiceList.push(dataTableList);
            }
            templateObject.datatablerecords.set(splashArrayInvoiceList);

            let item = templateObject.datatablerecords.get();
            LoadingOverlay.hide();
            if (splashArrayInvoiceList) {
                var datatable = $('#tblLeave').DataTable();
                $("#tblLeave > tbody").empty();
                for (let x = 0; x < item.length; x++) {
                    $("#tblLeave > tbody").append(
                        '<tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
                        '<td contenteditable="false" class="colLeaveID hiddenColumn">' + item[x].id + '</td>' +
                        '<td contenteditable="false" class="colLeaveName" ><span >' + item[x].name + '</span></td>' +
                        '<td contenteditable="false" class="colLeaveUnits">' + item[x].units + '</td>' +
                        '<td contenteditable="false" class="colLeaveNormalEntitlement" >' + item[x].edtNormalEntitlement + '</td>' +
                        '<td contenteditable="false" class="colLeaveLeaveLoadingRate" ><span >' + item[x].loadingrate + '</span></td>' +
                        '<td contenteditable="false" class="colLeavePaidLeave">' + item[x].type + '</td>' +
                        '<td contenteditable="false" class="colLeaveShownOnPayslip" >' + item[x].payonslip + '</td>' +
                        item[x].deletedata +
                        '</tr>');

                }
                $('.dataTables_info').html('Showing 1 to ' + data.tpaidleave.length + ' of ' + data.tpaidleave.length + ' entries');

            }

        } else {
            LoadingOverlay.hide();

            swal({
                title: 'Question',
                text: "Leave does not exist, would you like to create it?",
                type: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    FlowRouter.go('/payrollrules');
                } else if (result.dismiss === 'cancel') {
                    //$('#productListModal').modal('toggle');
                }
            });
        }
    }).catch(function (err) {
        LoadingOverlay.hide();
    });
} else {

    LoadingOverlay.hide();

    swal({
        title: 'Alert',
        text: "Please write something to search",
        type: 'error',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.value) {

        } else if (result.dismiss === 'cancel') {

        }
    });
}

    },
    'keyup #tblReimbursements_filter input': function (event) {
                        if($(event.target).val() != ''){
                          $(".btnRefreshReimbursements").addClass('btnSearchAlert');
                        }else{
                          $(".btnRefreshReimbursements").removeClass('btnSearchAlert');
                        }
                        if (event.keyCode == 13) {
                           $(".btnRefreshReimbursements").trigger("click");
                            }
    },
    'click .btnRefreshReimbursements':function(event){
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let tableProductList;
        const dataTableList = [];
        var splashArrayInvoiceList = new Array();
        const lineExtaSellItems = [];
        // $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('#tblReimbursements_filter input').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getReimbursementByName(dataSearchName).then(function (data) {
                $(".btnRefreshReimbursements").removeClass('btnSearchAlert');
                let lineItems = [];
                let lineItemObj = {};
                if (data.treimbursement.length > 0) {
                    for (let i = 0; i < data.treimbursement.length; i++) {

                        var dataTableList = {
                            id: data.treimbursement[i].fields.ID || '',
                            name:data.treimbursement[i].fields.ReimbursementName || '',
                            account:data.treimbursement[i].fields.ReimbursementAccount || 0,
                            deletedata:''
                        };

                        splashArrayInvoiceList.push(dataTableList);
                    }
                    templateObject.datatablerecords.set(splashArrayInvoiceList);

                    let item = templateObject.datatablerecords.get();
                    LoadingOverlay.hide();
                    if (splashArrayInvoiceList) {
                        var datatable = $('#tblReimbursements').DataTable();
                        $("#tblReimbursements > tbody").empty();
                        for (let x = 0; x < item.length; x++) {
                            $("#tblReimbursements > tbody").append(
                                '<tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
                                '<td contenteditable="false" class="colReimbursementID hiddenColumn">' + item[x].id + '</td>' +
                                '<td contenteditable="false" class="colReimbursementName" ><span >' + item[x].name + '</span></td>' +
                                '<td contenteditable="false" class="colReimbursementAccount">' + item[x].account + '</td>' +
                                item[x].deletedata +
                                '</tr>');

                        }
                        $('.dataTables_info').html('Showing 1 to ' + data.treimbursement.length + ' of ' + data.treimbursement.length + ' entries');

                    }

                } else {
                    LoadingOverlay.hide();

                    swal({
                        title: 'Question',
                        text: "Reimbursement does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            FlowRouter.go('/payrollrules');
                        } else if (result.dismiss === 'cancel') {
                            //$('#productListModal').modal('toggle');
                        }
                    });
                }
            }).catch(function (err) {
                LoadingOverlay.hide();
            });
        } else {

            LoadingOverlay.hide();

            swal({
                title: 'Alert',
                text: "Please write something to search",
                type: 'error',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {

                } else if (result.dismiss === 'cancel') {

                }
            });
        }


    },
    'click .btnUploadFile':function(event){
        // $('#attachment-upload').val('');
        // $('.file-name').text('');
        //$(".btnImport").removeAttr("disabled");
        $('#fileInput').trigger('click');

     },

     "click .saveAddNewOvertime": (e, ui) => {
        ui.addOverTime();
     },
     "click .delete-overtime": (e, ui) => {
        const id = $(e.currentTarget).attr('overtime-id');
        ui.deleteOvertime(id);
     },
    //  "click .edit-overtime": (e, ui) => {
    //     const id = $(e.currentTarget).attr('overtime-id');
    //     ui.openOvertimeEditor(id);
    //  },
     "click .btnAddNewOvertime": (e, ui) => {
        const id = $(e.currentTarget).attr('overtime-id');
        ui.openAddOvertimeEditor(id);
     },

     "click #edtRateType": (e, ui) => {
        $('#selectLineID').val('edtRateType');
        $('#select-rate-type-modal').modal('toggle');
        setTimeout(function () {
            var datatable = $('#tblRateTypeList').DataTable();
            datatable.draw();
        }, 500);
     },

     "click #tblratetypes tbody > tr, click  #tblRateTypeList tbody > tr": (e, ui) => {
        const tr = $(e.currentTarget);
        const rateName = $(tr).find('td:first').text();

        $('.paste-rate').val(rateName);
        $('.paste-rate').attr('rate-type-id', $(tr).attr('rate-type-id'));
        $('.paste-rate').trigger('change');

        $('#select-rate-type-modal').modal('hide');
        $(".paste-rate").removeClass('paste-rate');

     },
    //  "click #edtRateType": (e, ui) => {
    //     $(e.currentTarget).addClass('paste-rate-type');
    //     $('#rateTypeListModel').modal("show");
    //  }
    //  "show.bs.modal #select-ratetype-modal": (e, ui) => {
    // },
    // 'change #rateList': (e, ui) => {
    //     let evalue = $(e.currentTarget).val();
    //     switch(evalue) {
    //         case 'Normal':
    //             $('.greaterThanDiv').css('display', 'block');
    //             $('.weekendDiv').css('display', 'none');
    //         break;
    //         case 'Time & Half':
    //             $('.greaterThanDiv').css('display', 'block');
    //             $('.weekendDiv').css('display', 'none');
    //         break;
    //         case 'Double Time':
    //             $('.greaterThanDiv').css('display', 'block');
    //             $('.weekendDiv').css('display', 'none');
    //         break;
    //         case 'Weekend':
    //             $('.weekendDiv').css('display', 'block');
    //             $('.greaterThanDiv').css('display', 'none');
    //         break;
    //         default:
    //             $('.greaterThanDiv').css('display', 'block');
    //             $('.weekendDiv').css('display', 'none');
    //     }
    // },
    // 'click #rateList': function(event) {
    //     $('#rateList').select();
    //     $('#rateList').editableSelect();
    // },
    // 'click #overtimeRateType': function(event) {
    //     $('#overtimeRateType').select();
    //     $('#overtimeRateType').editableSelect();
    // },
});

Template.payrollrules.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function(a, b) {
            if (a.code == 'NA') {
                return 1;
            } else if (b.code == 'NA') {
                return -1;
            }
            return (a.code.toUpperCase() > b.code.toUpperCase()) ? 1 : -1;
            // return (a.saledate.toUpperCase() < b.saledate.toUpperCase()) ? 1 : -1;
        });
    },

    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    apiFunction:function() {
        return sideBarService.getCalender;
    },
    searchAPI: function() {
        return sideBarService.getNewCalenderByNameOrPayPeriod;
    },
    service: ()=>{
        return sideBarService;
    },
    datahandler: function () {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList(data);
            return dataReturn;
        }
    },
    exDataHandler: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList(data);
            return dataReturn;
        }
    },
    apiParams: ()=>{
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },

    tableGrouplistheaderrecord: () => {
        return Template.instance().tableGrouplistheaderrecord.get();
    },
    apiFunction1:function() {
        return ratetypeService.getOneGroupTypeByName;
    },
    searchAPI1: function() {
        // return sideBarService.getNewCalenderByNameOrPayPeriod;
    },
    service1: ()=>{
        return ratetypeService;
    },
    datahandler1: function () {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList1(data);
            return dataReturn;
        }
    },
    exDataHandler1: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList1(data);
            return dataReturn;
        }
    },
    apiParams1: ()=>{
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },

    tableheaderrecords2: () => {
        return Template.instance().tableheaderrecords2.get();
    },
    apiFunction2:function() {
        return sideBarService.getHolidayData;
    },
    searchAPI2: function() {
        return sideBarService.getNewHolidayByName;
    },
    service2: ()=>{
        return sideBarService;
    },
    datahandler2: function () {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList2(data);
            return dataReturn;
        }
    },
    exDataHandler2: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList2(data);
            return dataReturn;
        }
    },
    apiParams2: ()=>{
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },

    tableheaderrecords3: () => {
        return Template.instance().tableheaderrecords3.get();
    },
    apiFunction3:function() {
        return sideBarService.getAllowance;
    },
    searchAPI3: function() {
        return sideBarService.getAllowanceByName;
    },
    service3: ()=>{
        return sideBarService;
    },
    datahandler3: function () {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList3(data);
            return dataReturn;
        }
    },
    exDataHandler3: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList3(data);
            return dataReturn;
        }
    },
    apiParams3: ()=>{
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },

    tableheaderrecords4: () => {
        return Template.instance().tableheaderrecords4.get();
    },
    apiFunction4:function() {
        return sideBarService.getEarnings;
    },
    searchAPI4: function() {
        return sideBarService.getEarningByName;
    },
    service4: ()=>{
        return sideBarService;
    },
    datahandler4: function () {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList4(data);
            return dataReturn;
        }
    },
    exDataHandler4: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList4(data);
            return dataReturn;
        }
    },
    apiParams4: ()=>{
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },

    tableheaderrecords5: () => {
        return Template.instance().tableheaderrecords5.get();
    },
    apiFunction5:function() {
        return sideBarService.getDeduction;
    },
    searchAPI5: function() {
        return sideBarService.getDeductionByName;
    },
    service5: ()=>{
        return sideBarService;
    },
    datahandler5: function () {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList5(data);
            return dataReturn;
        }
    },
    exDataHandler5: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList5(data);
            return dataReturn;
        }
    },
    apiParams5: ()=>{
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },

    tableheaderrecords6: () => {
        return Template.instance().tableheaderrecords6.get();
    },
    apiFunction6:function() {
        return sideBarService.getReimbursement;
    },
    searchAPI6: function() {
        return sideBarService.getReimbursementByName;
    },
    service6: ()=>{
        return sideBarService;
    },
    datahandler6: function () {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList6(data);
            return dataReturn;
        }
    },
    exDataHandler6: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList6(data);
            return dataReturn;
        }
    },
    apiParams6: ()=>{
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },

    tableheaderrecords7: () => {
        return Template.instance().tableheaderrecords7.get();
    },
    apiFunction7:function() {
        return sideBarService.getPaidLeave;
    },
    searchAPI7: function() {
        return sideBarService.getPaidLeaveByName;
    },
    service7: ()=>{
        return sideBarService;
    },
    datahandler7: function () {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList7(data);
            return dataReturn;
        }
    },
    exDataHandler7: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList7(data);
            return dataReturn;
        }
    },
    apiParams7: ()=>{
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },

    tableheaderrecords8: () => {
        return Template.instance().tableheaderrecords8.get();
    },
    apiFunction8:function() {
        return sideBarService.getSuperannuation;
    },
    searchAPI8: function() {
        return sideBarService.getSuperannuationByName;
    },
    service8: ()=>{
        return sideBarService;
    },
    datahandler8: function () {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList8(data);
            return dataReturn;
        }
    },
    exDataHandler8: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList8(data);
            return dataReturn;
        }
    },
    apiParams8: ()=>{
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },

    tableheaderrecords9: () => {
        return Template.instance().tableheaderrecords9.get();
    },
    apiFunction9:function() {
        return sideBarService.getOvertimes;
    },
    searchAPI9: function() {
        return sideBarService.getOvertimes;
    },
    service9: ()=>{
        return sideBarService;
    },
    datahandler9: function () {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList9(data);
            return dataReturn;
        }
    },
    exDataHandler9: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList9(data);
            return dataReturn;
        }
    },
    apiParams9: ()=>{
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },

    overtimes: () => {
        return Template.instance().overtimes.get();
    },
    rateTypes: () => {
        return Template.instance().rateTypes.get();
    },
    earnings: () => {
        return Template.instance().earnings.get();
    }
});


const addDefaultOvertimes = async () => {
    let overtimes = await getOvertimes();

    // This part is handling the auto add of default values in the list
    let defaultOvertimes = PayrollSettingsOvertimes.getDefaults();
    defaultOvertimes.forEach((defaultOvertime) => {
        // if doesnt exist, just add it
        if(!overtimes.some(overtime => overtime.rule == defaultOvertime.rule)) {
            overtimes.push(defaultOvertime);
        };
    })

}

/**
 * This will get the overtimes
 * @returns {Promise<PayrollSettingsOvertimes[]>}
 */
export const getOvertimes = async () => {
    let overtimesData = await getVS1Data(erpObject.TPayrollSettingOvertimes);
    let overtimes = overtimesData.length > 0 ? JSON.parse(overtimesData[0].data) : [];
    const rateTypes = await getRateTypes();
    // This part is handling the auto add of default values in the list
    let defaultOvertimes = PayrollSettingsOvertimes.getDefaults();
    defaultOvertimes.forEach((defaultOvertime) => {
        // if doesnt exist, just add it
        if(!overtimes.some(overtime => overtime.rule == defaultOvertime.rule)) {
            if(defaultOvertime.searchByRuleName == true) {
                // defaultOvertime.setRateTypeByRuleName(rateTypes, "Weekend");
            }
            overtimes.push(defaultOvertime);
        };
    })

    return overtimes;

    // if(localStorage.getItem(erpObject.TPayrollSettingOvertimes)) {
    //     return JSON.parse(localStorage.getItem(erpObject.TPayrollSettingOvertimes));
    // }
    // return null;
}

export const saveOvertimes = async (overtimes = []) => {
    return await addVS1Data(erpObject.TPayrollSettingOvertimes, JSON.stringify(overtimes));
    // return localStorage.setItem(erpObject.TPayrollSettingOvertimes, JSON.stringify(overtimes));
}

export const getRateTypes = async (refresh = false) => {
    // sideBarService.getRateTypes(initialBaseDataLoad, 0)
   // let data = await getVS1Data(erpObject.TPayRateType);

   // let rateTypes = data.length > 0 ? JSON.parse(data[0].data) : [];

    let data = await CachedHttp.get(erpObject.TPayRateType, async () => {
        return await sideBarService.getRateTypes(initialBaseDataLoad, 0);
    }, {
        forceOverride: refresh,
        fallBackToLocal: true,
    });
    const response = data.response;

    return response.tpayratetype ? response.tpayratetype.map(e => e.fields) : null;

}

export const getEarnings = async (refresh = false) => {
    let data = await getVS1Data(erpObject.TEarnings);
    let earnings =  data.length > 0 ? JSON.parse(data[0].data) : [];
    return earnings;
}
