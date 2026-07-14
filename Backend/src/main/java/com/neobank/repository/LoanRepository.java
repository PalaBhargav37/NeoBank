package com.neobank.repository;

import com.neobank.entity.Loan;
import com.neobank.entity.User;
import com.neobank.entity.enums.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByUser(User user);
    List<Loan> findByStatus(LoanStatus status);
    List<Loan> findByUserOrderByAppliedAtDesc(User user);
}
