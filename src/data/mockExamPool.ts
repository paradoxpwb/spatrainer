/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MockVisualItem, MockQuestionItem, MockExamBlueprint } from '../types/mockExam';
import { DEFAULT_MOCK_EXAM_BLUEPRINT } from '../config/mockExamBlueprint';

// -------------------------------------------------------------
// Sample SVG Data-URIs for Visual Prompts (Chart 2개, Photo 2개)
// 외부 저작물 없이 가상 데이터 기반 벡터 그래픽으로 제작
// -------------------------------------------------------------

const CHART_SVG_1 = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 450" width="100%" height="100%" style="background:#ffffff;font-family:sans-serif;">
  <rect width="100%" height="100%" fill="#ffffff" rx="12"/>
  <text x="350" y="42" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">EV Global Market Share Trend (2024 - 2026)</text>
  <text x="350" y="68" text-anchor="middle" font-size="13" fill="#64748b">Quarterly Percentage Growth across Three Main Regions</text>

  <!-- Legend -->
  <g transform="translate(180, 92)">
    <rect x="0" y="0" width="16" height="16" rx="4" fill="#3b82f6"/>
    <text x="24" y="13" font-size="13" fill="#334155" font-weight="500">North America</text>
    <rect x="150" y="0" width="16" height="16" rx="4" fill="#10b981"/>
    <text x="174" y="13" font-size="13" fill="#334155" font-weight="500">Europe</text>
    <rect x="270" y="0" width="16" height="16" rx="4" fill="#f59e0b"/>
    <text x="294" y="13" font-size="13" fill="#334155" font-weight="500">Asia-Pacific</text>
  </g>

  <!-- Grid lines -->
  <line x1="80" y1="140" x2="640" y2="140" stroke="#f1f5f9" stroke-width="2"/>
  <line x1="80" y1="200" x2="640" y2="200" stroke="#f1f5f9" stroke-width="2"/>
  <line x1="80" y1="260" x2="640" y2="260" stroke="#f1f5f9" stroke-width="2"/>
  <line x1="80" y1="320" x2="640" y2="320" stroke="#f1f5f9" stroke-width="2"/>
  <line x1="80" y1="380" x2="640" y2="380" stroke="#cbd5e1" stroke-width="2"/>

  <!-- Y-Axis labels -->
  <text x="65" y="145" text-anchor="end" font-size="12" fill="#94a3b8">40%</text>
  <text x="65" y="205" text-anchor="end" font-size="12" fill="#94a3b8">30%</text>
  <text x="65" y="265" text-anchor="end" font-size="12" fill="#94a3b8">20%</text>
  <text x="65" y="325" text-anchor="end" font-size="12" fill="#94a3b8">10%</text>
  <text x="65" y="385" text-anchor="end" font-size="12" fill="#94a3b8">0%</text>

  <!-- Q1 Group -->
  <g transform="translate(130, 0)">
    <rect x="0" y="280" width="28" height="100" rx="4" fill="#3b82f6"/>
    <text x="14" y="272" text-anchor="middle" font-size="11" font-weight="bold" fill="#3b82f6">16%</text>
    <rect x="34" y="240" width="28" height="140" rx="4" fill="#10b981"/>
    <text x="48" y="232" text-anchor="middle" font-size="11" font-weight="bold" fill="#10b981">23%</text>
    <rect x="68" y="210" width="28" height="170" rx="4" fill="#f59e0b"/>
    <text x="82" y="202" text-anchor="middle" font-size="11" font-weight="bold" fill="#f59e0b">28%</text>
    <text x="48" y="405" text-anchor="middle" font-size="13" font-weight="bold" fill="#475569">2024</text>
  </g>

  <!-- Q2 Group -->
  <g transform="translate(290, 0)">
    <rect x="0" y="250" width="28" height="130" rx="4" fill="#3b82f6"/>
    <text x="14" y="242" text-anchor="middle" font-size="11" font-weight="bold" fill="#3b82f6">21%</text>
    <rect x="34" y="205" width="28" height="175" rx="4" fill="#10b981"/>
    <text x="48" y="197" text-anchor="middle" font-size="11" font-weight="bold" fill="#10b981">29%</text>
    <rect x="68" y="180" width="28" height="200" rx="4" fill="#f59e0b"/>
    <text x="82" y="172" text-anchor="middle" font-size="11" font-weight="bold" fill="#f59e0b">33%</text>
    <text x="48" y="405" text-anchor="middle" font-size="13" font-weight="bold" fill="#475569">2025</text>
  </g>

  <!-- Q3 Group -->
  <g transform="translate(450, 0)">
    <rect x="0" y="220" width="28" height="160" rx="4" fill="#3b82f6"/>
    <text x="14" y="212" text-anchor="middle" font-size="11" font-weight="bold" fill="#3b82f6">26%</text>
    <rect x="34" y="170" width="28" height="210" rx="4" fill="#10b981"/>
    <text x="48" y="162" text-anchor="middle" font-size="11" font-weight="bold" fill="#10b981">35%</text>
    <rect x="68" y="145" width="28" height="235" rx="4" fill="#f59e0b"/>
    <text x="82" y="137" text-anchor="middle" font-size="11" font-weight="bold" fill="#f59e0b">39%</text>
    <text x="48" y="405" text-anchor="middle" font-size="13" font-weight="bold" fill="#475569">2026 (Est.)</text>
  </g>

  <!-- Key Insight Box -->
  <rect x="80" y="420" width="560" height="24" rx="6" fill="#f8fafc"/>
  <text x="350" y="436" text-anchor="middle" font-size="11" fill="#64748b">Key note: Asia-Pacific leads adoption rate; European regulation accelerates growth post-2025.</text>
