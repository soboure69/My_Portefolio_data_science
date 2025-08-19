/**
 * Gestion des appels API et communication avec le serveur
 */

class ApiClient {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        // Stocker les requêtes en cours pour éviter les doublons
        this.pendingRequests = new Map();
    }
    
    /**
     * Définir l'URL de base pour toutes les requêtes
     * @param {string} baseURL - L'URL de base de l'API
     */
    setBaseURL(baseURL) {
        this.baseURL = baseURL;
    }
    
    /**
     * Définir un en-tête par défaut
     * @param {string} key - La clé de l'en-tête
     * @param {string} value - La valeur de l'en-tête
     */
    setHeader(key, value) {
        this.defaultHeaders[key] = value;
    }
    
    /**
     * Supprimer un en-tête par défaut
     * @param {string} key - La clé de l'en-tête à supprimer
     */
    removeHeader(key) {
        delete this.defaultHeaders[key];
    }
    
    /**
     * Effectuer une requête HTTP
     * @param {string} method - La méthode HTTP (GET, POST, PUT, DELETE, etc.)
     * @param {string} endpoint - Le point de terminaison de l'API
     * @param {Object} [data] - Les données à envoyer avec la requête
     * @param {Object} [options] - Options supplémentaires pour la requête
     * @returns {Promise} Une promesse qui se résout avec la réponse de l'API
     */
    async request(method, endpoint, data = null, options = {}) {
        // Créer un identifiant unique pour cette requête
        const requestId = this._generateRequestId(method, endpoint, data);
        
        // Vérifier si une requête identique est déjà en cours
        if (this.pendingRequests.has(requestId)) {
            return this.pendingRequests.get(requestId);
        }
        
        // Préparer les en-têtes
        const headers = {
            ...this.defaultHeaders,
            ...(options.headers || {})
        };
        
        // Préparer l'URL
        let url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
        
        // Préparer les options de la requête
        const requestOptions = {
            method: method.toUpperCase(),
            headers,
            credentials: options.credentials || 'same-origin',
            mode: options.mode || 'cors',
            cache: options.cache || 'default',
            redirect: options.redirect || 'follow',
            referrerPolicy: options.referrerPolicy || 'no-referrer-when-downgrade',
            ...options
        };
        
        // Ajouter les données à la requête
        if (data) {
            if (method.toUpperCase() === 'GET') {
                // Ajouter les paramètres de requête à l'URL pour les requêtes GET
                const params = new URLSearchParams();
                Object.keys(data).forEach(key => {
                    if (Array.isArray(data[key])) {
                        data[key].forEach(value => params.append(`${key}[]`, value));
                    } else if (data[key] !== null && data[key] !== undefined) {
                        params.append(key, data[key]);
                    }
                });
                
                url += (url.includes('?') ? '&' : '?') + params.toString();
            } else if (data instanceof FormData) {
                // Pour les FormData, laisser le navigateur définir le Content-Type avec la boundary
                delete requestOptions.headers['Content-Type'];
                requestOptions.body = data;
            } else {
                // Pour les autres types de données, envoyer en JSON
                requestOptions.body = JSON.stringify(data);
            }
        }
        
        // Créer une promesse pour cette requête
        const requestPromise = new Promise(async (resolve, reject) => {
            try {
                // Émettre un événement de début de requête
                this._emitRequestEvent('request:start', { method, url, data });
                
                // Exécuter la requête
                const response = await fetch(url, requestOptions);
                
                // Vérifier si la réponse est valide (statut 2xx)
                if (!response.ok) {
                    // Essayer d'extraire le message d'erreur de la réponse
                    let errorMessage = `Erreur HTTP: ${response.status} ${response.statusText}`;
                    let errorData = null;
                    
                    try {
                        const contentType = response.headers.get('content-type');
                        if (contentType && contentType.includes('application/json')) {
                            errorData = await response.json();
                            errorMessage = errorData.message || errorMessage;
                        } else {
                            errorMessage = await response.text() || errorMessage;
                        }
                    } catch (error) {
                        console.error('Erreur lors de la lecture de la réponse d\'erreur:', error);
                    }
                    
                    // Créer une erreur personnalisée
                    const error = new Error(errorMessage);
                    error.status = response.status;
                    error.statusText = response.statusText;
                    error.data = errorData;
                    
                    // Émettre un événement d'erreur
                    this._emitRequestEvent('request:error', { 
                        method, 
                        url, 
                        error,
                        status: response.status,
                        statusText: response.statusText
                    });
                    
                    throw error;
                }
                
                // Déterminer comment parser la réponse en fonction du Content-Type
                const contentType = response.headers.get('content-type') || '';
                let responseData;
                
                if (contentType.includes('application/json')) {
                    responseData = await response.json();
                } else if (contentType.includes('text/')) {
                    responseData = await response.text();
                } else if (contentType.includes('multipart/form-data') || 
                          contentType.includes('application/x-www-form-urlencoded')) {
                    responseData = await response.formData();
                } else {
                    // Pour les réponses binaires, retourner le blob
                    responseData = await response.blob();
                }
                
                // Émettre un événement de succès
                this._emitRequestEvent('request:success', { 
                    method, 
                    url, 
                    data: responseData,
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries())
                });
                
                // Retourner les données de la réponse
                resolve({
                    data: responseData,
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    request: { method, url, data }
                });
                
            } catch (error) {
                // Émettre un événement d'échec
                this._emitRequestEvent('request:fail', { 
                    method, 
                    url, 
                    error,
                    data: error.data
                });
                
                // Rejeter avec l'erreur
                reject(error);
            } finally {
                // Supprimer la requête des requêtes en cours
                this.pendingRequests.delete(requestId);
                
                // Émettre un événement de fin de requête
                this._emitRequestEvent('request:end', { method, url });
            }
        });
        
        // Stocker la promesse de requête pour éviter les doublons
        this.pendingRequests.set(requestId, requestPromise);
        
        return requestPromise;
    }
    
    /**
     * Effectuer une requête GET
     * @param {string} endpoint - Le point de terminaison de l'API
     * @param {Object} [params] - Les paramètres de requête
     * @param {Object} [options] - Options supplémentaires pour la requête
     * @returns {Promise} Une promesse qui se résout avec la réponse de l'API
     */
    get(endpoint, params = {}, options = {}) {
        return this.request('GET', endpoint, params, options);
    }
    
    /**
     * Effectuer une requête POST
     * @param {string} endpoint - Le point de terminaison de l'API
     * @param {Object} [data] - Les données à envoyer
     * @param {Object} [options] - Options supplémentaires pour la requête
     * @returns {Promise} Une promesse qui se résout avec la réponse de l'API
     */
    post(endpoint, data = {}, options = {}) {
        return this.request('POST', endpoint, data, options);
    }
    
    /**
     * Effectuer une requête PUT
     * @param {string} endpoint - Le point de terminaison de l'API
     * @param {Object} [data] - Les données à envoyer
     * @param {Object} [options] - Options supplémentaires pour la requête
     * @returns {Promise} Une promesse qui se résout avec la réponse de l'API
     */
    put(endpoint, data = {}, options = {}) {
        return this.request('PUT', endpoint, data, options);
    }
    
    /**
     * Effectuer une requête PATCH
     * @param {string} endpoint - Le point de terminaison de l'API
     * @param {Object} [data] - Les données à envoyer
     * @param {Object} [options] - Options supplémentaires pour la requête
     * @returns {Promise} Une promesse qui se résout avec la réponse de l'API
     */
    patch(endpoint, data = {}, options = {}) {
        return this.request('PATCH', endpoint, data, options);
    }
    
    /**
     * Effectuer une requête DELETE
     * @param {string} endpoint - Le point de terminaison de l'API
     * @param {Object} [data] - Les données à envoyer
     * @param {Object} [options] - Options supplémentaires pour la requête
     * @returns {Promise} Une promesse qui se résout avec la réponse de l'API
     */
    delete(endpoint, data = {}, options = {}) {
        return this.request('DELETE', endpoint, data, options);
    }
    
    /**
     * Télécharger un fichier
     * @param {string} url - L'URL du fichier à télécharger
     * @param {string} [filename] - Le nom du fichier à enregistrer
     * @returns {Promise} Une promesse qui se résout lorsque le téléchargement est terminé
     */
    downloadFile(url, filename = '') {
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'GET',
                headers: this.defaultHeaders,
                credentials: 'same-origin'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
                }
                return response.blob();
            })
            .then(blob => {
                // Créer un lien de téléchargement
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                
                // Définir les attributs du lien
                link.href = downloadUrl;
                link.setAttribute('download', filename || this._getFilenameFromUrl(url));
                
                // Ajouter le lien au DOM et déclencher le téléchargement
                document.body.appendChild(link);
                link.click();
                
                // Nettoyer
                setTimeout(() => {
                    window.URL.revokeObjectURL(downloadUrl);
                    document.body.removeChild(link);
                    resolve();
                }, 100);
            })
            .catch(error => {
                console.error('Erreur lors du téléchargement du fichier:', error);
                reject(error);
            });
        });
    }
    
    /**
     * Annuler une requête en cours
     * @param {string} method - La méthode HTTP de la requête à annuler
     * @param {string} endpoint - Le point de terminaison de la requête à annuler
     * @param {Object} [data] - Les données de la requête à annuler
     * @returns {boolean} True si la requête a été annulée, false sinon
     */
    cancelRequest(method, endpoint, data = {}) {
        const requestId = this._generateRequestId(method, endpoint, data);
        
        if (this.pendingRequests.has(requestId)) {
            // Rejeter la promesse avec une erreur d'annulation
            this.pendingRequests.get(requestId).reject(new Error('Requête annulée'));
            this.pendingRequests.delete(requestId);
            return true;
        }
        
        return false;
    }
    
    /**
     * Annuler toutes les requêtes en cours
     */
    cancelAllRequests() {
        this.pendingRequests.forEach((request, requestId) => {
            request.reject(new Error('Toutes les requêtes ont été annulées'));
            this.pendingRequests.delete(requestId);
        });
    }
    
    // Méthodes utilitaires privées
    
    /**
     * Générer un identifiant unique pour une requête
     * @private
     */
    _generateRequestId(method, endpoint, data = {}) {
        // Créer une chaîne unique à partir de la méthode, de l'URL et des données
        const dataString = JSON.stringify(data);
        return `${method.toUpperCase()}:${endpoint}:${dataString}`;
    }
    
    /**
     * Extraire le nom du fichier à partir d'une URL
     * @private
     */
    _getFilenameFromUrl(url) {
        return url.split('/').pop().split('?')[0];
    }
    
    /**
     * Émettre un événement de requête
     * @private
     */
    _emitRequestEvent(eventName, detail) {
        const event = new CustomEvent(`api:${eventName}`, { detail });
        window.dispatchEvent(event);
    }
}

// Créer une instance par défaut
const api = new ApiClient();

// Exporter l'instance par défaut et la classe
window.ApiClient = ApiClient;
window.api = api;

export { ApiClient, api as default };
