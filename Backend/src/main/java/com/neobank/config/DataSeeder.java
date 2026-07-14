package com.neobank.config;

import com.neobank.entity.Account;
import com.neobank.entity.Notification;
import com.neobank.entity.User;
import com.neobank.entity.enums.AccountType;
import com.neobank.entity.enums.KycStatus;
import com.neobank.entity.enums.Role;
import com.neobank.entity.enums.UserStatus;
import com.neobank.repository.AccountRepository;
import com.neobank.repository.NotificationRepository;
import com.neobank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedAdmin();
        seedCustomer();
    }

    private void seedAdmin() {
        if (userRepository.existsByEmail("admin@neobank.com")) {
            return;
        }
        User admin = User.builder()
                .email("admin@neobank.com")
                .password(passwordEncoder.encode("admin123"))
                .firstName("Admin")
                .lastName("NeoBank")
                .phone("1000000001")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .kycStatus(KycStatus.APPROVED)
                .build();
        userRepository.save(admin);
        log.info("Admin user seeded: admin@neobank.com / admin123");
    }

    private void seedCustomer() {
        if (userRepository.existsByEmail("customer@neobank.com")) {
            return;
        }
        User customer = User.builder()
                .email("customer@neobank.com")
                .password(passwordEncoder.encode("password123"))
                .firstName("John")
                .lastName("Doe")
                .phone("1000000002")
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .kycStatus(KycStatus.APPROVED)
                .build();
        customer = userRepository.save(customer);

        // Savings account with balance
        Account savings = Account.builder()
                .accountNumber("NEO-SAV-000001")
                .accountType(AccountType.SAVINGS)
                .balance(BigDecimal.valueOf(250000.00))
                .currency("INR")
                .user(customer)
                .build();
        accountRepository.save(savings);

        // Current account
        Account current = Account.builder()
                .accountNumber("NEO-CHK-000001")
                .accountType(AccountType.CURRENT)
                .balance(BigDecimal.valueOf(100000.00))
                .currency("INR")
                .user(customer)
                .build();
        accountRepository.save(current);

        // Welcome notification
        Notification notif = Notification.builder()
                .title("Welcome to NeoBank!")
                .message("Your demo account is ready. Savings account NEO-SAV-000001 has been created with ₹2,50,000 balance.")
                .type("SYSTEM")
                .user(customer)
                .build();
        notificationRepository.save(notif);

        log.info("Demo customer seeded: customer@neobank.com / password123");
    }
}
