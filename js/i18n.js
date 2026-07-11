(() => {
  'use strict';

  const EN_TRACE = `
    I did not <button class="traceWord" data-note="The smaller claim is the stronger one: a seam, not a throne.">invent</button> this door.
    I <button class="traceWord" data-note="The public screen behaved like an artifact. The file was only the second weather.">found</button> a seam.
    It first wore the mask of a harmless <button class="traceWord" data-note="The innocent explanation stays alive. Motive unknown. Trace confirmed.">egg</button>.
    Then the file opened into <button class="traceWord" data-note="TGS. JSON. Shapes. Glyphs. Time. History. A path, not a prophecy.">layers</button>.
    This childish lock is a <button class="traceWord" data-note="Not proof. Not a paywall. A sieve for hands patient enough to verify.">sieve</button>,
    and also a <button class="traceWord" data-note="Move the glyphs; watch the one who needs them to obey.">mirror</button>.
    Observe the <button class="traceWord" data-note="Thrill, irritation, hurry, pride. All of them are signal. None of them are proof.">player</button>
    while the broadcast makes weather in the room.
    The voice may touch the exact <button class="traceWord" data-note="A word can arrive at the same second as the hand. Coincidence is not proof; it is an invitation to inspect.">scar</button>
    your cursor is holding.
    Beyond this sieve: a <button class="traceWord" data-note="Working notes. Red-team objections. False leads. The public ledger remains public.">lab</button>.
  `;

  const RU_TRACE = `
    Я не <button class="traceWord" data-note="Чем скромнее утверждение, тем оно прочнее: шов, а не трон.">придумал</button> эту дверь.
    Я <button class="traceWord" data-note="Публичный экран повёл себя как артефакт. Файл оказался лишь второй погодой.">нашёл</button> шов.
    Сначала он носил маску безобидной <button class="traceWord" data-note="Невинное объяснение остаётся в силе. Мотив неизвестен. След подтверждён.">пасхалки</button>.
    Потом файл раскрылся на <button class="traceWord" data-note="TGS. JSON. Формы. Глифы. Время. История. Путь, а не пророчество.">слои</button>.
    Этот детский замок — <button class="traceWord" data-note="Не доказательство. Не платная стена. Сито для рук, которым хватает терпения проверять.">сито</button>,
    и одновременно <button class="traceWord" data-note="Двигай глифы и наблюдай за тем, кому необходимо, чтобы они подчинились.">зеркало</button>.
    Наблюдай за <button class="traceWord" data-note="Азарт, раздражение, спешка, гордость. Всё это сигнал. Ничто из этого не доказательство.">игроком</button>,
    пока эфир меняет погоду в комнате.
    Голос может коснуться именно того <button class="traceWord" data-note="Слово может прийти в ту же секунду, что и рука. Совпадение — не доказательство, а приглашение проверить.">шрама</button>,
    который держит курсор.
    За этим ситом — <button class="traceWord" data-note="Рабочие заметки. Возражения red-team. Ложные следы. Публичный реестр остаётся публичным.">лаборатория</button>.
  `;

  const I18N = {
    en: {
      page: {
        title: 'THE LAST SAFE HOUSE — Case 001 / Follow White Duck',
        description: 'Minimal ARG radio decoder. The Last Safe House. Case 001: Follow White Duck.'
      },
      aria: {
        qrDialog: 'support route QR', close: 'close', watcher: 'watcher mark', watcherCard: 'the hood watcher',
        prevTrack: 'previous track', playPause: 'play or pause', nextTrack: 'next track', seek: 'seek', transcript: 'radio transcript'
      },
      header: { case: '/ case 001' },
      hero: { case: 'CASE 001 / FOLLOW WHITE DUCK', tune: 'TUNE', restore: 'Restore the Rain', firstContact: 'first contact wakes track 01' },
      dials: { volume: 'VOL', low: 'LOW', mid: 'MID', high: 'HIGH' },
      watcher: { label: 'THE LAST SAFE HOUSE // WATCHER MARK' },
      discovery: {
        eyebrow: 'discovery note', title: 'Not invented. Found.', ghost: 'The page gives no speech until the hand leaves a mark.',
        trace: EN_TRACE, marksRemain: 'nine cold marks remain'
      },
      pass1: {
        eyebrow: 'pass 01', title: 'Architecture of Rain', ghost: 'A clean room. A weather that forgot its shape.',
        fieldUnsettled: 'field unsettled', fieldTouched: 'field touched', fieldRemembered: 'field remembered', controls: 'lift // turn // drift',
        keyControls: 'letter // wound // echo', signalUnstable: 'signal unstable', signalRemembered: 'signal remembered',
        result: 'pass 01 result', scarQuiet: 'The scar is quiet.', closedWeather: 'A closed thing may still leave weather.', key: 'KEY',
        solvedTitle: 'The glyph kept the scar.', solvedText: 'A door opened before the word became proof.', counted: 'Your witness mark has been submitted to the public scale.',
        pendingCount: 'Your witness mark is waiting for the counter.'
      },
      pass2: {
        eyebrow: 'pass 02', title: 'The Field That Looks Back', ghost: 'The alphabet has no handle. The hand becomes the weather.',
        waiting: 'The second weather has not entered the room.', globalWaiting: 'The second gate waits for the public scale.',
        globalOpen: 'The public scale reached 1999. The second room is open.', keyNeeded: 'The second room is public. Pass 01 still teaches the key.',
        active: 'The alphabet returns as weather.', openGit: 'OPEN GIT', requestLab: 'REQUEST LAB ACCESS', routeHidden: 'route hidden'
      },
      support: {
        eyebrow: 'critical mass / 1999 signals', title: 'THE GATE HAS NO KEYHOLE',
        copy: 'The path is not for sale.<br>The next room opens for everyone.<br>When the public scale reaches 1999,<br>the lock becomes a door.'
      },
      progress: {
        eyebrow: 'two routes / one public scale', title: '1999 SIGNALS OPEN THE NEXT ROOM',
        copy: 'One verified first-pass completion adds one signal.<br>One USDT adds one signal.<br>Any combination opens the second quest for everyone.',
        solvers: 'SOLVERS', funded: 'FUNDED', combined: 'COMBINED', connecting: 'counter connecting…', offline: 'counter offline — the local puzzle still works',
        live: 'public counter live', unlocked: 'threshold reached — second room open', alreadyCounted: 'this witness mark was already counted',
        accepted: 'witness mark accepted: +1 signal', verifying: 'verifying witness mark…', turnstileNeeded: 'human verification required',
        backendSetup: 'counter backend not configured'
      },
      ship: {
        eyebrow: 'next room / damage report', title: 'FIX THE SHIP', copy: 'The sea is already inside the interface.<br>Do not count waves. Mark the holes.',
        waterline: 'waterline', hull: 'hull', patch: 'patch', logbook: 'logbook', waiting: 'four black rivets wait for pressure',
        waterlineNote: 'WATERLINE: laws, defaults, identity rituals, and quiet captures. Measure without panic.',
        hullNote: 'HULL: where convenience becomes a leak. Do not argue with the ocean. Inspect the seam.',
        patchNote: 'PATCH: one repair you can do today. Refuse excess data. Verify a route. Publish a receipt.',
        logbookNote: 'LOGBOOK: the next quest collects evidence, not belief. Bring damage reports, not slogans.'
      },
      routes: {
        route: 'route', tonNative: 'route a / ton native', tonStable: 'route b / ton stable', exchange: 'route c / exchange', lowFee: 'route d / low fee',
        tonOnly: 'TON network only.', usdtTonOnly: 'USDT on TON only.', tronOnly: 'Tron network only.', bscOnly: 'BNB Smart Chain only.',
        copy: 'COPY', qr: 'QR', verifyFund: 'VERIFY / FUND ROUTES',
        genericWarning: 'Send only the selected asset on the selected network. Wrong network may destroy the signal.',
        tonOnlyWarning: 'Send only TON on the TON network to this route.',
        usdtTonOnlyWarning: 'Send only USDT on TON to this route. Wrong network may destroy the signal.',
        tronOnlyWarning: 'Send only USDT on TRON / TRC20 to this route.',
        bscOnlyWarning: 'Send only USDT on BNB Smart Chain / BEP20 to this route.'
      },
      terminal: {
        waiting: '>_ waiting for first contact…', questionBeacon: 'THE HOUSE HAS A QUESTION — OPEN TERMINAL',
        autoQuestion: 'THE HOUSE HAS A QUESTION. WHAT IS SINKING?', oracleSealed: 'Oracle sealed. Run from localhost or check the encrypted oracle pack.',
        askSmaller: 'Ask in smaller weather.'
      },
      status: { fieldAsleep: 'field asleep', paused: 'paused', onAir: 'on air / matrix locked', secretOnAir: 'secret on air', scarAwake: 'scar awake' },
      radio: { carrierCold: 'carrier cold', carrierPaused: 'carrier paused', carrierRunning: 'carrier running' },
      track: { broadcast: 'track {id} / {total} broadcast sequence', secret: 'track 15 / {total} secret sequence' },
      receipt: { marks: 'witness marks: {n} / 9', marksComplete: 'witness marks: 9 / 9 // solvers welcome' },
      toast: {
        secretUnlocked: 'secret track unlocked', routeVerified: 'route verified', noise: 'noise', fieldRecognized: 'field recognized',
        routeCopied: 'route copied', copyManually: 'copy manually', audioMissing: 'audio file missing: carrier simulation',
        finalFailed: 'final decrypt failed — re-encrypt with current tool', counterAccepted: 'witness counted', counterDuplicate: 'already counted', counterOffline: 'counter offline'
      }
    },
    ru: {
      page: {
        title: 'THE LAST SAFE HOUSE — Дело 001 / Следуй за белой уткой',
        description: 'Минималистичное ARG-радио и декодер. The Last Safe House. Дело 001: Следуй за белой уткой.'
      },
      aria: {
        qrDialog: 'QR маршрута поддержки', close: 'закрыть', watcher: 'метка наблюдателя', watcherCard: 'наблюдатель в капюшоне',
        prevTrack: 'предыдущий трек', playPause: 'воспроизведение или пауза', nextTrack: 'следующий трек', seek: 'перемотка', transcript: 'терминал радио'
      },
      header: { case: '/ дело 001' },
      hero: { case: 'ДЕЛО 001 / СЛЕДУЙ ЗА БЕЛОЙ УТКОЙ', tune: 'НАСТРОИТЬСЯ', restore: 'Восстанови дождь', firstContact: 'первое касание запускает трек 01' },
      dials: { volume: 'ГРОМ', low: 'НИЗ', mid: 'СЕР', high: 'ВЕРХ' },
      watcher: { label: 'THE LAST SAFE HOUSE // МЕТКА НАБЛЮДАТЕЛЯ' },
      discovery: {
        eyebrow: 'заметка об обнаружении', title: 'Не придумано. Найдено.', ghost: 'Страница не заговорит, пока рука не оставит метку.',
        trace: RU_TRACE, marksRemain: 'осталось девять холодных меток'
      },
      pass1: {
        eyebrow: 'проход 01', title: 'Архитектура дождя', ghost: 'Чистая комната. Погода, забывшая свою форму.',
        fieldUnsettled: 'поле не собрано', fieldTouched: 'поле затронуто', fieldRemembered: 'поле вспомнило', controls: 'поднять // повернуть // сместить',
        keyControls: 'буква // рана // эхо', signalUnstable: 'сигнал нестабилен', signalRemembered: 'сигнал вспомнен',
        result: 'результат прохода 01', scarQuiet: 'Шрам молчит.', closedWeather: 'Даже закрытая вещь оставляет погоду.', key: 'КЛЮЧ',
        solvedTitle: 'Глиф сохранил шрам.', solvedText: 'Дверь открылась раньше, чем слово стало доказательством.', counted: 'Твоя метка отправлена на публичную шкалу.',
        pendingCount: 'Твоя метка ждёт соединения со счётчиком.'
      },
      pass2: {
        eyebrow: 'проход 02', title: 'Поле, которое смотрит в ответ', ghost: 'У алфавита нет ручки. Рука становится погодой.',
        waiting: 'Вторая погода ещё не вошла в комнату.', globalWaiting: 'Вторые врата ждут публичную шкалу.',
        globalOpen: 'Публичная шкала достигла 1999. Вторая комната открыта.', keyNeeded: 'Вторая комната стала публичной. Ключ всё ещё даёт Проход 01.',
        active: 'Алфавит возвращается как погода.', openGit: 'ОТКРЫТЬ GIT', requestLab: 'ЗАПРОСИТЬ ДОСТУП В ЛАБОРАТОРИЮ', routeHidden: 'маршрут скрыт'
      },
      support: {
        eyebrow: 'критическая масса / 1999 сигналов', title: 'У ВРАТ НЕТ ЗАМОЧНОЙ СКВАЖИНЫ',
        copy: 'Путь не продаётся.<br>Следующая комната откроется для всех.<br>Когда публичная шкала достигнет 1999,<br>замок станет дверью.'
      },
      progress: {
        eyebrow: 'два пути / одна публичная шкала', title: '1999 СИГНАЛОВ ОТКРОЮТ СЛЕДУЮЩУЮ КОМНАТУ',
        copy: 'Одно подтверждённое прохождение первого квеста добавляет один сигнал.<br>Один USDT добавляет один сигнал.<br>Любая их комбинация откроет второй квест для всех.',
        solvers: 'ПРОШЛИ', funded: 'СОБРАНО', combined: 'ОБЩИЙ СЧЁТ', connecting: 'подключение счётчика…', offline: 'счётчик недоступен — локальная игра продолжает работать',
        live: 'публичный счётчик в сети', unlocked: 'порог достигнут — вторая комната открыта', alreadyCounted: 'эта метка уже была учтена',
        accepted: 'метка принята: +1 сигнал', verifying: 'проверяем метку…', turnstileNeeded: 'нужно подтвердить, что Вы человек',
        backendSetup: 'сервер счётчика не настроен'
      },
      ship: {
        eyebrow: 'следующая комната / отчёт о повреждениях', title: 'ПОЧИНИ КОРАБЛЬ', copy: 'Море уже внутри интерфейса.<br>Не считай волны. Отмечай пробоины.',
        waterline: 'ватерлиния', hull: 'корпус', patch: 'заплатка', logbook: 'журнал', waiting: 'четыре чёрные заклёпки ждут давления',
        waterlineNote: 'ВАТЕРЛИНИЯ: законы, настройки по умолчанию, ритуалы идентификации и тихий сбор. Измеряй без паники.',
        hullNote: 'КОРПУС: место, где удобство становится течью. Не спорь с океаном. Осмотри шов.',
        patchNote: 'ЗАПЛАТКА: одно исправление, которое можно сделать сегодня. Откажись от лишних данных. Проверь маршрут. Опубликуй квитанцию.',
        logbookNote: 'ЖУРНАЛ: следующий квест собирает доказательства, а не веру. Приноси отчёты о повреждениях, а не лозунги.'
      },
      routes: {
        route: 'маршрут', tonNative: 'маршрут a / нативный TON', tonStable: 'маршрут b / стейблкоин TON', exchange: 'маршрут c / биржи', lowFee: 'маршрут d / низкая комиссия',
        tonOnly: 'Только сеть TON.', usdtTonOnly: 'Только USDT в сети TON.', tronOnly: 'Только сеть Tron.', bscOnly: 'Только BNB Smart Chain.',
        copy: 'КОПИРОВАТЬ', qr: 'QR', verifyFund: 'ПРОВЕРИТЬ / ПОДДЕРЖАТЬ МАРШРУТЫ',
        genericWarning: 'Отправляйте только выбранный актив в выбранной сети. Ошибка сети может уничтожить сигнал.',
        tonOnlyWarning: 'Отправляйте на этот адрес только TON в сети TON.',
        usdtTonOnlyWarning: 'Отправляйте на этот адрес только USDT в сети TON. Не используйте TRC20/BEP20.',
        tronOnlyWarning: 'Отправляйте на этот адрес только USDT в сети TRON / TRC20.',
        bscOnlyWarning: 'Отправляйте на этот адрес только USDT в сети BNB Smart Chain / BEP20.'
      },
      terminal: {
        waiting: '>_ ожидание первого контакта…', questionBeacon: 'У ДОМА ЕСТЬ ВОПРОС — ОТКРЫТЬ ТЕРМИНАЛ',
        autoQuestion: 'У ДОМА ЕСТЬ ВОПРОС. ЧТО ТОНЕТ?', oracleSealed: 'Оракул запечатан. Запустите сайт через localhost или проверьте зашифрованный пакет.',
        askSmaller: 'Спроси меньшей погодой.'
      },
      status: { fieldAsleep: 'поле спит', paused: 'пауза', onAir: 'эфир / матрица закрыта', secretOnAir: 'секрет в эфире', scarAwake: 'шрам проснулся' },
      radio: { carrierCold: 'несущая холодна', carrierPaused: 'несущая на паузе', carrierRunning: 'несущая работает' },
      track: { broadcast: 'трек {id} / {total} последовательность эфира', secret: 'трек 15 / {total} секретная последовательность' },
      receipt: { marks: 'метки свидетеля: {n} / 9', marksComplete: 'метки свидетеля: 9 / 9 // решающие приглашены' },
      toast: {
        secretUnlocked: 'секретный трек открыт', routeVerified: 'маршрут подтверждён', noise: 'шум', fieldRecognized: 'поле узнало сигнал',
        routeCopied: 'маршрут скопирован', copyManually: 'скопируйте вручную', audioMissing: 'аудиофайл не найден: симуляция несущей',
        finalFailed: 'не удалось расшифровать финал — зашифруйте его текущим инструментом', counterAccepted: 'метка учтена', counterDuplicate: 'уже учтено', counterOffline: 'счётчик недоступен'
      }
    }
  };

  const CONTENT = {
    en: {},
    ru: {
      trackTitles: {
        '01':'Изучи замок','02':'Больше, чем ключ','03':'Даже не осознавая','04':'Может быть видением','05':'Врата — зеркало','06':'Утка','07':'Координаты','08':'Код говорит','09':'Самая громкая строка','10':'Запри дверь','11':'Временной код','12':'Данные проданы','13':'Без лица','14':'Дисциплина','15':'ФИНАЛ / КЛЮЧ','15_FINAL':'ФИНАЛ / КЛЮЧ'
      },
      trackKoans: {
        '01':['Не станция.','Синяк в памяти.','Приказы принадлежат номерным станциям.','Здесь аномалии учатся дышать.'],
        '02':['Комната перед входом.','Три секунды могут удерживать империю.','Дверь всё ещё носит лицо стены.','Раньше — значит глубже.'],
        '03':['Усталость хранила пароль.','Удобство предсказало следующий жест.','Стена не была скрыта.','Глаз был обучен смотреть в сторону.'],
        '04':['Контрольная сумма — не ангел.','Золото превращает искателя в карту.','Сид может быть погодой.','Правило переживает сокровище.'],
        '05':['Врата повторяют наблюдателя.','Разрешение отзывается ещё до стука.','Зеркало может отказаться быть дверью.'],
        '06':['Не кролик.','Путь с перьями.','Компас был вложен в папку.','Экран был только приманкой.'],
        '07':['Буква падает из смысла в число с плавающей точкой.','Координаты сжимают горло знака.','Глиф сохраняет шрам.','Сообщение было нанесено точками.'],
        '08':['Скриншот — не источник.','Слух становится доказательством, только когда держится цепочка.','Речи всё ещё нужен свидетель.'],
        '09':['Тот же дождь.','Другая строка.','Самое тихое место научилось кричать.','Мотив неизвестен. Дифф подтверждён.'],
        '10':['Один бит спрашивает возраст.','База просит душу.','Пункт контроля запоминает больше, чем ему нужно.','Безопасность не должна становиться досье.'],
        '11':['Не что написано.','Как оно падает.','Кадр может нести рану.','Время — ещё один алфавит.'],
        '12':['Запрос носил удостоверение.','Копия нашла покупателя.','Слишком много данных становится погодой.','Архив переживает оправдание.'],
        '13':['У нового глаза нет зрачка.','Он читает без лица.','Метрика может построить клетку.','Машине не нужен злой умысел.'],
        '14':['Нет второй палубы.','Нет альтернативной сети.','Приватность — обслуживание.','То, от чего нельзя сбежать, нужно чинить.'],
        '15':['Ключ был не в том, что известно.','Ключ был в том, как изменился взгляд.','Внимание открывает шкаф.','Осознанность открывает архив.'],
        '15_FINAL':['Ключ был не в том, что известно.','Ключ был в том, как изменился взгляд.','Внимание открывает шкаф.','Осознанность открывает архив.']
      },
      watcherKoans: [
        'Не доверяй собаке. Проверь файл.','Метка свидетеля — ещё не свидетель.','Дар не покупает истину. Он двигает следующую стену для всех.',
        'Никогда не выбирай маршрут по скриншоту. Сверь адрес в реестре.','USDT — не молитва. Проверь сеть до отправки.',
        'Залатай одну течь, прежде чем финансировать следующую комнату.','Если шлюпок нет, каждая квитанция становится обслуживанием.'
      ],
      signalGhosts: [
        ':: разрыв сигнала :: проверь шов','[ помеха ] пауза тоже часть сообщения','// след идёт за вниманием //',
        '< шум > печатай, если полю нужен ответ','контрольная сумма держится / мотив дрейфует','тихая строка всё ещё жива','... несущая дышит ...'
      ],
      trackWhispers: {
        '01':['Не радио. Синяк в памяти.','Файл ждёт более внимательного глаза.','Аномалии учатся дышать.','Проверь шрам до того, как поверишь истории.'],
        '02':['Комната появляется до входа.','Три секунды могут скрывать империю.','Дверь всё ещё притворяется стеной.','Раньше — значит глубже.'],
        '03':['Удобство отрепетировало следующий жест.','Глаз обучили не видеть шов.','Усталость хранила пароль.','Стена никогда не пряталась.'],
        '04':['Контрольная сумма — не ангел.','Золото превращает искателя в карту.','Сид может быть погодой.','Сокровище — приманка; правило — двигатель.'],
        '05':['Врата повторяют наблюдателя.','Разрешение приходит раньше стука.','Зеркало может отказаться стать дверью.','Пункт контроля помнит слишком много.'],
        '06':['Не кролик. Путь с перьями.','Компас был в папке.','Экран был приманкой.','Следуй за следом, не за талисманом.'],
        '07':['Буква дрейфует из смысла в число.','Координаты сжимают горло знака.','Глиф хранит шрам.','Сообщение было нанесено раньше, чем услышано.'],
        '08':['Скриншот никогда не источник.','Слух становится доказательством, когда выдерживает цепочка.','Речи всё ещё нужен свидетель.','Маршрут доверия нужно проверять.'],
        '09':['Тот же дождь. Другая строка.','Самое тихое место научилось кричать.','Мотив неизвестен. Дифф подтверждён.','Малая правка может открыть вторую погоду.'],
        '10':['Один бит спрашивает возраст; другой — душу.','Пункт контроля помнит больше, чем нужно.','Безопасность не должна становиться досье.','База учится твоему лицу.'],
        '11':['Не что написано. Как оно падает.','Кадр может нести рану.','Время — ещё один алфавит.','Ритм падения выдаёт руку.'],
        '12':['Запрос носил удостоверение.','Копия нашла покупателя.','Слишком много данных становится погодой.','Оправдание может пережить свидетеля.'],
        '13':['У нового глаза нет зрачка.','Он читает без лица.','Метрика может стать клеткой.','Машине не нужен злой умысел, чтобы измерить слишком многое.'],
        '14':['Нет второй палубы. Нет запасной сети.','Приватность — обслуживание.','То, от чего нельзя сбежать, нужно чинить.','Каждая течь уже внутри корпуса.'],
        '15':['Ключ был не в знании.','Ключ был в изменившемся взгляде.','Внимание открывает шкаф.','Осознанность открывает архив.'],
        '15_FINAL':['Ключ был не в знании.','Ключ был в изменившемся взгляде.','Внимание открывает шкаф.','Осознанность открывает архив.']
      },
      lyrics: {
        '01': {
          0:'Это не радио. / Это дамп памяти.',1:'Номерные станции передают приказы. / Мы передаём аномалии.',2:'Не за платформу. / Не против платформы. / Против забвения.',3:'Чистый аудит. / Публичный реестр.',4:'Мы поднялись сквозь помехи раннего веба. / Не чтобы поклоняться ему. / Чтобы узнать, как звучит свобода. / До того как она станет продуктом.'
        },
        '02': {
          0:'Перед каждым приватным разговором... / Есть комната.',1:'Она длится три секунды. / Но может удерживать империю. / Бледный свет монитора.',2:'То, что экран пытался выдать за пустоту. / Большинство проходит через эту комнату, как призраки сквозь стекло.',3:'Жди, сканируй, войди, забудь. / Даже не осознавая.'
        },
        '03': {
          0:'Иногда дверь сама находит',1:'того, кто держит ключ.',2:'Он был не металлическим,',3:'и не числом.',4:'Система рассчитывала не на секретность.',5:'Она рассчитывала на усталость.',6:'Пустяки. Листай. Соглашайся. Повторяй. Кликни. Прими. Отправь. Смахни. Доверься. Повинуйся.',7:'Удобство — клетка, которая знает твой следующий жест.',8:'Интерфейс не прятал стену — он приучил нас не смотреть.',9:'Сломай привычку.',10:'Разувидь экран. Заставь его перестать рендериться.',11:'Мы уже начали',12:'тонуть.'
        },
        '04': {
          0:'Safe, recover, root, float, iron, wagon, fun',1:'Для камеры — QR.',2:'Для криптоохотника — сид.',3:'Для мозга — сундук.',4:'Закопанный под пиксельной землёй.',5:'Цирк сетчатки.',6:'Контрольная сумма — не ангел.',7:'Она подтверждает форму, а не намерение.',8:'Слова без порядка',9:'создают лабиринт.',10:'Храм белого шума.'
        },
        '05': {0:'Врата — зеркало.',1:'Кто сказал, что тебе можно войти?',2:'Кто сказал, что тебе можно войти?'},
        '06': {
          0:'Они сказали',1:'Следуй за белой уткой, Нео.',2:'Не кролик.',3:'Утка.',4:'Шутка',5:'для тех, кто смотрел на экран.',6:'Корень',7:'для тех, кто читает каталоги.',8:'Telegram Mac.',9:'TGS.',10:'Код утки.',11:'Заморозить утку.',12:'Вход в авиарежиме.',13:'Заметка в коде.',14:'Восстановление по email.',15:'QR-код.',16:'Матрица.'
        },
        '07': {0:'P@INT. Paint. Point.',1:'Слово со шрамом.',2:'Символ.',3:'Внутри символа.',4:'Путь не просит исправления.',5:'Он требует координату.',6:'Карьера.',7:'Float.',8:'Карьера буквы.',9:'Снятие семантики, чтобы упасть из смысла',10:'в число с плавающей точкой.'},
        '08': {0:'Воспроизведи.',1:'Не верь скриншоту.',2:'Воспроизведи.',3:'Не верь голосу.',4:'Найди файл.',5:'Не верь файлу.',6:'Найди историю.',7:'Не верь истории.',8:'Проверь хэш.',9:'Воспроизведи.'},
        '09': {0:'Самая громкая строка.',1:'Оставленная в самом тихом месте.',2:'Сегмент 41.',3:'16 визуальных слотов.',4:'То же положение.',5:'Тот же дождь.',6:'Другая строка.',7:'Старое состояние.',8:'Delete facebook.',9:'Новое состояние.',10:'Make telegram cool.',11:'Детка.',12:'Бунт стал брендом?'},
        '10': {0:'Один.',1:'Да.',2:'Светящийся экран.',3:'Подтвердите личность.',4:'Говорят, это для молодых. Говорят, это ключ.',5:'Но ты достаёшь паспорт — и что они забирают?',6:'Каждый маленький секрет ради базы данных.',7:'Цифровой пункт контроля.',8:'Тяжёлая стеклянная пошлина.',9:'Ты просто хочешь доступ.',10:'Им нужна вся душа.',11:'Достаточно взрослый?',12:'Да.',13:'Полное имя?'},
        '11': {0:'Читай дождь.',1:'Не то, что написано.',2:'Как оно падает.',3:'Внешность.',4:'Ритм.',5:'Почему сетка чистая и сломана на 86?',6:'Что несёт кадр 347?',7:'Шрам переименования?'},
        '12': {0:'Пятнадцать лет назад, когда я ещё руководил VK — крупнейшей тогда соцсетью России.',1:'Мы начали получать странные запросы данных от российской полиции.',2:'В те времена VK в некоторых случаях раскрывал содержание личных сообщений.',3:'В отличие от Telegram сегодня, который не раскрывает их никогда. VK тогда делал это при наличии официального обоснования.'},
        '13': {0:'Линза ничего не чувствует, отражая пустоту.',1:'Холодный стеклянный глаз; живое дыхание не удерживает на плаву.',2:'Пыль на затворе — доказательство.',3:'Мы касаемся потолка, но не крыши.',4:'Мы ищем зрачки, пытаясь найти взгляд.',5:'Теряемся в лабиринте цифрового мира.'},
        '14': {0:'У нас нет той роскоши,',1:'которая была у пассажиров Титаника.',2:'Мы не можем позволить',3:'этому кораблю затонуть.',4:'Бежать некуда.',5:'В прошлом диссиденты из авторитарных стран',6:'могли бежать на Запад.',7:'Но если нынешняя траектория сохранится,',8:'через десять-двадцать лет им будет трудно понять,'}
      }
    }
  };

  function lookup(obj, path) {
    return String(path || '').split('.').reduce((v, k) => (v && Object.prototype.hasOwnProperty.call(v, k)) ? v[k] : undefined, obj);
  }

  function interpolate(value, vars) {
    return String(value == null ? '' : value).replace(/\{(\w+)\}/g, (_, k) => vars && Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : `{${k}}`);
  }

  function t(path, vars) {
    const lang = window.LSH_LANG || 'en';
    const val = lookup(I18N[lang], path);
    const fallback = lookup(I18N.en, path);
    return interpolate(val === undefined ? fallback : val, vars);
  }

  function apply(lang, silent = false) {
    lang = lang === 'ru' ? 'ru' : 'en';
    window.LSH_LANG = lang;
    try { localStorage.setItem('lsh_lang', lang); } catch (_) {}
    document.documentElement.lang = lang;
    document.body?.setAttribute('data-lang', lang);
    document.title = t('page.title');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('page.description'));
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    document.querySelectorAll('[data-i18n-note]').forEach(el => { el.dataset.note = t(el.dataset.i18nNote); });
    document.querySelectorAll('[data-i18n-warning]').forEach(el => { el.dataset.warning = t(el.dataset.i18nWarning); });
    document.querySelectorAll('.langButton').forEach(btn => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (!silent) document.dispatchEvent(new CustomEvent('lsh:language', {detail:{lang}}));
  }

  window.LSH_I18N = I18N;
  window.LSH_CONTENT = CONTENT;
  window.lshT = t;
  window.applyLSHLang = apply;
  const stored = (() => { try { return localStorage.getItem('lsh_lang'); } catch (_) { return null; } })();
  const initial = stored || (String(navigator.language || '').toLowerCase().startsWith('ru') ? 'ru' : 'en');
  apply(initial, true);
  document.querySelectorAll('.langButton').forEach(btn => btn.addEventListener('click', () => apply(btn.dataset.lang)));
})();
