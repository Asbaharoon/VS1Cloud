import { BaseService } from '../js/base-service.js';

export class ProductService extends BaseService {

    getGlobalSearchReport(searchName) {
        let options = {
            SearchName: "'" + searchName + "'",
            QuerySearchMode: "'smSearchEngineLike'",
            LimitCount: parseInt(initialDataLoad),
        };
        return this.getList(this.ERPObjects.TGlobalSearchReport, options);
    }

    getGlobalSearchReportByType(searchName, searchType) {
        let options = {
            SearchType: "'" + searchType + "'",
            SearchName: "'" + searchName + "'",
            IgnoreDates: true,
            QuerySearchMode: "'smSearchEngineLike'"
        };
        return this.getList(this.ERPObjects.TGlobalSearchReport, options);
    }

    getGlobalSearchAccount(searchName) {
        let options = {
            select: "[ID]='" + searchName + "' AND [Active]=true",
        };
        return this.getList(this.ERPObjects.TAccountVS1, options);
    }

    getGlobalSearchProduct(searchName) {
        let options = {
            select: "[ID]='" + searchName + "' AND [Active]=true",
        };
        return this.getList(this.ERPObjects.TProductVS1, options);
    }

    getGlobalSearchSupplier(searchName) {
        let options = {
            select: "[ID]='" + searchName + "' AND [Active]=true",
        };
        return this.getList(this.ERPObjects.TSupplierVS1, options);
    }

    getGlobalSearchCustomer(searchName) {
        let options = {
            select: "[ID]='" + searchName + "' AND [Active]=true",
        };
        return this.getList(this.ERPObjects.TCustomerVS1, options);
    }
    getGlobalSearchAppointment(searchName) {//APP-123
        let options = {
            select: "[ID]='" + searchName + "' AND [Active]=true",
        };
        return this.getList(this.ERPObjects.TAppointment, options);
    }
    getGlobalSearchCredit(searchName) {

        let options = {
            select: "[PurchaseOrderID]='" + searchName,
        };
        return this.getList(this.ERPObjects.TCreditList, options);
    }
    getGlobalSearchCRM(searchName) {//CRM-123
        //TProjectList?select=[Id]=1
        let options = {
            select: "[ID]='" + searchName + "' AND [Active]=true",
        };
        return this.getList(this.ERPObjects.TProjectTasksList, options);
    }
    getGlobalSearchDeposit(searchName) {//DEP-123
        let options = {
            select: "[DepositID]='" + searchName,
        };
        return this.getList(this.ERPObjects.TBankDepositList, options);
    }
    getGlobalSearchFixedAssets(searchName) {
        //TFixedAssets?select=[id]=1
        let options = {
            select: "[ID]='" + searchName,
        };
        return this.getList(this.ERPObjects.TFixedAssets, options);
    }
    getGlobalSearchReceiptClaims(searchName) {
        let options = {
            select: "[MetaID]='" + searchName,
        };
        return this.getList(this.ERPObjects.TExpenseClaimList, options);
    }
    getGlobalSearchTasks(searchName) {//TSK-123
        //TTasks?select=[id]=1
        //TProjectTasksList
        let options = {
            select: "[ID]='" + searchName + "' AND [Active]=true",
        };
        return this.getList(this.ERPObjects.TProjectTasksList, options);
    }
    getGlobalSearchWorkOrders(searchName) {//WO-123
        //TWorkOrderList?select=[PPid]=2033
        let options = {
            select: "[PPid]='" + searchName,
        };
        return this.getList(this.ERPObjects.TWorkOrderList, options);
    }

    getGlobalSearchTimeSheet(searchName) {
        let options = {
            select: "[ID]='" + searchName + "' AND [Active]=true",
        };
        return this.getList(this.ERPObjects.TTimeSheet, options);
    }

    getGlobalSearchJournalEntry(searchName) {
        let options = {
            select: "[ID]='" + searchName + "'",
        };
        return this.getList(this.ERPObjects.TJournalEntry, options);
    }

    getGlobalSearchPO(searchName) {
        let options = {
            select: "[ID]='" + searchName + "' AND [Deleted]=false",
        };
        return this.getList(this.ERPObjects.TPurchaseOrderEx, options);
    }

