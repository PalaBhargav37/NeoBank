package com.neobank.controller;

import com.neobank.dto.response.*;
import com.neobank.dto.request.ProfileUpdateRequest;
import com.neobank.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;
    private final TransactionService transactionService;
    private final LoanService loanService;
    private final BillPaymentService billPaymentService;
    private final AccountService accountService;
    private final NotificationService notificationService;

    // ── Dashboard ─────────────────────────────────────────────────
    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    // ── Users ─────────────────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @GetMapping("/users/{id}/accounts")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getUserAccounts(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(accountService.getAccountsByUserId(id)));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id, @RequestBody ProfileUpdateRequest body) {
        return ResponseEntity.ok(ApiResponse.success("User updated successfully",
                userService.adminUpdateUser(id, body)));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                userService.updateUserStatus(id, body.get("status"))));
    }

    // ── Account Requests ─────────────────────────────────────────
    @GetMapping("/accounts")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getAllAccountRequests() {
        return ResponseEntity.ok(ApiResponse.success(accountService.getAllAccounts()));
    }

    @GetMapping("/accounts/pending")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getPendingAccountRequests() {
        return ResponseEntity.ok(ApiResponse.success(accountService.getPendingAccounts()));
    }

    @PutMapping("/accounts/{id}/approve")
    public ResponseEntity<ApiResponse<AccountResponse>> approveAccount(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Account approved successfully",
                accountService.approveAccount(id, userDetails.getUsername())));
    }

    @PutMapping("/accounts/{id}/reject")
    public ResponseEntity<ApiResponse<AccountResponse>> rejectAccount(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Account request rejected",
                accountService.rejectAccount(id, userDetails.getUsername(), body.get("reason"))));
    }

    // ── Transactions ──────────────────────────────────────────────
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getAllTransactions() {
        return ResponseEntity.ok(ApiResponse.success(transactionService.getAllTransactions()));
    }

    // ── Loans ─────────────────────────────────────────────────────
    @GetMapping("/loans")
    public ResponseEntity<ApiResponse<List<LoanResponse>>> getAllLoans() {
        return ResponseEntity.ok(ApiResponse.success(loanService.getAllLoans()));
    }

    @PutMapping("/loans/{id}/status")
    public ResponseEntity<ApiResponse<LoanResponse>> updateLoanStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Loan status updated",
                loanService.updateLoanStatus(id, body.get("status"), body.get("remarks"))));
    }

    // ── Admin Notifications ───────────────────────────────────────
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAdminNotifications(
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUserNotifications(ud.getUsername())));
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<ApiResponse<Long>> getAdminUnreadCount(
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadCount(ud.getUsername())));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markNotifRead(
            @PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.markAsRead(id, ud.getUsername())));
    }

    @PutMapping("/notifications/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(
            @AuthenticationPrincipal UserDetails ud) {
        notificationService.markAllAsRead(ud.getUsername());
        return ResponseEntity.ok(ApiResponse.success("All marked as read", null));
    }
}
