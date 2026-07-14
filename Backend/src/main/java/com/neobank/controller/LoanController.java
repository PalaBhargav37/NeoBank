package com.neobank.controller;

import com.neobank.dto.request.LoanApplicationRequest;
import com.neobank.dto.response.ApiResponse;
import com.neobank.dto.response.LoanResponse;
import com.neobank.service.LoanService;
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
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LoanResponse>>> getMyLoans(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(loanService.getUserLoans(userDetails.getUsername())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LoanResponse>> getLoanById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(loanService.getLoanById(id)));
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<LoanResponse>> applyForLoan(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody LoanApplicationRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Loan application submitted", loanService.applyForLoan(userDetails.getUsername(), request)));
    }

    @PostMapping("/{id}/pay-emi")
    public ResponseEntity<ApiResponse<LoanResponse>> payEmi(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long accountId = Long.parseLong(body.get("accountId").toString());
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        return ResponseEntity.ok(ApiResponse.success("EMI payment successful",
                loanService.payEmi(userDetails.getUsername(), id, accountId, amount)));
    }
}
