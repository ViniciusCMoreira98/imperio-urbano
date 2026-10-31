package br.imperiourbano.realtime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
class WebSocketConfig implements WebSocketConfigurer {

    private final GameSocketHandler handler;
    private final GameHandshakeInterceptor handshake;
    private final String[] allowedOrigins;

    WebSocketConfig(GameSocketHandler handler, GameHandshakeInterceptor handshake,
            @Value("${app.allowed-origins}") String[] allowedOrigins) {
        this.handler = handler;
        this.handshake = handshake;
        this.allowedOrigins = allowedOrigins;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(handler, "/ws/games/*")
                .addInterceptors(handshake)
                .setAllowedOrigins(allowedOrigins);
    }
}
