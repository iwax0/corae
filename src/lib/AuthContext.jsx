import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/api/supabaseClient";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [family, setFamily] = useState(null);
  const [member, setMember] = useState(null);
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const authUser = session?.user || null;

      if (!authUser) {
        setUser(null);
        setFamily(null);
        setMember(null);
        setPatients([]);
        setActivePatient(null);
        return;
      }

      const normalizedUser = {
        id: authUser.id,
        email: authUser.email,
        full_name:
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          authUser.email,
      };

      setUser(normalizedUser);

      await loadFamilyData(normalizedUser);
    } catch (err) {
      console.error("Erro ao inicializar AppContext:", err);
      setUser(null);
      setFamily(null);
      setMember(null);
      setPatients([]);
      setActivePatient(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadFamilyData(currentUser = user) {
    if (!currentUser?.email) return;

    try {
      const normalizedEmail = currentUser.email.trim().toLowerCase();

      const { data: familyMember, error: memberError } = await supabase
        .from("family_members")
        .select("*")
        .eq("user_email", normalizedEmail)
        .limit(1)
        .maybeSingle();

      if (memberError) throw memberError;

      if (!familyMember?.family_id) {
        setMember(null);
        setFamily(null);
        setPatients([]);
        setActivePatient(null);
        return;
      }

      setMember(familyMember);

      const { data: familyData, error: familyError } = await supabase
        .from("families")
        .select("*")
        .eq("id", familyMember.family_id)
        .maybeSingle();

      if (familyError) throw familyError;

      const { data: patientsData, error: patientsError } = await supabase
        .from("patients")
        .select("*")
        .eq("family_id", familyMember.family_id)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (patientsError) throw patientsError;

      const activePatients = patientsData || [];
      setPatients(activePatients);

      let nextActivePatient = null;

      setActivePatient((prev) => {
        if (prev?.id) {
          const stillExists = activePatients.find((p) => p.id === prev.id);
          if (stillExists) {
            nextActivePatient = stillExists;
            return stillExists;
          }
        }

        nextActivePatient = activePatients[0] || null;
        return nextActivePatient;
      });

      const resolvedActivePatient =
        nextActivePatient ||
        activePatients.find((p) => p.id === activePatient?.id) ||
        activePatients[0] ||
        null;

      setFamily({
        ...familyData,
        patient_name: resolvedActivePatient?.name || null,
      });
    } catch (err) {
      console.error("Erro ao carregar dados da família:", err);
      setMember(null);
      setFamily(null);
      setPatients([]);
      setActivePatient(null);
    }
  }

  async function refreshFamily() {
    await loadFamilyData();
  }

  async function refreshPatients() {
    if (!family?.id) return;

    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("family_id", family.id)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;

      const activePatients = data || [];
      setPatients(activePatients);

      let nextActivePatient = null;

      setActivePatient((prev) => {
        if (prev?.id) {
          const stillExists = activePatients.find((p) => p.id === prev.id);
          if (stillExists) {
            nextActivePatient = stillExists;
            return stillExists;
          }
        }

        nextActivePatient = activePatients[0] || null;
        return nextActivePatient;
      });

      setFamily((prev) => ({
        ...prev,
        patient_name:
          nextActivePatient?.name ||
          activePatients[0]?.name ||
          null,
      }));
    } catch (err) {
      console.error("Erro ao atualizar pacientes:", err);
    }
  }

  function selectPatient(patient) {
    setActivePatient(patient || null);

    setFamily((prev) => ({
      ...prev,
      patient_name: patient?.name || null,
    }));
  }

  const value = useMemo(
    () => ({
      user,
      family,
      member,
      patients,
      activePatient,
      loading,
      setUser,
      setFamily,
      setMember,
      setPatients,
      setActivePatient,
      selectPatient,
      refreshFamily,
      refreshPatients,
      initialize,
    }),
    [user, family, member, patients, activePatient, loading]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp deve ser usado dentro de AppProvider");
  }

  return context;
}