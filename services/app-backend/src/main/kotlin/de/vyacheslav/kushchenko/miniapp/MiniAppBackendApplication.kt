package de.vyacheslav.kushchenko.miniapp

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.ConfigurableApplicationContext

@SpringBootApplication
class MiniAppBackendApplication

fun main(args: Array<String>) {
    runApplication<MiniAppBackendApplication>(*args)
}

fun run(
    args: Array<String>,
    init: SpringApplication.() -> Unit = {},
): ConfigurableApplicationContext {
    return runApplication<MiniAppBackendApplication>(*args, init = init)
}
