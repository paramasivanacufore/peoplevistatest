from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional

from models.leave_allocation_models import (
    LeaveAllocationRuleCreate, LeaveAllocationRuleUpdate, LeaveAllocationRuleResponse, 
    LeaveAllocationRuleListResponse, LeaveTypeResponse
)
from services.leave_allocation_service import LeaveAllocationService

# Create router
leave_allocation_router = APIRouter(prefix="/leave-allocation-rules", tags=["Leave Allocation Rules"])

@leave_allocation_router.post("/", response_model=LeaveAllocationRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_rule(rule_data: LeaveAllocationRuleCreate):
    """Create a new leave allocation rule"""
    try:
        # Convert Pydantic model to dict
        rule_dict = rule_data.model_dump()
        
        # Create rule
        created_rule = LeaveAllocationService.create_rule(rule_dict)
        if not created_rule:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create leave allocation rule"
            )
        
        return LeaveAllocationRuleResponse(**created_rule)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error creating leave allocation rule: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create leave allocation rule"
        )

@leave_allocation_router.get("/", response_model=LeaveAllocationRuleListResponse)
async def get_all_rules(
    active_only: bool = Query(False, description="Get only active rules"),
    leave_type_id: Optional[int] = Query(None, description="Filter by leave type ID")
):
    """Get all leave allocation rules with optional filters"""
    try:
        rules = LeaveAllocationService.get_all_rules(
            active_only=active_only,
            leave_type_id=leave_type_id
        )
        
        return LeaveAllocationRuleListResponse(
            total=len(rules),
            rules=[LeaveAllocationRuleResponse(**rule) for rule in rules]
        )
        
    except Exception as e:
        print(f"Error getting leave allocation rules: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve leave allocation rules"
        )

@leave_allocation_router.get("/{rule_id}", response_model=LeaveAllocationRuleResponse)
async def get_rule(rule_id: int):
    """Get a specific leave allocation rule by ID"""
    try:
        rule = LeaveAllocationService.get_rule_by_id(rule_id)
        
        if not rule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Leave allocation rule with ID '{rule_id}' not found"
            )
        
        return LeaveAllocationRuleResponse(**rule)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting leave allocation rule: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve leave allocation rule"
        )

@leave_allocation_router.put("/{rule_id}", response_model=LeaveAllocationRuleResponse)
async def update_rule(rule_id: int, rule_data: LeaveAllocationRuleUpdate):
    """Update a leave allocation rule"""
    try:
        # Convert Pydantic model to dict, excluding None values
        update_dict = rule_data.model_dump(exclude_unset=True)
        
        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Update rule
        updated_rule = LeaveAllocationService.update_rule(rule_id, update_dict)
        if not updated_rule:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update leave allocation rule"
            )
        
        return LeaveAllocationRuleResponse(**updated_rule)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating leave allocation rule: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update leave allocation rule"
        )

@leave_allocation_router.delete("/{rule_id}")
async def delete_rule(
    rule_id: int,
    permanent: bool = Query(False, description="Permanently delete rule")
):
    """Delete a leave allocation rule (soft delete by default)"""
    try:
        if not LeaveAllocationService.check_rule_exists(rule_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Leave allocation rule with ID '{rule_id}' not found"
            )
        
        if permanent:
            success = LeaveAllocationService.hard_delete_rule(rule_id)
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to permanently delete rule"
                )
            return {"message": f"Leave allocation rule '{rule_id}' permanently deleted"}
        else:
            success = LeaveAllocationService.delete_rule(rule_id)
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to deactivate rule"
                )
            return {"message": f"Leave allocation rule '{rule_id}' deactivated"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting leave allocation rule: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete leave allocation rule"
        )

@leave_allocation_router.get("/leave-types/list", response_model=list[LeaveTypeResponse])
async def get_leave_types():
    """Get all active leave types"""
    try:
        leave_types = LeaveAllocationService.get_leave_types()
        return [LeaveTypeResponse(**leave_type) for leave_type in leave_types]
        
    except Exception as e:
        print(f"Error getting leave types: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve leave types"
        )

