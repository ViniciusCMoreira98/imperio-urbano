package br.imperiourbano.identity;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

/**
 * Verificação local do ID token do Google: assinatura RS256 pelas chaves públicas do Google (baixadas e
 * guardadas em cache pelo Nimbus), emissor, público igual ao nosso Client ID e validade. Nenhum segredo
 * é necessário: o Client ID é público. Sem {@code GOOGLE_CLIENT_ID}, o login com Google fica desligado.
 */
@Component
class GoogleIdTokenVerifier implements GoogleIdentity {

    private static final Logger log = LoggerFactory.getLogger(GoogleIdTokenVerifier.class);
    private static final String JWKS = "https://www.googleapis.com/oauth2/v3/certs";
    private static final Set<String> ISSUERS = Set.of("accounts.google.com", "https://accounts.google.com");

    private final String clientId;
    private final JwtDecoder decoder;

    GoogleIdTokenVerifier(@Value("${app.google.client-id:}") String clientId) {
        this.clientId = clientId == null || clientId.isBlank() ? null : clientId.strip();
        if (this.clientId == null) {
            this.decoder = null;
            return;
        }
        NimbusJwtDecoder nimbus = NimbusJwtDecoder.withJwkSetUri(JWKS).build();
        nimbus.setJwtValidator(new DelegatingOAuth2TokenValidator<>(new JwtTimestampValidator(), jwt -> {
            boolean issuer = jwt.getIssuer() != null && ISSUERS.contains(jwt.getIssuer().toString());
            List<String> audience = jwt.getAudience();
            boolean ours = audience != null && audience.contains(this.clientId);
            return issuer && ours
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Emissor ou público inválido", null));
        }));
        this.decoder = nimbus;
    }

    @Override
    public boolean enabled() {
        return decoder != null;
    }

    @Override
    public String clientId() {
        return clientId;
    }

    @Override
    public Optional<GoogleAccount> verify(String credential) {
        if (decoder == null || credential == null || credential.isBlank()) return Optional.empty();
        try {
            Jwt jwt = decoder.decode(credential);
            if (jwt.getSubject() == null) return Optional.empty();
            Object verified = jwt.getClaims().get("email_verified");
            String email = Boolean.TRUE.equals(verified) || "true".equals(verified) ? jwt.getClaimAsString("email") : null;
            String name = jwt.getClaimAsString("given_name");
            if (name == null) name = jwt.getClaimAsString("name");
            return Optional.of(new GoogleAccount(jwt.getSubject(), email, name));
        } catch (JwtException e) {
            log.info("ID token do Google recusado: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
