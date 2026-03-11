from pathlib import Path

content = """# CORAE — Dicionário de Dados

## Visão geral

O Corae está estruturado em torno de uma família/equipe de cuidado, com:
- membros autorizados
- pacientes
- medicamentos
- registros de administração
- registros clínicos/operacionais no Diário
- sugestões de alteração de medicação

---

## 1. `families`

Representa a unidade principal de cuidado.

### Finalidade
Guardar os dados gerais da família/grupo responsável pelo paciente.

### Campos

#### `id`
- Tipo: `uuid`
- Obrigatório: sim
- Função: identificador único da família

#### `name`
- Tipo: `text`
- Obrigatório: sim
- Função: nome da família ou equipe de cuidado

#### `patient_name`
- Tipo: `text`
- Obrigatório: não
- Função: nome principal do paciente exibido em alguns contextos legados

#### `pin`
- Tipo: `text`
- Obrigatório: sim
- Função: PIN usado para confirmar ações críticas
- Observação: hoje está em texto puro; no futuro o ideal é migrar para hash

#### `principal_email`
- Tipo: `text`
- Obrigatório: sim
- Função: email do responsável principal

#### `principal_name`
- Tipo: `text`
- Obrigatório: não
- Função: nome do responsável principal

#### `patient_id`
- Tipo: `uuid`
- Obrigatório: não
- Função: campo legado
- Observação: não deve ser tratado como vínculo oficial com `patients`, porque `patients.id` hoje é `bigint`

#### `created_at`
- Tipo: `timestamp with time zone`
- Obrigatório: sim
- Padrão: `now()`
- Função: data de criação do registro

### Observações de modelagem
- O vínculo oficial entre família e pacientes é feito por `patients.family_id`
- O campo `patient_id` em `families` deve ser tratado como legado/removível

---

## 2. `family_members`

Representa as pessoas que participam da família/equipe de cuidado.

### Finalidade
Controlar quem pode acessar e operar os dados de uma família.

### Campos

#### `id`
- Tipo: `uuid`
- Obrigatório: sim
- Função: identificador único do membro

#### `family_id`
- Tipo: `uuid`
- Obrigatório: sim
- Função: referência para `families.id`

#### `user_email`
- Tipo: `text`
- Obrigatório: sim
- Função: email do membro, usado para reconhecer acesso

#### `user_name`
- Tipo: `text`
- Obrigatório: não
- Função: nome do membro

#### `role`
- Tipo: `text`
- Obrigatório: sim
- Função: papel do membro dentro da família

#### `joined_at`
- Tipo: `timestamp with time zone`
- Obrigatório: não
- Padrão: `now()`
- Função: data em que o membro foi vinculado

#### `is_active`
- Tipo: `boolean`
- Obrigatório: sim
- Padrão: `true`
- Função: indica se o membro está ativo

### Valores esperados para `role`
- `principal`
- `member`

### Regras de negócio
- o `principal` pode aprovar/rejeitar ações sensíveis
- o `member` participa do cuidado, mas com menos permissões

---

## 3. `patients`

Representa os pacientes vinculados a uma família.

### Finalidade
Guardar dados básicos do paciente.

### Campos

#### `id`
- Tipo: `bigint`
- Obrigatório: sim
- Função: identificador do paciente

#### `created_at`
- Tipo: `timestamp with time zone`
- Obrigatório: sim
- Padrão: `now()`
- Função: data de criação

#### `family_id`
- Tipo: `uuid`
- Obrigatório: não no schema atual
- Função: vínculo com `families.id`

#### `name`
- Tipo: `text`
- Obrigatório: não no schema atual
- Função: nome do paciente

#### `birthdate`
- Tipo: `date`
- Obrigatório: não
- Função: data de nascimento

#### `notes`
- Tipo: `text`
- Obrigatório: não
- Função: observações gerais do paciente

#### `photo_url`
- Tipo: `text`
- Obrigatório: não
- Função: URL da foto do paciente

### Observações de modelagem
- apesar de `family_id` e `name` aceitarem `null` hoje, o ideal de negócio é que ambos existam
- `patients.id` permanece `bigint` por enquanto para evitar migração arriscada

---

## 4. `medications`

Representa os medicamentos cadastrados e suas regras de rotina.

### Finalidade
Guardar o cadastro do medicamento e sua configuração de administração.

### Campos

#### `id`
- Tipo: `uuid`
- Obrigatório: sim
- Função: identificador do medicamento

#### `family_id`
- Tipo: `uuid`
- Obrigatório: sim
- Função: vínculo com a família

#### `patient_id`
- Tipo: `bigint`
- Obrigatório: não
- Função: vínculo opcional com um paciente específico

#### `name`
- Tipo: `text`
- Obrigatório: sim
- Função: nome do medicamento

#### `dosage`
- Tipo: `text`
- Obrigatório: não
- Função: dosagem do medicamento

#### `is_active`
- Tipo: `boolean`
- Obrigatório: sim
- Padrão: `true`
- Função: indica se o medicamento está ativo

#### `created_at`
- Tipo: `timestamp with time zone`
- Obrigatório: sim
- Padrão: `now()`
- Função: data de criação

#### `type`
- Tipo: `text`
- Obrigatório: não
- Padrão: `'fixed'`
- Função: tipo de agendamento

#### `fixed_times`
- Tipo: `text[]`
- Obrigatório: não
- Padrão: `{}`
- Função: horários fixos do medicamento

#### `interval_hours`
- Tipo: `integer`
- Obrigatório: não
- Função: intervalo em horas, quando a rotina for por intervalo

#### `duration_type`
- Tipo: `text`
- Obrigatório: não
- Padrão: `'continuous'`
- Função: define duração contínua ou limitada

#### `duration_days`
- Tipo: `integer`
- Obrigatório: não
- Função: número de dias de duração, quando aplicável

#### `start_date`
- Tipo: `date`
- Obrigatório: não
- Função: data de início do tratamento

#### `updated_at`
- Tipo: `timestamp with time zone`
- Obrigatório: desejável
- Função: controle de atualização

#### `notes`
- Tipo: `text`
- Obrigatório: não
- Função: observações do medicamento

### Valores esperados
#### `type`
- `fixed`
- `interval`

#### `duration_type`
- `continuous`
- `days`

---

## 5. `administration_records`

Representa o registro factual de administração de medicamentos.

### Finalidade
Guardar o evento real de administração, com horário, atraso e contexto.

### Campos

#### `id`
- Tipo: `uuid`
- Obrigatório: sim
- Função: identificador do registro

#### `family_id`
- Tipo: `uuid`
- Obrigatório: sim
- Função: vínculo com a família

#### `patient_id`
- Tipo: `bigint`
- Obrigatório: não
- Função: vínculo com o paciente

#### `medication_id`
- Tipo: `uuid`
- Obrigatório: não
- Função: vínculo com o medicamento

#### `medication_name`
- Tipo: `text`
- Obrigatório: não
- Função: redundância útil para histórico e exibição

#### `medication_dosage`
- Tipo: `text`
- Obrigatório: não
- Função: redundância útil para histórico e exibição

#### `scheduled_dose_id`
- Tipo: `uuid`
- Obrigatório: não
- Função: identificador da dose programada, se houver

#### `scheduled_datetime`
- Tipo: `timestamp with time zone`
- Obrigatório: não
- Função: horário previsto

#### `actual_datetime`
- Tipo: `timestamp with time zone`
- Obrigatório: sim
- Padrão: `now()`
- Função: horário real do registro

#### `status`
- Tipo: `text`
- Obrigatório: sim
- Padrão: `'on_time'`
- Função: resultado da administração

#### `delay_minutes`
- Tipo: `integer`
- Obrigatório: não
- Função: minutos de atraso

#### `recorded_by_name`
- Tipo: `text`
- Obrigatório: não
- Função: nome de quem registrou

#### `recorded_by_email`
- Tipo: `text`
- Obrigatório: não
- Função: email de quem registrou

#### `is_system_generated`
- Tipo: `boolean`
- Obrigatório: sim
- Padrão: `false`
- Função: indica se o registro foi criado automaticamente

#### `created_at`
- Tipo: `timestamp with time zone`
- Obrigatório: sim
- Padrão: `now()`
- Função: data de criação

#### `updated_at`
- Tipo: `timestamp with time zone`
- Obrigatório: desejável
- Função: data da última atualização

### Valores esperados para `status`
- `on_time`
- `delayed`
- `incorrect`
- `missed`

---

## 6. `care_records`

Representa os registros do Diário.

### Finalidade
Centralizar eventos clínicos e operacionais exibidos no Diário.

### Campos

#### `id`
- Tipo: `uuid`
- Obrigatório: sim
- Função: identificador do registro

#### `family_id`
- Tipo: `uuid`
- Obrigatório: sim
- Função: vínculo com a família

#### `patient_id`
- Tipo: `bigint`
- Obrigatório: não
- Função: vínculo com o paciente

#### `record_type`
- Tipo: `text`
- Obrigatório: sim
- Função: tipo do registro do Diário

#### `actual_time`
- Tipo: `timestamp with time zone`
- Obrigatório: sim
- Padrão: `now()`
- Função: horário real do evento

#### `recorded_by_name`
- Tipo: `text`
- Obrigatório: não
- Função: nome de quem registrou

#### `recorded_by_email`
- Tipo: `text`
- Obrigatório: não
- Função: email de quem registrou

#### `is_system`
- Tipo: `boolean`
- Obrigatório: sim
- Padrão: `false`
- Função: indica se foi gerado automaticamente

#### `notes`
- Tipo: `text`
- Obrigatório: não
- Função: observações livres

#### `details`
- Tipo: `jsonb`
- Obrigatório: não
- Função: dados estruturados complementares do registro

#### `created_at`
- Tipo: `timestamp with time zone`
- Obrigatório: sim
- Padrão: `now()`
- Função: data de criação

#### `updated_at`
- Tipo: `timestamp with time zone`
- Obrigatório: desejável
- Função: data da última atualização

### Valores esperados para `record_type`
- `administered`
- `missed`
- `observation`
- `blood_pressure`
- `appointment`
- `change_suggested`
- `change_approved`
- `change_rejected`

### Estruturas esperadas em `details`

#### Quando `record_type = 'blood_pressure'`
```json
{
  "sys": 12,
  "dia": 8,
  "pulse": 72
}