sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment"
], function (Controller, JSONModel, MessageToast, MessageBox, Fragment) {
	"use strict";

	return Controller.extend("com.company.stockpo.controller.StockPO", {

		/**
		 * Controller initialization
		 */
		onInit: function () {
			this._initializeModels();
			this._loadPurchaseOrderData();
		},

		/**
		 * Initialize data models
		 */
		_initializeModels: function () {
			// Initialize PO Model
			var oPOModel = new JSONModel();
			this.getView().setModel(oPOModel, "poModel");

			// Initialize Batch Model
			var oBatchModel = new JSONModel({
				batchNumber: "",
				manufacturingDate: null,
				expirationDate: null,
				vendorBatch: "",
				additionalInfo: "",
				currentItem: null
			});
			this.getView().setModel(oBatchModel, "batchModel");
		},

		/**
		 * Load Purchase Order data from backend
		 */
		_loadPurchaseOrderData: function () {
			// Simulate OData call to backend BAPI_PO_GETDETAIL
			// In real implementation, this would call OData service
			
			var oMockData = this._getMockPOData();
			var oPOModel = this.getView().getModel("poModel");
			oPOModel.setData(oMockData);
			
			// Calculate derived properties
			this._calculateSelectedItems();
		},

		/**
		 * Get mock PO data for testing
		 */
		_getMockPOData: function () {
			return {
				poNumber: "4800000878",
				supplierRisk: "N/A",
				vendor: {
					code: "602814",
					name: "Fisher Scientific UK",
					address: "Bishop Meadow Road, Loughborough, LE11 5RG, LEC, GB"
				},
				createdBy: "KMURARISETTY",
				createdOn: "09/26/2025",
				companyCode: "3141",
				purchaseOrg: "ZDIR",
				items: [
					{
						selected: false,
						item: "10",
						materialCode: "36000330",
						materialDescription: "VIAL 40ML TOC WITH CAP",
						openQuantity: "99994",
						openQuantityUnit: "PAK",
						qtyToBeReceived: "99994",
						buomQuantity: "7199568",
						buomUnit: "EA",
						batchNumber: "",
						recInQI: "",
						vendorMaterialNo: "15173488",
						plant: "GB0",
						plantDescription: "2",
						storageLocation: "WH01",
						storageLocationDescription: "Warehouse EWM",
						hazardousMaterial: "FLAMMABLE",
						isHazardous: true
					},
					{
						selected: false,
						item: "20",
						materialCode: "M0180",
						materialDescription: "Pipette, 25mL Poly Serological",
						openQuantity: "999999",
						openQuantityUnit: "CS",
						qtyToBeReceived: "999999",
						buomQuantity: "3999996",
						buomUnit: "PAK",
						batchNumber: "",
						recInQI: "",
						vendorMaterialNo: "11517752",
						plant: "GB0",
						plantDescription: "2",
						storageLocation: "WH01",
						storageLocationDescription: "Warehouse EWM",
						hazardousMaterial: "",
						isHazardous: false
					}
				],
				selectedItemsCount: 0,
				hasSelectedItems: false
			};
		},

		/**
		 * Navigation back handler
		 */
		onNavBack: function () {
			var oHistory = sap.ui.core.routing.History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("home", true);
			}
		},

		/**
		 * Open batch creation/edit dialog
		 */
		onCreateBatch: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext("poModel");
			var oItem = oBindingContext.getObject();
			
			// Store current item context
			var oBatchModel = this.getView().getModel("batchModel");
			oBatchModel.setProperty("/currentItem", oItem);
			
			// Load existing batch data if available
			if (oItem.batchNumber) {
				this._loadBatchData(oItem.batchNumber);
			} else {
				// Reset batch model for new batch
				oBatchModel.setData({
					batchNumber: "",
					manufacturingDate: null,
					expirationDate: null,
					vendorBatch: "",
					additionalInfo: "",
					currentItem: oItem
				});
			}
			
			// Open batch dialog
			this._openBatchDialog();
		},

		/**
		 * Open batch creation dialog
		 */
		_openBatchDialog: function () {
			var oView = this.getView();
			
			if (!this._oBatchDialog) {
				Fragment.load({
					id: oView.getId(),
					name: "com.company.stockpo.fragment.BatchDialog",
					controller: this
				}).then(function (oDialog) {
					this._oBatchDialog = oDialog;
					oView.addDependent(this._oBatchDialog);
					this._oBatchDialog.open();
				}.bind(this));
			} else {
				this._oBatchDialog.open();
			}
		},

		/**
		 * Load existing batch data from backend
		 */
		_loadBatchData: function (sBatchNumber) {
			// Simulate OData call to load batch details
			// In real implementation, this would call BAPI_BATCH_GETDETAIL
			
			var oBatchModel = this.getView().getModel("batchModel");
			var oMockBatchData = {
				batchNumber: sBatchNumber,
				manufacturingDate: new Date(),
				expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
				vendorBatch: "VB-" + sBatchNumber,
				additionalInfo: "Batch loaded from system"
			};
			
			oBatchModel.setData(Object.assign(oBatchModel.getData(), oMockBatchData));
		},

		/**
		 * Save batch data
		 */
		onSaveBatch: function () {
			var oBatchModel = this.getView().getModel("batchModel");
			var oBatchData = oBatchModel.getData();
			
			// Validate required fields
			if (!oBatchData.batchNumber || !oBatchData.manufacturingDate) {
				MessageBox.error("Please fill in all required fields (Batch Number and Manufacturing Date).");
				return;
			}
			
			// Simulate OData call to create/update batch
			// In real implementation, this would call BAPI_BATCH_CREATE or BAPI_BATCH_CHANGE
			
			this._saveBatchToBackend(oBatchData).then(function (sNewBatchNumber) {
				// Update the item with the new/updated batch number
				var oCurrentItem = oBatchData.currentItem;
				if (oCurrentItem) {
					oCurrentItem.batchNumber = sNewBatchNumber;
					
					// Refresh the model
					var oPOModel = this.getView().getModel("poModel");
					oPOModel.refresh();
				}
				
				MessageToast.show("Batch " + sNewBatchNumber + " saved successfully");
				this._oBatchDialog.close();
			}.bind(this));
		},

		/**
		 * Cancel batch dialog
		 */
		onCancelBatch: function () {
			this._oBatchDialog.close();
		},

		/**
		 * Save batch data to backend
		 */
		_saveBatchToBackend: function (oBatchData) {
			return new Promise(function (resolve, reject) {
				// Simulate async backend call
				setTimeout(function () {
					// Generate batch number if not provided
					var sBatchNumber = oBatchData.batchNumber || "BT" + Date.now();
					resolve(sBatchNumber);
				}, 500);
			});
		},

		/**
		 * Refresh PO data
		 */
		onRefresh: function () {
			MessageToast.show("Refreshing Purchase Order data...");
			this._loadPurchaseOrderData();
		},

		/**
		 * Create delivery for selected items
		 */
		onCreateDelivery: function () {
			var oPOModel = this.getView().getModel("poModel");
			var aSelectedItems = oPOModel.getData().items.filter(function (oItem) {
				return oItem.selected;
			});
			
			if (aSelectedItems.length === 0) {
				MessageBox.warning("Please select at least one item to create a delivery.");
				return;
			}
			
			// Validate quantities
			var bValidationError = false;
			aSelectedItems.forEach(function (oItem) {
				if (!oItem.qtyToBeReceived || parseInt(oItem.qtyToBeReceived) <= 0) {
					bValidationError = true;
				}
				if (parseInt(oItem.qtyToBeReceived) > parseInt(oItem.openQuantity)) {
					bValidationError = true;
				}
			});
			
			if (bValidationError) {
				MessageBox.error("Please ensure all selected items have valid quantities that do not exceed the open quantity.");
				return;
			}
			
			// Create delivery
			this._createDeliveryInBackend(aSelectedItems).then(function (sDeliveryNumber) {
				MessageToast.show("Delivery " + sDeliveryNumber + " created successfully.");
				
				// Refresh PO data to update open quantities
				this._loadPurchaseOrderData();
			}.bind(this)).catch(function (oError) {
				MessageBox.error("Failed to create delivery: " + oError.message);
			});
		},

		/**
		 * Create delivery in backend system
		 */
		_createDeliveryInBackend: function (aSelectedItems) {
			return new Promise(function (resolve, reject) {
				// Simulate OData call to /SCWM/ODR_CREATE or BAPI_OUTB_DELIVERY_CREATE_SLS
				setTimeout(function () {
					var sDeliveryNumber = "DL" + Date.now();
					resolve(sDeliveryNumber);
				}, 1000);
			});
		},

		/**
		 * Calculate selected items count
		 */
		_calculateSelectedItems: function () {
			var oPOModel = this.getView().getModel("poModel");
			var oData = oPOModel.getData();
			
			if (oData && oData.items) {
				var iSelectedCount = oData.items.filter(function (oItem) {
					return oItem.selected;
				}).length;
				
				oData.selectedItemsCount = iSelectedCount;
				oData.hasSelectedItems = iSelectedCount > 0;
				oPOModel.refresh();
			}
		},

		/**
		 * Handle item selection changes
		 */
		onItemSelectionChange: function () {
			this._calculateSelectedItems();
		}
		
	});
});