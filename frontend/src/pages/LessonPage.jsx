import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Container, Typography, Chip, Paper, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import QuizIcon from '@mui/icons-material/Quiz';
import { ROUTES } from '../utils/constants';
import {
  FlowDiagram,
  ComparisonDiagram,
  AllocationDiagram,
  TimelineDiagram,
  ProcessDiagram,
  StockMarketFlowDiagram,
  ETFDiversificationDiagram,
  ComparisonTableDiagram,
  CompoundingTimelineDiagram,
  PortfolioAllocationDiagram,
  RiskReturnChart,
  TechnicalAnalysisDiagram,
  EmotionCycleDiagram,
  BusinessValuationFlow,
  PortfolioTypeDiagram,
  GlobalDiversificationDiagram,
  BlockchainDiagram,
} from '../components/Infographics';


/* Shared styles */

const DIFFICULTY_STYLES = {
  Beginner: { bgcolor: '#dcfce7', color: '#15803d' },
  Intermediate: { bgcolor: '#fef3c7', color: '#b45309' },
  Advanced: { bgcolor: '#fee2e2', color: '#dc2626' },
};

/* Lesson data */

const LESSON_CONTENT = {

  /* INVESTING BASICS */
  'investing-basics': {
    title: 'Investing Basics',
    difficulty: 'Beginner',
    readingTime: '8 min',
    overview: 'Learn what stocks, bonds, and index funds are — the three building blocks every investor needs to understand before making their first trade.',
    infographic: { type: 'stock-market-flow', props: { title: 'How Stock Ownership Works' } },
    sections: [
      {
        heading: 'What is a Stock?',
        content: [
          { type: 'text', value: 'A stock is a tiny piece of ownership in a company.' },
          { type: 'analogy', value: '🍕 Think of a company as a pizza. A stock is one slice. You own that slice and benefit when the pizza grows bigger.' },
          {
            type: 'bullets', items: [
              'Stocks trade on exchanges like NYSE and NASDAQ',
              'Prices change every second based on supply and demand',
              'You can make money in two ways: price going up, or dividends (cash payments)',
            ]
          },
          { type: 'example', value: 'If Apple has 15 billion shares and you own 100, you own 0.0000007% of Apple. Tiny — but if Apple grows 20%, your 100 shares grow 20% too.' },
        ],
      },
      {
        heading: 'What are Bonds?',
        content: [
          { type: 'text', value: 'A bond is a loan you give to a company or government. They pay you interest and return your money later.' },
          { type: 'analogy', value: '🏦 Imagine lending ₹10,000 to a friend who promises to pay you back in 5 years plus ₹500/year as a thank-you. That\'s a bond.' },
          {
            type: 'bullets', items: [
              'Lower risk than stocks — more predictable returns',
              'Government bonds are the safest (US Treasuries, Indian Govt Securities)',
              'Corporate bonds pay higher interest but carry more risk',
              'Bond prices fall when interest rates rise (and vice versa)',
            ]
          },
        ],
      },
      {
        heading: 'Index Funds — The Easy Button',
        content: [
          { type: 'text', value: 'An index fund bundles hundreds of stocks into one purchase. Instead of picking winners, you buy the entire market.' },
          { type: 'callout', value: 'Warren Buffett recommends index funds for most investors. He even bet $1 million that an S&P 500 index fund would beat professional hedge funds over 10 years — and he won.' },
          {
            type: 'bullets', items: [
              'S&P 500 index fund = ownership in 500 largest US companies',
              'Nifty 50 index fund = ownership in 50 largest Indian companies',
              'Fees are tiny (0.03%–0.20% per year)',
              'No need to research individual stocks',
            ]
          },
        ],
      },
    ],
    takeaways: [
      'Stocks = ownership. Bonds = lending. Index funds = buying the whole market.',
      'Index funds are the simplest way for beginners to start investing.',
      'Diversification (not putting all eggs in one basket) reduces risk.',
      'Start early — even small amounts grow significantly over time.',
    ],
    recap: 'Stocks give you ownership, bonds give you steady income, and index funds give you everything in one package. For most beginners, starting with a low-cost index fund is the smartest first move.',
    quiz: [
      {
        question: 'What does owning a stock mean?',
        options: ['You lent money to the company', 'You own a small piece of the company', 'You work for the company', 'You owe the company money'],
        answer: 1,
      },
      {
        question: 'What is the main advantage of an index fund?',
        options: ['Guaranteed returns', 'Instant diversification at low cost', 'No fees at all', 'It only holds 2-3 stocks'],
        answer: 1,
      },
      {
        question: 'How do bonds differ from stocks?',
        options: ['Bonds are always riskier', 'Bonds represent ownership', 'Bonds are loans that pay interest', 'Bonds never lose value'],
        answer: 2,
      },
    ],
  },

  /* UNDERSTANDING ETFS */
  'understanding-etfs': {
    title: 'Understanding ETFs',
    difficulty: 'Beginner',
    readingTime: '7 min',
    overview: 'Exchange-Traded Funds (ETFs) let you invest in hundreds of companies with a single purchase. Learn how they work, why fees matter, and how to pick the right one.',
    infographic: { type: 'etf-diversification', props: { title: 'How One ETF Gives You Diversification' } },
    sections: [
      {
        heading: 'What is an ETF?',
        content: [
          { type: 'text', value: 'An ETF is a basket of investments that trades on the stock exchange — just like a single stock.' },
          { type: 'analogy', value: '🎁 Think of an ETF as a gift basket. Instead of buying apples, oranges, and bananas separately, you buy one basket that contains all of them.' },
          {
            type: 'bullets', items: [
              'Trades throughout the day (unlike mutual funds which trade once daily)',
              'Can hold stocks, bonds, commodities, or a mix',
              'You can buy as little as 1 share',
              'Most popular ETFs track an index (like S&P 500)',
            ]
          },
        ],
      },
      {
        heading: 'Why Expense Ratios Matter',
        content: [
          { type: 'text', value: 'The expense ratio is the annual fee you pay for owning an ETF. It\'s small — but it compounds over decades.' },
          { type: 'example', value: 'Investing ₹10,00,000 for 30 years:\n• At 0.03% fee → you keep ₹1,73,000 more\n• At 1.00% fee → you lose ₹1,73,000 to fees\nThat\'s the same money — just going to fees instead of you.' },
          { type: 'callout', value: 'Rule of thumb: Look for ETFs with expense ratios under 0.20%. The lower, the better.' },
        ],
      },
      {
        heading: 'Index vs Active ETFs',
        content: [
          { type: 'text', value: 'Index ETFs follow a formula. Active ETFs have a human manager picking stocks.' },
          {
            type: 'bullets', items: [
              'Index ETFs: low fees, consistent returns, no manager bias',
              'Active ETFs: higher fees, manager tries to "beat the market"',
              'Research shows 90%+ of active managers fail to beat index funds over 15 years',
              'For beginners: index ETFs are almost always the better choice',
            ]
          },
          { type: 'callout', value: 'The S&P 500 index has returned ~10% per year on average since 1957. Most professionals can\'t beat that consistently.' },
        ],
      },
    ],
    takeaways: [
      'ETFs give you instant diversification in a single purchase.',
      'Lower expense ratios = more money stays in your pocket.',
      'Index ETFs outperform most active managers over long periods.',
      'Popular starter ETFs: SPY (S&P 500), VTI (total US market), NIFTYBEES (Nifty 50).',
    ],
    recap: 'ETFs are the easiest way to diversify. Pick low-cost index ETFs, check the expense ratio, and let compounding do the heavy lifting.',
    quiz: [
      {
        question: 'What is an ETF?',
        options: ['A single stock', 'A basket of investments that trades like a stock', 'A savings account', 'A type of bond'],
        answer: 1,
      },
      {
        question: 'Why are low expense ratios important?',
        options: ['They don\'t matter', 'Lower fees mean more of your returns stay with you', 'Higher fees always mean better returns', 'Expense ratios are fixed by the government'],
        answer: 1,
      },
      {
        question: 'What percentage of active managers beat index funds over 15+ years?',
        options: ['Over 90%', 'About 50%', 'Less than 10%', 'Exactly 75%'],
        answer: 2,
      },
    ],
  },

  /* STOCKS VS BONDS */
  'stocks-vs-bonds': {
    title: 'Stocks vs Bonds',
    difficulty: 'Beginner',
    readingTime: '6 min',
    overview: 'Stocks and bonds are the two most important asset classes. Understanding how they differ helps you build a balanced portfolio that matches your goals and risk tolerance.',
    infographic: {
      type: 'comparison-table',
      props: {
        title: 'Stocks vs Bonds — Side by Side',
        headers: ['Feature', 'Stocks', 'Bonds'],
        rows: [
          ['Ownership', 'You own part of a company', 'You lend money to a company/govt'],
          ['Risk', 'Higher — prices can swing wildly', 'Lower — more predictable'],
          ['Return potential', 'Higher (10%+ avg/year)', 'Lower (4–6% avg/year)'],
          ['Income', 'Dividends (not guaranteed)', 'Interest payments (scheduled)'],
          ['Best for', 'Long-term growth', 'Stability & income'],
          ['When they fall', 'Recessions, bad earnings', 'Rising interest rates'],
        ],
      },
    },
    sections: [
      {
        heading: 'Stocks — Own a Piece of the Business',
        content: [
          { type: 'text', value: 'When you buy a stock, you become a part-owner. Your returns depend on how well the company performs.' },
          { type: 'analogy', value: '🏪 Imagine buying a share of your neighbor\'s bakery. If the bakery does well, your share becomes more valuable. If it fails, you could lose your investment.' },
          {
            type: 'bullets', items: [
              'Historically return ~10% per year (before inflation)',
              'Prices can drop 30-50% during crashes — but they recover',
              'Best for goals that are 5+ years away',
              'Dividends provide extra income from some stocks',
            ]
          },
        ],
      },
      {
        heading: 'Bonds — Lend and Earn Interest',
        content: [
          { type: 'text', value: 'When you buy a bond, you\'re lending money. The borrower pays you regular interest and returns your principal at maturity.' },
          { type: 'analogy', value: '📝 It\'s like a formal IOU. "I\'ll borrow ₹1,00,000 from you, pay you ₹6,000/year, and return the full amount in 10 years."' },
          {
            type: 'bullets', items: [
              'Government bonds (safest): US Treasury, Indian Govt Securities',
              'Corporate bonds (higher yield but more risk)',
              'Returns are more predictable than stocks',
              'Important for portfolio stability during stock market drops',
            ]
          },
        ],
      },
      {
        heading: 'How to Combine Them',
        content: [
          { type: 'text', value: 'Most portfolios use both stocks and bonds. The mix depends on your age, goals, and comfort with risk.' },
          { type: 'callout', value: 'Classic rule of thumb: Your bond allocation (%) ≈ your age. A 25-year-old might hold 75% stocks / 25% bonds. A 60-year-old might hold 40% stocks / 60% bonds.' },
          {
            type: 'bullets', items: [
              'Young investors (20s–30s): heavy on stocks for growth',
              'Middle age (40s–50s): gradually add more bonds',
              'Near retirement (60+): bonds provide stability and income',
              'There\'s no perfect ratio — it depends on your risk tolerance',
            ]
          },
        ],
      },
    ],
    takeaways: [
      'Stocks = ownership + growth potential + higher risk.',
      'Bonds = lending + steady income + lower risk.',
      'A balanced portfolio uses both — the ratio depends on your timeline and risk tolerance.',
      'When stocks crash, bonds often hold steady (and vice versa) — that\'s the power of balance.',
    ],
    recap: 'Stocks give you growth, bonds give you stability. Combine both based on your age and risk comfort. Young? Go heavier on stocks. Close to retirement? Lean toward bonds.',
    quiz: [
      {
        question: 'What happens when you buy a stock?',
        options: ['You lend money to the company', 'You become a part-owner of the company', 'You deposit money in a savings account', 'You insure the company'],
        answer: 1,
      },
      {
        question: 'What is the classic "age-based" rule for bond allocation?',
        options: ['Always keep 50% in bonds', 'Bond % ≈ your age', 'Never buy bonds before age 50', 'Bonds are only for corporations'],
        answer: 1,
      },
      {
        question: 'Why do portfolios combine stocks AND bonds?',
        options: ['It\'s required by law', 'Bonds always outperform stocks', 'They balance growth and stability', 'There\'s no reason to combine them'],
        answer: 2,
      },
    ],
  },

  /* POWER OF COMPOUNDING */
  'power-of-compounding': {
    title: 'The Power of Compounding',
    difficulty: 'Beginner',
    readingTime: '7 min',
    overview: 'Albert Einstein reportedly called compound interest the "eighth wonder of the world." Learn how your money can grow exponentially when you give it enough time.',
    infographic: { type: 'compounding-timeline', props: { title: 'How ₹10,000 Grows Over Time (at 10%/year)' } },
    sections: [
      {
        heading: 'What is Compounding?',
        content: [
          { type: 'text', value: 'Compounding is when your investment earns returns — and then those returns earn their own returns. It\'s growth on top of growth.' },
          { type: 'analogy', value: '⛄ Think of a snowball rolling downhill. It starts small, but as it rolls, it picks up more snow. The bigger it gets, the MORE snow it picks up with each roll. That\'s compounding.' },
          { type: 'example', value: 'Year 1: ₹10,000 earns 10% → ₹11,000\nYear 2: ₹11,000 earns 10% → ₹12,100 (not ₹12,000!)\nYear 3: ₹12,100 earns 10% → ₹13,310\n\nNotice: each year you earn more than the last — even though the rate stays the same.' },
        ],
      },
      {
        heading: 'The Rule of 72',
        content: [
          { type: 'text', value: 'Want to know how long it takes to double your money? Divide 72 by your annual return rate.' },
          { type: 'callout', value: '72 ÷ return rate = years to double\n\n• At 6% → 72 ÷ 6 = 12 years\n• At 10% → 72 ÷ 10 = 7.2 years\n• At 12% → 72 ÷ 12 = 6 years' },
          {
            type: 'bullets', items: [
              'This is an approximation — not exact math',
              'Works best for rates between 4% and 15%',
              'Great for quick mental math when evaluating investments',
            ]
          },
        ],
      },
      {
        heading: 'Why Starting Early Beats Starting Big',
        content: [
          { type: 'text', value: 'The biggest advantage in investing isn\'t money — it\'s time. Starting early gives compounding more years to work.' },
          { type: 'example', value: 'Aisha starts investing ₹5,000/month at age 22.\nRaj starts investing ₹10,000/month at age 32.\n\nAt age 60 (at 10% returns):\n• Aisha invested ₹22.8 lakhs → grew to ₹3.16 crore\n• Raj invested ₹33.6 lakhs → grew to ₹2.26 crore\n\nAisha invested LESS money but ended up with MORE — because she had 10 extra years of compounding.' },
          { type: 'callout', value: 'The best time to start investing was 10 years ago. The second best time is today.' },
        ],
      },
    ],
    takeaways: [
      'Compounding = earning returns on your returns. It accelerates over time.',
      'Rule of 72: divide 72 by your return rate to find how many years to double your money.',
      'Starting early matters more than starting big. Time is your biggest asset.',
      'Even small amounts (₹1,000–5,000/month) can grow into lakhs over 20-30 years.',
    ],
    recap: 'Compounding is the most powerful force in investing. Your money earns money, which earns more money. Start as early as you can, stay consistent, and let time do the heavy lifting.',
    quiz: [
      {
        question: 'What is compound interest?',
        options: ['Interest only on your original amount', 'Interest on your interest (growth on growth)', 'A type of bank fee', 'A government tax on investments'],
        answer: 1,
      },
      {
        question: 'Using the Rule of 72, how long to double money at 12% return?',
        options: ['12 years', '6 years', '72 years', '3 years'],
        answer: 1,
      },
      {
        question: 'Why does starting early beat investing more money later?',
        options: ['Early investments earn higher interest rates', 'You get government bonuses for starting early', 'More time = more compounding cycles', 'Banks charge less to young investors'],
        answer: 2,
      },
    ],
  },

  /* DIVERSIFICATION */
  'diversification': {
    title: 'Diversification',
    difficulty: 'Intermediate',
    readingTime: '8 min',
    overview: "Don't put all your eggs in one basket. Diversification is the single most powerful risk-reduction strategy available to every investor — and it's completely free.",
    infographic: { type: 'portfolio-allocation', props: { title: 'Sample Diversified Indian Investor Portfolio' } },
    sections: [
      {
        heading: 'What is Diversification?',
        content: [
          { type: 'text', value: 'Diversification means spreading your money across different types of assets so that no single investment can seriously damage your overall portfolio.' },
          { type: 'analogy', value: '🥚 Imagine carrying 10 eggs in one basket. If you drop the basket, you lose all 10 eggs. Now imagine carrying 2 eggs in 5 different baskets. Even if you drop one basket, you still have 8 eggs left. That\'s diversification.' },
          {
            type: 'bullets', items: [
              'Different asset classes (stocks, bonds, gold, real estate) react differently to market events',
              'When stocks fall, gold and bonds often hold steady or rise',
              'Geographic diversification (India + USA + International) adds another layer of protection',
              'Time diversification (investing monthly via SIP) averages out your buy price',
            ]
          },
        ],
      },
      {
        heading: 'Why Diversification Reduces Risk',
        content: [
          { type: 'text', value: 'The math behind diversification is called correlation. When two assets are not correlated, they don\'t move together — so when one falls, the other may not.' },
          { type: 'example', value: '2020 Covid Crash Example:\n\n• Indian Stocks (Nifty 50): Fell -38%\n• Gold: Rose +13%\n• US Dollar bonds: Rose +6%\n\nAn investor with only Indian stocks lost 38%.\nAn investor with a diversified portfolio (60% stocks, 20% gold, 20% bonds) lost only ~15%.' },
          { type: 'callout', value: '📊 Diversification does NOT guarantee profit — it reduces the severity of losses. You will still have bad years, but they will hurt less.' },
        ],
      },
      {
        heading: 'How to Diversify Your Portfolio',
        content: [
          { type: 'text', value: 'A well-diversified Indian investor\'s portfolio might look like this:' },
          {
            type: 'bullets', items: [
              'Indian Stocks (35%) — Large cap index funds (Nifty 50), mid cap funds',
              'US Stocks (20%) — US index fund via international funds (e.g., Motilal Oswal US ETF)',
              'Gold (15%) — Sovereign Gold Bonds (SGBs) or Gold ETFs',
              'Bonds (15%) — Government securities, corporate bond funds',
              'Fixed Deposits (10%) — Safety net for capital preservation',
              'Cash (5%) — Emergency fund / opportunity reserve',
            ]
          },
          { type: 'callout', value: '💡 The exact percentages depend on your age, risk tolerance, and financial goals. Younger investors can afford more equity; older investors should lean toward stability.' },
        ],
      },
      {
        heading: 'Common Diversification Mistakes',
        content: [
          {
            type: 'bullets', items: [
              'Over-diversification: Holding 30+ mutual funds that all invest in the same stocks',
              'Ignoring correlation: "Diversifying" between 10 tech stocks (they all move together)',
              'All Indian: Missing global growth by only investing in Indian assets',
              'No rebalancing: Your 60/40 stock-bond mix becomes 80/20 after a bull market — rebalance annually',
            ]
          },
        ],
      },
    ],
    takeaways: [
      'Diversification spreads risk across assets that don\'t move together.',
      'True diversification includes different asset classes AND geographies.',
      'It reduces the pain of losses without sacrificing long-term returns.',
      'Rebalance your portfolio at least once a year to maintain your target allocation.',
    ],
    recap: 'Diversification is free risk protection. Spread across stocks, bonds, gold, and geographies. Different assets fall and rise at different times — together they smooth your investing journey.',
    quiz: [
      {
        question: 'What is the main purpose of diversification?',
        options: ['To guarantee profits', 'To reduce risk by spreading investments', 'To pick the best stocks', 'To avoid paying taxes'],
        answer: 1,
      },
      {
        question: 'Which scenario best illustrates diversification?',
        options: ['Investing all money in Nifty 50', 'Buying 10 different tech stocks', 'Splitting money across stocks, gold, bonds, and FDs', 'Investing in one mutual fund'],
        answer: 2,
      },
      {
        question: 'Why do stocks and gold together reduce portfolio risk?',
        options: ['They always rise together', 'Gold guarantees returns', 'They are not correlated — they often move in opposite directions', 'Gold is always more valuable than stocks'],
        answer: 2,
      },
    ],
  },

  /* RISK MANAGEMENT */
  'risk-management': {
    title: 'Risk Management',
    difficulty: 'Intermediate',
    readingTime: '9 min',
    overview: 'Every investment carries risk. The goal is not to eliminate risk — it\'s to understand it, measure it, and make sure you never take more risk than you can afford to lose.',
    infographic: { type: 'risk-return-chart', props: { title: 'Risk vs Return — Where Different Assets Sit' } },
    sections: [
      {
        heading: 'Understanding Types of Risk',
        content: [
          { type: 'text', value: 'Risk in investing means the chance that you lose money — either temporarily (volatility) or permanently (the company goes bankrupt). There are many types:' },
          {
            type: 'bullets', items: [
              'Market Risk: The whole market falls (like 2020 Covid crash). Affects all stocks.',
              'Company Risk: One specific company does badly (e.g., accounting fraud, bad management)',
              'Liquidity Risk: You can\'t sell your investment when you need to (like real estate)',
              'Inflation Risk: Your returns don\'t beat inflation — your purchasing power falls',
              'Currency Risk: Investing globally, currency moves can hurt returns',
            ]
          },
          { type: 'callout', value: '✅ Market risk affects everyone. Company risk can be reduced by diversification. The more concentrated your portfolio, the higher your company risk.' },
        ],
      },
      {
        heading: 'Position Sizing — The Golden Rule',
        content: [
          { type: 'text', value: 'Position sizing is deciding how much of your portfolio to put into a single investment. This is one of the most important skills in investing.' },
          { type: 'analogy', value: '🎯 A surgeon doesn\'t risk the patient\'s life to save the little toe. Protect the whole — never risk your entire portfolio on one trade.' },
          { type: 'example', value: 'Example rule: Never risk more than 5% of your portfolio on any single stock.\n\nIf your portfolio is ₹5,00,000:\n→ Max in any single stock: ₹25,000\n→ If that stock goes to 0 (worst case): you lose only 5%\n→ Your portfolio survives and can recover' },
          {
            type: 'bullets', items: [
              'Beginner rule: No single stock > 5-10% of portfolio',
              'Advanced: Use the Kelly Criterion for mathematical position sizing',
              'For ETFs and index funds: no position sizing needed (already diversified)',
            ]
          },
        ],
      },
      {
        heading: 'Stop-Loss: Your Safety Net',
        content: [
          { type: 'text', value: 'A stop-loss is a pre-set price at which you automatically sell a losing investment to prevent further losses.' },
          { type: 'example', value: 'You buy Infosys at ₹1,500.\nYou set a stop-loss at ₹1,350 (10% below).\nIf Infosys falls to ₹1,350 → your broker automatically sells.\nYou cap your loss at 10% instead of holding through a 40% crash.' },
          { type: 'callout', value: '⚠️ Stop-losses are useful for traders, but long-term investors (5+ years) often avoid them — normal volatility can trigger stops and force you to sell quality assets at the wrong time.' },
        ],
      },
      {
        heading: 'Portfolio Beta — Measuring Your Risk',
        content: [
          { type: 'text', value: 'Beta measures how much your portfolio moves relative to the overall market. It tells you how risky your portfolio is compared to a benchmark like Nifty 50.' },
          {
            type: 'bullets', items: [
              'Beta = 1.0: Your portfolio moves exactly with the market',
              'Beta > 1.0: More volatile than the market (e.g., small caps, crypto)',
              'Beta < 1.0: Less volatile than the market (e.g., bonds, large-cap value stocks)',
              'Beta = 0: No correlation to market (e.g., gold, real estate)',
            ]
          },
          { type: 'example', value: 'Portfolio with Beta 1.5: If Nifty falls 10%, your portfolio likely falls 15%. But when Nifty rises 10%, you may gain 15%.\n\nFor most investors: aim for Beta between 0.7 and 1.2.' },
        ],
      },
    ],
    takeaways: [
      'Risk is inevitable — the goal is to manage it, not eliminate it.',
      'Never put more than 5-10% of your portfolio into a single stock.',
      'Stop-losses protect traders; long-term investors should focus on asset allocation instead.',
      'Portfolio beta tells you how risky your mix is relative to the market.',
    ],
    recap: 'Good risk management is about sizing positions wisely, diversifying assets, and never risking more than you can afford to lose. Know your beta, set your limits, and stick to them.',
    quiz: [
      {
        question: 'What does a portfolio beta of 1.5 mean?',
        options: ['It is 1.5x safer than the market', 'It moves 50% more than the market in both directions', 'It earns 1.5x the market return guaranteed', 'It has 1.5% annual fees'],
        answer: 1,
      },
      {
        question: 'What is the purpose of a stop-loss order?',
        options: ['To guarantee profits', 'To automatically sell when a price drops to a set level', 'To buy more when prices fall', 'To calculate dividends'],
        answer: 1,
      },
      {
        question: 'Which type of risk can be reduced by owning many different stocks?',
        options: ['Market risk', 'Inflation risk', 'Company-specific risk', 'Currency risk'],
        answer: 2,
      },
    ],
  },

  /* ══════════════════ TECHNICAL ANALYSIS ══════════════════ */
  'technical-analysis': {
    title: 'Technical Analysis',
    difficulty: 'Intermediate',
    readingTime: '10 min',
    overview: 'Technical analysis is the art of reading price charts to predict future movements. It doesn\'t care WHY a stock moves — only WHERE it might go next, based on patterns in price and volume.',
    infographic: { type: 'technical-analysis', props: { title: 'Candlestick Chart with Support, Resistance & Moving Average' } },
    sections: [
      {
        heading: 'Reading Candlestick Charts',
        content: [
          { type: 'text', value: 'A candlestick shows 4 key pieces of information for any time period (1 day, 1 hour, etc.): Open, High, Low, Close.' },
          { type: 'example', value: 'One daily candle tells you:\n• OPEN: Price at the start of the day\n• HIGH: Highest price reached\n• LOW: Lowest price reached\n• CLOSE: Price at end of the day\n\nGreen candle = closed higher than opened (buyers in control)\nRed candle = closed lower than opened (sellers in control)' },
          { type: 'callout', value: '🕯️ Famous patterns: Doji (indecision), Hammer (reversal), Engulfing (strong move), Morning Star (bullish reversal after a downtrend).' },
        ],
      },
      {
        heading: 'Support and Resistance Levels',
        content: [
          { type: 'text', value: 'Support is a price floor — the price keeps bouncing off this level because buyers step in. Resistance is a ceiling — sellers emerge every time the price reaches this level.' },
          { type: 'analogy', value: '🏀 Imagine bouncing a basketball. The floor is support (it bounces back up). The ceiling is resistance (it can\'t go higher). When a ball breaks through the ceiling, that ceiling becomes the new floor.' },
          {
            type: 'bullets', items: [
              'Support: Price level where demand has historically been strong',
              'Resistance: Price level where supply has historically been strong',
              'Breakout: When price decisively moves through resistance (bullish signal)',
              'Breakdown: When price falls through support (bearish signal)',
              'Role reversal: Old resistance becomes new support after a breakout',
            ]
          },
        ],
      },
      {
        heading: 'Moving Averages',
        content: [
          { type: 'text', value: 'A moving average (MA) smooths out price data by calculating the average price over a set period. It filters out the noise and shows the underlying trend.' },
          { type: 'example', value: '50-day MA: Average of last 50 closing prices → medium-term trend\n200-day MA: Average of last 200 closing prices → long-term trend\n\nGolden Cross: 50-day MA crosses ABOVE 200-day MA → Bullish signal\nDeath Cross: 50-day MA crosses BELOW 200-day MA → Bearish signal' },
          { type: 'callout', value: '📈 Many institutional investors use the 200-day MA as their main indicator. When a stock is above its 200-day MA, the trend is considered bullish.' },
        ],
      },
      {
        heading: 'RSI — Relative Strength Index',
        content: [
          { type: 'text', value: 'RSI is a momentum indicator that measures how fast and how much a price has moved. It ranges from 0 to 100.' },
          {
            type: 'bullets', items: [
              'RSI > 70: Stock is overbought — potential for pullback',
              'RSI < 30: Stock is oversold — potential for bounce',
              'RSI = 50: Neutral momentum',
            ]
          },
          { type: 'callout', value: '⚠️ RSI works best in sideways markets. In strong uptrends, RSI can stay above 70 for months. Never use one indicator alone.' },
        ],
      },
    ],
    takeaways: [
      'Candlesticks show Open, High, Low, Close — the foundation of chart reading.',
      'Support and resistance are price levels where supply and demand concentrate.',
      'Moving averages filter noise and reveal the underlying trend direction.',
      'RSI measures momentum — above 70 is overbought, below 30 is oversold.',
      'Technical analysis works best combined with fundamental analysis.',
    ],
    recap: 'Technical analysis gives you a visual language for price behavior. Learn to read candles, identify support/resistance zones, and use moving averages to confirm trends. Combine with fundamentals for the complete picture.',
    quiz: [
      {
        question: 'What does a green (bullish) candlestick tell you?',
        options: ['The stock will rise tomorrow', 'The price closed higher than it opened', 'Volume was high that day', 'The stock paid a dividend'],
        answer: 1,
      },
      {
        question: 'What is a "Golden Cross"?',
        options: ['A candlestick pattern', 'When the 50-day MA crosses above the 200-day MA', 'When RSI reaches 70', 'When price hits a resistance level'],
        answer: 1,
      },
      {
        question: 'An RSI reading of 25 suggests the stock is:',
        options: ['Overbought — likely to fall', 'Oversold — potential for a bounce', 'Trending strongly upward', 'About to pay a dividend'],
        answer: 1,
      },
    ],
  },

  /* MARKET PSYCHOLOGY */
  'market-psychology': {
    title: 'Market Psychology',
    difficulty: 'Intermediate',
    readingTime: '9 min',
    overview: 'Markets are driven by human emotions — fear and greed. Understanding the emotional cycle of the market helps you make rational decisions when everyone else is panicking or euphoric.',
    infographic: { type: 'emotion-cycle', props: { title: 'The Emotional Cycle of a Market' } },
    sections: [
      {
        heading: 'The Emotional Cycle of Markets',
        content: [
          { type: 'text', value: 'Markets move in emotional cycles. Understanding where you are in the cycle is one of the most valuable skills an investor can have.' },
          {
            type: 'bullets', items: [
              '😊 Optimism: "Things are looking good, I should invest."',
              '😃 Excitement: "Prices are going up! I\'m making money!"',
              '🤑 Euphoria: "This market can only go up. Maximum buying." ← Peak',
              '😰 Anxiety: "Prices stopped rising... that\'s strange."',
              '😟 Denial: "It\'s just a temporary dip. It\'ll bounce back."',
              '😱 Panic: "Everything is crashing! I need to sell NOW!" ← Trough',
              '😔 Capitulation: "I give up on investing forever."',
              '😌 Recovery: Smart investors start buying. ← Best entry point',
            ]
          },
          { type: 'callout', value: '🧠 The best time to buy is when everyone is in panic/capitulation. The riskiest time to buy is during euphoria. But most people do the opposite.' },
        ],
      },
      {
        heading: 'Fear and Greed — The Two Drivers',
        content: [
          { type: 'text', value: 'Warren Buffett said it best: "Be fearful when others are greedy, and greedy when others are fearful." Most investors do the exact opposite — they buy when markets are high (greed) and sell when markets crash (fear).' },
          { type: 'example', value: 'March 2020 (Covid Crash):\n• Nifty 50 fell 38% in 6 weeks\n• Everyone was selling in panic\n• Smart investors were buying quality stocks at 40% discount\n\n1 year later, Nifty was up 70% from the low.\nThe panic sellers missed the entire recovery.' },
          { type: 'callout', value: '📊 The CNN Fear & Greed Index measures market sentiment. Extreme Fear often signals buying opportunities. Extreme Greed signals caution.' },
        ],
      },
      {
        heading: 'Behavioral Biases That Hurt Returns',
        content: [
          { type: 'text', value: 'Our brains are not wired for investing. Evolution trained us to react quickly to fear — but quick reactions in markets often lead to bad decisions.' },
          {
            type: 'bullets', items: [
              'Loss Aversion: Losing ₹1,000 feels twice as painful as gaining ₹1,000 feels good — so we hold losers too long',
              'Confirmation Bias: We seek information that confirms what we already believe about a stock',
              'Herding: "Everyone is buying this" — we follow the crowd into overvalued assets',
              'Recency Bias: We assume recent trends will continue forever (bull markets feel permanent, bear markets feel endless)',
              'Anchoring: We anchor to purchase price — refusing to sell at ₹900 what we bought at ₹1,000, even if it\'s overvalued at ₹900',
            ]
          },
        ],
      },
      {
        heading: 'How to Stay Rational',
        content: [
          {
            type: 'bullets', items: [
              'Write down your investment thesis BEFORE you buy — stick to it',
              'Automate investments via SIP — removes emotion from timing decisions',
              'Set rules: "I will not check my portfolio more than once a month"',
              'Keep 6 months of emergency fund so you never NEED to sell investments',
              'Read about past crashes — knowing markets always recover reduces panic',
            ]
          },
          { type: 'callout', value: '💡 The single best thing you can do is automate. An SIP investor who ignored the 2020 crash and kept investing monthly came out far ahead of the investor who panicked and stopped.' },
        ],
      },
    ],
    takeaways: [
      'Markets cycle through emotions: Optimism → Euphoria → Panic → Recovery.',
      'The best buying opportunities come during panic and capitulation.',
      'Behavioral biases like loss aversion and herding cause most investing mistakes.',
      'Automating investments via SIP removes emotion from the equation.',
    ],
    recap: 'The market is a voting machine in the short term (driven by emotions) and a weighing machine in the long term (driven by fundamentals). Stay rational, invest systematically, and use market fear as your friend.',
    quiz: [
      {
        question: 'During which phase of the emotional cycle is it typically the BEST time to buy?',
        options: ['Euphoria', 'Excitement', 'Panic/Capitulation', 'Optimism'],
        answer: 2,
      },
      {
        question: 'What is loss aversion in investing?',
        options: ['Avoiding all losses', 'Feeling losses more intensely than equivalent gains', 'Only investing in safe assets', 'Selling everything during a crash'],
        answer: 1,
      },
      {
        question: 'What does Warren Buffett mean by "Be fearful when others are greedy"?',
        options: ['Avoid all risky investments', 'When markets are exuberant, be cautious — prices may be overvalued', 'Fear is always a sign to sell', 'Greed is always good for returns'],
        answer: 1,
      },
    ],
  },

  /* FUNDAMENTAL ANALYSIS */
  'fundamental-analysis': {
    title: 'Fundamental Analysis',
    difficulty: 'Advanced',
    readingTime: '11 min',
    overview: 'Fundamental analysis is the process of evaluating a company\'s true worth by examining its financial health, competitive advantages, and growth potential. It answers the question: Is this stock cheap or expensive?',
    infographic: { type: 'business-valuation-flow', props: { title: 'How Fundamental Analysis Works: Revenue to Valuation' } },
    sections: [
      {
        heading: 'Revenue and Revenue Growth',
        content: [
          { type: 'text', value: 'Revenue (also called sales or top line) is the total money a company earns from its core business. Revenue growth tells you whether the business is expanding.' },
          { type: 'example', value: 'Infosys FY2023 Revenue: ₹1,46,767 crore\nInfosys FY2022 Revenue: ₹1,21,641 crore\nGrowth: +20.7%\n\nThis is strong growth — the business is clearly expanding. Look for consistency: 3-5 years of growing revenue.' },
          { type: 'callout', value: '⚠️ Revenue alone doesn\'t mean profit. A company can have high revenue and still be losing money (e.g., startups that spend heavily on growth).' },
        ],
      },
      {
        heading: 'Profit Margins',
        content: [
          { type: 'text', value: 'Margins tell you how much profit a company keeps for every rupee of revenue. Three key margins:' },
          {
            type: 'bullets', items: [
              'Gross Margin = (Revenue - Cost of Goods) / Revenue → Raw profitability',
              'Operating Margin = Operating Profit / Revenue → Efficiency after all operations',
              'Net Margin = Net Profit / Revenue → Final profit after taxes and interest',
            ]
          },
          { type: 'example', value: 'TCS Net Margin: ~24% → For every ₹100 of revenue, TCS keeps ₹24 as profit.\nAverage Indian IT company: ~15-20%\n\nHigher and improving margins = better business. Falling margins = rising costs or pricing pressure.' },
        ],
      },
      {
        heading: 'The P/E Ratio — Is the Stock Cheap or Expensive?',
        content: [
          { type: 'text', value: 'Price-to-Earnings (P/E) ratio is the most commonly used valuation metric. It tells you how much investors are willing to pay for ₹1 of a company\'s earnings.' },
          { type: 'example', value: 'Stock price: ₹500\nEarnings Per Share (EPS): ₹25\nP/E = ₹500 / ₹25 = 20x\n\nThis means investors pay ₹20 for every ₹1 of earnings.\n\nNifty 50 average P/E: ~20-22 (historical)\nP/E < 15: Potentially undervalued\nP/E > 30: Potentially overvalued (or high growth expected)' },
          { type: 'callout', value: '💡 Compare P/E within the same industry. A bank with P/E 12 may be cheap. A tech company with P/E 12 may be very cheap. Context matters.' },
        ],
      },
      {
        heading: 'Debt and Balance Sheet Health',
        content: [
          { type: 'text', value: 'A company\'s balance sheet shows its assets, liabilities (debt), and equity. High debt is risky — it must be repaid even when business is bad.' },
          {
            type: 'bullets', items: [
              'Debt-to-Equity ratio: Total debt / Total equity. Lower is safer. > 1.0 means more debt than equity.',
              'Interest Coverage Ratio: Operating Profit / Interest Expense. > 3 is considered healthy.',
              'Current Ratio: Current Assets / Current Liabilities. > 1.5 means company can pay short-term bills.',
              'Cash flow positive: Companies that generate more cash than they spend are self-sustaining.',
            ]
          },
          { type: 'callout', value: '✅ Debt-free or low-debt companies like Infosys and TCS can weather recessions better than heavily leveraged peers.' },
        ],
      },
    ],
    takeaways: [
      'Revenue growth shows business expansion — look for 3+ years of consistent growth.',
      'Net margin tells you how much profit the company keeps per rupee of revenue.',
      'P/E ratio is the starting point for valuation — always compare within the same industry.',
      'Debt levels matter — low debt companies survive recessions better.',
    ],
    recap: 'Fundamental analysis is detective work. You\'re trying to figure out if a business is genuinely valuable or just popular. Revenue growth + improving margins + fair P/E + low debt = a quality business at a reasonable price.',
    quiz: [
      {
        question: 'What does a P/E ratio of 20 mean?',
        options: ['The stock pays 20% dividend', 'Investors pay ₹20 for every ₹1 of earnings', 'The company grew 20% this year', 'The stock is overvalued by 20%'],
        answer: 1,
      },
      {
        question: 'Which metric shows the final profit a company keeps after all expenses?',
        options: ['Gross Margin', 'Revenue Growth', 'Net Profit Margin', 'Current Ratio'],
        answer: 2,
      },
      {
        question: 'Why is low debt generally considered positive for a company?',
        options: ['Low debt companies pay higher dividends', 'Low debt means they can sell more products', 'They can survive downturns without being forced to default', 'Debt is illegal for listed companies'],
        answer: 2,
      },
    ],
  },

  /* PORTFOLIO CONSTRUCTION */
  'portfolio-construction': {
    title: 'Portfolio Construction',
    difficulty: 'Advanced',
    readingTime: '10 min',
    overview: 'Building a portfolio is more than picking good stocks. It\'s about creating a structured mix of assets that aligns with your financial goals, timeline, and risk tolerance — then maintaining it over time.',
    infographic: { type: 'portfolio-type', props: { title: 'Three Portfolio Styles: Conservative, Balanced & Growth' } },
    sections: [
      {
        heading: 'The Three Portfolio Styles',
        content: [
          { type: 'text', value: 'Before picking any investment, you must decide which portfolio style fits you. Your style depends on three factors: timeline, risk tolerance, and financial goal.' },
          {
            type: 'bullets', items: [
              '🛡️ Conservative: Capital preservation above all. For investors nearing retirement or with low risk tolerance. Heavy in bonds and FDs.',
              '⚖️ Balanced: Growth with stability. For investors with a 5-10 year horizon who want moderate returns with manageable swings.',
              '🚀 Growth: Maximum long-term returns. For young investors with 10+ year horizons who can weather market crashes.',
            ]
          },
          { type: 'callout', value: '💡 Your style should change over time. At 25, you might be Growth. At 45, shift to Balanced. At 60, Conservative. This is called the "glide path" strategy.' },
        ],
      },
      {
        heading: 'Core-Satellite Portfolio Strategy',
        content: [
          { type: 'text', value: 'A popular professional approach is the Core-Satellite model. The core is your stable, low-cost foundation. Satellites are smaller, higher-conviction bets.' },
          { type: 'example', value: 'Example Core-Satellite Portfolio:\n\nCORE (70-80% of portfolio):\n• Nifty 50 Index Fund: 40%\n• US S&P 500 Index Fund: 20%\n• Bond Fund: 15%\n\nSATELLITE (20-30% of portfolio):\n• Sector ETF (Banking): 10%\n• Gold ETF: 10%\n• Individual stock picks: 10%' },
          { type: 'callout', value: '✅ The core ensures you never underperform the market significantly. Satellites give you the chance to outperform without betting your whole portfolio.' },
        ],
      },
      {
        heading: 'Rebalancing — The Key Discipline',
        content: [
          { type: 'text', value: 'After you build your portfolio, markets will naturally push your allocations away from your targets. Rebalancing is the act of resetting your portfolio back to your intended allocations.' },
          { type: 'example', value: 'Target: 60% stocks, 40% bonds\n\nAfter a bull market:\nStocks grew to 80%, bonds shrunk to 20%\n\nRebalancing: Sell some stocks (lock in profits) → Buy more bonds → Return to 60/40\n\nThis forces you to sell high and buy low — automatically!' },
          {
            type: 'bullets', items: [
              'Rebalance once or twice a year (or when allocation drifts >5% from target)',
              'Use new contributions to rebalance rather than selling (reduces tax)',
              'In tax-advantaged accounts (like ELSS, PPF), rebalance more freely',
            ]
          },
        ],
      },
      {
        heading: 'Tax-Efficient Portfolio Construction',
        content: [
          {
            type: 'bullets', items: [
              'LTCG (Long Term Capital Gains): Hold stocks > 1 year → 10% tax on gains above ₹1 lakh/year',
              'STCG (Short Term Capital Gains): Hold < 1 year → 15% tax on gains',
              'ELSS Funds: Equity funds with 3-year lock-in that qualify for ₹1.5 lakh tax deduction under 80C',
              'Sovereign Gold Bonds: Gold bonds that are tax-free if held to maturity (8 years)',
              'Avoid frequent trading: Each sale is a taxable event — long-term holding minimizes tax drag',
            ]
          },
        ],
      },
    ],
    takeaways: [
      'Choose a portfolio style (Conservative/Balanced/Growth) based on your timeline and risk tolerance.',
      'The Core-Satellite model separates your stable foundation from your higher-conviction bets.',
      'Rebalancing forces you to sell high and buy low — one of the best disciplined investing habits.',
      'Tax efficiency (LTCG, ELSS, SGBs) significantly improves net returns over time.',
    ],
    recap: 'A great portfolio is built with intention. Define your style, use a core-satellite structure, rebalance regularly, and optimize for taxes. The best portfolio is one you can stick to through both bull and bear markets.',
    quiz: [
      {
        question: 'What is the main characteristic of a Conservative portfolio?',
        options: ['Maximum stock allocation', 'Capital preservation with more bonds and FDs', 'Investing only in gold', 'Short-term trading approach'],
        answer: 1,
      },
      {
        question: 'What does rebalancing a portfolio mean?',
        options: ['Selling all investments and starting fresh', 'Resetting allocations back to your original target percentages', 'Adding more money to the portfolio', 'Changing your investment strategy entirely'],
        answer: 1,
      },
      {
        question: 'In a Core-Satellite portfolio, what is the "core"?',
        options: ['High-risk individual stocks', 'Sector-specific ETFs', 'A stable, low-cost foundation like index funds', 'Cryptocurrency holdings'],
        answer: 2,
      },
    ],
  },

  /* GLOBAL INVESTING */
  'global-investing': {
    title: 'Global Investing',
    difficulty: 'Advanced',
    readingTime: '9 min',
    overview: 'The world\'s best companies — Apple, Google, Microsoft — are not listed on Indian exchanges. Global investing lets you participate in growth happening anywhere on Earth, while further reducing your portfolio risk.',
    infographic: { type: 'global-diversification', props: { title: 'A Globally Diversified Portfolio for Indian Investors' } },
    sections: [
      {
        heading: 'Why Invest Globally?',
        content: [
          { type: 'text', value: 'India is one of the fastest-growing economies — but it\'s only about 3% of global stock market value. By only investing in India, you\'re ignoring 97% of the world\'s investable assets.' },
          {
            type: 'bullets', items: [
              'Access to world-class companies: Apple, Microsoft, Google, Tesla, NVIDIA — none available directly in India',
              'Currency diversification: USD-denominated investments protect against INR depreciation',
              'Different economic cycles: When India slows, the US or Europe might be booming',
              'Emerging markets: China, Brazil, Southeast Asia offer high-growth potential',
            ]
          },
          { type: 'example', value: 'Over the last decade:\n• Nifty 50: ~12% annualised return\n• S&P 500: ~14% annualised return (in USD)\n• But S&P 500 return for Indian investor: ~18% (because INR depreciated vs USD by ~4%/year)\n\nINR depreciation is a free bonus for Indian investors holding USD assets!' },
        ],
      },
      {
        heading: 'How Indian Investors Can Invest Globally',
        content: [
          { type: 'text', value: 'You don\'t need a US brokerage account. Indian investors can access global markets through:' },
          {
            type: 'bullets', items: [
              'International Mutual Funds: Funds-of-funds that invest in global ETFs (e.g., Motilal Oswal S&P 500 Fund, Parag Parikh Flexi Cap)',
              'ETFs listed on Indian exchanges: Nifty-listed ETFs tracking US or global indices',
              'RBI Liberalised Remittance Scheme (LRS): Invest up to USD 2,50,000/year directly in foreign stocks/ETFs via platforms like Vested, INDmoney, Groww Global',
              'Feeder funds: Indian funds that feed into international funds like Nasdaq 100',
            ]
          },
          { type: 'callout', value: '💰 Tax note: International funds are taxed as debt funds in India — gains taxed at income tax slab rate if held < 3 years. After 3 years: 20% with indexation benefit.' },
        ],
      },
      {
        heading: 'Gold as a Global Asset',
        content: [
          { type: 'text', value: 'Gold is a global store of value that has held purchasing power for 5,000 years. It is priced in USD globally, so Indian investors benefit from both gold\'s rise and INR depreciation.' },
          {
            type: 'bullets', items: [
              'Sovereign Gold Bonds (SGBs): 2.5% annual interest + gold price appreciation + tax-free on maturity',
              'Gold ETFs: Buy/sell on NSE like a stock, no storage hassle',
              'Digital Gold: On apps like Groww, PhonePe — small amounts, instant buy/sell',
              'Recommended allocation: 10-20% of portfolio in gold as a hedge',
            ]
          },
          { type: 'callout', value: '✅ SGBs are the best way to hold gold in India. You earn 2.5% annual interest (rare for a commodity), and if held to 8-year maturity, capital gains are completely tax-free.' },
        ],
      },
      {
        heading: 'Managing Currency Risk',
        content: [
          { type: 'text', value: 'When you invest globally, your returns can be affected by currency movements. For Indian investors, this usually works in your favor — but not always.' },
          { type: 'example', value: 'Scenario: US stock rose 10% in a year.\n\nIf INR depreciated 4% vs USD:\nYour return = +10% (stock) + 4% (currency bonus) = ~14%\n\nIf INR appreciated 3% vs USD (rare):\nYour return = +10% (stock) - 3% (currency drag) = ~7%\n\nHistorically, INR has depreciated ~3-5% per year vs USD.' },
        ],
      },
    ],
    takeaways: [
      'India is only 3% of global markets — global diversification unlocks the other 97%.',
      'INR depreciation historically boosts USD-denominated returns for Indian investors.',
      'International funds, LRS, and India-listed global ETFs are accessible entry points.',
      'Sovereign Gold Bonds are the best gold investment for Indian investors (interest + tax-free maturity).',
    ],
    recap: 'Global investing is not complex — it just requires understanding that the best companies and markets aren\'t all in India. A 20-30% global allocation gives you currency protection, access to world-class companies, and true diversification.',
    quiz: [
      {
        question: 'Why does INR depreciation benefit Indian investors in US stocks?',
        options: ['It reduces the stock price', 'It means your USD returns are worth MORE rupees when converted back', 'It triggers tax refunds', 'It doesn\'t affect returns at all'],
        answer: 1,
      },
      {
        question: 'What is the annual interest rate on Sovereign Gold Bonds (SGBs)?',
        options: ['0%', '2.5%', '5%', '10%'],
        answer: 1,
      },
      {
        question: 'Approximately what percentage of global stock market value does India represent?',
        options: ['25%', '10%', '3%', '50%'],
        answer: 2,
      },
    ],
  },

  /* CRYPTOCURRENCY BASICS */
  'cryptocurrency-basics': {
    title: 'Cryptocurrency Basics',
    difficulty: 'Advanced',
    readingTime: '10 min',
    overview: 'Cryptocurrency is one of the most volatile, polarizing, and misunderstood asset classes. This lesson explains what it is, how blockchain works, and the real risks — without hype or fear.',
    infographic: { type: 'blockchain', props: { title: 'How Blockchain Records Transactions' } },
    sections: [
      {
        heading: 'What is Cryptocurrency?',
        content: [
          { type: 'text', value: 'A cryptocurrency is a digital currency secured by cryptography and recorded on a blockchain — a decentralized database. No single bank or government controls it.' },
          { type: 'analogy', value: '📚 Think of a blockchain as a public notebook that thousands of people all have a copy of. When someone writes a new entry (transaction), everyone\'s copy updates. To fake a transaction, you\'d have to change everyone\'s copy simultaneously — which is practically impossible.' },
          {
            type: 'bullets', items: [
              'Bitcoin (BTC): The original cryptocurrency — digital gold, store of value, limited to 21 million coins',
              'Ethereum (ETH): A programmable blockchain — powers smart contracts and decentralized apps (DeFi)',
              'Stablecoins (USDC, USDT): Crypto pegged to USD — useful for transfers, avoids volatility',
              'Altcoins: Thousands of other cryptocurrencies — most are speculative and high-risk',
            ]
          },
        ],
      },
      {
        heading: 'How Blockchain Works',
        content: [
          { type: 'text', value: 'A blockchain is a chain of "blocks." Each block contains a group of transactions, a timestamp, and a unique code (hash) that links it to the previous block.' },
          {
            type: 'bullets', items: [
              'Transaction: Alice sends 0.5 BTC to Bob → this transaction is broadcast to the network',
              'Verification: Thousands of computers (nodes) verify the transaction is valid',
              'Block creation: Verified transactions are grouped into a block',
              'Consensus: Majority of nodes agree — block is added to the chain',
              'Immutability: Once added, the block cannot be altered without changing every subsequent block',
            ]
          },
          { type: 'callout', value: '⛏️ Bitcoin uses "Proof of Work" (mining) — computers race to solve math problems to add blocks. Ethereum switched to "Proof of Stake" — validators lock up ETH as collateral to verify transactions.' },
        ],
      },
      {
        heading: 'The Real Risks of Cryptocurrency',
        content: [
          { type: 'text', value: 'Crypto is not like stocks. It has unique, severe risks that every investor must understand before putting in money.' },
          {
            type: 'bullets', items: [
              '📉 Extreme Volatility: Bitcoin fell 80% from peak in 2018, 77% in 2022. Recovery took 3+ years.',
              '🏛️ Regulatory Risk: India has imposed 30% flat tax on crypto gains + 1% TDS on every transaction.',
              '🔓 Hacking Risk: Crypto exchanges have been hacked (FTX collapse, Mt. Gox hack). "Not your keys, not your coins."',
              '📊 No intrinsic value debate: Unlike stocks (earnings) or gold (industrial use), Bitcoin\'s value is purely based on trust and adoption.',
              '🌊 Liquidity risk: Small altcoins can crash 90%+ with no recovery if interest dries up.',
            ]
          },
          { type: 'callout', value: '⚠️ India Tax: All crypto gains taxed at 30% flat rate. No deductions allowed except cost of acquisition. Losses cannot be offset against other income. TDS of 1% on every transaction.' },
        ],
      },
      {
        heading: 'How to Invest in Crypto Safely',
        content: [
          {
            type: 'bullets', items: [
              'Limit allocation: Never put more than 5-10% of your portfolio in crypto',
              'Stick to Bitcoin and Ethereum: Most altcoins are speculative with high failure rate',
              'Use regulated Indian exchanges: CoinDCX, WazirX, Zebpay — regulated under PMLA',
              'Hardware wallet: For large amounts, store crypto in hardware wallet (not on exchange)',
              'Never invest borrowed money: Crypto can drop 80% — you must afford total loss',
              'DCA (Dollar Cost Average): Buy small, fixed amounts monthly — don\'t try to time the market',
            ]
          },
        ],
      },
    ],
    takeaways: [
      'Bitcoin is digital gold (store of value). Ethereum is programmable money (applications).',
      'Blockchain is a decentralized, immutable ledger — no single party controls it.',
      'Crypto has extreme volatility — 80% drawdowns are not rare, they are historically common.',
      'Indian tax on crypto: 30% flat rate, no deduction, 1% TDS per trade.',
      'Limit crypto to 5-10% of portfolio maximum, and only invest what you can afford to lose entirely.',
    ],
    recap: 'Cryptocurrency is a legitimate asset class but an extremely risky one. Understand the technology, know the risks, be aware of Indian tax rules, and never invest money you cannot afford to lose. For most investors, a small allocation to Bitcoin and Ethereum is the most appropriate approach.',
    quiz: [
      {
        question: 'What makes blockchain transactions nearly impossible to fake?',
        options: ['They are encrypted by the government', 'Thousands of computers all hold identical copies — changing one means changing all', 'Transactions are deleted after 24 hours', 'Banks verify every transaction'],
        answer: 1,
      },
      {
        question: 'What is the flat tax rate on cryptocurrency gains in India?',
        options: ['10%', '15%', '30%', '0% — crypto is tax-free'],
        answer: 2,
      },
      {
        question: 'What is the main difference between Bitcoin and Ethereum?',
        options: ['Bitcoin is faster than Ethereum', 'Bitcoin is a store of value; Ethereum is a programmable platform for applications', 'Ethereum is controlled by a central bank', 'There is no difference — they are the same'],
        answer: 1,
      },
    ],
  },
};


