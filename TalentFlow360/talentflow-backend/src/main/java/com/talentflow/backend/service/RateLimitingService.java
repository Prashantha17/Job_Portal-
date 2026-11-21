package com.talentflow.backend.service;

import com.talentflow.backend.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * High-performance, in-memory sliding window rate limiter.
 * Protects authentication endpoints (OTP dispatch, login) against brute-force attacks and email spamming.
 */
@Service
public class RateLimitingService {

    private static class RateWindow {
        private final long windowStartEpochSeconds;
        private final AtomicInteger count;

        public RateWindow(long epochSeconds) {
            this.windowStartEpochSeconds = epochSeconds;
            this.count = new AtomicInteger(1);
        }
    }

    private final Map<String, RateWindow> requestCounters = new ConcurrentHashMap<>();

    /**
     * Checks rate limit for a specific client key (e.g. action + ":" + emailOrIp).
     *
     * @param clientKey Unique key representing user/action
     * @param maxRequests Maximum allowed requests in window
     * @param windowSeconds Window length in seconds
     */
    public void checkRateLimit(String clientKey, int maxRequests, long windowSeconds) {
        long currentEpochSecond = Instant.now().getEpochSecond();

        requestCounters.compute(clientKey, (key, existing) -> {
            if (existing == null || (currentEpochSecond - existing.windowStartEpochSeconds) > windowSeconds) {
                return new RateWindow(currentEpochSecond);
            }
            if (existing.count.incrementAndGet() > maxRequests) {
                long retryAfter = windowSeconds - (currentEpochSecond - existing.windowStartEpochSeconds);
                throw new ApiException(
                        "Rate limit exceeded. Too many requests. Please wait " + Math.max(1, retryAfter) + " seconds before trying again.",
                        HttpStatus.TOO_MANY_REQUESTS
                );
            }
            return existing;
        });
    }
}
