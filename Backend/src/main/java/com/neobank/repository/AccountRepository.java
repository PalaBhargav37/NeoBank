package com.neobank.repository;

import com.neobank.entity.Account;
import com.neobank.entity.User;
import com.neobank.entity.enums.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUser(User user);
    List<Account> findByUserAndStatus(User user, AccountStatus status);
    List<Account> findByStatus(AccountStatus status);
    List<Account> findAllByOrderByCreatedAtDesc();
    Optional<Account> findByAccountNumber(String accountNumber);
    boolean existsByAccountNumber(String accountNumber);
    long countByStatus(AccountStatus status);
    List<Account> findByUserId(Long userId);
}
