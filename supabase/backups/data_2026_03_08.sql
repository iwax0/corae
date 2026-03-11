SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict QMYK9uK7X4yN2d4aIw974kZx3PnX5au4NqW8rjxZL0ZcVGiOBw9KT1Ob14wKygV

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '255c379e-ed80-483c-b793-b3b7d0808ce0', 'authenticated', 'authenticated', 'akiraiwace@gmail.com', '$2a$10$yquRHLY9/veZX0n/4z7ktOG.HCW5qzlfm/5AuM0DL.foWzfCrfYu6', '2026-03-07 02:11:49.647554+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-03-08 19:18:24.834132+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-03-07 02:11:49.609843+00', '2026-03-09 00:40:58.777679+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('255c379e-ed80-483c-b793-b3b7d0808ce0', '255c379e-ed80-483c-b793-b3b7d0808ce0', '{"sub": "255c379e-ed80-483c-b793-b3b7d0808ce0", "email": "akiraiwace@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-03-07 02:11:49.630621+00', '2026-03-07 02:11:49.630681+00', '2026-03-07 02:11:49.630681+00', '9993def3-4aad-47ec-b191-30880df0ebf5');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('366da4ac-a955-4121-af66-b339f5744d4f', '255c379e-ed80-483c-b793-b3b7d0808ce0', '2026-03-08 19:18:24.834223+00', '2026-03-09 00:40:58.792246+00', NULL, 'aal1', NULL, '2026-03-09 00:40:58.792138', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '179.125.242.6', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('366da4ac-a955-4121-af66-b339f5744d4f', '2026-03-08 19:18:24.836473+00', '2026-03-08 19:18:24.836473+00', 'password', 'a6d3d2e3-31f0-4bb2-8152-31fd4a8a5fc5');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 26, 'ccygclyyo7tu', '255c379e-ed80-483c-b793-b3b7d0808ce0', true, '2026-03-08 19:18:24.835222+00', '2026-03-08 20:40:24.647271+00', NULL, '366da4ac-a955-4121-af66-b339f5744d4f'),
	('00000000-0000-0000-0000-000000000000', 27, 'xmbt65ockuc4', '255c379e-ed80-483c-b793-b3b7d0808ce0', true, '2026-03-08 20:40:24.673254+00', '2026-03-08 21:38:53.031477+00', 'ccygclyyo7tu', '366da4ac-a955-4121-af66-b339f5744d4f'),
	('00000000-0000-0000-0000-000000000000', 28, 'jvoxrywmjhu5', '255c379e-ed80-483c-b793-b3b7d0808ce0', true, '2026-03-08 21:38:53.048021+00', '2026-03-08 22:37:23.430268+00', 'xmbt65ockuc4', '366da4ac-a955-4121-af66-b339f5744d4f'),
	('00000000-0000-0000-0000-000000000000', 29, '4m46tm5hpded', '255c379e-ed80-483c-b793-b3b7d0808ce0', true, '2026-03-08 22:37:23.447902+00', '2026-03-08 23:42:52.32696+00', 'jvoxrywmjhu5', '366da4ac-a955-4121-af66-b339f5744d4f'),
	('00000000-0000-0000-0000-000000000000', 30, '2qusll7x6pol', '255c379e-ed80-483c-b793-b3b7d0808ce0', true, '2026-03-08 23:42:52.347531+00', '2026-03-09 00:40:58.730216+00', '4m46tm5hpded', '366da4ac-a955-4121-af66-b339f5744d4f'),
	('00000000-0000-0000-0000-000000000000', 31, 'xda67ynuwy3o', '255c379e-ed80-483c-b793-b3b7d0808ce0', false, '2026-03-09 00:40:58.758153+00', '2026-03-09 00:40:58.758153+00', '2qusll7x6pol', '366da4ac-a955-4121-af66-b339f5744d4f');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: families; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."families" ("id", "name", "patient_name", "pin", "principal_email", "principal_name", "patient_id", "created_at") VALUES
	('cf8022f3-ca43-4542-bbe0-f179339ff6f8', 'Família Silva', 'Paciente', '1234', 'akiraiwace@gmail.com', 'Akira', NULL, '2026-03-08 13:24:46.478492+00');


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."patients" ("id", "created_at", "family_id", "name", "birthdate", "notes", "photo_url", "is_active") VALUES
	(2, '2026-03-08 17:57:58.945+00', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', 'Maria', '1980-02-02', NULL, NULL, true),
	(1, '2026-03-08 13:46:53.840806+00', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', 'Pedro', '1978-05-21', NULL, NULL, false);


--
-- Data for Name: medications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."medications" ("id", "family_id", "patient_id", "name", "dosage", "is_active", "created_at", "type", "fixed_times", "interval_hours", "duration_type", "duration_days", "start_date", "end_date", "instructions", "updated_at", "notes") VALUES
	('bf11a409-aa0b-4237-a0e8-f4d974474eb0', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', 1, 'Dipirona', '1 comp', false, '2026-03-08 17:25:35.825911+00', 'interval', '{}', 8, 'continuous', NULL, '2026-03-08', NULL, NULL, '2026-03-08 20:06:10.402948+00', NULL),
	('241f9192-83bf-4c4e-a0ea-1341a32f077b', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', 1, 'Advil', '1 comp', true, '2026-03-08 17:27:44.784426+00', 'interval', '{}', 8, 'continuous', NULL, '2026-03-08', NULL, NULL, '2026-03-08 20:06:10.402948+00', NULL),
	('f59a95df-e0c3-48d9-adcf-44d4a628d635', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', 2, 'Advil', '1 comprimido', false, '2026-03-08 18:52:25.193053+00', 'interval', '{}', 8, 'continuous', NULL, '2026-03-08', NULL, NULL, '2026-03-08 21:16:32.238519+00', NULL);


--
-- Data for Name: administration_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."administration_records" ("id", "family_id", "patient_id", "medication_id", "medication_name", "medication_dosage", "scheduled_dose_id", "scheduled_datetime", "actual_datetime", "status", "delay_minutes", "created_at", "is_system_generated", "recorded_by_name", "recorded_by_email", "updated_at") VALUES
	('0298e6af-21c1-4b67-bdcd-94aa4487373e', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', 1, '241f9192-83bf-4c4e-a0ea-1341a32f077b', 'Advil', '1 comp', NULL, '2026-03-08 00:30:00+00', '2026-03-08 17:37:03.088+00', 'delayed', 1027, '2026-03-08 17:38:19.77104+00', false, 'akiraiwace@gmail.com', 'akiraiwace@gmail.com', '2026-03-08 17:38:19.77104+00'),
	('5ce48a42-112a-4adb-bb23-e1a58964a644', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', 2, 'f59a95df-e0c3-48d9-adcf-44d4a628d635', 'Advil', '1 comprimido', NULL, '2026-03-08 18:51:22.068+00', '2026-03-08 18:51:22.068+00', 'on_time', 0, '2026-03-08 18:52:38.858015+00', false, 'akiraiwace@gmail.com', 'akiraiwace@gmail.com', '2026-03-08 18:52:38.858015+00');


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."appointments" ("id", "created_at", "family_id", "patient_id", "datetime", "specialty", "location", "notes") VALUES
	(1, '2026-03-08 14:20:44.183541+00', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', 1, '2026-03-08 16:20:44.183541+00', 'Cardiologista', 'Clínica Exemplo', 'Levar exames anteriores'),
	(4, '2026-03-08 17:30:42.088548+00', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', NULL, '2026-03-10 09:00:00+00', 'Clínico Geral', 'Postinho', 'Sentindo tonturas frequentes.'),
	(5, '2026-03-08 23:49:44.166875+00', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', NULL, '2026-03-08 21:30:00+00', 'Clínico Geral', 'Vera Cruz', NULL);


--
-- Data for Name: care_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."care_records" ("id", "family_id", "patient_id", "record_type", "actual_time", "recorded_by_name", "recorded_by_email", "is_system", "notes", "details", "created_at", "updated_at") VALUES
	('3a33caf1-98ab-4416-a9c4-4b965a55f32a', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', NULL, 'appointment', '2026-03-08 17:29:25.692+00', 'akiraiwace@gmail.com', 'akiraiwace@gmail.com', false, 'Consulta registrada — Clínico Geral — agendada para 10/03/2026 às 09:00', NULL, '2026-03-08 17:30:42.405467+00', '2026-03-08 20:06:10.402948+00'),
	('9ba0bcc4-c99c-4627-a708-1e532f34a6fa', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', 1, 'administered', '2026-03-08 17:37:03.088+00', 'akiraiwace@gmail.com', 'akiraiwace@gmail.com', false, 'Advil (1 comp) administrado em 08/03/2026 às 14:37', '{"status": "incorrect", "delay_minutes": 1027, "medication_id": "241f9192-83bf-4c4e-a0ea-1341a32f077b", "scheduled_time": "2026-03-08T00:30:00.000Z", "medication_name": "Advil", "incorrect_reason": "OK", "medication_dosage": "1 comp"}', '2026-03-08 17:38:20.050881+00', '2026-03-08 20:06:10.402948+00'),
	('2f68c5cd-53df-4e6e-aa5f-05458fc4f250', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', 2, 'administered', '2026-03-08 18:51:22.068+00', 'akiraiwace@gmail.com', 'akiraiwace@gmail.com', false, 'Advil (1 comprimido) administrado em 08/03/2026 às 15:51', '{"status": "on_time", "delay_minutes": 0, "medication_id": "f59a95df-e0c3-48d9-adcf-44d4a628d635", "scheduled_time": "2026-03-08T18:51:22.068Z", "medication_name": "Advil", "medication_dosage": "1 comprimido"}', '2026-03-08 18:52:39.133294+00', '2026-03-08 20:06:10.402948+00'),
	('6f2a789e-b777-45d5-afdd-0829307d1f19', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', 2, 'observation', '2026-03-08 18:51:44.352+00', 'akiraiwace@gmail.com', 'akiraiwace@gmail.com', false, 'Sentiu mal estar após almoço.', NULL, '2026-03-08 18:53:01.690633+00', '2026-03-08 20:06:10.402948+00'),
	('44c70264-6e4d-4632-b193-a741cce873d6', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', 1, 'blood_pressure', '2026-03-08 18:53:54.946+00', 'akiraiwace@gmail.com', 'akiraiwace@gmail.com', false, NULL, '{"dia": "8", "sys": "12", "pulse": "60"}', '2026-03-08 18:55:11.728427+00', '2026-03-08 20:06:10.402948+00'),
	('8c079906-dc9a-49f3-9430-e1bbe250c604', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', NULL, 'appointment', '2026-03-08 23:49:44.044+00', 'akiraiwace@gmail.com', 'akiraiwace@gmail.com', false, 'Consulta registrada — Clínico Geral — agendada para 08/03/2026 às 21:30', NULL, '2026-03-08 23:49:44.442045+00', '2026-03-08 23:49:44.442045+00');


--
-- Data for Name: family_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."family_members" ("id", "family_id", "user_email", "user_name", "role", "joined_at", "is_active") VALUES
	('7d194b60-1fec-4e2a-8476-71edeeb5db93', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', 'akiraiwace@gmail.com', 'Akira', 'principal', '2026-03-08 13:24:46.478492+00', true);


--
-- Data for Name: medication_changes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: next_doses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."next_doses" ("id", "family_id", "patient_id", "medication_id", "status", "due_datetime", "is_first_dose", "created_at", "medication_name", "due_at") VALUES
	('7c88cb77-52cd-448c-8307-0fe78db4cc55', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', 2, 'f59a95df-e0c3-48d9-adcf-44d4a628d635', 'concluida', NULL, true, '2026-03-08 18:52:25.481762+00', 'Advil', NULL),
	('d9f965e2-608f-4c7a-9354-1db711b46e7d', 'cf8022f3-ca43-4542-bbe0-f179339ff6f8', 2, 'f59a95df-e0c3-48d9-adcf-44d4a628d635', 'pendente', NULL, false, '2026-03-08 18:52:39.673783+00', 'Advil', '2026-03-09 02:51:22.068+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 31, true);


--
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."appointments_id_seq"', 5, true);


--
-- Name: medication_changes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."medication_changes_id_seq"', 1, false);


--
-- Name: patients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."patients_id_seq"', 2, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict QMYK9uK7X4yN2d4aIw974kZx3PnX5au4NqW8rjxZL0ZcVGiOBw9KT1Ob14wKygV

RESET ALL;
