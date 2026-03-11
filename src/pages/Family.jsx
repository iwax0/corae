import { useState, useEffect, useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import {
  Crown,
  User,
  Mail,
  Plus,
  X,
  AlertCircle,
  Trash2,
  LogOut,
  Pencil,
} from "lucide-react";
import { useApp } from "@/lib/AuthContext";
import PinModal from "@/components/corae/PinModal";

function FamilyContent() {
  const navigate = useNavigate();

  const {
    user,
    family,
    member,
    refreshFamily,
    patients,
    activePatient,
    selectPatient,
    refreshPatients,
    loading: appLoading,
  } = useApp();

  const [members, setMembers] = useState([]);
  const [changes, setChanges] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteDone, setInviteDone] = useState(false);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [patientBirthdate, setPatientBirthdate] = useState("");
  const [patientNotes, setPatientNotes] = useState("");
  const [patientLoading, setPatientLoading] = useState(false);

  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [familyLoading, setFamilyLoading] = useState(false);

  const visiblePatients = useMemo(() => {
    return (patients || []).filter((p) => p.is_active !== false);
  }, [patients]);

  useEffect(() => {
    if (family?.id) {
      loadData();
    } else {
      setMembers([]);
      setChanges([]);
      setLoading(false);
    }
  }, [family]);

  useEffect(() => {
    setFamilyName(family?.name || "");
  }, [family?.name]);

  async function loadData() {
    if (!family?.id) return;

    setLoading(true);

    try {
      const [memsRes, chgsRes] = await Promise.all([
        supabase
          .from("family_members")
          .select("*")
          .eq("family_id", family.id)
          .order("joined_at", { ascending: true }),

        supabase
          .from("medication_changes")
          .select("*")
          .eq("family_id", family.id)
          .eq("patient_id", activePatient.id)
          .eq("status", "pending")
          .order("id", { ascending: false }),
      ]);

      if (memsRes.error) throw memsRes.error;

      if (chgsRes.error) {
        console.warn("medication_changes indisponível:", chgsRes.error.message);
        setChanges([]);
      } else {
        setChanges(chgsRes.data || []);
      }

      setMembers(memsRes.data || []);
    } catch (err) {
      console.error("Erro ao carregar família:", err);
      setMembers([]);
      setChanges([]);
    } finally {
      setLoading(false);
    }
  }

  function requestAction(action) {
    if (members.length >= 2) {
      setPendingAction(() => action);
      setShowPin(true);
    } else {
      action();
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !family?.id) return;

    setInviteLoading(true);
    setInviteError("");

    try {
      const normalizedEmail = inviteEmail.trim().toLowerCase();

      const { data: existing, error: existingError } = await supabase
        .from("family_members")
        .select("id")
        .eq("family_id", family.id)
        .eq("user_email", normalizedEmail)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existing) {
        setInviteError("Este e-mail já faz parte da família.");
        return;
      }

      const { error } = await supabase.from("family_members").insert([
        {
          family_id: family.id,
          user_email: normalizedEmail,
          user_name: normalizedEmail,
          role: "member",
          joined_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setInviteDone(true);
      setInviteEmail("");
      await loadData();
      await refreshFamily?.();
    } catch (e) {
      console.error("Erro ao convidar:", e);
      setInviteError(
        e?.message || "Erro ao convidar. Verifique o e-mail e tente novamente."
      );
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleRemoveMember(m) {
    try {
      const { error } = await supabase
        .from("family_members")
        .delete()
        .eq("id", m.id);

      if (error) throw error;

      await loadData();
      await refreshFamily?.();
    } catch (err) {
      console.error("Erro ao remover membro:", err);
      alert(err?.message || "Erro ao remover membro.");
    }
  }

  function openPatientForm(patient = null) {
    setEditingPatient(patient);
    setPatientName(patient?.name || "");
    setPatientBirthdate(patient?.birthdate || "");
    setPatientNotes(patient?.notes || "");
    setShowPatientForm(true);
  }

  async function handleSavePatient() {
    if (!patientName.trim() || !family?.id) return;

    setPatientLoading(true);

    try {
      const data = {
        family_id: family.id,
        name: patientName.trim(),
        birthdate: patientBirthdate || null,
        notes: patientNotes.trim() || null,
      };

      if (editingPatient) {
        const { error } = await supabase
          .from("patients")
          .update(data)
          .eq("id", editingPatient.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("patients").insert([
          {
            ...data,
            is_active: true,
          },
        ]);

        if (error) throw error;
      }

      setShowPatientForm(false);
      setEditingPatient(null);
      setPatientName("");
      setPatientBirthdate("");
      setPatientNotes("");

      await refreshPatients();
      await refreshFamily?.();
    } catch (err) {
      console.error("Erro ao salvar paciente:", err);
      alert(err?.message || "Erro ao salvar paciente.");
    } finally {
      setPatientLoading(false);
    }
  }

  async function handleArchivePatient(patient) {
    if (!patient?.id) return;

    const confirmed = window.confirm(
      `Deseja arquivar o paciente "${patient.name}"? O histórico será preservado.`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("patients")
        .update({ is_active: false })
        .eq("id", patient.id);

      if (error) throw error;

      if (activePatient?.id === patient.id) {
        const remainingPatients = visiblePatients.filter((p) => p.id !== patient.id);
        if (remainingPatients.length > 0) {
          selectPatient(remainingPatients[0]);
        }
      }

      await refreshPatients();
      await refreshFamily?.();
    } catch (err) {
      console.error("Erro ao arquivar paciente:", err);
      alert(err?.message || "Erro ao arquivar paciente.");
    }
  }

  async function handleSaveFamilyName() {
    if (!family?.id || !familyName.trim()) return;

    setFamilyLoading(true);

    try {
      const { error } = await supabase
        .from("families")
        .update({ name: familyName.trim() })
        .eq("id", family.id);

      if (error) throw error;

      setShowFamilyForm(false);
      await refreshFamily?.();
    } catch (err) {
      console.error("Erro ao atualizar nome da família:", err);
      alert(err?.message || "Erro ao atualizar nome da família.");
    } finally {
      setFamilyLoading(false);
    }
  }

  async function handleChangeReview(change, approve) {
    try {
      const { error: changeError } = await supabase
        .from("medication_changes")
        .update({
          status: approve ? "approved" : "rejected",
          reviewed_by_name: user.full_name || user.email,
          reviewed_by_email: user.email,
        })
        .eq("id", change.id);

      if (changeError) throw changeError;

      const { error: logError } = await supabase.from("care_records").insert([
        {
          family_id: family.id,
          patient_id: activePatient?.id || null,
          record_type: approve ? "change_approved" : "change_rejected",
          actual_time: new Date().toISOString(),
          recorded_by_name: user.full_name || user.email,
          recorded_by_email: user.email,
          is_system: false,
          notes: `Alteração de ${change.medication_name} ${
            approve ? "aprovada" : "rejeitada"
          } por ${user.full_name || user.email}. Motivo original: ${
            change.reason || "não informado"
          }`,
          details: {
            medication_name: change.medication_name || null,
            reason: change.reason || null,
            professional_confirmation: !!change.professional_confirmation,
          },
        },
      ]);

      if (logError) throw logError;

      await loadData();
    } catch (err) {
      console.error("Erro ao revisar alteração:", err);
      alert(err?.message || "Erro ao revisar alteração.");
    }
  }

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      navigate("/", { replace: true });
    } catch (err) {
      console.error("Erro ao sair:", err);
      alert(err?.message || "Erro ao sair da conta.");
    }
  }

  if (appLoading) {
    return (
      <div className="flex justify-center py-10">
        <div
          className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--sage)" }}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!family) {
    return null;
  }

  return (
    <div className="p-4 space-y-5">
      <h1
        className="text-2xl font-semibold pt-2"
        style={{ color: "var(--text-primary)" }}
      >
        Família
      </h1>

      <div
        className="p-4 rounded-2xl bg-white"
        style={{ border: "1px solid var(--border)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Nome do grupo
            </p>
            <p
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {family.name}
            </p>
          </div>

          {member?.role === "principal" && (
            <button
              onClick={() => requestAction(() => setShowFamilyForm(true))}
              className="p-2 rounded-xl"
              style={{ color: "var(--text-secondary)" }}
              title="Editar nome da família"
            >
              <Pencil size={16} />
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Pacientes
          </p>
          {member?.role === "principal" && (
            <button
              onClick={() => requestAction(() => openPatientForm())}
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: "var(--sage-dark)" }}
            >
              <Plus size={16} /> Adicionar
            </button>
          )}
        </div>

        <div className="space-y-2">
          {visiblePatients.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-white flex items-center gap-3"
              style={{
                border: `2px solid ${
                  activePatient?.id === p.id
                    ? "var(--sage-dark)"
                    : "var(--border)"
                }`,
              }}
            >
              <button
                className="flex-1 text-left"
                onClick={() => selectPatient(p)}
              >
                <p
                  className="font-medium text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {p.name}
                </p>
                {p.birthdate && (
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {p.birthdate}
                  </p>
                )}
                {p.notes && (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {p.notes}
                  </p>
                )}
              </button>

              {activePatient?.id === p.id && (
                <span
                  className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                  style={{
                    background: "var(--sage-light)",
                    color: "var(--sage-dark)",
                  }}
                >
                  Ativo
                </span>
              )}

              {member?.role === "principal" && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => requestAction(() => openPatientForm(p))}
                    className="p-2 rounded-xl"
                    style={{ color: "var(--text-secondary)" }}
                    title="Editar paciente"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    onClick={() => requestAction(() => handleArchivePatient(p))}
                    className="p-2 rounded-xl"
                    style={{ color: "var(--error)" }}
                    title="Arquivar paciente"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {visiblePatients.length === 0 && (
            <p
              className="text-sm text-center py-4"
              style={{ color: "var(--text-secondary)" }}
            >
              Nenhum paciente cadastrado.
            </p>
          )}
        </div>
      </div>

      {changes.length > 0 && member?.role === "principal" && (
        <div>
          <p
            className="text-sm font-semibold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Alterações pendentes ({changes.length})
          </p>

          <div className="space-y-3">
            {changes.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-white"
                style={{ border: "2px solid var(--warning)" }}
              >
                <p
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {c.medication_name}
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Sugerido por: {c.suggested_by_name}
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Motivo: {c.reason}
                </p>
                {c.professional_confirmation && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--sage-dark)" }}
                  >
                    ✓ Confirmou orientação profissional
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() =>
                      requestAction(() => handleChangeReview(c, true))
                    }
                    className="flex-1 h-10 rounded-xl text-sm font-medium text-white"
                    style={{ background: "var(--success)" }}
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() =>
                      requestAction(() => handleChangeReview(c, false))
                    }
                    className="flex-1 h-10 rounded-xl text-sm font-medium"
                    style={{
                      color: "var(--error)",
                      border: "1px solid var(--error)",
                    }}
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Membros
          </p>
          {member?.role === "principal" && (
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: "var(--sage-dark)" }}
            >
              <Plus size={16} /> Convidar
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <div
              className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--sage)" }}
            />
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-white flex items-center gap-3"
                style={{ border: "1px solid var(--border)" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      m.role === "principal"
                        ? "var(--sage-light)"
                        : "var(--warm-dark)",
                  }}
                >
                  {m.role === "principal" ? (
                    <Crown size={18} style={{ color: "var(--sage-dark)" }} />
                  ) : (
                    <User size={18} style={{ color: "var(--text-secondary)" }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {m.user_name || m.user_email}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {m.role === "principal" ? "Responsável Principal" : "Membro"}
                  </p>
                </div>

                {m.user_email === user?.email && (
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: "var(--sage-light)",
                      color: "var(--sage-dark)",
                    }}
                  >
                    Você
                  </span>
                )}

                {m.role !== "principal" && member?.role === "principal" && (
                  <button
                    onClick={() => requestAction(() => handleRemoveMember(m))}
                    className="p-2 rounded-xl transition-all active:scale-90"
                    style={{ color: "var(--error)" }}
                    title="Remover membro"
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium transition-all active:scale-95"
        style={{
          border: "1px solid var(--border)",
          color: "var(--text-secondary)",
        }}
      >
        <LogOut size={16} />
        Sair da conta
      </button>

      {members.length >= 2 && (
        <div
          className="p-3 rounded-xl flex items-start gap-2"
          style={{ background: "var(--sage-light)" }}
        >
          <AlertCircle
            size={14}
            style={{ color: "var(--sage-dark)", marginTop: 2 }}
          />
          <p className="text-xs" style={{ color: "var(--sage-dark)" }}>
            Com 2 ou mais membros, ações críticas exigem o PIN do Responsável
            Principal.
          </p>
        </div>
      )}

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-t-3xl p-6 pb-10">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Convidar membro
              </h2>
              <button
                onClick={() => {
                  setShowInvite(false);
                  setInviteDone(false);
                  setInviteError("");
                }}
              >
                <X size={20} style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>

            {inviteDone ? (
              <div className="text-center py-6">
                <p
                  className="text-base font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Membro adicionado!
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  O acesso será reconhecido quando essa pessoa entrar com esse mesmo e-mail.
                </p>
                <button
                  onClick={() => {
                    setShowInvite(false);
                    setInviteDone(false);
                  }}
                  className="mt-4 h-12 px-6 rounded-xl font-medium text-white"
                  style={{ background: "var(--sage-dark)" }}
                >
                  Fechar
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label
                    htmlFor="invite-email"
                    className="text-sm font-medium block mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    E-mail do convidado
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-secondary)" }}
                    />
                    <input
                      id="invite-email"
                      name="inviteEmail"
                      type="email"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border text-base outline-none"
                      style={{
                        background: "var(--warm)",
                        border: "1px solid var(--border)",
                      }}
                      placeholder="email@exemplo.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                </div>

                {inviteError && (
                  <p className="text-sm mb-3" style={{ color: "var(--error)" }}>
                    {inviteError}
                  </p>
                )}

                <button
                  onClick={handleInvite}
                  disabled={inviteLoading || !inviteEmail.trim()}
                  className="w-full h-14 rounded-2xl text-white font-semibold text-base transition-all active:scale-95"
                  style={{
                    background:
                      inviteEmail.trim() && !inviteLoading
                        ? "var(--sage-dark)"
                        : "#C5BDB5",
                  }}
                >
                  {inviteLoading ? "Enviando..." : "Adicionar membro"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showFamilyForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-t-3xl p-6 pb-10">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Editar família
              </h2>
              <button onClick={() => setShowFamilyForm(false)}>
                <X size={20} style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="family-name"
                  className="text-sm font-medium block mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Nome da família *
                </label>
                <input
                  id="family-name"
                  name="familyName"
                  className="w-full h-12 px-4 rounded-xl border text-base outline-none"
                  style={{
                    background: "var(--warm)",
                    border: "1px solid var(--border)",
                  }}
                  placeholder="Ex: Família Silva"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                />
              </div>

              <button
                onClick={handleSaveFamilyName}
                disabled={familyLoading || !familyName.trim()}
                className="w-full h-14 rounded-2xl text-white font-semibold text-base transition-all active:scale-95"
                style={{
                  background:
                    familyName.trim() && !familyLoading
                      ? "var(--sage-dark)"
                      : "#C5BDB5",
                }}
              >
                {familyLoading ? "Salvando..." : "Salvar nome da família"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPatientForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-t-3xl p-6 pb-10">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {editingPatient ? "Editar paciente" : "Novo paciente"}
              </h2>
              <button onClick={() => setShowPatientForm(false)}>
                <X size={20} style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="patient-name"
                  className="text-sm font-medium block mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Nome do paciente *
                </label>
                <input
                  id="patient-name"
                  name="patientName"
                  className="w-full h-12 px-4 rounded-xl border text-base outline-none"
                  style={{
                    background: "var(--warm)",
                    border: "1px solid var(--border)",
                  }}
                  placeholder="Nome completo"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="patient-birthdate"
                  className="text-sm font-medium block mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Data de nascimento (opcional)
                </label>
                <input
                  id="patient-birthdate"
                  name="patientBirthdate"
                  type="date"
                  className="w-full h-12 px-4 rounded-xl border text-base outline-none"
                  style={{
                    background: "var(--warm)",
                    border: "1px solid var(--border)",
                  }}
                  value={patientBirthdate}
                  onChange={(e) => setPatientBirthdate(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="patient-notes"
                  className="text-sm font-medium block mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Observações (opcional)
                </label>
                <textarea
                  id="patient-notes"
                  name="patientNotes"
                  className="w-full p-3 rounded-xl border text-sm resize-none outline-none"
                  style={{
                    background: "var(--warm)",
                    border: "1px solid var(--border)",
                  }}
                  rows={2}
                  placeholder="Ex: alergias, condições especiais..."
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                />
              </div>

              <button
                onClick={handleSavePatient}
                disabled={patientLoading || !patientName.trim()}
                className="w-full h-14 rounded-2xl text-white font-semibold text-base transition-all active:scale-95"
                style={{
                  background:
                    patientName.trim() && !patientLoading
                      ? "var(--sage-dark)"
                      : "#C5BDB5",
                }}
              >
                {patientLoading
                  ? "Salvando..."
                  : editingPatient
                  ? "Salvar alterações"
                  : "Adicionar paciente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPin && (
        <PinModal
          family={family}
          onConfirm={() => {
            setShowPin(false);
            if (pendingAction) {
              pendingAction();
              setPendingAction(null);
            }
          }}
          onClose={() => {
            setShowPin(false);
            setPendingAction(null);
          }}
        />
      )}
    </div>
  );
}

export default function Family() {
  return <FamilyContent />;
}