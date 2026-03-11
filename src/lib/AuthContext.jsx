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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        clearAppState();
        setLoading(false);
        return;
      }

      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED" ||
        event === "INITIAL_SESSION"
      ) {
        initialize();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  function clearAppState() {
    setUser(null);
    setFamily(null);
    setMember(null);
    setPatients([]);
    setActivePatient(null);
  }

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
        clearAppState();
        return;
      }

      const normalizedUser = {
        id: authUser.id,
        email: authUser.email?.trim().toLowerCase() || null,
        full_name:
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          authUser.email,
      };

      setUser(normalizedUser);
      await loadFamilyData(normalizedUser);
    } catch (err) {
      console.error("Erro ao inicializar AppContext:", err);
      clearAppState();
    } finally {
      setLoading(false);
    }
  }

  async function loadFamilyData(currentUser = user) {
    if (!currentUser?.email) {
      setMember(null);
      setFamily(null);
      setPatients([]);
      setActivePatient(null);
      return;
    }

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
      const nextActivePatient = activePatients[0] || null;

      setPatients(activePatients);
      setActivePatient(nextActivePatient);

      setFamily(
        familyData
          ? {
              ...familyData,
              patient_name: nextActivePatient?.name || null,
            }
          : null
      );
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
      const nextActivePatient = activePatients[0] || null;

      setPatients(activePatients);
      setActivePatient(nextActivePatient);

      setFamily((prev) =>
        prev
          ? {
              ...prev,
              patient_name: nextActivePatient?.name || null,
            }
          : null
      );
    } catch (err) {
      console.error("Erro ao atualizar pacientes:", err);
    }
  }

  function selectPatient(patient) {
    setActivePatient(patient || null);

    setFamily((prev) =>
      prev
        ? {
            ...prev,
            patient_name: patient?.name || null,
          }
        : null
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    clearAppState();
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
      logout,
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