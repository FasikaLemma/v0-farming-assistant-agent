export interface FAQItem {
  id: string
  question: string
  answer: string
}

export interface FAQCategory {
  id: string
  name: string
  description: string
  icon: string
  items: FAQItem[]
}

export const faqCategories: FAQCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Learn the basics of using the AI Farming Assistant',
    icon: 'rocket',
    items: [
      {
        id: 'gs-1',
        question: 'How do I start a conversation with the AI assistant?',
        answer: 'Simply navigate to the Chat page and type your question in the input box at the bottom. You can ask about soil analysis, crop recommendations, fertilizers, planting timing, disease detection, or market insights. The AI will guide you through each process step by step.',
      },
      {
        id: 'gs-2',
        question: 'What kind of questions can I ask?',
        answer: 'You can ask about: (1) Soil analysis - provide your N, P, K, pH, and moisture levels, (2) Crop recommendations - based on your soil and location, (3) Fertilizer advice - organic or synthetic options, (4) Planting timing - optimal windows for your crops, (5) Disease identification - describe symptoms or upload images, (6) Market prices - current trends and selling advice.',
      },
      {
        id: 'gs-3',
        question: 'Do I need to create an account to use the assistant?',
        answer: 'No account is required to start using the AI Farming Assistant. You can begin asking questions right away. However, your conversation history is stored locally in your browser, so using the same device will allow you to access previous conversations.',
      },
      {
        id: 'gs-4',
        question: 'How accurate is the AI advice?',
        answer: 'The AI provides recommendations based on agricultural best practices and general farming knowledge. While highly informative, we always recommend verifying critical decisions with local agricultural experts, extension services, or soil testing laboratories. Local conditions can vary significantly.',
      },
    ],
  },
  {
    id: 'soil-crops',
    name: 'Soil & Crop Recommendations',
    description: 'Understanding soil analysis and crop matching',
    icon: 'sprout',
    items: [
      {
        id: 'sc-1',
        question: 'How do I input my soil data?',
        answer: 'You can tell the AI your soil test results naturally. For example: "My soil has N: 35 ppm, P: 20 ppm, K: 40 ppm, pH: 6.5, and moisture: 45%." The AI will analyze these values and provide insights about your soil health and recommendations.',
      },
      {
        id: 'sc-2',
        question: 'What do the NPK values mean?',
        answer: 'NPK stands for Nitrogen (N), Phosphorus (P), and Potassium (K) - the three primary nutrients plants need. Nitrogen promotes leafy growth, phosphorus supports root development and flowering, and potassium strengthens overall plant health. Ideal ranges vary by crop, but generally: N (20-50 ppm), P (15-40 ppm), K (30-60 ppm).',
      },
      {
        id: 'sc-3',
        question: 'Why is soil pH important?',
        answer: 'Soil pH affects nutrient availability to plants. Most crops prefer a pH between 6.0 and 7.0 (slightly acidic to neutral). If pH is too high or low, plants cannot absorb nutrients effectively, even if those nutrients are present in the soil. The AI considers pH when making recommendations.',
      },
      {
        id: 'sc-4',
        question: 'How does the AI recommend crops?',
        answer: 'The AI considers multiple factors: your soil composition (NPK, pH, moisture), your location and climate zone, the current season, and growing conditions. It then matches these factors against crop requirements to suggest varieties most likely to thrive in your specific conditions.',
      },
      {
        id: 'sc-5',
        question: 'Can I grow crops not recommended by the AI?',
        answer: 'Yes, but crops outside the recommendations may require additional soil amendments, more careful monitoring, or may produce lower yields. The AI recommendations optimize for success, but with proper adjustments, other crops may be viable. Ask the AI what modifications would be needed.',
      },
    ],
  },
  {
    id: 'fertilizer',
    name: 'Fertilizer Guidance',
    description: 'Getting the right nutrients for your crops',
    icon: 'flask',
    items: [
      {
        id: 'f-1',
        question: 'How does the AI calculate fertilizer needs?',
        answer: 'The AI analyzes your soil test results to identify nutrient deficiencies, considers the requirements of your target crop, and calculates the amount and type of fertilizer needed to bridge the gap. It accounts for soil pH and organic matter content to ensure nutrients will be available to plants.',
      },
      {
        id: 'f-2',
        question: 'What is the difference between organic and synthetic fertilizers?',
        answer: 'Organic fertilizers (compost, manure, bone meal) release nutrients slowly and improve soil structure over time. Synthetic fertilizers provide immediate nutrient availability but do not improve soil health. The AI can recommend either based on your preference - just mention if you prefer organic options.',
      },
      {
        id: 'f-3',
        question: 'How often should I apply fertilizer?',
        answer: 'Application frequency depends on the fertilizer type and crop. Slow-release organic fertilizers may need one application per season, while synthetic fertilizers might require multiple applications. The AI provides specific timing recommendations based on your crop growth stage.',
      },
      {
        id: 'f-4',
        question: 'Can over-fertilizing harm my crops?',
        answer: 'Yes, excess fertilizer can burn plant roots, cause nutrient imbalances, contaminate groundwater, and lead to excessive vegetative growth at the expense of fruit production. The AI calculates precise amounts to avoid over-application while meeting crop needs.',
      },
    ],
  },
  {
    id: 'disease',
    name: 'Disease Detection',
    description: 'Identifying and treating plant diseases',
    icon: 'bug',
    items: [
      {
        id: 'd-1',
        question: 'How do I use the disease detection feature?',
        answer: 'You can either describe your plant symptoms in detail (e.g., "yellow leaves with brown spots, wilting stems") or upload a clear photo of the affected plant parts. The AI will analyze the symptoms and provide possible diagnoses along with treatment recommendations.',
      },
      {
        id: 'd-2',
        question: 'What types of diseases can the AI identify?',
        answer: 'The AI can help identify common plant diseases including fungal infections (blight, powdery mildew, rust), bacterial diseases, viral infections, and nutrient deficiency symptoms. It covers major crops like tomatoes, corn, wheat, soybeans, and vegetables.',
      },
      {
        id: 'd-3',
        question: 'How accurate is disease detection?',
        answer: 'The AI provides probable diagnoses based on symptom patterns. For critical situations, we recommend confirming with your local agricultural extension office or a plant pathologist. The AI also indicates confidence levels with its diagnoses.',
      },
      {
        id: 'd-4',
        question: 'What should I include when describing symptoms?',
        answer: 'Include: affected plant parts (leaves, stems, roots, fruit), appearance of symptoms (color changes, spots, wilting, growths), pattern (scattered, concentrated, spreading), duration, recent weather conditions, and any treatments already attempted.',
      },
    ],
  },
  {
    id: 'market',
    name: 'Market Insights',
    description: 'Understanding prices and selling strategies',
    icon: 'trending-up',
    items: [
      {
        id: 'm-1',
        question: 'What market information does the AI provide?',
        answer: 'The AI provides current price estimates for major crops, 30-day price trends, regional market analysis, optimal selling timing recommendations, and storage advice if holding for better prices. Data is updated regularly to reflect market conditions.',
      },
      {
        id: 'm-2',
        question: 'How should I use the price predictions?',
        answer: 'Use AI price insights as one factor in your selling decisions. Consider combining this with local market knowledge, storage costs, your cash flow needs, and contract obligations. The AI can help you weigh these factors if you share your specific situation.',
      },
      {
        id: 'm-3',
        question: 'Which crops does the AI track?',
        answer: 'The AI tracks major commodity crops including wheat, corn, soybeans, cotton, rice, and common vegetables. For specialty or local crops, the AI may have limited data but can still provide general market guidance based on similar crops.',
      },
      {
        id: 'm-4',
        question: 'Can the AI help me decide when to sell?',
        answer: 'Yes! Tell the AI your crop type, quantity, location, and any timing constraints. It will analyze current prices, recent trends, and seasonal patterns to suggest whether to sell now, wait, or consider partial sales. It also factors in storage costs and risk.',
      },
    ],
  },
]

export const searchableFAQs = faqCategories.flatMap((cat) =>
  cat.items.map((item) => ({
    ...item,
    categoryId: cat.id,
    categoryName: cat.name,
  }))
)
