package com.neobank.controller;

import com.neobank.dto.response.*;
import com.neobank.entity.Account;
import com.neobank.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final AccountService accountService;
    private final TransactionService transactionService;
    private final LoanService loanService;
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        List<AccountResponse> accounts = accountService.getUserAccounts(email);
        BigDecimal totalBalance = accounts.stream()
                .map(AccountResponse::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        List<TransactionResponse> recentTx = transactionService.getUserTransactions(email)
                .stream().limit(5).collect(Collectors.toList());
        long pendingLoans = loanService.getUserLoans(email).stream()
                .filter(l -> l.getStatus().name().equals("APPLIED") || l.getStatus().name().equals("UNDER_REVIEW")).count();
        long unread = notificationService.getUnreadCount(email);

        DashboardResponse dashboard = DashboardResponse.builder()
                .totalBalance(totalBalance)
                .totalAccounts(accounts.size())
                .totalTransactions(recentTx.size())
                .pendingLoans(pendingLoans)
                .unreadNotifications(unread)
                .accounts(accounts)
                .recentTransactions(recentTx)
                .build();
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }
}
