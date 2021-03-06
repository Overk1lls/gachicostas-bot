export const REPLY_ANSWERS = [
    'Андок кидок',
    'тьмок',
    'Похоже на то.',
    'не в курсе',
    'разумеется',
    'хмм...',
    'я не шарю',
    'без понятия',
    'может быть',
    'само собой разумеется',
    'пёс его знает',
    'так точно!',
    'безусловно',
    'самому интересно',
    'Нет',
    'Да',
    'возможно',
    'однако',
    'пёс его знает',
    'так точно!',
    'скорее всего',
    'спроси что-нибудь попроще',
    'меньше знаешь - крепче спишь)',
    'правда',
    'хрен его знает',
    'а как же',
    'ещё бы',
    'не знаю',
    'ей-богу',
    'согласен',
    'ума не приложу',
    'однако',
    'угу',
    'несомненно',
    'сложно ответить',
    'спроси что-нибудь попроще',
    'не в теме',
    'помогаю',
    'ауф',
    'Да ты знаешь кто я',
    'чёрт его знает',
];

export const REPLY_OR_ANSWERS = [
    'Я думаю лучше ',
    'Твой выбор - ',
    'Проверяю информацию... ',
    'скорее всего ',
    'спроси что-нибудь попроще',
    'меньше знаешь - крепче спишь)',
    'ума не приложу',
    'сложно ответить',
    'спроси что-нибудь попроще',
    'не в теме',
    'самому интересно',
];

export const WHO_IS_QUESTION = [
    'кто на сервере'
];

export const WHO_IS_ANSWERS = [
    'не в теме',
    'чёрт его знает',
    'спроси что-нибудь попроще',
    'потенциально это',
    'вернее всего это',
    'сложно ответить',
    'похоже это',
    'должно быть это',
    'кажется это',
    'думаю что',
    'правдоподобно что это',
    'реально это',
    'пожалуй что это',
    'видно это',
    'вероятно это',
    'как мне кажется это',
];

export const FILTHY_LANG = [
    'сука',
    'пидор',
    'гей',
    'Шлюха',
    'Хитровыебанный',
    'Сучка',
    'Еблан',
    'Долбоёб',
    'Иди на хуй',
];

export const FILTHY_LANG_ANSWERS = [
    'не обзывай меня!',
    'По фактам',
    'однако',
    'продолжайте, продолжайте. Я люблю когда невоспитанные сердятся',
    'ты про себя говоришь?',
    'Да ты знаешь кто я',
    'Та за шо',
    'все так',
];

export const BOT_TAG_ANSWERS = [
    '<:pepe_weird:907949306743517194>',
    'Не тагай меня пес!',
    'Я не видел бафов уже десять тысяч лет',
    'Тсс! Не мешай мне думать!',
    '[вздох] Придется драться.',
    'Я не глухой!',
    'Ты осмелился заговорить со мной!',
    'Никто не знает моей истинной силы!',
    'Тысячи лет я искал пати в ключ!',
    'Что бы вы все сгорели!!! [Шепотом] Простите.',
    'От тебя разит могилой, смертный.',
    'Вы, демон хантеры, только трепаться умеете?',
];

export const RESPONSES = {
    NO_QUESTION: 'Я отвечаю только на вопросы',
    STAT_WEIGHTS: '>>> **Почему веса статов "не имеют смысла", и почему лучше пользоваться Top Gear.**\n' +
        'Представьте, что функция описывающая ДПС выглядит следующим образом:\n' +
        '```DPS = a1 х Crit+a2 х Haste+a3 х Mastery+a4 х Versatility+a5 х Agility + а6 х MH_DPS + a7 x OH_DPS```' +
        'Значения крита, хасты, и т.д. получаются исходя из вашей экипировки, а веса статов, это коэффициенты (а1, а2, а3... а7). ' +
        'Чтобы получить эти самые коэффициенты ребята из симкрафта особо не заморачиваются и применяют простейшую множественную линейную регрессию для получения этих самых весов. ' +
        'Сложно объяснить вообще не вдаваясь в подробности, по этому кратко: ' +
        'значения всех статов будут варьироваться на небольшую величину (оставаясь по прежнему вблизи ваших текущим значений) и основываясь на этом будут получены веса статов). ' +
        'Т.е. программа не такая уж и умная как нам хотелось бы, не будет она искать никакого "баланса в статах". ' +
        '"Максимум" что вы получаете из весов статов, это то, изменение какого стата влечет к наибольшему/наименьшему увеличению вашего ДПС. ' +
        'Так же веса статов покажут, если у вас (речь не о ДХ) катастрофически мало, скажем крита, то программа может заметить ' +
        ', что даже малое повышение крита вам дает "огромный" прирост ДПС - она и влепит, что вам "надо добрать крита", т.е. выдаст, что вес крита выше, чем у остальных статов. ' +
        'Веса статов, это простая математическая модель, которая не берет в расчет смену талантов, легендарок, медиумов, проводников. ' +
        'Лучшее решение, которые вы можете принять в вопросе выбора лучшего предмета экипировки - использовать Top Gear.',
    LEGENDARIES: '>>> __СТ__\n• **Жгучая рана**\n• **Теория хаоса**\n\n__Клив/АоЕ__\n• **Дар созерцателя тьмы **\n• **Всеобщая тоска**\n• **Жгучая рана** ',
    COVENANTS: [
        {
            name: 'Рейд',
            value: 'Феи > Вентиры > Кирии > Некролорды'
        },
        {
            name: 'М+',
            value: 'Феи/Некролорды > Вентиры/Кирии'
        },
        {
            name: 'ПВП',
            value: 'Некролорды > Феи > Вентиры/Кирии'
        }
    ],
};

export const ATTACHMENTS = {
    COVENANTS: 'https://i.imgur.com/0AKnoCY.png',
};

export const ERRORS = {
    NO_PERMISSION: 'I don\'t have permissions to send a message to the channel',
};

export const DISCORD_TAG_STR = '(<@!\\d{8,}>)';
export const COVENANTS_ANSWER_TITLE = 'Какой ковенант лучше?';