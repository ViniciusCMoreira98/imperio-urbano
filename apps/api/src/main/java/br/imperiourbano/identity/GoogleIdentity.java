package br.imperiourbano.identity;

import java.util.Optional;

/** Confere o ID token ("credential") que o botão do Google entrega ao navegador. */
public interface GoogleIdentity {

    /** Conta confirmada pelo Google: {@code sub} é o identificador estável; nome, e-mail e foto podem faltar. */
    record GoogleAccount(String sub, String email, String name, String photoUrl) {

        public GoogleAccount(String sub, String email, String name) {
            this(sub, email, name, null);
        }
    }

    /** Sem Client ID configurado, o login com Google fica desligado. */
    boolean enabled();

    /** Client ID público (vai para o navegador desenhar o botão); nulo quando desligado. */
    String clientId();

    /** Vazio se a assinatura, o emissor, o público ou a validade não conferirem. */
    Optional<GoogleAccount> verify(String credential);
}
