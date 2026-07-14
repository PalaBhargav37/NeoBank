package com.neobank.dto.response;

import com.neobank.entity.enums.AccountStatus;
import com.neobank.entity.enums.AccountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccountResponse {
    private Long id;
    private String accountNumber;
    private AccountType accountType;
    private BigDecimal balance;
    private AccountStatus status;
    private String currency;
    private Long userId;
    private String ownerName;
    private LocalDateTime createdAt;

    // Bank details (populated after admin approval)
    private String ifscCode;
    private String micrCode;
    private String branchName;
    private String bankName;
    private String branchCode;
    private String rejectionReason;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
}
