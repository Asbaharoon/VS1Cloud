import { ContactService } from "./contact-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { UtilityService } from "../utility-service";
import { CountryService } from '../js/country-service';
import { PaymentsService } from '../payments/payments-service';
import { CRMService } from '../crm/crm-service';
import '../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jQuery.print/jQuery.print.js';
import 'jquery-editable-select';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';

import {Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import './addLead.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let crmService = new CRMService();

Template.leadscard.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar();
    templateObject.countryData = new ReactiveVar();
    templateObject.leadrecords = new ReactiveVar([]);
    templateObject.crmRecords = new ReactiveVar([]);
    templateObject.crmTableheaderRecords = new ReactiveVar([]);
    templateObject.isSameAddress = new ReactiveVar();
    templateObject.isSameAddress.set(false);
    /* Attachments */
    templateObject.uploadedFile = new ReactiveVar();
    templateObject.uploadedFiles = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar();
    templateObject.currentAttachLineID = new ReactiveVar();
    templateObject.correspondences = new ReactiveVar([]);

    templateObject.active_projects = new ReactiveVar([]);
    templateObject.deleted_projects = new ReactiveVar([]);
    templateObject.favorite_projects = new ReactiveVar([]);
    templateObject.tprojectlist = new ReactiveVar([]);
    templateObject.all_projects = new ReactiveVar([]);
    templateObject.subTasks = new ReactiveVar([]);
    templateObject.taskrecords = new ReactiveVar([]);

    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.getDataTableList = function(data) {

        let sort_date = data.mstimeStamp == "" ? "1770-01-01" : data.mstimeStamp;
        sort_date = new Date(sort_date);

        // let taskLabel = data.TaskLabel;
        let taskLabelArray = [];
        // if (taskLabel !== null) {
        //     if (taskLabel.length === undefined || taskLabel.length === 0) {
        //         taskLabelArray.push(taskLabel.fields);
        //     } else {
        //         for (let j = 0; j < taskLabel.length; j++) {
        //             taskLabelArray.push(taskLabel[j].fields);
        //         }
        //     }
        // }
        let taskDescription = data.TaskDescription || '';
        taskDescription = taskDescription.length < 50 ? taskDescription : taskDescription.substring(0, 49) + "...";

        const dataList = [
            data.ID || 0,
            data.mstimeStamp !== '' ? moment(data.mstimeStamp).format("YYYY/MM/DD") : '',
            'Task',
            data.TaskName || '',
            taskDescription,
            data.due_date ? moment(data.due_date).format("YYYY/MM/DD") : "",
            data.Completed ? "Completed" : "",
            data.Active ? "" : "In-Active",
            // priority: data.priority || 0,
            // projectID: data.ProjectID || '',
            // projectName: data.ProjectName || '',
            // labels: taskLabelArray,
            // category: 'Task',

        ];

        return dataList;
    }
    let headerStructure = [
        { index: 0, label: 'ID', class: 'colTaskId', active: false, display: true, width: "10" },
        { index: 1, label: 'Date', class: 'colDate', active: true, display: true, width: "80" },
        { index: 2, label: 'Action', class: 'colType', active: true, display: true, width: "110" },
        { index: 3, label: 'Name', class: 'colTaskName', active: true, display: true, width: "110" },
        { index: 4, label: 'Description', class: 'colTaskDesc', active: true, display: true, width: "300" },
        { index: 5, label: 'Completed By', class: 'colTaskLabels', active: true, display: true, width: "110" },
        { index: 6, label: 'Completed', class: 'colCompleted', active: true, display: true, width: "120" },
        { index: 7, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
    ];
    templateObject.tableheaderrecords.set(headerStructure);
});

