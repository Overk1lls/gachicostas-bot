export enum Response {
  NoQuestion = 'Я отвечаю только на вопросы',
  StatWeights = '>>> **Почему веса статов "не имеют смысла", и почему лучше пользоваться Top Gear.**\n' +
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

  // Dragonflight-related questions
  Craft = 'Крафт:\n1. Аркан стихий\n2. Оружие\n3. Пояс',
  Embellishments = 'Украшения:\n1. Аркан стихий\n2. Подкладка из синего шелка\n3. Мешочек алхимических приправ (он не считается украшением)',
}
