package com.neobank.dto.response;

import com.neobank.entity.enums.LoanStatus;
import com.neobank.entity.enums.LoanType;
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
public class LoanResponse {
    private Long id;
    private LoanType loanType;
    private BigDecimal requestedAmount;
    private BigDecimal approvedAmount;
    private Integer tenureMonths;
    private BigDecimal interestRate;
    private BigDecimal monthlyEmi;
    private String purpose;
    private String remarks;
    private LoanStatus status;
    private Long userId;
    private String userName;
    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
    private Integer paidEmis;
    private java.math.BigDecimal totalPaidAmount;
}
