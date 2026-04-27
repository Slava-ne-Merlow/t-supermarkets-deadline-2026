plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.ksp)
    alias(libs.plugins.telegram.bot)
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
    alias(libs.plugins.spring.kotlin)
    alias(libs.plugins.jacoco)
}

group = "de.vyacheslav.kushchenko"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

repositories {
    mavenCentral()
    maven("https://oss.sonatype.org/content/repositories/snapshots/")
}

dependencies {
    implementation(libs.bundles.kotlin)

    implementation(libs.spring.boot.starter)
    implementation(libs.spring.boot.actuator)
    implementation(libs.spring.boot.web)

    implementation(libs.telegram.spring.starter)
    implementation(libs.telegram.core)
    ksp(libs.telegram.ksp)

    developmentOnly(libs.spring.boot.docker)

    testImplementation(libs.spring.boot.test)
}

ktGram {
    forceVersion.set(libs.versions.telegram.bot.get())
    packages.set(listOf("de.vyacheslav.kushchenko.miniapp.telegram"))
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
    finalizedBy(tasks.jacocoTestReport)
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)

    reports {
        html.outputLocation = file("jacoco")
    }

    doLast {
        println("Test Coverage Report: file://${rootDir}/jacoco/index.html")
    }
}

jacoco {
    toolVersion = "0.8.12"
    reportsDirectory = layout.projectDirectory.dir("jacoco")
}
