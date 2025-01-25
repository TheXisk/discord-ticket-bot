require('dotenv').config();
console.log(process.env.DISCORD_TOKEN);

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
    StringSelectMenuBuilder 
} = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const TOKEN = process.env.DISCORD_TOKEN;
const TARGET_CHANNEL_ID = '1332446681832230982'; // ID kanału, na którym wiadomość ma się pojawić

client.once('ready', async () => {
    console.log(`Bot jest online jako ${client.user.tag}`);

    // Tworzymy przycisk
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('📝 Stwórz Ticket') // Tekst na przycisku
            .setStyle(ButtonStyle.Primary)
    );

    // Tworzymy embed, który będzie wyglądał jak na załączonym screenie
    const embed = new EmbedBuilder()
        .setColor(0x2f3136) // Kolor tła embedu
        .setTitle('✉️ || STWÓRZ TICKET') // Tytuł wiadomości
        .setDescription(
            'Poniżej kliknij przycisk, aby stworzyć ticket. Nasz zespół skontaktuje się z tobą jak najszybciej!'
        )
        .setImage('https://media.discordapp.net/attachments/1332426664789016727/1332639097218662421/Bez_tytuu.png?ex=6795fc60&is=6794aae0&hm=b9d591ac918d461784fbb04db09761be2ac8973f0fd628e25a4dc87b573f9eaf&=&format=webp&quality=lossless&width=499&height=350') // Link do kwadratowego obrazka
        .setFooter({ text: 'FUNNY SHOP - BOT' });

    // Pobieramy kanał, gdzie chcemy wysłać wiadomość
    const targetChannel = await client.channels.fetch(TARGET_CHANNEL_ID);

    // Wysyłamy wiadomość z embedem i przyciskiem
    await targetChannel.send({
        embeds: [embed],
        components: [row],
    });
});
// Obsługa kliknięcia przycisku "Utwórz Ticket"
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() || interaction.customId !== 'create_ticket') return;

    
    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('Wybierz preferowaną opcję...')
            .addOptions([
                {
                    label: 'Zakup Produktu',
                    description: 'Kliknij tutaj, aby dokonać zakupu.',
                    value: 'zakup_produktu',
                },
            ])
    );

    await interaction.reply({
        content: 'Wybierz preferowaną opcję z menu:',
        components: [row],
        ephemeral: true, 
    });
});

// Obsługa wyboru z menu
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== 'ticket_select') return;

    if (interaction.values[0] === 'zakup_produktu') {
        const modal = new ModalBuilder()
            .setCustomId('zakup_modal')
            .setTitle('Formularz Zakupu');

        const produktInput = new TextInputBuilder()
            .setCustomId('produkt')
            .setLabel('Co chciałbyś zakupić?')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Przykład: NITRO BASIC 1 MIESIĄC')
            .setRequired(true);

        const iloscInput = new TextInputBuilder()
            .setCustomId('ilosc')
            .setLabel('Ilość')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Przykład: 2')
            .setRequired(true);

        const platnoscInput = new TextInputBuilder()
            .setCustomId('platnosc')
            .setLabel('Płatność')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Przykład: BLIK/KOD BLIK/PAYPAL')
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(produktInput),
            new ActionRowBuilder().addComponents(iloscInput),
            new ActionRowBuilder().addComponents(platnoscInput)
        );

        await interaction.showModal(modal);
    }
});

// Obsługa przesłanego formularza
client.on('interactionCreate', async (interaction) => {
    if (interaction.isModalSubmit() && interaction.customId === 'zakup_modal') {
        try {
            
            const produkt = interaction.fields.getTextInputValue('produkt');
            const ilosc = interaction.fields.getTextInputValue('ilosc');
            const platnosc = interaction.fields.getTextInputValue('platnosc');

            
            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: 0, 
                topic: interaction.user.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: ['ViewChannel'],
                    },
                    {
                        id: interaction.user.id,
                        allow: ['ViewChannel', 'SendMessages'],
                    },
                ],
            });

            // Wysłanie wiadomości w nowym kanale
            await channel.send({ content: `||@everyone||` });
            await channel.send({
                embeds: [
                    {
                        color: 0x2f3136,
                        description: "**• INFORMACJE O UŻYTKOWNIKU**",
                        fields: [
                            { name: ":bust_in_silhouette: NICK", value: interaction.user.username, inline: true },
                            { name: ":pushpin: PING", value: `<@${interaction.user.id}>`, inline: true },
                            { name: ":id: ID", value: interaction.user.id, inline: true },
                        ],
                    },
                    {
                        color: 0x2f3136,
                        description: "**• INFORMACJE O ZAMÓWIENIU**",
                        fields: [
                            { name: ":package: CO CHCIAŁBYŚ ZAMÓWIĆ", value: produkt, inline: false },
                            { name: ":1234: ILOŚĆ", value: ilosc, inline: true },
                            { name: ":credit_card: PŁATNOŚĆ", value: platnosc, inline: true },
                        ],
                    },
                ],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId("close_ticket")
                            .setLabel("Zamknij Ticket")
                            .setStyle(ButtonStyle.Danger)
                    ),
                ],
            });

            
            await interaction.user.send(`Został utworzony nowy ticket: <#${channel.id}>. Kliknij, aby przejść do kanału.`);

            
            await interaction.reply({ content: 'Twój formularz został przesłany! Kanał został utworzony.', ephemeral: true });

        } catch (error) {
            console.error('Błąd przy obsłudze formularza:', error);
            await interaction.reply({ content: 'Wystąpił błąd przy przetwarzaniu formularza.', ephemeral: true });
        }
    }
});

// Obsługa przycisku "Zamknij Ticket"
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() || interaction.customId !== 'close_ticket') return;

    if (!interaction.member.permissions.has('Administrator')) {
        await interaction.reply({
            content: 'Tylko administratorzy mogą zamknąć ten ticket.',
            ephemeral: true,
        });
        return;
    }

    const user = interaction.guild.members.cache.get(interaction.channel.topic);

    await user.send(`Twój ticket na serwerze "${interaction.guild.name}" został zamknięty przez administratora. Jeśli potrzebujesz więcej pomocy, utwórz nowy ticket.`);

    await interaction.reply({ content: 'Zamykanie ticketu...', ephemeral: true });

    await interaction.channel.delete().catch((err) => {
        console.error('Nie udało się usunąć kanału:', err);
    });
});

client.login(TOKEN);
