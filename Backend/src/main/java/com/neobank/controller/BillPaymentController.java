package com.neobank.controller;

import com.neobank.dto.request.BillPaymentRequest;
import com.neobank.dto.response.ApiResponse;
import com.neobank.dto.response.BillPaymentResponse;
import com.neobank.service.BillPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillPaymentController {

    private final BillPaymentService billPaymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BillPaymentResponse>>> getMyBillPayments(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(billPaymentService.getUserBillPayments(userDetails.getUsername())));
    }

    @PostMapping("/pay")
    public ResponseEntity<ApiResponse<BillPaymentResponse>> payBill(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BillPaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Bill paid successfully", billPaymentService.payBill(userDetails.getUsername(), request)));
    }
}
