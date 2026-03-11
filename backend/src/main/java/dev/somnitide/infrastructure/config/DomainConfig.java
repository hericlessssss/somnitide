package dev.somnitide.infrastructure.config;

import dev.somnitide.domain.service.SleepCycleCalculator;
import dev.somnitide.domain.service.SleepProgressCalculator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DomainConfig {

    @Bean
    public SleepCycleCalculator sleepCycleCalculator() {
        return new SleepCycleCalculator();
    }

    @Bean
    public SleepProgressCalculator sleepProgressCalculator() {
        return new SleepProgressCalculator();
    }
}
