package com.neobank.service;

import com.neobank.dto.request.AccountCreateRequest;
import com.neobank.dto.response.AccountResponse;
import com.neobank.entity.Account;
import com.neobank.entity.Notification;
import com.neobank.entity.Transaction;
import com.neobank.entity.User;
import com.neobank.entity.enums.AccountStatus;
import com.neobank.entity.enums.AccountType;
import com.neobank.entity.enums.TransactionStatus;
import com.neobank.entity.enums.TransactionType;
import com.neobank.exception.BadRequestException;
import com.neobank.exception.InsufficientFundsException;
import com.neobank.exception.ResourceNotFoundException;
import com.neobank.entity.enums.Role;
import com.neobank.repository.AccountRepository;
import com.neobank.repository.NotificationRepository;
import com.neobank.repository.TransactionRepository;
import com.neobank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserService userService;
    private final NotificationRepository notificationRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    // ── User: get my accounts ────────────────────────────────────
    @Transactional(readOnly = true)
    public List<AccountResponse> getUserAccounts(String email) {
        User user = userService.findByEmail(email);
        return accountRepository.findByUser(user).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccountById(Long id, String email) {
        User user = userService.findByEmail(email);
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        if (!account.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Access denied");
        }
        return mapToResponse(account);
    }

    // ── User: submit account opening request (status = PENDING) ──
    @Transactional
    public AccountResponse createAccount(String email, AccountCreateRequest req) {
        User user = userService.findByEmail(email);

        // Generate a unique temporary reference number
        String tempRef = "REQ-" + String.format("%06d", accountRepository.count() + 1);

        Account account = Account.builder()
                .accountNumber(tempRef)           // temporary; replaced on approval
                .accountType(req.getAccountType())
                .balance(BigDecimal.ZERO)
                .status(AccountStatus.PENDING)
                .currency(req.getCurrency() != null ? req.getCurrency() : "INR")
                .bankName("NeoBank")
                .branchName("NeoBank Main Branch")
                .user(user)
                .build();

        Account saved = accountRepository.save(account);

        // Notify the customer
        sendNotification(user,
                "Account Request Submitted",
                "Your " + req.getAccountType().name().replace("_", " ")
                        + " account request has been submitted. Ref: " + tempRef
                        + ". You will be notified once the admin reviews it.",
                "ACCOUNT");

        // Notify all admin users
        String adminMsg = "New " + req.getAccountType().name().replace("_", " ")
                + " account request from " + user.getFirstName() + " " + user.getLastName()
                + " (Ref: " + tempRef + "). Please review and approve.";
        userRepository.findByRole(Role.ADMIN).forEach(admin ->
                sendNotification(admin, "New Account Request", adminMsg, "ACCOUNT"));

        return mapToResponse(saved);
    }

    // ── Admin: get all account requests ──────────────────────────
    @Transactional(readOnly = true)
    public List<AccountResponse> getAllAccounts() {
        return accountRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getAccountsByUserId(Long userId) {
        return accountRepository.findByUserId(userId).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getPendingAccounts() {
        return accountRepository.findByStatus(AccountStatus.PENDING).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    // ── Admin: approve account ────────────────────────────────────
    @Transactional
    public AccountResponse approveAccount(Long id, String adminEmail) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (account.getStatus() != AccountStatus.PENDING) {
            throw new BadRequestException("Only PENDING accounts can be approved");
        }

        // Generate proper bank account number and IFSC
        String accountNumber = generateAccountNumber(account.getAccountType());
        String ifscCode      = "NEOB0001001";   // NeoBank IFSC (fixed branch)
        String micrCode      = generateMicrCode();
        String branchCode    = "001001";

        account.setAccountNumber(accountNumber);
        account.setStatus(AccountStatus.ACTIVE);
        account.setIfscCode(ifscCode);
        account.setMicrCode(micrCode);
        account.setBranchCode(branchCode);
        account.setBranchName("NeoBank Main Branch, Mumbai");
        account.setBankName("NeoBank Ltd.");
        account.setReviewedBy(adminEmail);
        account.setReviewedAt(LocalDateTime.now());

        Account saved = accountRepository.save(account);

        // Notify customer
        sendNotification(account.getUser(),
                "✅ Account Approved!",
                "Congratulations! Your " + account.getAccountType().name().replace("_", " ")
                        + " account has been approved. Account Number: " + accountNumber
                        + " | IFSC: " + ifscCode,
                "ACCOUNT");

        return mapToResponse(saved);
    }

    // ── Admin: reject account ─────────────────────────────────────
    @Transactional
    public AccountResponse rejectAccount(Long id, String adminEmail, String reason) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (account.getStatus() != AccountStatus.PENDING) {
            throw new BadRequestException("Only PENDING accounts can be rejected");
        }

        account.setStatus(AccountStatus.REJECTED);
        account.setRejectionReason(reason != null ? reason : "Application did not meet requirements.");
        account.setReviewedBy(adminEmail);
        account.setReviewedAt(LocalDateTime.now());

        Account saved = accountRepository.save(account);

        sendNotification(account.getUser(),
                "❌ Account Request Rejected",
                "Your " + account.getAccountType().name().replace("_", " ")
                        + " account request was rejected. Reason: "
                        + account.getRejectionReason(),
                "ACCOUNT");

        return mapToResponse(saved);
    }

    // ── Helpers ───────────────────────────────────────────────────
    private String generateAccountNumber(AccountType type) {
        String prefix = switch (type) {
            case SAVINGS      -> "NEOSAV";
            case CURRENT      -> "NEOCUR";
            case FIXED_DEPOSIT-> "NEOFD0";
        };
        // 6-digit zero-padded sequential number
        long count = accountRepository.countByStatus(AccountStatus.ACTIVE) + 1;
        return prefix + String.format("%06d", count);
    }

    private String generateMicrCode() {
        // 9-digit MICR: city(3) + bank(3) + branch(3)
        return "400" + "002" + String.format("%03d", (int)(Math.random() * 999) + 1);
    }

    private void sendNotification(User user, String title, String message, String type) {
        try {
            Notification n = Notification.builder()
                    .user(user)
                    .title(title)
                    .message(message)
                    .type(type)
                    .isRead(false)
                    .build();
            notificationRepository.save(n);
        } catch (Exception ignored) { /* non-critical */ }
    }

    // ── Lookup helper used by other services ─────────────────────
    public Account findByAccountNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));
    }

    @Transactional
    public AccountResponse deposit(Long id, String email, BigDecimal amount, String description) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        User user = userService.findByEmail(email);
        if (!account.getUser().getId().equals(user.getId()))
            throw new BadRequestException("Access denied");
        if (account.getStatus() != AccountStatus.ACTIVE)
            throw new BadRequestException("Only ACTIVE accounts can receive deposits");
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0)
            throw new BadRequestException("Deposit amount must be positive");
        BigDecimal maxDeposit = switch (account.getAccountType()) {
            case CURRENT       -> new BigDecimal("10000000"); // 1 Crore
            case FIXED_DEPOSIT -> new BigDecimal("50000000"); // 5 Crore
            default            -> new BigDecimal("200000");   // 2 Lakh (SAVINGS)
        };
        if (amount.compareTo(maxDeposit) > 0)
            throw new BadRequestException("Deposit limit for " + account.getAccountType().name().replace("_", " ")
                    + " account is ₹" + maxDeposit.toPlainString() + " per transaction");
        if (amount.compareTo(new BigDecimal("1")) < 0)
            throw new BadRequestException("Minimum deposit amount is ₹1");

        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        transactionRepository.save(Transaction.builder()
                .transactionId(UUID.randomUUID().toString())
                .type(TransactionType.CREDIT)
                .amount(amount)
                .description(description != null && !description.isBlank() ? description : "Cash Deposit")
                .toAccount(account)
                .status(TransactionStatus.COMPLETED)
                .build());

        sendNotification(user, "Deposit Successful",
                "₹" + amount + " credited to account " + account.getAccountNumber()
                        + ". New balance: ₹" + account.getBalance(), "TRANSACTION");
        return mapToResponse(account);
    }

    // ── User: withdraw money ──────────────────────────────────────
    @Transactional
    public AccountResponse withdraw(Long id, String email, BigDecimal amount) {
        return withdraw(id, email, amount, null);
    }

    @Transactional
    public AccountResponse withdraw(Long id, String email, BigDecimal amount, String description) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        User user = userService.findByEmail(email);
        if (!account.getUser().getId().equals(user.getId()))
            throw new BadRequestException("Access denied");
        if (account.getStatus() != AccountStatus.ACTIVE)
            throw new BadRequestException("Only ACTIVE accounts can process withdrawals");
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0)
            throw new BadRequestException("Withdrawal amount must be positive");
        BigDecimal maxWithdraw = switch (account.getAccountType()) {
            case CURRENT       -> new BigDecimal("5000000");  // 50 Lakh
            case FIXED_DEPOSIT -> new BigDecimal("10000000"); // 1 Crore
            default            -> new BigDecimal("100000");   // 1 Lakh (SAVINGS)
        };
        if (amount.compareTo(maxWithdraw) > 0)
            throw new BadRequestException("Withdrawal limit for " + account.getAccountType().name().replace("_", " ")
                    + " account is ₹" + maxWithdraw.toPlainString() + " per transaction");
        if (amount.compareTo(new BigDecimal("100")) < 0)
            throw new BadRequestException("Minimum withdrawal amount is ₹100");
        if (account.getBalance().compareTo(amount) < 0)
            throw new InsufficientFundsException("Insufficient balance. Available: ₹" + account.getBalance());

        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        transactionRepository.save(Transaction.builder()
                .transactionId(UUID.randomUUID().toString())
                .type(TransactionType.DEBIT)
                .amount(amount)
                .description(description != null && !description.isBlank() ? description : "Cash Withdrawal")
                .fromAccount(account)
                .status(TransactionStatus.COMPLETED)
                .build());

        sendNotification(user, "Withdrawal Successful",
                "₹" + amount + " debited from account " + account.getAccountNumber()
                        + ". Remaining balance: ₹" + account.getBalance(), "TRANSACTION");
        return mapToResponse(account);
    }

    public AccountResponse mapToResponse(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .accountType(account.getAccountType())
                .balance(account.getBalance())
                .status(account.getStatus())
                .currency(account.getCurrency())
                .userId(account.getUser().getId())
                .ownerName(account.getUser().getFirstName() + " " + account.getUser().getLastName())
                .createdAt(account.getCreatedAt())
                .ifscCode(account.getIfscCode())
                .micrCode(account.getMicrCode())
                .branchName(account.getBranchName())
                .bankName(account.getBankName())
                .branchCode(account.getBranchCode())
                .rejectionReason(account.getRejectionReason())
                .reviewedBy(account.getReviewedBy())
                .reviewedAt(account.getReviewedAt())
                .build();
    }
}