/* Render helpers */

function renderInfographic(infographic) {
  if (!infographic) return null;
  const { type, props } = infographic;
  switch (type) {
    case 'flow': return <FlowDiagram {...props} />;
    case 'comparison': return <ComparisonDiagram {...props} />;
    case 'allocation': return <AllocationDiagram {...props} />;
    case 'timeline': return <TimelineDiagram {...props} />;
    case 'process': return <ProcessDiagram {...props} />;
    case 'stock-market-flow': return <StockMarketFlowDiagram {...props} />;
    case 'etf-diversification': return <ETFDiversificationDiagram {...props} />;
    case 'comparison-table': return <ComparisonTableDiagram {...props} />;
    case 'compounding-timeline': return <CompoundingTimelineDiagram {...props} />;
    case 'portfolio-allocation': return <PortfolioAllocationDiagram {...props} />;
    case 'risk-return-chart': return <RiskReturnChart {...props} />;
    case 'technical-analysis': return <TechnicalAnalysisDiagram {...props} />;
    case 'emotion-cycle': return <EmotionCycleDiagram {...props} />;
    case 'business-valuation-flow': return <BusinessValuationFlow {...props} />;
    case 'portfolio-type': return <PortfolioTypeDiagram {...props} />;
    case 'global-diversification': return <GlobalDiversificationDiagram {...props} />;
    case 'blockchain': return <BlockchainDiagram {...props} />;
    default: return null;
  }
}

