import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BatchDialog = ({ isOpen, onClose, item, onSave }) => {
  const [formData, setFormData] = useState({
    batchNumber: '',
    manufacturingDate: '',
    expirationDate: '',
    vendorBatch: '',
    additionalInfo: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && item) {
      // Reset form when dialog opens
      setFormData({
        batchNumber: item.batchNumber || '',
        manufacturingDate: '',
        expirationDate: '',
        vendorBatch: '',
        additionalInfo: ''
      });
      setErrors({});
    }
  }, [isOpen, item]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.batchNumber.trim()) {
      newErrors.batchNumber = 'Batch number is required';
    }
    
    if (!formData.manufacturingDate) {
      newErrors.manufacturingDate = 'Manufacturing date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        const batchData = {
          batchNumber: formData.batchNumber,
          manufacturingDate: formData.manufacturingDate,
          expirationDate: formData.expirationDate || null,
          vendorBatch: formData.vendorBatch || null,
          additionalInfo: formData.additionalInfo || null,
          materialCode: item.materialCode,
          plant: item.plant,
          storageLocation: item.storageLocation
        };

        const response = await axios.post(`${API}/batch`, batchData);
        
        onSave({
          ...response.data,
          itemId: item.id
        });
        
        alert(`Batch ${response.data.batchNumber} created successfully!`);
      } catch (error) {
        console.error('Error creating batch:', error);
        alert(`Error creating batch: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      batchNumber: '',
      manufacturingDate: '',
      expirationDate: '',
      vendorBatch: '',
      additionalInfo: ''
    });
    setErrors({});
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create/Update Batch</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Batch Number */}
          <div className="space-y-2">
            <Label htmlFor="batchNumber">
              Batch Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="batchNumber"
              value={formData.batchNumber}
              onChange={(e) => handleInputChange('batchNumber', e.target.value)}
              placeholder="Enter batch number"
              className={errors.batchNumber ? 'border-red-500' : ''}
              data-testid="batch-number-input"
            />
            {errors.batchNumber && (
              <p className="text-sm text-red-500">{errors.batchNumber}</p>
            )}
          </div>

          {/* Manufacturing Date */}
          <div className="space-y-2">
            <Label htmlFor="manufacturingDate">
              Manufacturing Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="manufacturingDate"
              type="date"
              value={formData.manufacturingDate}
              onChange={(e) => handleInputChange('manufacturingDate', e.target.value)}
              className={errors.manufacturingDate ? 'border-red-500' : ''}
              data-testid="manufacturing-date-input"
            />
            {errors.manufacturingDate && (
              <p className="text-sm text-red-500">{errors.manufacturingDate}</p>
            )}
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="expirationDate">Expiration Date</Label>
            <Input
              id="expirationDate"
              type="date"
              value={formData.expirationDate}
              onChange={(e) => handleInputChange('expirationDate', e.target.value)}
              data-testid="expiration-date-input"
            />
          </div>

          {/* Vendor Batch */}
          <div className="space-y-2">
            <Label htmlFor="vendorBatch">Vendor Batch</Label>
            <Input
              id="vendorBatch"
              value={formData.vendorBatch}
              onChange={(e) => handleInputChange('vendorBatch', e.target.value)}
              placeholder="Enter vendor batch number"
              data-testid="vendor-batch-input"
            />
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              placeholder="Enter additional batch information"
              rows={3}
              data-testid="additional-info-textarea"
            />
          </div>

          {/* Material Information (Read-only) */}
          <div className="space-y-2 bg-gray-50 p-3 rounded-md">
            <Label className="text-gray-600">Material</Label>
            <div className="text-sm text-gray-900">
              {item.materialCode} - {item.materialDescription}
            </div>
          </div>

          {/* Plant / Storage Location (Read-only) */}
          <div className="space-y-2 bg-gray-50 p-3 rounded-md">
            <Label className="text-gray-600">Plant / Storage Location</Label>
            <div className="text-sm text-gray-900">
              {item.plant} / {item.storageLocation}
            </div>
          </div>
        </div>

        {/* Dialog Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            data-testid="batch-cancel-button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="batch-save-button"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BatchDialog;