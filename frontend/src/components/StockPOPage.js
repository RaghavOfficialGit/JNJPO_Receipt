import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Warehouse } from 'lucide-react';
import BatchDialog from './BatchDialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StockPOPage = () => {
  const [poData, setPOData] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isItemsSectionOpen, setIsItemsSectionOpen] = useState(true);

  // Load PO data from backend API
  useEffect(() => {
    loadPOData();
  }, []);

  const loadPOData = async () => {
    try {
      const response = await axios.get(`${API}/po/4800000878`);
      const data = response.data;
      // Add selection state to items
      data.items = data.items.map(item => ({ ...item, selected: false }));
      setPOData(data);
    } catch (error) {
      console.error('Error loading PO data:', error);
      // Fallback to mock data if API fails
      loadMockData();
    }
  };

  const loadMockData = () => {
    const mockData = {
      poNumber: '4800000878',
      supplierRisk: 'N/A',
      vendor: {
        code: '602814',
        name: 'Fisher Scientific UK',
        address: 'Bishop Meadow Road, Loughborough, LE11 5RG, LEC, GB'
      },
      createdBy: 'KMURARISETTY',
      createdOn: '09/26/2025',
      companyCode: '3141',
      purchaseOrg: 'ZDIR',
      items: [
        {
          id: 1,
          selected: false,
          item: '10',
          materialCode: '36000330',
          materialDescription: 'VIAL 40ML TOC WITH CAP',
          openQuantity: '99994',
          openQuantityUnit: 'PAK',
          qtyToBeReceived: '99994',
          buomQuantity: '7199568',
          buomUnit: 'EA',
          batchNumber: '',
          recInQI: '',
          vendorMaterialNo: '15173488',
          plant: 'GB0',
          plantDescription: '2',
          storageLocation: 'WH01',
          storageLocationDescription: 'Warehouse EWM',
          hazardousMaterial: 'FLAMMABLE',
          isHazardous: true
        },
        {
          id: 2,
          selected: false,
          item: '20',
          materialCode: 'M0180',
          materialDescription: 'Pipette, 25mL Poly Serological',
          openQuantity: '999999',
          openQuantityUnit: 'CS',
          qtyToBeReceived: '999999',
          buomQuantity: '3999996',
          buomUnit: 'PAK',
          batchNumber: '',
          recInQI: '',
          vendorMaterialNo: '11517752',
          plant: 'GB0',
          plantDescription: '2',
          storageLocation: 'WH01',
          storageLocationDescription: 'Warehouse EWM',
          hazardousMaterial: '',
          isHazardous: false
        }
      ]
    };
    setPOData(mockData);
  };

  const handleItemSelection = (itemId, checked) => {
    const updatedItems = poData.items.map(item => 
      item.id === itemId ? { ...item, selected: checked } : item
    );
    setPOData({ ...poData, items: updatedItems });
    
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleCreateBatch = (item) => {
    setCurrentItem(item);
    setShowBatchDialog(true);
  };

  const handleQtyChange = (itemId, newQty) => {
    const updatedItems = poData.items.map(item => 
      item.id === itemId ? { ...item, qtyToBeReceived: newQty } : item
    );
    setPOData({ ...poData, items: updatedItems });
  };

  const handleCreateDelivery = async () => {
    try {
      const selectedItemsData = poData.items
        .filter(item => item.selected)
        .map(item => ({
          itemId: item.id,
          quantity: item.qtyToBeReceived,
          batchNumber: item.batchNumber || null
        }));

      const deliveryData = {
        poNumber: poData.poNumber,
        items: selectedItemsData
      };

      const response = await axios.post(`${API}/delivery`, deliveryData);
      alert(`Delivery ${response.data.deliveryNumber} created successfully!`);
      
      // Refresh PO data
      await loadPOData();
      setSelectedItems([]);
    } catch (error) {
      console.error('Error creating delivery:', error);
      alert(`Error creating delivery: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleRefresh = async () => {
    try {
      await loadPOData();
      setSelectedItems([]);
      alert('Purchase Order data refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('Error refreshing Purchase Order data');
    }
  };

  const handleNavBack = () => {
    window.history.back();
  };

  if (!poData) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <button 
            onClick={handleNavBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Stock PO
          </button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Purchase Order Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-600 mb-2">Purchase Order</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">{poData.poNumber}</h1>
            </div>
            <div className="text-right">
              <span className="text-gray-700">Supplier Risk: {poData.supplierRisk}</span>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="space-y-2">
            <div className="flex">
              <span className="text-gray-600 w-32">Vendor:</span>
              <span className="text-gray-900">{poData.vendor.code} {poData.vendor.name}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-32">Vendor Address:</span>
              <span className="text-gray-900">{poData.vendor.address}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-32">Created By / On:</span>
              <span className="text-gray-900">{poData.createdBy} / {poData.createdOn}</span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-32">Company Code / Purchase Org:</span>
              <span className="text-gray-900">{poData.companyCode} / {poData.purchaseOrg}</span>
            </div>
          </div>
        </div>

        {/* Purchase Order Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <Collapsible open={isItemsSectionOpen} onOpenChange={setIsItemsSectionOpen}>
            <CollapsibleTrigger className="w-full px-6 py-4 text-left border-b border-gray-200 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-900">
                  Purchase Order Items ({poData.items.length})
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                  isItemsSectionOpen ? 'rotate-180' : ''
                }`} />
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        Select
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                        Item
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                        Material
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Open Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Qty to be Received
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        BUoM Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                        Batch
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        Rec. in QI
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Vendor Material No.
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        Plant
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                        SLoc
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                        Haz. Material
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {poData.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <Checkbox
                            checked={item.selected}
                            onCheckedChange={(checked) => handleItemSelection(item.id, checked)}
                            data-testid={`item-${item.id}-checkbox`}
                          />
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">{item.item}</td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.materialCode}</div>
                            <div className="text-sm text-gray-600">{item.materialDescription}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 text-right">
                            {item.openQuantity} {item.openQuantityUnit}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Input
                            type="number"
                            value={item.qtyToBeReceived}
                            onChange={(e) => handleQtyChange(item.id, e.target.value)}
                            className="w-20 text-right text-sm"
                            data-testid={`qty-input-${item.id}`}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 text-right">
                            {item.buomQuantity} {item.buomUnit}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleCreateBatch(item)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            data-testid={`create-batch-${item.id}`}
                          >
                            Create Batch
                          </button>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">{item.recInQI}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{item.vendorMaterialNo}</td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{item.plant}</div>
                          <div className="text-sm text-gray-600">{item.plantDescription}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900 mr-2">{item.storageLocation}</span>
                            <Warehouse className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="text-sm text-gray-600">{item.storageLocationDescription}</div>
                        </td>
                        <td className="px-4 py-4">
                          {item.isHazardous && (
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              {item.hazardousMaterial}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:text-gray-800"
            data-testid="refresh-button"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <Button
            onClick={handleCreateDelivery}
            disabled={selectedItems.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            data-testid="create-delivery-button"
          >
            Create Delivery ({selectedItems.length})
          </Button>
        </div>
      </div>

      {/* Batch Dialog */}
      {showBatchDialog && (
        <BatchDialog
          isOpen={showBatchDialog}
          onClose={() => setShowBatchDialog(false)}
          item={currentItem}
          onSave={(batchData) => {
            console.log('Batch saved:', batchData);
            // Update the item with the new batch number
            const updatedItems = poData.items.map(item => 
              item.id === batchData.itemId 
                ? { ...item, batchNumber: batchData.batchNumber }
                : item
            );
            setPOData({ ...poData, items: updatedItems });
            setShowBatchDialog(false);
          }}
        />
      )}
    </div>
  );
};

export default StockPOPage;