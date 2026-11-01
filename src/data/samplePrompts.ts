import { PaperRequest } from '../types/research';

export interface SampleTopicPreset {
  id: string;
  title: string;
  field: string;
  category: string;
  request: PaperRequest;
}

export const SAMPLE_TOPIC_PRESETS: SampleTopicPreset[] = [
  {
    id: 'quantum-cryptography',
    title: 'Post-Quantum Lattice Cryptography',
    field: 'Computer Science & AI',
    category: 'Cybersecurity & Quantum',
    request: {
      topic: 'Side-Channel Resistance and Hardware Complexity of Module-LWE Post-Quantum Key Encapsulation Mechanisms in Embedded IoT Processors',
      field: 'Computer Science & AI',
      length: 'standard',
      methodologyPreference: 'computational_simulation',
      customNotes: 'Focus on NIST PQC standards (ML-KEM / Kyber), power analysis vulnerabilities, and silicon area trade-offs.'
    }
  },
  {
    id: 'crispr-therapeutics',
    title: 'CRISPR Base Editing in Sickle Cell',
    field: 'Medicine & Biomedical Sciences',
    category: 'Biomedicine & Genomics',
    request: {
      topic: 'Precision Induction of Fetal Hemoglobin via Adenine Base Editors: Off-Target Mutagenesis Profiling and Long-Term Engraftment in Hematopoietic Stem Cells',
      field: 'Medicine & Biomedical Sciences',
      length: 'standard',
      methodologyPreference: 'empirical_quantitative',
      customNotes: 'Highlight GUIDE-seq off-target validation, gamma-globin gene reactivation percentages, and humanized xenograft models.'
    }
  },
  {
    id: 'dac-carbon-capture',
    title: 'Direct Air Capture Technoeconomics',
    field: 'Environmental & Earth Sciences',
    category: 'Climate & Clean Tech',
    request: {
      topic: 'Techno-Economic and Life-Cycle Assessment of Solid Sorbent Direct Air Capture Integrated with Geothermal Heat: Levelized Cost of CO2 Abatement',
      field: 'Environmental & Earth Sciences',
      length: 'standard',
      methodologyPreference: 'theoretical_systematic_review',
      customNotes: 'Assess energetic penalties, amine-functionalized silica stability, desorption temperatures (80-100C), and levelized cost per metric ton.'
    }
  },
  {
    id: 'central-bank-cbdc',
    title: 'Central Bank Digital Currencies',
    field: 'Economics & Business Administration',
    category: 'Macroeconomics & Finance',
    request: {
      topic: 'Retail Central Bank Digital Currencies and Commercial Bank Disintermediation: A Dynamic Stochastic General Equilibrium (DSGE) Analysis',
      field: 'Economics & Business Administration',
      length: 'standard',
      methodologyPreference: 'empirical_quantitative',
      customNotes: 'Model deposit runoff risks during liquidity stress, two-tiered interest remuneration caps, and systemic credit supply contraction.'
    }
  },
  {
    id: 'neuroplasticity-bci',
    title: 'Adaptive Brain-Computer Interfaces',
    field: 'Psychology & Behavioral Neuroscience',
    category: 'Neurotechnology',
    request: {
      topic: 'Closed-Loop Cortical Neurofeedback and Sensorimotor Mu Rhythm Modulation for Motor Recovery Following Ischemic Subcortical Stroke',
      field: 'Psychology & Behavioral Neuroscience',
      length: 'standard',
      methodologyPreference: 'mixed_methods',
      customNotes: 'Evaluate Fugl-Meyer motor scores, fMRI connectivity changes, and real-time EEG decoding latency in chronic stroke rehabilitation.'
    }
  }
];
