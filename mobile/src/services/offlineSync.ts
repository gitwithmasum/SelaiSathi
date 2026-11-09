import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api.js';

export interface OfflineDraft {
  id: string;
  type: 'CREATE_ORDER' | 'SAVE_MEASUREMENT' | 'UPDATE_STAGE' | 'RECORD_PAYMENT';
  endpoint: string;
  payload: any;
  createdAt: string;
  retries: number;
  lastError?: string;
}

const OFFLINE_QUEUE_KEY = 'selaisathi_offline_queue';

export const offlineSyncService = {
  /**
   * Save an action to the offline queue
   */
  async queueAction(
    type: OfflineDraft['type'],
    endpoint: string,
    payload: any
  ): Promise<OfflineDraft> {
    const queue = await this.getQueue();
    const newDraft: OfflineDraft = {
      id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      endpoint,
      payload,
      createdAt: new Date().toISOString(),
      retries: 0,
    };

    queue.push(newDraft);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    return newDraft;
  },

  /**
   * Retrieve all queued drafts
   */
  async getQueue(): Promise<OfflineDraft[]> {
    try {
      const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Remove a draft from the queue
   */
  async removeDraft(id: string): Promise<void> {
    const queue = await this.getQueue();
    const updated = queue.filter((item) => item.id !== id);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
  },

  /**
   * Sync all pending drafts with server
   */
  async syncAll(): Promise<{
    synced: number;
    failed: number;
    remaining: number;
  }> {
    const queue = await this.getQueue();
    if (queue.length === 0) {
      return { synced: 0, failed: 0, remaining: 0 };
    }

    let syncedCount = 0;
    let failedCount = 0;
    const remainingQueue: OfflineDraft[] = [];

    for (const draft of queue) {
      try {
        await api.post(draft.endpoint, draft.payload);
        syncedCount++;
      } catch (err: any) {
        failedCount++;
        // Keep in queue if network error or retry limit not reached
        if (draft.retries < 3) {
          remainingQueue.push({
            ...draft,
            retries: draft.retries + 1,
            lastError: err.message || 'Sync failed',
          });
        }
      }
    }

    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));

    return {
      synced: syncedCount,
      failed: failedCount,
      remaining: remainingQueue.length,
    };
  },

  /**
   * Clear the entire queue
   */
  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  },
};

export default offlineSyncService;
