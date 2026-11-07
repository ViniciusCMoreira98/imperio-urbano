package br.imperiourbano.identity;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * API sem estado: cada requisição traz o token do convidado. Sem cookies de sessão, então o CSRF não se aplica.
 * Abertos: criar sessão e a página de erro; todo o resto exige jogador autenticado.
 */
@Configuration
class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, GuestSessionService sessions) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .logout(logout -> logout.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/sessions", "/api/sessions/google", "/api/sessions/logout").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/sessions/config").permitAll()
                        .requestMatchers("/error").permitAll()
                        // WebSocket autentica no handshake (GameHandshakeInterceptor).
                        .requestMatchers("/ws/**").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(errors -> errors.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .addFilterBefore(new GuestTokenFilter(sessions), UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /** Não há login por usuário e senha; evita o usuário padrão gerado pelo Spring Boot. */
    @Bean
    AuthenticationManager noPasswordLogin() {
        return authentication -> {
            throw new BadCredentialsException("Login por senha não é suportado");
        };
    }
}