</svg>
`)}`;

const CHART_SVG_2 = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 450" width="100%" height="100%" style="background:#ffffff;font-family:sans-serif;">
  <rect width="100%" height="100%" fill="#ffffff" rx="12"/>
  <text x="350" y="42" text-anchor="middle" font-size="20" font-weight="bold" fill="#0f172a">Customer Support Resolution Channels</text>
  <text x="350" y="68" text-anchor="middle" font-size="13" fill="#64748b">Efficiency & Customer Satisfaction Score (CSAT / 100)</text>

  <!-- Channels List & Comparative Bars -->
  <!-- Channel 1: AI Chatbot -->
  <g transform="translate(70, 110)">
    <text x="0" y="24" font-size="14" font-weight="bold" fill="#1e293b">1. AI Self-Service Assistant</text>
    <text x="0" y="44" font-size="12" fill="#64748b">Volume: 52% | Avg Time: 45 sec</text>
    <rect x="260" y="12" width="260" height="24" rx="6" fill="#e2e8f0"/>
    <rect x="260" y="12" width="218" height="24" rx="6" fill="#3b82f6"/>
    <text x="535" y="29" font-size="14" font-weight="bold" fill="#3b82f6">84 / 100</text>
  </g>

  <!-- Channel 2: Phone Hotline -->
  <g transform="translate(70, 185)">
    <text x="0" y="24" font-size="14" font-weight="bold" fill="#1e293b">2. Phone Voice Support</text>
    <text x="0" y="44" font-size="12" fill="#64748b">Volume: 24% | Avg Time: 8.5 min</text>
    <rect x="260" y="12" width="260" height="24" rx="6" fill="#e2e8f0"/>
    <rect x="260" y="12" width="236" height="24" rx="6" fill="#10b981"/>
    <text x="535" y="29" font-size="14" font-weight="bold" fill="#10b981">91 / 100</text>
  </g>

  <!-- Channel 3: Email Ticket -->
  <g transform="translate(70, 260)">
    <text x="0" y="24" font-size="14" font-weight="bold" fill="#1e293b">3. Email & Web Forms</text>
    <text x="0" y="44" font-size="12" fill="#64748b">Volume: 16% | Avg Time: 4.2 hours</text>
    <rect x="260" y="12" width="260" height="24" rx="6" fill="#e2e8f0"/>
    <rect x="260" y="12" width="176" height="24" rx="6" fill="#f59e0b"/>
    <text x="535" y="29" font-size="14" font-weight="bold" fill="#f59e0b">68 / 100</text>
  </g>

  <!-- Channel 4: Social Media DM -->
  <g transform="translate(70, 335)">
    <text x="0" y="24" font-size="14" font-weight="bold" fill="#1e293b">4. Social Media Messaging</text>
    <text x="0" y="44" font-size="12" fill="#64748b">Volume: 8% | Avg Time: 25 min</text>
    <rect x="260" y="12" width="260" height="24" rx="6" fill="#e2e8f0"/>
    <rect x="260" y="12" width="195" height="24" rx="6" fill="#8b5cf6"/>
    <text x="535" y="29" font-size="14" font-weight="bold" fill="#8b5cf6">75 / 100</text>
  </g>

  <!-- Bottom Summary Note -->
  <rect x="70" y="405" width="560" height="30" rx="8" fill="#f1f5f9"/>
  <text x="350" y="424" text-anchor="middle" font-size="12" fill="#475569">Key observation: Voice delivers the highest satisfaction (91), while AI handles over 50% of total volume.</text>
