package com.neobank.repository;

import com.neobank.entity.User;
import com.neobank.entity.enums.Role;
import com.neobank.entity.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    List<User> findByStatus(UserStatus status);
    List<User> findByRole(Role role);
}
