package com.neobank.entity.enums;

public enum AccountStatus {
    PENDING,      // Waiting for admin approval
    ACTIVE,       // Approved and active
    INACTIVE,     // Temporarily deactivated
    REJECTED,     // Rejected by admin
    FROZEN,       // Frozen by admin
    CLOSED        // Permanently closed
}
