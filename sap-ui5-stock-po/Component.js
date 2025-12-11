sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel"
], function (UIComponent, Device, JSONModel, ODataModel) {
	"use strict";

	return UIComponent.extend("com.company.stockpo.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// Call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// Enable routing
			this.getRouter().initialize();

			// Set the device model
			this.setModel(new JSONModel(Device), "device");

			// Initialize OData models for Purchase Order operations
			this._initializeDataModels();
		},

		/**
		 * Initialize OData models for backend integration
		 * @private
		 */
		_initializeDataModels: function () {
			// Purchase Order OData Service
			// This would typically point to your SAP backend OData service
			// that wraps BAPI_PO_GETDETAIL and related BAPIs
			var sPOServiceUrl = "/sap/opu/odata/sap/ZPO_MANAGEMENT_SRV/";
			var oPOModel = new ODataModel(sPOServiceUrl, {
				json: true,
				useBatch: false
			});
			this.setModel(oPOModel, "poService");

			// Batch Management OData Service
			// This would point to your batch management service
			// that wraps BAPI_BATCH_CREATE, BAPI_BATCH_CHANGE
			var sBatchServiceUrl = "/sap/opu/odata/sap/ZBATCH_MANAGEMENT_SRV/";
			var oBatchModel = new ODataModel(sBatchServiceUrl, {
				json: true,
				useBatch: false
			});
			this.setModel(oBatchModel, "batchService");

			// Delivery Creation OData Service
			// This would point to your delivery service
			// that wraps /SCWM/ODR_CREATE or BAPI_OUTB_DELIVERY_CREATE_SLS
			var sDeliveryServiceUrl = "/sap/opu/odata/sap/ZDELIVERY_MANAGEMENT_SRV/";
			var oDeliveryModel = new ODataModel(sDeliveryServiceUrl, {
				json: true,
				useBatch: false
			});
			this.setModel(oDeliveryModel, "deliveryService");
		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * @public
		 * @override
		 */
		destroy: function () {
			// Call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		}

	});

});