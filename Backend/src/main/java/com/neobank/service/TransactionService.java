package com.neobank.service;

import com.neobank.dto.request.TransferRequest;
import com.neobank.dto.response.TransactionResponse;
import com.neobank.entity.Account;
import com.neobank.entity.Notification;
import com.neobank.entity.Transaction;
import com.neobank.entity.User;
import com.neobank.entity.enums.TransactionStatus;
import com.neobank.entity.enums.TransactionType;
import com.neobank.exception.BadRequestException;
import com.neobank.exception.InsufficientFundsException;
import com.neobank.repository.AccountRepository;
import com.neobank.repository.NotificationRepository;
import com.neobank.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountService accountService;
    private final AccountRepository accountRepository;
    private final UserService userService;
    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<TransactionResponse> getUserTransactions(String email) {
        User user = userService.findByEmail(email);
        List<Account> accounts = accountRepository.findByUser(user);
        return accounts.stream()
                .flatMap(account -> transactionRepository.findAllByAccount(account).stream())
                .distinct()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getAccountTransactions(String accountNumber, String email) {
        User user = userService.findByEmail(email);
        Account account = accountService.findByAccountNumber(accountNumber);
        if (!account.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Access denied");
        }
        return transactionRepository.findAllByAccount(account).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public TransactionResponse transfer(String email, TransferRequest req) {
        User user = userService.findByEmail(email);
        Account fromAccount = accountService.findByAccountNumber(req.getFromAccountNumber());
        Account toAccount = accountService.findByAccountNumber(req.getToAccountNumber());

        if (!fromAccount.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You do not own the source account");
        }
        if (fromAccount.getBalance().compareTo(req.getAmount()) < 0) {
            throw new InsufficientFundsException("Insufficient balance");
        }

        fromAccount.setBalance(fromAccount.getBalance().subtract(req.getAmount()));
        toAccount.setBalance(toAccount.getBalance().add(req.getAmount()));

        Transaction tx = Transaction.builder()
                .transactionId(UUID.randomUUID().toString())
                .type(TransactionType.TRANSFER)
                .amount(req.getAmount())
                .description(req.getDescription())
                .fromAccount(fromAccount)
                .toAccount(toAccount)
                .status(TransactionStatus.COMPLETED)
                .build();
        tx = transactionRepository.save(tx);

        // Notify sender
        notificationRepository.save(Notification.builder()
                .title("Transfer Successful")
                .message("₹" + req.getAmount() + " transferred to account " + req.getToAccountNumber() + ". " + (req.getDescription() != null ? req.getDescription() : ""))
                .type("TRANSACTION")
                .user(user)
                .build());

        // Notify receiver
        if (!toAccount.getUser().getId().equals(user.getId())) {
            notificationRepository.save(Notification.builder()
                    .title("Money Received")
                    .message("₹" + req.getAmount() + " received from account " + req.getFromAccountNumber())
                    .type("TRANSACTION")
                    .user(toAccount.getUser())
                    .build());
        }
        return mapToResponse(tx);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions() {
        return transactionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    public TransactionResponse mapToResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .transactionId(t.getTransactionId())
                .type(t.getType())
                .amount(t.getAmount())
                .description(t.getDescription())
                .fromAccountNumber(t.getFromAccount() != null ? t.getFromAccount().getAccountNumber() : null)
                .toAccountNumber(t.getToAccount() != null ? t.getToAccount().getAccountNumber() : null)
                .status(t.getStatus())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