</svg>
`)}`;

const PHOTO_SVG_1 = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 450" width="100%" height="100%" style="background:#e0f2fe;font-family:sans-serif;">
  <rect width="100%" height="100%" fill="#f8fafc"/>
  
  <!-- Modern Office Workshop Room Header -->
  <rect x="40" y="30" width="620" height="390" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="40" y="30" width="620" height="50" rx="16" fill="#0284c7"/>
  <text x="350" y="62" text-anchor="middle" font-size="18" font-weight="bold" fill="#ffffff">[SCENE PHOTO] Corporate Strategy Workshop & Whiteboard Review</text>

  <!-- Glass whiteboard with sticky notes & flowcharts -->
  <rect x="80" y="110" width="300" height="200" rx="10" fill="#f0f9ff" stroke="#38bdf8" stroke-width="2"/>
  <text x="230" y="140" text-anchor="middle" font-size="14" font-weight="bold" fill="#0369a1">Q4 Product Roadmap</text>
  
  <!-- Sticky notes -->
  <rect x="100" y="160" width="50" height="40" rx="4" fill="#fef08a"/>
  <text x="125" y="184" text-anchor="middle" font-size="10" fill="#713f12">UX Redesign</text>
  <rect x="160" y="160" width="50" height="40" rx="4" fill="#bbf7d0"/>
  <text x="185" y="184" text-anchor="middle" font-size="10" fill="#14532d">API V2</text>
  <rect x="220" y="160" width="50" height="40" rx="4" fill="#fbcfe8"/>
  <text x="245" y="184" text-anchor="middle" font-size="10" fill="#831843">QA Testing</text>
  <rect x="130" y="215" width="60" height="40" rx="4" fill="#fed7aa"/>
  <text x="160" y="239" text-anchor="middle" font-size="10" fill="#7c2d12">Launch Event</text>
  <rect x="200" y="215" width="65" height="40" rx="4" fill="#bae6fd"/>
  <text x="232" y="239" text-anchor="middle" font-size="10" fill="#0c4a6e">Marketing</text>

  <!-- Team Members (Presenter & Participants) -->
  <!-- Presenter pointing to board -->
  <circle cx="410" cy="180" r="28" fill="#f43f5e"/>
  <rect x="390" y="215" width="40" height="90" rx="8" fill="#0f172a"/>
  <line x1="400" y1="230" x2="350" y2="180" stroke="#0f172a" stroke-width="6" stroke-linecap="round"/>
  <text x="410" y="325" text-anchor="middle" font-size="12" font-weight="bold" fill="#334155">Project Lead</text>

  <!-- Participant 1 (Seated with Laptop) -->
  <circle cx="510" cy="220" r="22" fill="#3b82f6"/>
  <rect x="495" y="246" width="30" height="60" rx="6" fill="#334155"/>
  <rect x="470" y="290" width="55" height="16" rx="4" fill="#94a3b8"/>
  <text x="510" y="335" text-anchor="middle" font-size="11" fill="#475569">Engineer</text>

  <!-- Participant 2 (Taking Notes) -->
  <circle cx="580" cy="225" r="22" fill="#10b981"/>
  <rect x="565" y="250" width="30" height="55" rx="6" fill="#475569"/>
  <rect x="560" y="295" width="40" height="15" rx="3" fill="#cbd5e1"/>
  <text x="580" y="335" text-anchor="middle" font-size="11" fill="#475569">Product Manager</text>

  <!-- Meeting Table -->
  <rect x="450" y="295" width="180" height="20" rx="6" fill="#cbd5e1"/>

  <!-- Photo Description Footer -->
  <rect x="60" y="365" width="580" height="40" rx="8" fill="#f1f5f9"/>
  <text x="350" y="388" text-anchor="middle" font-size="12" fill="#334155" font-weight="500">Scene Details: Strategy review session in a modern tech office. A team lead presents milestones while colleagues collaborate with laptops and notes.</text>
</svg>
`)}`;

