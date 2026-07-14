package com.neobank.dto.request;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
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
}
