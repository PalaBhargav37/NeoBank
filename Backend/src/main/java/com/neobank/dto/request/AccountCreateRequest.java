package com.neobank.dto.request;

import com.neobank.entity.enums.AccountType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AccountCreateRequest {
    @NotNull
    private AccountType accountType;
    private String currency;
}
