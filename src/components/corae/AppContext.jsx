import { createContext, useContext, useState, useEffect } from "react";
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
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadUser() {
    try {
      setLoading(true);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const authUser = session?.user ?? null;

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
      await loadFamily(normalizedUser);
    } catch (e) {
      console.error("Erro em loadUser:", e);
      setUser(null);
      setFamily(null);
      setMember(null);
      setPatients([]);
      setActivePatient(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadFamily(u) {
    if (!u?.email) {
      setFamily(null);
      setMember(null);
      setPatients([]);
      setActivePatient(null);
      return;
    }

    try {
      const { data: members, error: membersError } = await supabase
        .from("family_members")
        .select("*")
        .eq("user_email", u.email);

      if (membersError) throw membersError;

      if (!members?.length) {
        setMember(null);
        setFamily(null);
        setPatients([]);
        setActivePatient(null);
        return;
      }

      const m = members[0];
      setMember(m);

      const { data: familyData, error: familyError } = await supabase
        .from("families")
        .select("*")
        .eq("id", m.family_id)
        .single();

      if (familyError) throw familyError;

      setFamily(familyData);

      const { data: pts, error: ptsError } = await supabase
        .from("patients")
        .select("*")
        .eq("family_id", familyData.id)
        .order("id", { ascending: true });

      if (ptsError) throw ptsError;

      const patientList = pts || [];
      setPatients(patientList);

      if (patientList.length === 0) {
        setActivePatient(null);
        return;
      }

      const saved = localStorage.getItem(
        `corae_active_patient_${familyData.id}`
      );

      const found =
        patientList.find((p) => String(p.id) === String(saved)) ||
        patientList[0];

      setActivePatient(found);
    } catch (e) {
      console.error("Erro em loadFamily:", e);
      setFamily(null);
      setMember(null);
      setPatients([]);
      setActivePatient(null);
    }
  }

  async function refreshFamily() {
    if (user) {
      await loadFamily(user);
    }
  }

  async function refreshPatients() {
    if (!family) return;

    try {
      const { data: pts, error } = await supabase
        .from("patients")
        .select("*")
        .eq("family_id", family.id)
        .order("id", { ascending: true });

      if (error) throw error;

      const patientList = pts || [];
      setPatients(patientList);

      if (patientList.length === 0) {
        setActivePatient(null);
        return;
      }

      const saved = localStorage.getItem(
        `corae_active_patient_${family.id}`
      );

      const found =
        patientList.find((p) => String(p.id) === String(saved)) ||
        patientList[0];

      setActivePatient(found);
    } catch (e) {
      console.error("Erro em refreshPatients:", e);
      setPatients([]);
      setActivePatient(null);
    }
  }

  function selectPatient(patient) {
    setActivePatient(patient);

    if (family && patient?.id != null) {
      localStorage.setItem(
        `corae_active_patient_${family.id}`,
        String(patient.id)
      );
    }
  }

  function isPrincipal() {
    return member?.role === "principal";
  }

  return (
    <AppContext.Provider
      value={{
        user,
        family,
        member,
        loading,
        isPrincipal,
        refreshFamily,
        setFamily,
        setMember,
        patients,
        activePatient,
        refreshPatients,
        selectPatient,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}