const PHOTO_SVG_2 = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 450" width="100%" height="100%" style="background:#f1f5f9;font-family:sans-serif;">
  <rect width="100%" height="100%" fill="#ffffff" rx="12"/>

  <!-- Scene Header -->
  <rect x="40" y="30" width="620" height="390" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="40" y="30" width="620" height="50" rx="16" fill="#059669"/>
  <text x="350" y="62" text-anchor="middle" font-size="18" font-weight="bold" fill="#ffffff">[SCENE PHOTO] Smart Logistics Warehouse & Quality Inspection</text>

  <!-- Warehouse high racks & packages -->
  <g transform="translate(70, 110)">
    <!-- Rack 1 -->
    <rect x="0" y="0" width="160" height="230" fill="none" stroke="#64748b" stroke-width="4"/>
    <line x1="0" y1="75" x2="160" y2="75" stroke="#64748b" stroke-width="3"/>
    <line x1="0" y1="150" x2="160" y2="150" stroke="#64748b" stroke-width="3"/>
    <rect x="15" y="15" width="45" height="45" fill="#f59e0b" rx="4"/>
    <rect x="75" y="15" width="65" height="45" fill="#d97706" rx="4"/>
    <rect x="25" y="90" width="110" height="45" fill="#0284c7" rx="4"/>
    <rect x="15" y="165" width="60" height="50" fill="#f97316" rx="4"/>
    <rect x="85" y="165" width="55" height="50" fill="#10b981" rx="4"/>
  </g>

  <!-- Automated Conveyor Belt System -->
  <g transform="translate(260, 200)">
    <rect x="0" y="70" width="370" height="25" rx="6" fill="#334155"/>
    <circle cx="30" cy="82" r="6" fill="#94a3b8"/>
    <circle cx="90" cy="82" r="6" fill="#94a3b8"/>
    <circle cx="150" cy="82" r="6" fill="#94a3b8"/>
    <circle cx="210" cy="82" r="6" fill="#94a3b8"/>
    <circle cx="270" cy="82" r="6" fill="#94a3b8"/>
    <circle cx="330" cy="82" r="6" fill="#94a3b8"/>
    <!-- Boxes on conveyor -->
    <rect x="40" y="20" width="55" height="45" rx="4" fill="#f59e0b"/>
    <rect x="160" y="15" width="65" height="50" rx="4" fill="#3b82f6"/>
    <rect x="280" y="25" width="50" height="40" rx="4" fill="#10b981"/>
  </g>

  <!-- Quality Inspector with Tablet -->
  <circle cx="390" cy="140" r="26" fill="#0284c7"/>
  <!-- Safety Helmet -->
  <path d="M 364 135 Q 390 105 416 135 Z" fill="#eab308"/>
  <rect x="370" y="170" width="40" height="90" rx="8" fill="#1e293b"/>
  <!-- Hi-Vis Vest -->
  <rect x="372" y="172" width="36" height="50" rx="4" fill="#84cc16"/>
  <!-- Tablet -->
  <rect x="350" y="195" width="32" height="42" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <text x="390" y="285" text-anchor="middle" font-size="12" font-weight="bold" fill="#334155">QA Inspector</text>

  <!-- Photo Description Footer -->
  <rect x="60" y="365" width="580" height="40" rx="8" fill="#f1f5f9"/>
  <text x="350" y="388" text-anchor="middle" font-size="12" fill="#334155" font-weight="500">Scene Details: Automated fulfillment logistics center. An inspector wearing safety gear audits scanned inventory barcodes along an automated conveyor line.</text>
</svg>
`)}`;

