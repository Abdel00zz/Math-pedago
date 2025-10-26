# 🚀 Configuration Vercel - Guide Complet

## 🚨 SÉCURITÉ PREMIÈRE ÉTAPE

**Votre clé API Resend a été compromise !** Suivez ces étapes **IMMÉDIATEMENT** :

### 1. Révoquer la clé compromise

1. Allez sur https://resend.com/api-keys
2. Connectez-vous à votre compte
3. Trouvez la clé `re_TZ1E6Mwk_6dJ4VAZgiZo42SMASW6rEHqo`
4. Cliquez sur l'icône **🗑️ Delete** ou **Revoke**
5. Confirmez la suppression

### 2. Créer une NOUVELLE clé API

1. Sur la même page https://resend.com/api-keys
2. Cliquez sur **"Create API Key"**
3. Donnez-lui un nom : `Math Pedago Production`
4. Permissions : Sélectionnez **"Full Access"** (ou "Sending access" minimum)
5. Cliquez **"Create"**
6. **⚠️ COPIEZ la clé maintenant** (elle commence par `re_`)
   - Elle ne sera affichée qu'une seule fois !
   - Ne la partagez avec PERSONNE
   - Ne l'envoyez pas par email, chat, etc.

---

## ⚙️ Configuration des Variables d'Environnement Vercel

### Étape 1 : Accéder aux paramètres Vercel

1. Ouvrez votre navigateur
2. Allez sur https://vercel.com
3. Connectez-vous à votre compte
4. Cliquez sur votre projet **"lecentre-scientifique"**
5. Cliquez sur l'onglet **"Settings"** (en haut)
6. Dans le menu latéral, cliquez sur **"Environment Variables"**

### Étape 2 : Ajouter RESEND_API_KEY

```
┌─────────────────────────────────────────────────────────┐
│  Add New Environment Variable                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Key (Name):                                            │
│  ┌────────────────────────────────────────────────┐    │
│  │ RESEND_API_KEY                                  │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Value:                                                 │
│  ┌────────────────────────────────────────────────┐    │
│  │ re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx           │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Environments:                                          │
│  ☑ Production  ☑ Preview  ☑ Development                │
│                                                          │
│  [ Cancel ]                           [ Save ]          │
└─────────────────────────────────────────────────────────┘
```

**Instructions :**
1. Dans le champ **"Key"**, tapez : `RESEND_API_KEY`
2. Dans le champ **"Value"**, collez votre **NOUVELLE** clé API Resend (celle que vous venez de créer)
3. Cochez **"Production"**, **"Preview"** ET **"Development"**
4. Cliquez sur **"Save"**

### Étape 3 : Ajouter RECIPIENT_EMAIL

```
┌─────────────────────────────────────────────────────────┐
│  Add New Environment Variable                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Key (Name):                                            │
│  ┌────────────────────────────────────────────────┐    │
│  │ RECIPIENT_EMAIL                                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Value:                                                 │
│  ┌────────────────────────────────────────────────┐    │
│  │ bdh.malek@gmail.com                             │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Environments:                                          │
│  ☑ Production  ☑ Preview  ☑ Development                │
│                                                          │
│  [ Cancel ]                           [ Save ]          │
└─────────────────────────────────────────────────────────┘
```

**Instructions :**
1. Cliquez à nouveau sur **"Add New"** ou **"Add Variable"**
2. Dans le champ **"Key"**, tapez : `RECIPIENT_EMAIL`
3. Dans le champ **"Value"**, tapez : `bdh.malek@gmail.com`
4. Cochez **"Production"**, **"Preview"** ET **"Development"**
5. Cliquez sur **"Save"**

### Étape 4 : Ajouter FROM_EMAIL

```
┌─────────────────────────────────────────────────────────┐
│  Add New Environment Variable                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Key (Name):                                            │
│  ┌────────────────────────────────────────────────┐    │
│  │ FROM_EMAIL                                      │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Value:                                                 │
│  ┌────────────────────────────────────────────────┐    │
│  │ Math Pedago <onboarding@resend.dev>             │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Environments:                                          │
│  ☑ Production  ☑ Preview  ☑ Development                │
│                                                          │
│  [ Cancel ]                           [ Save ]          │
└─────────────────────────────────────────────────────────┘
```

**Instructions :**
1. Cliquez à nouveau sur **"Add New"**
2. Dans le champ **"Key"**, tapez : `FROM_EMAIL`
3. Dans le champ **"Value"**, tapez : `Math Pedago <onboarding@resend.dev>`
4. Cochez **"Production"**, **"Preview"** ET **"Development"**
5. Cliquez sur **"Save"**

---

## ✅ Vérification

Après avoir ajouté les 3 variables, vous devriez voir :

```
Environment Variables (3)

┌──────────────────┬─────────────────────┬──────────────────────────────┐
│ Key              │ Value               │ Environments                 │
├──────────────────┼─────────────────────┼──────────────────────────────┤
│ RESEND_API_KEY   │ re_••••••••••••     │ Production, Preview, Dev     │
│ RECIPIENT_EMAIL  │ bdh.malek@gmail.com │ Production, Preview, Dev     │
│ FROM_EMAIL       │ Math Pedago <on...  │ Production, Preview, Dev     │
└──────────────────┴─────────────────────┴──────────────────────────────┘
```

**Note :** La valeur de `RESEND_API_KEY` sera masquée (affichée comme `re_••••••••••••`) pour la sécurité.

---

## 🔄 Redéploiement