    getGlobalSearchBill(searchName) {
        let options = {
            select: "[ID]='" + searchName + "' AND [Deleted]=false",
        };
        return this.getList(this.ERPObjects.TBillEx, options);
    }

    getGlobalSearchPayment(searchName) {
        let options = {
            IgnoreDates: true,
            ///select: "[PaymentID]='"+searchName+"'",
            search: 'PaymentID=' + searchName + '',
            // PaymentID:"'"+searchName+"'"
        };
        return this.getList(this.ERPObjects.TPaymentList, options);
    }

    getGlobalSearchRefund(searchName) {
        let options = {
            select: "[ID]='" + searchName + "' AND [Deleted]=false",
        };
        return this.getList(this.ERPObjects.TRefundSale, options);
    }

    getGlobalSearchEmployee(searchName) {
        let options = {
            select: "[ID]='" + searchName + "' AND [Active]=true",
        };
        return this.getList(this.ERPObjects.TEmployee, options);
    }

    getGlobalSearchStockAdjust(searchName) {
        let options = {
            select: "[ID]='" + searchName + "' AND [Deleted]=false",
        };
        return this.getList(this.ERPObjects.TStockAdjustEntry, options);
    }

    getGlobalSearchCheck(searchName) {
        let options = {
            select: "[ID]='" + searchName + "' AND [Deleted]=false",
        };
        return this.getList(this.ERPObjects.TChequeEx, options);
    }

    getGlobalSearchShipping(searchName) {
        let options = {
            select: "[ID]='" + searchName + "' AND [Deleted]=false",
        };
        return this.getList(this.ERPObjects.TInvoice, options);
    }

    getRecentTransactions() {
        let options = {
            PropertyList: "ProductID,ProductName,ProductID,ProductDescription,TransactionType,Total Profit (Inc),UnitOfMeasure,SaleDate,TransactionNo,Qty,Line Cost (Ex),Total Amount (Ex)",
        };
        return this.getList(this.ERPObjects.TProductSalesDetailsReport, options);
    }
    getAllProductExtraSell() {
        let options = {
            PropertyList: "ID,ClientTypeName,Price1,ProductName",
            select: "[Active]=true"
        };
        return this.getList(this.ERPObjects.TProduct, options);
    }

    getProductRecentTransactions(productID) {
        let options = {
            // PropertyList: "ProductID,ProductName,ProductID,ProductDescription,TransactionType,Total Profit (Inc),UnitOfMeasure,SaleDate,TransactionNo,Qty,Line Cost (Ex),Total Amount (Ex)",
            // IncludeProductsUsedInManufacture:true,
            ProductID: productID
        };
        return this.getList(this.ERPObjects.TProductSalesDetailsReport, options);
    }

    getProductRecentTransactionsAll(productID, deleteFilter) {
        let options = {
            select: productID == "all" ? "" : ("[ProductID]='" + productID + "'") ,
            PropertyList: "TransactionDate,ProductName,FirstColumn,SecondColumn,ThirdColumn,Qty,TotalCost,ProductID,ClassID,TransactionNo,AverageCost,Cost,Available,InStock,so,invbo,pobo,onbuild,building,Price,TotalPrice,ExtraDesc,TranstypeDesc,Deptname",
            OrderBy: "TransactionDate DESC"
        };
        if (!deleteFilter) options.Search = "Active = true"
        return this.getList(this.ERPObjects.T_VS1_Report_Productmovement, options);
    }

    getProductList() {
        let options = {
            PropertyList: "ID,Active,ProductPrintName,ProductName,BuyQty1CostInc,SellQty1PriceInc,SalesDescription",
        };
        return this.getList(this.ERPObjects.TProduct, options);
    }

    getNewProductList() {
        let options = {
            PropertyList: "ID,Active,ProductPrintName,ProductName,SalesDescription,BuyQty1CostInc,SellQty1PriceInc,BuyQty1Cost,SellQty1Price,TotalStockQty,TaxCodeSales,TaxCodePurchase,PurchaseDescription,ProductGroup1,BARCODE,TotalQtyInStock",
            select: "[Active]=true"
        };
        return this.getList(this.ERPObjects.TProduct, options);
    }

