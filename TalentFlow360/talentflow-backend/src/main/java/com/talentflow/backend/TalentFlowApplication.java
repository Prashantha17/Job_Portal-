package com.talentflow.backend;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.core.env.Environment;

import java.net.InetAddress;
import java.net.UnknownHostException;

@SpringBootApplication
@EnableAsync
public class TalentFlowApplication {

    private static final Logger log = LoggerFactory.getLogger(TalentFlowApplication.class);

    static {
        loadDotenv();
    }

    private static void loadDotenv() {
        java.nio.file.Path[] searchPaths = new java.nio.file.Path[]{
                java.nio.file.Paths.get(".env"),
                java.nio.file.Paths.get("talentflow-backend/.env"),
                java.nio.file.Paths.get("../.env"),
                java.nio.file.Paths.get("TalentFlow360/talentflow-backend/.env")
        };

        for (java.nio.file.Path path : searchPaths) {
            if (java.nio.file.Files.exists(path)) {
                try {
                    for (String line : java.nio.file.Files.readAllLines(path)) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) continue;
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    log.info("🌿 Loaded environment variables from: {}", path.toAbsolutePath().normalize());
                    break;
                } catch (Exception ex) {
                    log.warn("⚠️ Could not parse .env file at {}: {}", path, ex.getMessage());
                }
            }
        }
    }

    public static void main(String[] args) {
        Environment env = SpringApplication.run(TalentFlowApplication.class, args).getEnvironment();
        logApplicationStartup(env);
    }

    private static void logApplicationStartup(Environment env) {
        String protocol = "http";
        String serverPort = env.getProperty("server.port", "8080");
        String contextPath = env.getProperty("server.servlet.context-path", "/");
        if (!contextPath.endsWith("/")) {
            contextPath += "/";
        }

        String hostAddress = "localhost";
        try {
            hostAddress = InetAddress.getLocalHost().getHostAddress();
        } catch (UnknownHostException e) {
            log.warn("The host name could not be determined, using `localhost` as fallback");
        }

        log.info("""
                
                ----------------------------------------------------------
                \tApplication '{}' is running! Access URLs:
                \tLocal: \t\t{}://localhost:{}{}
                \tExternal: \t{}://{}:{}{}
                \tHealth API: \t{}://localhost:{}{}api/v1/health
                \tSwagger UI: \t{}://localhost:{}{}swagger-ui.html
                \tProfile(s): \t{}
                ----------------------------------------------------------
                """,
                env.getProperty("spring.application.name"),
                protocol, serverPort, contextPath,
                protocol, hostAddress, serverPort, contextPath,
                protocol, serverPort, contextPath,
                protocol, serverPort, contextPath,
                env.getActiveProfiles()
        );
    }
}