Template.leadscard.onRendered(function() {

    $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();
    const contactService = new ContactService();
    const countryService = new CountryService();
    const paymentService = new PaymentsService();
    const crmService = new CRMService();
    let countries = [];
    let currentId = FlowRouter.current().queryParams;
    let leadID = '';
    let totAmount = 0;
    let totAmountOverDue = 0;
    let salestaxcode = '';

    setTimeout(function() {
        Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'defaulttax', function(error, result) {
            if (error) {
                salestaxcode = loggedTaxCodeSalesInc;
                templateObject.defaultsaletaxcode.set(salestaxcode);
            } else {
                if (result) {
                    salestaxcode = result.customFields[1].taxvalue || loggedTaxCodeSalesInc;
                    templateObject.defaultsaletaxcode.set(salestaxcode);
                }

            }
        });
    }, 500);

    templateObject.updateTaskSchedule = function(id, date) {
        let due_date = "";
        let due_date_display = "No Date";
        if (date) {
            due_date = moment(date).format("YYYY-MM-DD hh:mm:ss");
            due_date_display = moment(due_date).format("dddd, Do MMMM");
        }
        $('#edit_task_modal_due_date').html(due_date_display)

        var objDetails = {
            type: "Tprojecttasks",
            fields: {
                ID: id,
                due_date: due_date,
            },
        };

        if (id) {
            $(".fullScreenSpin").css("display", "inline-block");
            crmService.saveNewTask(objDetails).then(function(data) {
                templateObject.getAllTaskList();
                $(".fullScreenSpin").css("display", "none");
                $(".btnRefresh").addClass('btnSearchAlert');
            });
        }
    };

    templateObject.getOverviewARData = function(CustomerName) {
        getVS1Data('TARReport').then(function(dataObject) {
            if (dataObject.length === 0) {
                paymentService.getOverviewARDetails().then(function(data) {
                    setOverviewARDetails(data, CustomerName);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setOverviewARDetails(data, CustomerName);
            }
        }).catch(function(err) {
            paymentService.getOverviewARDetails().then(function(data) {
                setOverviewARDetails(data, CustomerName);
            });
        });
    };

    function setOverviewARDetails(data, CustomerName) {
        let itemsAwaitingPaymentcount = [];
        let itemsOverduePaymentcount = [];
        let dataListAwaitingCust = {};

        let customerawaitingpaymentCount = '';
        for (let i = 0; i < data.tarreport.length; i++) {
            // dataListAwaitingCust = {
            // id: data.tinvoice[i].Id || '',
            // };
            if ((data.tarreport[i].AmountDue !== 0) && (CustomerName.replace(/\s/g, '') === data.tarreport[i].Printname.replace(/\s/g, ''))) {
                // itemsAwaitingPaymentcount.push(dataListAwaitingCust);
                totAmount += Number(data.tarreport[i].AmountDue);
                let date = new Date(data.tarreport[i].DueDate);
                let totOverdueLine = Number(data.tarreport[i].AmountDue) - Number(data.tarreport[i].Current) || 0;
                //if (date < new Date()) {
                // itemsOverduePaymentcount.push(dataListAwaitingCust);
                totAmountOverDue += totOverdueLine;
                //}
            }
        }
        $('.custAwaitingAmt').text(utilityService.modifynegativeCurrencyFormat(totAmount));
        $('.custOverdueAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountOverDue));
    }

    setTimeout(function() {
        $("#dtAsOf").datepicker({
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
    }, 100);

    templateObject.getCountryData = function() {
        getVS1Data('TCountries').then(function(dataObject) {
            if (dataObject.length === 0) {
                countryService.getCountry().then((data) => {
                    setCountry(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setCountry(data);
            }
        }).catch(function(err) {
            countryService.getCountry().then((data) => {
                setCountry(data);
            });
        });
    };
    templateObject.initSubtaskDatatable = function() {

        let splashArrayTaskList = templateObject.makeTaskTableRows(templateObject.subTasks.get());

        try {
            $("#tblSubtaskDatatable").DataTable({
                data: splashArrayTaskList,
                columnDefs: [
                    // {
                    //   orderable: false,
                    //   targets: 0,
                    //   className: "colCompleteTask colSubComplete",
                    //   createdCell: function (td, cellData, rowData, row, col) {
                    //     $(td).closest("tr").attr("data-id", rowData[8]);
                    //     $(td).attr("data-id", rowData[8]);
                    //     $(td).addClass("task_priority_" + rowData[10]);
                    //     if (rowData[12]) {
                    //       $(td).addClass("taskCompleted");
                    //     }
                    //   },
                    //   width: "18px",
                    // },
                    {
                        orderable: false,
                        targets: 0,
                        className: "colPriority openEditSubTaskModal hiddenColumn",
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).closest("tr").attr("data-id", rowData[8]);
                            $(td).attr("data-id", rowData[8]);
                        },
                        width: "100px",
                    },
                    {
                        orderable: false,
                        targets: 1,
                        className: "colContact openEditSubTaskModal hiddenColumn",
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).attr("data-id", rowData[8]);
                        },
                        width: "100px",
                    },
                    {
                        targets: 2,
                        className: "colSubDate openEditSubTaskModal",
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).attr("data-id", rowData[8]);
                        },
                        width: "120px",
                    },
                    {
                        targets: 3,
                        className: "colSubTaskName openEditSubTaskModal",
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).attr("data-id", rowData[9]);
                        },
                    },
                    {
                        targets: 4,
                        className: "colTaskDesc openEditSubTaskModal hiddenColumn",
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).attr("data-id", rowData[8]);
                        },
                    },
                    {
                        targets: 5,
                        className: "colTaskLabels openEditSubTaskModal hiddenColumn",
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).attr("data-id", rowData[8]);
                        },
                    },
                    {
                        targets: 6,
                        className: "colTaskProjects openEditSubTaskModal hiddenColumn",
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).attr("data-id", rowData[8]);
                        },
                    },
                    {
                        orderable: false,
                        targets: 7,
                        className: "colStatus openEditSubTaskModal",
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).attr("data-id", rowData[8]);
                        },
                    },
                    // {
                    //   orderable: false,
                    //   targets: 8,
                    //   className: "colTaskActions",
                    //   createdCell: function (td, cellData, rowData, row, col) {
                    //     $(td).attr("data-id", rowData[8]);
                    //   },
                    //   width: "150px",
                    // },
                ],
                colReorder: {
                    fixedColumnsLeft: 0,
                },
                sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                select: true,
                destroy: true,
                // colReorder: true,
                pageLength: initialDatatableLoad,
                lengthMenu: [
                    [initialDatatableLoad, -1],
                    [initialDatatableLoad, "All"],
                ],
                info: true,
                responsive: true,
                order: [
                    [1, "desc"],
                ],
                action: function() {
                    $("#tblSubtaskDatatable").DataTable().ajax.reload();
                },
            });

        } catch (error) {}
    }

    function setCountry(data) {
        for (let i = 0; i < data.tcountries.length; i++) {
            countries.push(data.tcountries[i].Country)
        }
        countries.sort((a, b) => a.localeCompare(b));
        templateObject.countryData.set(countries);
    }
    templateObject.getCountryData();

    templateObject.getLeadData = function() {
        getVS1Data('TProspectEx').then(function(dataObject) {
            if (dataObject.length === 0) {
                contactService.getOneLeadDataEx(leadID).then(function(data) {
                    setOneLeadDataEx(data);

                    // add to custom field
                    // tempcode
                    // setTimeout(function () {
                    //   $('#edtSaleCustField1').val(data.fields.CUSTFLD1);
                    //   $('#edtSaleCustField2').val(data.fields.CUSTFLD2);
                    //   $('#edtSaleCustField3').val(data.fields.CUSTFLD3);
                    // }, 5500);
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tprospect;
                let added = false;
                for (let i = 0; i < useData.length; i++) {
                    if (parseInt(useData[i].fields.ID) === parseInt(leadID)) {
                        // add to custom field
                        // tempcode
                        // setTimeout(function () {
                        //   $('#edtSaleCustField1').val(useData[i].fields.CUSTFLD1);
                        //   $('#edtSaleCustField2').val(useData[i].fields.CUSTFLD2);
                        //   $('#edtSaleCustField3').val(useData[i].fields.CUSTFLD3);
                        // }, 5500);

                        added = true;
                        setOneLeadDataEx(useData[i]);
                        $('.fullScreenSpin').css('display', 'none');
                        setTimeout(function() {
                            const rowCount = $('.results tbody tr').length;
                            $('.counter').text(rowCount + ' items');
                        }, 500);
                    }
                }
                if (!added) {
                    contactService.getOneLeadDataEx(leadID).then(function(data) {
                        setOneLeadDataEx(data);
                        $('.fullScreenSpin').css('display', 'none');
                    });
                }
            }
        }).catch(function(err) {
            contactService.getOneLeadDataEx(leadID).then(function(data) {
                $('.fullScreenSpin').css('display', 'none');
                setOneLeadDataEx(data);
            });
        });
    };
    templateObject.getLeadDataByName = function() {
        getVS1Data('TProspectEx').then(function(dataObject) {
            if (dataObject.length === 0) {
                contactService.getOneLeadDataExByName(leadID).then(function(data) {
                    setOneLeadDataEx(data.tprospect[0]);
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tprospect;
                let added = false;
                for (let i = 0; i < useData.length; i++) {
                    if (parseInt(useData[i].fields.ClientName) === parseInt(leadID)) {
                        added = true;
                        setOneLeadDataEx(useData[i]);
                        $('.fullScreenSpin').css('display', 'none');
                        setTimeout(function() {
                            const rowCount = $('.results tbody tr').length;
                            $('.counter').text(rowCount + ' items');
                        }, 500);
                    }
                }
                if (!added) {
                    contactService.getOneLeadDataExByName(leadID).then(function(data) {
                        setOneLeadDataEx(data.tprospect[0]);
                        $('.fullScreenSpin').css('display', 'none');
                    });
                }
            }
        }).catch(function(err) {
            contactService.getOneLeadDataExByName(leadID).then(function(data) {
                $('.fullScreenSpin').css('display', 'none');
                setOneLeadDataEx(data.tprospect[0]);
            });
        });
    };

    function setOneLeadDataEx(data) {
        let lineItemObj = {
            id: data.fields.ID || '',
            lid: 'Edit Lead',
            isjob: data.fields.IsJob || '',
            issupplier: data.fields.IsSupplier || false,
            iscustomer: data.fields.IsCustomer || false,
            employeeName: data.fields.ClientName || '',
            email: data.fields.Email || '',
            title: data.fields.Title || '',
            firstname: data.fields.FirstName || '',
            middlename: data.fields.CUSTFLD10 || '',
            lastname: data.fields.LastName || '',
            tfn: '' || '',
            phone: data.fields.Phone || '',
            mobile: data.fields.Mobile || '',
            fax: data.fields.Faxnumber || '',
            skype: data.fields.SkypeName || '',
            website: data.fields.URL || '',
            shippingaddress: data.fields.Street || '',
            scity: data.fields.Street2 || '',
            sstate: data.fields.State || '',
            spostalcode: data.fields.Postcode || '',
            scountry: data.fields.Country || LoggedCountry,
            ssuburb: data.fields.Suburb || '',
            billingaddress: data.fields.BillStreet || '',
            bcity: data.fields.BillStreet2 || '',
            bstate: data.fields.BillState || '',
            bpostalcode: data.fields.BillPostcode || '',
            bcountry: data.fields.Billcountry || '',
            bsuburb: data.fields.Billsuburb || '',
            notes: data.fields.Notes || '',
            openingbalance: data.fields.RewardPointsOpeningBalance || 0.00,
            openingbalancedate: data.fields.RewardPointsOpeningDate ? moment(data.fields.RewardPointsOpeningDate).format('DD/MM/YYYY') : "",
            custfield1: data.fields.CUSTFLD1 || '',
            custfield2: data.fields.CUSTFLD2 || '',
            custfield3: data.fields.CUSTFLD3 || '',
            custfield4: data.fields.CUSTFLD4 || '',
            status: data.fields.Status || '',
            rep: data.fields.RepName || '',
            source: data.fields.SourceName || '',
            isLead:true,
        };

        if ((data.fields.Street === data.fields.BillStreet) && (data.fields.Street2 === data.fields.BillStreet2) &&
            (data.fields.State === data.fields.BillState) && (data.fields.Postcode === data.fields.Postcode) &&
            (data.fields.Country === data.fields.Billcountry) && (data.fields.Suburb === data.fields.Billsuburb)) {
            templateObject.isSameAddress.set(true);
        }
        //let attachmentData =  contactService.getCustomerAttachmentList(data.fields.ID);
        templateObject.getOverviewARData(data.fields.ClientName);
        templateObject.records.set(lineItemObj);
        templateObject.getAllTask(data.fields.ClientName);
        /* START attachment */
        templateObject.attachmentCount.set(0);
        if (data.fields.Attachments) {
            if (data.fields.Attachments.length) {
                templateObject.attachmentCount.set(data.fields.Attachments.length);
                templateObject.uploadedFiles.set(data.fields.Attachments);
            }
        }
        /* END  attachment */

        //templateObject.uploadedFiles.set(attachmentData);
        // $('.fullScreenSpin').css('display','none');
        setTimeout(function() {
            const rowCount = $('.results tbody tr').length;
            $('.counter').text(rowCount + ' items');
            setTab();
        }, 1000);
    }

    function setInitialForEmptyCurrentID() {
        let lineItemObj = {
            id: '',
            lid: 'Add Lead',
            company: '',
            email: '',
            title: '',
            firstname: '',
            middlename: '',
            lastname: '',
            tfn: '',
            phone: '',
            mobile: '',
            fax: '',
            skype: '',
            website: '',
            shippingaddress: '',
            scity: '',
            sstate: '',
            spostalcode: '',
            scountry: LoggedCountry || '',
            ssuburb: '',
            billingaddress: '',
            bcity: '',
            bstate: '',
            bpostalcode: '',
            bcountry: LoggedCountry || '',
            bsuburb: '',
            custfield1: '',
            custfield2: '',
            custfield3: '',
            custfield4: '',
            status: '',
            rep: '',
            source: '',
            isLead:true
        };
        templateObject.isSameAddress.set(true);
        templateObject.records.set(lineItemObj);
        setTimeout(function() {
            $('#tblCrmlist').DataTable();
            setTab();
            $('.fullScreenSpin').css('display', 'none');
        }, 500);
        // setTimeout(function () {
        //     $('.termsSelect').val(templateObject.defaultsaleterm.get()||'');
        // }, 2000);
        $('.fullScreenSpin').css('display', 'none');
        // setTimeout(function () {
        //   var rowCount = $('.results tbody tr').length;
        //     $('.counter').text(rowCount + ' items');
        // }, 500);
    }

    function setTab() {
        if (currentId.crmTab === 'active') {
            $('.leadTab').removeClass('active');
            $('.crmTab').trigger('click');
        } else {
            $('.leadTab').addClass('active');
            $('.leadTab').trigger('click');
        }
    }

    function MakeNegative() {
        $('td').each(function() {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
    }

    templateObject.makeTaskTableRows = function(task_array) {
        let taskRows = new Array();
        let td0, td1, tflag, td11, td2, td3, td4, td5, td6 = "",
            tcontact = "";
        let projectName = "";
        let labelsForExcel = "";
        let color_num = '100';

        let todayDate = moment().format("ddd");
        let tomorrowDay = moment().add(1, "day").format("ddd");
        let nextMonday = moment(moment()).day(1 + 7).format("ddd MMM D");

        let chk_complete, completed = "";
        let completed_style = "";
        task_array.forEach((item) => {
            if (item.fields.Completed) {
                completed = "checked";
                chk_complete = "chk_uncomplete";
                // completed_style = "display:none;"
            } else {
                completed = "";
                chk_complete = "chk_complete";
            }
            td0 = `
        <div class="custom-control custom-checkbox chkBox pointer no-modal "
          style="width:15px;margin-right: -6px;">
          <input class="custom-control-input chkBox chkComplete pointer ${chk_complete}" type="checkbox"
            id="formCheck-${item.fields.ID}" ${completed}>
          <label class="custom-control-label chkBox pointer ${chk_complete}" data-id="${item.fields.ID}"
            for="formCheck-${item.fields.ID}"></label>
        </div>`;

            tflag = `<i class="fas fa-flag task_modal_priority_${item.fields.priority}" data-id="${item.fields.ID}" aria-haspopup="true" aria-expanded="false"></i>`;

            // tempcode  need to add ContactName, AssignName fields to Tprojecttasks
            tcontact = item.fields.ContactName;
            // if (item.fields.LeadID) {
            //   let cData = getContactDetailById(item.fields.LeadID, 'Lead');
            //   tcontact = cData ? cData.fields.ClientName : "";
            // } else if (item.fields.SupplierID) {
            //   let cData = getContactDetailById(item.fields.SupplierID, 'Supplier');
            //   tcontact = cData ? cData.fields.ClientName : "";
            // } else if (item.fields.JobID) {
            //   let cData = getContactDetailById(item.fields.LeadID, 'Job');
            //   tcontact = cData ? cData.fields.ClientName : "";
            // } else {

            // }

            if (item.fields.due_date == "" || item.fields.due_date == null) {
                td1 = "";
                td11 = "";
            } else {
                td11 = moment(item.fields.due_date).format("DD/MM/YYYY");
                td1 = `<label style="display:none;">${item.fields.due_date}</label>` + td11;

                let tdue_date = moment(item.fields.due_date).format("YYYY-MM-DD");
                if (tdue_date <= moment().format("YYYY-MM-DD")) {
                    color_num = 3; // Red
                } else if (tdue_date > moment().format("YYYY-MM-DD") && tdue_date <= moment().add(2, "day").format("YYYY-MM-DD")) {
                    color_num = 2; // Orange
                } else if (tdue_date > moment().add(2, "day").format("YYYY-MM-DD") && tdue_date <= moment().add(7, "day").format("YYYY-MM-DD")) {
                    color_num = 0; // Green
                }

                td0 = `
        <div class="custom-control custom-checkbox chkBox pointer no-modal task_priority_${color_num}"
          style="width:15px;margin-right: -6px;${completed_style}">
          <input class="custom-control-input chkBox chkComplete pointer" type="checkbox"
            id="formCheck-${item.fields.ID}" ${completed}>
          <label class="custom-control-label chkBox pointer ${chk_complete}" data-id="${item.fields.ID}"
            for="formCheck-${item.fields.ID}"></label>
        </div>`;
            }

            td2 = item.fields.TaskName;
            td3 = item.fields.TaskDescription.length < 80 ? item.fields.TaskDescription : item.fields.TaskDescription.substring(0, 79) + "...";

            if (item.fields.TaskLabel) {
                if (item.fields.TaskLabel.fields) {
                    td4 = `<span class="taskTag"><a class="taganchor filterByLabel" href="" data-id="${item.fields.TaskLabel.fields.ID}"><i class="fas fa-tag"
          style="margin-right: 5px; color:${item.fields.TaskLabel.fields.Color}" data-id="${item.fields.TaskLabel.fields.ID}"></i>${item.fields.TaskLabel.fields.TaskLabelName}</a></span>`;
                    labelsForExcel = item.fields.TaskLabel.fields.TaskLabelName;
                } else {
                    item.fields.TaskLabel.forEach((lbl) => {
                        td4 += `<span class="taskTag"><a class="taganchor filterByLabel" href="" data-id="${lbl.fields.ID}"><i class="fas fa-tag"
            style="margin-right: 5px; color:${lbl.fields.Color}" data-id="${lbl.fields.ID}"></i>${lbl.fields.TaskLabelName}</a></span>`;
                        labelsForExcel += lbl.fields.TaskLabelName + " ";
                    });
                }
            } else {
                td4 = "";
            }

            projectName = item.fields.ProjectName;
            if (item.fields.ProjectName == "" || item.fields.ProjectName == "Default") {
                projectName = "";
            }

            let all_projects = templateObject.all_projects.get();
            let projectColor = 'transparent';
            if (item.fields.ProjectID != 0) {
                let projects = all_projects.filter(project => project.fields.ID == item.fields.ProjectID);
                if (projects.length && projects[0].fields.ProjectColour) {
                    projectColor = projects[0].fields.ProjectColour;
                }
            }

            td5 = `
      <div style="display:flex; justify-content:center;">
        <div class="dropdown btnTaskTableAction">
          <button type="button" class="btn btn-success" data-toggle="dropdown"><i
              class="far fa-calendar" title="Reschedule Task"></i></button>
          <div class="dropdown-menu dropdown-menu-right reschedule-dropdown-menu  no-modal"
            aria-labelledby="dropdownMenuButton" style="width: 275px;">
            <a class="dropdown-item no-modal setScheduleToday" href="#" data-id="${item.fields.ID}">
              <i class="fas fa-calendar-day text-success no-modal"
                style="margin-right: 8px;"></i>Today
              <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
                ${todayDate}</div>
            </a>
            <a class="dropdown-item no-modal setScheduleTomorrow" href="#"
              data-id="${item.fields.ID}">
              <i class="fas fa-sun text-warning no-modal" style="margin-right: 8px;"></i>Tomorrow
              <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
                ${tomorrowDay}</div>
            </a>
            <a class="dropdown-item no-modal setScheduleWeekend" href="#"
              data-id="${item.fields.ID}">
              <i class="fas fa-couch text-primary no-modal" style="margin-right: 8px;"></i>This Weekend
              <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
                Sat</div>
            </a>
            <a class="dropdown-item no-modal setScheduleNexweek" href="#"
              data-id="${item.fields.ID}">
              <i class="fas fa-calendar-alt text-danger no-modal" style="margin-right: 8px;"></i>Next Week
              <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
                ${nextMonday}
              </div>
            </a>
            <a class="dropdown-item no-modal setScheduleNodate" href="#" data-id="${item.fields.ID}">
              <i class="fas fa-ban text-secondary no-modal" style="margin-right: 8px;"></i>
              No Date</a>
            <div class="dropdown-divider no-modal"></div>
            <div class="form-group no-modal" data-toggle="tooltip" data-placement="bottom"
              title="Date format: DD/MM/YYYY" style="display:flex; margin: 6px 20px; margin-top: 0px; z-index: 99999;">
              <label style="margin-top: 6px; margin-right: 16px; width: 146px;">Select Date</label>
              <div class="input-group date no-modal" style="cursor: pointer;">
                <input type="text" id="${item.fields.ID}" class="form-control crmDatepicker no-modal"
                  autocomplete="off">
                <div class="input-group-addon no-modal">
                  <span class="glyphicon glyphicon-th no-modal" style="cursor: pointer;"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="dropdown btnTaskTableAction">
          <button type="button" class="btn btn-warning openEditTaskModal" data-id="${item.fields.ID}"
            data-ttype="comment" data-catg="${projectName}"
            title="Add a Comment"><i class="far fa-comment-alt" data-id="${item.fields.ID}"
              data-ttype="comment"
              data-catg="${projectName}"></i></button>
        </div>

        <div class="dropdown btnTaskTableAction">
          <button type="button" class="btn btn-secondary" data-toggle="dropdown"
            data-placement="bottom" title="More Options"><i class="fas fa-ellipsis-h"></i></button>
          <div class="dropdown-menu dropdown-menu-right crmtaskdrop" id="">
            <a class="dropdown-item openEditTaskModal" data-id="${item.fields.ID}"
              data-catg="${projectName}">
              <i class="far fa-edit" style="margin-right: 8px;" data-id="${item.fields.ID}"
                data-catg="${projectName}"></i>Edit
              Task</a>

            <div class="dropdown-divider"></div>

            <div class="dropdown-item-wrap no-modal">
              <div class="no-modal">
                <div class="no-modal">
                  <span class="no-modal">Priority</span>
                </div>
                <div class="no-modal" style="display: inline-flex;">
                  <i class="fas fa-flag no-modal taskDropSecondFlag task_modal_priority_3" style="padding-left: 8px;" data-toggle="tooltip"
                    data-placement="bottom" title="Priority 1" data-priority="3"
                    data-id="${item.fields.ID}"></i>
                  <i class="fas fa-flag no-modal taskDropSecondFlag task_modal_priority_2"
                    data-toggle="tooltip" data-placement="bottom" title="Priority 2" data-priority="2"
                    data-id="${item.fields.ID}"></i>
                  <i class="fas fa-flag no-modal taskDropSecondFlag task_modal_priority_1"
                    data-toggle="tooltip" data-placement="bottom" title="Priority 3" data-priority="1"
                    data-id="${item.fields.ID}"></i>
                  <i class="fas fa-flag no-modal taskDropSecondFlag task_modal_priority_0" data-toggle="tooltip"
                    data-placement="bottom" title="Priority 4" data-priority="0"
                    data-id="${item.fields.ID}"></i>
                </div>
              </div>
            </div>

            <div class="dropdown-divider"></div>

            <a class="dropdown-item no-modal movetoproject" data-id="${item.fields.ID}"
              data-projectid="${item.fields.ProjectID}">
              <i class="fa fa-arrow-circle-right" style="margin-right: 8px;"
                data-id="${item.fields.ID}" data-projectid="${item.fields.ProjectID}"></i>Move to
              Project</a>
            <a class="dropdown-item duplicate-task no-modal" data-id="${item.fields.ID}">
              <i class="fa fa-plus-square-o" style="margin-right: 8px;"
                data-id="${item.fields.ID}"></i>Duplicate</a>

            <div class="dropdown-divider"></div>

            <a class="dropdown-item delete-task no-modal" data-id="${item.fields.ID}">
              <i class="fas fa-trash-alt" style="margin-right: 8px;"
                data-id="${item.fields.ID}"></i>Delete
              Task</a>
          </div>
        </div>
      </div>`;

            td6 = ``;
            if (item.fields.Active) {
                td6 = "";
            } else {
                td6 = "In-Active";
            }
            taskRows.push([
                // td0,
                tflag,
                tcontact,
                td1,
                td2,
                td3,
                td4,
                projectName,
                td6,
                item.fields.ID,
                color_num,
                labelsForExcel,
                item.fields.Completed,
                projectColor
            ]);
        });
        return taskRows;
    };

    templateObject.getReferenceLetters = () => {
        getVS1Data('TCorrespondence').then(data => {
            if (data.length == 0) {
                sideBarService.getCorrespondences().then(dataObject => {
                    addVS1Data('TCorrespondence', JSON.stringify(dataObject))
                    let tempArray = [];
                    if (dataObject.tcorrespondence.length > 0) {
                        let temp = dataObject.tcorrespondence.filter(item => {
                            return item.fields.EmployeeId == localStorage.getItem('mySessionEmployeeLoggedID')
                        })

                        for (let i = 0; i < temp.length; i++) {
                            for (let j = i + 1; j < temp.length; j++) {
                                if (temp[i].fields.Ref_Type == temp[j].fields.Ref_Type) {
                                    temp[j].fields.dup = true
                                }
                            }
                        }

                        temp.map(item => {
                            if (item.fields.EmployeeId == localStorage.getItem('mySessionEmployeeLoggedID') && item.fields.dup != true) {
                                tempArray.push(item.fields)
                            }
                        })
                    }
                    templateObject.correspondences.set(tempArray)
                })
            } else {
                let dataObj = JSON.parse(data[0].data);
                let tempArray = [];
                if (dataObj.tcorrespondence.length > 0) {
                    let temp = dataObj.tcorrespondence.filter(item => {
                        return item.fields.EmployeeId == localStorage.getItem('mySessionEmployeeLoggedID')
                    })

                    for (let i = 0; i < temp.length; i++) {
                        for (let j = i + 1; j < temp.length; j++) {
                            if (temp[i].fields.Ref_Type == temp[j].fields.Ref_Type) {
                                temp[j].fields.dup = true
                            }
                        }
                    }
                    temp.map(item => {
                        if (item.fields.EmployeeId == localStorage.getItem('mySessionEmployeeLoggedID') && item.fields.dup != true) {
                            tempArray.push(item.fields)
                        }
                    })
                }
                templateObject.correspondences.set(tempArray)
            }
        }).catch(function() {
            sideBarService.getCorrespondences().then(dataObject => {
                addVS1Data('TCorrespondence', JSON.stringify(dataObject));
                let tempArray = [];
                if (dataObject.tcorrespondence.length > 0) {
                    let temp = dataObject.tcorrespondence.filter(item => {
                        return item.fields.EmployeeId == localStorage.getItem('mySessionEmployeeLoggedID')
                    })

                    for (let i = 0; i < temp.length; i++) {
                        for (let j = i + 1; j < temp.length; j++) {
                            if (temp[i].fields.Ref_Type == temp[j].fields.Ref_Type) {
                                temp[j].fields.dup = true
                            }
                        }
                    }
                    temp.map(item => {
                        if (item.fields.EmployeeId == localStorage.getItem('mySessionEmployeeLoggedID') && item.fields.dup != true) {
                            tempArray.push(item.fields)
                        }
                    })
                }
                templateObject.correspondences.set(tempArray)
            })
        })
    }

    if (currentId.id === "undefined") {
        setInitialForEmptyCurrentID();
    } else {
        if (!isNaN(currentId.id)) {
            leadID = currentId.id;
            templateObject.getLeadData();
            templateObject.getReferenceLetters();
        } else if ((currentId.name)) {
            leadID = currentId.name.replace(/%20/g, " ");
            templateObject.getLeadDataByName();
        } else {
            setInitialForEmptyCurrentID();
        }
    }

    templateObject.getAllTask = function(leadName) {
        getVS1Data("TCRMTaskList").then(async function(dataObject) {
            if (dataObject.length == 0) {
                crmService.getAllTasksByContactName().then(async function(data) {
                    if (data.tprojecttasks.length > 0) {
                        addVS1Data("TCRMTaskList", JSON.stringify(data));
                        templateObject.taskrecords.set(data.tprojecttasks);
                    }
                }).catch(function(err) {
                })
            } else {
                let data = JSON.parse(dataObject[0].data);
                let all_records = data.tprojecttasks;
                templateObject.taskrecords.set(all_records);
            }
        }).catch(function(err) {
            crmService.getAllTasksByContactName().then(async function(data) {
                if (data.tprojecttasks.length > 0) {
                    addVS1Data("TCRMTaskList", JSON.stringify(data));
                    templateObject.taskrecords.set(data.tprojecttasks);
                }
            }).catch(function(err) {
            })
        });
    };


    function setCrmProjectTasks() {
        let tableHeaderList = [];

        if (templateObject.crmRecords.get()) {
            setTimeout(function() {
                MakeNegative();
                $("#dtAsOf").datepicker({
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
            }, 100);
        }
        // $('.custAwaitingAmt').text(utilityService.modifynegativeCurrencyFormat(totAmount));
        // $('.custOverdueAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountOverDue));
        $('.fullScreenSpin').css('display', 'none');
        setTimeout(function() {
            //$.fn.dataTable.moment('DD/MM/YY');
            $('#tblCrmList').DataTable({
                // dom: 'lBfrtip',
                columnDefs: [
                    { type: 'date', targets: 0 }
                ],
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                buttons: [{
                    extend: 'excelHtml5',
                    text: '',
                    download: 'open',
                    className: "btntabletocsv hiddenColumn",
                    filename: "Leads CRM List - " + moment().format(),
                    orientation: 'portrait',
                    exportOptions: {
                        columns: ':visible'
                    }
                }, {
                    extend: 'print',
                    download: 'open',
                    className: "btntabletopdf hiddenColumn",
                    text: '',
                    title: 'Leads CRM',
                    filename: "Leads CRM List - " + moment().format(),
                    exportOptions: {
                        columns: ':visible',
                        stripHtml: false
                    }
                }],
                select: true,
                destroy: true,
                colReorder: true,
                pageLength: initialDatatableLoad,
                lengthMenu: [
                    [initialDatatableLoad, -1],
                    [initialDatatableLoad, "All"]
                ],
                info: true,
                responsive: true,
                "order": [
                    [0, "desc"],
                    [2, "desc"]
                ],
                action: function() {
                    $('#tblCrmList').DataTable().ajax.reload();
                },
                "fnDrawCallback": function(oSettings) {
                    setTimeout(function() {
                        MakeNegative();
                    }, 100);
                },

            }).on('page', function() {
                setTimeout(function() {
                    MakeNegative();
                }, 100);
                let draftRecord = templateObject.crmRecords.get();
                templateObject.crmRecords.set(draftRecord);
            }).on('column-reorder', function() {

            });

            $('.fullScreenSpin').css('display', 'none');
        }, 0);

        const columns = $('#tblCrmList th');
        let sWidth = "";
        let columVisible = false;
        $.each(columns, function(i, v) {
            if (v.hidden === false) {
                columVisible = true;
            }
            if ((v.className.includes("hiddenColumn"))) {
                columVisible = false;
            }
            sWidth = v.style.width.replace('px', "");

            let datatablerecordObj = {
                sTitle: v.innerText || '',
                sWidth: sWidth || '',
                sIndex: v.cellIndex || 0,
                sVisible: columVisible || false,
                sClass: v.className || ''
            };
            tableHeaderList.push(datatablerecordObj);
        });
        templateObject.crmTableheaderRecords.set(tableHeaderList);
        $('div.dataTables_filter input').addClass('form-control form-control-sm');
    }

    templateObject.getLeadsList = function() {
        getVS1Data('TProspectEx').then(function(dataObject) {
            if (dataObject.length === 0) {
                // contactService.getAllLeadSideDataVS1().then(function(data) {
                //     setAllLeads(data);
                // }).catch(function(err) {
                //     //Bert.alert('<strong>' + err + '</strong>!', 'danger');
                // });
                sideBarService.getAllLeadsEx(initialDataLoad, 0, false).then(function (data) {
                    addVS1Data('TProspectEx', JSON.stringify(data)).then(function (res) {
                        setAllLeads(data);
                    }).catch(function (err) {
                    });
                }).catch(function (err) {
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setAllLeads(data);
            }
        }).catch(function(err) {
            // contactService.getAllLeadSideDataVS1().then(function(data) {
            //     setAllLeads(data);
            // }).catch(function(err) {
            //     //Bert.alert('<strong>' + err + '</strong>!', 'danger');
            // });
            sideBarService.getAllLeadsEx(initialDataLoad, 0, false).then(function (data) {
                addVS1Data('TProspectEx', JSON.stringify(data)).then(function (res) {
                    setAllLeads(data);
                }).catch(function (err) {
                });
            }).catch(function (err) {
            });
        });

    };
    templateObject.getLeadsList();

    function setAllLeads(data) {
        let lineItems = [];
        for (let i = 0; i < data.tprospect.length; i++) {
            let classname = '';
            if (!isNaN(currentId.id)) {
                if (data.tprospect[i].fields.ID === parseInt(currentId.id)) {
                    classname = 'currentSelect';
                }
            }
            const dataList = {
                id: data.tprospect[i].fields.ID || '',
                employeeName: data.tprospect[i].fields.ClientName || '',
                companyName: data.tprospect[i].fields.CompanyName || '',
                classname: classname
            };
            lineItems.push(dataList);
        }
        templateObject.leadrecords.set(lineItems);
        if (templateObject.leadrecords.get()) {
            setTimeout(function() {
                $('.counter').text(lineItems.length + ' items');
            }, 100);
        }
    }
    templateObject.saveCustomerDetails = async function() { //Rasheed
        return new Promise((resolve) => {
            sideBarService.getAllCustomersDataVS1(initialBaseDataLoad, 0).then(function(data) {
                addVS1Data('TCustomerVS1', JSON.stringify(data)).then(() => {
                    resolve({ success: true, ...res });
                }).catch(function(err) {
                    resolve({ success: false, ...err })
                });
            });
        });
    };

    $(document).ready(function() {
        setTimeout(function() {
            $('#editLeadTitle').editableSelect();
        }, 1000)

    })

    $(document).on("click", "#referenceLetterModal .btnSaveLetterTemp", function(e) {
        if ($("input[name='refTemp']:checked").attr('value') == undefined || $("input[name='refTemp']:checked").attr('value') == null) {
            swal({
                title: 'Oooops...',
                text: "No email template has been set",
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Cancel'
            }).then((result) => {
                if (result.value) {
                    $('#referenceLetterModal').modal('toggle');
                }
            });
        } else {
            let email = $('#edtLeadEmail').val();
            let dataLabel = $("input[name='refTemp']:checked").attr('value');
            let dataSubject = $("input[name='refTemp']:checked").attr('data-subject');
            let dataMemo = $("input[name='refTemp']:checked").attr('data-memo');
            if (email && email != null && email != '') {
                document.location =
                    "mailto:" + email + "?subject=" + dataSubject + "&body=" + dataMemo;
                sideBarService.getCorrespondences().then(dataObject => {
                    let temp = {
                        type: "TCorrespondence",
                        fields: {
                            Active: true,
                            EmployeeId: localStorage.getItem('mySessionEmployeeLoggedID'),
                            Ref_Type: dataLabel,
                            MessageAsString: dataMemo,
                            MessageFrom: localStorage.getItem('mySessionEmployee'),
                            MessageId: dataObject.tcorrespondence.length.toString(),
                            MessageTo: email,
                            ReferenceTxt: dataSubject,
                            Ref_Date: moment().format('YYYY-MM-DD'),
                            Status: ""
                        }
                    }
                    sideBarService.saveCorrespondence(temp).then(data => {
                        sideBarService.getCorrespondences().then(dataUpdate => {
                            addVS1Data('TCorrespondence', JSON.stringify(dataUpdate));
                        })
                        $('#referenceLetterModal').modal('toggle');
                    })
                })
            } else {
                swal({
                    title: 'Oooops...',
                    text: "No user email has been set",
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Cancel'
                }).then((result) => {
                    if (result.value) {
                        $('#referenceLetterModal').modal('toggle');
                    }
                });
            }
        }
    });
    $(document).on('click', '#referenceLetterModal .btnAddLetter', function(e) {
        $('#addLetterTemplateModal').modal('toggle')
    })
    $(document).on('click', '#addLetterTemplateModal #save-correspondence', function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        // let correspondenceData = localStorage.getItem('correspondence');
        let correspondenceTemp = templateObject.correspondences.get()
        let tempLabel = $("#edtTemplateLbl").val();
        let tempSubject = $('#edtTemplateSubject').val();
        let tempContent = $("#edtTemplateContent").val();
        if (correspondenceTemp.length > 0) {
            let index = correspondenceTemp.findIndex(item => {
                return item.Ref_Type == tempLabel
            })
            if (index > 0) {
                swal({
                    title: 'Oooops...',
                    text: 'There is already a template labeled ' + tempLabel,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {} else if (result.dismiss === 'cancel') {}
                });
                $('.fullScreenSpin').css('display', 'none');
            } else {
                sideBarService.getCorrespondences().then(dObject => {
                    let temp = {
                        Active: true,
                        EmployeeId: localStorage.getItem('mySessionEmployeeLoggedID'),
                        Ref_Type: tempLabel,
                        MessageAsString: tempContent,
                        MessageFrom: "",
                        MessageId: dObject.tcorrespondence.length.toString(),
                        MessageTo: "",
                        ReferenceTxt: tempSubject,
                        Ref_Date: moment().format('YYYY-MM-DD'),
                        Status: ""
                    }
                    let objDetails = {
                        type: 'TCorrespondence',
                        fields: temp
                    }

                    // let array = [];
                    // array.push(objDetails)

                    sideBarService.saveCorrespondence(objDetails).then(data => {
                        sideBarService.getCorrespondences().then(dataUpdate => {
                            addVS1Data('TCorrespondence', JSON.stringify(dataUpdate)).then(function() {
                                $('.fullScreenSpin').css('display', 'none');
                                swal({
                                    title: 'Success',
                                    text: 'Template has been saved successfully ',
                                    type: 'success',
                                    showCancelButton: false,
                                    confirmButtonText: 'Continue'
                                }).then((result) => {
                                    if (result.value) {
                                        $('#addLetterTemplateModal').modal('toggle')
                                        templateObject.getReferenceLetters();
                                    } else if (result.dismiss === 'cancel') {}
                                });
                            })
                        }).catch(function() {
                            $('.fullScreenSpin').css('display', 'none');
                            swal({
                                title: 'Oooops...',
                                text: 'Something went wrong',
                                type: 'error',
                                showCancelButton: false,
                                confirmButtonText: 'Try Again'
                            }).then((result) => {
                                if (result.value) {
                                    $('#addLetterTemplateModal').modal('toggle')
                                } else if (result.dismiss === 'cancel') {}
                            });
                        })
                    }).catch(function() {
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Oooops...',
                            text: 'Something went wrong',
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                $('#addLetterTemplateModal').modal('toggle')
                            } else if (result.dismiss === 'cancel') {}
                        });
                    })

                })
            }
        } else {
            sideBarService.getCorrespondences().then(dObject => {
                let temp = {
                    Active: true,
                    EmployeeId: localStorage.getItem('mySessionEmployeeLoggedID'),
                    Ref_Type: tempLabel,
                    MessageAsString: tempContent,
                    MessageFrom: "",
                    MessageId: dObject.tcorrespondence.length.toString(),
                    MessageTo: "",
                    ReferenceTxt: tempSubject,
                    Ref_Date: moment().format('YYYY-MM-DD'),
                    Status: ""
                }
                let objDetails = {
                    type: 'TCorrespondence',
                    fields: temp
                }

                let array = [];
                array.push(objDetails)

                sideBarService.saveCorrespondence(objDetails).then(data => {
                    sideBarService.getCorrespondences().then(function(dataUpdate) {
                        addVS1Data('TCorrespondence', JSON.stringify(dataUpdate)).then(function() {
                            $('.fullScreenSpin').css('display', 'none');
                            swal({
                                title: 'Success',
                                text: 'Template has been saved successfully ',
                                type: 'success',
                                showCancelButton: false,
                                confirmButtonText: 'Continue'
                            }).then((result) => {
                                if (result.value) {
                                    $('#addLetterTemplateModal').modal('toggle')
                                    templateObject.getReferenceLetters();

                                } else if (result.dismiss === 'cancel') {}
                            });
                        }).catch(function(err) {
                            $('.fullScreenSpin').css('display', 'none');
                            swal({
                                title: 'Oooops...',
                                text: 'Something went wrong',
                                type: 'error',
                                showCancelButton: false,
                                confirmButtonText: 'Try Again'
                            }).then((result) => {
                                if (result.value) {
                                    $('#addLetterTemplateModal').modal('toggle')
                                } else if (result.dismiss === 'cancel') {}
                            });
                        })
                    })
                }).catch(function() {
                    swal({
                        title: 'Oooops...',
                        text: 'Something went wrong',
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                            $('#addLetterTemplateModal').modal('toggle')
                        } else if (result.dismiss === 'cancel') {}
                    });
                })
            })
        }
        // localStorage.setItem('correspondence', JSON.stringify(correspondenceTemp));
        // templateObject.correspondences.set(correspondenceTemp);
        // $('#addLetterTemplateModal').modal('toggle');
    })
    $(document).on("click", "#tblStatusPopList tbody tr", function(e) {
        $('#leadStatus').val($(this).find(".colStatusName").text());
        $('#statusPopModal').modal('toggle');
        $('#tblStatusPopList_filter .form-control-sm').val('');
        setTimeout(function() {
            $('.btnRefreshStatus').trigger('click');
            $('.fullScreenSpin').css('display', 'none');
        }, 1000);
    });
    $(document).on("click", "#tblSourcePopList tbody tr", function(e) {
        $('#leadSource').val($(this).find(".colSourceName").text());
        $('#sourcePopModal').modal('toggle');
        $('#tblSourcePopList_filter .form-control-sm').val('');
        setTimeout(function() {
            $('.btnRefreshStatus').trigger('click');
            $('.fullScreenSpin').css('display', 'none');
        }, 1000);
    });
    $(document).on('click', '#tblEmployeelist tbody tr', function(event) {
        let value = $(this).find('.colEmployeeName').text();
        $('#leadRep').val(value);
        $('#employeeListPOPModal').modal('hide');
        // $('#leadRep').val($('#leadRep').val().replace(/\s/g, ''));
    })
    // $(document).on('click', '#leadStatus', function(e, li) {
    //     const $earch = $(this);
    //     const offset = $earch.offset();
    //     $('#statusId').val('');
    //     const statusDataName = e.target.value || '';
    //     if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
    //         $('#statusPopModal').modal('toggle');
    //     } else {
    //         if (statusDataName.replace(/\s/g, '') != '') {
    //             $('#newStatusHeader').text('Edit Status');
    //             $('#newStatus').val(statusDataName);
    //             getVS1Data('TLeadStatusType').then(function(dataObject) {
    //                 if (dataObject.length == 0) {
    //                     $('.fullScreenSpin').css('display', 'inline-block');
    //                     sideBarService.getAllLeadStatus().then(function(data) {
    //                         for (let i in data.tleadstatustype) {
    //                             if (data.tleadstatustype[i].TypeName === statusDataName) {
    //                                 $('#statusId').val(data.tleadstatustype[i].Id);
    //                             }
    //                         }
    //                         setTimeout(function() {
    //                             $('.fullScreenSpin').css('display', 'none');
    //                             $('#newStatusPopModal').modal('toggle');
    //                         }, 200);
    //                     });
    //                 } else {
    //                     let data = JSON.parse(dataObject[0].data);
    //                     let useData = data.tleadstatustype;
    //                     for (let i in useData) {
    //                         if (useData[i].TypeName === statusDataName) {
    //                             $('#statusId').val(useData[i].Id);
    //                         }
    //                     }
    //                     setTimeout(function() {
    //                         $('.fullScreenSpin').css('display', 'none');
    //                         $('#newStatusPopModal').modal('toggle');
    //                     }, 200);
    //                 }
    //             }).catch(function(err) {
    //                 $('.fullScreenSpin').css('display', 'inline-block');
    //                 sideBarService.getAllLeadStatus().then(function(data) {
    //                     for (let i in data.tleadstatustype) {
    //                         if (data.tleadstatustype.hasOwnProperty(i)) {
    //                             if (data.tleadstatustype[i].TypeName === statusDataName) {
    //                                 $('#statusId').val(data.tleadstatustype[i].Id);
    //                             }
    //                         }
    //                     }
    //                     setTimeout(function() {
    //                         $('.fullScreenSpin').css('display', 'none');
    //                         $('#newStatusPopModal').modal('toggle');
    //                     }, 200);
    //                 });
    //             });
    //             setTimeout(function() {
    //                 $('.fullScreenSpin').css('display', 'none');
    //                 $('#newStatusPopModal').modal('toggle');
    //             }, 200);

    //         } else {
    //             $('#statusPopModal').modal();
    //             setTimeout(function() {
    //                 $('#tblStatusPopList_filter .form-control-sm').focus();
    //                 $('#tblStatusPopList_filter .form-control-sm').val('');
    //                 $('#tblStatusPopList_filter .form-control-sm').trigger("input");
    //                 const datatable = $('#tblStatusPopList').DataTable();
    //                 datatable.draw();
    //                 $('#tblStatusPopList_filter .form-control-sm').trigger("input");
    //             }, 500);
    //         }
    //     }
    // });
    $(document).on('click', '#leadSource', function(e, li) {
        const $earch = $(this);
        const offset = $earch.offset();
        if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#sourcePopModal').modal('toggle');
        } else {
            $('#sourcePopModal').modal();
            setTimeout(function() {
                $('#tblSourcePopList_filter .form-control-sm').focus();
                $('#tblSourcePopList_filter .form-control-sm').val('');
                $('#tblSourcePopList_filter .form-control-sm').trigger("input");
                const datatable = $('#tblSourcePopList').DataTable();
                datatable.draw();
                $('#tblSourcePopList_filter .form-control-sm').trigger("input");
            }, 500);
        }
    });
    $(document).on('click', '#leadRep', function(e, li) {
        $('#employeeListPOPModal').modal('show');
    });

    setTimeout(() => $('#leadStatus').editableSelect(), 500);
    setTimeout(() => $('#leadSource').editableSelect(), 500);

    $(document).on("click", "#tblLeadCrmListWithDate tbody .dnd-moved .colDate, #tblLeadCrmListWithDate tbody .dnd-moved .colType", function(e) {
        $(".editTaskDetailName").val($("#tblLeadCrmListWithDate tbody .dnd-moved .colTaskName").html());
        $(".editTaskDetailDescription").val($("#tblLeadCrmListWithDate tbody .dnd-moved .colTaskDesc").html());
        $("#taskmodalDuedate").val($("#tblLeadCrmListWithDate tbody .dnd-moved #completeDate").val());
        $("#taskDetailModal").modal("toggle");
    });

    $(document).on("change", ".editTaskDetailName, .editTaskDetailDescription, #taskmodalDuedate", function(e) {
        $("#tblLeadCrmListWithDate tbody .dnd-moved .colTaskName").html($(".editTaskDetailName").val());
        $("#tblLeadCrmListWithDate tbody .dnd-moved .colTaskDesc").html($(".editTaskDetailDescription").val());
        $("#tblLeadCrmListWithDate tbody .dnd-moved #completeDate").val($("#taskmodalDuedate").val());
    });

    let tokenid = "random";
    $(document).on("focusout", "#"+tokenid+" .colTaskName, #"+tokenid+" .colTaskDesc, #"+tokenid+" .colCompletedBy", function(e) {
        $(".editTaskDetailName").val($("#tblLeadCrmListWithDate tbody .dnd-moved .colTaskName").html());
        $(".editTaskDetailDescription").val($("#tblLeadCrmListWithDate tbody .dnd-moved .colTaskDesc").html());
        $("#taskmodalDuedate").val($("#tblLeadCrmListWithDate tbody .dnd-moved #completeDate").val());
        if($("#"+tokenid+" .colTaskName").html() != "" && $("#"+tokenid+" .colTaskDesc").html() != "" && $("#"+tokenid+" #completeDate").val() != ""){
            $(".btnSaveEditTask").trigger("click");
            $(".btnAddLineGroup button").attr("disabled", false);
            $(".btnTask").attr("disabled", false);
        }
    });
});

Template.leadscard.events({
    'click .openBalance': function(event) {
        let customerName = $('#edtLeadEmployeeName').val() || $('#edtJobCustomerCompany').val() || '';
        if (customerName !== "") {
            if (customerName.indexOf('^') > 0) {
                customerName = customerName.split('^')[0]
            }
            window.open('/agedreceivables?contact=' + customerName, '_self');
        } else {
            window.open('/agedreceivables', '_self');
        }
    },
    'click #leadStatus': function(event) {
        $('#leadStatus').select();
        $('#leadStatus').editableSelect();
    },
    'click #leadSource': function(event) {
        $('#leadSource').select();
        $('#leadSource').editableSelect();
    },
    'click #leadRep': function(event) {
        $('#leadRep').select();
        $('#leadRep').editableSelect();
    },
    'click .btnReceiveLeadPayment': async function(event) {
        let currentId = FlowRouter.current().queryParams.id || '';
        let customerName = $('#edtLeadEmployeeName').val() || '';
        if (customerName !== "") {
            await clearData('TAwaitingCustomerPayment');
            FlowRouter.go('/customerawaitingpayments?contact=' + customerName + '&contactid=' + currentId);
        }
    },
    'click .btnBack': function(event) {
        playCancelAudio();
        // event.preventDefault();
        setTimeout(function() {
            history.back(1);
        }, delayTimeAfterSound);
        //  FlowRouter.go('/leadlist');
    },
    'click #chkSameAsShipping': function(event) {
        /*if($(event.target).is(':checked')){
      let streetAddress = $('#edtShippingAddress').val();
      let city = $('#edtShippingCity').val();
      let state =  $('#edtShippingState').val();
      let zipcode =  $('#edtShippingZIP').val();
      let country =  $('#sedtCountry').val();

       $('#edtBillingAddress').val(streetAddress);
       $('#edtBillingCity').val(city);
       $('#edtBillingState').val(state);
       $('#edtBillingZIP').val(zipcode);
       $('#bedtCountry').val(country);
    }else{
      $('#edtBillingAddress').val('');
      $('#edtBillingCity').val('');
      $('#edtBillingState').val('');
      $('#edtBillingZIP').val('');
      $('#bedtCountry').val('');
    }
    */
    },
    'click .btnSave': async function(event) {
        playSaveAudio();
        let templateObject = Template.instance();
        let contactService = new ContactService();
        let uploadedItems = templateObject.uploadedFiles.get();
        setTimeout(async function() {
            $('.fullScreenSpin').css('display', 'inline-block');

            let employeeName = $('#edtLeadEmployeeName').val();
            let email = $('#edtLeadEmail').val();
            let title = $('#editLeadTitle').val();
            let firstname = $('#edtFirstName').val();
            let middlename = $('#edtMiddleName').val();
            let lastname = $('#edtLastName').val();
            let phone = $('#edtLeadPhone').val();
            let mobile = $('#edtLeadMobile').val();
            if (mobile != '') {
                mobile = contactService.changeMobileFormat(mobile)
            }
            let fax = $('#edtLeadFax').val();
            let skype = $('#edtSkypeID').val();
            let website = $('#edtWebsite').val();
            let streetAddress = $('#edtShippingAddress').val();
            let city = $('#edtShippingCity').val();
            let state = $('#edtShippingState').val();
            let postalcode = $('#edtShippingZIP').val();
            let country = $('#sedtCountry').val();
            let suburb = $('#edtShippingSuburb').val();
            let bstreetAddress = '';
            let bcity = '';
            let bstate = '';
            let bzipcode = '';
            let bcountry = '';
            let bsuburb = '';
            let isSupplier = !!$('#chkSameAsSupplier').is(':checked');
            let sourceName = $('#leadSource').val() || '';
            let repName = $('#leadRep').val() || '';
            let status = $('#leadStatus').val() || '';

            if (employeeName == '') {
                //swal('Please provide the lead name !', '', 'warning');
                swal({
                    title: "Please provide the lead name !",
                    text: '',
                    type: 'warning',
                }).then((result) => {
                    if (result.value) {
                        $('#edtLeadEmployeeName').focus();
                    } else if (result.dismiss == 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display', 'none');
                e.preventDefault();
                return false;
            }
            if (firstname == '') {
                //swal('Please provide the first name !', '', 'warning');
                swal({
                    title: "Please provide the first name !",
                    text: '',
                    type: 'warning',
                }).then((result) => {
                    if (result.value) {
                        $('#edtFirstName').focus();
                    } else if (result.dismiss == 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display', 'none');
                e.preventDefault();
                return false;
            }
            if (lastname == '') {
                //swal('Please provide the last name !', '', 'warning');
                swal({
                    title: "Please provide the last name !",
                    text: '',
                    type: 'warning',
                }).then((result) => {
                    if (result.value) {
                        $('#edtLastName').focus();
                    } else if (result.dismiss == 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display', 'none');
                e.preventDefault();
                return false;
            }
            if ($('#chkSameAsShipping2').is(':checked')) {
                bstreetAddress = streetAddress;
                bcity = city;
                bstate = state;
                bzipcode = postalcode;
                bcountry = country;
                // bsuburb = suburb;
            } else {
                bstreetAddress = $('#edtBillingAddress').val();
                bcity = $('#edtBillingCity').val();
                bstate = $('#edtBillingState').val();
                bzipcode = $('#edtBillingZIP').val();
                bcountry = $('#bedtCountry').val();
                // bsuburb = $('#edtBillingSuburb').val();
            }

            let rewardPointsOpeningBalance = $('#custOpeningBalance').val();
            // let sltRewardPointsOpeningDate =  $('#dtAsOf').val();
            const sltRewardPointsOpeningDate = new Date($("#dtAsOf").datepicker("getDate"));
            let openingDate = sltRewardPointsOpeningDate.getFullYear() + "-" + (sltRewardPointsOpeningDate.getMonth() + 1) + "-" + sltRewardPointsOpeningDate.getDate();
            let notes = $('#txaNotes').val();
            let custField4 = $('#edtCustomField4').val();
            // add to custom field
            let custField1 = $('#edtSaleCustField1').val() || '';
            let custField2 = $('#edtSaleCustField2').val() || '';
            let custField3 = $('#edtSaleCustField3').val() || '';



            const url = FlowRouter.current().path;
            const getemp_id = url.split('?id=');
            let currentEmployee = getemp_id[getemp_id.length - 1];
            let TLeadID = 0;
            if (getemp_id[1]) {
                TLeadID = parseInt(currentEmployee);
            } else {
                let custdupID = 0;
                let checkCustData = await contactService.getCheckLeadsData(employeeName) || '';
                if (checkCustData !== '') {
                    if (checkCustData.tprospect.length) {
                        TLeadID = checkCustData.tprospect[0].Id;
                    }
                }
            }
            let objDetails = {
                type: "TProspectEx",
                fields: {
                    ID: TLeadID,
                    Title: title,
                    ClientName: employeeName,
                    FirstName: firstname,
                    CUSTFLD10: middlename,
                    LastName: lastname,
                    PublishOnVS1: true,
                    Email: email,
                    Phone: phone,
                    Mobile: mobile,
                    SkypeName: skype,
                    Faxnumber: fax,
                    Street: streetAddress,
                    Street2: city,
                    Suburb: suburb,
                    State: state,
                    PostCode: postalcode,
                    Country: country,
                    BillStreet: bstreetAddress,
                    BillStreet2: bcity,
                    BillState: bstate,
                    BillPostCode: bzipcode,
                    Billcountry: bcountry,
                    // Billsuburb: bsuburb,
                    IsSupplier: isSupplier,
                    Notes: notes,
                    URL: website,
                    Attachments: uploadedItems,
                    CUSTFLD1: custField1,
                    CUSTFLD2: custField2,
                    CUSTFLD3: custField3,
                    Status: status,
                    SourceName: sourceName,
                    RepName: repName,
                }
            };
            contactService.saveProspectEx(objDetails).then(function(objDetails) {

                if (localStorage.getItem("enteredURL") != null) {
                    FlowRouter.go(localStorage.getItem("enteredURL"));
                    localStorage.removeItem("enteredURL");
                    return;
                }

                let customerSaveID = objDetails.fields.ID;
                if (customerSaveID) {
                    sideBarService.getAllLeads(initialBaseDataLoad, 0).then(function(dataReload) {
                        addVS1Data('TProspectEx', JSON.stringify(dataReload)).then(function(datareturn) {
                            window.open('/leadlist', '_self');
                        }).catch(function(err) {
                            window.open('/leadlist', '_self');
                        });
                    }).catch(function(err) {
                        window.open('/leadlist', '_self');
                    });
                }
            }).catch(function(err) {
                let errText = "";
                if (objDetails.fields.ClientName == "") {
                    errText = "Error: Lead Name should not be blank.";
                } else {
                    errText = err;
                }
                swal({
                    title: 'Oooops...',
                    text: errText,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        // Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display', 'none');
            });
        }, delayTimeAfterSound);
    },
    'keyup .search': function(event) {
        const searchTerm = $(".search").val();
        const listItem = $('.results tbody').children('tr');
        const searchSplit = searchTerm.replace(/ /g, "'):containsi('");
        $.extend($.expr[':'], {
            'containsi': function(elem, i, match, array) {
                return (elem.textContent || elem.innerText || '').toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
            }
        });
        $(".results tbody tr").not(":containsi('" + searchSplit + "')").each(function(e) {
            $(this).attr('visible', 'false');
        });
        $(".results tbody tr:containsi('" + searchSplit + "')").each(function(e) {
            $(this).attr('visible', 'true');
        });
        const jobCount = $('.results tbody tr[visible="true"]').length;
        $('.counter').text(jobCount + ' items');
        if (jobCount === '0') { $('.no-result').show(); } else {
            $('.no-result').hide();
        }
        if (searchTerm === "") {
            $(".results tbody tr").each(function(e) {
                $(this).attr('visible', 'true');
                $('.no-result').hide();
            });
            //setTimeout(function () {
            const rowCount = $('.results tbody tr').length;
            $('.counter').text(rowCount + ' items');
            //}, 500);
        }
    },
    'click .tblLeadSideList tbody tr': function(event) {
        const leadLineID = $(event.target).attr('id');
        window.open('/leadscard?id=' + leadLineID, '_self');
    },
    'click .tblLeadCrmListWithDate tbody tr': function(event) {
        const taskID = $(event.target).parent().attr('id');
        let colType = $(event.target).parent().find(".colType").text();

        if (taskID !== undefined && taskID !== "random") {
            if (colType == 'Task') {
                // FlowRouter.go('/crmoverview?taskid=' + taskID);
                openEditTaskModals(taskID, "");
            } else if (colType == 'Appointment') {
                // FlowRouter.go('/appointments?id=' + taskID);
                document.getElementById("updateID").value = taskID || 0;
                $("#event-modal").modal("toggle");
            }
        }
    },
    'click #exportbtn': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblCrmList_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');
    },
    'click .printConfirm': function(event) {
        playPrintAudio();
        setTimeout(function() {
            $('.fullScreenSpin').css('display', 'inline-block');
            jQuery('#tblCrmList_wrapper .dt-buttons .btntabletopdf').click();
            $('.fullScreenSpin').css('display', 'none');
        }, delayTimeAfterSound);
    },
    'click .btnRefresh': function() {
        Meteor._reload.reload();
    },
    'click .btnRefreshCrm': function() {
        let currentId = FlowRouter.current().queryParams;
        $('.fullScreenSpin').css('display', 'inline-block');
        crmService.getAllTasksList().then(function(data) {
            addVS1Data('TCRMLeadTaskList', JSON.stringify(data)).then(function(datareturn) {
                if (!isNaN(currentId.id)) {
                    window.open('/leadscard?id=' + currentId.id + '&crmTab=active', '_self');
                }
                window.open('/leadscard?crmTab=active', '_self');
            }).catch(function(err) {
                if (!isNaN(currentId.id)) {
                    window.open('/leadscard?id=' + currentId.id + '&crmTab=active', '_self');
                }
            });
        }).catch(function(err) {
            if (!isNaN(currentId.id)) {
                window.open('/leadscard?id=' + currentId.id + '&crmTab=active', '_self');
            }
        });
    },
    'click #activeChk': function(event) {
        if ($(event.target).is(':checked')) {
            $('#customerInfo').css('color', '#00A3D3');
        } else {
            $('#customerInfo').css('color', '#b7b9cc !important');
        }
    },
    'click .new_attachment_btn': function(event) {
        $('#attachment-upload').trigger('click');
    },
    'click #formCheck-one': function(event) {
        if ($(event.target).is(':checked')) {
            $('.checkbox1div').css('display', 'block');
        } else {
            $('.checkbox1div').css('display', 'none');
        }
    },
    'click #formCheck-two': function(event) {
        if ($(event.target).is(':checked')) {
            $('.checkbox2div').css('display', 'block');
        } else {
            $('.checkbox2div').css('display', 'none');
        }
    },
    'click #formCheck-three': function(event) {
        if ($(event.target).is(':checked')) {
            $('.checkbox3div').css('display', 'block');
        } else {
            $('.checkbox3div').css('display', 'none');
        }
    },
    'click #formCheck-four': function(event) {
        if ($(event.target).is(':checked')) {
            $('.checkbox4div').css('display', 'block');
        } else {
            $('.checkbox4div').css('display', 'none');
        }
    },
    'blur .customField1Text': function(event) {
        const inputValue1 = $('.customField1Text').text();
        $('.lblCustomField1').text(inputValue1);
    },
    'blur .customField2Text': function(event) {
        const inputValue2 = $('.customField2Text').text();
        $('.lblCustomField2').text(inputValue2);
    },
    'blur .customField3Text': function(event) {
        const inputValue3 = $('.customField3Text').text();
        $('.lblCustomField3').text(inputValue3);
    },
    'blur .customField4Text': function(event) {
        const inputValue4 = $('.customField4Text').text();
        $('.lblCustomField4').text(inputValue4);
    },
    'click .btnSaveSettings': function(event) {
        playSaveAudio();
        let templateObject = Template.instance();
        setTimeout(function() {

            $('.lblCustomField1').html('');
            $('.lblCustomField2').html('');
            $('.lblCustomField3').html('');
            $('.lblCustomField4').html('');
            let getchkcustomField1 = true;
            let getchkcustomField2 = true;
            let getchkcustomField3 = true;
            let getchkcustomField4 = true;
            let getcustomField1 = $('.customField1Text').html();
            let getcustomField2 = $('.customField2Text').html();
            let getcustomField3 = $('.customField3Text').html();
            let getcustomField4 = $('.customField4Text').html();
            if ($('#formCheck-one').is(':checked')) {
                getchkcustomField1 = false;
            }
            if ($('#formCheck-two').is(':checked')) {
                getchkcustomField2 = false;
            }
            if ($('#formCheck-three').is(':checked')) {
                getchkcustomField3 = false;
            }
            if ($('#formCheck-four').is(':checked')) {
                getchkcustomField4 = false;
            }
            $('#customfieldModal').modal('toggle');
        }, delayTimeAfterSound);
    },
    'click .btnResetSettings': function(event) {
        let checkPrefDetails = getCheckPrefDetails();
        if (checkPrefDetails) {
            CloudPreference.remove({ _id: checkPrefDetails._id }, function(err, idTag) {
                if (err) {

                } else {
                    let customerSaveID = FlowRouter.current().queryParams;
                    if (!isNaN(customerSaveID.id)) {
                        window.open('/leadscard?id=' + customerSaveID, '_self');
                    } else if (!isNaN(customerSaveID.jobid)) {
                        window.open('/leadscard?jobid=' + customerSaveID, '_self');
                    } else {
                        window.open('/leadscard', '_self');
                    }
                    //Meteor._reload.reload();
                }
            });
        }
    },
    'change #attachment-upload': function(e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArray = templateObj.uploadedFiles.get();
        let myFiles = $('#attachment-upload')[0].files;
        let uploadData = utilityService.attachmentUploadTabs(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment);
        templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCount.set(uploadData.totalAttachments);
    },
    'click .img_new_attachment_btn': function(event) {
        $('#img-attachment-upload').trigger('click');
    },
    'change #img-attachment-upload': function(e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArray = templateObj.uploadedFiles.get();
        let myFiles = $('#img-attachment-upload')[0].files;
        let uploadData = utilityService.attachmentUpload(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment);
        templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCount.set(uploadData.totalAttachments);
    },
    'click .remove-attachment': function(event, ui) {
        let tempObj = Template.instance();
        let attachmentID = parseInt(event.target.id.split('remove-attachment-')[1]);
        if (tempObj.$("#confirm-action-" + attachmentID).length) {
            tempObj.$("#confirm-action-" + attachmentID).remove();
        } else {
            let actionElement = '<div class="confirm-action" id="confirm-action-' + attachmentID + '"><a class="confirm-delete-attachment btn btn-default" id="delete-attachment-' + attachmentID + '">' +
                'Delete</a><button class="save-to-library btn btn-default">Remove & save to File Library</button></div>';
            tempObj.$('#attachment-name-' + attachmentID).append(actionElement);
        }
        tempObj.$("#new-attachment2-tooltip").show();
    },
    'click .file-name': function(event) {
        let attachmentID = parseInt(event.currentTarget.parentNode.id.split('attachment-name-')[1]);
        let templateObj = Template.instance();
        let uploadedFiles = templateObj.uploadedFiles.get();
        $('#myModalAttachment').modal('hide');
        let previewFile = getPreviewFile(uploadedFiles, attachmentID);
        templateObj.uploadedFile.set(previewFile);
        $('#files_view').modal('show');
    },
    'click .confirm-delete-attachment': function(event, ui) {
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
            utilityService.showUploadedAttachmentTabs(uploadedArray);
        } else {
            $(".attchment-tooltip").show();
        }
    },
    'click .attachmentTab': function() {
        let templateInstance = Template.instance();
        let uploadedFileArray = templateInstance.uploadedFiles.get();
        if (uploadedFileArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentTabs(uploadedFileArray);
        } else {
            $(".attchment-tooltip").show();
        }
    },
    'click .btnNewLead': function(event) {
        window.open('/leadscard', '_self');
    },
    'click .btnView': function(e) {
        const btnView = document.getElementById("btnView");
        const btnHide = document.getElementById("btnHide");
        const displayList = document.getElementById("displayList");
        const displayInfo = document.getElementById("displayInfo");
        if (displayList.style.display === "none") {
            displayList.style.display = "flex";
            $("#displayInfo").removeClass("col-12");
            $("#displayInfo").addClass("col-9");
            btnView.style.display = "none";
            btnHide.style.display = "flex";
        } else {
            displayList.style.display = "none";
            $("#displayInfo").removeClass("col-9");
            $("#displayInfo").addClass("col-12");
            btnView.style.display = "flex";
            btnHide.style.display = "none";
        }
    },
    'click .btnDeleteLead': function(event) {
        playDeleteAudio();
        let contactService = new ContactService();
        setTimeout(function() {
            $('.fullScreenSpin').css('display', 'inline-block');

            let currentId = FlowRouter.current().queryParams;
            let objDetails = '';
            if (!isNaN(currentId.id)) {
                let currentLead = parseInt(currentId.id);
                objDetails = {
                    type: "TProspectEx",
                    fields: {
                        ID: currentLead,
                        Active: false
                    }
                };
                contactService.saveProspectEx(objDetails).then(function(objDetails) {
                    FlowRouter.go('/leadlist?success=true');
                }).catch(function(err) {
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {} else if (result.dismiss === 'cancel') {

                        }
                    });
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else {
                FlowRouter.go('/leadlist?success=true');
            }
            $('#deleteLeadModal').modal('toggle');
        }, delayTimeAfterSound);
    },
    'click .btnTask': function(event) {
        // $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let customerID = parseInt(currentId.id);
            // FlowRouter.go('/crmoverview?leadid=' + customerID);
            $("#btnAddLine").trigger("click");
        } else {
            $('.fullScreenSpin').css('display', 'none');
        }
    },
    'click .btnEmail': function(event) {
        playEmailAudio();
        setTimeout(function() {
            $('.fullScreenSpin').css('display', 'inline-block');
            let currentId = FlowRouter.current().queryParams;
            if (!isNaN(currentId.id)) {
                let customerID = parseInt(currentId.id);
                // FlowRouter.go('/crmoverview?leadid=' + customerID);
                $('#referenceLetterModal').modal('toggle');
                $('.fullScreenSpin').css('display', 'none');
            } else {
                $('.fullScreenSpin').css('display', 'none');
            }
        }, delayTimeAfterSound);
    },
    'click .btnAppointment': function(event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let customerID = parseInt(currentId.id);
            FlowRouter.go('/appointments?leadid=' + customerID);
        } else {
            $('.fullScreenSpin').css('display', 'none');
        }
    },
    'click .btnQuote': async function(event) {
        convertToCustomer('quotecard');
    },
    'click .btnSalesOrder': function(event) {
        convertToCustomer('salesordercard');
    },
    'click .btnInvoice': function(event) {
        convertToCustomer('invoicecard');
    },
    'click .btnRefund': function(event) {
        convertToCustomer('refundcard');
    },
    // add to custom field
    "click #edtSaleCustField1": function(e) {
        $("#clickedControl").val("one");
    },
    // add to custom field
    "click #edtSaleCustField2": function(e) {
        $("#clickedControl").val("two");
    },
    // add to custom field
    "click #edtSaleCustField3": function(e) {
        $("#clickedControl").val("three");
    },
    "click .btnSaveAddTask": function(e) {
        playSaveAudio();
        let templateObject = Template.instance();
        setTimeout(function() {
            let task_name = $("#add_task_name").val();
            let task_description = $("#add_task_description").val();
            let subTaskID = $("#txtCrmSubTaskID").val();

            let due_date = $(".crmEditDatepicker").val();
            due_date = due_date ? moment(due_date.split('/')[2] + '-' + due_date.split('/')[1] + '-' + due_date.split('/')[0]).format("YYYY-MM-DD hh:mm:ss") : moment().format("YYYY-MM-DD hh:mm:ss");

            let priority = 0;
            priority = $("#chkPriorityAdd1").prop("checked") ? 1 : $("#chkPriorityAdd2").prop("checked") ? 2 : $("#chkPriorityAdd3").prop("checked") ? 3 : 0;

            if (task_name === "") {
                swal("Task name is not entered!", "", "warning");
                return;
            }
            $(".fullScreenSpin").css("display", "inline-block");
            let projectID = $("#addProjectID").val() ? $("#addProjectID").val() : 11;
            projectID = $("#editProjectID").val() ? $("#editProjectID").val() : projectID;

            let selected_lbls = [];
            $("#addTaskLabelWrapper input:checked").each(function() {
                selected_lbls.push($(this).attr("name"));
            });

            let employeeID = localStorage.getItem("mySessionEmployeeLoggedID");
            let employeeName = localStorage.getItem("mySessionEmployee");

            let assignId = $('#assignedID').val();
            let assignName = $('#add_assigned_name').val();

            let contactID = $('#contactID').val();
            let contactName = $('#add_contact_name').val();
            let contactType = $('#contactType').val();
            let customerID = 0;
            let leadID = 0;
            let supplierID = 0;
            if (contactType == 'Customer') {
                customerID = contactID
            } else if (contactType == 'Lead') {
                leadID = contactID
            } else if (contactType == 'Supplier') {
                supplierID = contactID
            }

            let addObject = {
                TaskName: task_name,
                TaskDescription: task_description,
                Completed: false,
                ProjectID: projectID,
                due_date: due_date,
                priority: priority,
                EnteredByID: parseInt(employeeID),
                EnteredBy: employeeName,
                CustomerID: customerID,
                LeadID: leadID,
                SupplierID: supplierID,
                AssignID: assignId,
                AssignName: assignName,
                ContactName: contactName
            }

            if (subTaskID) {
                var objDetails = {
                    type: "Tprojecttasks",
                    fields: {
                        ID: subTaskID,
                        subtasks: [{
                            type: "Tprojecttask_subtasks",
                            fields: addObject,
                        }]
                    },
                };
            } else {
                var objDetails = {
                    type: "Tprojecttasks",
                    fields: addObject,
                };
            }

            crmService.saveNewTask(objDetails).then(function(res) {
                if (res.fields.ID) {
                    if (moment(due_date).format("YYYY-MM-DD") == moment().format("YYYY-MM-DD")) {}

                    $(".btnAddSubTask").css("display", "block");
                    $(".newTaskRow").css("display", "none");
                    $(".addTaskModal").css("display", "none");

                    $("#chkPriorityAdd0").prop("checked", false);
                    $("#chkPriorityAdd1").prop("checked", false);
                    $("#chkPriorityAdd2").prop("checked", false);
                    $("#chkPriorityAdd3").prop("checked", false);


                    //////////////////////////////
                    // setTimeout(() => {
                    //   templateObject.getAllTaskList();
                    //   templateObject.getTProjectList();
                    // }, 500);
                    $("#newTaskModal").modal("hide");
                    // $("#newProjectTasksModal").modal("hide");
                    if (subTaskID) {
                        crmService.getTaskDetail(subTaskID).then(function(data) {
                            $(".fullScreenSpin").css("display", "none");
                            if (data.fields.ID == subTaskID) {
                                let selected_record = data.fields;

                                if (selected_record.subtasks) {

                                    let newSubTaskID = 0;
                                    if (Array.isArray(selected_record.subtasks)) {
                                        templateObject.subTasks.set(selected_record.subtasks)
                                        // templateObject.initSubtaskDatatable();
                                        newSubTaskID = selected_record.subtasks[selected_record.subtasks.length - 1].fields.ID
                                    }

                                    if (typeof selected_record.subtasks == 'object') {
                                        let arr = [];
                                        arr.push(selected_record.subtasks)
                                        templateObject.subTasks.set(arr)
                                        // templateObject.initSubtaskDatatable();
                                        newSubTaskID = selected_record.subtasks.fields.ID

                                    }

                                    try {
                                        // add labels to New task
                                        // tempcode until api is updated
                                        // current label and task is 1:1 relationship
                                        selected_lbls.forEach((lbl) => {
                                            crmService.updateLabel({
                                                type: "Tprojecttask_TaskLabel",
                                                fields: {
                                                    ID: lbl,
                                                    TaskID: newSubTaskID,
                                                },
                                            }).then(function(data) {
                                                // templateObject.getAllTaskList();
                                                templateObject.getTProjectList();
                                            });
                                        });
                                        // tempcode until api is updated
                                    } catch (error) {
                                        swal(error, "", "error");
                                    }
                                } else {
                                    let sutTaskTable = $('#tblSubtaskDatatable').DataTable();
                                    sutTaskTable.clear().draw();
                                }

                            }

                        }).catch(function(err) {
                            $(".fullScreenSpin").css("display", "none");
                            swal(err, "", "error");
                            return;
                        });
                    }

                }

                // templateObject.getAllTaskList();
                templateObject.getTProjectList();

                $(".btnRefresh").addClass('btnSearchAlert');

                $(".fullScreenSpin").css("display", "none");

                // $("#add_task_name").val("");
                // $("#add_task_description").val("");

                // $('#assignedID').val("");
                // $('#add_assigned_name').val("");

                // $('#contactID').val("");
                // $('#add_contact_name').val("");

            }).catch(function(err) {
                swal({
                    title: "Oooops...",
                    text: err,
                    type: "error",
                    showCancelButton: false,
                    confirmButtonText: "Try Again",
                }).then((result) => {});
                $(".fullScreenSpin").css("display", "none");
            });
        }, delayTimeAfterSound);
    },
    "click #btnAddLine, click #btnAddLineTask": function(e) {
        let tokenid = "random";
        let currentDate = new Date();
        let completeDate = new Date();
        currentDate = moment(currentDate).subtract(-1, "days").format("DD/MM/YYYY");
        completeDate = moment(completeDate).subtract(-3, "days").format("DD/MM/YYYY");
        var rowData = `<tr class="dnd-moved" id="${tokenid}">
            <td class="colTaskId hiddenColumn dtr-control" tabindex="0">
                ${tokenid}
            </td>
            <td class="colDate">${currentDate}</td>
            <td class="colType">Task</td>
            <td class="colTaskName" contenteditable="true"></td>
            <td class="colTaskDesc" contenteditable="true"></td>
            <td class="colCompletedBy" style="padding:5px!important">
                <div class="input-group date" style="width: 160px;">
                    <input type="text" class="form-control" id="completeDate" name="completeDate" >
                    <div class="input-group-addon">
                        <span class="glyphicon glyphicon-th"></span>
                    </div>
                </div>
            </td>
            <td class="colCompleteTask" align="right">
                <span class="btnRemoveLine"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0" style="margin-top:0!important"><i class="fa fa-remove"></i></button></span>
            </td>
            <td class="colStatus" >

            </td>
        </tr>`;

        $("#tblLeadCrmListWithDate tbody").prepend(rowData);

        $("#completeDate").datepicker({
            showOn: "button",
            buttonText: "Show Date",
            buttonImageOnly: true,
            buttonImage: "/img/imgCal2.png",
            dateFormat: "dd/mm/yy",
            showOtherMonths: true,
            selectOtherMonths: true,
            changeMonth: true,
            changeYear: true,
            yearRange: "-90:+10",
            onSelect: function(formated, dates) {
            },
            onChangeMonthYear: function(year, month, inst) {
                // Set date to picker
                $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
            }
        });
        $("#completeDate").datepicker("setDate", completeDate);

        $(".btnAddLineGroup button").attr("disabled", true);
        $(".btnTask").attr("disabled", true);

        $("#"+tokenid+" .colTaskName").focus();

        $("#frmEditTaskModal")[0].reset();
        $("#txtCrmTaskID").val("");
        $("#txtCrmProjectID").val("");
        $("#txtCrmSubTaskID").val("");
        $("#addProjectID").val("");
        $("#contactID").val("");
        $('#assignedID').val("");

        const url = FlowRouter.current().path;
        const getemp_id = url.split('?id=');
        let currentEmployee = getemp_id[getemp_id.length - 1];
        let TCustomerID = 0;
        if (getemp_id[1]) {
            TCustomerID = parseInt(currentEmployee);
        }

        $("#contactID").val(TCustomerID);
        $('#contactType').val('Lead')
        $('#crmEditSelectLeadList').val($('#edtLeadEmployeeName').val());
        $('#contactEmailClient').val($('#edtLeadEmail').val());
        $('#contactPhoneClient').val($('#edtLeadPhone').val());
        $('#taskmodalDuedate').val(moment().format("DD/MM/YYYY"));
    },
    "click .btnRemoveLine": function(event) {
        var targetID = $(event.target).closest("tr").attr("id");
        $(event.target).closest("tr").remove();
        $(".btnAddLineGroup button").attr("disabled", false);
        $(".btnTask").attr("disabled", false);
        event.preventDefault();
    },
});

Template.leadscard.helpers({
    record: () => {
        let temp = Template.instance().records.get();
        if (temp && temp.mobile) {
            temp.mobile = temp.mobile.replace('+61', '0')
        }
        return temp;
    },
    countryList: () => {
        return Template.instance().countryData.get();
    },
    leadrecords: () => {
        return Template.instance().leadrecords.get().sort(function(a, b) {
            if (a.employeeName === 'NA') {
                return 1;
            } else if (b.employeeName === 'NA') {
                return -1;
            }
            return (a.employeeName.toUpperCase() > b.employeeName.toUpperCase()) ? 1 : -1;
        });
    },
    crmRecords: () => {
        return Template.instance().crmRecords.get().sort(function(a, b) {
            if (a.id === 'NA') {
                return 1;
            } else if (b.id === 'NA') {
                return -1;
            }
            return (a.id > b.id) ? 1 : -1;
        });
    },
    crmTableheaderRecords: () => {
        return Template.instance().crmTableheaderRecords.get();
    },
    currentdate: () => {
        const currentDate = new Date();
        return moment(currentDate).format("DD/MM/YYYY");
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
    correspondences: () => {
        return Template.instance().correspondences.get();
    },
    currentAttachLineID: () => {
        return Template.instance().currentAttachLineID.get();
    },
    contactCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: localStorage.getItem('mycloudLogonID'), PrefName: 'leadscard' });
    },
    isSameAddress: () => {
        return Template.instance().isSameAddress.get();
    },
    isMobileDevices: () => {
        var isMobile = false; //initiate as false
        // device detection
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
            isMobile = true;
        }

        return isMobile;
    },
    setLeadStatus: (status) => status || 'Unqualified',
    setLeadSource: (source) => source || 'Unknown',
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    apiFunction:function() {
        let crmService = new CRMService();
        return crmService.getAllTasksList;
    },

    searchAPI: function() {
        let crmService = new CRMService();
        return crmService.getAllTasksByName;
    },

    service: ()=>{
        let crmService = new CRMService();
        return crmService;
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
        return ['dateFrom', 'dateTo', 'ignoredate', 'limitCount', 'limitFrom', 'deleteFilter'];
    },
});

function getPreviewFile(uploadedFiles, attachmentID) {
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
    previewFile.image = type.split('/')[0] === 'image';
    return previewFile;
}

function getCheckPrefDetails() {
    const getcurrentCloudDetails = CloudUser.findOne({
        _id: localStorage.getItem('mycloudLogonID'),
        clouddatabaseID: localStorage.getItem('mycloudLogonDBID')
    });
    let checkPrefDetails = null;
    if (getcurrentCloudDetails) {
        if (getcurrentCloudDetails._id.length > 0) {
            const clientID = getcurrentCloudDetails._id;
            const clientUsername = getcurrentCloudDetails.cloudUsername;
            const clientEmail = getcurrentCloudDetails.cloudEmail;
            checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'leadscard' });
        }
    }
    return checkPrefDetails;
}

function convertToCustomer(nav) {
    $('.fullScreenSpin').css('display', 'inline-block');
    const templateObject = Template.instance();
    let contactService = new ContactService();
    let currentId = FlowRouter.current().queryParams;
    let objDetails = '';
    let leadStatus = nav === 'quotecard' ? 'Quoted' : nav === 'invoicecard' ? 'Invoiced' : '';
    if (!isNaN(currentId.id)) {
        let currentLead = parseInt(currentId.id);
        objDetails = {
            type: "TProspectEx",
            fields: {
                ID: currentLead,
                IsCustomer: true
            }
        };
        if (leadStatus) {
            objDetails.fields.Status = leadStatus;
        }
        contactService.saveProspectEx(objDetails).then(async function(data) {
            let customerID = data.fields.ID;
            if (customerID) {
                const dataReload = await sideBarService.getAllLeads(initialBaseDataLoad, 0);
                await addVS1Data('TProspectEx', JSON.stringify(dataReload));
            }
            await templateObject.saveCustomerDetails();
            $('.fullScreenSpin').css('display', 'none');
            FlowRouter.go('/' + nav + '?customerid=' + customerID);
        }).catch(function(err) {
            swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {} else if (result.dismiss === 'cancel') {

                }
            });
            $('.fullScreenSpin').css('display', 'none');
        });
    } else {
        $('.fullScreenSpin').css('display', 'none');
    }
}

function removeAttachment(suffix, event) {
    let tempObj = Template.instance();
    let attachmentID = parseInt(event.target.id.split('remove-attachment' + suffix + '-')[1]);
    if (tempObj.$("#confirm-action" + suffix + "-" + attachmentID).length) {
        tempObj.$("#confirm-action" + suffix + "-" + attachmentID).remove();
    } else {
        let actionElement = '<div class="confirm-action' + suffix + '" id="confirm-action' + suffix + '-' + attachmentID + '"><a class="confirm-delete-attachment' + suffix + ' btn btn-default" id="delete-attachment' + suffix + '-' + attachmentID + '">' +
            'Delete</a><button class="save-to-library' + suffix + ' btn btn-default">Remove & save to File Library</button></div>';
        tempObj.$('#attachment-name' + suffix + '-' + attachmentID).append(actionElement);
    }
    tempObj.$("#new-attachment2-tooltip" + suffix).show();
}

function openEditTaskModals(id, type) {
    const crmService = new CRMService();
    const contactService = new ContactService();
    // let catg = e.target.dataset.catg;
    let templateObject = Template.instance();
    // $("#editProjectID").val("");

    $("#txtCrmSubTaskID").val(id);

    $(".fullScreenSpin").css("display", "inline-block");
    // get selected task detail via api
    getVS1Data("TCRMTaskList").then(async function(dataObject) {
        if (dataObject.length == 0) {
            // crmService.getAllTasksByContactName().then(async function(data) {
            //     if (data.tprojecttasks.length > 0) {
            //         addVS1Data("TCRMTaskList", JSON.stringify(data));
            //         templateObject.taskrecords.set(data.tprojecttasks);
            //     }
            // }).catch(function(err) {
            // })
        } else {
            let data = JSON.parse(dataObject[0].data);
            let taskrecords = data.tprojecttasks;
            for(var i=0; i<taskrecords.length; i++){
                if(taskrecords[i].fields.ID == id){
                    $(".fullScreenSpin").css("display", "none");
                    let selected_record = taskrecords[i].fields;

                    $("#txtCrmTaskID").val(selected_record.ID);
                    $("#txtCrmProjectID").val(selected_record.ProjectID);
                    $("#txtCommentsDescription").val("");

                    $(".editTaskDetailName").val(selected_record.TaskName);
                    $(".editTaskDetailDescription").val(selected_record.TaskDescription);
                    // tempcode check if AssignedName is set in selected_record
                    let employeeName = selected_record.AssignName ? selected_record.AssignName : localStorage.getItem("mySessionEmployee");
                    let assignId = selected_record.AssignID ? selected_record.AssignID : localStorage.getItem("mySessionEmployeeLoggedID");
                    $('#crmEditSelectEmployeeList').val(employeeName);
                    $('#assignedID').val(assignId)
                    contactService.getOneEmployeeDataEx(assignId).then(function(empDetailInfo) {
                        $('#contactEmailUser').val(empDetailInfo.fields.Email);
                        $('#contactPhoneUser').val(empDetailInfo.fields.Phone);
                    }).catch(function(err) {});

                    // $('#contactEmailClient').val(selected_record.ClientEmail);
                    // $('#contactPhoneClient').val(selected_record.ClientPhone);

                    $("#contactEmailClient").val(selected_record.ContactEmail);
                    $("#contactPhoneClient").val(selected_record.ContactPhone);
                    $("#contactEmailUser").val(selected_record.AssignEmail);
                    $("#contactPhoneUser").val(selected_record.AssignPhone);

                    let colClientName = selected_record.ContactName;
                    $('#crmEditSelectLeadList').val(colClientName);
                    if (selected_record.CustomerID) {
                        $('#contactID').val(selected_record.CustomerID)
                        $('#contactType').val('Customer')

                        if (selected_record.ContactEmail == "" && selected_record.ContactPhone == "") {
                            contactService.getOneEmployeeDataEx(selected_record.CustomerID).then(function(empDetailInfo) {
                                $('#contactEmailClient').val(empDetailInfo.fields.Email);
                                $('#contactPhoneClient').val(empDetailInfo.fields.Phone);
                            }).catch(function(err) {

                            });
                        }
                    } else if (selected_record.LeadID) {
                        $('#contactID').val(selected_record.LeadID)
                        $('#contactType').val('Lead')

                        if (selected_record.ContactEmail == "" && selected_record.ContactPhone == "") {
                            contactService.getOneLeadDataEx(selected_record.LeadID).then(function(empDetailInfo) {
                                $('#contactEmailClient').val(empDetailInfo.fields.Email);
                                $('#contactPhoneClient').val(empDetailInfo.fields.Phone);
                            }).catch(function(err) {

                            });
                        }
                    } else {
                        $('#contactID').val(selected_record.SupplierID)
                        $('#contactType').val('Supplier')
                        if (selected_record.SupplierID) {
                            if (selected_record.ContactEmail == "" && selected_record.ContactPhone == "") {
                                contactService.getOneSupplierDataEx(selected_record.SupplierID).then(function(empDetailInfo) {
                                    $('#contactEmailClient').val(empDetailInfo.fields.Email);
                                    $('#contactPhoneClient').val(empDetailInfo.fields.Phone);
                                }).catch(function(err) {

                                });
                            }
                        }
                    }

                    let projectName = selected_record.ProjectName == "Default" ? "All Tasks" : selected_record.ProjectName;

                    if (selected_record.Completed) {
                        $('#chkComplete_taskEdit').prop("checked", true);
                    } else {
                        $('#chkComplete_taskEdit').prop("checked", false);
                    }

                    let all_projects = templateObject.all_projects.get();
                    let projectColorStyle = '';
                    if (selected_record.ProjectID != 0) {
                        let projects = all_projects.filter(project => project.fields.ID == selected_record.ProjectID);
                        if (projects.length && projects[0].fields.ProjectColour) {
                            projectColorStyle = 'color: ' + projects[0].fields.ProjectColour + ' !important';
                        }
                    }

                    $("#addProjectID").val(selected_record.ProjectID);
                    $("#taskDetailModalCategoryLabel").val(projectName);

                    $("#taskmodalNameLabel").html(selected_record.TaskName);
                    $(".activityAdded").html("Added on " + moment(selected_record.MsTimeStamp).format("MMM D h:mm A"));
                    // let due_date = selected_record.due_date ? moment(selected_record.due_date).format("D MMM") : "No Date";
                    let due_date = selected_record.due_date ? moment(selected_record.due_date).format("DD/MM/YYYY") : "";


                    let todayDate = moment().format("ddd");
                    let tomorrowDay = moment().add(1, "day").format("ddd");
                    let nextMonday = moment(moment()).day(1 + 7).format("ddd MMM D");
                    let date_component = due_date;

                    $("#taskmodalDuedate").val(date_component);
                    $("#taskmodalDescription").html(selected_record.TaskDescription);

                    $("#chkComplete_taskEditLabel").removeClass("task_priority_0");
                    $("#chkComplete_taskEditLabel").removeClass("task_priority_1");
                    $("#chkComplete_taskEditLabel").removeClass("task_priority_2");
                    $("#chkComplete_taskEditLabel").removeClass("task_priority_3");
                    $("#chkComplete_taskEditLabel").addClass("task_priority_" + selected_record.priority);

                    let taskmodalLabels = "";
                    $(".chkDetailLabel").prop("checked", false);
                    if (selected_record.TaskLabel) {
                        if (selected_record.TaskLabel.fields != undefined) {
                            taskmodalLabels =
                                `<span class="taskTag"><i class="fas fa-tag" style="color:${selected_record.TaskLabel.fields.Color};"></i><a class="taganchor filterByLabel" href="" data-id="${selected_record.TaskLabel.fields.ID}">` +
                                selected_record.TaskLabel.fields.TaskLabelName +
                                "</a></span>";
                            $("#detail_label_" + selected_record.TaskLabel.fields.ID).prop(
                                "checked",
                                true
                            );
                            $(".taskModalActionLableDropdown").css("color", selected_record.TaskLabel.fields.Color);
                        } else {
                            selected_record.TaskLabel.forEach((lbl) => {
                                taskmodalLabels +=
                                    `<span class="taskTag"><i class="fas fa-tag" style="color:${lbl.fields.Color};"></i><a class="taganchor filterByLabel" href="" data-id="${lbl.fields.ID}">` +
                                    lbl.fields.TaskLabelName +
                                    "</a></span> ";
                                $("#detail_label_" + lbl.fields.ID).prop("checked", true);
                                $(".taskModalActionLableDropdown").css("color", lbl.fields.Color);
                            });
                            taskmodalLabels = taskmodalLabels.slice(0, -2);
                        }
                    }
                    else{
                        $(".taskModalActionLableDropdown").css("color", "#858796");
                    }
                    $("#taskmodalLabels").html(taskmodalLabels);
                    let subtasks = "";
                    if (selected_record.subtasks) {
                        if (Array.isArray(selected_record.subtasks)) {
                            templateObject.subTasks.set(selected_record.subtasks)
                            // templateObject.initSubtaskDatatable();
                        }

                        if (typeof selected_record.subtasks == 'object') {
                            let arr = [];
                            arr.push(selected_record.subtasks)
                            templateObject.subTasks.set(arr)
                            // templateObject.initSubtaskDatatable();
                        }
                    } else {
                        let sutTaskTable = $('#tblSubtaskDatatable').DataTable();
                        sutTaskTable.clear().draw();
                    }

                    let comments = "";
                    if (selected_record.comments) {
                        if (selected_record.comments.fields != undefined) {
                            let comment = selected_record.comments.fields;
                            let comment_date = comment.CommentsDate ? moment(comment.CommentsDate).format("MMM D h:mm A") : "";
                            let commentUserArry = comment.EnteredBy.toUpperCase().split(" ");
                            let commentUser = commentUserArry.length > 1 ? commentUserArry[0].charAt(0) + commentUserArry[1].charAt(0) : commentUserArry[0].charAt(0);
                            comments = `
                        <div class="col-12 taskComment" style="padding: 16px 32px;" id="taskComment_${comment.ID}">
                        <div class="row commentRow">
                            <div class="col-1">
                            <div class="commentUser">${commentUser}</div>
                            </div>
                            <div class="col-11" style="padding-top:4px; padding-left: 24px;">
                            <div class="row">
                                <div>
                                <span class="commenterName">${comment.EnteredBy}</span>
                                <span class="commentDateTime">${comment_date}</span>
                                </div>
                            </div>
                            <div class="row">
                                <span class="commentText">${comment.CommentsDescription}</span>
                            </div>
                            </div>
                        </div>
                        </div>
                        `;
                        } else {
                            selected_record.comments.forEach((item) => {
                                let comment = item.fields;
                                let comment_date = comment.CommentsDate ? moment(comment.CommentsDate).format("MMM D h:mm A") : "";
                                let commentUserArry = comment.EnteredBy.toUpperCase().split(" ");
                                let commentUser = commentUserArry.length > 1 ? commentUserArry[0].charAt(0) + commentUserArry[1].charAt(0) : commentUserArry[0].charAt(0);
                                comments += `
                        <div class="col-12 taskComment" style="padding: 16px 32px;" id="taskComment_${comment.ID}">
                            <div class="row commentRow">
                            <div class="col-1">
                                <div class="commentUser">${commentUser}</div>
                            </div>
                            <div class="col-11" style="padding-top:4px; padding-left: 24px;">
                                <div class="row">
                                <div>
                                    <span class="commenterName">${comment.EnteredBy}</span>
                                    <span class="commentDateTime">${comment_date}</span>
                                </div>
                                </div>
                                <div class="row">
                                <span class="commentText">${comment.CommentsDescription}</span>
                                </div>
                            </div>
                            </div>
                        </div>
                        `;
                            });
                        }
                    }
                    $(".task-comment-row").html(comments);

                    let activities = "";
                    if (selected_record.activity) {
                        if (selected_record.activity.fields != undefined) {
                            let activity = selected_record.activity.fields;
                            let day = "";
                            if (moment().format("YYYY-MM-DD") == moment(activity.ActivityDateStartd).format("YYYY-MM-DD")) {
                                day = " ‧ Today";
                            } else if (moment().add(-1, "day").format("YYYY-MM-DD") == moment(activity.ActivityDateStartd).format("YYYY-MM-DD")) {
                                day = " . Yesterday";
                            }
                            let activityDate = moment(activity.ActivityDateStartd).format("MMM D") + day + " . " + moment(activity.ActivityDateStartd).format("ddd");

                            let commentUserArry = activity.EnteredBy.toUpperCase().split(" ");
                            let commentUser = commentUserArry.length > 1 ? commentUserArry[0].charAt(0) + commentUserArry[1].charAt(0) : commentUserArry[0].charAt(0);

                            activities = `
                        <div class="row" style="padding: 16px;">
                        <div class="col-12">
                            <span class="activityDate">${activityDate}</span>
                        </div>
                        <hr style="width: 100%; margin: 8px 16px;" />
                        <div class="col-1">
                            <div class="commentUser">${commentUser}</div>
                        </div>
                        <div class="col-11" style="padding-top: 4px; padding-left: 24px;">
                            <div class="row">
                            <span class="activityName">${activity.EnteredBy
                            } </span> <span class="activityAction">${activity.ActivityName
                            } </span>
                            </div>
                            <div class="row">
                            <span class="activityComment">${activity.ActivityDescription
                            }</span>
                            </div>
                            <div class="row">
                            <span class="activityTime">${moment(
                                activity.ActivityDateStartd
                            ).format("h:mm A")}</span>
                            </div>
                        </div>
                        <hr style="width: 100%; margin: 16px;" />
                        </div>
                        `;
                        } else {
                            selected_record.activity.forEach((item) => {
                                let activity = item.fields;
                                let day = "";
                                if (moment().format("YYYY-MM-DD") == moment(activity.ActivityDateStartd).format("YYYY-MM-DD")) {
                                    day = " ‧ Today";
                                } else if (moment().add(-1, "day").format("YYYY-MM-DD") == moment(activity.ActivityDateStartd).format("YYYY-MM-DD")) {
                                    day = " . Yesterday";
                                }
                                let activityDate = moment(activity.ActivityDateStartd).format("MMM D") + day + " . " + moment(activity.ActivityDateStartd).format("ddd");

                                let commentUserArry = activity.EnteredBy.toUpperCase().split(" ");
                                let commentUser = commentUserArry.length > 1 ? commentUserArry[0].charAt(0) + commentUserArry[1].charAt(0) : commentUserArry[0].charAt(0);

                                activities = `
                        <div class="row" style="padding: 16px;">
                            <div class="col-12">
                            <span class="activityDate">${activityDate}</span>
                            </div>
                            <hr style="width: 100%; margin: 8px 16px;" />
                            <div class="col-1">
                            <div class="commentUser">${commentUser}</div>
                            </div>
                            <div class="col-11" style="padding-top: 4px; padding-left: 24px;">
                            <div class="row">
                                <span class="activityName">${activity.EnteredBy
                                } </span> <span class="activityAction">${activity.ActivityName
                                } </span>
                            </div>
                            <div class="row">
                                <span class="activityComment">${activity.ActivityDescription
                                }</span>
                            </div>
                            <div class="row">
                                <span class="activityTime">${moment(
                                    activity.ActivityDateStartd
                                ).format("h:mm A")}</span>
                            </div>
                            </div>
                            <hr style="width: 100%; margin: 16px;" />
                        </div>
                        `;
                            });
                        }
                    }
                    $(".task-activity-row").html(activities);

                    if (type == "comment") {
                        $("#nav-comments-tab").click();
                    } else {
                        $("#nav-subtasks-tab").click();
                    }

                    $("#chkPriority0").prop("checked", false);
                    $("#chkPriority1").prop("checked", false);
                    $("#chkPriority2").prop("checked", false);
                    $("#chkPriority3").prop("checked", false);
                    $("#chkPriority" + selected_record.priority).prop("checked", true);

                    $(".taskModalActionFlagDropdown").removeClass(
                        "task_modal_priority_3"
                    );
                    $(".taskModalActionFlagDropdown").removeClass(
                        "task_modal_priority_2"
                    );
                    $(".taskModalActionFlagDropdown").removeClass(
                        "task_modal_priority_1"
                    );
                    $(".taskModalActionFlagDropdown").removeClass(
                        "task_modal_priority_0"
                    );
                    $(".taskModalActionFlagDropdown").addClass(
                        "task_modal_priority_" + selected_record.priority
                    );

                    $("#taskDetailModal").modal("toggle");

                    $(".crmDatepicker").datepicker({
                        showOn: "button",
                        buttonText: "Show Date",
                        buttonImageOnly: true,
                        buttonImage: "/img/imgCal2.png",
                        constrainInput: false,
                        dateFormat: "dd/mm/yy",
                        showOtherMonths: true,
                        selectOtherMonths: true,
                        changeMonth: true,
                        changeYear: true,
                        yearRange: "-90:+10",
                        onSelect: function(dateText, inst) {
                            let task_id = inst.id;
                            $(".crmDatepicker").val(dateText);

                            templateObject.updateTaskSchedule(task_id, new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay));
                        },
                        onChangeMonthYear: function(year, month, inst) {
                            // Set date to picker
                            $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
                        }
                    });
                    let currentDate = selected_record.due_date ? new Date(selected_record.due_date) : new Date();
                    let begunDate = moment(currentDate).format("DD/MM/YYYY");
                    $(".crmDatepicker").val(begunDate);

                }
                // else {
                //     swal("Cannot edit this task", "", "warning");
                //     return;
                // }
            }
        }
    }).catch(function(err) {
        // crmService.getAllTasksByContactName().then(async function(data) {
        //     if (data.tprojecttasks.length > 0) {
        //         addVS1Data("TCRMTaskList", JSON.stringify(data));
        //         templateObject.taskrecords.set(data.tprojecttasks);
        //     }
        // }).catch(function(err) {
        // })
    });
}
