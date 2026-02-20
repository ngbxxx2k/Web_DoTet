package com.store.e_commerce.security;

import com.store.e_commerce.entity.User;
import com.store.e_commerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String phoneNumber) throws UsernameNotFoundException {
        // Can optionally also search by email if needed, but primary is phone
        User user = userRepository.findByPhoneNumber(phoneNumber)
                // Use email as fallback
                .or(() -> userRepository.findByEmail(phoneNumber))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with phone: " + phoneNumber));
        System.out.println("DEBUG CustomUserDetailsService: Loading user " + phoneNumber);
        System.out.println("DEBUG CustomUserDetailsService: Password hash = " + user.getPasswordHash());
        System.out.println("DEBUG CustomUserDetailsService: isActive = " + user.getIsActive());
        System.out.println("DEBUG CustomUserDetailsService: Role = " + (user.getRole() != null ? user.getRole().getRoleCode() : "NULL"));
        return new UserDetailsImpl(user);
    }
}
