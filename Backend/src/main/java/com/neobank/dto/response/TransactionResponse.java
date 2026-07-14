package com.neobank.dto.response;

import com.neobank.entity.enums.TransactionStatus;
import com.neobank.entity.enums.TransactionType;
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
public class TransactionResponse {
    private Long id;
    private String transactionId;
    private TransactionType type;
    private BigDecimal amount;
    private String description;
    private String referenceNumber;
    private String fromAccountNumber;
    private String toAccountNumber;
    private TransactionStatus status;
    private LocalDateTime createdAt;
}
