package com.neobank.dto.request;

import com.neobank.entity.enums.LoanType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LoanApplicationRequest {
    @NotNull
    private LoanType loanType;
    @NotNull @DecimalMin("1000.00")
    private BigDecimal requestedAmount;
    @NotNull @Min(6)
    private Integer tenureMonths;
    private String purpose;
}
