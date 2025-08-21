# Supabase Datenbank Setup Anleitung

## 1. Datenbankstruktur einrichten

Führen Sie das SQL-Skript `schema.sql` in Ihrer Supabase-Instanz aus:

```sql
-- Kopieren Sie den Inhalt von schema.sql und führen Sie ihn aus
```

## 2. Testdaten hinzufügen (Optional)

Für Testzwecke können Sie die Beispieldaten aus `sample_data.sql` einfügen:

```sql
-- Kopieren Sie den Inhalt von sample_data.sql und führen Sie ihn aus
```

## 3. Überprüfung der Einrichtung

### Tabellen überprüfen:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%_28d7f5a9c4' 
OR table_name LIKE '%_fec4a7b9d6'
OR table_name LIKE '%_9f2d81ac56';
```

### RLS Policies überprüfen:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 4. Wichtige Sicherheitsfeatures

### Row Level Security (RLS)
- Alle Tabellen haben RLS aktiviert
- Policies stellen sicher, dass Benutzer nur auf relevante Daten zugreifen können
- Superadmins haben vollständigen Zugriff
- Owners können nur ihre eigenen Unternehmensdaten verwalten
- Users sehen nur ihre eigenen Daten und Abteilungen

### Benutzer-Deaktivierung
- Das `is_active` Feld in der `profiles_fec4a7b9d6` Tabelle kontrolliert den Benutzerstatus
- Nur aktive Benutzer (`is_active = true`) können sich anmelden
- Unternehmen können nur gelöscht werden, wenn alle zugeordneten Benutzer deaktiviert sind

### Datenintegrität
- Foreign Key Constraints stellen referentielle Integrität sicher
- Kaskadierendes Löschen für verwandte Datensätze
- Check Constraints für Datenvalidierung

## 5. Funktionalitäten

### Unternehmen verwalten
- **Erstellen**: Nur Superadmins können neue Unternehmen erstellen
- **Bearbeiten**: Superadmins und Owners können Unternehmen bearbeiten
- **Löschen**: Nur Superadmins können Unternehmen löschen, aber nur wenn alle Benutzer deaktiviert sind

### Benutzer verwalten
- **Aktivieren/Deaktivieren**: Superadmins und Owners können Benutzer aktivieren/deaktivieren
- **Rollen**: Superadmin, Owner, Admin, User
- **Abteilungszuordnung**: Benutzer können mehreren Abteilungen zugeordnet werden

### Zeiterfassung
- Vollständige Zeiterfassung mit verschiedenen Aktionstypen
- Tägliche Zusammenfassungen für Berichte
- Unterstützung für mobiles Arbeiten

## 6. Testszenarien

Mit den Beispieldaten können Sie folgende Szenarien testen:

1. **Unternehmen mit aktiven Benutzern**: TechCorp und Marketing Solutions haben aktive Benutzer → Löschung sollte verhindert werden
2. **Unternehmen ohne Benutzer**: Finance Pro hat keine Benutzer → Löschung sollte möglich sein
3. **Benutzer-Deaktivierung**: Deaktivieren Sie alle Benutzer eines Unternehmens, dann sollte das Löschen möglich sein
4. **Rollenbasierte Zugriffe**: Testen Sie verschiedene Benutzerrollen und deren Berechtigungen

## 7. Überwachung und Wartung

### Logs überwachen:
```sql
-- Überprüfen Sie die Auth-Logs für fehlgeschlagene Anmeldeversuche
SELECT * FROM auth.audit_log_entries 
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;
```

### Datenbank-Performance:
```sql
-- Überprüfen Sie die Indexnutzung
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## 8. Backup und Wiederherstellung

- Nutzen Sie Supabase's automatische Backups
- Für kritische Änderungen: Manuelles Backup vor Schema-Updates
- Testen Sie Wiederherstellungsprozesse regelmäßig

## 9. Troubleshooting

### Häufige Probleme:

1. **RLS Fehler**: Überprüfen Sie die Policy-Definitionen
2. **Foreign Key Verletzungen**: Stellen Sie sicher, dass referenzierte Datensätze existieren
3. **Auth Probleme**: Überprüfen Sie die Trigger-Funktionen für Profile-Erstellung

### Debug-Queries:
```sql
-- Benutzer ohne Profile finden
SELECT u.id, u.email 
FROM auth.users u 
LEFT JOIN profiles_fec4a7b9d6 p ON u.id = p.id 
WHERE p.id IS NULL;

-- Verwaiste Abteilungszuordnungen finden
SELECT ud.* 
FROM user_departments_28d7f5a9c4 ud 
LEFT JOIN auth.users u ON ud.user_id = u.id 
WHERE u.id IS NULL;
```