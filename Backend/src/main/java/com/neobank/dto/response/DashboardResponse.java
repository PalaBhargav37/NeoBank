package com.neobank.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {
    private BigDecimal totalBalance;
    private int totalAccounts;
    private long totalTransactions;
    private long pendingLoans;
    private long unreadNotifications;
    private java.util.List<AccountResponse> accounts;
    private java.util.List<TransactionResponse> recentTransactions;
}
