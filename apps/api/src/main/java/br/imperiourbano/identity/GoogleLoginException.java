package br.imperiourbano.identity;

/** Login com Google recusado (desligado ou token que não confere). */
public class GoogleLoginException extends RuntimeException {

    public GoogleLoginException(String message) {
        super(message);
    }
}
