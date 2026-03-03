package dev.somnitide.infrastructure.web.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdatePreferencesRequest(
        @NotNull @Min(0) @Max(120) Integer sleepLatencyMinutes,
        @NotNull @Min(30) @Max(180) Integer cycleLengthMinutes,
        @NotNull @Min(1) @Max(10) Integer minCycles,
        @NotNull @Min(1) @Max(10) Integer maxCycles,
        @NotNull @Min(0) @Max(60) Integer bufferMinutes) {
}
