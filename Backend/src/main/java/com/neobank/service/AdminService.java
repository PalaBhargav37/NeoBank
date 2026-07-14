package com.neobank.service;

import com.neobank.repository.AccountRepository;
import com.neobank.repository.LoanRepository;
import com.neobank.repository.TransactionRepository;
import com.neobank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LoanRepository loanRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalAccounts", accountRepository.count());
        stats.put("totalTransactions", transactionRepository.count());
        stats.put("totalLoans", loanRepository.count());
        stats.put("pendingLoans", loanRepository.findByStatus(
                com.neobank.entity.enums.LoanStatus.APPLIED).size());
        stats.put("activeUsers", userRepository.findByStatus(
                com.neobank.entity.enums.UserStatus.ACTIVE).size());
        stats.put("pendingAccounts", accountRepository.countByStatus(
                com.neobank.entity.enums.AccountStatus.PENDING));
        return stats;
    }
}
