package com.neobank.dto.response;

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
public class BillPaymentResponse {
    private Long id;
    private String billType;
    private String provider;
    private String accountReference;
    private String billNumber;
    private BigDecimal amount;
    private String status;
    private String fromAccountNumber;
    private LocalDateTime paidAt;
}