    getNewProductListVS1() {
        let options = {
            PropertyList: "ID,Active,ProductPrintName,ProductName,ProductType,SalesDescription,BuyQty1CostInc,SellQty1PriceInc,BuyQty1Cost,SellQty1Price,TotalStockQty,TaxCodeSales,TaxCodePurchase,PurchaseDescription,ProductGroup1,BARCODE,TotalQtyInStock,CUSTFLD1,CUSTFLD2",
            select: "[Active]=true"
        };
        return this.getList(this.ERPObjects.TProductVS1, options);
    }

    getNewProductServiceListVS1() {
        let options = {
            PropertyList: "ID,Active,ProductPrintName,ProductName,ProductType,SalesDescription,BuyQty1CostInc,SellQty1PriceInc,BuyQty1Cost,SellQty1Price,TotalStockQty,TaxCodeSales,TaxCodePurchase,PurchaseDescription,ProductGroup1,BARCODE,TotalQtyInStock,CUSTFLD1,CUSTFLD2",
            //select: "[Active]=true and [ProductType]!='INV'"
        };
        return this.getList(this.ERPObjects.TProductVS1, options);
    }

    getProductListDeptQtyList(department) {
        let options = {
            ClassNames: "'" + department + "'",
            //ClassNames: "ID,Active,ProductPrintName,ProductName,SalesDescription,BuyQty1CostInc,SellQty1PriceInc,BuyQty1Cost,SellQty1Price,TotalStockQty,TaxCodeSales,TaxCodePurchase,PurchaseDescription,ProductGroup1,BARCODE,TotalQtyInStock,CUSTFLD1,CUSTFLD2",
            IgnoreDates: true
        };
        return this.getList(this.ERPObjects.TProductLocationQty, options);
    }

    getProductPrintList() {
        let options = {
            PropertyList: "ID,ProductName,SalesDescription,BuyQty1CostInc,AssetAccount,CogsAccount,UOMPurchases,SellQty1PriceInc,IncomeAccount,TaxCodeSales",
            select: "[Active]=true"
        };
        return this.getList(this.ERPObjects.TProduct, options);
    }
    deleteProducts(data) {

        return this.POST(this.ERPObjects.TProduct, data);
    }
    saveAttachment(data) {
        return this.POST(this.ERPObjects.TAttachment, data);
    }
    getProductAttachmentList(productID) {
        let options = {
            PropertyList: "Attachment,AttachmentName,Description,TableId,TableName",
            select: "[TableName]='tblParts' and [Active]=true and [TableID]=" + productID
        };
        return this.getList(this.ERPObjects.TAttachment, options);
    }
    getProductData() {
        let options = {
            PropertyList: "ID,MsTimeStamp,SellQty1PriceInc,BuyQty1CostInc,AssetAccount,PurchaseDescription,IncomeAccount,CogsAccount,SellQty1PriceInc,ProductPrintName,AssetAccount,BuyQty2Cost,BuyQty2CostInc,BuyQTY2,BuyQty3Cost",
        };
        return this.getList(this.ERPObjects.TProduct, options);
    }

    saveProduct(data) {
        return this.POST(this.ERPObjects.TProduct, data);
    }

    saveProductVS1(data) {
        return this.POST(this.ERPObjects.TProductVS1, data);
    }

    saveProductService(data) {
        return this.POST(this.ERPObjects.TServices, data);
    }

    saveEmployeeProducts(data) {
        return this.POST(this.ERPObjects.TRepServices, data);
    }

    getDepartment() {
        let options = {
            PropertyList: "DeptClassName",
            select: "[Active]=true"
        };
        return this.getList(this.ERPObjects.TDeptClass, options);
    }


    getOneProductdata(id) {

        return this.getOneById(this.ERPObjects.TProduct, id);
    }

    getOneProductdatavs1(id) {

        return this.getOneById(this.ERPObjects.TProductVS1, id);
    }

    getOneProductdatavs1byname(dataSearchName) {
        let options = '';
        options = {
            ListType: "Detail",
            select: '[ProductName]="' + dataSearchName + '"'
        };
        return this.getList(this.ERPObjects.TProduct, options);
    }

    getAccountName() {
        let options = {
            PropertyList: "AccountName,AccountTypeName",
            select: "[Active]=true"
        };
        return this.getList(this.ERPObjects.TAccountVS1, options);
    }

