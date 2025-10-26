# API Routes - Math Pedago

Cette API permet d'envoyer les rapports de progression des étudiants par email via Resend.

## Configuration

### 1. Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit (100 emails/jour)
3. Vérifiez votre email

### 2. Obtenir votre clé API

1. Connectez-vous à [resend.com/api-keys](https://resend.com/api-keys)
2. Cliquez sur "Create API Key"
3. Donnez-lui un nom (ex: "Math Pedago Production")
4. Copiez la clé (elle commence par `re_`)

### 3. Configurer les variables d'environnement dans Vercel

1. Allez dans votre projet sur [vercel.com](https://vercel.com)
2. Allez dans **Settings → Environment Variables**
3. Ajoutez les variables suivantes :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `RESEND_API_KEY` | `re_xxxxx...` | Votre clé API Resend (obligatoire) |
| `RECIPIENT_EMAIL` | `bdh.malek@gmail.com` | Email qui recevra les rapports |
| `FROM_EMAIL` | `Math Pedago <onboarding@resend.dev>` | Email expéditeur (optionnel) |

4. Cliquez sur **Save** pour chaque variable
5. Redéployez votre projet pour appliquer les changements

### 4. (Optionnel) Configurer un domaine personnalisé

Pour utiliser votre propre domaine d'envoi (ex: `noreply@monecole.com`) :

1. Allez dans [resend.com/domains](https://resend.com/domains)
2. Cliquez sur "Add Domain"
3. Entrez votre domaine (ex: `monecole.com`)
4. Ajoutez les enregistrements DNS fournis dans votre hébergeur de domaine
5. Attendez la vérification (quelques minutes à quelques heures)
6. Mettez à jour la variable `FROM_EMAIL` dans Vercel :
   ```
   FROM_EMAIL=Math Pedago <noreply@monecole.com>
   ```

## Limites du plan gratuit Resend

- ✅ **100 emails par jour**
- ✅ **Pièces jointes** (fichiers JSON)
- ✅ **Emails HTML**
- ✅ **Webhooks** (pour tracking)
- ⚠️ Un seul domaine vérifié

Pour plus d'emails, consultez les [tarifs Resend](https://resend.com/pricing).

## Endpoints

### POST /api/submit-work

Envoie un rapport de progression par email.

**Corps de la requête :**
```json
{
  "studentName": "John Doe",
  "chapterTitle": "Chapitre 1 - Les bases",
  "progressData": {
    "studentName": "John Doe",
    "studentLevel": "Seconde",
    "submissionDate": "...",
    "timestamp": 1234567890,
    "results": [...]
  }
}
```

**Réponse (succès) :**
```json
{
  "success": true,
  "messageId": "abc123...",
  "message": "Work submitted successfully"
}
```

**Réponse (erreur) :**
```json
{
  "error": "Failed to send email",
  "details": "Invalid API key",
  "name": "ResendError"
}
```

## Dépannage

### Erreur: "Invalid API key"
- Vérifiez que `RESEND_API_KEY` est bien configurée dans Vercel
- La clé doit commencer par `re_`
- Redéployez après avoir ajouté la variable

### Les emails n'arrivent pas
- Vérifiez les spams/courrier indésirable
- Vérifiez que `RECIPIENT_EMAIL` est correcte
- Consultez les logs dans le dashboard Resend
- Vérifiez les logs Vercel : `vercel logs`

### Erreur: "Domain not verified"
- Si vous utilisez un domaine personnalisé, vérifiez qu'il est validé dans Resend
- Utilisez `onboarding@resend.dev` pour tester (toujours validé)

### Timeout lors de l'envoi
- Vérifiez votre connexion internet
- Consultez le statut de Resend : [status.resend.com](https://status.resend.com)
- Les données sont sauvegardées localement et peuvent être renvoyées

## Développement local

Pour tester en local :

```bash
# Installer les dépendances
npm install

# Créer un fichier .env à la racine
cp .env.example .env

# Éditer .env et ajouter votre clé API
# RESEND_API_KEY=re_xxxxx...

# Lancer le serveur de développement Vercel
npx vercel dev
```

L'API sera accessible sur `http://localhost:3000/api/submit-work`

## Migration depuis FormSubmit.co

✅ **Avantages de Resend :**
- Pas de timeout arbitraire
- Contrôle total sur le format d'email
- Logs et statistiques détaillées
- Pas de CORS issues
- Emails HTML personnalisables
- Réponse JSON structurée
- Retry automatique intégré
- Webhooks pour suivi de livraison

🔧 **Changements nécessaires :**
- ✅ Installer `resend` et `@vercel/node`
- ✅ Créer `/api/submit-work.ts`
- ✅ Configurer les variables d'environnement
- ✅ Mettre à jour le frontend pour appeler `/api/submit-work`
- ✅ Tester l'envoi d'emails

## Support

- [Documentation Resend](https://resend.com/docs)
- [Documentation Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Support Resend](https://resend.com/support)
