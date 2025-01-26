require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    StringSelectMenuBuilder,
} = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const TOKEN = process.env.DISCORD_TOKEN;
const TARGET_CHANNEL_ID = "1332754624922517535";

client.once("ready", async () => {
    console.log(`Bot jest online jako ${client.user.tag}`);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("create_ticket")
            .setLabel("📝 Stwórz Ticket")
            .setStyle(ButtonStyle.Primary),
    );

    const embed = new EmbedBuilder()
        .setColor(0x2f3136)
        .setTitle("✉️ || STWÓRZ TICKET")
        .setDescription(
            "Poniżej kliknij przycisk, aby stworzyć ticket. Nasz zespół skontaktuje się z tobą jak najszybciej!",
        )
        .setImage(
            "https://media.discordapp.net/attachments/1332426664789016727/1332639097218662421/Bez_tytuu.png?ex=6795fc60&is=6794aae0&hm=b9d591ac918d461784fbb04db09761be2ac8973f0fd628e25a4dc87b573f9eaf&=&format=webp&quality=lossless&width=499&height=350",
        )
        .setFooter({ text: "FUNNY SHOP" });

    const targetChannel = await client.channels.fetch(TARGET_CHANNEL_ID);

    await targetChannel.send({
        embeds: [embed],
        components: [row],
    });
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton() || interaction.customId !== "create_ticket")
        return;

    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("ticket_select")
            .setPlaceholder("Wybierz preferowaną opcję...")
            .addOptions([
                {
                    label: "Zakup Produktu",
                    description: "Kliknij tutaj, aby dokonać zakupu.",
                    value: "zakup_produktu",
                },
                {
                    label: "Sprzedam",
                    description: "Kliknij tutaj, aby coś sprzedać.",
                    value: "sprzedam",
                },
                {
                    label: "Zarobek",
                    description: "Kliknij tutaj, aby zarobić.",
                    value: "zarobek",
                },
            ]),
    );

    await interaction.reply({
        content: "Wybierz preferowaną opcję z menu:",
        components: [row],
        ephemeral: true,
    });
});

client.on("interactionCreate", async (interaction) => {
    if (
        !interaction.isStringSelectMenu() ||
        interaction.customId !== "ticket_select"
    )
        return;

    const modal = new ModalBuilder().setCustomId(
        `${interaction.values[0]}_modal`,
    );

    if (interaction.values[0] === "zakup_produktu") {
        modal.setTitle("Formularz Zakupu");

        const produktInput = new TextInputBuilder()
            .setCustomId("produkt")
            .setLabel("Co chciałbyś zakupić?")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Przykład: NITRO BASIC 1 MIESIĄC")
            .setRequired(true);

        const iloscInput = new TextInputBuilder()
            .setCustomId("ilosc")
            .setLabel("Ilość")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Przykład: 1")
            .setRequired(true);

        const platnoscInput = new TextInputBuilder()
            .setCustomId("platnosc")
            .setLabel("Płatność")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Przykład: BLIK/PSC/PAYPAL")
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(produktInput),
            new ActionRowBuilder().addComponents(iloscInput),
            new ActionRowBuilder().addComponents(platnoscInput),
        );
    } else if (interaction.values[0] === "sprzedam") {
        modal.setTitle("Formularz Sprzedaży");

        const coSprzedacInput = new TextInputBuilder()
            .setCustomId("co_sprzedac")
            .setLabel("Co chciałbyś sprzedać?")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Przykład: ITEMY")
            .setRequired(true);

        const platnoscInput = new TextInputBuilder()
            .setCustomId("platnosc")
            .setLabel("Wybierz opcję płatności")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Przykład: BLIK/PAYPAL/PSC")
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(coSprzedacInput),
            new ActionRowBuilder().addComponents(platnoscInput),
        );
    } else if (interaction.values[0] === "zarobek") {
        modal.setTitle("Formularz Zarobku");

        const sposobInput = new TextInputBuilder()
            .setCustomId("sposob")
            .setLabel("W jaki sposób?")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Przykład: OPINIE")
            .setRequired(true);

        const platnoscInput = new TextInputBuilder()
            .setCustomId("platnosc")
            .setLabel("Wybierz opcję płatności")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Przykład: BLIK/PAYPAL/PSC")
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(sposobInput),
            new ActionRowBuilder().addComponents(platnoscInput),
        );
    }

    await interaction.showModal(modal);
});

