/**
 * Gestion de l'authentification et des jetons d'accès
 * S'intègre avec ApiClient pour gérer l'authentification
 */

class AuthManager {
    constructor(apiClient, options = {}) {
        if (!apiClient) {
            throw new Error('Une instance de ApiClient est requise');
        }
        
        this.api = apiClient;
        this.options = {
            tokenStorageKey: 'auth_token',
            refreshTokenStorageKey: 'refresh_token',
            userStorageKey: 'user_data',
            tokenHeader: 'Authorization',
            tokenPrefix: 'Bearer ',
            loginEndpoint: '/auth/login',
            refreshEndpoint: '/auth/refresh',
            logoutEndpoint: '/auth/logout',
            userEndpoint: '/auth/me',
            autoRefresh: true,
            refreshThreshold: 300, // secondes avant l'expiration pour rafraîchir le token
            ...options
        };
        
        // État d'authentification
        this._user = null;
        this._token = null;
        this._refreshToken = null;
        this._refreshPromise = null;
        
        // Initialiser
        this._init();
    }
    
    /**
     * Initialiser le gestionnaire d'authentification
     * @private
     */
    _init() {
        // Charger le token depuis le stockage local
        this._loadToken();
        
        // Configurer l'intercepteur de requête pour ajouter le token
        this.api.addRequestInterceptor(config => {
            // Si l'utilisateur est connecté et que la requête n'est pas pour le rafraîchissement
            if (this.isAuthenticated && config.url !== this.options.refreshEndpoint) {
                // Si le token est sur le point d'expirer et que le rafraîchissement automatique est activé
                if (this._isTokenExpiringSoon() && this.options.autoRefresh) {
                    return this._refreshTokenIfNeeded().then(() => this._addTokenToConfig(config));
                }
                
                // Sinon, ajouter simplement le token actuel
                return this._addTokenToConfig(config);
            }
            
            return config;
        });
        
        // Configurer l'intercepteur de réponse pour gérer les erreurs d'authentification
        this.api.addResponseInterceptor(
            response => response,
            async error => {
                const originalRequest = error.config;
                
                // Si l'erreur est une erreur 401 (Non autorisé) et que ce n'est pas une tentative de rafraîchissement
                if (error.status === 401 && 
                    !originalRequest._retry && 
                    originalRequest.url !== this.options.loginEndpoint) {
                    
                    // Marquer la requête comme déjà réessayée
                    originalRequest._retry = true;
                    
                    try {
                        // Essayer de rafraîchir le token
                        await this.refreshToken();
                        
                        // Rejouer la requête originale avec le nouveau token
                        return this.api.request(originalRequest);
                    } catch (refreshError) {
                        // Si le rafraîchissement échoue, déconnecter l'utilisateur
                        this.logout();
                        throw refreshError;
                    }
                }
                
                // Pour les autres erreurs, les propager
                return Promise.reject(error);
            }
        );
    }
    
    /**
     * Ajouter le token au en-têtes de la requête
     * @private
     */
    _addTokenToConfig(config) {
        const headers = {
            ...config.headers,
            [this.options.tokenHeader]: this.options.tokenPrefix + this._token
        };
        
        return { ...config, headers };
    }
    
    /**
     * Charger le token depuis le stockage local
     * @private
     */
    _loadToken() {
        this._token = localStorage.getItem(this.options.tokenStorageKey);
        this._refreshToken = localStorage.getItem(this.options.refreshTokenStorageKey);
        
        // Charger les données utilisateur si elles existent
        const userData = localStorage.getItem(this.options.userStorageKey);
        if (userData) {
            try {
                this._user = JSON.parse(userData);
            } catch (e) {
                console.error('Erreur lors du chargement des données utilisateur:', e);
                this._clearUserData();
            }
        }
    }
    
    /**
     * Sauvegarder le token dans le stockage local
     * @private
     */
    _saveToken() {
        if (this._token) {
            localStorage.setItem(this.options.tokenStorageKey, this._token);
        } else {
            localStorage.removeItem(this.options.tokenStorageKey);
        }
        
        if (this._refreshToken) {
            localStorage.setItem(this.options.refreshTokenStorageKey, this._refreshToken);
        } else {
            localStorage.removeItem(this.options.refreshTokenStorageKey);
        }
        
        if (this._user) {
            localStorage.setItem(this.options.userStorageKey, JSON.stringify(this._user));
        } else {
            localStorage.removeItem(this.options.userStorageKey);
        }
    }
    
    /**
     * Effacer les données utilisateur
     * @private
     */
    _clearUserData() {
        this._user = null;
        this._token = null;
        this._refreshToken = null;
        this._saveToken();
    }
    
    /**
     * Vérifier si le token est sur le point d'expirer
     * @returns {boolean}
     * @private
     */
    _isTokenExpiringSoon() {
        if (!this._token) return false;
        
        try {
            const payload = JSON.parse(atob(this._token.split('.')[1]));
            const now = Date.now() / 1000; // en secondes
            return payload.exp - now < this.options.refreshThreshold;
        } catch (e) {
            console.error('Erreur lors de la vérification du token:', e);
            return false;
        }
    }
    