// -------------------------------------------------------------
// Visual Pool (Chart 2개, Photo 2개)
// -------------------------------------------------------------
export const MOCK_VISUAL_POOL: MockVisualItem[] = [
  {
    id: 'visual-chart-01',
    type: 'chart',
    imageUrl: CHART_SVG_1,
    promptText:
      'Look at the electric vehicle market share chart. Compare the growth trends across North America, Europe, and Asia-Pacific between 2024 and 2026, and explain which region is experiencing the most rapid adoption.',
    altText: 'EV Global Market Share Trend (2024 - 2026) Comparative Bar Chart',
  },
  {
    id: 'visual-chart-02',
    type: 'chart',
    imageUrl: CHART_SVG_2,
    promptText:
      'Review the customer support channels comparison chart. Compare the efficiency, volume, and satisfaction ratings across the four channels, and propose how the company should allocate resources next year.',
    altText: 'Customer Support Channels Resolution & CSAT Rating Comparison Chart',
  },
  {
    id: 'visual-photo-01',
    type: 'photo',
    imageUrl: PHOTO_SVG_1,
    promptText:
      'Look at the photograph showing a project strategy workshop. Describe what the team members are doing in detail, and discuss why visual collaboration tools like whiteboards are effective for cross-functional alignment.',
    altText: 'Corporate Strategy Workshop Scene with Lead Presenter and Team Members at Whiteboard',
  },
  {
    id: 'visual-photo-02',
    type: 'photo',
    imageUrl: PHOTO_SVG_2,
    promptText:
      'Look at the photograph of the smart fulfillment facility. Describe the scene, including the safety equipment, automated conveyor system, and storage racks, and explain the main operational advantages of warehouse automation.',
    altText: 'Smart Logistics Warehouse Inspection Scene with Safety Inspector and Automated Conveyor',
  },
];

// -------------------------------------------------------------
// Personal Questions Pool (Part 1 & 2)
// -------------------------------------------------------------
export const MOCK_PERSONAL_POOL: Array<{ id: string; promptText: string }> = [
  {
    id: 'personal-01',
    promptText:
      'Could you tell me about your typical daily routine at work, from when you arrive at the office to when you leave?',
  },
  {
    id: 'personal-02',
    promptText:
      'What do you usually enjoy doing during your free time on weekends to relieve stress and recharge your energy?',
  },
  {
    id: 'personal-03',
    promptText:
      'How do you communicate and collaborate with colleagues when working on a high-priority project with tight deadlines?',
  },
  {
    id: 'personal-04',
    promptText:
      'Can you describe a memorable trip or travel destination you visited recently, and explain why it was special to you?',
  },
  {
    id: 'personal-05',
    promptText:
      'What are the most essential skills or habits you believe are necessary for staying productive in a professional workplace?',
  },
  {
    id: 'personal-06',
    promptText:
      'How do you usually handle unexpected schedule changes or urgent tasks that interrupt your planned work for the day?',
  },
];

// -------------------------------------------------------------
// Listening Passages with Follow-ups (Part 3 & 4)
// Part 3 지문 1개당 2~3개의 꼬리 질문(Part 4)을 세트로 구성
// -------------------------------------------------------------
export interface MockListeningPassageWithFollowups {
  id: string;
  title: string;
  passageText: string;
  summaryPrompt: string;
  keyPoints: string[];
  followUps: Array<{ id: string; promptText: string }>;
}

