import { ReactiveVar } from "meteor/reactive-var";
import {ProductService} from '../product/product-service';
import { SideBarService } from "./sidebar-service";
import 'jquery-editable-select';
import { UtilityService } from "../utility-service";
import { Template } from 'meteor/templating';
import '../manufacture/bom_setup_temp.html';
import '../manufacture/bom_setup.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

//product name, process name, product sales description, qty in stock, subs,
let productService =  new ProductService();
let sideBarService = new SideBarService();
let utilityService = new UtilityService();

Template.bom_template.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.bomProducts = new ReactiveVar([]);
    templateObject.initialRecord = new ReactiveVar();
    templateObject.selectedProcessField = new ReactiveVar();
    templateObject.selectedProductField = new ReactiveVar();
    templateObject.isMobileDevices = new ReactiveVar(false);
    templateObject.showSubButton = new ReactiveVar(true);
    templateObject.attachmentModalHtml = new ReactiveVar('');
    templateObject.selectedAttachedField = new ReactiveVar();
    templateObject.selectedRawHourField = new ReactiveVar();   


})


Template.bom_template.onRendered(async function() {
    const templateObject = Template.instance();
 
    $('#rawAttachmentModal').empty();
    
    templateObject.getAllBOMProducts = async() => {
        return new Promise(async(resolve, reject)=> {
            getVS1Data('TProcTree').then(function(dataObject) {
                if(dataObject.length == 0) {
                    productService.getAllBOMProducts(initialBaseDataLoad, 0).then(function(data) {
                        templateObject.bomProducts.set(data.tproctree);
                        resolve();
                    })
                }else {
                    let data = JSON.parse(dataObject[0].data);
                    templateObject.bomProducts.set(data.tproctree);
                    resolve();
                }
            }).catch(function(e){
                productService.getAllBOMProducts(initialBaseDataLoad, 0).then(function(data) {
                    templateObject.bomProducts.set(data.tproctree);
                    resolve();
                })
            })
        })
    }
    await templateObject.getAllBOMProducts();

    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))){
        templateObject.isMobileDevices.set(true);
    }

    let modalHtml = "<div class='modal-dialog modal-dialog-centered' role='document'>" +
                        "<div class='modal-content'>" +
                            "<div class='modal-header'>" +
                                "<h4>Upload Attachments</h4><button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>×</span></button>" +
                            "</div>" +
                            "<div class='modal-body' style='padding: 0px;'>" +
                                "<div class='divTable file-display'>" +
                                    "<div class='col inboxcol1'>" +
                                        "<img src='/icons/nofiles_icon.jpg' class=' style='width:100%;'>" +
                                    "</div>" +
                                    "<div class='col inboxcol2' style='text-align: center;'>" +
                                        "<div>Upload files or add files from the file library.</div>"
                if(templateObject.isMobileDevices.get() == true) {
                    modalHtml = modalHtml +"<div>Capture copies of receipt's or take photo's of completed jobs.</div>"
                }


                modalHtml = modalHtml + "<p style='color: #ababab;'>Only users with access to your company can view these files</p>" +
                        "</div>" +
                    "</div>" +
                "</div>"+
                "<div class='modal-footer'>";
                if(templateObject.isMobileDevices.get() == true) {
                    modalHtml = modalHtml +"<input type='file' class='img-attachment-upload' id='img-attachment-upload' style='display:none' accept='image/*' capture='camera'>" +
                    "<button class='btn btn-primary btnUploadFile img_new_attachment_btn' type='button'><i class='fas fa-camera' style='margin-right: 5px;'></i>Capture</button>" +

                    "<input type='file' class='attachment-upload' id='attachment-upload' style='display:none' multiple accept='.jpg,.gif,.png'>"
                }else {
                    modalHtml = modalHtml + "<input type='file' class='attachment-upload' id='attachment-upload' style='display:none' multiple accept='.jpg,.gif,.png,.bmp,.tiff,.pdf,.doc,.docx,.xls,.xlsx,.ppt," +
                    ".pptx,.odf,.csv,.txt,.rtf,.eml,.msg,.ods,.odt,.keynote,.key,.pages-tef," +
                    ".pages,.numbers-tef,.numbers,.zip,.rar,.zipx,.xzip,.7z,image/jpeg," +
                    "image/gif,image/png,image/bmp,image/tiff,application/pdf," +
                    "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document," +
                    "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet," +
                    "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation," +
                    "application/vnd.oasis.opendocument.formula,text/csv,text/plain,text/rtf,message/rfc822," +
                    "application/vnd.ms-outlook,application/vnd.oasis.opendocument.spreadsheet," +
                    "application/vnd.oasis.opendocument.text,application/x-iwork-keynote-sffkey," +
                    "application/vnd.apple.keynote,application/x-iwork-pages-sffpages," +
                    "application/vnd.apple.pages,application/x-iwork-numbers-sffnumbers," +
                    "application/vnd.apple.numbers,application/zip,application/rar," +
                    "application/x-zip-compressed,application/x-zip,application/x-7z-compressed'>"
                }
                modalHtml = modalHtml +
                    "<button class='btn btn-primary btnUploadFile new_attachment_btn' type='button'><i class='fa fa-cloud-upload' style='margin-right: 5px;'></i>Upload</button>" +
                    "<button class='btn btn-success closeModal' data-dismiss='modal' type='button' style='margin-right: 5px;' autocomplete='off'>" +
                        "<i class='fa fa-save' style='padding-right: 8px;'></i>Save" +
                    "</button>" +
                    "<button class='btn btn-secondary' data-dismiss='modal' type='button'><i class='fa fa-remove' style='margin-right: 5px;'></i>Close</button>" +
                "</div>"+
            "</div>"+
        "</div>"+
    "</div>"
  
    templateObject.attachmentModalHtml.set(modalHtml);

    templateObject.getBOMStructure = async function() {
        // $('.fullScreenSpin').css('display', 'inline-block')

        let bomProducts = templateObject.bomProducts.get()
        $('#edtMainProductName').editableSelect();
        
        let objectFields = await getObjectFields();
        
        templateObject.initialRecord.set(objectFields)
        if (objectFields.Value && objectFields.Value != '' && JSON.parse(objectFields.Value).length > 0) {
            let productContents = $('.product-content')
           // $(productContents[0]).find('.attachedFiles').text(JSON.stringify({totalAttachments: objectFields.attachments.length, uploadedFilesArray: objectFields.attachments}))
            let modalId = $('#myModalAttachment.modal').attr('id');
           // utilityService.customShowUploadedAttachment(objectFields.attachments, modalId)
           $(productContents[0]).find('.btnAddAttachment').css("background-color", "#1cc88a");
           $(productContents[0]).find('.btnAddAttachment').hover(
            function() {
              // Code to execute when the mouse enters the div
              $(this).css("background-color", "#17a673");
            },
            function() {
              // Code to execute when the mouse leaves the div
              $(this).css("background-color", "#1cc88a");
            }
          );
           $(productContents[0]).find('.btnAddAttachment').html(JSON.parse(objectFields.Value).length + "     <i class='fa fa-paperclip' style='padding-right: 8px;'></i>Add Attachments")
        }

          
        if(FlowRouter.current().path.includes('/workorderlist') == false) {
            if(objectFields.Details != '' && JSON.parse(objectFields.Details).length >0) {
                let subs = JSON.parse(objectFields.Details);
                for(let i=0; i< subs.length; i++) {
                    let html = '';
                    if(FlowRouter.current().path.includes('/workordercard') == false) {

                        html +=  "<div class='product-content'>"+
                                    "<div class='d-flex productRow'>"+
                                        "<div class='colProduct form-group d-flex'><div style='width: 29%'></div>" ;

                        let isBOM = false;
                        let bomProductIndex = bomProducts.findIndex(object => {
                            return object.Caption == subs[i].productName;
                        })
                      

                        if(bomProductIndex > -1) {
                            isBOM = true
                        }else {
                            // await productService.getOneBOMProductByName(subs[i].productName).then(function(data){
                            //     if(data.tproctree.length > 0) {
                            //         isBOM = true
                            //     }
                            // })
                        }

                        if(isBOM == true) {
                            html +="<select type='search' class='edtProductName edtRaw form-control es-input' style='width: 40%'></select><button type='button' class='btnShowSub no-print btn btn-primary'>Show Sub</button>";
                        } else {
                            html +="<select type='search' class='edtProductName edtRaw form-control es-input' style='width: 70%'></select>"
                        }

                        html += "</div>"+
                                "<div class='colQty form-group'>"+
                                    "<input type='text' class='form-control edtQuantity w-100' type='number' step='.00001' value='"+ subs[i].qty +"'>" +
                                "</div>";
                        html += "<div class='colProcess form-group'>"+
                                "<input type='search' autocomplete='off' class='edtProcessName form-control w-100 es-input' value = '"+ subs[i].process + "' />" +
                                "</div>";
                        html += "<div class='colDuration form-group'>"+
                                    "<input type='text' class='form-control edtDuration w-100' type='number'  value='"+ subs[i].duration + "'>" +
                                "</div>";
                        html += "<div class='colNote form-group'>" +
                                    "<input class='w-100 form-control edtProcessNote'  type='text' value='"+subs[i].processNote+"'>"+ 
                                "</div>" ;                          
                        html += "<div class='colAttachment form-group'> "+ 
                                    "<a class='btn btn-primary no-print btnAddAttachment' role='button' data-toggle='modal' href='#myModalAttachment-"+subs[i].productName.replace(/[|&;$%@"<>()+," "]/g, '') + "' id='btn_Attachment' name='btn_Attachment'><i class='fa fa-paperclip' style='padding-right: 8px;'></i>Add Attachments</a> " +
                                    "<div class='d-none attachedFiles'></div>" + 
                                "</div>" ;
                        html += "<div class='colDelete d-flex align-items-center justify-content-center'>" + 
                                    "<button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw no-print'><i class='fa fa-remove'></i></button>" + 
                                "</div>" +
                            "</div>"+
                        "</div>" ;
                    } else {
                            let subIsBOM = false;
                            let bomIndex = bomProducts.findIndex(product=>{
                                return product.Caption == subs[i].productName
                            })
                            if(bomIndex > -1) {
                                subIsBOM = true
                            }else {
                                await productService.getOneBOMProductByName(subs[i].productName).then(function(data) {
                                    if(data.tproctree.length > 0) {
                                        subIsBOM = true
                                    }
                                })
                            }
                            if(subIsBOM == true) {
                                // if(subs[i].subs && subs[i].subs.length > 0) {
                                let isBuilt = subs[i].isBuild || false;
                                // let workorders = localStorage.getItem('TWorkorders')?JSON.parse(localStorage.getItem('TWorkorders')): []
                                // let workorderindex = workorders.findIndex(order => {
                                //     return order.SalesOrderID == objectFields.SalesDescription && order.Line.fields.ProductName == subs[i].productName;
                                // })
                                // if(workorderindex > -1) {
                                //     isBuilt = true;
                                // }


                                if(isBuilt == false) {
                                    html += "<div class='product-content'><div class='d-flex productRow'><div class='d-flex  form-group colProduct'>"+
                                    "<div style='width: 29%'><button class='btn btn-danger btn-from-stock w-100 px-0'>FROM STOCK</button></div>" +
                                        "<select type='search' class='edtProductName form-control' style='width: 70%'></select>"+
                                        "</div>"+
                                        "<div class='colQty form-group'><input type='text' class='form-control edtQuantity w-100'/></div>"+
                                        "<div class='colProcess form-group'><select type='search' class='edtProcessName form-control w-100' disabled style='background-color: #ddd'></select></div>"+
                                        "<div class='colDuration form-group'><input type='text' class='form-control edtDuration w-100'/></div>"+
                                        "<div class='colNote form-group'><input type='text' class='edtProcessNote form-control w-100' disabled style='background-color: #ddd'/></div>"+
                                        "<div class='colAttachment form-group'><a class='btn btn-primary btnAddAttachment' role='button' data-toggle='modal' href='#myModalAttachment-MemoOnly' id='btn_Attachment' name='btn_Attachment'><i class='fa fa-paperclip' style='padding-right: 8px;'></i>Add Attachments</a><div class='d-none attachedFiles'></div></div>" +
                                        "<div class='colDelete d-flex align-items-center justify-content-center'><button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw'><i class='fa fa-remove'></i></button></div>" +
                                        "</div>"+
                                        "</div>";
                                }else {
                                    html += "<div class='product-content'><div class='d-flex productRow'><div class='d-flex form-group colProduct'>" +
                                    "<div style='width: 29%'><button class='btn btn-success btn-product-build w-100 px-0'>Build</button></div>" +
                                        "<select type='search' class='edtProductName form-control' style='width: 70%'></select>"+
                                        "</div>"+
                                        "<div class='colQty form-group'><input type='text' class='form-control edtQuantity w-100'/></div>"+
                                        "<div class='colProcess form-group'><select type='search' class='edtProcessName form-control w-100' disabled style='background-color: #ddd'></select></div>"+
                                        "<div class='colDuration form-group'><input type='text' class='form-control edtDuration w-100'/></div>"+
                                        "<div class='colNote form-group'><input type='text' class='edtProcessNote form-control w-100' disabled style='background-color: #ddd'/></div>"+
                                        "<div class='colAttachment form-group'><a class='btn btn-primary btnAddAttachment' role='button' data-toggle='modal' href='#myModalAttachment-MemoOnly' id='btn_Attachment' name='btn_Attachment'><i class='fa fa-paperclip' style='padding-right: 8px;'></i>Add Attachments</a><div class='d-none attachedFiles'></div></div>" +
                                        "<div class='colDelete d-flex align-items-center justify-content-center'><button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw'><i class='fa fa-remove'></i></button></div>" +
                                        "</div>";

                                    for(let j = 0; j< subs[i].subs.length; j++) {
                                        let addRowHtml = "<div class='d-flex productRow'>" +
                                        "<div class= 'd-flex colProduct form-group'>" +
                                        "<div style='width: 60%'></div>" +
                                        "<input class='edtProductName edtRaw form-control es-input' autocomplete='false' type='search' style='width: 70%' value ='"+subs[i].subs[j].productName+"'/>" +
                                        "</div>" +
                                        "<div class='colQty form-group'>" +
                                        "<input type='text' class='edtQuantity w-100 form-control' value='" + subs[i].subs[j].qty + "'/>" +
                                        "</div>" +
                                        "<div class='colProcess form-group'>"+
                                        "<input type='search' autocomplete='off' class='edtProcessName form-control w-100 es-input' autocomplete = 'false' value='"+subs[i].subs[j].process  +"'/>"+
                                        "</div>" +
                                        "<div class='colDuration form-group'><input type='text' class='form-control edtDuration w-100' type='number'  value='"+ subs[i].subs[j].duration + "'></div>" +
                                        "<div class='colNote form-group'></div>" +
                                        "<div class='colAttachment'></div>" +
                                        "<div class='d-flex colDelete align-items-center justify-content-center'><button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw'><i class='fa fa-remove'></i></button></div>" +
                                        "</div>";

                                        // $(lastrow).append(addRowHtml);
                                        // let elements = $(lastrow).find('.edtProductName')
                                        // $(elements[elements.length - 1]).editableSelect();
                                        // let inputElements = $(lastrow).find('input.edtProductName');
                                        // $(inputElements[inputElements.length - 1]).val(subs[i].subs[j].productName)
                                        // let processes = $(lastrow).find('.edtProcessName');
                                        // $(processes[processes.length - 1]).editableSelect();
                                        // let processElements = $(lastrow).find('input.edtProcessName');
                                        // $(processElements[processElements.length-1]).val(subs[i].subs[j].process);
                                        html += addRowHtml;
                                    }

                                    html += "</div>";
                                }


                            } else {
                                html += "<div class='product-content'><div class='d-flex productRow'>" + 
                                            "<div class='d-flex colProduct'>" +
                                                "<div style='width: 29%'></div>" +
                                                "<select type='search' class='edtProductName form-control' style='width: 70%'></select>"+
                                            "</div>"+
                                            "<div class='colQty form-group'><input type='text' class='form-control edtQuantity w-100'/></div>"+
                                            "<div class='colProcess form-group'></div>" +
                                            "<div class='colDuration'></div>"+
                                            "<div class='colNote form-group'></div>" + 
                                            "<div class='colAttachment form-group'></div> " + 
                                            "<div class='colDelete d-flex align-items-center justify-content-center'>"+ 
                                                "<button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw'><i class='fa fa-remove'></i></button>"+ 
                                            "</div>"+
                                        "</div>"+
                                        "</div>";
                            }
                    }

                    let productContents = $('.product-content');
                    $(html).insertAfter($(productContents[productContents.length-2]))
                    let pContents = $('.product-content');
                    let productContent = $(pContents[pContents.length-2])
                    $(productContent).find('.edtProductName').editableSelect();
                    $(productContent).find('.edtProcessName').editableSelect()
                    let nameElements = $(productContent).find('.edtProductName')
                    $(nameElements[0]).val(subs[i].productName || '')
                    let quantityElements = $(productContent).find('.edtQuantity')
                    $(quantityElements[0]).val(subs[i].qty || 1)
                    let processElements = $(productContent).find('.edtProcessName')
                    
                    // let bomProcessIndex = bomProducts.findIndex(product => {
                    //     return product.Caption == subs[i].productName;
                    // })
                    

                    // if(bomProcessIndex > -1) {
                    //     $(processElements[0]).val(subs[i].process || bomProducts[bomProcessIndex].Info || '')
                    //     $(productContent).find('.edtProcessNote').val(subs[i].processNote || bomProducts[bomProcessIndex].CustomInputClass || '')
                    // } else {
                    //     await productService.getOneBOMProductByName(subs[i].productName).then(function(data){
                    //         if(data.tproctree.length == 0) {
                    //             $(processElements[0]).val(subs[i].process|| '')
                    //             $(productContent).find('.edtProcessNote').val(subs[i].processNote || '')
                    //         } else {
                    //             $(processElements[0]).val(subs[i].process || data.tproctree[0].Info || '');
                    //             $(productContent).find('.edtProcessNote').val(subs[i].processNote || data.tproctree[0].CustomInputClass || '')
                    //         }
                    //     })
                    // }
                    // $(productContent).find('.edtProcessName').val(subs[i].process || "")
                    
                    let modalHtml = "<div class='modal fade' role='dialog' tabindex='-1' id='myModalAttachment-"+subs[i].productName.replace(/[|&;$%@"<>()+," "]/g, '')+"'>" + templateObject.attachmentModalHtml.get();
                    if(subs[i].attachments&&subs[i].attachments.length > 0) {
                        // JSON.parse($(products[0]).find('.attachedFiles').text() != ''?$(products[0]).find('.attachedFiles').text(): '[]').uploadedFilesArray || [];
                        let temp = JSON.stringify({totalAttachments: subs[i].attachments.length, uploadedFilesArray: subs[i].attachments});
                        $(productContent).find('.attachedFiles').text(temp)
                    }
                    
                    let topElement = $('#rawAttachmentModal');
                       topElement.append(modalHtml);

                    // if(FlowRouter.current().path.includes('/bomsetupcard')) {
                    //    let topElement = $('#rawAttachmentModal');
                    //    topElement.append(modalHtml);
                    // }else {
                    //    let modalElement = $(productContent).closest('.modal');
                    //    let topParent = modalElement.parent();
                    //    topParent.append(modalHtml)
                    // }
                }
            }
        }


        async function getObjectFields () {
            return new Promise(async(resolve, reject)=>{
                let objectFields = {};
                if(FlowRouter.current().queryParams.id) {

                    $('#edtMainProductName').prop('disabled', true);
                    if(FlowRouter.current().path.includes('/bomsetupcard')) {
                        let id = -1;
                        id = FlowRouter.current().queryParams.id;
                        
                        let index = bomProducts.findIndex(product=>{
                            return product.Id == id;
                        })
                        if(index  == -1) {
                            await productService.getOneBOMProductByID(id).then(
                                function(data){
                                    objectFields = data.tproctree[0]
                                }
                            )
                        }else {
                            objectFields = bomProducts[index]
                        }

                        // objectFields = bomProducts[id].fields;
                        $('#edtMainProductName').val(objectFields.Caption);
                        $('#edtProcess').editableSelect();
                        $('#edtProcess').val(objectFields.Info);
                        $('.edtDuration').val(objectFields.QtyVariation)
                        $('.edtProcessNote').val(objectFields.Description);

                        resolve(objectFields)
                        // templateObject.initialRecord.set(bomProducts[id].fields);

                        $('.fullScreenSpin').css('display', 'none')
                    } else if(FlowRouter.current().path.includes('/productview')) {
                        let name = $('#edtproductname').val();

                        let bomIndex = bomProducts.findIndex(product=>{
                            return product.Caption == name
                        })

                        if(bomIndex > -1) {
                            objectFields = bomProducts[bomIndex];
                            $('#edtMainProductName').val(objectFields.Caption)
                            $('#edtProcess').editableSelect();
                            $('#edtProcess').val(objectFields.Info);
                            $('.edtDuration').val(objectFields.QtyVariation);
                            $('.edtProcessNote').val(objectFields.Description);
                            resolve(objectFields)
                            // templateObject.initialRecord.set(bomProducts[bomIndex].fields);

                        } else {
                            productService.getOneBOMProductByName(name).then (async function(data){
                                if(data.tproctree.length > 0) {
                                    objectFields = data.tproctree[0];
                                    $('#edtMainProductName').val(objectFields.Caption)
                                    $('#edtProcess').editableSelect();
                                    $('#edtProcess').val(objectFields.Info)
                                    $('.edtDuration').val(objectFields.QtyVariation);
                                    $('.edtProcessNote').val(objectFields.Description);

                                    resolve(objectFields)
                                } else {
                                    getVS1Data('TProductVS1').then(async dataObject => {
                                        if(dataObject.length == 0) {
                                            await productService.getOneProductdatavs1byname(name).then(function(data){
                                                objectFields = {
                                                    Caption: name,
                                                    Info: '',
                                                    CustomInputClass: '',
                                                    Description: data.tproduct[0].fields.SalesDescription || '',
                                                    TotalQtyOriginal: data.tproduct[0].fields.TotalQtyInStock,
                                                    Value: '',
                                                    Details: '',
                                                    QtyVariation: 1
                                                }
                                                $('#edtMainProductName').val(objectFields.Caption)
                                                resolve(objectFields)

                                            })
                                        } else {
                                            let data = JSON.parse(dataObject[0].data)
                                            let useData = data.tproductvs1;
                                            for(let k = 0; k< useData.length; k++) {
                                                if(useData[k].fields.ProductName == name) {
                                                    objectFields = {
                                                        Caption: name,
                                                        qty: 1,
                                                        Info: '',
                                                        CustomInputClass: '',
                                                        Description: useData[k].SalesDescription || '',
                                                        TotalQtyOriginal: useData[k].TotalQtyInStock,
                                                        Value: '',
                                                        Details: '',
                                                        QtyVariation: 1
                                                    }
                                                    $('#edtMainProductName').val(objectFields.Caption)
                                                    resolve(objectFields)
                                                }
                                            }
                                        }
                                    }).catch(async function(err) {
                                        await productService.getOneProductdatavs1byname(name).then(function(data){
                                            objectFields = {
                                                Caption: name,
                                                qty: 1,
                                                Info: '',
                                                CustomInputClass: '',
                                                Description: data.tproduct[0].fields.SalesDescription || '',
                                                TotalQtyOriginal: data.tproduct[0].fields.TotalQtyInStock,
                                                Value: '',
                                                Details:'',
                                                QtyVariation: ''
                                            }
                                            $('#edtMainProductName').val(objectFields.productName)
                                            resolve(objectFields)
                                        })
                                    })
                                }
                            })
                        }
                    } else if(FlowRouter.current().path.includes('/workordercard')){

                        async function getWorkorders () {
                            return new Promise(async(resolve, reject)=> {
                                getVS1Data('TVS1Workorder').then(function(dataObject){
                                    if(dataObject.length == 0 ) {
                                        resolve([])
                                    }else {
                                        let data = JSON.parse(dataObject[0].data);
                                        resolve(data.tvs1workorder)
                                    }
                                }).catch(function(e){
                                    resolve([])
                                })
                            })
                        }

                        let workorders = await getWorkorders();

                        let index = workorders.findIndex(workorder=>{
                            return workorder.fields.ID == FlowRouter.current().queryParams.id;
                        })
                        objectFields= JSON.parse(workorders[index].fields.BOMStructure);
                        $('#edtMainProductName').val(objectFields.Caption)
                        $('#edtProcess').editableSelect();
                        $('#edtProcess').val(objectFields.Info);
                        $('.edtProcessNote').val(objectFields.CustomInputClass);
                        $('.edtDuration').val(objectFields.QtyVariation) || ''
                        resolve(objectFields)
                    }
                } else {
                    if(FlowRouter.current().path.includes('/bomsetupcard')) {
                        $('#edtMainProductName').prop('disabled', false);
                        setTimeout(()=>{
                            $('#productListModal').modal('toggle');
                            $("#edtMainProductName1").click();
                            $('.fullScreenSpin').css('display', 'none')
                        }, 300)
                    } else if (FlowRouter.current().path.includes('/productview')) {
                        $('#edtMainProductName').prop('disabled', true);
                        $('#edtMainProductName').val($('.colProductName .edtproductname').val())
                    }
                    objectFields = {
                        Caption: '',
                        Info: '',
                        CustomInputClass: '',
                        Description: '',
                        Value: '',
                        qty:1,
                        TotalQtyOriginal: 0,
                        Details: '',
                        QtyVariation: ''
                    }
                    if(FlowRouter.current().path.includes('/productview')) {
                        objectFields.productName = $('.colProductName .edtproductname').val() || '';
                    }else if (FlowRouter.current().path.includes('/workordercard')) {
                        // objectFields.productName = $('.colProductName .edtproductname').val() || '';
                        let prodname = $('#tblWorkOrderLine tr .colProductName .lineProductName').val();
                        let index = bomProducts.findIndex(product=>{
                            return product.Caption == prodname;
                        })
                        if(index > -1) {
                            objectFields = bomProducts[index];
                        } else {
                            await productService.getOneBOMProductByName(prodname).then(function(data){
                                if(data.tproctree.length > 0) {
                                    objectFields = data.tproctree[0]
                                }
                            })
                        }
                        $('#BOMSetupModal #edtMainProductName').editableSelect();
                        $('#BOMSetupModal #edtProcess').editableSelect();
                        $('#BOMSetupModal #edtMainProductName').val(prodname);
                        $('#BOMSetupModal #edtProcess').val(objectFields.Info);
                        $('#BOMSetupModal .edtProcessNote').val(objectFields.CustomInputClass);
                        $('#BOMSetupModal .edtDuration').val(objectFields.QtyVariation);
                    }
                    resolve(objectFields)

                }
            })
        }

    }

    await templateObject.getBOMStructure()

    templateObject.setEditableSelect = async function() {
        $(document).ready(function(){
            $('.edtProcessName').editableSelect();
            $('.edtProductName').editableSelect();
        })
    }

    templateObject.setEditableSelect();


    $(document).on('change', '.attachment-upload', async function(event) {

        let myFiles = $(event.target)[0].files;
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let modalId = $(event.target).closest('.modal').attr('id');
        let existingArray = JSON.parse($(templateObject.selectedAttachedField.get()).text()!=''?$(templateObject.selectedAttachedField.get()).text() : '[]').uploadedFilesArray || []
        let uploadData = await utilityService.customAttachmentUpload(existingArray, myFiles, saveToTAttachment, lineIDForAttachment, modalId);

        templateObject.selectedAttachedField.get().html(JSON.stringify(uploadData))
        let attachmentButton = $(templateObject.selectedAttachedField.get()).closest('.colAttachment').find('.btnAddAttachment');
        let attachCount = uploadData.totalAttachments;
        if(attachCount > 0 ) {
            attachmentButton.css("background-color", "#1cc88a");
            attachmentButton.hover(
                function() {
                // Code to execute when the mouse enters the div
                $(this).css("background-color", "#17a673");
                },
                function() {
                // Code to execute when the mouse leaves the div
                $(this).css("background-color", "#1cc88a");
                }
            )    
        }
        attachmentButton.html(attachCount + "     <i class='fa fa-paperclip' style='padding-right: 8px;'></i>Add Attachments")
    })

    $(document).on('click', '.remove-attachment', function(event) {
        let className = $(event.target).attr('class')
        let attachmentID = parseInt(className.split('remove-attachment-')[1]);
        let modalId = $(event.target).closest('.modal').attr("id");

        if ($("#"+modalId+" .confirm-action-" + attachmentID).length) {
            $("#"+modalId+" .confirm-action-" + attachmentID).remove();
        } else {
            let actionElement = '<div class="confirm-action confirm-action-' + attachmentID + '"><a class="confirm-delete-attachment btn btn-default delete-attachment-' + attachmentID + '">' +
                'Delete</a><button class="save-to-library btn btn-default">Remove & save to File Library</button></div>';
            $('#'+modalId + ' .attachment-name-' + attachmentID).append(actionElement);
        }
        $("#new-attachment2-tooltip").show();
    })

    $(document).on('click', '.confirm-delete-attachment', function(event) {
        templateObject.$("#new-attachment2-tooltip").show();
        let className = $(event.target).attr('class')
        let attachmentID = parseInt(className.split('delete-attachment-')[1]);
        let uploadedElement = templateObject.selectedAttachedField.get();
        let uploadedArray = JSON.parse(uploadedElement.text()).uploadedFilesArray;
        // let uploadedArray = templateObject.uploadedFiles.get();
        // let attachmentCount = templateObject.attachmentCount.get();
        let modalId = $(event.target).closest('.modal').attr('id');
        $('#'+modalId+' .attachment-upload').val('');
        uploadedArray.splice(attachmentID, 1);
        let newObject = {
            totalAttachments: uploadedArray.length,
           uploadedFilesArray: uploadedArray
        }
        $(templateObject.selectedAttachedField.get()).text(JSON.stringify(newObject))

        let attachmentButton = $(templateObject.selectedAttachedField.get()).closest('.colAttachment').find('.btnAddAttachment');
        let attachCount = uploadedArray.length;
        attachmentButton.html(attachCount + "     <i class='fa fa-paperclip' style='padding-right: 8px;'></i>Add Attachments")

        if(uploadedArray.length === 0) {
            attachmentButton.html("<i class='fa fa-paperclip' style='padding-right: 8px;'></i>Add Attachments")
            let elementToAdd = '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
                $('#'+modalId + ' .file-display').html(elementToAdd);
                $(".attchment-tooltip").show();
        }else {
            utilityService.customShowUploadedAttachment(uploadedArray, modalId)
        }

        // templateObject.uploadedFiles.set(uploadedArray);
        // attachmentCount--;
        // if (attachmentCount === 0) {
        //     let elementToAdd = '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
        //     $('#file-display').html(elementToAdd);
        // }
        // templateObject.attachmentCount.set(attachmentCount);
        // if (uploadedArray.length > 0) {
        //     let utilityService = new UtilityService();
        //     utilityService.showUploadedAttachment(uploadedArray);
        // } else {
        //     $(".attchment-tooltip").show();
        // }
    })

    $(document).on('click','.new_attachment_btn', function(event) {
        
        let inputEle = $(event.target).closest('.modal-footer').find('.attachment-upload');     
        $(inputEle).trigger('click');
    })
})


Template.bom_template.events({
    'click #productListModal tbody tr': function(event) {
        let templateObject = Template.instance();
        let inputElement = templateObject.selectedProductField.get();
        event.preventDefault();
        event.stopPropagation();           
               
        if(!inputElement || inputElement.hasClass('edtProductName') != true) {
            
            let productName = $(event.target).closest('tr').find('td.colproductName').text();
            let description = $(event.target).closest('tr').find('td.colproductDesc').text();
            let stockQty = $(event.target).closest('tr').find('td.colQuantity').text();
            let objectDetail = {
                Caption: productName,
                // qty: 1,
                Info: '',
                CustomInputClass: '',
                Description: description,
                TotalQtyOriginal: stockQty,
                Value: ''
            }

            templateObject.initialRecord.set(objectDetail);
            $('#edtMainProductName').val(productName);
            $('.edtProcessNote').val(description);
            $('#productListModal').modal('toggle')

        } else {

          // let productName = $(event.target).closest('tr').find('.colproductName').text();

           let productName = $(event.target).closest('tr').find('.colproductName').text();
            let selEle = templateObject.selectedProductField.get();
            selEle.val(productName);
            let showSubButton = $(selEle).closest('div.colProduct').find('.btnShowSub');
            if(showSubButton){
                $(showSubButton).remove()
            }
            let bomProducts = templateObject.bomProducts.get();
            let isBOM = false;
            let existIndex = bomProducts.findIndex(product => {
                return product.Caption == productName;
            })
            if(existIndex > -1) {
                isBOM = true
            }
            if(isBOM == true) {
                let colProduct = $(selEle).closest('.colProduct')
                if(FlowRouter.current().path.includes('/workordercard') == false) {
                    $(colProduct).find('.edtProductName').css('width', '40%')
                    if(templateObject.showSubButton.get() == true) {
                        $(colProduct).append("<button type='button' class='btnShowSub no-print btn btn-primary'>Show Sub</button>");
                    }
                } else {
                    let div = $(colProduct).find('div');
                    $(div).remove()
                    $(colProduct).prepend("<div style='width: 29%'><button type='button' class='btn btn-danger btn-from-stock w-100 px-0'>FROM STOCK</button></div>")
                }

                templateObject.showSubButton.set(true);
                let colProcess = $(selEle).closest('.productRow').find('.edtProcessName');
                $(colProcess).val(bomProducts[existIndex].Info)
                $(colProcess).attr('disabled', 'true');
                let colProcessNote = $(selEle).closest('.productRow').find('.edtProcessNote');
                $(colProcessNote).val(bomProducts[existIndex].CustomInputClass)
                $(colProcessNote).attr('disabled', 'true');
            }
                $('#productListModal').modal('toggle')
        }
    },

    'click #edtMainProductName': function(event) {
        let templateObject = Template.instance();
        // let colProduct = $(event.target).closest('div.colProduct');
        templateObject.selectedProductField.set($('#edtMainProductName'))
        // templateObject.selectedProductField.set($(colProduct).children('input'))
        $('#productListModal').modal('toggle');
    },

    'click .edtProductName': function(event) {
        let templateObject = Template.instance();
        let colProduct = $(event.target).closest('div.colProduct');
        templateObject.selectedProductField.set($(colProduct).children('input'))
        $('#productListModal').modal('toggle');
    },

    'click .edtProcessName': function(event) {
        let templateObject = Template.instance();
        let colProcess = $(event.target).closest('div.colProcess');
        let colDuration = $(event.target).closest('div.colDuration');
        $(event.target).editableSelect();
        templateObject.selectedProcessField.set($(colProcess).children('.edtProcessName'));
      //  templateObject.selectedRawHourField.set($(colDuration).children('.edtDuration'));

        $('#edtProcessListPopModal').modal('toggle');
    },

    'click #edtProcessListPopModal tbody tr': function (event) {
        event.preventDefault();
        event.stopPropagation();
        let templateObject = Template.instance()
        let processName = $(event.target).closest('tr').find('.colName').text();
       
        let selEle = templateObject.selectedProcessField.get();
        // let selDuration = templateObject.selectedRawHourField.get();
        selEle.val(processName);
        // selDuration.val(1);
        let durationEle = $(selEle).closest('.productRow').find('.colDuration .edtDuration');
        let productName = $(selEle).closest('.productRow').find('.colProduct .edtProductName').val();
        
        let bomProducts = templateObject.bomProducts.get();
                        
        let bomDetail;
        let detail_duration = 1.0 ;
     
        for (let i=0 ; i < bomProducts.length; i++) {
            bomDetail = JSON.parse(bomProducts[i].Details);
            for(let j=0 ; j<bomDetail.length ; j++) {
                if(bomDetail[j].productName == productName) {
                    if (bomDetail[j].process == processName) {
                        detail_duration = bomDetail[j].duration;
                    }
                }
            }
            
        }
       
        durationEle.val(detail_duration);
        let hoursEle = $(selEle).closest('.productRow').find('.colDuration .edtDuration');
        $(hoursEle).css('display', 'block')
        $('#edtProcessListPopModal').modal('toggle')
    },

    'click .btnAddProduct': function(event) {
        event.preventDefault();
        event.stopPropagation();
        let row = $(event.target).closest('.productRow');
        
        let tempObject = Template.instance();
        let parent = row.parent();

        let grandParent = parent.parent();
        let modalElement = $(row).closest('.modal');
        let topParent = modalElement.parent();

        if(FlowRouter.current().path.includes('/bomsetupcard')) {
            topParent = $('#content');
        }        

        let count = $(grandParent).find('.product-content').length;
        if(count > 1) {
            let lastRow = $(grandParent).find('.product-content')[count-2];
            if(lastRow && lastRow != null) {
                if ($(lastRow).find('.edtProductName').val() == '' || $(lastRow).find('.edtQuantity').val() == '') {
                    return
                }
            }
        }

        let colProduct = row.find('.colProduct');
        let colQty = row.find('.colQty');
        let colProcess = row.find('.colProcess');
        let colHours = row.find('.colDuration');
        let colNote = row.find('.colNote');
        let colAttachment = row.find('.colAttachment');
        let colDelete = row.find('.colDelete');
        $(colProduct).prepend("<div style='width: 29%'></div><select class='edtProductName edtRaw form-control' id='edtRaw' type='search' style='width: 70%'></select>")
        $(event.target).remove()
        $(colProduct).find('.edtProductName').editableSelect()
        $(colQty).append("<input class='form-control edtQuantity w-100' value='1' min='1' type='number' step='.00001'/>");
        // $(colProduct).append("<button type='button' class='btnShowSub btn btn-primary'>Show Sub</button>");
        $(colProcess).append("<select class='edtProcessName form-control w-100' type='search' ></select>")
        $(colProcess).find('.edtProcessName').editableSelect();
        $(colHours).append("<input class='w-100 form-control edtDuration' type='text' />")
        $(colNote).append("<input class='w-100 form-control edtProcessNote' type='text'/>");
        $(colDelete).addClass('d-flex align-items-center justify-content-center');
        $(colDelete).append("<button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw no-print'><i class='fa fa-remove'></i></button>")

        $(colProduct).find('.edtProductName').trigger('click');

        grandParent.append("<div class='product-content'><div class='d-flex productRow'>" +
                        "<div class='colProduct  d-flex form-group'>" +
                        "<button class='btn btn-primary btnAddProduct' style='width: 29%;'>Product+</button>" +
                        "</div>" +
                        "<div class='colQty form-group'>" +
                        "</div>" +
                        "<div class='colProcess form-group'>" +
                        "</div>" +
                        "<div class='colDuration form-group'></div>" +
                        "<div class='colNote form-group'>" +
                        "</div>" +
                        "<div class='colAttachment form-group'></div>" +
                        "<div class='colDelete'>" +
                        "</div>" +
                        "</div></div>")
        let productContentCount = $(grandParent).find('.product-content').length;

        $(colAttachment).append("<a class='btn btn-primary no-print btnAddAttachment' role='button' data-toggle='modal' href='#myModalAttachment-"+productContentCount+"' id='btn_Attachment' name='btn_Attachment'>"+
                    "<i class='fa fa-paperclip' style='padding-right: 8px;'></i>Add Attachments</a><div class='d-none attachedFiles'></div>")

        let attachModalHtml = "<div class='modal fade' role='dialog' tabindex='-1' id='myModalAttachment-"+productContentCount+"'>" + tempObject.attachmentModalHtml.get();
        
        let topElement = $('#rawAttachmentModal');
        topElement.append(attachModalHtml);
         
 //       topParent.append(attachModalHtml);

    },

    'click .btnShowSub': function(event) {
        let row = $(event.target).closest('.product-content');
        let templateObject = Template.instance();
        let bomProducts = templateObject.bomProducts.get();
        let productName = $(event.target).closest('.productRow').find('.edtProductName').val();
        let processName = $(event.target).closest('.productRow').find('.edtProcessName').val();
        let quantity = $(event.target).closest('.productRow').find('.edtQuantity').val();
        if(productName == '' || quantity == '' ) {
            return
        }
        $(event.target).closest('.productRow').find('.edtProductName').css('width', '70%')
        let bomIndex = bomProducts.findIndex(product=>{
            return product.Caption == productName
        })
        if(bomIndex > -1) {
            let subIndex = -1;
            let parentBOM = bomProducts.find(product => {
                return product.Caption == templateObject.initialRecord.get().Caption;
            })

            if(parentBOM) {
                subIndex = JSON.parse(parentBOM.Details).findIndex(sub=>{
                    return sub.productName == productName;
                })
            }

            if(subIndex > -1) {
                let subs = parentBOM.subs[subIndex].subs
                    $(event.target).remove()
                    if(subs && subs.length) {
                        for (let i = 0; i < subs.length; i++) {
                            $(row).append("<div class='d-flex productRow'>" +
                                "<div class= 'd-flex colProduct form-group'>" +
                                "<div style='width: 60%'></div>" +
                                "<select class='edtProductName edtRaw form-control' type='search' style='width: 40%'></select>" +
                                "</div>" +
                                "<div class='colQty form-group'>" +
                                "<input type='text' class='edtQuantity w-100 form-control' type='number' step='.00001' value='" + subs[i].qty + "'/>" +
                                "</div>" +
                                "<div class='colProcess form-group'>"+
                                "<select type='search' autocomplete='off' class='edtProcessName form-control w-100 es-input' ></select>"+
                                "</div>" +
                                "<div class='colDuration form-group'></div>" +
                                "<div class='colNote form-group'></div>" +
                                "<div class='colAttachment'></div>" +
                                "<div class='d-flex colDelete align-items-center justify-content-center'><button class='btn btn-danger btn-rounded btn-sm my-0 no-print btn-remove-raw'><i class='fa fa-remove'></i></button></div>" +
                                "</div>")

                            let elements = $(row).find('.edtProductName')
                            $(elements[elements.length - 1]).editableSelect();

                            let inputElements = $(row).find('input.edtProductName');
                                $(inputElements[inputElements.length - 1]).val(subs[i].productName)
                            let processes = $(row).find('.edtProcessName');
                            $(processes[processes.length - 1]).editableSelect();
                            let processElements = $(row).find('input.edtProcessName');
                            $(processElements[processElements.length - 1]).val(subs[i].process)
                        }
                    }
            } else {

                let subs = JSON.parse(bomProducts[bomIndex].Details)

                    $(event.target).remove()
                    if(subs && subs.length) {
                        for (let i = 0; i < subs.length; i++) {
                            $(row).append("<div class='d-flex productRow'>" +
                                "<div class= 'd-flex colProduct form-group'>" +
                                "<div style='width: 60%'></div>" +
                                "<select class='edtProductName edtRaw form-control' type='search' style='width: 40%'></select>" +
                                "</div>" +
                                "<div class='colQty form-group'>" +
                                "<input type='text' class='edtQuantity w-100 form-control' type='number' step='.00001' value='" + subs[i].qty + "'/>" +
                                "</div>" +
                                "<div class='colProcess form-group'>"+
                                "<select type='search' autocomplete='off' class='edtProcessName form-control w-100 es-input' ></select>"+
                                "</div>" +
                                "<div class='colDuration form-group'></div>"+
                                "<div class='colNote form-group'></div>" +
                                "<div class='colAttachment'></div>" +
                                "<div class='d-flex colDelete align-items-center justify-content-center'><button class='btn btn-danger btn-rounded btn-sm my-0 no-print btn-remove-raw'><i class='fa fa-remove'></i></button></div>" +
                                "</div>")

                            let elements = $(row).find('.edtProductName')
                            $(elements[elements.length - 1]).editableSelect();
                            let inputElements = $(row).find('input.edtProductName');
                                $(inputElements[inputElements.length - 1]).val(subs[i].productName)
                            let processes = $(row).find('.edtProcessName');
                            $(processes[processes.length - 1]).editableSelect();
                            let processElements = $(row).find('input.edtProcessName');
                            // $(processElements[processElements.length - 1]).val(subs[i].process)
                        }
                    }
            }
        }

        $(row).append("<div class='d-flex productRow'>"+
                        "<div class='d-flex colProduct form-group'>"+
                        "<div class='d-flex align-items-center justify-content-end form-group' style='width: 60%'>"+
                        "<button class='btn btn-primary w-25 d-flex align-items-center justify-content-center form-control no-print btnAddSubProduct'><span class='fas fa-plus'></span></button>" +
                        "</div>"+
                        "<select class='edtProductName edtRaw form-control' type='search' style='width: 40%'></select>" +
                        "</div>"+
                        "<div class='colQty'>" +
                        "<input type='text' class='edtQuantity  w-100 form-control' type='number' step='.00001'/>" +
                        "</div>"+
                        "<div class='colProcess form-group'>"+
                        "<select type='search' autocomplete='off' class='edtProcessName form-control w-100 es-input' ></select>"+
                        "</div>" +
                        "<div class='colDuration form-group'></div>" +
                        "<div class='colNote form-group'></div>" +
                        "<div class='colAttachment'></div>" +
                        "<div class='colDelete'></div>"+
                        "</div>")
                        let eles = $(row).find('.edtProductName')
                        $(eles[eles.length - 1]).editableSelect();
                        let edtprocesses = $(row).find('.edtProcessName')
                        $(edtprocesses[edtprocesses.length-1]).editableSelect()
    },

    'click .btnAddSubProduct': function(event) {
        event.preventDefault();
        event.stopPropagation();
        let button  = $(event.target).closest('button.btnAddSubProduct');
        let tempObject = Template.instance();
        let row = $(event.target).closest('.productRow');
        let colProduct = row.find('.colProduct');
        let colQty = row.find('.colQty');
        let colProcess = row.find('.colProcess');
        let colNote = row.find('.colNote');
        let colAttachment = row.find('.colAttachment');
        let colDelete = row.find('.colDelete');

        if($(colProduct).find('.edtProductName').val() != '') {
            if($(colQty).find('.edtQuantity').val() != '') {
                let quantity = $(colQty).find('.edtQuantity').val();
                let edtRaw = colProduct.find('.edtProductName')
                $(event.target).remove();
                $(button).remove();
                $(colDelete).addClass('d-flex align-items-center justify-content-center')
                $(colDelete).append("<button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw no-print'><i class='fa fa-remove'></i></button>")
                let parent = row.parent();

                $(parent).append("<div class='d-flex productRow'>"+
                "<div class='d-flex colProduct form-group'>"+
                "<div class='d-flex align-items-center justify-content-end form-group' style='width: 60%'>"+
                "<button class='btn btn-primary w-25 d-flex align-items-center justify-content-center form-control no-print btnAddSubProduct'><span class='fas fa-plus'></span></button>" +
                "</div>"+
                "<select class='edtProductName edtRaw form-control' type='search' style='width: 40%'></select>" +
                "</div>"+
                "<div class='colQty'>" +
                "<input type='text' class='edtQuantity w-100 form-control' type='number' step='.00001'/>" +
                "</div>"+
                "<div class='colProcess form-group'>"+
                "<select type='search' autocomplete='off' class='edtProcessName form-control w-100 es-input' ></select>"+
                "</div>" +
                "<div class='colDuration form-group'></div>"+
                "<div class='colNote form-group'></div>" +
                "<div class='colAttachment'></div>" +
                "<div class='colDelete'></div>"+
                "</div>")
                let eles = $(parent).find('.edtProductName')
                $(eles[eles.length - 1]).editableSelect();
                let procElements = $(parent).find('.edtProcessName')
                $(procElements[procElements.length -1]).editableSelect()
            }
        }
    },

    'click .btn-remove-raw': function(event) {
        let row = $(event.target).closest('div.productRow');
        let productName = $(row).find('.edtProductName').val();
        let content = $(event.target).closest('div.product-content');
        let rowCount = $(content).find('.productRow').length;
        let attachment_modal_id = $(row).find('.colAttachment').find('a').attr('href');

        $(attachment_modal_id).remove();

        if (rowCount == 1 || $(content).first().find('.edtProductName').val() == productName) {
            $(content).remove();
            $('#myModalAttachment-'+ productName.replace(/[|&;$%@"<>()+," "]/g, '')).remove()
        } else {
            $(row).remove();
        }
    },

    'change .edtQuantity' : function(event) {
        let value = $(event.target).val();
        value = parseFloat(value).toFixed(5);
        $(event.target).val(value);
    },

    'change .edtDuration': function(event) {
        let val = $(event.target).val();
        val = parseFloat(val).toFixed(1);
        $(event.target).val(val);
    },


    'click .btn-product-build': function(event) {
        event.preventDefault();
        event.stopPropagation()
        let rows = $(event.target).closest('div.product-content').find('div.productRow');
        for(let i = 1; i < rows.length; i++){
            $(rows[i]).remove();
        }
        $(event.target).removeClass('btn-product-build')
        $(event.target).removeClass('btn-success')
        $(event.target).addClass('btn-from-stock')
        $(event.target).addClass('btn-danger')
        $(event.target).text('FROM STOCK')
        $(rows[0]).find('.edtProcessName').editableSelect();
        $(rows[0]).find('.edtProcessName').prop('disabled', true)
        $(rows[0]).find('.edtProcessNote').prop('disabled', true)
        $(rows[0]).find('.edtProcessName').css('background-color', '')
    },


    'click .btn-from-stock': async function(event) {
        let templateObject = Template.instance();
        event.preventDefault();
        event.stopPropagation();
        let row = $(event.target).closest('.product-content');
        // let templateObject = Template.instance();
        // let temp = localStorage.getItem('TProcTree');
        let bomProducts = templateObject.bomProducts.get();
        let productName = $(event.target).closest('.productRow').find('.edtProductName').val();
        let processName = $(event.target).closest('.productRow').find('.edtProcessName').val();
        let quantity = $(event.target).closest('.productRow').find('.edtQuantity').val();
        let bomIndex = bomProducts.findIndex(product=>{
            let pContent = $('#BOMSetupModal').find('.product-content')[0];
            return product.Caption == $(pContent).find('.edtMainProductName').val()
        })
        if(productName == '' || quantity == '') {
            return
        }

        if(bomIndex > -1) {
            let index = JSON.parse(bomProducts[bomIndex].Details).findIndex(product => {
                return product.productName == productName;
            });
            let subs;
            if(index > -1) {
                 subs = JSON.parse(bomProducts[bomIndex].Details)[index].subs
            }else{
                let subIndex = bomProducts.findIndex(product=>{return product.Caption == productName})
                subs = JSON.parse(bomProducts[subIndex].Details)
            }
                // $(event.target).remove()
                if(subs && subs.length) {
                    for (let i = 0; i < subs.length; i++) {
                        $(row).append("<div class='d-flex productRow'>" +
                            "<div class= 'd-flex colProduct form-group'>" +
                            "<div style='width: 60%'></div>" +
                            "<select class='edtProductName edtRaw form-control' type='search' style='width: 40%'></select>" +
                            "</div>" +
                            "<div class='colQty form-group'>" +
                            "<input type='text' class='edtQuantity w-100 form-control' value='" + subs[i].qty + "'/>" +
                            "</div>" +
                            "<div class='colProcess form-group'>"+
                            // "<select type='search' autocomplete='off' class='edtProcessName form-control w-100 es-input' ></select>"+
                            "</div>" +
                            "<div class='colDuration form-group'></div>"+
                            "<div class='colNote form-group'></div>" +
                            "<div class='colAttachment'></div>" +
                            "<div class='d-flex colDelete align-items-center justify-content-center'><button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw'><i class='fa fa-remove'></i></button></div>" +
                            "</div>")

                        let elements = $(row).find('.edtProductName')
                        $(elements[elements.length - 1]).editableSelect();
                        let inputElements = $(row).find('input.edtProductName');
                            $(inputElements[inputElements.length - 1]).val(subs[i].productName)
                        // let processes = $(row).find('.edtProcessName');
                        // $(processes[processes.length - 1]).editableSelect();
                        // let processElements = $(row).find('input.edtProcessName');
                        // $(processElements[processElements.length - 1]).val(subs[i].rawProcess)
                    }
                }

            let processElement = $(event.target).closest('.productRow').find('.edtProcessName');
            $(processElement).css('background', 'transparent');
            $(processElement).prop('disabled', false);
            $(processElement).editableSelect()
            let noteElement = $(event.target).closest('.productRow').find('.edtProcessNote');
            $(noteElement).css('background', 'transparent');
            $(noteElement).prop('disabled', false);

            let parent = $(event.target).parent();
            $(event.target).remove();
            $(parent).append("<button class='btn btn-success w-100 px-0 btn-product-build'>BUILD</button>")
        }


    },

    'click .btnAddAttachment': function(event) {
        let tempObject = Template.instance();
        let row = $(event.target).closest('.productRow');
        let targetField = $(row).find('.attachedFiles');
        tempObject.selectedAttachedField.set(targetField);
    },

    // 'click .new_attachment_btn': function(event) {
    //     let inputEle = $(event.target).closest('.modal-footer').find('.attachment-upload');
    //     $(inputEle).trigger('click');
    // },

})

Template.bom_setup.helpers({
    initialRecord: ()=>{
        return Template.instance().initialRecord.get()
    }
})