    /**
     * Rafraîchir le token si nécessaire
     * @returns {Promise}
     * @private
     */
    _refreshTokenIfNeeded() {
        // Si un rafraîchissement est déjà en cours, retourner cette promesse
        if (this._refreshPromise) {
            return this._refreshPromise;
        }
        
        // Si pas de token de rafraîchissement, rejeter
        if (!this._refreshToken) {
            return Promise.reject(new Error('Aucun token de rafraîchissement disponible'));
        }
        
        // Créer une nouvelle promesse pour le rafraîchissement
        this._refreshPromise = this.api.post(this.options.refreshEndpoint, {
            refresh_token: this._refreshToken
        })
        .then(response => {
            // Mettre à jour les tokens
            this.setToken(response.data.token, response.data.refresh_token);
            return response;
        })
        .finally(() => {
            // Réinitialiser la promesse de rafraîchissement
            this._refreshPromise = null;
        });
        
        return this._refreshPromise;
    }
    
    /**
     * Définir le token d'authentification
     * @param {string} token - Le token JWT
     * @param {string} [refreshToken] - Le token de rafraîchissement
     */
    setToken(token, refreshToken) {
        this._token = token;
        
        if (refreshToken !== undefined) {
            this._refreshToken = refreshToken;
        }
        
        this._saveToken();
    }
    
    /**
     * Se connecter avec des identifiants
     * @param {string} email - L'email de l'utilisateur
     * @param {string} password - Le mot de passe
     * @returns {Promise}
     */
    async login(email, password) {
        try {
            const response = await this.api.post(this.options.loginEndpoint, {
                email,
                password
            });
            
            // Mettre à jour les tokens
            this.setToken(response.data.token, response.data.refresh_token);
            
            // Charger les données utilisateur
            await this.fetchUser();
            
            return response;
        } catch (error) {
            this.logout();
            throw error;
        }
    }
    
    /**
     * Se déconnecter
     * @returns {Promise}
     */
    async logout() {
        try {
            // Appeler l'endpoint de déconnexion si un token est présent
            if (this._token) {
                await this.api.post(this.options.logoutEndpoint);
            }
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            // Effacer les données utilisateur dans tous les cas
            this._clearUserData();
            
            // Déclencher un événement de déconnexion
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }
    }
    
    /**
     * Rafraîchir le token d'authentification
     * @returns {Promise}
     */
    async refreshToken() {
        return this._refreshTokenIfNeeded();
    }
    
    /**
     * Récupérer les informations de l'utilisateur connecté
     * @returns {Promise}
     */
    async fetchUser() {
        if (!this.isAuthenticated) {
            return Promise.resolve(null);
        }
        
        try {
            const response = await this.api.get(this.options.userEndpoint);
            this._user = response.data;
            this._saveToken(); // Mettre à jour le stockage local
            return this._user;
        } catch (error) {
            // En cas d'erreur 401, déconnecter l'utilisateur
            if (error.status === 401) {
                this.logout();
            }
            throw error;
        }
    }
    
    /**
     * Vérifier si l'utilisateur est authentifié
     * @returns {boolean}
     */
    get isAuthenticated() {
        return !!this._token;
    }
    
    /**
     * Obtenir l'utilisateur actuellement connecté
     * @returns {Object|null}
     */
    get user() {
        return this._user;
    }
    
    /**
     * Obtenir le token d'authentification
     * @returns {string|null}
     */
    get token() {
        return this._token;
    }
    
    /**
     * Vérifier si l'utilisateur a un rôle spécifique
     * @param {string|Array} roles - Le ou les rôles à vérifier
     * @returns {boolean}
     */
    hasRole(roles) {
        if (!this._user || !this._user.roles) return false;
        
        const userRoles = Array.isArray(this._user.roles) ? this._user.roles : [this._user.roles];
        const requiredRoles = Array.isArray(roles) ? roles : [roles];
        
        return requiredRoles.some(role => userRoles.includes(role));
    }
    
    /**
     * Vérifier si l'utilisateur a une permission spécifique
     * @param {string|Array} permissions - La ou les permissions à vérifier
     * @returns {boolean}
     */
    hasPermission(permissions) {
        if (!this._user || !this._user.permissions) return false;
        
        const userPermissions = Array.isArray(this._user.permissions) ? 
            this._user.permissions : [this._user.permissions];
            
        const requiredPermissions = Array.isArray(permissions) ? 
            permissions : [permissions];
        
        return requiredPermissions.every(permission => 
            userPermissions.includes(permission)
        );
    }
}

// Créer une instance par défaut si une instance de ApiClient est disponible
declare const api; // Déclaration pour éviter les erreurs de type

let authManager = null;

if (typeof api !== 'undefined') {
    authManager = new AuthManager(api);
}

// Exporter la classe et l'instance
export { AuthManager, authManager as default };
