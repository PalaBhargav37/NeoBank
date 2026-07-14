package com.neobank.service;

import com.neobank.dto.response.NotificationResponse;
import com.neobank.entity.Notification;
import com.neobank.entity.User;
import com.neobank.exception.ResourceNotFoundException;
import com.neobank.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public List<NotificationResponse> getUserNotifications(String email) {
        User user = userService.findByEmail(email);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public long getUnreadCount(String email) {
        User user = userService.findByEmail(email);
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public NotificationResponse markAsRead(Long id, String email) {
        User user = userService.findByEmail(email);
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notif.setIsRead(true);
        return mapToResponse(notificationRepository.save(notif));
    }

    @Transactional
    public void markAllAsRead(String email) {
        User user = userService.findByEmail(email);
        List<Notification> unread = notificationRepository.findByUserAndIsReadFalse(user);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    public NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
