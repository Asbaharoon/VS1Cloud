
import '../../lib/global/indexdbstorage.js';
import { Template } from 'meteor/templating';
import './vs1___dropdown.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { cloneDeep } from "lodash";
import 'datatables.net';
import 'datatables.net-buttons';
import 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.flash';
import 'datatables.net-buttons/js/buttons.print';
import 'jszip';

Template.vs1___dropdown.onCreated(function(){
    let templateObject = Template.instance();
    templateObject.edtParam = new ReactiveVar();
    templateObject.targetTemp = new ReactiveVar();
    templateObject.listTemp = new ReactiveVar();
    templateObject.targetEle = new ReactiveVar();

    let keyword = templateObject.data.data
    let idVal = templateObject.data.value
    let email = templateObject.data.email
    let listtemplatename = templateObject.data.list_template_name;
    if(listtemplatename) {
        templateObject.listTemp.set(listtemplatename)
    }
    let obj = {name: keyword, id: idVal, email: email }
    templateObject.edtParam.set(obj);
    let target = templateObject.data.target_template_id;
    templateObject.targetTemp.set(target);
})

Template.vs1___dropdown.onRendered(async function(){
    let templateObject = Template.instance();
    let id= templateObject.data.id;
    if(templateObject.data.custid){
        id = id + "_" + templateObject.data.custid;
    }
    let popupid = templateObject.data.modalId;

    async function setEditableSelect() {
        // $('#'+id).editableSelect();
        $('.'+templateObject.data.id).each(function(i, obj) {
            $(obj).editableSelect();
        })
    }
    await setEditableSelect();
        if(templateObject.data.data && templateObject.data.data !="") {
          if(templateObject.data.custid) {
              $('#'+id+"[custid='"+templateObject.data.custid+"']").val(templateObject.data.data);
          }else{
             $('#'+id).val(templateObject.data.data);
          }
        }
        if(templateObject.data.email) {
            let label = templateObject.data.label;
            let clientEmailInput = 'edtCustomerEmail';
            if(label == 'Supplier') {
                clientEmailInput = 'edtSupplierEmail';
            }
            let email = templateObject.data.email;
            $('#'+clientEmailInput).val(email)

        }
    // $('#'+id).editableSelect().on('click', function(event) {

    $.fn.closest_descendent = function(filter) {
        var $found = $(),
            $currentSet = this; // Current place
        while ($currentSet.length) {
            $found = $currentSet.filter(filter);
            if ($found.length) break;  // At least one match: break loop
            // Get all children of the current set
            $currentSet = $currentSet.children();
        }
        return $found.first(); // Return first match of the collection
    }
    $(document).on('click', '#'+id, function(event, li) {
        event.preventDefault();
        event.stopPropagation();
        templateObject.targetEle.set($(event.target));
        var $earch = $(this);
        var offset = $earch.offset();
        // $("#"+popupid).val("");
        let parent = $(event.target).parent();
        
        let popupmodal = $(parent).find("> .vs1_dropdown_modal");
        
        let selectTableID = $(parent).find("> .vs1_dropdown_modal table").attr('id');
        let tableFilter = $(popupmodal).closest_descendent('.dataTables_filter');
        let searchInput = $(tableFilter).find('label > input');
        
        if (event.pageX > offset.left + $earch.width() - 8) {
            // X button 16px wide?
            templateObject.targetTemp.set('');
            $(popupmodal).modal('show');
            // setTimeout(()=>{
            //     if(searchInput && searchInput.length > 0) {
            //         searchInput.trigger('focus')
            //         searchInput[0].trigger('focus')
            //         searchInput[0].focus()
            //     }
            //     // searchInput.focus()
            // }, 1000)
            setTimeout(function () {
                $(`#${selectTableID}_filter .form-control-sm`).get(0).focus();
            }, 500)

        } else {
            // setTimeout(()=>{
                let value = event.target.value;
                if (value.replace(/\s/g, '') == '') {
                    templateObject.targetTemp.set('');
                    $(popupmodal).modal('show');
                   
                    setTimeout(function () {
                        $(`#${selectTableID}_filter .form-control-sm`).get(0).focus();
                    }, 500);
                } else {
                    if(templateObject.data.is_editable == true) {
                        templateObject.targetTemp.set('');
                        let params = cloneDeep(templateObject.edtParam.get());
                        // if(!params.name || params.name == '' ) {
                            params.name = value;
                        // }
                        templateObject.edtParam.set(params)
                        
                        if(templateObject.edtParam.get().name&& templateObject.edtParam.get().name != '') {
                            setTimeout(() => {
                                templateObject.targetTemp.set(templateObject.data.target_template_id);
                                setTimeout(()=>{
                                    let edtModalId = templateObject.data.target_modal_id;
                                    let edtmodal = $(parent).find('> .'+ edtModalId);
                                    $(edtmodal).modal('show');
                                }, 1000)
                            }, 3000);
                        }
                    } else {
                        $(popupmodal).modal('show');
                        setTimeout(function () {
                            $(`#${selectTableID}_filter .form-control-sm`).get(0).focus();
                        }, 500);
                        // setTimeout(()=>{
                        //     if(searchInput && searchInput.length > 0) {
                        //     searchInput.trigger('focus')
                        //     searchInput[0].trigger('focus')
                        //     searchInput[0].focus()
                        //     }
                        //     // $(searchInput).focus()
                        // }, 1000)
                    }
                }
            // }, 1000)
        }
    })

    $(document).on('change', '#'+id, function(event, li) {
        event.preventDefault();
        event.stopPropagation();
       
        let value = event.target.value;

        if(templateObject.data.is_editable == true) {
            let params = cloneDeep(templateObject.edtParam.get());
                params.name = value;
            templateObject.edtParam.set(params)
        } 
    })
})

