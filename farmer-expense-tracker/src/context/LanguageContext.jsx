import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    nav: {
      home: 'Home',
      expenses: 'Expenses',
      reports: 'Reports',
      settings: 'Settings'
    },
    common: {
      add_expense: 'Add Expense',
      add_income: 'Add Income',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      save_expense: 'Save Expense',
      save_income: 'Save Income',
      view_all: 'View All',
      see_details: 'See Details',
      more_options: 'More Options',
      other_details: 'Other Details',
      today: 'Today',
      yesterday: 'Yesterday',
      date: 'Date',
      crop: 'Crop',
      field: 'Field',
      no_field: 'No Field Associated',
      note: 'Note',
      description: 'Description Note',
      amount: 'Amount (₹)',
      success: 'Success',
      error: 'Error',
      loading: 'Connecting to FarmLedger Database...',
      syncing: 'Syncing farmer profiles, plots, and season budgets...',
      all_categories: 'All Categories',
      all_crops: 'All Crops',
      all_fields: 'All Fields'
    },
    categories: {
      seeds: '🌱 Seeds',
      fertilizer: '🧪 Fertilizer',
      labor: '👨‍🌾 Labor',
      equipment: '🚜 Equipment',
      irrigation: '💧 Irrigation',
      pesticides: '🐛 Pesticides',
      transportation: '🚚 Transportation',
      maintenance: '🛠 Maintenance',
      other: '🏷 Other'
    },
    income_categories: {
      crop_sale: '🌾 Crop Sale',
      subsidy: '🏛 Government Subsidy',
      produce_sale: '🥛 Produce Sale',
      other: '🏷 Other'
    },
    home: {
      greeting: 'Good morning,',
      subtext: 'Here is your farm overview.',
      this_season: 'This Season:',
      you_spent: 'You spent',
      you_earned: 'You earned',
      your_profit: 'Your profit',
      recent_expenses: 'Recent Transactions',
      no_transactions: 'No transactions logged for this season yet.'
    },
    budget: {
      heading: 'Your Season Budget',
      allocated: 'Allocated Budget',
      spent: 'Logged Spending',
      remaining: 'remaining',
      within: 'You are within your budget',
      over: 'You have spent more than your budget',
      close: 'You are close to your budget limit',
      remaining_amount: 'Remaining:',
      used_of: 'used of',
      edit_budget: 'Edit Budget Limit',
      edit_limits: 'Set limits for categories to monitor operational overruns.'
    },
    prediction: {
      heading: 'Next Season Estimate',
      based_on: 'Based on your previous seasons:',
      expected: 'Expected expense:',
      your_budget: 'Your budget:',
      within_warn: 'Your expected expense is within your budget.',
      exceed_warn: 'You may need around {amount} more.',
      exceed_statement: 'You may spend more than your budget next season.',
      insufficient_data: 'Add transactions across 3 or more seasons to generate next-season predictions.',
      how_calculated: 'How did we calculate this?',
      explanation: 'We looked at your spending from previous seasons and estimated how much you may spend next season.',
      safety_budget: 'Recommended Safety Budget (+10% margin)',
      apply_rec: 'Apply Recommended Budget',
      ols_analysis: 'Linear Regression Trend Analysis'
    },
    expenses: {
      my_expenses: 'My Expenses & Income',
      toggle_expenses: 'Expenses',
      toggle_income: 'Income',
      amount_prompt: 'How much did you spend? (₹)',
      amount_earn_prompt: 'How much did you earn? (₹)',
      source_prompt: 'Where did the money come from?',
      what_bought_prompt: 'What did you spend it on?',
      choose_crop: 'Which crop?',
      unusual_cost: 'This expense was unusual',
      unusual_desc: 'Use this if this expense was much higher than usual.',
      share_expense: 'Share this expense?',
      co_farmers: 'Share with Co-Farmers',
      your_share: 'Your share:',
      receipt_upload: 'Add Receipt',
      no_expenses_found: 'No transactions logged yet.',
      alert_saved: 'Expense saved successfully.',
      alert_income_saved: 'Income saved successfully.',
      alert_deleted: 'Transaction deleted.',
      search_placeholder: 'Search description or crop...',
      filters: 'Filters',
      clear_filters: 'Reset Filters',
      edit_title: 'Edit Transaction',
      add_title: 'Add Transaction',
      view_receipt: 'Receipt Preview'
    },
    reports: {
      where_money: 'Where did my money go?',
      compare_last: 'Compare with last season',
      last_season: 'Last season:',
      this_season: 'This season:',
      spent_more: 'You spent {amount} more.',
      spent_less: 'You spent {amount} less.',
      no_historical: 'Not enough seasons to compare. Need at least 2 seasons of data.'
    },
    fields: {
      my_fields: 'My Fields',
      add_field: 'Add Field Plot',
      field_name: 'Field Name',
      area: 'Area',
      unit: 'Unit',
      crop: 'Crop',
      role: 'Role',
      acres: 'Acres',
      hectares: 'Hectares',
      bighas: 'Bighas',
      location: 'Location / GPS Description',
      location_placeholder: 'e.g. Near west canal outlet',
      cost_per_acre: 'Cost / Area Unit',
      spent: 'Spent:',
      increased: 'Cost per area unit increased by {amount}% vs last season',
      optimized: 'Cost per area unit optimized by {amount}% vs last season'
    },
    settings: {
      language: 'Language',
      profile: 'Farmer Profile Settings',
      farm_details: 'Farm Details',
      logout: 'Logout',
      danger_zone: 'Danger / Maintenance Zone',
      reset_db: 'Re-Initialize & Reset Database',
      reset_desc: 'Resetting the database will permanently delete all transaction records, budgets, field plots, and seasons.',
      reset_confirm: 'WARNING: This will delete ALL logged transaction records, budgets, field plots, and seasons. Are you absolutely sure?',
      saved: 'Profile updated successfully!'
    },
    onboarding: {
      title: 'Farmer Login & Onboarding Portal',
      login: 'Log In',
      register: 'Register Profile',
      login_desc: 'Select your registered farmer account below to log in and view your field ledger.',
      register_desc: 'Create your farmer profile to start tracking expenses, income & multi-season budgets.',
      farmer_select: 'Select Registered Farmer Account *',
      login_btn: 'Log In to Field Ledger',
      name: 'Farmer Full Name *',
      farm_name: 'Farm Plot Name *',
      role: 'Farmer Role',
      holding: 'Farm Holding Scale',
      category: 'Crop Category / Farming Type *',
      custom_category: 'Custom Crop / Farming Category',
      region: 'Region / Zone',
      phone: 'Phone (Optional)',
      email: 'Email (Optional)',
      submit: 'Create Profile & Log In',
      demo_title: 'Hackathon Judge? Load multi-season farm data instantly:',
      demo_btn: 'Load Demo Dataset (Mohan Prasad\'s Farm)',
      select_category: 'Select Category Classification...',
      select_region: 'Select Farming Region...',
      select_scale: 'Select Scale...'
    },
    help: {
      heading: 'Help & Support',
      q1: 'How do I add an expense?',
      a1: '1. Tap "Add Expense" at the bottom or home screen.\n2. Enter the amount in ₹.\n3. Choose what you bought (like seeds or fertilizer).\n4. Tap "Save".',
      q2: 'How does prediction work?',
      a2: 'We look at your spending from previous seasons and estimate how much you may spend next season.',
      q3: 'What is an "Unusual expense"?',
      a3: 'If you spend money on something unexpected (like tractor repair), check this box so it doesn\'t affect your normal budget predictions.'
    }
  },
  hi: {
    nav: {
      home: 'होम',
      expenses: 'खर्च',
      reports: 'रिपोर्ट',
      settings: 'सेटिंग्स'
    },
    common: {
      add_expense: 'खर्च जोड़ें',
      add_income: 'आमदनी जोड़ें',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      save_expense: 'खर्च सहेजें',
      save_income: 'आमदनी सहेजें',
      view_all: 'सभी देखें',
      see_details: 'विवरण देखें',
      more_options: 'अधिक विकल्प',
      other_details: 'अन्य विवरण',
      today: 'आज',
      yesterday: 'कल',
      date: 'तारीख',
      crop: 'फसल',
      field: 'खेत',
      no_field: 'कोई खेत संबद्ध नहीं',
      note: 'नोट',
      description: 'विवरण नोट',
      amount: 'राशि (₹)',
      success: 'सफलता',
      error: 'त्रुटि',
      loading: 'फार्मलेज़र डेटाबेस से जुड़ रहा है...',
      syncing: 'किसान प्रोफाइल, खेत और मौसम बजट को सिंक किया जा रहा है...',
      all_categories: 'सभी श्रेणियां',
      all_crops: 'सभी फसलें',
      all_fields: 'सभी खेत'
    },
    categories: {
      seeds: '🌱 बीज',
      fertilizer: '🧪 खाद / उर्वरक',
      labor: '👨‍🌾 मजदूर',
      equipment: '🚜 उपकरण / मशीनरी',
      irrigation: '💧 सिंचाई',
      pesticides: '🐛 कीटनाशक',
      transportation: '🚚 परिवहन',
      maintenance: '🛠 रखरखाव',
      other: '🏷 अन्य'
    },
    income_categories: {
      crop_sale: '🌾 फसल बिक्री',
      subsidy: '🏛 सरकारी सब्सिडी',
      produce_sale: '🥛 उत्पाद बिक्री',
      other: '🏷 अन्य'
    },
    home: {
      greeting: 'नमस्कार,',
      subtext: 'यहाँ आपके खेत का विवरण है।',
      this_season: 'इस मौसम:',
      you_spent: 'आपने खर्च किया',
      you_earned: 'आपने कमाया',
      your_profit: 'आपका मुनाफा',
      recent_expenses: 'हाल के लेनदेन',
      no_transactions: 'इस मौसम के लिए अभी तक कोई लेनदेन दर्ज नहीं किया गया है।'
    },
    budget: {
      heading: 'आपका मौसम बजट',
      allocated: 'आवंटित बजट',
      spent: 'दर्ज किया गया खर्च',
      remaining: 'शेष है',
      within: 'आप अपने बजट के अंदर हैं',
      over: 'आप अपने बजट से बाहर हो गए हैं',
      close: 'आप अपने बजट सीमा के करीब हैं',
      remaining_amount: 'शेष:',
      used_of: 'उपयोग किया गया',
      edit_budget: 'बजट सीमा बदलें',
      edit_limits: 'खर्चों की निगरानी के लिए श्रेणियों के लिए सीमाएं निर्धारित करें।'
    },
    prediction: {
      heading: 'अगले मौसम का अनुमान',
      based_on: 'आपके पिछले मौसमों के आधार पर:',
      expected: 'अनुमानित खर्च:',
      your_budget: 'आपका बजट:',
      within_warn: 'आपका अनुमानित खर्च आपके बजट के अंदर है।',
      exceed_warn: 'आपको लगभग {amount} और आवश्यकता हो सकती है।',
      exceed_statement: 'आप अगले मौसम में अपने बजट से अधिक खर्च कर सकते हैं।',
      insufficient_data: 'अगले मौसम का अनुमान लगाने के लिए 3 या अधिक मौसमों के लेनदेन दर्ज करें।',
      how_calculated: 'हमने इसकी गणना कैसे की?',
      explanation: 'हमने आपके पिछले मौसमों के खर्चों को देखा और अनुमान लगाया कि आप अगले मौसम में कितना खर्च कर सकते हैं।',
      safety_budget: 'अनुशंसित सुरक्षा बजट (+10% मार्जिन)',
      apply_rec: 'अनुशंसित बजट लागू करें',
      ols_analysis: 'रैखिक प्रतिगमन प्रवृत्ति विश्लेषण'
    },
    expenses: {
      my_expenses: 'मेरे खर्च और आमदनी',
      toggle_expenses: 'खर्च',
      toggle_income: 'आमदनी',
      amount_prompt: 'आपने कितना खर्च किया? (₹)',
      amount_earn_prompt: 'आपने कितना कमाया? (₹)',
      source_prompt: 'पैसा कहाँ से आया?',
      what_bought_prompt: 'आपने इसे किस पर खर्च किया?',
      choose_crop: 'कौन सी फसल?',
      unusual_cost: 'यह खर्च असामान्य था',
      unusual_desc: 'इसका उपयोग तब करें जब यह खर्च सामान्य से बहुत अधिक हो।',
      share_expense: 'इस खर्च को साझा करें?',
      co_farmers: 'सह-किसानों के साथ साझा करें',
      your_share: 'आपका हिस्सा:',
      receipt_upload: 'रसीद जोड़ें',
      no_expenses_found: 'अभी तक कोई लेनदेन दर्ज नहीं किया गया है।',
      alert_saved: 'खर्च सफलतापूर्वक सहेजा गया।',
      alert_income_saved: 'आमदनी सफलतापूर्वक सहेजी गई।',
      alert_deleted: 'लेनदेन हटा दिया गया।',
      search_placeholder: 'खोजें विवरण या फसल...',
      filters: 'फिल्टर',
      clear_filters: 'फिल्टर साफ करें',
      edit_title: 'लेनदेन संपादित करें',
      add_title: 'लेनदेन जोड़ें',
      view_receipt: 'रसीद पूर्वावलोकन'
    },
    reports: {
      where_money: 'मेरा पैसा कहाँ गया?',
      compare_last: 'पिछले मौसम से तुलना करें',
      last_season: 'पिछला मौसम:',
      this_season: 'यह मौसम:',
      spent_more: 'आपने {amount} अधिक खर्च किया।',
      spent_less: 'आपने {amount} कम खर्च किया।',
      no_historical: 'तुलना करने के लिए पर्याप्त मौसम नहीं हैं। कम से कम 2 मौसमों का डेटा होना चाहिए।'
    },
    fields: {
      my_fields: 'मेरे खेत',
      add_field: 'खेत जोड़ें',
      field_name: 'खेत का नाम',
      area: 'क्षेत्रफल',
      unit: 'इकाई',
      crop: 'फसल',
      role: 'भूमिका',
      acres: 'एकड़',
      hectares: 'हेक्टेयर',
      bighas: 'बीघा',
      location: 'स्थान / जीपीएस विवरण',
      location_placeholder: 'उदा. नहर के पास वाला खेत',
      cost_per_acre: 'लागत / क्षेत्रफल इकाई',
      spent: 'खर्च:',
      increased: 'प्रति इकाई क्षेत्रफल लागत पिछले मौसम की तुलना में {amount}% बढ़ गई',
      optimized: 'प्रति इकाई क्षेत्रफल लागत पिछले मौसम की तुलना में {amount}% कम हुई'
    },
    settings: {
      language: 'भाषा',
      profile: 'किसान प्रोफाइल सेटिंग्स',
      farm_details: 'खेत का विवरण',
      logout: 'लॉग आउट',
      danger_zone: 'खतरे / रखरखाव का क्षेत्र',
      reset_db: 'डेटाबेस रीसेट करें',
      reset_desc: 'डेटाबेस रीसेट करने से सभी लेनदेन रिकॉर्ड, बजट, खेत और मौसम हमेशा के लिए हटा दिए जाएंगे।',
      reset_confirm: 'चेतावनी: यह सभी दर्ज लेनदेन रिकॉर्ड, बजट, खेतों और मौसमों को हटा देगा। क्या आप बिल्कुल सुनिश्चित हैं?',
      saved: 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!'
    },
    onboarding: {
      title: 'किसान लॉगिन और पंजीकरण',
      login: 'लॉग इन करें',
      register: 'प्रोफ़ाइल पंजीकृत करें',
      login_desc: 'लॉग इन करने और अपना फील्ड बहीखाता देखने के लिए नीचे अपना पंजीकृत किसान खाता चुनें।',
      register_desc: 'अपने खर्चों, आमदनी और बजट को ट्रैक करना शुरू करने के लिए अपनी किसान प्रोफ़ाइल बनाएं।',
      farmer_select: 'पंजीकृत किसान खाता चुनें *',
      login_btn: 'लॉग इन करें',
      name: 'किसान का पूरा नाम *',
      farm_name: 'खेत का नाम *',
      role: 'किसान की भूमिका',
      holding: 'खेत का पैमाना',
      category: 'फसल श्रेणी / खेती का प्रकार *',
      custom_category: 'कस्टम फसल / खेती की श्रेणी',
      region: 'क्षेत्र / क्षेत्र',
      phone: 'फ़ोन (वैकल्पिक)',
      email: 'ईमेल (वैकल्पिक)',
      submit: 'प्रोफ़ाइल बनाएं और लॉग इन करें',
      demo_title: 'हैकाथॉन जज? तुरंत बहु-मौसम डेटा लोड करें:',
      demo_btn: 'डेमो डेटा लोड करें (मोहन प्रसाद का खेत)',
      select_category: 'श्रेणी वर्गीकरण चुनें...',
      select_region: 'खेती क्षेत्र चुनें...',
      select_scale: 'पैमाना चुनें...'
    },
    help: {
      heading: 'सहायता और सहयोग',
      q1: 'खर्च कैसे जोड़ें?',
      a1: '1. नीचे या होम स्क्रीन पर "खर्च जोड़ें" पर टैप करें।\n2. राशि ₹ में दर्ज करें।\n3. चुनें कि आपने क्या खरीदा (जैसे बीज या खाद)।\n4. "सहेजें" पर टैप करें।',
      q2: 'अनुमान कैसे काम करता है?',
      a2: 'हम आपके पिछले मौसमों के खर्चों को देखते हैं और अनुमान लगाते हैं कि आप अगले मौसम में कितना खर्च कर सकते हैं।',
      q3: 'असामान्य खर्च क्या है?',
      a3: 'यदि आप किसी अप्रत्याशित चीज (जैसे ट्रैक्टर की मरम्मत) पर पैसा खर्च करते हैं, तो इस बॉक्स को चेक करें ताकि यह आपके सामान्य बजट अनुमानों के प्रभावित न करे।'
    }
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('farm_ledger_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('farm_ledger_lang', lang);
  }, [lang]);

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[lang];
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    if (typeof value === 'string') {
      let str = value;
      Object.keys(params).forEach((paramKey) => {
        str = str.replace(`{${paramKey}}`, params[paramKey]);
      });
      return str;
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
