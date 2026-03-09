package dev.somnitide.infrastructure.config;

import dev.somnitide.domain.service.SleepCycleCalculator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DomainConfig {

    @Bean
    public SleepCycleCalculator sleepCycleCalculator() {
        return new SleepCycleCalculator();
    }
}
