import { LocalStore } from '../../lib/localStore';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'seed' | 'fertilizer' | 'souvenir' | 'decor';
  description: string;
  costSparkles: number;
  quantity: number;
  icon: string;
}

export interface EconomyState {
  sparkles: number;
  totalEarned: number;
  inventory: InventoryItem[];
}

export const SEED_SHOP_ITEMS: InventoryItem[] = [
  {
    id: 'item-emerald-seed',
    name: 'Emerald Blossom Seed',
    category: 'seed',
    description: 'A rare plant seed that blossoms with vibrant emerald petals.',
    costSparkles: 50,
    quantity: 1,
    icon: '🌱',
  },
  {
    id: 'item-organic-fertilizer',
    name: 'Cedar Bonsai Fertilizer',
    category: 'fertilizer',
    description: 'Enriched soil fertilizer that boosts bonsai plant growth stages.',
    costSparkles: 30,
    quantity: 2,
    icon: '🪴',
  },
  {
    id: 'item-komorebi-mug',
    name: 'Handcrafted Ceramic Chawan',
    category: 'souvenir',
    description: 'A glazed ceramic matcha bowl made by master potters in Old Tokyo.',
    costSparkles: 100,
    quantity: 1,
    icon: '🍵',
  },
  {
    id: 'item-furin-windchime',
    name: 'Glass Wind Chime (Fūrin)',
    category: 'decor',
    description: 'Delicate glass bell that rings softly in the study room window breeze.',
    costSparkles: 75,
    quantity: 1,
    icon: '🎐',
  },
];

export const SEED_ECONOMY: EconomyState = {
  sparkles: 185,
  totalEarned: 350,
  inventory: [
    {
      id: 'item-organic-fertilizer',
      name: 'Cedar Bonsai Fertilizer',
      category: 'fertilizer',
      description: 'Enriched soil fertilizer that boosts bonsai plant growth stages.',
      costSparkles: 30,
      quantity: 1,
      icon: '🪴',
    },
  ],
};

export class EconomyEngine {
  static async getEconomyState(): Promise<EconomyState> {
    return LocalStore.get<EconomyState>('economy_state', SEED_ECONOMY);
  }

  static async awardSparkles(amount: number, reason: string): Promise<EconomyState> {
    const state = await this.getEconomyState();
    const updated: EconomyState = {
      ...state,
      sparkles: state.sparkles + amount,
      totalEarned: state.totalEarned + amount,
    };
    await LocalStore.set('economy_state', updated);
    return updated;
  }

  static async purchaseItem(itemId: string): Promise<{ success: boolean; error?: string; state: EconomyState }> {
    const state = await this.getEconomyState();
    const shopItem = SEED_SHOP_ITEMS.find((i) => i.id === itemId);

    if (!shopItem) {
      return { success: false, error: 'Item not found in catalog', state };
    }

    if (state.sparkles < shopItem.costSparkles) {
      return { success: false, error: 'Not enough sparkles', state };
    }

    const existingIndex = state.inventory.findIndex((i) => i.id === itemId);
    let newInventory = [...state.inventory];

    if (existingIndex >= 0) {
      newInventory[existingIndex] = {
        ...newInventory[existingIndex],
        quantity: newInventory[existingIndex].quantity + 1,
      };
    } else {
      newInventory.push({ ...shopItem, quantity: 1 });
    }

    const updatedState: EconomyState = {
      ...state,
      sparkles: state.sparkles - shopItem.costSparkles,
      inventory: newInventory,
    };

    await LocalStore.set('economy_state', updatedState);

    // Record journey event
    await LocalStore.addJourneyEvent(
      'item_purchased',
      { itemId, name: shopItem.name, cost: shopItem.costSparkles },
      'economy_engine'
    );

    return { success: true, state: updatedState };
  }

  static getShopCatalog(): InventoryItem[] {
    return SEED_SHOP_ITEMS;
  }
}
