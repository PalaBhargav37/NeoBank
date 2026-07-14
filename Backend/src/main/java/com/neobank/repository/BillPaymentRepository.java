package com.neobank.repository;

import com.neobank.entity.BillPayment;
import com.neobank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillPaymentRepository extends JpaRepository<BillPayment, Long> {
    List<BillPayment> findByUserOrderByPaidAtDesc(User user);
}
