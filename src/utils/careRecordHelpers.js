export function getRecordDetails(record) {
  if (!record?.details) return {};

  if (typeof record.details === "object") {
    return record.details;
  }

  try {
    return JSON.parse(record.details);
  } catch {
    return {};
  }
}

export function getRecordStatus(record) {
  const details = getRecordDetails(record);
  return record?.status || details?.status || null;
}

export function getRecordMedicationId(record) {
  const details = getRecordDetails(record);
  return record?.medication_id || details?.medication_id || null;
}

export function getRecordMedicationName(record, medications = []) {
  const details = getRecordDetails(record);
  const medicationId = getRecordMedicationId(record);

  return (
    record?.medication_name ||
    details?.medication_name ||
    details?.medication?.name ||
    (medicationId
      ? medications.find((m) => String(m.id) === String(medicationId))?.name
      : null) ||
    null
  );
}

export function getRecordScheduledTime(record) {
  const details = getRecordDetails(record);
  return record?.scheduled_time || details?.scheduled_time || null;
}

export function getRecordIncorrectReason(record) {
  const details = getRecordDetails(record);
  return record?.incorrect_reason || details?.incorrect_reason || null;
}

export function getRecordBloodPressure(record) {
  const details = getRecordDetails(record);

  return {
    sys: details?.sys ?? null,
    dia: details?.dia ?? null,
    pulse: details?.pulse ?? null,
  };
}

export function getRecordLabel(record) {
  const status = getRecordStatus(record);

  const typeLabels = {
    administered:
      status === "delayed"
        ? "Administrado com atraso"
        : status === "incorrect"
        ? "Registrado como incorreto"
        : "Administrado",
    missed: "Dose não registrada",
    observation: "Observação",
    blood_pressure: "Pressão registrada",
    appointment: "Consulta agendada",
    change_suggested: "Alteração sugerida",
    change_approved: "Alteração aprovada",
    change_rejected: "Alteração rejeitada",
  };

  return typeLabels[record?.record_type] || record?.record_type || "Registro";
}

export function getRecordTitle(record, medications = []) {
  if (record?.notes?.trim()) return record.notes;

  const label = getRecordLabel(record);
  const medicationName = getRecordMedicationName(record, medications);

  return medicationName ? `${label} — ${medicationName}` : label;
}