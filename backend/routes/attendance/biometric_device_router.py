from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from models.biometric_device_models import BiometricDeviceCreate, BiometricDeviceUpdate, BiometricDeviceResponse, BiometricDeviceListResponse
from services.attendance.biometric_device_service import BiometricDeviceService

biometric_device_router = APIRouter(prefix="/biometric-devices", tags=["biometric-devices"])

@biometric_device_router.post("/", response_model=BiometricDeviceResponse)
async def create_device(device_data: BiometricDeviceCreate):
    """Create a new biometric device"""
    try:
        # Convert Pydantic model to dict
        device_dict = device_data.model_dump()
        
        # Create device
        created_device = BiometricDeviceService.create_device(device_dict)
        if not created_device:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create device"
            )
        
        return BiometricDeviceResponse(**created_device)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error creating device: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create device"
        )

@biometric_device_router.get("/", response_model=List[BiometricDeviceResponse])
async def get_all_devices(active_only: bool = Query(False, description="Filter active devices only")):
    """Get all biometric devices"""
    try:
        devices = BiometricDeviceService.get_all_devices(active_only=active_only)
        print(f"Retrieved {len(devices)} devices from service")
        
        device_responses = []
        for device in devices:
            try:
                device_responses.append(BiometricDeviceResponse(**device))
            except Exception as e:
                print(f"Error creating BiometricDeviceResponse for device {device.get('device_id', 'unknown')}: {e}")
                print(f"Device data: {device}")
                raise
        
        return device_responses
        
    except Exception as e:
        print(f"Error getting devices: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve devices: {str(e)}"
        )

@biometric_device_router.get("/{device_id}", response_model=BiometricDeviceResponse)
async def get_device(device_id: str):
    """Get a specific biometric device by ID"""
    try:
        device = BiometricDeviceService.get_device_by_id(device_id)
        if not device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )
        
        return BiometricDeviceResponse(**device)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting device: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve device"
        )

@biometric_device_router.put("/{device_id}", response_model=BiometricDeviceResponse)
async def update_device(device_id: str, device_data: BiometricDeviceUpdate):
    """Update a biometric device"""
    try:
        # Convert Pydantic model to dict, excluding None values
        update_dict = device_data.model_dump(exclude_unset=True)
        
        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Update device
        updated_device = BiometricDeviceService.update_device(device_id, update_dict)
        if not updated_device:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update device"
            )
        
        return BiometricDeviceResponse(**updated_device)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating device: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update device"
        )

@biometric_device_router.delete("/{device_id}")
async def delete_device(device_id: str):
    """Soft delete a biometric device"""
    try:
        success = BiometricDeviceService.delete_device(device_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete device"
            )
        
        return {"message": "Device deleted successfully"}
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting device: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete device"
        )

@biometric_device_router.delete("/{device_id}/hard")
async def hard_delete_device(device_id: str):
    """Hard delete a biometric device from database"""
    try:
        success = BiometricDeviceService.hard_delete_device(device_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete device"
            )
        
        return {"message": "Device permanently deleted"}
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error hard deleting device: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete device"
        )