export const MOCK_PASSAGES_POOL: MockListeningPassageWithFollowups[] = [
  {
    id: 'mock-passage-01',
    title: 'Department Flexible Working and Digital Tools Transition',
    passageText:
      'Good morning, team. Starting next Monday, our business division will implement a flexible core-hours system. All team members must be available for client meetings and departmental syncs between eleven in the morning and three in the afternoon. Outside of those four core hours, you have full flexibility to set your arrival and departure times, provided you complete eight hours per day. Furthermore, we are shifting all project tracking to the new cloud collaboration platform. Please ensure your profile is active before this Friday afternoon. We believe this update will enhance both autonomy and overall team productivity.',
    summaryPrompt: 'Listen to the announcement carefully and summarize the key points you heard.',
    keyPoints: [
      'Flexible core-hours system begins next Monday',
      'Mandatory availability between 11 AM and 3 PM for meetings',
      'Flexibility outside core hours provided 8 daily hours completed',
      'All project tracking migrates to new cloud collaboration platform by Friday',
    ],
    followUps: [
      {
        id: 'mock-p1-f1',
        promptText:
          'Based on the announcement you just summarized, what potential advantages or challenges do you anticipate employees might experience with this flexible core-hours policy?',
      },
      {
        id: 'mock-p1-f2',
        promptText:
          'How can team managers ensure accountability and seamless communication when team members arrive and leave at different times?',
      },
      {
        id: 'mock-p1-f3',
        promptText:
          'Do you personally prefer working strictly fixed hours or having flexible schedule options? Please support your preference with specific reasons.',
      },
    ],
  },
  {
    id: 'mock-passage-02',
    title: 'Corporate Green Office and Waste Reduction Campaign',
    passageText:
      'Attention all office personnel. As part of our annual sustainability initiative, our headquarters will launch the Zero Single-Use Plastic Campaign starting the first of next month. All disposable paper cups, plastic straws, and bottled waters will be completely phased out from all meeting rooms and kitchenettes. Instead, every employee will be provided with an insulated reusable tumbler and stainless steel cutlery set tomorrow. Additionally, automated sorting bins for compostable waste will be installed on each floor. Thank you for your active participation as we strive toward a carbon-neutral workplace.',
    summaryPrompt: 'Listen to the announcement carefully and summarize the key points you heard.',
    keyPoints: [
      'Zero Single-Use Plastic Campaign launches on the first of next month',
      'Disposable paper cups, straws, and plastic water bottles phased out',
      'Reusable tumblers and cutlery provided to all employees',
      'Automated sorting bins for compostable waste installed on every floor',
    ],
    followUps: [
      {
        id: 'mock-p2-f1',
        promptText:
          'In your opinion, what are the most effective ways companies can encourage busy employees to willingly adopt eco-friendly habits at work?',
      },
      {
        id: 'mock-p2-f2',
        promptText:
          'Besides eliminating single-use plastics, what other sustainability initiatives should large corporate organizations prioritize to minimize their environmental footprint?',
      },
      {
        id: 'mock-p2-f3',
        promptText:
          'Have you ever participated in or observed an eco-friendly campaign in your daily life or workplace? Describe your experience and its impact.',
      },
    ],
  },
  {
    id: 'mock-passage-03',
    title: 'New Internal Career Mentorship and Skill Development Initiative',
    passageText:
      'Hello everyone. Our Human Resources development division is excited to introduce the Global Career Mentorship Program for this upcoming fiscal year. This six-month program pairs junior employees with senior leaders across different international business units. Participants will meet twice a month for one-on-one leadership coaching, technical skill expansion, and cross-cultural career guidance. Applications open online next Wednesday, and candidates must submit a brief statement of interest and manager endorsement. This is a tremendous opportunity to broaden your professional horizon.',
    summaryPrompt: 'Listen to the announcement carefully and summarize the key points you heard.',
    keyPoints: [
      'Global Career Mentorship Program launching for the upcoming fiscal year',
      'Junior staff paired with senior leaders across global units for six months',
      'Bi-weekly one-on-one sessions covering leadership and technical skills',
      'Online applications open next Wednesday with manager endorsement',
    ],
    followUps: [
      {
        id: 'mock-p3-f1',
        promptText:
          'What qualities or characteristics do you think make someone an exceptional mentor in a competitive business environment?',
      },
      {
        id: 'mock-p3-f2',
        promptText:
          'If you were selected to participate in a mentorship program, what specific professional skills or knowledge would you most want to develop?',
      },
      {
        id: 'mock-p3-f3',
        promptText:
          'How does cross-departmental mentorship benefit the overall organizational culture and employee retention of a company?',
      },
    ],
  },
];

// -------------------------------------------------------------
// Social Issue & Business Opinion Pool (Part 5)
// -------------------------------------------------------------
export const MOCK_SOCIAL_OPINION_POOL: Array<{ id: string; promptText: string }> = [
  {
    id: 'social-01',
    promptText:
      'With the rapid acceleration of artificial intelligence and automation in the workplace, some argue that human creativity and emotional intelligence will become even more valuable, while others fear widespread job displacement. What is your opinion on how professionals should prepare for the future of work?',
  },
  {
    id: 'social-02',
    promptText:
      'Many global organizations are deciding whether to mandate a full return to the physical office or maintain hybrid remote work models permanently. In your opinion, which work arrangement offers greater long-term competitive advantages for modern enterprises, and why?',
  },
  {
    id: 'social-03',
    promptText:
      'As electric and autonomous mobility technologies advance, urban cities are redesigning public transportation infrastructure. Do you think governments should invest more heavily in expanding electric public transit networks or subsidizing private electric vehicle adoption? Please explain your view.',
  },
  {
    id: 'social-04',
    promptText:
      'The modern workforce increasingly values corporate social responsibility and ethical governance alongside financial compensation. How important do you think a company’s social values and environmental commitment are when attracting and retaining top global talent?',
  },
];

