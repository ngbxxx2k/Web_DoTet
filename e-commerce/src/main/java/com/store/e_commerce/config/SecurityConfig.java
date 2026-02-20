package com.store.e_commerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(request -> {
                var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
                corsConfiguration.setAllowedOrigins(java.util.List.of("http://localhost:3000", "http://127.0.0.1:3000")); // Allow frontend
                corsConfiguration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                corsConfiguration.setAllowedHeaders(java.util.List.of("*"));
                corsConfiguration.setAllowCredentials(true);
                return corsConfiguration;
            }))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/products/**", "/api/categories/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/users").permitAll() // Register

                // Admin & Staff endpoints - Temporarily permit all for testing/development
                .requestMatchers("/api/admin/**").permitAll()
                .requestMatchers("/api/analytics/**").permitAll()
                .requestMatchers("/api/attributes/**").permitAll()
                .requestMatchers("/api/banners/**").permitAll()
                .requestMatchers("/api/upload/**").permitAll()
                
                // My Account & Orders - MUST BE AUTHENTICATED
                .requestMatchers("/api/users/profile", "/api/users/change-password", "/api/users/avatar").authenticated()
                .requestMatchers("/api/orders/my-orders", "/api/orders/*/cancel").authenticated()
                
                // Allow full control over products and categories
                .requestMatchers("/api/products/**", "/api/categories/**").permitAll()
                
                // User & Order Management (General list/view for admin)
                .requestMatchers("/api/users/**").permitAll() // Careful: specific auth routes above must match first
                .requestMatchers("/api/orders/**").permitAll()
                .requestMatchers("/api/reviews/**").permitAll()
                .requestMatchers("/api/payment/**").permitAll()

                // Authenticated user endpoints (temporarily permitAll for testing)
                .requestMatchers("/api/cart/**").permitAll() 
                .requestMatchers("/api/wishlist/**").permitAll()

                // Chatbot endpoints
                .requestMatchers("/api/chat/**").permitAll()
                .requestMatchers("/api/data/**").permitAll()

                // Default deny (or permit all public GETs if strictly defined above)
                .anyRequest().permitAll() // Allow everything else by default for dev environment
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((request, response, authentication) -> response.setStatus(200))
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            );
            
        return http.build();
    }

    @Bean
    public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }

    @Bean
    public org.springframework.security.authentication.AuthenticationManager authenticationManager(
            org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
