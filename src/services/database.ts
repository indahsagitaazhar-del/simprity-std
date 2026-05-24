// services/database.ts — Supabase version
import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null; // TAMBAHAN
}

export interface Activity {
  id: string;
  userId: string;
  name: string;
  category: 'Akademik' | 'Organisasi' | 'Pribadi';
  deadline: Date;
  estimatedTime: number;
  importance: 'Normal' | 'Sedang' | 'Penting';
  consequence: 'Santai' | 'Sedang' | 'Bahaya';
  priority: 'Tinggi' | 'Sedang' | 'Rendah';
  status: 'pending' | 'in-progress' | 'completed' | 'review';
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  activityId?: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  read: boolean;
  createdAt: Date;
}

class DatabaseService {

  // --- AUTH METHODS ---
  async register(email: string, password: string, fullName: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw new Error(error.message);
    return {
      id: data.user!.id,
      email: data.user!.email!,
      fullName,
      avatarUrl: null,
    };
  }

  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error('Email atau password salah');
    return {
      id: data.user.id,
      email: data.user.email!,
      fullName: data.user.user_metadata?.full_name || '',
      avatarUrl: data.user.user_metadata?.avatar_url || null,
    };
  }

  async logout() {
    await supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    return {
      id: data.user.id,
      email: data.user.email!,
      fullName: data.user.user_metadata?.full_name || '',
      avatarUrl: data.user.user_metadata?.avatar_url || null,
    };
  }

  // --- ACTIVITY METHODS ---
  async getActivities(userId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapActivity);
  }

  async addActivity(
    userId: string,
    activity: Omit<Activity, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'priority'>
  ): Promise<Activity> {
    const priority = this.calculatePriority(activity.importance, activity.consequence);

    const { data, error } = await supabase
      .from('activities')
      .insert({
        user_id: userId,
        name: activity.name,
        category: activity.category,
        deadline: activity.deadline,
        estimated_time: activity.estimatedTime,
        importance: activity.importance,
        consequence: activity.consequence,
        priority,
        status: activity.status,
        completed: activity.completed,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const newActivity = this.mapActivity(data);
    await this.triggerIntelligentNotification(userId, newActivity);
    return newActivity;
  }

  async updateActivity(activityId: string, updates: Partial<Activity>): Promise<Activity> {
    const { data: old } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activityId)
      .single();

    const updatedImportance = updates.importance ?? old.importance;
    const updatedConsequence = updates.consequence ?? old.consequence;
    const newPriority = this.calculatePriority(updatedImportance, updatedConsequence);

    const { data, error } = await supabase
      .from('activities')
      .update({
        name: updates.name,
        category: updates.category,
        deadline: updates.deadline,
        estimated_time: updates.estimatedTime,
        importance: updatedImportance,
        consequence: updatedConsequence,
        priority: newPriority,
        status: updates.status,
        completed: updates.completed,
        updated_at: new Date(),
      })
      .eq('id', activityId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (!old.completed && updates.completed === true) {
      await this.addManualNotification(
        old.user_id, "Tugas Selesai! 🎉",
        `Hebat! Anda telah menyelesaikan: ${data.name}`,
        "success", activityId
      );
    }

    return this.mapActivity(data);
  }

  async deleteActivity(activityId: string) {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId);
    if (error) throw new Error(error.message);
  }

  // --- NOTIFICATION METHODS ---
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const priorityOrder: Record<string, number> = { danger: 0, warning: 1, info: 2, success: 3 };
    return (data || [])
      .map(this.mapNotification)
      .sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);
  }

  async addManualNotification(
    userId: string, title: string, message: string,
    type: Notification['type'], activityId?: string
  ) {
    await supabase.from('notifications').insert({
      user_id: userId,
      activity_id: activityId || null,
      title,
      message,
      type,
      read: false,
    });
  }

  async markNotificationAsRead(id: string) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
  }

  // --- HELPERS ---
  private mapActivity(row: any): Activity {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      category: row.category,
      deadline: new Date(row.deadline),
      estimatedTime: row.estimated_time,
      importance: row.importance,
      consequence: row.consequence,
      priority: row.priority,
      status: row.status,
      completed: row.completed,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapNotification(row: any): Notification {
    return {
      id: row.id,
      userId: row.user_id,
      activityId: row.activity_id,
      title: row.title,
      message: row.message,
      type: row.type,
      read: row.read,
      createdAt: new Date(row.created_at),
    };
  }

  private calculatePriority(importance: string, consequence: string): Activity['priority'] {
    const importanceScore: Record<string, number> = { 'Normal': 1, 'Sedang': 2, 'Penting': 3 };
    const consequenceScore: Record<string, number> = { 'Santai': 1, 'Sedang': 2, 'Bahaya': 3 };
    const score =
      (importanceScore[importance] ?? 1) * 0.6 +
      (consequenceScore[consequence] ?? 1) * 0.4;
    if (score >= 2.4) return 'Tinggi';
    if (score >= 1.6) return 'Sedang';
    return 'Rendah';
  }

  private calculatePriorityScore(activity: Activity): number {
    const timeDiff = new Date(activity.deadline).getTime() - new Date().getTime();
    const scoreTenggat = timeDiff < 86400000 ? 10 : 5;
    const scoreBeban = activity.estimatedTime > 5 ? 8 : 4;
    const scoreUrgensi = activity.importance === 'Penting' ? 10 : 5;
    return (0.4 * scoreTenggat) + (0.2 * scoreBeban) + (0.3 * scoreUrgensi);
  }

  private async triggerIntelligentNotification(userId: string, activity: Activity) {
    const score = this.calculatePriorityScore(activity);
    const type = score >= 8 ? 'danger' : score >= 5 ? 'warning' : 'info';
    if (type !== 'info') {
      await this.addManualNotification(
        userId, "Peringatan Prioritas 🚨",
        `Tugas '${activity.name}' memiliki urgensi tinggi.`,
        type, activity.id
      );
    }
  }
}

export const db = new DatabaseService();
