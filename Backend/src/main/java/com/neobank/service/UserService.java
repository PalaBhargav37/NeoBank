package com.neobank.service;

import com.neobank.dto.request.ProfileUpdateRequest;
import com.neobank.dto.response.UserResponse;
import com.neobank.entity.User;
import com.neobank.exception.BadRequestException;
import com.neobank.exception.ResourceNotFoundException;
import com.neobank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getUserProfile(String email) {
        User user = findByEmail(email);
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String email, ProfileUpdateRequest req) {
        User user = findByEmail(email);
        if (req.getFirstName() != null) user.setFirstName(req.getFirstName());
        if (req.getLastName() != null) user.setLastName(req.getLastName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getDateOfBirth() != null) user.setDateOfBirth(req.getDateOfBirth());
        if (req.getAddress() != null) user.setAddress(req.getAddress());
        if (req.getCity() != null) user.setCity(req.getCity());
        if (req.getCountry() != null) user.setCountry(req.getCountry());
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = findByEmail(email);
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        return mapToResponse(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found")));
    }

    @Transactional
    public UserResponse updateUserStatus(Long id, String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(com.neobank.entity.enums.UserStatus.valueOf(status));
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse adminUpdateUser(Long id, ProfileUpdateRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (req.getFirstName()       != null && !req.getFirstName().isBlank())       user.setFirstName(req.getFirstName());
        if (req.getLastName()        != null && !req.getLastName().isBlank())        user.setLastName(req.getLastName());
        if (req.getPhone()           != null && !req.getPhone().isBlank())           user.setPhone(req.getPhone());
        if (req.getDateOfBirth()     != null) user.setDateOfBirth(req.getDateOfBirth());
        if (req.getAddress()         != null) user.setAddress(req.getAddress());
        if (req.getCity()            != null) user.setCity(req.getCity());
        if (req.getCountry()         != null) user.setCountry(req.getCountry());
        if (req.getGender()          != null) user.setGender(req.getGender());
        if (req.getState()           != null) user.setState(req.getState());
        if (req.getDistrict()        != null) user.setDistrict(req.getDistrict());
        if (req.getPincode()         != null) user.setPincode(req.getPincode());
        if (req.getAadhaarNumber()   != null) user.setAadhaarNumber(req.getAadhaarNumber());
        if (req.getPanNumber()       != null) user.setPanNumber(req.getPanNumber());
        if (req.getNomineeName()     != null) user.setNomineeName(req.getNomineeName());
        if (req.getNomineeRelation() != null) user.setNomineeRelation(req.getNomineeRelation());
        if (req.getNomineeMobile()   != null) user.setNomineeMobile(req.getNomineeMobile());
        return mapToResponse(userRepository.save(user));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .dateOfBirth(user.getDateOfBirth())
                .address(user.getAddress())
                .city(user.getCity())
                .country(user.getCountry())
                .gender(user.getGender())
                .state(user.getState())
                .district(user.getDistrict())
                .pincode(user.getPincode())
                .aadhaarNumber(user.getAadhaarNumber())
                .panNumber(user.getPanNumber())
                .nomineeName(user.getNomineeName())
                .nomineeRelation(user.getNomineeRelation())
                .nomineeMobile(user.getNomineeMobile())
                .role(user.getRole())
                .status(user.getStatus())
                .kycStatus(user.getKycStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
