package com.neobank.service;

import com.neobank.dto.request.BillPaymentRequest;
import com.neobank.dto.response.BillPaymentResponse;
import com.neobank.entity.Account;
import com.neobank.entity.BillPayment;
import com.neobank.entity.Notification;
import com.neobank.entity.Transaction;
import com.neobank.entity.User;
import com.neobank.entity.enums.TransactionStatus;
import com.neobank.entity.enums.TransactionType;
import com.neobank.exception.InsufficientFundsException;
import com.neobank.repository.BillPaymentRepository;
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
public class BillPaymentService {

    private final BillPaymentRepository billPaymentRepository;
    private final AccountService accountService;
    private final UserService userService;
    private final TransactionRepository transactionRepository;
    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<BillPaymentResponse> getUserBillPayments(String email) {
        User user = userService.findByEmail(email);
        return billPaymentRepository.findByUserOrderByPaidAtDesc(user)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public BillPaymentResponse payBill(String email, BillPaymentRequest req) {
        User user = userService.findByEmail(email);
        Account account = accountService.findByAccountNumber(req.getFromAccountNumber());

        if (!account.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        if (account.getBalance().compareTo(req.getAmount()) < 0) {
            throw new InsufficientFundsException("Insufficient balance");
        }

        account.setBalance(account.getBalance().subtract(req.getAmount()));

        BillPayment bill = BillPayment.builder()
                .billType(req.getBillType())
                .provider(req.getProvider())
                .accountReference(req.getAccountReference())
                .billNumber(req.getBillNumber())
                .amount(req.getAmount())
                .status("SUCCESS")
                .user(user)
                .paidFromAccount(account)
                .build();
        bill = billPaymentRepository.save(bill);

        Transaction tx = Transaction.builder()
                .transactionId(UUID.randomUUID().toString())
                .type(TransactionType.BILL_PAYMENT)
                .amount(req.getAmount())
                .description("Bill Payment: " + req.getBillType() + " - " + req.getProvider())
                .fromAccount(account)
                .status(TransactionStatus.COMPLETED)
                .build();
        transactionRepository.save(tx);

        notificationRepository.save(Notification.builder()
                .title("Bill Payment Successful")
                .message("₹" + req.getAmount() + " paid for " + req.getBillType() + " to " + req.getProvider()
                        + ". Bill No: " + req.getBillNumber())
                .type("TRANSACTION")
                .user(user)
                .build());

        return mapToResponse(bill);
    }

    @Transactional(readOnly = true)
    public List<BillPaymentResponse> getAllBillPayments() {
        return billPaymentRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public BillPaymentResponse mapToResponse(BillPayment b) {
        return BillPaymentResponse.builder()
                .id(b.getId())
                .billType(b.getBillType())
                .provider(b.getProvider())
                .accountReference(b.getAccountReference())
                .billNumber(b.getBillNumber())
                .amount(b.getAmount())
                .status(b.getStatus())
                .fromAccountNumber(b.getPaidFromAccount().getAccountNumber())
                .paidAt(b.getPaidAt())
                .build();
    }
}
