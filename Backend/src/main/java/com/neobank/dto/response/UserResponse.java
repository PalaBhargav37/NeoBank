package com.neobank.dto.response;

import com.neobank.entity.enums.KycStatus;
import com.neobank.entity.enums.Role;
import com.neobank.entity.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String dateOfBirth;
    private String address;
    private String city;
    private String country;
    // Extended KYC fields
    private String gender;
    private String state;
    private String district;
    private String pincode;
    private String aadhaarNumber;
    private String panNumber;
    // Nominee
    private String nomineeName;
    private String nomineeRelation;
    private String nomineeMobile;
    private Role role;
    private UserStatus status;
    private KycStatus kycStatus;
    private LocalDateTime createdAt;
}
