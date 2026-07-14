package com.neobank.service;

import com.neobank.dto.request.LoanApplicationRequest;
import com.neobank.dto.response.LoanResponse;
import com.neobank.entity.Loan;
import com.neobank.entity.Notification;
import com.neobank.entity.User;
import com.neobank.entity.enums.LoanStatus;
import com.neobank.entity.enums.Role;
import com.neobank.exception.ResourceNotFoundException;
import com.neobank.repository.LoanRepository;
import com.neobank.repository.NotificationRepository;
import com.neobank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final UserService userService;
    private final AccountService accountService;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<LoanResponse> getUserLoans(String email) {
        User user = userService.findByEmail(email);
        return loanRepository.findByUserOrderByAppliedAtDesc(user)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public LoanResponse applyForLoan(String email, LoanApplicationRequest req) {
        User user = userService.findByEmail(email);
        BigDecimal rate = getInterestRate(req.getLoanType());
        BigDecimal monthlyRate = rate.divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP);
        int n = req.getTenureMonths();
        BigDecimal emi = req.getRequestedAmount().multiply(monthlyRate)
                .multiply(monthlyRate.add(BigDecimal.ONE).pow(n))
                .divide(monthlyRate.add(BigDecimal.ONE).pow(n).subtract(BigDecimal.ONE), 2, RoundingMode.HALF_UP);

        Loan loan = Loan.builder()
                .loanType(req.getLoanType())
                .requestedAmount(req.getRequestedAmount())
                .tenureMonths(req.getTenureMonths())
                .interestRate(rate)
                .monthlyEmi(emi)
                .purpose(req.getPurpose())
                .status(LoanStatus.APPLIED)
                .user(user)
                .build();
        loan = loanRepository.save(loan);

        notificationRepository.save(Notification.builder()
                .title("Loan Application Submitted")
                .message("Your " + req.getLoanType().name().replace("_", " ")
                        + " loan application for ₹" + req.getRequestedAmount() + " is under review. We will notify you once a decision is made.")
                .type("LOAN")
                .user(user)
                .build());

        // Notify all admin users
        final Loan savedLoan = loan;
        String adminMsg = "New " + req.getLoanType().name().replace("_", " ")
                + " loan application for ₹" + req.getRequestedAmount()
                + " from " + user.getFirstName() + " " + user.getLastName()
                + " (ID: " + savedLoan.getId() + "). Please review.";
        userRepository.findByRole(Role.ADMIN).forEach(admin ->
                notificationRepository.save(Notification.builder()
                        .title("New Loan Application")
                        .message(adminMsg)
                        .type("LOAN")
                        .user(admin)
                        .build()));

        return mapToResponse(loan);
    }

    /** Per-type annual interest rates (% p.a.) */
    private BigDecimal getInterestRate(com.neobank.entity.enums.LoanType type) {
        return switch (type) {
            case HOME             -> BigDecimal.valueOf(8.5);
            case AGRICULTURE      -> BigDecimal.valueOf(7.0);
            case EDUCATION        -> BigDecimal.valueOf(9.0);
            case GOLD             -> BigDecimal.valueOf(9.5);
            case VEHICLE          -> BigDecimal.valueOf(10.5);
            case TWO_WHEELER      -> BigDecimal.valueOf(11.0);
            case MEDICAL          -> BigDecimal.valueOf(12.0);
            case PERSONAL         -> BigDecimal.valueOf(12.5);
            case CONSUMER_DURABLE -> BigDecimal.valueOf(13.0);
            case BUSINESS         -> BigDecimal.valueOf(14.0);
        };
    }

    @Transactional
    public LoanResponse updateLoanStatus(Long id, String status, String remarks) {
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));
        loan.setStatus(LoanStatus.valueOf(status));
        loan.setRemarks(remarks);
        loan.setReviewedAt(LocalDateTime.now());
        if (LoanStatus.APPROVED.name().equals(status)) {
            loan.setApprovedAmount(loan.getRequestedAmount());
        }
        loan = loanRepository.save(loan);

        String msg = LoanStatus.APPROVED.name().equals(status)
                ? "🎉 Congratulations! Your " + loan.getLoanType().name().replace("_"," ")
                  + " loan of ₹" + loan.getRequestedAmount() + " has been APPROVED. EMI: ₹" + loan.getMonthlyEmi() + "/month."
                : "Your " + loan.getLoanType().name().replace("_"," ")
                  + " loan application has been " + status.toLowerCase() + ". Remarks: " + (remarks != null ? remarks : "N/A");
        notificationRepository.save(Notification.builder()
                .title("Loan Status Update")
                .message(msg)
                .type("LOAN")
                .user(loan.getUser())
                .build());

        return mapToResponse(loan);
    }

    @Transactional(readOnly = true)
    public List<LoanResponse> getAllLoans() {
        return loanRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LoanResponse getLoanById(Long id) {
        return mapToResponse(loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found")));
    }

    @Transactional
    public LoanResponse payEmi(String email, Long loanId, Long accountId, BigDecimal amount) {
        User user = userService.findByEmail(email);
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));
        if (!loan.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: loan does not belong to this user");
        }
        if (loan.getStatus() != LoanStatus.APPROVED && loan.getStatus() != LoanStatus.DISBURSED) {
            throw new RuntimeException("Loan is not in an active state for EMI payment");
        }

        // Calculate total payable and outstanding
        BigDecimal monthlyEmi = loan.getMonthlyEmi() != null ? loan.getMonthlyEmi() : BigDecimal.ZERO;
        BigDecimal totalPayable = monthlyEmi.multiply(BigDecimal.valueOf(loan.getTenureMonths()));
        BigDecimal alreadyPaid = loan.getTotalPaidAmount() == null ? BigDecimal.ZERO : loan.getTotalPaidAmount();
        BigDecimal outstanding = totalPayable.subtract(alreadyPaid);

        if (outstanding.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("This loan is already fully repaid.");
        }

        // Cap payment at outstanding — prevent overpayment
        BigDecimal actualAmount = amount.compareTo(outstanding) > 0 ? outstanding : amount;

        // Use paidEmis count for description (increment by 1 from current)
        int currentPaidEmis = loan.getPaidEmis() == null ? 0 : loan.getPaidEmis();
        BigDecimal newTotalPaid = alreadyPaid.add(actualAmount);

        // Recalculate paidEmis based on total amount paid vs monthly EMI
        int newPaidEmis;
        if (monthlyEmi.compareTo(BigDecimal.ZERO) > 0) {
            newPaidEmis = newTotalPaid.compareTo(totalPayable) >= 0
                    ? loan.getTenureMonths()
                    : newTotalPaid.divide(monthlyEmi, 0, RoundingMode.FLOOR).intValue();
        } else {
            newPaidEmis = currentPaidEmis + 1;
        }

        String description = "EMI #" + (currentPaidEmis + 1) + " — " + loan.getLoanType().name().replace("_", " ") + " Loan #" + loanId;
        accountService.withdraw(accountId, email, actualAmount, description);

        loan.setTotalPaidAmount(newTotalPaid);
        loan.setPaidEmis(newPaidEmis);

        // Close loan if fully paid
        if (newTotalPaid.compareTo(totalPayable) >= 0) {
            loan.setStatus(LoanStatus.CLOSED);
        }
        loan = loanRepository.save(loan);

        int remaining = loan.getTenureMonths() - newPaidEmis;
        String notifMsg = remaining <= 0
                ? "🎉 Congratulations! Your " + loan.getLoanType().name().replace("_", " ") + " loan has been fully repaid!"
                : "EMI payment of ₹" + actualAmount.setScale(2, RoundingMode.HALF_UP)
                  + " for your " + loan.getLoanType().name().replace("_", " ")
                  + " loan has been recorded. " + remaining + " EMIs remaining.";
        notificationRepository.save(Notification.builder()
                .title("EMI Payment Successful")
                .message(notifMsg)
                .type("LOAN")
                .user(user)
                .build());

        return mapToResponse(loan);
    }

    public LoanResponse mapToResponse(Loan loan) {
        return LoanResponse.builder()
                .id(loan.getId())
                .loanType(loan.getLoanType())
                .requestedAmount(loan.getRequestedAmount())
                .approvedAmount(loan.getApprovedAmount())
                .tenureMonths(loan.getTenureMonths())
                .interestRate(loan.getInterestRate())
                .monthlyEmi(loan.getMonthlyEmi())
                .purpose(loan.getPurpose())
                .remarks(loan.getRemarks())
                .status(loan.getStatus())
                .userId(loan.getUser().getId())
                .userName(loan.getUser().getFirstName() + " " + loan.getUser().getLastName())
                .appliedAt(loan.getAppliedAt())
                .reviewedAt(loan.getReviewedAt())
                .paidEmis(loan.getPaidEmis() == null ? 0 : loan.getPaidEmis())
                .totalPaidAmount(loan.getTotalPaidAmount() == null ? BigDecimal.ZERO : loan.getTotalPaidAmount())
                .build();
    }
}
