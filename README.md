# ContinuIT

[![Déployer ContinuIT sur Proxmox](https://github.com/PapyPoc/continuit/actions/workflows/deploy-proxmox-vm.yml/badge.svg)](https://github.com/PapyPoc/continuit/actions/workflows/deploy-proxmox-vm.yml)

Site vitrine de **ContinuIT**, dédié à l’infogérance et à la cybersécurité pour PME et TPE.

Le projet est volontairement simple : un site statique en **HTML, CSS et JavaScript**, servi par **Nginx** sur une VM Debian 13 hébergée sur **Proxmox VE**.

## Fonctionnalités du site

- Présentation des services d’infogérance et de cybersécurité
- Support utilisateurs et accompagnement des PME/TPE
- Présentation de la méthode de travail ContinuIT
- Section de contact
- Interface responsive basée sur Bootstrap 5
- Déploiement automatique sur une VM Proxmox via GitHub Actions

## Technologies

- HTML5
- CSS3
- JavaScript
- Bootstrap 5.3
- Nginx
- Debian 13
- Proxmox VE
- Cloud-Init
- GitHub Actions
- Runner GitHub auto-hébergé

## Structure du dépôt

```text
continuit/
├── .github/
│   └── workflows/
│       └── deploy-proxmox-vm.yml
├── deploy/
│   ├── nginx/
│   │   └── continuit.conf
│   └── scripts/
│       └── provision-and-deploy.sh
├── site/
│   ├── images/
│   ├── scripts/
│   ├── styles/
│   ├── favicon.ico
│   └── index.html
└── README.md
```

Le contenu publié par Nginx provient directement du dossier `site/`. Aucun build Node.js ou Astro n’est nécessaire.

## Déploiement

Le workflow `.github/workflows/deploy-proxmox-vm.yml` est lancé automatiquement lorsqu’un changement est poussé sur `main` dans :

- `site/**`
- `deploy/**`
- `.github/workflows/deploy-proxmox-vm.yml`

Il peut également être lancé manuellement depuis l’onglet **Actions** de GitHub.

### Infrastructure utilisée

| Paramètre | Valeur |
|---|---|
| VM Proxmox | `web-continuit` |
| VMID | `301` |
| Adresse IP | `10.0.0.152/24` |
| Passerelle | `10.0.0.254` |
| DNS | `10.0.0.254` |
| Template | `200 - debian13-cloudinit` |
| Bridge | `vmbr0` |
| Stockage | `local-btrfs` |
| Utilisateur Cloud-Init | `poc` |
| Racine Nginx | `/var/www/continuit` |

Le VMID `301` est volontairement réservé à ContinuIT. Si ce VMID est occupé par une autre VM, le workflow s’arrête sans modifier ni écraser la VM existante.

## Fonctionnement du workflow

Lors du premier déploiement, le workflow :

1. vérifie la présence du template Cloud-Init Debian 13 ;
2. clone le template vers la VM `301` ;
3. configure l’adresse IP statique `10.0.0.152` ;
4. injecte la clé SSH publique dérivée de la clé privée GitHub ;
5. démarre la VM ;
6. attend la fin de Cloud-Init et la disponibilité de SSH ;
7. installe Nginx et `curl` ;
8. déploie le contenu du dossier `site/` dans `/var/www/continuit` ;
9. installe le vhost Nginx IPv4 ;
10. autorise HTTP/80 dans UFW lorsqu’il est actif ;
11. vérifie la configuration avec `nginx -t` ;
12. vérifie que le site répond en HTTP.

### Mise à jour d’une VM existante

Si `web-continuit` existe déjà avec le VMID `301` et l’adresse IP attendue, **aucune nouvelle VM n’est créée**.

Le workflow réutilise la VM existante et remplace uniquement le contenu du site et la configuration Nginx si nécessaire.

Le cycle normal devient donc :

```text
git push
   ↓
GitHub Actions
   ↓
runner-git-continuit
   ↓
VM 301 / 10.0.0.152
   ↓
Nginx
   ↓
/var/www/continuit
```

## Secrets GitHub nécessaires

Dans :

`Settings → Secrets and variables → Actions`

ajouter :

| Secret | Utilisation |
|---|---|
| `PROXMOX_TOKEN_ID` | Identifiant du token API Proxmox |
| `PROXMOX_TOKEN_SECRET` | Secret du token API Proxmox |
| `VM_SSH_PRIVATE_KEY` | Clé privée SSH utilisée par le runner pour administrer la VM |
| `VM_SUDO_PASSWORD` | Mot de passe sudo de l’utilisateur Cloud-Init si sudo sans mot de passe n’est pas configuré |

Ne jamais stocker les valeurs de ces secrets directement dans le dépôt.

## Runner GitHub

Le workflow utilise un runner auto-hébergé avec les labels :

```text
self-hosted
linux
x64
continuit
```

Le runner doit pouvoir joindre :

- l’API Proxmox sur TCP `8006` ;
- la VM ContinuIT en SSH sur TCP `22` ;
- la VM ContinuIT en HTTP sur TCP `80` pour le test final.

## Nginx

La configuration utilisée se trouve dans :

`deploy/nginx/continuit.conf`

Elle sert le site depuis :

`/var/www/continuit`

Le vhost écoute uniquement en IPv4 sur le port `80`, ce qui permet son utilisation sur une VM où IPv6 est désactivé.

Les ressources statiques comme CSS, JavaScript, images et polices disposent également d’un cache navigateur de 7 jours.

## Mise à jour du site

Modifier les fichiers dans `site/`, puis :

```bash
git add .
git commit -m "Mettre à jour le site ContinuIT"
git push
```

Le push sur `main` déclenche automatiquement le déploiement.

## Déploiement manuel

Depuis GitHub :

`Actions → Déployer ContinuIT sur Proxmox → Run workflow`

Les paramètres de création de VM permettent notamment d’ajuster le nombre de vCPU, la mémoire et éventuellement l’agrandissement du disque.

Ces paramètres ne modifient pas le matériel d’une VM ContinuIT déjà existante : dans ce cas, le workflow effectue seulement la mise à jour du site.

## Accès local

Une fois le déploiement terminé, le site est disponible sur le réseau local à l’adresse :

`http://10.0.0.152/`

La publication Internet, le HTTPS et le reverse proxy peuvent être ajoutés séparément en amont de cette VM.

---

**ContinuIT — Infogérance & cybersécurité pour PME et TPE**
