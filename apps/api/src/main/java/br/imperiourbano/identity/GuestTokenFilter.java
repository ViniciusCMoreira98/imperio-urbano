package br.imperiourbano.identity;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/** Autentica {@code Authorization: Bearer <token>} de sessão de convidado. Token inválido segue anônimo (→ 401). */
class GuestTokenFilter extends OncePerRequestFilter {

    private static final String PREFIX = "Bearer ";

    private final GuestSessionService sessions;

    GuestTokenFilter(GuestSessionService sessions) {
        this.sessions = sessions;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith(PREFIX)) {
            sessions.authenticate(header.substring(PREFIX.length()).strip()).ifPresent(player ->
                    SecurityContextHolder.getContext().setAuthentication(UsernamePasswordAuthenticationToken.authenticated(
                            player, null, List.of(new SimpleGrantedAuthority("ROLE_PLAYER")))));
        }
        chain.doFilter(request, response);
    }
}
