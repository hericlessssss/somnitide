package dev.somnitide.domain.exception;

/**
 * Base exception for domain violations.
 * Has no Spring dependency — pure Java.
 */
public class DomainException extends RuntimeException {

    private final String errorCode;

    public DomainException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