// Renders rich content — supports plain strings (legacy) and structured arrays
function renderSectionContent(content) {
  if (typeof content === 'string') {
    return (
      <Typography variant="body2" color="text.secondary" lineHeight={1.8} sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
        {content}
      </Typography>
    );
  }

  if (!Array.isArray(content)) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {content.map((block, i) => {
        switch (block.type) {
          case 'text':
            return (
              <Typography key={i} variant="body2" color="text.secondary" lineHeight={1.8} sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                {block.value}
              </Typography>
            );
          case 'bullets':
            return (
              <Box key={i} component="ul" sx={{ m: 0, pl: 2.5 }}>
                {block.items.map((item, j) => (
                  <Box component="li" key={j} sx={{ mb: 0.5, '&::marker': { color: '#7A3E48' } }}>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.7} sx={{ fontSize: { xs: '0.83rem', md: '0.85rem' } }}>
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>
            );
          case 'example':
            return (
              <Box key={i} sx={{ p: 2, bgcolor: '#F8F4EF', borderRadius: 1.5, borderLeft: '3px solid #B07A61' }}>
                <Typography variant="caption" fontWeight={700} color="#B07A61" sx={{ mb: 0.5, display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Example
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.7} sx={{ fontSize: '0.82rem', whiteSpace: 'pre-line' }}>
                  {block.value}
                </Typography>
              </Box>
            );
          case 'analogy':
            return (
              <Box key={i} sx={{ p: 2, bgcolor: 'rgba(200, 140, 150, 0.06)', borderRadius: 1.5, borderLeft: '3px solid #C88C96' }}>
                <Typography variant="caption" fontWeight={700} color="#C88C96" sx={{ mb: 0.5, display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Analogy
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.7} sx={{ fontSize: '0.82rem' }}>
                  {block.value}
                </Typography>
              </Box>
            );
          case 'callout':
            return (
              <Box key={i} sx={{ p: 2, bgcolor: 'rgba(122, 62, 72, 0.04)', borderRadius: 1.5, border: '1px solid rgba(122, 62, 72, 0.15)' }}>
                <Typography variant="body2" color="primary.main" fontWeight={600} lineHeight={1.7} sx={{ fontSize: '0.82rem', whiteSpace: 'pre-line' }}>
                  {block.value}
                </Typography>
              </Box>
            );
          default:
            return null;
        }
      })}
    </Box>
  );
}

/* Quiz component */

function LessonQuiz({ questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qi, oi) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qi]: oi }));
  };

  const score = submitted
    ? questions.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0)
    : 0;

  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        mt: 3,
        border: '1px solid',
        borderColor: submitted ? (score === questions.length ? '#15803d' : '#b45309') : 'divider',
        borderRadius: 2,
        bgcolor: 'white',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <QuizIcon sx={{ fontSize: 18, color: 'primary.main' }} />
        <Typography variant="body1" fontWeight={600} color="primary.main">
          Quick Quiz
        </Typography>
        {submitted && (
          <Chip
            label={`${score}/${questions.length} correct`}
            size="small"
            sx={{
              ml: 'auto',
              fontWeight: 600,
              fontSize: '0.72rem',
              height: 22,
              bgcolor: score === questions.length ? '#dcfce7' : '#fef3c7',
              color: score === questions.length ? '#15803d' : '#b45309',
            }}
          />
        )}
      </Box>

      {questions.map((q, qi) => (
        <Box key={qi} sx={{ mb: qi < questions.length - 1 ? 3 : 0 }}>
          <Typography variant="body2" fontWeight={600} mb={1.5} sx={{ fontSize: '0.85rem' }}>
            {qi + 1}. {q.question}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {q.options.map((opt, oi) => {
              const isSelected = answers[qi] === oi;
              const isCorrect = q.answer === oi;
              let borderColor = 'divider';
              let bgColor = 'white';

              if (submitted) {
                if (isCorrect) {
                  borderColor = '#15803d';
                  bgColor = '#dcfce7';
                } else if (isSelected && !isCorrect) {
                  borderColor = '#dc2626';
                  bgColor = '#fee2e2';
                }
              } else if (isSelected) {
                borderColor = 'primary.main';
                bgColor = 'rgba(122, 62, 72, 0.05)';
              }

              return (
                <Box
                  key={oi}
                  onClick={() => handleSelect(qi, oi)}
                  sx={{
                    p: 1.5,
                    border: '1px solid',
                    borderColor,
                    borderRadius: 1.5,
                    bgcolor: bgColor,
                    cursor: submitted ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    ...(!submitted && {
                      '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(122, 62, 72, 0.03)' },
                    }),
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                    {opt}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}

      {!submitted ? (
        <Button
          variant="contained"
          size="small"
          disabled={!allAnswered}
          onClick={() => setSubmitted(true)}
          sx={{ mt: 2.5, fontWeight: 600, px: 3 }}
        >
          Check Answers
        </Button>
      ) : (
        <Button
          variant="outlined"
          size="small"
          onClick={() => { setAnswers({}); setSubmitted(false); }}
          sx={{ mt: 2.5, fontWeight: 600, px: 3, borderColor: 'primary.main', color: 'primary.main' }}
        >
          Try Again
        </Button>
      )}
    </Paper>
  );
}

/* Main component */

function LessonPage() {
  const { slug } = useParams();
  const lesson = LESSON_CONTENT[slug];

  if (!lesson) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          Lesson not found
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          The lesson you&apos;re looking for doesn&apos;t exist.
        </Typography>
        <Chip
          component={Link}
          to={ROUTES.LEARN}
          label="← Back to Learning Hub"
          clickable
          sx={{ bgcolor: 'rgba(122, 62, 72, 0.08)', color: 'primary.main', fontWeight: 500 }}
        />
      </Container>
    );
  }

  const badgeStyle = DIFFICULTY_STYLES[lesson.difficulty] ?? DIFFICULTY_STYLES.Beginner;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 4 } }}>

      {/* Back link */}
      <Chip
        component={Link}
        to={ROUTES.LEARN}
        icon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
        label="Learning Hub"
        clickable
        size="small"
        sx={{
          mb: 3,
          bgcolor: 'rgba(122, 62, 72, 0.08)',
          color: 'primary.main',
          fontWeight: 500,
          fontSize: '0.75rem',
          '& .MuiChip-icon': { color: 'primary.main' },
        }}
      />

      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'white',
          background: 'linear-gradient(135deg, #FFFDFB 0%, #F8F4EF 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
          <Box
            sx={{
              width: 40, height: 40,
              bgcolor: 'rgba(122, 62, 72, 0.08)',
              borderRadius: 1.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <SchoolIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          </Box>
          <Chip label={lesson.difficulty} size="small" sx={{ ...badgeStyle, fontWeight: 500, fontSize: '0.72rem' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {lesson.readingTime} read
            </Typography>
          </Box>
        </Box>
        <Typography
          variant="h4" fontWeight={700} letterSpacing="-0.025em" mb={1.5}
          sx={{ fontSize: { xs: '1.4rem', md: '2rem' } }}
        >
          {lesson.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" lineHeight={1.8} sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
          {lesson.overview}
        </Typography>
      </Paper>

      {/* Infographic Section */}
      {renderInfographic(lesson.infographic)}

      {/* Lesson Content Sections */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 }, mb: 3 }}>
        {lesson.sections.map(({ heading, content }, i) => (
          <Paper
            key={heading}
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 28, height: 28, borderRadius: '50%',
                  bgcolor: 'rgba(122, 62, 72, 0.08)', color: 'primary.main',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                }}
              >
                {i + 1}
              </Box>
              <Typography variant="body1" fontWeight={600}>
                {heading}
              </Typography>
            </Box>
            {renderSectionContent(content)}
          </Paper>
        ))}
      </Box>

      {/* Key Takeaways */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3,
          border: '1px solid',
          borderColor: 'primary.main',
          borderRadius: 2,
          bgcolor: 'rgba(122, 62, 72, 0.03)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="body1" fontWeight={600} color="primary.main">
            Key Takeaways
          </Typography>
        </Box>
        <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
          {lesson.takeaways.map((item) => (
            <Box component="li" key={item} sx={{ mb: 1, '&::marker': { color: '#7A3E48' } }}>
              <Typography variant="body2" color="text.secondary" lineHeight={1.7} sx={{ fontSize: { xs: '0.83rem', md: '0.875rem' } }}>
                {item}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Quick Recap */}
      {lesson.recap && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            border: '1px solid',
            borderColor: '#C88C96',
            borderRadius: 2,
            bgcolor: 'rgba(200, 140, 150, 0.04)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <LightbulbOutlinedIcon sx={{ fontSize: 18, color: '#C88C96' }} />
            <Typography variant="body1" fontWeight={600} sx={{ color: '#7A3E48' }}>
              Quick Recap
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" lineHeight={1.8} sx={{ fontSize: { xs: '0.83rem', md: '0.875rem' } }}>
            {lesson.recap}
          </Typography>
        </Paper>
      )}

      {/* Quiz */}
      {lesson.quiz && <LessonQuiz questions={lesson.quiz} />}
    </Container>
  );
}


export default LessonPage;
