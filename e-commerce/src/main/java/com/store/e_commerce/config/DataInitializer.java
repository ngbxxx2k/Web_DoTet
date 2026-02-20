// package com.store.e_commerce.config;

// import com.store.e_commerce.entity.Role;
// import com.store.e_commerce.entity.User;
// import com.store.e_commerce.repository.RoleRepository;
// import com.store.e_commerce.repository.UserRepository;
// import lombok.RequiredArgsConstructor;
// import org.springframework.boot.CommandLineRunner;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Component;

// @Component
// @RequiredArgsConstructor
// public class DataInitializer implements CommandLineRunner {

//     private final RoleRepository roleRepository;
//     private final UserRepository userRepository;
//     private final PasswordEncoder passwordEncoder;

//     @Override
//     public void run(String... args) throws Exception {
//         // Initialize Roles
//         if (roleRepository.count() == 0) {
//             Role adminRole = Role.builder()
//                     .roleCode("ADMIN")
//                     .roleName("Administrator")
//                     .build();
//             adminRole.setIsActive(true);
//             roleRepository.save(adminRole);

//             Role customerRole = Role.builder()
//                     .roleCode("CUSTOMER")
//                     .roleName("Customer")
//                     .build();
//             customerRole.setIsActive(true);
//             roleRepository.save(customerRole);
//         }

//         // Initialize Admin User or update password for existing test user
//         User existingUser = userRepository.findByPhoneNumber("0123456789").orElse(null);
//         if (existingUser != null) {
//             // Update password for test account (temporary for development)
//             String newHash = passwordEncoder.encode("123456");
//             System.out.println("DEBUG: New password hash for 123456 = " + newHash);
//             System.out.println("DEBUG: Verify match = " + passwordEncoder.matches("123456", newHash));
//             existingUser.setPasswordHash(newHash);
            
//             // Also ensure user has ADMIN role for testing
//             Role adminRole = roleRepository.findByRoleCode("ADMIN").orElse(null);
//             if (adminRole != null && !existingUser.getRole().getRoleCode().equals("ADMIN")) {
//                 existingUser.setRole(adminRole);
//                 System.out.println("DEBUG: Updated role to ADMIN for test user 0123456789");
//             }
            
//             userRepository.save(existingUser);
//             System.out.println("DEBUG: Updated password for test user 0123456789");
//         } else if (userRepository.count() == 0) {
//             Role adminRole = roleRepository.findByRoleCode("ADMIN").orElse(null);
//             if (adminRole != null) {
//                 User admin = User.builder()
//                         .fullName("System Admin")
//                         .email("admin@test.com")
//                         .phoneNumber("0123456789")
//                         .passwordHash(passwordEncoder.encode("123456"))
//                         .role(adminRole)
//                         .build();
//                 admin.setIsActive(true);
//                 userRepository.save(admin);
//                 System.out.println("DEBUG: Created test user 0123456789 with password 123456");
//             }
//         }
//     }
// }