    getTaxCodes() {
        let options = {
            PropertyList: "CodeName,Rate,Description,RegionName",
            select: "[Active]=true"
        };
        return this.getList(this.ERPObjects.TTaxCode, options);
    }

    getTaxCodesVS1() {
        let options = {
            PropertyList: "CodeName,Rate,Description,RegionName",
            select: "[Active]=true"
        };
        return this.getList(this.ERPObjects.TTaxcodeVS1, options);
    }

    getOneProductClassQtyData(productID) {
        let options = {
            PropertyList: "ID,ProductID,DepartmentID,DepartmentName,InStockQty,AvailableQty,OnOrderQty,SOQty,SOBOQty,POBOQty",
            select: "[ProductID]=" + productID
        };
        return this.getList(this.ERPObjects.TProductClassQuantity, options);
    }

    getProductClassDataByDeptName(deptname) {
        let options = {
            PropertyList: "ID,DeptName,ProductID",
            select: "[Active]=true and [DeptName]='" + deptname + "'"
        };
        return this.getList(this.ERPObjects.TProductClass, options);
    }

    getProductClassData() {
        let options = {
            PropertyList: "ID,DeptName,ProductID",
            select: "[Active]=true"
        };
        return this.getList(this.ERPObjects.TProductClass, options);
    }

    getProductClassQtyData() {
        let options = {
            PropertyList: "ID,DepartmentName,ProductID,InStockQty",
            // select: "[Active]=true"
        };
        return this.getList(this.ERPObjects.TProductClassQuantity, options);
    }

    getCheckProductData(productName) {
        let options = {
            select: "[ProductName]='" + productName + "' and [Active]=true",
        };
        return this.getList(this.ERPObjects.TProduct, options);
    }

    getClientTypeData() {
        let options = {
            ListType: "Detail",
        };
        return this.getList(this.ERPObjects.TClientType, options);
    }

    saveClientTypeData(data) {
        return this.POST(this.ERPObjects.TClientType, data);
    }

    saveProductClassData(data) {
        return this.POST(this.ERPObjects.TProductClass, data);
    }

    getAllProductList1() {
        let options = {
            PropertyList: "ID,TaxCodePurchase,TaxCodeSales",
            orderby: '"PARTSID desc"',
            LimitCount: 1,
        };
        return this.getList(this.ERPObjects.TProduct, options);
    }

    getSerialNumberList(ProductID) {
        let options = {
            ProductId: ProductID
        };
        return this.getList(this.ERPObjects.TSerialNumberListCurrentReport, options);
    }

    getProductStatus(productName) {
        let options = {
            PropertyList: "ID, ProductName, Batch, SNTracking, SellQty1Price, CUSTFLD13",
            select: "[ProductName]='" + productName + "'",
        };
        return this.getList(this.ERPObjects.TProductVS1, options);
    }

    getProductInfo(productName) {
        let options = {
            select: "[Lines][TInvoiceLine][ProductName]='" + productName + "'",
        }
        return this.getList(this.ERPObjects.TInvoiceEx, options);
    }

    getAllBOMProducts(limitcount, limitfrom, deleteFilter=false) {
        let options = "";
        if (deleteFilter == false) {
            if (limitcount == "All") {
                options = {
                    // ListType: "Detail",
                    PropertyList: "ID, Caption, CustomInputClass, Description, Details, Info, ProcStepItemRef, QtyVariation, TotalQtyOriginal, Value",
                    select: "[ProcStepItemRef]='vs1BOM'",
                    // orderby: '"Description asc"',
                };
            } else {
                options = {
                    // orderby: '"Description asc"',
                    // ListType: "Detail",
                    PropertyList: "ID, Caption, CustomInputClass, Description, Details, Info, ProcStepItemRef, QtyVariation, TotalQtyOriginal, Value",
                    LimitCount: parseInt(limitcount),
                    LimitFrom: parseInt(limitfrom),
                    select: "[ProcStepItemRef]='vs1BOM'",
                };
            }
        } else {
            if (limitcount == "All") {
                options = {
                    PropertyList: "ID, Caption, CustomInputClass, Description, Details, Info, ProcStepItemRef, QtyVariation, TotalQtyOriginal, Value",
                    select: "[ProcStepItemRef]='vs1BOM' OR [ProcStepItemRef]='deleted'",
                    // orderby: '"Description asc"',
                };
            } else {
                options = {
                    // orderby: '"Description asc"',
                    // ListType: "Detail",
                    PropertyList: "ID, Caption, CustomInputClass, Description, Details, Info, ProcStepItemRef, QtyVariation, TotalQtyOriginal, Value",
                    LimitCount: parseInt(limitcount),
                    LimitFrom: parseInt(limitfrom),
                    select: "[ProcStepItemRef]='vs1BOM' OR [ProcStepItemRef]='deleted'",
                };
            }
        }

        return this.getList(this.ERPObjects.TProcTree, options);
    }