// -------------------------------------------------------------
// Mock Exam Set Generator
// Blueprint 기반으로 각 Part별 문항을 조립
// -------------------------------------------------------------
export function generateMockExamSet(
  blueprint: MockExamBlueprint = DEFAULT_MOCK_EXAM_BLUEPRINT,
  recentVisualIds: string[] = []
): { questions: MockQuestionItem[]; pickedVisualType: 'chart' | 'photo'; pickedVisualItem: MockVisualItem } {
  // 1. Pick 2 distinct personal questions
  const shuffledPersonal = [...MOCK_PERSONAL_POOL].sort(() => Math.random() - 0.5);
  const personalQ1 = shuffledPersonal[0];
  const personalQ2 = shuffledPersonal[1];

  // 2. Pick 1 passage for Part 3, and 1 random follow-up for Part 4
  const randomPassage =
    MOCK_PASSAGES_POOL[Math.floor(Math.random() * MOCK_PASSAGES_POOL.length)];
  const randomFollowUp =
    randomPassage.followUps[Math.floor(Math.random() * randomPassage.followUps.length)];

  // 3. Pick 1 social opinion question for Part 5
  const randomOpinion =
    MOCK_SOCIAL_OPINION_POOL[Math.floor(Math.random() * MOCK_SOCIAL_OPINION_POOL.length)];

  // 4. Pick visual question for Part 6:
  // - 50% probability between 'chart' and 'photo'
  const chosenType: 'chart' | 'photo' = Math.random() < 0.5 ? 'chart' : 'photo';
  const poolForType = MOCK_VISUAL_POOL.filter((item) => item.type === chosenType);

  // Exclude recently used visual items if possible
  const eligibleItems = poolForType.filter(
    (item) => !recentVisualIds.includes(item.id)
  );
  const finalVisualItem =
    eligibleItems.length > 0
      ? eligibleItems[Math.floor(Math.random() * eligibleItems.length)]
      : poolForType[Math.floor(Math.random() * poolForType.length)];

  // Assemble according to blueprint parts
  const questions: MockQuestionItem[] = [];

  for (const part of blueprint.parts) {
    if (part.partId === 'personal_1') {
      questions.push({
        partNumber: part.partNumber,
        partId: part.partId,
        partTitle: part.partTitle,
        promptText: personalQ1.promptText,
        prepSeconds: part.prepSeconds,
        answerMaxSeconds: part.answerMaxSeconds,
      });
    } else if (part.partId === 'personal_2') {
      questions.push({
        partNumber: part.partNumber,
        partId: part.partId,
        partTitle: part.partTitle,
        promptText: personalQ2.promptText,
        prepSeconds: part.prepSeconds,
        answerMaxSeconds: part.answerMaxSeconds,
      });
    } else if (part.partId === 'passage_summary') {
      questions.push({
        partNumber: part.partNumber,
        partId: part.partId,
        partTitle: part.partTitle,
        promptText: randomPassage.summaryPrompt,
        passageText: randomPassage.passageText,
        passageTitle: randomPassage.title,
        keyPoints: randomPassage.keyPoints,
        prepSeconds: part.prepSeconds,
        answerMaxSeconds: part.answerMaxSeconds,
      });
    } else if (part.partId === 'passage_followup') {
      questions.push({
        partNumber: part.partNumber,
        partId: part.partId,
        partTitle: part.partTitle,
        promptText: randomFollowUp.promptText,
        prepSeconds: part.prepSeconds,
        answerMaxSeconds: part.answerMaxSeconds,
      });
    } else if (part.partId === 'social_opinion') {
      questions.push({
        partNumber: part.partNumber,
        partId: part.partId,
        partTitle: part.partTitle,
        promptText: randomOpinion.promptText,
        prepSeconds: part.prepSeconds,
        answerMaxSeconds: part.answerMaxSeconds,
      });
    } else if (part.partId === 'visual_description') {
      questions.push({
        partNumber: part.partNumber,
        partId: part.partId,
        partTitle: part.partTitle,
        promptText: finalVisualItem.promptText,
        audioUrl: finalVisualItem.audioUrl,
        visual: finalVisualItem,
        prepSeconds: part.prepSeconds,
        answerMaxSeconds: part.answerMaxSeconds,
      });
    } else {
      // Future-proofing: fallback for dynamic part addition
      questions.push({
        partNumber: part.partNumber,
        partId: part.partId,
        partTitle: part.partTitle,
        promptText: randomOpinion.promptText,
        prepSeconds: part.prepSeconds,
        answerMaxSeconds: part.answerMaxSeconds,
      });
    }
  }

  return {
    questions,
    pickedVisualType: chosenType,
    pickedVisualItem: finalVisualItem,
  };
}