Template.vs1___dropdown.helpers({
    edtTemplateParams: () => {
        return Template.instance().edtParam.get();
    },
    targetTemp: () => {
        return Template.instance().targetTemp.get();
    },
    listTemp: ()=>{
        let templateObject = Template.instance();
        let listempname = templateObject.data.list_template_name;
        return listempname
    },
    listparam:()=>{
        //let obj = {custid: Template.instance().data.custid}
        //let obj = {custid: Template.instance().data.custid, typefilter: Template.instance().data.typefilter}
        let obj = {custid: Template.instance().data.custid, typefilter: Template.instance().data.typefilter, sn: Template.instance().data.sn, custid2: Template.instance().data.custid2} //sn for Stefan
        return obj
    }
})


Template.vs1___dropdown.events({
    'click .vs1_dropdown_modal tbody tr': function(event) {
        let templateObject = Template.instance();
        let id = templateObject.data.id;
        let colName = templateObject.data.colNameForValue;
        let modalId = templateObject.data.modalId;
        let modal = $(event.target).closest('.modal.fade.show')
        let label = templateObject.data.label;
        let value = $(event.target).closest('tr').find('.'+colName).text();

        let objectId = $(event.target).closest('tr').find('.colID')?.text();

        let email = $(event.target).closest('tr').find('.colEmail')?.text();

        templateObject.edtParam.set({name: value, id: objectId, email: email, isModal: true })

        templateObject.targetTemp.set(templateObject.data.target_template_id)

        // $('#'+id).val(value)
        let target = templateObject.targetEle.get();
        $(target).val(value)
        $(target).trigger("change")
        $(modal).modal('hide');
        // $('.modal-backdrop').css('display','none');
        // $(modal).find('> .modal-content > .modal-body >.table-responsive >.datatables-wrapper .dataTables_filter input').val('');
        // setTimeout(function() {
        //     $(modal).find('> .modal-content > .modal-body >.table-responsive >.datatables-wrapper .btnRefreshTable').trigger('click')

        // }, 100)

    },

})
