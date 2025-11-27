export const summaryText = {
  title: 'ColorME 컬러 가이드',
  body:
    'ColorME는 Johannes Itten의 컬러 하모니와 Munsell 색체계를 바탕으로 무드별 색 조합을 제안합니다. 아래 가이드를 참고해 나만의 팔레트를 만들어 보세요.',
};

export const basics = [
  {
    title: 'Hue',
    subtitle: '색상',
    description: '빨/주/노/초/파/보… 같은 “종류”를 뜻해요.',
  },
  {
    title: 'Value',
    subtitle: '명도',
    description: '밝기 – 파스텔 vs 딥 컬러처럼 밝고 어두움을 가리켜요.',
  },
  {
    title: 'Chroma',
    subtitle: '채도',
    description: '선명함 – 쨍한색 vs 탁한색의 정도를 의미해요.',
  },
];

export const basicTips = [
  '상의는 명도·채도 높은 색, 하의는 조금 더 낮게 잡으면 안정감 있어요.',
  '신발은 명도 또는 채도 중 한 가지만 강조하면 튀지 않아요.',
];

export const harmonyCards = [
  {
    type: 'Complementary',
    presetKey: 'complementary',
    titleKo: '보색',
    description: '색상환 기준 서로 반대편 색 (예: 블루–오렌지).',
    tip: '상·하의 중 하나만 보색, 나머지는 중립색으로 안정시키기.',
    exampleMood: 'Street',
    example: '네이비 상의 + 오렌지/브라운 하의 + 흰색 스니커즈',
  },
  {
    type: 'Analogous',
    presetKey: 'analogous',
    titleKo: '유사색',
    description: '색상환 위에서 이웃한 2~3색 (블루–블루그린–그린 등).',
    tip: '전체 톤이 부드럽고 안정적이어서 데일리/데이트룩에 좋아요.',
    exampleMood: 'Casual',
    example: '크림 상의 + 올리브 아우터 + 베이지 팬츠',
  },
  {
    type: 'Triadic',
    presetKey: 'triadic',
    titleKo: '3색 조합',
    description: '색상환에서 120° 간격으로 떨어진 세 가지 색.',
    tip: '한 색은 메인으로, 나머지 두 색은 포인트 & 악세사리로 활용해요.',
    exampleMood: 'Street',
    example: '블랙 상의 + 머스타드 팬츠 + 코발트 캡 & 스니커즈',
  },
  {
    type: 'Split-Complementary',
    presetKey: 'split-complementary',
    titleKo: '분할 보색',
    description: '보색의 양 옆 색을 사용하는 고급스러운 조합.',
    tip: '색이 많을수록 중립색(화이트/블랙/베이지)로 밸런스를 잡아주세요.',
    exampleMood: 'Minimal',
    example: '차콜 상의 + 버건디 포인트 + 세이지 악세사리',
  },
  {
    type: 'Tetradic',
    presetKey: 'tetradic',
    titleKo: '사각형 조합',
    description: '서로 다른 두 쌍의 보색을 활용한 4색 조합.',
    tip: '포인트는 두 색만 사용하고 나머지는 뉴트럴로 조절하면 세련돼요.',
    exampleMood: 'Street',
    example: '네이비 + 코랄 + 올리브 + 크림 조합',
  },
];

export const moodGuides = [
  {
    mood: 'Minimal',
    keywords: '모노톤, 미니멀, 깔끔함',
    colors: ['화이트', '블랙', '차콜', '라이트 그레이', '베이지'],
    tips: [
      '상의: #FFFFFF / #F5F5F5 계열',
      '하의: #000000 / #1F1F1F',
      '신발: 화이트 또는 밝은 베이지',
    ],
  },
  {
    mood: 'Street',
    keywords: '대비, 선명한 컬러 포인트',
    colors: ['블랙', '네이비', '레드', '코발트', '라임'],
    tips: [
      '상의: 차분한 톤 (블랙/네이비)',
      '하의: 진청/블랙 데님',
      '신발/악세사리: 레드·코발트로 포인트',
    ],
  },
  {
    mood: 'Casual',
    keywords: '데일리, 편안함, 데이트룩',
    colors: ['크림', '베이지', '카멜', '올리브', '소프트 블루'],
    tips: [
      '상의: 크림/라이트 베이지',
      '하의: 카멜/올리브/데님',
      '신발: 화이트 or 소프트 블루',
    ],
  },
];

export const scenarioCards = [
  {
    title: '데이트 룩',
    palette: ['#f5f0e6', '#a9744f', '#ffffff'],
    description: '명도 높은 톤 + 낮은 채도 조합으로 부드럽고 편안한 분위기.',
  },
  {
    title: '클럽 / 파티 룩',
    palette: ['#0a0a0a', '#0a0a0a', '#ff4fd8'],
    description: '블랙 베이스에 메탈릭·네온 포인트로 시선을 사로잡아요.',
  },
  {
    title: '학교 / 캠퍼스 룩',
    palette: ['#1b2a49', '#ffffff', '#f97316'],
    description: '네이비/데님 + 화이트에 따뜻한 포인트 컬러로 산뜻하게.',
  },
];

export const usageSteps = [
  'Color 가이드에서 무드와 하모니를 선택해 영감을 얻어요.',
  '색조합 시뮬레이터에서 색을 입혀보고 세부 값을 조정해요.',
  '마음에 들면 “내 옷장”에 저장해 나만의 데이터베이스를 만들어요.',
  'AI 코디 컨설턴트에게 상황과 팔레트를 알려주고 스타일 제안을 받아요.',
];
