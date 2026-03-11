import { supabase } from "@/api/supabaseClient";

function applyWhere(q, where = {}) {
  for (const [k, v] of Object.entries(where)) {
    if (v === undefined || v === null) continue;
    q = q.eq(k, v);
  }
  return q;
}

function makeEntity(table) {
  return {
    async filter(where, orderBy, limit = 100) {
      let q = supabase.from(table).select("*");
      q = applyWhere(q, where);
      if (orderBy) q = q.order(orderBy, { ascending: true });
      if (limit) q = q.limit(limit);

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },

    async get(id) {
      const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data ?? null;
    },

    async create(payload) {
      const { data, error } = await supabase.from(table).insert(payload).select("*").single();
      if (error) throw error;
      return data;
    },

    async update(id, patch) {
      const { data, error } = await supabase
        .from(table)
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },

    async remove(id) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      return true;
    },
  };
}

export const db = {
  auth: {
    async me() {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data?.user ?? null;
    },
    async signIn(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  },

  entities: {
    Family: makeEntity("families"),
    FamilyMember: makeEntity("family_members"),
    Patient: makeEntity("patients"),
    Appointment: makeEntity("appointments"),

    // Deixa preparados (mesmo que você ainda não tenha criado as tabelas)
    Medication: makeEntity("medications"),
    MedicationChange: makeEntity("medication_changes"),
    MedicationRecord: makeEntity("medication_records"),
    AdministrationRecord: makeEntity("administration_records"),
    ScheduledDose: makeEntity("scheduled_doses"),
    NextDose: makeEntity("next_doses"),
    Observation: makeEntity("observations"),
  },
};