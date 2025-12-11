from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI(title="Stock PO Management API")
api_router = APIRouter(prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data for Purchase Orders
MOCK_PO_DATA = {
    "4800000878": {
        "poNumber": "4800000878",
        "supplierRisk": "N/A",
        "vendor": {
            "code": "602814",
            "name": "Fisher Scientific UK",
            "address": "Bishop Meadow Road, Loughborough, LE11 5RG, LEC, GB"
        },
        "createdBy": "KMURARISETTY",
        "createdOn": "09/26/2025",
        "companyCode": "3141",
        "purchaseOrg": "ZDIR",
        "items": [
            {
                "id": 1,
                "item": "10",
                "materialCode": "36000330",
                "materialDescription": "VIAL 40ML TOC WITH CAP",
                "openQuantity": "99994",
                "openQuantityUnit": "PAK",
                "qtyToBeReceived": "99994",
                "buomQuantity": "7199568",
                "buomUnit": "EA",
                "batchNumber": "",
                "recInQI": "",
                "vendorMaterialNo": "15173488",
                "plant": "GB0",
                "plantDescription": "2",
                "storageLocation": "WH01",
                "storageLocationDescription": "Warehouse EWM",
                "hazardousMaterial": "FLAMMABLE",
                "isHazardous": True
            },
            {
                "id": 2,
                "item": "20",
                "materialCode": "M0180",
                "materialDescription": "Pipette, 25mL Poly Serological",
                "openQuantity": "999999",
                "openQuantityUnit": "CS",
                "qtyToBeReceived": "999999",
                "buomQuantity": "3999996",
                "buomUnit": "PAK",
                "batchNumber": "",
                "recInQI": "",
                "vendorMaterialNo": "11517752",
                "plant": "GB0",
                "plantDescription": "2",
                "storageLocation": "WH01",
                "storageLocationDescription": "Warehouse EWM",
                "hazardousMaterial": "",
                "isHazardous": False
            }
        ]
    }
}

# Storage for batches
BATCH_STORAGE = {}

# Data Models
class PurchaseOrderItem(BaseModel):
    id: int
    item: str
    materialCode: str
    materialDescription: str
    openQuantity: str
    openQuantityUnit: str
    qtyToBeReceived: str
    buomQuantity: str
    buomUnit: str
    batchNumber: str
    recInQI: str
    vendorMaterialNo: str
    plant: str
    plantDescription: str
    storageLocation: str
    storageLocationDescription: str
    hazardousMaterial: str
    isHazardous: bool

class Vendor(BaseModel):
    code: str
    name: str
    address: str

class PurchaseOrder(BaseModel):
    poNumber: str
    supplierRisk: str
    vendor: Vendor
    createdBy: str
    createdOn: str
    companyCode: str
    purchaseOrg: str
    items: List[PurchaseOrderItem]

class BatchCreate(BaseModel):
    batchNumber: str
    manufacturingDate: str
    expirationDate: Optional[str] = None
    vendorBatch: Optional[str] = None
    additionalInfo: Optional[str] = None
    materialCode: str
    plant: str
    storageLocation: str

class BatchResponse(BaseModel):
    id: str
    batchNumber: str
    manufacturingDate: str
    expirationDate: Optional[str] = None
    vendorBatch: Optional[str] = None
    additionalInfo: Optional[str] = None
    materialCode: str
    plant: str
    storageLocation: str
    createdAt: datetime

class DeliveryItem(BaseModel):
    itemId: int
    quantity: str
    batchNumber: Optional[str] = None

class DeliveryCreate(BaseModel):
    poNumber: str
    items: List[DeliveryItem]

class DeliveryResponse(BaseModel):
    deliveryNumber: str
    poNumber: str
    items: List[DeliveryItem]
    createdAt: datetime
    status: str

# API Routes

@api_router.get("/")
async def root():
    return {"message": "Stock PO Management API"}

@api_router.get("/po/{po_number}", response_model=PurchaseOrder)
async def get_purchase_order(po_number: str):
    """
    Get Purchase Order details by PO number.
    In real implementation, this would call BAPI_PO_GETDETAIL.
    """
    if po_number not in MOCK_PO_DATA:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    
    return MOCK_PO_DATA[po_number]

@api_router.post("/batch", response_model=BatchResponse)
async def create_batch(batch_data: BatchCreate):
    """
    Create a new batch for a material.
    In real implementation, this would call BAPI_BATCH_CREATE.
    """
    batch_id = str(uuid.uuid4())
    
    # Check if batch number already exists
    for existing_batch in BATCH_STORAGE.values():
        if (existing_batch["batchNumber"] == batch_data.batchNumber and 
            existing_batch["materialCode"] == batch_data.materialCode and
            existing_batch["plant"] == batch_data.plant):
            raise HTTPException(status_code=400, detail="Batch number already exists for this material and plant")
    
    # Create new batch
    new_batch = {
        "id": batch_id,
        "batchNumber": batch_data.batchNumber,
        "manufacturingDate": batch_data.manufacturingDate,
        "expirationDate": batch_data.expirationDate,
        "vendorBatch": batch_data.vendorBatch,
        "additionalInfo": batch_data.additionalInfo,
        "materialCode": batch_data.materialCode,
        "plant": batch_data.plant,
        "storageLocation": batch_data.storageLocation,
        "createdAt": datetime.now()
    }
    
    BATCH_STORAGE[batch_id] = new_batch
    
    return BatchResponse(**new_batch)

@api_router.get("/batch/{batch_id}", response_model=BatchResponse)
async def get_batch(batch_id: str):
    """
    Get batch details by batch ID.
    In real implementation, this would call BAPI_BATCH_GETDETAIL.
    """
    if batch_id not in BATCH_STORAGE:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    return BatchResponse(**BATCH_STORAGE[batch_id])

@api_router.put("/batch/{batch_id}", response_model=BatchResponse)
async def update_batch(batch_id: str, batch_data: BatchCreate):
    """
    Update an existing batch.
    In real implementation, this would call BAPI_BATCH_CHANGE.
    """
    if batch_id not in BATCH_STORAGE:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # Update batch data
    updated_batch = BATCH_STORAGE[batch_id]
    updated_batch.update({
        "batchNumber": batch_data.batchNumber,
        "manufacturingDate": batch_data.manufacturingDate,
        "expirationDate": batch_data.expirationDate,
        "vendorBatch": batch_data.vendorBatch,
        "additionalInfo": batch_data.additionalInfo,
        "materialCode": batch_data.materialCode,
        "plant": batch_data.plant,
        "storageLocation": batch_data.storageLocation
    })
    
    return BatchResponse(**updated_batch)

@api_router.post("/delivery", response_model=DeliveryResponse)
async def create_delivery(delivery_data: DeliveryCreate):
    """
    Create a delivery for selected PO items.
    In real implementation, this would call /SCWM/ODR_CREATE or BAPI_OUTB_DELIVERY_CREATE_SLS.
    """
    if delivery_data.poNumber not in MOCK_PO_DATA:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    
    # Generate delivery number
    delivery_number = f"DL{int(datetime.now().timestamp())}"
    
    # Validate items exist in PO
    po_items = {item["id"]: item for item in MOCK_PO_DATA[delivery_data.poNumber]["items"]}
    
    for delivery_item in delivery_data.items:
        if delivery_item.itemId not in po_items:
            raise HTTPException(status_code=400, detail=f"Item {delivery_item.itemId} not found in PO")
        
        # Validate quantity
        po_item = po_items[delivery_item.itemId]
        if int(delivery_item.quantity) > int(po_item["openQuantity"]):
            raise HTTPException(
                status_code=400, 
                detail=f"Delivery quantity ({delivery_item.quantity}) exceeds open quantity ({po_item['openQuantity']}) for item {delivery_item.itemId}"
            )
    
    # Create delivery response
    delivery_response = DeliveryResponse(
        deliveryNumber=delivery_number,
        poNumber=delivery_data.poNumber,
        items=delivery_data.items,
        createdAt=datetime.now(),
        status="Created"
    )
    
    return delivery_response

@api_router.get("/po/{po_number}/batches")
async def get_po_batches(po_number: str):
    """
    Get all batches associated with a PO.
    """
    if po_number not in MOCK_PO_DATA:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    
    po_batches = []
    po_materials = [item["materialCode"] for item in MOCK_PO_DATA[po_number]["items"]]
    
    for batch in BATCH_STORAGE.values():
        if batch["materialCode"] in po_materials:
            po_batches.append(BatchResponse(**batch))
    
    return po_batches

# Health check
@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Include the router
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)