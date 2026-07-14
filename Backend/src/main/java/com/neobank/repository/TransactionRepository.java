package com.neobank.repository;

import com.neobank.entity.Account;
import com.neobank.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM Transaction t WHERE t.fromAccount = :account OR t.toAccount = :account ORDER BY t.createdAt DESC")
    List<Transaction> findAllByAccount(Account account);

    Optional<Transaction> findByTransactionId(String transactionId);

    List<Transaction> findAllByOrderByCreatedAtDesc();
}