client.on("interactionCreate", async (interaction) => {
    if (interaction.isModalSubmit()) {
        const ticketType = interaction.customId.split("_")[0];

        let ticketEmbed;
        if (ticketType === "zakup") {
            const produkt = interaction.fields.getTextInputValue("produkt");
            const ilosc = interaction.fields.getTextInputValue("ilosc");
            const platnosc = interaction.fields.getTextInputValue("platnosc");

            ticketEmbed = {
                color: 0x2f3136,
                description: "**• INFORMACJE O ZAMÓWIENIU**",
                fields: [
                    { name: ":package: CO CHCIAŁBYŚ ZAMÓWIĆ", value: produkt },
                    { name: ":1234: ILOŚĆ", value: ilosc, inline: true },
                    {
                        name: ":credit_card: PŁATNOŚĆ",
                        value: platnosc,
                        inline: true,
                    },
                ],
            };
        } else if (ticketType === "sprzedam") {
            const coSprzedac =
                interaction.fields.getTextInputValue("co_sprzedac");
            const platnosc = interaction.fields.getTextInputValue("platnosc");

            ticketEmbed = {
                color: 0x2f3136,
                description: "**• INFORMACJE O SPRZEDAŻY**",
                fields: [
                    {
                        name: ":package: CO CHCIAŁBYŚ SPRZEDAĆ",
                        value: coSprzedac,
                    },
                    {
                        name: ":credit_card: PŁATNOŚĆ",
                        value: platnosc,
                        inline: true,
                    },
                ],
            };
        } else if (ticketType === "zarobek") {
            const sposob = interaction.fields.getTextInputValue("sposob");
            const platnosc = interaction.fields.getTextInputValue("platnosc");

            ticketEmbed = {
                color: 0x2f3136,
                description: "**• INFORMACJE O ZAROBKU**",
                fields: [
                    { name: ":package: W JAKI SPOSÓB?", value: sposob },
                    {
                        name: ":credit_card: PŁATNOŚĆ",
                        value: platnosc,
                        inline: true,
                    },
                ],
            };
        }

        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: 0,
            topic: interaction.user.id,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone.id,
                    deny: ["ViewChannel"],
                },
                {
                    id: interaction.user.id,
                    allow: ["ViewChannel", "SendMessages"],
                },
            ],
        });

        await channel.send({ content: `||@everyone||` });
        await channel.send({
            embeds: [
                {
                    color: 0x2f3136,
                    description: "**• INFORMACJE O UŻYTKOWNIKU**",
                    fields: [
                        {
                            name: ":bust_in_silhouette: NICK",
                            value: interaction.user.username,
                            inline: true,
                        },
                        {
                            name: ":pushpin: PING",
                            value: `<@${interaction.user.id}>`,
                            inline: true,
                        },
                        {
                            name: ":id: ID",
                            value: interaction.user.id,
                            inline: true,
                        },
                    ],
                },
                ticketEmbed,
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("close_ticket")
                        .setLabel("Zamknij Ticket")
                        .setStyle(ButtonStyle.Danger),
                ),
            ],
        });

        await interaction.user.send(
            `Został utworzony nowy ticket: <#${channel.id}>. Kliknij, aby przejść do kanału.`,
        );

        await interaction.reply({
            content: "Twój formularz został przesłany! Kanał został utworzony.",
            ephemeral: true,
        });
    }
});

const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Bot działa!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton() || interaction.customId !== "close_ticket")
        return;

    try {
        // Sprawdzenie, czy temat kanału zawiera ID użytkownika
        const userId = interaction.channel.topic;
        if (!userId) {
            await interaction.reply({
                content:
                    "Nie udało się znaleźć powiązanego użytkownika. Kanał nie posiada ustawionego ID w temacie.",
                ephemeral: true,
            });
            return;
        }

        // Pobranie użytkownika
        const user = await interaction.guild.members
            .fetch(userId)
            .catch(() => null);

        if (user) {
            // Wysłanie wiadomości do użytkownika
            await user
                .send(
                    `Twój ticket na serwerze "${interaction.guild.name}" został zamknięty przez administratora. Jeśli potrzebujesz więcej pomocy, utwórz nowy ticket.`,
                )
                .catch((err) => {
                    console.error(
                        "Nie udało się wysłać wiadomości do użytkownika:",
                        err,
                    );
                });
        }

        // Powiadomienie na kanale i usunięcie go
        await interaction.reply({
            content: "Zamykanie ticketu...",
            ephemeral: true,
        });

        await interaction.channel.delete().catch((err) => {
            console.error("Błąd podczas usuwania kanału:", err);
        });
    } catch (error) {
        console.error("Błąd podczas zamykania ticketu:", error);
        await interaction.reply({
            content:
                "Wystąpił błąd podczas zamykania ticketu. Spróbuj ponownie później.",
            ephemeral: true,
        });
    }
});

client.login(TOKEN);
