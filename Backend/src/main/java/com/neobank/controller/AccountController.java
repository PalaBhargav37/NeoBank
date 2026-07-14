package com.neobank.controller;

import com.neobank.dto.request.AccountCreateRequest;
import com.neobank.dto.response.AccountResponse;
import com.neobank.dto.response.ApiResponse;
import com.neobank.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getMyAccounts(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(accountService.getUserAccounts(userDetails.getUsername())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccountById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(accountService.getAccountById(id, userDetails.getUsername())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AccountCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Account request submitted",
                accountService.createAccount(userDetails.getUsername(), request)));
    }

    @PostMapping("/{id}/deposit")
    public ResponseEntity<ApiResponse<AccountResponse>> deposit(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        BigDecimal amount = new java.math.BigDecimal(body.get("amount").toString());
        String description = body.containsKey("description") && body.get("description") != null
                ? body.get("description").toString() : null;
        return ResponseEntity.ok(ApiResponse.success("Deposit successful",
                accountService.deposit(id, userDetails.getUsername(), amount, description)));
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<ApiResponse<AccountResponse>> withdraw(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        BigDecimal amount = new java.math.BigDecimal(body.get("amount").toString());
        String description = body.containsKey("description") && body.get("description") != null
                ? body.get("description").toString() : null;
        return ResponseEntity.ok(ApiResponse.success("Withdrawal successful",
                accountService.withdraw(id, userDetails.getUsername(), amount, description)));
    }
}
