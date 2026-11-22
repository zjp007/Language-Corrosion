/* =========================================================
   Language Corrosion — Internationalization (i18n) Engine
   Default language: 'en' (persisted via localStorage)
   ========================================================= */

(function (global) {
  'use strict';

  const DICT = {
    en: {
      ui: {
        scenes: 'Scenes',
        soundOn: 'Sound: ON',
        soundOff: 'Sound: OFF',
        returnHub: '← Return to Hub'
      },
      menu: {
        s0: '0 · Language Corrosion',
        s1: '1 · Lexical Junkyard',
        s2: '2 · Choose an Image',
        s3: '3 · Foggy Window',
        s4: '4 · Birthday Card',
        s5: '5 · Crumpled Paper',
        s6: '6 · The Sea',
        s7: '7 · Kaleidoscope'
      },
      s0: {
        left: 'Language',
        right: 'Corrosion',
        hint: '[ Scroll down or click to enter ]'
      },
      s1: {
        tokens: ['“I', 'clearly', 'had', 'so', 'much', 'I', 'wanted', 'to', 'say”'],
        dropLate: [6, 7, 8],         // "wanted to say”" drops in Step 2
        keepSkeleton: [0, 2, 6],     // "“I   had   wanted" remains in Step 3
        haha: '“Haha”',
        junkyardTitle: 'Lexical Junkyard',
        debris: ['WANTED', 'I SAID', 'CLEARLY', 'SO MUCH', 'SAY', 'WORDS', 'MEAN'],
        hint: '[ Move closer, scroll down, or click to continue ]',
        hintJunkyard: '[ Scroll down or click to enter the hub ]'
      },
      s2: {
        guide: 'Select a floating image to enter a slice of aphasia',
        visited: 'Visited',
        c1Title: 'Foggy Window',
        c1Sub: 'Helplessness',
        c2Title: 'Birthday Card',
        c2Sub: 'Invisible Wall',
        c3Title: 'Crumpled Paper',
        c3Sub: 'Wronged',
        c4Title: 'The Sea',
        c4Sub: 'Loss',
        c5Title: 'Kaleidoscope',
        c5Sub: 'Envy',
        epilogue: 'All five slices of silence collected — yet the words remain unspoken.'
      },
      s3: {
        narration: "My friend was having a deep talk with me, yet I didn't know how to accurately express the view inside my heart.",
        thoughts: [
          "That's not how I see it...",
          "I don't actually agree, it's just...",
          "I feel like there's another side...",
          "What I really meant was...",
          "Wait a second, let me think..."
        ],
        hintWipe: 'Wipe the foggy window with your cursor',
        hintPause: 'Stop wiping for 5 seconds as the fog returns...',
        skipWipe: 'Pause & continue →',
        question: 'So what do you think?',
        hintClickWindow: '[ Click anywhere to close the window ]',
        retreat1: '“I just...”',
        retreat2: "“I don't know how to put it.”",
        hintClickRetreat: '[ Click to continue ]',
        finale: '“Never mind, hahaha”'
      },
      s4: {
        narration: 'In front of intimacy, subtle truths feel too heavy — so we wrap them in the safest, most ordinary wishes.',
        cardPlaceholder: 'Drop your words here',
        thoughts: [
          'I actually felt really sad that day...',
          "It feels like we're drifting apart...",
          'There are things I never dared to tell you...',
          'I still care, even though it hurts...'
        ],
        safeWishes: [
          'Wish you happiness every day!',
          'Happy Birthday! All the best!',
          'May you stay happy forever!',
          'Wishing you joy and peace!',
          'Happy Birthday! Stay smiling!'
        ],
        hintDrag: '[ Drag the floating thoughts into the birthday card (or click) ]',
        hintClick: '[ Click anywhere to add more safe wishes ({n}/12) ]',
        hintBuried: '[ Every true word is safely buried ]'
      },
      s5: {
        guideClick: '[ Click the paper or press any key to reply ]',
        guideType: '[ Type on your keyboard (or click the paper) to reply ]',
        guideBall: '[ Click the crumpled paper or wait... ]',
        guideRebuttal: '[ Click anywhere to continue ]',
        question: "“Isn't it just because you...?”",
        replyPrefix: 'Reply: ',
        defenses: [
          'No, what I meant was',
          'Just listen to me first',
          'I only felt that',
          'You have no idea at all',
          'Forget it'
        ],
        charsPerKey: 3,
        rebuttals: [
          '“What you called...”',
          '“First of all, this matter...”',
          '“What truly upset me was...”',
          '“And you completely ignored...”'
        ],
        finale: "Why didn't I think of that just now?"
      },
      s6: {
        guide: 'Click the sea to speak your mind',
        guideWashing: 'The tide is washing your words away...',
        thoughts: [
          'Something terrible happened today...',
          'I really needed someone to pull me up...',
          'Are you even listening?',
          'I really cared about what you said...',
          'Can anyone hear my silence?'
        ],
        finale: "“Never mind, the sea won't answer anyway.”"
      },
      s7: {
        guide: 'Click the kaleidoscope to catch their eloquence ({n}/5)',
        guideShattered: 'The mirror broke into monochrome dust.',
        eloquence: [
          'Flawless Logic',
          'Effortless Grace',
          'Silver-tongued',
          'Precise Empathy',
          'Articulate'
        ],
        myWords: 'My words:',
        sandFragments: ['uh—...', 'i m-ean..', ';;..', 'w-wait..', '......'],
        finale: "“Flowers bloom from others' lips; only sand falls from mine.”"
      }
    },

    zh: {
      ui: {
        scenes: '场景',
        soundOn: '音效：开',
        soundOff: '音效：关',
        returnHub: '← 返回意象主页'
      },
      menu: {
        s0: '0 · 语言腐蚀',
        s1: '1 · 词汇垃圾场',
        s2: '2 · 选择一个意象',
        s3: '3 · 玻璃窗',
        s4: '4 · 生日贺卡',
        s5: '5 · 被揉皱的纸团',
        s6: '6 · 海水',
        s7: '7 · 万花筒'
      },
      s0: {
        left: '语言',
        right: '腐蚀',
        hint: '[ 向下滚动鼠标或点击进入 ]'
      },
      s1: {
        tokens: ['“我', '明', '明', '有', '很', '多', '话', '想', '说”'],
        dropLate: [7, 8],            // “想说”下坠
        keepSkeleton: [0, 3, 7],     // “我   有   想”留存
        haha: '“哈哈”',
        junkyardTitle: '词汇垃圾场',
        debris: ['想', '我说', '明明', '很多', '话', '可是', '其实'],
        hint: '[ 鼠标靠近文字、向下滚动或点击继续 ]',
        hintJunkyard: '[ 继续向下滚动或点击进入意象中枢 ]'
      },
      s2: {
        guide: '点击任意漂浮的意象，进入一段失语的切片',
        visited: '已历',
        c1Title: '玻璃窗',
        c1Sub: '无奈',
        c2Title: '生日贺卡',
        c2Sub: '隐形的墙',
        c3Title: '被揉皱的纸团',
        c3Sub: '冤枉',
        c4Title: '海水',
        c4Sub: '失落',
        c5Title: '万花筒',
        c5Sub: '羡慕',
        epilogue: '五段失语的切片已尽数收拢，而那些话终究没有说出口。'
      },
      s3: {
        narration: '朋友和我 deeptalk，我却不知道如何将我内心的观点准确表达。',
        thoughts: [
          '我不是这样觉得的……',
          '我并不是同意你，只是……',
          '我觉得事情还有另一面……',
          '其实我想说的是……',
          '等一下，让我理一理……'
        ],
        hintWipe: '滑动鼠标，擦开起雾的车窗',
        hintPause: '停手 5 秒，雾气正在重新凝结……',
        skipWipe: '停手继续 →',
        question: '那你是怎么想的',
        hintClickWindow: '[ 点击画面摇上车窗 ]',
        retreat1: '“我是……”',
        retreat2: '“我不知道怎么说”',
        hintClickRetreat: '[ 点击继续 ]',
        finale: '“算了哈哈哈”'
      },
      s4: {
        narration: '面对亲密与社交关系，微妙的真实情绪显得太沉重，于是我们只能把它包装成最安全的祝福。',
        cardPlaceholder: '将心声放入贺卡',
        thoughts: [
          '其实那天我有点难过',
          '我们好像越来越远了',
          '有些话一直没敢告诉你',
          '哪怕心里还是有一点介意'
        ],
        safeWishes: [
          '祝你天天开心！',
          '生日快乐，万事如意！',
          '愿你永远幸福！',
          '岁岁常欢愉，万事皆胜意！',
          '生日快乐，永远开心！'
        ],
        hintDrag: '「鼠标拖动周围的真实想法放入贺卡中（或点击）」',
        hintClick: '「点击屏幕任意位置，贴满安全祝福（{n}/12）」',
        hintBuried: '「所有真心话都已被妥善掩埋」'
      },
      s5: {
        guideClick: '「点击纸面或按任意键开始回应」',
        guideType: '「请使用键盘打字回应（或点击纸面）」',
        guideBall: '「点击纸团或静候片刻……」',
        guideRebuttal: '「点击画面继续」',
        question: '“你不就是因为……吗”',
        replyPrefix: '回应：',
        defenses: [
          '不是我的意思是',
          '你先听我说',
          '我只是觉得',
          '你根本不知道',
          '算了'
        ],
        charsPerKey: 1,
        rebuttals: [
          '“你所谓的……”',
          '“首先这件事……”',
          '“真正让我生气的是……”',
          '“而且你忽略了……”'
        ],
        finale: '刚才怎么没想到'
      },
      s6: {
        guide: '点击海面，向大海说一句心里话',
        guideWashing: '海浪正在冲刷你的声音……',
        thoughts: [
          '今天发生了一件很糟糕的事',
          '其实我很需要有人拉我一把',
          '你在听吗？',
          '其实我很在乎那句话',
          '有没有人能听懂我的沉默'
        ],
        finale: '“算了，反正海也不会回答。”'
      },
      s7: {
        guide: '点击万花筒，试图捕捉那些华丽的辞藻 ({n}/5)',
        guideShattered: '镜面碎裂成黑白尘埃。',
        eloquence: [
          '逻辑严密',
          '娓娓道来',
          '妙语连珠',
          '精准共情',
          '从容不迫'
        ],
        myWords: '我说出口的：',
        sandFragments: ['呃……', '我、我是说…', '；；…', '那个……', '……'],
        finale: '“别人的嘴里开出花，我的嘴里只有沙。”'
      }
    }
  };

  let currentLang = 'en';
  try {
    const saved = localStorage.getItem('lc_lang');
    if (saved === 'en' || saved === 'zh') currentLang = saved;
  } catch (_) {}

  const listeners = [];

  function getByPath(obj, path) {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  }

  function t(key, vars) {
    let val = getByPath(DICT[currentLang], key);
    if (val === undefined) val = getByPath(DICT.en, key);
    if (typeof val === 'string' && vars) {
      Object.keys(vars).forEach((k) => {
        val = val.replace(new RegExp('\\{' + k + '\\}', 'g'), String(vars[k]));
      });
    }
    return val !== undefined ? val : key;
  }

  function applyDOMTranslations() {
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    document.body.classList.toggle('lang-zh', currentLang === 'zh');
    document.body.classList.toggle('lang-en', currentLang === 'en');

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (typeof val === 'string') {
        el.textContent = val;
      }
    });

    document.querySelectorAll('#btn-lang .lang-opt').forEach((opt) => {
      opt.classList.toggle('active', opt.getAttribute('data-lang') === currentLang);
    });
  }

  function setLanguage(lang) {
    if (lang !== 'en' && lang !== 'zh') return;
    currentLang = lang;
    try {
      localStorage.setItem('lc_lang', lang);
    } catch (_) {}
    applyDOMTranslations();
    listeners.forEach((fn) => fn(currentLang));
  }

  function toggleLanguage() {
    setLanguage(currentLang === 'en' ? 'zh' : 'en');
  }

  function getLanguage() {
    return currentLang;
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  global.I18N = {
    t,
    setLanguage,
    toggleLanguage,
    getLanguage,
    applyDOMTranslations,
    onChange
  };
})(window);
