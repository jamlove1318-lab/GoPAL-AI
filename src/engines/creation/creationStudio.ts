import { LocalStore, CustomCreation } from '../../lib/localStore';

export interface CreationTemplate {
  type: CustomCreation['type'];
  name: string;
  description: string;
  icon: string;
  defaultTheme: string;
  placeholderTitle: string;
  placeholderContent: string;
}

export const CREATION_TEMPLATES: CreationTemplate[] = [
  {
    type: 'postcard',
    name: 'Cultural Postcard',
    description: 'Design a commemorative postcard from your favorite world landmark with custom notes.',
    icon: '📮',
    defaultTheme: 'emerald',
    placeholderTitle: 'Afternoon at Café Komorebi',
    placeholderContent: 'I practiced ordering matcha and learned the word "Komorebi" with Cassidy today!',
  },
  {
    type: 'phrase_card',
    name: 'Study Phrase Card',
    description: 'Assemble key Japanese vocabulary and phrases with personal mnemonics and examples.',
    icon: '📇',
    defaultTheme: 'indigo',
    placeholderTitle: 'Polite Conversational Openers',
    placeholderContent: 'Sumimasen (Excuse me) · Onegaishimasu (Please) · Douzo (After you)',
  },
  {
    type: 'memory_board',
    name: 'Journey Memory Board',
    description: 'Pin milestone breakthroughs, favorite characters, and world memories together.',
    icon: '📌',
    defaultTheme: 'amber',
    placeholderTitle: 'Week 1 Breakthroughs',
    placeholderContent: 'Mastered 20 essential phrases, unlocked The Whispering Library, and watered the Bonsai to stage 2!',
  },
  {
    type: 'comic_strip',
    name: 'Dialogue Comic Strip',
    description: 'Turn a roleplay scenario with Cassidy, Ren, or Emi into a bite-sized visual comic dialogue.',
    icon: '💬',
    defaultTheme: 'purple',
    placeholderTitle: 'The Matcha Mystery',
    placeholderContent: 'Cassidy: "Look at the tines of this bamboo whisk!" · Learner: "It creates microfoam without scratching the bowl!"',
  },
];

export class CreationStudio {
  static getTemplates(): CreationTemplate[] {
    return CREATION_TEMPLATES;
  }

  static async createArtifact(params: {
    type: CustomCreation['type'];
    title: string;
    subtitle: string;
    content: string;
    visualTheme: string;
    tags: string[];
  }): Promise<CustomCreation> {
    const created = await LocalStore.addCreation({
      type: params.type,
      title: params.title || 'Untitled Creation',
      subtitle: params.subtitle || 'Created with Cassidy',
      content: params.content || '',
      visualTheme: params.visualTheme || 'emerald',
      tags: params.tags && params.tags.length > 0 ? params.tags : ['Learning', 'GoPAL'],
    });

    // Also record a journey event for this creative milestone
    await LocalStore.addJourneyEvent(
      'creation_authored',
      {
        creationId: created.id,
        title: created.title,
        type: created.type,
      },
      'creation_studio'
    );

    return created;
  }

  static async getCreations(): Promise<CustomCreation[]> {
    return LocalStore.getCreations();
  }
}