**IMPORTANT :** Les variables d'environnement ne sont appliquées qu'aux **nouveaux déploiements**.

### Option 1 : Redéploiement automatique (recommandé)

1. Retournez à l'onglet **"Deployments"**
2. Trouvez le dernier déploiement (en haut de la liste)
3. Cliquez sur les **3 points** (⋯) à droite
4. Cliquez sur **"Redeploy"**
5. Confirmez en cliquant **"Redeploy"**

### Option 2 : Pousser un nouveau commit

```bash
# Si vous avez fait des modifications locales
git add .
git commit -m "Update environment variables configuration"
git push
```

Vercel détectera automatiquement le push et redéploiera.

---

## 🧪 Test de l'API

Une fois redéployé, testez que tout fonctionne :

### Test 1 : Via l'application

1. Allez sur https://lecentre-scientifique.vercel.app/
2. Connectez-vous
3. Complétez un chapitre (vidéos + quiz + exercices)
4. Cliquez sur **"Soumettre le travail"**
5. Attendez quelques secondes
6. Vous devriez voir : ✅ "Travail envoyé - Votre progression a été enregistrée et envoyée avec succès."

### Test 2 : Vérifier l'email

1. Ouvrez votre boîte email : bdh.malek@gmail.com
2. Cherchez un email de **"Math Pedago"**
3. Sujet : `✅ Nouveau travail soumis: [Nom] - [Chapitre]`
4. L'email doit contenir :
   - Un tableau avec les infos de l'étudiant
   - Le score du quiz
   - La durée totale
   - Un fichier JSON en pièce jointe

### Test 3 : Vérifier les logs Resend

1. Allez sur https://resend.com/emails
2. Vous devriez voir l'email envoyé dans la liste
3. Cliquez dessus pour voir les détails
4. Status : **"Delivered"** ✅

---

## 🐛 Dépannage

### Erreur : "Invalid API key"

**Cause :** La clé API n'est pas configurée correctement dans Vercel.

**Solution :**
1. Vérifiez que `RESEND_API_KEY` est bien configurée dans Vercel
2. Vérifiez qu'elle commence par `re_`
3. Redéployez le projet
4. Si le problème persiste, générez une nouvelle clé sur Resend

### Erreur : "Failed to send email"

**Cause :** Problème avec l'API Resend.

**Solution :**
1. Vérifiez que votre compte Resend est actif
2. Vérifiez que vous n'avez pas dépassé la limite (100 emails/jour)
3. Consultez les logs Vercel : `vercel logs --prod`
4. Consultez https://status.resend.com pour vérifier l'état du service

### Les emails n'arrivent pas

**Causes possibles :**

1. **Email dans les spams**
   - Vérifiez votre dossier spam/courrier indésirable

2. **Mauvaise adresse email**
   - Vérifiez que `RECIPIENT_EMAIL` est correcte dans Vercel
   - Redéployez si vous l'avez modifiée

3. **Délai de livraison**
   - Attendez 1-2 minutes (rare, mais possible)

4. **Domaine non vérifié**
   - Si vous utilisez un domaine personnalisé (pas `onboarding@resend.dev`)
   - Vérifiez qu'il est validé sur https://resend.com/domains

---

## 📊 Tableau Récapitulatif

| Variable | Valeur | Où l'obtenir |
|----------|--------|--------------|
| `RESEND_API_KEY` | `re_xxxxx...` | https://resend.com/api-keys (créer une nouvelle clé) |
| `RECIPIENT_EMAIL` | `bdh.malek@gmail.com` | Votre email personnel |
| `FROM_EMAIL` | `Math Pedago <onboarding@resend.dev>` | Utiliser la valeur par défaut pour commencer |

---

## 🔐 Bonnes Pratiques de Sécurité

### ✅ À FAIRE

- ✅ Stocker les clés API dans Vercel Environment Variables
- ✅ Utiliser `.gitignore` pour exclure `.env`
- ✅ Régénérer les clés API si elles sont compromises
- ✅ Utiliser des clés différentes pour dev/staging/production (optionnel)
- ✅ Révoquer les clés inutilisées

### ❌ NE JAMAIS FAIRE

- ❌ Commiter `.env` dans Git
- ❌ Partager les clés API par email/chat/Slack
- ❌ Copier-coller les clés dans des documents partagés
- ❌ Utiliser la même clé sur plusieurs projets
- ❌ Publier les clés dans des forums/issues GitHub

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Documentation Resend :** https://resend.com/docs
2. **Documentation Vercel :** https://vercel.com/docs/environment-variables
3. **Support Resend :** https://resend.com/support
4. **Logs Vercel :** `vercel logs --prod` (dans le terminal)
5. **Dashboard Resend :** https://resend.com/emails (voir les emails envoyés)

---

## ✅ Checklist Finale

Avant de considérer la configuration terminée, vérifiez que :

- [ ] L'ancienne clé API `re_TZ1E6Mwk_...` a été révoquée sur Resend
- [ ] Une nouvelle clé API a été créée sur Resend
- [ ] Les 3 variables sont configurées dans Vercel :
  - [ ] `RESEND_API_KEY`
  - [ ] `RECIPIENT_EMAIL`
  - [ ] `FROM_EMAIL`
- [ ] Le projet a été redéployé
- [ ] Un email de test a été reçu avec succès
- [ ] Le fichier `.env` local contient la nouvelle clé (pour dev local)
- [ ] Le fichier `.env` est bien dans `.gitignore`

---

🎉 **Une fois toutes ces étapes terminées, votre système d'envoi d'emails sera opérationnel !**
