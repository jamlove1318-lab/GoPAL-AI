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
  /** Durable claim keys prevent the same one-time reward from being granted twice. */
  claimedRewards?: Record<string, number>;
}

export interface SparkleClaimResult { claimed: boolean; state: EconomyState; }

export const SEED_SHOP_ITEMS: InventoryItem[] = [
  { id: 'item-emerald-seed', name: 'Emerald Blossom Seed', category: 'seed', description: 'A rare plant seed that blossoms with vibrant emerald petals.', costSparkles: 50, quantity: 1, icon: '🌱' },
  { id: 'item-organic-fertilizer', name: 'Cedar Bonsai Fertilizer', category: 'fertilizer', description: 'Enriched soil fertilizer that boosts bonsai plant growth stages.', costSparkles: 30, quantity: 2, icon: '🪴' },
  { id: 'item-komorebi-mug', name: 'Handcrafted Ceramic Chawan', category: 'souvenir', description: 'A glazed ceramic matcha bowl made by master potters in Old Tokyo.', costSparkles: 100, quantity: 1, icon: '🍵' },
  { id: 'item-furin-windchime', name: 'Glass Wind Chime (Fūrin)', category: 'decor', description: 'Delicate glass bell that rings softly in the study room window breeze.', costSparkles: 75, quantity: 1, icon: '🎐' },
];

export const SEED_ECONOMY: EconomyState = {
  sparkles: 185,
  totalEarned: 350,
  claimedRewards: {},
  inventory: [{ id: 'item-organic-fertilizer', name: 'Cedar Bonsai Fertilizer', category: 'fertilizer', description: 'Enriched soil fertilizer that boosts bonsai plant growth stages.', costSparkles: 30, quantity: 1, icon: '🪴' }],
};

export class EconomyEngine {
  /** Prevent concurrent read-modify-write claims for the same reward in this runtime. */
  private static pendingClaims = new Set<string>();

  static async getEconomyState(): Promise<EconomyState> {
    const state = await LocalStore.get<EconomyState>('economy_state', SEED_ECONOMY);
    return { ...state, claimedRewards: state.claimedRewards ?? {} };
  }

  /** Low-level additive award for intentionally repeatable rewards. */
  static async awardSparkles(amount: number, reason: string): Promise<EconomyState> {
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Sparkle award amount must be positive');
    const state = await this.getEconomyState();
    const updated: EconomyState = { ...state, sparkles: state.sparkles + amount, totalEarned: state.totalEarned + amount };
    await LocalStore.set('economy_state', updated);
    return updated;
  }

  /**
   * Claims a one-time reward. Durable keys survive remounts; pendingClaims closes
   * the same-runtime async race between two rapid presses before persistence finishes.
   */
  static async claimSparkles(claimKey: string, amount: number, reason: string): Promise<SparkleClaimResult> {
    if (!claimKey.trim()) throw new Error('Reward claim key is required');
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Sparkle claim amount must be positive');
    if (this.pendingClaims.has(claimKey)) return { claimed: false, state: await this.getEconomyState() };

    this.pendingClaims.add(claimKey);
    try {
      const state = await this.getEconomyState();
      const claimedRewards = state.claimedRewards ?? {};
      if (claimedRewards[claimKey]) return { claimed: false, state };

      const updated: EconomyState = {
        ...state,
        sparkles: state.sparkles + amount,
        totalEarned: state.totalEarned + amount,
        claimedRewards: { ...claimedRewards, [claimKey]: Date.now() },
      };
      await LocalStore.set('economy_state', updated);
      return { claimed: true, state: updated };
    } finally {
      this.pendingClaims.delete(claimKey);
    }
  }

  static async purchaseItem(itemId: string): Promise<{ success: boolean; error?: string; state: EconomyState }> {
    const state = await this.getEconomyState();
    const shopItem = SEED_SHOP_ITEMS.find((i) => i.id === itemId);
    if (!shopItem) return { success: false, error: 'Item not found in catalog', state };
    if (state.sparkles < shopItem.costSparkles) return { success: false, error: 'Not enough sparkles', state };
    const existingIndex = state.inventory.findIndex((i) => i.id === itemId);
    const newInventory = [...state.inventory];
    if (existingIndex >= 0) newInventory[existingIndex] = { ...newInventory[existingIndex], quantity: newInventory[existingIndex].quantity + 1 };
    else newInventory.push({ ...shopItem, quantity: 1 });
    const updatedState: EconomyState = { ...state, sparkles: state.sparkles - shopItem.costSparkles, inventory: newInventory };
    await LocalStore.set('economy_state', updatedState);
    await LocalStore.addJourneyEvent('item_purchased', { itemId, name: shopItem.name, cost: shopItem.costSparkles }, 'economy_engine');
    return { success: true, state: updatedState };
  }

  static getShopCatalog(): InventoryItem[] { return SEED_SHOP_ITEMS; }
}
