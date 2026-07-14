package com.neobank.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BillPaymentRequest {
    @NotBlank
    private String billType;
    @NotBlank
    private String provider;
    @NotBlank
    private String accountReference;
    @NotBlank
    private String billNumber;
    @NotNull @DecimalMin("0.01")
    private BigDecimal amount;
    @NotBlank
    private String fromAccountNumber;
}
