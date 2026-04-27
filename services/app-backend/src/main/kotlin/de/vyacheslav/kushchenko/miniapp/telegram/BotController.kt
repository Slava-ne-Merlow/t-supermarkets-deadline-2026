package de.vyacheslav.kushchenko.miniapp.telegram

import eu.vendeli.tgbot.TelegramBot
import eu.vendeli.tgbot.annotations.CommandHandler
import eu.vendeli.tgbot.api.chat.setChatMenuButton
import eu.vendeli.tgbot.api.message.message
import eu.vendeli.tgbot.types.User
import eu.vendeli.tgbot.types.keyboard.MenuButton
import eu.vendeli.tgbot.types.keyboard.WebAppInfo
import eu.vendeli.tgbot.utils.builders.inlineKeyboardMarkup
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Controller

@Controller
class BotController(
    @param:Value("\${app.frontend-url:}") private val frontendUrl: String,
    @param:Value("\${app.start-text:Привет! Открой мини-приложение по кнопке ниже.}") private val startText: String,
) {
    private val log = LoggerFactory.getLogger(BotController::class.java)

    @CommandHandler(["/start"])
    suspend fun handleStart(user: User, bot: TelegramBot) {
        if (frontendUrl.isBlank()) {
            log.warn("Frontend URL is blank. Configure APP_FRONTEND_URL to show the mini app button.")
            setChatMenuButton(MenuButton.Default()).send(user, bot)
            message(startText).send(user, bot)
            return
        }

        val webAppInfo = WebAppInfo(frontendUrl)
        setChatMenuButton(MenuButton.WebApp("Открыть", webAppInfo)).send(user, bot)

        message(startText)
            .markup {
                inlineKeyboardMarkup {
                    url("Открыть приложение") { frontendUrl }
                }
            }
            .send(user, bot)
    }
}