    getBOMListByName(productname) {
        let options = {
            // ListType: 'Detail',
            PropertyList: "ID, Caption, CustomInputClass, Description, Details, Info, ProcStepItemRef, QtyVariation, TotalQtyOriginal, Value",
            // LimitCount: 1,
            select: "[Caption] f7like '"+productname+"' and [ProcStepItemRef]='vs1BOM'"
        }
        return this.getList(this.ERPObjects.TProcTree, options);
    }

    getOneBOMProductByName(productname) {
        let options = {
            // ListType: 'Detail',
            PropertyList: "ID, Caption, CustomInputClass, Description, Details, Info, ProcStepItemRef, QtyVariation, TotalQtyOriginal, Value",
            LimitCount: 1,
            select: "[Caption]='"+productname+"' and [ProcStepItemRef]='vs1BOM'"
        }
        return this.getList(this.ERPObjects.TProcTree, options);
    }

    getOneBOMProductByID(id) {
        let options = {
            // ListType: 'Detail',
            PropertyList: "ID, Caption, CustomInputClass, Description, Details, Info, ProcStepItemRef, QtyVariation, TotalQtyOriginal, Value",
            LimitCount: 1,
            select: "[ID]="+id+" and [ProcStepItemRef]='vs1BOM'"
        }
        return this.getList(this.ERPObjects.TProcTree, options)
    }

    saveBOMProduct(data) {
        return this.POST(this.ERPObjects.TProcTree, data)
    }

    getProductBatches() {
        let options = {
            IgnoreDates: true,
            OrderBy: "Batchno asc, Alloctype asc",
            Sarch: "Batchno is not null and Deleted != true",
        };

        return this.getList(this.ERPObjects.TProductBatches, options)
    }

    saveBin(data) {
        return this.POST(this.ERPObjects.TProductBin, data);
    }

    getBins() {
        let options = {
            PropertyList: "ID, BinLocation, BinNumber, BinClassName, Active",
        };
        return this.getList(this.ERPObjects.TProductBin, options);
    }

    getAllBinProductVS1(limitcount, limitfrom, deleteFilter) {
        let options = "";
        if(deleteFilter == "" || deleteFilter == false || deleteFilter == null || deleteFilter == undefined){
          if (limitcount == "All") {
            options = {
                PropertyList: "ID, BinLocation, BinNumber, BinClassName, Active",
              IgnoreDates:true,
              orderby: '"BinLocation asc"',
              Search: "Active = true",
            };
          } else {
            options = {
                PropertyList: "ID, BinLocation, BinNumber, BinClassName, Active",
              IgnoreDates:true,
              orderby: '"BinLocation asc"',
              Search: "Active = true",
              LimitCount: parseInt(limitcount),
              LimitFrom: parseInt(limitfrom),
            };
          }
        }else{
          if (limitcount == "All") {
            options = {
                PropertyList: "ID, BinLocation, BinNumber, BinClassName, Active",
              orderby: '"BinLocation asc"',
              IgnoreDates:true,
            };
          } else {
            options = {
                PropertyList: "ID, BinLocation, BinNumber, BinClassName, Active",
              IgnoreDates:true,
              orderby: '"BinLocation asc"',
              LimitCount: parseInt(limitcount),
              LimitFrom: parseInt(limitfrom),
            };
          }
        }

        return this.getList(this.ERPObjects.TProductBin, options);
      }

    getNewBinListBySearch(dataSearchName) {
        let options = "";
        options = {
          PropertyList: "ID, BinLocation, BinNumber, BinClassName, Active",
          select: 'BinLocation="'+ dataSearchName+ '" OR BinNumber="' + dataSearchName + '"',
        };
        return this.getList(this.ERPObjects.TProductBin, options);
    }
}
