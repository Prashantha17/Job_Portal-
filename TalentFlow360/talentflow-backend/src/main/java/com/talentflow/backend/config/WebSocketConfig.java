package com.talentflow.backend.config;

import com.talentflow.backend.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;

@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final Logger log = LoggerFactory.getLogger(WebSocketConfig.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    public WebSocketConfig(JwtTokenProvider jwtTokenProvider, UserDetailsService userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Native WebSocket endpoint
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");

        // SockJS fallback endpoint
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        log.info("🔌 Registered STOMP WebSocket endpoints at /ws (Native & SockJS)");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enable in-memory broker for broadcast (/topic) and user-targeted (/queue)
        registry.enableSimpleBroker("/topic", "/queue");
        // Application destination prefix for messages bound for @MessageMapping
        registry.setApplicationDestinationPrefixes("/app");
        // User destination prefix for convertAndSendToUser
        registry.setUserDestinationPrefix("/user");

        log.info("📡 Configured STOMP Message Broker: destinations [/topic, /queue], prefix [/app], userPrefix [/user]");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authHeader == null || authHeader.isBlank()) {
                        authHeader = accessor.getFirstNativeHeader("token");
                    }

                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        authHeader = authHeader.substring(7).trim();
                    }

                    if (authHeader != null && !authHeader.isBlank() && jwtTokenProvider.validateToken(authHeader)) {
                        try {
                            String email = jwtTokenProvider.getUsernameFromToken(authHeader);
                            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                            accessor.setUser(authentication);
                            log.info("🟢 STOMP WebSocket authenticated for user: {}", email);
                        } catch (Exception e) {
                            log.warn("Failed to set STOMP authentication: {}", e.getMessage());
                        }
                    } else {
                        // Check if direct email header is supplied for development/fallback
                        String emailHeader = accessor.getFirstNativeHeader("user");
                        if (emailHeader != null && !emailHeader.isBlank()) {
                            final String fallbackUser = emailHeader.toLowerCase().trim();
                            accessor.setUser(new Principal() {
                                @Override
                                public String getName() {
                                    return fallbackUser;
                                }
                            });
                            log.info("🟡 STOMP WebSocket identified via email header: {}", fallbackUser);
                        }
                    }
                }
                return message;
            }
        });
    }
}

